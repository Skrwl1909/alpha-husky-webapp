// js/story_delivery.js — Phase 1 Story Continuity Frame (derived; no new backend)
(function (global) {
  "use strict";

  var ONBOARDING_CTA_KINDS = {
    first_mission: true,
    equip_item: true,
    first_map_action: true,
    contracts_push: true,
    choose_faction: true
  };

  var LIVE_CTA_KINDS = {
    tactical_breach: true,
    tactical_recover_replay: true,
    siege_running_defense: true,
    siege_forming_defense: true,
    siege_running_attack: true,
    siege_forming_attack: true,
    bloodmoon_claim_ready: true,
    bloodmoon_live: true,
    fortress_ready: true,
    mission_ready: true,
    contracts_claim_ready: true,
    node_contested: true,
    node_hot: true
  };

  var DIRECTIVE_TARGETS = {
    trace_signal: { type: "missions" },
    secure_node: { type: "map_node", nodeId: "phantom_nodes" },
    red_static: { type: "bloodmoon" },
    watch_edge: { type: "map_node", nodeId: "edge_of_chain" }
  };

  var DIRECTIVE_LABELS = {
    trace_signal: "Trace the Signal",
    secure_node: "Secure a Phantom Node",
    red_static: "Enter Red Static",
    watch_edge: "Watch the Edge"
  };

  var STATE = {
    lastScf: null,
    inited: false
  };
  var stateSubscribers = new Set();

  function asText(value) {
    return String(value == null ? "" : value).trim();
  }

  function asUpper(value) {
    return asText(value).toUpperCase();
  }

  function frame(partial) {
    return Object.assign({
      id: "",
      situation: "",
      why: "",
      changed: "",
      nextLead: "",
      nextAction: "",
      openQuestion: "",
      target: null,
      ctaKind: "",
      lockedBrief: false,
      firstSession: false,
      hideHubGoal: false,
      goLabel: ""
    }, partial || {});
  }

  function firstSignalOf(inputs) {
    var tut = inputs && inputs.tutorial && typeof inputs.tutorial === "object" ? inputs.tutorial : {};
    var nested = tut.first_signal && typeof tut.first_signal === "object" ? tut.first_signal : {};
    var fs = inputs && inputs.firstSignal && typeof inputs.firstSignal === "object" ? inputs.firstSignal : {};
    var eligible = fs.eligible === true || nested.eligible === true;
    return {
      eligible: eligible,
      faction_selected: fs.faction_selected === true || nested.faction_selected === true,
      state: asUpper(fs.state || nested.state),
      status: asUpper(fs.status || nested.status)
    };
  }

  function campaignOf(inputs) {
    var payload = inputs && inputs.campaign && typeof inputs.campaign === "object" ? inputs.campaign : {};
    var row = payload.campaign && typeof payload.campaign === "object" ? payload.campaign : {};
    return {
      eligible: payload.eligible === true && payload.show !== false && payload.ok !== false,
      reason: asText(payload.reason),
      directive: asText(row.playerDirective).toLowerCase(),
      markLeft: !!row.markLeft,
      introSeen: !!row.introSeen,
      status: asText(row.status).toLowerCase()
    };
  }

  function tacticalOf(inputs) {
    var t = inputs && inputs.tactical && typeof inputs.tactical === "object" ? inputs.tactical : {};
    return {
      breach: asText(t.breach).toLowerCase() || "unknown",
      recover: asText(t.recover).toLowerCase() || "unknown"
    };
  }

  function ctaPrimary(inputs) {
    var cta = inputs && inputs.cta && typeof inputs.cta === "object" ? inputs.cta : {};
    return cta.primary && typeof cta.primary === "object" ? cta.primary : null;
  }

  function ctaKindOf(primary) {
    return asText(primary && primary.kind).toLowerCase();
  }

  function isFirstSession(fs, camp) {
    if (fs.eligible && fs.state !== "COMPLETED") return true;
    if (camp.eligible && !camp.markLeft) return true;
    return false;
  }

  function campaignIncomingPrimary() {
    return {
      kind: "campaign_incoming",
      title: "RELAY-7 is calling",
      subtitle: "Chapter 6 is incoming. Answer the signal.",
      badge: "SIGNAL",
      target: { type: "open_action", action: "campaign" },
      meta: {},
      priority: 97,
      expiresInSec: 0
    };
  }

  function shouldReplaceOnboardingPrimary(scf, kind) {
    var key = asText(kind).toLowerCase();
    if (!scf || scf.lockedBrief) return false;
    var campaignLead = scf.id === "S-CAMPAIGN-INCOMING"
      || (scf.id === "S-FS-COMPLETED" && asText(scf.ctaKind).toLowerCase() === "campaign_incoming");
    if (!campaignLead) return false;
    if (!key) return true;
    return !!ONBOARDING_CTA_KINDS[key];
  }

  function frameFromCta(primary, extra) {
    extra = extra || {};
    var kind = ctaKindOf(primary);
    var locked = kind === "tactical_breach" || kind === "tactical_recover_replay";
    var changed = "";
    var openQuestion = "";
    if (!locked) {
      if (kind === "choose_faction") {
        changed = "No war-path is locked yet.";
        openQuestion = "Which doctrine holds the broken chain?";
      } else if (kind === "first_mission") {
        changed = "No mark on the map yet.";
        openQuestion = "What did Alpha’s trail leave for me?";
      } else if (kind === "equip_item") {
        changed = "A recovered piece is waiting on you.";
        openQuestion = "What changes when the fangs lock in?";
      } else if (kind === "first_map_action") {
        changed = "Your node is live. The map is already moving.";
        openQuestion = "Who writes this front first?";
      } else if (kind === "campaign_incoming" || kind === "campaign_directive") {
        changed = "No mark on the map yet.";
        openQuestion = "What did Alpha find at the Edge?";
      } else {
        changed = asText(primary && primary.subtitle);
        openQuestion = "What remains open on this front?";
      }
    }
    return frame({
      id: extra.id || ("S-CTA-" + (kind || "primary").toUpperCase()),
      situation: asText(primary && primary.title),
      why: asText(primary && primary.subtitle),
      changed: locked ? "" : changed,
      nextLead: asText(primary && primary.badge) || "World",
      nextAction: asText(primary && primary.title) || "Take the next action",
      openQuestion: locked ? "" : openQuestion,
      target: primary && primary.target ? primary.target : null,
      ctaKind: kind,
      lockedBrief: locked,
      firstSession: !!extra.firstSession,
      hideHubGoal: !!extra.hideHubGoal,
      goLabel: extra.goLabel || ""
    });
  }

  function resolve(inputs) {
    inputs = inputs && typeof inputs === "object" ? inputs : {};
    var fs = firstSignalOf(inputs);
    var camp = campaignOf(inputs);
    var tac = tacticalOf(inputs);
    var primary = ctaPrimary(inputs);
    var kind = ctaKindOf(primary);
    var firstSession = isFirstSession(fs, camp);

    if (fs.eligible && fs.state !== "COMPLETED") {
      if (!fs.faction_selected) {
        return frame({
          id: "S-FS-FACTION",
          situation: "A first signal is waiting, but no war-path is locked.",
          why: "Alone, you survive. With a faction, you matter.",
          changed: "No faction oath is recorded.",
          nextLead: "Faction Oath",
          nextAction: "Pick Faction",
          openQuestion: "Who do I fight under?",
          target: { type: "open_action", action: "factions" },
          ctaKind: "choose_faction",
          firstSession: true,
          hideHubGoal: true,
          goLabel: "Pick Faction"
        });
      }
      if (fs.state === "MISSION_STARTED" && fs.status === "RUNNING") {
        return frame({
          id: "S-FS-RUNNING",
          situation: "Your first signal is in progress.",
          why: "The server is tracking this. You can close and return.",
          changed: "The first route is live.",
          nextLead: "First recovered gear signal",
          nextAction: "Wait until the signal is ready",
          openQuestion: "What will the recovered signal be?",
          target: { type: "open_action", action: "first_signal" },
          ctaKind: "first_signal",
          firstSession: true,
          hideHubGoal: true,
          goLabel: "Open First Signal"
        });
      }
      if (fs.state === "MISSION_STARTED" && fs.status === "READY") {
        return frame({
          id: "S-FS-READY",
          situation: "The first mission is ready to resolve.",
          why: "A recovered gear signal is sitting on the other side.",
          changed: "The timer is complete.",
          nextLead: "Signal located",
          nextAction: "Resolve Mission",
          openQuestion: "What did Alpha’s trail leave for me?",
          target: { type: "open_action", action: "first_signal" },
          ctaKind: "first_signal",
          firstSession: true,
          hideHubGoal: true,
          goLabel: "Resolve Mission"
        });
      }
      if (fs.state === "REWARD_RECEIVED") {
        return frame({
          id: "S-FS-REWARD",
          situation: "Rustfang Fangs recovered.",
          why: "Equipping it is the consequence. The world records the change.",
          changed: "First gear is waiting to be equipped.",
          nextLead: "First gear",
          nextAction: "Equip",
          openQuestion: "What changes when the fangs lock in?",
          target: { type: "open_action", action: "first_signal" },
          ctaKind: "first_signal",
          firstSession: true,
          hideHubGoal: true,
          goLabel: "Equip"
        });
      }
      return frame({
        id: "S-FS-NOT-STARTED",
        situation: "A short first signal is ready.",
        why: "This is your entry action, not a menu tour.",
        changed: "No mark on the map yet.",
        nextLead: "First recovered gear signal",
        nextAction: "Start First Mission",
        openQuestion: "What did Alpha’s trail leave for me?",
        target: { type: "open_action", action: "first_signal" },
        ctaKind: "first_signal",
        firstSession: true,
        hideHubGoal: true,
        goLabel: "Start First Mission"
      });
    }

    if (kind === "tactical_breach" || tac.breach === "available") {
      return frame({
        id: "S-TO-BREACH-AVAILABLE",
        situation: "Trusted route carried the wrong signal.",
        why: "",
        changed: "",
        nextLead: "BROKEN SIGNAL / BREACH",
        nextAction: "Respond to the breach",
        openQuestion: "",
        target: { type: "tactical_breach" },
        ctaKind: "tactical_breach",
        lockedBrief: true,
        firstSession: firstSession,
        hideHubGoal: firstSession
      });
    }

    if (kind === "tactical_recover_replay" || tac.recover === "cleared") {
      return frame({
        id: "S-TO-RECOVER-CLEARED",
        situation: "RECOVER SIGNAL",
        why: "",
        changed: "",
        nextLead: "SIGNAL COMMANDER",
        nextAction: "REPLAY",
        openQuestion: "",
        target: { type: "tactical_recover_replay" },
        ctaKind: "tactical_recover_replay",
        lockedBrief: true,
        firstSession: false,
        hideHubGoal: false
      });
    }

    if (kind && LIVE_CTA_KINDS[kind] && primary) {
      return frameFromCta(primary, { firstSession: firstSession, hideHubGoal: firstSession });
    }

    if (fs.eligible && fs.state === "COMPLETED" && camp.eligible && !camp.directive) {
      return frame({
        id: "S-FS-COMPLETED",
        situation: "RELAY-7 reached your node.",
        why: "The world recorded the Strength change. Chapter 6 is incoming.",
        changed: "Rustfang is equipped. Strength rose.",
        nextLead: "RELAY-7",
        nextAction: "Answer RELAY-7",
        openQuestion: "What did Alpha find at the Edge?",
        target: { type: "open_action", action: "campaign" },
        ctaKind: "campaign_incoming",
        firstSession: true,
        hideHubGoal: true,
        goLabel: "Answer RELAY-7"
      });
    }

    if (camp.eligible && !camp.directive) {
      return frame({
        id: "S-CAMPAIGN-INCOMING",
        situation: "RELAY-7 reached your node.",
        why: "The Meme War was a distraction. The Pack is fracturing.",
        changed: fs.eligible && fs.state === "COMPLETED"
          ? "Rustfang is equipped. Strength rose."
          : "No mark on the map yet.",
        nextLead: "RELAY-7",
        nextAction: "Open Campaign",
        openQuestion: "What did Alpha find at the Edge?",
        target: { type: "open_action", action: "campaign" },
        ctaKind: "campaign_incoming",
        firstSession: true,
        hideHubGoal: true,
        goLabel: "Open Campaign"
      });
    }

    if (camp.eligible && camp.directive && !camp.markLeft) {
      var dirLabel = DIRECTIVE_LABELS[camp.directive] || "First Mission Focus";
      return frame({
        id: "S-CAMPAIGN-DIRECTIVE",
        situation: "First Mission Focus locked: " + dirLabel + ".",
        why: "RELAY-7 will guide this route. Archive signals stay open.",
        changed: "Your directive is selected. The mark is not delivered.",
        nextLead: dirLabel,
        nextAction: "Leave Your Mark",
        openQuestion: "What answers at that front?",
        target: { type: "open_action", action: "campaign" },
        ctaKind: "campaign_directive",
        firstSession: true,
        hideHubGoal: true,
        goLabel: "Open Campaign"
      });
    }

    if (camp.eligible && camp.markLeft) {
      var markLabel = DIRECTIVE_LABELS[camp.directive] || "RELAY-7 Guidance";
      var markTarget = DIRECTIVE_TARGETS[camp.directive] || { type: "open_action", action: "campaign" };
      return frame({
        id: "S-CAMPAIGN-MARK",
        situation: "Your mark reached the Pack. The fracture has begun, but you are still standing.",
        why: "Move with purpose. One front is now yours to hold.",
        changed: "Mark delivered. " + markLabel + " is the live lead.",
        nextLead: markLabel,
        nextAction: markLabel,
        openQuestion: "What answers at that front?",
        target: markTarget,
        ctaKind: camp.directive || "campaign_mark",
        firstSession: false,
        hideHubGoal: false,
        goLabel: markLabel
      });
    }

    if (fs.eligible && fs.state === "COMPLETED" && primary) {
      return frameFromCta(primary, {
        id: "S-FS-COMPLETED",
        firstSession: firstSession,
        hideHubGoal: firstSession,
        goLabel: "Return to the Map"
      });
    }

    if (primary) {
      return frameFromCta(primary, { firstSession: firstSession, hideHubGoal: firstSession });
    }

    return frame({
      id: "S-FALLBACK",
      situation: "RELAY-7 is still online.",
      why: "Check the current lead before browsing the Hub.",
      changed: "",
      nextLead: "RELAY-7",
      nextAction: "Open Campaign",
      openQuestion: "What did Alpha find at the Edge?",
      target: { type: "open_action", action: "campaign" },
      ctaKind: "campaign_incoming",
      firstSession: firstSession,
      hideHubGoal: firstSession,
      goLabel: "Open Campaign"
    });
  }

  function gatherInputs() {
    var ctaState = null;
    try { ctaState = global.CTA && typeof global.CTA.getState === "function" ? global.CTA.getState() : null; } catch (_) {}
    var campaignState = null;
    try { campaignState = global.Campaign && typeof global.Campaign.state === "function" ? global.Campaign.state() : null; } catch (_) {}
    var tutorial = null;
    try { tutorial = global.Onboarding && typeof global.Onboarding.getTutorial === "function" ? global.Onboarding.getTutorial() : null; } catch (_) {}
    var firstSignal = null;
    try { firstSignal = global.Onboarding && typeof global.Onboarding.getFirstSignal === "function" ? global.Onboarding.getFirstSignal() : null; } catch (_) {}
    var tactical = null;
    try { tactical = global.CTA && typeof global.CTA.getTacticalMissions === "function" ? global.CTA.getTacticalMissions() : null; } catch (_) {}
    return {
      cta: ctaState,
      campaign: campaignState,
      tutorial: tutorial,
      firstSignal: firstSignal,
      tactical: tactical
    };
  }

  function campaignEligible() {
    var camp = campaignOf({ campaign: gatherInputs().campaign });
    return camp.eligible;
  }

  function notifySubscribers(reason) {
    if (!stateSubscribers.size) return;
    var event = Object.freeze({ reason: String(reason || "update"), state: STATE.lastScf });
    Array.from(stateSubscribers).forEach(function (listener) {
      try { listener(event); } catch (_) {}
    });
  }

  function subscribe(listener, options) {
    options = options || {};
    if (typeof listener !== "function") return function () {};
    stateSubscribers.add(listener);
    if (options.emitCurrent && STATE.lastScf) {
      try { listener(Object.freeze({ reason: "current", state: STATE.lastScf })); } catch (_) {}
    }
    var active = true;
    return function () {
      if (!active) return false;
      active = false;
      return stateSubscribers.delete(listener);
    };
  }

  function ensureHubRoot() {
    var scroll = document.getElementById("hubBack") && document.querySelector("#hubBack .ah-panel-scroll");
    var root = document.getElementById("hubStoryRoot");
    if (root) return root;
    if (!scroll) return null;
    root = document.createElement("div");
    root.id = "hubStoryRoot";
    var goal = document.getElementById("hubGoalRoot");
    if (goal && goal.parentNode === scroll) scroll.insertBefore(root, goal);
    else scroll.insertBefore(root, scroll.firstChild);
    return root;
  }

  function ensureStyles() {
    if (document.getElementById("story-delivery-css")) return;
    var style = document.createElement("style");
    style.id = "story-delivery-css";
    style.textContent = ""
      + "#hubStoryRoot{padding:0 14px 12px;}"
      + "#hubBack.is-story-first-session #hubGoalRoot{display:none !important;}"
      + ".ahs-story-card{position:relative;overflow:hidden;border-radius:16px;border:1px solid rgba(145,226,255,.18);"
      + "background:radial-gradient(circle at 12% -10%, rgba(81,166,214,.18), transparent 42%),linear-gradient(180deg, rgba(8,18,29,.94), rgba(6,12,20,.96));"
      + "box-shadow:0 12px 28px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.05);}"
      + ".ahs-story-pad{padding:14px;}"
      + ".ahs-story-kicker{font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#9fd6ff;}"
      + ".ahs-story-situation{margin-top:6px;font-size:14px;font-weight:800;line-height:1.35;color:#eef8ff;}"
      + ".ahs-story-next{margin-top:8px;font-size:12px;line-height:1.4;color:rgba(210,232,255,.86);}"
      + ".ahs-story-next b{color:#d6f3ff;}"
      + ".ahs-story-go{appearance:none;margin-top:12px;width:100%;padding:11px 12px;border-radius:12px;"
      + "border:1px solid rgba(145,226,255,.24);background:linear-gradient(180deg, rgba(57,122,167,.50), rgba(21,50,73,.84));"
      + "color:#f3f9ff;font-weight:900;letter-spacing:.03em;cursor:pointer;}";
    document.head.appendChild(style);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&" + "amp;")
      .replace(/</g, "&" + "lt;")
      .replace(/>/g, "&" + "gt;")
      .replace(/"/g, "&" + "quot;");
  }

  function renderHub(scf) {
    if (typeof document === "undefined") return scf;
    ensureStyles();
    var hub = document.getElementById("hubBack");
    var root = ensureHubRoot();
    if (hub) hub.classList.toggle("is-story-first-session", !!(scf && scf.hideHubGoal));
    if (!root) return scf;
    if (!scf) {
      root.innerHTML = "";
      return scf;
    }
    var go = scf.goLabel || scf.nextAction || "Go";
    root.innerHTML = ""
      + "<div class=\"ahs-story-card\">"
      + "  <div class=\"ahs-story-pad\">"
      + "    <div class=\"ahs-story-kicker\">CURRENT SITUATION</div>"
      + "    <div class=\"ahs-story-situation\">" + esc(scf.situation) + "</div>"
      + "    <div class=\"ahs-story-next\"><b>NEXT:</b> " + esc(scf.nextAction) + "</div>"
      + (scf.target
        ? "    <button type=\"button\" class=\"ahs-story-go\" data-story-go=\"1\">" + esc(go) + "</button>"
        : "")
      + "  </div>"
      + "</div>";
    var btn = root.querySelector("[data-story-go]");
    if (btn && scf.target) {
      btn.addEventListener("click", function onGo() {
        try {
          if (global.CTA && typeof global.CTA.openTarget === "function") {
            void global.CTA.openTarget(scf.target);
            return;
          }
        } catch (_) {}
        if (scf.target && scf.target.action === "campaign" && global.Campaign && typeof global.Campaign.open === "function") {
          global.Campaign.open();
        }
      });
    }
    return scf;
  }

  function refreshHub(reason) {
    var scf = resolve(gatherInputs());
    STATE.lastScf = scf;
    renderHub(scf);
    notifySubscribers(reason || "refresh");
    return scf;
  }

  function onCtaState() {
    refreshHub("cta");
  }

  function onCampaignState() {
    var scf = resolve(gatherInputs());
    STATE.lastScf = scf;
    try {
      if (global.CTA && typeof global.CTA.applyStoryPrimary === "function" && shouldReplaceOnboardingPrimary(scf, ctaKindOf(ctaPrimary(gatherInputs())))) {
        global.CTA.applyStoryPrimary(campaignIncomingPrimary());
      }
    } catch (_) {}
    renderHub(scf);
    notifySubscribers("campaign");
    return scf;
  }

  function init() {
    if (STATE.inited) {
      refreshHub("init_reentry");
      return API;
    }
    STATE.inited = true;
    try {
      if (global.CTA && typeof global.CTA.subscribe === "function") {
        global.CTA.subscribe(function () { onCtaState(); }, { emitCurrent: true });
      }
    } catch (_) {}
    try {
      global.addEventListener("ah:campaign-state-accepted", function () { onCampaignState(); });
    } catch (_) {}
    refreshHub("init");
    return API;
  }

  var API = {
    resolve: resolve,
    shouldReplaceOnboardingPrimary: shouldReplaceOnboardingPrimary,
    campaignIncomingPrimary: campaignIncomingPrimary,
    campaignEligible: campaignEligible,
    gatherInputs: gatherInputs,
    refreshHub: refreshHub,
    onCtaState: onCtaState,
    onCampaignState: onCampaignState,
    subscribe: subscribe,
    getState: function getState() { return STATE.lastScf; },
    init: init
  };

  if (global) global.StoryDelivery = API;
  if (typeof module !== "undefined" && module.exports) module.exports = API;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
