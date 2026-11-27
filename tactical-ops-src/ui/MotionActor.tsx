import { useEffect, useState, type CSSProperties } from "react";
import type { CombatUnit } from "../combat/types";
import { unitVisualStyle } from "./unitVisual";

/** Pilot scope: horizontal STRIKE for base Alpha and melee Skirmisher.
 * Vertical headings, cosmetics and other actions retain their authored art.
 */
export const ATTACK_SHEETS = {
  alpha: {src:"/images/tactical_ops/unit_motion/v1/alpha-strike.webp", widthFactor:(947/470)*(512/400)},
  skirmisher: {src:"/images/tactical_ops/unit_motion/v1/skirmisher-strike.webp", widthFactor:(279/288)*(512/400)},
} as const;
export type AttackSheet = keyof typeof ATTACK_SHEETS;
const decoded = new Map<string, Promise<boolean>>();
function load(src: string): Promise<boolean> {
  if (!decoded.has(src)) decoded.set(src, new Promise(resolve => {
    const image = new Image();
    image.onload = () => image.decode().then(() => resolve(true), () => resolve(false));
    image.onerror = () => resolve(false);
    image.src = src;
  }));
  return decoded.get(src)!;
}
export function preloadAttackSheets() {
  for (const sheet of Object.values(ATTACK_SHEETS)) void load(sheet.src);
}

export function MotionActor({unit, className, src, fallback, sheet, mirrored=false, phase=37, poseScale=1}: {
  unit:CombatUnit; className:string; src:string; fallback:string;
  sheet?:AttackSheet; mirrored?:boolean; phase?:37|42|49; poseScale?:number;
}) {
  const atlas = sheet ? ATTACK_SHEETS[sheet] : undefined;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active=true;
    setReady(false);
    if(atlas) void load(atlas.src).then(ok => {if(active)setReady(ok);});
    return () => {active=false;};
  }, [atlas]);
  // The entire frame canvas is larger than the resting canvas. Articulated
  // limbs can extend outside the token without enlarging its body or hitbox.
  const style={...unitVisualStyle(unit, sheet ? 1 : poseScale),
    "--sheet-width":`${(atlas?.widthFactor ?? 1)*100}%`,
    "--sheet-mirror":mirrored?-1:1,
  } as CSSProperties;
  return <div className={`${className} t-grounded-actor${ready ? " has-frames" : ""}`} style={style}
    data-motion-unit={unit.id} data-sheet={ready ? sheet : undefined} aria-hidden="true">
    <img className={`t-motion-fallback${mirrored && !sheet ? " is-mirrored" : ""}`} src={src} alt="" draggable={false}
      onError={e=>{e.currentTarget.onerror=null;e.currentTarget.classList.remove("is-mirrored");e.currentTarget.src=fallback;}} />
    {atlas ? <span className={`t-attack-frames t-contact-${phase}`} style={{backgroundImage:`url("${atlas.src}")`}} /> : null}
  </div>;
}
