import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const battle = readFileSync(new URL("../tactical-ops-src/ui/Battle.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const css = readFileSync(new URL("../tactical-ops-src/tactical.css", import.meta.url), "utf8");
test("battle HUD lives in its own rail above the battlefield", () => {
  const rail = battle.indexOf('className="t-top t-battle-hud-rail"');
  const field = battle.indexOf('className="t-field"');
  assert(rail > 0 && field > rail, "HUD rail precedes battlefield");
  const header = battle.slice(rail, battle.indexOf("</header>",rail));
  assert(header.includes("<StatusStrip />") && header.includes("<ObjectiveChip />"),"status and objective in rail");
  assert.equal((battle.match(/<StatusStrip \/>/g) || []).length, 1);
  assert.equal((battle.match(/<ObjectiveChip \/>/g) || []).length, 1);
  assert(!battle.slice(field,battle.indexOf("</div>\n      </div>\n      {threats",field)).includes("<StatusStrip />"),"no HUD over battlefield");
});
test("tap-accessible collapsible cards preserve iOS safe area and avoid HUD stealing board taps", () => {
  assert(battle.includes("aria-expanded={expanded}"),"tap expandable controls");
  assert(css.includes('.t-battle-hud-rail'),"rail is styled");
  assert(css.includes('var(--t-battle-safe-top)'),"host safe area retained");
  assert(css.includes('.t-hud-card.is-expanded'),"details on demand");
  assert(css.includes('.t-shell[data-screen="battle"] .t-order-wrap {display:none}'),"no floating order overlay");
});
