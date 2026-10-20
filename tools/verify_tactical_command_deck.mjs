import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("tactical-ops-src/ui/App.tsx", "utf8");
const css = readFileSync("tactical-ops-src/tactical.css", "utf8");
const version = readFileSync("tactical-ops-src/version.ts", "utf8");
const boot = readFileSync("js/boot_loaders.js", "utf8");
const war = app.split("function WarTable() {")[1]?.split("function Brief() {")[0] || "";
const brief = app.split("function Brief() {")[1]?.split("function Sector() {")[0] || "";
for (const id of ["command","missions","squad","archive"]) {
  assert(war.includes('deckTab === "'+id+'"'), "War Table tab "+id);
}
for (const id of ["mission","squad","loadout","intel"]) {
  assert(brief.includes('briefTab === "'+id+'"'), "Mission Brief tab "+id);
}
for (const feature of ["<SkillbookPanel />", "<PackMasteryPanel />", "openOperationBrief", "BATTLEFIELD_LAB_KEY"]) {
  assert(war.includes(feature), "War Table functionality "+feature);
}
for (const feature of ["onClick={deploy}", "onClick={backToHub}", "selectKodaSidegrade", "selectShadowSidegrade", "selectedApproach", "selectedDirectiveTier", "readyCounters", "resuming ? savedRun?.packMastery"]) {
  assert(brief.includes(feature), "Brief functionality "+feature);
}
assert(brief.indexOf("t-deploy-actions-v29") > brief.indexOf('briefTab === "intel"'), "Deploy controls remain outside conditional panes");
assert(brief.includes('briefTab === "squad"') && brief.indexOf("<PackMasteryPanel snapshot=")>brief.indexOf('briefTab === "squad"'), "Mastery accessible on Squad tab");
for (const asset of ["command_room.webp", "mission_hologram.webp", "frames/03_frame_content_panel.png", "frames/05_bar_nav_segmented.png", "frames/06_button_primary.png", "frames/07_button_secondary.png"]) {
  assert(css.includes(asset), "Referenced uploaded asset "+asset);
}
assert(css.includes(".t-command-nav") && css.includes("position: sticky") && css.includes("prefers-reduced-motion"), "Navigation CSS and accessibility");
assert(version.includes("tops-3.3.3-command-deck-premium-ux") && boot.includes("tops-3.3.3-command-deck-premium-ux"), "Canonical runtime version");
console.log("PASS Command Deck source invariants: War Table and Brief tabs, saved actions, sticky navigation and deploy, version");

const skillbook = readFileSync("tactical-ops-src/ui/Skillbook.tsx", "utf8");
const mastery = readFileSync("tactical-ops-src/ui/PackMastery.tsx", "utf8");
assert(war.includes('squadView === "skillbook"') && war.includes('squadView === "mastery"'), "Exclusive Squad views");
assert(war.includes('setDeckTab("missions")'), "Front summary goes to Missions");
assert(!war.includes('t-wt-front-row'), "Command no longer duplicates full Front list");
assert(skillbook.includes('UNIT_DEFS[id].portrait'), "Skillbook roster includes authored character portraits");
assert(mastery.includes("t-premium-mastery-roster") && mastery.includes("selectedId"), "Mastery shows one companion at a time");
assert(css.includes("t-premium-front-link") && css.includes("t-premium-squad-switch"), "Compact Command and Squad UI styling");
console.log("PASS Command Deck premium UX: compact command and exclusive squad progression views");
