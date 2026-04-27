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

  function asText(v) {
    return String(v ?? "").trim();
  }

  function asInt(v, fallback = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
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
      return `<video class="${esc(cls)}" src="${esc(src)}" autoplay muted loop playsinline></video>`;
    }
    return `<img class="${esc(cls)}" src="${esc(src)}" alt="${esc(alt || "")}" loading="lazy">`;
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
      #playerProfileBack .pp-sheet{
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
      .pp-skin-window{position:absolute;inset:11% 15% 16%;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08)}
      .pp-skin{width:100%;height:100%;object-fit:cover;object-position:center 24%;display:block}
      .pp-frame{position:absolute;inset:-5px;width:calc(100% + 10px);height:calc(100% + 10px);object-fit:contain;z-index:3;pointer-events:none;filter:drop-shadow(0 10px 18px rgba(0,0,0,.34))}
      .pp-avatar-fallback{width:100%;height:100%;object-fit:cover;border-radius:18px;background:rgba(255,255,255,.04)}
      .pp-main{min-width:0}
      .pp-name{font-size:22px;font-weight:950;line-height:1.08;overflow-wrap:anywhere}
      .pp-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
      .pp-chip{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.055);font-size:12px;font-weight:800;color:rgba(243,247,255,.9)}
      .pp-action{margin-top:12px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
      .pp-howl{min-height:40px;padding:0 14px;border-radius:14px;border:1px solid rgba(125,211,252,.28);background:linear-gradient(180deg, rgba(46,126,255,.92), rgba(22,82,201,.92));color:#fff;font-weight:950;cursor:pointer}
      .pp-howl:disabled{opacity:.52;cursor:default;filter:saturate(.72)}
      .pp-left{font-size:12px;color:rgba(230,238,255,.68)}
      .pp-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:14px}
      .pp-stat{border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:8px;padding:9px 8px;text-align:center;min-width:0}
      .pp-stat strong{display:block;font-size:17px;line-height:1.1}
      .pp-stat span{display:block;margin-top:3px;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:rgba(230,238,255,.62)}
      .pp-section{margin-top:14px}
      .pp-section-title{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:rgba(230,238,255,.62);margin-bottom:8px}
      .pp-badges,.pp-loadout{display:flex;gap:8px;overflow:auto;padding-bottom:2px}
      .pp-badge,.pp-item{flex:0 0 auto;width:82px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.045);border-radius:8px;padding:8px;text-align:center}
      .pp-badge-icon,.pp-item-icon{width:38px;height:38px;margin:0 auto 6px;border-radius:10px;object-fit:contain;background:rgba(0,0,0,.22);display:flex;align-items:center;justify-content:center;font-size:20px}
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
    if (S.backEl && document.body.contains(S.backEl)) return S.backEl;
    ensureStyles();
    const back = document.createElement("div");
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
    back.addEventListener("click", (ev) => {
      if (ev.target === back) close();
    });
    back.querySelector(".pp-close")?.addEventListener("click", close);
    document.body.appendChild(back);
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
    if (!src) return `<div class="${cls}">*</div>`;
    if (/^https?:\/\//i.test(src) || src.startsWith("/") || /\.(png|webp|jpg|jpeg|gif|svg)(\?|#|$)/i.test(src)) {
      return `<img class="${cls}" src="${esc(src)}" alt="${esc(name || "")}" loading="lazy">`;
    }
    return `<div class="${cls}">${esc(src)}</div>`;
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
    const chips = [
      `Lv ${asInt(p.level, 1)}`,
      asText(p.faction) || "Unbound",
      asText(p.title),
      ...(Array.isArray(p.prestige_tags) ? p.prestige_tags.map(asText).filter(Boolean) : []),
    ].filter(Boolean);

    const visual = asText(skin.url || skin.img)
      ? `
        <div class="pp-visual">
          <div class="pp-skin-window">${mediaMarkup(skin.url || skin.img, "pp-skin", skin.name || p.name)}</div>
          ${asText(frame.url) ? `<img class="pp-frame" src="${esc(frame.url)}" alt="">` : ""}
        </div>
      `
      : `
        <div class="pp-visual">
          ${asText(p.avatar_url) ? `<img class="pp-avatar-fallback" src="${esc(p.avatar_url)}" alt="${esc(p.name || "Avatar")}">` : `<div class="pp-avatar-fallback"></div>`}
          ${asText(frame.url) ? `<img class="pp-frame" src="${esc(frame.url)}" alt="">` : ""}
        </div>
      `;

    body.innerHTML = `
      <div class="pp-hero">
        ${visual}
        <div class="pp-main">
          <div class="pp-name">${esc(p.name || "Howler")}</div>
          <div class="pp-meta">${chips.map((x) => `<span class="pp-chip">${esc(x)}</span>`).join("")}</div>
          <div class="pp-action">
            <button type="button" class="pp-howl">Send Howl</button>
            <span class="pp-left">${esc(asInt(social.daily_howls_left, 0))} left today</span>
          </div>
        </div>
      </div>
      <div class="pp-stats">
        <div class="pp-stat"><strong>${esc(asInt(social.howls_received_total, 0))}</strong><span>Received</span></div>
        <div class="pp-stat"><strong>${esc(asInt(social.howls_sent_total, 0))}</strong><span>Sent</span></div>
        <div class="pp-stat"><strong>${esc(asInt(social.pack_bonds_total, 0))}</strong><span>Pack Bonds</span></div>
      </div>
      <div class="pp-section">
        <div class="pp-section-title">Displayed Badges</div>
        ${badges.length ? `<div class="pp-badges">${badges.map((b) => `
          <div class="pp-badge">
            ${renderIcon(b.icon, "pp-badge-icon", b.name)}
            <div class="pp-badge-name">${esc(b.name || b.key || "Badge")}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No displayed badges yet.</div>`}
      </div>
      <div class="pp-section">
        <div class="pp-section-title">Equipped Loadout</div>
        ${loadout.length ? `<div class="pp-loadout">${loadout.map((it) => `
          <div class="pp-item">
            ${renderIcon(it.icon, "pp-item-icon", it.name)}
            <div class="pp-item-name">${esc(it.name || it.slot || "Item")}</div>
            <div class="pp-item-sub">${esc(it.slot || "")}${it.rarity ? ` - ${esc(it.rarity)}` : ""}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No public loadout preview.</div>`}
      </div>
    `;

    const btn = body.querySelector(".pp-howl");
    if (btn) {
      if (!social.can_howl) {
        btn.disabled = true;
        btn.textContent = isSelf ? "Your Profile" : (asInt(social.daily_howls_left, 0) <= 0 ? "No Howls Left" : "Howl Sent");
      }
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
    const btn = S.backEl?.querySelector?.(".pp-howl");
    if (btn) btn.disabled = true;
    try {
      const raw = await api("/webapp/social/send_howl", { target_uid: uid, source: source || "profile" });
      if (!raw || raw.ok === false) {
        const code = asText(raw?.code || raw?.reason);
        if (code === "daily_limit") notice("You have used all Pack Signals for today.");
        else if (code === "already_sent_today") notice("You already sent a Howl to this player today.");
        else if (code === "self_target") notice("You cannot Howl at yourself.");
        else notice("Could not send Howl. Try again.");
        return false;
      }
      notice(raw.bonded ? "Howl sent. Pack Bond formed." : "Howl sent.");
      try { S.tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      await loadProfile(uid);
      renderProfile(S.profile);
      return true;
    } catch (err) {
      if (S.dbg) console.warn("[PlayerProfile] send howl failed", err);
      notice("Could not send Howl. Try again.");
      return false;
    } finally {
      S.sending = false;
      const current = S.backEl?.querySelector?.(".pp-howl");
      if (current && S.profile?.social?.can_howl) current.disabled = false;
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
