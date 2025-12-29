// Alpha Husky WebApp — Adopt Center (bones + token exclusive)
// Drop-in: window.Adopt.init({ apiPost, tg, dbg }); window.Adopt.open();
//
// Backend endpoints:
//   POST /webapp/adopt/state
//   POST /webapp/adopt/buy  { petType, run_id? }

(function () {
  const S = {
    apiPost: null,
    tg: null,
    dbg: false,

    busy: false,
    state: null,

    back: null,
    body: null,
    escHandler: null,
  };

  // ---------- utils ----------
  const log = (...a) => S.dbg && console.log("[Adopt]", ...a);

  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function toast(msg) {
    if (typeof window.toast === "function") return window.toast(msg);

    ensureStyles();
    const t = el("div", "ah-toast", String(msg || ""));
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 250);
    }, 2200);
  }

  function makeRunId(prefix, key) {
    if (typeof window.AH_makeRunId === "function") return window.AH_makeRunId(prefix, key);
    try { return crypto.randomUUID(); } catch (_) {}
    return `rid_${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}_${String(key || "").slice(0, 24)}`;
  }

  function lockScroll(on) {
    document.body.classList.toggle("adopt-lock", !!on);
  }

  // ---------- styles ----------
  function ensureStyles() {
    if (document.getElementById("adopt-styles")) return;

    const style = document.createElement("style");
    style.id = "adopt-styles";
    style.textContent = `
      .adopt-backdrop{
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,.55);
        display:flex; align-items:flex-end; justify-content:center;
      }
      .adopt-modal{
        width:100%; max-width:720px;
        background:rgba(18,18,22,.96);
        border-radius:22px 22px 0 0;
        box-shadow:0 -18px 60px rgba(0,0,0,.65);
        overflow:hidden;
        border:1px solid rgba(255,255,255,.06);
      }
      .adopt-head{
        display:flex; align-items:center; justify-content:space-between;
        padding:12px 12px 10px 12px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0));
      }
      .adopt-head-left{ display:flex; align-items:center; gap:10px; min-width:0; }
      .adopt-title{ font-weight:750; font-size:16px; letter-spacing:.2px; }
      .adopt-sub{ opacity:.82; font-size:12px; margin-top:2px; }
      .adopt-backbtn{
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        color:inherit;
        border-radius:12px;
        padding:6px 10px;
        cursor:pointer;
        font-weight:700;
        font-size:12px;
        opacity:.95;
      }
      .adopt-backbtn:active{ transform: translateY(1px); }

      .adopt-close{
        border:0; background:transparent; color:inherit;
        font-size:20px; padding:6px 10px; cursor:pointer;
        opacity:.9;
      }

      .adopt-body{ padding:12px 14px 18px 14px; max-height:78vh; overflow:auto; }
      .adopt-bal{ display:flex; gap:10px; flex-wrap:wrap; margin:8px 0 14px; }
      .adopt-chip{
        padding:6px 10px; border-radius:999px;
        background:rgba(255,255,255,.08);
        font-size:12px; opacity:.96;
      }

      .adopt-section{ margin-top:12px; }
      .adopt-section h3{
        margin:0 0 8px; font-size:13px; letter-spacing:.2px; opacity:.95;
      }

      .adopt-grid{
        display:grid;
        grid-template-columns: 1fr;
        gap:10px;
      }
      @media (min-width: 560px){
        .adopt-grid{ grid-template-columns: 1fr 1fr; }
      }

      .adopt-card{
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
        border-radius:16px;
        padding:10px;
        display:flex; gap:10px;
      }

      .adopt-img{
        width:56px; height:56px; border-radius:14px;
        background:rgba(0,0,0,.25);
        flex:0 0 auto;
        overflow:hidden;
        display:flex; align-items:center; justify-content:center;
        position:relative;
      }
      .adopt-img img{ width:100%; height:100%; object-fit:cover; display:block; }

      /* skeleton/shimmer */
      .adopt-skel{
        position:absolute; inset:0;
        background:linear-gradient(90deg,
          rgba(255,255,255,.06),
          rgba(255,255,255,.12),
          rgba(255,255,255,.06)
        );
        background-size:200% 100%;
        animation: adoptShimmer 1.1s linear infinite;
      }
      @keyframes adoptShimmer{
        0%{ background-position: 200% 0; }
        100%{ background-position: -200% 0; }
      }

      /* EXCLUSIVE badge */
      .adopt-badge{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:3px 8px;
        border-radius:999px;
        font-size:11px;
        font-weight:800;
        letter-spacing:.3px;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.14);
        opacity:.95;
        white-space:nowrap;
      }
      .adopt-badge.excl{
        background:rgba(0,229,255,.16);
        border-color:rgba(0,229,255,.28);
      }

      .adopt-name-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      .adopt-meta{ flex:1; min-width:0; }
      .adopt-name{ font-weight:750; font-size:13px; margin-bottom:4px; }
      .adopt-desc{ font-size:12px; opacity:.86; line-height:1.25; }

      .adopt-actions{
        display:flex; align-items:center; justify-content:space-between;
        gap:10px; margin-top:10px;
      }
      .adopt-price{ font-size:12px; opacity:.9; white-space:nowrap; }

      .adopt-btn{
        border:0; border-radius:12px;
        padding:8px 10px;
        background:rgba(0,229,255,.18);
        color:inherit; font-weight:800;
        cursor:pointer;
      }
      .adopt-btn[disabled]{ opacity:.45; cursor:not-allowed; }

      .ah-toast{
        position:fixed; left:50%; bottom:18px; transform:translateX(-50%);
        background:rgba(0,0,0,.78);
        border:1px solid rgba(255,255,255,.12);
        padding:10px 12px; border-radius:14px;
        opacity:0; transition:opacity .18s ease;
        z-index:10000; max-width:90vw;
      }
      .ah-toast.show{ opacity:1; }
      body.adopt-lock{ overflow:hidden; }
    `;
    document.head.appendChild(style);
  }

  // ---------- payload helpers ----------
  function petKey(p) {
    return (p && (p.petType || p.pet_type || p.type || p.key || p.id)) || "";
  }

  function priceText(p) {
    const cost = p?.cost || {};
    const tok = Number(p?.price_tokens ?? p?.tokens ?? p?.tokenCost ?? cost.tokens ?? cost.token ?? 0);
    const bon = Number(p?.price ?? p?.price_bones ?? p?.bones ?? p?.boneCost ?? cost.bones ?? 0);
    if (tok > 0 && bon > 0) return `${bon} Bones + ${tok} Tokens`;
    if (tok > 0) return `${tok} Tokens`;
    if (bon > 0) return `${bon} Bones`;
    return "";
  }

  function balances(state) {
    const r = state?.resources || state?.balances || state || {};
    return {
      bones: Number(r.bones ?? 0),
      tokens: Number(r.tokens ?? r.token ?? 0),
    };
  }

  function offers(state) {
    // supporting multiple schemas
    const o = state?.offers || state?.catalog || state?.adopt || {};
    const token = o.token || o.tokens || o.tokenPets || o.exclusive || o.exclusiveTokens || [];
    const bones = o.bones || o.bonePets || o.standard || o.free || [];
    return {
      token: Array.isArray(token) ? token : [],
      bones: Array.isArray(bones) ? bones : [],
    };
  }

  function humanReason(reason) {
    const R = String(reason || "").toUpperCase();
    if (R.includes("NOT_ENOUGH_TOKENS") || R.includes("NOT_ENOUGH_FUNDS")) return "Not enough tokens.";
    if (R.includes("NOT_ENOUGH_BONES")) return "Not enough bones.";
    if (R.includes("ALREADY_OWNED")) return "You already own this pet.";
    if (R.includes("UNKNOWN_PET") || R.includes("BAD_PET")) return "Unknown pet.";
    if (R.includes("MISSING")) return "Missing init data. Reopen the WebApp.";
    if (R.includes("HTTP_401") || R.includes("UNAUTHORIZED")) return "Unauthorized. Reopen the WebApp.";
    return reason || "Action failed.";
  }

  // ---------- UI builders ----------
  function disableButtons(disabled) {
    if (!S.body) return;
    S.body.querySelectorAll("button.adopt-btn").forEach((b) => {
      const owned = b.dataset.owned === "1";
      b.disabled = !!disabled || owned;
    });
  }

  function petCard(p) {
    const card = el("div", "adopt-card");

    // img + skeleton
    const imgWrap = el("div", "adopt-img");
    const skel = el("div", "adopt-skel");
    imgWrap.appendChild(skel);

    if (p.img) {
      const img = new Image();
      img.alt = p.name || petKey(p) || "pet";
      img.loading = "lazy";
      img.onload = () => { try { skel.remove(); } catch (_) {} };
      img.onerror = () => {
        try { skel.remove(); } catch (_) {}
        imgWrap.innerHTML = "";
        imgWrap.appendChild(el("div", "adopt-desc", "🐾"));
      };
      img.src = p.img;
      imgWrap.appendChild(img);
    } else {
      try { skel.remove(); } catch (_) {}
      imgWrap.appendChild(el("div", "adopt-desc", "🐾"));
    }

    const meta = el("div", "adopt-meta");

    // name row + exclusive badge
    const row = el("div", "adopt-name-row");
    row.appendChild(el("div", "adopt-name", p.name || petKey(p) || "Pet"));

    const isExclusive = !!(p.exclusive || p.isExclusive || (Number(p.price_tokens ?? p.tokens ?? 0) > 0));
    if (isExclusive) {
      row.appendChild(el("div", "adopt-badge excl", "EXCLUSIVE"));
    }

    meta.appendChild(row);
    meta.appendChild(el("div", "adopt-desc", p.desc || ""));

    const actions = el("div", "adopt-actions");
    actions.appendChild(el("div", "adopt-price", priceText(p)));

    const owned = !!(p.owned || p.isOwned);
    const btn = el("button", "adopt-btn", owned ? "Owned" : "Adopt");
    btn.type = "button";
    btn.dataset.owned = owned ? "1" : "0";
    btn.disabled = S.busy || owned;

    btn.addEventListener("click", async () => {
      if (S.busy) return;
      await buyPet(petKey(p));
    });

    actions.appendChild(btn);
    meta.appendChild(actions);

    card.appendChild(imgWrap);
    card.appendChild(meta);
    return card;
  }

  function section(title, list, emptyMsg) {
    const sec = el("div", "adopt-section");
    sec.appendChild(el("h3", "", title));

    const grid = el("div", "adopt-grid");
    if (!list.length) {
      sec.appendChild(el("div", "adopt-desc", emptyMsg));
      return sec;
    }

    list.forEach((p) => grid.appendChild(petCard(p)));
    sec.appendChild(grid);
    return sec;
  }

  function render(state) {
    if (!S.body) return;
    S.body.innerHTML = "";

    const b = balances(state);
    const bal = el("div", "adopt-bal");
    bal.appendChild(el("div", "adopt-chip", `Bones: ${b.bones}`));
    bal.appendChild(el("div", "adopt-chip", `Tokens: ${b.tokens}`));
    S.body.appendChild(bal);

    const { token, bones } = offers(state);

    S.body.appendChild(section(
      "Exclusive (Tokens)",
      token,
      "No token pets available right now (or you already own them)."
    ));

    S.body.appendChild(section(
      "Standard (Bones)",
      bones,
      "No adoptable pets with Bones (or you own them all)."
    ));

    if (S.busy) disableButtons(true);
  }

  // ---------- API ----------
  async function loadState() {
    if (!S.apiPost) throw new Error("Adopt not initialized (apiPost missing)");
    const out = await S.apiPost("/webapp/adopt/state", {});
    if (out && out.ok === false) throw new Error(out.reason || "STATE_FAIL");
    return out?.data ?? out;
  }

  async function buyPet(petType) {
    if (!petType) return;

    S.busy = true;
    disableButtons(true);

    try {
      const run_id = makeRunId("adopt", petType);
      const out = await S.apiPost("/webapp/adopt/buy", { petType, run_id });

      if (out && out.ok === false) {
        toast(humanReason(out.reason || "BUY_FAIL"));
        return;
      }

      const data = out?.data ?? out;
      const adopted = data?.adopted || data?.pet || {};
      toast(`Adopted: ${adopted?.name || petType}`);

      S.state = await loadState();
      render(S.state);
    } catch (e) {
      log("buyPet error", e);
      const reason = e?.data?.reason || e?.message || "Network error.";
      toast(humanReason(reason));
    } finally {
      S.busy = false;
      disableButtons(false);
    }
  }

  // ---------- modal lifecycle ----------
  function close() {
    try { S.back?.remove(); } catch (_) {}
    lockScroll(false);

    if (S.escHandler) {
      try { document.removeEventListener("keydown", S.escHandler); } catch (_) {}
      S.escHandler = null;
    }

    S.back = null;
    S.body = null;
  }

  function buildModal() {
    ensureStyles();

    // single instance
    if (S.back) close();

    const back = el("div", "adopt-backdrop");
    const modal = el("div", "adopt-modal");

    const head = el("div", "adopt-head");

    // left: back button + title/sub
    const headLeft = el("div", "adopt-head-left");

    const backBtn = el("button", "adopt-backbtn", "← Back");
    backBtn.type = "button";
    backBtn.addEventListener("click", close);

    const left = el("div", "");
    left.appendChild(el("div", "adopt-title", "Adoption Center"));
    left.appendChild(el("div", "adopt-sub", "Adopt pets with Bones or unlock exclusive token pets."));

    headLeft.appendChild(backBtn);
    headLeft.appendChild(left);

    const closeBtn = el("button", "adopt-close", "×");
    closeBtn.type = "button";
    closeBtn.addEventListener("click", close);

    head.appendChild(headLeft);
    head.appendChild(closeBtn);

    const body = el("div", "adopt-body");
    modal.appendChild(head);
    modal.appendChild(body);
    back.appendChild(modal);

    back.addEventListener("click", (e) => {
      if (e.target === back) close();
    });

    S.escHandler = (e) => (e.key === "Escape") && close();
    document.addEventListener("keydown", S.escHandler);

    S.back = back;
    S.body = body;
  }

  async function open() {
    buildModal();
    document.body.appendChild(S.back);
    lockScroll(true);

    S.body.innerHTML = '<div class="adopt-desc">Loading…</div>';

    try {
      S.state = await loadState();
      render(S.state);
    } catch (e) {
      log("open error", e);
      S.body.innerHTML = '<div class="adopt-desc">Failed to load adopt state.</div>';
    }
  }

  // ---------- public API ----------
  function init({ apiPost, tg, dbg } = {}) {
    if (apiPost) S.apiPost = apiPost;
    if (tg) S.tg = tg;
    if (typeof dbg === "boolean") S.dbg = dbg;
    return true;
  }

  window.Adopt = { init, open, close, _state: () => S.state };
})();
