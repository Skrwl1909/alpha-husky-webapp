// Alpha Husky WebApp — Adoption Center V2.
// Production contracts: POST /webapp/adopt/state and /webapp/adopt/buy { petType, run_id }.
(function () {
  const S = {
    apiPost: null, tg: null, dbg: false, busy: false, state: null,
    back: null, body: null, backBtn: null, title: null, escHandler: null,
    view: "gallery", selected: null, sprites: [], previewTimer: null,
    reloadNeeded: false, lastFocus: null
  };
  const log = (...a) => S.dbg && console.log("[Adopt]", ...a);
  function el(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function toast(msg) {
    if (typeof window.toast === "function") return window.toast(msg);
    const t = el("div", "adopt-toast", String(msg || ""));
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 250); }, 2200);
  }
  function makeRunId(prefix, key) {
    if (typeof window.AH_makeRunId === "function") return window.AH_makeRunId(prefix, key);
    try { return crypto.randomUUID(); } catch (_) {}
    return `rid_${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}_${String(key || "").slice(0, 24)}`;
  }
  function petKey(p) { return (p && (p.petType || p.pet_type || p.type || p.key || p.id)) || ""; }
  function petName(p) { return p?.name || petKey(p) || "Companion"; }
  function isExclusive(p) { return !!(p.exclusive || p.isExclusive || String(p.rarity || "").toLowerCase() === "exclusive" || Number(p.price_tokens ?? p.tokens ?? p.tokenCost ?? p.cost?.tokens ?? p.cost?.token ?? 0) > 0); }
  function isOwned(p) { return !!(p.owned || p.isOwned); }
  function isPreviewOnly(p) { return !!(p.previewOnly || p.preview_only || p.isPreviewOnly); }
  function isActive(p, state) {
    if (!isOwned(p)) return false;
    if (p.active === true || p.isActive === true || p.is_active === true || p.equipped === true) return true;
    const activeId = state?.activePetId ?? state?.active_pet_id;
    const offerId = p.id ?? p.petId ?? p.pet_id;
    return activeId != null && offerId != null && String(activeId) === String(offerId);
  }
  function status(p) { return isActive(p, S.state) ? "ACTIVE" : isOwned(p) ? "OWNED" : "AVAILABLE"; }
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
    return { bones: Number(r.bones ?? 0), tokens: Number(r.tokens ?? r.token ?? 0) };
  }
  function offers(state) {
    const o = state?.offers || state?.catalog || state?.adopt || {};
    const preview = o.preview || o.previews || o.animatedPreview || o.animated || [];
    const token = o.token || o.tokens || o.tokenPets || o.exclusive || o.exclusiveTokens || [];
    const bones = o.bones || o.bonePets || o.standard || o.free || [];
    return {
      preview: Array.isArray(preview) ? preview : [],
      token: Array.isArray(token) ? token : [],
      bones: Array.isArray(bones) ? bones : []
    };
  }
  function humanReason(reason) {
    const R = String(reason || "").toUpperCase();
    if (R.includes("SENTINEL_SET_REQUIRED")) return "Full Sentinel set required.";
    if (R.includes("NOT_ENOUGH_TOKENS") || R.includes("NOT_ENOUGH_FUNDS")) return "Not enough tokens.";
    if (R.includes("NOT_ENOUGH_BONES")) return "Not enough bones.";
    if (R.includes("ALREADY_OWNED")) return "You already own this pet.";
    if (R.includes("UNKNOWN_PET") || R.includes("BAD_PET")) return "Unknown pet.";
    if (R.includes("MISSING")) return "Missing init data. Reopen the WebApp.";
    if (R.includes("HTTP_401") || R.includes("UNAUTHORIZED")) return "Unauthorized. Reopen the WebApp.";
    return reason || "Action failed.";
  }
  function clearSprites() {
    if (S.previewTimer) clearTimeout(S.previewTimer);
    S.previewTimer = null;
    S.sprites.forEach(sprite => { try { sprite?.destroy?.(); } catch (_) {} });
    S.sprites = [];
  }
  function art(p, cls, animated) {
    const wrap = el("div", `adopt-art ${cls}`);
    const url = p?.img || p?.icon || p?.pet_img || p?.pet_icon || p?.image || "";
    if (animated && window.PetSprite?.hasSprite?.(p)) {
      try {
        const sprite = window.PetSprite.mount(wrap, p, {
          state: "idle", className: "adopt-pet-sprite", fallbackUrl: url, alt: petName(p)
        });
        if (sprite) { S.sprites.push(sprite); return { wrap, sprite }; }
      } catch (e) { log("sprite fallback", e); }
    }
    if (!animated && !url && window.PetSprite?.hasSprite?.(p)) {
      const meta = p.sprite || p.spriteMeta || p.sprite_meta || p.animatedSprite;
      const source = p.spriteSheetUrl || p.sprite_sheet_url || p.spritesheetUrl || p.spriteSheet;
      const frameW = Number(meta?.frameW);
      const frameH = Number(meta?.frameH);
      if (source && frameW > 0 && frameH > 0) {
        const canvas = el("canvas", "adopt-static-sprite");
        canvas.width = frameW; canvas.height = frameH;
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", petName(p));
        const spriteImage = new Image();
        spriteImage.onload = () => {
          if (!canvas.isConnected) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(spriteImage, 0, Number(meta.rows.idle || 0) * frameH, frameW, frameH, 0, 0, frameW, frameH);
        };
        spriteImage.onerror = () => { canvas.remove(); wrap.appendChild(el("span", "adopt-art-fallback", "🐾")); };
        spriteImage.src = source;
        wrap.appendChild(canvas);
        return { wrap, sprite: null };
      }
    }
    if (url) {
      const img = new Image();
      img.alt = petName(p);
      img.loading = animated ? "eager" : "lazy";
      img.decoding = "async";
      img.onerror = () => { img.remove(); wrap.appendChild(el("span", "adopt-art-fallback", "🐾")); };
      img.src = url;
      wrap.appendChild(img);
    } else {
      wrap.appendChild(el("span", "adopt-art-fallback", "🐾"));
    }
    return { wrap, sprite: null };
  }
  function label(p) { return isExclusive(p) ? "EXCLUSIVE" : "STANDARD"; }
  function stateTag(p) { return el("span", `adopt-state is-${status(p).toLowerCase()}`, status(p)); }
  function galleryCard(p) {
    const card = el("button", `adopt-card ${isExclusive(p) ? "is-exclusive" : "is-standard"}`);
    card.type = "button";
    card.setAttribute("aria-label", `View ${petName(p)}, ${label(p)}, ${status(p)}`);
    card.appendChild(art(p, "adopt-card-art", false).wrap);
    const info = el("div", "adopt-card-info");
    info.appendChild(el("div", "adopt-card-name", petName(p)));
    const tags = el("div", "adopt-card-tags");
    tags.appendChild(el("span", "adopt-rarity", label(p)));
    tags.appendChild(stateTag(p));
    info.appendChild(tags);
    info.appendChild(el("div", "adopt-card-price", isOwned(p) ? "In your pack" : isPreviewOnly(p) ? "Preview only" : priceText(p) || "View details"));
    card.appendChild(info);
    card.addEventListener("click", () => showDetail(p));
    return card;
  }
  function gallerySection(title, items, empty) {
    const section = el("section", "adopt-section");
    const heading = el("h2", "adopt-section-heading", title);
    section.appendChild(heading);
    if (!items.length) section.appendChild(el("p", "adopt-empty", empty));
    else {
      const grid = el("div", "adopt-grid");
      items.forEach(p => grid.appendChild(galleryCard(p)));
      section.appendChild(grid);
    }
    return section;
  }
  function renderGallery() {
    const { preview, token, bones } = offers(S.state);
    const b = balances(S.state);
    const intro = el("div", "adopt-intro");
    intro.appendChild(el("div", "adopt-eyebrow", "THE PACK · COMPANIONS"));
    intro.appendChild(el("p", "adopt-intro-line", "Find the one who runs beside you."));
    const bal = el("div", "adopt-bal");
    bal.appendChild(el("span", "adopt-balance", `Bones  ${b.bones}`));
    bal.appendChild(el("span", "adopt-balance", `Tokens  ${b.tokens}`));
    intro.appendChild(bal);
    S.body.appendChild(intro);

    const featured = token.find(p => !isOwned(p) && !isPreviewOnly(p)) ||
      bones.find(p => !isOwned(p) && !isPreviewOnly(p)) || token[0] || bones[0] || preview[0];
    if (featured) {
      const hero = el("div", `adopt-featured ${isExclusive(featured) ? "is-exclusive" : "is-standard"}`);
      hero.appendChild(art(featured, "adopt-hero-art", true).wrap);
      const content = el("div", "adopt-featured-content");
      content.appendChild(el("span", "adopt-eyebrow", "FEATURED COMPANION"));
      content.appendChild(el("h2", "adopt-featured-name", petName(featured)));
      content.appendChild(el("p", "adopt-featured-line", featured.desc || `${label(featured)} · ${status(featured)}`));
      const view = el("button", "adopt-view", "VIEW COMPANION  →");
      view.type = "button";
      view.addEventListener("click", () => showDetail(featured));
      content.appendChild(view);
      hero.appendChild(content);
      S.body.appendChild(hero);
    }
    if (preview.length) S.body.appendChild(gallerySection("Animated Preview", preview, ""));
    S.body.appendChild(gallerySection("Exclusive · Tokens", token, "No token pets available right now (or you already own them)."));
    S.body.appendChild(gallerySection("Standard · Bones", bones, "No adoptable pets with Bones (or you own them all)."));
  }
  function renderDetail(p) {
    const exclusive = isExclusive(p);
    const surface = el("div", `adopt-detail ${exclusive ? "is-exclusive" : "is-standard"}`);
    const stage = el("div", "adopt-detail-stage");
    stage.appendChild(el("span", "adopt-stage-label", `${label(p)} COMPANION`));
    const artwork = art(p, "adopt-detail-art", true);
    stage.appendChild(artwork.wrap);
    stage.appendChild(stateTag(p));
    surface.appendChild(stage);
    const info = el("div", "adopt-detail-info");
    info.appendChild(el("div", "adopt-eyebrow", `${label(p)} · ${status(p)}`));
    info.appendChild(el("h2", "adopt-detail-name", petName(p)));
    if (p.desc) info.appendChild(el("p", "adopt-detail-desc", p.desc));
    const price = el("div", "adopt-detail-price");
    price.appendChild(el("span", "", isOwned(p) ? "PACK STATUS" : isPreviewOnly(p) ? "ACCESS" : "ADOPTION COST"));
    price.appendChild(el("strong", "", isOwned(p) ? status(p) : isPreviewOnly(p) ? "PREVIEW ONLY" : priceText(p) || "See availability"));
    info.appendChild(price);
    if (S.dbg) info.appendChild(el("div", "adopt-debug", `petKey=${petKey(p)} | petName=${p.petName || p.name || ""} | resolvedPetKey=${p.resolvedPetKey || p.petKey || petKey(p)} | hasSpriteMeta=${!!(p.spriteSheetUrl && p.sprite)} | spriteUrl=${p.spriteSheetUrl ? "yes" : "no"} | PetSprite=${window.PetSprite ? "yes" : "no"}`));
    surface.appendChild(info);
    S.body.appendChild(surface);

    const actions = el("div", "adopt-detail-actions");
    if (artwork.sprite && p.sprite?.rows && Object.prototype.hasOwnProperty.call(p.sprite.rows, "walk")) {
      const preview = el("button", "adopt-preview", "Preview motion");
      preview.type = "button";
      preview.addEventListener("click", () => {
        artwork.sprite.play("walk");
        if (S.previewTimer) clearTimeout(S.previewTimer);
        S.previewTimer = setTimeout(() => artwork.sprite.play("idle"), 2400);
      });
      actions.appendChild(preview);
    }
    const buy = el("button", "adopt-buy", isActive(p, S.state) ? "ACTIVE IN YOUR PACK" : isOwned(p) ? "ALREADY IN YOUR PACK" : isPreviewOnly(p) ? "PREVIEW ONLY" : p.canBuy === false ? "UNAVAILABLE" : "ADOPT COMPANION");
    buy.type = "button";
    buy.disabled = S.busy || isOwned(p) || isPreviewOnly(p) || p.canBuy === false || !petKey(p);
    buy.addEventListener("click", () => buyPet(p));
    actions.appendChild(buy);
    S.body.appendChild(actions);
  }
  function renderSuccess(p) {
    const surface = el("div", `adopt-success ${isExclusive(p) ? "is-exclusive" : "is-standard"}`);
    surface.appendChild(el("div", "adopt-eyebrow", "A NEW BOND"));
    surface.appendChild(art(p, "adopt-success-art", true).wrap);
    surface.appendChild(el("h2", "", `${petName(p)} joined your pack.`));
    surface.appendChild(el("p", "", "Your journey continues together."));
    const done = el("button", "adopt-buy", "BACK TO COMPANIONS");
    done.type = "button";
    done.addEventListener("click", returnToGallery);
    surface.appendChild(done);
    S.body.appendChild(surface);
  }
  function render() {
    if (!S.body) return;
    clearSprites();
    S.body.replaceChildren();
    S.body.scrollTop = 0;
    S.title.textContent = S.view === "gallery" ? "Adoption Center" : S.view === "success" ? "NEW COMPANION" : "COMPANION";
    S.backBtn.textContent = S.view === "gallery" ? "← Back" : "← Companions";
    if (S.view === "gallery") renderGallery();
    else if (S.view === "detail" && S.selected) renderDetail(S.selected);
    else if (S.view === "success" && S.selected) renderSuccess(S.selected);
  }
  function showDetail(p) { S.selected = p; S.view = "detail"; render(); S.backBtn?.focus(); }
  async function returnToGallery() {
    if (S.busy) return;
    S.view = "gallery";
    S.selected = null;
    if (S.reloadNeeded) {
      try { S.state = await loadState(); S.reloadNeeded = false; }
      catch (e) { log("reload error", e); toast("Could not refresh companions. Try reopening the center."); }
    }
    render();
  }
  async function loadState() {
    if (!S.apiPost) throw new Error("Adopt not initialized (apiPost missing)");
    const out = await S.apiPost("/webapp/adopt/state", {});
    if (out && out.ok === false) throw new Error(out.reason || "STATE_FAIL");
    return out?.data ?? out;
  }
  async function buyPet(p) {
    if (S.busy || !petKey(p) || isOwned(p) || isPreviewOnly(p) || p.canBuy === false) return;
    S.busy = true;
    const buy = S.body?.querySelector(".adopt-buy");
    if (buy) { buy.disabled = true; buy.textContent = "ADOPTING…"; }
    try {
      const out = await S.apiPost("/webapp/adopt/buy", { petType: petKey(p), run_id: makeRunId("adopt", petKey(p)) });
      if (out && out.ok === false) { toast(humanReason(out.reason || "BUY_FAIL")); return; }
      const data = out?.data ?? out;
      const adopted = data?.adopted || data?.pet || {};
      S.selected = { ...p, name: adopted?.name || petName(p), owned: true };
      S.reloadNeeded = true;
      try { S.state = await loadState(); S.reloadNeeded = false; }
      catch (e) { log("post-adoption refresh error", e); }
      S.view = "success";
      render();
    } catch (e) {
      log("buyPet error", e);
      toast(humanReason(e?.data?.reason || e?.message || "Network error."));
    } finally {
      S.busy = false;
      if (S.view === "detail") render();
    }
  }
  function close() {
    if (S.busy) return;
    clearSprites();
    S.back?.remove();
    document.body.classList.remove("adopt-lock");
    if (S.escHandler) document.removeEventListener("keydown", S.escHandler);
    S.escHandler = null;
    S.back = S.body = S.backBtn = S.title = null;
    S.view = "gallery";
    S.selected = null;
    S.lastFocus?.focus?.();
    S.lastFocus = null;
  }
  function goBack() { if (S.busy) return; if (S.view === "gallery") close(); else returnToGallery(); }
  function buildModal() {
    ensureStyles();
    if (S.back) close();
    S.lastFocus = document.activeElement;
    const back = el("div", "adopt-backdrop");
    const modal = el("div", "adopt-modal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "adopt-title");
    const head = el("div", "adopt-head");
    const backBtn = el("button", "adopt-backbtn", "← Back");
    backBtn.type = "button";
    backBtn.addEventListener("click", goBack);
    const title = el("div", "adopt-title", "Adoption Center");
    title.id = "adopt-title";
    const closeBtn = el("button", "adopt-close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close Adoption Center");
    closeBtn.addEventListener("click", close);
    head.append(backBtn, title, closeBtn);
    const body = el("div", "adopt-body");
    modal.append(head, body);
    back.appendChild(modal);
    back.addEventListener("click", e => { if (e.target === back) close(); });
    S.escHandler = e => { if (e.key === "Escape") goBack(); };
    document.addEventListener("keydown", S.escHandler);
    S.back = back; S.body = body; S.backBtn = backBtn; S.title = title;
  }
  async function open() {
    if (S.back) return;
    buildModal();
    document.body.appendChild(S.back);
    document.body.classList.add("adopt-lock");
    S.backBtn.focus();
    S.body.appendChild(el("p", "adopt-empty", "Loading companions…"));
    const body = S.body;
    try { const state = await loadState(); if (S.body === body) { S.state = state; render(); } }
    catch (e) { log("open error", e); if (S.body === body) body.replaceChildren(el("p", "adopt-empty", "Failed to load companions.")); }
  }
  function init({ apiPost, tg, dbg } = {}) {
    if (apiPost) S.apiPost = apiPost;
    if (tg) S.tg = tg;
    if (typeof dbg === "boolean") S.dbg = dbg;
    return true;
  }
  function ensureStyles() {
    if (document.getElementById("adopt-styles")) return;
    const style = document.createElement("style");
    style.id = "adopt-styles";
    style.textContent = `
      .adopt-backdrop{position:fixed;inset:0;z-index:9999;background:rgba(2,5,10,.82);display:flex;align-items:flex-end;justify-content:center;color:#eaf3f6;font-family:inherit}
      .adopt-modal{box-sizing:border-box;width:100%;max-width:720px;height:100%;height:100dvh;display:flex;flex-direction:column;min-width:0;overflow:hidden;background:#0b1018;border:1px solid rgba(145,193,213,.17);box-shadow:0 -18px 60px #000b}
      .adopt-head{flex:none;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:52px;padding:var(--ah-inset-top, env(safe-area-inset-top, 0px)) 12px 0;background:#111a24;border-bottom:1px solid rgba(153,206,226,.13)}
      .adopt-title{text-align:center;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
      .adopt-backbtn,.adopt-close{border:0;background:none;color:#d7ebf2;cursor:pointer;min-height:44px;min-width:44px;font:700 12px inherit}
      .adopt-backbtn{text-align:left;padding:0 4px}.adopt-close{justify-self:end;font-size:24px;line-height:1}
      .adopt-body{box-sizing:border-box;flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:16px 16px calc(24px + var(--ah-inset-bottom, env(safe-area-inset-bottom, 0px)));scrollbar-width:thin}
      .adopt-body *{box-sizing:border-box}.adopt-body button{font-family:inherit;color:inherit}
      .adopt-eyebrow,.adopt-stage-label{font-size:10px;font-weight:850;letter-spacing:.18em;color:#8dcadd;text-transform:uppercase}
      .adopt-intro-line{margin:6px 0 12px;font-size:14px;color:#c4d2da}
      .adopt-bal{display:flex;gap:8px;flex-wrap:wrap}.adopt-balance{font-size:11px;letter-spacing:.04em;border:1px solid #52637175;background:#141f2a;padding:6px 10px;border-radius:6px;color:#d7e4e9}
      .adopt-featured,.adopt-detail-stage,.adopt-success{position:relative;isolation:isolate;overflow:hidden;background:radial-gradient(circle at 50% 40%,#223947 0%,#131e2a 50%,#0c141e 100%);border:1px solid #405868;border-radius:12px}
      .adopt-featured.is-exclusive,.adopt-detail.is-exclusive .adopt-detail-stage,.adopt-success.is-exclusive{background:radial-gradient(circle at 53% 42%,#253a50 0%,#171d31 53%,#0d1423 100%);border-color:#6a80a188;box-shadow:inset 0 0 28px #809acd15,0 0 16px #6c9ac015}
      .adopt-featured{margin-top:16px;min-height:250px;display:flex;flex-direction:column;justify-content:flex-end}
      .adopt-featured:after,.adopt-detail-stage:after{content:"";position:absolute;inset:35% 0 0;z-index:-1;background:linear-gradient(transparent,#090f19e8)}
      .adopt-art{display:flex;align-items:center;justify-content:center;overflow:hidden}.adopt-art img,.adopt-static-sprite,.adopt-pet-sprite,.adopt-pet-sprite canvas,.adopt-pet-sprite img{display:block;width:100%;height:100%;object-fit:contain}.adopt-static-sprite,.adopt-pet-sprite canvas,.adopt-pet-sprite img{image-rendering:pixelated}
      .adopt-hero-art{position:absolute;inset:4px 8px 53px;z-index:-1}.adopt-hero-art img{object-position:center 35%}.adopt-art-fallback{font-size:54px;opacity:.6}
      .adopt-featured-content{position:relative;padding:70px 16px 16px;background:linear-gradient(transparent,#090f19e5 46%,#090f19f5)}
      .adopt-featured-name{font-size:25px;line-height:1.1;margin:5px 0;letter-spacing:.02em;text-shadow:0 2px 12px #000}
      .adopt-featured-line{font-size:12px;line-height:1.35;color:#d5e3e9;margin:0 0 11px;max-width:32ch;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      .adopt-view{min-height:40px;padding:0 13px;background:#b5dae5;border:1px solid #d7f3fa;border-radius:6px;color:#0b1721!important;font-size:11px;font-weight:900;letter-spacing:.09em;cursor:pointer}
      .adopt-section{margin-top:24px}.adopt-section-heading{margin:0 0 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#d6e7ee}
      .adopt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .adopt-card{display:block;width:100%;min-width:0;padding:0;text-align:left;cursor:pointer;background:#111a24;border:1px solid #354452;border-radius:9px;overflow:hidden;transition:border-color .15s ease,transform .15s ease}
      .adopt-card.is-exclusive{background:#151c2b;border-color:#526584;box-shadow:inset 0 0 18px #748db011}
      .adopt-card:active{transform:scale(.985)}.adopt-card:hover,.adopt-card:focus-visible{border-color:#a4cedb;outline:none}
      .adopt-card-art{height:clamp(110px,38vw,190px);background:radial-gradient(circle at 50% 55%,#2b3b48,#0b121b 74%)}
      .adopt-card.is-exclusive .adopt-card-art{background:radial-gradient(circle at 50% 55%,#36445f,#111827 74%)}
      .adopt-card-art img{padding:5px}.adopt-card-info{padding:10px;min-height:85px}.adopt-card-name{font-size:14px;line-height:1.15;font-weight:800;overflow-wrap:anywhere}
      .adopt-card-tags{display:flex;gap:4px;flex-wrap:wrap;margin:7px 0}.adopt-rarity,.adopt-state{display:inline-block;width:max-content;font-size:9px;font-weight:850;letter-spacing:.08em;line-height:1.3;color:#a7bac3}
      .adopt-card.is-exclusive .adopt-rarity{color:#bdc3ee}.adopt-state{color:#a5c5d1}.adopt-state.is-active{color:#8fe2da}.adopt-state.is-owned{color:#d0c7ae}
      .adopt-card-price{font-size:11px;line-height:1.25;color:#c4d1d8;overflow-wrap:anywhere}
      .adopt-detail-stage{height:clamp(250px,47dvh,430px);display:flex;align-items:center;justify-content:center}
      .adopt-stage-label{position:absolute;top:14px;left:14px;z-index:2}.adopt-detail-art{width:100%;height:100%;padding:24px 16px 12px}.adopt-detail-stage>.adopt-state{position:absolute;right:14px;bottom:14px;z-index:2;padding:5px 8px;border:1px solid currentColor;border-radius:4px;background:#0b1720e8}
      .adopt-detail-info{padding:18px 2px 22px}.adopt-detail-name{font-size:26px;line-height:1.1;margin:7px 0 10px}.adopt-detail-desc{font-size:13px;line-height:1.5;color:#c6d3da;margin:0 0 18px}
      .adopt-detail-price{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #3b4a58;padding-top:15px;font-size:10px;letter-spacing:.09em;color:#aebec7}.adopt-detail-price strong{text-align:right;font-size:13px;color:#e4f1f5;letter-spacing:0}
      .adopt-detail-actions{position:sticky;bottom:calc(-24px - var(--ah-inset-bottom, env(safe-area-inset-bottom, 0px)));z-index:3;display:flex;gap:8px;flex-wrap:wrap;padding:12px 0 calc(12px + var(--ah-inset-bottom, env(safe-area-inset-bottom, 0px)));background:#0b1018;border-top:1px solid #2d3f4c}
      .adopt-buy,.adopt-preview{min-height:48px;border-radius:6px;padding:10px 12px;font-size:12px;font-weight:900;letter-spacing:.08em;cursor:pointer}.adopt-buy{flex:1;background:#b8e0ea;color:#0b1721!important;border:1px solid #d9f4f9}.adopt-buy:disabled{background:#273944;color:#a8bbc4!important;border-color:#49606c;cursor:default}.adopt-preview{background:#172631;border:1px solid #5e8493;color:#d8eaf0}
      .adopt-success{min-height:calc(100% - 2px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:28px 18px;gap:12px}.adopt-success-art{width:min(100%,320px);height:clamp(180px,38dvh,300px)}.adopt-success h2{font-size:23px;line-height:1.2;margin:0}.adopt-success p{font-size:13px;color:#c1d2da;margin:0 0 12px}.adopt-success .adopt-buy{flex:none;width:100%}
      .adopt-empty{color:#b6c8d1;font-size:13px}.adopt-debug{font-size:10px;opacity:.75;overflow-wrap:anywhere;margin-top:10px}.adopt-toast{position:fixed;left:50%;bottom:calc(18px + var(--ah-inset-bottom, env(safe-area-inset-bottom, 0px)));z-index:10000;transform:translateX(-50%);max-width:90vw;padding:10px 12px;border:1px solid #67808e;background:#0c1721;border-radius:8px;opacity:0;transition:opacity .18s}.adopt-toast.show{opacity:1}
      body.adopt-lock{overflow:hidden}
      @media(min-width:720px){.adopt-backdrop{align-items:center}.adopt-modal{height:min(90dvh,850px);border-radius:14px}.adopt-card-art{height:190px}}
      @media(max-width:350px){.adopt-body{padding-left:10px;padding-right:10px}.adopt-grid{gap:7px}.adopt-card-info{padding:7px}.adopt-card-name{font-size:12px}.adopt-card-tags{font-size:8px}}
      @media(prefers-reduced-motion:reduce){.adopt-card,.adopt-toast{transition:none}}
    `;
    document.head.appendChild(style);
  }
  window.Adopt = { init, open, close, _state: () => S.state };
})();
