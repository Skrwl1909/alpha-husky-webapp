import { DEPLOYMENT_APPROACHES, pressureLabel, pressureEffect, rotationTime, directiveSetLabel, fieldFailureCopy, type FieldResult } from "../data/fieldOps";
import { missionForContext } from "../data/operations";
import { missionDirectives } from "../data/directives";
import { useEffect, useState } from "react";
import { firstSession, type FirstResultReceipt } from "../host/firstSession";
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

import { applyIdentityToAlpha } from "../host/identity";
import { PlayerIdentityCard, portraitFallback } from "./PlayerIdentity";

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

function objectiveHeadline(mission: NonNullable<ReturnType<typeof getMissionDef>>) {
  const objective = mission.objective;
  if (objective?.type === "INTERCEPT") return "Stop the courier before the south-east exit.";
  if (objective?.type === "HOLD") return `Control the relay · ${objective.duration} consecutive round changes.`;
  if (objective?.type === "SURVIVE") return `Keep the full squad standing · ${objective.duration} rounds.`;
  if (mission.objectiveType === "RECOVER") return "Reach the relay. Use RECOVER.";
  if (mission.objectiveType === "BOSS") return "Defeat the SIGNAL COMMANDER.";
  return "Eliminate the HOUND patrol.";
}

function missionSupportCopy(mission: NonNullable<ReturnType<typeof getMissionDef>>) {
  if (mission.objectiveType === "SURVIVE") return "Your squad is ready. Deploy to earn Commander progress and rewards.";
  if (mission.objectiveType === "HOLD") return "Hold the relay under pressure and stabilize the area.";
  if (mission.objectiveType === "RECOVER") return "Move fast, reach the relay and recover the signal before the area collapses.";
  if (mission.objectiveType === "BOSS") return "End the chain. Defeat the Signal Commander and secure the operation.";
  return "Clear the route, protect your squad and keep momentum.";
}

function missionActionLabel(mission: NonNullable<ReturnType<typeof getMissionDef>>, completed: boolean) {
  if (completed) return "DEPLOY AGAIN";
  if (mission.objectiveType === "SURVIVE" || mission.objectiveType === "HOLD") return "DEPLOY";
  return "MISSION BRIEF";
}

function missionDirectiveLabel(mission: NonNullable<ReturnType<typeof getMissionDef>>) {
  return mission.directive?.name || "STANDARD CONDITIONS";
}

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
          <PlayerIdentityCard />
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

function RecordedFirstResult({ receipt }: { receipt: FirstResultReceipt }) {
  const backToHub = useBattleStore(s => s.backToHub);
  return <div className="t-fill"><Background dim={0.6} /><div className="t-overlay t-results-overlay">
    <div className={`t-modal t-panel t-results ${receipt.victory ? "is-victory" : "is-failure"}`} data-first-session-result={receipt.runId}>
      <header className="t-outcome-hero"><span className="t-kicker">ACTION / {receipt.name}</span>
        <h2 className="t-title">{receipt.victory ? "MISSION SECURED" : "MISSION LOST"}</h2></header>
      <PlayerIdentityCard />
      <dl className="t-stats"><div><dt>Turns</dt><dd>{receipt.results.turns}</dd></div>
        <div><dt>Eliminated</dt><dd>{receipt.results.hostilesEliminated}</dd></div>
        <div><dt>Squad standing</dt><dd>{receipt.results.squadStanding} / {receipt.results.squadDeployed}</dd></div></dl>
      <section aria-label="Consequence"><div className="t-kicker">CONSEQUENCE</div><p>{receipt.consequence}</p></section>
      {receipt.fieldResult ? <FieldResultFeedback result={receipt.fieldResult} /> :
        <section aria-label="Growth"><div className="t-kicker">GROWTH</div><p>{receipt.growth}</p></section>}
      <div className="t-brief-actions t-result-actions"><button type="button" className="t-btn t-btn-primary" onClick={() => {
        if (firstSession()?.acknowledge(receipt.runId)) {
          const state = useBattleStore.getState();
          if (["results", "defeat"].includes(state.screen)) backToHub();
        }
      }}>Continue</button></div>
    </div>
  </div></div>;
}

function FieldResultFeedback({ result }: { result: FieldResult }) {
  const unlock = result.advancedUnlocked ? "ADVANCED DIRECTIVES" : result.unlockedApproaches.includes("south") ? "SOUTH APPROACH" : null;
  const target = result.rankAfter < 2 ? 6 : 12;
  return <section className="t-field-feedback" aria-label="Recorded Field Op result">
    {unlock ? <div className="t-unlock"><span className="t-kicker">UNLOCKED</span><strong>{unlock}</strong></div> : null}
    <div className="t-progress-heading"><div><span className="t-kicker">COMMANDER</span><strong>RANK {result.rankBefore !== result.rankAfter ? `${result.rankBefore} → ` : ""}{result.rankAfter}</strong></div><b>+{result.progressEarned}<small>PROGRESS</small></b></div>
    <progress className="t-progress" aria-label="Commander progress" value={Math.min(result.progressAfter, target)} max={target} />
    <div className="t-progress-caption"><span>{result.progressBefore} → {result.progressAfter} TOTAL</span><span>{result.rankAfter >= 3 ? "CERTIFIED · ALL CURRENT COMMAND TOOLS OPEN" : `${Math.max(0, target - result.progressAfter)} TO RANK ${result.rankAfter + 1}`}</span></div>
    {result.victory && result.progressEarned === 0 ? <div className="t-mission-strip"><span>CLEAR SECURED · REPLAY</span><span>+0 COMMANDER</span></div> : null}
    {result.victory && result.firstCycleSecure === false && result.progressEarned > 0 ? <div className="t-mission-strip"><span>CLEAR ALREADY SECURED</span><span>CHALLENGE +{result.challengeBonus} COMMANDER</span></div> : null}
    <div className="t-mission-strip"><span>{result.legacyReport ? "CHALLENGE UNMEASURED" : result.challengeSuccess ? (result.challengeBonus ? `CHALLENGE MET · +${result.challengeBonus} COMMANDER` : "CHALLENGE ✓") : "CHALLENGE NOT MET"}</span>{result.directiveTier === "advanced" ? <span>ADVANCED · {directiveSetLabel(result.directiveSet)}{result.firstCycleAdvanced ? " · SECURED TODAY" : result.victory ? " · REPLAY" : " · FAILED"}</span> : null}</div>
    <div className="t-mission-strip t-field-rewards" aria-label="Character rewards"><span>+{result.xpGranted} EXP</span><span>+{result.bonesGranted} BONES</span></div>
    {result.challengeSuccess && !result.challengeBonus ? <small>Challenge bonus already earned this rotation.</small> : null}
    <MasteryFeedback changes={result.masteryChanges} victory={result.victory} />
    <div className="t-world-change"><span className="t-kicker">SIGNAL PRESSURE</span><strong>{result.regionalApplied ? `${pressureLabel(result.pressureBefore)} → ${pressureLabel(result.pressureAfter)}` : "CURRENT ROTATION UNCHANGED"}</strong><small>{result.regionalApplied ? result.pressureAfter < 2 ? "+1 ROUND DELAY · REINFORCEMENTS" : "REINFORCEMENTS ON SCHEDULE" : "Earlier rotation attempt. Current front and Commander certification unchanged."}</small></div>
  </section>;
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
    const refreshVisible = () => {
      if (document.visibilityState === "visible" && useBattleStore.getState().progressionStatus !== "loading") void refresh();
    };
    const timer = window.setTimeout(refreshVisible, Math.max(1000, field.board.nextRotationAt * 1000 - Date.now() + 250));
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("focus", refreshVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("focus", refreshVisible);
    };
  }, [field?.board?.nextRotationAt, refresh]);

  const activeMissionIds = field?.board?.activeMissionIds || [];
  const activeMissionDefs = activeMissionIds.map((id) => getMissionDef(id)).filter(Boolean) as NonNullable<ReturnType<typeof getMissionDef>>[];
  const currentCycleId = field?.board?.cycleId;
  const rotationProgress = field?.rotationProgress;
  const securedMissionIds = new Set(rotationProgress?.clearedMissionIds || []);
  const activeMissionRun = field?.activeMissionRun && activeMissionIds.includes(field.activeMissionRun.missionId)
    ? getMissionDef(field.activeMissionRun.missionId)
    : null;
  const recommendedMission = activeMissionRun
    || activeMissionDefs.find((mission) => field?.records[mission.missionId]?.lastClearCycle !== currentCycleId)
    || activeMissionDefs[0]
    || null;
  const recommendedRecord = recommendedMission ? field?.records[recommendedMission.missionId] : null;
  const recommendedSecured = recommendedMission ? recommendedRecord?.lastClearCycle === currentCycleId : false;
  const recommendedChallenge = recommendedMission ? recommendedRecord?.lastChallengeCycle === currentCycleId : false;
  const rotationLabel = field?.board ? rotationTime(field.board.nextRotationAt) : "REFRESH REQUIRED";
  const commanderRank = field?.commander?.rank || 1;
  const commanderProgress = field?.commander?.progress || 0;
  const commanderTarget = field?.commander?.nextRankAt || null;
  const areaPressure = field?.region ? pressureLabel(field.region.pressure) : "UNKNOWN";
  const pressureCopy = field?.region ? pressureEffect(field.region.pressure) : "Refresh to load current field conditions.";
  const currentDirective = field?.board?.reportVersion === 3 ? directiveSetLabel(field.board.directiveSet) : null;
  const firstClearMessage = operation?.status === "cleared"
    ? "BROKEN SIGNAL COMPLETE · FIELD OPS NOW DRIVE YOUR TACTICAL PROGRESSION"
    : operation?.missions["broken-signal-recover"] === "cleared"
      ? "RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE"
      : "BREACH CLEARED · RECOVER SIGNAL UNLOCKED";

  return (
    <div className="t-fill">
      <Background dim={0.5} art={PRESENTATION.startHero} className="t-bg-hero" />
      <div className="t-vignette" />
      <div className="t-brief t-war-table-premium t-war-table-v29" style={{ maxWidth: "64rem" }}>
        <header className="t-panel t-wt-hero t-wt-hero-compact">
          <div className="t-wt-branding">
            <div className="t-kicker">Alpha Husky / Tactical Ops</div>
            <h1 className="t-title t-wt-title">TACTICAL OPS</h1>
            <p className="t-wt-intro">Rotating combat missions. Build your Commander. Train your squad.</p>
            {progressionError ? <p className="t-wt-error">{progressionError}</p> : null}
            {missionFirstClear ? <p className="t-wt-highlight">{firstClearMessage}</p> : null}
          </div>
          <button className="t-wt-refresh" type="button" disabled={loading} onClick={() => void refresh()} aria-label="Refresh Tactical Ops">
            {loading ? "SYNCING…" : "REFRESH"}
          </button>
        </header>

        <section className="t-wt-status-rail t-wt-status-rail-v29" aria-label="Tactical Ops overview">
          <div className="t-panel t-wt-status-card t-wt-rank-card">
            <span className="t-kicker">Commander</span>
            <strong>{commanderRank >= 3 ? "RANK 3 · CERTIFIED" : `RANK ${commanderRank}`}</strong>
            {commanderTarget ? (
              <>
                <progress className="t-progress" value={Math.min(commanderProgress, commanderTarget)} max={commanderTarget} />
                <small>{commanderProgress} / {commanderTarget} progress</small>
              </>
            ) : <small>All current command tools unlocked</small>}
          </div>
          <div className={`t-panel t-wt-status-card t-wt-pressure-card is-${areaPressure.toLowerCase()}`}>
            <span className="t-kicker">Area status</span>
            <strong>{areaPressure}</strong>
            <small>{pressureCopy}</small>
          </div>
          <div className="t-panel t-wt-status-card">
            <span className="t-kicker">Rotation</span>
            <strong>{rotationLabel}</strong>
            <small>{activeMissionIds.length || 0} active Field Ops{currentDirective ? ` · ${currentDirective}` : ""}</small>
          </div>
        </section>

        {field?.board && rotationProgress ? (
          <section className="t-panel t-wt-front" aria-label="Today's Front">
            <div className="t-wt-front-head">
              <div>
                <span className="t-kicker">TODAY'S FRONT</span>
                <strong>{rotationProgress.securedCount}/{rotationProgress.total} SECURED</strong>
              </div>
              <div className="t-wt-front-meta">
                <span>Challenges {rotationProgress.challengeMissionIds.length}/{rotationProgress.total}</span>
                {field.commander?.unlockedDirectiveTiers?.includes("advanced") ? <span>Advanced {rotationProgress.advancedMissionIds.length}/{rotationProgress.total}</span> : null}
              </div>
            </div>
            <div className="t-wt-front-list">
              {activeMissionDefs.map((mission) => (
                <div className="t-wt-front-row" key={`front-${mission.missionId}`}>
                  <span>{mission.name}</span>
                  <b className={securedMissionIds.has(mission.missionId) ? "is-secured" : ""}>{securedMissionIds.has(mission.missionId) ? "SECURED TODAY" : "OPEN"}</b>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {recommendedMission ? (
          <section className="t-panel t-wt-feature t-wt-next-op" aria-label="Recommended next operation">
            <div className="t-wt-feature-art">
              <img src={PRESENTATION.operationPlate} alt="" aria-hidden="true" />
            </div>
            <div className="t-wt-feature-copy">
              <div className="t-kicker">{activeMissionRun ? "Resume run" : "Next op"}</div>
              <h2>{recommendedMission.name}</h2>
              <p className="t-wt-objective">{objectiveHeadline(missionForContext(recommendedMission, { reportVersion: field?.board?.reportVersion || 2 }))}</p>
              <div className="t-wt-reward-chips" aria-label="Mission progression rewards">
                <span><b>{recommendedSecured ? "✓" : "+2"}</b> {recommendedSecured ? "Clear secured · replay" : "Commander"}</span>
                <span className={recommendedChallenge ? "is-earned" : ""}>
                  <b>{recommendedChallenge ? "✓" : "+1"}</b> {recommendedChallenge ? "Challenge" : "Commander · Challenge"}
                </span>
                <span><b>+2</b> Mastery first clear</span>
              </div>
            </div>
            <div className="t-wt-feature-cta">
              <button className="t-btn t-btn-primary t-wt-main-cta" type="button" disabled={loading} onClick={() => openOperationBrief(recommendedMission.missionId)}>
                {activeMissionRun ? "RESUME OP" : recommendedSecured ? "DEPLOY AGAIN" : "VIEW BRIEF"}
                <ChevronRight className="t-ico" />
              </button>
            </div>
          </section>
        ) : null}

        {field?.activeMissionRun && !field.board?.activeMissionIds.includes(field.activeMissionRun.missionId) ? (
          <section className="t-panel t-wt-legacy-run">
            <div>
              <div className="t-kicker">Saved run</div>
              <strong>{getMissionDef(field.activeMissionRun.missionId)?.name}</strong>
              <p>This run started before the rotation changed. Its original conditions are preserved.</p>
            </div>
            <button type="button" className="t-btn" onClick={() => openOperationBrief(field.activeMissionRun!.missionId)}>RESUME</button>
          </section>
        ) : null}

        <section className="t-panel t-wt-section t-wt-current-ops" aria-label="Current Field Ops">
          <div className="t-wt-section-head">
            <div>
              <div className="t-kicker">This rotation</div>
              <h2 className="t-title">CURRENT FIELD OPS</h2>
            </div>
            <span>{activeMissionIds.length} ACTIVE</span>
          </div>
          <div className="t-wt-mission-list">
            {activeMissionDefs.map((mission) => {
              const record = field?.records[mission.missionId];
              const securedToday = record?.lastClearCycle === field?.board?.cycleId;
              const bonusEarned = record?.lastChallengeCycle === field?.board?.cycleId;
              const contextualMission = missionForContext(mission, { reportVersion: field?.board?.reportVersion || 2 });
              return (
                <article className={`t-wt-mission-card t-panel ${securedToday ? "is-cleared" : "is-active"}`} key={mission.missionId}>
                  <div className="t-wt-mission-art">
                    <img src={PRESENTATION.operationPlate} alt="" aria-hidden="true" />
                    <span className="t-wt-mission-type">{mission.objectiveType}</span>
                  </div>
                  <div className="t-wt-mission-body">
                    <div className="t-wt-mission-head">
                      <div>
                        <h3>{mission.name}</h3>
                        <p>{objectiveHeadline(contextualMission)}</p>
                      </div>
                      <div className="t-wt-mission-state">{securedToday ? "SECURED TODAY" : "AVAILABLE"}</div>
                    </div>
                    <div className="t-wt-mission-meta">
                      <span><b>CLEAR</b> {securedToday ? "SECURED · REPLAY" : "+2 COMMANDER"}</span>
                      <span className={bonusEarned ? "is-earned" : ""}><b>CHALLENGE</b> {bonusEarned ? "✓" : `+1 COMMANDER · ${mission.challenge?.label || "Optional challenge"}`}</span>
                    </div>
                    <details className="t-detail t-wt-card-detail">
                      <summary>Field conditions</summary>
                      <p><strong>{missionDirectiveLabel(mission)}.</strong> {missionSupportCopy(mission)}</p>
                      <p><strong>Area:</strong> {pressureCopy}</p>
                    </details>
                  </div>
                  <div className="t-wt-mission-cta">
                    <button className="t-btn t-btn-primary" type="button" disabled={loading} onClick={() => openOperationBrief(mission.missionId)}>
                      {securedToday ? "DEPLOY AGAIN" : "VIEW BRIEF"}
                      <ChevronRight className="t-ico" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <PackMasteryPanel />

        <details className="t-panel t-wt-story-archive">
          <summary>
            <span>
              <span className="t-kicker">Story archive</span>
              <strong>OPERATION 01 · BROKEN SIGNAL</strong>
            </span>
            <b>{operation?.status === "cleared" ? "COMPLETE" : "IN PROGRESS"}</b>
          </summary>
          <p>{operation?.status === "cleared"
            ? "Canon secured. Replay the three story missions whenever you want."
            : "Complete BREACH → RECOVER SIGNAL → SIGNAL COMMANDER to secure the operation."}</p>
          <div className="t-brief-grid t-wt-canon-grid">
            {BROKEN_SIGNAL.orderedMissionIds.map((missionId, index) => {
              const mission = getMissionDef(missionId);
              if (!mission) return null;
              const status = operation?.missions[missionId] || "locked";
              const isPlayable = mission.executable && (status === "available" || status === "cleared");
              return (
                <div className={`t-panel t-brief-block t-story-mission is-${status}`} key={missionId}>
                  <span className="t-kicker">MISSION {String(index + 1).padStart(2, "0")}</span>
                  <strong>{mission.name}</strong>
                  <small>{status === "cleared" ? "CLEARED" : status === "available" ? "AVAILABLE" : "LOCKED"}</small>
                  <button type="button" className="t-btn" disabled={!isPlayable} onClick={() => openOperationBrief(missionId)}>
                    {status === "cleared" ? "REPLAY" : status === "available" ? "VIEW BRIEF" : "LOCKED"}
                  </button>
                </div>
              );
            })}
          </div>
        </details>

        {field?.lastResult ? (
          <details className="t-detail t-wt-last-result t-wt-secondary-detail">
            <summary>Last result · {rotationTime(field.lastResult.recordedAt)}</summary>
            <strong>{getMissionDef(field.lastResult.missionId)?.name} · {field.lastResult.victory ? "CLEARED" : "FAILED"}</strong>
            <FieldResultFeedback result={field.lastResult} />
          </details>
        ) : null}
      </div>
    </div>
  );
}

function Brief() {
  const identity = useBattleStore(s => s.identity);
  const deploy = useBattleStore((s) => s.deploy);
  const backToHub = useBattleStore((s) => s.backToHub);
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const selectedMissionId = useBattleStore((s) => s.selectedMissionId);
  const selectedSquadIds = useBattleStore((s) => s.selectedSquadIds);
  const selectedApproach = useBattleStore((s) => s.selectedApproach);
  const selectedDirectiveTier = useBattleStore((s) => s.selectedDirectiveTier);
  const selectDirectiveTier = useBattleStore((s) => s.selectDirectiveTier);
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
  const savedRun = field?.activeMissionRun;
  const resuming = savedRun?.missionId === selectedMissionId && savedRun.squadIds.join(",") === selectedSquadIds.join(",") && (savedRun.fieldContext?.approach || "standard") === selectedApproach && (savedRun.fieldContext?.directiveTier || "standard") === selectedDirectiveTier;
  const fieldContext = resuming && savedRun?.fieldContext ? savedRun.fieldContext : { pressure: field?.region?.pressure ?? 2, reportVersion: field?.board?.reportVersion || 2, directiveTier: selectedDirectiveTier, directiveSet: field?.board?.directiveSet };
  const baseMission = getMissionDef(selectedMissionId);
  const mission = baseMission ? missionForContext(baseMission, fieldContext) : null;
  const fieldOp = mission?.activity === "FIELD_OP";
  const twoSlots = Boolean(mission && (fieldOp || mission.objectiveType === "BOSS"));
  const baseSpawns = mission ? missionSpawnsForSquad(mission, selectedSquadIds, equippedPet, selectedApproach)
    || (fieldOp ? missionSpawnsForSquad(mission, ["alpha", "ally-02", "ally-03"], equippedPet)!
      : mission.objectiveType === "RECOVER" ? recoverSpawnsForSquad(["alpha", "ally-02"])! : BROKEN_SIGNAL_COMMANDER_SPAWNS.filter((spawn) => !["ally-02", "ally-03"].includes(spawn.defId))) : encounter.spawns;
  const spawns = mission ? withTeammateSidegrades(baseSpawns, { kodaSidegrade, shadowSidegrade, packMastery: resuming ? savedRun?.packMastery || {} : packMastery }) : baseSpawns;
  const conditions = mission ? missionDirectives(mission, fieldContext) : [];
  const reinforcementRound = mission && fieldOp ? missionBattleRules(mission, false, fieldContext).reinforcement?.triggerRound : undefined;
  const title = mission ? mission.name : onboardingEnabled ? encounter.operationName : OPERATION.name;
  const objective = mission ? mission.briefCopy : onboardingEnabled ? encounter.objective : OPERATION.objective;
  const allies = alliedBriefDefs(spawns).map(def => applyIdentityToAlpha(def, identity));
  const hostiles = enemyBriefRows(spawns);
  const footnote = mission
    ? `${mission.objectiveType} · Squad cap ${mission.squadCap}. `
    : onboardingEnabled
      ? encounter.teaching
      : "Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.";
  const primaryObjective = fieldOp ? `PRIMARY OBJECTIVE: ${mission.objectiveType}` : mission?.objectiveType === "RECOVER" ? "PRIMARY OBJECTIVE: RECOVER THE SIGNAL" : mission?.objectiveType === "BOSS" ? "PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER" : mission?.objectiveType === "ELIMINATE" ? "PRIMARY OBJECTIVE: ELIMINATE HOSTILES" : null;
  const recruitMoment = !mission && onboardingEnabled && onboardingStageId === "ally-koda" ? "CNC JOINED · ROSTER UPDATED" : !mission && onboardingEnabled && onboardingStageId === "full-broken-signal" ? "SHADOW JOINED · FULL SQUAD READY" : null;
  const missionIntel = mission?.objectiveType === "BOSS" ? "Routing Trace telegraphs the fixed reinforcement." : mission?.missionId === "broken-signal-breach" ? "TRACE target can reveal Routing Trace." : "No Intel required.";
  return (
    <div className="t-fill">
      <Background dim={0.58} />
      <div className="t-brief t-deployment t-deployment-v29">
        <header className="t-deploy-hero t-deploy-hero-v29">
          <img src={PRESENTATION.operationPlate} alt="" aria-hidden="true" />
          <div className="t-deploy-hero-copy">
            <div className="t-kicker">{fieldOp ? "FIELD OPS" : "TACTICAL OPS"} / MISSION BRIEF</div>
            <h1 className="t-title">{title}</h1>
            <p>{mission ? objectiveHeadline(mission) : objective}</p>
          </div>
          {fieldOp && field?.board ? <div className="t-deploy-rotation"><span className="t-kicker">Rotation</span><strong>{rotationTime(field.board.nextRotationAt)}</strong></div> : null}
        </header>

        {recruitMoment ? <div className="t-recruit-moment">{recruitMoment}</div> : null}

        <section className="t-panel t-deploy-overview" aria-label="Mission overview">
          <div className="t-deploy-summary-main">
            <div className="t-kicker">Objective</div>
            <strong>{primaryObjective ? primaryObjective.replace("PRIMARY OBJECTIVE: ", "") : mission ? objectiveHeadline(mission) : objective}</strong>
            <p>{mission ? objective : footnote}</p>
          </div>
          {fieldOp ? (
            <>
              <div className="t-deploy-summary-card">
                <span className="t-kicker">Clear reward</span>
                <strong>+2 COMMANDER</strong>
                <small>First clear also grows deployed companions.</small>
              </div>
              <div className="t-deploy-summary-card">
                <span className="t-kicker">Bonus challenge</span>
                <strong>+1 COMMANDER</strong>
                <small>{mission?.challenge?.label || "Optional challenge"}</small>
              </div>
              <div className={`t-deploy-summary-card t-deploy-pressure is-${pressureLabel(fieldContext.pressure).toLowerCase()}`}>
                <span className="t-kicker">Area status</span>
                <strong>{pressureLabel(fieldContext.pressure)}</strong>
                <small>{pressureEffect(fieldContext.pressure)}</small>
              </div>
            </>
          ) : null}
        </section>

        <section className="t-panel t-deploy-squad" aria-label="Squad">
          <div className="t-wt-section-head">
            <div>
              <div className="t-kicker">Squad</div>
              <h2 className="t-title">{allies.length} / {mission?.squadCap || allies.length} DEPLOYED</h2>
            </div>
            {resuming ? <span>RESUMING SAVED RUN</span> : null}
          </div>

          <div className="t-squad-preview t-squad-preview-v29" aria-label="Selected squad">
            {allies.map(def => (
              <div key={def.defId}>
                <img src={def.portrait} onError={def.defId === "alpha" ? portraitFallback : undefined} alt="" />
                <span>{def.defId === "ally-02" ? "CNC" : def.role === "companion" ? "PET" : def.name}</span>
              </div>
            ))}
          </div>

          {twoSlots ? (
            <div className="t-deploy-squad-picker">
              <p>Choose two tactical companions.</p>
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
            <div className="t-deploy-squad-picker">
              <p>Choose one teammate for this recovery mission.</p>
              <div className="t-brief-actions">
                <button type="button" disabled={busy} className={`t-btn ${selectedSquadIds[1] === "ally-02" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-02")}>CNC<br /><small>OFFENSE · PRESSURE</small></button>
                <button type="button" disabled={busy} className={`t-btn ${selectedSquadIds[1] === "ally-03" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => selectRecoverTeammate("ally-03")}>SHADOW<br /><small>SUPPORT · SUSTAIN</small></button>
                <button type="button" disabled={busy || !equippedPet} className={`t-btn ${equippedPet && selectedSquadIds[1] === `pet:${equippedPet.id}` ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => equippedPet && selectRecoverTeammate(`pet:${equippedPet.id}`)}>PET{equippedPet ? ` · ${equippedPet.name}` : ""}<br /><small>{equippedPet ? "MOBILITY · CONTROL" : "UNAVAILABLE"}</small></button>
              </div>
            </div>
          ) : null}
        </section>

        {conditions.length || fieldOp ? (
          <details className="t-panel t-deploy-rules">
            <summary>
              <span><span className="t-kicker">Tactical setup</span><strong>CONDITIONS & APPROACH</strong></span>
              <b>{selectedDirectiveTier.toUpperCase()}{selectedApproach !== "standard" ? ` · ${DEPLOYMENT_APPROACHES[selectedApproach].name}` : ""}</b>
            </summary>

            {conditions.length ? <section className="t-conditions" aria-label="Special conditions">
              {conditions.map((condition) => <div className="t-condition t-condition-v29" key={condition.type}>
                <strong>{condition.maxRounds ? `DEADLINE · ROUND ${condition.maxRounds}` : condition.reinforcement ? `REINFORCEMENTS · ROUND ${reinforcementRound}` : condition.supportCooldownExtra ? "LIMITED SUPPORT · +1 TURN" : condition.name}</strong>
                <p>{condition.copy}</p>
              </div>)}
              {mission?.squadHint ? <p className="t-deploy-tip"><strong>Squad tip:</strong> {mission.squadHint}</p> : null}
            </section> : null}

            {fieldOp ? <div className="t-deployment-options t-deployment-options-v29">
              {resuming ? <p className="t-deploy-resume">Original conditions are locked for this saved run. Changing squad, route or tier starts a new attempt.</p> : null}
              {field?.board?.reportVersion === 3 ? <>
                <div className="t-kicker">Directive tier</div>
                <div className="t-brief-actions">{(["standard", "advanced"] as const).map((tier) => <button type="button" className={`t-btn ${selectedDirectiveTier === tier ? "t-btn-primary" : ""}`} key={tier} aria-pressed={selectedDirectiveTier === tier} disabled={busy || !field.commander?.unlockedDirectiveTiers?.includes(tier)} onClick={() => selectDirectiveTier(tier)}>{tier.toUpperCase()}{tier === "advanced" && !field.commander?.unlockedDirectiveTiers?.includes(tier) ? " / RANK 3" : ""}</button>)}</div>
                <small>{selectedDirectiveTier === "advanced" ? `${directiveSetLabel(fieldContext.directiveSet)} · Advanced clear is recorded.` : "Standard field conditions."}</small>
              </> : null}

              <div className="t-kicker">Deployment approach</div>
              <div className="t-brief-actions">{(["standard", "south"] as const).map((approach) => <button type="button" key={approach} className={`t-btn ${selectedApproach === approach ? "t-btn-primary" : ""}`} aria-pressed={selectedApproach === approach} disabled={busy || !field?.commander?.unlockedApproaches.includes(approach)} onClick={() => selectApproach(approach)}>{DEPLOYMENT_APPROACHES[approach].name}{approach === "south" && !field?.commander?.unlockedApproaches.includes("south") ? " / RANK 2" : ""}</button>)}</div>
              <small>{DEPLOYMENT_APPROACHES[selectedApproach].copy}</small>
            </div> : null}
          </details>
        ) : null}

        {mission ? <details className="t-panel t-deploy-depth">
          <summary><span><span className="t-kicker">Optional depth</span><strong>MASTERY & LOADOUT</strong></span><b>VIEW</b></summary>
          <PackMasteryPanel snapshot={resuming ? savedRun?.packMastery : undefined} />

          {mission && spawns.some((spawn) => spawn.defId === "ally-02") ? (
            <div className="t-panel t-brief-block t-sidegrade-card">
              <div className="t-kicker">CNC · BUG HUNTER WARDEN</div>
              {sidegradesUnlocked ? <>
                <div className="t-brief-actions">
                  <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "A"} className={`t-btn ${kodaSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("A")}>A · VANGUARD</button>
                  <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "B"} className={`t-btn ${kodaSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("B")}>B · DISRUPTOR</button>
                </div>
                <small>{kodaSavePending ? "Saving CNC choice…" : kodaSidegrade ? `SAVED · ${kodaSidegrade === "A" ? "VANGUARD" : "DISRUPTOR"}` : "Base CNC · no sidegrade selected"}</small>
              </> : <small>CNC sidegrades unlock after BROKEN SIGNAL is cleared.</small>}
            </div>
          ) : null}

          {mission && spawns.some((spawn) => spawn.defId === "ally-03") ? (
            <div className="t-panel t-brief-block t-sidegrade-card">
              <div className="t-kicker">SHADOW · STAFF SUPPORT</div>
              {sidegradesUnlocked ? <>
                <div className="t-brief-actions">
                  <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "A"} className={`t-btn ${shadowSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("A")}>A · RESTORER</button>
                  <button type="button" disabled={busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "B"} className={`t-btn ${shadowSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("B")}>B · WARDEN</button>
                </div>
                <small>{shadowSavePending ? "Saving SHADOW choice…" : shadowSidegrade ? `SAVED · ${shadowSidegrade === "A" ? "RESTORER" : "WARDEN"}` : "Base SHADOW · no sidegrade selected"}</small>
              </> : <small>SHADOW sidegrades unlock after BROKEN SIGNAL is cleared.</small>}
            </div>
          ) : null}

          <details className="t-detail t-loadout-details"><summary>Squad abilities & hostile intel</summary>
            <div className="t-brief-grid">
              <div className="t-panel t-brief-block">
                <h3>Allied squad</h3>
                <PlayerIdentityCard />
                {allies.map((def) => (
                  <div className="t-unit-row" key={def.defId}>
                    <img src={def.portrait} onError={def.defId === "alpha" ? portraitFallback : undefined} alt="" style={def.defId === "alpha" ? undefined : { objectPosition: "50% 12%" }} />
                    <div><div className="t-title" style={{ fontSize: "0.95rem" }}>{def.defId === "ally-02" ? "COLDNCURSED" : def.name}</div><div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>{briefSubtitle(def)}</div></div>
                  </div>
                ))}
              </div>
              <div className="t-panel t-brief-block">
                <h3>Hostile force</h3>
                {hostiles.map(({ def, count }) => (
                  <div className="t-unit-row" key={def.defId}>
                    <div className="t-unit-ph enemy" />
                    <div><div className="t-title" style={{ fontSize: "0.95rem" }}>{count > 1 ? `${def.name} × ${count}` : def.name}</div><div style={{ color: "var(--t-muted)", fontSize: "0.8rem" }}>{briefSubtitle(def, `${def.hp} HP`)}</div></div>
                  </div>
                ))}
                <p style={{ color: "var(--t-faint)", fontSize: "0.78rem", margin: "0.8rem 0 0", lineHeight: 1.45 }}>{missionIntel}</p>
              </div>
            </div>
          </details>
        </details> : null}

        <div className="t-brief-actions t-deploy-actions t-deploy-actions-v29">
          <button type="button" className="t-btn t-btn-ghost" onClick={backToHub}>BACK</button>
          <button type="button" className="t-btn t-btn-primary" onClick={deploy} disabled={busy || kodaSavePending || shadowSavePending || (Boolean(mission) && !missionSpawnsForSquad(mission!, selectedSquadIds, equippedPet))}>
            DEPLOY SQUAD
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
  const failureReason = useBattleStore((s) => s.battle.failureReason);
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
      <div className="t-overlay t-results-overlay">
        <div className={`t-modal t-panel t-results ${results.victory ? "is-victory" : "is-failure"}`}>
          <header className="t-outcome-hero"><img className="t-results-plate" src={results.victory ? PRESENTATION.resultsPlate : PRESENTATION.operationPlate} alt="" aria-hidden="true" /><span className="t-outcome-stamp">{results.victory ? "MISSION SECURED" : "MISSION LOST"}</span>
          <div className="t-kicker">{fieldOp ? `FIELD OP / ${mission.name}` : operationVictory && mission ? mission.name : sessionVictory ? encounter.operationName : "Broken Signal"}</div>
          <h2 className="t-title">{fieldOp ? results.victory ? "FIELD OP COMPLETE" : "FIELD OP FAILED" : operationVictory ? mission?.objectiveType === "BOSS" ? "SIGNAL COMMANDER DOWN" : mission?.objectiveType === "RECOVER" ? "OBJECTIVE COMPLETE" : isFirstClear ? "BREACH CLEARED" : "BREACH REPLAY COMPLETE" : sessionVictory ? encounter.resultsTitle : "Operation Complete"}</h2></header>
          {sessionVictory ? (
            <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp ? null : operationVictory ? mission?.objectiveType === "RECOVER" ? isFirstClear ? "Continue to unlock SIGNAL COMMANDER." : "SIGNAL RECOVERED." : mission?.objectiveType === "ELIMINATE" ? isFirstClear ? "RECOVER AVAILABLE." : null : null : encounter.resultsNote}</p>
          ) : null}
          {operationVictory && mission?.missionId === "broken-signal-breach" ? <p style={{ color: routingTraceAcquired || progression?.intel?.routingTrace ? "var(--t-accent)" : "var(--t-faint)", margin: "0 0 0.8rem" }}>ROUTING TRACE — {routingTraceAcquired || progression?.intel?.routingTrace ? "ACQUIRED" : "MISSED"}</p> : null}
          {operationVictory && mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-accent)", margin: "0 0 0.8rem" }}>{isFirstClear ? mission.resultsCopy : "BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED"}</p> : null}
          {fieldOp ? <div>
            
            {!results.victory ? <p>{fieldFailureCopy(failureReason, mission.objectiveType)} No clear or commander progress earned.</p> : null}
            {fieldResult ? <FieldResultFeedback result={fieldResult} /> : <p role="status">{progressionCommitPending ? "Recording result…" : "Result not recorded yet."}</p>}
          </div> : null}
          {fieldOp ? <details className="t-detail"><summary>Challenge objective</summary><p>{mission.challenge?.label}</p></details> : null}
          <PlayerIdentityCard />
          <dl className="t-stats">
            <div>
              <dt>Turns</dt>
              <dd>{String(results.turns).padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Eliminated</dt>
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
          <div className="t-brief-actions t-result-actions">
            {fieldOp ? (
              <>
                {!fieldResult ? <button type="button" className="t-btn t-btn-primary" disabled={progressionCommitPending} onClick={() => void saveFieldResult()}>{progressionCommitPending ? "Recording..." : "Retry saving result"}</button> : <>
                  <button type="button" className="t-btn t-btn-primary" onClick={() => continueOnboarding()}>War Table</button>
                  <button type="button" className="t-btn" onClick={replay}>Replay / Squad</button>
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
  const failureReason = useBattleStore((s) => s.battle.failureReason);
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
          <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp ? fieldFailureCopy(failureReason, mission.objectiveType) : "All allied units are down."}</p>
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
  const [, refreshSpine] = useState(0);
  useEffect(() => firstSession()?.subscribe(() => refreshSpine(n => n + 1)), []);
  const receipt = firstSession()?.view().result;

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
    <div className="t-shell" data-screen={receipt?.confirmed ? "results" : screen}>
      {receipt?.confirmed ? <RecordedFirstResult receipt={receipt} /> : <>
      {screen === "hub" ? <Hub /> : null}
      {screen === "war-table" ? <WarTable /> : null}
      {screen === "brief" ? <Brief /> : null}
      {screen === "battle" ? <BattleScreen /> : null}
      {screen === "sector" ? <Sector /> : null}
      {screen === "results" ? <Results /> : null}
      {screen === "defeat" ? <Defeat /> : null}
      </>}
    </div>
  );
}
