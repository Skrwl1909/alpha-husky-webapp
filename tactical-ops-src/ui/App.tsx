import { veteranRequirement } from "../data/veteran";
import { commandPurpose, fieldResultPurpose, type PurposeAction } from "./returnPurpose";
import { savedMasteryProof } from "./s3PowerProof";
import { buildFit, fieldcraftResults } from "./fieldcraft";
import { LOCKDOWN_PLANS, DEPLOYMENT_APPROACHES, pressureLabel, pressureEffect, rotationTime, directiveSetLabel, fieldFailureCopy, type FieldResult } from "../data/fieldOps";
import { missionForContext } from "../data/operations";
import {chapterDisplay,DOCTRINES} from "../data/campaignChapter";
import {tacticalCareerTruth} from "./tacticalCampaignOrders";
import { confirmedConsequence, confirmedReturnAction, matchingAfterActionReceipt } from "./s3AfterAction";
import { savedSidegradeProof } from "./s3PowerProof";
import { s3TrainingGoals, s3TrainingResults, s3RunMemory } from "./s3CombatProof";
import { deriveMissionPresentation, nextFieldMission, recordedResultMeaning } from "./missionPurpose";
import { missionDirectives } from "../data/directives";
import { useEffect, useRef, useState } from "react";
import { firstSession, type FirstResultReceipt } from "../host/firstSession";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useBattleStore } from "../store/battleStore";
import { BATTLEFIELD_LAB_KEY, BATTLEFIELD_VNEXT_PREVIEW } from "../combat/types";
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
import { missionBattleRules, missionSpawnsForSquad, BROKEN_SIGNAL, DEAD_RELAY, getMissionDef, recoverSpawnsForSquad, commanderSpawnsForSquad, BROKEN_SIGNAL_COMMANDER_SPAWNS } from "../data/operations";
import { withTeammateSidegrades } from "../data/shadowSidegrade";
import { PackMasteryPanel, MasteryFeedback } from "./PackMastery";
import { SkillbookPanel } from "./Skillbook";
import { activeProtocolSlots, counterplayReadiness, equippedSignalCodex, SIGNAL_FAMILIES, squadTradeoff } from "../data/signalCodex";
import { TACTICAL_VNEXT_ENABLED } from "../combat/intentContract";

import { applyIdentityToAlpha } from "../host/identity";
import { PlayerIdentityCard, portraitFallback } from "./PlayerIdentity";

const PRESENTATION = {
  startHero: "/images/tactical_ops/presentation/tactical_ops_start_hero_backdrop.png",
  battlefield: "/images/tactical_ops/presentation/tactical_ops_battlefield_backdrop.png",
  operationPlate: "/images/tactical_ops/presentation/tactical_ops_broken_signal_operation_plate.png",
  resultsPlate: "/images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png",
  bossTarget: "/images/tactical_ops/presentation/tactical_ops_boss_target.png",
  recoveryMarker: "/images/tactical_ops/presentation/tactical_ops_signal_recovery_marker.png",
  traceTarget: "/images/tactical_ops/presentation/tactical_ops_trace_target.png",
  reinforcementWarning: "/images/tactical_ops/presentation/tactical_ops_reinforcement_warning.png",
} as const;

function openPurposeBrief(action: PurposeAction) {
  const store = useBattleStore.getState();
  if (action.chapter) { store.openChapterBrief(); return; }
  store.openOperationBrief(action.missionId, action.masteryChallenge);
  if (!action.resume && action.tier === "advanced") useBattleStore.getState().selectDirectiveTier("advanced");
}

function missionPresentation(mission: NonNullable<ReturnType<typeof getMissionDef>>) {
  if (mission.objectiveType === "BOSS") return { art: PRESENTATION.bossTarget, tone: "boss", label: "COMMAND TARGET" };
  if (mission.objectiveType === "RECOVER") return { art: PRESENTATION.recoveryMarker, tone: "recover", label: "SIGNAL RECOVERY" };
  if (mission.objectiveType === "INTERCEPT") return { art: PRESENTATION.traceTarget, tone: "intercept", label: "INTERCEPT" };
  if (mission.objectiveType === "HOLD") return { art: PRESENTATION.reinforcementWarning, tone: "hold", label: "HOLD THE LINE" };
  if (mission.objectiveType === "SURVIVE") return { art: PRESENTATION.battlefield, tone: "survive", label: "ENDURE" };
  return { art: PRESENTATION.operationPlate, tone: "assault", label: "ASSAULT" };
}

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
  if (objective?.type === "HOLD") return objective.holderRadius === 0 ? `OCCUPY THE EXACT RELAY TILE · ${objective.duration} consecutive round changes.` : `Control the relay area · ${objective.duration} consecutive round changes.`;
  if (objective?.type === "SURVIVE") return `Keep the full squad standing · ${objective.duration} rounds.`;
  if (mission.objectiveType === "RECOVER") return "Reach the relay. Use RECOVER.";
  if (mission.objectiveType === "BOSS") return mission.operationId === DEAD_RELAY.operationId ? "Defeat the DEAD RELAY GUARDIAN." : "Defeat the SIGNAL COMMANDER.";
  return "Eliminate the HOUND patrol.";
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
  if (result.veteranChallenge) return <section className="t-field-feedback" aria-label="Recorded Veteran challenge"><strong>PACK EXTRACTION · {result.victory?"COMPLETE":"FAILED"}</strong><p>Server-accepted optional practice. No currency, Commander, Veteran or Pack Mastery progress.</p><p>Next: return to an eligible Advanced Field Op for progression.</p></section>;
  const unlock = result.masteryUnlocked ? "RELAY MASTERY · RELAY LOCKDOWN UNLOCKED" : result.advancedUnlocked ? "ADVANCED DIRECTIVES" : result.unlockedApproaches.includes("south") ? "SOUTH APPROACH" : null;
  const target = result.rankAfter < 2 ? 6 : 12;
  const meaning = fieldResultPurpose(result);
  return <section className="t-field-feedback" aria-label="Recorded Field Op result">
    {unlock ? <div className="t-unlock"><span className="t-kicker">UNLOCKED</span><strong>{unlock}</strong></div> : null}
    {result.lockdownPlan ? <p data-recorded-plan={result.lockdownPlan}><b>SERVER-ACCEPTED PLAN · {LOCKDOWN_PLANS[result.lockdownPlan].name}</b> · {result.victory ? "Objective completed" : "Attempt failed"}. Next: {result.lockdownPlan === "crosslink" ? "try Anchor to hold one defensive position" : "try Crosslink to rotate between relay checkpoints"}.</p> : null}
    {result.firstLockdownClear ? <div className="t-lockdown-achievement" data-lockdown-completion="true" role="status"><span className="t-kicker">PERMANENT FIELD RECORD</span><strong>{result.lockdownFirstClear ? 'FIRST LOCKDOWN CLEAR RECORDED' : 'LOCKDOWN COMPLETION RECORDED'}</strong><span>Saved permanently · Relay Mastery 1/1</span></div> : null}
    {result.masteryChallenge ? !result.firstLockdownClear ? <p><b>RELAY MASTERY · 1/1</b> · Permanent access preserved.</p> : null : <>
    <div className="t-progress-heading"><div><span className="t-kicker">COMMANDER</span><strong>RANK {result.rankBefore !== result.rankAfter ? `${result.rankBefore} → ` : ""}{result.rankAfter}</strong></div><b>+{result.progressEarned}<small>PROGRESS</small></b></div>
    <progress className="t-progress" aria-label="Commander progress" value={Math.min(result.progressAfter, target)} max={target} />
    <div className="t-progress-caption"><span>{result.progressBefore} → {result.progressAfter} TOTAL</span><span>{result.rankAfter >= 3 ? result.veteranCareer ? result.rankAfter===4 ? "RANK 4 · VETERAN" : "CERTIFIED · VETERAN CAREER OPEN" : "CERTIFIED · ALL CURRENT COMMAND TOOLS OPEN" : `${Math.max(0, target - result.progressAfter)} TO RANK ${result.rankAfter + 1}`}</span></div>
    </>}
    {result.victory && result.progressEarned === 0 && !result.masteryChallenge ? <div className="t-mission-strip"><span>CLEAR SECURED · REPLAY</span><span>+0 COMMANDER</span></div> : null}
    {result.victory && result.firstCycleSecure === false && result.progressEarned > 0 ? <div className="t-mission-strip"><span>CLEAR ALREADY SECURED</span><span>CHALLENGE +{result.challengeBonus} COMMANDER</span></div> : null}
    {!result.masteryChallenge ? <div className="t-mission-strip"><span>{result.legacyReport ? "CHALLENGE UNMEASURED" : result.challengeSuccess ? (result.challengeBonus ? `CHALLENGE MET · +${result.challengeBonus} COMMANDER` : "CHALLENGE ✓") : "CHALLENGE NOT MET"}</span>{result.directiveTier === "advanced" ? <span>ADVANCED · {directiveSetLabel(result.directiveSet)}{result.firstCycleAdvanced ? " · SECURED TODAY" : result.victory ? " · REPLAY" : " · FAILED"}</span> : null}</div> : null}
    <p className="t-player-result-meaning">{recordedResultMeaning(result)}</p>
    <div className="t-purpose-result" aria-label="Earned and changed">
      <p><b>{result.masteryChallenge ? 'RECORD' : 'EARNED'}</b> {meaning.earned}</p><p><b>{result.masteryChallenge ? 'STATUS' : 'ELIGIBILITY'}</b> {meaning.exhausted}</p>
      <p><b>WHAT CHANGED</b> {meaning.changed}</p><p><b>NEXT BATTLE</b> {meaning.future}</p>
    </div>
    {result.challengeSuccess && !result.challengeBonus ? <small>{result.firstCycleChallenge === false ? "Challenge bonus already earned this rotation." : "No new challenge bonus recorded."}</small> : null}
    {result.veteranCareer ? <p data-veteran-career-delta="true">COMMANDER VETERAN {result.veteranCareer.before} → {result.veteranCareer.after}/12 · {result.veteranCareer.unlocked?"RANK 4 · PACK EXTRACTION UNLOCKED":result.veteranCareer.reason.replaceAll("_"," ").toLowerCase()}</p> : null}
    <MasteryFeedback changes={result.masteryChanges} victory={result.victory} />
  </section>;
}

function WarTable() {
  const [deckTab, setDeckTab] = useState<"command" | "missions" | "squad" | "archive">("command");
  const [squadView, setSquadView] = useState<"skillbook" | "mastery">("skillbook");
  const atlasVisible = deckTab === "squad" && squadView === "skillbook";
  const [selectedFieldOp, setSelectedFieldOp] = useState<string | null>(null);
  const progression = useBattleStore((s) => s.progression);
  const openOperationBrief = useBattleStore((s) => s.openOperationBrief);
  const chooseDoctrine = useBattleStore((s) => s.chooseDoctrine);
  const openChapterBrief = useBattleStore((s) => s.openChapterBrief);
  const chapterSaving = useBattleStore((s) => s.progressionCommitPending);
  const progressionError = useBattleStore((s) => s.progressionError);
  const missionFirstClear = useBattleStore((s) => s.missionFirstClear);
  const operation = progression?.operations?.[BROKEN_SIGNAL.operationId];
  const deadRelay = progression?.operations?.[DEAD_RELAY.operationId];
  const courierIntel = progression?.campaignIntel?.["dead-relay"]?.courierTraceAcquired === true;
  const field = progression?.fieldOps;
  const purposeRoute = commandPurpose(progression);
  const primaryPurpose = purposeRoute.primary;
  const openPurpose = openPurposeBrief;
  const campaignCareer = tacticalCareerTruth(progression);
  const acceptedChapter = progression?.tacticalChapter;
  const chapterView = acceptedChapter ? chapterDisplay(acceptedChapter) : null;
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
  const recommendedBase = getMissionDef(primaryPurpose?.missionId);
  const masteryPreview = primaryPurpose?.masteryChallenge ? { reportVersion:4, masteryChallenge:primaryPurpose.masteryChallenge, pressure:2, directiveTier:'advanced' as const, directiveSet:'pursuit' as const } : undefined;
  const recommendedMission = recommendedBase ? missionForContext(recommendedBase, masteryPreview) : null;
  const recommendedChallenge = recommendedMission ? field?.records[recommendedMission.missionId]?.lastChallengeCycle === currentCycleId : false;
  const recommendedAccepted = primaryPurpose?.chapter ? progression?.chapterActiveMission : recommendedMission && field?.activeMissionRun?.missionId === recommendedMission.missionId ? field.activeMissionRun : progression?.operations?.[recommendedMission?.operationId || ""]?.activeMissionRun;
  const recommendedPurpose = recommendedMission ? deriveMissionPresentation(recommendedMission, field, recommendedAccepted, field?.lastResult, masteryPreview) : null;
  const rotationLabel = field?.board ? rotationTime(field.board.nextRotationAt) : "REFRESH REQUIRED";
  const commanderRank = field?.commander?.rank || 0;
  const commanderProgress = field?.commander?.progress || 0;
  const commanderTarget = field?.commander?.nextRankAt || null;
  const remainingToRank = commanderTarget ? Math.max(0, commanderTarget - commanderProgress) : 0;
  const areaPressure = field?.region ? pressureLabel(field.region.pressure) : "UNKNOWN";
  const pressureCopy = field?.region ? pressureEffect(field.region.pressure) : "Refresh to load current field conditions.";
  const currentDirective = field?.board?.reportVersion === 3 ? directiveSetLabel(field.board.directiveSet) : null;
  const deadRelayNextMissionId = deadRelay?.activeMissionRun?.missionId || DEAD_RELAY.orderedMissionIds.find((id) => deadRelay?.missions[id] === "available") || null;
  const firstClearMessage = operation?.status === "cleared"
    ? deadRelay ? "BROKEN SIGNAL COMPLETE · OPERATION 02 THE DEAD RELAY NOW AVAILABLE" : "BROKEN SIGNAL COMPLETE · FIELD OPS NOW DRIVE YOUR TACTICAL PROGRESSION"
    : operation?.missions["broken-signal-recover"] === "cleared"
      ? "RECOVER SIGNAL CLEARED · SIGNAL COMMANDER AVAILABLE"
      : "BREACH CLEARED · RECOVER SIGNAL UNLOCKED";

  const deadRelayCampaign = deadRelay ? <section className={`t-panel ${deadRelay.status === "cleared" ? "t-wt-story-archive" : "t-wt-campaign-feature"}`} aria-label="Operation 02 campaign">
          <div className="t-wt-section-head">
            <div><span className="t-kicker">STORY CAMPAIGN · OPERATION 02</span><h2 className="t-title">THE DEAD RELAY</h2></div>
            <strong>{deadRelay.status === "cleared" ? "CAMPAIGN SECURED" : deadRelay.missions["dead-relay-courier"] === "locked" ? "LOCKED" : "IN PROGRESS"}</strong>
          </div>
          <p>Intercept the courier. Hold the relay. Defeat its Guardian. Each first clear unlocks the next stage; your courier Intel changes the Hold mission.</p>
          {deadRelay.status !== "cleared" && deadRelayNextMissionId ? (
            <div className="t-wt-campaign-actions">
              <div><span className="t-kicker">NEXT STORY MISSION</span><strong>{getMissionDef(deadRelayNextMissionId)?.name || "THE DEAD RELAY"}</strong></div>
              <button className="t-btn t-btn-primary t-wt-campaign-cta" type="button" disabled={loading}
                onClick={() => openOperationBrief(deadRelayNextMissionId)}>
                {deadRelay.activeMissionRun?.missionId ? "RESUME CAMPAIGN" : "CONTINUE CAMPAIGN"}
              </button>
            </div>
          ) : null}
          <div className="t-mission-strip"><span>COURIER TRACE</span><strong>{courierIntel ? "ACQUIRED · HOUND ARRIVES 1 ROUND LATER" : "NOT RECORDED · EARLY INTERCEPT REQUIRED"}</strong></div>
          <div className="t-brief-grid t-wt-canon-grid">
            {DEAD_RELAY.orderedMissionIds.map((id, index) => {
              const mission = getMissionDef(id);
              if (!mission) return null;
              const status = deadRelay.missions[id] || "locked";
              const active = deadRelay.activeMissionRun?.missionId === id;
              return <div className={`t-panel t-brief-block t-story-mission is-${status}`} key={id}>
                <span className="t-kicker">MISSION {String(index + 1).padStart(2, "0")} · {mission.objectiveType}</span>
                <strong>{mission.name}</strong>
                <small>{status === "cleared" ? "CLEARED" : status === "available" ? "AVAILABLE" : "LOCKED"}</small>
                <button type="button" className="t-btn" disabled={loading || status === "locked"}
                  onClick={() => openOperationBrief(id)}>{active ? "RESUME FROM START" : status === "cleared" ? "REPLAY" : status === "available" ? "VIEW BRIEF" : "LOCKED"}</button>
              </div>;
            })}
          </div>
          <small>Resume restarts the accepted battle from turn 1; mid-battle positions and HP are not saved.</small>
        </section> : null;

  return (
    <div className="t-fill">
      <Background dim={0.5} art={PRESENTATION.startHero} className="t-bg-hero" />
      <div className="t-vignette" />
      <div className="t-brief t-war-table-premium t-war-table-v29 t-command-art-shell t-premium-ux" style={{ maxWidth: "64rem" }}>
        <header className="t-panel t-wt-hero t-wt-hero-compact">
          <div className="t-wt-branding">
            <div className="t-kicker">Alpha Husky / Tactical Ops</div>
            <h1 className="t-title t-wt-title">TACTICAL OPS</h1>
            <p className="t-wt-intro">Your next move starts here.</p>
            {progressionError && !atlasVisible ? <p className="t-wt-error" role="alert">{progressionError}</p> : null}
            {missionFirstClear ? <p className="t-wt-highlight">{firstClearMessage}</p> : null}
          </div>
          <button className="t-wt-refresh" type="button" disabled={loading} onClick={() => void refresh()} aria-label="Refresh Tactical Ops">
            {loading ? "SYNCING…" : "REFRESH"}
          </button>
        </header>


        <nav className="t-command-nav t-command-framed-nav" aria-label="Tactical command sections">
          {([
            ["command", "01", "COMMAND"],
            ["missions", "02", "MISSIONS"],
            ["squad", "03", "SQUAD"],
            ["archive", "04", "ARCHIVE"],
          ] as const).map(([id, index, label]) => (
            <button type="button" key={id} className={deckTab === id ? "is-current" : ""}
              aria-pressed={deckTab === id} onClick={() => setDeckTab(id)}>
              <span>{index}</span><strong>{label}</strong>
            </button>
          ))}
        </nav>
        {deckTab === "command" ? <div className="t-command-pane" aria-label="Command overview">
        {field?.veteranProgressionAvailable && commanderRank>=3 ? <section className="t-panel" data-veteran-career="true">
          <div className="t-kicker">COMMANDER RANK {commanderRank} · VETERAN FOUNDATION</div>
          <strong>{commanderRank===4?"RANK 4 EARNED · PACK EXTRACTION OPEN":`NEXT: RANK 4 · ${field.veteranCareer?.credits || 0}/12 ROTATION CREDITS`}</strong>
          <progress className="t-progress" value={field.veteranCareer?.credits||0} max={12} />
          <p>{veteranRequirement(field.veteranCareer)}</p>
          <small>{field.veteranCareer?.lastCycle===field.board?.cycleId?"This rotation's credit is recorded. Continue for another companion's eligible goal, or return in a later rotation.":"Next: win a distinct Advanced Field Op. Choose a missing objective family or mission. No daily streak required."}</small>
          {commanderRank===4 ? <button type="button" className="t-btn" disabled={Boolean(field.activeMissionRun)} onClick={()=>useBattleStore.getState().openVeteranBrief()}>PLAY PACK EXTRACTION</button> : <button type="button" className="t-btn" disabled={Boolean(field.activeMissionRun)} onClick={()=>{const s=useBattleStore.getState(), mid=field.board?.activeMissionIds.find(id=>!field.veteranCareer?.missionIds.includes(id))||field.board?.activeMissionIds[0];if(mid){s.openOperationBrief(mid);useBattleStore.getState().selectDirectiveTier("advanced")}}}>PREPARE ADVANCED FIELD OP</button>}
        </section> : null}
        {recommendedMission ? (() => {
          const visual = missionPresentation(recommendedMission);
          return (
          <>
          <section className={`t-panel t-wt-feature t-wt-next-op t-command-mission-feature t-mission-tone-${visual.tone}`} aria-label="Recommended next operation" data-primary-purpose="true" data-purpose-mission={recommendedMission.missionId}>
            <div className="t-wt-feature-art">
              <img src={visual.art} alt="" aria-hidden="true" />
              <span className="t-wt-art-label">{visual.label}</span>
            </div>
            <div className="t-wt-feature-copy">
              <div className="t-kicker">{primaryPurpose?.title || "NEXT OP"}</div>
              <h2>{recommendedMission.name}</h2>
              <p className="t-wt-objective">{recommendedPurpose?.objectiveText}</p>
              <div className="t-player-route-metrics" aria-label="Next step and rotation progress">
                <span>{rotationProgress?.securedCount ?? activeMissionIds.filter(id => field?.records[id]?.lastClearCycle === currentCycleId).length}/{rotationProgress?.total || activeMissionIds.length} FIELD OPS SECURED</span>
                <span>{commanderRank >= 3 ? "COMMANDER CERTIFIED" : commanderTarget ? `${remainingToRank} TO RANK ${commanderRank + 1}` : "COMMANDER STATUS PENDING"}</span>
              </div>
              <p className="t-player-next-reason">{primaryPurpose?.resume ? "Accepted squad and conditions preserved · battle restarts at round 1." : primaryPurpose?.reason}</p>
              <div className="t-wt-reward-chips t-premium-reward-strip" aria-label="Mission progression rewards">
                <span>{primaryPurpose?.chapter ? "CHAPTER RECORD" : recommendedPurpose?.rewardClearText}</span>
                <span className={recommendedChallenge ? "is-earned" : ""}>
                  {primaryPurpose?.chapter ? "NO FIELD BONUS PROMISED" : recommendedPurpose?.rewardChallengeText}
                </span>
                <span>{primaryPurpose?.masteryChallenge ? field?.masteryPath?.firstLockdownClear ? "LOCKDOWN COMPLETION RECORDED" : "RELAY MASTERY COMPLETE · 1/1" : primaryPurpose?.chapter ? "Intel follows confirmed chapter completion" : recommendedPurpose?.rewardEligibility.clear === "SECURED" && recommendedPurpose?.rewardEligibility.challenge === "SECURED" ? "No new rotation bonus promised" : "Eligible clears / challenges can add Mastery"}</span>
              </div>
            </div>
            <div className="t-wt-feature-cta">
              <button className="t-btn t-btn-primary t-wt-main-cta t-command-hero-cta" type="button" disabled={loading} onClick={() => primaryPurpose && openPurpose(primaryPurpose)}>
                {primaryPurpose?.resume ? "RESUME OP" : primaryPurpose?.tier === "advanced" ? "REVIEW ADVANCED" : "VIEW BRIEF"}
                <ChevronRight className="t-ico" />
              </button>
            </div>
          </section>
          </>
          );
        })() : null}


        {!primaryPurpose ? <p role="status">No legal next mission confirmed. Refresh to load available operations.</p> : null}
        {purposeRoute.alternatives.length ? <section className="t-purpose-alternatives" aria-label="Optional alternatives">
          <span className="t-kicker">OTHER WAYS TO PLAY</span>
          {purposeRoute.alternatives.map(action => <article key={action.missionId} data-purpose-mission={action.missionId}>
            <span className="t-kicker">{action.title}</span><h3>{getMissionDef(action.missionId)?.name}</h3><p>{action.reason}</p>
            <button type="button" className="t-btn" disabled={loading} onClick={() => openPurpose(action)}>{action.tier === "advanced" ? "REVIEW ADVANCED" : "VIEW BRIEF"}</button>
          </article>)}
        </section> : null}
        <section className="t-purpose-memory t-command-records" aria-label="Permanent records and squad opportunity">
          <span className="t-kicker">PERMANENT FIELD RECORD</span>
          {field?.masteryPath ? <p data-mastery-progress="true">RELAY MASTERY · {field.masteryPath.accomplishment ? '1/1 · Relay Lockdown permanently unlocked.' : (field.commander?.rank || 0) >= 3 ? '0/1 · Win an Advanced Relay Hold or Isolated Hold. One is available each rotation.' : '0/1 · Reach Commander Rank 3, then win an Advanced HOLD to unlock Relay Lockdown.'}</p> : null}
          {field?.masteryPath?.firstLockdownClear ? <p data-lockdown-completion="true">RELAY LOCKDOWN · FIRST CLEAR RECORDED · Persists across rotations.</p> : null}
          {campaignCareer ? <p>{campaignCareer.missions} Field secures · {campaignCareer.challenges} challenges · {campaignCareer.advanced} Advanced clears · {campaignCareer.fronts} fronts secured</p> : null}
          {field?.lastResult ? <details className="t-command-record-details"><summary>LAST MISSION · {getMissionDef(field.lastResult.missionId)?.name || field.lastResult.missionId}</summary><p>{fieldResultPurpose(field.lastResult).changed}</p></details> : null}
          {(() => { const proof = ["ally-02", "ally-03", ...(progression?.equippedPet ? [`pet:${progression.equippedPet.id}`] : [])].map(id => savedMasteryProof(id, progression || {}, progression?.equippedPet)).find(Boolean); return proof ? <p>{proof.subject}: {proof.changes[0]}. Compare your saved specialization before deploying.</p> : <p>Review saved abilities and squad roles before your next mission.</p>; })()}
          <button type="button" className="t-btn" onClick={() => setDeckTab("squad")}>REVIEW SQUAD DEVELOPMENT</button>
        </section>

        <section className="t-wt-status-rail t-wt-status-rail-v29 t-premium-status-rail" aria-label="Tactical Ops overview">
          <div className="t-panel t-wt-status-card t-wt-rank-card">
            <span className="t-kicker">Commander</span>
            <strong>{commanderRank >= 4 ? "RANK 4 · VETERAN" : commanderRank >= 3 ? "RANK 3 · CERTIFIED" : commanderRank ? `RANK ${commanderRank}` : "STATUS UNAVAILABLE"}</strong>
            {commanderTarget ? (
              <>
                <progress className="t-progress" value={Math.min(commanderProgress, commanderTarget)} max={commanderTarget} />
                <small>{commanderProgress} / {commanderTarget} progress</small>
              </>
            ) : <small>{commanderRank >= 3 ? field?.veteranProgressionAvailable && commanderRank<4 ? "Certification complete · Veteran career open" : "All current command tools unlocked" : "Refresh to confirm Commander progress"}</small>}
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
          <button type="button" className="t-premium-front-link" onClick={() => setDeckTab("missions")}>
            <span><strong>FRONT STATUS</strong><small>{rotationProgress.securedCount}/{rotationProgress.total} SECURED · {rotationProgress.challengeMissionIds.length} CHALLENGES</small></span>
            <span>VIEW MISSIONS <ChevronRight className="t-ico" /></span>
          </button>
        ) : null}




        </div> : null}
        {deckTab === "missions" ? <div className="t-command-pane" aria-label="Operations and field missions">
        {acceptedChapter && chapterView ? <section className="t-panel t-chapter-readout" aria-label="Server accepted doctrine chapter">
          <div className="t-kicker">CAMPAIGN CHAPTER · SERVER RECORDED</div>
          <h2 className="t-title">{chapterView.title}</h2>
          <div className="t-chapter-steps">{acceptedChapter.status === "AVAILABLE" ? (Object.entries(DOCTRINES).map(([id,def]) =>
            <div key={id}><strong>{id} · {def.title}</strong><p>{def.copy}</p>{id==="RECON" ? <button type="button" className="t-btn t-btn-primary" disabled={loading||chapterSaving} onClick={()=>void chooseDoctrine()}>COMMIT TO GHOST SIGNAL</button> : <small>Future doctrine · not yet operational</small>}</div>)) :
            <><strong>{chapterView.stage} / {chapterView.total} OPERATIONS VERIFIED</strong>
            <p>{chapterView.nextMissionName ? `NEXT · ${chapterView.nextMissionName}` : "CHAPTER COMPLETE"}</p></>}</div>
          {acceptedChapter.status==="ACTIVE" && acceptedChapter.doctrine==="RECON" ? <button type="button" className="t-btn t-btn-primary" disabled={loading||chapterSaving} onClick={openChapterBrief}>{acceptedChapter.activeRunId?"RESUME CHAPTER RUN":"DEPLOY NEXT CHAPTER OP"}</button>:null}
          {acceptedChapter.status==="COMPLETED"?<strong>{acceptedChapter.intelConsumedByRunId?"INTEL DEPLOYED IN AN ACCEPTED RUN":"RECON INTEL READY · DELAY NEXT ELIGIBLE REINFORCEMENT"}</strong>:null}
          <p>{chapterView.consequence}</p>
          <small>{acceptedChapter.status === "AVAILABLE" ? "Doctrine selection becomes playable only after the server exposes a verified choice action. No client-only selection." : "Mission progress advances only on the next accepted server receipt. Existing Field Ops can still be played normally."}</small>
        </section> : null}

        {deadRelay?.status !== "cleared" ? deadRelayCampaign : null}


        <section className="t-panel t-wt-section t-wt-current-ops" aria-label="Current Field Ops">
          <div className="t-wt-section-head">
            <div>
              <div className="t-kicker">This rotation</div>
              <h2 className="t-title">CURRENT FIELD OPS</h2>
            </div>
            <span>{activeMissionIds.length} ACTIVE</span>
          </div>
          <nav className="t-op-selector" aria-label="Select a Field Op">
            {activeMissionDefs.map((mission, index) => (
              <button key={mission.missionId} type="button" aria-pressed={(selectedFieldOp && activeMissionIds.includes(selectedFieldOp) ? selectedFieldOp : activeMissionIds[0]) === mission.missionId}
                className={(selectedFieldOp && activeMissionIds.includes(selectedFieldOp) ? selectedFieldOp : activeMissionIds[0]) === mission.missionId ? "is-selected" : ""}
                onClick={() => setSelectedFieldOp(mission.missionId)}>
                <span>{String(index + 1).padStart(2, "0")}</span><strong>{mission.name}</strong>
                <small>{securedMissionIds.has(mission.missionId) ? "SECURED" : "FIRST CLEAR"}</small>
              </button>
            ))}
          </nav>
          <div className="t-wt-mission-list t-op-selected">
            {activeMissionDefs.filter(mission => mission.missionId === (selectedFieldOp && activeMissionIds.includes(selectedFieldOp) ? selectedFieldOp : activeMissionIds[0])).map((mission) => {
              const record = field?.records[mission.missionId];
              const securedToday = record?.lastClearCycle === field?.board?.cycleId;
              const bonusEarned = record?.lastChallengeCycle === field?.board?.cycleId;
              const contextualMission = missionForContext(mission, { reportVersion: field?.board?.reportVersion || 2 });
              const visual = missionPresentation(contextualMission);
              const cardPurpose = deriveMissionPresentation(contextualMission, field);
              return (
                <article className={`t-wt-mission-card t-panel t-mission-tone-${visual.tone} ${securedToday ? "is-cleared" : "is-active"}`} key={mission.missionId}>
                  <div className="t-wt-mission-art">
                    <img src={visual.art} alt="" aria-hidden="true" />
                    <span className="t-wt-mission-type">{visual.label}</span>
                  </div>
                  <div className="t-wt-mission-body">
                    <div className="t-wt-mission-head">
                      <div>
                        <h3>{mission.name}</h3>
                        <p>{objectiveHeadline(contextualMission)}</p>
                      </div>
                      <div className="t-wt-mission-state">{securedToday ? "SECURED TODAY" : "AVAILABLE"}</div>
                    </div>
                    <div className="t-player-mission-counter">OPERATION {activeMissionIds.indexOf(mission.missionId) + 1} / {activeMissionIds.length} · {visual.label} · {securedToday ? "CLEARED" : "UNCLEARED"}</div>
                    <div className="t-wt-mission-meta">
                      <span><b>CLEAR</b> {cardPurpose.rewardClearText}</span>
                      <span className={bonusEarned ? "is-earned" : ""}><b>CHALLENGE</b> {cardPurpose.rewardChallengeText} · {contextualMission.challenge?.label}</span>
                    </div>
                    <details className="t-detail t-wt-card-detail">
                      <summary>Field conditions</summary>
                      <p><strong>{missionDirectiveLabel(mission)}.</strong> {cardPurpose.tacticalThreat}</p>
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




        </div> : null}
        {deckTab === "squad" ? <div className="t-command-pane" aria-label="Character progression and mastery">
        <div className="t-premium-squad-switch" role="group" aria-label="Squad progression view">
          <button type="button" aria-pressed={squadView === "skillbook"} className={squadView === "skillbook" ? "is-selected" : ""} onClick={() => setSquadView("skillbook")}>SIGNAL ATLAS</button>
          <button type="button" aria-pressed={squadView === "mastery"} className={squadView === "mastery" ? "is-selected" : ""} onClick={() => setSquadView("mastery")}>PACK MASTERY</button>
        </div>
        {squadView === "skillbook" ? <SkillbookPanel onClose={() => setDeckTab("command")} /> : <PackMasteryPanel />}


        </div> : null}
        {deckTab === "archive" ? <div className="t-command-pane" aria-label="Campaign archive and test settings">
        {deadRelay?.status === "cleared" ? deadRelayCampaign : null}


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

        <section className="t-panel t-wt-battlefield-lab" aria-label="Battlefield Lab testing mode">
          <div>
            <span className="t-kicker">BATTLEFIELD LAB · DEVICE TEST</span>
            <strong>{BATTLEFIELD_VNEXT_PREVIEW ? "10 × 7 · EXPERIMENTAL" : "8 × 5 · CURRENT"}</strong>
            <p>Compare real missions with your signed-in Alpha account. This setting changes only the battlefield on this device. It does not reset or replace your account.</p>
          </div>
          <button type="button" className="t-btn" aria-label={BATTLEFIELD_VNEXT_PREVIEW ? "Switch to current 8 by 5 battlefield" : "Switch to experimental 10 by 7 battlefield"} onClick={() => {
            try {
              if (BATTLEFIELD_VNEXT_PREVIEW) {
                window.localStorage.removeItem(BATTLEFIELD_LAB_KEY);
                // Also remove a legacy URL preview override, if present.
                const url = new URL(window.location.href);
                if (url.searchParams.has("tacticalBattlefieldVNext")) {
                  url.searchParams.delete("tacticalBattlefieldVNext");
                  window.location.replace(url.toString());
                  return;
                }
              } else {
                window.localStorage.setItem(BATTLEFIELD_LAB_KEY, "10x7");
              }
              window.location.reload();
            } catch (_) { window.alert("Could not save the test mode on this device."); }
          }}>
            {BATTLEFIELD_VNEXT_PREVIEW ? "USE 8 × 5" : "TEST 10 × 7"}
          </button>
        </section>


        </div> : null}
      </div>
    </div>
  );
}

function Brief() {
  const [briefTab, setBriefTab] = useState<"mission" | "squad" | "loadout" | "intel">("mission");
  const [loadoutUnit, setLoadoutUnit] = useState<string>("alpha");
  const [showBriefMastery, setShowBriefMastery] = useState(false);
  const identity = useBattleStore(s => s.identity);
  const deploy = useBattleStore((s) => s.deploy);
  const backToHub = useBattleStore((s) => s.backToHub);
  const onboardingEnabled = useBattleStore((s) => s.onboardingEnabled);
  const onboardingStageId = useBattleStore((s) => s.onboardingStageId);
  const selectedMissionId = useBattleStore((s) => s.selectedMissionId);
  const selectedSquadIds = useBattleStore((s) => s.selectedSquadIds);
  const selectedApproach = useBattleStore((s) => s.selectedApproach);
  const selectedDirectiveTier = useBattleStore((s) => s.selectedDirectiveTier);
  const selectedVeteranChallenge = useBattleStore((s)=>s.selectedVeteranChallenge);
  const selectedLockdownPlan = useBattleStore((s) => s.selectedLockdownPlan);
  const selectLockdownPlan = useBattleStore((s) => s.selectLockdownPlan);
  const selectedMasteryChallenge = useBattleStore((s) => s.selectedMasteryChallenge);
  const selectDirectiveTier = useBattleStore((s) => s.selectDirectiveTier);
  const selectApproach = useBattleStore((s) => s.selectApproach);
  const field = useBattleStore((s) => s.progression?.fieldOps);
  const packMastery = useBattleStore((s) => s.progression?.packMastery);
  const playerGrowth = useBattleStore((s) => s.progression?.playerGrowth);
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
  const chapterMode = useBattleStore((s) => s.chapterMode);
  const chapterActive = useBattleStore((s) => s.progression?.chapterActiveMission);
  const campaignRun = useBattleStore((s) => s.progression?.operations?.[DEAD_RELAY.operationId]?.activeMissionRun);
  const campaignIntel = useBattleStore((s) => s.progression?.campaignIntel?.["dead-relay"]?.courierTraceAcquired === true);
  const campaignContext = campaignRun?.missionId === selectedMissionId ? campaignRun.campaignContext : { version: 1 as const, courierTraceAcquired: campaignIntel };
  const baseMission = getMissionDef(selectedMissionId);
  const campaignMission = baseMission?.operationId === DEAD_RELAY.operationId;
  const savedRun = chapterMode ? chapterActive : campaignMission ? campaignRun : field?.activeMissionRun;
  const briefPane = useRef<HTMLDivElement>(null);
  useEffect(()=>{if(selectedMissionId==="field-relay-intercept" && savedRun?.runId){setBriefTab("mission");briefPane.current?.scrollTo({top:0});}},[selectedMissionId,savedRun?.runId]);
  const resuming = savedRun?.missionId === selectedMissionId && savedRun.squadIds.join(",") === selectedSquadIds.join(",") && (savedRun.fieldContext?.approach || "standard") === selectedApproach && (savedRun.fieldContext?.directiveTier || "standard") === selectedDirectiveTier;
  const fieldContext = resuming && savedRun?.fieldContext ? savedRun.fieldContext : selectedVeteranChallenge ? {reportVersion:6,veteranChallenge:"pack-extraction-v1" as const,pressure:2,directiveTier:"advanced" as const,directiveSet:"pursuit" as const} : selectedMasteryChallenge ? { pressure:2, reportVersion:field?.lockdownPlansAvailable ? 5 : 4, ...(field?.lockdownPlansAvailable ? {lockdownPlan:selectedLockdownPlan} : {}), directiveTier:'advanced' as const, directiveSet:'pursuit' as const, masteryChallenge:selectedMasteryChallenge } : { pressure: field?.region?.pressure ?? 2, reportVersion: field?.board?.reportVersion || 2, directiveTier: selectedDirectiveTier, directiveSet: field?.board?.directiveSet };
  const mission = baseMission ? missionForContext(baseMission, fieldContext, resuming ? savedRun?.rulesContract?.missionRevision : undefined) : null;
  const fieldOp = mission?.activity === "FIELD_OP";
  const twoSlots = Boolean(mission && (fieldOp || campaignMission || mission.objectiveType === "BOSS"));
  const baseSpawns = mission ? missionSpawnsForSquad(mission, selectedSquadIds, equippedPet, selectedApproach)
    || ((fieldOp || campaignMission) ? missionSpawnsForSquad(mission, ["alpha", "ally-02", "ally-03"], equippedPet)!
      : mission.objectiveType === "RECOVER" ? recoverSpawnsForSquad(["alpha", "ally-02"])! : BROKEN_SIGNAL_COMMANDER_SPAWNS.filter((spawn) => !["ally-02", "ally-03"].includes(spawn.defId))) : encounter.spawns;
  const spawns = mission ? withTeammateSidegrades(baseSpawns, { kodaSidegrade, shadowSidegrade, packMastery: resuming ? savedRun?.packMastery || {} : packMastery }) : baseSpawns;
  const conditions = mission ? missionDirectives(mission, fieldContext) : [];
  const chapterIntel = useBattleStore((s)=>s.currentChapterIntel);
  const reinforcementRound = mission && (fieldOp || campaignMission) ? (chapterIntel?.effectiveRound || missionBattleRules(mission, false, fieldContext, campaignContext).reinforcement?.triggerRound) : undefined;
  const title = mission ? mission.name : onboardingEnabled ? encounter.operationName : OPERATION.name;
  const objective = mission ? mission.briefCopy : onboardingEnabled ? encounter.objective : OPERATION.objective;
  const allies = alliedBriefDefs(spawns).map(def => applyIdentityToAlpha(def, identity));
  // Render the exact server-accepted roster and skills, including any immutable run snapshot.
  const previewGrowth = resuming ? savedRun?.playerGrowth : playerGrowth;
  const equippedProtocols = equippedSignalCodex(allies, previewGrowth);
  const activeSlots = activeProtocolSlots(allies, previewGrowth);
  const readyCounters = counterplayReadiness(activeSlots, previewGrowth, TACTICAL_VNEXT_ENABLED);
  const s3Goals = s3TrainingGoals(mission, allies.map(u => u.defId), resuming ? savedRun?.rulesContract?.rulesetVersion === "tactical-intent-vnext.0" : Boolean(useBattleStore.getState().progression?.vnextStartAvailable));
  const selectedTradeoff = squadTradeoff(
    selectedSquadIds.length ? selectedSquadIds : allies.map(u => u.defId),
    equippedPet?.id,
  );

  const hostiles = enemyBriefRows(spawns);
  const footnote = mission
    ? `${mission.objectiveType} · Squad cap ${mission.squadCap}. `
    : onboardingEnabled
      ? encounter.teaching
      : "Units act individually by Speed. Alpha must close to melee range 1 before Strike or Rend.";
  const primaryObjective = fieldOp || campaignMission ? `PRIMARY OBJECTIVE: ${mission.objectiveType}` : mission?.objectiveType === "RECOVER" ? "PRIMARY OBJECTIVE: RECOVER THE SIGNAL" : mission?.objectiveType === "BOSS" ? "PRIMARY OBJECTIVE: DEFEAT THE SIGNAL COMMANDER" : mission?.objectiveType === "ELIMINATE" ? "PRIMARY OBJECTIVE: ELIMINATE HOSTILES" : null;
  const recruitMoment = !mission && onboardingEnabled && onboardingStageId === "ally-koda" ? "CNC JOINED · ROSTER UPDATED" : !mission && onboardingEnabled && onboardingStageId === "full-broken-signal" ? "SHADOW JOINED · FULL SQUAD READY" : null;
  const missionIntel = campaignMission
    ? mission?.missionId === "dead-relay-courier" ? "EARLY INTERCEPT: first win by round 4 grants Courier Trace. Slower victory still unlocks Hold."
      : mission?.missionId === "dead-relay-hold" ? `COURIER TRACE ${campaignContext.courierTraceAcquired ? "ACTIVE: HOUND ROUND 3" : "NOT ACQUIRED: HOUND ROUND 2"}`
      : "Guardian reinforcement arrives on round 3."
    : mission?.objectiveType === "BOSS" ? "Routing Trace telegraphs the fixed reinforcement." : mission?.missionId === "broken-signal-breach" ? "TRACE target can reveal Routing Trace." : "No Intel required.";
  const purpose = mission ? deriveMissionPresentation(mission, field, resuming ? savedRun : null, field?.lastResult, fieldContext) : null;
  const buildNotes = mission ? buildFit(mission, allies, previewGrowth) : [];
  const trainingSteps = !mission && onboardingEnabled ? encounter.steps : [];
  const rewardTruth = purpose?.rewardEligibility;
  const missionVisual = mission ? missionPresentation(mission) : { art: PRESENTATION.operationPlate, tone: "assault", label: "TACTICAL OPS" };
  return (
    <div className="t-fill">
      <Background dim={0.58} />
      <div ref={briefPane} className="t-brief t-deployment t-deployment-v29 t-command-art-shell t-premium-ux">
        <header className={`t-deploy-hero t-deploy-hero-v29 t-command-brief-hero t-mission-tone-${missionVisual.tone}`}>
          <img src={missionVisual.art} alt="" aria-hidden="true" />
          <div className="t-deploy-hero-copy">
            <div className="t-deploy-mode-label">{missionVisual.label}</div>
            <div className="t-kicker">{fieldOp ? "FIELD OPS" : "TACTICAL OPS"} / MISSION BRIEF</div>
            <h1 className="t-title">{title}</h1>
            <p>{mission ? objectiveHeadline(mission) : objective}</p>
          </div>
          {fieldOp && field?.board ? <div className="t-deploy-rotation"><span className="t-kicker">Rotation</span><strong>{rotationTime(field.board.nextRotationAt)}</strong></div> : null}
        </header>


        <nav className="t-command-nav t-deploy-command-nav t-command-framed-nav" aria-label="Mission preparation sections">
          {([
            ["mission", "01", "MISSION"],
            ["squad", "02", "SQUAD"],
            ["loadout", "03", "LOADOUT"],
            ["intel", "04", "INTEL"],
          ] as const).map(([id, index, label]) => (
            <button type="button" key={id} className={briefTab === id ? "is-current" : ""}
              aria-pressed={briefTab === id} onClick={() => setBriefTab(id)}>
              <span>{index}</span><strong>{label}</strong>
            </button>
          ))}
        </nav>
        {briefTab === "mission" ? <div className="t-command-pane t-deploy-command-pane" aria-label="Mission objective and rewards">
        {recruitMoment ? <div className="t-recruit-moment">{recruitMoment}</div> : null}
        {campaignMission ? <div className="t-panel t-deploy-overview"><strong>MISSION INTEL</strong><p>{missionIntel}</p></div> : null}

        <section className={`t-panel t-deploy-overview ${trainingSteps.length ? "t-training-overview" : ""}`} aria-label="Mission overview">
          <div className="t-deploy-summary-main">
            <div className="t-kicker">{trainingSteps.length ? "YOUR TRAINING GOAL" : fieldContext.masteryChallenge ? fieldContext.lockdownPlan === "crosslink" ? "LOCKDOWN · RELAY CHECKPOINTS" : "LOCKDOWN · EXACT TILE CONTROL" : "OBJECTIVE"}</div>
            <strong>{fieldContext.lockdownPlan ? mission?.briefCopy : fieldContext.masteryChallenge ? "Hold the exact relay tile · 3 consecutive round changes · finish by round 6." : purpose?.objectiveText || (primaryObjective ? primaryObjective.replace("PRIMARY OBJECTIVE: ", "") : objective)}</strong>
            {trainingSteps.length ? (
              <ol className="t-training-steps" aria-label="How to complete this training">
                {trainingSteps.map((step, index) => <li key={step}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{step}</p></li>)}
              </ol>
            ) : <p>{purpose ? `FAIL IF: ${purpose.failConditionText}` : footnote}</p>}
            {fieldContext.lockdownPlan === "crosslink" ? <div className="t-lockdown-rule" role="note"><strong>NORTH → EAST → SOUTH</strong><span>Control is checked at round changes. Move between checkpoints; missing one resets to north.</span></div> : fieldContext.masteryChallenge ? <div className="t-lockdown-rule" role="note"><strong>EXACT TILE ONLY</strong><span>Adjacent allies cannot hold. Enemies within 1 tile interrupt control.</span></div> : null}
            {purpose && !fieldContext.masteryChallenge ? <p className="t-brief-purpose-meta"><b>WATCH FOR:</b> {purpose.tacticalThreat}</p> : null}
            {mission?.objective?.type==="INTERCEPT" && mission.objective.screenedEscape ? <p className="t-deploy-resume" data-intercept-formation="2"><b>SCREENED COURIER · FORMATION LOCKED</b><br />Rally and pursue for tempo, or use a mobile chase to limit exposure. A southern exit blockade buys time but commits a defender.</p> : mission?.missionId==="field-relay-intercept" && !resuming ? <p className="t-deploy-resume">Lock your squad to review server-confirmed conditions before combat. No turn begins during review.</p> : null}
            {buildNotes.length ? <details className="t-mission-extra" aria-label="Optional squad tactics">
              <summary>SQUAD TACTICS <span>OPTIONAL</span></summary>
              {buildNotes.map(row => <p key={row}>{row}</p>)}
              {resuming ? <small>Saved mission: your original squad and equipment remain locked.</small> : null}
            </details> : null}
            {purpose ? <details className="t-mission-extra" aria-label="Mission outcome and recording">
              <summary>WHAT HAPPENS AFTER <span>DETAILS</span></summary>
              <p>{purpose.nextConsequence}</p>
            </details> : null}
          </div>
          {fieldOp ? (
            <>
              <div className="t-deploy-summary-card">
                <span className="t-kicker">{fieldContext.masteryChallenge ? 'Completion' : 'Clear reward'}</span>
                <strong>{purpose?.rewardClearText}</strong>
                <small>{rewardTruth?.copy}</small>
              </div>
              <div className="t-deploy-summary-card">
                <span className="t-kicker">{fieldContext.masteryChallenge ? 'Optional condition' : 'Bonus challenge'}</span>
                <strong>{purpose?.rewardChallengeText}</strong>
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


        </div> : null}
        {briefTab === "squad" ? <div className="t-command-pane t-deploy-command-pane" aria-label="Squad composition and mastery">
        <section className="t-panel t-deploy-squad" aria-label="Squad">
          <div className="t-wt-section-head">
            <div>
              <div className="t-kicker">Squad</div>
              <h2 className="t-title">{allies.length} / {mission?.squadCap || allies.length} DEPLOYED</h2>
            </div>
            {resuming ? <span>{campaignMission ? "RESUMING ACCEPTED RUN · ROUND 1 RESTART" : "RESUMING SAVED RUN"}</span> : null}
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
                  return <button key={candidate.id} type="button" aria-pressed={selected} disabled={busy || Boolean(savedRun?.fieldContext?.lockdownPlan) || savedRun?.fieldContext?.progressionVersion===2 || kodaSavePending || shadowSavePending || !candidate.available || (!selected && selectedSquadIds.length >= 3)} className={`t-btn ${selected ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => toggleCommanderTeammate(candidate.id)}>{candidate.label}<br /><small>{candidate.role}</small></button>;
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


        {mission ? <div className="t-brief-mastery-optional">
          <button type="button" className="t-brief-optional-toggle" aria-expanded={showBriefMastery} onClick={() => setShowBriefMastery(value => !value)}>
            <strong>PACK MASTERY</strong><span>{showBriefMastery ? "HIDE DETAILS −" : "VIEW PROGRESSION +"}</span>
          </button>
          {showBriefMastery ? <PackMasteryPanel snapshot={resuming ? savedRun?.packMastery : undefined} /> : null}
        </div> : null}
        </div> : null}
        {briefTab === "loadout" ? <div className="t-command-pane t-deploy-command-pane" aria-label="Equipped protocols and sidegrades">
        <section className="t-panel t-codex-brief" aria-label="Signal Codex equipped capabilities">
          <div className="t-wt-section-head"><div>
            <span className="t-kicker">SQUAD BUILD · REAL ABILITIES</span>
            <h2 className="t-title">SIGNAL CODEX</h2>
          </div></div>
          <p className="t-codex-tradeoff">{selectedTradeoff}</p>
          {s3Goals.length ? <details className="t-detail t-s3-training" aria-label="Optional tactical training goals"><summary>OPTIONAL TRAINING · {s3Goals.length} TACTICAL GOALS</summary>{s3Goals.map(goal => <div className="t-s3-goal" key={goal.id}><strong>{goal.title}</strong><p>{goal.instruction}</p><small>{goal.requirement}</small></div>)}</details> : null}
          <p className="t-codex-note">Current squad's equipped protocols, based on real A1/A2/A3 abilities. No extra skills or battle slots are granted.</p>
          <div className="t-codex-loadout">
            <strong>ACTIVE LOADOUT · EXISTING ABILITY SLOTS</strong>
            <small>Change your squad above. Saved CNC / SHADOW variants can be selected below when unlocked; existing A1 / A2 / A3 cooldown rules stay in force.</small>
            <nav className="t-loadout-unit-picker" aria-label="Select unit abilities">
              {allies.map(unit => <button type="button" key={unit.defId} className={(allies.some(x => x.defId === loadoutUnit) ? loadoutUnit : allies[0]?.defId) === unit.defId ? "is-selected" : ""}
                aria-pressed={(allies.some(x => x.defId === loadoutUnit) ? loadoutUnit : allies[0]?.defId) === unit.defId}
                onClick={() => setLoadoutUnit(unit.defId)}>
                <img src={unit.portrait} alt="" onError={portraitFallback} />
                <span>{unit.defId === "ally-02" ? "CNC" : unit.defId === "ally-03" ? "SHADOW" : unit.defId.startsWith("pet:") ? "PET" : unit.name}</span>
              </button>)}
            </nav>
            {allies.filter(unit => unit.defId === (allies.some(x => x.defId === loadoutUnit) ? loadoutUnit : allies[0]?.defId)).map(unit => (
              <div className="t-codex-unit" key={unit.defId}>
                <b>{unit.name} · {unit.defId.startsWith("pet:") ? "2 ABILITIES" : "3 ABILITIES"}</b>
                <div className="t-codex-slots">
                  {activeSlots.filter(x => x.unitId === unit.defId).map((slot, index) => (
                    <div key={slot.skillId+index} className="t-codex-slot">
                      <strong>{slot.slot} · {slot.name}</strong>
                      <small>{slot.family || "BASIC ATTACK"} · CD {slot.cooldown} · RANGE {slot.minRange}–{slot.maxRange}</small>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="t-codex-counterlist" aria-label="Tactical counter options">
            <strong>COUNTERPLAY AVAILABLE TO THIS SQUAD</strong>
            <div className="t-codex-counters">
              {readyCounters.map(counter => (
                <div key={counter.id} className={`t-codex-counter ${counter.available ? "is-ready" : "is-missing"}`}>
                  <b>{counter.label} · {counter.available ? "READY" : "NOT EQUIPPED"}</b>
                  <small>{counter.source || counter.detail}</small>
                </div>
              ))}
            </div>
          </div>
          <div className="t-codex-variants">
            <strong>EXISTING SAVED VARIANTS</strong>
            {resuming ? <small className="t-codex-note">Accepted run · squad and variants are locked until this mission ends.</small> : null}
          {mission && spawns.some((spawn) => spawn.defId === "ally-02") ? (
            <div className="t-panel t-brief-block t-sidegrade-card">
              <div className="t-kicker">CNC · BUG HUNTER WARDEN</div>
              {sidegradesUnlocked ? <>
                <div className="t-brief-actions">
                  <button type="button" disabled={resuming || busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "A"} className={`t-btn ${kodaSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("A")}>A · VANGUARD</button>
                  <button type="button" disabled={resuming || busy || kodaSavePending || shadowSavePending} aria-pressed={kodaSidegrade === "B"} className={`t-btn ${kodaSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectKodaSidegrade("B")}>B · DISRUPTOR</button>
                </div>
                <small>{kodaSavePending ? "Saving CNC choice…" : kodaSidegrade ? `SAVED · ${kodaSidegrade === "A" ? "VANGUARD" : "DISRUPTOR"}` : "Base CNC · no sidegrade selected"}</small>
                {!kodaSavePending && !resuming && savedSidegradeProof("ally-02", { kodaSidegrade, shadowSidegrade, packMastery }, playerGrowth) ? <div className="t-growth-delta" aria-label="CNC saved sidegrade power proof">{savedSidegradeProof("ally-02", { kodaSidegrade, shadowSidegrade, packMastery }, playerGrowth)!.changes.map(x => <b key={x}>{x}</b>)}</div> : null}
              </> : <small>CNC sidegrades unlock after BROKEN SIGNAL is cleared.</small>}
            </div>
          ) : null}

          {mission && spawns.some((spawn) => spawn.defId === "ally-03") ? (
            <div className="t-panel t-brief-block t-sidegrade-card">
              <div className="t-kicker">SHADOW · STAFF SUPPORT</div>
              {sidegradesUnlocked ? <>
                <div className="t-brief-actions">
                  <button type="button" disabled={resuming || busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "A"} className={`t-btn ${shadowSidegrade === "A" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("A")}>A · RESTORER</button>
                  <button type="button" disabled={resuming || busy || kodaSavePending || shadowSavePending} aria-pressed={shadowSidegrade === "B"} className={`t-btn ${shadowSidegrade === "B" ? "t-btn-primary" : "t-btn-ghost"}`} onClick={() => void selectShadowSidegrade("B")}>B · WARDEN</button>
                </div>
                <small>{shadowSavePending ? "Saving SHADOW choice…" : shadowSidegrade ? `SAVED · ${shadowSidegrade === "A" ? "RESTORER" : "WARDEN"}` : "Base SHADOW · no sidegrade selected"}</small>
                {!shadowSavePending && !resuming && savedSidegradeProof("ally-03", { kodaSidegrade, shadowSidegrade, packMastery }, playerGrowth) ? <div className="t-growth-delta" aria-label="SHADOW saved sidegrade power proof">{savedSidegradeProof("ally-03", { kodaSidegrade, shadowSidegrade, packMastery }, playerGrowth)!.changes.map(x => <b key={x}>{x}</b>)}</div> : null}
              </> : <small>SHADOW sidegrades unlock after BROKEN SIGNAL is cleared.</small>}
            </div>
          ) : null}


          </div>
          <details className="t-codex-reference"><summary>ALL PROTOCOL FAMILIES · REFERENCE</summary>
          <div className="t-codex-grid">
            {SIGNAL_FAMILIES.map(family => {
              const protocols = equippedProtocols.filter(p => p.family === family);
              return <div className="t-codex-family" key={family}>
                <strong>{family.toUpperCase()}</strong>
                {protocols.length ? protocols.map((p, index) =>
                  <div key={p.unit + p.skillId + index} className="t-codex-skill">
                    <b>{p.unit} · {p.slot} {p.skillName}</b>
                    <small>CD {p.cooldown} · {p.description}</small>
                  </div>) : <small className="t-codex-empty">No equipped protocol in this family.</small>}
              </div>;
            })}
          </div>
          </details>
        </section>


        </div> : null}
        {selectedMasteryChallenge && ((field?.lockdownPlansAvailable && !resuming) || fieldContext.lockdownPlan) ? <section className="t-panel t-lockdown-plans" aria-label="Deployment plans">
          <div className="t-kicker">{resuming ? "ACCEPTED PLAN · LOCKED" : "CHOOSE A PLAN · OPTIONAL PRACTICE"}</div>
          <div className="t-lockdown-plan-grid">{(["anchor", "crosslink"] as const).map(plan => <button type="button" key={plan} data-lockdown-plan={plan} aria-pressed={(fieldContext.lockdownPlan || selectedLockdownPlan) === plan} disabled={busy || resuming} onClick={() => selectLockdownPlan(plan)}>
            <strong>{LOCKDOWN_PLANS[plan].name}</strong><span><b>Benefit:</b> {LOCKDOWN_PLANS[plan].benefit}</span><span><b>Cost:</b> {LOCKDOWN_PLANS[plan].cost}</span><span><b>Priority:</b> {LOCKDOWN_PLANS[plan].priority}</span>
          </button>)}</div><small>Plan freezes when the server accepts deployment. No currency or progression reward.</small>
        </section> : null}
        {briefTab === "intel" ? <div className="t-command-pane t-deploy-command-pane" aria-label="Mission conditions and enemy intelligence">
        {conditions.length || fieldOp ? (
          <section className="t-panel t-deploy-rules">
            <div className="t-command-conditions-head">
              <span><span className="t-kicker">Tactical setup</span><strong>CONDITIONS & APPROACH</strong></span>
              <b>{selectedDirectiveTier.toUpperCase()}{selectedApproach !== "standard" ? ` · ${DEPLOYMENT_APPROACHES[selectedApproach].name}` : ""}</b>
            </div>

            {conditions.length ? <section className="t-conditions" aria-label="Special conditions">
              {conditions.map((condition) => <div className="t-condition t-condition-v29" key={condition.type}>
                <strong>{condition.maxRounds ? `DEADLINE · ROUND ${condition.maxRounds}` : condition.reinforcement ? `REINFORCEMENTS · ROUND ${reinforcementRound}` : condition.supportCooldownExtra ? "LIMITED SUPPORT · +1 TURN" : condition.name}</strong>
                <p>{condition.copy}</p>
              </div>)}
              {mission?.squadHint ? <p className="t-deploy-tip"><strong>Squad tip:</strong> {mission.squadHint}</p> : null}
            </section> : null}

            {fieldOp ? <div className="t-deployment-options t-deployment-options-v29">
              {resuming ? <p className="t-deploy-resume">Original conditions are locked for this saved run. Finish it before starting a different challenge.</p> : null}
              {fieldContext.masteryChallenge ? <p>RELAY MASTERY · 1/1 · Permanent Relay Lockdown access. Fixed pressure and deadline; support follows the accepted plan.</p> : field?.board?.reportVersion === 3 ? <>
                <div className="t-kicker">Directive tier</div>
                <div className="t-brief-actions">{(["standard", "advanced"] as const).map((tier) => <button type="button" className={`t-btn ${selectedDirectiveTier === tier ? "t-btn-primary" : ""}`} key={tier} aria-pressed={selectedDirectiveTier === tier} disabled={busy || !field.commander?.unlockedDirectiveTiers?.includes(tier)} onClick={() => selectDirectiveTier(tier)}>{tier.toUpperCase()}{tier === "advanced" && !field.commander?.unlockedDirectiveTiers?.includes(tier) ? " / RANK 3" : ""}</button>)}</div>
                <small>{selectedDirectiveTier === "advanced" ? `${directiveSetLabel(fieldContext.directiveSet)} · Advanced clear is recorded.` : "Standard field conditions."}</small>
              </> : null}

              <div className="t-kicker">Deployment approach</div>
              <div className="t-brief-actions">{(["standard", "south"] as const).map((approach) => <button type="button" key={approach} className={`t-btn ${selectedApproach === approach ? "t-btn-primary" : ""}`} aria-pressed={selectedApproach === approach} disabled={busy || !field?.commander?.unlockedApproaches.includes(approach)} onClick={() => selectApproach(approach)}>{DEPLOYMENT_APPROACHES[approach].name}{approach === "south" && !field?.commander?.unlockedApproaches.includes("south") ? " / RANK 2" : ""}</button>)}</div>
              <small>{DEPLOYMENT_APPROACHES[selectedApproach].copy}</small>
            </div> : null}
          </section>
        ) : null}


        {mission ? <details className="t-panel t-deploy-depth">
          <summary><span><span className="t-kicker">Optional depth</span><strong>MASTERY & LOADOUT</strong></span><b>VIEW</b></summary>


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


        </div> : null}
        <div className="t-brief-actions t-deploy-actions t-deploy-actions-v29 t-command-action-dock">
          <button type="button" className="t-btn t-btn-ghost" onClick={backToHub}>BACK</button>
          <button type="button" className="t-btn t-btn-primary" onClick={deploy} disabled={busy || kodaSavePending || shadowSavePending || (Boolean(mission) && !missionSpawnsForSquad(mission!, selectedSquadIds, equippedPet))}>
            {mission?.missionId==="field-relay-intercept" && !resuming ? "LOCK SQUAD · REVIEW FORMATION" : "DEPLOY SQUAD"}
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
  const campaignResult = useBattleStore((s) => s.campaignResult);
  const chapterResult = useBattleStore((s) => s.chapterResult);
  const chapterMode = useBattleStore((s) => s.chapterMode);
  const saveChapterResult = useBattleStore((s) => s.saveChapterResult);
  const saveCampaignResult = useBattleStore((s) => s.saveCampaignResult);
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
  const s3CombatProof = useBattleStore((s) => s.s3CombatProof);
  const currentRunKey = useBattleStore((s) => s.currentRunKey);
  const activeRulesetVersion = useBattleStore((s) => s.activeRulesetVersion);
  const selectedSquadIds = useBattleStore((s) => s.selectedSquadIds);
  const encounter = resolveCurrentEncounter(onboardingEnabled, onboardingStageId);
  const resultBaseMission = getMissionDef(selectedMissionId);
  const confirmedVariant = matchingAfterActionReceipt(fieldResult, currentRunKey, selectedMissionId)?.masteryChallenge;
  const veteranReceipt = matchingAfterActionReceipt(fieldResult,currentRunKey,selectedMissionId)?.veteranChallenge;
  const mission = resultBaseMission && veteranReceipt ? missionForContext(resultBaseMission,{reportVersion:6,veteranChallenge:veteranReceipt}) : resultBaseMission && confirmedVariant ? missionForContext(resultBaseMission,{reportVersion:fieldResult?.lockdownPlan ? 5 : 4,masteryChallenge:confirmedVariant,lockdownPlan:fieldResult?.lockdownPlan}) : resultBaseMission;
  const fieldOp = mission?.activity === "FIELD_OP";
  const campaignMission = mission?.operationId === DEAD_RELAY.operationId;
  const resultNext = commandPurpose(progression).primary;
  const nextSuggested = resultNext || nextFieldMission(progression?.fieldOps, selectedMissionId);
  const nextSuggestedBase = getMissionDef(nextSuggested.missionId);
  const nextSuggestedMission = nextSuggestedBase && resultNext?.masteryChallenge ? missionForContext(nextSuggestedBase,{reportVersion:4,masteryChallenge:resultNext.masteryChallenge}) : nextSuggestedBase;
  const recordedFieldResult = matchingAfterActionReceipt(fieldResult, currentRunKey, selectedMissionId);
  const recordedCampaignResult = matchingAfterActionReceipt(campaignResult, currentRunKey, selectedMissionId);
  const s3Proof = confirmedConsequence(recordedFieldResult, recordedCampaignResult, progression);
  const s3Return = confirmedReturnAction(recordedFieldResult, recordedCampaignResult, progression);
  const acceptedS3Run = recordedFieldResult?.runId || recordedCampaignResult?.runId || null;
  const s3Goals = s3TrainingGoals(mission, selectedSquadIds, activeRulesetVersion === "tactical-intent-vnext.0");
  const s3Trials = s3TrainingResults(s3CombatProof, acceptedS3Run, Boolean(recordedFieldResult?.victory || recordedCampaignResult?.victory), s3Goals);
  const s3Moment = s3RunMemory(s3CombatProof, acceptedS3Run);
  const buildEvidence = fieldcraftResults(s3CombatProof,currentRunKey,selectedMissionId);
  if (!results) return null;
  const operationVictory = foundationCompleted && Boolean(mission) && results.victory;
  const sessionVictory = (onboardingEnabled && !foundationCompleted && results.victory) || operationVictory;
  const hasNext = sessionVictory && encounter.next != null;
  const isFirstClear = operationVictory && progression?.operations?.[mission?.operationId || BROKEN_SIGNAL.operationId]?.missions[mission?.missionId || ""] === "available";
  return (
    <div className="t-fill">
      <Background dim={0.6} />
      <div className="t-overlay t-results-overlay">
        <div className={`t-modal t-panel t-results ${results.victory ? "is-victory" : "is-failure"}`}>
          <header className="t-outcome-hero"><img className="t-results-plate" src={results.victory ? PRESENTATION.resultsPlate : PRESENTATION.operationPlate} alt="" aria-hidden="true" /><span className="t-outcome-stamp">{results.victory ? "MISSION SECURED" : "MISSION LOST"}</span>
          <div className="t-kicker">{fieldOp ? `FIELD OP / ${mission.name}` : operationVictory && mission ? mission.name : sessionVictory ? encounter.operationName : "Broken Signal"}</div>
          <h2 className="t-title">{recordedFieldResult?.masteryChallenge ? results.victory ? 'RELAY LOCKDOWN COMPLETE' : 'RELAY LOCKDOWN FAILED' : campaignMission ? results.victory ? mission?.objectiveType === "BOSS" ? "DEAD RELAY SECURED" : "OBJECTIVE SECURED" : "MISSION FAILED" : fieldOp ? results.victory ? "FIELD OP COMPLETE" : "FIELD OP FAILED" : operationVictory ? mission?.objectiveType === "BOSS" ? "SIGNAL COMMANDER DOWN" : mission?.objectiveType === "RECOVER" ? "OBJECTIVE COMPLETE" : isFirstClear ? "BREACH CLEARED" : "BREACH REPLAY COMPLETE" : sessionVictory ? encounter.resultsTitle : "Operation Complete"}</h2></header>
          {sessionVictory ? (
            <p style={{ color: "var(--t-muted)", margin: "0 0 1.1rem" }}>{fieldOp ? null : operationVictory ? mission?.objectiveType === "RECOVER" ? isFirstClear ? "Continue to unlock SIGNAL COMMANDER." : "SIGNAL RECOVERED." : mission?.objectiveType === "ELIMINATE" ? isFirstClear ? "RECOVER AVAILABLE." : null : null : encounter.resultsNote}</p>
          ) : null}
          {operationVictory && mission?.missionId === "broken-signal-breach" ? <p style={{ color: routingTraceAcquired || progression?.intel?.routingTrace ? "var(--t-accent)" : "var(--t-faint)", margin: "0 0 0.8rem" }}>ROUTING TRACE — {routingTraceAcquired || progression?.intel?.routingTrace ? "ACQUIRED" : "MISSED"}</p> : null}
          {operationVictory && !campaignMission && mission?.objectiveType === "BOSS" ? <p style={{ color: "var(--t-accent)", margin: "0 0 0.8rem" }}>{isFirstClear ? mission.resultsCopy : progression?.operations?.[DEAD_RELAY.operationId] ? "BROKEN SIGNAL CLEARED · THE DEAD RELAY CAMPAIGN AVAILABLE" : "BROKEN SIGNAL remains CLEARED · ARCHIVE AVAILABLE · NEXT OPERATION SLOT EMPTY / UNASSIGNED"}</p> : null}
          {chapterMode ? <div className="t-panel" role="status">
            <strong>{chapterResult ? "CHAPTER RESULT RECORDED" : progressionCommitPending ? "RECORDING CHAPTER RESULT…" : "CHAPTER RESULT NOT YET RECORDED"}</strong>
            <p>{chapterResult ? `GHOST SIGNAL · ${chapterResult.stageRecorded}/3 accepted operations. ${chapterResult.chapterComplete?"RECON Intel ready for a qualifying encounter.":"Return to War Table for the next mission."}` : "Only server-recorded results advance this chapter."}</p>
          </div>:null}
          {!chapterMode && fieldOp ? <div>
            
            {!results.victory ? <p>{fieldFailureCopy(failureReason, mission.objectiveType)} No clear or commander progress earned.</p> : null}
            {recordedFieldResult ? <FieldResultFeedback result={recordedFieldResult} /> : <p role="status">{progressionCommitPending ? "Recording result…" : "Result not recorded yet."}</p>}
          </div> : null}
          
          {!chapterMode && fieldOp ? <details className="t-detail"><summary>Challenge objective</summary><p>{mission.challenge?.label}</p></details> : null}
          {!chapterMode && campaignMission ? <div className="t-panel t-deploy-overview" role="status">
            <strong>{recordedCampaignResult ? "RECORDED IN CAMPAIGN HISTORY" : progressionCommitPending ? "RECORDING CAMPAIGN RESULT..." : "RESULT AWAITS SERVER RECORD"}</strong>
            {recordedCampaignResult ? <p><b>EARNED:</b> {recordedCampaignResult.victory ? "Campaign objective recorded." : "Failure recorded; no campaign clear."} Character reward amounts and repeat bonuses are not supplied by this receipt.</p> : null}
            <p>{mission?.missionId === "dead-relay-courier"
              ? recordedCampaignResult && (progression?.campaignIntel?.["dead-relay"]?.courierTraceAcquired || recordedCampaignResult.intelEarned) ? "COURIER TRACE RECORDED · NEW HOLD RUNS USE DELAYED REINFORCEMENT"
                : !recordedCampaignResult ? "Courier result awaits server confirmation." : results.victory ? "Courier stopped. Early Intel was not secured; Hold is still unlocked." : "Courier escaped. Retry this mission to open the relay route."
              : mission?.missionId === "dead-relay-hold" ? !recordedCampaignResult ? "Relay result awaits server confirmation." : results.victory ? "Relay controlled. Guardian now available." : "Relay control lost. Retry to secure the location."
              : !recordedCampaignResult ? "Guardian result awaits server confirmation." : results.victory ? "The Dead Relay is secure. Your campaign completion is recorded." : "Guardian resisted. Regroup and retry."}</p>
          </div> : null}
          {s3Return ? <section className="t-panel t-s3-after-action" aria-label="Confirmed consequence and next tactical goal" data-s3-receipt={acceptedS3Run}>
            <span className="t-kicker">AFTER ACTION · SERVER RECORDED</span>
            {s3Proof ? <div className="t-s3-world-proof"><strong>{s3Proof.label}</strong><p>{s3Proof.detail}</p></div> : <p>No new persistent world change confirmed by this result.</p>}
            <div className="t-s3-next"><span className="t-kicker">ONE NEXT GOAL</span><strong>{s3Return.title}</strong><p>{s3Return.reason}</p></div>
          </section> : null}
          <section className="t-panel" aria-label="Why your build mattered"><span className="t-kicker">WHY YOUR BUILD MATTERED</span>{buildEvidence.length ? buildEvidence.map(row => <p key={row}>{row}</p>) : <p>No build-specific effect observed in this encounter.</p>}<small>Engine-observed on this device in this run only. These events are not persisted progress or extra rewards.</small></section>
          {acceptedS3Run && s3Moment ? <section className="t-panel" aria-label="This session combat evidence"><span className="t-kicker">THIS RUN · ENGINE-CONFIRMED MOMENT</span><strong>{s3Moment.detail}</strong><p>Observed in the current device session only. Not a persisted combat event log or extra reward.</p></section> : null}
          {acceptedS3Run && s3Trials.length ? <section className="t-panel" aria-label="Verified optional training"><span className="t-kicker">OPTIONAL TRAINING · CONFIRMED THIS RUN</span>{s3Trials.map(trial => <div key={trial.id}><strong>{trial.title}</strong><p>{trial.evidence}</p></div>)}<small>Training evidence is session-only; no extra rewards are awarded.</small></section> : null}
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
          {progression?.playerGrowth && results.victory && ((fieldOp && recordedFieldResult) || (campaignMission && recordedCampaignResult)) && progression.playerGrowth.earnedPoints > progression.playerGrowth.spentPoints ? (
            <section className="t-growth-result" aria-label="Server confirmed Skillbook progression">
              <span className="t-kicker">SERVER-CONFIRMED PROGRESSION</span>
              <strong>{progression.playerGrowth.earnedPoints - progression.playerGrowth.spentPoints} SKILL POINTS AVAILABLE</strong>
              <small>First-time mission clears add one point. Spend available points on the War Table Skillbook before your next deployment.</small>
            </section>
          ) : null}
          <div className="t-brief-actions t-result-actions">
            {chapterMode ? (chapterResult ?
              <button type="button" className="t-btn t-btn-primary" onClick={()=>continueOnboarding()}>RETURN TO CHAPTER</button>
              : <button type="button" className="t-btn t-btn-primary" disabled={progressionCommitPending} onClick={()=>void saveChapterResult()}>{progressionCommitPending?"RECORDING…":"RECORD CHAPTER RESULT"}</button>
            ) : campaignMission ? (
              recordedCampaignResult ? <>
                <button type="button" className="t-btn t-btn-primary" onClick={() => continueOnboarding()}>BACK TO CAMPAIGN</button>
                <button type="button" className="t-btn" onClick={replay}>REPLAY / SQUAD</button>
              </> : <button type="button" className="t-btn t-btn-primary" disabled={progressionCommitPending} onClick={() => void saveCampaignResult()}>
                {progressionCommitPending ? "Recording..." : results.victory ? "SAVE VICTORY" : "RECORD FAILURE / RETRY"}
              </button>
            ) : fieldOp ? (
              <>
                {!recordedFieldResult ? <button type="button" className="t-btn t-btn-primary" disabled={progressionCommitPending} onClick={() => void saveFieldResult()}>{progressionCommitPending ? "Recording..." : "Retry saving result"}</button> : <>
                  <button type="button" className="t-btn t-btn-primary" onClick={() => {
                    continueOnboarding();
                    if (recordedFieldResult.victory && resultNext && useBattleStore.getState().screen === "war-table") {
                      openPurposeBrief(resultNext);
                    }
                  }}>{recordedFieldResult.victory ? resultNext ? `${resultNext.tier === "advanced" ? "ADVANCED" : "NEXT"}: ${nextSuggestedMission?.name}` : "SEE FIELD OPS" : "REGROUP AT WAR TABLE"}</button>
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
