// js/referrals.js — Referrals modal for Alpha Husky WebApp (MVP)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;
  }

  async function post(path, payload) {
    if (_apiPost) return await _apiPost(path, payload || {});
    const API_BASE = window.API_BASE || "";
    const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ init_data: initData, ...(payload || {}) }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error((json && (json.reason || json.error)) || `HTTP_${res.status}`);
    if (json && json.ok === false) throw new Error(json.reason || "ERROR");
    return json;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
  }

  function ensureStyles() {
    if (document.getElementById("ah-ref-styles")) return;
    const s = el("style");
    s.id = "ah-ref-styles";
    s.textContent = `
      .ah-ref-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.62);z-index:2147483641;display:flex;align-items:flex-end;justify-content:center}
      .ah-ref{width:min(860px,100%);max-height:90vh;background:rgba(14,16,18,.97);border:1px solid rgba(255,255,255,.10);
        border-radius:18px 18px 0 0;overflow:hidden;box-shadow:0 -12px 40px rgba(0,0,0,.60);color:#f4f6ff}
      .ah-ref *{color:inherit}
      .ah-ref-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(255,255,255,.10)}
      .ah-ref-title{font-weight:900;letter-spacing:.3px}
      .ah-ref-sub{opacity:.88;font-size:12px;margin-top:2px}
      .ah-ref-close{border:0;background:transparent;color:#fff;font-size:18px;opacity:.9}
      .ah-ref-body{padding:14px;overflow:auto;max-height:calc(90vh - 58px)}
      .ah-pillrow{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      .ah-pill{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);font-weight:900;font-size:12px;opacity:.98}
      .ah-note{padding:12px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);margin-bottom:10px}
      .ah-small{opacity:.88;font-size:12px}
      .ah-btnrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .ah-btn{padding:9px 11px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);font-weight:900}
      .ah-btn:disabled{opacity:.55}
      .ah-field{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:8px}
      .ah-field input{flex:1;min-width:0;padding:9px 10px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.07);color:#fff}
      .ah-divider{height:1px;background:rgba(255,255,255,.10);margin:10px 0}
      .ah-tier{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);margin-bottom:8px}
      .ah-tier-left{display:flex;align-items:center;gap:10px;min-width:0}
      .ah-tier-ico{width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;font-size:16px;flex:0 0 auto}
      .ah-tier-meta{min-width:0}
      .ah-tier-meta b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-tier-meta .ah-small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ah-tag{font-size:11px;opacity:.85;border:1px solid rgba(255,255,255,.14);padding:3px 8px;border-radius:999px;background:rgba(0,0,0,.18);font-weight:900;flex:0 0 auto}
      .ah-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:16px;background:rgba(0,0,0,.80);color:#fff;
        padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);z-index:2147483642;max-width:min(560px,92vw)}
    `;
    document.head.appendChild(s);
  }

  function toast(msg) {
    const t = el("div", "ah-toast", msg);
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function lockScroll(lock) {
    document.body.style.overflow = lock ? "hidden" : "";
    document.body.style.touchAction = lock ? "none" : "";
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied.");
      return;
    } catch (_) {}
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("Copied."); } catch (e) { toast("Copy failed."); }
    ta.remove();
  }

  function shareLink(url, text) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text || "")}`;
    if (_tg && _tg.openTelegramLink) _tg.openTelegramLink(shareUrl);
    else window.open(shareUrl, "_blank");
  }

  let _root = null;
  let _state = null;

  function mount() {
    ensureStyles();
    lockScroll(true);

    const backdrop = el("div", "ah-ref-backdrop");
    const modal = el("div", "ah-ref");

    const head = el("div", "ah-ref-head");
    const left = el("div");
    left.appendChild(el("div", "ah-ref-title", "Recruit & Earn"));
    left.appendChild(el("div", "ah-ref-sub", "#Referrals — bring Howlers to the Pack"));
    head.appendChild(left);

    const close = el("button", "ah-ref-close", "✕");
    close.addEventListener("click", unmount);
    head.appendChild(close);

    const body = el("div", "ah-ref-body", "");
    modal.appendChild(head);
    modal.appendChild(body);
    backdrop.appendChild(modal);

    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) unmount(); });

    _root = backdrop;
    document.body.appendChild(backdrop);
  }

  function unmount() {
    lockScroll(false);
    if (_root) _root.remove();
    _root = null;
    _state = null;
  }

  function render() {
    if (!_root) return;
    const body = _root.querySelector(".ah-ref-body");
    body.innerHTML = "";

    if (!_state) {
      body.appendChild(el("div", "ah-small", "Loading…"));
      return;
    }

    const d = _state;

    // pills
    const pills = el("div", "ah-pillrow");
    pills.appendChild(el("div", "ah-pill", `Rewarded invites: ${d.stats?.rewardedInvites ?? 0}`));
    pills.appendChild(el("div", "ah-pill", `Today: ${d.stats?.dailyCount ?? 0}/${d.stats?.dailyCap ?? 5}`));
    pills.appendChild(el("div", "ah-pill", `Loot: ${d.stats?.loot ?? 0}`));
    body.appendChild(pills);

    // invited by
    if (d.invitedBy) {
      body.appendChild(el("div", "ah-note", `<b>Invited by</b><div class="ah-small">${esc(d.invitedBy.name || d.invitedBy.uid)}</div>`));
    }

    // links
    const links = el("div", "ah-note");
    links.appendChild(el("div", "", `<b>Your invite</b><div class="ah-small">Share the WebApp link for the smoothest onboarding.</div>`));

    const f1 = el("div", "ah-field");
    const inpApp = document.createElement("input");
    inpApp.value = d.linkApp || "";
    inpApp.readOnly = true;
    f1.appendChild(el("div", "ah-small", "WebApp"));
    f1.appendChild(inpApp);

    const f2 = el("div", "ah-field");
    const inpBot = document.createElement("input");
    inpBot.value = d.linkBot || "";
    inpBot.readOnly = true;
    f2.appendChild(el("div", "ah-small", "Bot"));
    f2.appendChild(inpBot);

    links.appendChild(f1);
    links.appendChild(f2);

    const btns = el("div", "ah-btnrow");
    const bCopy = el("button", "ah-btn", "Copy WebApp link");
    bCopy.type = "button";
    bCopy.addEventListener("click", () => copyText(d.linkApp || ""));
    const bShare = el("button", "ah-btn", "Share");
    bShare.type = "button";
    bShare.addEventListener("click", () => shareLink(d.linkApp || "", "Join the Pack 🐺 Alpha Husky WebApp"));

    const bCopyBot = el("button", "ah-btn", "Copy bot link");
    bCopyBot.type = "button";
    bCopyBot.addEventListener("click", () => copyText(d.linkBot || ""));

    btns.appendChild(bCopy);
    btns.appendChild(bShare);
    btns.appendChild(bCopyBot);

    links.appendChild(btns);

    links.appendChild(el("div", "ah-divider", ""));
    links.appendChild(el("div", "ah-small", `Tip: daily rewarded cap is ${d.stats?.dailyCap ?? 5}. Self-ref doesn’t count.`));

    body.appendChild(links);

    // tiers
    const tiers = el("div", "ah-note");
    const next = d.nextTier || null;
    tiers.appendChild(el("div", "", `<b>Referral tiers</b>${next && next.left > 0 ? `<div class="ah-small">Next: ${esc(next.icon || "🏅")} <b>${esc(next.name || next.key)}</b> — ${next.left} left</div>` : `<div class="ah-small">Max tier reached.</div>`}`));
    tiers.appendChild(el("div", "ah-divider", ""));

    const list = el("div", "");
    (d.tiers || []).forEach((t) => {
      const row = el("div", "ah-tier");
      const left = el("div", "ah-tier-left");
      left.appendChild(el("div", "ah-tier-ico", esc(t.icon || "🏅")));
      const meta = el("div", "ah-tier-meta");
      meta.appendChild(el("b", "", `${esc(t.name || t.key)} <span class="ah-small">· ${t.need} invites</span>`));
      meta.appendChild(el("div", "ah-small", esc(t.description || "")));
      left.appendChild(meta);

      const tag = el("div", "ah-tag", t.achieved ? "UNLOCKED" : "LOCKED");
      row.appendChild(left);
      row.appendChild(tag);
      list.appendChild(row);
    });

    tiers.appendChild(list);
    body.appendChild(tiers);
  }

  async function loadState() {
    const res = await post("/webapp/referrals/state", {});
    _state = (res && (res.data || res)) || null;
  }

  async function open() {
    mount();
    try {
      await loadState();
    } catch (e) {
      toast(`Referrals load failed: ${e.message}`);
    } finally {
      render();
    }
  }

  window.Referrals = { init, open, close: unmount };
})();
