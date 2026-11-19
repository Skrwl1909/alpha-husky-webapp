import {useBattleStore} from "../store/battleStore";
import {COUNTERSTRIKE_MISSION} from "../data/counterstrike";
import {getMissionDef} from "../data/operations";
import {CounterstrikeStoryIntro,CounterstrikeStoryHoundCue,CounterstrikeStoryAftermath} from "./CounterstrikeStory";

export function CounterstrikeCard({archive=false}:{archive?:boolean}){
 const summary=useBattleStore(s=>s.progression?.counterstrike);
 const open=useBattleStore(s=>s.openCounterstrikeBrief);
 if(!summary)return null;
 const recorded=summary.firstClear;
 return <section className="t-panel" aria-label={archive?"Counterstrike archive":"Counterstrike operation"}>
  <span className="t-kicker">{archive?"CAMPAIGN RECORD":"RECOVERED TRANSMISSION"}</span>
  <h2 className="t-title">COUNTERSTRIKE — THE FALSE RELAY</h2>
  {archive?<><p>{summary.lastResult ? "Last recorded attempt ended in "+(summary.lastResult.victory?"victory":"defeat")+".":""}</p><p>{recorded?"Relay secured in "+recorded.rounds+" rounds. First clear recorded.":"No first clear recorded."}</p>
   <p>{summary.intelConsumedByRunId?summary.lastResult?.intelStatus==="APPLIED"?"RECON Intel was applied in this operation.":"RECON Intel was used in an earlier accepted run.":"RECON Intel has no recorded consumption."}</p></>:
   <p>{summary.activeRunId?"Resume with the squad and Intel conditions frozen at deployment.":COUNTERSTRIKE_MISSION.briefCopy}</p>}
  {summary.blocked?<p>Complete the accepted operation already in progress before starting COUNTERSTRIKE.</p>:null}
  {!summary.available&&!summary.activeRunId?<p>Requires the completed GHOST SIGNAL RECON chapter and server availability.</p>:null}
  <button className="t-btn t-btn-primary" disabled={summary.blocked||(!summary.available&&!summary.activeRunId)} onClick={open}>
   {summary.activeRunId?"RESUME FALSE RELAY":recorded?"REPLAY FALSE RELAY":"VIEW FALSE RELAY BRIEF"}</button>
 </section>;
}

export function CounterstrikeBrief(){
 const summary=useBattleStore(s=>s.progression?.counterstrike);
 const busy=useBattleStore(s=>s.busy),error=useBattleStore(s=>s.progressionError);
 const selected=useBattleStore(s=>s.selectedSquadIds);
 const pet=useBattleStore(s=>s.progression?.equippedPet);
 const toggle=useBattleStore(s=>s.toggleCommanderTeammate),deploy=useBattleStore(s=>s.deployCounterstrike),back=useBattleStore(s=>s.backToHub);
 const reconApplied=summary?.intelStatus==="APPLIED";
 const reconLabel=reconApplied?(summary?.activeRunId?"RECON APPLIED":"RECON READY"):
  summary?.intelStatus==="PREVIOUSLY_CONSUMED"?"RECON SPENT":"NO RECON";
 const houndRounds=reconApplied?"R4 / R6":"R3 / R5";
 return <div className="t-body t-scroll t-counterstrike-page t-counterstrike-brief" role="region" aria-label="False Relay mission brief">
  <section className="t-panel t-counterstrike-content"><CounterstrikeStoryIntro resuming={!!summary?.activeRunId}/>
   <div className="t-counterstrike-identity">
    <span className="t-kicker">THE CHAIN · RECOVERED SIGNAL</span>
    <h1 className="t-title">{COUNTERSTRIKE_MISSION.name}</h1>
    <p>Recovered SIGNAL COURIER transmission. HOUND patrols closing in. Source unknown.</p>
   </div>
   <div className="t-counterstrike-objective" aria-label="Primary mission objective">
    <div><span>PRIMARY OBJECTIVE</span><strong>CAPTURE &amp; HOLD</strong></div>
    <p>Hold the exact relay tile for <strong>5 consecutive round changes</strong>.</p>
    <span className="t-counterstrike-deadline">ROUND 12 DEADLINE</span>
   </div>
   <div className="t-counterstrike-intel-status" role="status" aria-label="Counterstrike deployment intel">
    <span>{reconLabel}</span><span>HOUND · {houndRounds}</span>
   </div>
   <div className="t-counterstrike-squad-heading"><strong>YOUR SQUAD</strong><span>{selected.length}/3 SELECTED</span></div>
   <div className="t-counterstrike-companions" role="group" aria-label="False Relay companions">{[["ally-02","CNC"],["ally-03","SHADOW"],...(pet?[["pet:"+pet.id,pet.name]]:[])].map(([id,name])=>
    <button key={id} className="t-btn" disabled={busy||!!summary?.activeRunId} aria-pressed={selected.includes(id)} onClick={()=>toggle(id)}>{name}</button>)}</div>
   {error?<p role="alert">{error}</p>:null}
   {summary?.blocked?<p role="alert">Finish the accepted operation already in progress before deploying.</p>:null}
   <div className="t-counterstrike-actions t-counterstrike-deploy-actions">
    <button className="t-btn t-btn-primary" disabled={busy||summary?.blocked||selected.length!==3} onClick={()=>void deploy()}>{busy?"ACCEPTING OPERATION…":summary?.activeRunId?"RESUME ACCEPTED RUN":"DEPLOY FALSE RELAY"}</button>
   </div>
   <details className="t-counterstrike-more-intel"><summary>TACTICAL INTEL <span>RULES &amp; APPROACH</span></summary>
    <div>
     <p>{COUNTERSTRIKE_MISSION.directive?.copy} Failure leaves the site unsecured. You can retry.</p>
     <p>Screen both eastern approaches or disrupt the patrol before moving a vulnerable teammate onto the relay. A quick patrol kill never skips the five control checkpoints.</p>
     <p>{reconApplied?"RECON timing shifts HOUND reinforcement entries from rounds 3/5 to 4/6.":"HOUND reinforcements enter on rounds 3 and 5. RECON has no delay available for this run."} Accepted runs keep their deployment Intel conditions on resume.</p>
    </div>
   </details>
   <button className="t-btn t-counterstrike-back" disabled={busy} onClick={back}>BACK TO WAR TABLE</button>
  </section>
 </div>;
}

export function CounterstrikeSignal(){
 const radio=useBattleStore(s=>s.counterstrikeRadio),key=useBattleStore(s=>s.currentRunKey);
 if(!key?.startsWith("counterstrike_v1_"))return null;
 return <><CounterstrikeStoryHoundCue radio={radio} runId={key}/><div className="t-panel" role="status" aria-label="False Relay signal" style={{margin:0,padding:"6px 12px",fontSize:11}}>
  {radio.map(line=><p key={line} style={{margin:"2px 0"}}>{line}</p>)}
 </div></>;
}

export function CounterstrikeResults(){
 const result=useBattleStore(s=>s.counterstrikeResult),summary=useBattleStore(s=>s.progression?.counterstrike);
 const open=useBattleStore(s=>s.openCounterstrikeBrief),next=useBattleStore(s=>s.openOperationBrief),back=useBattleStore(s=>s.backToHub);
 const nextMission=summary?.nextMissionId?getMissionDef(summary.nextMissionId):null;
 return <div className="t-body t-scroll t-counterstrike-page t-counterstrike-results"><section className="t-panel t-counterstrike-content" aria-label="False Relay aftermath">
  <CounterstrikeStoryAftermath result={result}/>
  <h1 className="t-title">{result?.victory?"FALSE RELAY SECURED":"FALSE RELAY UNSECURED"}</h1>
  <p>{result?"Server recorded "+(result.victory?"victory":"defeat")+" after "+result.rounds+" rounds. "+result.control+"/5 control checkpoints.":"Reconnect to reload the authoritative operation result."}</p>
  <p>{result?.intelStatus==="APPLIED"?"RECON timing delayed this run's HOUND reinforcements. Intel remains consumed.":
    result?.intelStatus==="PREVIOUSLY_CONSUMED"?"RECON Intel was already spent in an earlier run. This battle used baseline timing.":"This run used baseline timing."}</p>
  <p>{result?.firstClear?"First control of the False Relay is now recorded. The signal's source remains unresolved.":result?.victory?"Replay recorded. The original first-clear record is preserved.":"The patrol denied control. Prepare the squad and retry."}</p>
  <div className="t-counterstrike-actions">
   {nextMission&&result?.victory?<button className="t-btn t-btn-primary" onClick={()=>next(nextMission.missionId)}>NEXT AVAILABLE · {nextMission.name}</button>:null}
   <button className="t-btn" onClick={open}>{result?.victory?"REPLAY FALSE RELAY":"RETRY FALSE RELAY"}</button>
   <button className="t-btn" onClick={back}>WAR TABLE / ARCHIVE</button>
  </div>
 </section></div>;
}
