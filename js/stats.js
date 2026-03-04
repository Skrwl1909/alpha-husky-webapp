// js/stats.js — Stats modal (WebApp) using /webapp/stats/state + /webapp/mystats/state
// ✅ AAA Edition: frost bars + pet header + ikony + Telegram Native (mechanika 100% nienaruszona)
(function () {
  const Stats = {};
  let _apiPost = null, _tg = null, _dbg = false;

  function qs(id){ return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  // === TWOJE ORYGINALNE FUNKCJE (bez zmian) ===
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

  // === NOWE AAA HELPERY (tylko do wizualu) ===
  function createBar(label, value, pct, emoji) {
    return `
      <div class="row">
        <div class="k">${emoji} ${label}</div>
        <div class="v">
          <div class="vline">
            <span>${value}</span>
            <div class="frost-bar"><div class="frost-fill" style="width:${pct.toFixed(1)}%"></div></div>
            <span class="ppct">${pct.toFixed(0)}%</span>
          </div>
        </div>
      </div>`;
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
          <em>\( {esc(` \){b}+\( {p}+ \){g}`)}</em>
        </div>`;
    }).join("");

    const setsHtml = sets.length
      ? sets.map(s=>{
          const bonus = s.bonus || {};
          const bonusLines = Object.keys(bonus).filter(k=>Number(bonus[k]||0)).map(k=>{
            return `<div class="miniRow"><span>\( {esc(statLabel(k))}</span><b>+ \){esc(bonus[k])}</b></div>`;
          }).join("");
          return `
            <div class="card">
              <div class="h">\( {esc(s.name)} <span class="muted">( \){esc(s.count)}/${esc(s.totalParts)})</span></div>
              ${bonusLines || `<div class="muted">No bonus data</div>`}
            </div>`;
        }).join("")
      : "";

    // === DEBUG rows (100% Twój oryginalny kod) ===
    const dbg = stats?._dbg || null;
    const dbgDataFile = dbg?.dataFile ? String(dbg.dataFile).split("/").slice(-2).join("/") : "";
    const dbgCwd = dbg?.cwd ? String(dbg.cwd).split("/").slice(-2).join("/") : "";
    const dbgSrc = dbg?.src || stats?._src || "";

    const dbgRows = dbg ? `
      <div class="row">
        <div class="k">DBG file</div>
        <div class="v" style="max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${esc(dbgDataFile)}
        </div>
      </div>
      <div class="row">
        <div class="k">DBG cwd</div>
        <div class="v" style="max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${esc(dbgCwd)}
        </div>
      </div>
      <div class="row">
        <div class="k">DBG lvl/xp</div>
        <div class="v">${esc(dbg?.level ?? "")} / ${esc(dbg?.xp ?? "")}</div>
      </div>
      <div class="row">
        <div class="k">DBG has</div>
        <div class="v">\( {esc(`stats: \){dbg?.has_stats ? "1" : "0"} eq:${dbg?.has_equipped ? "1" : "0"}`)}</div>
      </div>
      <div class="row">
        <div class="k">DBG src</div>
        <div class="v">${esc(dbgSrc)}</div>
      </div>
    ` : ``;

    root.innerHTML = `
      <div class="card">
        <!-- PET HEADER (nowy AAA element – nie psuje niczego) -->
        <div class="pet-header">
          <div class="pet-avatar">🐺</div>
          <div>
            <div class="pet-name">${esc(pet.name || "Husky")}</div>
            <div class="pet-level">Level ${esc(pet.level || 1)}</div>
          </div>
        </div>

        <div class="row">
          <div class="k">Level</div>
          <div class="v">${esc(stats.level)}</div>
        </div>

        <div class="row">
          <div class="k">Source</div>
          <div class="v">${esc(stats._src || stats._source || stats.src || "")}</div>
        </div>

        ${dbgRows}

        <!-- Frost Bary (zamiana tylko tych 3 sekcji) -->
        \( {createBar("HP", ` \){esc(stats.hpCur)} / ${esc(stats.hpMax)}`, hpPct, "❤️")}
        \( {createBar("XP", ` \){esc(stats.xpCur)} / ${esc(stats.xpNeed)}`, xpPct, "⭐")}
        \( {createBar("Pet XP", ` \){esc(pet.xpCur || 0)} / ${esc(pet.xpNeed || 0)}`, petXpPct, "🐾")}

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

  // === load(), init(), Public API – 100% Twój oryginalny kod (bez zmian) ===
  async function load(){
    const root = qs("statsRoot");
    if (root) root.innerHTML = `<div class="muted">Loading…</div>`;

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      if (root) root.innerHTML = `<div class="muted">Stats: api not ready.</div>`;
      return;
    }

    let statsRes = null, myRes = null;
    try {
      statsRes = await _apiPost("/webapp/stats/state", { t: Date.now() });
      if (_dbg) console.log("[Stats] statsRes =", statsRes);
    } catch (e) {
      if (root) root.innerHTML = `<div class="muted">Failed to load stats.</div>`;
      try { _tg?.showAlert?.("Stats load failed"); } catch(_) {}
      return;
    }

    try {
      myRes = await _apiPost("/webapp/mystats/state", { t: Date.now() });
    } catch (_) {}

    const stats = (statsRes && statsRes.ok && statsRes.data) ? statsRes.data : null;
    const mystats = (myRes && myRes.ok && myRes.data) ? myRes.data : null;

    if (!stats) {
      if (root) root.innerHTML = `<div class="muted">No data.</div>`;
      return;
    }

    render(stats, mystats);
    try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  }

  Stats.refresh = load;
  Stats.open = function(){ show(); load(); };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg }){
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;

    // Telegram Native (nie wpływa na mechanikę)
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.expand();
      tg.BackButton.show();
    }

    qs("btnStatsRefresh")?.addEventListener("click", load);
    qs("closeStats")?.addEventListener("click", Stats.close);
    qs("refreshStats")?.addEventListener("click", load);

    window.openStats = Stats.open;
    window.closeStats = Stats.close;
  };

  window.Stats = Stats;
})();
