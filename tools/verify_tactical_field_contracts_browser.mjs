/** Real Tactical UI and wire parser with synthetic responses. Settlement is tested separately in Python. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

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
    window.saved = body.choice;
    canonical.revision++;
    field.fieldContracts.selection = body.choice;
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
}, async results(count, match) {
  const missionId = count===3 ? "field-relay-intercept" : ids[count-1];
  await this.progress(count);
  field.lastResult = {runId:"field_real", missionId, victory:true, cycleId:8, challengeSuccess:true, challengeBonus:0,
    progressEarned:0, progressBefore:6, progressAfter:6, rankBefore:2, rankAfter:2, pressureBefore:2, pressureAfter:2,
    regionalApplied:true, unlockedApproaches:[], legacyReport:false, recordedAt:10, xpGranted:8, bonesGranted:16,
    contractAward:{id:keys[count-1], count, reward:count===2?"reach-rend":count===3?"field-tested":null}};
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
  for (const [width,height] of [[320,568],[390,844],[430,932]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/field-contracts-fixture`);
    const fit = async locator => assert(await locator.evaluate(e => e.scrollWidth <= e.clientWidth+1), `${width}px horizontal overflow`);
    const command = page.getByRole("region",{name:"Field Contracts",exact:true});
    assert.match(await command.innerText(),/0\/3.*2 contracts unlock Reach Rend/s);
    await fit(command);
    const cta = page.locator("[data-primary-purpose] button");
    assert.equal(await cta.count(),1);
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
    await page.evaluate(() => fixture.results(2,true));
    assert.match(await reward.innerText(),/Reach Rend unlocked/);
    await page.evaluate(() => {
      fixture.store.setState({screen:"war-table"});
      fixture.store.getState().openOperationBrief("field-relay-hold");
    });
    await page.getByLabel("Mission preparation sections").getByRole("button",{name:/LOADOUT/}).tap();
    const loadout = page.getByLabel("ALPHA Field Rend");
    const reach = loadout.getByRole("button",{name:/REACH REND/});
    assert.equal(await reach.getAttribute("aria-pressed"),"false");
    assert((await reach.boundingBox()).height >= 44);
    await reach.tap();
    await page.waitForFunction(() => window.saved === "reach-rend");
    await page.evaluate(() => fixture.apply());
    assert.equal(await reach.getAttribute("aria-pressed"),"true");
    assert.match(await page.locator('[data-slot="A2"]').innerText(),/REACH REND.*2/s);
    await fit(loadout);
    await page.evaluate(() => fixture.results(3,true));
    assert.match(await reward.innerText(),/Field Honor earned · Field Tested/);
    await page.evaluate(() => fixture.store.setState({screen:"war-table"}));
    assert.match(await command.innerText(),/3\/3.*Field Honor · Field Tested/s);
    await page.evaluate(() => fixture.legacyBrief());
    assert.match(await contract.innerText(),/Finish the accepted Field Op/);
    await page.getByLabel("Mission preparation sections").getByRole("button",{name:/LOADOUT/}).tap();
    assert.match(await page.locator('[data-slot="A2"]').innerText(),/REND/);
    assert.doesNotMatch(await page.locator('[data-slot="A2"]').innerText(),/REACH REND/);
    assert.equal(await page.getByLabel("ALPHA Field Rend").getByRole("button",{name:/REACH REND/}).getAttribute("aria-pressed"),"false");
    assert.deepEqual(errors,[]);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    console.log(`PASS ${width}px COMMAND → BRIEF → matched Results → saved Loadout → Field Honor`);
  }
  await page.close();
} finally {
  await browser.close();
  await server.close();
}
