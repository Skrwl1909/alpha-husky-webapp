import { validateGrowthSnapshot, type GrowthSnapshot } from "../data/playerGrowth";
import { parseRunRulesContract, TACTICAL_VNEXT_RULESET, type RunRulesContract } from "../combat/intentContract";
import type { DeploymentApproach, DirectiveTier, DirectiveSet, FieldContext, FieldReport, FieldResult } from "../data/fieldOps";
import type { CampaignContext } from "../data/operations";
import { parseTacticalPet, type TacticalPet } from "../data/companion";
import type { KodaSidegrade } from "../data/kodaSidegrade";
import type { ShadowSidegrade } from "../data/shadowSidegrade";
import { parsePackMastery, type PackMastery } from "../data/packMastery";
import { parseTacticalProfile, type TacticalProfile } from "../combat/playerProfile";
import { parseCombatProfileV2, type TacticalCombatProfileV2 } from "../combat/combatProfile";
import { parseCombatProfileV3, type TacticalCombatProfileV3 } from "../combat/combatProfileV3";

export type FoundationStage =
  | "solo-1"
  | "solo-2"
  | "ally-koda"
  | "full-broken-signal"
  | "completed";

export interface FoundationProgressionState {
  activeTacticalProfile?: TacticalProfile;
  activeCombatProfileV2?: TacticalCombatProfileV2 | null;
  playerIdentity?: Record<string, unknown>;
  packMastery?: PackMastery;
  playerGrowth?: GrowthProgression;
  version: 1;
  vnextStartAvailable?: boolean;
  foundationStage: FoundationStage;
  completed: boolean;
  revision: number;
  activeRunId: string | null;
  /** Backend-accepted rules for the current Foundation run, never a client lab preference. */
  foundationRunRules?: { runId: string; rulesContract: RunRulesContract };
  lastCompletedRunId: string | null;
  updatedAt: number;
  fieldOps?: FieldOpsProgression;
  operations?: Record<string, OperationProgressionState>;
  campaignIntel?: { "dead-relay": { courierTraceAcquired: boolean } };
  intel?: { routingTrace: boolean; commanderProfile: boolean };
  archive?: { brokenSignal: boolean };
  nextOperationSlot?: "unassigned" | null;
  equippedPet?: TacticalPet | null;
  kodaSidegrade?: KodaSidegrade | null;
  shadowSidegrade?: ShadowSidegrade | null;
}

export interface FieldOpsProgression {
  records: Record<string, { missionId: string; completed: boolean; clearCount: number; lastClearedAt: number; failCount: number; challengeCount: number; lastClearCycle: number | null; lastChallengeCycle: number | null; advancedClearCount?: number; lastAdvancedCycle?: number | null; squadIds?: string[] }>;
  activeMissionRun: OperationMissionRun | null;
  lastCompletedMissionRunId: string | null;
  board?: { cycleId: number; nextRotationAt: number; activeMissionIds: string[]; reportVersion?: number; directiveSet?: DirectiveSet };
  commander?: { rank: number; progress: number; nextRankAt: number | null; certificationComplete?: boolean; unlockedApproaches: DeploymentApproach[]; unlockedDirectiveTiers?: DirectiveTier[] };
  rotationProgress?: { cycleId: number; securedCount: number; total: number; clearedMissionIds: string[]; challengeMissionIds: string[]; advancedMissionIds: string[]; frontSecured: boolean };
  careerRecord?: { version: 1; missionSecures: number; challenges: number; advancedClears: number; frontsSecured: number; lastSecuredCycle: number | null };
  region?: { regionId: string; cycleId: number; pressure: number; label: string };
  lastResult?: FieldResult | null;
}

function parseFieldContext(raw: unknown): FieldContext | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const value = raw as FieldContext;
  if (!Number.isInteger(value.cycleId) || !Number.isInteger(value.pressure) || value.pressure < 0 || value.pressure > 3 || !["standard", "south"].includes(value.approach) || ![1, 2, 3].includes(value.reportVersion)) return undefined;
  if (value.reportVersion === 3 && (!["standard", "advanced"].includes(value.directiveTier!) || !["pursuit", "attrition"].includes(value.directiveSet!))) return undefined;
  return { cycleId: value.cycleId, pressure: value.pressure, approach: value.approach, reportVersion: value.reportVersion, ...(value.reportVersion === 3 ? { directiveTier: value.directiveTier, directiveSet: value.directiveSet } : {}) };
}

function parseFieldResult(raw: unknown): FieldResult | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as FieldResult;
  if (typeof value.runId !== "string" || typeof value.missionId !== "string" || typeof value.victory !== "boolean" || typeof value.challengeSuccess !== "boolean" || typeof value.regionalApplied !== "boolean") return null;
  if (![value.cycleId, value.challengeBonus, value.progressEarned, value.progressBefore, value.progressAfter, value.rankBefore, value.rankAfter, value.pressureBefore, value.pressureAfter, value.recordedAt].every(Number.isInteger)) return null;
  if (!Array.isArray(value.unlockedApproaches) || !value.unlockedApproaches.every((v) => v === "standard" || v === "south")) return null;
  return {
    ...value,
    xpGranted: Number.isInteger(value.xpGranted) ? Number(value.xpGranted) : 0,
    bonesGranted: Number.isInteger(value.bonesGranted) ? Number(value.bonesGranted) : 0,
  };
}

export interface GrowthProgression extends GrowthSnapshot {
  earnedPoints: number;
  spentPoints: number;
  claimedFirstClears: string[];
}
function parseRunGrowth(raw: unknown): GrowthSnapshot | null {
  try { return validateGrowthSnapshot(raw); } catch { return null; }
}
function requireRunGrowth(raw: unknown): GrowthSnapshot {
  const growth = parseRunGrowth(raw);
  if (!growth) throw new FoundationProgressionError("invalid_growth_snapshot");
  return growth;
}
/** Backend playerGrowth is a progression record; its revision lives on the parent Foundation state.
 * Only run.playerGrowth contains its own frozen revision. Never conflate the two wire formats.
 */
export function parseGrowthProgression(raw: unknown, foundationRevision: number): GrowthProgression | null {
  if (!raw || typeof raw !== "object" || !Number.isSafeInteger(foundationRevision) || foundationRevision < 0) return null;
  const x = raw as Record<string, unknown>;
  const snapshot = parseRunGrowth({ ...x, revision: foundationRevision });
  if (!snapshot || !Number.isSafeInteger(x.earnedPoints) || Number(x.earnedPoints) < 0 ||
      !Number.isSafeInteger(x.spentPoints) || Number(x.spentPoints) < 0 ||
      Number(x.spentPoints) > Number(x.earnedPoints) ||
      !Array.isArray(x.claimedFirstClears) ||
      x.claimedFirstClears.length !== Number(x.earnedPoints) ||
      x.claimedFirstClears.some((v: unknown) => typeof v !== "string") ||
      new Set(x.claimedFirstClears).size !== x.claimedFirstClears.length ||
      snapshot.heroes.some((h) => typeof (h as {respecUsed?: unknown}).respecUsed !== "boolean") ||
      snapshot.heroes.reduce((sum, h) => sum + Object.values(h.ranks).reduce((acc, rank) => acc + rank, 0), 0) !== Number(x.spentPoints)) return null;
  return { ...snapshot, earnedPoints: Number(x.earnedPoints),
    spentPoints: Number(x.spentPoints), claimedFirstClears: [...x.claimedFirstClears] as string[] };
}

export type MissionProgressionStatus = "locked" | "available" | "cleared";

export interface OperationMissionRun {
  /** Absent on all legacy accepted runs; immutable backend-issued VNext rules when available. */
  rulesContract?: RunRulesContract | null;
  tacticalProfile?: TacticalProfile;
  combatProfileV2?: TacticalCombatProfileV2 | null;
  combatProfileV3?: TacticalCombatProfileV3 | null;
  packMastery?: PackMastery;
  playerGrowth?: GrowthSnapshot;
  runId: string;
  missionId: string;
  squadIds: string[];
  fieldContext?: FieldContext;
  campaignContext?: CampaignContext;
}

export interface CampaignReport {
  victory: boolean;
  turns: number;
  objectiveComplete: boolean;
  squadStanding: number;
  squadDeployed: number;
  failureReason?: string;
}

export interface CampaignResult extends CampaignReport {
  missionId: string;
  runId: string;
  intelEarned: boolean;
}

export interface OperationProgressionState {
  status: "active" | "cleared";
  missions: Record<string, MissionProgressionStatus>;
  activeMissionRun: OperationMissionRun | null;
  lastCompletedMissionRunId: string | null;
}

type ApiPost = (path: string, body?: unknown) => Promise<unknown>;

export class FoundationProgressionError extends Error {
  readonly code: string;
  readonly state: FoundationProgressionState | null;

  constructor(code: string, state: FoundationProgressionState | null = null) {
    super(code);
    this.code = code;
    this.state = state;
  }
}

function apiPost(): ApiPost | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    apiPost?: unknown;
    S?: { apiPost?: unknown };
    AH?: { apiPost?: unknown };
  };
  const fn = w.apiPost || w.S?.apiPost || w.AH?.apiPost;
  return typeof fn === "function" ? (fn as ApiPost) : null;
}

function parseState(raw: unknown): FoundationProgressionState | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Record<string, unknown>;
  const stage = String(value.foundationStage || "");
  if (!["solo-1", "solo-2", "ally-koda", "full-broken-signal", "completed"].includes(stage)) return null;
  const revision = Number(value.revision);
  if (!Number.isInteger(revision) || revision < 0) return null;
  const state: FoundationProgressionState = {
    packMastery: parsePackMastery(value.packMastery),
    version: 1,
    vnextStartAvailable: value.vnextStartAvailable === true,
    foundationStage: stage as FoundationStage,
    completed: value.completed === true || stage === "completed",
    revision,
    activeRunId: typeof value.activeRunId === "string" && value.activeRunId ? value.activeRunId : null,
    lastCompletedRunId:
      typeof value.lastCompletedRunId === "string" && value.lastCompletedRunId ? value.lastCompletedRunId : null,
    updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
  };
  // Optional rollout field: absent on legacy Foundation sessions.
  // Do not let a detached/stale contract switch another saved run to 10×7.
  if (value.foundationRunRules != null) {
    const candidate = value.foundationRunRules as Record<string, unknown>;
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate) ||
        typeof candidate.runId !== "string" || candidate.runId !== state.activeRunId) return null;
    const rulesContract = parseRunRulesContract(candidate.rulesContract);
    if (!rulesContract || !rulesContract.missionId.startsWith("foundation-")) return null;
    state.foundationRunRules = { runId: candidate.runId, rulesContract };
  }
  if (Object.prototype.hasOwnProperty.call(value, "playerGrowth")) {
    const parsedGrowth = parseGrowthProgression(value.playerGrowth, revision);
    if (!parsedGrowth) return null;
    state.playerGrowth = parsedGrowth;
  }
  if (value.fieldOps && typeof value.fieldOps === "object") {
    const field = value.fieldOps as Record<string, unknown>;
    if (!field.records || typeof field.records !== "object") return null;
    const records: NonNullable<FoundationProgressionState["fieldOps"]>["records"] = {};
    for (const [id, rawRecord] of Object.entries(field.records)) {
      if (!rawRecord || typeof rawRecord !== "object") return null;
      const record = rawRecord as Record<string, unknown>;
      if (record.missionId !== id || !Number.isInteger(record.clearCount) || Number(record.clearCount) < 0) return null;
      records[id] = { missionId: id, completed: Number(record.clearCount) > 0, clearCount: Number(record.clearCount), lastClearedAt: Number(record.lastClearedAt) || 0, failCount: Number(record.failCount) || 0, challengeCount: Number(record.challengeCount) || 0, lastClearCycle: Number.isInteger(record.lastClearCycle) ? Number(record.lastClearCycle) : null, lastChallengeCycle: Number.isInteger(record.lastChallengeCycle) ? Number(record.lastChallengeCycle) : null };
      if (Array.isArray(record.squadIds) && record.squadIds.every((unit: unknown) => typeof unit === "string")) records[id].squadIds = [...record.squadIds];
      records[id].advancedClearCount = Number.isInteger(record.advancedClearCount) && Number(record.advancedClearCount) >= 0 ? Number(record.advancedClearCount) : 0;
      records[id].lastAdvancedCycle = Number.isInteger(record.lastAdvancedCycle) ? Number(record.lastAdvancedCycle) : null;
    }
    const parsed = parseOperations({ field: { ...field, status: "active", missions: {} } });
    if (!parsed) return null;
    state.fieldOps = { records, activeMissionRun: parsed.field.activeMissionRun, lastCompletedMissionRunId: parsed.field.lastCompletedMissionRunId };
    if (field.board != null || field.commander != null || field.region != null) {
      const board = field.board as NonNullable<FieldOpsProgression["board"]>;
      const commander = field.commander as NonNullable<FieldOpsProgression["commander"]>;
      const region = field.region as NonNullable<FieldOpsProgression["region"]>;
      if (!board || !Number.isInteger(board.cycleId) || !Number.isInteger(board.nextRotationAt) || !Array.isArray(board.activeMissionIds) || board.activeMissionIds.length !== 3 || new Set(board.activeMissionIds).size !== 3 || !board.activeMissionIds.every((id) => typeof id === "string")) return null;
      if (!commander || ![1, 2, 3].includes(commander.rank) || !Number.isInteger(commander.progress) || commander.progress < 0 || !Array.isArray(commander.unlockedApproaches) || !commander.unlockedApproaches.every((v) => v === "standard" || v === "south")) return null;
      if (board.reportVersion != null && (board.reportVersion !== 3 || !["pursuit", "attrition"].includes(board.directiveSet!))) return null;
      if (commander.unlockedDirectiveTiers != null && (!Array.isArray(commander.unlockedDirectiveTiers) || !commander.unlockedDirectiveTiers.every((tier) => ["standard", "advanced"].includes(tier)))) return null;
      if (!region || !Number.isInteger(region.pressure) || region.pressure < 0 || region.pressure > 3 || region.cycleId !== board.cycleId) return null;
      const rotation = field.rotationProgress as NonNullable<FieldOpsProgression["rotationProgress"]> | undefined;
      if (rotation != null) {
        if (!Number.isInteger(rotation.cycleId) || rotation.cycleId !== board.cycleId || !Number.isInteger(rotation.securedCount) || !Number.isInteger(rotation.total) || rotation.total !== 3 || rotation.securedCount < 0 || rotation.securedCount > rotation.total) return null;
        if (![rotation.clearedMissionIds, rotation.challengeMissionIds, rotation.advancedMissionIds].every((ids) => Array.isArray(ids) && ids.every((id) => typeof id === "string" && board.activeMissionIds.includes(id)))) return null;
        if (typeof rotation.frontSecured !== "boolean" || rotation.frontSecured !== (rotation.securedCount === rotation.total)) return null;
      }
      const career = field.careerRecord as NonNullable<FieldOpsProgression["careerRecord"]> | undefined;
      if (career != null) {
        if (career.version !== 1 || ![career.missionSecures, career.challenges, career.advancedClears, career.frontsSecured].every((count) => Number.isInteger(count) && count >= 0)) return null;
        if (career.lastSecuredCycle != null && !Number.isInteger(career.lastSecuredCycle)) return null;
      }
      Object.assign(state.fieldOps, { board, commander, region, ...(rotation ? { rotationProgress: rotation } : {}), ...(career ? { careerRecord: career } : {}), lastResult: parseFieldResult(field.lastResult) });
    }
  }
  const operations = parseOperations(value.operations);
  state.playerIdentity = value.playerIdentity && typeof value.playerIdentity === "object" ? value.playerIdentity as Record<string, unknown> : undefined;
  state.activeTacticalProfile = parseTacticalProfile(value.activeTacticalProfile);
  if (Object.prototype.hasOwnProperty.call(value, "activeCombatProfileV2")) state.activeCombatProfileV2 = parseCombatProfileV2(value.activeCombatProfileV2);
  state.equippedPet = parseTacticalPet(value.equippedPet);
  if (operations) state.operations = operations;
    if (value.campaignIntel && typeof value.campaignIntel === "object") {
      const intel = (value.campaignIntel as Record<string, unknown>)["dead-relay"];
      if (intel && typeof intel === "object" && typeof (intel as Record<string, unknown>).courierTraceAcquired === "boolean") {
        state.campaignIntel = { "dead-relay": { courierTraceAcquired: (intel as Record<string, boolean>).courierTraceAcquired } };
      }
    }
  state.kodaSidegrade = operations?.["broken-signal"]?.status === "cleared" && (value.kodaSidegrade === "A" || value.kodaSidegrade === "B") ? value.kodaSidegrade : null;
  state.shadowSidegrade = operations?.["broken-signal"]?.status === "cleared" && (value.shadowSidegrade === "A" || value.shadowSidegrade === "B") ? value.shadowSidegrade : null;
  if (value.intel && typeof value.intel === "object") {
    state.intel = {
      routingTrace: Boolean((value.intel as Record<string, unknown>).routingTrace),
      commanderProfile: Boolean((value.intel as Record<string, unknown>).commanderProfile),
    };
  }
  if (value.archive && typeof value.archive === "object") state.archive = { brokenSignal: Boolean((value.archive as Record<string, unknown>).brokenSignal) };
  if (value.nextOperationSlot === "unassigned" || value.nextOperationSlot === null) state.nextOperationSlot = value.nextOperationSlot;
  return state;
}

function parseCampaignContext(raw: unknown): CampaignContext | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  return item.version === 1 && typeof item.courierTraceAcquired === "boolean"
    ? { version: 1, courierTraceAcquired: item.courierTraceAcquired } : null;
}

function parseCampaignResult(raw: unknown): CampaignResult | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  if (typeof v.victory !== "boolean" || typeof v.objectiveComplete !== "boolean" || typeof v.missionId !== "string" || typeof v.runId !== "string" || typeof v.intelEarned !== "boolean") return null;
  if (![v.turns, v.squadStanding, v.squadDeployed].every(Number.isInteger)) return null;
  return { victory: v.victory, objectiveComplete: v.objectiveComplete, turns: Number(v.turns), squadStanding: Number(v.squadStanding), squadDeployed: Number(v.squadDeployed), missionId: v.missionId, runId: v.runId, intelEarned: v.intelEarned, ...(typeof v.failureReason === "string" ? { failureReason: v.failureReason } : {}) };
}

function parseOperations(raw: unknown): Record<string, OperationProgressionState> | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;
  const parsed: Record<string, OperationProgressionState> = {};
  for (const [operationId, candidate] of Object.entries(source)) {
    if (!candidate || typeof candidate !== "object") return null;
    const value = candidate as Record<string, unknown>;
    if ((value.status !== "active" && value.status !== "cleared") || !value.missions || typeof value.missions !== "object") return null;
    const missions: Record<string, MissionProgressionStatus> = {};
    for (const [missionId, status] of Object.entries(value.missions as Record<string, unknown>)) {
      if (status !== "locked" && status !== "available" && status !== "cleared") return null;
      missions[missionId] = status;
    }
    const active = value.activeMissionRun;
    let activeMissionRun: OperationMissionRun | null = null;
    if (active != null) {
      if (typeof active !== "object") return null;
      const activeValue = active as Record<string, unknown>;
      if (typeof activeValue.runId !== "string" || typeof activeValue.missionId !== "string") return null;
      const squadIds = Array.isArray(activeValue.squadIds) && activeValue.squadIds.every((id) => typeof id === "string")
        ? activeValue.squadIds as string[]
        : [];
            const fieldContext = parseFieldContext(activeValue.fieldContext);
      if (activeValue.fieldContext != null && !fieldContext) return null;
      const contract = parseRunRulesContract(activeValue.rulesContract);
      if (contract && contract.missionId !== activeValue.missionId) return null;
      activeMissionRun = { runId: activeValue.runId, missionId: activeValue.missionId, squadIds, ...(contract ? { rulesContract: contract } : {}), tacticalProfile: parseTacticalProfile(activeValue.tacticalProfile), packMastery: parsePackMastery(activeValue.packMastery), ...(activeValue.playerGrowth != null ? { playerGrowth: requireRunGrowth(activeValue.playerGrowth) } : {}), ...(Object.prototype.hasOwnProperty.call(activeValue, "combatProfileV2") ? { combatProfileV2: parseCombatProfileV2(activeValue.combatProfileV2) } : {}), ...(Object.prototype.hasOwnProperty.call(activeValue, "combatProfileV3") ? { combatProfileV3: parseCombatProfileV3(activeValue.combatProfileV3) } : {}), ...(fieldContext ? { fieldContext } : {}), ...(parseCampaignContext(activeValue.campaignContext) ? { campaignContext: parseCampaignContext(activeValue.campaignContext)! } : {}) };
    }
    parsed[operationId] = {
      status: value.status,
      missions,
      activeMissionRun,
      lastCompletedMissionRunId:
        typeof value.lastCompletedMissionRunId === "string" && value.lastCompletedMissionRunId
          ? value.lastCompletedMissionRunId
          : null,
    };
  }
  return parsed;
}

async function request(path: string, body: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
  const post = apiPost();
  if (!post) throw new FoundationProgressionError("progression_unavailable");
  let raw: unknown;
  try {
    raw = await post(path, body);
  } catch (error) {
    const body = error && typeof error === "object" ? (error as Record<string, unknown>) : {};
    const details = body.details as Record<string, unknown> | undefined;
    throw new FoundationProgressionError(String(body.code || "progression_request_failed"), parseState(details?.state));
  }
  if (!raw || typeof raw !== "object") throw new FoundationProgressionError("invalid_progression_response");
  const response = raw as Record<string, unknown>;
  const details = response.details as Record<string, unknown> | undefined;
  if (response.ok !== true) {
    throw new FoundationProgressionError(String(response.code || "progression_request_failed"), parseState(details?.state));
  }
  return response;
}

function responseState(response: Record<string, unknown>): FoundationProgressionState {
  const state = parseState(response.data);
  if (!state) throw new FoundationProgressionError("invalid_progression_response");
  return state;
}

export async function loadFoundationProgression(): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/state"));
}

export async function startFoundationRun(
  requestId: string,
  expectedRevision: number,
): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/start", { requestId, expectedRevision }));
}

export async function continueFoundationRun(
  requestId: string,
  expectedRevision: number,
  runId: string,
): Promise<FoundationProgressionState> {
  return responseState(
    await request("/webapp/tactical-foundation/continue", { requestId, expectedRevision, runId }),
  );
}

export async function startOperationMission(
  requestId: string,
  expectedRevision: number,
  missionId: string,
  squadIds?: string[],
  fieldOptions?: { cycleId: number; approach: DeploymentApproach; reportVersion?: number; directiveTier?: DirectiveTier },
  rulesetVersion?: string,
): Promise<{ state: FoundationProgressionState; run: OperationMissionRun }> {
  const response = await request("/webapp/tactical-foundation/mission/start", { requestId, expectedRevision, missionId, ...(squadIds ? { squadIds } : {}), ...(fieldOptions ? { fieldOptions } : {}), ...(rulesetVersion ? { rulesetVersion } : {}) });
  const run = response.run;
  if (!run || typeof run !== "object") throw new FoundationProgressionError("invalid_progression_response");
  const value = run as Record<string, unknown>;
  if (typeof value.runId !== "string" || typeof value.missionId !== "string") {
    throw new FoundationProgressionError("invalid_progression_response");
  }
  const responseSquadIds = Array.isArray(value.squadIds) && value.squadIds.every((id) => typeof id === "string")
    ? value.squadIds as string[]
    : [];
  const fieldContext = parseFieldContext(value.fieldContext);
  if (value.fieldContext != null && !fieldContext) throw new FoundationProgressionError("invalid_progression_response");
  const rulesContract = parseRunRulesContract(value.rulesContract);
  if (rulesContract && rulesContract.missionId !== value.missionId) throw new FoundationProgressionError("invalid_run_rules_contract");
  return { state: responseState(response), run: { runId: value.runId, missionId: value.missionId, squadIds: responseSquadIds, ...(rulesContract ? { rulesContract: rulesContract } : {}), tacticalProfile: parseTacticalProfile(value.tacticalProfile), packMastery: parsePackMastery(value.packMastery), ...(value.playerGrowth != null ? { playerGrowth: requireRunGrowth(value.playerGrowth) } : {}), ...(Object.prototype.hasOwnProperty.call(value, "combatProfileV2") ? { combatProfileV2: parseCombatProfileV2(value.combatProfileV2) } : {}), ...(Object.prototype.hasOwnProperty.call(value, "combatProfileV3") ? { combatProfileV3: parseCombatProfileV3(value.combatProfileV3) } : {}), ...(fieldContext ? { fieldContext } : {}), ...(parseCampaignContext(value.campaignContext) ? { campaignContext: parseCampaignContext(value.campaignContext)! } : {}) } };
}

export async function continueOperationMission(
  requestId: string,
  expectedRevision: number,
  runId: string,
  routingTraceAcquired = false,
  fieldReport?: FieldReport,
  campaignReport?: CampaignReport,
  rulesetVersion?: string,
): Promise<{ state: FoundationProgressionState; firstClear: boolean; fieldResult: FieldResult | null; campaignResult: CampaignResult | null }> {
  const response = await request("/webapp/tactical-foundation/mission/continue", { requestId, expectedRevision, runId, completionIntent: campaignReport ? campaignReport.victory : fieldReport ? fieldReport.victory : true, routingTraceAcquired, ...(fieldReport ? { fieldReport } : {}), ...(campaignReport ? { campaignReport } : {}), ...(rulesetVersion ? { rulesetVersion } : {}) });
  return { state: responseState(response), firstClear: response.firstClear === true, fieldResult: parseFieldResult(response.fieldResult), campaignResult: parseCampaignResult(response.campaignResult) };
}

export async function saveKodaSidegrade(requestId: string, expectedRevision: number, kodaSidegrade: KodaSidegrade): Promise<FoundationProgressionState> {
  return saveTeammateSidegrade(requestId, expectedRevision, "koda", kodaSidegrade);
}

export async function saveTeammateSidegrade(requestId: string, expectedRevision: number, teammate: "koda" | "shadow", choice: KodaSidegrade | ShadowSidegrade): Promise<FoundationProgressionState> {
  return responseState(await request(`/webapp/tactical-foundation/${teammate}-sidegrade`, { requestId, expectedRevision, [`${teammate}Sidegrade`]: choice }));
}

export async function upgradePlayerGrowth(
  requestId: string, expectedRevision: number, heroId: "alpha" | "ally-02" | "ally-03",
  discipline: string, skillId: string, rank: 1 | 2,
): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/growth/upgrade",
    { requestId, expectedRevision, heroId, discipline, skillId, rank }));
}
export async function respecPlayerGrowth(
  requestId: string, expectedRevision: number, heroId: "alpha" | "ally-02" | "ally-03",
): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/growth/respec",
    { requestId, expectedRevision, heroId }));
}

export async function savePackMastery(requestId: string, expectedRevision: number, unitId: string, choice: "A" | "B"): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/pack-mastery", { requestId, expectedRevision, unitId, choice }));
}

export function createFoundationRequestId(prefix: "start" | "continue" | "mission-start" | "mission-continue" | "koda-sidegrade" | "shadow-sidegrade" | "pack-mastery" | "growth-upgrade" | "growth-respec"): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  return "tops-foundation-" + prefix + "-" + random;
}
