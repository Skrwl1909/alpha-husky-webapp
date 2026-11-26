/** Legal commands only, starting from a real synthetic server acceptance.
 * No unit/stat/status/position edits. Output is replayed through Python authority.
 */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createServer} from 'vite';
const input=JSON.parse(readFileSync(process.argv[2],'utf8'));
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false}});
try {
 const load=n=>server.ssrLoadModule('/tactical-ops-src/combat/'+n+'.ts');
 const [movement,skills,targeting,battle,recover]=await Promise.all(['movement','skills','targeting','battle','recoverAuthority'].map(load));
 const {canonicalGrowthSkillId:canonical}=await server.ssrLoadModule('/tactical-ops-src/data/playerGrowth.ts');
 const step=(snapshot,command)=>{
  const r=spawnSync(process.execPath,[input.worker],{encoding:'utf8',input:JSON.stringify({encounter:input.encounter,snapshot,command}),maxBuffer:8*1024*1024});
  assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
 };
 const snap=r=>r.snapshot??Object.fromEntries(['battle','cycle','statusSequence','projectionId'].filter(k=>k in r).map(k=>[k,r[k]]));
 let state=step(),snapshot=snap(state);
 assert.deepEqual(snapshot,input.snapshot,'worker reproduces accepted opening');
 const commands=[],evidence=[];let multiHit=false;
 const distance=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);
 for(let n=0;n<320&&snapshot.battle.outcome==='ongoing';n++) {
  const b=snapshot.battle,actor=b.units.find(u=>u.id===b.activeId);
  assert(actor&&!actor.defeated&&actor.team==='ally');
  const enemies=b.units.filter(u=>u.team==='enemy'&&!u.defeated);
  const allies=b.units.filter(u=>u.team==='ally'&&!u.defeated&&u.id!==actor.id);
  const objective=b.objective??{};
  const choices=[];
  if(input.strategy==='defeat') choices.push({type:'skip'});
  else {
   if(battle.canRecover(b))choices.push({type:'recover'});
   if(input.kind==='pack-link'&&actor.id==='alpha'&&!actor.packLinkUsed&&!actor.hasMoved&&allies.length&&!allies.some(u=>movement.chebyshev(u,actor)<=1)){
    const nearest=c=>Math.min(...allies.map(u=>movement.chebyshev(u,c)));
    const cell=movement.reachableCells(actor,b.units).sort((a,c)=>nearest(a)-nearest(c))[0];
    if(cell&&nearest(cell)<nearest(actor))choices.push({type:'move',c:cell.c,r:cell.r});
   }
   const available=skills.unitSkills(actor).filter(s=>!actor.cooldowns[s.id]);
   const ranked=available.sort((a,c)=>{
    const score=s=>input.kind==='pack-link'&&canonical(s.id)==='alpha-howl'?100:
      input.kind==='wide-lunge'&&canonical(s.id)==='u02-burst'?100:
      input.kind==='blood-scent'&&canonical(s.id)==='alpha-strike'&&enemies.some(e=>e.statuses.some(t=>t.type==='BLEED'&&t.duration>0))?110:
      canonical(s.id)==='alpha-rend'?90:s.targetType==='ENEMY_SINGLE'?50:0;
    return score(c)-score(a);
   });
   for(const s of ranked){
    const ids=targeting.validTargetIds(b.units,actor,s);
    if(targeting.skillNeedsTargetPick(s)) {
     const targets=enemies.filter(e=>ids.includes(e.id)).sort((a,c)=>{
      if(input.kind==='blood-scent'&&s.id==='alpha-strike'){
       const bleed=u=>u.statuses.some(t=>t.type==='BLEED'&&t.duration>0)?1:0;
       if(bleed(a)!==bleed(c))return bleed(c)-bleed(a);
      }
      // Let REND's target survive long enough for a legal bleeding follow-up.
      return input.kind==='blood-scent'?c.hp-a.hp:a.hp-c.hp;
     });
     for(const t of targets)choices.push({type:'skill',skillId:s.id,targetId:t.id});
    }else if(['SELF','ALLY_AOE','ENEMY_AOE'].includes(s.targetType)){
     if(s.id==='alpha-howl'&&input.kind==='pack-link'&&!allies.some(u=>movement.chebyshev(u,actor)<=1))continue;
     choices.push({type:'skill',skillId:s.id});
    }
   }
   const objectiveRoute=['RECOVER','INTERCEPT','HOLD'].includes(objective.type)&&objective.terminal;
   const target=objectiveRoute?objective.terminal:enemies.sort((a,c)=>distance(actor,a)-distance(actor,c))[0];
   if(!actor.hasMoved&&target){
    const cells=movement.reachableCells(actor,b.units).sort((a,c)=>distance(a,target)-distance(c,target));
    const move=cells.find(c=>distance(c,target)<distance(actor,target));
    if(move)choices.push({type:'move',c:move.c,r:move.r});
   }
   choices.push({type:'skip'});
  }
  let accepted=null,chosen=null;
  for(const command of choices){
   // Precheck shared legal combat actions; RECOVER has family-specific rules.
   if(command.type!=='recover'&&!recover.legalAlliedAction(b,command))continue;
   const next=step(snapshot,command);
   if(next){accepted=next;chosen=command;break;}
  }
  assert(accepted,'no accepted legal action');
  const frames=accepted.frames??accepted.view?.frames??[];
  for(const f of frames){
   for(const e of f.events??[])if((e.text??'').includes('PACK LINK')||(e.text??'').includes('BLOOD SCENT')) evidence.push(e);
   if(chosen.skillId&&canonical(chosen.skillId)==='u02-burst'&&(f.events??[]).filter(e=>e.type==='damage'&&e.amount>0).length>=2)multiHit=true;
  }
  commands.push(chosen);state=accepted;snapshot=snap(state);
  // Endless Last Howl: finish using legal skips after wave three.
  if(input.family==='last-howl'&&(state.view?.wave??1)>=4)input.strategy='defeat';
 }
 assert.notEqual(snapshot.battle.outcome,'ongoing','legal play did not reach terminal');
 writeFileSync(process.argv[3],JSON.stringify({commands,evidence,multiHit,snapshot,report:state.report??state.view?.result??null,outcome:snapshot.battle.outcome}));
 console.log('PASS legal worker gameplay',input.label,commands.length,snapshot.battle.outcome,'events',evidence.length,'multiHit',multiHit);
}finally{await server.close();}
