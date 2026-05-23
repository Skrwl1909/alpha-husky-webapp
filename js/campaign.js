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
    archiveDraft: ["", "", "", ""],
    archiveFeedback: null,
    archiveCelebration: null,
    archiveCelebrationSeenKey: "",
    archiveReportOpen: false,
    visHandler: null,
  };

  var STATE_STALE_MS = 20000;
  var ARCHIVE_DIRECTIVE_ORDER = ["trace_signal", "secure_node", "red_static", "watch_edge"];
  var ARCHIVE_DIRECTIVE_META = {
    trace_signal: { label: "Trace", short: "T" },
    secure_node: { label: "Secure", short: "S" },
    red_static: { label: "Red", short: "R" },
    watch_edge: { label: "Watch", short: "W" }
  };
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
  var ARCHIVE_EMBLEM_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1779282199/burned_archive/burned_archive_emblem.webp";
  var ARCHIVE_KEY_ICON_URL = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1779282500/burned_archive/archive_key_icon.webp";
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

  function archiveState() {
    var report = STATE.payload && STATE.payload.signalReport && typeof STATE.payload.signalReport === "object"
      ? STATE.payload.signalReport
      : null;
    var archive = report && report.burnedArchive && typeof report.burnedArchive === "object"
      ? report.burnedArchive
      : null;
    return archive;
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

  function archiveDirectiveMeta(key) {
    var safeKey = asText(key).toLowerCase();
    return ARCHIVE_DIRECTIVE_META[safeKey] || null;
  }

  function emptyArchiveDraft() {
    return ["", "", "", ""];
  }

  function normalizedArchiveSequence(sequence) {
    if (!Array.isArray(sequence)) return emptyArchiveDraft();
    return [0, 1, 2, 3].map(function normalizeSlot(idx) {
      var key = asText(sequence[idx]).toLowerCase();
      return archiveDirectiveMeta(key) ? key : "";
    });
  }

  function archiveDraftReady(sequence) {
    return normalizedArchiveSequence(sequence).every(function isSet(key) {
      return !!archiveDirectiveMeta(key);
    });
  }

  function cycleArchiveDirective(current) {
    var safeKey = asText(current).toLowerCase();
    var idx = ARCHIVE_DIRECTIVE_ORDER.indexOf(safeKey);
    return ARCHIVE_DIRECTIVE_ORDER[idx >= 0 ? ((idx + 1) % ARCHIVE_DIRECTIVE_ORDER.length) : 0];
  }

  function archiveSlotLabel(key) {
    var meta = archiveDirectiveMeta(key);
    return meta ? meta.label : "Set Signal";
  }

  function archiveSequenceShort(sequence) {
    var out = normalizedArchiveSequence(sequence).map(function mapDirective(key) {
      var meta = archiveDirectiveMeta(key);
      return meta ? meta.short : "-";
    });
    return out.join(" ");
  }

  function archiveSequenceLabels(sequence) {
    return normalizedArchiveSequence(sequence).map(function mapDirective(key) {
      var meta = archiveDirectiveMeta(key);
      return meta ? meta.label : "Unset";
    });
  }

  function archiveSequenceReadable(sequence) {
    return archiveSequenceLabels(sequence).join(" -> ");
  }

  function archiveStatusLabel(archive) {
    return asText(archive && archive.status).toUpperCase() || "UNKNOWN";
  }

  function archiveIsLive(archive) {
    return asText(archive && archive.status).toLowerCase() === "live";
  }

  function archiveFaction(archive) {
    return asText(archive && archive.playerFaction)
      || asText(archive && archive.factionProgress && archive.factionProgress.faction)
      || "UNBOUND";
  }

  function archiveFactionLabel(raw) {
    var key = asText(raw).toLowerCase();
    if (!key || key === "unbound") return "UNBOUND";
    if (key === "rb" || key === "rogue_byte") return "Rogue Byte";
    if (key === "ew" || key === "echo_wardens") return "Echo Wardens";
    if (key === "ih" || key === "inner_howl" || key === "inner_howlers") return "Inner Howlers";
    if (key === "pb" || key === "pack_burners") return "Pack Burners";
    return asText(raw) || "UNBOUND";
  }

  function archiveBestSummary(archive) {
    var best = archive && archive.ownFactionBest && typeof archive.ownFactionBest === "object"
      ? archive.ownFactionBest
      : archive && archive.factionProgress && typeof archive.factionProgress === "object"
        ? archive.factionProgress
        : {};
    return archiveScoreSummary(best.hits, best.missed);
  }

  function archiveAttemptCount(archive) {
    var progress = archive && archive.factionProgress && typeof archive.factionProgress === "object"
      ? archive.factionProgress
      : {};
    var recent = archive && Array.isArray(archive.recentFactionAttempts) ? archive.recentFactionAttempts : [];
    return parseInt(progress.attempts, 10) || recent.length || 0;
  }

  function archiveBreached(archive) {
    if (!archive || typeof archive !== "object") return false;
    if (archive.breached === true) return true;
    return !!(archive.factionProgress && archive.factionProgress.breached);
  }

  function archiveNodeLabel(archive) {
    var raw = asText(archive && (archive.nodeLabel || archive.nodeName || archive.nodeId));
    if (!raw) return "Archive Node";
    return raw.indexOf("_") >= 0
      ? raw.replaceAll("_", " ").replace(/\b\w/g, function upper(m) { return m.toUpperCase(); })
      : raw;
  }

  function archiveActiveDateLabel(archive) {
    return asText(archive && archive.activeDate) || "--";
  }

  function archiveBreachLine(archive) {
    if (!archiveBreached(archive)) return "";
    var label = asText(archive && archive.breachedByLabel) || "Pack Member";
    var when = formatArchiveTimestamp(archive && archive.breachedAt);
    return when ? (label + " \u00b7 " + when) : label;
  }

  function archiveCelebrationKey(archive) {
    if (!archive || typeof archive !== "object") return "";
    return [
      asText(archive && archive.campaignKey),
      asText(archive && archive.activeDate),
      asText(archiveFaction(archive))
    ].filter(Boolean).join(":");
  }

  function formatArchiveTimestamp(raw) {
    var num = parseInt(raw, 10);
    if (!num) return "";
    try {
      return new Date(num * 1000).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "";
    }
  }

  function archiveErrorText(reason) {
    var code = asText(reason).toUpperCase();
    if (code === "INVALID_SEQUENCE") return "Build a full 4-slot directive chain first.";
    if (code === "NO_FACTION") return "Choose a faction before entering the Archive.";
    if (code === "NO_ARCHIVE_KEY") return "No Archive Keys left. Patrol or Donate at Phantom Nodes to gain more.";
    if (code === "ARCHIVE_NOT_LIVE") return "Burned Archive is dark right now.";
    if (code === "ALREADY_BREACHED") return "Your faction already breached this Archive today.";
    if (code) return code.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, function upper(m) { return m.toUpperCase(); }) + ".";
    return "Archive signal failed to update.";
  }

  function archiveScoreSummary(hits, missed) {
    var safeHits = parseInt(hits, 10) || 0;
    var safeMissed = parseInt(missed, 10) || 0;
    return safeHits + " Perfect Slot" + (safeHits === 1 ? "" : "s") + " / "
      + safeMissed + " Close Signal" + (safeMissed === 1 ? "" : "s");
  }

  function archiveBestAttempt(archive) {
    var best = archive && archive.ownFactionBest && typeof archive.ownFactionBest === "object"
      ? archive.ownFactionBest
      : null;
    if (!best) return null;
    return {
      hits: parseInt(best.hits, 10) || 0,
      missed: parseInt(best.missed, 10) || 0
    };
  }

  function archiveAttemptMatchesBest(row, archive) {
    var best = archiveBestAttempt(archive);
    if (!best) return false;
    return (parseInt(row && row.hits, 10) || 0) === best.hits
      && (parseInt(row && row.missed, 10) || 0) === best.missed
      && (best.hits > 0 || best.missed > 0);
  }

  function archiveNumberOrNull(value) {
    if (value == null || value === "") return null;
    var num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }

  function archiveKeysLeft(archive) {
    return archiveNumberOrNull(archive && archive.archiveKeysLeft);
  }

  function archiveKeysEarnedToday(archive) {
    return archiveNumberOrNull(archive && archive.archiveKeysEarnedToday);
  }

  function archiveKeysSpentToday(archive) {
    return archiveNumberOrNull(archive && archive.archiveKeysSpentToday);
  }

  function archiveHasNoKeys(archive) {
    var left = archiveKeysLeft(archive);
    return left != null && left <= 0;
  }

  function archiveKeyHintHtml(archive) {
    if (!archiveHasNoKeys(archive)) return "";
    return "<div class=\"campaign-archive-feedback is-info\">No Archive Keys left. Patrol or Donate at Phantom Nodes to gain more.</div>";
  }

  function archiveFeedbackHtml() {
    var feedback = STATE.archiveFeedback && typeof STATE.archiveFeedback === "object" ? STATE.archiveFeedback : null;
    if (!feedback || !feedback.text) return "";
    if (feedback.mode === "attempt_result") {
      return ""
        + "<div class=\"campaign-archive-result-card\" data-archive-report-anchor>"
        + "  <div class=\"campaign-archive-result-kicker\">Attempt Logged</div>"
        + "  <div class=\"campaign-archive-result-title\">Your attempt</div>"
        + "  <div class=\"campaign-archive-result-seq\">" + esc(archiveSequenceReadable(feedback.sequence || [])) + "</div>"
        + "  <div class=\"campaign-archive-result-score\">Result: " + esc(archiveScoreSummary(feedback.hits, feedback.missed)) + "</div>"
        + "  <div class=\"campaign-archive-result-note\">The Archive does not reveal which slot was correct.</div>"
        + "  <button type=\"button\" class=\"campaign-archive-inline-cta\" data-archive-cta=\"view_log\">View Recent Attempts</button>"
        + "</div>";
    }
    return "<div class=\"campaign-archive-feedback is-" + esc(feedback.kind || "info") + "\">" + esc(feedback.text) + "</div>";
  }

  function archiveSubmitDisabled(archive) {
    return !archive
      || !archiveFaction(archive)
      || archiveFaction(archive) === "UNBOUND"
      || !archiveIsLive(archive)
      || archiveBreached(archive)
      || archiveHasNoKeys(archive)
      || !archiveDraftReady(STATE.archiveDraft)
      || !!STATE.busyAction;
  }

  function archivePrimaryCtaState(archive) {
    var best = archiveBestAttempt(archive) || { hits: 0, missed: 0 };
    var hasAttemptResult = !!(STATE.archiveFeedback && STATE.archiveFeedback.mode === "attempt_result");
    var readyToSubmit = !archiveSubmitDisabled(archive);

    if (archiveBreached(archive)) {
      return {
        title: "Archive Report Ready",
        detail: "Your faction already confirmed the breach. Review the latest archive result below.",
        label: "Read Archive Report",
        action: "read_report",
        disabled: false
      };
    }
    if (hasAttemptResult) {
      return {
        title: "Attempt Logged",
        detail: "Use Recent Attempts to compare results before your faction spends the next key.",
        label: "View Recent Attempts",
        action: "view_log",
        disabled: false
      };
    }
    if (archiveHasNoKeys(archive)) {
      return {
        title: "Earn Another Archive Key",
        detail: "Archive Keys come from Phantom Node front actions. 1 key = 1 Burned Archive attempt.",
        label: "Earn Archive Key",
        action: "earn_key",
        disabled: false
      };
    }
    if (best.hits >= 3) {
      return {
        title: "One Move From Breach",
        detail: readyToSubmit
          ? "Your faction has already reached 3 Perfect Slots. One correct test confirms the breach."
          : "Your faction has already reached 3 Perfect Slots. Set all 4 signals, then test the next sequence.",
        label: "Test Signal",
        action: "submit",
        disabled: !readyToSubmit
      };
    }
    return {
      title: "Ready to Test",
      detail: readyToSubmit
        ? "Spend 1 Archive Key to test one 4-signal sequence."
        : "Set all 4 signals, then spend 1 Archive Key to test that sequence.",
      label: "Test Signal",
      action: "submit",
      disabled: !readyToSubmit
    };
  }

  function renderArchivePrimaryCta(archive) {
    var state = archivePrimaryCtaState(archive);
    var actionHint = archiveBreached(archive)
      ? ""
      : "Uses Archive Key. Adds Archive Progress, not War Contribution.";
    return ""
      + "<div class=\"campaign-archive-action\">"
      + "  <div class=\"campaign-archive-action-title\">" + esc(state.title) + "</div>"
      + "  <div class=\"campaign-archive-action-copy\">" + esc(state.detail) + "</div>"
      + (actionHint ? "  <div class=\"campaign-archive-action-hint\">" + esc(actionHint) + "</div>" : "")
      + "  <button type=\"button\" class=\"campaign-archive-submit\" data-archive-submit data-archive-action=\"" + esc(state.action) + "\""
      + (state.disabled ? " disabled" : "")
      + ">"
      +      esc(STATE.busyAction === "submit_archive_attempt" ? "Testing Signal..." : state.label)
      + "  </button>"
      + "</div>";
  }

  function renderArchiveBreachedState(archive) {
    if (!archiveBreached(archive)) return "";
    return ""
      + "<div class=\"campaign-archive-breached-card\">"
      + "  <div class=\"campaign-archive-breached-kicker\">Archive Breached</div>"
      + "  <div class=\"campaign-archive-breached-title\">ARCHIVE BREACHED</div>"
      + "  <div class=\"campaign-archive-breached-copy\">RELAY-7 confirmed this faction breach.</div>"
      + "  <div class=\"campaign-archive-breached-copy\">The Archive report is sealed in the Campaign record.</div>"
      + "  <div class=\"campaign-archive-breached-reward\">No direct economy boost.</div>"
      + "  <div class=\"campaign-archive-breached-copy\">This breach grants recognition, Oracle report, Campaign record and future SITREP spotlight.</div>"
      + "  <div class=\"campaign-archive-breached-copy\">The cracker is recorded in the Archive report.</div>"
      + "</div>";
  }

  function renderArchiveReportModal() {
    var archive = archiveState();
    if (!STATE.archiveReportOpen || !archiveBreached(archive)) return "";

    var faction = archiveFactionLabel(archiveFaction(archive));
    var cracker = asText(archive && archive.breachedByLabel) || "Recorded by RELAY-7";
    var attempts = archiveAttemptCount(archive);
    var attemptsLabel = attempts > 0 ? String(attempts) : "Not recorded";

    return ""
      + "<div class=\"campaign-archive-report-backdrop\" data-archive-report-close>"
      + "  <div class=\"campaign-archive-report\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Archive Report\">"
      + "    <button type=\"button\" class=\"campaign-archive-report-close\" data-archive-report-close aria-label=\"Close archive report\">x</button>"
      + "    <div class=\"campaign-archive-report-emblem\">"
      + "      <img src=\"" + ARCHIVE_EMBLEM_URL + "\" alt=\"\" aria-hidden=\"true\" loading=\"lazy\" onerror=\"this.parentNode.remove();\">"
      + "    </div>"
      + "    <div class=\"campaign-archive-report-kicker\">Archive Report</div>"
      + "    <div class=\"campaign-archive-report-title\">ARCHIVE REPORT</div>"
      + "    <div class=\"campaign-archive-report-grid\">"
      + "      <div class=\"campaign-archive-report-row\"><span>Status</span><strong>Breach Confirmed</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Faction</span><strong>" + esc(faction || "Faction record sealed") + "</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Cracker</span><strong>" + esc(cracker) + "</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Final Result</span><strong>4 Perfect Slots</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Attempts</span><strong>" + esc(attemptsLabel) + "</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Oracle</span><strong>RELAY-7 confirmed the Archive breach.</strong></div>"
      + "      <div class=\"campaign-archive-report-row\"><span>Reward</span><strong>Recognition only. No direct economy boost.</strong></div>"
      + "    </div>"
      + "  </div>"
      + "</div>";
  }

  function renderArchiveCelebrationModal() {
    var celebration = STATE.archiveCelebration && typeof STATE.archiveCelebration === "object"
      ? STATE.archiveCelebration
      : null;
    if (!celebration || !celebration.open) return "";

    return ""
      + "<div class=\"campaign-archive-celebration-backdrop\">"
      + "  <div class=\"campaign-archive-celebration\">"
      + "    <button type=\"button\" class=\"campaign-archive-celebration-close\" data-archive-celebration-close aria-label=\"Close breach confirmation\">x</button>"
      + "    <div class=\"campaign-archive-celebration-emblem\">"
      + "      <img src=\"" + ARCHIVE_EMBLEM_URL + "\" alt=\"\" aria-hidden=\"true\" loading=\"lazy\" onerror=\"this.parentNode.remove();\">"
      + "    </div>"
      + "    <div class=\"campaign-archive-celebration-kicker\">Breach Confirmed</div>"
      + "    <div class=\"campaign-archive-celebration-title\">BREACH CONFIRMED</div>"
      + "    <div class=\"campaign-archive-celebration-copy\">RELAY-7 confirmed the Archive breach.</div>"
      + "    <div class=\"campaign-archive-celebration-copy\">You cracked the Burned Archive for " + esc(celebration.factionName || "your faction") + ".</div>"
      + "    <div class=\"campaign-archive-celebration-copy\">Your name is now recorded in the Archive report.</div>"
      + "    <div class=\"campaign-archive-celebration-score\">"
      + "      <strong>" + esc(String(celebration.hits || 4)) + " Perfect Slots</strong>"
      + "      <span>" + esc(String(celebration.missed || 0)) + " Close Signals</span>"
      + "    </div>"
      + "    <button type=\"button\" class=\"campaign-archive-celebration-cta\" data-archive-celebration-report>Read Archive Report</button>"
      + "  </div>"
      + "</div>";
  }

  function openArchiveReport() {
    var archive = archiveState();
    if (!archiveBreached(archive)) return false;
    STATE.archiveReportOpen = true;
    render();
    return true;
  }

  function closeArchiveReport() {
    STATE.archiveReportOpen = false;
    render();
  }

  function renderArchiveKeyHint() {
    return ""
      + "<details class=\"campaign-archive-inlinehint\">"
      + "  <summary class=\"campaign-archive-hintbtn\" aria-label=\"Archive Key help\">?</summary>"
      + "  <div class=\"campaign-archive-hintcard\">"
      + "    <p>Archive Keys let you test the Burned Archive signal.</p>"
      + "    <p>1 key = 1 attempt.</p>"
      + "    <p>Gain keys from Phantom Node Patrol / Donate.</p>"
      + "    <p>Daily gained key limit: 3.</p>"
      + "    <p>Existing keys can still be spent.</p>"
      + "  </div>"
      + "</details>";
  }

  function renderArchiveRulesHint() {
    return ""
      + "<details class=\"campaign-archive-rules\">"
      + "  <summary class=\"campaign-archive-rules-summary\">"
      + "    <span class=\"campaign-archive-rules-title\">BURNED ARCHIVE RULES ?</span>"
      + "    <span class=\"campaign-archive-rules-sub\">Crack a 4-signal faction code.</span>"
      + "  </summary>"
      + "  <div class=\"campaign-archive-rules-body\">"
      + "    <p>Spend 1 Archive Key to test one sequence.</p>"
      + "    <p>Perfect Slot = correct signal + correct position.</p>"
      + "    <p>Close Signal = correct signal, wrong position.</p>"
      + "    <p>Archive does not reveal which slot was correct.</p>"
      + "    <p>Use Recent Attempts to deduce the next move.</p>"
      + "    <p>Reach 4 Perfect Slots to breach.</p>"
      + "  </div>"
      + "</details>";
  }

  function openArchiveCelebration(archive, result) {
    var safeArchive = archive && typeof archive === "object" ? archive : null;
    var key = archiveCelebrationKey(safeArchive);
    if (!safeArchive || !archiveBreached(safeArchive) || !key || STATE.archiveCelebrationSeenKey === key) {
      return false;
    }

    STATE.archiveCelebration = {
      key: key,
      open: true,
      factionName: archiveFactionLabel(archiveFaction(safeArchive)),
      hits: Math.max(4, parseInt(result && result.hits, 10) || 4),
      missed: parseInt(result && result.missed, 10) || 0
    };
    return true;
  }

  function closeArchiveCelebration() {
    var celebration = STATE.archiveCelebration && typeof STATE.archiveCelebration === "object"
      ? STATE.archiveCelebration
      : null;
    if (celebration && celebration.key) {
      STATE.archiveCelebrationSeenKey = celebration.key;
    }
    STATE.archiveCelebration = null;
    render();
  }

  function renderArchiveRecentAttempts(archive) {
    var attempts = archive && Array.isArray(archive.recentFactionAttempts) ? archive.recentFactionAttempts : [];
    if (!attempts.length) {
      return "<div class=\"campaign-archive-empty\">No faction attempts logged yet. Your faction's tested sequences will appear here.</div>";
    }
    return attempts.map(function buildAttemptRow(item) {
      var row = item && typeof item === "object" ? item : {};
      var label = asText(row.byLabel) || "Pack Member";
      var seq = archiveSequenceReadable(row.sequence || []);
      var hits = parseInt(row.hits, 10) || 0;
      var missed = parseInt(row.missed, 10) || 0;
      var createdAt = formatArchiveTimestamp(row.createdAt);
      var bestBadge = archiveAttemptMatchesBest(row, archive)
        ? "<span class=\"campaign-archive-best\">Best</span>"
        : "";
      return ""
        + "<div class=\"campaign-archive-log-row\">"
        + "  <div class=\"campaign-archive-log-top\">"
        + "    <span class=\"campaign-archive-log-label\">" + esc(label) + "</span>"
        +      bestBadge
        + "    <span class=\"campaign-archive-log-time\">" + esc(createdAt || "Recent") + "</span>"
        + "  </div>"
        + "  <div class=\"campaign-archive-log-seq\">" + esc(seq) + "</div>"
        + "  <div class=\"campaign-archive-log-score\">" + esc(archiveScoreSummary(hits, missed)) + "</div>"
        + "</div>";
    }).join("");
  }

  function renderArchiveSlots(archive) {
    return normalizedArchiveSequence(STATE.archiveDraft).map(function buildSlot(key, idx) {
      var meta = archiveDirectiveMeta(key);
      return ""
        + "<button type=\"button\" class=\"campaign-archive-slot" + (meta ? " is-set" : "") + "\""
        + " data-archive-slot=\"" + idx + "\""
        + (archiveSubmitDisabled(archive) && !archiveIsLive(archive) ? " disabled" : "")
        + (STATE.busyAction ? " disabled" : "")
        + ">"
        + "  <span class=\"campaign-archive-slot-no\">SLOT " + (idx + 1) + "</span>"
        + "  <span class=\"campaign-archive-slot-val\">" + esc(archiveSlotLabel(key)) + "</span>"
        + "</button>";
    }).join("");
  }

  function renderArchivePanel() {
    var archive = archiveState();
    if (!archive) return "";

    var faction = archiveFactionLabel(archiveFaction(archive));
    var attempts = archiveAttemptCount(archive);
    var breachLine = archiveBreachLine(archive);
    var breached = archiveBreached(archive);
    var keysLeft = archiveKeysLeft(archive);
    var earnedToday = archiveKeysEarnedToday(archive);
    var spentToday = archiveKeysSpentToday(archive);

    return ""
      + "<div class=\"campaign-archive\">"
      + "  <div class=\"campaign-archive-head\">"
      + "    <div class=\"campaign-archive-headcopy\">"
      + "      <div class=\"campaign-archive-emblem\">"
      + "        <img src=\"" + ARCHIVE_EMBLEM_URL + "\" alt=\"\" aria-hidden=\"true\" loading=\"lazy\" onerror=\"this.parentNode.remove();\">"
      + "      </div>"
      + "      <div class=\"campaign-archive-heading\">"
        + "        <div class=\"campaign-archive-kicker\">Archive Progress</div>"
      + "        <div class=\"campaign-archive-title\">" + esc(archiveNodeLabel(archive)) + "</div>"
      + "      </div>"
      + "    </div>"
      + "    <div class=\"campaign-archive-status" + (archiveIsLive(archive) ? " is-live" : " is-offline") + "\">" + esc(archiveStatusLabel(archive)) + "</div>"
      + "  </div>"
      + "  <div class=\"campaign-archive-grid\">"
      + "    <div class=\"campaign-archive-meta\"><span>Active</span><strong>" + esc(archiveActiveDateLabel(archive)) + "</strong></div>"
      + "    <div class=\"campaign-archive-meta\"><span>Faction</span><strong>" + esc(faction) + "</strong></div>"
      + "    <div class=\"campaign-archive-meta\"><span>Best</span><strong>" + esc(archiveBestSummary(archive)) + "</strong></div>"
      + "    <div class=\"campaign-archive-meta\"><span>Attempts</span><strong>" + attempts + "</strong></div>"
      + "  </div>"
      + "  <div class=\"campaign-archive-keys\">"
      + "    <div class=\"campaign-archive-keyline\"><span class=\"campaign-archive-keylabel\">Archive Keys " + renderArchiveKeyHint() + "</span><strong class=\"campaign-archive-keyvalue\"><img class=\"campaign-archive-keyicon\" src=\"" + ARCHIVE_KEY_ICON_URL + "\" alt=\"\" aria-hidden=\"true\" loading=\"lazy\" onerror=\"this.remove();\"><span>" + esc(keysLeft == null ? "--" : String(keysLeft)) + "</span></strong></div>"
      + "    <div class=\"campaign-archive-keyline\"><span class=\"campaign-archive-keylabel\">Earned Today: " + esc(earnedToday == null ? "--/3" : (String(earnedToday) + "/3")) + " " + renderArchiveKeyHint() + "</span></div>"
      + "    <div class=\"campaign-archive-explain\">Archive Progress comes from faction attempts at Burned Archive.</div>"
      + "    <div class=\"campaign-archive-keyline\"><span>Spent today</span><strong>" + esc(spentToday == null ? "--" : String(spentToday)) + "</strong></div>"
      + "  </div>"
      +      renderArchiveRulesHint()
      + "  <div class=\"campaign-archive-tip\">Tap each slot to cycle through Trace, Secure, Red, and Watch.</div>"
      + "  <div class=\"campaign-archive-slots\">" + renderArchiveSlots(archive) + "</div>"
      +      renderArchivePrimaryCta(archive)
      +      archiveKeyHintHtml(archive)
      +      archiveFeedbackHtml()
      + "  <div class=\"campaign-archive-breach" + (breached ? " is-live" : "") + "\" data-archive-report-anchor>"
      + "    <span>Archive Report</span><strong>" + (breached ? "BREACH CONFIRMED" : "BREACH SEALED") + "</strong>"
      + (breachLine ? "<em>" + esc(breachLine) + "</em>" : "")
      + "  </div>"
      +      renderArchiveBreachedState(archive)
      + "  <div class=\"campaign-archive-log-head\">Recent Attempts</div>"
      + "  <div class=\"campaign-archive-log-sub\">Archive Progress is faction-wide. Read the tested sequence, then compare Perfect Slots and Close Signals.</div>"
      + "  <div class=\"campaign-archive-log\" data-archive-log-anchor>" + renderArchiveRecentAttempts(archive) + "</div>"
      + "</div>";
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
      + ".campaign-archive{margin-top:16px;padding:14px;border-radius:18px;border:1px solid rgba(142,227,255,.16);"
      + "background:linear-gradient(180deg, rgba(9,21,33,.92), rgba(5,12,20,.94));box-shadow:inset 0 0 0 1px rgba(117,203,255,.05);}"
      + ".campaign-archive-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}"
      + ".campaign-archive-headcopy{display:flex;align-items:center;gap:11px;min-width:0;flex:1;}"
      + ".campaign-archive-heading{min-width:0;}"
      + ".campaign-archive-emblem{width:48px;height:48px;flex:0 0 48px;border-radius:14px;overflow:hidden;border:1px solid rgba(145,226,255,.16);background:radial-gradient(circle at 50% 40%, rgba(143,222,255,.20), rgba(11,22,35,.78));box-shadow:0 10px 22px rgba(0,0,0,.24);}"
      + ".campaign-archive-emblem img{display:block;width:100%;height:100%;object-fit:cover;}"
      + ".campaign-archive-kicker{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(159,222,255,.68);}"
      + ".campaign-archive-title{margin-top:5px;font-size:16px;font-weight:900;letter-spacing:.03em;color:#eef8ff;}"
      + ".campaign-archive-status{padding:6px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.10);font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(226,237,247,.74);background:rgba(255,255,255,.04);}"
      + ".campaign-archive-status.is-live{border-color:rgba(123,231,175,.24);color:rgba(191,255,222,.88);background:rgba(31,96,69,.24);}"
      + ".campaign-archive-status.is-offline{border-color:rgba(255,155,155,.18);color:rgba(255,215,215,.86);background:rgba(111,39,39,.18);}"
      + ".campaign-archive-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}"
      + ".campaign-archive-meta{padding:10px 11px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);}"
      + ".campaign-archive-meta span{display:block;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(153,210,244,.62);}"
      + ".campaign-archive-meta strong{display:block;margin-top:6px;font-size:13px;font-weight:900;color:#edf7ff;}"
      + ".campaign-archive-keys{display:grid;gap:7px;margin-top:12px;padding:11px 12px;border-radius:14px;border:1px solid rgba(145,226,255,.10);background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02));}"
      + ".campaign-archive-keyline{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;line-height:1.35;color:rgba(214,231,247,.84);}"
      + ".campaign-archive-keyline span{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(153,210,244,.62);}"
      + ".campaign-archive-keyline strong{font-size:13px;font-weight:900;color:#edf7ff;}"
      + ".campaign-archive-keylabel{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;}"
      + ".campaign-archive-keyvalue{display:inline-flex;align-items:center;gap:8px;}"
      + ".campaign-archive-keyvalue span{font-size:13px;font-weight:900;letter-spacing:0;color:#edf7ff;text-transform:none;}"
      + ".campaign-archive-keyicon{width:18px;height:18px;display:block;object-fit:contain;filter:drop-shadow(0 0 10px rgba(124,208,255,.32));}"
      + ".campaign-archive-inlinehint{position:relative;display:inline-block;}"
      + ".campaign-archive-inlinehint summary{list-style:none;}"
      + ".campaign-archive-inlinehint summary::-webkit-details-marker{display:none;}"
      + ".campaign-archive-hintbtn{display:grid;place-items:center;width:18px;height:18px;border-radius:999px;border:1px solid rgba(145,226,255,.20);background:rgba(255,255,255,.05);color:rgba(226,241,255,.92);font-size:11px;font-weight:900;cursor:pointer;}"
      + ".campaign-archive-hintcard{margin-top:8px;padding:10px 11px;border-radius:12px;border:1px solid rgba(145,226,255,.14);background:rgba(11,21,33,.96);font-size:12px;line-height:1.42;color:rgba(229,239,249,.88);text-transform:none;letter-spacing:0;min-width:220px;}"
      + ".campaign-archive-hintcard p{margin:0;}"
      + ".campaign-archive-hintcard p + p{margin-top:6px;}"
      + ".campaign-archive-explain{margin-top:-1px;font-size:11px;line-height:1.4;color:rgba(214,232,246,.74);text-transform:none;letter-spacing:0;}"
      + ".campaign-archive-rules{margin-top:12px;border-radius:14px;border:1px solid rgba(145,226,255,.10);background:rgba(255,255,255,.03);overflow:hidden;}"
      + ".campaign-archive-rules summary{list-style:none;cursor:pointer;}"
      + ".campaign-archive-rules summary::-webkit-details-marker{display:none;}"
      + ".campaign-archive-rules-summary{display:flex;flex-direction:column;gap:5px;padding:12px;}"
      + ".campaign-archive-rules-title{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(159,222,255,.76);}"
      + ".campaign-archive-rules-sub{font-size:12px;line-height:1.4;color:rgba(226,239,250,.88);text-transform:none;letter-spacing:0;}"
      + ".campaign-archive-rules-body{padding:0 12px 12px;}"
      + ".campaign-archive-rules-body p{margin:0;font-size:12px;line-height:1.45;color:rgba(229,239,249,.88);}"
      + ".campaign-archive-rules-body p + p{margin-top:7px;}"
      + ".campaign-archive-tip{margin-top:8px;font-size:11px;line-height:1.35;color:rgba(188,207,222,.68);}"
      + ".campaign-archive-slots{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}"
      + ".campaign-archive-slot{appearance:none;padding:11px 10px;border-radius:14px;border:1px solid rgba(144,226,255,.16);background:linear-gradient(180deg, rgba(24,44,61,.60), rgba(9,18,29,.82));color:#eaf7ff;cursor:pointer;text-align:left;}"
      + ".campaign-archive-slot.is-set{border-color:rgba(123,223,255,.28);box-shadow:inset 0 0 0 1px rgba(145,226,255,.07);}"
      + ".campaign-archive-slot[disabled]{opacity:.64;cursor:default;}"
      + ".campaign-archive-slot-no{display:block;font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(153,210,244,.62);}"
      + ".campaign-archive-slot-val{display:block;margin-top:6px;font-size:14px;font-weight:900;letter-spacing:.06em;}"
      + ".campaign-archive-action{margin-top:12px;padding:12px;border-radius:14px;border:1px solid rgba(145,226,255,.12);background:linear-gradient(180deg, rgba(38,72,98,.22), rgba(10,20,31,.34));}"
      + ".campaign-archive-action-title{font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(203,238,255,.92);}"
      + ".campaign-archive-action-copy{margin-top:6px;font-size:12px;line-height:1.42;color:rgba(217,232,246,.82);}"
      + ".campaign-archive-action-hint{margin-top:7px;font-size:12px;line-height:1.38;color:rgba(182,232,255,.82);}"
      + ".campaign-archive-submit{appearance:none;width:100%;margin-top:12px;padding:13px 14px;border-radius:14px;border:1px solid rgba(145,226,255,.24);background:linear-gradient(180deg, rgba(57,122,167,.50), rgba(21,50,73,.84));color:#f3f9ff;font-weight:900;letter-spacing:.03em;cursor:pointer;}"
      + ".campaign-archive-submit[disabled]{opacity:.58;cursor:default;}"
      + ".campaign-archive-feedback{margin-top:10px;padding:10px 11px;border-radius:14px;font-size:12px;line-height:1.38;border:1px solid rgba(255,255,255,.10);}"
      + ".campaign-archive-feedback.is-success{background:rgba(34,92,66,.26);border-color:rgba(131,231,183,.18);color:rgba(213,255,235,.92);}"
      + ".campaign-archive-feedback.is-error{background:rgba(112,36,36,.20);border-color:rgba(255,135,135,.18);color:rgba(255,226,226,.92);}"
      + ".campaign-archive-feedback.is-info{background:rgba(255,255,255,.04);color:rgba(229,239,249,.88);}"
      + ".campaign-archive-result-card{margin-top:10px;padding:12px;border-radius:14px;border:1px solid rgba(123,223,255,.20);background:linear-gradient(180deg, rgba(33,76,106,.24), rgba(9,19,31,.56));}"
      + ".campaign-archive-result-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(159,222,255,.72);}"
      + ".campaign-archive-result-title{margin-top:6px;font-size:16px;font-weight:900;color:#eef8ff;}"
      + ".campaign-archive-result-seq{margin-top:8px;font-size:13px;line-height:1.42;color:rgba(229,240,250,.90);word-break:break-word;}"
      + ".campaign-archive-result-score{margin-top:8px;font-size:13px;font-weight:900;color:rgba(220,247,255,.94);}"
      + ".campaign-archive-result-note{margin-top:8px;font-size:12px;line-height:1.4;color:rgba(210,227,243,.78);}"
      + ".campaign-archive-inline-cta{appearance:none;margin-top:10px;padding:11px 12px;border-radius:12px;border:1px solid rgba(145,226,255,.20);background:rgba(255,255,255,.05);color:#f2f8ff;font-weight:900;cursor:pointer;}"
      + ".campaign-archive-breach{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);}"
      + ".campaign-archive-breach span{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(153,210,244,.62);}"
      + ".campaign-archive-breach strong{font-size:13px;font-weight:900;color:rgba(235,244,252,.88);}"
      + ".campaign-archive-breach.is-live strong{color:rgba(198,255,225,.94);}"
      + ".campaign-archive-breach em{font-style:normal;font-size:12px;color:rgba(205,224,239,.76);}"
      + ".campaign-archive-breached-card{margin-top:10px;padding:12px;border-radius:14px;border:1px solid rgba(145,226,255,.14);background:linear-gradient(180deg, rgba(28,63,88,.22), rgba(8,17,28,.48));box-shadow:inset 0 0 0 1px rgba(145,226,255,.05);}"
      + ".campaign-archive-breached-kicker{font-size:10px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:rgba(159,222,255,.74);}"
      + ".campaign-archive-breached-title{margin-top:6px;font-size:16px;font-weight:900;letter-spacing:.05em;color:#eef8ff;}"
      + ".campaign-archive-breached-copy{margin-top:7px;font-size:12px;line-height:1.45;color:rgba(224,237,248,.86);}"
      + ".campaign-archive-breached-reward{margin-top:9px;font-size:12px;font-weight:900;color:rgba(220,247,255,.94);}"
      + ".campaign-archive-report-backdrop{position:fixed;inset:0;z-index:1500002;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at top, rgba(81,166,214,.16), transparent 28%), rgba(2,6,12,.78);backdrop-filter:blur(6px);}"
      + ".campaign-archive-report{position:relative;width:min(420px,92vw);padding:18px 16px 16px;border-radius:22px;border:1px solid rgba(145,226,255,.18);background:linear-gradient(180deg, rgba(8,18,29,.98), rgba(4,10,18,.98));box-shadow:0 26px 80px rgba(0,0,0,.58), inset 0 0 0 1px rgba(145,226,255,.05);overflow:hidden;}"
      + ".campaign-archive-report::before{content:'';position:absolute;inset:-18% -10% auto -10%;height:128px;background:radial-gradient(circle at 50% 50%, rgba(115,212,255,.14), transparent 60%);pointer-events:none;}"
      + ".campaign-archive-report::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(180deg, transparent 0 8px, rgba(121,212,255,.03) 8px 9px, transparent 9px 17px);opacity:.4;pointer-events:none;mix-blend-mode:screen;}"
      + ".campaign-archive-report-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);color:#f2f8ff;cursor:pointer;font-size:18px;z-index:1;}"
      + ".campaign-archive-report-emblem{position:relative;width:64px;height:64px;margin:0 auto 12px;border-radius:18px;overflow:hidden;border:1px solid rgba(145,226,255,.18);background:radial-gradient(circle at 50% 40%, rgba(143,222,255,.20), rgba(11,22,35,.78));box-shadow:0 14px 34px rgba(0,0,0,.34);z-index:1;}"
      + ".campaign-archive-report-emblem img{display:block;width:100%;height:100%;object-fit:cover;}"
      + ".campaign-archive-report-kicker{position:relative;z-index:1;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(159,222,255,.76);text-align:center;}"
      + ".campaign-archive-report-title{position:relative;z-index:1;margin-top:8px;font-size:22px;font-weight:900;letter-spacing:.08em;color:#f4fbff;text-align:center;}"
      + ".campaign-archive-report-grid{position:relative;z-index:1;display:grid;gap:8px;margin-top:14px;}"
      + ".campaign-archive-report-row{display:grid;gap:5px;padding:10px 11px;border-radius:14px;border:1px solid rgba(145,226,255,.10);background:rgba(255,255,255,.04);}"
      + ".campaign-archive-report-row span{font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:rgba(159,222,255,.70);}"
      + ".campaign-archive-report-row strong{font-size:13px;line-height:1.42;color:rgba(234,244,252,.92);}"
      + ".campaign-archive-celebration-backdrop{position:fixed;inset:0;z-index:1500002;display:flex;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at top, rgba(81,166,214,.18), transparent 28%), rgba(2,6,12,.78);backdrop-filter:blur(6px);}"
      + ".campaign-archive-celebration{position:relative;width:min(420px,92vw);padding:18px 16px 16px;border-radius:22px;border:1px solid rgba(145,226,255,.18);background:linear-gradient(180deg, rgba(8,18,29,.98), rgba(4,10,18,.98));box-shadow:0 26px 80px rgba(0,0,0,.58), inset 0 0 0 1px rgba(145,226,255,.05);overflow:hidden;}"
      + ".campaign-archive-celebration::before{content:'';position:absolute;inset:-20% -10% auto -10%;height:140px;background:radial-gradient(circle at 50% 50%, rgba(115,212,255,.16), transparent 60%);pointer-events:none;}"
      + ".campaign-archive-celebration::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(180deg, transparent 0 8px, rgba(121,212,255,.035) 8px 9px, transparent 9px 17px);opacity:.45;pointer-events:none;mix-blend-mode:screen;}"
      + ".campaign-archive-celebration-close{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:12px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);color:#f2f8ff;cursor:pointer;font-size:18px;z-index:1;}"
      + ".campaign-archive-celebration-emblem{position:relative;width:68px;height:68px;margin:0 auto 12px;border-radius:18px;overflow:hidden;border:1px solid rgba(145,226,255,.18);background:radial-gradient(circle at 50% 40%, rgba(143,222,255,.20), rgba(11,22,35,.78));box-shadow:0 14px 34px rgba(0,0,0,.34);z-index:1;}"
      + ".campaign-archive-celebration-emblem img{display:block;width:100%;height:100%;object-fit:cover;}"
      + ".campaign-archive-celebration-kicker{position:relative;z-index:1;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(159,222,255,.76);text-align:center;}"
      + ".campaign-archive-celebration-title{position:relative;z-index:1;margin-top:8px;font-size:22px;font-weight:900;letter-spacing:.08em;color:#f4fbff;text-align:center;}"
      + ".campaign-archive-celebration-copy{position:relative;z-index:1;margin-top:8px;font-size:13px;line-height:1.45;color:rgba(227,238,248,.88);text-align:center;}"
      + ".campaign-archive-celebration-score{position:relative;z-index:1;display:grid;gap:4px;margin-top:14px;padding:12px;border-radius:16px;border:1px solid rgba(145,226,255,.14);background:rgba(255,255,255,.04);text-align:center;}"
      + ".campaign-archive-celebration-score strong{font-size:16px;color:#eff9ff;}"
      + ".campaign-archive-celebration-score span{font-size:12px;font-weight:900;color:rgba(205,239,255,.82);}"
      + ".campaign-archive-celebration-cta{position:relative;z-index:1;appearance:none;width:100%;margin-top:14px;padding:13px 14px;border-radius:14px;border:1px solid rgba(145,226,255,.24);background:linear-gradient(180deg, rgba(57,122,167,.50), rgba(21,50,73,.84));color:#f3f9ff;font-weight:900;letter-spacing:.03em;cursor:pointer;}"
      + ".campaign-archive-log-head{margin-top:13px;font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:rgba(159,222,255,.68);}"
      + ".campaign-archive-log-sub{margin-top:6px;font-size:12px;line-height:1.4;color:rgba(205,224,239,.76);}"
      + ".campaign-archive-log{display:grid;gap:7px;margin-top:8px;}"
      + ".campaign-archive-log-row{padding:10px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);font-size:12px;}"
      + ".campaign-archive-log-top{display:flex;flex-wrap:wrap;gap:6px 8px;align-items:center;}"
      + ".campaign-archive-log-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(229,240,250,.92);font-weight:900;}"
      + ".campaign-archive-best{padding:3px 7px;border-radius:999px;border:1px solid rgba(145,226,255,.22);background:rgba(140,223,255,.10);font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:rgba(210,243,255,.92);}"
      + ".campaign-archive-log-time{margin-left:auto;font-size:11px;color:rgba(187,208,226,.72);}"
      + ".campaign-archive-log-seq{margin-top:8px;font-weight:900;line-height:1.4;color:rgba(178,231,255,.86);word-break:break-word;}"
      + ".campaign-archive-log-score{margin-top:7px;font-weight:900;color:rgba(238,246,255,.88);}"
      + ".campaign-archive-empty{padding:8px 2px 2px;font-size:12px;color:rgba(201,220,236,.70);}"
      + ".campaign-last-opened{margin-top:10px;font-size:11px;line-height:1.35;color:rgba(177,216,245,.72);}"
      + ".campaign-foot{margin-top:10px;font-size:11px;line-height:1.35;color:rgba(189,213,235,.62);}"
      + ".campaign-empty{padding:10px 0 2px;font-size:14px;line-height:1.45;color:rgba(230,243,255,.82);}"
      + ".campaign-error{margin-top:10px;padding:10px 12px;border-radius:14px;background:rgba(138,40,40,.20);"
      + "border:1px solid rgba(255,120,120,.18);font-size:12px;color:rgba(255,226,226,.92);}"
      + "@media (max-width:420px){.campaign-archive-grid,.campaign-archive-slots{grid-template-columns:1fr;}.campaign-archive-head{flex-direction:column;}.campaign-archive-log-time{margin-left:0;}.campaign-archive-hintcard{min-width:0;}}";

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
        + (isPrimary ? "    <span class=\"campaign-primary-badge\">Mission Focus</span>" : "")
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
      afterChoiceHtml += "<div class=\"campaign-note\">First Mission Focus locked for RELAY-7 guidance. Burned Archive attempts can still use all four Archive Signals.</div>";
      afterChoiceHtml += "<div class=\"campaign-directive-line\">First Mission Focus: " + esc(meta.label) + "</div>";
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
      + "  <div class=\"campaign-question\">Choose your First Mission Focus.</div>"
      + "  <div class=\"campaign-directives\">" + renderDirectiveChoices(campaign) + "</div>"
      +      afterChoiceHtml
      +      renderArchivePanel()
      + "  <div class=\"campaign-guidance\">"
      + "    <div class=\"campaign-guidance-head\">RELAY-7 Guidance</div>"
      + "    <div class=\"campaign-guidance-lead\">Then don't click blindly. Move with purpose.</div>"
      + "    <div class=\"campaign-guidance-list\">" + renderGuidance(campaign) + "</div>"
      + "    <div class=\"campaign-foot\">Guidance only. These routes open existing systems and do not fake completion or rewards.</div>"
      + "  </div>"
      +      renderArchiveReportModal()
      +      renderArchiveCelebrationModal()
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
      +      renderArchivePanel()
      + "  <div class=\"campaign-foot\">Guidance only. This handoff explains why RELAY-7 is sending you there first.</div>"
      +      renderArchiveReportModal()
      +      renderArchiveCelebrationModal()
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

    [].slice.call(STATE.rootEl.querySelectorAll("[data-archive-slot]")).forEach(function attachSlot(btn) {
      btn.addEventListener("click", function onSlot() {
        var idx = parseInt(btn.getAttribute("data-archive-slot"), 10);
        if (!(idx >= 0 && idx < 4) || STATE.busyAction) return;
        STATE.archiveDraft = normalizedArchiveSequence(STATE.archiveDraft);
        STATE.archiveDraft[idx] = cycleArchiveDirective(STATE.archiveDraft[idx]);
        STATE.archiveFeedback = null;
        render();
      });
    });

    var archiveSubmitBtn = STATE.rootEl.querySelector("[data-archive-submit]");
    if (archiveSubmitBtn) {
      archiveSubmitBtn.addEventListener("click", function onArchiveSubmit() {
        var action = asText(archiveSubmitBtn.getAttribute("data-archive-action")).toLowerCase() || "submit";
        if (action === "submit") {
          void submitArchiveAttempt();
          return;
        }
        if (action === "earn_key") {
          void openArchiveKeySource();
          return;
        }
        if (action === "view_log") {
          scrollArchiveSection("log");
          return;
        }
        if (action === "read_report") {
          openArchiveReport();
        }
      });
    }

    [].slice.call(STATE.rootEl.querySelectorAll("[data-archive-cta]")).forEach(function attachArchiveCta(btn) {
      btn.addEventListener("click", function onArchiveCta() {
        var action = asText(btn.getAttribute("data-archive-cta")).toLowerCase();
        if (action === "view_log") {
          scrollArchiveSection("log");
          return;
        }
        if (action === "read_report") {
          openArchiveReport();
          return;
        }
        if (action === "earn_key") {
          void openArchiveKeySource();
        }
      });
    });

    var archiveCelebrationClose = STATE.rootEl.querySelector("[data-archive-celebration-close]");
    if (archiveCelebrationClose) {
      archiveCelebrationClose.addEventListener("click", function onArchiveCelebrationClose() {
        closeArchiveCelebration();
      });
    }

    var archiveCelebrationReport = STATE.rootEl.querySelector("[data-archive-celebration-report]");
    if (archiveCelebrationReport) {
      archiveCelebrationReport.addEventListener("click", function onArchiveCelebrationReport() {
        closeArchiveCelebration();
        openArchiveReport();
      });
    }

    [].slice.call(STATE.rootEl.querySelectorAll("[data-archive-report-close]")).forEach(function attachArchiveReportClose(btn) {
      btn.addEventListener("click", function onArchiveReportClose(ev) {
        if (ev.target !== btn && btn !== ev.currentTarget) return;
        closeArchiveReport();
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

  async function submitArchiveAttempt() {
    var archive = archiveState();
    if (!archive || STATE.busyAction || archiveSubmitDisabled(archive)) return false;

    STATE.busyAction = "submit_archive_attempt";
    STATE.archiveFeedback = null;
    render();

    try {
      var payload = {
        action: "submit_archive_attempt",
        sequence: normalizedArchiveSequence(STATE.archiveDraft)
      };
      var out = await api("/webapp/campaign/action", payload);

      if (out && out.ok === false) {
        STATE.archiveFeedback = {
          kind: "error",
          text: archiveErrorText(out.reason)
        };
        render();
        return false;
      }

      if (out && typeof out === "object") {
        STATE.payload = out;
        STATE.lastLoadAt = Date.now();
      }
      STATE.archiveFeedback = {
        kind: "success",
        mode: "attempt_result",
        hits: parseInt(out && out.hits, 10) || 0,
        missed: parseInt(out && out.missed, 10) || 0,
        sequence: normalizedArchiveSequence(payload.sequence),
        text: archiveScoreSummary(out && out.hits, out && out.missed)
      };
      updateTile();
      render();
      await loadState({ force: true, reason: "archive_submit" });
      if ((parseInt(out && out.hits, 10) || 0) >= 4 || archiveBreached(archiveState())) {
        openArchiveCelebration(archiveState(), out || {});
      }
      render();
      return true;
    } catch (err) {
      warn("archive submit failed", err);
      STATE.archiveFeedback = {
        kind: "error",
        text: archiveErrorText(err && ((err.data && err.data.reason) || err.reason || err.message))
      };
      render();
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

  async function openArchiveKeySource() {
    try { STATE.tg && STATE.tg.HapticFeedback && STATE.tg.HapticFeedback.impactOccurred("light"); } catch (_) {}
    try {
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
    } catch (err) {
      warn("archive key source open failed", err);
    }

    STATE.briefingNotice = "Open the Map and move to Phantom Nodes. Patrol and Donate can grant Archive Keys.";
    STATE.archiveFeedback = {
      kind: "info",
      text: STATE.briefingNotice
    };
    render();
    try { STATE.tg && STATE.tg.showAlert && STATE.tg.showAlert(STATE.briefingNotice); } catch (_) {}
    return false;
  }

  function scrollArchiveSection(kind) {
    if (!STATE.rootEl) return false;
    var selector = kind === "report" ? "[data-archive-report-anchor]" : "[data-archive-log-anchor]";
    var target = STATE.rootEl.querySelector(selector);
    if (!target || typeof target.scrollIntoView !== "function") return false;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
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
    STATE.archiveFeedback = null;
    STATE.archiveCelebration = null;
    STATE.archiveReportOpen = false;
    STATE.archiveDraft = emptyArchiveDraft();
    if (STATE.backEl) STATE.backEl.style.display = "flex";
    try { global.navOpen && global.navOpen("campaignBack"); } catch (_) {}

    await loadState({ force: !isFreshEnough(), reason: "open" });
    render();
    void markIntroSeenIfNeeded();
    return true;
  }

  function close() {
    if (STATE.archiveCelebration && STATE.archiveCelebration.key) {
      STATE.archiveCelebrationSeenKey = STATE.archiveCelebration.key;
      STATE.archiveCelebration = null;
    }
    if (!STATE.backEl) return;
    STATE.briefingKey = "";
    STATE.briefingNotice = "";
    STATE.archiveReportOpen = false;
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


