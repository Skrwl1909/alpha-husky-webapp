# Signal Atlas V3 — Identity Layer

SA-E12: six plates, use existing sector emblems and live labels. Fang and Howl correspond to Assault and Command. Plate art stretches horizontally; use at approximately 240–420 CSS px width.
SA-E13: standard and terminal placeholders. Render as noninteractive decorative elements, not disabled skill buttons; no purchase or unlock action.
SA-E14: available, locked, preview, owned, acquired overlays. Use one overlay per node, with an accessible live state label. Acquired is a transient confirmed event, never inferred from animation. Future reserved uses SA-E13. Pending/offline/no-points etc. remain explicit live UI states, not ownership.
CSS is opt-in and scoped. Set --atlas-sector-plate to the appropriate URL; place state overlay inside a positioned node. Keep focus and touch targets in application UI. No changes to server contracts.
QA: XML parsing and CairoSVG rasterization, archive integrity and hashes checked. Browser/device integration, actual frame fit and existing emblem comparison remain pending.
