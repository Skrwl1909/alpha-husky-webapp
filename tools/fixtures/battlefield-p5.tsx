/** Isolated browser QA transport/state setup. Never imported by production. */
import React from 'react';
import {createRoot} from 'react-dom/client';
import {BattleScreen} from '../../tactical-ops-src/ui/Battle';
import {TACTICAL_CSS} from '../../tactical-ops-src/styles';
import {useBattleStore as store} from '../../tactical-ops-src/store/battleStore';
import * as engine from '../../tactical-ops-src/combat/battle';
import * as scheduler from '../../tactical-ops-src/combat/intentScheduler';
import {selectAcceptedBattleRules, GRID_COLS, GRID_ROWS} from '../../tactical-ops-src/combat/types';
import {selectAcceptedIntentRules, TACTICAL_VNEXT_RULESET} from '../../tactical-ops-src/combat/intentContract';
import {previewQueue} from '../../tactical-ops-src/combat/initiative';
import {availableSkills} from '../../tactical-ops-src/combat/skills';
import {spriteEvents} from '../../tactical-ops-src/ui/combatFxAtlas';
import {confirmedSkillMoment} from '../../tactical-ops-src/ui/combatIdentity';
import {resolveTacticalLayout} from '../../tactical-ops-src/layout';
import {setMuted} from '../../tactical-ops-src/audio';
const style=document.createElement('style');style.textContent=TACTICAL_CSS;document.head.append(style);
setMuted(true);
let cycle=scheduler.emptyThreatCycle();let seq=300;
function seed(name='hold',vnext=true){
 const contract=vnext?{rulesetVersion:TACTICAL_VNEXT_RULESET}:null;
 selectAcceptedBattleRules(contract);selectAcceptedIntentRules(contract as any);
 const objective=name.startsWith('recover')?{type:'RECOVER',terminal:{c:3,r:3},completed:false}:name==='intercept'?{type:'INTERCEPT',targetId:'courier',exit:{c:7,r:2}}:{type:'HOLD',terminal:{c:4,r:2},radius:1,duration:3,progress:1};
 let battle=engine.createBattle(null,[{id:'alpha',defId:'alpha',c:1,r:1},{id:'ally-02',defId:'ally-02',c:0,r:0},{id:'ally-03',defId:'ally-03',c:0,r:4},{id:'enemy',defId:'hostile',c:4,r:2},{id:'courier',defId:'hostile',c:7,r:3},{id:'h3',defId:'hostile',c:6,r:4}],objective as any);
 const positions=[[2,3],[1,4],[2,4],[3,3],[5,2],[3,2]];
 battle={...battle,units:battle.units.map((u,i)=>({...u,c:positions[i][0],r:positions[i][1],hp:u.team==='ally'?Math.max(1,u.hp-12):u.hp,hasMoved:u.team==='enemy',cooldowns:u.team==='enemy'?{'hound-fortify':2}:u.cooldowns})),activeId:'alpha',mode:'selected',unitTurn:4,round:name==='recover-jammed'?1:2};
 if(battle.objective?.type==='RECOVER')battle.objective.terminal={c:3,r:3};
 if(name==='recover-jammed')battle={...battle,directive:{type:'SIGNAL_INTERFERENCE',name:'SIGNAL INTERFERENCE',copy:'Even rounds',recoverEveryRounds:2}};
 cycle=scheduler.emptyThreatCycle();
 store.setState({screen:'battle',battle,activeRulesetVersion:contract?.rulesetVersion||null,busy:false,threats:[],combatFx:[],combatMoment:null,consequences:[],floats:[],displayHp:{},impactId:null,enemyScene:null,banner:null,ticker:null,queue:previewQueue(battle,7),selectedMissionId:name.startsWith('recover')?'field-relay-recovery':name==='intercept'?'field-relay-intercept':'field-relay-hold'});
 return battle;
}
function announce(count=1){
 let b=store.getState().battle;
 for(const id of ['enemy','h3'].slice(0,count)){
  const s={...b,activeId:id,unitTurn:b.unitTurn-1};
  cycle=scheduler.queueEnemyThreat(cycle,s);
 }
 cycle=scheduler.markAlliedReaction(cycle,b);
 if(cycle.pending.length!==count)throw Error('Fixture expected '+count+' announced attacks, got '+cycle.pending.length);
 store.setState({threats:cycle.pending.map(t=>t.plan)});
 return cycle;
}
function prune(){cycle=scheduler.pruneInvalidThreats(cycle,store.getState().battle);store.setState({threats:cycle.pending.map(t=>t.plan)});return cycle;}
function resolve(){let b=store.getState().battle;const t=cycle.pending[0];if(!t)return;const r=scheduler.resolveEnemyThreat(cycle,{...b,activeId:t.plan.enemyId,unitTurn:b.unitTurn+2});cycle=r.cycle;store.setState({battle:r.state,threats:cycle.pending.map(t=>t.plan)});return r;}
function confirmedCast(actorId:string,skillId:string,targetId?:string){
 const before={...store.getState().battle,activeId:actorId,mode:'selected' as const};
 const actor=before.units.find(u=>u.id===actorId)!;
 const result=engine.trySkill(before,skillId,targetId);if(!result.ok)throw Error('Illegal fixture cast '+skillId);
 store.setState({battle:result.state,busy:true,combatFx:spriteEvents(actor,skillId,result.events,seq++,false),combatMoment:confirmedSkillMoment(actor,skillId,result.events,seq++,false),floats:result.events.filter(e=>['heal','damage','status'].includes(e.type)&&e.unitId).map(e=>({id:seq++,unitId:e.unitId!,text:e.text||'',kind:e.kind||e.type}))});
 return result;
}
(window as any).fixture={store,seed,announce,prune,resolve,confirmedCast,engine,scheduler,skills:()=>{const b=store.getState().battle;return availableSkills(b,b.units.find(u=>u.id===b.activeId)!);},grid:()=>({cols:GRID_COLS,rows:GRID_ROWS})};
const params=new URLSearchParams(location.search);seed(params.get('scene')||'hold',params.get('v1')!=='1');
if(params.has('threat'))announce(Number(params.get('threat'))||1);
createRoot(document.getElementById('mount')!).render(<BattleScreen/>);

// Mirrors production bootstrap ensureBattlefieldGeometry, including its 160px floor.
// Keep this fixture host in parity; production bootstrap itself is untouched.
function geometry(){
 const root=document.getElementById('tacticalOpsRoot')!,wrap=root.querySelector<HTMLElement>('.t-field-wrap');if(!wrap)return;
 const layout=resolveTacticalLayout(innerWidth,innerHeight);root.dataset.layout=layout;
 const height=(sel:string)=>Math.round(root.querySelector(sel)!.getBoundingClientRect().height);
 const available=layout==='wide'?Math.max(160,innerHeight):Math.max(160,innerHeight-height('.t-top')-height('.t-dock'));
 root.style.setProperty('--tops-field-h',available+'px');
 Object.assign(wrap.style,{display:'block',width:'100%',minWidth:'0',overflow:'hidden',position:layout==='wide'?'absolute':'relative',inset:layout==='wide'?'0':'auto',height:layout==='wide'?'100%':available+'px',minHeight:layout==='wide'?'100%':available+'px',maxHeight:layout==='wide'?'none':available+'px'});
}
new MutationObserver(()=>requestAnimationFrame(geometry)).observe(document.getElementById('mount')!,{childList:true,subtree:true});
new ResizeObserver(geometry).observe(document.getElementById('tacticalOpsRoot')!);
(window as any).fixture.geometry=geometry;
// Optional manual engine transport for a reproducible capture sequence. Every
// outcome still comes from trySkill/resolveEnemyThreat; production is unaffected.
(window as any).fixture.captureTransport=()=>{
 store.setState({selectTarget:id=>{
  const before=store.getState().battle;if(!before.actionSkillId)return;
  const actor=before.units.find(u=>u.id===before.activeId)!;
  const result=engine.trySkill(before,before.actionSkillId,id);if(!result.ok)return;
  const counter=scheduler.interruptLockedThreatAfterControl(cycle,before,result.state,actor.id,id,before.actionSkillId,result.events);cycle=counter.cycle;
  store.setState({battle:result.state,busy:true,threats:cycle.pending.map(t=>t.plan),combatFx:spriteEvents(actor,before.actionSkillId,result.events,seq++,counter.interrupted),combatMoment:confirmedSkillMoment(actor,before.actionSkillId,result.events,seq++,counter.interrupted),floats:result.events.filter(e=>['heal','damage','status'].includes(e.type)&&e.unitId).map(e=>({id:seq++,unitId:e.unitId!,text:e.text||'',kind:e.kind||e.type}))});
  (window as any).fixture.captureEvents=result.events;
 }});
};
(window as any).fixture.resolveCapture=()=>{
 const result=resolve();if(!result)return null;
 store.setState({busy:true,combatFx:[],combatMoment:null,floats:(result.events||[]).filter(e=>['heal','damage','status'].includes(e.type)&&e.unitId).map(e=>({id:seq++,unitId:e.unitId!,text:e.text||'',kind:e.kind||e.type}))});return result;
};
