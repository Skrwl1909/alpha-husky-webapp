import type { DeploymentApproach, DirectiveTier, DirectiveSet, FieldContext, FieldReport, FieldResult } from "../data/fieldOps";
import { parseTacticalPet, type TacticalPet } from "../data/companion";
import type { KodaSidegrade } from "../data/kodaSidegrade";
import type { ShadowSidegrade } from "../data/shadowSidegrade";
import { parsePackMastery, type PackMastery } from "../data/packMastery";

export type FoundationStage =
  | "solo-1"
  | "solo-2"
  | "ally-koda"
  | "full-broken-signal"
  | "completed";

export interface FoundationProgressionState {
  packMastery?: PackMastery;
  version: 1;
  foundationStage: FoundationStage;
  completed: boolean;
  revision: number;
  activeRunId: string | null;
  lastCompletedRunId: string | null;
  updatedAt: number;
  fieldOps?: FieldOpsProgression;
  operations?: Record<string, OperationProgressionState>;
  intel?: { routingTrace: boolean; commanderProfile: boolean };
  archive?: { brokenSignal: boolean };
  nextOperationSlot?: "unassigned" | null;
  equippedPet?: TacticalPet | null;
  kodaSidegrade?: KodaSidegrade | null;
  shadowSidegrade?: ShadowSidegrade | null;
}

export interface FieldOpsProgression {
  records: Record<string, { missionId: string; completed: boolean; clearCount: number; lastClearedAt: number; failCount: number; challengeCount: number; lastChallengeCycle: number | null; advancedClearCount?: number; lastAdvancedCycle?: number | null; squadIds?: string[] }>;
  activeMissionRun: OperationMissionRun | null;
  lastCompletedMissionRunId: string | null;
  board?: { cycleId: number; nextRotationAt: number; activeMissionIds: string[]; reportVersion?: number; directiveSet?: DirectiveSet };
  commander?: { rank: number; progress: number; nextRankAt: number | null; unlockedApproaches: DeploymentApproach[]; unlockedDirectiveTiers?: DirectiveTier[] };
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
  return { ...value };
}

export type MissionProgressionStatus = "locked" | "available" | "cleared";

export interface OperationMissionRun {
  packMastery?: PackMastery;
  runId: string;
  missionId: string;
  squadIds: string[];
  fieldContext?: FieldContext;
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
    foundationStage: stage as FoundationStage,
    completed: value.completed === true || stage === "completed",
    revision,
    activeRunId: typeof value.activeRunId === "string" && value.activeRunId ? value.activeRunId : null,
    lastCompletedRunId:
      typeof value.lastCompletedRunId === "string" && value.lastCompletedRunId ? value.lastCompletedRunId : null,
    updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
  };
  if (value.fieldOps && typeof value.fieldOps === "object") {
    const field = value.fieldOps as Record<string, unknown>;
    if (!field.records || typeof field.records !== "object") return null;
    const records: NonNullable<FoundationProgressionState["fieldOps"]>["records"] = {};
    for (const [id, rawRecord] of Object.entries(field.records)) {
      if (!rawRecord || typeof rawRecord !== "object") return null;
      const record = rawRecord as Record<string, unknown>;
      if (record.missionId !== id || !Number.isInteger(record.clearCount) || Number(record.clearCount) < 0) return null;
      records[id] = { missionId: id, completed: Number(record.clearCount) > 0, clearCount: Number(record.clearCount), lastClearedAt: Number(record.lastClearedAt) || 0, failCount: Number(record.failCount) || 0, challengeCount: Number(record.challengeCount) || 0, lastChallengeCycle: Number.isInteger(record.lastChallengeCycle) ? Number(record.lastChallengeCycle) : null };
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
      Object.assign(state.fieldOps, { board, commander, region, lastResult: parseFieldResult(field.lastResult) });
    }
  }
  const operations = parseOperations(value.operations);
  state.equippedPet = parseTacticalPet(value.equippedPet);
  if (operations) state.operations = operations;
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
      activeMissionRun = { runId: activeValue.runId, missionId: activeValue.missionId, squadIds, packMastery: parsePackMastery(activeValue.packMastery), ...(fieldContext ? { fieldContext } : {}) };
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
): Promise<{ state: FoundationProgressionState; run: OperationMissionRun }> {
  const response = await request("/webapp/tactical-foundation/mission/start", { requestId, expectedRevision, missionId, ...(squadIds ? { squadIds } : {}), ...(fieldOptions ? { fieldOptions } : {}) });
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
  return { state: responseState(response), run: { runId: value.runId, missionId: value.missionId, squadIds: responseSquadIds, packMastery: parsePackMastery(value.packMastery), ...(fieldContext ? { fieldContext } : {}) } };
}

export async function continueOperationMission(
  requestId: string,
  expectedRevision: number,
  runId: string,
  routingTraceAcquired = false,
  fieldReport?: FieldReport,
): Promise<{ state: FoundationProgressionState; firstClear: boolean; fieldResult: FieldResult | null }> {
  const response = await request("/webapp/tactical-foundation/mission/continue", { requestId, expectedRevision, runId, completionIntent: fieldReport ? fieldReport.victory : true, routingTraceAcquired, ...(fieldReport ? { fieldReport } : {}) });
  return { state: responseState(response), firstClear: response.firstClear === true, fieldResult: parseFieldResult(response.fieldResult) };
}

export async function saveKodaSidegrade(requestId: string, expectedRevision: number, kodaSidegrade: KodaSidegrade): Promise<FoundationProgressionState> {
  return saveTeammateSidegrade(requestId, expectedRevision, "koda", kodaSidegrade);
}

export async function saveTeammateSidegrade(requestId: string, expectedRevision: number, teammate: "koda" | "shadow", choice: KodaSidegrade | ShadowSidegrade): Promise<FoundationProgressionState> {
  return responseState(await request(`/webapp/tactical-foundation/${teammate}-sidegrade`, { requestId, expectedRevision, [`${teammate}Sidegrade`]: choice }));
}

export async function savePackMastery(requestId: string, expectedRevision: number, unitId: string, choice: "A" | "B"): Promise<FoundationProgressionState> {
  return responseState(await request("/webapp/tactical-foundation/pack-mastery", { requestId, expectedRevision, unitId, choice }));
}

export function createFoundationRequestId(prefix: "start" | "continue" | "mission-start" | "mission-continue" | "koda-sidegrade" | "shadow-sidegrade" | "pack-mastery"): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  return "tops-foundation-" + prefix + "-" + random;
}
