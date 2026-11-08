/** Production scripts with isolated authenticated response fixtures. */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { createServer } from "vite";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const index = readFileSync("index.html", "utf8");
const badgeLauncher = index.slice(index.indexOf("async function openBadges("), index.indexOf("window.openBadgeWallModal = openBadges;") + "window.openBadgeWallModal = openBadges;".length);
assert(badgeLauncher.includes("Badges.open(badgeKey)"));
const hostStyles = [/(?:^|\n)\.locked-back, \.sheet-back \{[^}]+}/, /(?:^|\n)\.btn \{[^}]+}/]
  .map(pattern => index.match(pattern)?.[0]).join("\n");
const server = await createServer({
  configFile: false,
  server: { host: "127.0.0.1", port: 0 },
  plugins: [{
    name: "service-record-fixture",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/service-record-fixture") return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
          <style>:root{--txt:#f5f8fc;--glass:#131c28;--stroke:#43505d;--ah-safe-top:0px;--ah-safe-right:0px;--ah-safe-bottom:0px;--ah-safe-left:0px}
          ${hostStyles} *,*::before,*::after{box-sizing:border-box}body{margin:0;background:#06101a;color:white;font:14px system-ui}</style>
          <script src="/js/boot_loaders.js"></script><script src="/js/player_profile.js"></script>
          <script src="/js/field_record.js"></script><script src="/js/badges.js"></script>
          <script>
            const _tg = window.Telegram?.WebApp, _dbg = false;
            const loadScriptOnce = async () => {};
            ${badgeLauncher}
            PlayerProfile.init({ apiPost });
          </script>`);
      });
    },
  }],
});
await server.listen();
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE, args: ["--no-sandbox"] });
try {
  const url = `http://127.0.0.1:${server.httpServer.address().port}/service-record-fixture`;
  const out = process.env.SERVICE_RECORD_CAPTURES || "artifacts/commander-service-record";
  mkdirSync(out, { recursive: true });
  const page = await browser.newPage({ hasTouch: true, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  await page.route("**/*", route => new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  await page.addInitScript(() => {
    window.AlphaBrowserGuestV1 = { active: true };
    window.__PROFILE__ = { uid: "20001" };
    const ids = ["field-relay-recovery", "field-relay-hold", "field-isolated-hold", "field-squad-survival", "field-rearguard", "field-relay-intercept"];
    const completed = ["rapid-recovery", "hold-together", "cut-the-line"];
    const expiry = () => Math.floor(Date.now() / 1000) + 3600;
    const field = {
      records: Object.fromEntries(ids.map((missionId, i) => [missionId, {
        missionId, clearCount: i + 1, advancedClearCount: i % 2, challengeCount: i, lastClearCycle: 7,
      }])),
      board: { cycleId: 8, nextRotationAt: expiry(), activeMissionIds: [ids[0], ids[1], ids[3]], reportVersion: 3, directiveSet: "pursuit" },
      commander: { rank: 3, progress: 24, nextRankAt: null, unlockedApproaches: ["standard"], unlockedDirectiveTiers: ["standard", "advanced"] },
      region: { cycleId: 8, pressure: 2 },
      veteranProgressionAvailable: true,
      veteranCareer: { version: 1, credits: 7, missionIds: [ids[0], ids[1], ids[2]], lastCycle: 7, enabled: true },
      careerRecord: { version: 1, missionSecures: 9, challenges: 7, advancedClears: 1, frontsSecured: 2 },
      fieldContracts: { version: 1, enabled: false, cycleId: 8, completed, eligibleMissionIds: [], selection: "rend", sidegrade: "reach-rend", honor: "field-tested" },
    };
    const progression = {
      version: 1, completed: true, foundationStage: "completed", revision: 2, vnextStartAvailable: true, fieldOps: field,
      operations: { "broken-signal": { status: "cleared", missions: {} }, "dead-relay": { status: "cleared", missions: {} } },
    };
    const fixtures = window.fixtures = {
      tacticalReads: 0,
      field,
      change(variant) {
        if (variant === "locked") {
          Object.assign(field.fieldContracts, { completed: completed.slice(1), enabled: true, honor: null, eligibleMissionIds: [ids[0]] });
        } else if (variant === "accepted") {
          field.activeMissionRun = { runId: "field_service_accepted", missionId: ids[4], squadIds: ["alpha", "ally-02", "ally-03"],
            fieldContext: { cycleId: 7, approach: "standard", pressure: 2, reportVersion: 3, directiveTier: "advanced", directiveSet: "pursuit" } };
        } else if (variant === "expired") {
          field.board.nextRotationAt = 1;
          field.activeMissionRun = null;
        } else if (variant === "missing") {
          delete field.records[ids[4]];
          delete field.records[ids[0]].advancedClearCount;
        } else if (variant === "zero") {
          for (const record of Object.values(field.records)) {
            Object.assign(record, { clearCount: 0, challengeCount: 0, advancedClearCount: 0 });
          }
        }
      },
    };
    window.apiPost = async (path, body) => {
      if (path === "/webapp/player/profile") return { ok: true, player: { uid: body.target_uid, name: "HUSKY COMMAND", level: 28, faction: "Echo Wardens", skin: { url: "/assets/skins/lunarhowl_skin.webp" } } };
      if (path === "/webapp/tactical-foundation/state") {
        fixtures.tacticalReads++;
        return { ok: true, data: structuredClone(progression) };
      }
      if (path === "/webapp/badges/state") {
        const owned = field.fieldContracts.honor === "field-tested";
        const art = "/assets/badges/field-tested.svg";
        return { ok: true, total: owned ? 2 : 1, badges: [
          { key: "relay_sentinel", name: "Relay Sentinel", rarity: "rare", owned: true },
          { key: "field-tested", name: "Field Tested", rarity: "epic", description: "Earned by completing all three Field Contracts.", owned, iconUrl: art, emblemUrl: art },
        ], featured_badges: ["relay_sentinel"] };
      }
      if (path.startsWith("/webapp/titles/")) return { ok: true, titles: [] };
      throw new Error("Unexpected request " + path);
    };
  });
  const service = page.getByRole("region", { name: "Commander Service Record" });
  const honor = page.getByRole("button", { name: "View Field Tested in Badge Wall" });
  const metric = async (label, expected) => {
    const row = service.locator(".pp-service-grid div").filter({ has: page.getByText(label, { exact: true }) });
    assert.equal(await row.locator("dd").innerText(), expected);
  };
  const openRecord = () => page.evaluate(() => FieldRecord.openSelf({ focusService: true }));
  const change = variant => page.evaluate(variant => fixtures.change(variant), variant);
  for (const [width, height] of [[320, 568], [390, 844], [430, 932], [1280, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    assert(await openRecord());
    await service.getByText("Earned · Permanent").waitFor();
    for (const [label, value] of [["RECOVER", "1"], ["HOLD", "5"], ["SURVIVE", "9"], ["INTERCEPT", "6"], ["Advanced clears", "3"], ["Challenges", "15"]]) {
      await metric(label, value);
    }
    assert.equal(await service.locator(".pp-service-hero strong").innerText(), "21");
    assert(await service.evaluate(e => e.scrollWidth <= e.clientWidth));
    await service.getByText("7/12 Veteran credits").waitFor();
    await page.getByText("Story Milestones", { exact: true }).waitFor();
    await page.getByText("No verified story milestones recorded yet", { exact: false }).waitFor();
    if (width === 390) {
      await service.evaluate(el => {
        document.activeElement?.blur();
        el.scrollIntoView({ block: "center" });
      });
      await page.screenshot({ path: out + "/Commander_Service_Record_390.png" });
    }
    await honor.click();
    const tile = page.locator('[data-key="field-tested"]');
    await tile.waitFor();
    assert(await tile.evaluate(e => e.classList.contains("is-owned")));
    assert(await page.locator('[data-key="relay_sentinel"]').evaluate(e => e.classList.contains("is-owned")));
    await page.locator(".ah-bw-detail-art img").waitFor();
    if (width === 390) await page.screenshot({ path: out + "/Field_Tested_Earned_390.png" });

    await page.reload();
    await openRecord();
    await service.getByText("Earned · Permanent").waitFor();
    await change("locked");
    await openRecord();
    await service.getByText("Locked · 2/3 contracts").waitFor();
    await service.getByText(/Rapid Recovery/).waitFor();
    await honor.click();
    await tile.waitFor();
    assert(await tile.evaluate(e => e.classList.contains("is-locked")));
    assert(await page.locator('[data-key="relay_sentinel"]').evaluate(e => e.classList.contains("is-owned")));
    if (width === 390) await page.screenshot({ path: out + "/Field_Tested_Locked_390.png" });
    await page.evaluate(() => Badges.close());

    // An accepted run that arrived after the card rendered takes priority over that card's contract.
    await openRecord();
    await service.getByRole("button", { name: "View mission brief" }).waitFor();
    const readsBeforeObjective = await page.evaluate(() => fixtures.tacticalReads);
    await change("accepted");
    await service.getByRole("button", { name: "View mission brief" }).click();
    assert.equal(await page.evaluate(() => fixtures.tacticalReads), readsBeforeObjective + 1,
      "Next Objective must fetch canonical state again before routing");
    await page.locator("#tacticalOpsRoot").getByRole("heading", { name: "REARGUARD", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => TacticalOps.getState().screen), "brief");
    await page.evaluate(() => TacticalOps.close());
    await page.evaluate(() => TacticalOps.open());
    await page.getByText("FIELD ARCHIVE", { exact: false }).first().click();
    await page.getByRole("button", { name: "View Service Record" }).click();
    await service.getByRole("button", { name: "Resume operation" }).waitFor();
    assert.equal(await page.evaluate(() => TacticalOps.getState().open), false);

    await change("expired");
    await change("zero");
    await openRecord();
    await service.getByRole("button", { name: "Open Tactical Ops" }).waitFor();
    assert.equal(await service.locator(".pp-service-hero strong").innerText(), "0");
    await metric("SURVIVE", "0");
    await change("missing");
    await openRecord();
    await service.getByRole("button", { name: "Open Tactical Ops" }).waitFor();
    assert.equal(await service.locator(".pp-service-hero strong").innerText(), "—");
    await metric("SURVIVE", "—");
    await metric("Advanced clears", "—");
    await metric("HOLD", "0");

    const reads = await page.evaluate(() => fixtures.tacticalReads);
    await page.evaluate(() => PlayerProfile.open("20002", { source: "pack_signal" }));
    assert.equal(await service.count(), 0);
    assert.equal(await page.evaluate(() => fixtures.tacticalReads), reads);
    assert.deepEqual(errors, []);
    console.log(`PASS ${width}px totals, legacy gaps, earned/locked, reload, accepted-run priority, expiry, profile privacy and badge regression`);
  }
} finally {
  await browser.close();
  await server.close();
}
