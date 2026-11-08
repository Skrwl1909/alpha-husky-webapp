// Browser FTUE continuity: no live credentials, accounts or network.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const ftue = fs.readFileSync(new URL("../js/ftue_continuity.js", import.meta.url), "utf8");
const chamber = fs.readFileSync(new URL("../js/faction_chamber.js", import.meta.url), "utf8");
function harness(browser) {
  const window = { addEventListener() {}, AlphaBrowserGuestV1: browser };
  const env = { window, console };
  vm.runInNewContext(ftue, env);
  return window.FtueContinuity;
}
const fresh = { completed: false, should_show: true };
const tutorial = { first_signal: { eligible: true, state: "COMPLETED" } };
assert.equal(harness(null).isAwakeningFreshEligible(fresh, tutorial), false, "Telegram remains unchanged");
assert.equal(harness({active:false,hasSession:()=>true}).isAwakeningFreshEligible(fresh,tutorial),false);
assert.equal(harness({active:true,hasSession:()=>false}).isAwakeningFreshEligible(fresh,tutorial),false);
assert.equal(harness({active:true,hasSession:()=>true}).isAwakeningFreshEligible(fresh,tutorial),true,"Browser Guest resumes incomplete Awakening");
assert.equal(harness({active:true,hasSession:()=>true}).isAwakeningFreshEligible({completed:true,should_show:false},tutorial),false);
assert.equal(harness({active:true,hasSession:()=>true}).isAwakeningFreshEligible({completed:false,should_show:false},tutorial),false);
assert.equal(harness({active:true,hasSession:()=>true}).isAwakeningFreshEligible(fresh,{first_signal:{eligible:false,state:"COMPLETED"}}),false);
assert.ok(chamber.includes('"/webapp/tutorial/state"'),"Check canonical tutorial eligibility before the bind");
assert.ok(chamber.includes('"/webapp/oath/state"'),"Use canonical Oath completion");
assert.ok(chamber.includes('"/webapp/awakening/state"'),"Check canonical Awakening completion");
assert.ok(chamber.indexOf('"/webapp/oath/state"') < chamber.indexOf('"/webapp/faction/join"'),"Block before backend write");
assert.ok(chamber.includes('global.AlphaBrowserGuestV1?.active === true'),"Limit gate to Browser Guest");
console.log("PASS: Browser FTUE resumes unfinished Awakening after First Signal; legacy and completed identities remain safe");