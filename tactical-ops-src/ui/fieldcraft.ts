import type { BattleEvent, UnitDef } from "../combat/types";
import type { MissionDef } from "../data/operations";
import type { GrowthSnapshot } from "../data/playerGrowth";
import { growthHero, resolveGrowthSkill } from "../data/playerGrowth";
import { getSkill } from "../data/skills";
import type { S3CombatProof } from "./s3CombatProof";

/** Read-only explanation of the equipped build, never a score or promised victory. */
export function buildFit(mission: MissionDef | null | undefined, units: readonly UnitDef[], growth?: GrowthSnapshot | null): string[] {
  if (!mission) return [];
  const rows: string[] = [];
  for (const unit of units.filter(u => u.team === "ally")) {
    const skills = unit.skillIds.map(id => resolveGrowthSkill(getSkill(id), growthHero(growth,unit.defId)));
    if (unit.defId === "alpha") {
      const howl = skills.find(s => s.name === "HOWL");
      if (howl) rows.push(`ALPHA: HOWL radius ${howl.radius}; ${howl.effects.some(e => e.status === "GUARD") ? "GUARD covers nearby holders" : "buff a spread-out squad; no added GUARD"}.`);
    } else if (unit.defId === "ally-02") {
      const thrust = skills.find(s => s.name === "THRUST"), pressure = skills.find(s => s.name === "PRESSURE");
      if (thrust && pressure) rows.push(`CNC: THRUST range ${thrust.maxRange}; PRESSURE range ${pressure.maxRange}, cooldown ${pressure.cooldownMax}. ${mission.objectiveType === "INTERCEPT" ? "Reach the courier before the exit." : "Time control before the enemy strike."} ${growthHero(growth,unit.defId)?.discipline === "disruptor" ? "Can cancel a real interruptible locked intent." : "No locked-intent cancellation without the DISRUPTOR doctrine."}`);
    } else if (unit.defId === "ally-03") {
      const mend = skills.find(s => s.name === "MEND"), pack = skills.find(s => s.name === "PACK SUPPORT");
      if (mend && pack) rows.push(`SHADOW: MEND ${mend.targetType === "ALLY_AOE" ? `radius ${mend.radius}` : `range ${mend.maxRange}`}, cooldown ${mend.cooldownMax}; PACK radius ${pack.radius}. ${mission.objectiveType === "HOLD" ? "Cover the holder before an announced hit." : "Recover lost HP between threats."}`);
    } else if (unit.defId.startsWith("pet:")) rows.push(`PET: move ${unit.move}; RECOVER from ${unit.recoverRange || 1} cells. ${mission.objectiveType === "INTERCEPT" ? "HAMSTRING the courier; trade reach against PATHFINDER mobility." : "Use relay reach only during an open signal window."}`);
  }
  const preferred = mission.objectiveType === "INTERCEPT" ? ["CNC:","PET:"] : mission.objectiveType === "RECOVER" ? ["PET:","SHADOW:"] : ["SHADOW:","ALPHA:"];
  return rows.sort((a,b) => { const score = (s: string) => { const i=preferred.findIndex(prefix=>s.startsWith(prefix));return i<0?2:i; };return score(a)-score(b); });
}
export function recordFieldcraft(current: S3CombatProof | null, events: readonly BattleEvent[]): S3CombatProof | null {
  if (!current) return current;
  const observed = events.flatMap(e => e.buildEvidence ? [e.buildEvidence] : []);
  if (!observed.length) return current;
  return { ...current, fieldcraft: [...new Set([...(current.fieldcraft || []), ...observed])].slice(-24) };
}
export function fieldcraftResults(proof: S3CombatProof | null, runId: string | null, missionId: string | null): readonly string[] {
  return proof && proof.runId === runId && proof.missionId === missionId ? (proof.fieldcraft || []).slice(-3) : [];
}
