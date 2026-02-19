// js/forge.js — Vault Forge Hub (Upgrade + Shards Craft) for Alpha Husky WebApp (v2.3)
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
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[m]));
  }

  function rid(prefix = "forge") {
    try { return `${prefix}:${crypto.randomUUID()}`; }
    catch { return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e9)}`; }
  }

  function pick(obj, path, fallback = undefined) {
    try {
      const parts = String(path).split(".");
      let cur = obj;
      for (const p of parts) {
        if (!cur) return fallback;
        cur = cur[p];
      }
      return (cur === undefined ? fallback : cur);
    } catch {
      return fallback;
    }
  }

  // -------------------------
  // PITY micro-patch helpers
  // -------------------------
  function _num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function _pct01(v, fallback01) {
    const n = Number(v);
    if (!Number.isFinite(n)) return fallback01;
    if (n > 1.000001) return n / 100;
    return n;
  }

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;
    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      .ah-forge-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:2147483640;display:flex;align-items:flex-end;justify-content:center}
      .ah-forge{width:min(1040px,100%);max-height:90vh;background:rgba(14,16,18,.97);border:1px solid rgba(255,255,255,.08);
        border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 40px rgba(0,0,0,.55);color:#f4f6ff}
      .ah-forge *{color:inherit}
      .ah-forge-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(255,255,255,.08)}
      .ah-forge-title{font-weight:900;letter-spacing:.3px}
      .ah-forge-sub{opacity:.78;font-size:12px;margin-top:2px}
      .ah-forge-close{border:0;background:transparent;font-size:18px;opacity:.85}
      .ah-forge-tabs{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
      .ah-forge-tab{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06);font-weight:900;opacity:.92}
      .ah-forge-tab.active{background:rgba(255,255,255,.16);opacity:1}
      .ah-forge-body{padding:14px;overflow:auto;max-height:calc(90vh - 118px)}
      .ah-forge-bal{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      .ah-pill{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-weight:900;font-size:12px;opacity:.95}
      .ah-note{padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);margin-bottom:10px}
      .ah-small{opacity:.88;font-size:12px}
      .ah-split{display:grid;grid-template-columns:1fr;gap:12px}
      @media(min-width:860px){.ah-split{grid-template-columns:1.1fr .9fr}}
      .ah-list{display:grid;grid-template-columns:1fr;gap:10px}
      .ah-card{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.07);border-radius:14px}
      .ah-left{display:flex;align-items:center;gap:10px;min-width:0}
      .ah-ico{width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.25);overflow:hidden;flex:0 0 auto}
      .ah-ico img{width:100%;height:100%;object-fit:cover;display:block}
      .ah-meta{display:flex;flex-direction:column;gap:3px;min-width:0}
      .ah-meta b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-line{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-btn{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-weight:900}
      .ah-btn:disabled{opacity:.45}
      .ah-btnrow{display:flex;gap:8px;flex-wrap:wrap}
      .ah-field{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);border-radius:14px}
      .ah-field label{font-weight:900}
      .ah-field select,.ah-field input{width:180px;max-width:55vw;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.07)}
      .ah-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;background:rgba(0,0,0,.78);
        padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);z-index:2147483641;max-width:min(560px,92vw)}
      .ah-divider{height:1px;background:rgba(255,255,255,.10);margin:10px 0}
      .ah-results{display:grid;grid-template-columns:1fr;gap:10px}
      @media(min-width:560px){.ah-results{grid-template-columns:1fr 1fr}}
      .ah-result{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.06)}
      .ah-tag{font-size:11px;opacity:.9;border:1px solid rgba(255,255,255,.10);padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.25);font-weight:900}
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
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

  // local override pity after craft (until backend always returns pityMap in /state)
  let _pityOverride = {};
  let _lastCraft = { slot: null, made: [], spent: null, echo: null };

  function getCfg() {
    const cfg = (_state && _state.craftCfg) || {};
    const weights = cfg.weights || {};

    const baseCost = _num(cfg.baseCost ?? cfg.baseShardCost, 5);
    const refineCost = _num(cfg.refineCost ?? cfg.refineAdd, 2);
    const pityTrigger = _num(cfg.pityTrigger ?? cfg.pity ?? cfg.pityN, 5);

    let uncommonBase = cfg.uncommonBase ?? cfg.baseUncommon;
    if (uncommonBase == null) {
      const wc = _num(weights.common, 80);
      const wu = _num(weights.uncommon, 20);
      const total = wc + wu;
      uncommonBase = total > 0 ? (wu / total) : 0.20;
    }
    uncommonBase = _pct01(uncommonBase, 0.20);

    let uncommonRefineAdd = cfg.uncommonRefineAdd ?? cfg.refineUncommonAdd;
    if (uncommonRefineAdd == null) uncommonRefineAdd = 0.05;
    uncommonRefineAdd = _pct01(uncommonRefineAdd, 0.05);

    let uncommonCap = cfg.uncommonCap;
    uncommonCap = _pct01(uncommonCap, 0.55);

    // optional (if backend provides)
    const pEpic = _pct01(cfg.pEpic ?? cfg.epicBase ?? 0, 0);
    const pLegendary = _pct01(cfg.pLegendary ?? cfg.legendaryBase ?? 0, 0);

    return {
      baseCost,
      refineCost,
      pity: pityTrigger,
      uncommonBase,
      uncommonRefineAdd,
      uncommonCap,
      pEpic,
      pLegendary,
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
    [
      ["Bones", b.bones],
      ["Scrap", b.scrap],
      ["Rune Dust", b.rune_dust],
    ].forEach(([k, v]) => {
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
          run_id: rid("web_upg"),
        });
        await loadState();
        toast(`Upgraded ${it.slotLabel}.`);
      } catch (e) {
        toast(`Upgrade failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();
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

      panel.innerHTML = `
        <b>${esc(it.slotLabel)}</b>
        <div class="ah-small">${esc(it.name || "—")} · <span class="ah-tag">${esc(it.rarity || "common")}</span></div>
        <div class="ah-divider"></div>
        <div class="ah-small">Stars: <b>★${it.stars}</b> / ★${it.maxStars}</div>
        ${cost ? `<div class="ah-small">Next cost: <b>${fmtCost(cost)}</b></div>` : `<div class="ah-small">No further upgrades.</div>`}
        ${miss.length ? `<div class="ah-small"><i>Missing:</i> ${esc(miss.join(", "))}</div>` : ``}
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

      const btn = el("button", "ah-btn", it.canUpgrade ? "Upgrade" : "Maxed");
      btn.type = "button";
      btn.disabled = _busy || !it.canUpgrade;

      row.addEventListener("click", () => {
        selectedKey = it.key;
        drawPanel(it);
        if (window.innerWidth < 860) panel.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        doUpgrade(it);
      });

      row.appendChild(btn);
      list.appendChild(row);
    });

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

    const pools = pick(_state, "rollCfg.pools", null);
    const poolsLine = pools
      ? ` · Pools: C ${pools.common||0} / U ${pools.uncommon||0} / E ${pools.epic||0} / L ${pools.legendary||0}`
      : "";

    const basePlus = Math.min(1, (cfg.uncommonBase || 0) + (cfg.pEpic || 0) + (cfg.pLegendary || 0));

    body.appendChild(
      el("div", "ah-note",
        `<b>Shards Craft</b>
         <div class="ah-small">
          Base cost: <b>${cfg.baseCost}</b> · Refine +<b>${cfg.refineCost}</b>/lvl ·
          Uncommon+: <b>${Math.round(basePlus*100)}%</b>
          ${((cfg.pEpic||0) > 0 || (cfg.pLegendary||0) > 0) ? `(Epic ${(cfg.pEpic*100).toFixed(2)}% · Legendary ${(cfg.pLegendary*100).toFixed(2)}% · Uncommon ${Math.round(cfg.uncommonBase*100)}%)` : ``}
          · Pity <b>${cfg.pity}</b>${poolsLine}
         </div>
         <div class="ah-small">Epic/Legendary roll only if this slot has items in that rarity.</div>`
      )
    );

    const form = el("div", "ah-split");

    // controls
    const controls = el("div", "ah-note");
    controls.appendChild(el("div", "", `<b>Controls</b><div class="ah-small">Craft pulls from <b>{slot}_shards</b>.</div>`));

    function currentPity(slot) {
      const fromState = _state && _state.pityMap && _state.pityMap[slot];
      if (fromState != null) return fromState;
      const fromOverride = _pityOverride && _pityOverride[slot];
      return (fromOverride != null ? fromOverride : null);
    }

    const fSlot = el("div", "ah-field");
    fSlot.appendChild(el("label", "", "Slot"));
    const sel = document.createElement("select");

    function refreshSlotLabels() {
      Array.from(sel.options).forEach((opt) => {
        const s = opt.value;
        opt.textContent = `${s} (${shardsHave(s)})`;
      });
    }

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
    inpRef.max = "5";
    inpRef.value = "0";
    fRefine.appendChild(inpRef);

    const fCost = el("div", "ah-note", "");
    const fDbg = el("div", "ah-small", "");

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

      const pU = Math.min((cfg.uncommonBase || 0) + (cfg.uncommonRefineAdd || 0) * r, (cfg.uncommonCap || 1));
      const pity = currentPity(slot);

      fCost.innerHTML = `
        <b>Cost preview</b>
        <div class="ah-small">
          Asset: <b>${esc(slot)}_shards</b><br>
          Have: <b>${have}</b> · Per: <b>${per}</b> · Total: <b>${total}</b> · After: <b>${left}</b><br>
          Uncommon chance: <b>${Math.round(pU * 100)}%</b>${pity != null ? ` · Pity: <b>${pity}</b>/${cfg.pity}` : ``}
        </div>
      `;

      // tiny debug line for sanity
      fDbg.textContent = `preview(per=${per}, total=${total}, count=${n}, refine=${r})`;
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

      const per = (cfg.baseCost || 5) + refine * (cfg.refineCost || 2);
      const total = per * count;

      // client-side check (best-effort)
      const have = shardsHave(slot);
      if (have < total) {
        toast(`Not enough ${slot}_shards (need ${total}, have ${have}).`);
        return;
      }

      _busy = true;
      draw();

      try {
        const run_id = rid("web_craft");
        const res = await post("/webapp/forge/craft", {
          buildingId: _ctx.buildingId,
          slot,
          count,
          refine,
          run_id,
          // helps debugging mismatches in backend logs (ignored if backend doesn’t care)
          client_preview: { per, total, have, slot, count, refine },
        });

        // unwrap common shapes
        const data = pick(res, "data", null) || pick(res, "result.data", null) || null;

        const made = pick(res, "made", null) || pick(res, "result.made", null) || [];
        const pityMap = pick(res, "pityMap", null) || pick(res, "result.pityMap", null) || pick(data, "pityMap", null);
        const pity = pick(res, "pity", null) ?? pick(res, "result.pity", null) ?? pick(data, "pity", null);

        const spent = pick(res, "spent", null) ?? pick(res, "need", null) ?? pick(res, "result.spent", null);
        const echo = pick(res, "echo", null) || pick(res, "result.echo", null) || null;
        const have_after = pick(res, "have_after", null) ?? pick(res, "result.have_after", null) ?? pick(data, `shards.${slot}_shards`, null);

        _lastCraft = { slot, made, spent: spent != null ? Number(spent) : null, echo };

        // ✅ prefer full payload
        if (data) {
          _state = data;
        } else {
          // patch minimal state bits (so UI doesn’t lag)
          _state = _state || {};
          _state.shards = _state.shards || {};
          if (have_after != null) _state.shards[`${slot}_shards`] = Number(have_after);

          if (pityMap) _state.pityMap = pityMap;
          else if (pity != null) {
            _state.pityMap = _state.pityMap || {};
            _state.pityMap[slot] = Number(pity);
          }
        }

        // update override too (for UI that reads override)
        if (pityMap && pityMap[slot] != null) _pityOverride[slot] = Number(pityMap[slot]);
        else if (pity != null) _pityOverride[slot] = Number(pity);

        // mismatch detector (this answers your “why 15?” instantly)
        if (spent != null && Number(spent) !== Number(total)) {
          const eCnt = echo && echo.count != null ? `count=${echo.count}` : `count=${count}`;
          const eRef = echo && echo.refine != null ? `refine=${echo.refine}` : `refine=${refine}`;
          toast(`Server spent ${spent} (preview ${total}) · ${eCnt} ${eRef}`);
        } else {
          toast(made.length ? `Crafted ${made.length} item(s).` : "Craft complete.");
        }

        // refresh dropdown + preview
        try { refreshSlotLabels(); } catch (_) {}
        try { updateCost(); } catch (_) {}

        // clear error box on success
        const uiErrorEl = document.getElementById("forge-error");
        if (uiErrorEl) uiErrorEl.textContent = "";

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

        const status = e?.status ?? e?.data?.status ?? "";
        const payload = e?.data?.data || e?.data || {};
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
    controls.appendChild(fDbg);
    controls.appendChild(btn);

    // results
    const results = el("div", "ah-note");
    results.appendChild(el("div", "", `<b>Results</b><div class="ah-small">Your last craft shows here.</div>`));

    const out = el("div", "ah-results");

    function drawResults() {
      out.innerHTML = "";

      const made = (_lastCraft && _lastCraft.made) || [];
      if (!made.length) {
        out.appendChild(el("div", "ah-small", "No craft results yet."));
      } else {
        made.forEach((it) => {
          const obj = (typeof it === "string") ? { key: it } : (it || {});
          const card = el("div", "ah-result");
          const ico = el("div", "ah-ico");

          const img = document.createElement("img");
          img.alt = obj.name || obj.key || "item";
          img.src = obj.icon || "";
          img.onerror = () => { img.remove(); ico.textContent = "✦"; };
          ico.appendChild(img);

          const meta = el("div", "ah-meta");
          meta.appendChild(el("div", "ah-line", `<b>${esc(obj.name || obj.key || "Item")}</b>`));
          meta.appendChild(el("div", "ah-small", `<span class="ah-tag">${esc(obj.rarity || "common")}</span> · ${esc(_lastCraft.slot || "")}`));

          card.appendChild(ico);
          card.appendChild(meta);
          out.appendChild(card);
        });
      }

      // extra line: spent/echo
      const spent = _lastCraft && _lastCraft.spent;
      const echo = _lastCraft && _lastCraft.echo;
      if (spent != null || echo) {
        const txt = [
          (spent != null ? `spent=${spent}` : null),
          (echo && echo.count != null ? `count=${echo.count}` : null),
          (echo && echo.refine != null ? `refine=${echo.refine}` : null),
        ].filter(Boolean).join(" · ");
        out.appendChild(el("div", "ah-small", txt));
      }
    }

    drawResults();
    results.appendChild(el("div", "ah-divider", ""));
    results.appendChild(out);

    form.appendChild(controls);
    form.appendChild(results);
    body.appendChild(form);

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
    const res = await post("/webapp/forge/state", { buildingId: _ctx.buildingId, run_id: rid("forge_state") });
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
    // keep _pityOverride and _lastCraft across opens (nice UX)
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
