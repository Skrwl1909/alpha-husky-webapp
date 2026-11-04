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
  if (receipt.veteranCareer?.unlocked) return {
    kind: "milestone", eyebrow: "THE PACK LEVELS UP", title: "VETERAN UNLOCKED!",
    detail: "Rank 4 is yours. Pack Extraction is ready.",
  };
  if (receipt.rankAfter > receipt.rankBefore) return {
    kind: "milestone", eyebrow: "RANK UP",
    title: `COMMANDER RANK ${receipt.rankAfter}!`,
    detail: `Rank ${receipt.rankBefore} → ${receipt.rankAfter}. You earned it.`,
  };
  if (mastery) return {
    kind: "milestone", eyebrow: "PACK POWER UP",
    title: `${mastery.unitId} · ${mastery.veteran?.unlocked ? "VETERAN UNLOCKED" : "MASTERY STAGE ADVANCED"}`,
    detail: mastery.veteran?.unlocked ? "Your companion has a new option. Check the squad." : `Mastery ${mastery.beforeStage} → ${mastery.stage}. Check your squad.`,
  };
  if (receipt.victory && receipt.regionalApplied && receipt.pressureBefore >= 2 && receipt.pressureAfter < 2) {
    return {
      kind: "world",
      eyebrow: "THE PACK PUSHED BACK",
      title: "HOUND HELD BACK!",
      detail: `Pressure ${receipt.pressureBefore} → ${receipt.pressureAfter}. HOUND arrives 1 round later in new Field Ops with reinforcements. Ongoing missions keep their timing.`,
    };
  }
  if (receipt.victory && receipt.regionalApplied && receipt.pressureBefore !== receipt.pressureAfter) {
    if (receipt.pressureAfter === 0 && receipt.pressureBefore === 1) {
      return { kind: "world", eyebrow: "THE PACK OWNS THIS GROUND",
        title: "AREA CLEAR!",
        detail: "Pressure 1 → 0. HOUND is still 1 round late in new eligible fights. No extra delay stacks." };
    }
    if (receipt.pressureBefore === 3 && receipt.pressureAfter === 2) {
      return { kind: "world", eyebrow: "THE PACK PUSHED BACK",
        title: "PRESSURE DOWN.",
        detail: "Pressure 3 → 2. HOUND still arrives on schedule. Push harder to slow it down." };
    }
  }
  if (consequence) return {
    kind: "world", eyebrow: "THE PACK MADE A MARK",
    title: consequence.label, detail: consequence.detail,
  };
  if (receipt.veteranCareer && receipt.veteranCareer.after > receipt.veteranCareer.before) return {
    kind: "milestone", eyebrow: "VETERAN PROGRESS",
    title: `VETERAN ${receipt.veteranCareer.before} → ${receipt.veteranCareer.after}/12`,
    detail: "One more Veteran credit earned.",
  };
  if (receipt.victory && receipt.firstCycleSecure === true) return {
    kind: "secured", eyebrow: "MISSION WIN",
    title: "FIRST WIN SECURED!",
    detail: receipt.challengeSuccess && receipt.challengeBonus > 0
      ? `First win and challenge cleared. +${receipt.challengeBonus} challenge bonus.`
      : "First win saved this rotation. No new battle advantage this time.",
  };
  return {
    kind: "recorded", eyebrow: "MISSION LOG",
    title: receipt.victory ? "WIN SAVED" : "ATTEMPT SAVED",
    detail: receipt.victory
      ? "Win saved. No new rank, skill or area change this time."
      : "Attempt saved. No new unlock or area bonus.",
  };
}
