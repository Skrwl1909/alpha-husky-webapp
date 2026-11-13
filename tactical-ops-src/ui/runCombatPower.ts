/** Read-only display selection for a backend-accepted, run-frozen Combat Profile V3. */
import { parseCombatProfileV3, type TacticalCombatProfileV3 } from "../combat/combatProfileV3";
import type { TacticalCombatProfileV2 } from "../combat/combatProfile";
import type { FoundationProgressionState } from "../host/foundationProgression";

type AcceptedRun = {
  runId: string;
  squadIds: string[];
  rulesContract?: { combatProfileVersion: number } | null;
  combatProfileV2?: TacticalCombatProfileV2 | null;
  combatProfileV3?: TacticalCombatProfileV3 | null;
};

export type ConfirmedCombatPower = {
  runId: string;
  profile: TacticalCombatProfileV3;
  petDeployed: boolean;
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
    return {
      runId,
      profile,
      petDeployed: Boolean(profile.pet && run.squadIds.includes(`pet:${profile.pet.id}`)),
    };
  }
  return null;
}
