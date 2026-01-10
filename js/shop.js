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

    const folder =
      (it?.slot && String(it.slot).length) ||
      (String(it?.type || "").toLowerCase() === "gear")
        ? "equip"
        : "items";

    return `/assets/${folder}/${encodeURIComponent(key)}.png${ver}`;
  }

  function _fmtDelta(num) {
    const v = Number(num || 0);
    if (!v) return "";
    return (v > 0 ? "+" : "") + v;
  }

  function _deltaClass(v) {
    const n = Number(v || 0);
    if (n > 0) return "pos";
    if (n < 0) return "neg";
    return "";
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

    if (hasBoneCost && hasTokenCost) return `${bonePrice} 🦴 + ${tokenPrice} 🪙`;
    if (hasTokenCost) return `${tokenPrice} 🪙`;
    if (hasBoneCost) return `${bonePrice} 🦴`;
    return (it?.free ? "FREE" : "?");
  }

  function _buyDisabledReason(it, resources) {
    const r = resources || {};
    const tokenBal = Number(r.token ?? 0);
    const boneBal  = Number(r.bones ?? 0);

    const { tokenPrice, bonePrice } = getPrices(it);
    const hasTokenCost = (tokenPrice != null && Number(tokenPrice) > 0);
    const hasBoneCost  = (bonePrice != null && Number(bonePrice) > 0);

    const limit = Number.isFinite(it.dailyLimit) ? it.dailyLimit : 0;
    const bought = Number.isFinite(it.boughtToday) ? it.boughtToday : 0;
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

    return { disabled, reason, missingPrice };
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

  window.Shop = {
    _apiPost: null,
    _tg: null,
    _dbg: false,
    _timer: null,
    _state: null,

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

      const container = el("app") || document.body;
      container.innerHTML = `
        <div style="padding:14px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;height:78vh;display:flex;flex-direction:column;">
          <h2 style="text-align:center;margin:0 0 8px 0;">Daily Shop</h2>

          <div id="shop-meta" style="text-align:center;opacity:.9;margin-bottom:10px;flex:0 0 auto;">
            loading…
          </div>

          <!-- SCROLL AREA -->
          <div id="shop-list"
            style="flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:10px;padding-right:6px;">
          </div>

          <div style="height:10px;flex:0 0 auto;"></div>

          <button id="shop-close" type="button"
            style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;flex:0 0 auto;">
            Close
          </button>
        </div>

        <!-- INSPECT / PREVIEW OVERLAY -->
        <div id="shop-preview-back"
             style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);
                    backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
                    z-index:9999;align-items:center;justify-content:center;padding:16px;">
          <div id="shop-preview"
               style="width:min(560px,94vw);max-height:min(82vh,720px);overflow:auto;
                      background:rgba(18,18,20,.92);
                      border:1px solid rgba(255,255,255,.14);
                      border-radius:16px;padding:14px;color:#fff;">
          </div>
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

        const { disabled, reason, missingPrice } = _buyDisabledReason(it, r);

        const limit = Number.isFinite(it.dailyLimit) ? it.dailyLimit : 0;
        const bought = Number.isFinite(it.boughtToday) ? it.boughtToday : 0;

        const sub = [
          it.rarity ? it.rarity : null,
          it.type ? it.type : null,
          (limit > 0) ? `limit ${bought}/${limit}` : null,
          reason ? reason.toLowerCase() : null
        ].filter(Boolean).join(" • ");

        const key = String(it?.key || it?.item_key || "");
        return `
          <div class="shop-card"
               data-preview="${escapeHtml(key)}"
               style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
                      border-radius:14px;padding:12px;cursor:pointer;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">

              <div style="display:flex;gap:12px;align-items:flex-start;min-width:0;flex:1;">
                <img
                  src="${escapeHtml(itemImg(it))}"
                  width="52" height="52"
                  loading="lazy" decoding="async"
                  style="width:52px;height:52px;flex:0 0 52px;object-fit:contain;border-radius:12px;
                         background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);"
                  onerror="this.onerror=null;this.src='${escapeHtml(itemImgFallback())}';"
                  alt=""
                />
                <div style="min-width:0;">
                  <div style="font-weight:700;">${escapeHtml(it.name)}</div>
                  <div style="opacity:.85;font-size:13px;margin-top:2px;">${escapeHtml(sub)}</div>
                  <div style="opacity:.9;font-size:13px;margin-top:6px;">${escapeHtml(it.desc || "")}</div>
                </div>
              </div>

              <div style="text-align:right;flex:0 0 auto;">
                <div style="font-weight:700;margin-bottom:8px;">${escapeHtml(priceStr)}</div>
                <button type="button"
                  data-buy="${escapeHtml(key)}"
                  ${disabled ? "disabled" : ""}
                  style="padding:10px 12px;border-radius:12px;border:0;cursor:pointer;
                         ${disabled ? "opacity:.45;cursor:not-allowed;" : ""}">
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
      const back = el("shop-preview-back");
      if (back) back.style.display = "none";
      try { window.navClose?.("shop-preview-back"); } catch (_) {}
    },

    async openPreview(itemKey) {
      const items = this._state?.items || [];
      const it = items.find(x => String(x?.key || x?.item_key) === String(itemKey));
      if (!it) return;

      const r = this._state?.resources || {};
      const priceStr = _priceString(it);
      const { disabled, reason, missingPrice } = _buyDisabledReason(it, r);

      const limit = Number.isFinite(it.dailyLimit) ? it.dailyLimit : 0;
      const bought = Number.isFinite(it.boughtToday) ? it.boughtToday : 0;
      const sub = [
        it.rarity ? it.rarity : null,
        it.type ? it.type : null,
        (limit > 0) ? `limit ${bought}/${limit}` : null
      ].filter(Boolean).join(" • ");

      const back = el("shop-preview-back");
      const box  = el("shop-preview");
      if (!back || !box) return;

      // Show skeleton instantly
      box.innerHTML = `
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <img
            src="${escapeHtml(itemImg(it))}"
            width="192" height="192"
            decoding="async"
            style="width:192px;height:192px;flex:0 0 192px;object-fit:contain;border-radius:14px;
                   background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);"
            onerror="this.onerror=null;this.src='${escapeHtml(itemImgFallback())}';"
            alt=""
          />
          <div style="min-width:0;flex:1;">
            <div style="font-weight:800;font-size:18px;line-height:1.2;">${escapeHtml(it.name)}</div>
            <div style="opacity:.85;font-size:13px;margin-top:4px;">${escapeHtml(sub)}</div>
            <div style="opacity:.92;font-size:13px;margin-top:10px;">${escapeHtml(it.desc || "")}</div>

            <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div style="font-weight:800;font-size:16px;">${escapeHtml(priceStr)}</div>
              <div style="opacity:.85;font-size:12px;">${escapeHtml(reason || "")}</div>
            </div>

            <div style="margin-top:12px;display:flex;gap:10px;">
              <button id="shop-preview-buy" type="button"
                ${disabled ? "disabled" : ""}
                style="flex:1;padding:12px;border-radius:12px;border:0;cursor:pointer;
                       ${disabled ? "opacity:.45;cursor:not-allowed;" : ""}">
                ${missingPrice ? "N/A" : (it?.free ? "Claim" : "Buy")}
              </button>
              <button id="shop-preview-close" type="button"
                style="padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);
                       background:transparent;color:#fff;cursor:pointer;">
                Close
              </button>
            </div>

            <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.10);">
              <div style="font-weight:800;font-size:13px;margin-bottom:6px;">Stats & Compare</div>
              <div id="shop-inspect-body" style="opacity:.9;font-size:13px;">
                Loading stats…
              </div>
            </div>
          </div>
        </div>
      `;

      const closeBtn = el("shop-preview-close");
      if (closeBtn) closeBtn.onclick = () => this.closePreview();

      const buyBtn = el("shop-preview-buy");
      if (buyBtn) buyBtn.onclick = async () => {
        if (disabled) return;
        await this.buy(itemKey);
        this.closePreview();
      };

      back.style.display = "flex";
      try { window.navOpen?.("shop-preview-back"); } catch (_) {}

      // Fetch inspect payload (compare vs equipped)
      const inspectBody = el("shop-inspect-body");
      try {
        const payload = {
          itemKey,
          item_key: itemKey,
          key: itemKey,
          include_compare: true,
          includeCompare: true
        };

        const out = await postFirstOk(this._apiPost, INSPECT_ENDPOINTS, payload);

        // Accept both {ok:true,data:{...}} and raw {...}
        const data = (out && out.ok === true && out.data) ? out.data : out;

        const item = data?.item || data?.shopItem || null;
        const eq = data?.equipped || data?.equippedItem || null;
        const delta = data?.delta || {};

        // Stats
        const itemStats = (item?.stats && typeof item.stats === "object") ? item.stats : (data?.stats || {});
        const eqStats = (eq?.stats && typeof eq.stats === "object") ? eq.stats : {};
        const keys = _unionKeys(itemStats, eqStats);

        const lines = keys.length ? keys.map(k => {
          const a = Number(itemStats[k] || 0);
          const b = Number(eqStats[k] || 0);
          const d = (delta[k] != null) ? Number(delta[k]) : (a - b);
          const cls = _deltaClass(d);
          return `
            <div style="display:flex;justify-content:space-between;padding:3px 0;">
              <span style="opacity:.9">${escapeHtml(String(k).toUpperCase())}</span>
              <span>
                <span style="opacity:.95">${escapeHtml(a)}</span>
                ${eq ? `<span style="opacity:.55"> (eq ${escapeHtml(b)})</span>` : ``}
                ${eq ? `<span style="font-weight:800;margin-left:8px;" class="${cls}">${escapeHtml(_fmtDelta(d))}</span>` : ``}
              </span>
            </div>
          `;
        }).join("") : `<div style="opacity:.8;font-size:12px;">No stats.</div>`;

        const eqName = eq ? (eq.name || eq.item_key || eq.key || "Equipped item") : null;

        const extra = `
          ${eqName ? `<div style="margin-top:10px;opacity:.85;font-size:12px;">Equipped now: <b>${escapeHtml(eqName)}</b></div>`
                   : `<div style="margin-top:10px;opacity:.75;font-size:12px;">No equipped item in this slot (no compare).</div>`}
        `;

        if (inspectBody) {
          inspectBody.innerHTML = `
            <div style="border:1px solid rgba(255,255,255,.10);border-radius:12px;padding:10px;background:rgba(0,0,0,.25);">
              ${lines}
              ${extra}
            </div>
          `;
        }
      } catch (e) {
        if (this._dbg) console.warn("[Shop inspect] failed:", e);
        if (inspectBody) {
          inspectBody.innerHTML = `<div style="opacity:.8;font-size:12px;">No inspect data yet (endpoint missing or error).</div>`;
        }
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
