import { DEPLOYMENT_APPROACHES, pressureLabel, pressureEffect, rotationTime, type FieldResult } from "../data/fieldOps";
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
import { missionBattleRules, missionSpawnsForSquad, BROKEN_SIGNAL, getMissionDef, recoverSpawnsForSquad, commanderSpawnsForSquad, BROKEN_SIGNAL_COMMANDER_SPAWNS } from "../data/operations";
import { withTeammateSidegrades } from "../data/shadowSidegrade";
import { PackMasteryPanel, MasteryFeedback } from "./PackMastery";

const PRESENTATION = {
  startHero: "/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png",
  operationPlate: "/images/tactical_ops/presentation/tactical_ops_broken_signal_operation_plate.png",
  resultsPlate: "/images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png",
} as const;

const ROLE_LABEL: Record<string, string> = {
  alpha: "Melee pressure",
  skirmisher: "Skirmisher",
  ranged: "Skirmisher",
  support: "Support",
  companion: "Mobile control",
  hostile: "Melee",
  leader: "Heavy",
};

function briefSubtitle(def: UnitDef, extra?: string): string {
  const skills = def.skillIds.map((id) => SKILLS[id]?.name).filter(Boolean).join(" / ");
  const role = def.defId === "ally-02" ? "BUG HUNTER WARDEN · Spear skirmisher" : ROLE_LABEL[def.role] || def.role;
  const tail = extra || `MOVE ${def.move}`;
  return `${role} · ${skills} · ${tail}`;
}

function Background({ dim = 0.55, art = "/images/tactical_ops/battlefield.jpg", className = "" }: { dim?: number; art?: string; className?: string }) {
  return (
    <div className={`t-bg ${className}`} aria-hidden="true">
      <img src={art} alt="" />
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
      <Background dim={0.35} art={PRESENTATION.startHero} className="t-bg-hero" />
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

function FieldResultFeedback({ result }: { result: FieldResult }) {
  return <div className="t-panel t-brief-block t-field-feedback" aria-label="Recorded Field Op result">
    <MasteryFeedback changes={result.masteryChanges} victory={result.victory} />
    <div className="t-kicker">RECORDED / {getMissionDef(result.missionId)?.name || "FIELD OP"} / {result.victory ? "CLEARED" : "FAILED"}</div>
    <p><strong>WHAT PROGRESSED</strong><br />Tactical Rank {result.rankBefore} to {result.rankAfter}. +{result.progressEarned} commander progress ({result.progressAfter} total).</p>
    <p>Optional challenge: {result.legacyReport ? "not measured on this legacy run" : result.challengeSuccess ? `MET / +${result.challengeBonus} bonus${result.challengeBonus ? "" : " (already earned this cycle)"}` : "NOT MET"}.</p>
    <p><strong>WHAT CHANGED</strong><br />{result.regionalApplied ? `Signal pressure: ${pressureLabel(result.pressureBefore)} (${result.pressureBefore}) to ${pressureLabel(result.pressureAfter)} (${result.pressureAfter}). ${pressureEffect(result.pressureAfter)}` : "This attempt began in an earlier rotation. Commander progress was recorded; the new cycle's pressure is unchanged."}</p>
    <p><strong>NOW AVAILABLE</strong><br />{result.unlockedApproaches.includes("south") ? "TACTICAL RANK 2 / SOUTH APPROACH UNLOCKED. Choose your deployment route in the Brief." : result.rankAfter >= 2 ? "Standard or South Approach for active Field Ops." : `Three active Field Ops. Earn ${Math.max(0, 6 - result.progressAfter)} more commander progress to unlock South Approach at Tactical Rank 2.`}</p>
  </div>;
}

function WarTable() {
  const progression = useBattleStore((s) => s.progression);
  const openOperationBrief = useBattleStore((s) => s.openOperationBrief);
  const progressionError = useBattleStore((s) => s.progressionError);
  const missionFirstClear = useBattleStore((s) => s.missionFirstClear);
  const operation = progression?.operations?.[BROKEN_SIGNAL.operationId];
  const field = progression?.fieldOps;
  const refresh = useBattleStore((s) => s.loadFoundationProgression);
  const loading = useBattleStore((s) => s.progressionStatus === "loading");
  useEffect(() => {
    if (!field?.board) return;
    const refreshVisible = () => { if (document.visibilityState === "visible" && useBattleStore.getState().progressionStatus !== "loading") void refresh(); };
    const timer = window.setTimeout(refreshVisible, Math.max(1000, field.board.nextRotationAt * 1000 - Date.now() + 250));
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("focus", refreshVisible);
    return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", refreshVisible); window.removeEventListener("focus", refreshVisible); };
  }, [field?.board?.nextRotationAt, refresh]);
  const firstClearMessage = operation?.status === "cleared"
    ? "OPERATION 01 — BROKEN SIGNAL CLEARED · ARCHIVE ENTRY RECORDED · NEXT OPERATION SLOT OPENED"
    : operation?.missions["broken-signal-recover"] === "cleared"
    ? "RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE"
    : "BREACH CLEARED · RECOVER SIGNAL UNLOCKED";
  return (
    <div className="t-fill">
      <Background dim={0.4} />
      <div className="t-vignette" />
      <div className="t-brief" style={{ maxWidth: "58rem" }}>
        <div className="t-kicker">War Table</div>
        <h1 className="t-title" style={{ margin: "0.2rem 0" }}>OPERATION 01 — {BROKEN_SIGNAL.name}</h1>
        <p style={{ color: "var(--t-muted)", margin: "0 0 1rem" }}>{operation?.status === "cleared" ? "Operation complete. Replay a mission or review the Archive entry below." : "Choose the next tactical mission."}</p>
        <p style={{ color: "var(--t-faint)", margin: "0 0 1rem", fontSize: "0.82rem" }}>Routing Trace: {progression?.intel?.routingTrace ? "ACQUIRED · reinforcement telegraphed" : "NOT ACQUIRED · replay BREACH to hunt the tagged carrier"}</p>
        {missionFirstClear ? <p style={{ color: "var(--t-accent)", margin: "0 0 1rem" }}>{firstClearMessage}</p> : null}
        {operation?.status === "cleared" ? <p style={{ color: "var(--t-accent)", margin: "0 0 1rem" }}>BROKEN SIGNAL · CLEARED</p> : null}
        <div className="t-brief-grid">
          {BROKEN_SIGNAL.orderedMissionIds.map((missionId, index) => {
            const mission = getMissionDef(missionId);
            if (!mission) return null;
            const status = operation?.missions[missionId] || "locked";
            const isPlayable = mission.executable && (status === "available" || status === "cleared");
            const nextMission = status === "available";
            const label = status === "locked" ? "LOCKED" : status === "cleared" ? "CLEARED" : "AVAILABLE";
            return (
              <div className="t-panel t-brief-block" key={missionId} style={{ opacity: status === "locked" ? 0.52 : nextMission ? 1 : 0.72 }}>
                <div className="t-kicker">MISSION {String(index + 1).padStart(2, "0")} · {label}</div>
                <h3 style={{ margin: "0.35rem 0" }}>{mission.name}</h3>
                <p style={{ color: "var(--t-muted)", minHeight: "2.8em", margin: "0 0 0.8rem" }}>{mission.briefCopy}</p>
                <small style={{ color: "var(--t-faint)" }}>{mission.objectiveType} · SQUAD CAP {mission.squadCap}</small>
                <div className="t-brief-actions" style={{ marginTop: "0.8rem" }}>
                  <button type="button" className={nextMission ? "t-btn t-btn-primary" : "t-btn"} disabled={!isPlayable} onClick={() => openOperationBrief(missionId)}>
                    {status === "locked" ? "Locked" : status === "cleared" ? "REPLAY" : mission.objectiveType === "RECOVER" ? "RECOVER" : "Mission Brief"}
                    {isPlayable ? <ChevronRight className="t-ico" /> : null}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <section aria-label="Field Ops" style={{ marginTop: "1.5rem" }}>
          <h2 className="t-title">FIELD OPS / LIVING WAR TABLE</h2>
          <PackMasteryPanel />
          <div className="t-panel t-brief-block">
            <div className="t-kicker">TACTICAL RANK {field?.commander?.rank || 1}</div>
            <p>{field?.commander?.progress || 0} commander progress{field?.commander?.rank === 2 ? " / South Approach unlocked" : " / 6 for Rank 2"}.</p>
            <p>Each clear: +2 progress. Optional challenge: +1 on its first success per mission per cycle. Rank 2 unlocks a deployment choice, with no stat increase.</p>
            <p><strong>BROKEN SIGNAL AREA / SIGNAL PRESSURE: {field?.region?.label || "UNAVAILABLE"}</strong><br />{field?.region ? pressureEffect(field.region.pressure) : "Refresh to load regional conditions."}</p>
            <p>Temporary state for your Tactical Ops board. A clear lowers pressure by 1; a failed mission raises it by 1 (0-3). Pressure resets to HIGH at each rotation. Canon history is permanent.</p>
            {field?.board ? <p>3 ACTIVE / {rotationTime(field.board.nextRotationAt)} next rotation. The next three missions and fresh challenge bonuses arrive then.</p> : <p>Field Ops board unavailable. Refresh to load it.</p>}
            <button className="t-btn" type="button" disabled={loading} onClick={() => void refresh()}>{loading ? "Refreshing..." : "Refresh War Table"}</button>
          </div>
          {field?.lastResult ? <div style={{ marginTop: "0.7rem" }}><small>LAST RESULT / {rotationTime(field.lastResult.recordedAt)}</small><FieldResultFeedback result={field.lastResult} /></div> : null}
          <div className="t-brief-grid" style={{ marginTop: "0.8rem" }}>
            {(field?.board?.activeMissionIds || []).map((id) => {
              const mission = getMissionDef(id);
              if (!mission) return null;
              const record = field?.records[id];
              const bonusEarned = record?.lastChallengeCycle === field?.board?.cycleId;
              return <div className="t-panel t-brief-block" key={id}>
                <div className="t-kicker">FIELD OP / ACTIVE / {record?.clearCount || 0} CLEARS</div>
                <h3>{mission.name}</h3><p>{mission.briefCopy}</p>
                <p style={{ color: "var(--t-accent)" }}>{mission.objectiveType} / {mission.directive?.name}</p>
                <p>Signal pressure: {field?.region?.label}. {mission.directive?.reinforcement && field?.region && field.region.pressure < 2 ? "Reinforcement delayed by 1 round." : "Standard mission conditions."}</p>
                <p><strong>OPTIONAL CHALLENGE</strong><br />{mission.challenge?.label}<br /><small>{bonusEarned ? "BONUS EARNED THIS CYCLE" : "+1 commander progress available"} / {record?.challengeCount || 0} challenge clears</small></p>
                <button className="t-btn t-btn-primary" type="button" disabled={loading} onClick={() => openOperationBrief(id)}>{record?.completed ? "REPLAY FIELD OP" : "Mission Brief"}<ChevronRight className="t-ico" /></button>
              </div>;
            })}
          </div>
          {field?.activeMissionRun && !field.board?.activeMissionIds.includes(field.activeMissionRun.missionId) ? <div className="t-panel t-brief-block"><p>Unfinished attempt from the previous rotation. Its original conditions are preserved.</p><button type="button" className="t-btn" onClick={() => openOperationBrief(field.activeMissionRun!.missionId)}>Resume {getMissionDef(field.activeMissionRun.missionId)?.name}</button></div> : null}
        </section>
        {progression?.archive?.brokenSignal ? <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}><div className="t-kicker">Archive · Available</div><strong>BROKEN SIGNAL ARCHIVED</strong><p style={{ color: "var(--t-muted)", margin: "0.5rem 0 0" }}>BREACH CLEARED · SIGNAL RECOVERED · SIGNAL COMMANDER DOWN</p></div> : null}
        {progression?.nextOperationSlot === "unassigned" ? <div className="t-panel t-brief-block" style={{ marginTop: "0.6rem", opacity: 0.7 }}><div className="t-kicker">Next Operation Slot · Available</div><strong>EMPTY · UNASSIGNED</strong><p style={{ color: "var(--t-muted)", margin: "0.5rem 0 0" }}>No Operation assigned.</p></div> : null}
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
  const selectedApproach = useBattleStore((s) => s.selectedApproach);
  const selectApproach = useBattleStore((s) => s.selectApproach);
  const field = useBattleStore((s) => s.progression?.fieldOps);
  const packMastery = useBattleStore((s) => s.progression?.packMastery);
  const selectRecoverTeammate = useBattleStore((s) => s.selectRecoverTeammate);
  const toggleCommanderTeammate = useBattleStore((s) => s.toggleCommanderTeammate);
  const equippedPet = useBattleStore((s) => s.progression?.equippedPet);
  const kodaSidegrade = useBattleStore((s) => s.progression?.kodaSidegrade);
  const sidegradesUnlocked = useBattleStore((s) => s.progression?.operations?.["broken-signal"]?.status === "cleared");
  const kodaSavePending = useBattleStore((s) => s.kodaSavePending);
  const selectKodaSidegrade = useBattleStore((s) => s.selectKodaSidegrade);
  const shadowSidegrade = useBattleStore((s) => s.progression?.shadowSidegrade);
  const shadowSavePending = useBattleStore((s) => s.shadowSavePending);
  const selectShadowSidegrade = useBattleStore((s) => s.selectShadowSidegrade);
  const progressionError = useBattleStore((s) => s.progressionError);
  const busy = useBattleStore((s) => s.busy);
  const encounter = resolveCurrentEncounter(onboardingEnabled, onboardingStageId);
  const mission = getMissionDef(selectedMissionId);
  const fieldOp = mission?.activity === "FIELD_OP";
  const twoSlots = Boolean(mission && (fieldOp || mission.objectiveType === "BOSS"));
  const baseSpawns = mission ? missionSpawnsForSquad(mission, selectedSquadIds, equippedPet, selectedApproach)
    || (fieldOp ? missionSpawnsForSquad(mission, ["alpha", "ally-02", "ally-03"], equippedPet)!
      : mission.objectiveType === "RECOVER" ? recoverSpawnsForSquad(["alpha", "ally-02"])! : BROKEN_SIGNAL_COMMANDER_SPAWNS.filter((spawn) => !["ally-02", "ally-03"].includes(spawn.defId))) : encounter.spawns;
  const savedRun = field?.activeMissionRun;
  const resuming = savedRun?.missionId === selectedMissionId && savedRun.squadIds.join(",") === selectedSquadIds.join(",") && (savedRun.fieldContext?.approach || "standard") === selectedApproach;
  const spawns = mission ? withTeammateSidegrades(baseSpawns, { kodaSidegrade, shadowSidegrade, packMastery: resuming ? savedRun?.packMastery || {} : packMastery }) : baseSpawns;
  const fieldContext = resuming && savedRun?.fieldContext ? savedRun.fieldContext : { pressure: field?.region?.pressure ?? 2 };
  const reinforcementRound = mission && fieldOp ? missionBattleRules(mission, false, fieldContext).reinforcement?.triggerRound : undefined;
  const title = mission ? `${fieldOp ? "FIELD OP" : BROKEN_SIGNAL.name} — ${mission.name}` : onboardingEnabled ? encounter.operationName : OPERATION.name;
  const objective = mission ? mission.briefCopy : onboardingEnabled ? encounter.objective : OPERATION.objective;
  const allies = alliedBriefDefs(spawns);
  const hostiles = enemyBriefRows(spawns);
  const footnote = mission
    ? `${mission.objectiveType} · Squad cap ${mission.squadCap}. Existing Combat Core rules apply.`
    : onboardingEnabled
      ? encounter.teaching
      : "Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.";
  const primaryObjective = fieldOp ? `PRIMARY OBJECTIVE: ${mission.objectiveType}` : mission?.objectiveType === "RECOVER" ? "PRIMARY OBJECTIVE: RECOVER THE SIGNAL" : mission?.objectiveType === "BOSS" ? "PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER" : mission?.objectiveType === "ELIMINATE" ? "PRIMARY OBJECTIVE: ELIMINATE HOSTILES" : null;
  const recruitMoment = !mission && onboardingEnabled && onboardingStageId === "ally-koda" ? "CNC JOINED · ROSTER UPDATED" : !mission && onboardingEnabled && onboardingStageId === "full-broken-signal" ? "SHADOW JOINED · FULL SQUAD READY" : null;
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
        {mission && !fieldOp ? <div className="t-operation-plate" aria-hidden="true"><img src={PRESENTATION.operationPlate} alt="" /></div> : null}
        {primaryObjective ? <p style={{ color: "var(--t-accent)", margin: "0.65rem 0 0", fontSize: "0.82rem", letterSpacing: "0.08em" }}>{primaryObjective}</p> : null}
        {mission?.objectiveType === "RECOVER" ? <p style={{ color: "var(--t-faint)", margin: "0.35rem 0 0" }}>Eliminating hostiles is not required. Reach the terminal and use RECOVER.</p> : null}
        {mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-faint)", margin: "0.35rem 0 0" }}>Defeating the BRUTE LEADER ends the mission even if HOUNDs remain.</p> : null}
        {mission ? <div className="t-mission-strip"><span>{mission.objectiveType}</span><span>SQUAD {mission.squadCap}</span><span>{missionIntel}</span></div> : null}
        {mission?.directive ? <div className="t-panel t-brief-block" style={{ marginTop: "0.8rem" }}><div className="t-kicker">DIRECTIVE / {mission.directive.name}</div><p>{mission.directive.copy}</p><p style={{ color: "var(--t-muted)" }}>{mission.squadHint}</p></div> : null}
        {fieldOp ? <div className="t-panel t-brief-block" style={{ marginTop: "0.8rem" }}>
          <div className="t-kicker">REGIONAL CONDITION / SIGNAL PRESSURE {pressureLabel(fieldContext.pressure)}</div>
          <p>{pressureEffect(fieldContext.pressure)}{reinforcementRound ? ` This attempt: HOUND arrival in round ${reinforcementRound}.` : " This mission has no scheduled reinforcement."}</p>
          {resuming ? <p>Resuming the saved attempt. Its deployment and pressure remain fixed. Changing squad or approach starts a new attempt if this Field Op is still active.</p> : null}
          <p><strong>OPTIONAL CHALLENGE</strong><br />{mission.challenge?.label}. Clear reward: +2 commander progress. Challenge bonus: +1 once per mission per cycle. The challenge is optional; missing it does not fail the mission.</p>
          <div className="t-kicker">DEPLOYMENT APPROACH / TACTICAL RANK {field?.commander?.rank || 1}</div>
          <div className="t-brief-actions">{(["standard", "south"] as const).map((approach) => <button type="button" key={approach} className={`t-btn ${selectedApproach === approach ? "t-btn-primary" : ""}`} aria-pressed={selectedApproach === approach} disabled={busy || !field?.commander?.unlockedApproaches.includes(approach)} onClick={() => selectApproach(approach)}>{DEPLOYMENT_APPROACHES[approach].name}{approach === "south" && !field?.commander?.unlockedApproaches.includes("south") ? " / RANK 2" : ""}</button>)}</div>
          <p>{DEPLOYMENT_APPROACHES[selectedApproach].copy}</p>
        </div> : null}
        {recruitMoment ? <div className="t-recruit-moment">{recruitMoment}</div> : null}
        {mission ? <PackMasteryPanel snapshot={resuming ? savedRun?.packMastery : undefined} /> : null}
        {twoSlots ? (
          <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}>
            <div className="t-kicker">ALPHA + TWO TACTICAL SLOTS · {selectedSquadIds.length - 1}/2 selected</div>
            <p style={{ color: "var(--t-muted)", margin: "0.5rem 0" }}>Choose exactly two companions. Deselect one to change the composition.</p>
            <div className="t-brief-actions">
              {[
                { id: "ally-02", label: "CNC", role: "PRESSURE / DISRUPTION", available: true },
                { id: "ally-03", label: "SHADOW", role: "SUSTAIN / PROTECTION", available: true },
                { id: equippedPet ? `pet:${equippedPet.id}` : "pet:unavailable", label: equippedPet ? `PET · ${equippedPet.name}` : "PET", role: equippedPet ? "MOBILITY / CONTROL" : "NO VALID PET EQUIPPED", available: Boolean(equippedPet) },
              ].map((candidate) => {
                const selected = selectedSquadIds.includes(candidate.id);
                return <button key={candidate.id} type="button" aria-pressed={selected} disabled={busy || kodaSavePending || shadowSavePending || !candidate.available || (!selected && selectedSquadIds.length >= 3)} className={`t-btn ${selected ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => toggleCommanderTeammate(candidate.id)}>{candidate.label}<br /><small>{candidate.role}</small></button>;
              })}
            </div>
          </div>
        ) : null}
        {mission?.objectiveType === "RECOVER" && !fieldOp ? (
          <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}>
            <div className="t-kicker">Squad selection · cap 2</div>
            <h3 style={{ margin: "0.35rem 0" }}>ALPHA + one teammate</h3>
            <p style={{ color: "var(--t-muted)", margin: "0 0 0.8rem" }}>Alpha is mandatory. Choose CNC for pressure, SHADOW for sustain, or your equipped PET for mobility and control.</p>
            <div className="t-brief-actions">
              <button type="button" disabled={busy} className={`t-btn ${selectedSquadIds[1] === "ally-02" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-02")}>ALPHA + CNC<br /><small>OFFENSE · PRESSURE</small></button>
              <button type="button" disabled={busy} className={`t-btn ${selectedSquadIds[1] === "ally-03" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-03")}>ALPHA + SHADOW<br /><small>SUPPORT · SUSTAIN</small></button>
              <button type="button" disabled={busy || !equippedPet} className={`t-btn ${equippedPet && selectedSquadIds[1] === `pet:${equippedPet.id}` ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => equippedPet && selectRecoverTeammate(`pet:${equippedPet.id}`)}>ALPHA + PET{equippedPet ? ` · ${equippedPet.name}` : ""}<br /><small>{equippedPet ? "MOBILITY · CONTROL" : "UNAVAILABLE · NO VALID PET EQUIPPED"}</small></button>
            </div>
            {equippedPet && selectedSquadIds[1] === `pet:${equippedPet.id}` ? <p style={{ color: "var(--t-muted)", margin: "0.8rem 0 0" }}>MOVE 4 · BITE at melee range. HAMSTRING slows enemy initiative by 50% for 2 turns. A fast relay runner with low armor.</p> : null}
          </div>
        ) : null}
        {mission && spawns.some((spawn) => spawn.defId === "ally-02") ? (
          <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}>
            <div className="t-kicker">COLDNCURSED · BUG HUNTER WARDEN</div>
            {sidegradesUnlocked ? <>
              <p style={{ color: "var(--t-muted)", margin: "0.5rem 0" }}>Choose one playstyle for future deployments. You can change it here at any time.</p>
              <div className="t-brief-actions">
                <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "A"} className={`t-btn ${kodaSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("A")}>A · VANGUARD</button>
                <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "B"} className={`t-btn ${kodaSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("B")}>B · DISRUPTOR</button>
              </div>
              <p style={{ color: "var(--t-muted)", margin: "0.65rem 0" }}>A: MOVE 3. LUNGE requires range 1 and boosts CNC's initiative speed for 2 turns.</p>
              <p style={{ color: "var(--t-muted)", margin: "0.65rem 0" }}>B: MOVE 2. PRESSURE deals no damage; weakens and slows an enemy at range 3 for 2 turns.</p>
              <small style={{ color: "var(--t-accent)" }}>{kodaSavePending ? "Saving CNC choice…" : kodaSidegrade ? `SAVED · ${kodaSidegrade === "A" ? "VANGUARD" : "DISRUPTOR"}` : "Base CNC · no sidegrade selected"}</small>
            </> : <p style={{ color: "var(--t-muted)", margin: "0.5rem 0 0" }}>CNC sidegrades unlock after BROKEN SIGNAL is cleared.</p>}
          </div>
        ) : null}
        {mission && spawns.some((spawn) => spawn.defId === "ally-03") ? (
          <div className="t-panel t-brief-block" style={{ marginTop: "1rem" }}>
            <div className="t-kicker">SHADOW · Staff support</div>
            {sidegradesUnlocked ? <>
              <p style={{ color: "var(--t-muted)", margin: "0.5rem 0" }}>Choose one support playstyle for future deployments. You can change it here at any time.</p>
              <div className="t-brief-actions">
                <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "A"} className={`t-btn ${shadowSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("A")}>A · RESTORER</button>
                <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "B"} className={`t-btn ${shadowSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("B")}>B · WARDEN</button>
              </div>
              <p style={{ color: "var(--t-muted)", margin: "0.65rem 0" }}>A: MEND heals SHADOW and allies within 1 cell. Stay together to recover; distant allies lose access to MEND.</p>
              <p style={{ color: "var(--t-muted)", margin: "0.65rem 0" }}>B: PACK SUPPORT halves incoming damage for allies within 2 cells for 2 turns. It replaces healing and the DEF boost. MEND stays single-target.</p>
              <small style={{ color: "var(--t-accent)" }}>{shadowSavePending ? "Saving SHADOW choice…" : shadowSidegrade ? `SAVED · ${shadowSidegrade === "A" ? "RESTORER" : "WARDEN"}` : "Base SHADOW · no sidegrade selected"}</small>
            </> : <p style={{ color: "var(--t-muted)", margin: "0.5rem 0 0" }}>SHADOW sidegrades unlock after BROKEN SIGNAL is cleared.</p>}
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
                    {def.defId === "ally-02" ? "COLDNCURSED" : def.name}
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
          <button type="button" className="t-btn t-btn-primary" onClick={deploy} disabled={busy || kodaSavePending || shadowSavePending || (Boolean(mission) && !missionSpawnsForSquad(mission!, selectedSquadIds, equippedPet))}>
            Deploy
            <ChevronRight className="t-ico" />
          </button>
        </div>
        {progressionError ? <p style={{ color: "var(--t-enemy)", marginTop: "0.8rem" }}>{progressionError}</p> : null}
      </div>
    </div>
  );
}

function Sector() {
  const dismiss = useBattleStore((s) => s.dismissSector);
  const bossObjective = useBattleStore((s) => s.battle.objective?.type === "BOSS");
  const fieldOp = useBattleStore((s) => getMissionDef(s.selectedMissionId)?.activity === "FIELD_OP");
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
          <div className="t-kicker">{fieldOp ? "FIELD OP" : "Operation"}</div>
          <h2 className="t-title">{fieldOp ? "Objective Complete" : "Sector Secured"}</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp ? "Mission objective achieved. Review Results to save this clear." : bossObjective ? "BRUTE LEADER defeated. Commander signal broken." : "Hostile force eliminated."}</p>
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
  const fieldResult = useBattleStore((s) => s.fieldResult);
  const saveFieldResult = useBattleStore((s) => s.saveFieldResult);
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
  const fieldOp = mission?.activity === "FIELD_OP";
  if (!results) return null;
  const operationVictory = foundationCompleted && Boolean(mission) && results.victory;
  const sessionVictory = (onboardingEnabled && !foundationCompleted && results.victory) || operationVictory;
  const hasNext = sessionVictory && encounter.next != null;
  const isFirstClear = operationVictory && progression?.operations?.[BROKEN_SIGNAL.operationId]?.missions[mission?.missionId || ""] === "available";
  return (
    <div className="t-fill">
      <Background dim={0.6} />
      <div className="t-overlay">
        <div className="t-modal t-panel" style={{ maxHeight: "100%", overflowY: "auto" }}>
          <img className="t-results-plate" src={PRESENTATION.resultsPlate} alt="" aria-hidden="true" />
          <div className="t-kicker">{fieldOp ? `FIELD OP / ${mission.name}` : operationVictory && mission ? mission.name : sessionVictory ? encounter.operationName : "Broken Signal"}</div>
          <h2 className="t-title">{fieldOp ? results.victory ? "FIELD OP COMPLETE" : "FIELD OP FAILED" : operationVictory ? mission?.objectiveType === "BOSS" ? "SIGNAL COMMANDER DOWN" : mission?.objectiveType === "RECOVER" ? "OBJECTIVE COMPLETE" : isFirstClear ? "BREACH CLEARED" : "BREACH REPLAY COMPLETE" : sessionVictory ? encounter.resultsTitle : "Operation Complete"}</h2>
          {sessionVictory ? (
            <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp ? mission.resultsCopy : operationVictory ? mission?.objectiveType === "RECOVER" ? isFirstClear ? "Continue to unlock SIGNAL COMMANDER." : "SIGNAL RECOVERED." : mission?.objectiveType === "ELIMINATE" ? isFirstClear ? "RECOVER AVAILABLE." : null : null : encounter.resultsNote}</p>
          ) : null}
          {operationVictory && mission?.missionId === "broken-signal-breach" ? <p style={{ color: routingTraceAcquired || progression?.intel?.routingTrace ? "var(--t-accent)" : "var(--t-faint)", margin: "0 0 0.8rem" }}>ROUTING TRACE — {routingTraceAcquired || progression?.intel?.routingTrace ? "ACQUIRED" : "MISSED"}</p> : null}
          {operationVictory && mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-accent)", margin: "0 0 0.8rem" }}>{isFirstClear ? mission.resultsCopy : "BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED"}</p> : null}
          {fieldOp ? <div>
            <p><strong>OPTIONAL CHALLENGE</strong><br />{mission.challenge?.label}</p>
            {!results.victory ? <p>{mission.objectiveType === "SURVIVE" ? "A squad member fell. The full squad must survive." : "The squad was defeated."} No clear or commander progress earned.</p> : null}
            {fieldResult ? <FieldResultFeedback result={fieldResult} /> : <p role="status">{progressionCommitPending ? "Recording challenge, commander progress and regional consequence..." : "Result not recorded yet."}</p>}
          </div> : null}
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
            {fieldOp ? (
              <>
                {!fieldResult ? <button type="button" className="t-btn t-btn-primary" disabled={progressionCommitPending} onClick={() => void saveFieldResult()}>{progressionCommitPending ? "Recording..." : "Retry saving result"}</button> : <>
                  <button type="button" className="t-btn t-btn-primary" onClick={() => continueOnboarding()}>Updated War Table</button>
                  <button type="button" className="t-btn" onClick={replay}>Replay / squad choice</button>
                </>}
              </>
            ) : sessionVictory ? (
              <>
                <button type="button" className="t-btn t-btn-primary" onClick={() => continueOnboarding()} disabled={progressionCommitPending}>
                  {progressionCommitPending ? "Saving…" : fieldOp ? "Save clear / Field Ops" : operationVictory || hasNext ? "Continue" : "Return to Tactical Ops"}
                  {operationVictory || hasNext ? <ChevronRight className="t-ico" /> : null}
                </button>
                <button type="button" className="t-btn" onClick={replay} disabled={progressionCommitPending}>
                  {fieldOp ? "Save clear / Replay" : operationVictory ? "REPLAY" : "Replay this drill"}
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
  const mission = getMissionDef(useBattleStore((s) => s.selectedMissionId));
  const fieldOp = mission?.activity === "FIELD_OP";
  const replay = useBattleStore((s) => s.replay);
  const backToHub = useBattleStore((s) => s.backToHub);
  return (
    <div className="t-fill">
      <Background dim={0.7} />
      <div className="t-overlay">
        <div className="t-modal t-panel">
          <div className="t-kicker" style={{ color: "var(--t-enemy)" }}>
            {fieldOp ? `FIELD OP / ${mission.name}` : "Broken Signal"}
          </div>
          <h2 className="t-title">{fieldOp ? "FIELD OP FAILED" : "Operation Failed"}</h2>
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp && mission.objectiveType === "SURVIVE" ? "A squad member fell. All three must survive. No clear recorded." : "All allied units are down."}</p>
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
