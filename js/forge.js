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

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;
    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      .ah-forge-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
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
        padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);z-index:10000;max-width:min(560px,92vw)}
      .ah-divider{height:1px;background:rgba(255,255,255,.08);margin:10px 0}
      .ah-missing{opacity:.9}
      .ah-missing i{opacity:.8}
      .ah-results{display:grid;grid-template-columns:1fr;gap:10px}
      @media(min-width:560px){.ah-results{grid-template-columns:1fr 1fr}}
      .ah-result{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03)}
      .ah-tag{font-size:11px;opacity:.8;border:1px solid rgba(255,255,255,.10);padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.25);font-weight:900}
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

  function getCfg() {
    const cfg = (_state && _state.craftCfg) || {};
    return {
      baseCost: cfg.baseCost ?? cfg.baseShardCost ?? 5,
      refineCost: cfg.refineCost ?? cfg.refineAdd ?? 2,
      pity: cfg.pity ?? 5,
      uncommonBase: cfg.uncommonBase ?? cfg.baseUncommon ?? 0.20,
      uncommonRefineAdd: cfg.uncommonRefineAdd ?? cfg.refineUncommonAdd ?? 0.05,
      uncommonCap: cfg.uncommonCap ?? 0.55,
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
      `<b>Upgrade</b><div class="ah-small">Upgrade uses materials. Same core logic as Telegram (no drift).</div>`
    ));

    const split = el("div", "ah-split");
    const list = el("div", "ah-list");
    const panel = el("div", "ah-note", `<b>Details</b><div class="ah-small">Select an item.</div>`);

    let selectedKey = null;

    function drawPanel(it) {
      if (!it) {
        panel.innerHTML = `<b>Details</b><div class="ah-small">Select an item.</div>`;
        return;
      }
      const cost = it.costNext || null;
      const miss = cost ? missingForCost(cost) : [];
      panel.innerHTML = `
        <b>${esc(it.slotLabel)}</b>
        <div class="ah-small">${esc(it.name || "—")} · <span class="ah-tag">${esc(it.rarity || "common")}</span></div>
        <div class="ah-divider"></div>
        <div class="ah-small">Stars: <b>★${it.stars}</b> / ★${it.maxStars}</div>
        ${cost ? `<div class="ah-small">Next cost: <b>${fmtCost(cost)}</b></div>` : `<div class="ah-small">No further upgrades.</div>`}
        ${miss.length ? `<div class="ah-missing ah-small"><i>Missing:</i> ${esc(miss.join(", "))}</div>` : ``}
        <div class="ah-divider"></div>
        <div class="ah-small">Tip: Upgrade cost scales with ★.</div>
      `;
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

      const btn = el("button", "ah-btn", it.canUpgrade ? "Upgrade" : "Maxed");
      btn.disabled = _busy || !it.canUpgrade;

      row.addEventListener("click", () => {
        selectedKey = it.key;
        drawPanel(it);
      });

      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        if (_busy || !it.canUpgrade) return;
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
          // refresh details if still same selected item
          const fresh = ((_state && _state.equipped) || []).find(x => x.key === selectedKey);
          drawPanel(fresh);
        }
      });

      row.appendChild(btn);
      list.appendChild(row);
    });

    split.appendChild(list);
    split.appendChild(panel);
    body.appendChild(split);
  }

  function renderCraft(body) {
    const cfg = getCfg();
    const shardSlots = (_state && _state.shardSlots) || [
      "weapon","armor","fangs","cloak","collar","helmet","ring","offhand","gloves"
    ];

    body.appendChild(
      el("div", "ah-note",
        `<b>Shards Craft</b>
         <div class="ah-small">
          Base cost: <b>${cfg.baseCost}</b> · Refine +<b>${cfg.refineCost}</b>/lvl · Uncommon: <b>${Math.round(cfg.uncommonBase*100)}%</b> (+${Math.round(cfg.uncommonRefineAdd*100)}%/refine, cap ${Math.round(cfg.uncommonCap*100)}%) · Pity <b>${cfg.pity}</b>
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
    shardSlots.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
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

    function currentPity(slot) {
      // if backend starts returning state.pityMap, read it here; else use override
      const fromOverride = _pityOverride && _pityOverride[slot];
      return (fromOverride != null ? fromOverride : null);
    }

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
      const pU = Math.min(cfg.uncommonBase + cfg.uncommonRefineAdd * r, cfg.uncommonCap);
      const pity = currentPity(slot);

      fCost.innerHTML = `
        <b>Cost preview</b>
        <div class="ah-small">
          Asset: <b>${esc(slot)}_shards</b><br>
          Have: <b>${have}</b> · Per: <b>${per}</b> · Total: <b>${total}</b> · After: <b>${left}</b><br>
          Uncommon chance: <b>${Math.round(pU * 100)}%</b>${pity != null ? ` · Pity: <b>${pity}</b>/${cfg.pity}` : ``}
        </div>
      `;
    }

    inpCount.addEventListener("input", updateCost);
    inpRef.addEventListener("input", updateCost);
    sel.addEventListener("change", updateCost);

    const btn = el("button", "ah-btn", "Craft");
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

        const made = (res && (res.made || res.result?.made)) || [];
        const pity = res && (res.result?.pity ?? res.pity);
        if (pity != null) _pityOverride[slot] = pity;

        _lastCraft = { slot, made };
        await loadState();

        toast(made.length ? `Crafted ${made.length} item(s).` : "Craft complete.");
      } catch (e) {
        toast(`Craft failed: ${e.message}`);
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
        const card = el("div", "ah-result");
        const ico = el("div", "ah-ico");
        const img = document.createElement("img");
        img.alt = it.name || it.key || "item";
        img.src = it.icon || "";
        img.onerror = () => { img.remove(); ico.textContent = "✦"; };
        ico.appendChild(img);

        const meta = el("div", "ah-meta");
        meta.appendChild(el("div", "ah-line", `<b>${esc(it.name || it.key || "Item")}</b>`));
        meta.appendChild(el("div", "ah-small", `<span class="ah-tag">${esc(it.rarity || "common")}</span> · ${esc(_lastCraft.slot || "")}`));

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
    // keep last craft + pity override (nice UX) across opens
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
