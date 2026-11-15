import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const battle = read("tactical-ops-src/ui/Battle.tsx");
const store = read("tactical-ops-src/store/battleStore.ts");
const motion = read("tactical-ops-src/tactical.css");
const cohesion = read("tactical-ops-src/ui/combatCohesion.css");
const enemy = read("tactical-ops-src/ui/enemyAttackPresentation.ts");
const fx = read("tactical-ops-src/ui/combatFxAtlas.ts");

const keyframes = (css, name) => {
  const start = css.indexOf(`@keyframes ${name}`);
  assert(start >= 0, `Missing ${name}`);
  return css.slice(start, css.indexOf("\n}", start) + 2);
};

test("melee overlays own the sprite while touch positions remain engine-owned", () => {
  assert.match(battle, /enemyScene\.style === "melee" \|\| enemyScene\.style === "heavy"/);
  assert.match(battle, /travelActors\.add\(enemyScene\.actorId\)/);
  assert.match(battle, /travelGhost=\{travelActors\.has\(u\.id\)\}/);
  assert.match(battle, /t-motion-actor t-motion-\$\{roleClass\(actor\)/);
  assert.match(battle, /t-choreo-actor t-motion-actor/);
  assert.match(motion, /\.t-token\.travel-ghost img\.body\s*\{visibility:hidden;/);
  assert.match(battle, /!unit\.defeated && unit\.hp > 0 \? <button/);
  assert.match(cohesion, /\.t-token\.is-moving:not\(\.attacking\)/);
  assert.match(battle, /previousCell\.current = current/);
});

test("visual contact frame preserves accepted damage reveal timing", () => {
  assert.match(fx, /traveling\.durationMs\*\(combatFxTravelKind\(traveling\.name\)==="beam"\?\.46:\.37\)/);
  assert.match(enemy, /style==="heavy"\?\.49:style==="melee"\?\.42:\.44/);
  for (const [name, phase, target] of [
    ["t-choreo-dash", 37, "--to-x"],
    ["t-hostile-dash", 42, "--enemy-target-x"],
    ["t-hostile-heavy", 49, "--enemy-target-x"],
  ]) {
    const frames = keyframes(motion, name);
    assert(frames.includes(`${phase}%{left:var(${target})`), `${name} must land at ${phase}%`);
  }
  assert.match(cohesion, /\.t-choreo-travel \.t-choreo-actor \{[^}]*animation-timing-function: linear;/s);
  assert.match(store, /revealHp\(ev\);[\s\S]*set\(\{ impactId: ev\.unitId/);
});

test("confirmed impacts, retries and reduced motion are preserved", () => {
  assert.match(battle, /hitFrom=\{hitFrom\}/);
  assert.match(motion, /var\(--motion-recoil-x/);
  assert.match(motion, /@keyframes t-contact-collapse/);
  assert.match(store, /enemyScene: null, attackingId: null/);
  assert.match(store, /combatFx: \[\], enemyScene: null/);
  assert.match(cohesion, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(motion, /\.t-token\.travel-ghost img\.body \{visibility:visible!important;\}/);
  assert.match(cohesion, /pointer-events:none;/);
});
