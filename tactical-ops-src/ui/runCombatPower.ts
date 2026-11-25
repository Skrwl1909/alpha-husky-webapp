/** Read-only display selection for a backend-accepted, run-frozen Combat Profile V3. */
import { parseCombatProfileV3, type TacticalCombatProfileV3 } from "../combat/combatProfileV3";
import type { TacticalCombatProfileV2 } from "../combat/combatProfile";
import type { FoundationProgressionState } from "../host/foundationProgression";
import type { AcceptedPower } from "../host/acceptedPower";

type AcceptedRun = {
  runId: string;
  acceptedPower?: AcceptedPower | null;
  squadIds: string[];
  rulesContract?: { combatProfileVersion: number } | null;
  combatProfileV2?: TacticalCombatProfileV2 | null;
  combatProfileV3?: TacticalCombatProfileV3 | null;
};

export type ConfirmedCombatPower = {
  runId: string;
  profile: TacticalCombatProfileV3;
  petDeployed: boolean;
  source?: "meaningful-power" | "v3";
};

function verifiedProfile(
  v3: TacticalCombatProfileV3 | null | undefined,
  v2: TacticalCombatProfileV2 | null | undefined,
): TacticalCombatProfileV3 | null {
  if (!v3 || !v2) return null;
  try {
    const profile = parseCombatProfileV3(v3);
    return profile && profile.pet?.id === v2.pet?.id ? profile : null;
  } catch {
    return null;
  }
}

function directAcceptedPower(
  progression: FoundationProgressionState,
  runId: string,
): ConfirmedCombatPower | null {
  const sources: Array<{runId?: string | null; activeRunId?: string | null; acceptedPower?: AcceptedPower | null} | undefined> = [
    progression.lastHowl, progression.counterstrike,
  ];
  for (const source of sources) {
    if (!source || (source.runId !== runId && source.activeRunId !== runId)) continue;
    const accepted = source.acceptedPower;
    if (!accepted) continue;
    return {
      runId,
      profile: {version: 3, mode: "battle-v1", alpha: accepted.alpha, pet: null},
      petDeployed: false,
      source: "meaningful-power",
    };
  }
  return null;
}

/** No cross-run fallback, no derived RPG maths, no equipment-based recalculation. */
export function confirmedRunCombatPower(
  progression: FoundationProgressionState | null | undefined,
  runId: string | null | undefined,
): ConfirmedCombatPower | null {
  if (!progression || !runId) return null;

  if (progression.activeRunId === runId &&
      progression.foundationRunRules?.runId === runId &&
      progression.foundationRunRules.rulesContract.combatProfileVersion === 3) {
    const profile = verifiedProfile(progression.activeCombatProfileV3, progression.activeCombatProfileV2);
    if (profile) return { runId, profile, petDeployed: false };
  }

  const direct = directAcceptedPower(progression, runId);
  if (direct) return direct;
  const runs: Array<AcceptedRun | null | undefined> = [
    progression.fieldOps?.activeMissionRun,
    progression.chapterActiveMission,
    progression.signalTrials?.activeRun,
    ...Object.values(progression.operations || {}).map(operation => operation.activeMissionRun),
  ];
  for (const run of runs) {
    if (run?.runId !== runId || run.rulesContract?.combatProfileVersion !== 3 ||
        !run.squadIds.includes("alpha")) continue;
    const profile = verifiedProfile(run.combatProfileV3, run.combatProfileV2);
    if (!profile) continue;
    if (run.acceptedPower === null) return null;
    if (run.acceptedPower) {
      const {gearImpactV31: _legacyGear, ...legacy} = profile;
      return {runId, profile:{...legacy,alpha:run.acceptedPower.alpha},
        petDeployed: Boolean(profile.pet && run.squadIds.includes(`pet:${profile.pet.id}`)),
        source:"meaningful-power"};
    }
    return {
      runId,
      profile,
      petDeployed: Boolean(profile.pet && run.squadIds.includes(`pet:${profile.pet.id}`)),
    };
  }
  return null;
}
