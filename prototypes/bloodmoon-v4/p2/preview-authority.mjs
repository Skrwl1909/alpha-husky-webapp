// Local-only validation component. No HTTP endpoint, persistence, attempts,
// contribution, reward writer or production imports. Economy approval is absent.
import {randomUUID,randomInt,createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {Encounter} from '../simulation.js';
import {combatParameters} from '../combat-parameters.js';
const copy=structuredClone;
export function resolveFromPython(profile){
  if(!['baseline','progressed'].includes(profile))return Promise.reject(Error('INVALID_PROFILE'));
  return new Promise((resolve,reject)=>execFile('python',['-I','-B',fileURLToPath(new URL('./resolver.py',import.meta.url)),'--json',profile],
    {maxBuffer:1_000_000,windowsHide:true,env:{PATH:process.env.PATH,SYSTEMROOT:process.env.SYSTEMROOT}},(err,out)=>{
      if(err)return reject(err);try{resolve(JSON.parse(out));}catch(error){reject(error);}
    }));
}
const fail=reason=>({ok:false,reason});
export class PreviewAuthority {
  #entries=new Map();#active=new Map();#locks=new Map();
  constructor({resolveProfile=resolveFromPython,readRaid=()=>({raidInstanceId:'synthetic-p2-raid',faction:'rb',wave:1,hp:1000,hpMax:1000,revision:0}),now=()=>Date.now()/1000,seed=()=>randomInt(1,2**31)}={}){
    this.resolveProfile=resolveProfile;this.readRaid=readRaid;this.now=now;this.seed=seed;
  }
  async locked(key,fn){
    const previous=this.#locks.get(key)||Promise.resolve();let release;
    const gate=new Promise(r=>{release=r;});const tail=previous.then(()=>gate);this.#locks.set(key,tail);await previous;
    try{return await fn();}finally{release();if(this.#locks.get(key)===tail)this.#locks.delete(key);}
  }
  // owner is trusted caller context, not a body uid; production auth is not implemented here.
  async issue(owner,profile){return this.locked('owner:'+owner,async()=>{
    if(typeof owner!=='string'||!owner||!['baseline','progressed'].includes(profile))return fail('INVALID_OWNER_OR_PROFILE');
    const existing=this.#entries.get(this.#active.get(owner));
    if(existing?.status==='OPEN'&&this.now()<=existing.expiresAt)return fail('ENCOUNTER_ACTIVE');
    const source=await this.resolveProfile(profile),parameters=combatParameters(source.parameters),raid=copy(this.readRaid());
    // This bounded preview requires a fresh full-HP wave. It cannot invent a
    // mapping from a partially damaged shared wave to a solo encounter.
    if(raid.wave!==1||raid.hp!==raid.hpMax||raid.hpMax!==parameters.enemy.maxHP||!raid.raidInstanceId)return fail('UNSUPPORTED_RAID_SNAPSHOT');
    const issuedAt=this.now(),encounterId=randomUUID();
    const entry={encounterId,owner,profile,parameters:copy(parameters),source:copy(source),raid,seed:this.seed(),issuedAt,expiresAt:issuedAt+120,status:'OPEN'};
    this.#entries.set(encounterId,entry);this.#active.set(owner,encounterId);
    return {ok:true,encounterId,seed:entry.seed,parameters:copy(parameters),raid:copy(raid),issuedAt,expiresAt:entry.expiresAt,mode:'VALIDATION_ONLY_NO_CREDIT'};
  });}
  async submit(owner,body){
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!=='encounterId,ticks,trace')return fail('INVALID_SUBMISSION');
    let payload;try{payload=copy(body);}catch{return fail('INVALID_SUBMISSION');}
    if(typeof payload.encounterId!=='string')return fail('INVALID_ENCOUNTER');
    return this.locked('encounter:'+payload.encounterId,async()=>{
      const entry=this.#entries.get(payload.encounterId);
      if(!entry||entry.owner!==owner)return fail('INVALID_ENCOUNTER');
      const {ticks,trace}=payload;
      if(!Number.isInteger(ticks)||ticks<1||ticks>4500||!Array.isArray(trace)||trace.length>30000)return fail('INVALID_TRACE');
      let last=-1;
      for(const p of trace){
        if(!p||Object.keys(p).sort().join(',')!=='tick,x,y'||!Number.isInteger(p.tick)||p.tick<last||p.tick<0||p.tick>ticks||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.hypot(p.x,p.y)>1+1e-9)return fail('INVALID_TRACE');
        last=p.tick;
      }
      const hash=createHash('sha256').update(JSON.stringify({ticks,trace})).digest('hex');
      if(entry.receipt)return entry.hash===hash?{ok:true,duplicate:true,receipt:copy(entry.receipt)}:fail('COMMAND_ID_CONFLICT');
      if(this.now()>entry.expiresAt)return fail('EXPIRED');
      if(this.now()-entry.issuedAt+.1<ticks/60)return fail('IMPOSSIBLE_ELAPSED_TIME');
      const raid=this.readRaid();
      if(['raidInstanceId','faction','wave','hp','hpMax','revision'].some(k=>raid[k]!==entry.raid[k]))return fail('STALE_RAID_SNAPSHOT');
      const g=new Encounter(entry.seed,{},entry.parameters);let i=0;
      while(g.tick<ticks&&g.status==='playing'){
        while(trace[i]?.tick===g.tick){const p=trace[i++];g.setInput(p.x,p.y);}g.step();
      }
      if(g.status==='playing')return fail('INCOMPLETE_ENCOUNTER');
      if(g.tick!==ticks)return fail('TICK_MISMATCH');
      const receipt={encounterId:entry.encounterId,status:g.status,time:g.time,playerHP:g.player.hp,bossHP:g.boss.hp,
        verifiedDamage:entry.parameters.enemy.maxHP-g.boss.hp,events:copy(g.events),
        mode:'VALIDATION_ONLY_NO_CREDIT',attemptsConsumed:0,contribution:0,rewards:[],productionReady:false};
      entry.hash=hash;entry.receipt=copy(receipt);entry.status='COMPLETED';
      if(this.#active.get(owner)===entry.encounterId)this.#active.delete(owner);
      return {ok:true,duplicate:false,receipt:copy(receipt)};
    });
  }
  audit(){return {encounters:this.#entries.size,completed:[...this.#entries.values()].filter(e=>e.status==='COMPLETED').length,productionWrites:0,attemptsConsumed:0,contribution:0,rewards:0};}
}
