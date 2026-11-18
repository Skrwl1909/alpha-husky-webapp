import {useBattleStore} from "../store/battleStore";
import {COUNTERSTRIKE_MISSION} from "../data/counterstrike";
import {getMissionDef} from "../data/operations";

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
 return <div className="t-body t-scroll" aria-label="False Relay mission brief">
  <section className="t-panel"><span className="t-kicker">THE CHAIN · RECOVERED SIGNAL</span>
   <h1 className="t-title">{COUNTERSTRIKE_MISSION.name}</h1><p>{COUNTERSTRIKE_MISSION.briefCopy}</p>
   <h2 className="t-title">Secure the transmission</h2><p>{COUNTERSTRIKE_MISSION.directive?.copy} Failure leaves the site unsecured. You can retry.</p>
   <p>{summary?.activeRunId && summary.intelStatus==="APPLIED"?"This accepted run already has RECON Intel recorded. Its HOUND entries remain frozen at rounds 4 and 6.":summary?.intelStatus==="APPLIED"?"RECON Intel is available for the next accepted deployment. HOUND entries shift from rounds 3/5 to 4/6.":
    summary?.intelStatus==="PREVIOUSLY_CONSUMED"?"RECON Intel was consumed in an earlier accepted run. This operation uses the baseline HOUND entries at rounds 3/5.":"Baseline HOUND entries arrive in rounds 3 and 5."}</p>
   <p>Take control early and screen both eastern approaches, or disrupt the patrol before moving a vulnerable teammate onto the relay. A quick patrol kill still leaves five consecutive control checkpoints.</p>
   <div role="group" aria-label="False Relay companions">{[["ally-02","CNC"],["ally-03","SHADOW"],...(pet?[["pet:"+pet.id,pet.name]]:[])].map(([id,name])=>
    <button key={id} className="t-btn" disabled={busy||!!summary?.activeRunId} aria-pressed={selected.includes(id)} onClick={()=>toggle(id)}>{name}</button>)}</div>
   {error?<p role="alert">{error}</p>:null}
   <button className="t-btn t-btn-primary" disabled={busy||summary?.blocked||selected.length!==3} onClick={()=>void deploy()}>{busy?"ACCEPTING OPERATION…":summary?.activeRunId?"RESUME ACCEPTED RUN":"DEPLOY FALSE RELAY"}</button>
   <button className="t-btn" disabled={busy} onClick={back}>BACK TO WAR TABLE</button>
  </section>
 </div>;
}

export function CounterstrikeSignal(){
 const radio=useBattleStore(s=>s.counterstrikeRadio),key=useBattleStore(s=>s.currentRunKey);
 if(!key?.startsWith("counterstrike_v1_"))return null;
 return <div className="t-panel" role="status" aria-label="False Relay signal" style={{margin:0,padding:"6px 12px",fontSize:11}}>
  {radio.map(line=><p key={line} style={{margin:"2px 0"}}>{line}</p>)}
 </div>;
}

export function CounterstrikeResults(){
 const result=useBattleStore(s=>s.counterstrikeResult),summary=useBattleStore(s=>s.progression?.counterstrike);
 const open=useBattleStore(s=>s.openCounterstrikeBrief),next=useBattleStore(s=>s.openOperationBrief),back=useBattleStore(s=>s.backToHub);
 const nextMission=summary?.nextMissionId?getMissionDef(summary.nextMissionId):null;
 return <div className="t-body t-scroll"><section className="t-panel" aria-label="False Relay aftermath">
  <h1 className="t-title">{result?.victory?"FALSE RELAY SECURED":"FALSE RELAY UNSECURED"}</h1>
  <p>{result?"Server recorded "+(result.victory?"victory":"defeat")+" after "+result.rounds+" rounds. "+result.control+"/5 control checkpoints.":"Reconnect to reload the authoritative operation result."}</p>
  <p>{result?.intelStatus==="APPLIED"?"RECON timing delayed this run's HOUND reinforcements. Intel remains consumed.":
    result?.intelStatus==="PREVIOUSLY_CONSUMED"?"RECON Intel was already spent in an earlier run. This battle used baseline timing.":"This run used baseline timing."}</p>
  <p>{result?.firstClear?"First control of the False Relay is now recorded. The signal's source remains unresolved.":result?.victory?"Replay recorded. The original first-clear record is preserved.":"The patrol denied control. Prepare the squad and retry."}</p>
  {nextMission&&result?.victory?<button className="t-btn t-btn-primary" onClick={()=>next(nextMission.missionId)}>NEXT AVAILABLE · {nextMission.name}</button>:null}
  <button className="t-btn" onClick={open}>{result?.victory?"REPLAY FALSE RELAY":"RETRY FALSE RELAY"}</button>
  <button className="t-btn" onClick={back}>WAR TABLE / ARCHIVE</button>
 </section></div>;
}
