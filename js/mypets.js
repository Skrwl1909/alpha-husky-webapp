// js/mypets.js
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _inited = false;
  let _backHandler = null;

  function log(...a) { if (_dbg) console.log("[MyPets]", ...a); }

  function q(sel, root=document) { return root.querySelector(sel); }
  function qa(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function ensureStyles() {
    if (document.getElementById("mypets-style")) return;
    const s = document.createElement("style");
    s.id = "mypets-style";
    s.textContent = `
      #mypetsModal{position:fixed;inset:0;display:none;z-index:9999;background:rgba(0,0,0,.58)}
      #mypetsModal .panel{
        position:absolute;left:50%;bottom:14px;transform:translateX(-50%);
        width:min(520px,calc(100% - 24px));max-height:82vh;overflow:auto;
        border-radius:16px;background:#0b0f16;border:1px solid rgba(255,255,255,.10)
      }
      #mypetsModal .head{
        display:flex;align-items:center;justify-content:space-between;
        padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)
      }
      #mypetsModal .head .t{font-weight:800;letter-spacing:.2px}
      #mypetsModal .head button{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer}
      #mypetsModal .sub{padding:0 14px 10px;opacity:.85;font-size:12px}
      #mypetsModal .list{padding:12px 14px;display:flex;flex-direction:column;gap:10px}
      .petRow{
        display:flex;gap:12px;align-items:center;
        padding:10px;border-radius:14px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.03)
      }
      .petRow.active{outline:2px solid rgba(137,255,254,.30)}
      .petImg{width:56px;height:56px;border-radius:12px;object-fit:cover;background:rgba(255,255,255,.06)}
      .petMeta{flex:1;min-width:0}
      .petName{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .petSub{opacity:.82;font-size:12px;margin-top:3px}
      .petBtn{
        padding:8px 10px;border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.06);color:#fff;cursor:pointer
      }
      .petBtn[disabled]{opacity:.6;cursor:default}
      .petErr{padding:14px;opacity:.85}
    `;
    document.head.appendChild(s);
  }

  function ensureModal() {
    let el = document.getElementById("mypetsModal");
    if (el) return el;

    el = document.createElement("div");
    el.id = "mypetsModal";
    el.innerHTML = `
      <div class="panel" role="dialog" aria-modal="true">
        <div class="head">
          <div class="t">My Pets</div>
          <button type="button" data-close aria-label="Close">✕</button>
        </div>
        <div class="sub">Tap a pet to set it active.</div>
        <div class="list" id="mypetsList"></div>
      </div>
    `;

    el.addEventListener("click", (e) => {
      if (e.target === el) close();
      const closeBtn = e.target?.closest?.("[data-close]");
      if (closeBtn) close();
    });

    document.body.appendChild(el);
    return el;
  }

  function showBack() {
    try {
      const BB = _tg?.BackButton;
      if (!BB) return;
      _backHandler = () => close();
      BB.show();
      BB.onClick(_backHandler);
    } catch (_) {}
  }

  function hideBack() {
    try {
      const BB = _tg?.BackButton;
      if (!BB) return;
      if (_backHandler) {
        try { BB.offClick(_backHandler); } catch (_) {}
      }
      _backHandler = null;
      BB.hide();
    } catch (_) {}
  }

  function toast(msg) {
    try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
    try { _tg?.showPopup?.({ message: msg }); return; } catch (_) {}
    console.log(msg);
  }

  function runId(prefix="mypets") {
    return `${prefix}:${Date.now()}:${Math.random().toString(16).slice(2)}`;
  }

  async function loadState() {
    const list = document.getElementById("mypetsList");
    if (!list) return;
    list.innerHTML = "Loading…";

    const res = await _apiPost("/webapp/pets/state", { run_id: runId("mypets_state") });
    if (!res || !res.ok) {
      list.innerHTML = `<div class="petErr">Failed to load pets.</div>`;
      return null;
    }
    return res.pets || null; // { activePetId, pets:{...} }
  }

  function toArray(state) {
    const dict = (state && state.pets) ? state.pets : {};
    return Object.values(dict || {});
  }

  function render(state) {
    const list = document.getElementById("mypetsList");
    if (!list) return;

    const activeId = state?.activePetId || null;
    const items = toArray(state);

    // aktywny na górę, potem lvl desc
    items.sort((a,b) => {
      const aa = (a.is_active === true) ? 1 : 0;
      const bb = (b.is_active === true) ? 1 : 0;
      if (aa !== bb) return bb - aa;
      return (Number(b.level||1) - Number(a.level||1));
    });

    if (!items.length) {
      list.innerHTML = `<div class="petErr">No pets found.</div>`;
      return;
    }

    list.innerHTML = items.map(p => {
      const isA = !!p.is_active || (p.id === activeId);
      const img = p.icon || p.img || "";
      const sub = `${p.arena_label || p.arena_type || "Pet"} • Lv ${p.level || 1} • XP ${p.xp || 0}/${p.xp_needed || ((p.level||1)*20)}`;
      const desc = p.arena_desc ? ` — ${p.arena_desc}` : "";
      return `
        <div class="petRow ${isA ? "active" : ""}" data-row="${escapeHtml(p.id)}">
          ${img ? `<img class="petImg" src="${img}" />` : `<div class="petImg"></div>`}
          <div class="petMeta">
            <div class="petName">${escapeHtml(p.name || "Pet")}</div>
            <div class="petSub">${escapeHtml(sub + desc)}</div>
          </div>
          <button class="petBtn" type="button" data-set="${escapeHtml(p.id)}" ${isA ? "disabled" : ""}>
            ${isA ? "Active" : "Set"}
          </button>
        </div>
      `;
    }).join("");

    // klik w cały row też ustawia
    qa(".petRow", list).forEach(row => {
      row.addEventListener("click", (e) => {
        const btn = e.target?.closest?.("[data-set]");
        if (btn) return; // i tak obsłużymy przyciskiem
        const pid = row.getAttribute("data-row");
        if (!pid) return;
        const active = row.classList.contains("active");
        if (!active) setActive(pid);
      });
    });

    qa("[data-set]", list).forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pid = btn.getAttribute("data-set");
        if (pid) await setActive(pid);
      });
    });

    // fallback: ukryj obrazek jeśli 404
    qa(".petImg", list).forEach(img => {
      img.addEventListener("error", () => { img.style.display = "none"; });
    });
  }

  async function setActive(petId) {
    if (!_apiPost) return;

    const list = document.getElementById("mypetsList");
    if (list) {
      qa("[data-set]", list).forEach(b => b.disabled = true);
    }

    const res = await _apiPost("/webapp/pets/set", { petId, run_id: runId("mypets_set") });
    if (!res || !res.ok) {
      toast("Failed to set active pet.");
      if (list) qa("[data-set]", list).forEach(b => b.disabled = false);
      return;
    }

    // odśwież dane w webapp (profil / staty / mapa)
    try { typeof window.loadProfile === "function" && window.loadProfile(); } catch (_) {}
    try { typeof window.loadPlayerState === "function" && window.loadPlayerState(); } catch (_) {}
    try { typeof window.renderMap === "function" && window.renderMap(); } catch (_) {}

    toast("Active pet updated ✅");

    const state = res.pets || null;
    if (state) render(state);
    else {
      // jakby backend nie zwrócił payloadu, dociągnij
      const st = await loadState();
      if (st) render(st);
    }
  }

  async function open() {
    ensureStyles();
    ensureModal().style.display = "block";
    showBack();
    const st = await loadState();
    if (st) render(st);
  }

  function close() {
    const el = document.getElementById("mypetsModal");
    if (el) el.style.display = "none";
    hideBack();
  }

  function bindButton() {
    // Najlepiej: dodaj klasę .mypets do buttona (patrz niżej),
    // ale mamy też fallback po tekście.
    let btn = q(".btn.mypets") || q('[data-action="mypets"]');
    if (!btn) {
      btn = qa("button.btn").find(b => (b.textContent || "").trim().toLowerCase() === "mypets");
    }
    if (!btn) return;

    try { btn.disabled = false; btn.classList.remove("disabled"); } catch (_) {}
    btn.addEventListener("click", (e) => { e.preventDefault(); open(); });
    log("MyPets button bound");
  }

  window.MyPets = {
    init({ apiPost, tg, dbg } = {}) {
      _apiPost = apiPost || _apiPost;
      _tg = tg || _tg;
      _dbg = !!dbg;
      if (_inited) { bindButton(); return; }
      _inited = true;
      bindButton();
      log("inited");
    },
    open,
    close
  };
})();
