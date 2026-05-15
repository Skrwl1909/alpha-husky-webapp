(function initCampaignModule(global) {
  "use strict";

  if (global.Campaign) return;

  var STATE = {
    apiPost: null,
    tg: null,
    dbg: false,
    inited: false,
    initCount: 0,
    backEl: null,
    rootEl: null,
    tileEl: null,
    tileStatusEl: null,
    tileBadgeEl: null,
    payload: null,
    lastLoadAt: 0,
    loadPromise: null,
    busyAction: "",
    briefingKey: "",
    briefingNotice: "",
    lastOpenedDirective: "",
    visHandler: null,
  };

  var STATE_STALE_MS = 20000;
  var DIRECTIVE_META = {
    trace_signal: {
      label: "Trace the Signal",
      shortText: "Run an Expedition.",
      fullText: "Run an Expedition and follow the fracture.",
      primaryActionKey: "missions",
    },
    secure_node: {
      label: "Secure a Phantom Node",
      shortText: "Patrol the unstable map.",
      fullText: "Patrol the unstable map signal.",
      primaryActionKey: "secure_node",
    },
    red_static: {
      label: "Enter Red Static",
      shortText: "Strike Blood-Moon Tower.",
      fullText: "Strike Blood-Moon Tower and listen for what answers.",
      primaryActionKey: "red_static",
    },
    watch_edge: {
      label: "Watch the Edge",
      shortText: "Check the doorway Alpha found.",
      fullText: "Check the doorway Alpha found.",
      primaryActionKey: "watch_edge",
    }
  };
  var BRIEFING_META = {
    trace_signal: {
      title: "Trace the Signal",
      relayLine: "Expeditions are not errands anymore. You're tracing fractures in the signal.",
      whyMatters: "Run an Expedition to look for supplies, static, and proof of where the break started.",
      ctaLabel: "Open Expeditions",
    },
    secure_node: {
      title: "Secure a Phantom Node",
      relayLine: "Nodes are where the signal holds or collapses.",
      whyMatters: "Patrol the unstable map signal before another faction writes over it.",
      ctaLabel: "Open Map",
    },
    red_static: {
      title: "Enter Red Static",
      relayLine: "Blood-Moon noise is not random.",
      whyMatters: "Strike the Tower and listen for what answers back.",
      ctaLabel: "Open Blood-Moon Tower",
    },
    watch_edge: {
      title: "Watch the Edge",
      relayLine: "Alpha found the doorway there. The Edge is no longer silent.",
      whyMatters: "If the Edge moves, the Pack needs to know.",
      ctaLabel: "Open Edge",
    }
  };
  var CAMPAIGN_TILE_BG_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778846841/awakening/relay7/campaign_hub_tile_bg_v1.webp";
  var RELAY7_AVATAR_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778846885/awakening/relay7/relay7_avatar_v1.webp";
  var RELAY7_MODAL_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1778846885/awakening/relay7/relay7_modal_v1.webp";
  var RELAY7_AVATAR_ERROR = "this.parentNode.classList.remove('has-image');this.remove();";
  var RELAY7_VISUAL_ERROR = "this.parentNode.classList.add('is-fallback');this.remove();";

  function log() {
    if (!STATE.dbg) return;
    try { console.log.apply(console, ["[Campaign]"].concat([].slice.call(arguments))); } catch (_) {}
  }

  function warn() {
    if (!STATE.dbg) return;
    try { console.warn.apply(console, ["[Campaign]"].concat([].slice.call(arguments))); } catch (_) {}
  }

  function asText(v) {
    return String(v == null ? "" : v).trim();
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function isOpen() {
    return !!(STATE.backEl && STATE.backEl.style.display !== "none");
  }

  function isFreshEnough() {
    return !!(STATE.lastLoadAt && (Date.now() - STATE.lastLoadAt) < STATE_STALE_MS);
  }

  function closeHubSheets() {
    ["hubBack", "charBack"].forEach(function hide(id) {
      var el = document.getElementById(id);
      if (!el || el.style.display === "none") return;
      el.style.display = "none";
      delete el.dataset.open;
      try { global.navClose && global.navClose(id); } catch (_) {}
    });
  }

  function setBodyLock(on) {
    document.body.classList.toggle("ah-modal-open", !!on);
    document.body.classList.toggle("ah-sheet-open", !!on);
    document.body.style.overflow = on ? "hidden" : "";
  }

  function directiveState() {
    var data = STATE.payload && STATE.payload.campaign && typeof STATE.payload.campaign === "object"
      ? STATE.payload.campaign
      : null;
    return data;
  }

  function activeBriefingKey() {
    return asText(STATE.briefingKey).toLowerCase();
  }

  function assetReady(key) {
    return !!(STATE.assets && STATE.assets[key] === "ready");
  }

  function preloadAsset(key, url) {
    if (!key || !url || typeof Image === "undefined") return;
    if (!STATE.assets) STATE.assets = {};
    if (STATE.assets[key] === "loading" || STATE.assets[key] === "ready") return;

    STATE.assets[key] = "loading";
    var img = new Image();
    img.onload = function onLoaded() {
      STATE.assets[key] = "ready";
      updateTile();
      if (isOpen()) render();
    };
    img.onerror = function onFailed() {
      STATE.assets[key] = "failed";
      updateTile();
      if (isOpen()) render();
    };
    img.src = url;
  }

  function preloadVisualAssets() {
    preloadAsset("tileBg", CAMPAIGN_TILE_BG_URL);
    preloadAsset("avatar", RELAY7_AVATAR_URL);
    preloadAsset("modal", RELAY7_MODAL_URL);
  }

  function renderRelayAvatar() {
    var hasImage = assetReady("avatar");
    return ""
      + "<div class=\"campaign-avatar" + (hasImage ? " has-image" : "") + "\" aria-hidden=\"true\">"
      + (hasImage
        ? "<img class=\"campaign-avatar-img\" src=\"" + esc(RELAY7_AVATAR_URL) + "\" alt=\"\" loading=\"lazy\" decoding=\"async\" onerror=\"" + RELAY7_AVATAR_ERROR + "\">"
        : "")
      + "  <div class=\"campaign-avatar-fallback\"><div class=\"campaign-avatar-core\">R7</div></div>"
      + "</div>";
  }

  function renderRelayHeader() {
    return ""
      + "  <div class=\"campaign-signal\">"
      +      renderRelayAvatar()
      + "    <div class=\"campaign-signal-copy\">"
      + "      <div class=\"campaign-npc\">RELAY-7</div>"
      + "      <div class=\"campaign-role\">Pack Signal Handler</div>"
      + "    </div>"
      + "  </div>";
  }

  function renderRelayVisual() {
    var hasImage = assetReady("modal");
    return ""
      + "<div class=\"campaign-visual" + (hasImage ? "" : " is-fallback") + "\">"
      + (hasImage
        ? "  <img class=\"campaign-visual-img\" src=\"" + esc(RELAY7_MODAL_URL) + "\" alt=\"\" loading=\"lazy\" decoding=\"async\" onerror=\"" + RELAY7_VISUAL_ERROR + "\">"
        : "")
      + "  <div class=\"campaign-visual-fallback\" aria-hidden=\"true\">"
      + "    <div class=\"campaign-visual-core\">R7</div>"
      + "    <div class=\"campaign-visual-wave\"></div>"
      + "  </div>"
      + "</div>";
  }

  function resolveDirectiveMeta(key, fallback) {
    var safeKey = asText(key).toLowerCase();
    var base = DIRECTIVE_META[safeKey] || null;
    if (!base) return null;
    var extra = fallback && typeof fallback === "object" ? fallback : {};
    return {
      key: safeKey,
      label: asText(extra.directiveLabel) || base.label,
      shortText: asText(extra.shortText) || base.shortText,
      fullText: asText(extra.directiveText) || base.fullText,
      primaryActionKey: asText(extra.primaryActionKey) || base.primaryActionKey,
    };
  }

  function guidanceItems(campaign) {
    var data = campaign && typeof campaign === "object" ? campaign : {};
    return [
      resolveDirectiveMeta("trace_signal", {
        directiveLabel: "Trace the Signal",
        shortText: "Run an Expedition.",
        directiveText: "Run an Expedition and follow the fracture.",
        primaryActionKey: "missions",
      }),
      resolveDirectiveMeta("secure_node", {
        directiveLabel: "Secure a Phantom Node",
        shortText: "Patrol the unstable map signal.",
        directiveText: "Patrol the unstable map signal.",
        primaryActionKey: "secure_node",
      }),
      resolveDirectiveMeta("red_static", {
        directiveLabel: "Enter Red Static",
        shortText: "Strike Blood-Moon Tower and listen for what answers.",
        directiveText: "Strike Blood-Moon Tower and listen for what answers.",
        primaryActionKey: "red_static",
      }),
      resolveDirectiveMeta("watch_edge", {
        directiveLabel: "Watch the Edge",
        shortText: "Check the doorway Alpha found.",
        directiveText: "Check the doorway Alpha found.",
        primaryActionKey: "watch_edge",
      })
    ].filter(Boolean).map(function merge(item) {
      if (data.playerDirective === item.key) {
        item.label = asText(data.directiveLabel) || item.label;
        item.primaryActionKey = asText(data.primaryActionKey) || item.primaryActionKey;
      }
      return item;
    });
  }

  function orderedGuidanceItems(campaign) {
    var items = guidanceItems(campaign);
    var selected = asText(campaign && campaign.playerDirective).toLowerCase();
    if (!selected) return items;

    return items.slice().sort(function order(a, b) {
      var aPrimary = a && a.key === selected ? 1 : 0;
      var bPrimary = b && b.key === selected ? 1 : 0;
      return bPrimary - aPrimary;
    });
  }

  function ensureStyles() {
    if (document.getElementById("campaign-css")) return;

    var style = document.createElement("style");
    style.id = "campaign-css";
    style.textContent = ""
      + "#campaignBack{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;"
      + "background:rgba(2,6,12,.72);z-index:1500000;padding:14px;}"
      + "@media (min-width:700px){#campaignBack{align-items:center;}}"
      + "#campaignBack .campaign-sheet{width:min(540px,96vw);max-height:min(86vh,760px);overflow:auto;"
      + "border-radius:24px;background:linear-gradient(180deg,rgba(6,12,18,.98),rgba(11,18,27,.98));"
      + "border:1px solid rgba(157,215,255,.18);box-shadow:0 24px 70px rgba(0,0,0,.55);color:#eef7ff;}"
      + ".campaign-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 14px 10px;"
      + "border-bottom:1px solid rgba(157,215,255,.10);}"
      + ".campaign-kicker{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(153,211,255,.72);font-weight:900;}"
      + ".campaign-title{margin-top:4px;font-size:18px;font-weight:900;letter-spacing:.02em;}"
      + ".campaign-sub{margin-top:3px;font-size:12px;color:rgba(223,238,255,.72);}"
      + ".campaign-close{width:36px;height:36px;border-radius:12px;border:1px solid rgba(255,255,255,.12);"
      + "background:rgba(255,255,255,.04);color:#fff;cursor:pointer;font-size:18px;}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7{position:relative;overflow:hidden;isolation:isolate;}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7::before{content:'';position:absolute;inset:0;z-index:0;"
      + "background-image:linear-gradient(135deg, rgba(4,10,17,.90) 0%, rgba(4,10,17,.56) 44%, rgba(8,20,34,.86) 100%), var(--campaign-tile-bg);"
      + "background-position:center;background-size:cover;background-repeat:no-repeat;opacity:.98;}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7::after{content:'';position:absolute;inset:0;z-index:0;"
      + "background:radial-gradient(circle at 82% 20%, rgba(116,210,255,.22), transparent 34%),linear-gradient(180deg, transparent, rgba(7,17,27,.32));pointer-events:none;}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7 > *{position:relative;z-index:1;}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7 .ah-tile-ico{background:rgba(8,18,30,.56);border:1px solid rgba(132,214,255,.18);box-shadow:0 10px 24px rgba(0,0,0,.18);}"
      + ".ah-tile[data-campaign-tile].campaign-tile--relay7 .ah-tile-status{color:rgba(223,242,255,.88);}"
      + "#campaignRoot{padding:14px;}"
      + ".campaign-card{border:1px solid rgba(157,215,255,.14);border-radius:20px;padding:14px;"
      + "background:radial-gradient(circle at top, rgba(64,135,194,.22), transparent 42%), rgba(255,255,255,.03);}"
      + ".campaign-visual{position:relative;height:148px;margin-bottom:14px;border-radius:18px;overflow:hidden;"
      + "border:1px solid rgba(145,226,255,.16);background:linear-gradient(180deg, rgba(17,35,52,.92), rgba(8,18,29,.98));"
      + "box-shadow:inset 0 0 0 1px rgba(145,226,255,.05);}"
      + ".campaign-visual::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg, rgba(4,10,16,.12) 0%, rgba(4,10,16,.18) 45%, rgba(4,10,16,.72) 100%),"
      + "radial-gradient(circle at 18% 18%, rgba(124,214,255,.18), transparent 28%);pointer-events:none;}"
      + ".campaign-visual-img{display:block;width:100%;height:100%;object-fit:cover;object-position:center top;}"
      + ".campaign-visual-fallback{position:absolute;inset:0;display:none;align-items:center;justify-content:center;overflow:hidden;"
      + "background:radial-gradient(circle at 30% 28%, rgba(146,225,255,.18), transparent 24%),linear-gradient(180deg, rgba(18,38,58,.92), rgba(6,16,28,.98));}"
      + ".campaign-visual.is-fallback .campaign-visual-fallback{display:flex;}"
      + ".campaign-visual-core{position:relative;z-index:1;width:74px;height:74px;border-radius:50%;display:grid;place-items:center;"
      + "border:1px solid rgba(160,231,255,.28);background:radial-gradient(circle, rgba(169,241,255,.20), rgba(22,38,55,.92));"
      + "font-size:20px;font-weight:900;letter-spacing:.2em;color:#dff7ff;box-shadow:0 0 30px rgba(80,177,221,.18), inset 0 0 24px rgba(145,226,255,.14);}"
      + ".campaign-visual-wave{position:absolute;left:-8%;right:-8%;top:50%;height:92px;transform:translateY(-50%);opacity:.46;"
      + "background:repeating-linear-gradient(180deg, transparent 0 7px, rgba(135,224,255,.10) 7px 9px, transparent 9px 16px);}"
      + ".campaign-signal{display:flex;gap:12px;align-items:center;}"
      + ".campaign-avatar{position:relative;width:68px;height:68px;border-radius:50%;flex:0 0 68px;"
      + "border:1px solid rgba(145,226,255,.28);background:radial-gradient(circle at 35% 35%, rgba(162,237,255,.26), rgba(14,30,46,.96) 68%);"
      + "display:grid;place-items:center;overflow:hidden;box-shadow:inset 0 0 18px rgba(145,226,255,.18),0 0 24px rgba(77,164,212,.15);}"
      + ".campaign-avatar::before,.campaign-avatar::after{content:'';position:absolute;left:10px;right:10px;height:2px;"
      + "background:linear-gradient(90deg, transparent, rgba(155,230,255,.55), transparent);opacity:.7;}"
      + ".campaign-avatar::before{top:24px;}.campaign-avatar::after{top:40px;}"
      + ".campaign-avatar-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center top;z-index:2;}"
      + ".campaign-avatar-fallback{position:absolute;inset:0;display:grid;place-items:center;z-index:1;}"
      + ".campaign-avatar-core{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;"
      + "background:radial-gradient(circle, rgba(169,241,255,.24), rgba(22,38,55,.9));border:1px solid rgba(168,240,255,.24);"
      + "font-size:16px;font-weight:900;letter-spacing:.18em;color:#dff7ff;}"
      + ".campaign-signal-copy{min-width:0;}"
      + ".campaign-npc{font-size:17px;font-weight:900;letter-spacing:.03em;}"
      + ".campaign-role{margin-top:2px;font-size:12px;color:rgba(205,232,255,.72);text-transform:uppercase;letter-spacing:.12em;}"
      + ".campaign-line{margin:0;font-size:14px;line-height:1.45;color:rgba(239,246,255,.94);}"
      + ".campaign-line + .campaign-line{margin-top:6px;}"
      + ".campaign-beat{margin-top:12px;padding-top:12px;border-top:1px solid rgba(157,215,255,.10);}"
      + ".campaign-question{margin-top:14px;font-size:13px;font-weight:800;color:rgba(222,242,255,.90);}"
      + ".campaign-directives{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}"
      + ".campaign-directive-btn,.campaign-guidance-btn,.campaign-mark-btn{appearance:none;border:1px solid rgba(157,215,255,.15);"
      + "background:rgba(255,255,255,.04);color:#f2f8ff;border-radius:14px;cursor:pointer;}"
      + ".campaign-directive-btn{padding:12px 10px;text-align:left;}"
      + ".campaign-directive-btn strong,.campaign-guidance-copy strong{display:block;font-size:13px;font-weight:900;}"
      + ".campaign-directive-btn span,.campaign-guidance-copy span{display:block;margin-top:3px;font-size:12px;color:rgba(210,230,249,.78);line-height:1.35;}"
      + ".campaign-directive-btn.is-picked{border-color:rgba(129,228,178,.42);background:rgba(51,120,88,.20);box-shadow:inset 0 0 0 1px rgba(150,235,190,.14);}"
      + ".campaign-directive-btn[disabled],.campaign-mark-btn[disabled],.campaign-guidance-btn[disabled]{opacity:.64;cursor:default;}"
      + ".campaign-note{margin-top:14px;padding:12px;border-radius:16px;background:rgba(255,255,255,.04);"
      + "border:1px solid rgba(255,255,255,.08);font-size:13px;line-height:1.4;color:rgba(237,245,255,.88);}"
      + ".campaign-directive-line{margin-top:10px;font-size:12px;color:rgba(180,219,255,.86);font-weight:800;letter-spacing:.04em;}"
      + ".campaign-mark-btn{margin-top:12px;width:100%;padding:13px 14px;background:linear-gradient(180deg, rgba(67,157,208,.24), rgba(38,84,117,.20));font-weight:900;}"
      + ".campaign-guidance{margin-top:16px;}"
      + ".campaign-guidance-head{font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:rgba(145,226,255,.74);font-weight:900;}"
      + ".campaign-guidance-lead{margin-top:6px;font-size:13px;line-height:1.38;color:rgba(230,243,255,.88);}"
      + ".campaign-guidance-list{display:grid;gap:8px;margin-top:10px;}"
      + ".campaign-guidance-btn{display:flex;justify-content:space-between;gap:10px;width:100%;padding:12px 13px;text-align:left;align-items:flex-start;}"
      + ".campaign-guidance-btn.is-primary{border-color:rgba(145,226,255,.34);background:linear-gradient(180deg, rgba(44,104,145,.34), rgba(19,48,71,.24));box-shadow:inset 0 0 0 1px rgba(145,226,255,.10);}"
      + ".campaign-guidance-arrow{align-self:center;font-size:16px;color:rgba(145,226,255,.88);}"
      + ".campaign-primary-badge{display:inline-flex;align-items:center;gap:4px;margin-bottom:7px;padding:4px 7px;border-radius:999px;"
      + "background:rgba(140,223,255,.14);border:1px solid rgba(140,223,255,.22);font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:rgba(187,238,255,.96);}"
      + ".campaign-briefing{margin-top:14px;padding:14px;border-radius:18px;border:1px solid rgba(145,226,255,.16);background:linear-gradient(180deg, rgba(19,42,60,.44), rgba(8,19,31,.52));}"
      + ".campaign-briefing-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(160,223,255,.74);}"
      + ".campaign-briefing-title{margin-top:6px;font-size:18px;font-weight:900;letter-spacing:.02em;}"
      + ".campaign-briefing-line{margin-top:10px;font-size:13px;line-height:1.42;color:rgba(236,245,255,.92);}"
      + ".campaign-briefing-why{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:12px;line-height:1.4;color:rgba(221,237,255,.82);}"
      + ".campaign-briefing-actions{display:flex;gap:8px;margin-top:12px;}"
      + ".campaign-briefing-primary,.campaign-briefing-back{appearance:none;border-radius:14px;padding:12px 13px;cursor:pointer;font-weight:900;}"
      + ".campaign-briefing-primary{flex:1;border:1px solid rgba(145,226,255,.22);background:linear-gradient(180deg, rgba(50,118,163,.44), rgba(21,54,79,.44));color:#f2f8ff;}"
      + ".campaign-briefing-back{min-width:96px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);color:rgba(233,243,255,.88);}"
      + ".campaign-briefing-primary[disabled],.campaign-briefing-back[disabled]{opacity:.64;cursor:default;}"
      + ".campaign-briefing-notice{margin-top:10px;font-size:12px;line-height:1.38;color:rgba(255,214,214,.88);}"
      + ".campaign-last-opened{margin-top:10px;font-size:11px;line-height:1.35;color:rgba(177,216,245,.72);}"
      + ".campaign-foot{margin-top:10px;font-size:11px;line-height:1.35;color:rgba(189,213,235,.62);}"
      + ".campaign-empty{padding:10px 0 2px;font-size:14px;line-height:1.45;color:rgba(230,243,255,.82);}"
      + ".campaign-error{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(138,40,40,.20);"
      + "border:1px solid rgba(255,120,120,.18);font-size:12px;color:rgba(255,226,226,.92);}";

    document.head.appendChild(style);
  }

  function ensureModal() {
    if (STATE.backEl && document.body.contains(STATE.backEl)) return STATE.backEl;
    ensureStyles();

    var back = document.createElement("div");
    back.id = "campaignBack";
    back.style.display = "none";
    back.innerHTML = ""
      + "<div class=\"campaign-sheet\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Campaign\">"
      + "  <div class=\"campaign-head\">"
      + "    <div>"
      + "      <div class=\"campaign-kicker\">Incoming Signal</div>"
      + "      <div class=\"campaign-title\">Campaign</div>"
      + "      <div class=\"campaign-sub\">Chapter 6 arrives through RELAY-7.</div>"
      + "    </div>"
      + "    <button type=\"button\" class=\"campaign-close\" aria-label=\"Close campaign\">x</button>"
      + "  </div>"
      + "  <div id=\"campaignRoot\"></div>"
      + "</div>";

    back.addEventListener("click", function onBackdrop(ev) {
      if (ev.target === back) close();
    });
    back.querySelector(".campaign-close").addEventListener("click", close);

    STATE.backEl = back;
    STATE.rootEl = back.querySelector("#campaignRoot");
    document.body.appendChild(back);

    try {
      if (typeof global.navRegister === "function") {
        global.navRegister("campaignBack", { isOpen: isOpen, close: close });
      }
    } catch (_) {}

    return back;
  }

  function ensureTileRefs() {
    STATE.tileEl = STATE.tileEl && document.body.contains(STATE.tileEl)
      ? STATE.tileEl
      : document.querySelector("[data-campaign-tile]");
    STATE.tileStatusEl = STATE.tileStatusEl && document.body.contains(STATE.tileStatusEl)
      ? STATE.tileStatusEl
      : document.querySelector("[data-campaign-status]");
    STATE.tileBadgeEl = STATE.tileBadgeEl && document.body.contains(STATE.tileBadgeEl)
      ? STATE.tileBadgeEl
      : document.querySelector("[data-campaign-badge]");
  }

  function tileStatusText(payload) {
    if (!payload || payload.ok === false) return "";
    if (!payload.eligible) {
      if (payload.reason === "AWAKENING_REQUIRED") return "Finish Awakening";
      if (payload.reason === "OATH_REQUIRED") return "Awaiting Oath";
      return "";
    }

    var campaign = payload.campaign || {};
    var directiveStatus = asText(campaign.directiveStatus);
    if (directiveStatus) return directiveStatus;
    if (!campaign.playerDirective) return "Incoming signal";
    if (campaign.markLeft) return "Signal confirmed";
    return "Directive selected";
  }

  function updateTile() {
    ensureTileRefs();
    if (!STATE.tileEl) return;

    var payload = STATE.payload;
    var statusText = tileStatusText(payload);
    var statusKey = "";
    var unread = false;

    if (payload && payload.eligible && payload.campaign) {
      statusKey = asText(payload.campaign.status).toLowerCase();
      unread = !!payload.campaign.unread;
    }

    if (STATE.tileStatusEl) {
      STATE.tileStatusEl.textContent = statusText;
      STATE.tileStatusEl.hidden = !statusText;
      if (statusKey) STATE.tileStatusEl.setAttribute("data-campaign-status", statusKey);
      else STATE.tileStatusEl.removeAttribute("data-campaign-status");
    }

    if (STATE.tileBadgeEl) {
      STATE.tileBadgeEl.hidden = !unread;
      STATE.tileBadgeEl.textContent = "";
    }

    STATE.tileEl.classList.toggle("campaign-tile--relay7", assetReady("tileBg"));
    if (assetReady("tileBg")) {
      STATE.tileEl.style.setProperty("--campaign-tile-bg", "url(\"" + CAMPAIGN_TILE_BG_URL + "\")");
    } else {
      STATE.tileEl.style.removeProperty("--campaign-tile-bg");
    }
  }

  function renderDirectiveChoices(campaign) {
    var selected = asText(campaign.playerDirective).toLowerCase();
    var locked = !!selected;

    return guidanceItems(campaign).map(function buildDirective(item) {
      var picked = selected === item.key;
      return ""
        + "<button type=\"button\" class=\"campaign-directive-btn" + (picked ? " is-picked" : "") + "\""
        + " data-campaign-directive=\"" + esc(item.key) + "\""
        + (STATE.busyAction ? " disabled" : "")
        + (locked && !picked ? " disabled" : "")
        + ">"
        + "  <strong>" + esc(item.label) + "</strong>"
        + "  <span>" + esc(item.shortText) + "</span>"
        + "</button>";
    }).join("");
  }

  function renderGuidance(campaign) {
    var selected = asText(campaign.playerDirective).toLowerCase();
    return orderedGuidanceItems(campaign).map(function buildGuide(item) {
      var isPrimary = !!selected && item.key === selected;
      return ""
        + "<button type=\"button\" class=\"campaign-guidance-btn" + (isPrimary ? " is-primary" : "") + "\" data-campaign-guide=\"" + esc(item.key) + "\">"
        + "  <span class=\"campaign-guidance-copy\">"
        + (isPrimary ? "    <span class=\"campaign-primary-badge\">First Directive</span>" : "")
        + "    <strong>" + esc(item.label) + "</strong>"
        + "    <span>" + esc(item.fullText) + "</span>"
        + "  </span>"
        + "  <span class=\"campaign-guidance-arrow\">></span>"
        + "</button>";
    }).join("");
  }

  function renderSignalCard(campaign) {
    var selected = asText(campaign.playerDirective).toLowerCase();
    var meta = resolveDirectiveMeta(selected, campaign) || null;
    var hasDirective = !!meta;
    var afterChoiceHtml = "";
    var lastOpenedMeta = resolveDirectiveMeta(STATE.lastOpenedDirective, campaign) || null;

    if (hasDirective) {
      afterChoiceHtml += "<div class=\"campaign-note\">Directive locked. RELAY-7 will keep this as your first trail marker.</div>";
      afterChoiceHtml += "<div class=\"campaign-directive-line\">First Directive: " + esc(meta.label) + "</div>";
      afterChoiceHtml += "<button type=\"button\" class=\"campaign-mark-btn\" data-campaign-mark"
        + (STATE.busyAction ? " disabled" : "")
        + (campaign.markLeft ? " disabled" : "")
        + ">"
        + (campaign.markLeft ? "Mark Delivered" : "Leave Your Mark")
        + "</button>";
    }

    if (campaign.markLeft) {
      afterChoiceHtml += "<div class=\"campaign-note\">Your mark reached the Pack. The fracture has begun, but you are still standing.</div>";
    }
    if (lastOpenedMeta) {
      afterChoiceHtml += "<div class=\"campaign-last-opened\">Last opened: " + esc(lastOpenedMeta.label) + "</div>";
    }

    return ""
      + "<div class=\"campaign-card\">"
      +      renderRelayVisual()
      +      renderRelayHeader()
      + "  <div class=\"campaign-beat\">"
      + "    <p class=\"campaign-line\">Can you hear me?</p>"
      + "    <p class=\"campaign-line\">If this signal is hitting your node... you're still alive.</p>"
      + "    <p class=\"campaign-line\">But don't celebrate yet.</p>"
      + "  </div>"
      + "  <div class=\"campaign-beat\">"
      + "    <p class=\"campaign-line\">The Meme War was a distraction.</p>"
      + "    <p class=\"campaign-line\">Alpha reached the Edge.</p>"
      + "    <p class=\"campaign-line\">He found the Oracle.</p>"
      + "    <p class=\"campaign-line\">Now the Pack is fracturing.</p>"
      + "  </div>"
      + "  <div class=\"campaign-question\">Choose your first Signal Directive.</div>"
      + "  <div class=\"campaign-directives\">" + renderDirectiveChoices(campaign) + "</div>"
      +      afterChoiceHtml
      + "  <div class=\"campaign-guidance\">"
      + "    <div class=\"campaign-guidance-head\">Move With Purpose</div>"
      + "    <div class=\"campaign-guidance-lead\">Then don't click blindly. Move with purpose.</div>"
      + "    <div class=\"campaign-guidance-list\">" + renderGuidance(campaign) + "</div>"
      + "    <div class=\"campaign-foot\">Guidance only. These routes open existing systems and do not fake completion or rewards.</div>"
      + "  </div>"
      + "</div>";
  }

  function renderBriefingCard(campaign, key) {
    var safeKey = asText(key).toLowerCase();
    var briefing = BRIEFING_META[safeKey] || null;
    var directive = resolveDirectiveMeta(safeKey, campaign) || null;
    if (!briefing || !directive) {
      return renderSignalCard(campaign);
    }

    return ""
      + "<div class=\"campaign-card\">"
      +      renderRelayVisual()
      +      renderRelayHeader()
      + "  <div class=\"campaign-briefing\">"
      + "    <div class=\"campaign-briefing-kicker\">Signal Directive Handoff</div>"
      + "    <div class=\"campaign-briefing-title\">" + esc(briefing.title) + "</div>"
      + "    <div class=\"campaign-briefing-line\">" + esc(briefing.relayLine) + "</div>"
      + "    <div class=\"campaign-briefing-why\"><strong>Why it matters:</strong> " + esc(briefing.whyMatters) + "</div>"
      + "    <div class=\"campaign-briefing-actions\">"
      + "      <button type=\"button\" class=\"campaign-briefing-primary\" data-campaign-briefing-open"
      + (STATE.busyAction ? " disabled" : "")
      + ">" + esc(briefing.ctaLabel) + "</button>"
      + "      <button type=\"button\" class=\"campaign-briefing-back\" data-campaign-briefing-back"
      + (STATE.busyAction ? " disabled" : "")
      + ">Back</button>"
      + "    </div>"
      + (STATE.briefingNotice ? "<div class=\"campaign-briefing-notice\">" + esc(STATE.briefingNotice) + "</div>" : "")
      + "  </div>"
      + "  <div class=\"campaign-foot\">Guidance only. This handoff explains why RELAY-7 is sending you there first.</div>"
      + "</div>";
  }

  function renderUnavailable(payload) {
    var reason = asText(payload && payload.reason).toUpperCase();
    var body = "RELAY-7 has no stable Pack signal for your node yet.";
    if (reason === "AWAKENING_REQUIRED") {
      body = "Finish Awakening first. The Pack does not push Chapter 6 signals into an unfinished node.";
    } else if (reason === "OATH_REQUIRED") {
      body = "Take the Oath and lock your faction before RELAY-7 opens this line.";
    }

    return ""
      + "<div class=\"campaign-card\">"
      +      renderRelayVisual()
      +      renderRelayHeader()
      + "  <div class=\"campaign-empty\">" + esc(body) + "</div>"
      + "  <div class=\"campaign-foot\">Campaign lives in Hub. It becomes active after Awakening and faction Oath are in place.</div>"
      + "</div>";
  }

  function renderError(err) {
    var msg = asText(err && (err.message || err.reason)) || "Signal lost. Try again in a moment.";
    return ""
      + "<div class=\"campaign-card\">"
      +      renderRelayVisual()
      +      renderRelayHeader()
      + "  <div class=\"campaign-error\">" + esc(msg) + "</div>"
      + "  <div class=\"campaign-foot\">The app stays usable even if this signal fails to load.</div>"
      + "</div>";
  }

  function render() {
    ensureModal();
    if (!STATE.rootEl) return;

    if (!STATE.payload) {
      STATE.rootEl.innerHTML = renderError({ message: "Signal not loaded yet." });
      bind();
      return;
    }

    if (STATE.payload.ok === false) {
      STATE.rootEl.innerHTML = renderError(STATE.payload);
      bind();
      return;
    }

    if (!STATE.payload.eligible || !STATE.payload.show || !directiveState()) {
      STATE.rootEl.innerHTML = renderUnavailable(STATE.payload);
      bind();
      return;
    }

    if (activeBriefingKey()) {
      STATE.rootEl.innerHTML = renderBriefingCard(directiveState(), activeBriefingKey());
    } else {
      STATE.rootEl.innerHTML = renderSignalCard(directiveState());
    }
    bind();
  }

  function bind() {
    if (!STATE.rootEl) return;

    [].slice.call(STATE.rootEl.querySelectorAll("[data-campaign-directive]")).forEach(function attach(btn) {
      btn.addEventListener("click", function onClick() {
        var directive = btn.getAttribute("data-campaign-directive");
        void postAction("choose_directive", { directive: directive });
      });
    });

    var markBtn = STATE.rootEl.querySelector("[data-campaign-mark]");
    if (markBtn) {
      markBtn.addEventListener("click", function onMark() {
        void postAction("leave_mark");
      });
    }

    var backBtn = STATE.rootEl.querySelector("[data-campaign-briefing-back]");
    if (backBtn) {
      backBtn.addEventListener("click", function onBack() {
        closeBriefing();
      });
    }

    var openBtn = STATE.rootEl.querySelector("[data-campaign-briefing-open]");
    if (openBtn) {
      openBtn.addEventListener("click", function onOpen() {
        void confirmBriefingOpen();
      });
    }

    [].slice.call(STATE.rootEl.querySelectorAll("[data-campaign-guide]")).forEach(function attachGuide(btn) {
      btn.addEventListener("click", function onGuide() {
        openBriefing(btn.getAttribute("data-campaign-guide"));
      });
    });
  }

  function api(path, body) {
    if (typeof STATE.apiPost !== "function") return Promise.reject(new Error("apiPost missing"));
    return STATE.apiPost(path, body || {});
  }

  async function loadState(options) {
    var force = !!(options && options.force);
    var reason = asText(options && options.reason) || "load";

    if (!force && STATE.payload && isFreshEnough()) {
      return STATE.payload;
    }
    if (STATE.loadPromise) return STATE.loadPromise;

    log("load state", { force: force, reason: reason });
    STATE.loadPromise = api("/webapp/campaign/state", {}).then(function onLoaded(out) {
      STATE.payload = out || { ok: true, eligible: false, show: false, reason: "EMPTY" };
      STATE.lastLoadAt = Date.now();
      updateTile();
      if (isOpen()) render();
      return STATE.payload;
    }).catch(function onErr(err) {
      warn("state load failed", err);
      if (!STATE.payload) {
        STATE.payload = { ok: false, reason: asText(err && err.message) || "LOAD_FAILED" };
      }
      updateTile();
      if (isOpen()) render();
      return STATE.payload;
    }).finally(function done() {
      STATE.loadPromise = null;
    });

    return STATE.loadPromise;
  }

  async function postAction(action, extra) {
    var current = directiveState();
    if (!current) return false;
    if (STATE.busyAction) return false;

    STATE.busyAction = action;
    render();
    try {
      var payload = Object.assign({ action: action }, extra || {});
      var out = await api("/webapp/campaign/action", payload);
      STATE.payload = out || STATE.payload;
      STATE.lastLoadAt = Date.now();
      updateTile();
      render();
      return !!(out && out.ok !== false);
    } catch (err) {
      warn("action failed", action, err);
      STATE.payload = STATE.payload || { ok: false, reason: asText(err && err.message) || "ACTION_FAILED" };
      render();
      try { STATE.tg && STATE.tg.showAlert && STATE.tg.showAlert("Campaign signal failed to update."); } catch (_) {}
      return false;
    } finally {
      STATE.busyAction = "";
      render();
    }
  }

  async function markIntroSeenIfNeeded() {
    var current = directiveState();
    if (!current || !STATE.payload || !STATE.payload.eligible || current.introSeen || STATE.busyAction) return;
    await postAction("see_intro");
  }

  function openBriefing(id) {
    var key = asText(id).toLowerCase();
    if (!DIRECTIVE_META[key]) return false;
    STATE.briefingKey = key;
    STATE.briefingNotice = "";
    render();
    return true;
  }

  function closeBriefing() {
    if (!activeBriefingKey()) return;
    STATE.briefingKey = "";
    STATE.briefingNotice = "";
    render();
  }

  async function navigateToDirective(id) {
    var key = asText(id).toLowerCase();
    if (!key) return false;

    try { STATE.tg && STATE.tg.HapticFeedback && STATE.tg.HapticFeedback.impactOccurred("light"); } catch (_) {}

    try {
      if (key === "trace_signal") {
        if (typeof global.openMissions === "function" && global.openMissions()) {
          close();
          return true;
        }
        if (typeof global.CTA?.openTarget === "function") {
          if (await global.CTA.openTarget({ type: "missions" })) {
            close();
            return true;
          }
        }
      }

      if (key === "secure_node") {
        if (typeof global.CTA?.openTarget === "function") {
          if (await global.CTA.openTarget({ type: "map_node", nodeId: "phantom_nodes" })) {
            close();
            return true;
          }
        }
        if (typeof global.openMap === "function" && global.openMap()) {
          close();
          return true;
        }
      }

      if (key === "red_static") {
        if (typeof global.CTA?.openTarget === "function") {
          if (await global.CTA.openTarget({ type: "bloodmoon" })) {
            close();
            return true;
          }
        }
        if (typeof global.BloodMoon?.open === "function") {
          await global.BloodMoon.open();
          close();
          return true;
        }
      }

      if (key === "watch_edge") {
        if (typeof global.CTA?.openTarget === "function") {
          if (await global.CTA.openTarget({ type: "siege", nodeId: "edge_of_chain" })) {
            close();
            return true;
          }
        }
        if (typeof global.openMap === "function" && global.openMap()) {
          close();
          return true;
        }
      }
    } catch (err) {
      warn("guidance open failed", key, err);
    }

    STATE.briefingNotice = key === "secure_node"
      ? "Open the Map and choose Phantom Nodes."
      : "RELAY-7 could not open that route here. Use the matching system from Hub or the bottom nav.";
    render();
    try { STATE.tg && STATE.tg.showAlert && STATE.tg.showAlert(STATE.briefingNotice); } catch (_) {}
    return false;
  }

  async function confirmBriefingOpen() {
    var key = activeBriefingKey();
    if (!key || STATE.busyAction) return false;
    var ok = await navigateToDirective(key);
    if (ok) {
      STATE.lastOpenedDirective = key;
      STATE.briefingNotice = "";
      STATE.briefingKey = "";
    }
    return ok;
  }

  async function open() {
    ensureModal();
    closeHubSheets();
    setBodyLock(true);
    STATE.briefingKey = "";
    STATE.briefingNotice = "";
    if (STATE.backEl) STATE.backEl.style.display = "flex";
    try { global.navOpen && global.navOpen("campaignBack"); } catch (_) {}

    await loadState({ force: !isFreshEnough(), reason: "open" });
    render();
    void markIntroSeenIfNeeded();
    return true;
  }

  function close() {
    if (!STATE.backEl) return;
    STATE.briefingKey = "";
    STATE.briefingNotice = "";
    STATE.backEl.style.display = "none";
    setBodyLock(false);
    try { global.navClose && global.navClose("campaignBack"); } catch (_) {}
  }

  function init(opts) {
    opts = opts || {};
    if (typeof opts.apiPost === "function") STATE.apiPost = opts.apiPost;
    if (opts.tg) STATE.tg = opts.tg;
    STATE.dbg = !!opts.dbg;
    STATE.initCount += 1;

    ensureModal();
    ensureTileRefs();
    preloadVisualAssets();
    updateTile();

    if (!STATE.apiPost) {
      warn("init skipped, apiPost missing");
      return global.Campaign;
    }

    if (!STATE.inited) {
      STATE.inited = true;
      void loadState({ force: true, reason: "init" });
    } else {
      void loadState({ force: false, reason: "init_reentry" });
    }

    if (!STATE.visHandler) {
      STATE.visHandler = function onVisible() {
        if (document.visibilityState === "visible") {
          void loadState({ force: !isFreshEnough(), reason: "visibility" });
        }
      };
      document.addEventListener("visibilitychange", STATE.visHandler);
    }

    return global.Campaign;
  }

  function refresh() {
    return loadState({ force: true, reason: "refresh" });
  }

  global.Campaign = {
    init: init,
    open: open,
    close: close,
    load: loadState,
    refresh: refresh,
    state: function getState() { return STATE.payload; }
  };
})(window);
