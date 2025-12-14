// js/forge.js — Vault Forge Hub (Upgrade + Shards Craft) for Alpha Husky WebApp
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
    // Fallback (shouldn't be needed if you pass apiPost)
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

  function ensureStyles() {
    if (document.getElementById("ah-forge-styles")) return;
    const s = el("style");
    s.id = "ah-forge-styles";
    s.textContent = `
      .ah-forge-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
      .ah-forge{width:min(980px,100%);max-height:90vh;background:rgba(14,16,18,.97);border:1px solid rgba(255,255,255,.08);
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
      .ah-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);border-radius:14px;margin-bottom:10px;gap:10px}
      .ah-meta{display:flex;flex-direction:column;gap:3px}
      .ah-small{opacity:.75;font-size:12px}
      .ah-btn{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-weight:900}
      .ah-btn:disabled{opacity:.45}
      .ah-grid{display:grid;grid-template-columns:1fr;gap:10px}
      .ah-craft{display:grid;grid-template-columns:1fr;gap:10px}
      .ah-field{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);border-radius:14px}
      .ah-field label{font-weight:900}
      .ah-field select,.ah-field input{width:160px;max-width:50vw;padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.25);color:#fff}
      .ah-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;background:rgba(0,0,0,.75);color:#fff;
        padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);z-index:10000;max-width:min(560px,92vw)}
      .ah-note{padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);margin-bottom:10px}
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2300);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  let _root = null;
  let _tab = "upgrade";
  let _state = null;
  let _busy = false;
  let _ctx = { buildingId: null, name: "Vault Forge" };

  function renderBalances(container) {
    const b = (_state && _state.balances) || {};
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

  function renderUpgrade(body) {
    const eq = (_state && _state.equipped) || [];
    if (!eq.length) {
      body.appendChild(el("div", "ah-small", "No equipped items found."));
      return;
    }

    eq.forEach((it) => {
      const row = el("div", "ah-row");
      const meta = el("div", "ah-meta");
      meta.appendChild(el("div", "", `<b>${it.slotLabel}</b> — ${it.name || "—"}`));
      meta.appendChild(el("div", "ah-small", `★${it.stars} / ${it.maxStars}`));
      if (it.costNext) {
        meta.appendChild(
          el(
            "div",
            "ah-small",
            `Next cost: Bones ${it.costNext.bones || 0} · Scrap ${it.costNext.scrap || 0} · RuneDust ${it.costNext.rune_dust || 0}`
          )
        );
      }
      row.appendChild(meta);

      const btn = el("button", "ah-btn", it.canUpgrade ? "Upgrade" : "Maxed");
      btn.disabled = _busy || !it.canUpgrade;

      btn.addEventListener("click", async () => {
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
        }
      });

      row.appendChild(btn);
      body.appendChild(row);
    });
  }

  function renderCraft(body) {
    const cfg = (_state && _state.craftCfg) || {
      baseCost: 5,
      refineCost: 2,
      rng80_20: true,
      pity: 5,
    };
    const shardSlots = (_state && _state.shardSlots) || [
      "weapon","armor","fangs","cloak","collar","helmet","ring","offhand","gloves"
    ];

    body.appendChild(
      el(
        "div",
        "ah-note",
        `<b>Shards Craft</b><div class="ah-small">
          Base cost: <b>${cfg.baseCost}</b> · Refine +<b>${cfg.refineCost}</b>/lvl · RNG 80/20 · Pity ${cfg.pity}
         </div>`
      )
    );

    const form = el("div", "ah-craft");

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

    const fRefine = el("div", "ah-field");
    fRefine.appendChild(el("label", "", "Refine"));
    const inpRef = document.createElement("input");
    inpRef.type = "number";
    inpRef.min = "0";
    inpRef.max = "10";
    inpRef.value = "0";
    fRefine.appendChild(inpRef);

    const fCost = el("div", "ah-note", "");
    function updateCost() {
      const n = Math.max(1, parseInt(inpCount.value || "1", 10));
      const r = Math.max(0, parseInt(inpRef.value || "0", 10));
      const per = (cfg.baseCost || 5) + r * (cfg.refineCost || 2);
      fCost.innerHTML = `<b>Cost preview</b><div class="ah-small">Per craft: Bones ${per} · Total: Bones ${per * n}</div>`;
    }
    inpCount.addEventListener("input", updateCost);
    inpRef.addEventListener("input", updateCost);
    updateCost();

    const btn = el("button", "ah-btn", "Craft");
    btn.disabled = _busy;

    btn.addEventListener("click", async () => {
      if (_busy) return;
      _busy = true;
      draw();

      const slot = sel.value;
      const count = Math.max(1, parseInt(inpCount.value || "1", 10));
      const refine = Math.max(0, parseInt(inpRef.value || "0", 10));

      try {
        const res = await post("/webapp/forge/craft", {
          buildingId: _ctx.buildingId,
          slot,
          count,
          refine,
          run_id: `web_craft_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        });

        const made = (res && (res.data?.made || res.made)) || [];
        await loadState();

        if (made.length) toast(`Crafted ${made.length} item(s).`);
        else toast("Craft complete.");
      } catch (e) {
        toast(`Craft failed: ${e.message}`);
      } finally {
        _busy = false;
        draw();
      }
    });

    form.appendChild(fSlot);
    form.appendChild(fCount);
    form.appendChild(fRefine);
    form.appendChild(fCost);
    form.appendChild(btn);
    body.appendChild(form);
  }

  function draw() {
    if (!_root) return;

    const title = _root.querySelector(".ah-forge-title");
    const sub = _root.querySelector(".ah-forge-sub");
    title.textContent = _ctx.name || "Vault Forge";
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
    left.appendChild(el("div", "ah-forge-title", _ctx.name || "Vault Forge"));
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
