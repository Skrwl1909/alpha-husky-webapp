/** Browser Guest host close: real Vite UI, no API writes or browser accounts. */
import assert from "node:assert/strict";
import { createServer } from "vite";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const entry = `
import { init, open, getState } from "/tactical-ops-src/host/bootstrap.ts";
import { useBattleStore as store } from "/tactical-ops-src/store/battleStore.ts";
window.AlphaBrowserGuestV1 = { active: true };
init({ onboarding: "off" });
window.fixture = {
  open,
  getState,
  store,
  savedRun() {
    const state = store.getState();
    const accepted = { runId: "qa_accepted_field_001", missionId: "field-relay-hold", squadIds: ["alpha", "ally-02", "ally-03"],
      fieldContext: { cycleId: 8, approach: "standard", reportVersion: 3 } };
    store.setState({ progression: { ...(state.progression || {}), fieldOps: {
      ...(state.progression?.fieldOps || {}), activeMissionRun: accepted } } });
    return accepted.runId;
  },
  runId() { return store.getState().progression?.fieldOps?.activeMissionRun?.runId; },
  pending(value) { store.setState({ progressionCommitPending: value }); },
  setGuest(value) { window.AlphaBrowserGuestV1.active = value; },
};
`;
const server = await createServer({
  configFile: false,
  cacheDir: "node_modules/.vite-browser-tactical-exit",
  server: { host: "127.0.0.1", port: 0 },
  optimizeDeps: { include: ["react", "react-dom/client", "react/jsx-dev-runtime", "lucide-react", "zustand"] },
  plugins: [{
    name: "browser-tactical-exit-fixture",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== "/browser-tactical-exit-fixture") return next();
        res.setHeader("Content-Type", "text/html");
        res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#06101c;color:#fff}</style><main id="dashboard">ALPHA HUSKY DASHBOARD</main><script type="module" src="/@browser-tactical-exit"></script>');
      });
    },
    resolveId(id) { if (id === "/@browser-tactical-exit") return "\0browser-tactical-exit"; },
    load(id) { if (id === "\0browser-tactical-exit") return entry; },
  }],
});
await server.listen();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ["--no-sandbox"],
});
try {
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", err => errors.push(err.message));
  page.on("dialog", dialog => dialog.dismiss());
  await page.route("**/*", route =>
    new URL(route.request().url()).hostname === "127.0.0.1" ? route.continue() : route.abort());
  for (const [width, height] of [[320, 568], [390, 844], [430, 932], [1280, 800]]) {
    await page.setViewportSize({ width, height });
    await page.goto("http://127.0.0.1:" + server.httpServer.address().port + "/browser-tactical-exit-fixture");
    await page.waitForFunction(() => !!window.fixture);
    await page.evaluate(() => window.fixture.open());
    const exit = page.getByRole("button", { name: "Exit Tactical Ops" });
    await exit.waitFor();
    const box = await exit.boundingBox();
    assert(box && box.width >= 44 && box.height >= 44, width + "px exit tap target");
    assert(box.x >= 0 && box.x + box.width <= width, width + "px exit clipped");

    await page.evaluate(() => window.fixture.pending(true));
    await exit.click();
    assert.equal(await page.evaluate(() => window.fixture.getState().open), true, "pending save must block exit");
    await page.evaluate(() => window.fixture.pending(false));

    const runId = await page.evaluate(() => window.fixture.savedRun());
    await exit.click();
    await page.waitForFunction(() => window.fixture.getState().open === false);
    assert.equal(await exit.count(), 0, "host exit removed on close");
    assert.equal(await page.evaluate(() => window.fixture.runId()), runId, "accepted run kept after exit");
    assert(await page.locator("#dashboard").isVisible(), "host Dashboard available");

    await page.evaluate(() => window.fixture.open());
    await exit.waitFor();
    assert.equal(await page.evaluate(() => window.fixture.runId()), runId, "accepted run kept on reopen");
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => window.fixture.getState().open === false);
    assert.equal(await exit.count(), 0, "ESC still closes");

    await page.evaluate(async () => { window.fixture.setGuest(false); await window.fixture.open(); });
    assert.equal(await exit.count(), 0, "Telegram/APK/non-Guest host gets no browser exit");
    await page.keyboard.press("Escape");
    assert.deepEqual(errors, [], width + "px runtime errors");
    console.log("PASS " + width + "px browser exit, pending guard, accepted run, reopen, ESC, non-guest");
  }
  await page.close();
} finally {
  await browser.close();
  await server.close();
}
