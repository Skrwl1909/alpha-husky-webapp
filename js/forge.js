// js/forge.js — Vault Forge Hub (Upgrade + Shards Craft) for Alpha Husky WebApp (v2)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;
  }

  async function post(path, payload) {
    if (_apiPost) return await _apiPost(path, payload || {});
    const API_BASE = window.API_BASE || "";
    const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData, ...(payload || {}) }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error((json && (json.reason || json.error)) || `HTTP_${res.status}`);
    if (json && json.ok === false) throw new Error(json.reason || "ERROR");
    return json;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  // -------------------------
  // PITY micro-patch helpers
  // -------------------------
  function _num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  // normalize "percent" to 0..1 if backend sends 20 instead of 0.20
  function _pct01(v, fallback01) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback01;
    if (n > 1.000001) return n / 100;
    return n;
  }

  function _getPityTrigger(state) {
    // prefer craftCfg.pityTrigger (backend), then legacy aliases, fallback 5
    return _num(
      state?.craftCfg?.pityTrigger ??
      state?.craftCfg?.pity ??
      state?.pityTrigger,
      5
    );
  }

  function _getPityForSlot(state, slot, pityOverride) {
    const fromState = state?.pityMap?.[slot];
    if (fromState != null) return _num(fromState, 0);
    const fromOv = pityOverride && pityOverride[slot];
    if (fromOv != null) return _num(fromOv, 0);
    return null;
  }

  function renderCraftPity(state, slot, pityOverride) {
    const elP = document.getElementById("forge-craft-pity");
    if (!elP) return;
    const p = _getPityForSlot(state, slot, pityOverride);
    const t = _getPityTrigger(state);
    elP.textContent = (p == null) ? "Pity: —" : `Pity: ${p}/${t}`;
  }

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;
    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      .ah-forge-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:2147483640;display:flex;align-items:flex-end;justify-content:center}
      .ah-forge{width:min(1040px,100%);max-height:90vh;background:rgba(14,16,18,.97);border:1px solid rgba(255,255,255,.08);
        border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 40px rgba(0,0,0,.55)}
      .ah-forge-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(255,255,255,.08)}
      .ah-forge-title{font-weight:900;letter-spacing:.3px}
      .ah-forge-sub{opacity:.75;font-size:12px;margin-top:2px}
      .ah-forge-close{border:0;background:transparent;color:#fff;font-size:18px;opacity:.85}
      .ah-forge-tabs{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
      .ah-forge-tab{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-weight:900;opacity:.9}
      .ah-forge-tab.active{background:rgba(255,255,255,.10);opacity:1}
      .ah-forge-body{padding:14px;overflow:auto;max-height:calc(90vh - 118px)}
      .ah-forge-bal{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      .ah-pill{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-weight:900;font-size:12px;opacity:.95}
      .ah-note{padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);margin-bottom:10px}
      .ah-small{opacity:.75;font-size:12px}
      .ah-split{display:grid;grid-template-columns:1fr;gap:12px}
      @media(min-width:860px){.ah-split{grid-template-columns:1.1fr .9fr}}
      .ah-list{display:grid;grid-template-columns:1fr;gap:10px}
      .ah-card{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);border-radius:14px}
      .ah-left{display:flex;align-items:center;gap:10px;min-width:0}
      .ah-ico{width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.25);overflow:hidden;flex:0 0 auto}
      .ah-ico img{width:100%;height:100%;object-fit:cover;display:block}
      .ah-meta{display:flex;flex-direction:column;gap:3px;min-width:0}
      .ah-meta b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-btn{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-weight:900}
      .ah-btn:disabled{opacity:.45}
      .ah-btnrow{display:flex;gap:8px;flex-wrap:wrap}
      .ah-field{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);border-radius:14px}
      .ah-field label{font-weight:900}
      .ah-field select,.ah-field input{width:180px;max-width:55vw;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.25);color:#fff}
      .ah-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;background:rgba(0,0,0,.78);color:#fff;
      padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);z-index:2147483641;max-width:min(560px,92vw)}
      .ah-divider{height:1px;background:rgba(255,255,255,.08);margin:10px 0}
      .ah-missing{opacity:.9}
      .ah-missing i{opacity:.8}
      .ah-results{display:grid;grid-template-columns:1fr;gap:10px}
      @media(min-width:560px){.ah-results{grid-template-columns:1fr 1fr}}
      .ah-result{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03)}
      .ah-tag{font-size:11px;opacity:.8;border:1px solid rgba(255,255,255,.10);padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.25);font-weight:900}

      /* ---- contrast overrides ---- */
      .ah-forge{color:#f4f6ff}
      .ah-forge *{color:inherit}
      .ah-forge-title,.ah-forge-sub,.ah-forge-close,.ah-forge-tab,.ah-btn{color:#f4f6ff}
      .ah-small{opacity:.88}
      .ah-note{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.12)}
      .ah-card{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
      .ah-field select,.ah-field input{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.18);color:#fff}
      .ah-forge-tab{background:rgba(255,255,255,.06)}
      .ah-forge-tab.active{background:rgba(255,255,255,.16)}

      /* rarity tag polish */
      .ah-tag[data-r="uncommon"]{border-color:rgba(120,255,120,.35)}
      .ah-tag[data-r="epic"]{border-color:rgba(180,120,255,.35)}
      .ah-tag[data-r="legendary"]{border-color:rgba(255,190,90,.38)}
      .ah-result[data-r="uncommon"]{border-color:rgba(120,255,120,.22)}
      .ah-result[data-r="epic"]{border-color:rgba(180,120,255,.22)}
      .ah-result[data-r="legendary"]{border-color:rgba(255,190,90,.24)}
`;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  let _root = null;
  let _tab = "upgrade";
  let _state = null;
  let _busy = false;
  let _ctx = { buildingId: null, name: "Forgotten Tokens’ Vault" };

  // local override pity after craft (until backend starts returning pity map in state)
  let _pityOverride = {};
  let _lastCraft = { slot: null, made: [] };
  let _lastRollCfg = null; // from craft response (pools + exact roll thresholds)

  function getCfg() {
    const cfg = (_state && _state.craftCfg) || {};
    const weights = cfg.weights || {};

    const baseCost = _num(cfg.baseCost ?? cfg.baseShardCost, 5);
    const refineCost = _num(cfg.refineCost ?? cfg.refineAdd, 2);

    // pity trigger (canonical)
    const pityTrigger = _num(cfg.pityTrigger ?? cfg.pity, 5);

    // uncommon base/cap can be 0..1 or 0..100
    let uncommonBase = cfg.uncommonBase ?? cfg.baseUncommon;
    if (uncommonBase == null) {
      const wc = _num(weights.common, 80);
      const wu = _num(weights.uncommon, 20);
      const total = wc + wu;
      uncommonBase = total > 0 ? (wu / total) : 0.20;
    }
    uncommonBase = _pct01(uncommonBase, 0.20);

    // refine add can be 0..1 or 0..100
    let uncommonRefineAdd = cfg.uncommonRefineAdd ?? cfg.refineUncommonAdd;
    if (uncommonRefineAdd == null) {
      // if backend gives bonusPerExtraShard + refineCost, approximate pp increase per refine step
      const bonusPerExtra = _num(cfg.bonusPerExtraShard, 0);
      if (bonusPerExtra > 0) {
        uncommonRefineAdd = (bonusPerExtra * refineCost) / 100;
      } else {
        uncommonRefineAdd = 0.05;
      }
    }
    uncommonRefineAdd = _pct01(uncommonRefineAdd, 0.05);

    let uncommonCap = cfg.uncommonCap;
    uncommonCap = _pct01(uncommonCap, 0.55);

    // Epic / Legendary fallbacks (match backend defaults if state doesn't provide them yet)
    const epicBase = _pct01(cfg.epicBase, 0.02);
    const epicRefineAdd = _pct01(cfg.epicRefineAdd, 0.01);
    const epicCap = _pct01(cfg.epicCap, 0.08);

    const legendaryBase = _pct01(cfg.legendaryBase, 0.001);
    const legendaryRefineAdd = _pct01(cfg.legendaryRefineAdd, 0.0002);
    const legendaryCap = _pct01(cfg.legendaryCap, 0.003);

    return {
      baseCost,
      refineCost,
      pity: pityTrigger,
      uncommonBase,
      uncommonRefineAdd,
      uncommonCap,

      epicBase,
      epicRefineAdd,
      epicCap,

      legendaryBase,
      legendaryRefineAdd,
      legendaryCap,
    };
  }

  // ---------- chance formatting / effective probs (sequential rolls) ----------
  function _fmtPctAuto(p01) {
    const v = _num(p01, 0) * 100;
    if (v < 0.1) return v.toFixed(3);
    if (v < 1) return v.toFixed(2);
    if (v < 10) return v.toFixed(1);
    return String(Math.round(v));
  }

  function _calcThresholds(cfg, refine) {
    const r = Math.max(0, Math.min(5, parseInt(refine || "0", 10)));

    const pLeg = Math.max(0, Math.min(1,
      _num(cfg.legendaryBase, 0.001) + _num(cfg.legendaryRefineAdd, 0.0002) * r
    ));
    const pLegC = Math.min(pLeg, _num(cfg.legendaryCap, 0.003));

    const pEpic = Math.max(0, Math.min(1,
      _num(cfg.epicBase, 0.02) + _num(cfg.epicRefineAdd, 0.01) * r
    ));
    const pEpicC = Math.min(pEpic, _num(cfg.epicCap, 0.08));

    let pUnc = Math.max(0, Math.min(1,
      _num(cfg.uncommonBase, 0.20) + _num(cfg.uncommonRefineAdd, 0.05) * r
    ));
    pUnc = Math.min(pUnc, _num(cfg.uncommonCap, 0.55));

    // clamp like backend intent (safe)
    const pE = Math.min(pEpicC, Math.max(0, 1 - pLegC));
    const pU = Math.min(pUnc,   Math.max(0, 1 - pLegC - pE));

    return { pLeg: pLegC, pEpic: pE, pUnc: pU, r };
  }

  // Effective (overall) probabilities with sequential rolls (matches backend structure)
  function _calcEffective(cfg, refine) {
    const t = _calcThresholds(cfg, refine);
    const leg = t.pLeg;
    const epic = (1 - t.pLeg) * t.pEpic;
    const unc  = (1 - t.pLeg) * (1 - t.pEpic) * t.pUnc;
    return {
      legendary: leg,
      epic,
      uncommon: unc,
      uncommonPlus: (leg + epic + unc),
    };
  }

  function shardsHave(slot) {
    const map = (_state && _state.shards) || {};
    return map[`${slot}_shards`] ?? 0;
  }

  function mats() {
    return (_state && _state.balances) || {};
  }

  function renderBalances(container) {
    const b = mats();
    const wrap = el("div", "ah-forge-bal");
    const pills = [
      ["Bones", b.bones],
      ["Scrap", b.scrap],
      ["Rune Dust", b.rune_dust],
    ];
    pills.forEach(([k, v]) => {
      if (v == null) return;
      wrap.appendChild(el("div", "ah-pill", `${k}: ${v}`));
    });
    container.appendChild(wrap);
  }

  function fmtCost(cost) {
    const c = cost || {};
    return `Bones ${c.bones || 0} · Scrap ${c.scrap || 0} · Dust ${c.rune_dust || 0}`;
  }

  function missingForCost(cost) {
    const b = mats();
    const c = cost || {};
    const miss = {
      bones: Math.max(0, (c.bones || 0) - (b.bones || 0)),
      scrap: Math.max(0, (c.scrap || 0) - (b.scrap || 0)),
      rune_dust: Math.max(0, (c.rune_dust || 0) - (b.rune_dust || 0)),
    };
    const parts = [];
    if (miss.bones) parts.push(`${miss.bones} Bones`);
    if (miss.scrap) parts.push(`${miss.scrap} Scrap`);
    if (miss.rune_dust) parts.push(`${miss.rune_dust} Dust`);
    return parts;
  }

  function renderUpgrade(body) {
    const eq = (_state && _state.equipped) || [];
    if (!eq.length) {
      body.appendChild(el("div", "ah-small", "No equipped items found."));
      return;
    }

    body.appendChild(el("div", "ah-note",
      `<b>Upgrade</b><div class="ah-small">Tap an item to see details. Upgrade uses materials (same core as Telegram).</div>`
    ));

    const split = el("div", "ah-split");
    const list = el("div", "ah-list");
    const panel = el("div", "ah-note", `<b>Details</b><div class="ah-small">Select an item.</div>`);

    let selectedKey = null;

    async function doUpgrade(it) {
      if (!it || _busy || !it.canUpgrade) return;
      _busy = true;
      draw();

      try {
        await post("/webapp/forge/upgrade", {
          buildingId: _ctx.buildingId,
          slot: it.slot,
          run_id: `web_upg_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        });
        await loadState();
        toast(`Upgraded ${it.slotLabel}.`);
      } catch (e) {
        toast(`Upgrade failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();

        // odśwież panel na świeżych danych
        const fresh = ((_state && _state.equipped) || []).find(x => x.key === selectedKey);
        drawPanel(fresh);
      }
    }

    function drawPanel(it) {
      if (!it) {
        panel.innerHTML = `<b>Details</b><div class="ah-small">Select an item.</div>`;
        return;
      }

      const cost = it.costNext || null;
      const miss = cost ? missingForCost(cost) : [];
      const isMaxed = (it.stars >= it.maxStars);
      const rr = String(it.rarity || "common").toLowerCase();

      panel.innerHTML = `
        <b>${esc(it.slotLabel)}</b>
        <div class="ah-small">${esc(it.name || "—")} · <span class="ah-tag" data-r="${esc(rr)}">${esc(rr)}</span></div>
        <div class="ah-divider"></div>
        <div class="ah-small">Stars: <b>★${it.stars}</b> / ★${it.maxStars}</div>
        ${cost ? `<div class="ah-small">Next cost: <b>${fmtCost(cost)}</b></div>` : `<div class="ah-small">No further upgrades.</div>`}
        ${miss.length ? `<div class="ah-missing ah-small"><i>Missing:</i> ${esc(miss.join(", "))}</div>` : ``}
        <div class="ah-divider"></div>
        <div id="ah-upg-actions"></div>
        <div class="ah-small">Tip: Upgrade cost scales with ★.</div>
      `;

      const actions = panel.querySelector("#ah-upg-actions");
      const row = el("div", "ah-btnrow");

      const btn = el("button", "ah-btn",
        isMaxed ? "Maxed" : (it.canUpgrade ? "Upgrade" : "Upgrade (missing mats)")
      );
      btn.type = "button";
      btn.disabled = _busy || isMaxed || !it.canUpgrade;
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        doUpgrade(it);
      });

      row.appendChild(btn);
      actions.appendChild(row);
    }

    eq.forEach((it) => {
      const row = el("div", "ah-card");
      const left = el("div", "ah-left");

      const ico = el("div", "ah-ico");
      const img = document.createElement("img");
      img.alt = it.name || it.key || "item";
      img.src = it.icon || "";
      img.onerror = () => { img.remove(); ico.textContent = "✦"; };
      ico.appendChild(img);

      const meta = el("div", "ah-meta");
      meta.appendChild(el("div", "ah-line", `<b>${esc(it.slotLabel)}</b> — ${esc(it.name || "—")}`));
      meta.appendChild(el("div", "ah-small", `★${it.stars} / ${it.maxStars} · ${esc(it.rarity || "common")}`));
      if (it.costNext) meta.appendChild(el("div", "ah-small", `Cost: ${fmtCost(it.costNext)}`));

      left.appendChild(ico);
      left.appendChild(meta);
      row.appendChild(left);

      // mini status button po prawej
      const btn = el("button", "ah-btn", it.canUpgrade ? "Upgrade" : "Maxed");
      btn.type = "button";
      btn.disabled = _busy || !it.canUpgrade;

      row.addEventListener("click", () => {
        selectedKey = it.key;
        drawPanel(it);

        // na mobile przewiń do panelu, żeby było widać akcję
        if (window.innerWidth < 860) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });

      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        doUpgrade(it);
      });

      row.appendChild(btn);
      list.appendChild(row);
    });

    // ✅ Na mobile panel nad listą
    if (window.innerWidth < 860) {
      split.appendChild(panel);
      split.appendChild(list);
    } else {
      split.appendChild(list);
      split.appendChild(panel);
    }

    body.appendChild(split);
  }

  function renderCraft(body) {
    const cfg = getCfg();
    const shardSlots = (_state && _state.shardSlots) || [
      "weapon","armor","fangs","cloak","collar","helmet","ring","offhand","gloves"
    ];

    const eff0 = _calcEffective(cfg, 0);
    const pools0 = (_lastCraft && _lastCraft.slot && _lastRollCfg && _lastRollCfg.pools) ? _lastRollCfg.pools : null;
    const hasEpic0 = pools0 ? (pools0.epic > 0) : true;
    const hasLeg0  = pools0 ? (pools0.legendary > 0) : true;

    body.appendChild(
      el("div", "ah-note",
        `<b>Shards Craft</b>
         <div class="ah-small">
          Base cost: <b>${cfg.baseCost}</b> · Refine +<b>${cfg.refineCost}</b>/lvl ·
          Uncommon+: <b>${_fmtPctAuto(eff0.uncommonPlus)}%</b>
          (${hasEpic0 ? `Epic <b>${_fmtPctAuto(eff0.epic)}%</b> · ` : ``}
           ${hasLeg0 ? `Legendary <b>${_fmtPctAuto(eff0.legendary)}%</b> · ` : ``}
           Uncommon <b>${_fmtPctAuto(eff0.uncommon)}%</b>) ·
          Pity <b>${cfg.pity}</b>
          <div class="ah-small" style="opacity:.85;margin-top:4px">
            Epic/Legendary roll only if this slot has items in that rarity.
          </div>
         </div>`
      )
    );

    const form = el("div", "ah-split");

    // left: controls
    const controls = el("div", "ah-note");
    controls.appendChild(el("div", "", `<b>Controls</b><div class="ah-small">Craft pulls from <b>{slot}_shards</b>.</div>`));

    const fSlot = el("div", "ah-field");
    fSlot.appendChild(el("label", "", "Slot"));
    const sel = document.createElement("select");

    // helper: pity read
    function currentPity(slot) {
      const fromState = _state && _state.pityMap && _state.pityMap[slot];
      if (fromState != null) return fromState;
      const fromOverride = _pityOverride && _pityOverride[slot];
      return (fromOverride != null ? fromOverride : null);
    }

    // helper: render dropdown labels with counts
    function refreshSlotLabels() {
      Array.from(sel.options).forEach((opt) => {
        const s = opt.value;
        opt.textContent = `${s} (${shardsHave(s)})`;
      });
    }

    // build options
    shardSlots.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = `${s} (${shardsHave(s)})`;
      sel.appendChild(opt);
    });
    fSlot.appendChild(sel);

    const fCount = el("div", "ah-field");
    fCount.appendChild(el("label", "", "Count"));
    const inpCount = document.createElement("input");
    inpCount.type = "number";
    inpCount.min = "1";
    inpCount.max = "50";
    inpCount.value = "1";
    fCount.appendChild(inpCount);

    const quick = el("div", "ah-btnrow");
    [1, 5, 10].forEach(n => {
      const b = el("button", "ah-btn", String(n));
      b.type = "button";
      b.disabled = _busy;
      b.addEventListener("click", () => { inpCount.value = String(n); updateCost(); });
      quick.appendChild(b);
    });

    const fRefine = el("div", "ah-field");
    fRefine.appendChild(el("label", "", "Refine"));
    const inpRef = document.createElement("input");
    inpRef.type = "number";
    inpRef.min = "0";
    inpRef.max = "5"; // IMPORTANT: match backend
    inpRef.value = "0";
    fRefine.appendChild(inpRef);

    const fCost = el("div", "ah-note", "");

    function updateCost() {
      const slot = sel.value;
      const n = Math.max(1, Math.min(50, parseInt(inpCount.value || "1", 10)));
      const r = Math.max(0, Math.min(5, parseInt(inpRef.value || "0", 10)));

      inpCount.value = String(n);
      inpRef.value = String(r);

      const per = (cfg.baseCost || 5) + r * (cfg.refineCost || 2);
      const total = per * n;

      const have = shardsHave(slot);
      const left = have - total;

      const eff = _calcEffective(cfg, r);
      const pity = currentPity(slot);

      // pools are slot-specific in backend rollCfg; only trust it if it's for current slot
      const pools = (_lastCraft && _lastCraft.slot === slot && _lastRollCfg && _lastRollCfg.pools) ? _lastRollCfg.pools : null;
      const hasEpic = pools ? (pools.epic > 0) : true;
      const hasLeg  = pools ? (pools.legendary > 0) : true;

      fCost.innerHTML = `
        <b>Cost preview</b>
        <div class="ah-small">
          Asset: <b>${esc(slot)}_shards</b><br>
          Have: <b>${have}</b> · Per: <b>${per}</b> · Total: <b>${total}</b> · After: <b>${left}</b><br>
          Uncommon+: <b>${_fmtPctAuto(eff.uncommonPlus)}%</b>
          (${hasEpic ? `E <b>${_fmtPctAuto(eff.epic)}%</b> · ` : ``}
           ${hasLeg ? `L <b>${_fmtPctAuto(eff.legendary)}%</b> · ` : ``}
           U <b>${_fmtPctAuto(eff.uncommon)}%</b>)
          ${pity != null ? ` · Pity: <b>${pity}</b>/${cfg.pity}` : ``}
        </div>
      `;
    }

    inpCount.addEventListener("input", updateCost);
    inpRef.addEventListener("input", updateCost);
    sel.addEventListener("change", updateCost);

    const btn = el("button", "ah-btn", "Craft");
    btn.type = "button";
    btn.disabled = _busy;

    btn.addEventListener("click", async () => {
      if (_busy) return;

      const slot = sel.value;
      const count = Math.max(1, Math.min(50, parseInt(inpCount.value || "1", 10)));
      const refine = Math.max(0, Math.min(5, parseInt(inpRef.value || "0", 10)));

      // quick client-side check
      const per = (cfg.baseCost || 5) + refine * (cfg.refineCost || 2);
      const total = per * count;
      const have = shardsHave(slot);
      if (have < total) {
        toast(`Not enough ${slot}_shards.`);
        return;
      }

      _busy = true;
      draw();

      try {
        const res = await post("/webapp/forge/craft", {
          buildingId: _ctx.buildingId,
          slot,
          count,
          refine,
          run_id: `web_craft_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        });

        // made can be objects after backend patch; keep fallback for keys
        const made = (res && (res.made || res.result?.made)) || [];
        const pity = res && (res.result?.pity ?? res.pity);
        if (pity != null) _pityOverride[slot] = pity;

        // rollCfg (pools + pLegendary/pEpic/pUncommon etc.)
        const rc = res?.rollCfg || res?.result?.rollCfg;
        if (rc) _lastRollCfg = rc;

        _lastCraft = { slot, made };

        // ✅ use payload if present (saves 1 request)
        if (res && res.data) {
          _state = res.data;
        } else {
          await loadState();
        }

        // refresh dropdown labels + cost preview
        try { refreshSlotLabels(); } catch (_) {}
        try { updateCost(); } catch (_) {}

        // clear old error box on success
        const uiErrorEl = document.getElementById("forge-error");
        if (uiErrorEl) uiErrorEl.textContent = "";

        toast(made.length ? `Crafted ${made.length} item(s).` : "Craft complete.");
      } catch (e) {
        // ---- ensure UI error box exists ----
        let uiErrorEl = document.getElementById("forge-error");
        if (!uiErrorEl) {
          uiErrorEl = document.createElement("pre");
          uiErrorEl.id = "forge-error";
          uiErrorEl.style.whiteSpace = "pre-wrap";
          uiErrorEl.style.wordBreak = "break-word";
          uiErrorEl.style.margin = "10px 0 0";
          uiErrorEl.style.padding = "10px 12px";
          uiErrorEl.style.border = "1px solid rgba(255,255,255,.18)";
          uiErrorEl.style.borderRadius = "10px";
          uiErrorEl.style.background = "rgba(0,0,0,.35)";
          uiErrorEl.style.fontSize = "12px";
          uiErrorEl.style.lineHeight = "1.35";

          const mount =
            document.querySelector("#forge-modal .modal-body") ||
            document.querySelector("#forge-modal") ||
            document.querySelector("#forge") ||
            document.body;

          mount.appendChild(uiErrorEl);
        }

        console.error("CRAFT ERROR:", e);

        // apiPost usually throws Error with {status, data}
        const status = e?.status ?? e?.data?.status ?? "";
        const payload = e?.data?.data || e?.data || {}; // supports both shapes
        const rawMsg = (e && typeof e === "object" && e.message) ? e.message : String(e);
        const reason = payload?.reason || rawMsg || "unknown";

        let payloadPretty = "";
        try { payloadPretty = JSON.stringify(payload, null, 2); }
        catch { payloadPretty = String(payload); }

        const dbgPretty = payload?.dbg ? (() => {
          try { return JSON.stringify(payload.dbg, null, 2); } catch { return String(payload.dbg); }
        })() : "";

        uiErrorEl.textContent =
          `Craft failed${status ? " [" + status + "]" : ""}: ${reason}\n\n` +
          `raw: ${String(e)}\n\n` +
          (dbgPretty ? `DBG:\n${dbgPretty}\n\n` : "") +
          (payload?.trace ? `TRACE:\n${payload.trace}\n\n` : "") +
          `PAYLOAD:\n${payloadPretty}`;

        toast(`Craft failed${status ? " [" + status + "]" : ""}: ${reason}`);
      } finally {
        _busy = false;
        draw();
      }
    });

    controls.appendChild(fSlot);
    controls.appendChild(fCount);
    controls.appendChild(quick);
    controls.appendChild(fRefine);
    controls.appendChild(fCost);
    controls.appendChild(btn);

    // right: results
    const results = el("div", "ah-note");
    results.appendChild(el("div", "", `<b>Results</b><div class="ah-small">Your last craft shows here.</div>`));

    const out = el("div", "ah-results");
    function drawResults() {
      out.innerHTML = "";
      const made = (_lastCraft && _lastCraft.made) || [];
      if (!made.length) {
        out.appendChild(el("div", "ah-small", "No craft results yet."));
        return;
      }

      made.forEach((it) => {
        // support both: object {key,name,rarity,icon} OR string key
        const obj = (typeof it === "string") ? { key: it } : (it || {});
        const r = String(obj.rarity || "common").toLowerCase();

        const card = el("div", "ah-result");
        card.setAttribute("data-r", r);

        const ico = el("div", "ah-ico");

        const img = document.createElement("img");
        img.alt = obj.name || obj.key || "item";
        img.src = obj.icon || "";
        img.onerror = () => { img.remove(); ico.textContent = "✦"; };
        ico.appendChild(img);

        const meta = el("div", "ah-meta");
        meta.appendChild(el("div", "ah-line", `<b>${esc(obj.name || obj.key || "Item")}</b>`));
        meta.appendChild(el("div", "ah-small",
          `<span class="ah-tag" data-r="${esc(r)}">${esc(r)}</span> · ${esc(_lastCraft.slot || "")}`
        ));

        card.appendChild(ico);
        card.appendChild(meta);
        out.appendChild(card);
      });
    }

    drawResults();
    results.appendChild(el("div", "ah-divider", ""));
    results.appendChild(out);

    form.appendChild(controls);
    form.appendChild(results);
    body.appendChild(form);

    // initial refresh
    refreshSlotLabels();
    updateCost();
  }

  function draw() {
    if (!_root) return;

    const title = _root.querySelector(".ah-forge-title");
    const sub = _root.querySelector(".ah-forge-sub");
    title.textContent = _ctx.name || "Forgotten Tokens’ Vault";
    sub.textContent = _ctx.buildingId ? `Building: ${_ctx.buildingId}` : "";

    const tabs = _root.querySelectorAll(".ah-forge-tab");
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === _tab));

    const body = _root.querySelector(".ah-forge-body");
    body.innerHTML = "";

    if (!_state) {
      body.appendChild(el("div", "ah-small", "Loading…"));
      return;
    }

    renderBalances(body);

    if (_tab === "upgrade") renderUpgrade(body);
    else renderCraft(body);
  }

  async function loadState() {
    const res = await post("/webapp/forge/state", { buildingId: _ctx.buildingId });
    _state = (res && (res.data || res)) || null;
  }

  function mount() {
    ensureStyles();
    lockScroll(true);

    const backdrop = el("div", "ah-forge-backdrop");
    const modal = el("div", "ah-forge");

    const head = el("div", "ah-forge-head");
    const left = el("div");
    left.appendChild(el("div", "ah-forge-title", _ctx.name || "Forgotten Tokens’ Vault"));
    left.appendChild(el("div", "ah-forge-sub", ""));
    head.appendChild(left);

    const close = el("button", "ah-forge-close", "✕");
    close.addEventListener("click", unmount);
    head.appendChild(close);

    const tabs = el("div", "ah-forge-tabs");
    [
      ["upgrade", "UPGRADE"],
      ["craft", "CRAFT"],
    ].forEach(([k, label]) => {
      const t = el("button", "ah-forge-tab", label);
      t.dataset.tab = k;
      t.addEventListener("click", () => {
        _tab = k;
        draw();
      });
      tabs.appendChild(t);
    });

    const body = el("div", "ah-forge-body", "");

    modal.appendChild(head);
    modal.appendChild(tabs);
    modal.appendChild(body);
    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) unmount();
    });

    _root = backdrop;
    document.body.appendChild(backdrop);
  }

  function unmount() {
    lockScroll(false);
    if (_root) _root.remove();
    _root = null;
    _state = null;
    _busy = false;
    _tab = "upgrade";
    // keep last craft + pity override + lastRollCfg (nice UX) across opens
  }

  async function open(ctx) {
    _ctx = {
      buildingId: ctx && ctx.buildingId ? ctx.buildingId : null,
      name: (ctx && ctx.name) || "Forgotten Tokens’ Vault",
    };

    mount();
    try {
      await loadState();
    } catch (e) {
      toast(`Forge load failed: ${e.message}`);
    } finally {
      draw();
    }
  }

  window.Forge = { init, open, close: unmount };
})();
