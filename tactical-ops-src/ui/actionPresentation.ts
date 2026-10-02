import type { SkillDef } from "../combat/types";

export type ActionArchetype = "strike" | "heavy" | "control" | "heal" | "support" | "objective";

export interface ActionPresentation {
  archetype: ActionArchetype;
  cue: string;
  targetClass: "enemy" | "ally" | "aura" | "objective";
  effectClass: "damage" | "control" | "heal" | "buff" | "objective";
}

const OVERRIDES: Record<string, Partial<ActionPresentation>> = {
  "alpha-rend": { archetype: "heavy", cue: "CLOSE · BLEED", effectClass: "control" },
  "alpha-howl": { archetype: "support", cue: "AURA · R2", targetClass: "aura", effectClass: "buff" },
  "pet-hamstring": { archetype: "control", cue: "CLOSE · SLOW", effectClass: "control" },
  "u02-pressure": { archetype: "control", cue: "CONTROL · 3", effectClass: "control" },
  "u02-pressure-disruptor": { archetype: "control", cue: "CONTROL · 3", effectClass: "control" },
  "u03-mend": { archetype: "heal", cue: "ALLY · 3", targetClass: "ally", effectClass: "heal" },
  "u03-mend-restorer": { archetype: "heal", cue: "AURA · R1", targetClass: "aura", effectClass: "heal" },
  "u03-pack": { archetype: "support", cue: "AURA · R2", targetClass: "aura", effectClass: "buff" },
  "u03-pack-warden": { archetype: "support", cue: "AURA · R2", targetClass: "aura", effectClass: "buff" },
};

function defaultTargetClass(skill: SkillDef): ActionPresentation["targetClass"] {
  if (skill.targetType === "ALLY_AOE") return "aura";
  if (skill.targetType === "ALLY_SINGLE" || skill.targetType === "SELF") return "ally";
  return "enemy";
}

function defaultEffectClass(skill: SkillDef): ActionPresentation["effectClass"] {
  if (skill.effects.some((effect) => effect.kind === "heal")) return "heal";
  const statuses = skill.effects.filter((effect) => effect.kind === "status");
  if (statuses.some((effect) => effect.status && String(effect.status).endsWith("_DOWN"))) return "control";
  if (statuses.some((effect) => effect.status === "BLEED")) return "control";
  if (statuses.length) return "buff";
  return "damage";
}

function defaultArchetype(skill: SkillDef, effectClass: ActionPresentation["effectClass"]): ActionArchetype {
  if (effectClass === "heal") return "heal";
  if (effectClass === "control") return "control";
  if (effectClass === "buff") return "support";
  const heavy = skill.effects.some((effect) => effect.kind === "damage" && (effect.multiplier ?? 1) >= 1.35);
  return heavy ? "heavy" : "strike";
}

function defaultCue(skill: SkillDef, effectClass: ActionPresentation["effectClass"]): string {
  if (skill.targetType === "ALLY_AOE") return `AURA · R${Math.max(1, skill.radius)}`;
  if (skill.targetType === "ALLY_SINGLE") return `ALLY · ${skill.maxRange}`;
  if (skill.targetType === "SELF") return "SELF";
  if (effectClass === "control") return skill.maxRange <= 1 ? "CLOSE · CTRL" : `CONTROL · ${skill.maxRange}`;
  if (skill.maxRange <= 1) return "CLOSE · 1";
  return `REACH · ${skill.maxRange}`;
}

export function getActionPresentation(skill: SkillDef): ActionPresentation {
  const effectClass = defaultEffectClass(skill);
  const base: ActionPresentation = {
    archetype: defaultArchetype(skill, effectClass),
    cue: defaultCue(skill, effectClass),
    targetClass: defaultTargetClass(skill),
    effectClass,
  };
  return { ...base, ...(OVERRIDES[skill.id] || {}) };
}

export const RECOVER_PRESENTATION: ActionPresentation = {
  archetype: "objective",
  cue: "OBJECTIVE",
  targetClass: "objective",
  effectClass: "objective",
};
