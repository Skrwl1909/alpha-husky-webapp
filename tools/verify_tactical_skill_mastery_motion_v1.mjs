import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const battle = readFileSync("tactical-ops-src/ui/Battle.tsx", "utf8");
const css = readFileSync("tactical-ops-src/ui/combatCohesion.css", "utf8");
const store = readFileSync("tactical-ops-src/store/battleStore.ts", "utf8");
const panel = readFileSync("tactical-ops-src/ui/PackMastery.tsx", "utf8");

// Cast motion must use only an accepted skill FX receipt, never mere selection.
assert.match(battle, /const castFx = presentation\.primaryFx\.filter/);
assert.match(battle, /effects\.findIndex\(other => other\.actorId === effect\.actorId\) === index/);
assert.match(battle, /className=\{`t-skill-cast fx-affinity-\$\{affinityFor\(caster\)\}`\}/);
assert.match(battle, /key=\{`cast-\$\{effect\.id\}`\}/);
assert.match(store, /publishFx\(effects, g\)/);
assert.match(store, /if \(!\(await waitForContact\(effects, g\)\)\) return;/);
assert.match(store, /publishMoment\(confirmedSkillMoment/);

// Ranked/Mastery feedback is tied to the confirmed post-contact moment.
assert.match(battle, /combatMoment && combatMoment\.tier !== "base"/);
assert.match(battle, /className=\{`t-skill-mastery-impact fx-affinity-/);
assert.match(css, /\.t-skill-mastery-impact\.fx-tier-signature/);
assert.match(css, /\.t-skill-mastery-impact\.fx-mode-heal/);
assert.match(panel, /t-mastery-reward \$\{change\.beforeStage !== change\.stage \? "is-unlock"/);
assert.match(css, /\.t-mastery-reward\.is-unlock/);

// Cosmetic-only elements cannot intercept board or ability input.
assert.match(css, /\.t-skill-cast,\s*#tacticalOpsRoot \.t-skill-mastery-impact\s*\{[^}]*pointer-events:none;/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.t-skill-cast,\s*#tacticalOpsRoot \.t-skill-mastery-impact\s*\{display:none!important;/);
assert.match(battle, /presentation\.showFallbackMasterFx/);
console.log("PASS confirmed cast origins, deduplicated recipients, post-contact mastery cues, no extra hitboxes, reduced motion");
