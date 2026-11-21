/** Verify the server-authority boundary without a real account or live backend. */
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({configFile:false,appType:'custom',
  cacheDir:'node_modules/.vite-tactical-online-authority',
  server:{host:'127.0.0.1',port:0,hmr:false}});
const calls=[];
let reply={ok:false,code:'synthetic_stop'};
globalThis.window={apiPost:async (path,body)=>{calls.push({path,body});return reply;}};
try {
  const api=await server.ssrLoadModule('/tactical-ops-src/host/foundationProgression.ts');
  const ruleset='tactical-intent-vnext.0';
  const expectStop=async(fn)=>{
    await assert.rejects(fn(),e=>e?.code==='synthetic_stop');
    return calls.at(-1);
  };
  const cases=[
    ['field-relay-intercept',true],
    ['broken-signal-commander',true],
    ['field-relay-recovery',true],
    ['broken-signal-breach',false]
  ];
  for(const [missionId,expected] of cases){
    const call=await expectStop(()=>api.startOperationMission('test-start',0,missionId,['alpha','ally-02','ally-03'],undefined,ruleset));
    assert.equal(call.path,'/webapp/tactical-foundation/mission/start');
    assert.equal(call.body.recoverAuthorityVersion===1,expected,missionId);
  }
  const exampleView=(runId,objective)=>({runId,revision:2,token:'token_test',battle:{objective:{type:objective},units:[]},threats:[],frames:[]});
  const objectives=[
    ['field_recover_v1_example','field-relay-recovery','RECOVER'],
    ['field_verified_v1_example','field-relay-intercept','INTERCEPT'],
    ['mission_verified_v1_example','broken-signal-commander','BOSS'],
    ['field_legacy_accepted','field-relay-intercept','INTERCEPT'],
    ['mission_legacy_accepted','broken-signal-commander','BOSS'],
  ];
  for(const [runId,missionId,objective] of objectives){
    assert.equal(api.isRecoverAuthorityRun(runId),!runId.includes('legacy_accepted'));
    reply={ok:true,recover:exampleView(runId,objective)};
    const view=await api.loadRecoverBattle(runId,missionId);
    assert.equal(view.battle.objective.type,objective);
    assert.equal(calls.at(-1).path,'/webapp/tactical-foundation/recover/state');
    reply={ok:true,recover:{...view,revision:view.revision+1,frames:[]}};
    await api.sendRecoverCommand(view,{type:'skip'});
    const commandCall=calls.at(-1);
    assert.equal(commandCall.path,'/webapp/tactical-foundation/recover/command');
    assert.equal(commandCall.body.expectedRevision,2);
    assert.equal(commandCall.body.token,'token_test');
    assert.deepEqual(commandCall.body.command,{type:'skip'});
    reply={ok:true,recover:exampleView(runId,'ELIMINATE')};
    await assert.rejects(api.loadRecoverBattle(runId,missionId),e=>e?.code==='invalid_progression_response');
  }
  reply={ok:false,code:'synthetic_stop'};
  const authoritative=await expectStop(()=>api.continueOperationMission('test-continue',4,'mission_verified_v1_example',false,undefined,undefined,ruleset));
  assert.equal(authoritative.path,'/webapp/tactical-foundation/mission/continue');
  assert(!Object.hasOwn(authoritative.body,'completionIntent'));
  assert(!Object.hasOwn(authoritative.body,'fieldReport'));
  assert(!Object.hasOwn(authoritative.body,'campaignReport'));
  const older=await expectStop(()=>api.continueOperationMission('test-continue',4,'mission_legacy_accepted',false,undefined,undefined,ruleset,false,true));
  assert(!Object.hasOwn(older.body,'completionIntent'));
  const ordinary=await expectStop(()=>api.continueOperationMission('test-continue',4,'mission_local_run',false,undefined,undefined,ruleset));
  assert.equal(ordinary.body.completionIntent,true);
  console.log('PASS: server-authoritative Intercept/Commander start, command, resume, objective and proof-free settlement');
} finally {
  delete globalThis.window;
  await server.close();
}
