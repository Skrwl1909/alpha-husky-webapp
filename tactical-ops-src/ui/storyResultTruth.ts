import type { FoundationProgressionState } from "../host/foundationProgression";

export type StorySave = { runId: string; missionId: string; firstClear: boolean; lootAndHonors?: unknown } | null;

export function storyResultTruth(
  progression: FoundationProgressionState | null,
  saved: StorySave,
  runId: string | null,
  missionId: string | null,
  pending: boolean,
  error: string | null,
) {
  const confirmed = Boolean(runId && missionId && saved?.runId === runId && saved.missionId === missionId);
  const phase = confirmed ? "saved" : pending ? "saving" : error ? "failed" : "unsaved";
  const op02 = progression?.operations?.["dead-relay"];
  const courier = op02?.missions?.["dead-relay-courier"];
  return {
    confirmed,
    phase,
    op02Ready: confirmed && (courier === "available" || courier === "cleared"),
    op02Cleared: confirmed && op02?.status === "cleared",
  } as const;
}
