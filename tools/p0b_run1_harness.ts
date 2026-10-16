import { mkdirSync, writeFileSync } from "node:fs";
import { startBattle, applyAi, advanceToNext, tryMove, trySkill, trySkip, planAi } from "../tactical-ops-src/combat/battle";
import { reachableCells, chebyshev } from "../tactical-ops-src/combat/movement";
import { getSkill } from "../tactical-ops-src/data/skills";
import { getMissionDef, missionSpawnsForSquad, missionBattleRules } from "../tactical-ops-src/data/operations";
import { withTeammateSidegrades } from "../tactical-ops-src/data/shadowSidegrade";
import { validTargetIds } from "../tactical-ops-src/combat/targeting";
import { effectiveSpd } from "../tactical-ops-src/combat/effects";
import type { BattleState, CombatUnit, SkillDef } from "../tactical-ops-src/combat/types";

const PET={id:"audit-pet",name:"TEST PET (synthetic)",img:"https://example.invalid/audit-pet.png"};
type Config={id:string;mission:string;squad:string[];policy:string;pet?:boolean;koda?:"A"|"B";shadow?:"A"|"B";noSlow?:boolean;forceBlock?:boolean;intel?:boolean};
const fixtures:Config[]=[
{id:"T01",mission:"dead-relay-courier",squad:["alpha","ally-02","ally-03"],policy:"focus"},
{id:"T02",mission:"dead-relay-courier",squad:["alpha","ally-02","pet:audit-pet"],policy:"focus",pet:true},
{id:"T04a",mission:"dead-relay-courier",squad:["alpha","ally-02","ally-03"],policy:"exit"},
{id:"T04b",mission:"dead-relay-courier",squad:["alpha","ally-02","ally-03"],policy:"exit",forceBlock:true},
{id:"T06a",mission:"dead-relay-courier",squad:["alpha","ally-02","pet:audit-pet"],policy:"slow",pet:true},
{id:"T06b",mission:"dead-relay-courier",squad:["alpha","ally-02","pet:audit-pet"],policy:"slow",pet:true,noSlow:true},
{id:"T07a",mission:"dead-relay-courier",squad:["alpha","ally-02","ally-03"],policy:"focus",koda:"A"},
{id:"T07b",mission:"dead-relay-courier",squad:["alpha","ally-02","ally-03"],policy:"focus",koda:"B"},
{id:"T09",mission:"dead-relay-hold",squad:["alpha","ally-02","ally-03"],policy:"skip",intel:true},
{id:"T10",mission:"dead-relay-hold",squad:["alpha","ally-02","ally-03"],policy:"skip",intel:false}
];
function pos(u:CombatUnit|undefined){return u?[u.c,u.r]:null;}
function snapshot(s:BattleState){const courier=s.units.find(u=>u.id==="courier");return {round:s.round,actor:s.activeId,courierPos:pos(courier),courierHp:courier?.hp,reinforcement:s.reinforcement?{triggerRound:s.reinforcement.triggerRound,spawned:s.reinforcement.spawned}:null,outcome:s.outcome,reason:s.failureReason||null};}
function availableAttacks(s:BattleState,actor:CombatUnit,skillPolicy:string){
 const skills=actor.skillIds.map(getSkill).filter(sk=>sk.targetType==="ENEMY_SINGLE"&&(actor.cooldowns[sk.id]||0)===0);
 return skills.filter(sk=>validTargetIds(s.units,actor,sk).length>0).sort((a,b)=>{
  const score=(sk:SkillDef)=>skillPolicy==="slow"&&sk.id.includes("hamstring")?1000:sk.effects.some(e=>e.kind==="damage")?100+(sk.effects.find(e=>e.kind==="damage")?.multiplier||0)*20:70;
  return score(b)-score(a);
 });
}
function chooseTarget(s:BattleState,sk:SkillDef,policy:string){
 const actor=s.units.find(u=>u.id===s.activeId)!;
 const legal=validTargetIds(s.units,actor,sk);
 if(legal.includes("courier"))return "courier";
 return legal.sort((a,b)=>{
  const ua=s.units.find(u=>u.id===a)!,ub=s.units.find(u=>u.id===b)!;
  return ua.hp-ub.hp;
 })[0]||null;
}
function moveTarget(s:BattleState,actor:CombatUnit,policy:string){
 if(s.objective?.type==="INTERCEPT"){
  if(policy==="exit")return s.objective.exit;
  const courier=s.units.find(u=>u.id==="courier"&&!u.defeated);
  return courier||s.objective.exit;
 }
 return s.objective?.type==="HOLD"?s.objective.terminal||{c:3,r:2}:{c:5,r:2};
}
function movePlayer(s:BattleState,actor:CombatUnit,policy:string){
 const goal=moveTarget(s,actor,policy);
 const cells=reachableCells(actor,s.units);
 const ideal=goal||{c:5,r:2};
 const ranked=cells.map(cell=>({cell,score:Math.abs(cell.c-ideal.c)+Math.abs(cell.r-ideal.r)})).sort((a,b)=>a.score-b.score || b.cell.c-a.cell.c||a.cell.r-b.cell.r);
 return ranked.length&&ranked[0].score<Math.abs(actor.c-ideal.c)+Math.abs(actor.r-ideal.r)?ranked[0].cell:null;
}
function actorStep(s:BattleState,policy:string):{state:BattleState,events:any[],note:string}{
 const actor=s.units.find(u=>u.id===s.activeId);
 if(!actor)return {state:s,events:[],note:"no actor"};
 if(actor.team==="enemy"){
  const act=planAi(s),res=applyAi(s,act);
  return {state:res.state,events:res.events,note:"enemy "+JSON.stringify(act)};
 }
 if(policy==="skip"){const r=trySkip(s);return {state:r.state,events:r.events,note:"player skip"};}
 let cur=s,events:any[]=[];
 let att=availableAttacks(cur,actor,policy);
 if(att.length){
  const target=chooseTarget(cur,att[0],policy);
  if(target){const res=trySkill(cur,att[0].id,target);if(res.ok)return {state:res.state,events:res.events,note:"skill "+att[0].id+" "+target};}
 }
 let note="none";
 if(!actor.hasMoved){
  const to=movePlayer(cur,actor,policy);
  if(to){const m=tryMove(cur,to.c,to.r);if(m.ok){cur=m.state;events.push(...m.events);note="move "+to.c+","+to.r;}}
 }
 const after=cur.units.find(u=>u.id===cur.activeId)!;
 att=availableAttacks(cur,after,policy);
 if(att.length){
  const target=chooseTarget(cur,att[0],policy);
  if(target){const res=trySkill(cur,att[0].id,target);if(res.ok)return {state:res.state,events:[...events,...res.events],note:note+";skill "+att[0].id+" "+target};}
 }
 const last=trySkip(cur);return {state:last.state,events:[...events,...last.events],note:note+";skip"};
}
function run(cfg:Config){
 const mission=getMissionDef(cfg.mission);
 if(!mission)throw Error("No mission "+cfg.mission);
 const initial=missionSpawnsForSquad(mission,cfg.squad,cfg.pet?PET:null);
 if(!initial)throw Error("illegal squad "+cfg.id);
 let spawns=withTeammateSidegrades(initial,{kodaSidegrade:cfg.koda||null,shadowSidegrade:cfg.shadow||null,packMastery:{}});
 if(cfg.noSlow)spawns=spawns.map(u=>u.id.startsWith("pet:")?{...u,unitDef:{...(u.unitDef!),skillIds:["pet-bite"]}}:u);
 const rules=missionBattleRules(mission,false,undefined,{version:1,courierTraceAcquired:cfg.intel||false});
 const started=startBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
 let s=started.state;
 if(cfg.forceBlock){ // synthetic diagnostic: NOT a legal deployment; isolate exit-block softlock logic
  s={...s,units:s.units.map(u=>u.id==="alpha"?{...u,c:7,r:4}:u)};
 }
 const trace:any[]=[];
 let courierTurns=0, slowsApplied=0, spawnRound:null|number=null;
 const cap=220;
 for(let i=0;i<cap&&s.outcome==="ongoing";i++){
  const before=s;
  const active=before.units.find(u=>u.id===before.activeId);
  if(active?.id==="courier")courierTurns++;
  const st=actorStep(before,cfg.policy);
  let next=st.state;
  const courier=next.units.find(u=>u.id==="courier");
  if(courier?.statuses.some(st=>st.type==="SPD_DOWN"))slowsApplied++;
  if(next.outcome==="ongoing"){
   next=advanceToNext(next).state;
  }
  if(!before.reinforcement?.spawned&&next.reinforcement?.spawned)spawnRound=next.round;
  trace.push({index:i+1,round:before.round,actor:before.activeId,beforeCourier:pos(before.units.find(u=>u.id==="courier")),action:st.note,events:st.events.filter(e=>e.type==="damage"||e.type==="status"||e.type==="defeat").slice(0,4).map(e=>e.text),afterCourier:pos(next.units.find(u=>u.id==="courier")),courierSpeed:courier?effectiveSpd(courier):null,postOutcome:next.outcome,postRound:next.round});
  s=next;
 }
 return {id:cfg.id,mission:cfg.mission,squad:cfg.squad,policy:cfg.policy,fixture:{pet:cfg.pet?PET:null,koda:cfg.koda||null,shadow:cfg.shadow||null,mastery:"none",forcedBlock:!!cfg.forceBlock,removedSkill:!!cfg.noSlow,intel:!!cfg.intel},initial:snapshot(started.state),finish:snapshot(s),totalActorActions:trace.length,courierTurns,slowsApplied,spawnRound,damageTaken:s.damageTaken,survivors:s.units.filter(u=>u.team==="ally"&&!u.defeated).length,capReached:s.outcome==="ongoing",trace};
}
const rows=fixtures.map(cfg=>run(cfg));
const reruns=fixtures.map(cfg=>run(cfg));
for(let i=0;i<rows.length;i++)if(JSON.stringify(rows[i])!==JSON.stringify(reruns[i]))throw Error("NONDETERMINISTIC "+rows[i].id);
const get=(id:string)=>rows.find(x=>x.id===id)!;
const checks=[
 {name:"T01 Courier baseline executed",pass:get("T01").totalActorActions>0},
 {name:"T02 synthetic PET run executed",pass:get("T02").totalActorActions>0},
 {name:"T04 bodyblock real+diagnostic executed",pass:get("T04a").totalActorActions>0&&get("T04b").totalActorActions>0},
 {name:"T06 HAMSTRING pair executed",pass:get("T06a").totalActorActions>0&&get("T06b").totalActorActions>0},
 {name:"T07 CNC sidegrade pair executed",pass:get("T07a").totalActorActions>0&&get("T07b").totalActorActions>0},
 {name:"T09 Hold intel rule trigger round 3",pass:get("T09").initial.reinforcement?.triggerRound===3},
 {name:"T10 Hold without intel trigger round 2",pass:get("T10").initial.reinforcement?.triggerRound===2},
 {name:"all runs replay deterministically",pass:true}
];
mkdirSync("reports/p0b_run1",{recursive:true});
writeFileSync("reports/p0b_run1/results.json",JSON.stringify({timestamp:new Date().toISOString(),node:process.version,simulationScope:"Pure frontend engine, synthetic fixture, no authenticated backend",fixtures,checks,rows},null,2));
const md=[
 "# Alpha Husky P0-B RUN 1 — pure-engine execution",
 "",
 "No backend calls. Synthetic pet fixture and profile; not proof of live account behavior.",
 "No balance modifications, no actual user playtest. Actor policies are simplistic deterministic bots and are NOT a skilled player.",
 "",
 "## Checks",
 ...checks.map(c=>"- "+(c.pass?"PASS":"FAIL")+" — "+c.name),
 "",
 "## Scenario results",
 "| ID | Outcome | Rounds | Courier personal turns | Actions | Slow ticks | Reinforcement spawned | Cap |",
 "|---|---|---:|---:|---:|---:|---|---|",
 ...rows.map(r=>"| "+r.id+" | "+r.finish.outcome+" | "+r.finish.round+" | "+r.courierTurns+" | "+r.totalActorActions+" | "+r.slowsApplied+" | "+(r.spawnRound??"no")+" | "+r.capReached+" |"),
 "",
 "## Fixture notes",
 "- T04b teleports Alpha to exit ONLY to isolate blocking logic. It is not a legal deployment.",
 "- T06b removes PET HAMSTRING from the test fixture. It is not an in-game build.",
 "- T09/T10 use local campaignContext true/false, not earned server intel.",
 "- T07 compares kodaSidegrade A/B independently of unlock eligibility.",
 "- PET uses synthetic ID/image; role stats are read from actual tacticalPetDef.",
 "- Raw actor-by-actor traces: results.json.",
 "",
 "## Release gate",
 "The above scenarios are diagnostic; victory does not imply balance or fun. Validated server persistence, first-clear, real playtest and live iOS are still BLOCKED."
];
writeFileSync("reports/p0b_run1/REPORT.md",md.join("\n"));
console.log(md.join("\n"));
if(checks.some(c=>!c.pass))process.exitCode=1;
