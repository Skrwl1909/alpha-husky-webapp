import { rankChanges } from "../../data/buildPreview";
import { HERO_PATHS, HERO_SKILLS, UPGRADES, resolveGrowthSkill, type Discipline, type HeroGrowth, type HeroId } from "../../data/playerGrowth";
import { getSkill } from "../../data/skills";
import { SIGNAL_ATLAS_SECTOR_EMBLEMS } from "./signalAtlasAssets";

/** UI-only sector taxonomy: no additional backend progression or unlock conditions. */
export type AtlasSector = { id: string; title: string; description: string; skillIds: readonly string[]; tone: "cyan" | "amber"; emblemSrc: string };
export const ATLAS_SECTORS: Record<HeroId, readonly AtlasSector[]> = {
  alpha: [
    { id: "assault", title: "ASSAULT", description: "Strike · Rend", skillIds: ["alpha-strike", "alpha-rend"], tone: "amber" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.assault },
    { id: "command", title: "COMMAND", description: "Howl", skillIds: ["alpha-howl"], tone: "cyan" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.command },
  ],
  "ally-02": [
    { id: "pursuit", title: "PURSUIT", description: "Thrust · Lunge", skillIds: ["u02-shot", "u02-burst"], tone: "amber" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.pursuit },
    { id: "control", title: "CONTROL", description: "Pressure", skillIds: ["u02-suppress"], tone: "cyan" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.control },
  ],
  "ally-03": [
    { id: "line", title: "FRONT LINE", description: "Sweep", skillIds: ["u03-tap"], tone: "amber" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.line },
    { id: "support", title: "SUPPORT", description: "Mend · Pack Support", skillIds: ["u03-mend", "u03-pack"], tone: "cyan" , emblemSrc: SIGNAL_ATLAS_SECTOR_EMBLEMS.support },
  ],
};
export const HERO_TITLES: Record<HeroId, string> = { alpha: "ALPHA", "ally-02": "CNC", "ally-03": "SHADOW" };
export const HERO_SUBTITLES: Record<HeroId, string> = { alpha: "PACK LEADER", "ally-02": "TACTICAL HUNTER", "ally-03": "SQUAD SUPPORT" };
export const PATH_EXPLANATIONS: Record<Discipline, string> = {
  vanguard: "HOWL grants a short protective GUARD to nearby allies.",
  howlkeeper: "HOWL reaches allies across a larger area.",
  pursuer: "THRUST gains one tile of reach.",
  disruptor: "PRESSURE weakens enemy attacks for longer.",
  sentinel: "PACK SUPPORT also grants a brief GUARD.",
  medic: "MEND cooldown is reduced, to a minimum of one turn.",
};
export type NodeState = "base" | "recorded" | "available" | "maxed" | "needs-rank-one" | "no-points" | "different-discipline" | "no-effect" | "unavailable";
export interface NodeView { id: string; skillId: string; rank: 0|1|2; title: string; state: NodeState; reason: string; changes: string[]; }
export function nextSkillChanges(skillId: string, rank: 1|2, hero: HeroGrowth, path: Discipline, base?: import("../../combat/types").SkillDef): string[] {
  return rankChanges(base || getSkill(skillId), hero, rank, path);
}
export function getNodeView(heroId: HeroId, skillId: string, rank: 0|1|2, hero: HeroGrowth | null, path: Discipline, points: number, baseSkill?: import("../../combat/types").SkillDef): NodeView {
  if (!HERO_SKILLS[heroId].includes(skillId)) throw Error("atlas_invalid_skill");
  const current = hero?.ranks[skillId] || 0;
  const info = rank ? UPGRADES.find(u=>u.skillId===skillId && u.rank===rank) : null;
  const title = rank ? info?.label || "UNKNOWN RANK" : getSkill(skillId).name;
  const base = { id: `skill:${heroId}:${skillId}:${rank}`, skillId, rank, title, changes: [] as string[] };
  if (rank===0) return { ...base, state:"base", reason:"Base action already available. No point required." };
  if (current >= rank) return { ...base, state:rank===2?"maxed":"recorded", reason:"Recorded in the server-owned Skillbook." };
  if (!hero || !info) return { ...base, state:"unavailable", reason:"Awaiting authenticated progression." };
  if (rank===2 && current<1) return { ...base, state:"needs-rank-one", reason:"Record Rank I of this skill first." };
  if (hero.discipline && hero.discipline!==path) return { ...base, state:"different-discipline", reason:"Another discipline is saved. A one-time respec may change it." };
  const changes = nextSkillChanges(skillId,rank,hero,path,baseSkill);
  if (!changes.length) return { ...base, changes, state:"no-effect", reason:"This upgrade produces no effective battle change. Purchase disabled pending balance review." };
  if (points<1) return { ...base, changes, state:"no-points", reason:"Earn a first-clear point before purchasing." };
  return { ...base, changes, state:"available", reason:"Eligible for a server-recorded purchase of 1 point." };
}

/** Layout-only positions. Can accommodate additional released sectors without CSS nth-child slots. */
export function atlasSectorPosition(index: number, total: number): { x: number; y: number } {
  if (!Number.isInteger(total) || total<1 || !Number.isInteger(index) || index<0 || index>=total) throw Error("atlas_invalid_sector_index");
  if(total===2) return { x:index===0?24:76, y:18 };
  const angle=(-Math.PI/2)+(index*2*Math.PI/total);
  return { x:Math.round((50+34*Math.cos(angle))*10)/10, y:Math.round((50+34*Math.sin(angle))*10)/10 };
}
/** Stable, non-overlapping demo positions: content count is independent from viewport. */
export function demoLayout(count: number) {
  if (!Number.isInteger(count) || count<0 || count>500) throw Error("atlas_invalid_demo_count");
  const positions: {id:string;x:number;y:number}[] = [];
  for(let index=0;index<count;index++){
    const ring=Math.floor(index/12);
    const slot=index%12;
    const a=(slot/12)*Math.PI*2+(ring%2)*Math.PI/12-Math.PI/2;
    const radius=118+ring*110;
    positions.push({id:`demo:${index}`,x:Math.round(Math.cos(a)*radius),y:Math.round(Math.sin(a)*radius)});
  }
  return positions;
}
export function assertAtlasManifest(): boolean {
  const all = new Set<string>();
  for(const [heroId,sectors] of Object.entries(ATLAS_SECTORS) as [HeroId,readonly AtlasSector[]][]){
    const skills=sectors.flatMap(s=>[...s.skillIds]);
    if(skills.length!==3 || new Set(skills).size!==3) return false;
    if(skills.some(id=>!HERO_SKILLS[heroId].includes(id))) return false;
    for(const sector of sectors) if(!sector.id || all.has(`${heroId}:${sector.id}`)) return false; else all.add(`${heroId}:${sector.id}`);
    if(HERO_PATHS[heroId].length!==2) return false;
  }
  return true;
}
