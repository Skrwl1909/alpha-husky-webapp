import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {resolve} from "node:path";
const path=resolve(process.argv[2]??"artifacts/counterstrike-workers/tactical_counterstrike_engine_v1.cjs");
for(const profile of ["new","high"])for(const intel of ["baseline","intel"])for(const policy of ["screen","disrupt"]){
 const trace=JSON.parse(readFileSync("artifacts/counterstrike/"+profile+"-"+intel+"-"+policy+".json","utf8"));
 function step(snapshot,command){
  const result=spawnSync(process.execPath,[path],{encoding:"utf8",input:JSON.stringify({encounter:trace.run,snapshot,command})});
  assert.equal(result.status,0,result.error?.message??result.stderr);
  return JSON.parse(result.stdout);
 }
 let result=step();
 for(const command of trace.commands)result=step(result.snapshot,command);
 assert.deepEqual(result,trace.result,"compiled worker must reproduce source trace "+profile+" "+intel+" "+policy);
}
console.log("PASS Counterstrike compiled workers reproduce all eight source traces.");
