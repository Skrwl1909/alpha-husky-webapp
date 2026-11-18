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
  const active = summary.status === "ACTIVE";
  return <section className="t-panel t-last-howl-card t-cdv2-operation" aria-label="Last Howl" data-run-status={active ? "active" : "ready"}>
    <img className="t-cdv2-operation-scene" src="/images/tactical_ops/presentation/command_deck/operations/alpha_wartable_fracture_front_v1.webp" alt="" aria-hidden="true" loading="eager" decoding="async" />
    <div className="t-cdv2-operation-content">
      <div className="t-cdv2-operation-top"><span className="t-cdv2-overline">ENDLESS PROTOCOL <i aria-hidden="true" /> {active ? "RUN ACTIVE" : "SURVIVAL OPERATION"}</span>
        <img src="/images/tactical_ops/presentation/command_deck/mission_emblems/alpha_emblem_survive_v1_256.webp" alt="" aria-hidden="true" decoding="async" />
      </div>
      <h2>LAST HOWL <span>· ENDLESS</span></h2>
      <p className="t-cdv2-operation-line">Survive the waves. Outlast your record.</p>
      <div className="t-cdv2-operation-record" aria-label="Personal best">
        <span><small>BEST WAVES</small><strong>{summary.best?.completedWaves ?? "—"}</strong></span>
        <span><small>BEST KILLS</small><strong>{summary.best?.kills ?? "—"}</strong></span>
        <span className="t-cdv2-record-badge">{active ? "IN PROGRESS" : "NO REWARD RUN"}</span>
      </div>
      <p className="t-cdv2-build-note">{active ? "Resume with the build saved at deployment." : "New deployment · uses your current saved skills."}</p>
    </div>
    <div className="t-last-howl-actions t-cdv2-operation-actions">
      <button type="button" className="t-btn t-btn-primary" disabled={busy}
        onClick={() => void open(active ? "state" : "start", summary.runId)}>
        {active ? "RESUME" : "DEPLOY"}<span aria-hidden="true">↗</span>
      </button>
      {summary.runId && !active ? <button type="button" className="t-btn" disabled={busy}
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
      <button type="button" className="t-btn" disabled={busy} aria-expanded={confirm} aria-controls="t-last-howl-abandon-confirm" onClick={() => setConfirm(!confirm)}>{confirm ? "CANCEL" : "ABANDON RUN"}</button>
    </div>
    {confirm ? <div className="t-last-howl-confirm" id="t-last-howl-abandon-confirm" role="group" aria-label="Confirm abandoning Last Howl"><span>End this run without a record?</span>
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
