// js/stats.js — Stats modal (WebApp) using /webapp/stats/state + /webapp/mystats/state
// ✅ Premium upgrade: real progress bars (HP/XP/Pet XP) + safer apiPost fallback + refresh helper
(function () {
  const Stats = {};
  let _apiPost = null, _tg = null, _dbg = false;

  function qs(id){ return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  // NOTE: w Twoim flow otwieranie/zamykanie robi home_nav.js (display:flex/none),
  // ale zostawiamy te helpery jako kompatybilne API.
  function show(){
    const b = qs("statsBack");
    if (!b) return;
    // obsłuż oba warianty: hidden albo display:none
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

  function statLabel(k){
    const map = {
      strength:"STR", agility:"AGI", defense:"DEF",
      vitality:"VIT", intelligence:"INT", luck:"LUCK"
    };
    return map[k] || k;
  }

  function pct(cur, max){
    const c = Number(cur || 0);
    const m = Number(max || 0);
    if (!isFinite(c) || !isFinite(m) || m <= 0) return 0;
    return Math.max(0, Math.min(100, (c / m) * 100));
  }

  function render(stats, mystats){
    const root = qs("statsRoot");
    if (!root) return;

    const t = stats?.totals || {};
    const base = stats?.base || {};
    const petS = stats?.petStats || {};
    const gear = stats?.gear || {};
    const pet = stats?.pet || {};
    const sets = stats?.sets || [];
    const unspent = (mystats && mystats.unspentPoints) ?? null;

    const hpPct = pct(stats?.hpCur, stats?.hpMax);
    const xpPct = pct(stats?.xpCur, stats?.xpNeed);
    const petXpPct = pct(pet?.xpCur, pet?.xpNeed);

    const rows = ["strength","agility","defense","vitality","intelligence","luck"].map((k)=>{
      const total = Number(t[k]||0);
      const b = Number(base[k]||0), p = Number(petS[k]||0), g = Number(gear[k]||0);
      return `
        <div class="srow">
          <span>${esc(statLabel(k))}</span>
          <b>${esc(total)}</b>
          <em>${esc(`${b}+${p}+${g}`)}</em>
        </div>`;
    }).join("");

    const setsHtml = sets.length
      ? sets.map(s=>{
          const bonus = s.bonus || {};
          const bonusLines = Object.keys(bonus).filter(k=>Number(bonus[k]||0)).map(k=>{
            return `<div class="miniRow"><span>${esc(statLabel(k))}</span><b>+${esc(bonus[k])}</b></div>`;
          }).join("");
          return `
            <div class="card">
              <div class="h">${esc(s.name)} <span class="muted">(${esc(s.count)}/${esc(s.totalParts)})</span></div>
              ${bonusLines || `<div class="muted">No bonus data</div>`}
            </div>`;
        }).join("")
      : "";

    root.innerHTML = `
  <div class="card">
    <div class="row">
      <div class="k">Level</div>
      <div class="v">${esc(stats.level)}</div>
    </div>

    <div class="row">
      <div class="k">Source</div>
      <div class="v">${esc(stats._src || stats._source || stats.src || "")}</div>
    </div>

        <div class="row">
          <div class="k">HP</div>
          <div class="v">
            <div class="vline">
              <span>${esc(stats.hpCur)} / ${esc(stats.hpMax)}</span>
              <div class="pbar" aria-label="HP"><div class="pfill" style="width:${hpPct.toFixed(1)}%"></div></div>
              <span class="ppct">${hpPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="k">XP</div>
          <div class="v">
            <div class="vline">
              <span>${esc(stats.xpCur)} / ${esc(stats.xpNeed)}</span>
              <div class="pbar" aria-label="XP"><div class="pfill" style="width:${xpPct.toFixed(1)}%"></div></div>
              <span class="ppct">${xpPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="k">Pet</div>
          <div class="v">
            <div class="vline">
              <span>${esc(pet.name||"None")} <span class="muted">lvl ${esc(pet.level||0)}</span></span>
              <div class="pbar" aria-label="Pet XP"><div class="pfill" style="width:${petXpPct.toFixed(1)}%"></div></div>
              <span class="ppct">${petXpPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        ${unspent !== null
          ? `<div class="row"><div class="k">Unspent</div><div class="v"><b>${esc(unspent)}</b></div></div>`
          : ``}
      </div>

      <div class="card">
        <div class="h">Totals</div>
        <div class="grid">${rows}</div>
        <div class="muted tiny">format: total (base + pet + gear)</div>
      </div>

      ${setsHtml}
    `;
  }

  async function load(){
    const root = qs("statsRoot");
    if (root) root.innerHTML = `<div class="muted">Loading…</div>`;

    // ✅ fallback jeśli init jeszcze nie podał apiPost
    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      if (root) root.innerHTML = `<div class="muted">Stats: api not ready.</div>`;
      return;
    }

    let statsRes = null, myRes = null;

    try {
      statsRes = await _apiPost("/webapp/stats/state", { t: Date.now() });
    } catch (e) {
      if (root) root.innerHTML = `<div class="muted">Failed to load stats.</div>`;
      try { _tg?.showAlert?.("Stats load failed"); } catch(_) {}
      return;
    }

    try {
      myRes = await _apiPost("/webapp/mystats/state", { t: Date.now() });
    } catch (_) {
      /* mystats optional */
    }

    const stats = (statsRes && statsRes.ok && statsRes.data) ? statsRes.data : null;
    const mystats = (myRes && myRes.ok && myRes.data) ? myRes.data : null;

    if (!stats) {
      if (root) root.innerHTML = `<div class="muted">No data.</div>`;
      return;
    }

    render(stats, mystats);
    try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  }

  // Public API
  Stats.refresh = load;

  // Optional compat (if you ever call these directly)
  Stats.open = function(){ show(); load(); };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg }){
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;

    // Prefer Twoje nowe ID z index.html:
    // - Refresh button: #btnStatsRefresh
    // - Close: data-close="statsBack" obsługuje home_nav.js, więc tu nie trzeba.
    qs("btnStatsRefresh")?.addEventListener("click", load);

    // Back-compat: jeśli gdzieś masz stare ID (nie zaszkodzi)
    qs("closeStats")?.addEventListener("click", Stats.close);
    qs("refreshStats")?.addEventListener("click", load);

    // Global shortcuts
    window.openStats = Stats.open;
    window.closeStats = Stats.close;
  };

  window.Stats = Stats;
})();
