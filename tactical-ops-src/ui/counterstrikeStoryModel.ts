import { COUNTERSTRIKE_ID, type CounterstrikeResult } from "../data/counterstrike";

/** Presentation-only switch, deliberately OFF unless the host explicitly opts in. */
export const STORY_LITE_FLAG = "__AH_TACTICAL_STORY_LITE_V1__";
export const STORY_LITE_KEYART = "/images/tactical_ops/presentation/false_relay_mission_keyart_v1.webp";
export const STORY_INTRO_MS = 3200;
export const STORY_HOUND_MS = 1150;
export const STORY_INTRO_SEEN_KEY = "alpha-husky:counterstrike:story-lite-intro-v1";

export function storyLiteEnabled(): boolean {
  return typeof window !== "undefined" &&
    (window as unknown as Record<string, unknown>)[STORY_LITE_FLAG] === true;
}

/** Never infer enemy arrival from a local round counter, a timer, or a telegraph. */
export function confirmedHoundWave(line: unknown): 1 | 2 | null {
  if (typeof line !== "string") return null;
  const match = /^HOUND reinforcement ([12]) entered\. Relay approach under pressure\.$/.exec(line);
  return match ? Number(match[1]) as 1 | 2 : null;
}

export function verifiedFalseRelayResult(result: CounterstrikeResult | null | undefined): result is CounterstrikeResult {
  return Boolean(result && result.missionId === COUNTERSTRIKE_ID &&
    result.verification === "SERVER_COMMAND_WORKER" && typeof result.victory === "boolean" &&
    typeof result.runId === "string" && result.runId.startsWith("counterstrike_v1_"));
}
