#!/usr/bin/env node
/**
 * DEPTH 01 focused engine evidence, adapted from the existing S2 controller.
 * One challenge, two legal lineups, real engine turns on both accepted grids.
 * Optional accepted-run mode consumes exact local HTTP snapshots.
 * This is a deterministic benchmark of policies, NOT proof of human fun/retention.
 */
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync,readFileSync} from "node:fs";
globalThis.window={location:{search:"?tacticalBattlefieldVNext=1"},localStorage:{getItem:()=>null}};
const {createServer}=await import("vite");
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
const MAX_ACTIVATIONS=240;
const g1 = true;
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
  const builds = [
    {name:"hold-line",paths:["vanguard","disruptor","sentinel"],koda:"B",shadow:"B",signature:"B"},
    {name:"cut-courier",paths:["howlkeeper","pursuer","medic"],koda:"A",shadow:"A",signature:"A"},
    {name:"break-signal",paths:["howlkeeper","disruptor","medic"],koda:"B",shadow:"A",signature:"A"},
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
    const cast=(skill,id)=>{
      const r=battle.trySkill(state,skill.id,id);
      if(r.ok){stats.lastAction={before:state,after:r.state,actor:actor.id,skill:skill.id,target:id,events:r.events};stats.skillsUsed.add(skill.id);stats.evidence.push(...r.events.filter(e=>e.buildEvidence).map(e=>e.buildEvidence));}
      return r;
    };
    if(g1 && actor.defId==="ally-02" && actor.growth?.discipline==="disruptor") {
      const pressure=ready.find(s=>s.slot==="A3"), locked=stats.pending?.find(t=>pressure&&target.validTargetIds(state.units,actor,pressure).includes(t.plan.enemyId));
      if(locked){const r=cast(pressure,locked.plan.enemyId);if(r.ok){stats.controlActions++;return r.state}}
    }
    if(g1 && actor.defId==="alpha" && actor.growth?.discipline==="vanguard") {
      const howl=ready.find(s=>s.slot==="A3");
      if(howl && !actor.statuses.some(s=>s.type==="GUARD")){const r=cast(howl);if(r.ok){stats.supportActions++;return r.state}}
    }
    const wounded=state.units.filter(u=>u.team==="ally"&&!u.defeated&&u.hp<u.maxHp*.7);
    if(policy==="control"&&wounded.length&&actor.role==="support"){
      const heals=ready.filter(s=>s.effects.some(e=>e.kind==="heal"));
      for(const heal of heals){
        let recipient=heal.targetType==="ALLY_SINGLE"?nearest(wounded,u=>u.hp/u.maxHp):null;
        if(heal.targetType==="ALLY_SINGLE"&&!target.validTargetIds(state.units,actor,heal).includes(recipient?.id))continue;
        const r=cast(heal,recipient?.id);if(r.ok){stats.supportActions++;return r.state}
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
      const r=cast(s,id);
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
      policy==="tempo" || policy==="adjacent" || (o?.holderRadius===0 || policy==="precise") || remaining===0 || (o?.type==="RECOVER"&&state.round>=3) || (o?.type==="HOLD"&&state.round>=4)
    ) && (o?.type==="RECOVER" || (actor.defId==="alpha" || actor.id===nextHolder?.id));
    // CONTROL wins interceptions by body-blocking the legal courier exit lane
    // while the remainder of the squad suppresses its approach.
    const courier=o?.type==="INTERCEPT"?state.units.find(u=>u.id===o.targetId&&!u.defeated):null;
    const blocker=policy==="control"&&courier&&actor.id===nextHolder?.id;
    const blockDestination=blocker?o.exit:null;
    const alreadyBlocking=Boolean(blockDestination&&actor.c===blockDestination.c&&actor.r===blockDestination.r);
    const dist=oPoint?manhattan(actor,oPoint):Infinity;
    const mustHold=o?.type==="HOLD" && dist<=(policy==="adjacent" ? o.radius : policy==="precise" ? 0 : o.holderRadius ?? o.radius) && wantsObjective;
    if(!mustHold && !blocker && (policy==="control" || !wantsObjective) && o?.holderRadius !== 0 && policy!=="precise"){
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
    {
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
    const spawns=ops.missionSpawnsForSquad(mission,squad,pet,profile.context?.approach);
    assert(spawns,mission.missionId+": cannot deploy "+squad);
    const pack=Object.fromEntries(squad.filter(id=>id!=="alpha").map(id=>[id,{progress:8,stage:3,selected:profile.build?.signature||"B"}]));
    const altered=sidegrades.withTeammateSidegrades(spawns,{kodaSidegrade:profile.sidegrades?.kodaSidegrade || profile.build?.koda||"B",shadowSidegrade:profile.sidegrades?.shadowSidegrade || profile.build?.shadow||"B",packMastery:profile.accepted?.packMastery || (profile.noMastery?{}:pack)});
    const v3={version:3,mode:"battle-v1",alpha:profile.alpha,pet:squad.some(x=>x.startsWith("pet:"))?{...pet,...profile.pet}:null};
    const applied=profiles.applyRunCombatProfile(altered,profile.accepted?.combatProfileV3 || v3,profile.accepted?.combatProfileV2 || {pet:v3.pet});
    const spec=ops.missionBattleRules(mission,false,profile.context || (mission.activity==="FIELD_OP"?{reportVersion:3,pressure:2,directiveTier:profile.tier||"standard"}:undefined));
    const growth = profile.accepted?.playerGrowth || (!profile.noGrowth ? {version:2,revision:1,heroes:["alpha","ally-02","ally-03"].map((id,i)=>({heroId:id,discipline:profile.build.paths[i],ranks:Object.fromEntries((i===0?["alpha-strike","alpha-rend","alpha-howl"]:i===1?["u02-shot","u02-burst","u02-suppress"]:["u03-tap","u03-mend","u03-pack"]).filter(id=>["alpha-strike","alpha-howl","u02-shot","u02-suppress","u03-mend","u03-pack"].includes(id)).map(id=>[id,2]))}))}:undefined);
    let state=battle.createBattle(null,applied,spec.objective,spec.reinforcement,null,spec.directive,profile.accepted?.playerGrowth || growth);
    const stats={lastAction:null,pending:[],controlActions:0,interrupts:0,evidence:[],moves:0,attacks:0,supportActions:0,objectiveActions:0,skips:0,enemyAttacks:0,positions:new Set(),skillsUsed:new Set(),telegraphs:0,counters:0,hostiles:0,roundProgress:[],blocked:0};
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
        if(policy==="evade" && locked && !unit.hasMoved && state.objective?.type!=="INTERCEPT"){
          const cells=move.reachableCells(unit,state.units).filter(p=>p.c!==locked.plan.targetTile.c||p.r!==locked.plan.targetTile.r);
          const safe=cells.filter(p=>!locked.plan.impactTiles.some(t=>t.c===p.c&&t.r===p.r));
          if(safe.length){
            const dest=nearest(safe,p=>move.chebyshev(p,unit)*10+ p.c/100 +p.r/1000);
            const moved=battle.tryMove(state,dest.c,dest.r);
            if(moved.ok){state=moved.state;stats.moves++;stats.positions.add(unit.id+":"+dest.c+","+dest.r);const oldCount=cycle.ledger.length;cycle=scheduler.pruneInvalidThreats(cycle,state);stats.counters+=cycle.ledger.slice(oldCount).filter(e=>e.type==="threat_countered").length}
          }
        }
        if(state.outcome==="ongoing"){
          stats.pending=cycle.pending;stats.lastAction=null;
          state=playAlly(state,policy,stats);
          const action=stats.lastAction;
          if(g1 && action?.target){const r=scheduler.interruptLockedThreatAfterControl(cycle,action.before,action.after,action.actor,action.target,action.skill,action.events);if(r.interrupted){cycle=r.cycle;stats.interrupts++;}}
        }
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
        stats.roundProgress.push({round:state.round,progress:state.objective.progress,units:state.units.map(u=>({id:u.id,c:u.c,r:u.r,hp:u.hp})),terminal:state.objective.terminal});
      }
    }
    return {trace:stats.roundProgress,positions:[...stats.positions],report:{victory:state.results?.victory,objectiveComplete:state.results?.objectiveComplete,turns:state.results?.turns,healingActions:state.healingActions||0,squadStanding:state.results?.squadStanding,squadDeployed:state.results?.squadDeployed,...(state.failureReason?{failureReason:state.failureReason}:{}),...(profile.context?.masteryChallenge?{masteryChallenge:profile.context.masteryChallenge}:{})},build:profile.build?.name,tier:profile.tier,controlActions:stats.controlActions,interrupts:stats.interrupts,evidence:[...new Set(stats.evidence)].slice(0,8),missionId:mission.missionId,squad:squad.join("+"),profile:profile.name,policy,outcome:state.outcome,rounds:state.round,activations,error,hostiles:stats.hostiles,squadStanding:state.units.filter(u=>u.team==="ally"&&!u.defeated).length,moves:stats.moves,attacks:stats.attacks,skips:stats.skips,heals:stats.supportActions,objectiveActions:stats.objectiveActions,uniqueSkills:stats.skillsUsed.size,uniquePositions:stats.positions.size,objectiveProgress:state.objective?.type==="HOLD"||state.objective?.type==="SURVIVE"?state.objective.progress:null,telegraphs:stats.telegraphs,counters:stats.counters};
  }


  const types=await vite.ssrLoadModule('/tactical-ops-src/combat/types.ts');
  const intents=await vite.ssrLoadModule('/tactical-ops-src/combat/intentContract.ts');
  const missionRules=await vite.ssrLoadModule('/tactical-ops-src/combat/missionRules.ts');
  if(process.env.DEPTH01_ACCEPTED){
    const accepted=JSON.parse(readFileSync(process.env.DEPTH01_ACCEPTED,'utf8'));
    const run=accepted.run,contract=run.rulesContract||null;
    types.selectAcceptedBattleRules(contract);intents.selectAcceptedIntentRules(contract);
    const m=ops.missionForContext(ops.getMissionDef(run.missionId),run.fieldContext);
    const row=fullRun(m,run.squadIds,{name:'exact-http-snapshot',accepted:run,sidegrades:accepted.data,
      alpha:run.combatProfileV3?.alpha||{hp:120,atk:28,def:12,spd:14},context:run.fieldContext},run.fieldContext.reportVersion===4?'control':'precise');
    writeFileSync(process.env.DEPTH01_ACCEPTED_OUT,JSON.stringify(row,null,2));
    console.log('HTTP snapshot engine: '+row.outcome+' in '+row.rounds+' rounds');
    process.exitCode=0;
  } else {
  const base=ops.getMissionDef("field-relay-hold");
  const context={cycleId:0,reportVersion:4,pressure:2,approach:"standard",directiveTier:"advanced",directiveSet:"pursuit",masteryChallenge:"relay-lockdown-v1"};
  const baseline={...context,reportVersion:3,masteryChallenge:undefined,directiveSet:"attrition"};
  const profile=(build,ctx=context)=>({name:build.name,alpha:{hp:120,atk:28,def:12,spd:14},pet:{hp:78,atk:18,def:6,spd:13},build,context:ctx});
  const results=[];
  for(const grid of ["10x7","8x5"]){
    const contract=grid==="10x7"?{rulesetVersion:"tactical-intent-vnext.0"}:null;
    types.selectAcceptedBattleRules(contract);intents.selectAcceptedIntentRules(contract);
    for(const build of [builds[1],builds[2]]) for(const squad of variants.slice(0,2)) for(const policy of ["tempo","control","evade","adjacent"]){
      const row=fullRun(ops.missionForContext(base,context),squad,profile(build),policy);results.push({grid,...row});
    }
  }
  types.selectAcceptedBattleRules({rulesetVersion:"tactical-intent-vnext.0"});intents.selectAcceptedIntentRules({rulesetVersion:"tactical-intent-vnext.0"});
  const p=profile({...builds[1],signature:"B"});
  const qualification=fullRun(base,variants[0],{...profile(builds[1],baseline),alpha:{hp:138,atk:39,def:21,spd:16}},"precise");
  assert.equal(qualification.outcome,"victory","real Advanced HOLD prerequisite must be beatable");
  const withMastery=fullRun(ops.missionForContext(base,context),variants[1],p,"tempo");
  const withoutMastery=fullRun(ops.missionForContext(base,context),variants[1],{...p,noMastery:true},"tempo");
  const withoutGrowth=fullRun(ops.missionForContext(base,context),variants[1],{...p,noGrowth:true},"tempo");
  assert.notDeepEqual([withMastery.rounds,withMastery.moves,withMastery.attacks,withMastery.positions],[withoutMastery.rounds,withoutMastery.moves,withoutMastery.attacks,withoutMastery.positions],"Mastery must change actual engine play");
  assert.notDeepEqual([withMastery.rounds,withMastery.moves,withMastery.attacks],[withoutGrowth.rounds,withoutGrowth.moves,withoutGrowth.attacks],"Growth must change actual engine play");
  for(const grid of ["10x7","8x5"]){
    for(const squad of variants.slice(0,2)) assert(results.some(r=>r.grid===grid&&r.squad===squad.join('+')&&r.outcome==='victory'),grid+': two viable legal squads');

  }
  assert(results.some(r=>r.outcome==='defeat'&&r.policy==='evade'&&r.report.failureReason==='DEADLINE'),'failed evasive counterplay');
  assert(results.every(r=>r.outcome!=='ongoing'&&!r.error),'all encounters resolve');
  assert(results.some(r=>r.outcome==='victory'&&r.interrupts>0),'successful control counterplay');
  // Same adjacent occupancy is legal for Advanced HOLD, insufficient for Lockdown.
  // Scenario spawns are valid engine input, without fabricating a combat outcome.
  const at=base.objective.terminal;
  for(const grid of ['8x5','10x7']){
    const c=grid==='10x7'?{rulesetVersion:'tactical-intent-vnext.0'}:null;types.selectAcceptedBattleRules(c);intents.selectAcceptedIntentRules(c);
    const spawns=[{defId:'alpha',id:'alpha',c:at.c-1,r:at.r}];
    const standard=battle.createBattle(null,spawns,base.objective);
    const lockdown=battle.createBattle(null,spawns,ops.missionForContext(base,context).objective);
    assert(missionRules.holdControlled(standard));assert(!missionRules.holdControlled(lockdown),'adjacent ally cannot hold exact tile');
  }
  const success=results.find(r=>r.grid==='10x7'&&r.build==='cut-courier'&&r.squad===variants[0].join('+')&&r.policy==='tempo');
  const failure=results.find(r=>r.grid==='10x7'&&r.report.failureReason==='DEADLINE');
  const evidence={schema:'depth01-engine.v1',source:'real engine, synthetic legal squads, 12 earned skill ranks maximum',qualification,success,failure,withMastery,withoutMastery,withoutGrowth,runs:results};
  mkdirSync('artifacts/depth01',{recursive:true});writeFileSync('artifacts/depth01/combat.json',JSON.stringify(evidence,null,2));
  console.log(JSON.stringify({runs:results.length,wins:results.filter(r=>r.outcome==='victory').length,losses:results.filter(r=>r.outcome==='defeat').length,mastery:[withMastery.rounds,withoutMastery.rounds],growth:[withMastery.rounds,withoutGrowth.rounds]},null,2));
  }
} finally { await vite.close(); }
