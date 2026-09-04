export type FoundationStage =
  | "solo-1"
  | "solo-2"
  | "ally-koda"
  | "full-broken-signal"
  | "completed";

export interface FoundationProgressionState {
  version: 1;
  foundationStage: FoundationStage;
  completed: boolean;
  revision: number;
  activeRunId: string | null;
  lastCompletedRunId: string | null;
  updatedAt: number;
  operations?: Record<string, OperationProgressionState>;
  intel?: { routingTrace: boolean; commanderProfile: boolean };
  archive?: { brokenSignal: boolean };
  nextOperationSlot?: "unassigned" | null;
}

export type MissionProgressionStatus = "locked" | "available" | "cleared";

export interface OperationMissionRun {
  runId: string;
  missionId: string;
  squadIds: string[];
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
    version: 1,
    foundationStage: stage as FoundationStage,
    completed: value.completed === true || stage === "completed",
    revision,
    activeRunId: typeof value.activeRunId === "string" && value.activeRunId ? value.activeRunId : null,
    lastCompletedRunId:
      typeof value.lastCompletedRunId === "string" && value.lastCompletedRunId ? value.lastCompletedRunId : null,
    updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
  };
  const operations = parseOperations(value.operations);
  if (operations) state.operations = operations;
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
      activeMissionRun = { runId: activeValue.runId, missionId: activeValue.missionId, squadIds };
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
): Promise<{ state: FoundationProgressionState; run: OperationMissionRun }> {
  const response = await request("/webapp/tactical-foundation/mission/start", { requestId, expectedRevision, missionId, ...(squadIds ? { squadIds } : {}) });
  const run = response.run;
  if (!run || typeof run !== "object") throw new FoundationProgressionError("invalid_progression_response");
  const value = run as Record<string, unknown>;
  if (typeof value.runId !== "string" || typeof value.missionId !== "string") {
    throw new FoundationProgressionError("invalid_progression_response");
  }
  const responseSquadIds = Array.isArray(value.squadIds) && value.squadIds.every((id) => typeof id === "string")
    ? value.squadIds as string[]
    : [];
  return { state: responseState(response), run: { runId: value.runId, missionId: value.missionId, squadIds: responseSquadIds } };
}

export async function continueOperationMission(
  requestId: string,
  expectedRevision: number,
  runId: string,
  routingTraceAcquired = false,
): Promise<{ state: FoundationProgressionState; firstClear: boolean }> {
  const response = await request("/webapp/tactical-foundation/mission/continue", { requestId, expectedRevision, runId, completionIntent: true, routingTraceAcquired });
  return { state: responseState(response), firstClear: response.firstClear === true };
}

export function createFoundationRequestId(prefix: "start" | "continue" | "mission-start" | "mission-continue"): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  return "tops-foundation-" + prefix + "-" + random;
}
