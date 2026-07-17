// Pack Recruitment V2 - canonical referral presentation for Alpha Husky WebApp.
(function () {
  "use strict";

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _root = null;
  let _state = null;
  let _loadError = "";
  let _keyHandler = null;

  const SHARE_TEXT = "Join my Pack in Alpha Husky.";

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || null;
    _tg = tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function getInitDataSafe(timeoutMs = 800) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      const value = _tg?.initData || window.Telegram?.WebApp?.initData || window.__INIT_DATA__ || "";
      if (value.length > 20) return value;
      await sleep(50);
    }
    return _tg?.initData || window.Telegram?.WebApp?.initData || window.__INIT_DATA__ || "";
  }

  async function post(path, payload = {}) {
    if (_apiPost) return await _apiPost(path, payload);
    const initData = await getInitDataSafe();
    const response = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, init_data: initData }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || json?.ok === false) {
      throw new Error(json?.reason || json?.error || `HTTP_${response.status}`);
    }
    return json;
  }

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    })[char]);
  }

  function icon(name) {
    const paths = {
      close: '<path d="M7 7l10 10M17 7 7 17"/>',
      copy: '<rect x="8" y="8" width="10" height="10" rx="2"/><path d="M15 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
      share: '<path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
      signal: '<path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M5 11a6 6 0 0 1 6 6M5 6a11 11 0 0 1 11 11"/>',
      reward: '<path d="M12 3 9.4 8.2 4 9l4 3.9L7.1 18l4.9-2.6 4.9 2.6-.9-5.1L20 9l-5.4-.8L12 3Z"/>',
      arrow: '<path d="m9 18 6-6-6-6"/>',
    };
    return `<svg class="ref-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.reward}</svg>`;
  }

  function track(eventName, data = {}) {
    try {
      if (typeof window.telegramAnalytics?.trackEvent === "function") {
        window.telegramAnalytics.trackEvent(eventName, data);
      } else if (typeof window.telegramAnalytics?.track === "function") {
        window.telegramAnalytics.track(eventName, data);
      }
    } catch (_) {}
  }

  function ensureStyles() {
    if (document.getElementById("ah-ref-v2-styles")) return;
    const style = el("style");
    style.id = "ah-ref-v2-styles";
    style.textContent = `
      .ah-ref-backdrop{position:fixed;inset:0;z-index:2147483641;display:flex;align-items:flex-end;justify-content:center;background:radial-gradient(circle at 50% 0,rgba(31,191,224,.13),transparent 42%),rgba(2,5,9,.82);backdrop-filter:blur(10px);padding:0;overflow:hidden}
      .ah-ref{--cyan:#55d9ee;--cyan2:#1689aa;--gold:#f0bd67;--ink:#071017;--line:rgba(133,213,231,.15);width:min(760px,100%);max-width:100vw;height:min(94dvh,900px);color:#eef9fc;border:1px solid var(--line);border-bottom:0;border-radius:24px 24px 0 0;background:linear-gradient(180deg,#0c171f 0,#081117 36%,#060b10 100%);box-shadow:0 -24px 70px rgba(0,0,0,.6),inset 0 1px rgba(255,255,255,.04);overflow:hidden;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .ah-ref *{box-sizing:border-box;min-width:0}
      .ah-ref button{font:inherit;color:inherit}
      .ah-ref-head{height:62px;display:flex;align-items:center;justify-content:space-between;padding:10px 14px 9px 18px;border-bottom:1px solid rgba(255,255,255,.07);background:linear-gradient(180deg,rgba(255,255,255,.025),transparent)}
      .ah-ref-kicker{font-size:9px;font-weight:850;letter-spacing:.18em;text-transform:uppercase;color:var(--cyan);opacity:.82}
      .ah-ref-title{font-size:18px;font-weight:900;letter-spacing:.015em;margin-top:2px}
      .ah-ref-close,.ref-preview-close{width:40px;height:40px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:rgba(255,255,255,.035);cursor:pointer}
      .ref-icon{width:19px;height:19px;display:block}
      .ah-ref-body{height:calc(100% - 62px);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;padding:12px 12px max(22px,env(safe-area-inset-bottom));display:grid;align-content:start;gap:11px}
      .ref-card{border:1px solid var(--line);border-radius:18px;background:linear-gradient(145deg,rgba(17,34,44,.92),rgba(7,15,21,.96));box-shadow:inset 0 1px rgba(255,255,255,.035),0 12px 30px rgba(0,0,0,.22);overflow:hidden}
      .ref-hero{position:relative;padding:13px;background:radial-gradient(circle at 85% 15%,rgba(240,189,103,.13),transparent 28%),radial-gradient(circle at 10% 0,rgba(85,217,238,.12),transparent 32%),linear-gradient(145deg,#10232d,#091218 72%)}
      .ref-hero:after{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(110deg,transparent 35%,rgba(255,255,255,.025) 50%,transparent 65%)}
      .ref-status-row{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
      .ref-rank{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#a8c5cf;font-weight:800}.ref-rank strong{color:var(--gold);font-weight:900}
      .ref-cap-chip{font-size:9px;letter-spacing:.08em;text-transform:uppercase;font-weight:850;color:#ffd596;border:1px solid rgba(240,189,103,.2);border-radius:999px;background:rgba(240,189,103,.08);padding:5px 8px}
      .ref-hero-main{position:relative;z-index:1;display:grid;grid-template-columns:124px minmax(0,1fr);gap:13px;align-items:center}
      .ref-reward-art{position:relative;height:142px;border:1px solid rgba(116,214,233,.16);border-radius:15px;background:radial-gradient(circle at 50% 40%,rgba(65,192,218,.17),transparent 48%),linear-gradient(180deg,rgba(12,31,41,.88),rgba(4,10,15,.96));overflow:hidden;display:grid;place-items:center}
      .ref-reward-art:before{content:"";position:absolute;inset:auto 10% -20px;height:44px;background:var(--cyan);filter:blur(28px);opacity:.12}
      .ref-reward-art img{position:relative;z-index:1;width:100%;height:100%;object-fit:contain;object-position:center;display:block}
      .ref-reward-fallback{position:absolute;inset:0;display:grid;place-items:center;text-align:center;padding:12px;color:#7894a0}.ref-reward-fallback[hidden]{display:none}.ref-reward-fallback .ref-icon{width:36px;height:36px;margin:0 auto 7px;color:#5e9bab}.ref-fallback-label{font-size:9px;text-transform:uppercase;letter-spacing:.12em;font-weight:850}
      .ref-next-label{font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:var(--cyan);font-weight:850;margin-bottom:4px}.ref-next-name{font-size:20px;line-height:1.05;font-weight:950;letter-spacing:-.02em}.ref-next-type{margin-top:4px;font-size:11px;color:#8ea9b4}.ref-count{display:flex;align-items:baseline;gap:5px;margin-top:9px}.ref-count strong{font-size:25px;line-height:1;color:#fff}.ref-count span{font-size:11px;color:#94aeb8}.ref-remaining{font-size:10px;margin-top:4px;color:#f3c67e;font-weight:800}
      .ref-progress{position:relative;height:9px;margin-top:9px;border:1px solid rgba(255,255,255,.08);border-radius:99px;background:#050b0f;overflow:hidden}.ref-progress-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#148fae,#55d9ee 66%,#f0bd67);box-shadow:0 0 16px rgba(85,217,238,.28)}.ref-progress-segments{position:absolute;inset:0;display:grid;grid-template-columns:repeat(5,1fr)}.ref-progress-segments i{border-right:1px solid rgba(2,9,12,.45)}.ref-progress-segments i:last-child{border:0}
      .ref-actions{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin-top:11px}.ref-btn{min-height:42px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.045);display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:9px 13px;font-size:12px;font-weight:900;cursor:pointer}.ref-btn-primary{border-color:rgba(85,217,238,.38);background:linear-gradient(180deg,rgba(52,188,216,.28),rgba(17,114,140,.24));box-shadow:inset 0 1px rgba(255,255,255,.08),0 8px 22px rgba(17,145,171,.13);letter-spacing:.02em}.ref-btn-compact{min-width:105px}.ref-btn:disabled{opacity:.5;cursor:not-allowed}
      .ref-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-top:10px;border:1px solid rgba(255,255,255,.06);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.06)}.ref-stat{padding:8px 6px;text-align:center;background:rgba(5,13,18,.86)}.ref-stat strong{display:block;font-size:15px}.ref-stat span{display:block;margin-top:2px;font-size:8px;letter-spacing:.1em;text-transform:uppercase;color:#7f9ba6;font-weight:800}
      .ref-inline-state{padding:10px 12px;border:1px solid rgba(240,189,103,.18);border-radius:13px;background:rgba(240,189,103,.065);font-size:11px;line-height:1.4;color:#e9cca0}.ref-inline-state strong{color:#ffda9d}
      .ref-section{padding:13px}.ref-section-head{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:10px}.ref-section-title{font-size:13px;font-weight:950;letter-spacing:.02em}.ref-section-note{font-size:9px;color:#78929d;text-align:right}
      .ref-track{display:grid;gap:7px}.ref-tier{width:100%;display:grid;grid-template-columns:48px minmax(0,1fr) auto;align-items:center;gap:10px;padding:7px;border:1px solid rgba(255,255,255,.075);border-radius:13px;background:rgba(255,255,255,.025);text-align:left;cursor:pointer}.ref-tier.is-current{border-color:rgba(85,217,238,.3);background:linear-gradient(90deg,rgba(38,164,190,.11),rgba(255,255,255,.02));box-shadow:inset 3px 0 var(--cyan)}.ref-tier.is-unlocked{border-color:rgba(240,189,103,.14)}.ref-tier.is-locked{opacity:.72}.ref-tier-art{width:48px;height:48px;position:relative;display:grid;place-items:center;border-radius:11px;overflow:hidden;background:#081319;border:1px solid rgba(255,255,255,.08)}.ref-tier-art img{width:100%;height:100%;object-fit:contain}.ref-tier-art .ref-reward-fallback{padding:5px}.ref-tier-art .ref-reward-fallback .ref-icon{width:21px;height:21px;margin:0}.ref-tier-art .ref-fallback-label{display:none}.ref-tier-name{font-size:12px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ref-tier-meta{font-size:9px;color:#8099a3;margin-top:3px;text-transform:uppercase;letter-spacing:.07em}.ref-tier-state{display:flex;align-items:center;gap:4px;font-size:8px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#718b95}.ref-tier.is-unlocked .ref-tier-state{color:var(--gold)}.ref-tier.is-current .ref-tier-state{color:var(--cyan)}.ref-tier-state .ref-icon{width:14px;height:14px}
      .ref-details{border-top:1px solid rgba(255,255,255,.055)}.ref-details:first-of-type{border-top:0}.ref-details summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px;cursor:pointer;font-size:11px;font-weight:900}.ref-details summary::-webkit-details-marker{display:none}.ref-details summary .ref-icon{width:15px;height:15px;transition:transform .18s}.ref-details[open] summary .ref-icon{transform:rotate(90deg)}.ref-details-body{padding:0 13px 13px;color:#91a7b0;font-size:10px;line-height:1.55}.ref-rule{padding:8px 0;border-top:1px solid rgba(255,255,255,.05)}.ref-rule:first-child{border-top:0;padding-top:0}.ref-rule strong{display:block;color:#dbeaf0;font-size:10px;margin-bottom:2px}.ref-other-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px}.ref-other-actions .ref-btn{min-height:38px;font-size:10px}
      .ref-skeleton{padding:13px}.ref-skeleton-block{border-radius:13px;background:linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.09),rgba(255,255,255,.04));background-size:220% 100%;animation:ref-shimmer 1.4s linear infinite}.ref-skeleton-hero{height:330px}.ref-skeleton-row{height:64px;margin-top:9px}@keyframes ref-shimmer{to{background-position:-220% 0}}
      .ref-error{padding:24px 16px;text-align:center}.ref-error-mark{width:54px;height:54px;margin:0 auto 12px;display:grid;place-items:center;border-radius:16px;border:1px solid rgba(240,189,103,.18);color:var(--gold);background:rgba(240,189,103,.06)}.ref-error-mark .ref-icon{width:27px;height:27px}.ref-error h3{font-size:16px;margin:0}.ref-error p{font-size:11px;color:#8da3ac;line-height:1.5;margin:7px auto 14px;max-width:360px}
      .ah-ref-toast{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));z-index:2147483644;transform:translateX(-50%);width:max-content;max-width:calc(100vw - 28px);padding:10px 13px;border:1px solid rgba(85,217,238,.2);border-radius:12px;background:rgba(5,12,17,.96);box-shadow:0 12px 36px rgba(0,0,0,.46);font-size:11px;color:#eaf8fb;text-align:center}
      .ref-preview-backdrop{position:absolute;inset:0;z-index:5;display:flex;align-items:flex-end;background:rgba(0,0,0,.72);backdrop-filter:blur(5px)}.ref-preview{width:100%;padding:14px 14px max(18px,env(safe-area-inset-bottom));border-top:1px solid rgba(85,217,238,.18);border-radius:20px 20px 0 0;background:linear-gradient(180deg,#10202a,#071016);box-shadow:0 -20px 50px rgba(0,0,0,.5)}.ref-preview-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.ref-preview-kicker{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);font-weight:850}.ref-preview-grid{display:grid;grid-template-columns:138px minmax(0,1fr);gap:13px;align-items:center}.ref-preview .ref-reward-art{height:154px}.ref-preview h3{font-size:19px;margin:0 0 5px}.ref-preview p{font-size:11px;line-height:1.5;color:#94aab3;margin:0}.ref-preview-status{display:inline-flex;margin-top:10px;padding:5px 8px;border:1px solid rgba(255,255,255,.09);border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
      @media (min-width:700px){.ah-ref-backdrop{align-items:center;padding:20px}.ah-ref{border-bottom:1px solid var(--line);border-radius:24px;height:min(90dvh,860px)}.ah-ref-body{padding:15px 16px 22px}.ref-hero{padding:16px}.ref-hero-main{grid-template-columns:155px 1fr}.ref-reward-art{height:168px}}
      @media (max-width:359px){.ah-ref-head{padding-left:14px}.ah-ref-body{padding-left:8px;padding-right:8px}.ref-hero{padding:10px}.ref-hero-main{grid-template-columns:105px minmax(0,1fr);gap:9px}.ref-reward-art{height:128px}.ref-next-name{font-size:17px}.ref-actions{grid-template-columns:1fr}.ref-btn-compact{width:100%}.ref-stat span{font-size:7px}.ref-tier{grid-template-columns:44px minmax(0,1fr) auto;gap:7px}.ref-tier-art{width:44px;height:44px}.ref-tier-state span{display:none}.ref-preview-grid{grid-template-columns:112px minmax(0,1fr)}}
      @media (max-height:700px){.ah-ref{height:97dvh}.ref-reward-art{height:122px}.ref-hero-main{grid-template-columns:110px minmax(0,1fr)}.ref-next-name{font-size:18px}.ref-stats{margin-top:8px}.ref-stat{padding:6px}.ref-actions{margin-top:9px}}
      @media (prefers-reduced-motion:reduce){.ref-skeleton-block{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function toast(message) {
    document.querySelectorAll(".ah-ref-toast").forEach((node) => node.remove());
    const node = el("div", "ah-ref-toast", esc(message));
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function lockScroll(locked) {
    document.body.style.overflow = locked ? "hidden" : "";
    document.body.style.touchAction = locked ? "none" : "";
  }

  function cleanupReferralDom() {
    document.querySelectorAll(".ah-ref-backdrop").forEach((node) => node.remove());
    document.querySelectorAll(".ah-ref-toast").forEach((node) => node.remove());
    if (_keyHandler) document.removeEventListener("keydown", _keyHandler);
    _keyHandler = null;
    lockScroll(false);
    document.body.classList.remove("referral-open", "modal-open", "sheet-open");
    document.documentElement.classList.remove("referral-open", "modal-open", "sheet-open");
  }

  function rewardAssetMarkup(reward, compact = false) {
    const url = String(reward?.assetUrl || "").trim();
    const label = reward?.kind === "skin" ? "Skin preview" : "Badge preview";
    return `
      ${url ? `<img data-ref-asset src="${esc(url)}" alt="${esc(reward?.name || "Reward")}">` : ""}
      <div class="ref-reward-fallback" ${url ? "hidden" : ""}>
        <div>${icon("reward")}<div class="ref-fallback-label">${compact ? "" : esc(label)}</div></div>
      </div>`;
  }

  function bindAssetFallbacks(scope) {
    scope.querySelectorAll("img[data-ref-asset]").forEach((img) => {
      img.addEventListener("error", () => {
        img.hidden = true;
        const fallback = img.parentElement?.querySelector(".ref-reward-fallback");
        if (fallback) fallback.hidden = false;
      }, { once: true });
    });
  }

  async function copyText(text, message = "Referral link copied.") {
    const value = String(text || "").trim();
    if (!value) {
      toast("Link generation failed.");
      return false;
    }
    let copied = false;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch (_) {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
      area.remove();
    }
    if (copied) {
      track("referral_link_copied", { link_type: value === _state?.linkBot ? "bot" : "webapp" });
      toast(message);
    } else {
      toast("Copy unavailable.");
    }
    return copied;
  }

  async function shareReferral() {
    const url = String(_state?.linkApp || "").trim();
    if (!url) {
      toast("Link generation failed.");
      return;
    }
    track("referral_share_invoked", { channel: _tg?.openTelegramLink ? "telegram" : navigator.share ? "system" : "copy" });
    const telegramShare = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(SHARE_TEXT)}`;
    if (typeof _tg?.openTelegramLink === "function") {
      try {
        _tg.openTelegramLink(telegramShare);
        toast("Share opened. A recruit counts only after qualifying.");
        return;
      } catch (error) {
        if (_dbg) console.warn("[Referrals] Telegram share failed", error);
      }
    }
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Alpha Husky", text: SHARE_TEXT, url });
        toast("Share opened. A recruit counts only after qualifying.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          toast("Share closed. No recruit was recorded.");
          return;
        }
      }
    }
    const copied = await copyText(url, "Share unavailable. Referral link copied.");
    if (!copied) toast("Share unavailable.");
  }

  function openBotLink() {
    const url = String(_state?.linkBot || "").trim();
    if (!url) return toast("Link generation failed.");
    try {
      if (typeof _tg?.openTelegramLink === "function") _tg.openTelegramLink(url);
      else window.open(url, "_blank", "noopener");
    } catch (_) {
      copyText(url, "Bot link copied.");
    }
  }

  function calcProgress(data) {
    const qualified = Number(data?.stats?.qualified ?? data?.stats?.rewardedInvites ?? 0);
    const tiers = Array.isArray(data?.tiers) ? data.tiers : [];
    const next = data?.nextTier || null;
    if (!next || Number(next.left || 0) <= 0) return { qualified, need: qualified, left: 0, pct: 100 };
    let previous = 0;
    for (const tier of tiers) {
      if (String(tier.key) === String(next.key)) break;
      previous = Math.max(previous, Number(tier.need || 0));
    }
    const need = Number(next.need || 0);
    const pct = Math.max(0, Math.min(100, ((qualified - previous) / Math.max(1, need - previous)) * 100));
    return { qualified, need, left: Math.max(0, need - qualified), pct };
  }

  function milestoneState(tier, next) {
    if (tier?.achieved) return "unlocked";
    if (String(tier?.key || "") === String(next?.key || "") && Number(next?.left || 0) > 0) return "current";
    return "locked";
  }

  function showRewardPreview(reward, stateName) {
    if (!_root || !reward) return;
    _root.querySelector(".ref-preview-backdrop")?.remove();
    const layer = el("div", "ref-preview-backdrop");
    layer.innerHTML = `
      <section class="ref-preview" role="dialog" aria-modal="true" aria-label="Reward preview">
        <div class="ref-preview-head">
          <div class="ref-preview-kicker">Reward preview - view only</div>
          <button class="ref-preview-close" type="button" aria-label="Close reward preview">${icon("close")}</button>
        </div>
        <div class="ref-preview-grid">
          <div class="ref-reward-art">${rewardAssetMarkup(reward)}</div>
          <div>
            <h3>${esc(reward.name || reward.key)}</h3>
            <p>${esc(reward.description || `Unlocks at ${reward.need} qualified recruits.`)}</p>
            <div class="ref-preview-status">${esc(stateName)} - ${Number(reward.need || 0)} qualified</div>
          </div>
        </div>
      </section>`;
    layer.querySelector(".ref-preview-close")?.addEventListener("click", () => layer.remove());
    layer.addEventListener("click", (event) => { if (event.target === layer) layer.remove(); });
    _root.appendChild(layer);
    bindAssetFallbacks(layer);
    track("referral_milestone_preview_opened", { reward_key: String(reward.key || ""), requirement: Number(reward.need || 0) });
  }

  function mount() {
    ensureStyles();
    cleanupReferralDom();
    lockScroll(true);
    document.body.classList.add("referral-open");
    const backdrop = el("div", "ah-ref-backdrop");
    const modal = el("section", "ah-ref");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Pack Recruitment");
    modal.innerHTML = `
      <header class="ah-ref-head">
        <div><div class="ah-ref-kicker">Pack network</div><div class="ah-ref-title">Pack Recruitment</div></div>
        <button class="ah-ref-close" type="button" aria-label="Close recruitment">${icon("close")}</button>
      </header>
      <main class="ah-ref-body"></main>`;
    backdrop.appendChild(modal);
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) unmount(true); });
    modal.querySelector(".ah-ref-close")?.addEventListener("click", () => unmount(true));
    _keyHandler = (event) => {
      if (event.key !== "Escape") return;
      const preview = _root?.querySelector(".ref-preview-backdrop");
      if (preview) preview.remove();
      else unmount(true);
    };
    document.addEventListener("keydown", _keyHandler);
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
      try { window.Telegram?.WebApp?.expand?.(); } catch (_) {}
      if (goHomeAfter) try { window.goHome?.(); } catch (_) {}
    });
  }

  function renderLoading(body) {
    body.innerHTML = `<div class="ref-card ref-skeleton"><div class="ref-skeleton-block ref-skeleton-hero"></div><div class="ref-skeleton-block ref-skeleton-row"></div></div>`;
  }

  function renderError(body) {
    const card = el("div", "ref-card ref-error");
    card.innerHTML = `<div class="ref-error-mark">${icon("signal")}</div><h3>Recruitment data unavailable</h3><p>We could not load your referral contract. No progress or ownership was changed.${_loadError ? ` (${esc(_loadError)})` : ""}</p>`;
    const retry = el("button", "ref-btn ref-btn-primary", "Retry");
    retry.type = "button";
    retry.addEventListener("click", async () => {
      _loadError = "";
      _state = null;
      render();
      try { await loadState(); } catch (_) {}
      render();
    });
    card.appendChild(retry);
    body.appendChild(card);
  }

  function renderHero(body, data) {
    const next = data.nextTier || null;
    const progress = calcProgress(data);
    const allDone = !!data.allMilestonesCompleted || (next && Number(next.left || 0) === 0);
    const daily = Number(data.stats?.dailyCount || 0);
    const cap = Number(data.stats?.dailyCap || data.contract?.dailyCap || 5);
    const capReached = cap > 0 && daily >= cap;
    const reward = next || data.tiers?.[data.tiers.length - 1] || {};
    const hero = el("section", "ref-card ref-hero");
    hero.innerHTML = `
      <div class="ref-status-row">
        <div class="ref-rank">Status <strong>${esc(data.rank?.name || "Rising Recruiter")}</strong></div>
        ${capReached ? '<div class="ref-cap-chip">Daily cap reached</div>' : ""}
      </div>
      <div class="ref-hero-main">
        <div class="ref-reward-art">${rewardAssetMarkup(reward)}</div>
        <div>
          <div class="ref-next-label">${allDone ? "Recruitment path complete" : "Next milestone"}</div>
          <div class="ref-next-name">${esc(reward.name || "Pack Reward")}</div>
          <div class="ref-next-type">${esc(reward.kind === "skin" ? "Recruiter skin" : "Recruitment badge")}</div>
          <div class="ref-count"><strong>${progress.qualified} / ${Number(reward.need || progress.need || progress.qualified)}</strong><span>qualified</span></div>
          <div class="ref-remaining">${allDone ? "All canonical rewards earned" : `${progress.left} more qualified ${progress.left === 1 ? "recruit" : "recruits"} required`}</div>
          <div class="ref-progress" aria-label="${Math.round(progress.pct)} percent to next reward"><div class="ref-progress-fill" style="width:${progress.pct.toFixed(2)}%"></div><div class="ref-progress-segments"><i></i><i></i><i></i><i></i><i></i></div></div>
        </div>
      </div>
      <div class="ref-actions">
        <button class="ref-btn ref-btn-primary" data-ref-action="share" type="button">${icon("share")}Invite a Howler</button>
        <button class="ref-btn ref-btn-compact" data-ref-action="copy" type="button">${icon("copy")}Copy Link</button>
      </div>
      <div class="ref-stats">
        <div class="ref-stat"><strong>${Number(data.stats?.qualified ?? data.stats?.rewardedInvites ?? 0)}</strong><span>Qualified</span></div>
        <div class="ref-stat"><strong>${daily} / ${cap}</strong><span>Today</span></div>
        <div class="ref-stat"><strong>${Number(data.stats?.rewardsEarned || 0)}</strong><span>Rewards earned</span></div>
      </div>`;
    hero.querySelector('[data-ref-action="share"]')?.addEventListener("click", shareReferral);
    hero.querySelector('[data-ref-action="copy"]')?.addEventListener("click", () => copyText(data.linkApp));
    body.appendChild(hero);
    bindAssetFallbacks(hero);
    if (capReached) {
      const capState = el("div", "ref-inline-state", `<strong>Rewarded cap reached for today.</strong> Inviting remains available, but additional recruits today will not add to lifetime qualified progress. The counter resets on UTC.`);
      body.appendChild(capState);
    } else if (progress.qualified === 0) {
      body.appendChild(el("div", "ref-inline-state", "No qualified recruits yet. Share your WebApp onboarding link to begin your recruitment path."));
    }
  }

  function renderTrack(body, data) {
    const card = el("section", "ref-card ref-section");
    card.innerHTML = `<div class="ref-section-head"><div class="ref-section-title">Recruitment Path</div><div class="ref-section-note">Tap any reward to preview</div></div>`;
    const trackNode = el("div", "ref-track");
    (Array.isArray(data.tiers) ? data.tiers : []).forEach((tier) => {
      const stateName = milestoneState(tier, data.nextTier);
      const row = el("button", `ref-tier is-${stateName}`);
      row.type = "button";
      const stateIcon = stateName === "unlocked" ? "check" : stateName === "current" ? "signal" : "lock";
      row.innerHTML = `
        <div class="ref-tier-art">${rewardAssetMarkup(tier, true)}</div>
        <div><div class="ref-tier-name">${esc(tier.name || tier.key)}</div><div class="ref-tier-meta">${Number(tier.need || 0)} qualified - ${esc(tier.kind || "reward")}</div></div>
        <div class="ref-tier-state">${icon(stateIcon)}<span>${stateName}</span></div>`;
      row.addEventListener("click", () => showRewardPreview(tier, stateName));
      trackNode.appendChild(row);
    });
    card.appendChild(trackNode);
    body.appendChild(card);
    bindAssetFallbacks(card);
  }

  function renderDetails(body, data) {
    const contract = data.contract || {};
    const card = el("section", "ref-card");
    const options = el("details", "ref-details");
    options.innerHTML = `<summary><span>Other invite options</span>${icon("arrow")}</summary><div class="ref-details-body"><div class="ref-other-actions"><button class="ref-btn" data-bot-open type="button">Open Bot Link</button><button class="ref-btn" data-bot-copy type="button">${icon("copy")}Copy Bot Link</button></div></div>`;
    options.querySelector("[data-bot-open]")?.addEventListener("click", openBotLink);
    options.querySelector("[data-bot-copy]")?.addEventListener("click", () => copyText(data.linkBot, "Bot link copied."));
    const rules = el("details", "ref-details");
    rules.innerHTML = `
      <summary><span>How recruitment works</span>${icon("arrow")}</summary>
      <div class="ref-details-body">
        <div class="ref-rule"><strong>Qualified recruit</strong>${esc(contract.qualification || "A new Howler must enter through your valid referral code.")}</div>
        <div class="ref-rule"><strong>Rewarded daily cap</strong>${esc(contract.capPolicy || `Up to ${data.stats?.dailyCap || 5} recruits per UTC day advance progress.`)}</div>
        <div class="ref-rule"><strong>Self-referral</strong>${esc(contract.selfReferralPolicy || "Your own account cannot qualify through its own code.")}</div>
        <div class="ref-rule"><strong>Above the cap</strong>${contract.aboveCapCountsLifetime === false ? "Recruits above the cap do not add to lifetime qualified progress and are not credited later." : "See the current referral contract."}</div>
      </div>`;
    card.appendChild(options);
    card.appendChild(rules);
    body.appendChild(card);
  }

  function render() {
    if (!_root) return;
    const body = _root.querySelector(".ah-ref-body");
    body.innerHTML = "";
    if (_loadError && !_state) return renderError(body);
    if (!_state) return renderLoading(body);
    renderHero(body, _state);
    renderTrack(body, _state);
    renderDetails(body, _state);
  }

  async function loadState() {
    let lastError = null;
    _loadError = "";
    _state = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await post("/webapp/referrals/state", {});
        _state = response?.data || response || null;
        if (!_state?.linkApp || !_state?.stats || !Array.isArray(_state?.tiers)) {
          throw new Error("INVALID_REFERRAL_PAYLOAD");
        }
        return;
      } catch (error) {
        lastError = error;
        const message = String(error?.message || "");
        if ((message.includes("MISSING") || message.includes("HTTP_401")) && attempt < 2) {
          await sleep(150 + attempt * 250);
          continue;
        }
        break;
      }
    }
    _loadError = String(lastError?.message || "Unknown error");
    throw lastError || new Error(_loadError);
  }

  async function open() {
    if (_root || document.querySelector(".ah-ref-backdrop")) unmount(false);
    mount();
    track("referral_panel_opened");
    render();
    try {
      await loadState();
    } catch (error) {
      if (_dbg) console.warn("[Referrals] load failed", error);
    }
    render();
  }

  window.Referrals = { init, open, close: unmount };
})();
