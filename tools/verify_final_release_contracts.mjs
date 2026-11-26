import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false}});
try{
 const load=p=>server.ssrLoadModule('/tactical-ops-src/'+p+'.ts');
 const [display,accepted,authority]=await Promise.all(['ui/runCombatPower','host/acceptedPower','host/operationAuthority'].map(load));
 const power={version:'tactical-power-projection-p2.v1',projectionId:'a'.repeat(64),alpha:{hp:124,atk:52,def:21,spd:15}};
 assert.deepEqual(accepted.parseAcceptedPowerDisplay(power),power);
 for(const patch of [{projectionId:'bad'},{alpha:{...power.alpha,atk:999}},{version:'unknown'}])assert.equal(accepted.parseAcceptedPowerDisplay({...power,...patch}),null);
 const run={runId:'field_'+'a'.repeat(32),squadIds:['alpha','ally-02','ally-03'],rulesContract:{combatProfileVersion:3},
  combatProfileV2:{pet:null},combatProfileV3:{version:3,mode:'battle-v1',alpha:{hp:120,atk:35,def:14,spd:15},pet:null},acceptedPower:power};
 const state={operations:{},fieldOps:{activeMissionRun:run}};
 assert.deepEqual(display.confirmedRunCombatPower(state,run.runId).profile.alpha,power.alpha);
 assert.equal(display.confirmedRunCombatPower(state,'different-run'),null);
 assert.equal(display.confirmedRunCombatPower({...state,fieldOps:{activeMissionRun:{...run,acceptedPower:null}}},run.runId),null);
 for(const mission of Object.keys(authority.ONLINE_OBJECTIVE)){
  assert(authority.authoritySupported({operationAuthority:{version:1,missionIds:[mission]}},mission));
  assert(!authority.authoritySupported({operationAuthority:{version:1,missionIds:[]}},mission));
 }
 for(const mission of ['broken-signal-breach','broken-signal-recover','dead-relay-courier','dead-relay-hold','dead-relay-guardian'])assert(!authority.authoritySupported({vnextStartAvailable:true},mission));
 assert.equal(authority.unresolvedOperation(state).runId,run.runId);
 assert.equal(authority.parseAuthority({version:1,transport:'recover',runId:run.runId,missionId:'field-relay-hold',objectiveType:'RECOVER',rewardMode:'base'},run.runId,'field-relay-hold'),undefined);
 console.log('PASS final accepted-power selection, corrupt display, mission capabilities, unsupported story, objective binding and resume contracts');
}finally{await server.close();}
