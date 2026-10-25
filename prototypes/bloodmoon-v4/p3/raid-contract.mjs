// Pure, local contract rehearsal. No HTTP transport, database or economy writer.
// Legacy field names are observed in the PUBLIC js/bloodmoon.js consumer.
// The issued envelope/revision and normalized-damage policy are PROPOSED additions.
import {createHash} from 'node:crypto';
import {combatParameters} from '../combat-parameters.js';
import {Encounter} from '../simulation.js';
import {lastStandParameters,POLICY} from './balance.js';
const integer=(x,min=0)=>Number.isSafeInteger(x)&&x>=min;
const numeric=(x,min=0)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=1e12;
const id=x=>typeof x==='string'&&x.length>0&&x.length<=128;
const fail=reason=>({ok:false,reason});
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.sort().join(',');

export function readLegacyState(state,trusted) {
  const run=state?.myFactionRun,my=state?.myContribution,wave=run?.currentWave,row=run?.waves?.[String(wave)];
  // No fallback to global/top-level wave HP or another faction's progress.
  if(!id(trusted?.owner)||!id(trusted?.faction)||state?.myFaction!==trusted.faction||!id(state?.raidInstanceId)||!integer(trusted?.revision))throw Error('INVALID_CONTEXT');
  if(!integer(wave,1)||!numeric(row?.hp)||!numeric(row?.hpMax,1)||row.hp>row.hpMax)throw Error('INVALID_FACTION_WAVE');
  if(!integer(my?.attemptsLeft)||!integer(my?.dailyCap,1)||my.attemptsLeft>my.dailyCap||!numeric(my?.cooldownLeftSec)||!numeric(my?.totalDamage))throw Error('INVALID_PARTICIPATION');
  return {raidInstanceId:state.raidInstanceId,faction:state.myFaction,wave,hp:row.hp,hpMax:row.hpMax,
    revision:trusted.revision,attemptsLeft:my.attemptsLeft,dailyCap:my.dailyCap,cooldownLeftSec:my.cooldownLeftSec,totalDamage:my.totalDamage};
}

export function issuePreview({state,trusted,resolved,seed,run_id,now}) {
  let snapshot;try{snapshot=readLegacyState(state,trusted);}catch(e){return fail(e.message);}
  if(!id(run_id)||!integer(seed)||seed>0xffffffff||!numeric(now))return fail('INVALID_ISSUE');
  if(snapshot.hp===0)return fail('WAVE_CLEARED');
  if(snapshot.attemptsLeft===0)return fail('NO_ATTEMPTS');
  if(snapshot.cooldownLeftSec>0)return fail('COOLDOWN');
  let raw,parameters;try{raw=combatParameters(resolved);parameters=lastStandParameters(raw);}catch{return fail('INVALID_PARAMETERS');}
  // The solo challenge never equates its normalized HP with shared raid HP.
  // P3 validates Tower Husk/wave 1 only; no invented scaling for later bosses.
  if(snapshot.wave!==1||parameters.enemy.maxHP!==1000)return fail('UNSUPPORTED_ENCOUNTER');
  return {ok:true,issued:structuredClone({contract:'last-stand-preview-v1',policyId:POLICY.id,owner:trusted.owner,run_id,
    issuedAt:now,expiresAt:now+120,seed,resolved:raw,parameters,snapshot,mode:'PREVIEW_ONLY_NO_WRITES'})};
}

// issued is trusted server-held context, NEVER a client-posted envelope.
// Caller must authenticate owner and serialize/transactionally deduplicate any
// later production settlement. This pure function performs neither operation.
export function validatePreview(issued,{state,trusted,submission,now}) {
  if(!issued||issued.owner!==trusted?.owner)return fail('INVALID_OWNER');
  if(issued.contract!=='last-stand-preview-v1'||issued.policyId!==POLICY.id||issued.mode!=='PREVIEW_ONLY_NO_WRITES')return fail('UNSUPPORTED_VERSION');
  if(!exact(submission,['run_id','ticks','trace'])||submission.run_id!==issued.run_id)return fail('INVALID_SUBMISSION');
  let current;try{current=readLegacyState(state,trusted);}catch(e){return fail(e.message);}
  if(JSON.stringify(current)!==JSON.stringify(issued.snapshot))return fail('STALE_SNAPSHOT');
  if(!numeric(now)||now<issued.issuedAt||now>issued.expiresAt)return fail('EXPIRED');
  const {ticks,trace}=submission;
  if(!integer(ticks,1)||ticks>4500||!Array.isArray(trace)||trace.length>9002)return fail('INVALID_TRACE');
  if(now-issued.issuedAt+.1<ticks/60)return fail('IMPOSSIBLE_ELAPSED_TIME');
  let previous=-1;
  for(const p of trace){
    if(!exact(p,['tick','x','y'])||!integer(p.tick)||p.tick<previous||p.tick>ticks||typeof p.x!=='number'||typeof p.y!=='number'||!Number.isFinite(p.x)||!Number.isFinite(p.y)||Math.hypot(p.x,p.y)>1+1e-9)return fail('INVALID_TRACE');
    previous=p.tick;
  }
  const g=new Encounter(issued.seed,{},issued.parameters);let index=0;
  while(g.status==='playing'&&g.tick<ticks){while(trace[index]?.tick===g.tick){const p=trace[index++];g.setInput(p.x,p.y);}g.step();}
  if(g.status==='playing'||g.tick!==ticks)return fail('INCOMPLETE_OR_PADDED_RESULT');
  // Reject ignored inputs, suffixes and noncanonical traces, including terminal
  // tick commands other than the simulator's own neutral release.
  if(JSON.stringify(g.recording().trace)!==JSON.stringify(trace))return fail('NONCANONICAL_TRACE');
  const traceHash=createHash('sha256').update(JSON.stringify({ticks,trace})).digest('hex');
  return {ok:true,receipt:{run_id:issued.run_id,traceHash,policyId:issued.policyId,status:g.status,ticks:g.tick,
    normalizedEncounterDamage:Math.round((g.t.bossHP-g.boss.hp)*1e9)/1e9,
    sharedHpDelta:0,attemptsConsumed:0,cooldownWritten:false,contribution:0,rewards:[],productionReady:false,
    settlement:'BLOCKED_PENDING_PRIVATE_POLICY_AND_ATOMIC_SERVER_IMPLEMENTATION'}};
}
