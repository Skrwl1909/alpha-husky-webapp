// js/stats.js — Stats modal (WebApp)
// Layout polish version: cleaner hero panel, stat cards, gear summary, active sets
// Source of truth stays on backend: /webapp/stats/state + /webapp/mystats/state
(function () {
  const Stats = {};
  let _apiPost = null, _tg = null, _dbg = false;
  let _loading = false;
  let _inited = false;

  function qs(id){ return document.getElementById(id); }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[m]));
  }

  function n(v, d = 0){
    const x = Number(v);
    return Number.isFinite(x) ? x : d;
  }

  function pct(cur, max){
    const c = n(cur, 0);
    const m = n(max, 0);
    if (m <= 0) return 0;
    return Math.max(0, Math.min(100, (c / m) * 100));
  }

  function statLabel(k){
    const map = {
      strength: "STR",
      agility: "AGI",
      defense: "DEF",
      vitality: "VIT",
      intelligence: "INT",
      luck: "LUCK"
    };
    return map[k] || String(k || "").toUpperCase();
  }

  function statFullName(k){
    const map = {
      strength: "Strength",
      agility: "Agility",
      defense: "Defense",
      vitality: "Vitality",
      intelligence: "Intelligence",
      luck: "Luck"
    };
    return map[k] || String(k || "");
  }

  function show(){
    const b = qs("statsBack");
    if (!b) return;
    if ("hidden" in b) b.hidden = false;
    b.style.display = "flex";
    b.dataset.open = "1";
  }

  function hide(){
    const b = qs("statsBack");
    if (!b) return;
    if ("hidden" in b) b.hidden = true;
    b.style.display = "none";
    delete b.dataset.open;
  }

  function bindClickOnce(el, fn){
    if (!el) return;
    if (el.dataset.statsBound === "1") return;
    el.addEventListener("click", fn);
    el.dataset.statsBound = "1";
  }

  function normalizeSet(s){
    if (Array.isArray(s)) {
      return {
        name: s[0] ?? "Set",
        count: n(s[1], 0),
        bonus: (s[2] && typeof s[2] === "object") ? s[2] : {},
        totalParts: n(s[3], 0)
      };
    }
    if (s && typeof s === "object") {
      return {
        name: s.name ?? "Set",
        count: n(s.count, 0),
        bonus: (s.bonus && typeof s.bonus === "object") ? s.bonus : {},
        totalParts: n(s.totalParts, 0)
      };
    }
    return {
      name: "Set",
      count: 0,
      bonus: {},
      totalParts: 0
    };
  }

  function getPayload(res){
    if (!res || typeof res !== "object") return null;
    if (res.ok === true && res.data && typeof res.data === "object") return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    return null;
  }

  function ensureStyles(){
    if (document.getElementById("ah-stats-styles")) return;

    const style = document.createElement("style");
    style.id = "ah-stats-styles";
    style.textContent = `
      #statsRoot { color: #e9edf6; }

      .ahs-wrap{
        display:flex;
        flex-direction:column;
        gap:12px;
        padding:2px 2px 8px;
      }

      .ahs-card{
        position:relative;
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        background:
          linear-gradient(180deg, rgba(17,20,28,.96), rgba(10,12,18,.94));
        box-shadow:
          0 8px 24px rgba(0,0,0,.24),
          inset 0 1px 0 rgba(255,255,255,.04);
        overflow:hidden;
      }

      .ahs-card::before{
        content:"";
        position:absolute;
        inset:0 0 auto 0;
        height:1px;
        background:linear-gradient(90deg, transparent, rgba(120,180,255,.25), transparent);
        pointer-events:none;
      }

      .ahs-pad{ padding:14px; }
      .ahs-section-title{
        font-size:13px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:#9fb6d9;
        margin-bottom:10px;
      }

      .ahs-hero-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      }

      .ahs-title{
        display:flex;
        flex-direction:column;
        gap:4px;
      }

      .ahs-title-main{
        font-size:16px;
        font-weight:900;
        line-height:1.1;
        color:#f3f7ff;
      }

      .ahs-title-sub{
        font-size:12px;
        color:rgba(220,230,255,.62);
      }

      .ahs-badges{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .ahs-badge{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
        color:#eaf1ff;
      }

      .ahs-badge.-level{
        background:linear-gradient(180deg, rgba(55,95,160,.34), rgba(30,54,92,.28));
        border-color:rgba(120,170,255,.28);
      }

      .ahs-badge.-unspent{
        background:linear-gradient(180deg, rgba(130,92,24,.42), rgba(78,53,12,.34));
        border-color:rgba(255,200,100,.28);
        color:#ffe8b8;
      }

      .ahs-grid-3{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }

      .ahs-mini{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:rgba(255,255,255,.03);
        padding:10px 10px 9px;
      }

      .ahs-mini-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:6px;
      }

      .ahs-mini-label{
        font-size:12px;
        font-weight:800;
        color:#c7d7f2;
      }

      .ahs-mini-value{
        font-size:12px;
        font-weight:800;
        color:#f4f7ff;
      }

      .ahs-bar{
        position:relative;
        height:9px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.06);
        box-shadow: inset 0 1px 2px rgba(0,0,0,.35);
      }

      .ahs-bar-fill{
        position:absolute;
        inset:0 auto 0 0;
        border-radius:999px;
      }

      .ahs-bar-fill.-hp{
        background:linear-gradient(90deg, #8f3036, #e45d67);
      }

      .ahs-bar-fill.-xp{
        background:linear-gradient(90deg, #2d578f, #59a1ff);
      }

      .ahs-bar-fill.-pet{
        background:linear-gradient(90deg, #5a3a8f, #a774ff);
      }

      .ahs-mini-foot{
        margin-top:6px;
        font-size:11px;
        color:rgba(228,235,248,.58);
        display:flex;
        justify-content:flex-end;
      }

      .ahs-stats-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      }

      .ahs-stat{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.02));
        padding:11px 11px 10px;
      }

      .ahs-stat-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
        margin-bottom:8px;
      }

      .ahs-stat-right{
        display:flex;
        align-items:flex-start;
        gap:8px;
      }

      .ahs-plus{
        width:28px;
        height:28px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.10);
        background:linear-gradient(180deg, rgba(120,170,255,.18), rgba(70,110,180,.14));
        color:#eef4ff;
        font-size:18px;
        font-weight:900;
        line-height:1;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
      }

      .ahs-plus:disabled{
        opacity:.38;
        cursor:default;
      }

      .ahs-stat-code{
        font-size:12px;
        font-weight:900;
        letter-spacing:.06em;
        color:#eef4ff;
      }

      .ahs-stat-name{
        font-size:11px;
        color:rgba(220,230,255,.56);
        margin-top:2px;
      }

      .ahs-stat-total{
        font-size:22px;
        font-weight:900;
        line-height:1;
        color:#f7fbff;
      }

      .ahs-stat-break{
        display:grid;
        grid-template-columns:repeat(3, 1fr);
        gap:6px;
      }

      .ahs-chip{
        border-radius:10px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.035);
        padding:6px 6px 5px;
        text-align:center;
      }

      .ahs-chip-label{
        display:block;
        font-size:10px;
        text-transform:uppercase;
        letter-spacing:.06em;
        color:rgba(215,225,245,.48);
        margin-bottom:3px;
      }

      .ahs-chip-value{
        display:block;
        font-size:12px;
        font-weight:800;
        color:#eaf2ff;
      }

      .ahs-list{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      .ahs-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:10px 12px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:12px;
        background:rgba(255,255,255,.03);
      }

      .ahs-row-left{
        display:flex;
        flex-direction:column;
        gap:2px;
      }

      .ahs-row-title{
        font-size:13px;
        font-weight:800;
        color:#edf4ff;
      }

      .ahs-row-sub{
        font-size:11px;
        color:rgba(220,230,255,.5);
      }

      .ahs-row-value{
        font-size:14px;
        font-weight:900;
        color:#f4f7ff;
      }

      .ahs-sets{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .ahs-set{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:rgba(255,255,255,.03);
        padding:12px;
      }

      .ahs-set-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:8px;
      }

      .ahs-set-name{
        font-size:13px;
        font-weight:900;
        color:#f0f5ff;
      }

      .ahs-set-count{
        font-size:11px;
        font-weight:800;
        color:#a8bddf;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        border-radius:999px;
        padding:4px 8px;
      }

      .ahs-set-bonuses{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
      }

      .ahs-pill{
        display:inline-flex;
        align-items:center;
        gap:6px;
        min-height:28px;
        padding:0 9px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#e9f1ff;
        font-size:12px;
        font-weight:800;
      }

      .ahs-empty{
        font-size:12px;
        color:rgba(220,230,255,.52);
        padding:2px 0;
      }

      .ahs-note{
        margin-top:10px;
        font-size:11px;
        color:rgba(255,235,190,.72);
      }

      .ahs-error{
        padding:14px;
      }

      @media (min-width: 430px){
        .ahs-grid-3{
          grid-template-columns:repeat(3, 1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderError(msg){
    ensureStyles();
    const root = qs("statsRoot");
    if (!root) return;
    root.innerHTML = `
      <div class="ahs-wrap">
        <div class="ahs-card">
          <div class="ahs-error">
            <div class="ahs-section-title">Stats</div>
            <div class="ahs-empty">${esc(msg || "Failed to load stats.")}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderBarBlock(label, cur, max, cls, percent, foot){
    return `
      <div class="ahs-mini">
        <div class="ahs-mini-top">
          <div class="ahs-mini-label">${esc(label)}</div>
          <div class="ahs-mini-value">${esc(cur)} / ${esc(max)}</div>
        </div>
        <div class="ahs-bar">
          <div class="ahs-bar-fill ${cls}" style="width:${percent.toFixed(1)}%"></div>
        </div>
        <div class="ahs-mini-foot">${foot}</div>
      </div>
    `;
  }

  function render(stats, mystats){
    ensureStyles();

    const root = qs("statsRoot");
    if (!root) return;

    const t = (stats && typeof stats.totals === "object") ? stats.totals : {};
    const base = (stats && typeof stats.base === "object") ? stats.base : {};
    const petS = (stats && typeof stats.petStats === "object") ? stats.petStats : {};
    const gear = (stats && typeof stats.gear === "object") ? stats.gear : {};
    const pet = (stats && typeof stats.pet === "object") ? stats.pet : {};
    const rawSets = Array.isArray(stats?.sets) ? stats.sets : [];
    const sets = rawSets.map(normalizeSet);
    const unspent = mystats && mystats.unspentPoints != null ? n(mystats.unspentPoints, 0) : 0;

    const hpCur = n(stats?.hpCur, 0);
    const hpMax = n(stats?.hpMax, 0);
    const xpCur = n(stats?.xpCur, 0);
    const xpNeed = n(stats?.xpNeed, 0);
    const level = n(stats?.level, 1);

    const petName = String(pet?.name || "None");
    const petLevel = n(pet?.level, 0);
    const petXpCur = n(pet?.xpCur, 0);
    const petXpNeed = n(pet?.xpNeed, 0);

    const hpPct = pct(hpCur, hpMax);
    const xpPct = pct(xpCur, xpNeed);
    const petXpPct = pct(petXpCur, petXpNeed);

    const statKeys = ["strength","agility","defense","vitality","intelligence","luck"];

    const canSpend = unspent > 0;

    const statCards = statKeys.map((k) => {
      const total = n(t[k], 0);
      const b = n(base[k], 0);
      const p = n(petS[k], 0);
      const g = n(gear[k], 0);

      return `
        <div class="ahs-stat" data-stat-key="${esc(k)}">
          <div class="ahs-stat-head">
            <div>
              <div class="ahs-stat-code">${esc(statLabel(k))}</div>
              <div class="ahs-stat-name">${esc(statFullName(k))}</div>
            </div>

            <div class="ahs-stat-right">
              <div class="ahs-stat-total">${esc(total)}</div>
              <button
                type="button"
                class="ahs-plus"
                data-stat="${esc(k)}"
                ${canSpend ? "" : "disabled"}
                title="${canSpend ? `Add 1 ${statFullName(k)}` : "No unspent points"}"
              >+</button>
            </div>
          </div>

          <div class="ahs-stat-break">
            <div class="ahs-chip">
              <span class="ahs-chip-label">Base</span>
              <span class="ahs-chip-value">${esc(b)}</span>
            </div>
            <div class="ahs-chip">
              <span class="ahs-chip-label">Pet</span>
              <span class="ahs-chip-value">${esc(p)}</span>
            </div>
            <div class="ahs-chip">
              <span class="ahs-chip-label">Gear</span>
              <span class="ahs-chip-value">${esc(g)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const gearRows = statKeys
      .map((k) => ({ key:k, val:n(gear[k], 0) }))
      .filter((x) => x.val !== 0)
      .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
      .map((x) => `
        <div class="ahs-row">
          <div class="ahs-row-left">
            <div class="ahs-row-title">${esc(statLabel(x.key))}</div>
            <div class="ahs-row-sub">${esc(statFullName(x.key))}</div>
          </div>
          <div class="ahs-row-value">+${esc(x.val)}</div>
        </div>
      `)
      .join("");

    const gearHtml = gearRows
      ? `
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Equipment Bonuses</div>
            <div class="ahs-list">${gearRows}</div>
          </div>
        </div>
      `
      : "";

    const setsHtml = sets.length
      ? `
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Active Sets</div>
            <div class="ahs-sets">
              ${sets.map((s) => {
                const bonus = s.bonus || {};
                const bonusLines = Object.keys(bonus)
                  .filter((k) => n(bonus[k], 0) !== 0)
                  .map((k) => `<span class="ahs-pill">${esc(statLabel(k))} +${esc(n(bonus[k], 0))}</span>`)
                  .join("");

                const progress = s.totalParts > 0
                  ? `${n(s.count, 0)}/${n(s.totalParts, 0)}`
                  : `${n(s.count, 0)}`;

                return `
                  <div class="ahs-set">
                    <div class="ahs-set-head">
                      <div class="ahs-set-name">${esc(s.name)}</div>
                      <div class="ahs-set-count">${esc(progress)}</div>
                    </div>
                    <div class="ahs-set-bonuses">
                      ${bonusLines || `<div class="ahs-empty">No active bonus</div>`}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `
      : "";

    const petFooter = petName !== "None"
      ? `lvl ${esc(petLevel)} • ${petXpPct.toFixed(0)}%`
      : `No active pet`;

    root.innerHTML = `
      <div class="ahs-wrap">
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-hero-top">
              <div class="ahs-title">
                <div class="ahs-title-main">Character Stats</div>
                <div class="ahs-title-sub">Live totals from backend</div>
              </div>

              <div class="ahs-badges">
                <div class="ahs-badge -level">Lvl ${esc(level)}</div>
                <div class="ahs-badge -unspent">Unspent ${esc(unspent)}</div>
              </div>
            </div>

            <div class="ahs-grid-3">
              ${renderBarBlock("HP", hpCur, hpMax, "-hp", hpPct, `${hpPct.toFixed(0)}%`)}
              ${renderBarBlock("XP", xpCur, xpNeed, "-xp", xpPct, `${xpPct.toFixed(0)}%`)}
              ${renderBarBlock("Pet", petXpCur, petXpNeed, "-pet", petXpPct, `${esc(petName)} ${esc(petName !== "None" ? `• lvl ${petLevel}` : "")}`.trim())}
            </div>

            ${unspent > 0 ? `<div class="ahs-note">${esc(unspent)} stat point${unspent === 1 ? "" : "s"} ready to spend.</div>` : ``}
          </div>
        </div>

        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Attributes</div>
            <div class="ahs-stats-grid">
              ${statCards}
            </div>
          </div>
        </div>

        ${gearHtml}
        ${setsHtml}
      </div>
    `;
  }

  async function load(){
    if (_loading) return;
    _loading = true;

    ensureStyles();

    const root = qs("statsRoot");
    if (root) {
      root.innerHTML = `
        <div class="ahs-wrap">
          <div class="ahs-card">
            <div class="ahs-pad">
              <div class="ahs-section-title">Stats</div>
              <div class="ahs-empty">Loading…</div>
            </div>
          </div>
        </div>
      `;
    }

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_apiPost && typeof window.S?.apiPost === "function") _apiPost = window.S.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      renderError("Stats: api not ready.");
      _loading = false;
      return;
    }

    try {
      const statsRes = await _apiPost("/webapp/stats/state", { t: Date.now() });
      const myRes = await _apiPost("/webapp/mystats/state", { t: Date.now() }).catch(() => null);

      if (_dbg) {
        console.log("[Stats] statsRes =", statsRes);
        console.log("[Stats] myRes =", myRes);
      }

      const stats = getPayload(statsRes);
      const mystats = getPayload(myRes);

      if (!stats) {
        const reason = statsRes?.reason || "No data.";
        if (reason === "HTTP_401") {
          renderError("Unauthorized. Reopen the app from Telegram.");
        } else {
          renderError(reason);
        }
        return;
      }

      render(stats, mystats);
      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
    } catch (e) {
      if (_dbg) console.error("[Stats] load failed", e);
      renderError("Failed to load stats.");
      try { _tg?.showAlert?.("Stats load failed"); } catch (_) {}
    } finally {
      _loading = false;
    }
  }

  Stats.refresh = load;
  Stats.open = function(){ show(); load(); };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg } = {}){
    ensureStyles();

    _apiPost = apiPost || _apiPost || window.apiPost || window.S?.apiPost || null;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    if (_inited) return;
    _inited = true;

    bindClickOnce(qs("btnStatsRefresh"), load);
    bindClickOnce(qs("refreshStats"), load);
    bindClickOnce(qs("closeStats"), Stats.close);

    window.openStats = Stats.open;
    window.closeStats = Stats.close;
  };

  window.Stats = Stats;
})();
