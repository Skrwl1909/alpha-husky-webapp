import { BROKEN_SIGNAL_SPAWNS, UNIT_DEFS, type SpawnSpec } from "./units";
import type { UnitDef } from "../combat/types";

/**
 * Data-only encounter configs for the future onboarding foundation.
 * Combat Core consumes SpawnSpec[] and does not know stage ids.
 * This module does not own session/progression state.
 */
export type OnboardingEncounterId = "solo-1" | "solo-2" | "ally-koda" | "full-broken-signal";

export interface EncounterDef {
  id: OnboardingEncounterId;
  operationName: string;
  objective: string;
  teaching: string;
  steps: readonly string[];
  next: OnboardingEncounterId | null;
  resultsTitle: string;
  resultsNote: string;
  spawns: SpawnSpec[];
}

export const ENCOUNTER_SOLO_1: EncounterDef = {
  id: "solo-1",
  operationName: "BROKEN SIGNAL — CONTACT",
  objective: "Defeat the hostile scout.",
  teaching: "Move toward the scout. STRIKE works from 1 tile away.",
  steps: ["Tap a highlighted tile to move toward the scout.", "When next to the scout, tap STRIKE (A1), then tap the scout."],
  next: "solo-2",
  resultsTitle: "DRILL COMPLETE",
  resultsNote: "Next: multiple hostiles.",
  spawns: [
    { defId: "alpha", id: "alpha", c: 2, r: 2 },
    { defId: "hostile", id: "h2", c: 5, r: 3 },
  ],
};

export const ENCOUNTER_SOLO_2: EncounterDef = {
  id: "solo-2",
  operationName: "BROKEN SIGNAL — SPLIT CONTACT",
  objective: "Defeat both hostile scouts.",
  teaching: "Attack one scout, then reposition to reach the other.",
  steps: ["Move into attack range of the first scout.", "Attack, then reposition for the second scout."],
  next: "ally-koda",
  resultsTitle: "DRILL COMPLETE",
  resultsNote: "COLDNCURSED / CNC — BUG HUNTER WARDEN joins Alpha for the next deployment.",
  spawns: [
    { defId: "alpha", id: "alpha", c: 2, r: 2 },
    { defId: "hostile", id: "h1", c: 5, r: 0 },
    { defId: "hostile", id: "h2", c: 5, r: 3 },
  ],
};

export const ENCOUNTER_ALLY_KODA: EncounterDef = {
  id: "ally-koda",
  operationName: "BROKEN SIGNAL — PACK LINK",
  objective: "Defeat the hostiles with Alpha and CNC.",
  teaching: "Alpha attacks up close. CNC can attack from up to 3 tiles away.",
  steps: ["Move Alpha close enough to strike.", "Use CNC to attack enemies farther away."],
  next: "full-broken-signal",
  resultsTitle: "SQUAD LINK ESTABLISHED",
  resultsNote: "Full operation ready.",
  spawns: [
    { defId: "alpha", id: "alpha", c: 2, r: 2 },
    { defId: "ally-02", id: "ally-02", c: 1, r: 0 },
    { defId: "hostile", id: "h1", c: 5, r: 0 },
    { defId: "hostile", id: "h2", c: 5, r: 3 },
  ],
};

export const ENCOUNTER_FULL: EncounterDef = {
  id: "full-broken-signal",
  operationName: "BROKEN SIGNAL",
  objective: "Defeat the hostile squad to complete Broken Signal.",
  teaching: "Alpha fights up close, CNC attacks from range, and Shadow supports the pack.",
  steps: ["Use Alpha and CNC to pressure hostiles.", "Keep the squad standing with Shadow\u0027s support."],
  next: null,
  resultsTitle: "OPERATION COMPLETE",
  resultsNote: "Hostile force eliminated.",
  spawns: BROKEN_SIGNAL_SPAWNS,
};

export const ONBOARDING_ENCOUNTERS: Record<OnboardingEncounterId, EncounterDef> = {
  "solo-1": ENCOUNTER_SOLO_1,
  "solo-2": ENCOUNTER_SOLO_2,
  "ally-koda": ENCOUNTER_ALLY_KODA,
  "full-broken-signal": ENCOUNTER_FULL,
};

export const DEFAULT_ONBOARDING_STAGE: OnboardingEncounterId = "solo-1";

function isOnboardingEncounterId(value: string): value is OnboardingEncounterId {
  return Object.prototype.hasOwnProperty.call(ONBOARDING_ENCOUNTERS, value);
}

/** Unknown ids fall back to solo-1 so session-mode stays deterministic and never crashes. */
export function getOnboardingEncounter(stageId: string | null | undefined): EncounterDef {
  if (stageId && isOnboardingEncounterId(stageId)) return ONBOARDING_ENCOUNTERS[stageId];
  return ENCOUNTER_SOLO_1;
}

/** Production path: enabled=false always yields the canonical full encounter. */
export function resolveDeploySpawns(enabled: boolean, stageId: string | null | undefined): SpawnSpec[] {
  if (!enabled) return BROKEN_SIGNAL_SPAWNS;
  return getOnboardingEncounter(stageId).spawns;
}

export function resolveCurrentEncounter(enabled: boolean, stageId: string | null | undefined): EncounterDef {
  if (!enabled) return ENCOUNTER_FULL;
  return getOnboardingEncounter(stageId);
}

export function alliedBriefDefs(spawns: SpawnSpec[]): UnitDef[] {
  const seen = new Set<string>();
  const out: UnitDef[] = [];
  for (const s of spawns) {
    const def = s.unitDef || UNIT_DEFS[s.defId];
    if (!def || def.team !== "ally" || seen.has(def.defId)) continue;
    seen.add(def.defId);
    out.push(def);
  }
  return out;
}

export function enemyBriefRows(spawns: SpawnSpec[]): Array<{ def: UnitDef; count: number }> {
  const counts = new Map<string, { def: UnitDef; count: number }>();
  for (const s of spawns) {
    const def = s.unitDef || UNIT_DEFS[s.defId];
    if (!def || def.team !== "enemy") continue;
    counts.set(def.defId, { def, count: (counts.get(def.defId)?.count || 0) + 1 });
  }
  return [...counts.values()];
}
