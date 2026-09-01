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
  return {
    version: 1,
    foundationStage: stage as FoundationStage,
    completed: value.completed === true || stage === "completed",
    revision,
    activeRunId: typeof value.activeRunId === "string" && value.activeRunId ? value.activeRunId : null,
    lastCompletedRunId:
      typeof value.lastCompletedRunId === "string" && value.lastCompletedRunId ? value.lastCompletedRunId : null,
    updatedAt: Number.isFinite(Number(value.updatedAt)) ? Number(value.updatedAt) : 0,
  };
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

export function createFoundationRequestId(prefix: "start" | "continue"): string {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
  return "tops-foundation-" + prefix + "-" + random;
}
