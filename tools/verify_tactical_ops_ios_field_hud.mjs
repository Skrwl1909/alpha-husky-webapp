import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
const battle = readFileSync(new URL("../tactical-ops-src/ui/Battle.tsx", import.meta.url), "utf8").replace(/\r\n/g, "\n");
const css = readFileSync(new URL("../tactical-ops-src/tactical.css", import.meta.url), "utf8");
test("status and objective cards are field children, not absolute grid children", () => {
  const fieldStart = battle.indexOf('className="t-field"');
  const fieldEnd = battle.indexOf("\n        </div>\n      </div>\n      {banner ? (", fieldStart);
  assert.ok(fieldStart > 0 && fieldEnd > fieldStart, "field boundary not found");
  const fieldContent = battle.slice(fieldStart, fieldEnd);
  assert.equal((battle.match(/<StatusStrip \/>/g) || []).length, 1);
  assert.equal((battle.match(/<ObjectiveChip \/>/g) || []).length, 1);
  assert.ok(fieldContent.includes("<StatusStrip />"));
  assert.ok(fieldContent.includes("<ObjectiveChip />"));
});
test("iOS fallback bounds field HUD cards and clips overflowing header labels", () => {
  assert.match(css, /#tacticalOpsRoot \.t-field > \.t-status,[\s\S]*?#tacticalOpsRoot \.t-field > \.t-obj-chip \{[\s\S]*?grid-area: auto;[\s\S]*?height: fit-content;[\s\S]*?max-height: 140px;/);
  assert.match(css, /#tacticalOpsRoot \.t-top \.t-brand > div \{[\s\S]*?overflow: hidden;/);
});
