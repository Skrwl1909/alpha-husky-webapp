/** Real Brief and store against a local, canonical-shaped progression response. */
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { TacticalApp } from '/tactical-ops-src/ui/App.tsx';
import { useBattleStore as store } from '/tactical-ops-src/store/battleStore.ts';
import { loadFoundationProgression } from '/tactical-ops-src/host/foundationProgression.ts';
import { TACTICAL_CSS } from '/tactical-ops-src/styles.ts';

const style = document.createElement('style');
style.textContent = TACTICAL_CSS;
document.head.append(style);

const missionId = 'dead-relay-hold';
const squadIds = ['alpha', 'ally-02', 'pet:qa-pet'];
let canonical = {
  version: 1, revision: 10, completed: true, foundationStage: 'completed',
  operations: {
    'broken-signal': { status: 'cleared', missions: {} },
    'dead-relay': { status: 'active', missions: { [missionId]: 'available' } },
  },
  equippedPet: { id: 'qa-pet', name: 'QA Pet', img: 'https://example.test/pet.png' },
  kodaSidegrade: 'A', shadowSidegrade: 'A',
};
window.calls = [];
window.apiPost = async (path, body) => {
  const action = path.split('/tactical-foundation/')[1];
  window.calls.push({ action, body });
  if (action === 'koda-sidegrade' || action === 'shadow-sidegrade') {
    await new Promise(resolve => { window.finishSave = resolve; });
    const key = action === 'koda-sidegrade' ? 'kodaSidegrade' : 'shadowSidegrade';
    canonical = { ...canonical, [key]: body[key], revision: canonical.revision + 1 };
  }
  if (action === 'mission/start') {
    return { ok: true, data: canonical, run: { runId: 'qa-run', missionId, squadIds } };
  }
  return { ok: true, data: canonical };
};
window.fixture = { store, async reload() {
  store.setState({ progression: await loadFoundationProgression() });
}};
store.setState({
  progression: canonical, screen: 'brief', foundationCompleted: true, onboardingEnabled: true,
  progressionStatus: 'ready', selectedMissionId: missionId, selectedSquadIds: squadIds,
});
createRoot(document.getElementById('mount')).render(React.createElement(TacticalApp));
`;

const server = await createServer({
  configFile: false,
  server: { host: '127.0.0.1', port: 0 },
  optimizeDeps: { include: ['react', 'react-dom/client', 'react/jsx-dev-runtime', 'lucide-react', 'zustand'] },
  plugins: [{
    name: 'loadout-test-fixture',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url !== '/loadout-test') return next();
        response.setHeader('Content-Type', 'text/html');
        response.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}</style><div id="tacticalOpsRoot" data-open="1"><div id="mount" style="height:100%"></div></div><script type="module" src="/@loadout-test"></script>');
      });
    },
    resolveId: id => id === '/@loadout-test' ? '\0loadout-test' : undefined,
    load: id => id === '\0loadout-test' ? entry : undefined,
  }],
});
await server.listen();

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
  args: ['--no-sandbox'],
});
try {
  for (const [width, height] of [[320, 568], [390, 844], [430, 932]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: true, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/loadout-test`);
    const tabs = page.getByLabel('Mission preparation sections');
    const openLoadout = () => tabs.getByRole('button', { name: /LOADOUT/ }).tap();
    await openLoadout();

    const panel = page.getByLabel('Deployed squad and abilities');
    const picker = page.getByLabel('Select unit abilities');
    const deploy = page.getByRole('button', { name: 'DEPLOY SQUAD', exact: true });
    const slots = panel.locator('[data-slot]');
    const slot = id => panel.locator(`[data-slot="${id}"]`);
    const details = page.locator('.t-codex-reference');
    assert.equal(await picker.getByRole('button').count(), 3);
    assert.equal(await picker.getByRole('button', { name: 'ALPHA' }).getAttribute('aria-pressed'), 'true');
    assert.deepEqual(await slots.locator('strong').allTextContents(), ['STRIKE', 'REND', 'HOWL']);
    assert.match(await slot('A1').innerText(), /Cooldown 0\s+Range 1/);
    assert.equal(await panel.getByRole('button', { name: /Vanguard|Disruptor/ }).count(), 0);
    assert.equal(await details.getAttribute('open'), null);
    assert.equal(await page.getByText('Signal Codex', { exact: true }).isVisible(), false);
    const deployRect = await deploy.boundingBox();
    assert(deployRect.height >= 44 && deployRect.y + deployRect.height <= height, `Deploy fits on first loadout view: ${JSON.stringify(deployRect)}`);

    await picker.getByRole('button', { name: /CNC/ }).tap();
    const variants = page.getByLabel('CNC variants');
    const vanguard = variants.getByRole('button', { name: /Vanguard/ });
    const disruptor = variants.getByRole('button', { name: /Disruptor/ });
    assert.equal(await vanguard.getAttribute('aria-pressed'), 'true');
    assert.match(await slot('A2').innerText(), /LUNGE\s+Cooldown 3\s+Range 1/);
    await disruptor.tap();
    await page.waitForFunction(() => window.finishSave);
    assert(await deploy.isDisabled());
    assert(await vanguard.isDisabled());
    assert.equal(await vanguard.getAttribute('aria-pressed'), 'true', 'waits for canonical save');
    await page.evaluate(() => window.finishSave());
    await variants.getByText('Saved · Disruptor').waitFor();
    assert.equal(await disruptor.getAttribute('aria-pressed'), 'true');
    assert.match(await slot('A3').innerText(), /PRESSURE\s+Cooldown 3\s+Range 1–3/);
    assert.equal(await slot('A3').locator('img').count(), 1);
    const save = await page.evaluate(() => window.calls[0]);
    assert.equal(save.action, 'koda-sidegrade');
    assert.equal(save.body.expectedRevision, 10);
    assert.equal(save.body.kodaSidegrade, 'B');
    await tabs.getByRole('button', { name: /SQUAD/ }).tap();
    await page.evaluate(() => window.fixture.reload());
    await openLoadout();
    assert.equal(await disruptor.getAttribute('aria-pressed'), 'true', 'saved choice survives re-entry and canonical read');

    await picker.getByRole('button', { name: 'PET' }).tap();
    assert.deepEqual(await slots.locator('strong').allTextContents(), ['BITE', 'HAMSTRING', 'Unavailable']);
    assert.equal(await variants.count(), 0);
    assert.equal(await panel.locator('.t-loadout-readiness').innerText(), 'Can slow enemies · No ally protection.');
    const fits = await panel.evaluate(element => element.scrollWidth <= element.clientWidth + 1 &&
      [...element.querySelectorAll('button')].every(button => button.offsetHeight >= 44 && button.scrollWidth <= button.clientWidth + 1));
    assert(fits, `${width}px loadout overflow or short touch target`);

    await details.locator('summary').tap();
    assert(await page.getByText('Signal Codex', { exact: true }).isVisible());
    assert(await page.getByLabel('Tactical counter options').isVisible());
    await details.locator('summary').tap();

    if (width === 390) {
      await page.evaluate(() => {
        const { store } = window.fixture;
        const original = store.getState();
        const originalProgression = original.progression;
        const ops = originalProgression.operations;
        store.setState({
          selectedSquadIds: ['alpha', 'ally-02', 'ally-03'],
          progression: { ...originalProgression, operations: { ...ops, 'broken-signal': { status: 'active', missions: {} } } },
        });
        window.restore = () => store.setState(original);
      });
      await picker.getByRole('button', { name: 'SHADOW' }).tap();
      assert(await page.getByText('Variants unlock after Broken Signal.').isVisible());
      assert.match(await slot('A2').innerText(), /MEND\s+Cooldown 2\s+Radius 1/);
      await page.evaluate(() => window.fixture.store.setState({ selectedMissionId: 'field-isolated-hold' }));
      await page.getByRole('heading', { name: 'ISOLATED HOLD' }).waitFor();
      assert.match(await slot('A2').innerText(), /MEND\s+Cooldown 3\s+Radius 1/);
      await page.evaluate(() => window.fixture.store.setState({ selectedMissionId: 'dead-relay-hold' }));
      assert.match(await panel.locator('.t-loadout-readiness').innerText(), /protect allies/);
      await page.evaluate(() => {
        const { store } = window.fixture;
        const s = store.getState();
        const p = s.progression;
        const op = p.operations['dead-relay'];
        store.setState({ progression: { ...p, operations: { ...p.operations, 'dead-relay': {
          ...op, activeMissionRun: { runId: 'legacy-run', missionId: s.selectedMissionId, squadIds: s.selectedSquadIds },
        } } } });
      });
      await page.getByText('Variants locked for this run.').waitFor();
      assert.equal(await panel.getByRole('button', { name: /Warden/ }).count(), 0);
      await page.evaluate(() => window.fixture.reload());
      const warden = page.getByRole('button', { name: /Warden/ });
      assert(await warden.isEnabled());
      await page.evaluate(() => { window.finishSave = null; });
      await warden.tap();
      await page.waitForFunction(() => window.finishSave);
      await page.evaluate(() => window.finishSave());
      await page.getByText('Saved · Warden').waitFor();
      assert.equal(await warden.getAttribute('aria-pressed'), 'true');
      const shadowSave = await page.evaluate(() => window.calls.at(-1));
      assert.equal(shadowSave.action, 'shadow-sidegrade');
      assert.equal(shadowSave.body.shadowSidegrade, 'B');
      await page.evaluate(() => window.restore());
    }

    await deploy.tap();
    await page.waitForFunction(() => window.fixture.store.getState().screen === 'battle');
    const start = await page.evaluate(() => window.calls.at(-1));
    assert.equal(start.action, 'mission/start');
    assert.equal(start.body.missionId, 'dead-relay-hold');
    assert.deepEqual(start.body.squadIds, ['alpha', 'ally-02', 'pet:qa-pet']);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS Loadout ${width}px · ownership, slots, persistence, disclosure, Deploy`);
  }
} finally {
  await browser.close();
  await server.close();
}
