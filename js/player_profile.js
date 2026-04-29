// Alpha Husky WebApp - Pack Profile + Pack Signals v1
(function (global) {
  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    backEl: null,
    activeUid: "",
    profile: null,
    sending: false,
  };
  const DEFAULT_DAILY_PACK_SIGNALS = 3;

  const FACTION_ACCENTS = {
    rogue_byte: "0,229,255",
    echo_wardens: "170,120,255",
    pack_burners: "255,110,80",
    inner_howl: "180,255,120",
  };

  function asText(v) {
    return String(v ?? "").trim();
  }

  function asInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mediaMarkup(url, cls, alt) {
    const src = asText(url);
    if (!src) return "";
    if (/\.(mp4|webm)(\?|#|$)/i.test(src)) {
      return `<video class="${esc(cls)}" src="${esc(src)}" autoplay muted loop playsinline onerror="this.hidden=true;"></video>`;
    }
    return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(alt || "")}" loading="lazy" onerror="this.hidden=true;">`;
  }

  function initials(name) {
    const raw = asText(name) || "AH";
    const parts = raw.split(/\s+/).filter(Boolean);
    const text = (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : raw.slice(0, 2)).toUpperCase();
    return text || "AH";
  }

  function normalizeFactionKey(v) {
    const key = asText(v).toLowerCase().replace(/[\s-]+/g, "_");
    if (!key) return "";
    if (key === "rb" || key.includes("rogue")) return "rogue_byte";
    if (key === "ew" || key.includes("echo") || key.includes("warden")) return "echo_wardens";
    if (key === "pb" || key.includes("burner") || key.includes("pack_burn")) return "pack_burners";
    if (key === "ih" || key.includes("inner") || key.includes("iron") || key.includes("howl")) return "inner_howl";
    return FACTION_ACCENTS[key] ? key : "";
  }

  function factionAccentRgb(v) {
    return FACTION_ACCENTS[normalizeFactionKey(v)] || "125,211,252";
  }

  function dailyLimit(social) {
    const n = asInt(social?.daily_howls_limit ?? social?.daily_limit ?? social?.howl_daily_limit, DEFAULT_DAILY_PACK_SIGNALS);
    return n > 0 ? n : DEFAULT_DAILY_PACK_SIGNALS;
  }

  function dailyLeft(social) {
    const limit = dailyLimit(social);
    return clamp(asInt(social?.daily_howls_left ?? social?.remaining_today, limit), 0, limit);
  }

  function hasSentToday(social, isSelf) {
    if (isSelf) return false;
    if (social?.already_sent_today || social?.sent_today || social?.howled_today) return true;
    return !social?.can_howl && dailyLeft(social) > 0;
  }

  function howlButtonState(social, isSelf) {
    const left = dailyLeft(social);
    if (isSelf) return { label: "Your Profile", disabled: true, key: "self" };
    if (S.sending) return { label: "Sending...", disabled: true, key: "sending" };
    if (social?.howl_sent_current) return { label: "Howl Sent", disabled: true, key: "sent-now" };
    if (social?.can_howl) return { label: "Send Howl", disabled: false, key: "ready" };
    if (left <= 0) return { label: "No Pack Signals left today", disabled: true, key: "limit" };
    if (hasSentToday(social, isSelf)) return { label: "Already sent today", disabled: true, key: "sent" };
    return { label: "Send Howl", disabled: true, key: "blocked" };
  }

  function howlErrorMessage(code) {
    if (code === "daily_limit") return "You have used all Pack Signals for today.";
    if (code === "already_sent_today") return "You already sent a Howl to this player today.";
    if (code === "self_target") return "You cannot send a Howl to yourself.";
    return "Could not send Howl. Try again.";
  }

  function updateLocalHowlState(raw, uid, code = "") {
    if (!S.profile || asText(S.profile.uid) !== asText(uid)) return;
    const social = S.profile.social && typeof S.profile.social === "object" ? S.profile.social : {};
    const left = raw && Object.prototype.hasOwnProperty.call(raw, "remaining_today")
      ? asInt(raw.remaining_today, dailyLeft(social))
      : Math.max(0, dailyLeft(social) - (code ? 0 : 1));

    social.daily_howls_left = clamp(left, 0, dailyLimit(social));
    if (code === "daily_limit") social.daily_howls_left = 0;
    if (code === "already_sent_today" || !code) social.already_sent_today = true;
    social.can_howl = false;

    if (!code) {
      social.howl_sent_current = true;
      social.howls_received_total = asInt(social.howls_received_total, 0) + 1;
      if (raw?.bonded) social.pack_bonds_total = asInt(social.pack_bonds_total, 0) + 1;
    }
    S.profile.social = social;
  }

  function notice(text) {
    const msg = asText(text);
    const el = S.backEl?.querySelector?.(".pp-notice");
    if (el) {
      el.textContent = msg;
      el.style.display = msg ? "block" : "none";
      if (msg) {
        window.setTimeout(() => {
          if (el.textContent === msg) {
            el.textContent = "";
            el.style.display = "none";
          }
        }, 2800);
      }
      return;
    }
    try { S.tg?.showAlert?.(msg); } catch (_) {}
  }

  function ensureStyles() {
    if (document.getElementById("player-profile-css")) return;
    const style = document.createElement("style");
    style.id = "player-profile-css";
    style.textContent = `
      #playerProfileBack{
        position:fixed !important;
        inset:0 !important;
        z-index:1001000 !important;
        align-items:center;
        justify-content:center;
        background:rgba(0,0,0,.66);
        pointer-events:auto;
      }
      #playerProfileBack .pp-sheet{
        position:relative;
        z-index:1001010 !important;
        width:min(94vw,540px);
        max-height:88vh;
        overflow:auto;
        padding:14px;
        border-radius:18px;
        background:linear-gradient(180deg, rgba(13,17,24,.96), rgba(6,8,13,.96));
        border:1px solid rgba(255,255,255,.13);
        color:#f5f7ff;
        box-shadow:0 22px 70px rgba(0,0,0,.45);
      }
      .pp-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .pp-title{font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(235,242,255,.66)}
      .pp-close{width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.28);color:#fff;font-size:18px;cursor:pointer}
      .pp-notice{display:none;margin:0 0 10px;padding:9px 10px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:rgba(0,0,0,.26);font-size:12px;line-height:1.35}
      .pp-hero{display:grid;grid-template-columns:154px minmax(0,1fr);gap:14px;align-items:center}
      .pp-visual{position:relative;width:154px;aspect-ratio:3/4;overflow:visible}
      .pp-visual::before{
        content:"";
        position:absolute;
        inset:-5px;
        border-radius:22px;
        pointer-events:none;
        z-index:2;
      }
      .pp-visual.has-default-frame::before{
        border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.42);
        background:
          linear-gradient(135deg, rgba(var(--pp-accent-rgb,125,211,252),.22), transparent 28%, transparent 72%, rgba(255,255,255,.12)),
          linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.015));
        box-shadow:
          inset 0 0 0 1px rgba(255,255,255,.08),
          0 0 22px rgba(var(--pp-accent-rgb,125,211,252),.14),
          0 14px 26px rgba(0,0,0,.28);
      }
      .pp-visual.has-default-frame::after{
        content:"";
        position:absolute;
        inset:5px;
        border-radius:18px;
        border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.18);
        pointer-events:none;
        z-index:2;
      }
      .pp-skin-window{position:absolute;inset:11% 15% 16%;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.04);border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.18)}
      .pp-skin{position:relative;z-index:1;width:100%;height:100%;object-fit:cover;object-position:center 24%;display:block}
      .pp-frame{position:absolute;inset:-5px;width:calc(100% + 10px);height:calc(100% + 10px);object-fit:contain;z-index:3;pointer-events:none;filter:drop-shadow(0 10px 18px rgba(0,0,0,.34))}
      .pp-avatar-fallback{position:relative;z-index:1;width:100%;height:100%;object-fit:cover;border-radius:18px;background:rgba(255,255,255,.04)}
      .pp-fallback-mark{
        position:absolute;
        inset:0;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        border-radius:18px;
        border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.22);
        background:
          radial-gradient(circle at 50% 22%, rgba(var(--pp-accent-rgb,125,211,252),.24), transparent 34%),
          radial-gradient(circle at 50% 68%, rgba(0,0,0,.20), transparent 48%),
          linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.025));
        color:rgba(245,248,255,.92);
        gap:10px;
        z-index:0;
      }
      .pp-fallback-mark::before{
        content:"";
        width:54px;
        height:64px;
        border-radius:28px 28px 18px 18px;
        background:
          radial-gradient(circle at 50% 24%, rgba(245,248,255,.86) 0 18%, transparent 19%),
          linear-gradient(180deg, rgba(245,248,255,.42), rgba(var(--pp-accent-rgb,125,211,252),.26));
        opacity:.62;
        filter:drop-shadow(0 8px 16px rgba(0,0,0,.25));
      }
      .pp-fallback-mark b{
        font-size:30px;
        line-height:1;
        font-weight:950;
        letter-spacing:.03em;
      }
      .pp-skin-window .pp-fallback-mark{
        border:0;
        border-radius:0;
        gap:7px;
      }
      .pp-skin-window .pp-fallback-mark::before{
        width:38px;
        height:45px;
      }
      .pp-skin-window .pp-fallback-mark b{
        font-size:22px;
      }
      .pp-main{min-width:0}
      .pp-name{font-size:22px;font-weight:950;line-height:1.08;overflow-wrap:anywhere}
      .pp-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
      .pp-chip{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.055);font-size:12px;font-weight:800;color:rgba(243,247,255,.9)}
      .pp-action{margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
      .pp-howl{min-height:40px;padding:0 14px;border-radius:14px;border:1px solid rgba(125,211,252,.28);background:linear-gradient(180deg, rgba(46,126,255,.92), rgba(22,82,201,.92));color:#fff;font-weight:950;cursor:pointer}
      .pp-howl:disabled{opacity:.52;cursor:default;filter:saturate(.72)}
      .pp-left{font-size:12px;color:rgba(230,238,255,.68);line-height:1.3}
      .pp-howl-help{margin-top:8px;font-size:12px;line-height:1.36;color:rgba(230,238,255,.72);white-space:pre-line}
      .pp-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
      .pp-stat{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:8px;padding:9px 8px;text-align:center;min-width:0}
      .pp-stat strong{display:block;font-size:17px;line-height:1.1}
      .pp-stat span{display:block;margin-top:3px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(230,238,255,.62)}
      .pp-stat small{display:block;margin-top:5px;font-size:10px;line-height:1.25;color:rgba(230,238,255,.56);text-transform:none;letter-spacing:0}
      .pp-social-note{margin-top:8px;font-size:11px;line-height:1.35;color:rgba(230,238,255,.62)}
      .pp-section{margin-top:14px}
      .pp-section-title{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:rgba(230,238,255,.62);margin-bottom:8px}
      .pp-badges,.pp-loadout{display:flex;gap:8px;overflow:auto;padding-bottom:2px}
      .pp-badge,.pp-item{flex:0 0 auto;width:82px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:8px;padding:8px;text-align:center}
      .pp-badge-icon,.pp-item-icon{width:38px;height:38px;margin:0 auto 6px;border-radius:10px;object-fit:contain;background:rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-size:20px}
      .pp-icon-empty{color:rgba(230,238,255,.54);font-weight:950}
      .pp-badge-name,.pp-item-name{font-size:11px;font-weight:800;line-height:1.15;overflow-wrap:anywhere}
      .pp-item-sub{margin-top:3px;font-size:10px;color:rgba(230,238,255,.58);text-transform:capitalize}
      .pp-empty{font-size:12px;color:rgba(230,238,255,.58);border:1px dashed rgba(255,255,255,.14);border-radius:8px;padding:10px}
      @media (max-width:430px){
        #playerProfileBack .pp-sheet{width:100vw;max-height:92vh;border-radius:18px 18px 0 0}
        .pp-hero{grid-template-columns:126px minmax(0,1fr);gap:12px}
        .pp-visual{width:126px}
        .pp-name{font-size:19px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    ensureStyles();
    let back = S.backEl || document.getElementById("playerProfileBack");
    if (!back) {
      back = document.createElement("div");
      back.className = "sheet-back";
      back.id = "playerProfileBack";
      back.style.display = "none";
      back.innerHTML = `
        <div class="sheet-card pp-sheet" role="dialog" aria-modal="true" aria-label="Pack Profile">
          <div class="pp-head">
            <div class="pp-title">Pack Profile</div>
            <button type="button" class="pp-close" aria-label="Close profile">x</button>
          </div>
          <div class="pp-notice" role="status" aria-live="polite"></div>
          <div class="pp-body"></div>
        </div>
      `;
    }
    if (back.parentElement !== document.body) {
      document.body.appendChild(back);
    }
    back.style.zIndex = "1001000";
    if (!back.__playerProfileBound) {
      back.__playerProfileBound = true;
      back.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (ev.target === back) close();
      });
      back.querySelector(".pp-close")?.addEventListener("click", (ev) => {
        ev.stopPropagation();
        close();
      });
    }
    S.backEl = back;
    return back;
  }

  function api(path, body) {
    const fn = S.apiPost || global.apiPost || global.S?.apiPost;
    if (typeof fn !== "function") throw new Error("apiPost missing");
    return fn(path, body || {});
  }

  function renderIcon(url, cls, name) {
    const src = asText(url);
    const label = asText(name).slice(0, 1).toUpperCase() || "A";
    if (!src) return `<div class="${esc(cls)} pp-icon-empty">${esc(label)}</div>`;
    if (/^https?:\/\//i.test(src) || src.startsWith("/") || /\.(png|webp|jpg|jpeg|gif|svg)(\?|#|$)/i.test(src)) {
      return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(name || "")}" loading="lazy" onerror="this.hidden=true;">`;
    }
    return `<div class="${esc(cls)}">${esc(src)}</div>`;
  }

  function renderProfile(player) {
    const back = ensureModal();
    const body = back.querySelector(".pp-body");
    if (!body) return;
    const p = player || {};
    const social = p.social || {};
    const viewerUid = asText(global.Telegram?.WebApp?.initDataUnsafe?.user?.id);
    const isSelf = viewerUid && viewerUid === asText(p.uid);
    const skin = p.skin || {};
    const frame = p.frame || {};
    const badges = Array.isArray(p.badges) ? p.badges : [];
    const loadout = Array.isArray(p.loadout) ? p.loadout : [];
    const factionKey = normalizeFactionKey(p.faction);
    const accentRgb = factionAccentRgb(p.faction);
    const visualStyle = `style="--pp-accent-rgb:${esc(accentRgb)}"`;
    const skinUrl = asText(skin.url || skin.img || skin.preview_url || skin.previewUrl);
    const avatarUrl = asText(p.avatar_url || p.avatarUrl || p.avatar?.img || p.avatar?.url);
    const frameUrl = asText(frame.url || frame.img || frame.preview_url || frame.previewUrl);
    const originLabel = asText(p.origin_label || p.originLabel);
    const visualClass = [
      "pp-visual",
      frameUrl ? "has-frame" : "has-default-frame",
      factionKey ? `is-${factionKey}` : "",
    ].filter(Boolean).join(" ");
    const fallback = `<div class="pp-fallback-mark" aria-hidden="true"><b>${esc(initials(p.name))}</b></div>`;
    const chips = [
      `Lv ${asInt(p.level, 1)}`,
      asText(p.faction) || "Unbound",
      originLabel ? `Origin: ${originLabel}` : "",
      asText(p.title),
      ...(Array.isArray(p.prestige_tags) ? p.prestige_tags.map(asText).filter(Boolean) : []),
    ].filter(Boolean);
    const limit = dailyLimit(social);
    const left = dailyLeft(social);
    const button = howlButtonState(social, isSelf);

    const visual = skinUrl
      ? `
        <div class="${esc(visualClass)}" ${visualStyle}>
          <div class="pp-skin-window">${fallback}${mediaMarkup(skinUrl, "pp-skin", skin.name || p.name)}</div>
          ${frameUrl ? `<img class="pp-frame" src="${esc(frameUrl)}" alt="" onerror="this.hidden=true;">` : ""}
        </div>
      `
      : `
        <div class="${esc(visualClass)}" ${visualStyle}>
          ${fallback}
          ${avatarUrl ? `<img class="pp-avatar-fallback" src="${esc(avatarUrl)}" alt="${esc(p.name || "Avatar")}" onerror="this.hidden=true;">` : ""}
          ${frameUrl ? `<img class="pp-frame" src="${esc(frameUrl)}" alt="" onerror="this.hidden=true;">` : ""}
        </div>
      `;

    body.innerHTML = `
      <div class="pp-hero">
        ${visual}
        <div class="pp-main">
          <div class="pp-name">${esc(p.name || "Howler")}</div>
          <div class="pp-meta">${chips.map((x) => `<span class="pp-chip">${esc(x)}</span>`).join("")}</div>
          <div class="pp-action">
            <button type="button" class="pp-howl" ${button.disabled ? "disabled" : ""} data-state="${esc(button.key)}">${esc(button.label)}</button>
            <span class="pp-left">Pack Signals left today: ${esc(left)} / ${esc(limit)}</span>
          </div>
          <div class="pp-howl-help">Send a Howl to recognize another player.
It appears in their mailbox and adds to social counters.
No gameplay power — just recognition.</div>
        </div>
      </div>
      <div class="pp-stats">
        <div class="pp-stat"><strong>${esc(asInt(social.howls_received_total, 0))}</strong><span>Howls Received</span><small>Signals from other players who noticed your trail.</small></div>
        <div class="pp-stat"><strong>${esc(asInt(social.howls_sent_total, 0))}</strong><span>Howls Sent</span><small>Signals you sent to the pack.</small></div>
        <div class="pp-stat"><strong>${esc(asInt(social.pack_bonds_total, 0))}</strong><span>Pack Bonds</span><small>Mutual Howls returned on the same day.</small></div>
      </div>
      <div class="pp-social-note">Pack Signals are social recognition only. They never give gameplay power.</div>
      <div class="pp-section">
        <div class="pp-section-title">Displayed Badges</div>
        ${badges.length ? `<div class="pp-badges">${badges.map((b) => `
          <div class="pp-badge">
            ${renderIcon(b.icon, "pp-badge-icon", b.name)}
            <div class="pp-badge-name">${esc(b.name || b.key || "Badge")}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No public badges yet</div>`}
      </div>
      <div class="pp-section">
        <div class="pp-section-title">Equipped Loadout</div>
        ${loadout.length ? `<div class="pp-loadout">${loadout.map((it) => `
          <div class="pp-item">
            ${renderIcon(it.icon, "pp-item-icon", it.name)}
            <div class="pp-item-name">${esc(it.name || it.slot || "Item")}</div>
            <div class="pp-item-sub">${esc(it.slot || "")}${it.rarity ? ` - ${esc(it.rarity)}` : ""}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No public loadout yet</div>`}
      </div>
    `;

    const btn = body.querySelector(".pp-howl");
    if (btn) {
      btn.addEventListener("click", () => { void sendHowl(); });
    }
  }

  async function loadProfile(uid) {
    const targetUid = asText(uid);
    if (!targetUid) return null;
    const raw = await api("/webapp/player/profile", { target_uid: targetUid });
    if (!raw || raw.ok === false) throw new Error(asText(raw?.reason) || "profile_failed");
    S.profile = raw.player || null;
    return S.profile;
  }

  async function sendHowl(targetUid, source) {
    const uid = asText(targetUid || S.activeUid);
    if (!uid || S.sending) return false;
    S.sending = true;
    const isActiveProfile = S.profile && asText(S.profile.uid) === uid;
    const btn = isActiveProfile ? S.backEl?.querySelector?.(".pp-howl") : null;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sending...";
    }
    try {
      const raw = await api("/webapp/social/send_howl", { target_uid: uid, source: source || "profile" });
      if (!raw || raw.ok === false) {
        const code = asText(raw?.code || raw?.reason);
        updateLocalHowlState(raw, uid, code);
        if (S.profile && asText(S.profile.uid) === uid) renderProfile(S.profile);
        notice(howlErrorMessage(code));
        return false;
      }
      updateLocalHowlState(raw, uid);
      if (S.profile && asText(S.profile.uid) === uid) renderProfile(S.profile);
      notice(raw.bonded ? "Howl sent. Pack Bond formed." : "Howl sent.");
      try { S.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      return true;
    } catch (err) {
      if (S.dbg) console.warn("[PlayerProfile] send howl failed", err);
      notice("Could not send Howl. Try again.");
      return false;
    } finally {
      S.sending = false;
      if (S.profile && asText(S.profile.uid) === uid) renderProfile(S.profile);
    }
  }

  async function open(targetUid, opts = {}) {
    const uid = asText(targetUid);
    if (!uid) return false;
    S.activeUid = uid;
    const back = ensureModal();
    const body = back.querySelector(".pp-body");
    if (body) body.innerHTML = `<div class="pp-empty">Loading profile...</div>`;
    back.style.display = "flex";
    try { global.navOpen?.("playerProfileBack"); } catch (_) {}
    try {
      const player = await loadProfile(uid);
      renderProfile(player);
      return true;
    } catch (err) {
      if (S.dbg) console.warn("[PlayerProfile] open failed", err);
      if (body) body.innerHTML = `<div class="pp-empty">Profile is not available.</div>`;
      return false;
    }
  }

  function close() {
    if (S.backEl) S.backEl.style.display = "none";
    try { global.navClose?.("playerProfileBack"); } catch (_) {}
  }

  function init({ apiPost, tg, dbg } = {}) {
    if (typeof apiPost === "function") S.apiPost = apiPost;
    if (tg) S.tg = tg;
    S.dbg = !!dbg;
    ensureModal();
  }

  global.PlayerProfile = {
    init,
    open,
    close,
    sendHowl,
  };
})(window);
