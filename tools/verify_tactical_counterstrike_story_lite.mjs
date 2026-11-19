import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({ configFile: false, server: { middlewareMode: true }, appType: "custom" });
try {
  const model = await server.ssrLoadModule("/tactical-ops-src/ui/counterstrikeStoryModel.ts");
  const ui = await server.ssrLoadModule("/tactical-ops-src/ui/CounterstrikeStory.tsx");
  const { COUNTERSTRIKE_ID } = await server.ssrLoadModule("/tactical-ops-src/data/counterstrike.ts");

  assert.equal(model.storyLiteEnabled(), false, "visual capability defaults OFF");
  for (const input of [null, undefined, "HOUND entries expected in rounds 3 and 5.",
    "REINFORCEMENT INBOUND · HOUND MK-2", "HOUND reinforcement 3 entered. Relay approach under pressure."]) {
    assert.equal(model.confirmedHoundWave(input), null, "never infer an unconfirmed arrival");
  }
  for (const wave of [1, 2]) assert.equal(
    model.confirmedHoundWave(`HOUND reinforcement ${wave} entered. Relay approach under pressure.`), wave);

  const result = {
    runId: "counterstrike_v1_test", missionId: COUNTERSTRIKE_ID, verification: "SERVER_COMMAND_WORKER",
    victory: true, firstClear: true, rounds: 8, control: 5, intelStatus: "APPLIED", intelConsumedByRunId: null,
  };
  assert.equal(model.verifiedFalseRelayResult(result), true);
  assert.equal(model.verifiedFalseRelayResult({ ...result, verification: "CLIENT_REPORT_ONLY" }), false);
  assert.equal(model.verifiedFalseRelayResult({ ...result, missionId: "dead-relay-hold" }), false);
  assert.equal(model.verifiedFalseRelayResult({ ...result, runId: "unknown_run" }), false);

  globalThis.window = { [model.STORY_LITE_FLAG]: true,
    sessionStorage: { getItem: () => null, setItem: () => {} },
    matchMedia: () => ({ matches: false }) };
  assert.equal(model.storyLiteEnabled(), true);
  const intro = renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryIntro, { resuming: false }));
  assert.match(intro, /data-story-intro="playing"/);
  assert.match(intro, /SKIP/);
  assert.match(intro, /SOURCE UNKNOWN/);
  assert.match(intro, /REPLAY TRANSMISSION/);
  const resumed = renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryIntro, { resuming: true }));
  assert.doesNotMatch(resumed, /data-story-intro="playing"/, "resume never forces cinematic");
  const victory = renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryAftermath, { result }));
  assert.match(victory, /SIGNAL HELD/);
  const defeat = renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryAftermath, { result: { ...result, victory: false } }));
  assert.match(defeat, /POSITION LOST/);
  assert.equal(renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryAftermath,
    { result: { ...result, verification: "CLIENT_REPORT_ONLY" } })), "", "no unconfirmed result art");
  globalThis.window[model.STORY_LITE_FLAG] = false;
  assert.equal(renderToStaticMarkup(React.createElement(ui.CounterstrikeStoryAftermath, { result })), "");

  const bytes = readFileSync("images/tactical_ops/presentation/false_relay_mission_keyart_v1.webp");
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
  assert(bytes.length < 150_000, "mobile key art under 150 KB");
  const css = readFileSync("tactical-ops-src/ui/counterstrikeStory.css", "utf8");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /max-width: 360px/);
  assert.match(css, /max-height: 620px/);
  console.log("PASS COUNTERSTRIKE STORY LITE — flag, canon, authority, intro, resume, aftermath, art, motion");
} finally {
  delete globalThis.window;
  await server.close();
}
