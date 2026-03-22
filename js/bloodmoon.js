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
  background:rgba(5,8,14,.72);
  backdrop-filter: blur(8px);
}
#${ROOT_ID}.show{ display:flex; }

#bloodMoonModal{
  width:min(100%, 720px);
  height:min(92vh, 920px);
  background:
    radial-gradient(circle at top, rgba(133,31,44,.18), transparent 28%),
    linear-gradient(180deg, rgba(20,22,28,.98), rgba(11,13,18,.98));
  border:1px solid rgba(255,255,255,.09);
  border-radius:22px 22px 0 0;
  box-shadow:0 -12px 40px rgba(0,0,0,.45);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  color:#f4f0f2;
  font-family:inherit;
}

#bloodMoonHead{
  padding:16px 16px 12px;
  border-bottom:1px solid rgba(255,255,255,.07);
  background:linear-gradient(180deg, rgba(93,18,31,.24), rgba(0,0,0,0));
}

#bloodMoonTopRow{
  display:flex; align-items:center; justify-content:space-between; gap:10px;
}

#bloodMoonTitle{
  font-weight:900; font-size:18px; letter-spacing:.4px;
}

#bloodMoonSub{
  margin-top:6px; color:rgba(255,255,255,.72); font-size:12px;
}

#bloodMoonClose{
  border:0; outline:0; cursor:pointer;
  width:36px; height:36px; border-radius:12px;
  background:rgba(255,255,255,.08); color:#fff; font-size:18px; font-weight:800;
}

#bloodMoonBody{
  flex:1; overflow-y:auto; overscroll-behavior:contain;
  padding:14px;
  padding-bottom:max(18px, env(safe-area-inset-bottom));
}

.bm-card{
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.07);
  border-radius:18px;
  padding:14px;
  margin-bottom:12px;
  box-shadow:0 6px 20px rgba(0,0,0,.18);
}

.bm-row{ display:flex; gap:10px; }
.bm-col{ flex:1; min-width:0; }

.bm-label{
  font-size:11px; letter-spacing:.45px; text-transform:uppercase;
  color:rgba(255,255,255,.58);
  margin-bottom:6px;
}
.bm-value{
  font-size:16px; font-weight:800; color:#fff;
}

.bm-progress-wrap{
  margin-top:10px;
}
.bm-progress{
  height:12px; border-radius:999px; overflow:hidden;
  background:rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.06);
}
.bm-progress > i{
  display:block; height:100%;
  width:0%;
  background:linear-gradient(90deg, #7f1022, #d13a4d, #ff7b92);
  box-shadow:0 0 16px rgba(219,77,104,.45);
}

.bm-wave-line{
  display:flex; justify-content:space-between; gap:8px;
  margin-top:8px; font-size:12px; color:rgba(255,255,255,.78);
}

.bm-cta{
  width:100%;
  border:0; outline:0; cursor:pointer;
  padding:14px 16px; border-radius:16px;
  font-weight:900; font-size:15px;
  color:#fff;
  background:linear-gradient(180deg, #a51d31, #7c1526);
  box-shadow:0 8px 24px rgba(165,29,49,.35);
}
.bm-cta[disabled]{
  cursor:not-allowed; opacity:.55; box-shadow:none;
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
}

.bm-list{ display:flex; flex-direction:column; gap:8px; }

.bm-standing, .bm-feed, .bm-reward{
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05);
  border-radius:14px;
  padding:10px 12px;
}

.bm-standing-left, .bm-feed-left{
  min-width:0;
}
.bm-standing-name, .bm-feed-text{
  font-weight:700; color:#fff;
}
.bm-standing-sub, .bm-feed-sub{
  font-size:12px; color:rgba(255,255,255,.62);
  margin-top:2px;
}

.bm-chip{
  display:inline-flex; align-items:center; justify-content:center;
  min-width:34px; padding:6px 10px; border-radius:999px;
  font-size:12px; font-weight:800;
  background:rgba(255,255,255,.09);
  color:#fff;
}

.bm-top{
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.05);
  border-radius:14px;
  padding:10px 12px;
}
.bm-top + .bm-top{ margin-top:8px; }

.bm-claim-btn{
  border:0; outline:0; cursor:pointer;
  padding:9px 12px; border-radius:12px;
  font-weight:800; color:#fff;
  background:linear-gradient(180deg, #5f1320, #8f1c2f);
}

#bloodMoonLoader{
  display:none;
  position:absolute; inset:0;
  background:rgba(8,10,16,.42);
  backdrop-filter: blur(4px);
  align-items:center; justify-content:center;
  z-index:3;
}
#bloodMoonLoader.show{ display:flex; }
#bloodMoonLoader > div{
  padding:10px 14px; border-radius:14px;
  background:rgba(0,0,0,.44);
  border:1px solid rgba(255,255,255,.08);
  font-weight:800;
}

.bm-empty{
  padding:16px; text-align:center;
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
    const wavePct = pct(_state.waveProgressPct);
    const cta = _state.cta || {};
    const my = _state.myContribution || {};
    const attemptsLeft = Number(my.attemptsLeft || 0);
    const cooldownLeftSec = Number(my.cooldownLeftSec || 0);

    body.innerHTML = `
      <div class="bm-card">
        <div class="bm-row">
          <div class="bm-col">
            <div class="bm-label">Current Wave</div>
            <div class="bm-value">${fmtNum(currentWave)} / ${fmtNum(maxWave)}</div>
          </div>
          <div class="bm-col">
            <div class="bm-label">Status</div>
            <div class="bm-value">${esc(_state.status || "UNKNOWN")}</div>
          </div>
          <div class="bm-col">
            <div class="bm-label">Faction</div>
            <div class="bm-value">${esc(factionLabel(_state.myFaction))}</div>
          </div>
        </div>

        <div class="bm-progress-wrap">
          <div class="bm-progress"><i style="width:${wavePct}%"></i></div>
          <div class="bm-wave-line">
            <span>Wave HP ${fmtNum(waveHp)} / ${fmtNum(waveHpMax)}</span>
            <span>${wavePct}% cleared</span>
          </div>
        </div>

        <div style="margin-top:14px;">
          <button id="bloodMoonAttackBtn" class="bm-cta" type="button" ${cta.enabled ? "" : "disabled"}>
            ${esc(cta.label || "Strike the Wave")}
          </button>
        </div>
      </div>

      <div class="bm-card">
        <div class="bm-label">My Contribution</div>
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
            <div class="bm-label">Attempts Left</div>
            <div class="bm-value">${fmtNum(attemptsLeft)} / ${fmtNum(my.dailyCap)}</div>
          </div>
          <div class="bm-stat">
            <div class="bm-label">Cooldown</div>
            <div class="bm-value">${cooldownLeftSec > 0 ? esc(fmtSec(cooldownLeftSec)) : "Ready"}</div>
          </div>
        </div>
      </div>

      <div class="bm-card">
        <div class="bm-label">Faction Standings</div>
        ${renderFactionStandings(_state.factionStandings)}
      </div>

      <div class="bm-card">
        <div class="bm-label">Claimable Rewards</div>
        ${renderClaimables(my.claimableRewards)}
      </div>

      <div class="bm-card">
        <div class="bm-label">Top Contributors</div>
        ${renderTopPlayers(_state.topPlayers)}
      </div>

      <div class="bm-card">
        <div class="bm-label">Recent Activity</div>
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
