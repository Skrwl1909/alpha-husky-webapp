// Alpha Husky WebApp — Adopt Center (bones + token exclusive)
// Drop-in module: window.Adopt.init({ apiPost, tg, dbg }); window.Adopt.open();
//
// Endpoints (backend):
//   POST /webapp/adopt/state
//   POST /webapp/adopt/buy    { petType, run_id? }

(function(){
  const S = { apiPost:null, tg:null, dbg:false, _busy:false, _state:null };

  function log(...a){ if(S.dbg) console.log("[Adopt]", ...a); }
  function el(tag, cls, txt){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(txt != null) e.textContent = txt;
    return e;
  }
  function uuid(){
    try { return crypto.randomUUID(); } catch(e){}
    return "rid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2,10);
  }
  function toast(msg){
    // use existing toast if present
    if(typeof window.toast === "function"){ window.toast(msg); return; }
    // tiny fallback
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
  }

  function fmtPrice(p){
    if(!p) return "";
    const tok = Number(p.price_tokens || 0);
    const bon = Number(p.price || 0);
    if(tok > 0) return `${tok} Tokens`;
    if(bon > 0) return `${bon} Bones`;
    return "";
  }

  function render(state, body){
    body.innerHTML = "";
    const bal = el("div","adopt-bal");
    bal.appendChild(el("div","adopt-chip", `Bones: ${state?.resources?.bones ?? 0}`));
    bal.appendChild(el("div","adopt-chip", `Tokens: ${state?.resources?.token ?? 0}`));
    body.appendChild(bal);

    const token = state?.offers?.token || [];
    const bones = state?.offers?.bones || [];

    // Exclusive token pets
    const secTok = el("div","adopt-section");
    secTok.appendChild(el("h3","", `Exclusive (Tokens)`));
    const gridTok = el("div","adopt-grid");
    if(!token.length){
      const empty = el("div","adopt-desc","No token pets available right now (or you already own them).");
      secTok.appendChild(empty);
    } else {
      token.forEach(p=>{
        gridTok.appendChild(petCard(p, "tokens"));
      });
      secTok.appendChild(gridTok);
    }
    body.appendChild(secTok);

    // Bones adoption
    const secBones = el("div","adopt-section");
    secBones.appendChild(el("h3","", `Standard (Bones)`));
    const gridBones = el("div","adopt-grid");
    if(!bones.length){
      const empty = el("div","adopt-desc","No adoptable pets with Bones (or you own them all).");
      secBones.appendChild(empty);
    } else {
      bones.forEach(p=>{
        gridBones.appendChild(petCard(p, "bones"));
      });
      secBones.appendChild(gridBones);
    }
    body.appendChild(secBones);
  }

  function petCard(p, pay){
    const card = el("div","adopt-card");
    const imgWrap = el("div","adopt-img");
    if(p.img){
      const img = new Image();
      img.src = p.img;
      img.alt = p.name || p.type || "";
      imgWrap.appendChild(img);
    } else {
      imgWrap.appendChild(el("div","adopt-desc","🐾"));
    }

    const meta = el("div","adopt-meta");
    meta.appendChild(el("div","adopt-name", p.name || p.petType || "Pet"));
    meta.appendChild(el("div","adopt-desc", p.desc || ""));

    const actions = el("div","adopt-actions");
    const price = el("div","adopt-price", fmtPrice(p));
    const btn = el("button","adopt-btn", p.owned ? "Owned" : "Adopt");
    btn.type="button";
    btn.disabled = S._busy || !!p.owned;

    btn.addEventListener("click", async ()=>{
      if(S._busy) return;
      await buyPet(p.petType);
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
    const res = await S.apiPost("/webapp/adopt/state", {});
    if(!res || !res.ok) throw new Error(res?.reason || "STATE_FAIL");
    return res.data || res;
  }

  async function buyPet(petType){
    if(!petType) return;
    S._busy = true;
    try{
      const run_id = uuid();
      const res = await S.apiPost("/webapp/adopt/buy", { petType, run_id });
      if(!res || !res.ok){
        const reason = res?.reason || "BUY_FAIL";
        toast(reason === "NOT_ENOUGH_TOKENS" ? "Not enough tokens." :
              reason === "NOT_ENOUGH_BONES" ? "Not enough bones." :
              reason === "ALREADY_OWNED" ? "You already own this pet." :
              reason);
        return;
      }
      toast(`Adopted: ${res.adopted?.name || petType}`);
      // refresh state
      const st = await loadState();
      S._state = st;
      const modalBody = document.querySelector(".adopt-body");
      if(modalBody) render(st, modalBody);
    } catch(e){
      log("buyPet error", e);
      toast("Network error.");
    } finally {
      S._busy = false;
    }
  }

  async function open(){
    const { back, body } = buildModal();
    document.body.appendChild(back);
    lockScroll(true);

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
