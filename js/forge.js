// js/forge.js — Forge Hub modal (Upgrade / Reforge / Fuse) for Alpha Husky WebApp
(function () {
  const API_BASE = window.API_BASE || ""; // e.g. https://api.alphahusky.win

  function getTg() {
    return window.tg || (window.Telegram && window.Telegram.WebApp) || null;
  }

  async function forgePost(path, payload) {
    const tg = getTg();
    const initData = (tg && tg.initData) || window.__INIT_DATA__ || "";
    const body = JSON.stringify({ init_data: initData, ...(payload || {}) });

    const res = await fetch((API_BASE || "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    let json = null;
    try { json = await res.json(); } catch (e) {}
    if (!res.ok) {
      const reason = (json && (json.reason || json.error)) || `HTTP_${res.status}`;
      throw new Error(reason);
    }
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
    if (document.getElementById("forge-styles")) return;
    const s = el("style");
    s.id = "forge-styles";
    s.textContent = `
      .forge-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center}
      .forge-modal{width:min(960px,100%);max-height:88vh;background:rgba(14,16,18,.96);border:1px solid rgba(255,255,255,.08);
        border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 40px rgba(0,0,0,.55)}
      .forge-head{display:flex;align-items:center;justify-content:space-between;padding:14px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
      .forge-title{font-weight:800;letter-spacing:.3px}
      .forge-close{border:0;background:transparent;color:#fff;font-size:18px;opacity:.8}
      .forge-tabs{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.06)}
      .forge-tab{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-weight:700;opacity:.9}
      .forge-tab.active{background:rgba(255,255,255,.10);opacity:1}
      .forge-body{padding:14px;overflow:auto;max-height:calc(88vh - 120px)}
      .forge-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);border-radius:14px;margin-bottom:10px;gap:10px}
      .forge-meta{display:flex;flex-direction:column;gap:3px}
      .forge-small{opacity:.75;font-size:12px}
      .forge-btn{padding:8px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);font-weight:800}
      .forge-btn:disabled{opacity:.45}
      .forge-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;background:rgba(0,0,0,.75);color:#fff;
        padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.12);z-index:10000;max-width:min(520px,92vw)}
      .forge-bal{display:flex;gap:10px;flex-wrap:wrap}
      .forge-pill{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);font-weight:800;font-size:12px;opacity:.95}
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "forge-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function bodyScrollLock(lock) {
    document.documentElement.classList.toggle("modal-open", !!lock);
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  let _root = null;
  let _tab = "upgrade";
  let _state = null;
  let _busy = false;

  function renderBalances(container) {
    const b = (_state && _state.balances) || {};
    const wrap = el("div", "forge-bal");
    const pills = [
      ["Bones", b.bones],
      ["Scrap", b.scrap],
      ["Rune Dust", b.rune_dust],
    ];
    pills.forEach(([k, v]) => {
      if (v == null) return;
      wrap.appendChild(el("div", "forge-pill", `${k}: ${v}`));
    });
    container.appendChild(wrap);
  }

  function renderUpgrade(body) {
    const eq = (_state && _state.equipped) || [];
    if (!eq.length) {
      body.appendChild(el("div", "forge-small", "No equipped items found."));
      return;
    }

    eq.forEach((it) => {
      const row = el("div", "forge-row");
      const meta = el("div", "forge-meta");
      meta.appendChild(el("div", "", `<b>${it.slotLabel}</b> — ${it.name || "—"}`));
      meta.appendChild(el("div", "forge-small", `★${it.stars} / ${it.maxStars}`));
      if (it.costNext) {
        meta.appendChild(
          el(
            "div",
            "forge-small",
            `Next cost: Bones ${it.costNext.bones || 0} · Scrap ${it.costNext.scrap || 0} · RuneDust ${it.costNext.rune_dust || 0}`
          )
        );
      }
      row.appendChild(meta);

      const btn = el("button", "forge-btn", it.canUpgrade ? "Upgrade" : "Maxed");
      btn.disabled = _busy || !it.canUpgrade;
      btn.addEventListener("click", async () => {
        if (_busy) return;
        _busy = true;
        btn.disabled = true;
        try {
          await forgePost("/webapp/forge/upgrade", {
            slot: it.slot,
            run_id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          });
          await loadState();
          draw();
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

  function renderReforge(body) {
    body.appendChild(el("div", "forge-small",
      "Reforge: MVP UI ready — wire your exact reforge rules via /webapp/forge/reforge."
    ));
    const btn = el("button", "forge-btn", "Open Reforge (soon)");
    btn.disabled = true;
    body.appendChild(btn);
  }

  function renderFuse(body) {
    body.appendChild(el("div", "forge-small",
      "Fuse: MVP UI ready — wire your exact fuse rules via /webapp/forge/fuse."
    ));
    const btn = el("button", "forge-btn", "Open Fuse (soon)");
    btn.disabled = true;
    body.appendChild(btn);
  }

  function draw() {
    if (!_root) return;
    const body = _root.querySelector(".forge-body");
    const tabs = _root.querySelectorAll(".forge-tab");
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === _tab));

    body.innerHTML = "";
    renderBalances(body);
    body.appendChild(el("div", "forge-small", "&nbsp;"));

    if (_tab === "upgrade") renderUpgrade(body);
    else if (_tab === "reforge") renderReforge(body);
    else renderFuse(body);
  }

  async function loadState() {
    const res = await forgePost("/webapp/forge/state", {});
    _state = (res && (res.data || res)) || null;
  }

  function mount() {
    ensureStyles();
    bodyScrollLock(true);

    const backdrop = el("div", "forge-modal-backdrop");
    const modal = el("div", "forge-modal");
    const head = el("div", "forge-head");
    head.appendChild(el("div", "forge-title", "Forge Hub"));
    const close = el("button", "forge-close", "✕");
    close.addEventListener("click", unmount);
    head.appendChild(close);

    const tabs = el("div", "forge-tabs");
    ["upgrade", "reforge", "fuse"].forEach((k) => {
      const t = el("button", "forge-tab", k.toUpperCase());
      t.dataset.tab = k;
      t.addEventListener("click", () => {
        _tab = k;
        draw();
      });
      tabs.appendChild(t);
    });

    const body = el("div", "forge-body", `<div class="forge-small">Loading…</div>`);

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
    bodyScrollLock(false);
    if (_root) _root.remove();
    _root = null;
    _state = null;
    _busy = false;
    _tab = "upgrade";
  }

  async function open() {
    mount();
    try {
      await loadState();
      draw();
    } catch (e) {
      draw();
      toast(`Forge load failed: ${e.message}`);
    }
  }

  window.Forge = {
    init() {},
    open,
    close: unmount,
  };
})();
