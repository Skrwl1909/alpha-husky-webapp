/** Static authored combat identity emblems. Gameplay never derives power from imagery. */
const ROOT = "/images/tactical_ops/emblems" as const;
export const TACTICAL_EMBLEM_ASSETS = {
  alpha: {
    core: `${ROOT}/emblem_alpha_core.png`,
    vanguard: `${ROOT}/emblem_alpha_vanguard.png`,
    howlkeeper: `${ROOT}/emblem_alpha_howlkeeper.png`,
  },
  "ally-02": {
    core: `${ROOT}/emblem_cnc_core.png`,
    pursuer: `${ROOT}/emblem_cnc_pursuer.png`,
    disruptor: `${ROOT}/emblem_cnc_disruptor.png`,
  },
  "ally-03": {
    core: `${ROOT}/emblem_shadow_core.png`,
    sentinel: `${ROOT}/emblem_shadow_sentinel.png`,
    medic: `${ROOT}/emblem_shadow_medic.png`,
  },
} as const;

export type EmblemHeroId = keyof typeof TACTICAL_EMBLEM_ASSETS;
export function tacticalEmblemFor(heroId: string, discipline?: string | null): string | null {
  if (!Object.prototype.hasOwnProperty.call(TACTICAL_EMBLEM_ASSETS, heroId)) return null;
  const variants = TACTICAL_EMBLEM_ASSETS[heroId as EmblemHeroId] as Record<string, string>;
  return (discipline && Object.prototype.hasOwnProperty.call(variants, discipline) ? variants[discipline] : variants.core) || null;
}
