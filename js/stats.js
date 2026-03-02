// js/stats.js — Stats modal (WebApp) using /webapp/stats/state + /webapp/mystats/state
(function () {
  const Stats = {};
  let _apiPost = null, _tg = null, _dbg = false;

  function qs(id){ return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

  function show(){ const b=qs("statsBack"); if (b) b.hidden=false; }
  function hide(){ const b=qs("statsBack"); if (b) b.hidden=true; }

  function statLabel(k){
    const map = {
      strength:"STR", agility:"AGI", defense:"DEF",
      vitality:"VIT", intelligence:"INT", luck:"LUCK"
    };
    return map[k] || k;
  }

  function render(stats, mystats){
    const root = qs("statsRoot");
    if (!root) return;

    const t = (stats && stats.totals) || {};
    const base = (stats && stats.base) || {};
    const petS = (stats && stats.petStats) || {};
    const gear = (stats && stats.gear) || {};
    const bars = (stats && stats.bars) || {};
    const pet = (stats && stats.pet) || {};
    const sets = (stats && stats.sets) || [];
    const unspent = (mystats && mystats.unspentPoints) ?? null;

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

    const setsHtml = (sets && sets.length)
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
        <div class="row"><div class="k">Level</div><div class="v">${esc(stats.level)}</div></div>
        <div class="row"><div class="k">HP</div><div class="v">${esc(stats.hpCur)} / ${esc(stats.hpMax)} <span class="bar">${esc(bars.hp||"")}</span></div></div>
        <div class="row"><div class="k">XP</div><div class="v">${esc(stats.xpCur)} / ${esc(stats.xpNeed)} <span class="bar">${esc(bars.xp||"")}</span></div></div>
        <div class="row"><div class="k">Pet</div><div class="v">${esc(pet.name||"None")} <span class="muted">lvl ${esc(pet.level||0)}</span> <span class="bar">${esc(bars.petXp||"")}</span></div></div>
        ${unspent !== null ? `<div class="row"><div class="k">Unspent</div><div class="v"><b>${esc(unspent)}</b></div></div>` : ``}
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
    if (!root) return;
    root.innerHTML = `<div class="muted">Loading…</div>`;

    let statsRes = null, myRes = null;

    try { statsRes = await _apiPost("/webapp/stats/state", { t: Date.now() }); }
    catch (e) { root.innerHTML = `<div class="muted">Failed to load stats.</div>`; return; }

    try { myRes = await _apiPost("/webapp/mystats/state", { t: Date.now() }); }
    catch (_) { /* mystats optional */ }

    const stats = (statsRes && statsRes.ok && statsRes.data) ? statsRes.data : null;
    const mystats = (myRes && myRes.ok && myRes.data) ? myRes.data : null;

    if (!stats) { root.innerHTML = `<div class="muted">No data.</div>`; return; }

    render(stats, mystats);

    try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}
  }

  Stats.open = function(){
    show();
    load();
  };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg }){
    _apiPost = apiPost; _tg = tg; _dbg = !!dbg;

    qs("closeStats")?.addEventListener("click", Stats.close);
    qs("refreshStats")?.addEventListener("click", load);

    // global shortcut (możesz to wywołać z nav/pina/btn)
    window.openStats = Stats.open;
    window.closeStats = Stats.close;
  };

  window.Stats = Stats;
})();
