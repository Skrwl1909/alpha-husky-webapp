(function () {
  const BloodMoon = {};

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _busy = false;
  let _state = null;
  let _mounted = false;
  let _battleReplayTimer = 0;
  let _battlePixiLoadPromise = null;
  let _battlePixiRunId = 0;

  const ROOT_ID = "bloodMoonBack";
  const STYLE_ID = "bloodMoonStyles";
  const BATTLE_STAGE_ID = "bloodMoonBattleStage";

  function dbg(...args) {
    if (_dbg) console.log("[BloodMoon]", ...args);
  }

  function getApiPost() {
    const fn =
      _apiPost ||
      window.apiPost ||
      window.S?.apiPost ||
      null;
    return typeof fn === "function" ? fn : null;
  }

  function runId(prefix) {
    return [
      prefix || "bm",
      Date.now(),
      Math.random().toString(36).slice(2, 10)
    ].join("_");
  }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pct(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function fmtNum(v) {
    const n = Number(v || 0);
    return Number.isFinite(n) ? n.toLocaleString() : "0";
  }

  function fmtSec(sec) {
    sec = Math.max(0, Number(sec || 0));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }
  
   function fmtGrantList(grants) {
    grants = Array.isArray(grants) ? grants : [];
    const parts = [];

    for (const g of grants) {
      if (!g || typeof g !== "object") continue;

      const type = String(g.type || "").trim().toLowerCase();
      const key = String(g.key || "").trim();
      const amount = Number(g.amount || 0);
      if (!Number.isFinite(amount) || amount <= 0) continue;

      if (type === "bones") {
        parts.push(`${fmtNum(amount)} Bones`);
        continue;
      }
      if (type === "tower_marks") {
        parts.push(`${fmtNum(amount)} Tower Marks`);
        continue;
      }
      if (type === "material") {
        const label = key ? key.replaceAll("_", " ") : "material";
        parts.push(`${fmtNum(amount)} ${label}`);
        continue;
      }

      parts.push(`${fmtNum(amount)} ${key || type}`);
    }

    return parts.join(" • ");
  }

  function rewardLabel(rewardKey) {
    return String(rewardKey || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function notify(msg) {
    try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    try {
      if (window.showToast) return window.showToast(msg);
      if (window.toast) return window.toast(msg);
    } catch (_) {}
    alert(msg);
  }

  function factionLabel(f) {
    const x = String(f || "").trim().toLowerCase();
    if (x === "rb") return "Rogue Byte";
    if (x === "ew") return "Echo Wardens";
    if (x === "ih") return "Inner Howlers";
    if (x === "pb") return "Pack Burners";
    return x ? x.toUpperCase() : "Unaligned";
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const css = `
#${ROOT_ID}{
  position:fixed; inset:0; z-index:99999;
  display:none; align-items:flex-end; justify-content:center;
  background:
    radial-gradient(circle at 50% 22%, rgba(185,28,38,.38) 0%, transparent 65%),
    rgba(7,8,14,.96);
  backdrop-filter: blur(12px);
}
#${ROOT_ID}.show{ display:flex; }

#bloodMoonModal{
  width:min(100%, 740px);
  height:min(94vh, 960px);
  background:linear-gradient(180deg, #140c0f 0%, #0a070a 100%);
  border:2px solid #5c0f1a;
  border-radius:26px 26px 0 0;
  box-shadow:
    0 -30px 80px rgba(140,12,28,.65),
    inset 0 0 120px rgba(80,8,18,.45);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  color:#f4f0f2;
  font-family:inherit;
  position:relative;
}

/* Krwawy księżyc */
#bloodMoonModal::before{
  content:'';
  position:absolute;
  top:-38%;
  left:50%;
  width:460px;
  height:460px;
  border-radius:50%;
  background:radial-gradient(circle, #f8c3c3 8%, #9f1239 42%, transparent 72%);
  opacity:.14;
  transform:translateX(-50%);
  box-shadow:0 0 110px #c22;
  animation:moonPulse 9s ease-in-out infinite;
  z-index:0;
  pointer-events:none;
}
@keyframes moonPulse{
  0%,100%{ opacity:.14; transform:translateX(-50%) scale(1); }
  50%{ opacity:.26; transform:translateX(-50%) scale(1.09); }
}

/* Czerwona mgła */
#bloodMoonModal::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(transparent, rgba(185,28,38,.09));
  animation:bloodMist 28s linear infinite;
  pointer-events:none;
  z-index:0;
}
@keyframes bloodMist{
  0%{ transform:translateY(0); }
  100%{ transform:translateY(-30%); }
}

#bloodMoonHead{
  padding:16px 16px 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg, rgba(93,18,31,.30), rgba(0,0,0,0));
  position:relative;
  z-index:2;
}

#bloodMoonTopRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

#bloodMoonTitle{
  position:relative;
  display:inline-block;
  font-weight:900;
  font-size:23px;
  letter-spacing:2px;
  background:linear-gradient(90deg,#ff3366,#ff99aa,#ff3366);
  -webkit-background-clip:text;
  background-clip:text;
  -webkit-text-fill-color:transparent;
  text-shadow:0 0 35px #c00;
}
#bloodMoonTitle::after{
  content:'🌑';
  position:absolute;
  right:-38px;
  top:-6px;
  font-size:32px;
  filter:drop-shadow(0 0 18px #ff1a4d);
  animation:moonPulse 4s ease-in-out infinite;
}

#bloodMoonSub{
  margin-top:6px;
  color:rgba(255,255,255,.72);
  font-size:12px;
}

#bloodMoonClose{
  border:0;
  outline:0;
  cursor:pointer;
  width:38px;
  height:38px;
  border-radius:12px;
  background:rgba(255,255,255,.08);
  color:#fff;
  font-size:18px;
  font-weight:800;
  transition:transform .18s ease, background .18s ease;
}
#bloodMoonClose:hover{
  transform:translateY(-1px);
  background:rgba(255,255,255,.14);
}

#bloodMoonBody{
  position:relative;
  z-index:2;
  flex:1;
  overflow-y:auto;
  overscroll-behavior:contain;
  padding:14px;
  padding-bottom:max(18px, env(safe-area-inset-bottom));
}

.bm-card{
  position:relative;
  background:linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.03));
  border:1px solid rgba(255,255,255,.08);
  border-radius:18px;
  padding:14px;
  margin-bottom:12px;
  box-shadow:
    0 10px 28px rgba(0,0,0,.24),
    inset 0 1px 0 rgba(255,255,255,.03);
  backdrop-filter: blur(2px);
}

.bm-card-hero{
  overflow:hidden;
  border:1px solid rgba(255,90,120,.16);
  box-shadow:
    0 18px 40px rgba(0,0,0,.30),
    0 0 30px rgba(160,24,45,.12),
    inset 0 1px 0 rgba(255,255,255,.03);
}
.bm-card-hero::before{
  content:'';
  position:absolute;
  inset:auto -20% -55% -20%;
  height:120px;
  background:radial-gradient(circle, rgba(185,28,38,.18), transparent 70%);
  pointer-events:none;
}

.bm-row{ display:flex; gap:10px; }
.bm-col{ flex:1; min-width:0; }

.bm-label{
  font-size:11px;
  letter-spacing:.45px;
  text-transform:uppercase;
  color:rgba(255,255,255,.58);
  margin-bottom:6px;
}
.bm-value{
  font-size:16px;
  font-weight:800;
  color:#fff;
}

.bm-hero-intensity{
  text-align:center;
  font-size:13px;
  color:#ff99aa;
  letter-spacing:1px;
  margin-bottom:10px;
  font-weight:800;
}

.bm-meta-row{
  display:grid;
  grid-template-columns:repeat(2, minmax(0,1fr));
  gap:10px;
  margin-top:12px;
}
@media (min-width:640px){
  .bm-meta-row{
    grid-template-columns:repeat(3, minmax(0,1fr));
  }
}

.bm-meta-pill{
  padding:10px 12px;
  border-radius:14px;
  background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.06);
}
.bm-meta-pill .bm-label{
  margin-bottom:4px;
}
.bm-meta-pill .bm-value{
  font-size:14px;
}

.bm-progress-wrap{
  margin-top:10px;
}
.bm-progress{
  height:12px;
  border-radius:999px;
  overflow:hidden;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.06);
}
.bm-progress > i{
  display:block;
  height:100%;
  width:0%;
  background:linear-gradient(90deg, #7f1022, #d13a4d, #ff7b92);
  box-shadow:0 0 22px rgba(219,77,104,.65);
  transition:width 1.1s ease;
}

.bm-boss-bar{
  height:32px;
  border:3px solid #5c0f1a;
  border-radius:999px;
  background:#111;
  overflow:hidden;
  box-shadow:inset 0 6px 14px rgba(0,0,0,.85);
}
.bm-boss-fill{
  height:100%;
  background:linear-gradient(90deg,#b81e2e,#e83a4f,#ff5e70);
  transition:width .7s cubic-bezier(0.4,0,0.2,1);
  position:relative;
}
.bm-boss-fill::after{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
  animation:bossBleed 2.8s linear infinite;
}
@keyframes bossBleed{
  0%{ transform:translateX(-120%); }
  100%{ transform:translateX(400%); }
}

.bm-wave-line{
  display:flex;
  justify-content:space-between;
  gap:8px;
  margin-top:8px;
  font-size:12px;
  color:rgba(255,255,255,.78);
}

.bm-cta{
  width:100%;
  border:0;
  outline:0;
  cursor:pointer;
  padding:19px 28px;
  border-radius:18px;
  font-weight:900;
  font-size:17px;
  letter-spacing:1.8px;
  text-transform:uppercase;
  color:#fff;
  border:2px solid #ff4d5e;
  background:linear-gradient(180deg, #b51f32, #7a1424);
  box-shadow:
    0 0 35px #ff2d3d,
    0 14px 35px rgba(180,20,40,.7);
  position:relative;
  overflow:hidden;
  transition:all .2s cubic-bezier(0.4,0,0.2,1);
}
.bm-cta::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);
  animation:bloodShimmer 2.8s linear infinite;
}
@keyframes bloodShimmer{
  0%{ transform:translateX(-180%); }
  100%{ transform:translateX(380%); }
}
.bm-cta:hover{
  transform:scale(1.02) translateY(-2px);
  box-shadow:
    0 0 55px #ff1f35,
    0 22px 45px rgba(200,25,45,.8);
}
.bm-cta:active{
  transform:scale(0.98);
}
.bm-cta[disabled]{
  cursor:not-allowed;
  opacity:.55;
  box-shadow:none;
  transform:none;
}
.bm-cta[disabled]::before{
  display:none;
}

.bm-mini-grid{
  display:grid;
  grid-template-columns:repeat(2, minmax(0,1fr));
  gap:10px;
}
@media (min-width:640px){
  .bm-mini-grid{ grid-template-columns:repeat(4, minmax(0,1fr)); }
}

.bm-stat{
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);
  border-radius:14px;
  padding:10px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.02);
}

.bm-list{
  display:flex;
  flex-direction:column;
  gap:8px;
}

.bm-standing,
.bm-feed,
.bm-reward{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05);
  border-radius:14px;
  padding:10px 12px;
}

.bm-standing-left,
.bm-feed-left{
  min-width:0;
}

.bm-standing-name,
.bm-feed-text{
  font-weight:700;
  color:#fff;
}
.bm-standing-name{
  color:#ff99aa;
}

.bm-standing-sub,
.bm-feed-sub{
  font-size:12px;
  color:rgba(255,255,255,.62);
  margin-top:2px;
}

.bm-chip{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:34px;
  padding:6px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:800;
  background:rgba(255,255,255,.09);
  color:#fff;
}

.bm-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05);
  border-radius:14px;
  padding:10px 12px;
}
.bm-top + .bm-top{
  margin-top:8px;
}

.bm-claim-btn{
  border:0;
  outline:0;
  cursor:pointer;
  padding:9px 12px;
  border-radius:12px;
  font-weight:800;
  color:#fff;
  background:linear-gradient(180deg, #5f1320, #8f1c2f);
}

.bm-dominance{
  height:9px;
  border-radius:999px;
  background:rgba(255,255,255,.07);
  overflow:hidden;
  margin:6px 0;
  border:1px solid rgba(255,255,255,.05);
}
.bm-dominance-fill{
  height:100%;
  transition:width .9s ease;
  background:linear-gradient(90deg, #b81e2e, #ff3366, #ff7a98);
  box-shadow:0 0 18px rgba(255,60,98,.40);
}

.bm-race-row{
  display:flex;
  align-items:center;
  gap:10px;
  font-size:13px;
}
.bm-race-name{
  min-width:110px;
  font-weight:800;
  color:#fff;
}
.bm-race-pct{
  color:#ff99aa;
  font-weight:800;
  min-width:40px;
  text-align:right;
}

.bm-battle-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
}
.bm-battle-title{
  font-size:18px;
  font-weight:900;
  color:#fff;
}
.bm-battle-sub{
  margin-top:4px;
  font-size:12px;
  color:rgba(255,255,255,.68);
}
.bm-battle-replay{
  border:1px solid rgba(255,255,255,.12);
  outline:0;
  cursor:pointer;
  border-radius:12px;
  padding:10px 12px;
  background:linear-gradient(180deg, rgba(126,18,34,.95), rgba(88,13,24,.95));
  color:#fff;
  font-weight:800;
  letter-spacing:.4px;
  white-space:nowrap;
  box-shadow:0 10px 20px rgba(0,0,0,.22);
}
.bm-battle-replay:hover{
  transform:translateY(-1px);
}
.bm-battle-meta{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:12px;
}
.bm-battle-chip{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:28px;
  padding:0 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  letter-spacing:.4px;
  text-transform:uppercase;
  color:#fff;
  background:rgba(255,255,255,.07);
  border:1px solid rgba(255,255,255,.08);
}
.bm-battle-chip.crit{
  background:rgba(255,198,92,.16);
  border-color:rgba(255,198,92,.34);
  color:#ffd978;
}
.bm-battle-chip.clear{
  background:rgba(255,94,112,.14);
  border-color:rgba(255,94,112,.28);
  color:#ff9cab;
}
.bm-battle-stage-slot{
  margin-top:14px;
}
.bm-battle-stage{
  position:relative;
  overflow:hidden;
  border-radius:20px;
  border:1px solid rgba(255,255,255,.08);
  background:
    radial-gradient(circle at 50% 0%, rgba(255,94,112,.16), transparent 50%),
    linear-gradient(180deg, rgba(30,8,14,.95), rgba(14,8,12,.92));
  padding:16px;
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:14px;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.03),
    0 18px 34px rgba(0,0,0,.28);
}
@media (min-width:640px){
  .bm-battle-stage{
    grid-template-columns:minmax(0,1fr) minmax(160px, .8fr) minmax(0,1fr);
    align-items:center;
  }
}
.bm-battle-stage::before{
  content:'';
  position:absolute;
  inset:0;
  background:
    linear-gradient(90deg, transparent 0%, rgba(255,255,255,.03) 48%, transparent 52%, transparent 100%),
    linear-gradient(180deg, transparent 0%, rgba(255,255,255,.025) 50%, transparent 100%);
  pointer-events:none;
}
.bm-battle-stage.is-crit{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.05),
    0 18px 34px rgba(0,0,0,.30),
    0 0 26px rgba(255,193,94,.12);
}
.bm-battle-stage.is-cleared{
  border-color:rgba(255,94,112,.18);
}
.bm-battle-stage.is-empty{
  display:block;
  min-height:190px;
}
.bm-battle-stage.is-pixi-active{
  border-color:rgba(255,255,255,.10);
}
.bm-battle-pixi-host{
  position:absolute;
  inset:0;
  z-index:0;
  border-radius:inherit;
  overflow:hidden;
  pointer-events:none;
  opacity:.96;
}
.bm-battle-pixi-host canvas{
  width:100%;
  height:100%;
  display:block;
}
.bm-battle-stage.is-replaying .bm-battle-side-player .bm-battle-crest{
  animation:bmBattleAdvance .75s ease;
}
.bm-battle-stage.is-replaying .bm-battle-side-enemy .bm-battle-crest{
  animation:bmBattleHit .72s ease;
}
.bm-battle-stage.is-replaying .bm-battle-impact-core{
  animation:bmBattleImpact .92s cubic-bezier(0.22, 1, 0.36, 1);
}
.bm-battle-stage.is-replaying .bm-battle-hp-before{
  animation:bmBattleDrain .95s cubic-bezier(0.25, 1, 0.3, 1) forwards;
}
.bm-battle-stage.is-replaying .bm-battle-log-item{
  animation:bmBattleLogIn .5s ease forwards;
}
.bm-battle-stage.is-replaying .bm-battle-log-item:nth-child(2){
  animation-delay:.08s;
}
.bm-battle-stage.is-replaying .bm-battle-log-item:nth-child(3){
  animation-delay:.16s;
}
@keyframes bmBattleAdvance{
  0%{ transform:translateX(0) scale(1); }
  38%{ transform:translateX(8px) scale(1.04); }
  100%{ transform:translateX(0) scale(1); }
}
@keyframes bmBattleHit{
  0%, 100%{ transform:translateX(0); }
  15%{ transform:translateX(-6px) rotate(-2deg); }
  30%{ transform:translateX(8px) rotate(2deg); }
  48%{ transform:translateX(-4px) rotate(-1deg); }
  68%{ transform:translateX(3px); }
}
@keyframes bmBattleImpact{
  0%{ opacity:.15; transform:scale(.82); }
  28%{ opacity:1; transform:scale(1.1); }
  100%{ opacity:1; transform:scale(1); }
}
@keyframes bmBattleDrain{
  from{ width:var(--bm-before-pct, 100%); }
  to{ width:var(--bm-after-pct, 100%); }
}
@keyframes bmBattleLogIn{
  0%{ opacity:0; transform:translateY(8px); }
  100%{ opacity:1; transform:translateY(0); }
}
.bm-battle-placeholder{
  min-height:156px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  gap:10px;
  color:rgba(255,255,255,.74);
}
.bm-battle-placeholder-core{
  width:82px;
  height:82px;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(circle at 50% 50%, rgba(255,94,112,.32), rgba(92,15,26,.18) 58%, transparent 76%);
  box-shadow:0 0 30px rgba(255,94,112,.14);
}
.bm-battle-placeholder-title{
  font-size:18px;
  font-weight:900;
  color:#fff;
}
.bm-battle-grid{
  position:relative;
  z-index:1;
  display:contents;
}
.bm-battle-side{
  min-width:0;
  position:relative;
  z-index:1;
}
.bm-battle-side-head{
  display:flex;
  align-items:center;
  gap:12px;
}
.bm-battle-side-player .bm-battle-side-head{
  justify-content:flex-start;
}
.bm-battle-side-enemy .bm-battle-side-head{
  justify-content:flex-start;
}
@media (min-width:640px){
  .bm-battle-side-enemy .bm-battle-side-head{
    justify-content:flex-end;
  }
  .bm-battle-side-enemy{
    text-align:right;
  }
}
.bm-battle-crest{
  width:58px;
  height:58px;
  border-radius:18px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  font-size:18px;
  color:#fff;
  border:1px solid rgba(255,255,255,.12);
  box-shadow:0 10px 24px rgba(0,0,0,.24);
  flex:0 0 auto;
}
.bm-battle-side-player .bm-battle-crest{
  background:linear-gradient(180deg, #a32034, #5c1120);
}
.bm-battle-side-enemy .bm-battle-crest{
  background:linear-gradient(180deg, #5f1320, #21070d);
}
.bm-battle-side-role{
  font-size:11px;
  letter-spacing:.45px;
  text-transform:uppercase;
  color:rgba(255,255,255,.54);
}
.bm-battle-side-name{
  margin-top:2px;
  font-size:18px;
  font-weight:900;
  color:#fff;
}
.bm-battle-side-sub{
  margin-top:3px;
  font-size:12px;
  color:rgba(255,255,255,.68);
}
.bm-battle-impact{
  display:flex;
  justify-content:center;
  position:relative;
  z-index:1;
}
.bm-battle-impact-core{
  width:100%;
  max-width:180px;
  text-align:center;
  border-radius:18px;
  padding:14px 12px;
  border:1px solid rgba(255,255,255,.10);
  background:
    radial-gradient(circle at 50% 0%, rgba(255,94,112,.16), transparent 64%),
    rgba(255,255,255,.03);
}
.bm-battle-impact-label{
  font-size:11px;
  letter-spacing:.5px;
  text-transform:uppercase;
  color:rgba(255,255,255,.56);
}
.bm-battle-damage{
  margin-top:6px;
  font-size:30px;
  line-height:1;
  font-weight:900;
  color:#fff;
  text-shadow:0 0 24px rgba(255,94,112,.22);
}
.bm-battle-impact-core.is-crit .bm-battle-damage{
  color:#ffd978;
  text-shadow:0 0 28px rgba(255,217,120,.34);
}
.bm-battle-impact-sub{
  margin-top:8px;
  font-size:12px;
  color:rgba(255,255,255,.74);
}
.bm-battle-hp-wrap{
  margin-top:14px;
}
.bm-battle-hp-track{
  position:relative;
  height:16px;
  overflow:hidden;
  border-radius:999px;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.08);
  box-shadow:inset 0 4px 10px rgba(0,0,0,.36);
}
.bm-battle-hp-before,
.bm-battle-hp-current{
  position:absolute;
  left:0;
  top:0;
  height:100%;
  border-radius:999px;
}
.bm-battle-hp-before{
  width:var(--bm-before-pct, 100%);
  background:linear-gradient(90deg, rgba(143,28,47,.82), rgba(255,94,112,.78));
  opacity:.34;
}
.bm-battle-hp-current{
  width:var(--bm-after-pct, 100%);
  background:linear-gradient(90deg, #8d182b, #ff5e70);
  box-shadow:0 0 20px rgba(255,94,112,.35);
}
.bm-battle-hp-line{
  display:flex;
  justify-content:space-between;
  gap:8px;
  margin-top:8px;
  font-size:12px;
  color:rgba(255,255,255,.76);
}
.bm-battle-log{
  margin-top:12px;
  grid-column:1 / -1;
  display:flex;
  flex-direction:column;
  gap:8px;
  position:relative;
  z-index:1;
}
.bm-battle-log-item{
  opacity:1;
  display:flex;
  gap:10px;
  align-items:flex-start;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.06);
  border-radius:14px;
  padding:10px 12px;
}
.bm-battle-log-no{
  flex:0 0 auto;
  width:26px;
  height:26px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:rgba(255,255,255,.08);
  color:#ff99aa;
  font-size:11px;
  font-weight:900;
}
.bm-battle-log-text{
  font-size:13px;
  color:#fff;
  line-height:1.35;
}
.bm-battle-log-sub{
  margin-top:2px;
  font-size:11px;
  color:rgba(255,255,255,.56);
}

#bloodMoonLoader{
  display:none;
  position:absolute;
  inset:0;
  background:rgba(8,10,16,.42);
  backdrop-filter: blur(4px);
  align-items:center;
  justify-content:center;
  z-index:3;
}
#bloodMoonLoader.show{
  display:flex;
}
#bloodMoonLoader > div{
  padding:10px 14px;
  border-radius:14px;
  background:rgba(0,0,0,.44);
  border:1px solid rgba(255,255,255,.08);
  font-weight:800;
}

.bm-empty{
  padding:16px;
  text-align:center;
  color:rgba(255,255,255,.62);
  font-size:13px;
}
    `.trim();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureMounted() {
    if (_mounted && document.getElementById(ROOT_ID)) return;
    injectStyles();

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = `
      <div id="bloodMoonModal">
        <div id="bloodMoonLoader"><div>Loading Blood-Moon Tower…</div></div>

        <div id="bloodMoonHead">
          <div id="bloodMoonTopRow">
            <div id="bloodMoonTitle">Blood-Moon Tower</div>
            <button id="bloodMoonClose" type="button">✕</button>
          </div>
          <div id="bloodMoonSub">Faction PvE raid • shared progress • live pressure</div>
        </div>

        <div id="bloodMoonBody">
          <div class="bm-empty">Loading…</div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    root.addEventListener("click", (e) => {
      if (e.target === root) close();
    });

    root.querySelector("#bloodMoonClose")?.addEventListener("click", close);

    _mounted = true;
  }

  function rootEl() {
    return document.getElementById(ROOT_ID);
  }

  function bodyEl() {
    return document.getElementById("bloodMoonBody");
  }

  function loaderEl() {
    return document.getElementById("bloodMoonLoader");
  }

  function setBusy(flag) {
    _busy = !!flag;
    const ld = loaderEl();
    if (ld) ld.classList.toggle("show", _busy);
  }

  function show() {
    ensureMounted();
    rootEl()?.classList.add("show");
    document.documentElement.classList.add("ah-bloodmoon-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    stopBattlePlayback(true);
    rootEl()?.classList.remove("show");
    document.documentElement.classList.remove("ah-bloodmoon-open");
    document.body.style.overflow = "";
  }

  async function call(path, payload) {
    const fn = getApiPost();
    if (!fn) throw new Error("apiPost missing");
    return await fn(path, payload || {});
  }

  function getLastBattle() {
    const battle = _state?.lastBattle;
    if (!battle || typeof battle !== "object" || Array.isArray(battle)) return null;
    try {
      return JSON.parse(JSON.stringify(battle));
    } catch (_) {
      return battle;
    }
  }

  function battleStageSlotEl() {
    return document.getElementById(BATTLE_STAGE_ID);
  }

  function battleLiteStageEl() {
    return battleStageSlotEl()?.querySelector(".bm-battle-stage") || null;
  }

  function pixiHostEl() {
    return battleLiteStageEl()?.querySelector("[data-bm-pixi-host]") || null;
  }

  function stopBattlePlayback(hard = false) {
    _battlePixiRunId += 1;

    if (_battleReplayTimer) {
      clearTimeout(_battleReplayTimer);
      _battleReplayTimer = 0;
    }

    const stage = battleLiteStageEl();
    if (stage) stage.classList.remove("is-replaying");

    if (hard && stage) stage.classList.remove("is-pixi-active");

    try {
      if (hard) window.BloodMoonPixi?.destroy?.();
      else window.BloodMoonPixi?.stop?.();
    } catch (err) {
      dbg("battle pixi cleanup error", err);
    }

    if (hard) {
      const host = pixiHostEl();
      if (host) host.innerHTML = "";
    }
  }

  function loadScriptOnce(url, readyCheck) {
    return new Promise((resolve, reject) => {
      try {
        if (typeof readyCheck === "function" && readyCheck()) return resolve(true);
      } catch (_) {}

      const base = String(url || "").split("?")[0];
      const existing = Array.from(document.scripts || []).find((s) => String(s.src || "").includes(base));
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load: " + url)), { once: true });
        return;
      }

      const s = document.createElement("script");
      s.src = url;
      s.async = true;
      s.onload = () => resolve(true);
      s.onerror = () => reject(new Error("Failed to load: " + url));
      document.head.appendChild(s);
    });
  }

  async function ensureBattlePixi() {
    if (window.PIXI && window.BloodMoonPixi) return true;
    if (_battlePixiLoadPromise) return _battlePixiLoadPromise;

    const v = String(window.WEBAPP_VER || "bloodmoon");
    _battlePixiLoadPromise = (async () => {
      if (!window.PIXI) {
        await loadScriptOnce(`/js/pixi.min.js?v=${encodeURIComponent(v)}`, () => !!window.PIXI);
      }
      if (!window.BloodMoonPixi) {
        await loadScriptOnce(`/js/bloodmoon_pixi.js?v=${encodeURIComponent(v)}`, () => !!window.BloodMoonPixi);
      }
      return !!window.PIXI && !!window.BloodMoonPixi;
    })();

    try {
      return await _battlePixiLoadPromise;
    } catch (err) {
      _battlePixiLoadPromise = null;
      throw err;
    }
  }

  async function playLastBattlePixi(battle, opts = {}) {
    const runId = ++_battlePixiRunId;
    const stage = battleLiteStageEl();
    const host = pixiHostEl();
    if (!battle || !stage || !host) return false;

    try {
      await ensureBattlePixi();
      if (runId !== _battlePixiRunId) return false;
      if (!window.BloodMoonPixi?.init || !window.BloodMoonPixi?.play) return false;

      const liveStage = battleLiteStageEl();
      const liveHost = pixiHostEl();
      if (!liveStage || !liveHost || liveHost !== host) return false;

      await window.BloodMoonPixi.init(liveHost, {
        dbg: _dbg,
        tg: _tg,
      });
      if (runId !== _battlePixiRunId) return false;

      await window.BloodMoonPixi.play(battle, {
        dbg: _dbg,
        tg: _tg,
        animate: opts.animate !== false,
      });

      if (runId !== _battlePixiRunId) return false;
      liveStage.classList.add("is-pixi-active");
      return true;
    } catch (err) {
      dbg("battle pixi fallback", err);
      stage.classList.remove("is-pixi-active");
      try { window.BloodMoonPixi?.destroy?.(); } catch (_) {}
      if (host) host.innerHTML = "";
      return false;
    }
  }

  function battleInitial(name, fallback = "?") {
    const raw = String(name || fallback || "?").trim();
    if (!raw) return String(fallback || "?").slice(0, 2).toUpperCase();
    const parts = raw.split(/\s+/).filter(Boolean).slice(0, 2);
    const out = parts.map((part) => part.charAt(0)).join("").toUpperCase();
    return out || raw.slice(0, 2).toUpperCase();
  }

  function fmtBattleStamp(ts) {
    const n = Number(ts || 0);
    if (!Number.isFinite(n) || n <= 0) return "Moments ago";
    try {
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(n * 1000));
    } catch (_) {
      return new Date(n * 1000).toLocaleString();
    }
  }

  function buildBattleLogRows(battle) {
    if (!battle || typeof battle !== "object") return [];

    const wave = Number(battle.wave || battle.enemy?.wave || 1);
    const nextWave = Number(battle.nextWave || 0);
    const damage = Number(battle.attack?.damage || 0);
    const hpAfter = Math.max(0, Number(battle.enemy?.hpAfter || 0));
    const hpMax = Math.max(1, Number(battle.enemy?.hpMax || 1));
    const playerName = String(battle.player?.name || "You");
    const rows = [];

    rows.push({
      text: `${playerName} stepped into Blood-Moon Wave ${fmtNum(wave)}.`,
      sub: `Attempt ${fmtNum(battle.attemptNo || 1)} • ${factionLabel(battle.player?.faction)}`,
    });

    rows.push({
      text: battle.attack?.crit
        ? `Critical strike landed for ${fmtNum(damage)} damage.`
        : `Strike connected for ${fmtNum(damage)} damage.`,
      sub: battle.attack?.crit ? "The beast staggered under a crit." : "A clean hit ripped through the veil.",
    });

    rows.push({
      text: battle.waveCleared
        ? `Wave ${fmtNum(wave)} collapsed.`
        : `The wave still has ${fmtNum(hpAfter)} / ${fmtNum(hpMax)} HP.`,
      sub: battle.waveCleared && nextWave > wave
        ? `Wave ${fmtNum(nextWave)} is now active.`
        : battle.waveCleared
        ? "The Blood-Moon moment is sealed."
        : "The target survived this strike.",
    });

    return rows;
  }

  function renderBattlePanel(battle) {
    const hasBattle = !!(battle && typeof battle === "object");
    const wave = Math.max(1, Number(battle?.wave || battle?.enemy?.wave || _state?.currentWave || 1));
    const attemptNo = Math.max(1, Number(battle?.attemptNo || 1));
    const damage = Math.max(0, Number(battle?.attack?.damage || 0));
    const hpBefore = Math.max(0, Number(battle?.enemy?.hpBefore || battle?.enemy?.hpMax || 0));
    const hpAfter = Math.max(0, Number(battle?.enemy?.hpAfter || 0));
    const hpMax = Math.max(1, Number(battle?.enemy?.hpMax || hpBefore || _state?.waveHpMax || 1));
    const beforePct = pct((hpBefore / hpMax) * 100);
    const afterPct = pct((hpAfter / hpMax) * 100);
    const playerName = String(battle?.player?.name || "You");
    const playerLevel = Math.max(1, Number(battle?.player?.level || 1));
    const playerFaction = factionLabel(battle?.player?.faction);
    const enemyName = String(battle?.enemy?.name || `Blood-Moon Wave ${wave}`);
    const stamp = fmtBattleStamp(battle?.ts);
    const logs = buildBattleLogRows(battle);
    const impactLabel = battle?.waveCleared
      ? "Wave Broken"
      : battle?.attack?.crit
      ? "Critical Strike"
      : "Direct Hit";
    const impactSub = battle?.waveCleared
      ? `Wave ${fmtNum(wave)} gave way under the pressure.`
      : battle?.attack?.crit
      ? "A clean crit ripped into the target."
      : "The tower shuddered from the impact.";

    if (!hasBattle) {
      return `
        <div class="bm-card">
          <div class="bm-battle-head">
            <div>
              <div class="bm-label">Battle Viewer</div>
              <div class="bm-battle-title">Replay-Lite Stage Ready</div>
              <div class="bm-battle-sub">Your next Blood-Moon strike will appear here as a stylized battle moment.</div>
            </div>
            <div class="bm-battle-chip">Waiting</div>
          </div>

          <div id="${BATTLE_STAGE_ID}" class="bm-battle-stage-slot" data-bm-stage="lite">
            <div class="bm-battle-stage is-empty">
              <div class="bm-battle-placeholder">
                <div class="bm-battle-placeholder-core"></div>
                <div class="bm-battle-placeholder-title">Battle Stage Primed</div>
                <div class="bm-battle-sub">Hit the tower once and this card will turn into a replay-lite battle viewer.</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="bm-card">
        <div class="bm-battle-head">
          <div>
            <div class="bm-label">Battle Viewer</div>
            <div class="bm-battle-title">Last Strike Replay-Lite</div>
            <div class="bm-battle-sub">A stylized hit view driven by the real Blood-Moon battle summary.</div>
          </div>
          <button class="bm-battle-replay" data-bm-replay type="button">Replay Strike</button>
        </div>

        <div class="bm-battle-meta">
          <div class="bm-battle-chip">Wave ${fmtNum(wave)}</div>
          <div class="bm-battle-chip">Attempt ${fmtNum(attemptNo)}</div>
          <div class="bm-battle-chip">${esc(stamp)}</div>
          ${battle?.attack?.crit ? `<div class="bm-battle-chip crit">CRIT</div>` : ""}
          ${battle?.waveCleared ? `<div class="bm-battle-chip clear">CLEARED</div>` : ""}
        </div>

        <div id="${BATTLE_STAGE_ID}" class="bm-battle-stage-slot" data-bm-stage="lite" data-bm-battle-id="${esc(battle?.battleId || "")}">
          <div
            class="bm-battle-stage ${battle?.attack?.crit ? "is-crit" : ""} ${battle?.waveCleared ? "is-cleared" : ""}"
            style="--bm-before-pct:${beforePct}%;--bm-after-pct:${afterPct}%"
          >
            <div class="bm-battle-pixi-host" data-bm-pixi-host></div>
            <div class="bm-battle-grid">
              <div class="bm-battle-side bm-battle-side-player">
                <div class="bm-battle-side-head">
                  <div class="bm-battle-crest">${esc(battleInitial(playerName, "Y"))}</div>
                  <div>
                    <div class="bm-battle-side-role">Hunter</div>
                    <div class="bm-battle-side-name">${esc(playerName)}</div>
                    <div class="bm-battle-side-sub">${esc(playerFaction)} • Lv ${fmtNum(playerLevel)}</div>
                  </div>
                </div>
              </div>

              <div class="bm-battle-impact">
                <div class="bm-battle-impact-core ${battle?.attack?.crit ? "is-crit" : ""}">
                  <div class="bm-battle-impact-label">${esc(impactLabel)}</div>
                  <div class="bm-battle-damage">-${fmtNum(damage)}</div>
                  <div class="bm-battle-impact-sub">${esc(impactSub)}</div>
                </div>
              </div>

              <div class="bm-battle-side bm-battle-side-enemy">
                <div class="bm-battle-side-head">
                  <div>
                    <div class="bm-battle-side-role">Target</div>
                    <div class="bm-battle-side-name">${esc(enemyName)}</div>
                    <div class="bm-battle-side-sub">Shared raid enemy • ${afterPct}% remaining</div>
                  </div>
                  <div class="bm-battle-crest">${esc(`W${wave}`)}</div>
                </div>

                <div class="bm-battle-hp-wrap">
                  <div class="bm-battle-hp-track">
                    <div class="bm-battle-hp-before"></div>
                    <div class="bm-battle-hp-current"></div>
                  </div>
                  <div class="bm-battle-hp-line">
                    <span>${fmtNum(hpAfter)} / ${fmtNum(hpMax)} HP</span>
                    <span>Before ${fmtNum(hpBefore)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="bm-battle-log">
              ${logs.map((row, idx) => `
                <div class="bm-battle-log-item">
                  <div class="bm-battle-log-no">${idx + 1}</div>
                  <div>
                    <div class="bm-battle-log-text">${esc(row.text || "")}</div>
                    <div class="bm-battle-log-sub">${esc(row.sub || "")}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function playLastBattle(opts = {}) {
    const battle = opts?.battle && typeof opts.battle === "object" ? opts.battle : getLastBattle();
    const stage = battleLiteStageEl();
    if (!battle || !stage) return false;

    stopBattlePlayback(false);
    stage.classList.remove("is-replaying");
    void stage.offsetWidth;
    stage.classList.add("is-replaying");

    if (opts?.haptic !== false) {
      try {
        _tg?.HapticFeedback?.impactOccurred?.(battle?.attack?.crit ? "medium" : "light");
      } catch (_) {}
    }

    _battleReplayTimer = window.setTimeout(() => {
      stage.classList.remove("is-replaying");
      _battleReplayTimer = 0;
    }, 1400);

    void playLastBattlePixi(battle, {
      animate: opts?.animate !== false,
    });

    return true;
  }

  function renderFactionStandings(rows) {
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length) return `<div class="bm-empty">No faction standings yet.</div>`;

    return `
      <div class="bm-list">
        ${rows.map((row) => `
          <div class="bm-standing">
            <div class="bm-standing-left">
              <div class="bm-standing-name">${esc(factionLabel(row.faction))}</div>
              <div class="bm-standing-sub">
                Score ${fmtNum(row.score)} • Damage ${fmtNum(row.totalDamage || row.score)} • Players ${fmtNum(row.playersCount)}
              </div>
            </div>
            <div class="bm-chip">#${esc(row.place || "?")}</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderTopPlayers(rows) {
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length) return `<div class="bm-empty">No top contributors yet.</div>`;

    return rows.map((row, idx) => `
      <div class="bm-top">
        <div>
          <div class="bm-standing-name">${idx + 1}. ${esc(row.name || `User ${row.uid || ""}`)}</div>
          <div class="bm-standing-sub">${esc(factionLabel(row.faction))} • Best hit ${fmtNum(row.bestHit)}</div>
        </div>
        <div class="bm-chip">${fmtNum(row.damage)}</div>
      </div>
    `).join("");
  }

  function renderFeed(rows) {
    rows = Array.isArray(rows) ? rows : [];
    if (!rows.length) return `<div class="bm-empty">The tower is silent… for now.</div>`;

    return `
      <div class="bm-list">
        ${rows.map((row) => `
          <div class="bm-feed">
            <div class="bm-feed-left">
              <div class="bm-feed-text">${esc(row.text || "")}</div>
              <div class="bm-feed-sub">${esc(row.kind || "event")}</div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderClaimables(claimable) {
    claimable = Array.isArray(claimable) ? claimable : [];
    if (!claimable.length) return `<div class="bm-empty">No claimable rewards yet.</div>`;

    return `
      <div class="bm-list">
        ${claimable.map((row) => {
          const isObj = row && typeof row === "object" && !Array.isArray(row);
          const rewardKey = isObj ? String(row.rewardKey || "") : String(row || "");
          const title = isObj
            ? String(row.label || rewardLabel(rewardKey))
            : rewardLabel(rewardKey);

          const summary = isObj
            ? String(row.summary || fmtGrantList(row.grants || row.reward?.grants || []))
            : "Wave milestone reward ready to claim";

          return `
            <div class="bm-reward">
              <div>
                <div class="bm-standing-name">${esc(title)}</div>
                <div class="bm-standing-sub">${esc(summary || "Reward ready to claim")}</div>
              </div>
              <button class="bm-claim-btn" data-bm-claim="${esc(rewardKey)}" type="button">Claim</button>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderRace(sortedFactions, dominancePct) {
    if (!Array.isArray(sortedFactions) || !sortedFactions.length) {
      return `<div class="bm-empty">No faction pressure yet.</div>`;
    }

    const leader = sortedFactions[0];
    return `
      <div class="bm-race-row">
        <div class="bm-race-name">${esc(factionLabel(leader?.faction))}</div>
        <div style="flex:1">
          <div class="bm-dominance">
            <div class="bm-dominance-fill" style="width:${pct(dominancePct)}%"></div>
          </div>
        </div>
        <div class="bm-race-pct">${pct(dominancePct)}%</div>
      </div>
    `;
  }

  function bindActions() {
    document.querySelectorAll("[data-bm-replay]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (_busy) return;
        playLastBattle({ haptic: true });
      });
    });

    document.querySelectorAll("[data-bm-claim]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (_busy) return;
        const rewardKey = btn.getAttribute("data-bm-claim") || "";
        if (!rewardKey) return;
        await claim(rewardKey);
      });
    });

    const attackBtn = document.getElementById("bloodMoonAttackBtn");
    if (attackBtn) {
      attackBtn.addEventListener("click", async () => {
        if (_busy) return;
        await attack();
      });
    }
  }

  function render(data) {
  _state = data || {};
  stopBattlePlayback(true);
  const body = bodyEl();
  if (!body) return;

  const currentWave = Number(_state.currentWave || 1);
  const maxWave = Number(_state.maxWave || 1);

  const waveHp = Math.max(0, Number(_state.waveHp || 0));
  const waveHpMaxRaw = Number(_state.waveHpMax || 1);
  const waveHpMax = waveHpMaxRaw > 0 ? waveHpMaxRaw : 1;

  // HP bara przeciwnika nie licz z progressPct, tylko z realnego HP
  const waveRemainingPct = pct((waveHp / waveHpMax) * 100);
  const waveClearedPct = pct(((waveHpMax - waveHp) / waveHpMax) * 100);

  const cta = _state.cta || {};
  const my = _state.myContribution || {};
  const lastBattle = getLastBattle();
  const attemptsLeft = Number(my.attemptsLeft || 0);
  const cooldownLeftSec = Number(my.cooldownLeftSec || 0);

  const sortedFactions = [...(_state.factionStandings || [])].sort(
    (a, b) => Number(b?.score || 0) - Number(a?.score || 0)
  );
  const topScore = Number(sortedFactions[0]?.score || 0);
  const secondScore = Number(sortedFactions[1]?.score || 0);
  const dominancePct =
    (topScore > 0 || secondScore > 0)
      ? Math.round((topScore / Math.max(1, topScore + secondScore)) * 100)
      : 0;

  body.innerHTML = `
    <div class="bm-card bm-card-hero" style="z-index:2">
      <div class="bm-hero-intensity">
        BLOOD MOON INTENSITY • WAVE ${fmtNum(currentWave)} / ${fmtNum(maxWave)}
      </div>

      <div class="bm-label" style="margin-bottom:6px">THE BEAST • CURRENT WAVE</div>
      <div class="bm-boss-bar">
        <div class="bm-boss-fill" style="width:${waveRemainingPct}%"></div>
      </div>
      <div class="bm-wave-line">
        <span>HP ${fmtNum(waveHp)} / ${fmtNum(waveHpMax)}</span>
        <span style="color:#ff5e70">${waveClearedPct}% • TEAR IT APART</span>
      </div>

      <div style="margin-top:18px">
        <button id="bloodMoonAttackBtn" class="bm-cta" type="button" ${cta.enabled ? "" : "disabled"}>
          ${esc(cta.label || "RIP THROUGH THE VEIL")}
        </button>
      </div>

      <div class="bm-meta-row">
        <div class="bm-meta-pill">
          <div class="bm-label">Status</div>
          <div class="bm-value">${esc(_state.status || "UNKNOWN")}</div>
        </div>
        <div class="bm-meta-pill">
          <div class="bm-label">My Faction</div>
          <div class="bm-value">${esc(factionLabel(_state.myFaction))}</div>
        </div>
        <div class="bm-meta-pill">
          <div class="bm-label">Cooldown</div>
          <div class="bm-value">${cooldownLeftSec > 0 ? esc(fmtSec(cooldownLeftSec)) : "Ready"}</div>
        </div>
      </div>
    </div>

    ${renderBattlePanel(lastBattle)}

    <div class="bm-card">
      <div class="bm-label">FACTION WAR • LIVE RACE</div>
      ${renderRace(sortedFactions, dominancePct)}
    </div>

    <div class="bm-card">
      <div class="bm-label">YOUR CARNAGE</div>
      <div class="bm-mini-grid">
        <div class="bm-stat">
          <div class="bm-label">Total Damage</div>
          <div class="bm-value">${fmtNum(my.totalDamage)}</div>
        </div>
        <div class="bm-stat">
          <div class="bm-label">Best Hit</div>
          <div class="bm-value">${fmtNum(my.bestHit)}</div>
        </div>
        <div class="bm-stat">
          <div class="bm-label">Attempts</div>
          <div class="bm-value">${fmtNum(attemptsLeft)} / ${fmtNum(my.dailyCap)}</div>
        </div>
        <div class="bm-stat">
          <div class="bm-label">Cooldown</div>
          <div class="bm-value">${cooldownLeftSec > 0 ? esc(fmtSec(cooldownLeftSec)) : "READY TO KILL"}</div>
        </div>
      </div>
    </div>

    <div class="bm-card">
      <div class="bm-label">Faction Standings</div>
      ${renderFactionStandings(_state.factionStandings)}
    </div>

    <div class="bm-card">
      <div class="bm-label">CLAIMABLE BLOOD REWARDS</div>
      ${renderClaimables(my.claimableRewardDetails || my.claimableRewards)}
    </div>

    <div class="bm-card">
      <div class="bm-label">TOP SLAUGHTERERS</div>
      ${renderTopPlayers(_state.topPlayers)}
    </div>

    <div class="bm-card">
      <div class="bm-label">LIVE CARNAGE FEED</div>
      ${renderFeed(_state.recentFeed)}
    </div>
  `;

  bindActions();
  if (lastBattle) {
    const kick = () => playLastBattlePixi(lastBattle, { animate: false });
    if (window.requestAnimationFrame) window.requestAnimationFrame(kick);
    else void kick();
  }
  }

  async function loadState() {
    setBusy(true);
    try {
      const res = await call("/webapp/bloodmoon/state", {});
      if (!res || res.ok !== true || !res.data) {
        throw new Error((res && res.reason) || "BAD_STATE_RESPONSE");
      }
      render(res.data);
      return res.data;
    } catch (e) {
      dbg("loadState error", e);
      const body = bodyEl();
      if (body) {
        body.innerHTML = `<div class="bm-empty">Blood-Moon Tower failed to load.<br>${esc(e?.message || e)}</div>`;
      }
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function attack() {
    setBusy(true);
    try {
      const res = await call("/webapp/bloodmoon/attack", {
        run_id: runId("bm_attack"),
      });

      if (!res || res.ok !== true) {
        const nextData = res?.data;
        if (nextData) render(nextData);
        throw new Error((res && res.reason) || "ATTACK_FAILED");
      }

      if (res.data) render(res.data);
      if (res?.result?.battle && !res?.duplicate) {
        const kick = () => playLastBattle({ battle: res.result.battle, haptic: true });
        if (window.requestAnimationFrame) window.requestAnimationFrame(kick);
        else kick();
      }
      return res;
    } catch (e) {
      dbg("attack error", e);
      alert(`Blood-Moon attack failed: ${e?.message || e}`);
      throw e;
    } finally {
      setBusy(false);
    }
  }

  async function claim(rewardKey) {
    setBusy(true);
    try {
      const res = await call("/webapp/bloodmoon/claim", {
        reward_key: rewardKey,
        run_id: runId("bm_claim"),
      });

      if (!res || res.ok !== true) {
        const nextData = res?.data;
        if (nextData) render(nextData);
        throw new Error((res && res.reason) || "CLAIM_FAILED");
      }

      const granted = res?.result?.granted || [];
      const reward = res?.result?.reward || {};
      const label = rewardLabel(res?.result?.rewardKey || rewardKey);
      const summary = fmtGrantList(granted.length ? granted : (reward?.grants || []));

      if (res.data) render(res.data);

      notify(summary ? `${label} claimed: ${summary}` : `${label} claimed.`);
      return res;
    } catch (e) {
      dbg("claim error", e);
      alert(`Claim failed: ${e?.message || e}`);
      throw e;
    } finally {
      setBusy(false);
    }
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost || null;
    _tg = tg || _tg || null;
    _dbg = !!dbg;
    ensureMounted();
    return BloodMoon;
  }

  async function open() {
    ensureMounted();
    show();
    return await loadState();
  }

  BloodMoon.init = init;
  BloodMoon.open = open;
  BloodMoon.close = close;
  BloodMoon.loadState = loadState;
  BloodMoon.getLastBattle = getLastBattle;
  BloodMoon.replayLastBattle = playLastBattle;
  BloodMoon.attack = attack;
  BloodMoon.claim = claim;

  window.BloodMoon = BloodMoon;
})();
