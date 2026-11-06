import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../js/frames.js", import.meta.url), "utf8");
const media = source.indexOf("@media (max-width: 390px){");
assert.ok(media >= 0, "mobile layout media query exists");
// Identify the end of the mobile-only CSS rule using brace depth.
const open = source.indexOf("{", media);
let depth = 0, end = -1;
for (let i = open; i < source.length; i++) {
  if (source[i] === "{") depth++;
  if (source[i] === "}" && --depth === 0) { end = i; break; }
  if (source[i] === "}" && depth < 0) throw new Error("CSS bracket underflow");
}
assert.ok(end > open, "mobile-only CSS block is closed");
const glow = source.indexOf("#framesBack .ah-frames-preview-glow{");
const sweep = source.indexOf("#framesBack .ah-frames-preview-sweep{");
assert.ok(glow > end, "glow styles must apply outside the narrow-width media query");
assert.ok(sweep > end, "sweep styles must apply outside the narrow-width media query");
assert.ok(source.includes("animation:ahGallerySignalGlow 3.2s ease-in-out infinite"));
assert.ok(source.includes("animation:ahGallerySignalSweep 6.4s linear infinite"));
assert.ok(source.includes("prefers-reduced-motion: reduce"));
assert.ok(source.includes("html.ah-perf-lite #framesBack .ah-frames-preview-glow"));
assert.ok(source.includes("body.ah-perf-lite #framesBack .ah-frames-preview-sweep"));
assert.ok(source.includes("SIGNAL_RANK_PLATE_KEY && !isOwnedKey(k)"), "preview-only ownership invariant");
console.log("PASS: Signal Rank Plate gallery FX apply at desktop and mobile widths; reduced motion and ownership preserved");
