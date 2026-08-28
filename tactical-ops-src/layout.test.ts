import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACCEPTANCE_VIEWPORTS, resolveTacticalLayout } from "./layout.ts";

describe("viewport-first layout resolver", () => {
  for (const vp of ACCEPTANCE_VIEWPORTS) {
    it(`${vp.name} → ${vp.expect}`, () => {
      assert.equal(resolveTacticalLayout(vp.width, vp.height), vp.expect);
    });
  }

  it("does not key off portrait orientation", () => {
    const portrait = resolveTacticalLayout(390, 844);
    const flipped = resolveTacticalLayout(844, 390);
    assert.equal(portrait, "compact");
    assert.notEqual(flipped, "compact");
  });

  it("narrow Telegram desktop panel is compact even if tall", () => {
    assert.equal(resolveTacticalLayout(380, 1100), "compact");
  });
});
