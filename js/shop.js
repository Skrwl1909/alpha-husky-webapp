// js/shop.js — Daily Shop inside WebApp (supports token credits) + thumbnails + preview modal
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

  // ---- Assets helpers (repo: /assets/items/*.png) ----
  function imgVer() {
    return window.WEBAPP_VER ? `?v=${encodeURIComponent(window.WEBAPP_VER)}` : "";
  }

  function assetKeyFromItem(it) {
    // Most of your assets look snake/lower in repo
    const k = String(it?.key || "").trim();
    return k ? k.toLowerCase() : "";
  }

  function itemImg(it) {
    const key = assetKeyFromItem(it);
    const ver = imgVer();
    return key ? `/assets/items/${encodeURIComponent(key)}.png${ver}` : `/assets/items/_unknown.png${ver}`;
  }

  function itemImgFallback() {
    return `/assets/items/_unknown.png${imgVer()}`;
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

      // ✅ lock body scroll while Shop is open
      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";

      const container = el("app") || document.body;
      container.innerHTML = `
        <div style="padding:14px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;height:78vh;display:flex;flex-direction:column;">
          <h2 style="text-align:center;margin:0 0 8px 0;">Daily Shop</h2>

          <div id="shop-meta" style="text-align:center;opacity:.9;margin-bottom:10px;flex:0 0 auto;">
            loading…
          </div>

          <!-- ✅ SCROLL AREA -->
          <div id="shop-list"
            style="flex:1 1 auto;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:10px;padding-right:6px;">
          </div>

          <div style="height:10px;flex:0 0 auto;"></div>

          <button id="shop-close" type="button"
            style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;flex:0 0 auto;">
            Close
          </button>
        </div>

        <!-- ✅ Preview Overlay -->
        <div id="shop-preview-back"
             style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);
                    backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);
                    z-index:9999;align-items:center;justify-content:center;padding:16px;">
          <div id="shop-preview"
               style="width:min(560px,94vw);background:rgba(18,18,20,.92);
                      border:1px solid rgba(255,255,255,.14);
                      border-radius:16px;padding:14px;color:#fff;">
          </div>
        </div>
      `;

      // click outside preview -> close
      const pvBack = el("shop-preview-back");
      if (pvBack) {
        pvBack.onclick = (e) => { if (e.target === pvBack) this.closePreview(); };
      }

      // ✅ close: cleanup + unlock body + return to map
      el("shop-close").onclick = () => {
        this.closePreview();
        if (this._timer) clearInterval(this._timer);
        this._timer = null;

        document.body.style.overflow = document.body.dataset.prevOverflow || "";
        delete document.body.dataset.prevOverflow;

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
        this._state.refreshInSec = Math.max(0, (this._state.refreshAt || 0) - Math.floor(Date.now() / 1000));
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
      const tokenBal = Number(r.token ?? 0);
      const boneBal  = Number(r.bones ?? 0);

      if (!items.length) {
        list.innerHTML = `<div style="opacity:.85;text-align:center;">No items today.</div>`;
        return;
      }

      list.innerHTML = items.map(it => {
        const tokenPrice = (it.price_tokens != null) ? Number(it.price_tokens) : null;
        const bonePrice  = (it.price != null) ? Number(it.price) : null;

        const priceStr = (tokenPrice != null)
          ? `${tokenPrice} 🪙`
          : `${bonePrice ?? "?"} 🦴`;

        const limit = Number.isFinite(it.dailyLimit) ? it.dailyLimit : 0;
        const bought = Number.isFinite(it.boughtToday) ? it.boughtToday : 0;
        const hitLimit = (limit > 0 && bought >= limit);

        const notEnoughToken = (tokenPrice != null && tokenBal < tokenPrice);
        const notEnoughBones = (tokenPrice == null && bonePrice != null && boneBal < bonePrice);
        const disabled = hitLimit || notEnoughToken || notEnoughBones;

        const sub = [
          it.rarity ? it.rarity : null,
          it.type ? it.type : null,
          (limit > 0) ? `limit ${bought}/${limit}` : null,
          notEnoughToken ? "not enough token" : null,
          notEnoughBones ? "not enough bones" : null
        ].filter(Boolean).join(" • ");

        return `
          <div class="shop-card"
               data-preview="${escapeHtml(it.key)}"
               style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
                      border-radius:14px;padding:12px;cursor:pointer;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">

              <div style="display:flex;gap:12px;align-items:flex-start;min-width:0;flex:1;">
                <img
                  src="${itemImg(it)}"
                  width="52" height="52"
                  loading="lazy" decoding="async"
                  style="width:52px;height:52px;flex:0 0 52px;object-fit:contain;border-radius:12px;
                         background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);"
                  onerror="this.onerror=null;this.src='${itemImgFallback()}';"
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
                  data-buy="${escapeHtml(it.key)}"
                  ${disabled ? "disabled" : ""}
                  style="padding:10px 12px;border-radius:12px;border:0;cursor:pointer;
                         ${disabled ? "opacity:.45;cursor:not-allowed;" : ""}">
                  Buy
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Buy buttons: stopPropagation so card click doesn't open preview
      list.querySelectorAll("button[data-buy]").forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          this.buy(btn.getAttribute("data-buy"));
        };
      });

      // Card click -> preview (except Buy)
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
    },

    openPreview(itemKey) {
      const items = this._state?.items || [];
      const it = items.find(x => String(x?.key) === String(itemKey));
      if (!it) return;

      const r = this._state?.resources || {};
      const tokenBal = Number(r.token ?? 0);
      const boneBal  = Number(r.bones ?? 0);

      const tokenPrice = (it.price_tokens != null) ? Number(it.price_tokens) : null;
      const bonePrice  = (it.price != null) ? Number(it.price) : null;
      const priceStr = (tokenPrice != null) ? `${tokenPrice} 🪙` : `${bonePrice ?? "?"} 🦴`;

      const limit = Number.isFinite(it.dailyLimit) ? it.dailyLimit : 0;
      const bought = Number.isFinite(it.boughtToday) ? it.boughtToday : 0;
      const hitLimit = (limit > 0 && bought >= limit);

      const notEnoughToken = (tokenPrice != null && tokenBal < tokenPrice);
      const notEnoughBones = (tokenPrice == null && bonePrice != null && boneBal < bonePrice);
      const disabled = hitLimit || notEnoughToken || notEnoughBones;

      const sub = [
        it.rarity ? it.rarity : null,
        it.type ? it.type : null,
        (limit > 0) ? `limit ${bought}/${limit}` : null
      ].filter(Boolean).join(" • ");

      const reason =
        hitLimit ? "Daily limit reached."
        : notEnoughToken ? "Not enough token."
        : notEnoughBones ? "Not enough bones."
        : "";

      const back = el("shop-preview-back");
      const box  = el("shop-preview");
      if (!back || !box) return;

      box.innerHTML = `
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <img
            src="${itemImg(it)}"
            width="192" height="192"
            decoding="async"
            style="width:192px;height:192px;flex:0 0 192px;object-fit:contain;border-radius:14px;
                   background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);"
            onerror="this.onerror=null;this.src='${itemImgFallback()}';"
            alt=""
          />
          <div style="min-width:0;flex:1;">
            <div style="font-weight:800;font-size:18px;line-height:1.2;">${escapeHtml(it.name)}</div>
            <div style="opacity:.85;font-size:13px;margin-top:4px;">${escapeHtml(sub)}</div>
            <div style="opacity:.92;font-size:13px;margin-top:10px;">${escapeHtml(it.desc || "")}</div>

            <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div style="font-weight:800;font-size:16px;">${escapeHtml(priceStr)}</div>
              <div style="opacity:.85;font-size:12px;">${escapeHtml(reason)}</div>
            </div>

            <div style="margin-top:12px;display:flex;gap:10px;">
              <button id="shop-preview-buy" type="button"
                ${disabled ? "disabled" : ""}
                style="flex:1;padding:12px;border-radius:12px;border:0;cursor:pointer;
                       ${disabled ? "opacity:.45;cursor:not-allowed;" : ""}">
                Buy
              </button>
              <button id="shop-preview-close" type="button"
                style="padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.14);
                       background:transparent;color:#fff;cursor:pointer;">
                Close
              </button>
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
    },

    async buy(itemKey) {
  const rid = (crypto?.randomUUID?.() || (String(Date.now()) + ":" + Math.random()));
  const res = await this._apiPost("/webapp/shop/buy", { itemKey, run_id: rid });

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
