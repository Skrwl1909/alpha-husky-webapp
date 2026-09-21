// Alpha Husky WebApp - Field Record identity surface + Pack Signals
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
        display:none;
        align-items:center;
        justify-content:center;
        padding:14px;
        background:rgba(1,4,8,.78);
        backdrop-filter:blur(10px);
        -webkit-backdrop-filter:blur(10px);
        pointer-events:auto;
      }
      #playerProfileBack .pp-sheet{
        --pp-line:rgba(124,211,252,.16);
        --pp-panel:rgba(7,17,26,.78);
        --pp-panel-strong:rgba(8,20,31,.93);
        position:relative;
        z-index:1001010 !important;
        width:min(96vw,570px);
        max-height:min(92dvh,900px);
        overflow:auto;
        overscroll-behavior:contain;
        padding:0 14px 16px;
        border-radius:22px;
        background:
          radial-gradient(circle at 85% 7%,rgba(var(--pp-accent-rgb,125,211,252),.11),transparent 22%),
          linear-gradient(180deg,rgba(5,13,21,.985),rgba(3,8,14,.99));
        border:1px solid rgba(139,205,238,.19);
        color:#f5f8fc;
        box-shadow:0 28px 90px rgba(0,0,0,.62),inset 0 1px rgba(255,255,255,.035);
        scrollbar-width:thin;
        scrollbar-color:rgba(125,211,252,.28) transparent;
        isolation:isolate;
      }
      #playerProfileBack .pp-sheet::before{
        content:"";
        position:absolute;
        inset:0 0 auto;
        height:305px;
        z-index:-1;
        pointer-events:none;
        opacity:.24;
        background:
          linear-gradient(180deg,rgba(3,10,17,.28),rgba(3,10,17,.92)),
          linear-gradient(90deg,rgba(3,10,17,.95) 0%,rgba(3,10,17,.45) 58%,rgba(3,10,17,.84) 100%),
          url("background2.webp") center 34%/cover no-repeat;
        mask-image:linear-gradient(180deg,#000 0%,#000 74%,transparent 100%);
        -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 74%,transparent 100%);
      }
      #playerProfileBack .pp-sheet::after{
        content:"";
        position:absolute;
        inset:0;
        z-index:-1;
        pointer-events:none;
        background-image:linear-gradient(rgba(125,211,252,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,.018) 1px,transparent 1px);
        background-size:28px 28px;
        mask-image:linear-gradient(180deg,#000,transparent 58%);
        -webkit-mask-image:linear-gradient(180deg,#000,transparent 58%);
      }
      #playerProfileBack .pp-sheet::-webkit-scrollbar{width:5px}
      #playerProfileBack .pp-sheet::-webkit-scrollbar-thumb{border-radius:999px;background:rgba(125,211,252,.28)}
      .pp-head{
        position:sticky;
        top:0;
        z-index:15;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        min-height:58px;
        margin:0 -14px 14px;
        padding:8px 14px;
        border-bottom:1px solid rgba(125,211,252,.10);
        background:linear-gradient(180deg,rgba(4,11,18,.98),rgba(4,11,18,.90));
        backdrop-filter:blur(13px);
        -webkit-backdrop-filter:blur(13px);
      }
      .pp-brand{display:flex;align-items:center;gap:10px;min-width:0}
      .pp-brand-mark{width:28px;height:28px;display:grid;place-items:center;color:rgba(104,211,255,.92);filter:drop-shadow(0 0 12px rgba(78,190,255,.18))}
      .pp-brand-mark svg{width:100%;height:100%}
      .pp-title{display:flex;flex-direction:column;min-width:0;text-transform:uppercase}
      .pp-title span{font-size:10px;font-weight:850;letter-spacing:.24em;color:rgba(205,230,245,.65)}
      .pp-title strong{margin-top:2px;font-size:13px;font-weight:950;letter-spacing:.17em;color:rgba(247,250,255,.96)}
      .pp-close{width:34px;height:34px;border-radius:50%;border:1px solid rgba(125,211,252,.22);background:rgba(0,0,0,.28);color:#f4f8fc;font-size:17px;cursor:pointer;box-shadow:inset 0 0 18px rgba(125,211,252,.035)}
      .pp-notice{display:none;margin:0 0 11px;padding:10px 12px;border:1px solid rgba(125,211,252,.19);border-radius:10px;background:rgba(8,30,43,.84);font-size:12px;line-height:1.35;color:rgba(235,247,255,.94)}
      .pp-hero-shell{position:relative;padding:6px 4px 30px}
      .pp-hero-shell::after{content:"MORE THAN A GAME · A STRONGER PACK";position:absolute;right:5px;top:0;font-size:8px;font-weight:850;letter-spacing:.17em;color:rgba(151,198,225,.36)}
      .pp-hero{display:grid;grid-template-columns:154px minmax(0,1fr);gap:17px;align-items:center;min-height:226px}
      .pp-visual{position:relative;width:154px;aspect-ratio:3/4;overflow:visible;filter:drop-shadow(0 18px 28px rgba(0,0,0,.42))}
      .pp-visual::before{content:"";position:absolute;inset:-5px;border-radius:14px;pointer-events:none;z-index:2}
      .pp-visual.has-default-frame::before{
        border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.47);
        background:linear-gradient(135deg,rgba(var(--pp-accent-rgb,125,211,252),.18),transparent 27%,transparent 72%,rgba(255,255,255,.10));
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.06),0 0 26px rgba(var(--pp-accent-rgb,125,211,252),.12),0 16px 34px rgba(0,0,0,.40);
      }
      .pp-visual.has-default-frame::after{content:"";position:absolute;inset:4px;border-radius:11px;border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.14);pointer-events:none;z-index:2}
      .pp-skin-window{position:absolute;inset:10% 14% 15%;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.035);border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.15)}
      .pp-skin{position:relative;z-index:1;width:100%;height:100%;object-fit:cover;object-position:center 24%;display:block}
      .pp-frame{position:absolute;inset:-5px;width:calc(100% + 10px);height:calc(100% + 10px);object-fit:contain;z-index:3;pointer-events:none;filter:drop-shadow(0 12px 21px rgba(0,0,0,.42))}
      .pp-avatar-fallback{position:relative;z-index:1;width:100%;height:100%;object-fit:cover;border-radius:11px;background:rgba(255,255,255,.04)}
      .pp-fallback-mark{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:11px;border:1px solid rgba(var(--pp-accent-rgb,125,211,252),.22);background:radial-gradient(circle at 50% 22%,rgba(var(--pp-accent-rgb,125,211,252),.24),transparent 34%),linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));color:rgba(245,248,255,.92);gap:10px;z-index:0}
      .pp-fallback-mark::before{content:"";width:54px;height:64px;border-radius:28px 28px 18px 18px;background:radial-gradient(circle at 50% 24%,rgba(245,248,255,.86) 0 18%,transparent 19%),linear-gradient(180deg,rgba(245,248,255,.42),rgba(var(--pp-accent-rgb,125,211,252),.26));opacity:.62;filter:drop-shadow(0 8px 16px rgba(0,0,0,.25))}
      .pp-fallback-mark b{font-size:30px;line-height:1;font-weight:950;letter-spacing:.03em}
      .pp-skin-window .pp-fallback-mark{border:0;border-radius:0;gap:7px}
      .pp-skin-window .pp-fallback-mark::before{width:38px;height:45px}
      .pp-skin-window .pp-fallback-mark b{font-size:22px}
      .pp-visual-caption{position:absolute;left:0;right:0;bottom:-28px;text-align:center;font-size:8px;font-weight:850;letter-spacing:.22em;text-transform:uppercase;color:rgba(115,195,231,.66)}
      .pp-visual-caption span,.pp-visual-caption small{display:block}
      .pp-visual-caption small{margin-top:3px;font-size:6px;letter-spacing:.19em;color:rgba(151,186,205,.44)}
      .pp-main{min-width:0;padding-top:10px}
      .pp-name{font-family:Georgia,"Times New Roman",serif;font-size:31px;font-weight:800;line-height:1.02;overflow-wrap:anywhere;letter-spacing:-.01em;text-shadow:0 6px 22px rgba(0,0,0,.48)}
      .pp-active-title{margin-top:5px;font-family:Georgia,"Times New Roman",serif;font-size:17px;font-weight:700;line-height:1.2;color:rgba(221,230,241,.82)}
      .pp-path{margin-top:10px;font-size:11px;font-weight:950;line-height:1.35;letter-spacing:.12em;text-transform:uppercase;color:rgba(74,201,255,.92)}
      .pp-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
      .pp-chip{display:inline-flex;align-items:center;min-height:30px;padding:0 10px;border-radius:8px;border:1px solid rgba(131,190,222,.23);background:linear-gradient(180deg,rgba(18,39,54,.82),rgba(7,18,28,.86));box-shadow:inset 0 1px rgba(255,255,255,.045);font-size:11px;font-weight:850;color:rgba(243,248,255,.94)}
      .pp-chip.pp-signal{border-color:rgba(231,189,103,.40);background:linear-gradient(180deg,rgba(91,67,24,.46),rgba(35,22,9,.72));color:rgba(255,225,166,.98)}
      .pp-chip.pp-signal::before{content:"";width:7px;height:7px;border-radius:50%;margin-right:6px;background:rgba(248,203,105,.96);box-shadow:0 0 13px rgba(248,203,105,.36)}
      .pp-quote{margin-top:13px;font-family:Georgia,"Times New Roman",serif;font-size:12px;font-style:italic;line-height:1.4;color:rgba(178,196,211,.52)}
      .pp-section{margin-top:13px;padding:13px;border:1px solid rgba(125,211,252,.11);border-radius:13px;background:linear-gradient(180deg,rgba(5,17,27,.78),rgba(4,12,20,.80));box-shadow:inset 0 1px rgba(255,255,255,.025)}
      .pp-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .pp-section-title{position:relative;padding-left:13px;font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.20em;color:rgba(238,247,255,.9);margin:0}
      .pp-section-title::before{content:"";position:absolute;left:0;top:1px;bottom:1px;width:3px;border-radius:999px;background:#4bc8ff;box-shadow:0 0 13px rgba(75,200,255,.42)}
      .pp-section-note{font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.17em;color:rgba(139,191,217,.48);text-align:right}
      .pp-history{display:grid;gap:7px}
      .pp-history-row{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:10px;position:relative;padding:9px 10px;border:1px solid rgba(125,211,252,.14);border-radius:10px;background:linear-gradient(90deg,rgba(24,61,83,.20),rgba(6,17,26,.82));overflow:hidden}
      .pp-history-row::before{content:"";position:absolute;inset:0 auto 0 0;width:2px;background:rgba(75,200,255,.76);box-shadow:0 0 12px rgba(75,200,255,.35)}
      .pp-history-icon{width:36px;height:36px;display:grid;place-items:center;border:1px solid rgba(86,199,251,.28);border-radius:50%;background:radial-gradient(circle,rgba(38,150,202,.16),rgba(3,13,21,.88));color:#62d1ff;box-shadow:0 0 18px rgba(48,173,232,.10)}
      .pp-history-icon .pp-ui-icon{width:21px;height:21px}
      .pp-history-row[data-field-mark="broken_signal"] .pp-history-icon{border-color:rgba(255,91,104,.32);background:radial-gradient(circle,rgba(160,35,49,.18),rgba(20,5,10,.88));color:#ff6e7e}
      .pp-history-row[data-field-mark="broken_signal"]::before{background:rgba(255,86,101,.78);box-shadow:0 0 12px rgba(255,86,101,.28)}
      .pp-history-main{min-width:0}
      .pp-history-top{display:block}
      .pp-history-label{font-size:12px;font-weight:950;letter-spacing:.10em;color:rgba(247,250,255,.97)}
      .pp-history-copy{margin-top:3px;font-size:11px;line-height:1.35;color:rgba(204,219,232,.66)}
      .pp-history-meta{display:flex;flex-direction:column;align-items:flex-end;gap:5px;min-width:67px}
      .pp-history-proof{font-size:9px;font-weight:950;letter-spacing:.08em;color:rgba(148,188,211,.72);white-space:nowrap}
      .pp-history-status{padding:5px 7px;border:1px solid rgba(75,225,183,.36);border-radius:7px;background:rgba(18,91,74,.17);font-size:8px;font-weight:950;letter-spacing:.09em;color:rgba(116,244,207,.95)}
      .pp-recognition-meta{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:10px}
      .pp-action-card{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(150px,.95fr);gap:11px;align-items:stretch}
      .pp-action{margin:0;display:flex;align-items:stretch}
      .pp-howl{position:relative;display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:58px;padding:0 14px;border-radius:10px;border:1px solid rgba(66,194,255,.40);background:linear-gradient(135deg,rgba(7,61,91,.92),rgba(5,28,45,.96));color:#8fddff;font-family:Georgia,"Times New Roman",serif;font-size:17px;font-weight:800;cursor:pointer;box-shadow:inset 0 1px rgba(255,255,255,.035),0 0 24px rgba(49,176,231,.08)}
      .pp-howl::after{content:"›";font-family:ui-sans-serif,system-ui,sans-serif;font-size:29px;font-weight:300;line-height:1;color:#54caff}
      .pp-howl:disabled{opacity:.7;cursor:default;filter:saturate(.76)}
      .pp-howls-copy{display:flex;flex-direction:column;justify-content:center;min-width:0;padding:2px 0}
      .pp-left{font-size:11px;color:rgba(218,230,240,.78);line-height:1.35}
      .pp-left strong{color:#61d2ff;font-size:12px}
      .pp-howl-help{margin-top:5px;font-size:10px;line-height:1.35;color:rgba(184,205,220,.57);white-space:normal}
      .pp-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:11px}
      .pp-stat{display:grid;grid-template-columns:28px minmax(0,1fr);grid-template-rows:auto auto;column-gap:8px;align-items:center;border:1px solid rgba(125,211,252,.12);background:linear-gradient(180deg,rgba(12,30,42,.78),rgba(5,15,24,.86));border-radius:10px;padding:10px;min-width:0;text-align:left}
      .pp-stat-icon{grid-row:1/3;width:27px;height:27px;color:rgba(172,213,236,.72)}
      .pp-stat-icon .pp-ui-icon{width:100%;height:100%}
      .pp-stat strong{display:block;font-size:18px;line-height:1;color:#f8fbff}
      .pp-stat span{display:block;margin-top:3px;font-size:8px;text-transform:uppercase;letter-spacing:.09em;color:rgba(171,199,216,.62);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .pp-stat small{display:none}
      .pp-social-note{margin-top:8px;font-size:9px;line-height:1.35;color:rgba(168,191,208,.52)}
      .pp-badges,.pp-loadout{display:flex;gap:8px;overflow:auto;padding:1px 1px 4px;scrollbar-width:none;scroll-snap-type:x proximity}
      .pp-badges::-webkit-scrollbar,.pp-loadout::-webkit-scrollbar{display:none}
      .pp-badge,.pp-item{scroll-snap-align:start;flex:0 0 auto;width:83px;min-height:84px;border:1px solid rgba(125,211,252,.13);background:linear-gradient(180deg,rgba(13,31,44,.82),rgba(5,15,24,.9));border-radius:10px;padding:8px;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.025)}
      .pp-badge:first-child{border-color:rgba(244,195,87,.34);box-shadow:inset 0 0 20px rgba(244,195,87,.06),0 0 14px rgba(244,195,87,.05)}
      .pp-badge-icon,.pp-item-icon{width:42px;height:42px;margin:0 auto 7px;border-radius:10px;object-fit:contain;background:radial-gradient(circle,rgba(35,83,110,.32),rgba(2,9,15,.72));display:flex;align-items:center;justify-content:center;font-size:20px;filter:drop-shadow(0 6px 10px rgba(0,0,0,.28))}
      .pp-icon-empty{color:rgba(178,205,221,.45);font-weight:950}
      .pp-badge-name,.pp-item-name{font-size:10px;font-weight:850;line-height:1.18;overflow-wrap:anywhere;color:rgba(237,244,249,.9)}
      .pp-item-sub{margin-top:3px;font-size:8px;color:rgba(166,192,207,.52);text-transform:uppercase;letter-spacing:.06em}
      .pp-empty{font-size:11px;color:rgba(187,208,222,.58);border:1px dashed rgba(125,211,252,.14);border-radius:9px;padding:11px;background:rgba(5,15,23,.52)}
      .pp-footer{position:relative;min-height:78px;margin:13px -14px -16px;padding:31px 18px 13px;overflow:hidden;border-radius:0 0 21px 21px;background:linear-gradient(180deg,rgba(3,10,17,.20),rgba(2,7,12,.94)),url("background2.webp") center 62%/cover no-repeat}
      .pp-footer::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,12,19,.25),rgba(4,12,19,.94));pointer-events:none}
      .pp-footer-copy{position:relative;display:flex;align-items:flex-end;justify-content:space-between;gap:12px}
      .pp-footer-brand{font-size:9px;font-weight:850;letter-spacing:.24em;color:rgba(148,193,216,.62)}
      .pp-footer-brand small{display:block;margin-top:4px;font-size:7px;letter-spacing:.20em;color:rgba(139,180,202,.42)}
      .pp-footer-sign{font-family:Georgia,"Times New Roman",serif;font-size:18px;font-style:italic;color:rgba(103,189,232,.70);transform:rotate(-5deg)}
      .pp-ui-icon{display:block;fill:none}
      @media (max-width:430px){
        #playerProfileBack{padding:0;align-items:flex-end}
        #playerProfileBack .pp-sheet{width:100vw;max-height:94dvh;border-radius:20px 20px 0 0;padding:0 11px 14px}
        .pp-head{margin:0 -11px 11px;padding:8px 11px}
        .pp-hero-shell{padding:2px 2px 24px}
        .pp-hero-shell::after{display:none}
        .pp-hero{grid-template-columns:122px minmax(0,1fr);gap:12px;min-height:190px}
        .pp-visual{width:122px}
        .pp-visual-caption{bottom:-21px;font-size:7px}
        .pp-main{padding-top:4px}
        .pp-name{font-size:23px}
        .pp-active-title{font-size:14px}
        .pp-path{font-size:9px;margin-top:7px}
        .pp-meta{gap:5px;margin-top:8px}
        .pp-chip{min-height:26px;padding:0 8px;font-size:9px;border-radius:7px}
        .pp-quote{margin-top:8px;font-size:10px}
        .pp-section{padding:11px;margin-top:10px}
        .pp-section-title{font-size:10px;letter-spacing:.16em}
        .pp-section-note{font-size:7px;letter-spacing:.12em}
        .pp-history-row{grid-template-columns:34px minmax(0,1fr) auto;gap:8px;padding:8px}
        .pp-history-icon{width:31px;height:31px}
        .pp-history-icon .pp-ui-icon{width:18px;height:18px}
        .pp-history-label{font-size:10px}
        .pp-history-copy{font-size:9px}
        .pp-history-meta{min-width:55px}
        .pp-history-proof{font-size:7px}
        .pp-history-status{font-size:7px;padding:4px 5px}
        .pp-action-card{grid-template-columns:1fr}
        .pp-howl{min-height:49px;font-size:15px}
        .pp-howls-copy{padding:0 2px}
        .pp-howl-help{font-size:9px}
        .pp-stats{gap:6px}
        .pp-stat{grid-template-columns:20px minmax(0,1fr);column-gap:6px;padding:8px 6px}
        .pp-stat-icon{width:20px;height:20px}
        .pp-stat strong{font-size:15px}
        .pp-stat span{font-size:6.5px;letter-spacing:.055em}
        .pp-badge,.pp-item{width:72px;min-height:76px;padding:7px}
        .pp-badge-icon,.pp-item-icon{width:36px;height:36px}
        .pp-badge-name,.pp-item-name{font-size:9px}
        .pp-footer{margin:10px -11px -14px;border-radius:0;padding:28px 13px 11px}
      }
      @media (max-width:350px){
        .pp-hero{grid-template-columns:108px minmax(0,1fr);gap:10px}
        .pp-visual{width:108px}
        .pp-name{font-size:20px}
        .pp-active-title{font-size:12px}
        .pp-chip{font-size:8px}
        .pp-stats{grid-template-columns:1fr 1fr 1fr}
        .pp-stat-icon{display:none}
        .pp-stat{display:block;text-align:center;padding:8px 4px}
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
        <div class="sheet-card pp-sheet" role="dialog" aria-modal="true" aria-label="Field Record">
          <div class="pp-head">
            <div class="pp-brand">
              <span class="pp-brand-mark" aria-hidden="true">${fieldRecordIcon("signal", "pp-ui-icon")}</span>
              <div class="pp-title"><span>Alpha Husky</span><strong>Field Record</strong></div>
            </div>
            <button type="button" class="pp-close" aria-label="Close profile">×</button>
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

  function fieldRecordIcon(kind, cls = "pp-ui-icon") {
    const key = asText(kind).toLowerCase();
    const common = `class="${esc(cls)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"`;
    if (key === "first_signal" || key === "signal") {
      return `<svg ${common}><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M7.7 8.1a5.5 5.5 0 0 0 0 7.8M16.3 8.1a5.5 5.5 0 0 1 0 7.8M4.7 5.2a9.7 9.7 0 0 0 0 13.6M19.3 5.2a9.7 9.7 0 0 1 0 13.6" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"/></svg>`;
    }
    if (key === "tactical_training" || key === "training") {
      return `<svg ${common}><path d="M12 2.9 19 6v5.3c0 4.5-2.7 7.8-7 9.8-4.3-2-7-5.3-7-9.8V6l7-3.1Z" fill="none" stroke="currentColor" stroke-width="1.55"/><path d="m8.2 10.3 3.8-2.7 3.8 2.7M8.9 13.5l3.1-2.1 3.1 2.1M10 16.1h4" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    if (key === "broken_signal" || key === "broken") {
      return `<svg ${common}><path d="m9.4 14.6-1.7 1.7a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0l.6.6M14.6 9.4l1.7-1.7a3 3 0 1 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0l-.6-.6M8.7 15.3l6.6-6.6" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round"/><path d="M8 4.2 9 6M15 18l1 1.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    }
    if (key === "received") {
      return `<svg ${common}><path d="M5 9.2v5.6M8.6 6.6v10.8M12.2 4.5v15M15.8 7.4v9.2M19 9.8v4.4" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>`;
    }
    if (key === "sent") {
      return `<svg ${common}><path d="m3.5 11.2 16.2-7-5.9 16.1-2.6-6.1-7.7-3Z" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linejoin="round"/><path d="m11.2 14.2 8.5-10" stroke="currentColor" stroke-width="1.55" stroke-linecap="round"/></svg>`;
    }
    if (key === "bonds") {
      return `<svg ${common}><circle cx="8" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="9" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3.7 18c.5-3 2-4.5 4.3-4.5s3.8 1.5 4.3 4.5M11.7 18c.5-3 2-4.5 4.3-4.5s3.8 1.5 4.3 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    }
    return `<svg ${common}><path d="M12 3.5 20 12l-8 8.5L4 12l8-8.5Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
  }

  function displayLabel(value) {
    return asText(value).replace(/[_-]+/g, " ").replace(/\s+/g, " ").toUpperCase();
  }

  function compactDate(unixSeconds) {
    const seconds = Number(unixSeconds);
    if (!Number.isFinite(seconds) || seconds <= 0) return "";
    const date = new Date(Math.trunc(seconds) * 1000);
    if (!Number.isFinite(date.getTime())) return "";
    try {
      return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date);
    } catch (_) {
      return date.toISOString().slice(0, 10);
    }
  }

  function renderRecordedHistory(fieldRecord) {
    const marks = Array.isArray(fieldRecord?.marks) ? fieldRecord.marks : [];
    if (!marks.length) return `<div class="pp-empty">No verified history recorded yet</div>`;
    return `<div class="pp-history">${marks.map((mark) => {
      const date = mark?.dateKnown === true ? compactDate(mark?.occurredAt) : "";
      const proof = date || "VERIFIED";
      const proofText = date ? proof : "";
      return `
        <article class="pp-history-row" data-field-mark="${esc(mark?.key || "")}">
          <div class="pp-history-icon">${fieldRecordIcon(mark?.key)}</div>
          <div class="pp-history-main">
            <div class="pp-history-top"><div class="pp-history-label">${esc(mark?.label || "")}</div></div>
            <div class="pp-history-copy">${esc(mark?.copy || "")}</div>
          </div>
          <div class="pp-history-meta">
            <div class="pp-history-proof">${esc(proofText)}</div>
            <div class="pp-history-status">VERIFIED</div>
          </div>
        </article>`;
    }).join("")}</div>`;
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
    const signal = p.howlSignal || p.signal || p.cosmetics?.signal || {};
    const signalActive = !!signal.active;
    const badges = Array.isArray(p.badges) ? p.badges : [];
    const loadout = Array.isArray(p.loadout) ? p.loadout : [];
    const factionKey = normalizeFactionKey(p.faction);
    const accentRgb = factionAccentRgb(p.faction);
    const visualStyle = `style="--pp-accent-rgb:${esc(accentRgb)}"`;
    const skinUrl = asText(skin.url || skin.img || skin.preview_url || skin.previewUrl);
    const avatarUrl = asText(p.avatar_url || p.avatarUrl || p.avatar?.img || p.avatar?.url);
    const frameUrl = asText(frame.url || frame.img || frame.preview_url || frame.previewUrl);
    const originLabel = asText(p.origin_label || p.originLabel);
    const activeTitle = asText(p.displayTitle || p.title);
    const activeTag = asText(p.displayTag || p.activeTag);
    const activeAura = asText(p.activeAura?.label || p.activeAura?.name);
    const identityPath = [displayLabel(originLabel), displayLabel(p.faction)].filter(Boolean).join("  ·  ");
    const fieldRecord = p.fieldRecord && typeof p.fieldRecord === "object" ? p.fieldRecord : { marks: [] };
    const visualClass = [
      "pp-visual",
      frameUrl ? "has-frame" : "has-default-frame",
      factionKey ? `is-${factionKey}` : "",
    ].filter(Boolean).join(" ");
    const fallback = `<div class="pp-fallback-mark" aria-hidden="true"><b>${esc(initials(p.name))}</b></div>`;
    const identityChips = [
      `Lv ${asInt(p.level, 1)}`,
      activeTag ? `TAG · ${activeTag}` : "",
      activeAura ? `AURA · ${activeAura}` : "",
    ].filter(Boolean).map((label) => ({ label, signal: false }));
    const recognitionChips = [
      ...(Array.isArray(p.prestige_tags) ? p.prestige_tags.map(asText).filter(Boolean) : []),
    ].filter(Boolean).map((label) => ({ label, signal: false }));
    if (signalActive) recognitionChips.push({ label: asText(signal.title) || "HOWL Signal", signal: true });
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
      <div class="pp-hero-shell">
        <div class="pp-hero">
          <div>
            ${visual}
            <div class="pp-visual-caption"><span>ALPHA DEN</span><small>${esc(displayLabel(originLabel) || "RECORDED")}</small></div>
          </div>
          <div class="pp-main">
            <div class="pp-name">${esc(p.name || "Howler")}</div>
            ${activeTitle ? `<div class="pp-active-title">${esc(activeTitle)}</div>` : ""}
            ${identityPath ? `<div class="pp-path">${esc(identityPath)}</div>` : ""}
            <div class="pp-meta">${identityChips.map((x) => `<span class="pp-chip">${esc(x.label)}</span>`).join("")}</div>
            <div class="pp-quote">“Same sky. A stronger tomorrow.”</div>
          </div>
        </div>
      </div>

      <div class="pp-section">
        <div class="pp-section-head">
          <div class="pp-section-title">Recorded History</div>
          <div class="pp-section-note">Verified records only</div>
        </div>
        ${renderRecordedHistory(fieldRecord)}
      </div>

      <div class="pp-section">
        <div class="pp-section-head">
          <div class="pp-section-title">Pack Recognition</div>
          <div class="pp-section-note">Stronger together</div>
        </div>
        ${recognitionChips.length ? `<div class="pp-recognition-meta">${recognitionChips.map((x) => `<span class="pp-chip${x.signal ? " pp-signal" : ""}">${esc(x.label)}</span>`).join("")}</div>` : ""}
        <div class="pp-action-card">
          <div class="pp-action">
            <button type="button" class="pp-howl" ${button.disabled ? "disabled" : ""} data-state="${esc(button.key)}">${esc(button.label)}</button>
          </div>
          <div class="pp-howls-copy">
            <span class="pp-left">Pack Signals left today: <strong>${esc(left)} / ${esc(limit)}</strong></span>
            <div class="pp-howl-help">Send a Howl to recognize another player. It appears in their mailbox and adds to social counters. No gameplay power.</div>
          </div>
        </div>
        <div class="pp-stats">
          <div class="pp-stat"><div class="pp-stat-icon">${fieldRecordIcon("received")}</div><strong>${esc(asInt(social.howls_received_total, 0))}</strong><span>Howls Received</span><small>Signals from other players who noticed your trail.</small></div>
          <div class="pp-stat"><div class="pp-stat-icon">${fieldRecordIcon("sent")}</div><strong>${esc(asInt(social.howls_sent_total, 0))}</strong><span>Howls Sent</span><small>Signals you sent to the pack.</small></div>
          <div class="pp-stat"><div class="pp-stat-icon">${fieldRecordIcon("bonds")}</div><strong>${esc(asInt(social.pack_bonds_total, 0))}</strong><span>Pack Bonds</span><small>Mutual Howls returned on the same day.</small></div>
        </div>
        <div class="pp-social-note">Pack Signals are social recognition only. They never give gameplay power.</div>
      </div>

      <div class="pp-section">
        <div class="pp-section-head">
          <div class="pp-section-title">Displayed Badges</div>
          <div class="pp-section-note">Marks of your journey</div>
        </div>
        ${badges.length ? `<div class="pp-badges">${badges.map((b) => `
          <div class="pp-badge">
            ${renderIcon(b.icon, "pp-badge-icon", b.name)}
            <div class="pp-badge-name">${esc(b.name || b.key || "Badge")}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No public badges yet</div>`}
      </div>

      <div class="pp-section">
        <div class="pp-section-head">
          <div class="pp-section-title">Equipped Loadout</div>
          <div class="pp-section-note">Tools for a stronger tomorrow</div>
        </div>
        ${loadout.length ? `<div class="pp-loadout">${loadout.map((it) => `
          <div class="pp-item">
            ${renderIcon(it.icon, "pp-item-icon", it.name)}
            <div class="pp-item-name">${esc(it.name || it.slot || "Item")}</div>
            <div class="pp-item-sub">${esc(it.slot || "")}${it.rarity ? ` · ${esc(it.rarity)}` : ""}</div>
          </div>
        `).join("")}</div>` : `<div class="pp-empty">No public loadout yet</div>`}
      </div>

      <footer class="pp-footer" aria-hidden="true">
        <div class="pp-footer-copy">
          <div class="pp-footer-brand">ALPHA HUSKY<small>PEOPLE · MISSIONS · A STRONGER TOMORROW</small></div>
          <div class="pp-footer-sign">Howl Further</div>
        </div>
      </footer>
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
