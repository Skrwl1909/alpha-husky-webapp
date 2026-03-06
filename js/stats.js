// js/stats.js — Stats modal (WebApp)
// Source of truth: backend /webapp/stats/state + /webapp/mystats/state
// Clean UI: no DBG/source rows, only real player stats from backend.
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
    // Supports:
    // 1) [name, count, bonus]
    // 2) [name, count, bonus, totalParts]
    // 3) { name, count, bonus, totalParts }
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

  function renderError(msg){
    const root = qs("statsRoot");
    if (!root) return;
    root.innerHTML = `<div class="card"><div class="muted">${esc(msg || "Failed to load stats.")}</div></div>`;
  }

  function render(stats, mystats){
    const root = qs("statsRoot");
    if (!root) return;

    const t = (stats && typeof stats.totals === "object") ? stats.totals : {};
    const base = (stats && typeof stats.base === "object") ? stats.base : {};
    const petS = (stats && typeof stats.petStats === "object") ? stats.petStats : {};
    const gear = (stats && typeof stats.gear === "object") ? stats.gear : {};
    const pet = (stats && typeof stats.pet === "object") ? stats.pet : {};
    const rawSets = Array.isArray(stats?.sets) ? stats.sets : [];
    const sets = rawSets.map(normalizeSet);
    const unspent = mystats && mystats.unspentPoints != null ? n(mystats.unspentPoints, 0) : null;

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

    const rows = statKeys.map((k) => {
      const total = n(t[k], 0);
      const b = n(base[k], 0);
      const p = n(petS[k], 0);
      const g = n(gear[k], 0);

      return `
        <div class="srow">
          <span>${esc(statLabel(k))}</span>
          <b>${esc(total)}</b>
          <em>${esc(`${b}+${p}+${g}`)}</em>
        </div>
      `;
    }).join("");

    const setsHtml = sets.length
      ? `
        <div class="card">
          <div class="h">Active Sets</div>
          ${sets.map((s) => {
            const bonus = s.bonus || {};
            const bonusLines = Object.keys(bonus)
              .filter((k) => n(bonus[k], 0) !== 0)
              .map((k) => {
                return `<div class="miniRow"><span>${esc(statLabel(k))}</span><b>+${esc(n(bonus[k], 0))}</b></div>`;
              })
              .join("");

            const progress = s.totalParts > 0
              ? `<span class="muted">(${esc(s.count)}/${esc(s.totalParts)})</span>`
              : `<span class="muted">(${esc(s.count)})</span>`;

            return `
              <div class="card">
                <div class="h">${esc(s.name)} ${progress}</div>
                ${bonusLines || `<div class="muted">No active bonus</div>`}
              </div>
            `;
          }).join("")}
        </div>
      `
      : "";

    root.innerHTML = `
      <div class="card">
        <div class="row">
          <div class="k">Level</div>
          <div class="v">${esc(level)}</div>
        </div>

        <div class="row">
          <div class="k">HP</div>
          <div class="v">
            <div class="vline">
              <span>${esc(hpCur)} / ${esc(hpMax)}</span>
              <div class="pbar" aria-label="HP">
                <div class="pfill" style="width:${hpPct.toFixed(1)}%"></div>
              </div>
              <span class="ppct">${hpPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="k">XP</div>
          <div class="v">
            <div class="vline">
              <span>${esc(xpCur)} / ${esc(xpNeed)}</span>
              <div class="pbar" aria-label="XP">
                <div class="pfill" style="width:${xpPct.toFixed(1)}%"></div>
              </div>
              <span class="ppct">${xpPct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="k">Pet</div>
          <div class="v">
            <div class="vline">
              <span>${esc(petName)} <span class="muted">lvl ${esc(petLevel)}</span></span>
              <div class="pbar" aria-label="Pet XP">
                <div class="pfill" style="width:${petXpPct.toFixed(1)}%"></div>
              </div>
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
    if (_loading) return;
    _loading = true;

    const root = qs("statsRoot");
    if (root) {
      root.innerHTML = `<div class="card"><div class="muted">Loading…</div></div>`;
    }

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_apiPost && typeof window.S?.apiPost === "function") _apiPost = window.S.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      renderError("Stats: api not ready.");
      _loading = false;
      return;
    }

    let statsRes = null;
    let myRes = null;

    try {
      statsRes = await _apiPost("/webapp/stats/state", { t: Date.now() });
      myRes = await _apiPost("/webapp/mystats/state", { t: Date.now() }).catch(() => null);

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
        _loading = false;
        return;
      }

      render(stats, mystats);
      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
    } catch (e) {
      if (_dbg) console.error("[Stats] load failed", e);
      renderError("Failed to load stats.");
      try { _tg?.showAlert?.("Stats load failed"); } catch (_) {}
    }

    _loading = false;
  }

  Stats.refresh = load;
  Stats.open = function(){ show(); load(); };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg } = {}){
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
