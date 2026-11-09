/** Real Tactical UI and wire parser with synthetic responses. Settlement is tested separately in Python. */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { createServer } from "vite";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const { run: { combatProfileV2, combatProfileV3 } } = JSON.parse(readFileSync(
  new URL("./fixtures/intercept-accepted.json", import.meta.url), "utf8",
));
const entry = `
import React from "react";
import { createRoot } from "react-dom/client";
import { TacticalApp } from "/tactical-ops-src/ui/App.tsx";
import { useBattleStore as store } from "/tactical-ops-src/store/battleStore.ts";
import { loadFoundationProgression } from "/tactical-ops-src/host/foundationProgression.ts";
import { TACTICAL_CSS } from "/tactical-ops-src/styles.ts";
const style = document.createElement("style");
style.textContent = TACTICAL_CSS;
document.head.append(style);
const ids = ["field-relay-recovery", "field-relay-hold", "field-squad-survival"];
const squad = ["alpha", "ally-02", "ally-03"];
const records = Object.fromEntries(ids.map(missionId => [missionId, { missionId, completed:true, clearCount:1, lastClearedAt:1 }]));
const field = {
  board: {cycleId:8, nextRotationAt:Math.floor(Date.now()/1000)+86400, activeMissionIds:ids, reportVersion:3, directiveSet:"pursuit"},
  commander: {rank:2, progress:6, nextRankAt:12, unlockedApproaches:["standard","south"], unlockedDirectiveTiers:["standard"]},
  records, activeMissionRun:null, region:{pressure:2,cycleId:8}, lastResult:null,
};
const canonical = {version:1, revision:20, completed:true, foundationStage:"completed", vnextStartAvailable:true, fieldOps:field,
  operations:{"broken-signal":{status:"cleared", missions:{}}, "dead-relay":{status:"cleared", missions:{}}}};
const keys = ["rapid-recovery", "hold-together", "cut-the-line"];
const apply = async () => store.setState({ progression:await loadFoundationProgression() });
const projection = count => ({
  version:1, enabled:true, cycleId:8, completed:keys.slice(0,count),
  eligibleMissionIds:ids.slice(count,2), sidegrade:count>=2?"reach-rend":null,
  selection:"rend", honor:count===3?"field-tested":null,
});
window.apiPost = async (path, body) => {
  if (path.endsWith("/field-rend")) {
    const allow = await new Promise(resolve => { window.finishSave = resolve; });
    if (!allow) return {ok:false, code:"sidegrade_locked"};
    window.saved = body.choice;
    canonical.revision++;
    field.fieldContracts.selection = body.choice;
  }
  if (path.endsWith("/mission/start")) {
    const started = !field.activeMissionRun;
    if (started) {
      const missionId = body.missionId;
      const fieldContext = {...body.fieldOptions, pressure:2, directiveSet:"pursuit",
        fieldRend:field.fieldContracts.selection};
      const rulesContract = {rulesetVersion:body.rulesetVersion, missionId, missionRevision:1,
        combatProfileVersion:3, masterySnapshotVersion:1, rewardPolicyVersion:1, source:"BACKEND_SNAPSHOT"};
      field.activeMissionRun = {runId:"field_next", missionId, squadIds:body.squadIds,
        fieldContext, rulesContract, combatProfileV2:${JSON.stringify(combatProfileV2)},
        combatProfileV3:${JSON.stringify(combatProfileV3)}};
      canonical.revision++;
    }
    window.starts = (window.starts || 0) + 1;
    return {ok:true, data:canonical, run:{...field.activeMissionRun, started}};
  }
  return {ok:true,data:canonical};
};
window.fixture = { store, apply, async progress(count) {
  field.fieldContracts = projection(count);
  await apply();
}, async legacyBrief() {
  field.fieldContracts = { ...projection(2), completed:keys.slice(1),
    eligibleMissionIds:[ids[0]], selection:"reach-rend" };
  field.activeMissionRun = { runId:"field_legacy", missionId:ids[2], squadIds:squad,
    fieldContext:{ cycleId:8, approach:"standard", pressure:2, reportVersion:3,
      directiveTier:"standard", directiveSet:"pursuit" } };
  await apply();
  store.getState().openOperationBrief(ids[0]);
}, async results(count, match, locked = false, duplicate = false, expired = false) {
  field.board.nextRotationAt = Math.floor(Date.now()/1000) + (expired ? -1 : 86400);
  field.activeMissionRun = locked ? {runId:"field_locked", missionId:ids[2], squadIds:squad,
    fieldContext:{cycleId:8, approach:"standard", pressure:2, reportVersion:3,
      directiveTier:"standard", directiveSet:"pursuit"}} : null;
  const missionId = count===3 ? "field-relay-intercept" : ids[count-1];
  await this.progress(count);
  field.lastResult = {runId:"field_real", missionId, victory:true, cycleId:8, challengeSuccess:true, challengeBonus:0,
    progressEarned:0, progressBefore:6, progressAfter:6, rankBefore:2, rankAfter:2, pressureBefore:2, pressureAfter:2,
    regionalApplied:true, unlockedApproaches:[], legacyReport:false, recordedAt:10, xpGranted:8, bonesGranted:16,
    contractAward:duplicate ? undefined : {id:keys[count-1], count, reward:count===2?"reach-rend":count===3?"field-tested":null}};
  await apply();
  store.setState({screen:"results", selectedMissionId:missionId, currentRunKey:match?"field_real":"field_stale",
    fieldResult:store.getState().progression.fieldOps.lastResult,
    battle:{...store.getState().battle,results:{victory:true,turns:4,hostilesEliminated:1,squadStanding:3,squadDeployed:3,damageTaken:0,bonesRecovered:0}}});
}};
await window.fixture.progress(0);
store.setState({screen:"war-table", foundationCompleted:true, progressionStatus:"ready",
  onboardingEnabled:true, selectedMissionId:ids[0], selectedSquadIds:squad});
createRoot(document.getElementById("mount")).render(React.createElement(TacticalApp));
`;

const server = await createServer({
  configFile:false,
  cacheDir:"node_modules/.vite-field-contracts",
  server:{host:"127.0.0.1",port:0},
  optimizeDeps:{include:["react","react-dom/client","react/jsx-dev-runtime","lucide-react","zustand"]},
  plugins:[{
    name:"field-contracts-fixture",
    configureServer(server) {
      server.middlewares.use((req,res,next) => {
        if (req.url!=="/field-contracts-fixture") return next();
        res.setHeader("Content-Type","text/html");
        res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@field-contracts"></script>');
      });
    },
    resolveId(id) { if (id==="/@field-contracts") return "\0field-contracts"; },
    load(id) { if (id==="\0field-contracts") return entry; },
  }],
});
await server.listen();
const browser = await chromium.launch({ executablePath:process.env.CHROMIUM_EXECUTABLE || undefined, args:["--no-sandbox"] });
try {
  const page = await browser.newPage({ hasTouch:true, reducedMotion:"reduce" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/*", route => new URL(route.request().url()).hostname==="127.0.0.1" ? route.continue() : route.abort());
  for (const [width,height] of [[320,568],[390,844],[430,932],[1280,800]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/field-contracts-fixture`);
    const fit = async locator => assert(await locator.evaluate(e => e.scrollWidth <= e.clientWidth+1), `${width}px horizontal overflow`);
    const capture = async name => {
      if (width !== 390 || !process.env.REWARD_UX_SCREENSHOTS) return;
      mkdirSync(process.env.REWARD_UX_SCREENSHOTS, {recursive:true});
      await page.screenshot({path:`${process.env.REWARD_UX_SCREENSHOTS}/${name}.png`});
    };
    const order = page.getByRole("region",{name:"Recommended next operation"});
    const command = page.getByLabel("Field Contracts",{exact:true});
    const cta = order.getByRole("button",{name:"VIEW BRIEF"});
    const aboveFold = async locator => {
      const bounds = await locator.boundingBox();
      assert(bounds && bounds.y >= 0 && bounds.y + bounds.height <= height, `${width}px primary action is outside the first viewport`);
    };
    assert.match(await order.innerText(),/Recover the signal and win by round 4.*Rapid Recovery.*Complete two Field Contracts to unlock Reach Rend/s);
    await fit(order);
    await aboveFold(cta);
    await capture("command");
    await cta.tap();
    const contract = page.getByLabel("Mission contract");
    assert.match(await contract.innerText(),/Rapid Recovery.*round 4/is);
    await fit(contract);
    await page.evaluate(() => fixture.results(1,false));
    assert.equal(await page.getByLabel("Confirmed field contract").count(),0);
    await page.evaluate(() => fixture.results(1,true));
    const reward = page.getByRole("region",{name:"Confirmed field contract"});
    assert.match(await reward.innerText(),/1\/3.*One more contract/s);
    await fit(reward);
    assert.match(await page.locator(".t-fr-next").innerText(),/all three allies standing/);
    await page.getByRole("button",{name:/^NEXT:/}).tap();
    assert.match(await contract.innerText(),/Hold Together.*all three allies standing/is);
    await page.evaluate(() => fixture.results(2,true,true));
    assert.match(await reward.innerText(),/Finish that run to equip Reach Rend/);
    assert.equal(await page.getByRole("button",{name:/EQUIP REACH REND/}).count(),0);
    await page.getByRole("button",{name:"RESUME FIELD OP"}).tap();
    assert.equal(await page.evaluate(() => fixture.store.getState().selectedMissionId),"field-squad-survival");

    await page.evaluate(() => fixture.results(2,true,false,false,true));
    assert.match(await reward.innerText(),/when a regular Field Op is available/);
    assert.equal(await page.getByRole("button",{name:"EQUIP REACH REND"}).count(),0);
    await page.getByRole("button",{name:"REFRESH WAR TABLE",exact:true}).tap();

    await page.evaluate(() => fixture.results(2,true));
    assert.match(await reward.innerText(),/Reach Rend\s+Unlocked.*145% → 105%.*Same Bleed.*select A2/is);
    await fit(reward);
    const equip = page.getByRole("button",{name:"EQUIP REACH REND"});
    await aboveFold(equip);
    await capture("victory");
    if (width === 1280) await equip.press("Enter");
    else await equip.tap();
    const loadout = page.getByRole("region",{name:"ALPHA Field Rend"});
    const loadoutTab = page.getByLabel("Mission preparation sections").getByRole("button",{name:/LOADOUT/});
    const reach = loadout.getByRole("button",{name:/^REACH REND/});
    const rend = loadout.getByRole("button",{name:/^REND/});
    const deploy = page.getByRole("button",{name:"DEPLOY SQUAD",exact:true});
    assert.equal(await loadoutTab.getAttribute("aria-pressed"),"true");
    assert.equal(await loadout.getByRole("heading",{name:"ALPHA · A2"}).evaluate(e => document.activeElement === e),true);
    assert.match(await rend.innerText(),/Range 1 cell\s+145% direct hit.*Bleed · 2 turns.*EQUIPPED/s);
    assert.match(await reach.innerText(),/Range 1–2 cells\s+105% direct hit.*Bleed · 2 turns.*AVAILABLE/s);
    assert.equal(await reach.getAttribute("aria-pressed"),"false");
    assert((await reach.boundingBox()).height >= 44);
    await aboveFold(reach);
    await capture("loadout");

    await reach.tap();
    await loadout.getByText("Saving A2…",{exact:true}).waitFor();
    assert(await deploy.isDisabled());
    assert.equal(await reach.getAttribute("aria-pressed"),"false","pending writes cannot appear equipped");
    await page.evaluate(() => window.finishSave(false));
    await loadout.getByRole("alert").getByText(/could not be saved/).waitFor();
    assert.equal(await reach.getAttribute("aria-pressed"),"false","failed writes cannot appear equipped");
    await reach.tap();
    await loadout.getByText("Saving A2…",{exact:true}).waitFor();
    await page.evaluate(() => window.finishSave(true));
    await loadout.getByText(/Reach Rend equipped for new compatible Field Ops/).waitFor();
    assert.equal(await reach.getAttribute("aria-pressed"),"true");
    await fit(loadout);

    await page.getByRole("button",{name:"BACK",exact:true}).tap();
    await page.evaluate(() => fixture.apply());
    await page.getByRole("button",{name:/MISSIONS/}).tap();
    await page.getByRole("region",{name:"Current Field Ops"}).getByRole("button",{name:"VIEW BRIEF"}).tap();
    await loadoutTab.tap();
    assert.equal(await reach.getAttribute("aria-pressed"),"true","canonical selection survives reopening");
    const assertReachInBattle = async () => {
      await page.waitForFunction(() => {
        const state = fixture.store.getState();
        return state.screen === "battle" || state.progressionError;
      });
      assert.equal(await page.evaluate(() => fixture.store.getState().progressionError),null);
      const run = await page.evaluate(() => {
        const state = fixture.store.getState();
        return {id:state.currentRunKey, fieldRend:state.currentFieldContext.fieldRend,
          alphaSkills:Object.values(state.battle.units).find(unit => unit.defId === "alpha").skillIds};
      });
      assert.equal(run.id,"field_next");
      assert.equal(run.fieldRend,"reach-rend");
      assert(run.alphaSkills.includes("alpha-reach-rend"));
      assert(!run.alphaSkills.includes("alpha-rend"));
    };
    await deploy.tap();
    await assertReachInBattle();
    if (width === 390) {
      // Exercise the real A2 and engine with a deterministic two-cell encounter.
      const target = await page.evaluate(() => {
        const {battle} = fixture.store.getState();
        const alpha = battle.units.find(unit => unit.defId === "alpha");
        const enemy = battle.units.find(unit => unit.team === "enemy" && !unit.defeated);
        fixture.store.setState({battle:{...battle, activeId:alpha.id, mode:"selected",
          units:battle.units.map(unit => unit.id === alpha.id ? {...unit,c:0,r:0,hasActed:false} :
            unit.id === enemy.id ? {...unit,c:2,r:0} : unit)}});
        return {id:enemy.id,hp:enemy.hp};
      });
      await page.getByRole("button",{name:/^A2 REACH REND/i}).tap();
      const dealt = await page.evaluate(({id,hp}) => {
        fixture.store.getState().selectTarget(id);
        const enemy = fixture.store.getState().battle.units.find(unit => unit.id === id);
        return {damage:hp-enemy.hp,bleed:enemy.statuses.some(status => status.type === "BLEED")};
      },target);
      assert(dealt.damage > 0 && dealt.bleed,"A2 hits and applies Bleed from two cells");
    }
    await page.evaluate(() => fixture.store.getState().backToHub());
    await page.locator("[data-primary-purpose] button").tap();
    await loadoutTab.tap();
    assert.match(await loadout.innerText(),/Locked for current run.*Finish the accepted Field Op/s);
    assert.equal(await reach.getAttribute("aria-pressed"),"true");
    assert(await reach.isDisabled());
    assert(await rend.isDisabled());
    await deploy.tap();
    await assertReachInBattle();
    assert.equal(await page.evaluate(() => window.starts),2);
    await page.evaluate(() => fixture.results(3,true));
    assert.match(await reward.innerText(),/Field Honor earned · Field Tested/);
    await page.evaluate(() => fixture.store.setState({screen:"war-table"}));
    await command.locator("summary").tap();
    assert.match(await command.innerText(),/3\/3.*Field Honor · Field Tested/s);
    await page.evaluate(() => fixture.results(2,true,false,true));
    assert.equal(await reward.count(),0,"an ordinary repeat receipt cannot re-award Reach Rend");
    assert.match(await page.locator(".t-fr-next").innerText(),/Recover|courier|relay|squad/i);
    await page.getByRole("button",{name:/^NEXT:/}).tap();
    assert.equal(await page.evaluate(() => fixture.store.getState().screen),"brief");
    await page.evaluate(() => fixture.legacyBrief());
    assert.match(await contract.innerText(),/Finish the accepted Field Op/);
    await page.getByLabel("Mission preparation sections").getByRole("button",{name:/LOADOUT/}).tap();
    assert.match(await loadout.innerText(),/Locked for current run/);
    assert(await reach.isDisabled());
    assert.equal(await reach.getAttribute("aria-pressed"),"false","saved Reach Rend is not equipped in a different accepted run");
    assert.equal(await rend.getAttribute("aria-pressed"),"false","no equipped claim for a blocked new brief");
    assert.deepEqual(errors,[]);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log(`PASS ${width}px confirmed reward → ALPHA A2 → failed save/retry → reopen → deploy and resume → Field Honor`);
  }
  await page.close();
} finally {
  await browser.close();
  await server.close();
}
