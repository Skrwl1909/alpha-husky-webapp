// js/shop.js — Daily Shop inside WebApp (supports token credits) + thumbnails + INSPECT (compare vs equipped)
(function () {
  function el(id) { return document.getElementById(id); }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---- helpers ----
  function imgVer() {
    return window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
  }

  function assetKeyFromItem(it) {
    const k = String(it?.key || it?.item_key || it?.itemKey || "").trim();
    return k ? k.toLowerCase() : "";
  }

  function itemImgFallback() {
    return `/assets/items/_unknown.png${imgVer()}`;
  }

  function n(v) {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  }

  function pickNum(...vals) {
    for (const v of vals) {
      if (v === 0) return 0; // allow explicit 0
      const x = n(v);
      if (x != null) return x;
    }
    return null;
  }

  function itemKeyOf(it) {
    return String(it?.key || it?.item_key || it?.itemKey || "").trim();
  }

  function normalizeStatKey(k) {
    return String(k || "").trim().toLowerCase().replaceAll(" ", "_");
  }

  function statLabel(k) {
    const key = normalizeStatKey(k);
    const MAP = {
      hp: "HP",
      hp_max: "HP",
      hpmax: "HP",
      vit: "VIT",
      vitality: "VIT",
      str: "STR",
      strength: "STR",
      agi: "AGI",
      agility: "AGI",
      int: "INT",
      intelligence: "INT",
      luck: "LUCK",
      crit: "CRIT",
      crit_chance: "CRIT%",
      critchance: "CRIT%",
      crit_dmg: "CRIT DMG",
      critdmg: "CRIT DMG",
      dmg: "DMG",
      damage: "DMG",
      atk: "ATK",
      attack: "ATK",
      def: "DEF",
      defense: "DEF",
      armor: "ARMOR",
      dodge: "DODGE",
      speed: "SPD",
    };
    return MAP[key] || String(k || "").toUpperCase();
  }

  function fmtNum(x) {
    const v = Number(x);
    if (!Number.isFinite(v)) return "0";
    // keep ints clean, floats short
    if (Math.abs(v - Math.round(v)) < 1e-9) return String(Math.round(v));
    return String(Math.round(v * 100) / 100);
  }

  // Accept many backend schemas:
  function getPrices(it) {
    const priceObj =
      (it?.cost && typeof it.cost === "object") ? it.cost :
      (it?.price && typeof it.price === "object") ? it.price :
      (it?.costs && typeof it.costs === "object") ? it.costs :
      {};

    let tokenPrice = pickNum(
      it.price_tokens, it.priceTokens,
      it.token_cost, it.tokenCost,
      it.tokens_cost, it.tokensCost,
      it.cost_tokens, it.costTokens,
      priceObj.tokens, priceObj.token
    );

    let bonePrice = pickNum(
      (typeof it.price === "number" ? it.price : null),
      it.price_bones, it.priceBones,
      it.bones_cost, it.bonesCost,
      it.cost_bones, it.costBones,
      priceObj.bones, priceObj.bone
    );

    // Many backends send 0 as "not used" — treat 0 as "unset" unless explicitly free
    if (!it?.free) {
      if (tokenPrice === 0) tokenPrice = null;
      if (bonePrice === 0) bonePrice = null;
    }

    return { tokenPrice, bonePrice };
  }

  // Prefer explicit image url/path from API (Cloudinary), then /assets path, then key-based fallback
  function itemImg(it) {
    const ver = imgVer();

    // 1) full url (Cloudinary etc.)
    const url = it?.image_url || it?.imageUrl || it?.icon || it?.img || it?.image || "";
    if (url && typeof url === "string" && /^https?:\/\//i.test(url)) return url;

    // 2) explicit absolute path served by your WebApp (/assets/...)
    const p = it?.image_path || it?.imagePath || "";
    if (p && typeof p === "string" && p.startsWith("/")) return `${p}${ver}`;

    // 3) infer folder by "slot/type"
    const key = assetKeyFromItem(it);
    if (!key) return itemImgFallback();

    const isGear =
      (!!(it?.slot && String(it.slot).length)) ||
      (String(it?.type || "").toLowerCase() === "gear");

    const folder = isGear ? "equip" : "items";
    return `/assets/${folder}/${encodeURIComponent(key)}.png${ver}`;
  }

  function _fmtDelta(num) {
    const v = Number(num || 0);
    if (!v) return "0";
    return (v > 0 ? "+" : "") + fmtNum(v);
  }

  function _deltaClass(v) {
    const nn = Number(v || 0);
    if (nn > 0) return "pos";
    if (nn < 0) return "neg";
    return "neu";
  }

  function _unionKeys(a, b) {
    const s = new Set();
    Object.keys(a || {}).forEach(k => s.add(k));
    Object.keys(b || {}).forEach(k => s.add(k));
    return Array.from(s);
  }

  function _priceString(it) {
    const { tokenPrice, bonePrice } = getPrices(it);
    const hasTokenCost = (tokenPrice != null && Number(tokenPrice) > 0);
    const hasBoneCost  = (bonePrice != null && Number(bonePrice) > 0);

    if (hasBoneCost && hasTokenCost) return `${fmtNum(bonePrice)} 🦴 + ${fmtNum(tokenPrice)} 🪙`;
    if (hasTokenCost) return `${fmtNum(tokenPrice)} 🪙`;
    if (hasBoneCost) return `${fmtNum(bonePrice)} 🦴`;
    return (it?.free ? "FREE" : "?");
  }

  function _buyDisabledReason(it, resources) {
    const r = resources || {};
    const tokenBal = Number(r.token ?? 0);
    const boneBal  = Number(r.bones ?? 0);

    const { tokenPrice, bonePrice } = getPrices(it);
    const hasTokenCost = (tokenPrice != null && Number(tokenPrice) > 0);
    const hasBoneCost  = (bonePrice != null && Number(bonePrice) > 0);

    const limit = pickNum(it.dailyLimit, it.daily_limit, it.limitDaily, it.limit_daily, 0) || 0;
    const bought = pickNum(it.boughtToday, it.bought_today, it.purchasedToday, it.purchased_today, 0) || 0;
    const hitLimit = (limit > 0 && bought >= limit);

    const missingPrice = (!it?.free && !hasTokenCost && !hasBoneCost);
    const notEnoughToken = (hasTokenCost && tokenBal < Number(tokenPrice));
    const notEnoughBones = (hasBoneCost && boneBal < Number(bonePrice));

    const disabled = hitLimit || notEnoughToken || notEnoughBones || missingPrice;

    const reason =
      missingPrice ? "No price configured yet."
      : hitLimit ? "Daily limit reached."
      : notEnoughToken ? "Not enough token."
      : notEnoughBones ? "Not enough bones."
      : "";

    return { disabled, reason, missingPrice, hitLimit, limit, bought };
  }

  function _topDeltas(deltaObj, max = 5) {
    const out = [];
    const d = deltaObj || {};
    for (const k of Object.keys(d)) {
      const v = Number(d[k] || 0);
      if (!v) continue;
      out.push({ k, v, abs: Math.abs(v) });
    }
    out.sort((a, b) => (b.abs - a.abs));
    return out.slice(0, Math.max(0, max | 0));
  }

  // Try multiple endpoints for inspect (backend can evolve without breaking UI)
  const INSPECT_ENDPOINTS = [
    "/webapp/item/inspect",
    "/webapp/shop/inspect",
  ];

  async function postFirstOk(apiPostFn, paths, payload) {
    let lastErr = null;
    for (const p of paths) {
      try {
        const out = await apiPostFn(p, payload || {});
        // if your apiPost returns {ok:false,reason:"not_found"} without 404:
        if (out && out.ok === false && (out.reason === "not_found" || out.reason === "missing_endpoint")) {
          lastErr = out;
          continue;
        }
        return out;
      } catch (e) {
        lastErr = e;
        // If apiPost throws with status-like info, try next only for 404
        const st = e?.status || e?.data?.status || null;
        if (st === 404) continue;
        throw e;
      }
    }
    throw lastErr || new Error("Inspect endpoints failed");
  }

  function _injectShopStylesOnce() {
    if (document.getElementById("ah-shop-style")) return;
    const st = document.createElement("style");
    st.id = "ah-shop-style";
    st.textContent = `
      .ah-shop-wrap{ padding:14px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;height:78vh;display:flex;flex-direction:column; }
      .ah-shop-title{ text-align:center;margin:0 0 8px 0;font-weight:900;letter-spacing:.2px; }
      .ah-shop-meta{ text-align:center;opacity:.9;margin-bottom:10px;flex:0 0 auto;font-size:13px; }
      .ah-shop-list{ flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:10px;padding-right:6px; }
      .ah-shop-card{ background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;cursor:pointer; }
      .ah-shop-card:active{ transform: translateY(1px); }
      .ah-row{ display:flex;justify-content:space-between;gap:12px;align-items:flex-start; }
      .ah-left{ display:flex;gap:12px;align-items:flex-start;min-width:0;flex:1; }
      .ah-thumb{ width:52px;height:52px;flex:0 0 52px;object-fit:contain;border-radius:12px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12); }
      .ah-name{ font-weight:900;line-height:1.15; }
      .ah-sub{ opacity:.85;font-size:13px;margin-top:2px; }
      .ah-desc{ opacity:.9;font-size:13px;margin-top:6px; }
      .ah-right{ text-align:right;flex:0 0 auto; }
      .ah-price{ font-weight:900;margin-bottom:8px; }
      .ah-btn{ padding:10px 12px;border-radius:12px;border:0;cursor:pointer; }
      .ah-btn[disabled]{ opacity:.45;cursor:not-allowed; }

      /* Modal */
      .ah-pv-back{ display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:9999;align-items:center;justify-content:center;padding:16px; }
      .ah-pv{ width:min(560px,94vw);max-height:min(86vh,760px);overflow:auto;background:rgba(18,18,20,.92);border:1px solid rgba(255,255,255,.14);border-radius:18px;color:#fff; }
      .ah-pv-inner{ display:flex;flex-direction:column; }
      .ah-pv-header{ position:sticky;top:0;z-index:2;background:linear-gradient(to bottom, rgba(18,18,20,.98), rgba(18,18,20,.86));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.10);padding:12px; }
      .ah-pv-headrow{ display:flex;gap:12px;align-items:center; }
      .ah-pv-thumb{ width:56px;height:56px;flex:0 0 56px;object-fit:contain;border-radius:14px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12); }
      .ah-pv-title{ font-weight:950;font-size:16px;line-height:1.1; }
      .ah-pv-sub{ opacity:.82;font-size:12px;margin-top:3px; }
      .ah-pill{ display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);border-radius:999px;padding:5px 10px;font-size:12px;opacity:.95; }
      .ah-x{ margin-left:auto; width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;cursor:pointer; }
      .ah-x:active{ transform:translateY(1px); }
      .ah-pv-body{ padding:12px; }
      .ah-muted{ opacity:.82; }
      .ah-section{ margin-top:12px; padding-top:12px; border-top:1px solid rgba(255,255,255,.10); }
      .ah-quick{ display:flex;flex-wrap:wrap;gap:8px;margin-top:10px; }
      .ah-chip{ border:1px solid rgba(255,255,255,.12); background:rgba(0,0,0,.22); border-radius:999px; padding:7px 10px; font-size:12px; display:inline-flex; align-items:center; gap:8px; }
      .ah-chip .k{ opacity:.85; font-weight:800; letter-spacing:.2px; }
      .ah-chip .v{ font-weight:950; }

      .ah-table{ width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.22); }
      .ah-tr{ display:grid;grid-template-columns: 1.25fr .9fr .9fr .9fr; gap:8px; padding:9px 10px; align-items:center; }
      .ah-tr + .ah-tr{ border-top:1px solid rgba(255,255,255,.08); }
      .ah-th{ opacity:.75;font-size:11px;font-weight:900;letter-spacing:.6px;text-transform:uppercase; }
      .ah-tdk{ font-weight:900;opacity:.92; }
      .ah-tdn{ font-variant-numeric: tabular-nums; text-align:right; font-weight:900; }
      .ah-delta{ font-variant-numeric: tabular-nums; text-align:right; font-weight:950; }
      .pos{ color:#7CFFB2; }
      .neg{ color:#FF7C7C; }
      .neu{ color:rgba(255,255,255,.75); }

      .ah-pv-footer{ position:sticky;bottom:0;z-index:2;background:linear-gradient(to top, rgba(18,18,20,.98), rgba(18,18,20,.86));backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.10);padding:12px; }
      .ah-cta-row{ display:flex;gap:10px;align-items:center; }
      .ah-cta{ flex:1;padding:12px;border-radius:14px;border:0;cursor:pointer;font-weight:950; }
      .ah-cta[disabled]{ opacity:.45;cursor:not-allowed; }
      .ah-ghost{ padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;cursor:pointer; }
      .ah-note{ margin-top:8px;font-size:12px;opacity:.8;line-height:1.25; }
    `;
    document.head.appendChild(st);
  }

  window.Shop = {
    _apiPost: null,
    _tg: null,
    _dbg: false,
    _timer: null,
    _state: null,
    _previewNonce: 0,

    init({ apiPost, tg, dbg }) {
      this._apiPost = apiPost;
      this._tg = tg;
      this._dbg = !!dbg;
    },

    async open() {
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach(x => x.style.display = "none");

      window.SceneBg?.push?.("shop");

      // lock body scroll while Shop is open
      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";

      _injectShopStylesOnce();

      const container = el("app") || document.body;
      container.innerHTML = `
        <div class="ah-shop-wrap">
          <h2 class="ah-shop-title">Daily Shop</h2>

          <div id="shop-meta" class="ah-shop-meta">
            loading…
          </div>

          <!-- SCROLL AREA -->
          <div id="shop-list" class="ah-shop-list"></div>

          <div style="height:10px;flex:0 0 auto;"></div>

          <button id="shop-close" type="button"
            style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;flex:0 0 auto;">
            Close
          </button>
        </div>

        <!-- INSPECT / PREVIEW OVERLAY -->
        <div id="shop-preview-back" class="ah-pv-back">
          <div id="shop-preview" class="ah-pv"></div>
        </div>
      `;

      // click outside -> close inspect
      const pvBack = el("shop-preview-back");
      if (pvBack) {
        pvBack.onclick = (e) => { if (e.target === pvBack) this.closePreview(); };
      }

      // close: cleanup + unlock body + return to map
      el("shop-close").onclick = () => {
        this.closePreview();
        if (this._timer) clearInterval(this._timer);
        this._timer = null;

        document.body.style.overflow = document.body.dataset.prevOverflow || "";
        delete document.body.dataset.prevOverflow;

        window.SceneBg?.pop?.();

        if (window.Map?.open) return window.Map.open();
        window.location.reload();
      };

      await this.refresh();
    },

    async refresh() {
      const res = await this._apiPost("/webapp/shop/state", {});
      if (!res || !res.ok) {
        const meta = el("shop-meta");
        if (meta) meta.textContent = "Error loading shop.";
        return;
      }
      this._state = res.data;
      this.render();
      this.startCountdown();
    },

    startCountdown() {
      if (this._timer) clearInterval(this._timer);
      this._timer = setInterval(() => {
        if (!this._state) return;
        this._state.refreshInSec = Math.max(
          0,
          (this._state.refreshAt || 0) - Math.floor(Date.now() / 1000)
        );
        const meta = el("shop-meta");
        if (meta) meta.textContent = this.metaLine();
        if (this._state.refreshInSec <= 0) this.refresh();
      }, 1000);
    },

    metaLine() {
      const r = this._state?.resources || {};
      const sym = r.tokenSymbol || "$TOKEN";
      const left = this._state?.refreshInSec ?? 0;
      const m = Math.floor(left / 60), s = left % 60;
      return `🦴 ${r.bones ?? 0}  •  Scrap ${r.scrap ?? 0}  •  Dust ${r.rune_dust ?? 0}  •  🪙 ${r.token ?? 0} ${sym}  •  Refresh in ${m}m ${s}s`;
    },

    render() {
      const meta = el("shop-meta");
      if (meta) meta.textContent = this.metaLine();

      const list = el("shop-list");
      if (!list) return;

      const items = this._state?.items || [];
      const r = this._state?.resources || {};

      if (!items.length) {
        list.innerHTML = `<div style="opacity:.85;text-align:center;">No items today.</div>`;
        return;
      }

      list.innerHTML = items.map(it => {
        const priceStr = _priceString(it);
        const { disabled, reason, missingPrice, limit, bought } = _buyDisabledReason(it, r);

        const sub = [
          it.rarity ? it.rarity : null,
          it.type ? it.type : null,
          (limit > 0) ? `limit ${bought}/${limit}` : null,
          reason ? reason.toLowerCase() : null
        ].filter(Boolean).join(" • ");

        const key = itemKeyOf(it);
        return `
          <div class="ah-shop-card shop-card" data-preview="${escapeHtml(key)}">
            <div class="ah-row">

              <div class="ah-left">
                <img
                  src="${escapeHtml(itemImg(it))}"
                  width="52" height="52"
                  loading="lazy" decoding="async"
                  class="ah-thumb"
                  onerror="this.onerror=null;this.src='${escapeHtml(itemImgFallback())}';"
                  alt=""
                />
                <div style="min-width:0;">
                  <div class="ah-name">${escapeHtml(it.name)}</div>
                  <div class="ah-sub">${escapeHtml(sub)}</div>
                  <div class="ah-desc">${escapeHtml(it.desc || "")}</div>
                </div>
              </div>

              <div class="ah-right">
                <div class="ah-price">${escapeHtml(priceStr)}</div>
                <button type="button"
                  class="ah-btn"
                  data-buy="${escapeHtml(key)}"
                  ${disabled ? "disabled" : ""}>
                  ${missingPrice ? "N/A" : "Buy"}
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Buy buttons: stopPropagation so card click doesn't open inspect
      list.querySelectorAll("button[data-buy]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          if (btn.disabled) return;
          const k = btn.getAttribute("data-buy");
          this.buy(k);
        };
      });

      // Card click -> INSPECT (compare)
      list.onclick = (e) => {
        if (e.target.closest("button[data-buy]")) return;
        const card = e.target.closest(".shop-card");
        if (!card) return;
        const key = card.getAttribute("data-preview");
        if (key) this.openPreview(key);
      };
    },

    closePreview() {
      this._previewNonce++;
      const back = el("shop-preview-back");
      const box = el("shop-preview");
      if (box) box.innerHTML = "";
      if (back) back.style.display = "none";
      try { window.navClose?.("shop-preview-back"); } catch (_) {}
    },

    _renderPreviewShell(it) {
      const priceStr = _priceString(it);
      const r = this._state?.resources || {};
      const { disabled, reason, missingPrice, limit, bought } = _buyDisabledReason(it, r);

      const sub = [
        it.rarity ? it.rarity : null,
        it.type ? it.type : null,
        (limit > 0) ? `limit ${bought}/${limit}` : null
      ].filter(Boolean).join(" • ");

      const box = el("shop-preview");
      if (!box) return null;

      box.innerHTML = `
        <div class="ah-pv-inner">
          <div class="ah-pv-header">
            <div class="ah-pv-headrow">
              <img
                src="${escapeHtml(itemImg(it))}"
                width="56" height="56"
                decoding="async"
                class="ah-pv-thumb"
                onerror="this.onerror=null;this.src='${escapeHtml(itemImgFallback())}';"
                alt=""
              />
              <div style="min-width:0;">
                <div class="ah-pv-title">${escapeHtml(it.name)}</div>
                <div class="ah-pv-sub">
                  ${escapeHtml(sub || "")}
                </div>
                <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
                  ${it.rarity ? `<span class="ah-pill">${escapeHtml(it.rarity)}</span>` : ""}
                  <span class="ah-pill">${escapeHtml(priceStr)}</span>
                </div>
              </div>
              <button id="shop-preview-close" type="button" class="ah-x" aria-label="Close">✕</button>
            </div>
          </div>

          <div class="ah-pv-body">
            ${it.desc ? `<div class="ah-muted" style="font-size:13px;line-height:1.35;">${escapeHtml(it.desc)}</div>` : ""}

            <div class="ah-section">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="font-weight:950;font-size:13px;">Stats & Compare</div>
                <div id="shop-inspect-mini" class="ah-muted" style="font-size:12px;"></div>
              </div>

              <div id="shop-inspect-quick" class="ah-quick"></div>

              <div id="shop-inspect-table" style="margin-top:10px;">
                <div class="ah-muted" style="font-size:12px;">Loading stats…</div>
              </div>

              <div id="shop-inspect-eqnote" class="ah-note"></div>
            </div>
          </div>

          <div class="ah-pv-footer">
            <div class="ah-cta-row">
              <button id="shop-preview-buy" type="button" class="ah-cta" ${disabled ? "disabled" : ""}>
                ${missingPrice ? "N/A" : (it?.free ? "Claim" : "Buy")}
              </button>
              <button id="shop-preview-close2" type="button" class="ah-ghost">Close</button>
            </div>
            <div class="ah-note">${escapeHtml(reason || "")}</div>
          </div>
        </div>
      `;

      // wire close & buy
      const closeBtn = el("shop-preview-close");
      const closeBtn2 = el("shop-preview-close2");
      if (closeBtn) closeBtn.onclick = () => this.closePreview();
      if (closeBtn2) closeBtn2.onclick = () => this.closePreview();

      const buyBtn = el("shop-preview-buy");
      if (buyBtn) buyBtn.onclick = async () => {
        if (disabled) return;
        await this.buy(itemKeyOf(it));
        this.closePreview();
      };

      return { disabled };
    },

    async openPreview(itemKey) {
      const items = this._state?.items || [];
      const it = items.find(x => itemKeyOf(x) === String(itemKey));
      if (!it) return;

      const back = el("shop-preview-back");
      const box  = el("shop-preview");
      if (!back || !box) return;

      // show
      back.style.display = "flex";
      try { window.navOpen?.("shop-preview-back"); } catch (_) {}

      const nonce = ++this._previewNonce;

      // render premium shell instantly
      this._renderPreviewShell(it);

      // Fetch inspect payload (compare vs equipped)
      try {
        const payload = {
          itemKey,
          item_key: itemKey,
          key: itemKey,
          include_compare: true,
          includeCompare: true
        };

        const out = await postFirstOk(this._apiPost, INSPECT_ENDPOINTS, payload);

        // Guard for out-of-order responses
        if (nonce !== this._previewNonce) return;

        // Accept both {ok:true,data:{...}} and raw {...}
        const data = (out && out.ok === true && out.data) ? out.data : out;

        const item = data?.item || data?.shopItem || null;
        const eq = data?.equipped || data?.equippedItem || null;
        const delta = (data?.delta && typeof data.delta === "object") ? data.delta : {};

        const itemStats = (item?.stats && typeof item.stats === "object") ? item.stats : (data?.stats || {});
        const eqStats = (eq?.stats && typeof eq.stats === "object") ? eq.stats : {};
        const keys = _unionKeys(itemStats, eqStats);

        const mini = el("shop-inspect-mini");
        if (mini) {
          mini.textContent = eq ? "Comparing vs equipped" : "No equipped item for compare";
        }

        // Quick chips: show strongest deltas first
        const q = el("shop-inspect-quick");
        if (q) {
          const top = _topDeltas(delta, 5);
          q.innerHTML = top.length ? top.map(({ k, v }) => {
            const cls = _deltaClass(v);
            return `
              <div class="ah-chip ${cls}">
                <span class="k">${escapeHtml(statLabel(k))}</span>
                <span class="v">${escapeHtml(_fmtDelta(v))}</span>
              </div>
            `;
          }).join("") : `<div class="ah-muted" style="font-size:12px;">No meaningful deltas.</div>`;
        }

        // Table
        const tbl = el("shop-inspect-table");
        if (tbl) {
          if (!keys.length) {
            tbl.innerHTML = `<div class="ah-muted" style="font-size:12px;">No stats.</div>`;
          } else {
            // stable ordering: known keys first, then rest alpha
            const PREFERRED = ["hp", "vit", "str", "agi", "int", "luck", "dmg", "atk", "def", "crit_chance", "crit_dmg", "dodge", "speed"];
            const keyNorm = (k) => normalizeStatKey(k);
            const setPref = new Map(PREFERRED.map((k, i) => [k, i]));
            const sorted = keys.slice().sort((a, b) => {
              const ia = setPref.has(keyNorm(a)) ? setPref.get(keyNorm(a)) : 999;
              const ib = setPref.has(keyNorm(b)) ? setPref.get(keyNorm(b)) : 999;
              if (ia !== ib) return ia - ib;
              return String(a).localeCompare(String(b));
            });

            const rows = sorted.map(k => {
              const a = Number(itemStats[k] || 0);
              const b = Number(eqStats[k] || 0);
              const d = (delta[k] != null) ? Number(delta[k]) : (a - b);
              const cls = _deltaClass(d);

              return `
                <div class="ah-tr">
                  <div class="ah-tdk">${escapeHtml(statLabel(k))}</div>
                  <div class="ah-tdn">${escapeHtml(fmtNum(a))}</div>
                  <div class="ah-tdn">${escapeHtml(eq ? fmtNum(b) : "—")}</div>
                  <div class="ah-delta ${cls}">${escapeHtml(eq ? _fmtDelta(d) : "—")}</div>
                </div>
              `;
            }).join("");

            tbl.innerHTML = `
              <div class="ah-table">
                <div class="ah-tr ah-th">
                  <div>Stat</div><div style="text-align:right;">New</div><div style="text-align:right;">Eq</div><div style="text-align:right;">Δ</div>
                </div>
                ${rows}
              </div>
            `;
          }
        }

        // Equipped note
        const eqNote = el("shop-inspect-eqnote");
        if (eqNote) {
          if (eq) {
            const eqName = eq.name || eq.item_key || eq.key || "Equipped item";
            eqNote.innerHTML = `Equipped now: <b>${escapeHtml(eqName)}</b>`;
          } else {
            eqNote.innerHTML = `No equipped item in this slot — showing NEW stats only.`;
          }
        }
      } catch (e) {
        if (this._dbg) console.warn("[Shop inspect] failed:", e);
        const tbl = el("shop-inspect-table");
        if (tbl) {
          tbl.innerHTML = `<div class="ah-muted" style="font-size:12px;">No inspect data yet (endpoint missing or error).</div>`;
        }
        const q = el("shop-inspect-quick");
        if (q) q.innerHTML = "";
        const eqNote = el("shop-inspect-eqnote");
        if (eqNote) eqNote.textContent = "";
      }
    },

    async buy(itemKey) {
      const rid = (crypto?.randomUUID?.() || (String(Date.now()) + ":" + Math.random()));
      const res = await this._apiPost("/webapp/shop/buy", { itemKey, item_key: itemKey, run_id: rid });

      if (!res || !res.ok) {
        const msg = res?.message || res?.reason || "Buy failed";
        this.toast(msg);
        return;
      }

      this.toast(res.message || "Purchased!");
      await this.refresh();
    },

    toast(text) {
      const tg = this._tg;
      if (tg && tg.showPopup) {
        tg.showPopup({ title: "Shop", message: String(text).slice(0, 300), buttons: [{ type: "ok" }] });
      } else {
        alert(text);
      }
    }
  };
})();
