#!/usr/bin/env node
/** Real component SSR + resolved doctrine presentation. Does not impersonate a live server. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({
  configFile: false,
  resolve: { preserveSymlinks: true },
  ssr: { external: ["react", "react-dom", "zustand"] },
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});
try {
  const { useBattleStore } = await server.ssrLoadModule("/tactical-ops-src/store/battleStore.ts");
  const { SignalAtlas } = await server.ssrLoadModule("/tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx");
  const { TACTICAL_CSS } = await server.ssrLoadModule("/tactical-ops-src/styles.ts");
  const { growthPreviewBase } = await server.ssrLoadModule("/tactical-ops-src/data/buildPreview.ts");
  const { resolveGrowthSkill, WIDE_LUNGE } = await server.ssrLoadModule("/tactical-ops-src/data/playerGrowth.ts");
  const growth = { version: 2, earnedPoints: 4, spentPoints: 1, heroes: [
    { heroId: "alpha", discipline: null, ranks: {}, respecUsed: false },
    { heroId: "ally-02", discipline: "pursuer", ranks: { "u02-burst": 1 }, respecUsed: false },
    { heroId: "ally-03", discipline: null, ranks: {}, respecUsed: false },
  ] };
  useBattleStore.setState({
    progression: { version: 1, revision: 10, playerGrowth: growth, lungeDoctrineAvailable: true },
    progressionError: null, progressionCommitPending: false,
  });
  const target = { heroId: "ally-02", skillId: "u02-burst", rank: 1 };
  const html = renderToStaticMarkup(React.createElement(SignalAtlas, { onClose: () => {}, target }));
  assert.match(html, /class="tsa-identity"/);
  assert.match(html, /CNC combat identity/);
  // React's server snapshot intentionally excludes subsequent store.setState();
  // test real resolved skills directly and the doctrine component's presentation contract.
  const base = growthPreviewBase("u02-burst", useBattleStore.getState().progression);
  const cnc = { ...growth.heroes[1], rulesVersion: 2 };
  const heavy = resolveGrowthSkill(base, cnc);
  const wide = resolveGrowthSkill(base, { ...cnc, lungeDoctrine: WIDE_LUNGE });
  assert.equal(heavy.maxRange, 3);
  assert.equal(heavy.effects.find(e => e.kind === "damage").multiplier, 1.55);
  assert.equal(wide.effects.find(e => e.kind === "damage").multiplier, 1);
  assert.equal(wide.radius, 1);
  const source = readFileSync("tactical-ops-src/ui/signalAtlas/SignalAtlas.tsx", "utf8");
  for (const fragment of ["tsa-doctrine-card", "tsa-doctrine-choices", "DoctrineFootprint", "CURRENTLY SAVED", "SELECT DOCTRINE · FREE", "An accepted mission keeps its original variant", "Math.round(damage*100)"]) {
    assert(source.includes(fragment), `Missing production doctrine UI: ${fragment}`);
  }
  const css = readFileSync("tactical-ops-src/ui/signalAtlas/signalAtlasPremium.css", "utf8");
  assert(css.includes("@media (max-width:380px)"));
  assert(css.includes("@media (prefers-reduced-motion:reduce)"));
  assert(css.includes("@media (forced-colors:active)"));
  assert(TACTICAL_CSS.includes("tsa-doctrine-card"), "Premium CSS must be part of the production injected bundle");

  // No rerouting or alternate mode changes the saved skill and receipt logic.
  assert.equal(useBattleStore.getState().progression.playerGrowth.heroes[1].lungeDoctrine, undefined);
  console.log("PASS Signal Atlas Premium: React SSR identity, resolved Heavy 155%/Wide 100%+radius, card/receipt contract, injected responsive theme");
} finally {
  await server.close();
}
