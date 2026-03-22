(function () {
  const BloodMoon = {};

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _busy = false;
  let _state = null;
  let _mounted = false;

  const ROOT_ID = "bloodMoonBack";
  const STYLE_ID = "bloodMoonStyles";

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
    rootEl()?.classList.remove("show");
    document.documentElement.classList.remove("ah-bloodmoon-open");
    document.body.style.overflow = "";
  }

  async function call(path, payload) {
    const fn = getApiPost();
    if (!fn) throw new Error("apiPost missing");
    return await fn(path, payload || {});
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
        ${claimable.map((key) => `
          <div class="bm-reward">
            <div>
              <div class="bm-standing-name">${esc(String(key).replaceAll("_", " ").toUpperCase())}</div>
              <div class="bm-standing-sub">Wave milestone reward ready to claim</div>
            </div>
            <button class="bm-claim-btn" data-bm-claim="${esc(key)}" type="button">Claim</button>
          </div>
        `).join("")}
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
    const body = bodyEl();
    if (!body) return;

    const currentWave = Number(_state.currentWave || 1);
    const maxWave = Number(_state.maxWave || 1);
    const waveHp = Number(_state.waveHp || 0);
    const waveHpMax = Number(_state.waveHpMax || 1);
    const wavePct = pct(_state.waveProgressPct || 0);

    const cta = _state.cta || {};
    const my = _state.myContribution || {};
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
          <div class="bm-boss-fill" style="width:${wavePct}%"></div>
        </div>
        <div class="bm-wave-line">
          <span>HP ${fmtNum(waveHp)} / ${fmtNum(waveHpMax)}</span>
          <span style="color:#ff5e70">${wavePct}% • TEAR IT APART</span>
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
        ${renderClaimables(my.claimableRewards)}
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
        throw new Error((res && res.reason) || "ATTACK_FAILED");
      }

      if (res.data) render(res.data);
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
        throw new Error((res && res.reason) || "CLAIM_FAILED");
      }

      if (res.data) render(res.data);
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
  BloodMoon.attack = attack;
  BloodMoon.claim = claim;

  window.BloodMoon = BloodMoon;
})();
