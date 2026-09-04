#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexSource = fs.readFileSync(path.join(root, "index.html"), "utf8");
const oathSource = fs.readFileSync(path.join(root, "js", "oath.js"), "utf8");
const homeNavSource = fs.readFileSync(path.join(root, "js", "home_nav.js"), "utf8");
const appTsx = fs.readFileSync(path.join(root, "tactical-ops-src", "ui", "App.tsx"), "utf8");
const operationsTs = fs.readFileSync(path.join(root, "tactical-ops-src", "data", "operations.ts"), "utf8");
const bootLoaders = fs.readFileSync(path.join(root, "js", "boot_loaders.js"), "utf8");
const versionTs = fs.readFileSync(path.join(root, "tactical-ops-src", "version.ts"), "utf8");

function mustInclude(source, snippet, label) {
  assert.ok(source.includes(snippet), label + " missing: " + snippet);
}

mustInclude(indexSource, 'encodeURIComponent(window.WEBAPP_VER)', "Phase 1 scripts must cache-bust with window.WEBAPP_VER");
mustInclude(indexSource, "js/story_delivery.js?v=' + encodeURIComponent(window.WEBAPP_VER)", "story_delivery.js uses real WEBAPP_VER");
mustInclude(indexSource, "js/cta.js?v=' + encodeURIComponent(window.WEBAPP_VER)", "cta.js uses real WEBAPP_VER");
mustInclude(indexSource, "js/onboarding.js?v=' + encodeURIComponent(window.WEBAPP_VER)", "onboarding.js uses real WEBAPP_VER");
mustInclude(indexSource, "js/awakening.js?v=' + encodeURIComponent(window.WEBAPP_VER)", "awakening.js uses real WEBAPP_VER");
mustInclude(indexSource, "js/oath.js?v=' + encodeURIComponent(window.WEBAPP_VER)", "oath.js uses real WEBAPP_VER");
assert.ok(!/<script src=["']js\/story_delivery\.js\?v=WEBAPP_VER["']/.test(indexSource), "story_delivery must not use literal ?v=WEBAPP_VER");
assert.ok(!/<script src=["']js\/cta\.js\?v=WEBAPP_VER["']/.test(indexSource), "cta must not use literal ?v=WEBAPP_VER");
assert.ok(!/<script src=["']js\/onboarding\.js\?v=WEBAPP_VER["']/.test(indexSource), "onboarding must not use literal ?v=WEBAPP_VER");
assert.ok(!/<script src=["']js\/awakening\.js\?v=WEBAPP_VER["']/.test(indexSource), "awakening must not use literal ?v=WEBAPP_VER");
assert.ok(!/<script src=["']js\/oath\.js\?v=WEBAPP_VER["']/.test(indexSource), "oath must not use literal ?v=WEBAPP_VER");
mustInclude(indexSource, "hub-icons-v1-story-delivery-p1", "home_nav cache token");
mustInclude(indexSource, "sd-p1-dev-fresh", "merged WEBAPP_VER includes Story Delivery RC + DEV FRESH");
mustInclude(indexSource, "js/dev_fresh.js", "DEV FRESH indicator remains loaded");
mustInclude(indexSource, 'id="hubStoryRoot"', "Hub story root");
mustInclude(oathSource, "afterAwakening", "Oath must skip auto-open over Awakening unless afterAwakening");
mustInclude(oathSource, "Awakening.isOpen", "Oath checks Awakening.isOpen");
mustInclude(homeNavSource, "StoryDelivery", "openHub refreshes StoryDelivery");
mustInclude(appTsx, "RECOVER AVAILABLE.", "authoritative P0-03 string");
mustInclude(appTsx, "SIGNAL COMMANDER is a future lead.", "SIGNAL COMMANDER remains a future lead");
assert.ok(!appTsx.includes("BREACH CLEARED. RECOVER SIGNAL UNLOCKED."), "do not restore stale P0-03 CTA string in App.tsx results");
mustInclude(operationsTs, "c: 6, r: 2", "RECOVER terminal (6,2)");
mustInclude(operationsTs, 'name: "SIGNAL COMMANDER"', "SIGNAL COMMANDER mission exists");
mustInclude(operationsTs, "executable: false", "SIGNAL COMMANDER is non-playable");
mustInclude(bootLoaders, "tops-2.3.1-p0-04", "boot_loaders pins Tactical Ops p0-04");
mustInclude(versionTs, "tops-2.3.1-p0-04", "tactical-ops-src version is p0-04");
assert.ok(fs.existsSync(path.join(root, "js", "dev_fresh.js")), "DEV FRESH frontend module present");

const require = createRequire(pathToFileURL(path.join(root, "package.json")).href);
let playwright;
try {
  playwright = require("/workspace/node_modules/playwright");
} catch {
  try {
    playwright = require("playwright");
  } catch (err) {
    throw new Error("playwright is required to run the Phase 1 runtime harness: " + err.message);
  }
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = urlPath === "/" ? "/tools/story_delivery_phase1_runtime_harness.html" : urlPath;
  const filePath = path.normalize(path.join(root, rel.replace(/^\/+/, "")));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("forbidden");
    return;
  }
  fs.readFile(filePath, (err, buf) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(buf);
  });
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const reported = playwright.chromium.executablePath();
const headlessShell = "/opt/pw-browsers/chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell";
const executablePath = fs.existsSync(reported) ? reported : (fs.existsSync(headlessShell) ? headlessShell : reported);
const browser = await playwright.chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:" + port + "/tools/story_delivery_phase1_runtime_harness.html", {
    waitUntil: "networkidle",
    timeout: 20000,
  });
  const summary = await page.waitForFunction(() => window.__SD_P1_RUNTIME__, null, { timeout: 15000 });
  const runtime = await summary.jsonValue();
  assert.equal(runtime.total, 22, "runtime harness must run 22 checks, got " + runtime.total);
  assert.ok(runtime.ok, "runtime harness failed: " + JSON.stringify(runtime.results.filter((r) => !r.ok), null, 2));
  console.log("verify_story_delivery_phase1_runtime_v1: OK 22/22");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
