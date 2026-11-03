import type { FieldResult } from "../data/fieldOps";

/** Receipt-only after-action hierarchy. No local gameplay, reward or eligibility resolver. */
export type RecordedImpact = {
  kind: "world" | "milestone" | "secured" | "recorded";
  eyebrow: string;
  title: string;
  detail: string;
};
type Consequence = { label: string; detail: string } | null;

/** A consequential battle should feel consequential *before* its accounting is shown. */
export function recordedImpact(receipt: FieldResult, consequence: Consequence): RecordedImpact {
  const mastery = receipt.masteryChanges?.find(change => change.veteran?.unlocked || change.stage > change.beforeStage);
  if (receipt.victory && receipt.regionalApplied && receipt.pressureBefore >= 2 && receipt.pressureAfter < 2) {
    return {
      kind: "world",
      eyebrow: "BATTLEFIELD SHIFT CONFIRMED",
      title: "HOUND REINFORCEMENTS DELAYED",
      detail: `Signal Pressure ${receipt.pressureBefore} → ${receipt.pressureAfter}. Your Pack gains one extra preparation round in new eligible reinforcement Field Ops. Already accepted runs keep their original timing.`,
    };
  }
  if (receipt.veteranCareer?.unlocked) return {
    kind: "milestone", eyebrow: "CAREER BREAKTHROUGH", title: "VETERAN EARNED",
    detail: "Rank 4 recorded. Pack Extraction is now unlocked.",
  };
  if (receipt.rankAfter > receipt.rankBefore) return {
    kind: "milestone", eyebrow: "COMMANDER CERTIFIED",
    title: `RANK ${receipt.rankAfter} EARNED`,
    detail: `Commander Rank ${receipt.rankBefore} → ${receipt.rankAfter}. Your promotion is recorded by the server.`,
  };
  if (mastery) return {
    kind: "milestone", eyebrow: "PACK CAPABILITY ADVANCED",
    title: `${mastery.unitId} · ${mastery.veteran?.unlocked ? "VETERAN UNLOCKED" : "MASTERY STAGE ADVANCED"}`,
    detail: mastery.veteran?.unlocked ? "A new companion option was unlocked by this result." : `Mastery stage ${mastery.beforeStage} → ${mastery.stage}. Review this unit's saved capabilities.`,
  };
  if (consequence) return {
    kind: "world", eyebrow: "WORLD STATE RECORDED",
    title: consequence.label, detail: consequence.detail,
  };
  if (receipt.veteranCareer && receipt.veteranCareer.after > receipt.veteranCareer.before) return {
    kind: "milestone", eyebrow: "CAREER ADVANCED",
    title: `VETERAN ${receipt.veteranCareer.before} → ${receipt.veteranCareer.after}/12`,
    detail: "A new eligible Veteran credit was confirmed by this receipt.",
  };
  if (receipt.victory && receipt.firstCycleSecure === true) return {
    kind: "secured", eyebrow: "ROTATION RECORD CONFIRMED",
    title: "OPERATION SECURED",
    detail: receipt.challengeSuccess && receipt.challengeBonus > 0
      ? `First clear and optional challenge recorded. +${receipt.challengeBonus} challenge bonus confirmed.`
      : "First clear saved for this rotation. No new tactical modifier was confirmed.",
  };
  return {
    kind: "recorded", eyebrow: "AFTER-ACTION RECORD",
    title: receipt.victory ? "MISSION RECORDED" : "ATTEMPT RECORDED",
    detail: receipt.victory
      ? "Your result was saved. No new rank, capability or regional change is confirmed by this receipt."
      : "The attempt was recorded. No victory unlock or regional improvement is confirmed.",
  };
}
