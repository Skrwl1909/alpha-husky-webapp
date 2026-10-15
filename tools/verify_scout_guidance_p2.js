#!/usr/bin/env node
// FTUE P2: focused read-only acceptance checks. No account, rewards or API.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const code = fs.readFileSync(path.join(root, "js/scout_guidance_p2.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
let passed = 0;
function check(name, fn) { fn(); passed++; console.log("PASS", name); }
function boot(graduated) {
  const store = new Map();
  const d = { readyState: "loading", addEventListener() {}, getElementById() { return null; } };
  const w = {
    localStorage: { getItem: k => store.get(k)||null, setItem: (k,v)=>store.set(k,v), removeItem:k=>store.delete(k) },
    FirstSessionSpine: { view: () => ({ complete: graduated }) }
  };
  vm.runInNewContext(code, { window:w, document:d }, { filename:"scout_guidance_p2.js" });
  return { w, store };
}
check("P2 stays gated until the player graduates", () => {
  assert.equal(boot(false).w.ScoutGuidanceP2.eligible(), false);
  assert.equal(boot(true).w.ScoutGuidanceP2.eligible(), true);
});
check("Guidance only; no economy calls, new rewards, or forced navigation", () => {
  assert.ok(!/\bapiPost\b|\/webapp\/|\.click\(/.test(code));
  assert.ok(!/AlphaNav\.push|\\.openGuided|\.start\(/.test(code));
});
check("Stats location matches real Character → Stats → Build", () => {
  assert.ok(code.includes("Character → Stats → Build"));
  assert.ok(code.includes("unspent points"));
});
check("Pets and Forge guidance do not promise unavailable purchases", () => {
  assert.ok(code.includes("No companion yet?"));
  assert.ok(code.includes("material cost"));
  assert.ok(code.includes("no need to upgrade right now"));
});
check("One-time persistence and explicit dismissal", () => {
  assert.ok(code.includes("seenHub: []"));
  assert.ok(code.includes("seenInside: []"));
  assert.ok(code.includes("saved.dismissed.push(step.id)"));
  assert.ok(code.includes("Got it"));
});
check("Shared P1 Scout portrait and reduced-motion remain the only visual primitive", () => {
  assert.ok(code.includes("w.ScoutComms?.render?.(message)"));
  assert.ok(!code.includes("new Image"));
});
check("Load order places P2 after First Session Spine", () => {
  const a = index.indexOf("/js/first_session_spine.js?v=");
  const b = index.indexOf("/js/scout_guidance_p2.js?v=");
  assert.ok(a !== -1 && b > a);
});
check("Stats already confirms successful server-side upgrades", () => {
  const stats = fs.readFileSync(path.join(root, "js/stats.js"), "utf8");
  assert.ok(stats.includes('await _apiPost("/webapp/stats/upgrade"'));
  assert.ok(stats.includes("window.AlphaStats3.feedback(actual)"));
  assert.ok(stats.includes("const nextStats = payload?.stats || null"));
});
check("All three destinations use existing modal roots", () => {
  const stats=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const pets=fs.readFileSync(path.join(root,"js/mypets.js"),"utf8");
  const forge=fs.readFileSync(path.join(root,"js/forge.js"),"utf8");
  assert.ok(stats.includes('id="statsBack"') && stats.includes('id="statsRoot"'));
  assert.ok(pets.includes('el.id = "mypetsModal"') && pets.includes('id="mypetsList"'));
  assert.ok(forge.includes('"ah-forge-body"'));
});
console.log("verify_scout_guidance_p2: PASS",passed,"checks; device QA not run");
