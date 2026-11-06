#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createServer } from 'vite';
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
  const {MISSION_DEFS, missionForContext,missionBattleRules,missionSpawnsForSquad,g2HoldRevisionForRequest}=await vite.ssrLoadModule('/tactical-ops-src/data/operations.ts');
  const {createBattle,advanceToNext,trySkip}=await vite.ssrLoadModule('/tactical-ops-src/combat/battle.ts');
  const types=await vite.ssrLoadModule('/tactical-ops-src/combat/types.ts');
  const select=g2HoldRevisionForRequest;
  assert.equal(select('dead-relay-hold','tactical-intent-vnext.0',2,null),2,'new G2 start');
  assert.equal(select('dead-relay-hold','tactical-intent-vnext.0',2,{rulesContract:{missionRevision:1}}),undefined,'in-flight V1 remains V1');
  assert.equal(select('dead-relay-hold','tactical-intent-vnext.0',2,{rulesContract:null}),undefined,'legacy accepted run remains unchanged');
  assert.equal(select('dead-relay-hold','tactical-intent-vnext.0',undefined,{rulesContract:{missionRevision:2}}),2,'saved G2 resumes even without capability');
  assert.equal(select('dead-relay-hold',undefined,2,null),undefined,'no VNext handshake, no G2');
  assert.equal(select('dead-relay-guardian','tactical-intent-vnext.0',2,null),undefined,'no other mission revision altered');
  const base=MISSION_DEFS['dead-relay-hold'];
  const intel={version:1,courierTraceAcquired:true};
  const none={version:1,courierTraceAcquired:false};
  // Historical accepted runs cannot inherit a new variant even when account Intel changes.
  for(const context of [null,intel,none]) {
    const old=missionForContext(base,undefined,1,context);
    assert.equal(old,base,'V1 remains original mission object');
  }
  assert.equal(missionForContext(MISSION_DEFS['dead-relay-guardian'],undefined,2,intel),MISSION_DEFS['dead-relay-guardian']);
  assert.throws(()=>missionForContext(base,undefined,2,undefined),/invalid_g2_campaign_context/);
  const withIntel=missionForContext(base,undefined,2,intel);
  const withoutIntel=missionForContext(base,undefined,2,none);
  const squad=['alpha','ally-02','ally-03'];
  const oldRules=missionBattleRules(base,false,undefined,intel);
  const a=missionBattleRules(withIntel,false,undefined,intel);
  const b=missionBattleRules(withoutIntel,false,undefined,none);
  assert.equal(oldRules.reinforcement.triggerRound,3,'V1 keeps its original Courier Trace delay');
  assert.equal(a.reinforcement.triggerRound,3);
  assert.equal(b.reinforcement.triggerRound,2);
  assert.deepEqual(a.reinforcement.spawn,{...b.reinforcement.spawn,c:7,r:4});
  assert.equal(b.reinforcement.spawn.r,2);
  assert.equal(withIntel.spawns.find(x=>x.id==='h1').r,0);
  assert.equal(withoutIntel.spawns.find(x=>x.id==='h1').r,1);
  // Exercise the actual battle constructor on both eligible grids.
  for(const large of [false,true]){
    types.selectAcceptedBattleRules(large?{rulesetVersion:'tactical-intent-vnext.0'}:null);
    for(const variant of [withIntel,withoutIntel]){
      const rules=missionBattleRules(variant,false,undefined,variant===withIntel?intel:none);
      const spawns=missionSpawnsForSquad(variant,squad);
      assert(spawns&&spawns.length===5);
      let state=createBattle(null,spawns,rules.objective,rules.reinforcement,null,rules.directive);
      assert.equal(state.units.length,5);
      assert.equal(state.objective.type,'HOLD');
      assert.equal(state.reinforcement.spawned,false);
      assert(state.units.some(u=>u.id==='h1'));
      const entry=state.reinforcement.spawn;
      const triggerRound=state.reinforcement.triggerRound;
      for(let activation=0;activation<20 && !state.reinforcement.spawned;activation++){
        const next=advanceToNext(state);
        state=next.state;
        if(state.round<triggerRound) assert(!state.units.some(u=>u.id===entry.id),'no early HOUND');
        if(state.reinforcement.spawned) {
          assert(next.events.some(e=>e.type==='ticker'&&e.text.includes('REINFORCEMENT INBOUND')));
          break;
        }
        const skipped=trySkip(state);
        assert(skipped.ok);
        state=skipped.state;
      }
      const hound=state.units.find(u=>u.id===entry.id);
      assert(hound,'the HOUND must spawn during actual initiative');
      assert.equal(state.round,triggerRound);
      assert.deepEqual([hound.c,hound.r],[entry.c,entry.r]);
    }
  }
  console.log('PASS G2: V1 immutability, two distinct real-engine Hold encounters, 8x5/10x7, frozen Intel pressure, reinforcement timings');
} finally {await vite.close();}
