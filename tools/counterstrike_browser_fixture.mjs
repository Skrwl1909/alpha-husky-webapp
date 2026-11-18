/** Synthetic transport for hosted UI checks. Private authority is tested separately. */
import {readFileSync} from "node:fs";
export function counterstrikeBrowserFixture(server){
 let canonical,run,step,revision=0,consumed=false;
 const hero=heroId=>({heroId,discipline:null,ranks:{},respecUsed:false});
 function reset(prior=false){
  consumed=prior;run=null;step=null;revision=0;
  canonical={version:1,foundationStage:"completed",completed:true,revision:8,activeRunId:null,lastCompletedRunId:"synthetic",updatedAt:1800400000,
   playerGrowth:{version:2,earnedPoints:0,spentPoints:0,claimedFirstClears:[],heroes:["alpha","ally-02","ally-03"].map(hero)},
   operations:{"broken-signal":{status:"cleared",missions:{"broken-signal-breach":"cleared","broken-signal-recover":"cleared","broken-signal-commander":"cleared"},activeMissionRun:null,lastCompletedMissionRunId:null},
    "dead-relay":{status:"active",missions:{"dead-relay-courier":"available","dead-relay-hold":"locked","dead-relay-guardian":"locked"},activeMissionRun:null,lastCompletedMissionRunId:null}},
   counterstrike:{version:1,available:true,blocked:false,status:"active",squadIds:[],activeRunId:null,
    intelStatus:prior?"PREVIOUSLY_CONSUMED":"APPLIED",intelConsumedByRunId:prior?"campaign_previous":null,firstClear:null,lastResult:null,nextMissionId:"dead-relay-courier"}};
 }
 reset();
 return async(req,res,next)=>{
  if(!req.url?.startsWith("/fixture/")&&!req.url?.startsWith("/webapp/tactical-foundation/"))return next();
  const url=new URL(req.url,"http://fixture");
  let body="";for await(const chunk of req)body+=chunk;
  const input=body?JSON.parse(body):{};
  res.setHeader("Content-Type","application/json");
  const reply=data=>res.end(JSON.stringify(data));
  if(url.pathname==="/fixture/reset"){reset(input.consumed);if(input.disabled)delete canonical.counterstrike;return reply({ok:true});}
  const trace=JSON.parse(readFileSync("artifacts/counterstrike/new-"+(consumed?"baseline":"intel")+"-screen.json","utf8"));
  if(url.pathname==="/fixture/trace")return reply({commands:trace.commands});
  if(url.pathname.endsWith("/state")&&!url.pathname.includes("/counterstrike/"))return reply({ok:true,data:canonical});
  const {stepCounterstrike}=await server.ssrLoadModule("/tactical-ops-src/combat/counterstrikeAuthority.ts");
  if(url.pathname.endsWith("/start")&&!run){
   run=trace.run;run.runId="counterstrike_v1_fixture";
   step=stepCounterstrike(run);canonical.counterstrike.activeRunId=run.runId;
   canonical.counterstrike.squadIds=run.squadIds;canonical.counterstrike.intelConsumedByRunId=consumed?"campaign_previous":run.runId;
   canonical.revision++;
  }else if(url.pathname.endsWith("/command")){
   step=stepCounterstrike(run,step.snapshot,input.command);revision++;canonical.revision++;
   if(step.terminal){
    const result={runId:run.runId,missionId:run.missionId,victory:step.battle.outcome==="victory",firstClear:true,
     rounds:step.battle.round,control:step.battle.objective.progress,intelStatus:consumed?"PREVIOUSLY_CONSUMED":"APPLIED",
     intelConsumedByRunId:canonical.counterstrike.intelConsumedByRunId,verification:"SERVER_COMMAND_WORKER"};
    Object.assign(canonical.counterstrike,{status:"cleared",firstClear:result,lastResult:result,activeRunId:null,squadIds:[]});
   }
  }
  return reply({ok:true,data:canonical,recover:{runId:run.runId,revision,token:"synthetic-token",battle:step.battle,
   threats:step.snapshot.cycle.pending.map(t=>t.plan),...(url.pathname.endsWith("/command")?{frames:step.frames}:{}),
   counterstrike:{radio:step.radio,result:canonical.counterstrike.lastResult}}});
 };
}
