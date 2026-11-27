# Authored attack sheets

Generated with the built-in image-generation tool, using repository character
images as identity references. Original RGBA sources are preserved here. Their
transparent pixels retain RGB color; they are not opaque background panels.
Normalize with `npm run build:tactical-ops:unit-motion`. Runtime outputs and source
hashes are in `images/tactical_ops/unit_motion/v1/manifest.json`.

## Prompt set

Shared specification:

> Use case: stylized-concept. Asset type: production 2D game attack sprite sheet
> for Alpha Husky. Reference image is the character identity reference.
> Create exactly EIGHT distinct sequential full-body attack animation frames in
> a strict FOUR columns by TWO rows regular grid, read left to right then next
> row. Canvas 1536x1024, each tile 384x512. No text, no lines, no borders, no ground,
> genuine transparent background. ALL frames face RIGHT in identical
> side/three-quarter view matching reference, same camera, same body size, no
> camera motion. Every frame fits fully within its own tile with generous
> transparent margin, no crossing tile edges. Keep standing foot contact at the
> same horizontal baseline near 88% of each tile height, hips near same x center.
> Body should occupy approximately 75% of tile height, consistent scale.
> Animation order: neutral combat ready; anticipatory crouch and draw back;
> stronger windup; sharp fully extended contact pose toward right; follow through;
> decelerating recovery; returning; neutral identical to frame 1. Animate body
> articulation and limb positions, cloth followthrough; do NOT merely rotate or
> translate a static character. No duplicate limbs, detached parts, motion blur,
> VFX or shadows. Crisp realistic game asset rendering with readable silhouette
> and consistent materials matching the reference.

Alpha reference: `images/tactical_ops/alpha_directional/right.png`.
Subject: anthropomorphic husky in charcoal hooded long tactical coat, blue eye,
leather gloves, boots and backpack. One short close combat claw/knife strike with
the near arm. Keep original clothes and head identity.

Skirmisher reference: `images/tactical_ops/hounds/hound_skirmisher_right.webp`.
Subject: quadrupedal angular armored black robotic hound with red seams, exposed
mechanical leg joints and dorsal spikes. One aggressive foreleg swipe/bite lunge.
Keep exact mechanical anatomy and armor identity.
