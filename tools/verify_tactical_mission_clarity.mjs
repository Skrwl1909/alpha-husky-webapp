import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const onboarding = read("tactical-ops-src/data/onboarding.ts");
const brief = read("tactical-ops-src/ui/App.tsx");
const battle = read("tactical-ops-src/ui/Battle.tsx");
const presentation = read("tactical-ops-src/ui/battlePresentation.ts");
const guidance = read("tactical-ops-src/ui/playerGuidance.ts");
const styles = read("tactical-ops-src/styles.ts");
const css = read("tactical-ops-src/ui/missionClarity.css");

assert.equal((onboarding.match(/steps: \[/g) || []).length, 4, "All four foundation encounters need clear steps");
assert.match(onboarding, /objective: "Defeat the hostile scout\."/);
assert.match(onboarding, /STRIKE \(A1\), then tap the scout/);
assert.doesNotMatch(onboarding, /Close to melee|Move, then Strike at range 1|You cannot be in two cells at once/);

assert.match(brief, /trainingSteps\.length \? \(/, "Foundation briefing should render player steps");
assert.match(brief, /buildNotes\.length \? <details/, "Do not render build-fit for training or empty builds");
assert.doesNotMatch(brief, /NEXT ACCEPTED RUN|<b>BUILD FIT:<\/b>/, "Avoid developer-only labels");

assert.match(guidance, /validTargetIds\(battle\.units, actor, strike\)\.includes\(scout\.id\)/);
assert.match(guidance, /actor\.hasMoved/);
assert.match(guidance, /battle\.mode === "targeting"/, "Legal targeting continues to own target feedback");
assert.match(presentation, /foundationGuidance\?\.title/);
assert.match(battle, /training \? trainingCue\?\.title/);
assert.match(battle, /is-foundation-training/);

assert.match(styles, /MISSION_CLARITY_CSS/);
assert.match(css, /\.t-training-steps/);
assert.match(css, /prefers-reduced-motion/);
assert.doesNotMatch(css, /pointer-events:\s*auto/i, "Visual styles must not place blockers over the battlefield");
console.log("Tactical mission clarity: 14 static contract checks PASS.");
