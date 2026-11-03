import { getMissionDef, missionBattleRules, type MissionDef } from "./operations";
import type { FieldContext, FieldResult } from "./fieldOps";

/** G4 is read-only presentation of the existing accepted-run combat contract.
 * Never modify reinforcements, awards, pressure or persistent state here. */
export type FieldWindow = {
  baseRound: number; actualRound: number; delayed: boolean;
  text: string;
};

export function fieldWindow(mission: MissionDef | null | undefined, context: Partial<FieldContext> | null | undefined): FieldWindow | null {
  if (mission?.activity !== "FIELD_OP" || !context || !Number.isInteger(context.pressure) ||
      context.pressure! < 0 || context.pressure! > 3 || context.masteryChallenge ||
      context.veteranChallenge || context.lockdownPlan) return null;
  // The battle resolver, not this view, owns reinforcement scheduling.
  const baseline = missionBattleRules(mission, false, { ...context, pressure: 2 }).reinforcement;
  const actual = missionBattleRules(mission, false, context).reinforcement;
  if (!baseline || !actual || !Number.isInteger(baseline.triggerRound) ||
      !Number.isInteger(actual.triggerRound)) return null;
  const delayed = actual.triggerRound > baseline.triggerRound;
  return { baseRound: baseline.triggerRound, actualRound: actual.triggerRound, delayed,
    text: delayed
      ? `HOUND round ${actual.triggerRound} (normally ${baseline.triggerRound}). Reduced Signal Pressure gives one extra preparation round.`
      : `HOUND round ${actual.triggerRound}. Lower Signal Pressure below 2 to delay future new runs to round ${baseline.triggerRound + 1}.` };
}

/** Read only the active server rotation for previews. Previously accepted runs
 * must use their frozen FieldContext and must never inherit today's pressure. */
export function currentFieldWindow(missionId: string, board: {cycleId:number;nextRotationAt:number;activeMissionIds:string[];reportVersion?:number;directiveSet?: "pursuit"|"attrition"} | undefined,
  region: {cycleId:number;pressure:number} | undefined, now = Date.now(), tier: "standard" | "advanced" = "standard"): FieldWindow | null {
  if (!board || !region || region.cycleId !== board.cycleId || board.nextRotationAt * 1000 <= now ||
      !board.activeMissionIds.includes(missionId)) return null;
  const mission = getMissionDef(missionId);
  return fieldWindow(mission, { cycleId:board.cycleId, pressure:region.pressure,
    reportVersion:board.reportVersion || 2, directiveTier:tier, directiveSet:board.directiveSet });
}

/** Only an authenticated matching receipt may justify a changed world-window claim. */
export function confirmedWindowChange(receipt: FieldResult | null | undefined): string | null {
  if (!receipt?.regionalApplied || !receipt.victory || receipt.pressureBefore === receipt.pressureAfter) return null;
  if (receipt.pressureBefore >= 2 && receipt.pressureAfter < 2)
    return "TACTICAL WINDOW OPEN · New reinforcement Field Ops delay HOUND by one round. Already accepted missions keep their original timing.";
  if (receipt.pressureBefore < 2 && receipt.pressureAfter >= 2)
    return "TACTICAL WINDOW CLOSED · New reinforcement Field Ops use their normal HOUND timing. Already accepted missions stay unchanged.";
  return null;
}
