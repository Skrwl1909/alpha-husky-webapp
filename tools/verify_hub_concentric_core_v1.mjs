/** Hub-only presentation contract. No navigation, state, or gameplay writes. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("css/hub_premium.css", "utf8");
const html = readFileSync("index.html", "utf8");
const scope = "#hubBack.ah-hub-network-v2";
const segment = css.slice(css.indexOf("/* Hub V2 concentric core:"));
assert(segment.length > 200, "Concentric styles missing");

// The gear and the portrait must share one spatial centre; labels sit below.
assert.match(segment, /\.ahn-core-portrait\s*\{[^}]*position:absolute;top:50%;left:50%;[^}]*transform:translate\(-50%,-50%\)/);
assert.match(segment, /\.ahn-core-title\s*\{[^}]*top:calc\(50% \+ var\(--ahn-core-art-radius\) \+ 6px\)/);
assert.match(segment, /\.ahn-core-subtitle\s*\{[^}]*top:calc\(50% \+ var\(--ahn-core-art-radius\) \+ 27px\)/);
assert.match(segment, /\.ahn-core-scan\s*\{[^}]*left:50%;top:calc\(50% \+ var\(--ahn-core-art-radius\) \+ 42px\)/);
assert.match(segment, /\.ahn-core\.ahn-tapped \.ahn-core-portrait\s*\{[^}]*animation:ahnCoreTapCentered/);
assert.match(segment, /@keyframes ahnCoreTapCentered[\s\S]*transform:translate\(-50%,-50%\)/);
assert.match(css, /\.ahn-core-rings\s*\{[^}]*ahn_mechanical_ring\.webp[^}]*animation:ahnOrbit 36s linear infinite/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*?\.ahn-core-rings\{animation:none!important;/);
assert.match(html, /css\/hub_premium\.css\?v=" \+ q \+ "-hub-network-concentric-v1/);

const origin = html.match(/<g class="ahn-link-tracks">([\s\S]*?)<\/g>/)?.[1] || "";
assert.match(origin, /M180 276 L51 87/, "Do not move connector coordinates");
const node = html.match(/<button class="ahn-core"[\s\S]*?<\/button>/)?.[0] || "";
assert.match(node, /ahn-core-rings[\s\S]*ahn-core-portrait[\s\S]*ahn-core-title[\s\S]*ahn-core-scan/);

// Read-only geometric sanity at common mobile widths. Avoid CTA/stage overflow.
const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
for (const width of [320, 360, 390, 430]) {
  const stageWidth = width - 26; // 13px horizontal panel padding, actual stage no larger.
  const stageHeight = clamp(510, width * 1.5, 680);
  const art = clamp(82, width * .25, 104);
  const radius = clamp(41, width * .125, 52);
  const circle = clamp(150, stageWidth * .44, 200);
  assert.equal(art, radius * 2, "Art and radius variables diverged");
  assert(art < circle, "Inner art must fit within the core click target");
  const bottom = stageHeight * .49 + radius + 42 + 29; // CTA after centered art.
  assert(bottom < stageHeight - 30, `CTA may clip at ${width}px`);
}
console.log("PASS Hub concentric core V1: shared art/ring centre, readable controls, mobile bounds, rotation and reduced motion");
