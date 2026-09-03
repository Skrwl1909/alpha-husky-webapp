import { useEffect } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useBattleStore } from "../store/battleStore";
import { loadMuted, setMuted, unlockAudio } from "../audio";
import { OPERATION } from "../data/units";
import { SKILLS } from "../data/skills";
import { BattleScreen } from "./Battle";
import type { UnitDef } from "../combat/types";
import {
  alliedBriefDefs,
  enemyBriefRows,
  resolveCurrentEncounter,
} from "../data/onboarding";
import { BROKEN_SIGNAL, getMissionDef, recoverSpawnsForSquad } from "../data/operations";

const ROLE_LABEL: Record<string, string> = {
  alpha: "Melee pressure",
  skirmisher: "Skirmisher",
  ranged: "Skirmisher",
  support: "Support",
  hostile: "Melee",
  leader: "Heavy",
};

function briefSubtitle(def: UnitDef, extra?: string): string {
  const skills = def.skillIds.map((id) => SKILLS[id]?.name).filter(Boolean).join(" / ");
  const role = ROLE_LABEL[def.role] || def.role;
  const tail = extra || `MOVE ${def.move}`;
  return `${role} · ${skills} · ${tail}`;
}

function Background({ dim = 0.55 }: { dim?: number }) {
  return (
    <div className="t-bg" aria-hidden="true">
      <img src="/images/tactical_ops/battlefield.jpg" alt="" />
      <div className="t-vignette" style={{ background: `rgb(10 12 16 / ${dim})` }} />
    </div>
  );
}

function Hub() {
  const openBrief = useBattleStore((s) => s.openBrief);
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const foundationCompleted = useBattleStore((s) => s.foundationCompleted);
  const progressionStatus = useBattleStore((s) => s.progressionStatus);
  const progressionError = useBattleStore((s) => s.progressionError);
  const encounter = resolveCurrentEncounter(onboardingEnabled, onboardingStageId);
  const name = foundationCompleted ? "Foundation complete" : onboardingEnabled ? encounter.operationName : OPERATION.name;
  const objective = foundationCompleted
    ? "Broken Signal training sequence completed."
    : onboardingEnabled
      ? encounter.objective
      : progressionStatus === "error"
        ? "Foundation progression could not be loaded. Reopen Tactical Ops to retry."
        : OPERATION.objective;
  return (
    <div className="t-fill">
      <Background dim={0.35} />
      <div className="t-vignette" />
      <div className="t-hub">
        <div className="t-hub-copy">
          <div className="t-kicker">Alpha Husky</div>
          <h1 className="t-title">Tactical Ops</h1>
          <h2>Combat Core</h2>
          <div className="t-panel t-op-card">
            <span className="t-kicker">Operation</span>
            <strong>{name}</strong>
            <p>{objective}</p>
          </div>
          {progressionError ? <p style={{ color: "var(--t-enemy)", margin: "0.8rem 0 0" }}>{progressionError}</p> : null}
          <div className="t-brief-actions">
            <button type="button" className="t-btn t-btn-primary" onClick={openBrief} disabled={foundationCompleted || progressionStatus === "error"}>
              {foundationCompleted ? "Foundation complete" : "Mission Brief"}
              <ChevronRight className="t-ico" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarTable() {
  const progression = useBattleStore((s) => s.progression);
  const openOperationBrief = useBattleStore((s) => s.openOperationBrief);
  const progressionError = useBattleStore((s) => s.progressionError);
  const missionFirstClear = useBattleStore((s) => s.missionFirstClear);
  const operation = progression?.operations?.[BROKEN_SIGNAL.operationId];
  const firstClearMessage = operation?.missions["broken-signal-recover"] === "cleared"
    ? "RECOVER SIGNAL CLEARED · SIGNAL COMMANDER is a future lead."
    : "BREACH CLEARED · RECOVER SIGNAL UNLOCKED";
  return (
    <div className="t-fill">
      <Background dim={0.4} />
      <div className="t-vignette" />
      <div className="t-brief" style={{ maxWidth: "58rem" }}>
        <div className="t-kicker">War Table</div>
        <h1 className="t-title" style={{ margin: "0.2rem 0" }}>OPERATION 01 — {BROKEN_SIGNAL.name}</h1>
        <p style={{ color: "var(--t-muted)", margin: "0 0 1rem" }}>Choose the next tactical mission.</p>
        <p style={{ color: "var(--t-faint)", margin: "0 0 1rem", fontSize: "0.82rem" }}>Routing Trace: {progression?.intel?.routingTrace ? "ACQUIRED · reinforcement telegraphed" : "NOT ACQUIRED · replay BREACH to hunt the tagged carrier"}</p>
        {missionFirstClear ? <p style={{ color: "var(--t-accent)", margin: "0 0 1rem" }}>{firstClearMessage}</p> : null}
        {operation?.status === "cleared" ? <p style={{ color: "var(--t-accent)", margin: "0 0 1rem" }}>BROKEN SIGNAL · CLEARED</p> : null}
        <div className="t-brief-grid">
          {BROKEN_SIGNAL.orderedMissionIds.map((missionId, index) => {
            const mission = getMissionDef(missionId);
            if (!mission) return null;
            if (missionId === "broken-signal-commander") return null;
            const status = operation?.missions[missionId] || "locked";
            const isPlayable = mission.executable && (status === "available" || status === "cleared");
            const label = status === "locked" ? "LOCKED" : status === "cleared" ? "CLEARED" : "AVAILABLE";
            return (
              <div className="t-panel t-brief-block" key={missionId} style={{ opacity: status === "locked" ? 0.52 : 1 }}>
                <div className="t-kicker">MISSION {String(index + 1).padStart(2, "0")} · {label}</div>
                <h3 style={{ margin: "0.35rem 0" }}>{mission.name}</h3>
                <p style={{ color: "var(--t-muted)", minHeight: "2.8em", margin: "0 0 0.8rem" }}>{mission.briefCopy}</p>
                <small style={{ color: "var(--t-faint)" }}>{mission.objectiveType} · SQUAD CAP {mission.squadCap}</small>
                <div className="t-brief-actions" style={{ marginTop: "0.8rem" }}>
                  <button type="button" className="t-btn t-btn-primary" disabled={!isPlayable} onClick={() => openOperationBrief(missionId)}>
                    {status === "locked" ? "Locked" : status === "cleared" ? `Replay ${mission.name}` : "Mission Brief"}
                    {isPlayable ? <ChevronRight className="t-ico" /> : null}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {progression?.archive?.brokenSignal ? <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}><div className="t-kicker">Archive</div><strong>BROKEN SIGNAL ARCHIVED</strong></div> : null}
        {progression?.nextOperationSlot === "unassigned" ? <div className="t-panel t-brief-block" style={{ marginTop: "0.6rem", opacity: 0.7 }}><div className="t-kicker">Next Operation Slot</div><strong>EMPTY · UNASSIGNED</strong></div> : null}
        {progressionError ? <p style={{ color: "var(--t-enemy)", margin: "0.8rem 0 0" }}>{progressionError}</p> : null}
      </div>
    </div>
  );
}

function Brief() {
  const deploy = useBattleStore((s) => s.deploy);
  const backToHub = useBattleStore((s) => s.backToHub);
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const selectedMissionId = useBattleStore((s) => s.selectedMissionId);
  const selectedSquadIds = useBattleStore((s) => s.selectedSquadIds);
  const selectRecoverTeammate = useBattleStore((s) => s.selectRecoverTeammate);
  const encounter = resolveCurrentEncounter(onboardingEnabled, onboardingStageId);
  const mission = getMissionDef(selectedMissionId);
  const spawns = mission?.objectiveType === "RECOVER"
    ? recoverSpawnsForSquad(selectedSquadIds) || recoverSpawnsForSquad(["alpha", "ally-02"])!
    : mission?.spawns || encounter.spawns;
  const title = mission ? `${BROKEN_SIGNAL.name} — ${mission.name}` : onboardingEnabled ? encounter.operationName : OPERATION.name;
  const objective = mission ? mission.briefCopy : onboardingEnabled ? encounter.objective : OPERATION.objective;
  const allies = alliedBriefDefs(spawns);
  const hostiles = enemyBriefRows(spawns);
  const footnote = mission
    ? `${mission.objectiveType} · Squad cap ${mission.squadCap}. Existing Combat Core rules apply.`
    : onboardingEnabled
      ? encounter.teaching
      : "Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.";
  const primaryObjective = mission?.objectiveType === "RECOVER" ? "PRIMARY OBJECTIVE: RECOVER THE SIGNAL" : mission?.objectiveType === "BOSS" ? "PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER" : mission?.objectiveType === "ELIMINATE" ? "PRIMARY OBJECTIVE: ELIMINATE HOSTILES" : null;
  const recruitMoment = !mission && onboardingEnabled && onboardingStageId === "ally-koda" ? "KODA JOINED · ROSTER UPDATED" : !mission && onboardingEnabled && onboardingStageId === "full-broken-signal" ? "SHADOW JOINED · FULL SQUAD READY" : null;
  const missionIntel = mission?.objectiveType === "BOSS" ? "Routing Trace telegraphs the fixed reinforcement." : mission?.missionId === "broken-signal-breach" ? "TRACE target can reveal Routing Trace." : "No Intel required.";
  return (
    <div className="t-fill">
      <Background dim={0.55} />
      <div className="t-brief">
        <div className="t-kicker">Tactical Ops</div>
        <h1 className="t-title" style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", margin: "0.2rem 0 0.2rem" }}>
          {title}
        </h1>
        <p style={{ color: "var(--t-muted)", margin: 0, maxWidth: "40rem" }}>{objective}</p>
        {primaryObjective ? <p style={{ color: "var(--t-accent)", margin: "0.65rem 0 0", fontSize: "0.82rem", letterSpacing: "0.08em" }}>{primaryObjective}</p> : null}
        {mission?.objectiveType === "RECOVER" ? <p style={{ color: "var(--t-faint)", margin: "0.35rem 0 0" }}>Eliminating hostiles is not required. Reach the terminal and use RECOVER.</p> : null}
        {mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-faint)", margin: "0.35rem 0 0" }}>Defeating the BRUTE LEADER ends the mission even if HOUNDs remain.</p> : null}
        {mission ? <div className="t-mission-strip"><span>{mission.objectiveType}</span><span>SQUAD {mission.squadCap}</span><span>{missionIntel}</span></div> : null}
        {recruitMoment ? <div className="t-recruit-moment">{recruitMoment}</div> : null}
        {mission?.objectiveType === "RECOVER" ? (
          <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}>
            <div className="t-kicker">Squad selection · cap 2</div>
            <h3 style={{ margin: "0.35rem 0" }}>ALPHA + one teammate</h3>
            <p style={{ color: "var(--t-muted)", margin: "0 0 0.8rem" }}>Alpha is mandatory. Choose one unlocked companion for this run.</p>
            <div className="t-brief-actions">
              <button type="button" className={`t-btn ${selectedSquadIds[1] === "ally-02" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-02")}>ALPHA + KODA<br /><small>AGGRESSIVE · MOBILITY</small></button>
              <button type="button" className={`t-btn ${selectedSquadIds[1] === "ally-03" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-03")}>ALPHA + SHADOW<br /><small>SUPPORT · SUSTAIN</small></button>
            </div>
          </div>
        ) : null}
        <div className="t-brief-grid">
          <div className="t-panel t-brief-block">
            <h3>Allied squad</h3>
            {allies.map((def) => (
              <div className="t-unit-row" key={def.defId}>
                <img src={def.portrait} alt="" style={def.defId === "alpha" ? undefined : { objectPosition: "50% 12%" }} />
                <div>
                  <div className="t-title" style={{ fontSize: "0.95rem" }}>
                    {def.name}
                  </div>
                  <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>{briefSubtitle(def)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="t-panel t-brief-block">
            <h3>Hostile force</h3>
            {hostiles.map(({ def, count }) => (
              <div className="t-unit-row" key={def.defId}>
                <div className="t-unit-ph enemy" />
                <div>
                  <div className="t-title" style={{ fontSize: "0.95rem" }}>
                    {count > 1 ? `${def.name} × ${count}` : def.name}
                  </div>
                  <div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>
                    {briefSubtitle(def, `${def.hp} HP`)}
                  </div>
                </div>
              </div>
            ))}
            <p style={{ color: "var(--t-faint)", fontSize: "0.78rem", margin: "0.8rem 0 0", lineHeight: 1.45 }}>
              {footnote}
            </p>
          </div>
        </div>
        <div className="t-brief-actions">
          <button type="button" className="t-btn t-btn-ghost" onClick={backToHub}>
            Back
          </button>
          <button type="button" className="t-btn t-btn-primary" onClick={deploy} disabled={mission?.objectiveType === "RECOVER" && selectedSquadIds.length !== 2}>
            Deploy
            <ChevronRight className="t-ico" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Sector() {
  const dismiss = useBattleStore((s) => s.dismissSector);
  useEffect(() => {
    let id = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      if (t - t0 >= 1600) dismiss();
      else id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [dismiss]);
  return (
    <div className="t-fill">
      <Background dim={0.5} />
      <div className="t-overlay" style={{ background: "rgb(10 12 16 / 0.45)" }}>
        <div className="t-modal t-panel">
          <div className="t-kicker">Operation</div>
          <h2 className="t-title">Sector Secured</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>Hostile force eliminated.</p>
          <button type="button" className="t-btn t-btn-primary" onClick={dismiss}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function Results() {
  const results = useBattleStore((s) => s.battle.results);
  const replay = useBattleStore((s) => s.replay);
  const backToHub = useBattleStore((s) => s.backToHub);
  const continueOnboarding = useBattleStore((s) => s.continueOnboarding);
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const selectedMissionId = useBattleStore((s) => s.selectedMissionId);
  const foundationCompleted = useBattleStore((s) => s.foundationCompleted);
  const progression = useBattleStore((s) => s.progression);
  const progressionCommitPending = useBattleStore((s) => s.progressionCommitPending);
  const progressionError = useBattleStore((s) => s.progressionError);
  const routingTraceAcquired = useBattleStore((s) => s.battle.routingTraceAcquired);
  const encounter = resolveCurrentEncounter(onboardingEnabled, onboardingStageId);
  const mission = getMissionDef(selectedMissionId);
  if (!results) return null;
  const operationVictory = foundationCompleted && Boolean(mission) && results.victory;
  const sessionVictory = (onboardingEnabled && !foundationCompleted && results.victory) || operationVictory;
  const hasNext = sessionVictory && encounter.next != null;
  const isFirstClear = operationVictory && progression?.operations?.[BROKEN_SIGNAL.operationId]?.missions[mission?.missionId || ""] === "available";
  return (
    <div className="t-fill">
      <Background dim={0.6} />
      <div className="t-overlay">
        <div className="t-modal t-panel">
          <div className="t-kicker">{operationVictory && mission ? mission.name : sessionVictory ? encounter.operationName : "Broken Signal"}</div>
          <h2 className="t-title">{operationVictory ? mission?.objectiveType === "BOSS" ? "SIGNAL COMMANDER DEFEATED" : mission?.objectiveType === "RECOVER" ? "OBJECTIVE COMPLETE" : isFirstClear ? "BREACH CLEARED" : "BREACH REPLAY COMPLETE" : sessionVictory ? encounter.resultsTitle : "Operation Complete"}</h2>
          {sessionVictory ? (
            <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{operationVictory ? mission?.objectiveType === "RECOVER" ? isFirstClear ? "SIGNAL COMMANDER is a future lead." : "SIGNAL RECOVERED." : mission?.objectiveType === "ELIMINATE" ? isFirstClear ? "Continue to confirm the clear and unlock RECOVER SIGNAL." : null : null : encounter.resultsNote}</p>
          ) : null}
          {operationVictory && mission?.missionId === "broken-signal-breach" ? <p style={{ color: routingTraceAcquired || progression?.intel?.routingTrace ? "var(--t-accent)" : "var(--t-faint)", margin: "0 0 0.8rem" }}>ROUTING TRACE — {routingTraceAcquired || progression?.intel?.routingTrace ? "ACQUIRED" : "MISSED"}</p> : null}
          {operationVictory && mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-accent)", margin: "0 0 0.8rem" }}>BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED ON CONTINUE · NEXT SLOT AVAILABLE</p> : null}
          <dl className="t-stats">
            <div>
              <dt>Turns taken</dt>
              <dd>{String(results.turns).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Hostiles eliminated</dt>
              <dd>{results.hostilesEliminated}</dd>
            </div>
            <div>
              <dt>Squad standing</dt>
              <dd>{results.squadStanding} / {results.squadDeployed}</dd>
            </div>
            <div>
              <dt>Damage taken</dt>
              <dd>{results.damageTaken}</dd>
            </div>
          </dl>
          <div className="t-brief-actions" style={{ justifyContent: "center" }}>
            {sessionVictory ? (
              <>
                <button type="button" className="t-btn t-btn-primary" onClick={continueOnboarding} disabled={progressionCommitPending}>
                  {progressionCommitPending ? "Saving…" : operationVictory || hasNext ? "Continue" : "Return to Tactical Ops"}
                  {operationVictory || hasNext ? <ChevronRight className="t-ico" /> : null}
                </button>
                <button type="button" className="t-btn" onClick={replay}>
                  {operationVictory ? "REPLAY" : "Replay this drill"}
                </button>
              </>
            ) : (
              <>
                <button type="button" className="t-btn t-btn-primary" onClick={replay}>
                  Replay operation
                </button>
                <button type="button" className="t-btn" onClick={backToHub}>
                  Return to Tactical Ops
                </button>
              </>
            )}
          </div>
          {progressionError ? <p style={{ color: "var(--t-enemy)", margin: "0.8rem 0 0" }}>{progressionError}</p> : null}
        </div>
      </div>
    </div>
  );
}

function Defeat() {
  const replay = useBattleStore((s) => s.replay);
  const backToHub = useBattleStore((s) => s.backToHub);
  return (
    <div className="t-fill">
      <Background dim={0.7} />
      <div className="t-overlay">
        <div className="t-modal t-panel">
          <div className="t-kicker" style={{ color: "var(--t-enemy)" }}>
            Broken Signal
          </div>
          <h2 className="t-title">Operation Failed</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>All allied units are down.</p>
          <div className="t-brief-actions" style={{ justifyContent: "center" }}>
            <button type="button" className="t-btn t-btn-primary" onClick={replay}>
              <RotateCcw className="t-ico" /> Retry
            </button>
            <button type="button" className="t-btn" onClick={backToHub}>
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TacticalApp() {
  const screen = useBattleStore((s) => s.screen);
  const selectSkill = useBattleStore((s) => s.selectSkill);
  const skipTurn = useBattleStore((s) => s.skipTurn);
  const muted = useBattleStore((s) => s.muted);

  useEffect(() => {
    if (loadMuted()) {
      useBattleStore.setState({ muted: true });
      setMuted(true);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useBattleStore.getState();
      const actor = st.battle.units.find((u) => u.id === st.battle.activeId);
      if (e.key === "1" && actor) selectSkill(actor.skillIds[0]);
      if (e.key === "2" && actor) selectSkill(actor.skillIds[1]);
      if (e.key === "3" && actor) selectSkill(actor.skillIds[2]);
      if (e.key === "s" || e.key === "S") skipTurn();
    };
    window.addEventListener("keydown", onKey);
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", unlock);
    };
  }, [selectSkill, skipTurn]);

  useEffect(() => {
    setMuted(muted);
  }, [muted]);

  return (
    <div className="t-shell">
      {screen === "hub" ? <Hub /> : null}
      {screen === "war-table" ? <WarTable /> : null}
      {screen === "brief" ? <Brief /> : null}
      {screen === "battle" ? <BattleScreen /> : null}
      {screen === "sector" ? <Sector /> : null}
      {screen === "results" ? <Results /> : null}
      {screen === "defeat" ? <Defeat /> : null}
    </div>
  );
}
