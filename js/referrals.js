// js/referrals.js — Referrals modal for Alpha Husky WebApp (game-style UI rework)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _root = null;
  let _state = null;
  let _loadError = "";

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function getInitDataSafe(timeoutMs = 800) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
      const v =
        (_tg && _tg.initData) ||
        window.Telegram?.WebApp?.initData ||
        window.__INIT_DATA__ ||
        "";
      if (v && v.length > 20) return v;
      await sleep(50);
    }
    return (
      (_tg && _tg.initData) ||
      window.Telegram?.WebApp?.initData ||
      window.__INIT_DATA__ ||
      ""
    );
  }

  async function post(path, payload) {
    if (_apiPost) return await _apiPost(path, payload || {});

    const initData = await getInitDataSafe();
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...(payload || {}), init_data: initData }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(
        (json && (json.reason || json.error)) || `HTTP_${res.status}`
      );
    }
    if (json && json.ok === false) {
      throw new Error(json.reason || "ERROR");
    }
    return json;
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s ?? "").replace(
      /[&<>"']/g,
      (m) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[m])
    );
  }

  function ensureStyles() {
    if (document.getElementById("ah-ref-styles")) return;

    const s = el("style");
    s.id = "ah-ref-styles";
    s.textContent = `
      .ah-ref-backdrop{
        position:fixed;
        inset:0;
        background:
          radial-gradient(circle at top center, rgba(79,160,255,.10), transparent 38%),
          radial-gradient(circle at bottom center, rgba(255,153,51,.08), transparent 32%),
          rgba(0,0,0,.72);
        z-index:2147483641;
        display:flex;
        align-items:flex-end;
        justify-content:center;
        backdrop-filter: blur(8px);
      }

      .ah-ref{
        width:min(920px,100%);
        max-height:92vh;
        color:#eef4ff;
        border-radius:22px 22px 0 0;
        overflow:hidden;
        border:1px solid rgba(130,170,255,.18);
        background:
          linear-gradient(180deg, rgba(20,25,32,.98), rgba(10,12,16,.98)),
          radial-gradient(circle at top, rgba(91,151,255,.10), transparent 35%);
        box-shadow:
          0 -16px 50px rgba(0,0,0,.58),
          inset 0 1px 0 rgba(255,255,255,.04);
      }

      .ah-ref *{
        box-sizing:border-box;
        color:inherit;
      }

      .ah-ref-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:16px 16px 14px;
        border-bottom:1px solid rgba(255,255,255,.08);
        background:
          linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0)),
          radial-gradient(circle at top left, rgba(86,162,255,.10), transparent 36%);
      }

      .ah-ref-title{
        font-weight:1000;
        font-size:20px;
        letter-spacing:.35px;
      }

      .ah-ref-sub{
        opacity:.84;
        font-size:12px;
        margin-top:3px;
      }

      .ah-ref-close{
        width:38px;
        height:38px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
        color:#fff;
        font-size:18px;
        cursor:pointer;
      }

      .ah-ref-body{
        padding:14px;
        overflow:auto;
        max-height:calc(92vh - 74px);
        display:grid;
        gap:12px;
        padding-bottom:max(18px, env(safe-area-inset-bottom));
      }

      .ah-card{
        border:1px solid rgba(255,255,255,.10);
        border-radius:18px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.03),
          0 8px 24px rgba(0,0,0,.18);
        overflow:hidden;
      }

      .ah-card-pad{ padding:14px; }

      .ah-hero{
        position:relative;
        padding:16px;
        background:
          radial-gradient(circle at top right, rgba(255,184,77,.12), transparent 28%),
          radial-gradient(circle at top left, rgba(92,157,255,.16), transparent 34%),
          linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
      }

      .ah-hero:before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        background:linear-gradient(90deg, transparent, rgba(255,255,255,.03), transparent);
        opacity:.45;
      }

      .ah-hero-top{
        display:flex;
        justify-content:space-between;
        gap:12px;
        align-items:flex-start;
        margin-bottom:14px;
      }

      .ah-hero-title{
        font-size:22px;
        font-weight:1000;
        line-height:1.05;
      }

      .ah-hero-desc{
        margin-top:6px;
        font-size:13px;
        opacity:.84;
        max-width:560px;
        line-height:1.45;
      }

      .ah-sigil{
        width:54px;
        height:54px;
        border-radius:16px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:24px;
        border:1px solid rgba(255,190,90,.18);
        background:
          radial-gradient(circle at 30% 30%, rgba(255,185,74,.22), transparent 45%),
          rgba(255,255,255,.04);
        box-shadow:0 0 24px rgba(255,176,54,.10);
        flex:0 0 auto;
      }

      .ah-pillrow{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom:14px;
      }

      .ah-pill{
        padding:8px 11px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.06);
        font-size:12px;
        font-weight:900;
        color:#f6f8ff;
      }

      .ah-pill span{
        opacity:.7;
        margin-right:6px;
        font-weight:700;
      }

      .ah-progress-wrap{
        display:grid;
        gap:8px;
      }

      .ah-progress-top{
        display:flex;
        justify-content:space-between;
        gap:10px;
        font-size:12px;
        opacity:.9;
      }

      .ah-progress{
        height:12px;
        border-radius:999px;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(255,255,255,.08);
        overflow:hidden;
        position:relative;
      }

      .ah-progress > i{
        display:block;
        height:100%;
        border-radius:999px;
        background:
          linear-gradient(90deg, #58a6ff, #7dc7ff 48%, #ffc46b 100%);
        box-shadow:0 0 18px rgba(92,171,255,.26);
      }

      .ah-grid-2{
        display:grid;
        gap:12px;
        grid-template-columns:1fr 1fr;
      }

      @media (max-width: 760px){
        .ah-grid-2{ grid-template-columns:1fr; }
      }

      .ah-section-title{
        font-weight:1000;
        font-size:14px;
        margin-bottom:10px;
        letter-spacing:.2px;
      }

      .ah-linkcard{
        padding:12px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:16px;
        background:rgba(255,255,255,.03);
        display:grid;
        gap:10px;
      }

      .ah-linklabel{
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.8px;
        opacity:.68;
        font-weight:900;
      }

      .ah-linkvalue{
        font-size:13px;
        line-height:1.35;
        color:#dfe9ff;
        word-break:break-all;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(0,0,0,.18);
      }

      .ah-btnrow{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      .ah-btn{
        appearance:none;
        border:1px solid rgba(255,255,255,.12);
        background:
          linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.04));
        color:#f7faff;
        padding:10px 12px;
        border-radius:12px;
        font-weight:900;
        cursor:pointer;
        box-shadow:inset 0 1px 0 rgba(255,255,255,.03);
      }

      .ah-btn:hover{
        border-color:rgba(132,180,255,.26);
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.03),
          0 0 0 1px rgba(92,171,255,.08);
      }

      .ah-btn-primary{
        border-color:rgba(255,191,93,.22);
        background:
          linear-gradient(180deg, rgba(255,186,77,.18), rgba(255,141,41,.10));
        box-shadow:0 0 22px rgba(255,164,71,.08);
      }

      .ah-note{
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
      }

      .ah-small{
        font-size:12px;
        opacity:.82;
        line-height:1.45;
      }

      .ah-tierlist{
        display:grid;
        gap:10px;
      }

      .ah-tier{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:12px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
        transition:.18s ease;
      }

      .ah-tier-left{
        display:flex;
        align-items:center;
        gap:12px;
        min-width:0;
      }

      .ah-tier-ico{
        width:42px;
        height:42px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.12);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:18px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255,255,255,.10), transparent 48%),
          rgba(0,0,0,.18);
        flex:0 0 auto;
      }

      .ah-tier-meta{
        min-width:0;
      }

      .ah-tier-meta b{
        display:block;
        font-size:14px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      .ah-tier-meta .ah-small{
        white-space:normal;
        opacity:.75;
      }

      .ah-tag{
        font-size:10px;
        padding:5px 8px;
        border-radius:999px;
        font-weight:1000;
        letter-spacing:.4px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.20);
        flex:0 0 auto;
      }

      .ah-tier.is-achieved{
        border-color:rgba(255,191,92,.18);
        box-shadow:0 0 0 1px rgba(255,191,92,.06), 0 0 22px rgba(255,191,92,.05);
      }

      .ah-tier.is-achieved .ah-tag{
        color:#ffe2ab;
        border-color:rgba(255,191,92,.22);
        background:rgba(255,186,90,.10);
      }

      .ah-tier.is-next{
        border-color:rgba(92,171,255,.22);
        box-shadow:0 0 0 1px rgba(92,171,255,.07), 0 0 18px rgba(92,171,255,.05);
      }

      .ah-tier.is-next .ah-tag{
        color:#cfe6ff;
        border-color:rgba(92,171,255,.22);
        background:rgba(92,171,255,.10);
      }

      .ah-tier.is-locked{
        opacity:.82;
      }

      .ah-divider{
        height:1px;
        background:rgba(255,255,255,.08);
        margin:10px 0;
      }

      .ah-empty{
        padding:14px;
        border-radius:16px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
      }

      .ah-toast{
        position:fixed;
        left:50%;
        transform:translateX(-50%);
        bottom:16px;
        background:rgba(8,10,14,.92);
        color:#fff;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.12);
        z-index:2147483642;
        max-width:min(560px,92vw);
        box-shadow:0 10px 30px rgba(0,0,0,.34);
      }
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

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();

    try {
      document.execCommand("copy");
      toast("Copied.");
    } catch (e) {
      toast("Copy failed.");
    }

    ta.remove();
  }

  function shareLink(url, text) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      url
    )}&text=${encodeURIComponent(text || "")}`;

    if (_tg && _tg.openTelegramLink) _tg.openTelegramLink(shareUrl);
    else window.open(shareUrl, "_blank");
  }

  function shortLink(url) {
    const s = String(url || "");
    if (s.length <= 64) return s;
    return s.slice(0, 38) + "..." + s.slice(-18);
  }

  function calcTierProgress(d) {
    const rewarded = Number(d?.stats?.rewardedInvites || 0);
    const tiers = Array.isArray(d?.tiers) ? d.tiers : [];
    const next = d?.nextTier || null;

    if (!next) {
      return {
        current: rewarded,
        need: rewarded,
        left: 0,
        pct: 100,
      };
    }

    let prevNeed = 0;
    for (const t of tiers) {
      if ((t.key || "") === (next.key || "")) break;
      prevNeed = Math.max(prevNeed, Number(t.need || 0));
    }

    const need = Number(next.need || 0);
    const span = Math.max(1, need - prevNeed);
    const gain = Math.max(0, rewarded - prevNeed);
    const pct = Math.max(0, Math.min(100, Math.round((gain / span) * 100)));

    return {
      current: rewarded,
      need,
      left: Math.max(0, need - rewarded),
      pct,
    };
  }

  function mount() {
  ensureStyles();

  // usuń stare / osierocone instancje
  cleanupReferralDom();

  lockScroll(true);
  document.body.classList.add("referral-open");

  const backdrop = el("div", "ah-ref-backdrop");
  const modal = el("div", "ah-ref");

  const head = el("div", "ah-ref-head");
  const left = el("div");
  left.appendChild(el("div", "ah-ref-title", "Pack Recruitment"));
  left.appendChild(
    el("div", "ah-ref-sub", "#Referrals — bring new Howlers into the Pack")
  );
  head.appendChild(left);

  const close = el("button", "ah-ref-close", "✕");
  close.type = "button";
  close.addEventListener("click", () => unmount(true));
  head.appendChild(close);

  const body = el("div", "ah-ref-body", "");
  modal.appendChild(head);
  modal.appendChild(body);
  backdrop.appendChild(modal);

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) unmount(true);
  });

  _root = backdrop;
  document.body.appendChild(backdrop);
}

  function unmount(goHomeAfter = false) {
  cleanupReferralDom();

  _root = null;
  _state = null;
  _loadError = "";

  try { window.navOpen?.(); } catch (_) {}
  try { window.navCloseTop?.(); } catch (_) {}

  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
    window.Telegram?.WebApp?.expand?.();

    if (goHomeAfter) {
      try { window.goHome?.(); } catch (_) {}
    }
  });
}

  function renderError(body) {
    const wrap = el("div", "ah-card ah-card-pad");
    wrap.innerHTML = `
      <div class="ah-section-title">Recruitment Feed Offline</div>
      <div class="ah-empty">
        <div><b>Could not load referrals.</b></div>
        <div class="ah-small" style="margin-top:6px;">${esc(
          _loadError || "Unknown error."
        )}</div>
      </div>
    `;

    const btns = el("div", "ah-btnrow");
    btns.style.marginTop = "12px";

    const retry = el("button", "ah-btn ah-btn-primary", "Retry");
    retry.type = "button";
    retry.addEventListener("click", async () => {
      _loadError = "";
      _state = null;
      render();
      try {
        await loadState();
      } catch (e) {
        toast(`Referrals load failed: ${e.message}`);
      } finally {
        render();
      }
    });

    btns.appendChild(retry);
    wrap.appendChild(btns);
    body.appendChild(wrap);
  }

  function render() {
    if (!_root) return;
    const body = _root.querySelector(".ah-ref-body");
    body.innerHTML = "";

    if (_loadError && !_state) {
      renderError(body);
      return;
    }

    if (!_state) {
      body.appendChild(el("div", "ah-small", "Loading…"));
      return;
    }

    const d = _state;
    const next = d.nextTier || null;
    const prog = calcTierProgress(d);

    // HERO
    const hero = el("div", "ah-card ah-hero");
    hero.innerHTML = `
      <div class="ah-hero-top">
        <div>
          <div class="ah-hero-title">Recruit the Pack</div>
          <div class="ah-hero-desc">
            Bring new Howlers into Alpha Husky, unlock referral tiers, and grow your standing through real recruits entering the world.
          </div>
        </div>
        <div class="ah-sigil">🐺</div>
      </div>

      <div class="ah-pillrow">
        <div class="ah-pill"><span>Invites</span>${d.stats?.rewardedInvites ?? 0}</div>
        <div class="ah-pill"><span>Today</span>${d.stats?.dailyCount ?? 0}/${d.stats?.dailyCap ?? 5}</div>
        <div class="ah-pill"><span>Loot</span>${d.stats?.loot ?? 0}</div>
      </div>

      <div class="ah-progress-wrap">
        <div class="ah-progress-top">
          <div>${
            next
              ? `Next reward: ${esc(next.icon || "🏅")} ${esc(
                  next.name || next.key
                )}`
              : "All referral tiers unlocked"
          }</div>
          <div>${next ? `${prog.left} left` : "MAX"}</div>
        </div>
        <div class="ah-progress"><i style="width:${prog.pct}%"></i></div>
      </div>
    `;
    body.appendChild(hero);

    // INVITED BY
    if (d.invitedBy) {
      const invited = el("div", "ah-card ah-card-pad");
      invited.innerHTML = `
        <div class="ah-section-title">Your Recruiter</div>
        <div class="ah-note">
          <b>${esc(d.invitedBy.name || "Unknown Howler")}</b>
          <div class="ah-small">${esc(d.invitedBy.uid || "")}</div>
        </div>
      `;
      body.appendChild(invited);
    }

    // LINKS
    const links = el("div", "ah-card ah-card-pad");
    links.innerHTML = `<div class="ah-section-title">Your Signal</div>`;

    const grid = el("div", "ah-grid-2");

    const appCard = el("div", "ah-linkcard");
    appCard.innerHTML = `
      <div class="ah-linklabel">WebApp Link</div>
      <div class="ah-linkvalue">${esc(shortLink(d.linkApp || ""))}</div>
    `;
    const appBtns = el("div", "ah-btnrow");
    const bCopy = el("button", "ah-btn ah-btn-primary", "Copy WebApp");
    bCopy.type = "button";
    bCopy.addEventListener("click", () => copyText(d.linkApp || ""));

    const bShare = el("button", "ah-btn", "Share");
    bShare.type = "button";
    bShare.addEventListener("click", () =>
      shareLink(d.linkApp || "", "Join the Pack 🐺 Alpha Husky WebApp")
    );

    appBtns.appendChild(bCopy);
    appBtns.appendChild(bShare);
    appCard.appendChild(appBtns);

    const botCard = el("div", "ah-linkcard");
    botCard.innerHTML = `
      <div class="ah-linklabel">Bot Link</div>
      <div class="ah-linkvalue">${esc(shortLink(d.linkBot || ""))}</div>
    `;
    const botBtns = el("div", "ah-btnrow");
    const bCopyBot = el("button", "ah-btn", "Copy Bot");
    bCopyBot.type = "button";
    bCopyBot.addEventListener("click", () => copyText(d.linkBot || ""));
    botBtns.appendChild(bCopyBot);
    botCard.appendChild(botBtns);

    grid.appendChild(appCard);
    grid.appendChild(botCard);
    links.appendChild(grid);

    links.appendChild(el("div", "ah-divider", ""));
    links.appendChild(
      el(
        "div",
        "ah-small",
        `WebApp onboarding gives the smoothest entry. Daily rewarded cap: ${
          d.stats?.dailyCap ?? 5
        }. Self-ref does not count.`
      )
    );

    body.appendChild(links);

    // TIERS
    const tiers = el("div", "ah-card ah-card-pad");
    tiers.innerHTML = `
      <div class="ah-section-title">Recruitment Path</div>
      <div class="ah-small" style="margin-bottom:10px;">
        ${
          next && next.left > 0
            ? `Next unlock: ${esc(next.icon || "🏅")} <b>${esc(
                next.name || next.key
              )}</b> — ${next.left} invites left`
            : "You have reached the highest referral tier."
        }
      </div>
    `;

    const list = el("div", "ah-tierlist");
    (d.tiers || []).forEach((t) => {
      const isNext = !!next && (t.key || "") === (next.key || "");
      const cls = `ah-tier ${t.achieved ? "is-achieved" : isNext ? "is-next" : "is-locked"}`;

      const row = el("div", cls);
      const left = el("div", "ah-tier-left");
      left.appendChild(el("div", "ah-tier-ico", esc(t.icon || "🏅")));

      const meta = el("div", "ah-tier-meta");
      meta.appendChild(el("b", "", `${esc(t.name || t.key)} · ${t.need} invites`));
      meta.appendChild(el("div", "ah-small", esc(t.description || "")));
      left.appendChild(meta);

      const tagText = t.achieved ? "UNLOCKED" : isNext ? "NEXT" : "LOCKED";
      const tag = el("div", "ah-tag", tagText);

      row.appendChild(left);
      row.appendChild(tag);
      list.appendChild(row);
    });

    tiers.appendChild(list);
    body.appendChild(tiers);

    // FOOTER / INFO
    const foot = el("div", "ah-card ah-card-pad");
    foot.innerHTML = `
      <div class="ah-section-title">Field Notes</div>
      <div class="ah-note">
        <div class="ah-small">
          Invite players who are actually likely to enter and play. WebApp-first entry makes the onboarding cleaner,
          faster, and more consistent with the live systems inside Alpha Husky.
        </div>
      </div>
    `;
    body.appendChild(foot);
  }

  async function loadState() {
    let lastErr = null;
    _loadError = "";
    _state = null;

    await sleep(120);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await post("/webapp/referrals/state", {});
        _state = (res && (res.data || res)) || null;
        _loadError = "";
        return;
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || "");
        if (msg.includes("MISSING") || msg.includes("HTTP_401")) {
          await sleep(150 + attempt * 250);
          continue;
        }
        break;
      }
    }

    _loadError = String(lastErr?.message || "Unknown error");
    throw lastErr;
  }

  async function open() {
  if (_root || document.querySelector(".ah-ref-backdrop")) {
    unmount(false);
  }

  mount();
  try {
    await loadState();
  } catch (e) {
    toast(`Referrals load failed: ${e.message}`);
  } finally {
    render();
  }
}

  window.Referrals = {
    init,
    open,
    close: unmount,
  };
})();
