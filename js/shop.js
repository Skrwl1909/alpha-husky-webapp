// js/shop.js — Daily Shop inside WebApp (supports token credits)
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
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back").forEach(x => x.style.display = "none");

      const container = el("app") || document.body;
      container.innerHTML = `
        <div style="padding:20px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;">
          <h2 style="text-align:center;margin:0 0 10px 0;">Daily Shop</h2>
          <div id="shop-meta" style="text-align:center;opacity:.9;margin-bottom:14px;">loading…</div>
          <div id="shop-list" style="display:flex;flex-direction:column;gap:10px;"></div>
          <div style="height:16px"></div>
          <button id="shop-close" type="button" style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;">
            Close
          </button>
        </div>
      `;

      el("shop-close").onclick = () => window.Map?.open?.() || window.location.reload();

      await this.refresh();
    },

    async refresh() {
      const res = await this._apiPost("/webapp/shop/state", {});
      if (!res || !res.ok) {
        el("shop-meta").textContent = "Error loading shop.";
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
      el("shop-meta").textContent = this.metaLine();

      const list = el("shop-list");
      const items = this._state.items || [];
      const r = this._state.resources || {};
      const tokenBal = Number(r.token ?? 0);

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
        const disabled = hitLimit || notEnoughToken;

        const sub = [
          it.rarity ? it.rarity : null,
          it.type ? it.type : null,
          (limit > 0) ? `limit ${bought}/${limit}` : null,
          notEnoughToken ? "not enough token" : null
        ].filter(Boolean).join(" • ");

        return `
          <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:12px;">
            <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
              <div style="min-width:0;">
                <div style="font-weight:700;">${escapeHtml(it.name)}</div>
                <div style="opacity:.85;font-size:13px;margin-top:2px;">${escapeHtml(sub)}</div>
                <div style="opacity:.9;font-size:13px;margin-top:6px;">${escapeHtml(it.desc || "")}</div>
              </div>
              <div style="text-align:right;flex:0 0 auto;">
                <div style="font-weight:700;margin-bottom:8px;">${escapeHtml(priceStr)}</div>
                <button type="button"
                  data-buy="${escapeHtml(it.key)}"
                  ${disabled ? "disabled" : ""}
                  style="padding:10px 12px;border-radius:12px;border:0;cursor:pointer;${disabled ? "opacity:.45;cursor:not-allowed;" : ""}">
                  Buy
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      list.querySelectorAll("button[data-buy]").forEach(btn => {
        btn.onclick = () => this.buy(btn.getAttribute("data-buy"));
      });
    },

    async buy(itemKey) {
      const res = await this._apiPost("/webapp/shop/buy", { itemKey });
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
