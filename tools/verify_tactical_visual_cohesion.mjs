import assert from "node:assert/strict";
import {createServer} from "vite";
import {readFileSync} from "node:fs";
const vite=await createServer({configFile:false,server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const {enemyScene}=await vite.ssrLoadModule("/tactical-ops-src/ui/enemyAttackPresentation.ts");
  const attacker={id:"enemy-1",team:"enemy",defeated:false,role:"hostile",c:5,r:2};
  const victim={id:"alpha",team:"ally",c:2,r:2};
  const events=[{type:"damage",unitId:"alpha",text:"-7"}];
  for(const [skill,style,duration,phase] of [
    ["hostile-strike","melee",550,.42],
    ["leader-crush","heavy",680,.49],
    ["hound-pulse","ranged",550,.44],
    ["hound-interference","jam",620,.44]
  ]) {
    const src=style==="heavy"?{...attacker,role:"leader"}:attacker;
    const scene=enemyScene(src,skill,events,[src,victim],4);
    assert.equal(scene?.style,style);
    assert.equal(scene?.durationMs,duration);
    assert.equal(scene?.contactMs,Math.round(duration*phase));
  }
  assert.equal(enemyScene(attacker,"hostile-strike",[],[attacker,victim],2),null);
  const battle=readFileSync("tactical-ops-src/ui/Battle.tsx","utf8");
  assert(battle.includes("clamp(82px"),"S8 left edge-safety clamp required");
  assert(battle.includes("clamp(24px"),"S8 top edge-safety clamp required");
  const styles=readFileSync("tactical-ops-src/styles.ts","utf8");
  assert(styles.includes("COMBAT_COHESION_CSS"),"S8 must ship in canonical host CSS bundle");
  const css=readFileSync("tactical-ops-src/ui/combatCohesion.css","utf8");
  for(const s of [".t-consequence-finisher",".t-consequence-counter",".t-consequence-guarded",".t-threat-tile","prefers-reduced-motion","pointer-events: none"])assert(css.includes(s),s);
  assert(!css.includes("touch-action: none"),"S8 must not capture inputs");
  console.log("PASS S8: matched hostile contact, edge-safe captions, FX hierarchy and reduced motion");
} finally {await vite.close()}
