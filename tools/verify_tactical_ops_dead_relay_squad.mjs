import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const store = readFileSync(new URL("../tactical-ops-src/store/battleStore.ts", import.meta.url), "utf8");
const ui = readFileSync(new URL("../tactical-ops-src/ui/App.tsx", import.meta.url), "utf8");
const ops = readFileSync(new URL("../tactical-ops-src/data/operations.ts", import.meta.url), "utf8");
const marker = "toggleCommanderTeammate: (unitId) => {";
const start = store.indexOf(marker);
assert.ok(start >= 0, "handler not found");
let depth=1, end=start+marker.length;
while (depth && end<store.length) {
  if (store[end]==="{") depth++;
  else if (store[end]==="}") depth--;
  end++;
}
assert.equal(depth,0,"handler not balanced");
const body=store.slice(start+marker.length,end-1);
const toggle=new Function("unitId","get","set","getMissionDef","recoverSpawnsForSquad","DEAD_RELAY",body);
assert.match(ui, /fieldOp \|\| campaignMission \|\| mission\.objectiveType === "BOSS"/);
const getMissionDef=id=>id.startsWith("dead-relay-")?{activity:"CANON",operationId:"dead-relay"}:{activity:id.startsWith("field-")?"FIELD_OP":"CANON",operationId:"broken-signal"};
for (const mission of ["dead-relay-courier","dead-relay-hold","dead-relay-guardian"]) {
  assert.ok(ops.includes('"' + mission + '": {'),"missing "+mission);
  const state={screen:"brief",busy:false,kodaSavePending:false,shadowSavePending:false,selectedMissionId:mission,selectedSquadIds:["alpha","ally-02","ally-03"],progression:{equippedPet:{id:"sample"}},progressionError:"prior"};
  const click=id=>toggle(id,()=>state,x=>Object.assign(state,x),getMissionDef,ids=>["ally-02","ally-03","pet:sample"].includes(ids[1]),{operationId:"dead-relay"});
  click("ally-03");
  assert.deepEqual(state.selectedSquadIds,["alpha","ally-02"],mission+" deselect");
  click("pet:sample");
  assert.deepEqual(state.selectedSquadIds,["alpha","ally-02","pet:sample"],mission+" select PET");
  click("ally-03");
  assert.deepEqual(state.selectedSquadIds,["alpha","ally-02","pet:sample"],mission+" cap 2");
  click("invalid");
  assert.deepEqual(state.selectedSquadIds,["alpha","ally-02","pet:sample"],mission+" invalid");
  state.busy=true; click("ally-02");
  assert.deepEqual(state.selectedSquadIds,["alpha","ally-02","pet:sample"],mission+" busy");
  console.log("PASS",mission,"select/deselect/cap/invalid/busy");
}
for (const mission of ["broken-signal-commander","field-relay-intercept","broken-signal-recover"]) {
  const state={screen:"brief",busy:false,kodaSavePending:false,shadowSavePending:false,selectedMissionId:mission,selectedSquadIds:["alpha","ally-02"],progression:{},progressionError:null};
  toggle("ally-03",()=>state,x=>Object.assign(state,x),getMissionDef,()=>true,{operationId:"dead-relay"});
  assert.deepEqual(state.selectedSquadIds,mission==="broken-signal-recover"?["alpha","ally-02"]:["alpha","ally-02","ally-03"],mission);
  console.log("PASS legacy",mission);
}
console.log("PASS squad regression for all 3 Dead Relay missions");