// Alpha Husky WebApp — Adopt Center (bones + token exclusive)
// Drop-in module: window.Adopt.init({ apiPost, tg, dbg }); window.Adopt.open();
//
// Endpoints (backend):
//   POST /webapp/adopt/state
//   POST /webapp/adopt/buy    { petType, run_id? }

(function(){
  const S = {
    apiPost:null,
    tg:null,
    dbg:false,
    _busy:false,
    _state:null,
    _mountedBody:null,
    _mountedBack:null
  };

  function log(...a){ if(S.dbg) console.log("[Adopt]", ...a); }
  function el(tag, cls, txt){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(txt != null) e.textContent = txt;
    return e;
  }

  function fallbackRunId(){
    try { return crypto.randomUUID(); } catch(e){}
    return "rid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,10);
  }

  function toast(msg){
    if(typeof window.toast === "function"){ window.toast(msg); return; }
    const t = el("div","ah-toast", String(msg||""));
    ensureStyles();
    document.body.appendChild(t);
    setTimeout(()=>t.classList.add("show"), 10);
    setTimeout(()=>{ t.classList.remove("show"); setTimeout(()=>t.remove(), 250); }, 2200);
  }

  function ensureStyles(){
    if(document.getElementById("adopt-styles")) return;
    const style = document.createElement("style");
    style.id = "adopt-styles";
    style.textContent = `
      .adopt-backdrop{
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,.65);
        display:flex; align-items:flex-end; justify-content:center;
      }
      .adopt-modal{
        width:100%; max-width:720px;
        background:rgba(10,10,12,.96);
        border-radius:22px 22px 0 0;
        box-shadow:0 -18px 60px rgba(0,0,0,.7);
        overflow:hidden;
      }
      .adopt-head{
        display:flex; align-items:center; justify-content:space-between;
        padding:14px 14px 10px 14px;
        border-bottom:1px solid rgba(255,255,255,.08);
      }
      .adopt-title{ font-weight:700; font-size:16px; letter-spacing:.2px; }
      .adopt-sub{ opacity:.8; font-size:12px; margin-top:2px; }
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
        font-size:12px; opacity:.95;
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
        background:rgba(255,255,255,.04);
        border-radius:16px;
        padding:10px;
        display:flex; gap:10px;
      }
      .adopt-img{
        width:56px; height:56px; border-radius:14px;
        background:rgba(0,0,0,.35);
        flex:0 0 auto;
        overflow:hidden;
        display:flex; align-items:center; justify-content:center;
      }
      .adopt-img img{ width:100%; height:100%; object-fit:cover; display:block; }
      .adopt-meta{ flex:1; min-width:0; }
      .adopt-name{ font-weight:700; font-size:13px; margin-bottom:4px; }
      .adopt-desc{ font-size:12px; opacity:.85; line-height:1.25; }
      .adopt-actions{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; }
      .adopt-price{ font-size:12px; opacity:.9; white-space:nowrap; }
      .adopt-btn{
        border:0; border-radius:12px;
        padding:8px 10px;
        background:rgba(0,229,255,.18);
        color:inherit; font-weight:700;
        cursor:pointer;
      }
      .adopt-btn[disabled]{ opacity:.45; cursor:not-allowed; }
      .ah-toast{
        position:fixed; left:50%; bottom:18px; transform:translateX(-50%);
        background:rgba(0,0,0,.78);
        border:1px solid rgba(255,255,255,.12);
        padding:10px 12px; border-radius:14px;
        opacity:0; transition:opacity .18s ease;
        z-index:10000;
        max-width:90vw;
      }
      .ah-toast.show{ opacity:1; }
      body.adopt-lock{ overflow:hidden; }
    `;
    document.head.appendChild(style);
  }

  function lockScroll(on){
    if(on) document.body.classList.add("adopt-lock");
    else document.body.classList.remove("adopt-lock");
  }

  function buildModal(){
    ensureStyles();
    const back = el("div","adopt-backdrop");
    const modal = el("div","adopt-modal");

    const head = el("div","adopt-head");
    const left = el("div","");
    const title = el("div","adopt-title","Adoption Center");
    const sub = el("div","adopt-sub","Adopt pets with Bones or unlock exclusive token pets.");
    left.appendChild(title); left.appendChild(sub);

    const close = el("button","adopt-close","×");
    close.type="button";
    close.addEventListener("click", ()=>closeModal(back));

    head.appendChild(left);
    head.appendChild(close);

    const body = el("div","adopt-body");
    modal.appendChild(head);
    modal.appendChild(body);
    back.appendChild(modal);

    back.addEventListener("click", (e)=>{ if(e.target===back) closeModal(back); });

    return { back, body };
  }

  function closeModal(back){
    try{ back.remove(); }catch(e){}
    lockScroll(false);
    if (S._mountedBack === back) {
      S._mountedBack = null;
      S._mountedBody = null;
    }
  }

  function getPetKey(p){
    return (p && (p.petType || p.type || p.key || p.id)) || "";
  }

  function fmtPrice(p){
    if(!p) return "";
    const cost = p.cost || {};
    const tok =
      Number(p.price_tokens ?? p.tokens ?? p.tokenCost ?? cost.tokens ?? cost.token ?? 0);
    const bon =
      Number(p.price ?? p.price_bones ?? p.bones ?? p.boneCost ?? cost.bones ?? 0);

    if(tok > 0 && bon > 0) return `${bon} Bones + ${tok} Tokens`;
    if(tok > 0) return `${tok} Tokens`;
    if(bon > 0) return `${bon} Bones`;
    return "";
  }

  function getBalances(state){
    const r = state?.resources || state?.balances || state || {};
    const bones = Number(r.bones ?? 0);
    const tokens = Number(r.tokens ?? r.token ?? 0);
    return { bones, tokens };
  }

  function getOffers(state){
    const offers = state?.offers || state?.catalog || {};
    const token = offers.token || offers.tokens || [];
    const bones = offers.bones || [];
    return { token, bones };
  }

  function setButtonsDisabled(disabled){
    if(!S._mountedBody) return;
    const btns = S._mountedBody.querySelectorAll("button.adopt-btn");
    btns.forEach(b => { b.disabled = !!disabled || b.disabled; });
  }

  function render(state, body){
    body.innerHTML = "";

    const balVal = getBalances(state);
    const bal = el("div","adopt-bal");
    bal.appendChild(el("div","adopt-chip", `Bones: ${balVal.bones}`));
    bal.appendChild(el("div","adopt-chip", `Tokens: ${balVal.tokens}`));
    body.appendChild(bal);

    const { token, bones } = getOffers(state);

    // Exclusive token pets
    const secTok = el("div","adopt-section");
    secTok.appendChild(el("h3","", `Exclusive (Tokens)`));
    const gridTok = el("div","adopt-grid");
    if(!token.length){
      secTok.appendChild(el("div","adopt-desc","No token pets available right now (or you already own them)."));
    } else {
      token.forEach(p=> gridTok.appendChild(petCard(p)));
      secTok.appendChild(gridTok);
    }
    body.appendChild(secTok);

    // Bones adoption
    const secBones = el("div","adopt-section");
    secBones.appendChild(el("h3","", `Standard (Bones)`));
    const gridBones = el("div","adopt-grid");
    if(!bones.length){
      secBones.appendChild(el("div","adopt-desc","No adoptable pets with Bones (or you own them all)."));
    } else {
      bones.forEach(p=> gridBones.appendChild(petCard(p)));
      secBones.appendChild(gridBones);
    }
    body.appendChild(secBones);
  }

  function petCard(p){
    const card = el("div","adopt-card");

    const imgWrap = el("div","adopt-img");
    if(p.img){
      const img = new Image();
      img.src = p.img;
      img.alt = p.name || getPetKey(p) || "pet";
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(el("div","adopt-desc","🐾"));
    }

    const meta = el("div","adopt-meta");
    meta.appendChild(el("div","adopt-name", p.name || getPetKey(p) || "Pet"));
    meta.appendChild(el("div","adopt-desc", p.desc || ""));

    const actions = el("div","adopt-actions");
    const price = el("div","adopt-price", fmtPrice(p));

    const owned = !!(p.owned || p.isOwned);
    const btn = el("button","adopt-btn", owned ? "Owned" : "Adopt");
    btn.type="button";
    btn.disabled = S._busy || owned;

    btn.addEventListener("click", async ()=>{
      if(S._busy) return;
      const key = getPetKey(p);
      await buyPet(key);
    });

    actions.appendChild(price);
    actions.appendChild(btn);
    meta.appendChild(actions);

    card.appendChild(imgWrap);
    card.appendChild(meta);
    return card;
  }

  async function loadState(){
    if(!S.apiPost) throw new Error("Adopt not initialized (apiPost missing)");
    const out = await S.apiPost("/webapp/adopt/state", {});
    if(out && out.ok === false) throw new Error(out.reason || "STATE_FAIL");
    return (out && out.data) ? out.data : out;
  }

  function humanReason(reason){
    const R = String(reason || "").toUpperCase();
    if (R.includes("NOT_ENOUGH_TOKENS")) return "Not enough tokens.";
    if (R.includes("NOT_ENOUGH_BONES")) return "Not enough bones.";
    if (R.includes("ALREADY_OWNED")) return "You already own this pet.";
    if (R.includes("MISSING")) return "Missing init data. Reopen the WebApp.";
    return reason || "Action failed.";
  }

  async function buyPet(petType){
    if(!petType) return;
    S._busy = true;
    setButtonsDisabled(true);

    try{
      const run_id =
        (typeof window.AH_makeRunId === "function")
          ? window.AH_makeRunId("adopt", petType)
          : fallbackRunId();

      const out = await S.apiPost("/webapp/adopt/buy", { petType, run_id });
      if(out && out.ok === false){
        toast(humanReason(out.reason || "BUY_FAIL"));
        return;
      }

      const data = (out && out.data) ? out.data : out;
      const adopted = data?.adopted || data?.pet || {};
      toast(`Adopted: ${adopted?.name || petType}`);

      const st = await loadState();
      S._state = st;
      if (S._mountedBody) render(st, S._mountedBody);
    } catch(e){
      const reason = e?.data?.reason || e?.message || "Network error.";
      log("buyPet error", e);
      toast(humanReason(reason));
    } finally {
      S._busy = false;
    }
  }

  async function open(){
    const { back, body } = buildModal();
    document.body.appendChild(back);
    lockScroll(true);

    S._mountedBack = back;
    S._mountedBody = body;

    body.innerHTML = '<div class="adopt-desc">Loading…</div>';

    try{
      const st = await loadState();
      S._state = st;
      render(st, body);
    } catch(e){
      log("open error", e);
      body.innerHTML = '<div class="adopt-desc">Failed to load adopt state.</div>';
    }
  }

  function init({ apiPost, tg, dbg } = {}){
    if(apiPost) S.apiPost = apiPost;
    if(tg) S.tg = tg;
    if(typeof dbg === "boolean") S.dbg = dbg;
    return true;
  }

  window.Adopt = { init, open, _state: ()=>S._state };
})();
