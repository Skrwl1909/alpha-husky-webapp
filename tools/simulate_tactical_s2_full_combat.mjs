#!/usr/bin/env node
/**
 * S2 full-combat, deterministic scenario evaluation.
 * 12 authored missions × legal squads × two frozen stat profiles × two viable
 * player policies. Real engine turns; no fake outcomes, backend writes or rewards.
 * This is a deterministic benchmark of policies, NOT proof of human fun/retention.
 */
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"},localStorage:{getItem:()=>null}};
const {createServer}=await import("vite");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
const MAX_ACTIVATIONS=240;
try {
  const [ops,battle,ai,move,skills,target,defs,profiles,sidegrades,scheduler,rules]=await Promise.all([
    "/tactical-ops-src/data/operations.ts",
    "/tactical-ops-src/combat/battle.ts",
    "/tactical-ops-src/combat/ai.ts",
    "/tactical-ops-src/combat/movement.ts",
    "/tactical-ops-src/combat/skills.ts",
    "/tactical-ops-src/combat/targeting.ts",
    "/tactical-ops-src/data/units.ts",
    "/tactical-ops-src/combat/combatProfileV3.ts",
    "/tactical-ops-src/data/shadowSidegrade.ts",
    "/tactical-ops-src/combat/intentScheduler.ts",
    "/tactical-ops-src/combat/missionRules.ts",
  ].map(v=>vite.ssrLoadModule(v)));
  const pet={id:"s2-test-pet",name:"S2 PET",img:"https://example.test/unused.png"};
  const variants=[
    ["alpha","ally-02","ally-03"],
    ["alpha","ally-02",`pet:${pet.id}`],
    ["alpha","ally-03",`pet:${pet.id}`],
  ];
  const profilesData=[
    {name:"fresh",alpha:{hp:120,atk:28,def:12,spd:14},pet:{hp:78,atk:18,def:6,spd:13}},
    {name:"developed",alpha:{hp:138,atk:39,def:21,spd:16},pet:{hp:91,atk:25,def:11,spd:15}},
  ];
  const manhattan=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);
  const nearest=(arr,score)=>[...arr].sort((a,b)=>score(a)-score(b)||a.c-b.c||a.r-b.r)[0];
  function targetPriority(state,u,policy) {
    const o=state.objective, enemies=state.units.filter(v=>v.team==="enemy"&&!v.defeated);
    if(!enemies.length)return null;
    return [...enemies].sort((a,b)=>{
      function priority(t){
        if(policy==="tempo" || policy==="control"){
          if(o?.type==="INTERCEPT"&&t.id===o.targetId)return -900;
          if(o?.type==="BOSS"&&t.id===o.targetId)return policy==="tempo"?-900:20;
          if(o?.type==="HOLD"&&o.terminal)return manhattan(t,o.terminal)*20+t.hp/10;
          if(o?.type==="RECOVER"&&o.terminal)return manhattan(t,o.terminal)*15+t.hp/10;
        }
        return t.hp*1.2+move.chebyshev(u,t)*10;
      }
      return priority(a)-priority(b)||a.id.localeCompare(b.id);
    })[0];
  }
  function strike(state,actor,preferred,policy,stats){
    const ready=skills.availableSkills(state,actor).filter(s=>s.ready);
    const wounded=state.units.filter(u=>u.team==="ally"&&!u.defeated&&u.hp<u.maxHp*.7);
    if(policy==="control"&&wounded.length&&actor.role==="support"){
      const heals=ready.filter(s=>s.effects.some(e=>e.kind==="heal"));
      for(const heal of heals){
        let recipient=heal.targetType==="ALLY_SINGLE"?nearest(wounded,u=>u.hp/u.maxHp):null;
        if(heal.targetType==="ALLY_SINGLE"&&!target.validTargetIds(state.units,actor,heal).includes(recipient?.id))continue;
        const r=battle.trySkill(state,heal.id,recipient?.id);if(r.ok){stats.supportActions++;return r.state}
      }
    }
    const attacks=ready.filter(s=>s.effects.some(e=>e.kind==="damage")&&
      (s.targetType==="ENEMY_SINGLE"||s.targetType==="AREA_RADIUS"||s.targetType==="ENEMY_AOE"));
    const attack=[...attacks].sort((a,b)=>
      policy==="control"? (b.slot==="A2"?1:0)-(a.slot==="A2"?1:0) || (b.effects.find(e=>e.kind==="damage")?.multiplier||0)-(a.effects.find(e=>e.kind==="damage")?.multiplier||0)
        :(b.effects.find(e=>e.kind==="damage")?.multiplier||0)-(a.effects.find(e=>e.kind==="damage")?.multiplier||0));
    for(const s of attack){
      const targets=target.validTargetIds(state.units,actor,s);
      if(!targets.length)continue;
      const id=targets.includes(preferred?.id)?preferred.id:nearest(targets.map(id=>state.units.find(u=>u.id===id)).filter(Boolean),u=>u.hp).id;
      const r=battle.trySkill(state,s.id,id);
      if(r.ok){stats.attacks++;stats.skillsUsed.add(s.id);return r.state}
    }
    return null;
  }
  function playAlly(state,policy,stats){
    const actor=state.units.find(u=>u.id===state.activeId),o=state.objective;
    if(!actor||actor.defeated) return state;
    if(o?.type==="RECOVER" && battle.canRecover(state) && (policy==="tempo" || !state.units.some(u=>u.team==="enemy"&&!u.defeated) || state.round>=4)){
      const r=battle.tryRecover(state);if(r.ok){stats.objectiveActions++;return r.state}
    }
    let preferred=targetPriority(state,actor,policy);
    const oPoint=o?.type==="HOLD"||o?.type==="RECOVER"?o.terminal:null;
    const remaining=state.units.filter(u=>u.team==="enemy"&&!u.defeated).length;
    const nextHolder=state.units.find(u=>u.team==="ally"&&!u.defeated);
    const wantsObjective=Boolean(oPoint)&&(
      policy==="tempo" || remaining===0 || (o?.type==="RECOVER"&&state.round>=3) || (o?.type==="HOLD"&&state.round>=4)
    ) && (o?.type==="RECOVER" || (actor.defId==="alpha" || actor.id===nextHolder?.id));
    // CONTROL wins interceptions by body-blocking the legal courier exit lane
    // while the remainder of the squad suppresses its approach.
    const courier=o?.type==="INTERCEPT"?state.units.find(u=>u.id===o.targetId&&!u.defeated):null;
    const blocker=policy==="control"&&courier&&actor.id===nextHolder?.id;
    const blockDestination=blocker?o.exit:null;
    const alreadyBlocking=Boolean(blockDestination&&actor.c===blockDestination.c&&actor.r===blockDestination.r);
    const dist=oPoint?manhattan(actor,oPoint):Infinity;
    const mustHold=o?.type==="HOLD" && dist<=o.radius && wantsObjective;
    if(!mustHold && !blocker && (policy==="control" || !wantsObjective)){
      const fired=strike(state,actor,preferred,policy,stats);if(fired)return fired;
    }
    if(!actor.hasMoved){
      const reachable=move.reachableCells(actor,state.units);
      const aim=blockDestination || (wantsObjective?oPoint:preferred);
      if(aim){
        const current=(blockDestination||wantsObjective)?manhattan(actor,aim):move.chebyshev(actor,aim);
        const spots=reachable.filter(p=>((blockDestination||wantsObjective)?manhattan(p,aim):move.chebyshev(p,aim))<current);
        // Both viable policies pursue the actual win condition, but differ in timing.
        if(spots.length && !mustHold && !alreadyBlocking){
          const dest=nearest(spots,p=> ((blockDestination||wantsObjective)?manhattan(p,aim):move.chebyshev(p,aim))*100+ p.c/10 + p.r/100);
          const moved=battle.tryMove(state,dest.c,dest.r);
          if(moved.ok){state=moved.state;stats.moves++;stats.positions.add(actor.id+":"+dest.c+","+dest.r);}
        }
      }
    }
    if(state.outcome!=="ongoing")return state;
    const newActor=state.units.find(u=>u.id===state.activeId);
    if(o?.type==="RECOVER"&&(policy==="tempo" || !state.units.some(u=>u.team==="enemy"&&!u.defeated) || state.round>=4)&&battle.canRecover(state)){
      const r=battle.tryRecover(state);if(r.ok){stats.objectiveActions++;return r.state}
    }
    if(!mustHold){
      const fired=strike(state,newActor,preferred,policy,stats);if(fired)return fired;
    }
    // When a relay is occupied, guarding/healing is legal if a support skill helps,
    // otherwise keep the zone. Skip advances the actual initiative clock.
    stats.skips++;
    const skipped=battle.trySkip(state);
    assert(skipped.ok,"legal ally skip failed");
    return skipped.state;
  }
  function fullRun(mission,squad,profile,policy){
    const spawns=ops.missionSpawnsForSquad(mission,squad,pet);
    assert(spawns,mission.missionId+": cannot deploy "+squad);
    const altered=sidegrades.withTeammateSidegrades(spawns,{kodaSidegrade:"B",shadowSidegrade:"B",packMastery:{}});
    const v3={version:3,mode:"battle-v1",alpha:profile.alpha,pet:squad.some(x=>x.startsWith("pet:"))?{...pet,...profile.pet}:null};
    const applied=profiles.applyRunCombatProfile(altered,v3,{pet:v3.pet});
    const spec=ops.missionBattleRules(mission,false,mission.activity==="FIELD_OP"?{reportVersion:3,pressure:2}:undefined);
    let state=battle.createBattle(null,applied,spec.objective,spec.reinforcement,null,spec.directive);
    const stats={moves:0,attacks:0,supportActions:0,objectiveActions:0,skips:0,enemyAttacks:0,positions:new Set(),skillsUsed:new Set(),telegraphs:0,counters:0,hostiles:0,roundProgress:[],blocked:0};
    let cycle=scheduler.emptyThreatCycle(),stall=0,previous="",error=null,activations=0;
    for(;activations<MAX_ACTIVATIONS && state.outcome==="ongoing";activations++){
      const advanced=battle.advanceToNext(state);
      state=advanced.state;
      const unit=state.units.find(u=>u.id===state.activeId);
      if(state.outcome!=="ongoing")break;
      if(!unit){error="no_active_unit";break;}
        {const oldCount=cycle.ledger.length; cycle=scheduler.pruneInvalidThreats(cycle,state);stats.counters+=cycle.ledger.slice(oldCount).filter(e=>e.type==="threat_countered").length;}
      if(unit.team==="ally") {
        cycle=scheduler.markAlliedReaction(cycle,state);
        // In the control policy, react to locked attacks by making a real legal evasive move.
        const locked=cycle.pending.find(t=>t.plan.targetUnitId===unit.id && t.plan.targetTile);
        if(policy==="control" && locked && !unit.hasMoved && state.objective?.type!=="INTERCEPT"){
          const cells=move.reachableCells(unit,state.units).filter(p=>p.c!==locked.plan.targetTile.c||p.r!==locked.plan.targetTile.r);
          const safe=cells.filter(p=>!locked.plan.impactTiles.some(t=>t.c===p.c&&t.r===p.r));
          if(safe.length){
            const dest=nearest(safe,p=>move.chebyshev(p,unit)*10+ p.c/100 +p.r/1000);
            const moved=battle.tryMove(state,dest.c,dest.r);
            if(moved.ok){state=moved.state;stats.moves++;stats.positions.add(unit.id+":"+dest.c+","+dest.r);const oldCount=cycle.ledger.length;cycle=scheduler.pruneInvalidThreats(cycle,state);stats.counters+=cycle.ledger.slice(oldCount).filter(e=>e.type==="threat_countered").length}
          }
        }
        if(state.outcome==="ongoing")state=playAlly(state,policy,stats);
      } else {
        if(cycle.interruptedEnemyIds?.includes(unit.id)){
          cycle={...cycle,interruptedEnemyIds:cycle.interruptedEnemyIds.filter(id=>id!==unit.id)};
          const skipped=battle.trySkip(state);
          assert(skipped.ok,"interrupted enemy skip");state=skipped.state;
        } else {
          const prior=cycle.pending.find(t=>t.plan.enemyId===unit.id);
          if(prior){
            const oldLedger=cycle.ledger.length;
            const res=scheduler.resolveEnemyThreat(cycle,state);
            cycle=res.cycle;
            const updates=cycle.ledger.slice(oldLedger);
            stats.counters+=updates.filter(e=>e.type==="threat_countered").length;
            if(res.state!==state)state=res.state;
            else {const skipped=battle.trySkip(state);assert(skipped.ok,"locked enemy skip");state=skipped.state}
          } else {
            const next=scheduler.queueEnemyThreat(cycle,state);
            if(next.pending.length>cycle.pending.length){
              stats.telegraphs+=next.pending.length-cycle.pending.length;
              cycle=next;
              const skipped=battle.trySkip(state);assert(skipped.ok,"telegraph announcement skip");state=skipped.state;
            } else {
              const action=ai.chooseAiAction(state);
              assert(ai.aiUsesLegalRules(state,action),mission.missionId+": illegal enemy action "+JSON.stringify(action));
              if(action.type==="skill")stats.enemyAttacks++;
              state=battle.applyAi(state,action).state;
            }
          }
        }
      }
      if(state.outcome==="ongoing")state=battle.evaluateOutcome(state);
      const after=[state.units.map(u=>[u.id,u.c,u.r,u.hp,u.defeated]),state.objective?.type==="HOLD"||state.objective?.type==="SURVIVE"?state.objective.progress:null];
      const sig=JSON.stringify(after);
      if(sig===previous)stall++; else {stall=0;previous=sig}
      if(stall>65){error="policy_stalled_66_activations";break}
      stats.hostiles=state.hostilesEliminated;
      if((state.objective?.type==="HOLD"||state.objective?.type==="SURVIVE") && (!stats.roundProgress.length||stats.roundProgress.at(-1).round!==state.round)){
        stats.roundProgress.push({round:state.round,progress:state.objective.progress});
      }
    }
    return {missionId:mission.missionId,squad:squad.join("+"),profile:profile.name,policy,outcome:state.outcome,rounds:state.round,activations,error,hostiles:stats.hostiles,squadStanding:state.units.filter(u=>u.team==="ally"&&!u.defeated).length,moves:stats.moves,attacks:stats.attacks,skips:stats.skips,heals:stats.supportActions,objectiveActions:stats.objectiveActions,uniqueSkills:stats.skillsUsed.size,uniquePositions:stats.positions.size,objectiveProgress:state.objective?.type==="HOLD"||state.objective?.type==="SURVIVE"?state.objective.progress:null,telegraphs:stats.telegraphs,counters:stats.counters};
  }
  const all=[];
  for(const mission of Object.values(ops.MISSION_DEFS)){
    const squadOptions=mission.missionId==="broken-signal-breach"?[variants[0]]:
      mission.missionId==="broken-signal-recover"?variants.map(x=>x.slice(0,2)) : variants;
    for(const squad of squadOptions)for(const profile of profilesData)for(const policy of ["tempo","control"]){
      const row=fullRun(mission,squad,profile,policy);
      all.push(row);
    }
  }
  assert.equal(all.length,136,"34 legal lineups × two profiles × two policies = 136 actual battles");
  assert(all.every(r=>r.activations<=MAX_ACTIVATIONS));
  assert(all.some(r=>r.telegraphs>0),"No live threat announcements were recorded");
  const grouped={};
  for(const id of Object.keys(ops.MISSION_DEFS)){
    const subset=all.filter(r=>r.missionId===id);
    grouped[id]={runs:subset.length,win:subset.filter(r=>r.outcome==="victory").length,loss:subset.filter(r=>r.outcome==="defeat").length,unresolved:subset.filter(r=>r.outcome==="ongoing").length,policyStalls:subset.filter(r=>r.error?.startsWith("policy_stalled")).length,telegraphs:subset.reduce((n,r)=>n+r.telegraphs,0),counters:subset.reduce((n,r)=>n+r.counters,0),roundMin:Math.min(...subset.map(r=>r.rounds)),roundMax:Math.max(...subset.map(r=>r.rounds)),dualWinsDifferent:subset.filter(r=>r.policy==="tempo"&&r.outcome==="victory"&&all.some(v=>v.missionId===r.missionId&&v.squad===r.squad&&v.profile===r.profile&&v.policy==="control"&&v.outcome==="victory"&&(v.rounds!==r.rounds||v.objectiveActions!==r.objectiveActions||v.moves!==r.moves||v.attacks!==r.attacks))).length};
  }
  const result={schema:"s2-real-combat-matrix.v1",interpretation:"Controller stalls are defects in scripted policies until isolated. Only two victories with different observed costs demonstrate viable alternatives.",mode:"VNext Lab engine only",benchmark:"scripted tempo vs control policies, both attempt mission completion, not humans",missions:12,runs:all.length,maxActivations:MAX_ACTIVATIONS,byMission:grouped,runsData:all};
  mkdirSync("artifacts",{recursive:true});
  writeFileSync("artifacts/tactical-s2-full-combat.json",JSON.stringify(result,null,2));
  console.log(JSON.stringify({schema:result.schema,runs:all.length,byMission:grouped},null,2));
  // S2 engineering release gate — do not confuse this with a human balance/fun verdict.
  for(const [missionId,coverage] of Object.entries(grouped)){
    assert.equal(coverage.runs,missionId==="broken-signal-breach"?4:12,missionId+": missing eligible squad/profile policies");
    assert.equal(coverage.unresolved,0,missionId+": encounter did not terminate");
    assert.equal(coverage.policyStalls,0,missionId+": player strategy stalled");
    assert(coverage.telegraphs>0,missionId+": telegraph engine never engaged");
    assert(coverage.counters>0,missionId+": no genuine counter event in either policy");
    assert(coverage.dualWinsDifferent>0,missionId+": missing two real victory routes with different costs");
  }
  assert.equal(all.filter(r=>r.outcome==="victory").length,all.length,"all legal paired profiles must finish mission");
  const totalCounters=all.reduce((sum,r)=>sum+r.counters,0);
  const totalTelegraphs=all.reduce((sum,r)=>sum+r.telegraphs,0);
  assert(totalCounters>0 && totalTelegraphs>totalCounters,"threats and reactions must both be observable");
  console.log("S2_ENGINEERING_GATE_PASS: 12/12 missions, 68/68 dual-victory pairs, actual telegraph and counter events");
  // Assertions gate correctness, but intentional gaps stay visible, not disguised as PASS.
  const stalledObjective=all.filter(r=>r.error);
  assert(!stalledObjective.length,"Objective controller stalled: "+stalledObjective.map(r=>r.missionId+":"+r.squad+":"+r.error).slice(0,8).join(";"));
  // Any scripted policy stall is reported as a policy defect, not a proof of engine softlock.
  console.log("S2_FULL_COMBAT_MATRIX_PASS (tempo vs control; still requires genuine dual-win evidence)");
}finally{await vite.close();}
