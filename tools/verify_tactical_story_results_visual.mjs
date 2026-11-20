#!/usr/bin/env node
/** Mobile acceptance for the dedicated Operation 01 Results view. */
import assert from "node:assert/strict";
import { existsSync, readFileSync, mkdirSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { chromium } from "playwright";

const vite = await createServer({ configFile: false, ssr: { external: ["react","react-dom"] },
  server: { middlewareMode: true, hmr: false }, appType: "custom" });
const browser = await chromium.launch({ headless: true,
  executablePath: process.env.CHROMIUM_EXECUTABLE || "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"] });
mkdirSync("artifacts/story-results", { recursive: true });
try {
  const { StoryResultView } = await vite.ssrLoadModule("/tactical-ops-src/ui/StoryResultView.tsx");
  const css = readFileSync("tactical-ops-src/ui/storyResult.css", "utf8");
  const artPath = "images/tactical_ops/presentation/tactical_ops_operation_complete_plate.png";
  const art = existsSync(artPath) ? `data:image/png;base64,${readFileSync(artPath).toString("base64")}` : "";
  for (const [phase, width] of [["unsaved",320],["saving",390],["failed",430],["saved",320],["saved",390],["saved",430]]) {
    const page = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: 1 });
    const component = React.createElement(StoryResultView,{
      title: "COMMANDER DOWN", mission: "SIGNAL COMMANDER", art, phase,
      op02Ready: phase === "saved", op02Cleared: false,
      nextMission: phase === "saved" ? "THE DEAD RELAY" : null,
      turns: 6, squadStanding: 3, squadDeployed: 3, onAction: () => {},
    });
    await page.setContent(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;background:#050b12;font-family:Arial,sans-serif;height:100%}.t-fill{min-height:100vh}${css}</style></head><body>${renderToStaticMarkup(component)}</body></html>`);
    assert.equal(await page.locator("[data-story-save]").getAttribute("data-story-save"),phase);
    assert.equal(await page.locator(".t-story-result-action").isDisabled(),phase === "saving");
    assert((await page.locator(".t-story-result-action").boundingBox()).height >= 44, "Touch target too small");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,"Horizontal overflow");
    assert.equal(await page.getByText("OP 02 READY").count(),phase === "saved" ? 1:0,"No premature OP 02 badge");
    assert.equal(await page.getByText("VICTORY SAVED").count(),phase === "saved" ? 1:0,"Only confirmed save may claim victory saved");
    assert(!/\\b(XP|BONES|SCRAP)\\b/i.test(await page.locator("body").innerText()),"No unverified economy rewards");
    await page.screenshot({path:`artifacts/story-results/${phase}-${width}.png`,fullPage:true});
    await page.close();
  }
  console.log("PASS: mobile Results 320/390/430, save gating, responsive CTA, no overflow");
} finally { await browser.close(); await vite.close(); }
