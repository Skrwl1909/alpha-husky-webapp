import { useEffect, useState } from "react";
import type { LastHowlScore, LastHowlView } from "../combat/lastHowlAuthority";
import { getHost } from "../host/bridge";
import { useBattleStore } from "../store/battleStore";
import { buildIdentity } from "./skillEffectView";

function PersonalBest({ best }: { best: LastHowlScore | null }) {
  return <p>PERSONAL BEST {best ? `· ${best.completedWaves} WAVES · ${best.kills} KILLS` : "· —"}</p>;
}

export function LastHowlCard() {
  const summary = useBattleStore(s => s.progression?.lastHowl);
  const open = useBattleStore(s => s.openLastHowl);
  const busy = useBattleStore(s => s.busy || s.progressionStatus === "loading");
  if (!summary) return null;
  return <section className="t-panel t-last-howl-card" aria-label="Last Howl">
    <div><h2>LAST HOWL · ENDLESS</h2><p>Survive. Beat your record.</p><PersonalBest best={summary.best} /></div>
    <div className="t-last-howl-actions">
      <button type="button" className="t-btn t-btn-primary" disabled={busy}
        onClick={() => void open(summary.status === "ACTIVE" ? "state" : "start", summary.runId)}>
        {summary.status === "ACTIVE" ? "RESUME" : "DEPLOY"}
      </button>
      {summary.runId && summary.status !== "ACTIVE" ? <button type="button" className="t-btn" disabled={busy}
        onClick={() => void open("state", summary.runId)}>LAST RESULT</button> : null}
    </div>
  </section>;
}

export function LastHowlHud({ view }: { view: LastHowlView }) {
  const battle = useBattleStore(s => s.battle);
  const busy = useBattleStore(s => s.busy);
  const error = useBattleStore(s => s.progressionError);
  const abandon = useBattleStore(s => s.abandonLastHowl);
  const leave = useBattleStore(s => s.backToHub);
  const [confirm, setConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const eliteSignal = view.eliteEntries.length > 0;
  useEffect(() => {
    setAnnouncement(`WAVE ${view.wave}${eliteSignal ? " · ELITE SIGNAL DETECTED" : ""}`);
    const timer = window.setTimeout(() => setAnnouncement(""), 1800);
    return () => window.clearTimeout(timer);
  }, [view.wave, eliteSignal]);
  const squad = battle.units.filter(u => u.team === "ally");
  const standing = squad.filter(u => !u.defeated).length;
  const pet = squad.find(unit => unit.defId.startsWith("pet:") && (unit.recoverRange ?? 1) > 1);
  return <div className="t-hud-card t-last-howl-hud" data-wave={view.wave}>
    <div className="t-last-howl-stats"><b>WAVE {view.wave}</b><b>KILLS {view.kills}</b><span>SQUAD {standing}/{squad.length}</span></div>
    {pet && view.wave === 1 ? <small>PET · {buildIdentity(pet, undefined, false)}</small> : null}
    <div className="t-last-howl-controls">
      <small>{eliteSignal ? "ELITE SIGNAL DETECTED" : `NEXT ELITE ${view.nextElite}`}</small>
      <button type="button" className="t-btn" onClick={leave}>EXIT</button>
      <button type="button" className="t-btn" disabled={busy} onClick={() => setConfirm(!confirm)}>{confirm ? "CANCEL" : "ABANDON RUN"}</button>
    </div>
    {confirm ? <div className="t-last-howl-confirm"><span>End this run without a record?</span>
      <button type="button" className="t-btn" disabled={busy} onClick={() => { setConfirm(false); void abandon(); }}>CONFIRM ABANDON</button>
    </div> : null}
    <span className="t-last-howl-sr" role="status">{announcement}</span>
    {error ? <small role="alert">{error}</small> : null}
  </div>;
}

export function LastHowlResults({ view }: { view: LastHowlView }) {
  const open = useBattleStore(s => s.openLastHowl);
  const busy = useBattleStore(s => s.busy);
  const error = useBattleStore(s => s.progressionError);
  const leave = useBattleStore(s => s.backToHub);
  const forge = getHost().openForge;
  return <div className="t-fill t-last-howl-results"><section className="t-panel">
    <h1>LAST HOWL</h1>
    <p>{view.status === "ABANDONED" ? "RUN ABANDONED" : "SQUAD DOWN"}</p>
    <dl>
      <div><dt>WAVES CLEARED</dt><dd>{view.completedWaves}</dd></div>
      <div><dt>KILLS</dt><dd>{view.kills}</dd></div>
      <div><dt>ELITES</dt><dd>{view.eliteKills}</dd></div>
    </dl>
    {view.newRecord ? <strong>NEW RECORD</strong> : null}
    <PersonalBest best={view.best} />
    <p>No rewards for Last Howl runs.</p>
    {error ? <p role="alert">{error}</p> : null}
    <div className="t-last-howl-actions">
      <button type="button" className="t-btn t-btn-primary" disabled={busy} onClick={() => void open("start", view.runId)}>TRY AGAIN</button>
      <button type="button" className="t-btn" disabled={!forge} onClick={forge}>UPGRADE IN FORGE</button>
      <button type="button" className="t-btn" onClick={leave}>WAR TABLE</button>
    </div>
  </section></div>;
}
