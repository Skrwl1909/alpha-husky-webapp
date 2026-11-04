/** After Action Impact V1: server receipt authority and UI ordering. Synthetic only. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
const vite = await createServer({ configFile: false, server: { middlewareMode: true, hmr: false }, appType: "custom" });
try {
  const { recordedImpact } = await vite.ssrLoadModule("/tactical-ops-src/ui/afterActionImpact.ts");
  const base = {
    runId: "synthetic", missionId: "field-relay-intercept", victory: true,
    cycleId: 10, pressureBefore: 2, pressureAfter: 1, regionalApplied: true,
    firstCycleSecure: true, challengeSuccess: false, challengeBonus: 0,
    rankBefore: 3, rankAfter: 3, progressBefore: 143, progressAfter: 146,
    progressEarned: 3, masteryChanges: [], veteranCareer: { before: 3, after: 3, unlocked: false, reason: "ADVANCED_ACCEPTED_CLEAR_REQUIRED" },
  };
  const delta = { label: "PRESSURE DOWN.", detail: "Pressure 2 → 1. Real server-confirmed regional effect." };
  const clone = structuredClone(base);
  const impact = recordedImpact(base, delta);
  assert.equal(impact.title, "HOUND HELD BACK!");
  assert.equal(impact.kind, "world");
  assert.match(impact.detail, /HOUND arrives 1 round later/);
  assert.deepEqual(base, clone, "read only; no receipt mutation");

  const ordinaryPressure = recordedImpact({ ...base, pressureBefore: 3, pressureAfter: 2 }, { label: "SIGNAL PRESSURE CHANGED", detail: "Pressure 3 → 2. Reinforcements remain on schedule." });
  assert.equal(ordinaryPressure.title, "SIGNAL PRESSURE CHANGED");
  assert.doesNotMatch(ordinaryPressure.detail, /extra preparation round/);
  const areaClear = recordedImpact({ ...base, pressureBefore: 1, pressureAfter: 0 }, { label: "SIGNAL PRESSURE CHANGED", detail: "Pressure 1 → 0." });
  assert.equal(areaClear.title, "AREA CLEAR!");
  assert.match(areaClear.detail, /No extra delay stacks/);
  assert.doesNotMatch(areaClear.detail, /2 rounds later/);
  const lowPressure = recordedImpact({ ...base, pressureBefore: 3, pressureAfter: 2 }, { label: "SIGNAL PRESSURE CHANGED", detail: "Pressure 3 → 2." });
  assert.equal(lowPressure.title, "PRESSURE DOWN.");
  assert.match(lowPressure.detail, /still arrives on schedule/);
  const stale = recordedImpact({ ...base, regionalApplied: false }, null);
  assert.equal(stale.title, "FIRST WIN SECURED!", "unconfirmed pressure must not imply a world effect");
  assert.doesNotMatch(stale.detail, /extra preparation round/);

  const promoted = recordedImpact({ ...base, regionalApplied: false, rankAfter: 4 }, null);
  assert.equal(promoted.kind, "milestone"); assert.equal(promoted.title, "COMMANDER RANK 4!");
  const veteran = recordedImpact({ ...base, regionalApplied: false, veteranCareer: { before: 11, after: 12, unlocked: true } }, null);
  assert.equal(veteran.title, "VETERAN UNLOCKED!");
  const mastery = recordedImpact({ ...base, regionalApplied: false, masteryChanges: [{ unitId: "ally-02", beforeStage: 2, stage: 3 }] }, null);
  assert.match(mastery.title, /MASTERY STAGE ADVANCED/);
  const career = recordedImpact({ ...base, regionalApplied: false, firstCycleSecure: false, veteranCareer: { before: 3, after: 4, unlocked: false } }, null);
  assert.match(career.title, /VETERAN 3 → 4\/12/);
  const replay = recordedImpact({ ...base, regionalApplied: false, firstCycleSecure: false }, null);
  assert.equal(replay.title, "WIN SAVED");
  const lost = recordedImpact({ ...base, victory: false, regionalApplied: false, firstCycleSecure: false }, null);
  assert.equal(lost.title, "ATTEMPT SAVED");

  const ui = readFileSync("tactical-ops-src/ui/FieldOpResults.tsx", "utf8");
  const impactIndex = ui.indexOf('className="t-fr-consequence t-fr-impact"');
  const nextIndex = ui.indexOf('className="t-fr-next"');
  const ctaIndex = ui.indexOf('className="t-brief-actions t-result-actions"');
  const recordIndex = ui.indexOf('className="t-fr-ledger"');
  assert(impactIndex > 0 && impactIndex < nextIndex && nextIndex < ctaIndex && ctaIndex < recordIndex,
    "impact → next → action → optional accounting must be the UI reading order");
  assert(ui.includes("{receipt && impact ?"), "unrecorded or stale runs cannot display confirmation");
  assert(ui.includes("change.veteran && (change.veteran.unlocked || change.veteran.after > change.veteran.before)"),
    "unchanged companion Veteran status must not repeat the same no-credit explanation");
  const css = readFileSync("tactical-ops-src/ui/fieldOpResults.css", "utf8");
  assert(css.includes(".t-fr-impact[data-impact-kind=milestone]"));
  assert(css.includes("prefers-reduced-motion:no-preference"));
  assert(css.includes(".t-fr-ledger>summary"), "detailed accounting must remain accessible");
  console.log("PASS After Action Impact V1: 9 receipt variants, priority, unchanged evidence, reduced-motion and CTA order");
} finally {
  await vite.close();
}
