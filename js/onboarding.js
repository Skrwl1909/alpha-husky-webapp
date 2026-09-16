// js/onboarding.js — Alpha Husky WebApp Onboarding v4 (backend-driven tutorial state)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  const KEY = "ah_onboarding_v";
  const VERSION = "4";
  const FORGE_DISCOVERY_KEY = "ah.ftue.forgeDiscovery.v1";
  const GROUP_LINK = "https://t.me/The_Alpha_husky";

  let backEl = null;
  let bodyEl = null;
  let btnBack = null;
  let btnLater = null;
  let btnNext = null;
  let progressFill = null;

  let steps = [];
  let idx = 0;
  let _toastLock = 0;
  let _tutorial = null;
  let _firstSignalMission = null;
  let _focusedBusy = false;
  let _focusedTimer = null;
  let _laterDeferUntil = 0;
  let _forgeDiscoveryOpen = false;

  function log(...a) { if (_dbg) console.log("[Onboarding]", ...a); }
  function getTG() { return _tg || window.Telegram?.WebApp || null; }
  function getApiPost() { return _apiPost || window.apiPost || null; }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function shouldShow() {
    return lsGet(KEY) !== VERSION;
  }

  function markDone() {
    lsSet(KEY, VERSION);
  }

  function makeRunId(prefix = "ob") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  // ====================== DEBUG TEST OVERRIDE ======================
  function getTutorialDebugOverride() {
    const raw = window.__AH_TUTORIAL_DEBUG__;
    if (!raw) return null;
    if (typeof raw === "function") {
      try { return raw(); } catch (_) { return null; }
    }
    return raw;
  }

  window.setTutorialDebugState = function (state) {
    window.__AH_TUTORIAL_DEBUG__ = state;
    return state;
  };

  window.clearTutorialDebugState = function () {
    try { delete window.__AH_TUTORIAL_DEBUG__; } catch (_) {
      window.__AH_TUTORIAL_DEBUG__ = null;
    }
  };

  function arr(v) {
    return Array.isArray(v) ? v : [];
  }

  function uniq(list) {
    return [...new Set(arr(list).map(x => String(x || "").trim()).filter(Boolean))];
  }

  function normalizeTutorialPayload(out) {
    if (!out || out.ok === false) {
      return {
        exists: false,
        started: false,
        finished: false,
        current_step: null,
        completed_steps: [],
        optional_skips: [],
        step_ts: {},
        version: null
      };
    }

    const data = out.data || out.tutorial || out;
    const completed = uniq(data.completed_steps);
    const optionalSkips = uniq(data.optional_skips);

    const exists =
      data.exists === true ||
      !!data.started ||
      !!data.finished ||
      !!data.current_step ||
      completed.length > 0;

    return {
      exists,
      started: !!data.started,
      finished: !!data.finished,
      current_step: data.current_step || null,
      completed_steps: completed,
      optional_skips: optionalSkips,
      step_ts: data.step_ts || {},
      version: data.version || null,
      first_signal: (data.first_signal && typeof data.first_signal === "object") ? data.first_signal : null
    };
  }

  function firstSignalEnabled() {
    return _tutorial?.first_signal?.eligible === true;
  }

  function missionPayload(out) {
    return out?.data || out?.state || out || {};
  }

  async function fetchFirstSignalMissionState(strict = false) {
    if (!firstSignalEnabled()) {
      _firstSignalMission = null;
      return null;
    }
    try {
      const out = window.Missions?.firstSignalState
        ? await window.Missions.firstSignalState()
        : await getApiPost()("/webapp/missions/state", { run_id: makeRunId("first_signal_state") });
      const payload = missionPayload(out);
      if (strict && (out?.ok === false || !(payload.firstSignal || payload.first_signal))) throw new Error("First Signal refresh unavailable");
      _firstSignalMission = payload.firstSignal || payload.first_signal || null;
    } catch (e) {
      if (strict) throw e;
      log("FIRST SIGNAL state fetch failed", e);
      _firstSignalMission = null;
    }
    return _firstSignalMission;
  }

  async function fetchTutorialState(strict = false) {
    const debugOverride = getTutorialDebugOverride();
    if (debugOverride && typeof debugOverride === "object") {
      _tutorial = normalizeTutorialPayload({
        ok: true,
        data: debugOverride
      });
      log("tutorial debug override", _tutorial);
      return _tutorial;
    }

    const apiPost = getApiPost();
    if (!apiPost) {
      if (strict) throw new Error("Tutorial refresh unavailable");
      log("No apiPost; cannot fetch tutorial state");
      _tutorial = null;
      return null;
    }

    try {
      const out = await apiPost("/webapp/tutorial/state", {
        run_id: makeRunId("tutorial_state")
      });
      if (strict && (!out || out.ok === false)) throw new Error("Tutorial refresh unavailable");
      _tutorial = normalizeTutorialPayload(out);
      log("tutorial state", _tutorial);
      return _tutorial;
    } catch (e) {
      if (strict) throw e;
      log("tutorial state fetch failed", e);
      _tutorial = null;
      return null;
    }
  }

  // ====================== STEP CONFIG ======================
  const STEP_CONFIG = {
    profile_stats_seen: {
      icon: "📊",
      h: "See what Alpha recorded",
      p: "Your node has a body. Look once so you know what the Pack can read.",
      label: "Open Stats"
    },
    quests_seen: {
      icon: "📜",
      h: "Today’s pressure",
      p: "Short orders. They are not the war.",
      label: "Open Quests"
    },
    missions_seen: {
      icon: "⚔️",
      h: "Trace a live route",
      p: "Expeditions are how fractures show up as work.",
      label: "Open Missions"
    },
    faction_selected: {
      icon: "🏴",
      h: "Choose Your Faction",
      p: "After the Betrayal Hash, the Alpha Network split into four war-paths. Choose the doctrine you fight under.",
      label: "Pick Faction"
    },
    chain_building_started: {
      icon: "🗺️",
      h: "Leave a mark on the chain",
      p: "Start one beginner run on Abandoned Wallets or Broken Contracts.",
      label: "Open Map",
      note: "Tutorial step completes after starting one of the whitelisted Chain buildings."
    },
    referral_seen: {
      icon: "🔗",
      h: "Grab Your Referral Link",
      p: "Invite friends later and grow your Pack. This step is optional.",
      label: "Open Referrals",
      optional: true
    },
    shop_preview_seen: {
      icon: "🛒",
      h: "Preview the Shop",
      p: "Take a quick look at the economy and future upgrades. No purchase needed.",
      label: "Open Shop",
      optional: true
    },
    community: {
      icon: "🔥",
      h: "Join The Pack",
      p: "Co-op runs, updates, support and the wider Alpha Husky community live here.",
      label: "Open Community",
      cta: true,
      optional: true
    }
  };

  const REQUIRED_ORDER = [
    "profile_stats_seen",
    "quests_seen",
    "missions_seen",
    "faction_selected",
    "chain_building_started"
  ];

  const OPTIONAL_ORDER = [
    "referral_seen",
    "shop_preview_seen"
  ];

  // ====================== ACTIONS ======================
  function openStats() {
    if (window.Stats?.open) return window.Stats.open();
    if (window.openStats) return window.openStats();
    document.querySelector('.btn.char, .btn.mystats, .btn.stats, [data-go="stats"], [data-go="char"], #openStats')?.click();
  }

  function openQuests() {
    if (window.Quests?.open) return window.Quests.open();
    if (window.openQuests) return window.openQuests();
    document.querySelector('.btn.quests, [data-go="quests"], #openQuests')?.click();
  }

  function openMissions() {
    if (window.Missions?.open) return window.Missions.open();
    if (window.openMissions) return window.openMissions();
    document.querySelector('.btn.mission, [data-go="missions"], #openMissions')?.click();
  }

  function openFactionPicker() {
    try {
      if (firstSignalEnabled() && window.Oath && typeof window.Oath.checkAndOpen === "function") {
        void window.Oath.checkAndOpen({ force: true });
        return;
      }
    } catch (_) {}
    if (window.Factions?.openPicker) return window.Factions.openPicker();
    if (window.chooseFaction) return window.chooseFaction();
    if (window.Factions?.open) return window.Factions.open({ mode: "select" });
    document.querySelector('.btn.faction, [data-go="faction"], #openFaction')?.click();
  }

  function openChain() {
    if (window.openMap) return window.openMap();
    if (window.AHMap?.open) return window.AHMap.open();
    if (window.Map?.open) return window.Map.open();
    document.querySelector('.btn.map, [data-go="map"], #openMap')?.click();

    const tg = getTG();
    try {
      tg?.showAlert?.("Open the map and start Abandoned Wallets Vault or Broken Contracts Hub to finish this step.");
    } catch (_) {}
  }

  function openReferrals() {
    if (window.Referrals?.open) return window.Referrals.open();
    if (window.openReferrals) return window.openReferrals();
    document.querySelector('.btn.referral, .btn.referrals, [data-go="referrals"], #openReferrals')?.click();
  }

  function openShop() {
    if (window.Shop?.open) return window.Shop.open();
    if (window.openShop) return window.openShop();
    document.querySelector('.btn.shop, [data-go="shop"], #openShop')?.click();
  }

  function openCommunity() {
    const tg = getTG();
    try {
      if (tg?.openTelegramLink) return tg.openTelegramLink(GROUP_LINK);
      if (tg?.openLink) return tg.openLink(GROUP_LINK);
    } catch (_) {}
    window.open(GROUP_LINK, "_blank");
  }

  function attachGo(step) {
    switch (step.key) {
      case "profile_stats_seen": return openStats;
      case "quests_seen": return openQuests;
      case "missions_seen": return openMissions;
      case "faction_selected": return openFactionPicker;
      case "chain_building_started": return openChain;
      case "referral_seen": return openReferrals;
      case "shop_preview_seen": return openShop;
      case "community": return openCommunity;
      default: return () => {};
    }
  }

  // ====================== STEP BUILD ======================
  function buildStepsFromTutorial(tut) {
    const list = [];
    const done = new Set(uniq(tut?.completed_steps));
    const skipped = new Set(uniq(tut?.optional_skips));
    const finished = !!tut?.finished;
    const currentStep = String(tut?.current_step || "").trim();
    const rawIdx = REQUIRED_ORDER.indexOf(currentStep);
    const requiredStartIdx = finished ? REQUIRED_ORDER.length : (rawIdx >= 0 ? rawIdx : 0);

    for (let i = requiredStartIdx; i < REQUIRED_ORDER.length; i++) {
      const key = REQUIRED_ORDER[i];
      if (!done.has(key)) {
        list.push({ key, ...STEP_CONFIG[key], go: attachGo({ key }) });
      }
    }

    for (const key of OPTIONAL_ORDER) {
      if (!done.has(key) && !skipped.has(key)) {
        list.push({ key, ...STEP_CONFIG[key], go: attachGo({ key }) });
      }
    }

    list.push({ key: "community", ...STEP_CONFIG.community, go: attachGo({ key: "community" }) });
    return list;
  }

  // ====================== CSS ======================
  function ensureCSS() {
    if (document.getElementById("onboarding-css")) return;

    const st = document.createElement("style");
    st.id = "onboarding-css";
    st.textContent = `
      #obBack{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.75);z-index:2000000;padding:16px;backdrop-filter:blur(8px);}
      #obBack[hidden]{display:none!important}

      .ob-modal{width:min(560px,100%);background:#0a0c14;border:1px solid rgba(103,232,249,.15);
        border-radius:20px;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.7);
        animation:obPop 0.4s cubic-bezier(0.34,1.56,0.64,1);}

      @keyframes obPop{from{opacity:0;transform:scale(0.92) translateY(30px)}to{opacity:1;transform:scale(1) translateY(0)}}

      .ob-hd{padding:16px 18px 8px;display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(255,255,255,.08)}
      .ob-title{font-weight:900;font-size:19px;letter-spacing:-0.3px}
      .ob-progress{width:100%;height:4px;background:rgba(255,255,255,.1);border-radius:9999px;margin-top:8px;overflow:hidden}
      .ob-progress-fill{height:100%;background:linear-gradient(90deg,#67e8f9,#c084fc);width:0;transition:width .4s ease}

      .ob-bd{padding:18px 20px 12px}
      .ob-card{display:flex;gap:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);
        border-radius:18px;padding:16px;transition:all .3s ease}
      .ob-icon{font-size:52px;line-height:1;flex-shrink:0}
      .ob-content{flex:1}
      .ob-step{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;opacity:.65}
      .ob-head{font-size:18px;font-weight:900;margin:4px 0 8px}
      .ob-p{line-height:1.35;opacity:.9}

      .ob-note{margin-top:10px;font-size:13px;opacity:.75}
      .ob-cta{background:rgba(103,232,249,.08);border:1px solid rgba(103,232,249,.2);border-radius:14px;
        padding:12px 14px;margin-top:12px}

      .ob-ft{padding:14px 20px 20px;display:flex;gap:10px}
      .ob-btn{border:0;border-radius:14px;padding:14px 20px;font-weight:900;cursor:pointer;
        transition:all .2s ease;font-size:15px}
      .ob-btn.ghost{background:rgba(255,255,255,.07);color:#fff;border:1px solid rgba(255,255,255,.12)}
      .ob-btn.primary{background:linear-gradient(90deg,#67e8f9,#a78bfa);color:#0a0c14;font-weight:900}
      .ob-btn:hover{transform:translateY(-1px)}

      body.ob-lock{overflow:hidden;touch-action:none}
    `;
    document.head.appendChild(st);
  }

  // ====================== HTML ======================
  function ensureHTML() {
    if (document.getElementById("obBack")) return;

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="obBack" hidden>
        <div class="ob-modal">
          <div class="ob-hd">
            <div style="flex:1">
              <div class="ob-title">Welcome to the Pack 🐺</div>
              <div class="ob-progress"><div class="ob-progress-fill" id="obProgressFill"></div></div>
            </div>
            <button class="ob-btn ghost" id="obLater" style="padding:8px 14px;font-size:13px" type="button">Later</button>
          </div>

          <div id="obBody" class="ob-bd"></div>

          <div class="ob-ft">
            <button id="obBackBtn" class="ob-btn ghost" type="button">Back</button>
            <div style="flex:1"></div>
            <button id="obNext" class="ob-btn primary" type="button">Next</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);

    backEl = document.getElementById("obBack");
    bodyEl = document.getElementById("obBody");
    btnBack = document.getElementById("obBackBtn");
    btnLater = document.getElementById("obLater");
    btnNext = document.getElementById("obNext");
    progressFill = document.getElementById("obProgressFill");

    backEl.addEventListener("click", e => { if (e.target === backEl) close(false); });
    btnLater.onclick = () => {
      const st = focusedState();
      if (_forgeDiscoveryOpen) markForgeDiscoverySeen();
      if (firstSignalEnabled() && String(st.state || "").toUpperCase() === "MISSION_STARTED" && String(st.status || "").toUpperCase() === "RUNNING") {
        _laterDeferUntil = Date.now() + 2500;
      }
      close(false);
    };
    btnBack.onclick = () => {
      if (idx > 0) {
        idx--;
        render();
      }
    };
    btnNext.onclick = () => {
      if (idx < steps.length - 1) {
        idx++;
        render();
      } else {
        close(true);
      }
    };
  }

  function haptic(type = "light") {
    const tg = getTG();
    try {
      if (tg?.HapticFeedback) {
        if (type === "success") tg.HapticFeedback.notificationOccurred("success");
        else tg.HapticFeedback.impactOccurred(type);
      }
    } catch (_) {}
  }

  function showToast(msg) {
    if (Date.now() - _toastLock < 800) return;
    _toastLock = Date.now();

    const t = document.createElement("div");
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1a2338;border:1px solid #67e8f9;color:#67e8f9;padding:10px 18px;
      border-radius:9999px;font-size:14px;white-space:nowrap;z-index:2000001;
      box-shadow:0 10px 30px rgba(103,232,249,.3);`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function focusedState() {
    const tutorialState = _tutorial?.first_signal || {};
    const missionState = _firstSignalMission || {};
    return {
      ...tutorialState,
      ...missionState,
      state: missionState.state || tutorialState.state || null,
      completion: missionState.completion || tutorialState.completion || null,
      reward: missionState.reward || tutorialState.reward || null,
      progressionReward: missionState.progressionReward || tutorialState.progressionReward || null,
      faction_selected: tutorialState.faction_selected === true,
    };
  }

  async function refreshFocusedState() {
    await fetchTutorialState();
    if (firstSignalEnabled()) await fetchFirstSignalMissionState();
    render();
  }

  function waitForFactionSelection(attempt = 0) {
    if (attempt >= 60) return;
    setTimeout(async () => {
      await fetchTutorialState();
      if (_tutorial?.first_signal?.eligible && _tutorial.first_signal.faction_selected) {
        await open(true);
        return;
      }
      waitForFactionSelection(attempt + 1);
    }, 1500);
  }

  async function runFocusedAction(action) {
    if (_focusedBusy) return;
    _focusedBusy = true;
    if (action !== "forge_continue" && action !== "forge_open") renderFirstSignal();
    try {
      if (action === "faction") {
        close(false);
        openFactionPicker();
        waitForFactionSelection();
        return;
      }
      if (action === "start") {
        await openGuided();
        return;
      } else if (action === "resolve") {
        await openGuided();
        return;
      } else if (action === "equip") {
        await openGuided();
        return;
      } else if (action === "next") {
        await showForgeDiscovery();
        return;
      } else if (action === "forge_continue") {
        await continueForgeDiscovery();
        return;
      } else if (action === "forge_open") {
        await openForgeFromDiscovery();
        return;
      }
      await refreshFocusedState();
      haptic("success");
    } catch (e) {
      showToast(String(e?.data?.reason || e?.message || "Action failed"));
      await refreshFocusedState();
    } finally {
      _focusedBusy = false;
      if (firstSignalEnabled() && backEl?.style.display !== "none") renderFirstSignal();
    }
  }

  function scheduleFocusedCountdown(state) {
    if (_focusedTimer) clearInterval(_focusedTimer);
    _focusedTimer = null;
    if (state.state !== "MISSION_STARTED" || state.status !== "RUNNING") return;
    const initialRemaining = Math.max(0, Number(state.remainingSec || 0));
    const baseline = Date.now();
    _focusedTimer = setInterval(async () => {
      const remaining = Math.max(0, initialRemaining - Math.floor((Date.now() - baseline) / 1000));
      const el = document.getElementById("obFirstSignalCountdown");
      if (el) el.textContent = `${remaining}s`;
      if (remaining <= 0) {
        clearInterval(_focusedTimer);
        _focusedTimer = null;
        await refreshFocusedState();
      }
    }, 500);
  }

  function renderFirstSignal() {
    if (_worldDiscoveryOpen) return;
    if (!bodyEl) return;
    const state = focusedState();
    const modalTitle = document.querySelector("#obBack .ob-title");
    if (modalTitle) modalTitle.textContent = state.state === "COMPLETED" ? "BUILD IMPROVED" : "FIRST SIGNAL";
    if (progressFill) progressFill.style.width = state.state === "COMPLETED" ? "100%" : "35%";
    if (btnBack) btnBack.style.display = "none";
    if (btnNext) btnNext.style.display = "none";
    if (btnLater) btnLater.style.display = state.state === "MISSION_STARTED" && state.status === "RUNNING" ? "block" : "none";

    let icon = "⚡";
    let heading = "FIRST SIGNAL";
    let copy = "Most of the old network is broken. Some signals died. Some were abandoned. Some were never real. We don't fix all of it at once. Start with one.";
    let detail = "";
    let action = "start";
    let label = "Find FIRST SIGNAL in Missions";
    let disabled = _focusedBusy;

    if (!state.faction_selected) {
      icon = "🏴";
      heading = "Choose Your Faction";
      copy = "Choose the pack you fight under before answering your first signal.";
      action = "faction";
      label = "Pick Faction";
    } else if (state.state === "MISSION_STARTED" && state.status === "RUNNING") {
      icon = "◌";
      heading = "Signal in Progress";
      copy = "The server is tracking this mission. You can safely close and return.";
      detail = `<div class="ob-note">Ready in <strong id="obFirstSignalCountdown">${Math.max(0, Number(state.remainingSec || 0))}s</strong></div>`;
      action = "";
      label = "Mission Running";
      disabled = true;
    } else if (state.state === "MISSION_STARTED" && state.status === "READY") {
      heading = "Signal Located";
      copy = "The first mission is ready to resolve.";
      action = "resolve";
      label = "Open ready mission";
    } else if (state.state === "REWARD_RECEIVED") {
      const reward = state.reward || {};
      const progression = state.progressionReward || {};
      const xp = Number(progression.xp || 0);
      const bones = Number(progression.bones || 0);
      const strength = Number(reward?.statBonus?.strength || 0);
      icon = "🦷";
      heading = "FIRST SIGNAL COMPLETE";
      copy = "Signal held. You did the work. You earned the reward. That's how it works here.";
      detail = `${xp > 0 && bones > 0 ? `<div class="ob-note"><strong>+${escapeHtml(xp)} EXP &middot; +${escapeHtml(bones)} Bones</strong></div>` : ""}
        <div class="ob-note"><strong>${escapeHtml(reward.displayName || "Rustfang Fangs")}</strong> &middot; ${escapeHtml(reward.rarity || "common")} &middot; ${escapeHtml(reward.slot || "fangs")}${strength > 0 ? ` &middot; +${strength} Strength` : ""}</div>`;
      action = "equip";
      label = "Inspect recovered gear";
    } else if (state.state === "COMPLETED") {
      const completion = state.completion || {};
      const progression = state.progressionReward || {};
      const xp = Number(progression.xp || 0);
      const bones = Number(progression.bones || 0);
      const reward = state.reward || {};
      icon = "▲";
      heading = "BUILD IMPROVED";
      copy = "What you recover matters. Use it.";
      detail = `${xp > 0 && bones > 0 ? `<div class="ob-note"><strong>+${escapeHtml(xp)} EXP &middot; +${escapeHtml(bones)} Bones</strong></div>` : ""}
        <div class="ob-note"><strong>${escapeHtml(reward.displayName || "Rustfang Fangs")} equipped</strong></div>
        <div class="ob-note"><strong>Strength: ${escapeHtml(completion.before)} → ${escapeHtml(completion.after)}</strong></div>`;
      action = "next";
      label = "Discover Blood Moon Tower";
    }

    bodyEl.innerHTML = `
      <div class="ob-card">
        <div class="ob-icon">${icon}</div>
        <div class="ob-content">
          <div class="ob-step">FTUE LITE</div>
          <div class="ob-head">${escapeHtml(heading)}</div>
          <div class="ob-p">${escapeHtml(copy)}</div>
          ${detail}
          <button class="ob-btn primary" id="obFirstSignalDo" style="margin-top:14px;width:100%" type="button" ${disabled ? "disabled" : ""}>${escapeHtml(_focusedBusy ? "Updating…" : label)}</button>
        </div>
      </div>`;
    const button = document.getElementById("obFirstSignalDo");
    if (button && action) button.onclick = () => runFocusedAction(action);
    scheduleFocusedCountdown(state);
    window.ScoutGuide?.refresh();
  }

  async function refreshSteps(keepCurrent = true) {
    const prevKey = steps[idx]?.key || null;
    await fetchTutorialState();

    if (firstSignalEnabled()) {
      await fetchFirstSignalMissionState();
      steps = [];
      renderFirstSignal();
      return;
    }

    if (!_tutorial || !_tutorial.exists || !_tutorial.started) {
      steps = [];
      close(false);
      return;
    }

    steps = buildStepsFromTutorial(_tutorial);

    if (!steps.length) {
      markDone();
      close(true);
      return;
    }

    if (keepCurrent && prevKey) {
      const nextIdx = steps.findIndex(s => s.key === prevKey);
      idx = nextIdx >= 0 ? nextIdx : Math.min(idx, Math.max(0, steps.length - 1));
    } else {
      idx = 0;
    }

    render();
  }

  // ====================== RENDER ======================
  function render() {
    if (_forgeDiscoveryOpen) {
      renderForgeDiscovery();
      return;
    }
    if (firstSignalEnabled()) {
      renderFirstSignal();
      return;
    }
    if (!steps.length) return;

    const modalTitle = document.querySelector("#obBack .ob-title");
    if (modalTitle) modalTitle.textContent = "Welcome to the Pack 🐺";
    if (btnLater) btnLater.style.display = "block";
    if (btnNext) btnNext.style.display = "block";

    const s = steps[idx];
    const percent = Math.round(((idx + 1) / steps.length) * 100);
    if (progressFill) progressFill.style.width = percent + "%";

    const noteHtml = s.note ? `<div class="ob-note">${s.note}</div>` : "";
    const ctaHtml = s.cta ? `
      <div class="ob-cta">
        <strong>Want more?</strong><br>
        Co-op runs, Pet Arena battles and community support — all in the chat.
      </div>` : "";

    bodyEl.style.opacity = "0";
    setTimeout(() => {
      bodyEl.innerHTML = `
        <div class="ob-card">
          <div class="ob-icon">${s.icon}</div>
          <div class="ob-content">
            <div class="ob-step">STEP ${idx + 1} / ${steps.length}</div>
            <div class="ob-head">${s.h}</div>
            <div class="ob-p">${s.p}</div>
            ${noteHtml}
            ${ctaHtml}
            <button class="ob-btn primary" id="obDo" style="margin-top:14px;width:100%" type="button">${s.label}</button>
          </div>
        </div>
      `;
      bodyEl.style.opacity = "1";

      document.getElementById("obDo").onclick = () => {
        haptic("medium");

        const go = s.go;

        // zamknij onboarding, żeby nie przykrywał docelowego modułu
        close(false);

        // otwórz właściwy ekran dopiero po schowaniu overlay
        requestAnimationFrame(() => {
          try { go?.(); } catch (_) {}
        });
      };

      btnBack.style.display = idx === 0 ? "none" : "block";
      btnNext.textContent = idx === steps.length - 1 ? "Finish Onboarding" : "Next";
    }, 120);
  }

  function campaignEligibleForNext() {
    try {
      if (window.StoryDelivery && typeof window.StoryDelivery.campaignEligible === "function") {
        return window.StoryDelivery.campaignEligible() === true;
      }
    } catch (_) {}
    try {
      const payload = window.Campaign && typeof window.Campaign.state === "function" ? window.Campaign.state() : null;
      return !!(payload && payload.eligible === true && payload.show !== false && payload.ok !== false);
    } catch (_) {}
    return false;
  }

  async function openGuided() {
    await fetchTutorialState(true);
    await fetchFirstSignalMissionState(true);
    const state = focusedState();
    if (!firstSignalEnabled()) return false;
    if (state.state === "COMPLETED") {
      if (state.world_discovery === "pending") return showWorldDiscovery();
      close(false);
      return false;
    }
    close(false);
    if (state.state === "REWARD_RECEIVED") {
      window.Missions?.close();
      return window.Equipped.openGuidedItem(state.reward?.itemKey || state.reward?.key || "rustfang_fangs");
    }
    return window.Missions.openGuided();
  }

  async function afterManualEquip(result, key) {
    if (!result?.ok || key !== "rustfang_fangs" || focusedState().state !== "REWARD_RECEIVED") return false;
    await fetchTutorialState(true);
    await fetchFirstSignalMissionState(true);
    if (focusedState().state !== "COMPLETED" || focusedState().completion?.completed !== true) return false;
    ensureCSS(); ensureHTML();
    backEl.hidden = false;
    backEl.style.display = "flex";
    document.body.classList.add("ob-lock");
    renderFirstSignal();
    window.StoryDelivery?.refreshHub("manual_equip");
    void window.CTA?.refresh();
    return true;
  }

  function identitySequenceOpen() {
    try {
      if (window.Awakening && typeof window.Awakening.isOpen === "function" && window.Awakening.isOpen()) return true;
    } catch (_) {}
    try {
      if (window.Oath && typeof window.Oath.isOpen === "function" && window.Oath.isOpen()) return true;
    } catch (_) {}
    try {
      if (document.body.classList.contains("ah-awakening-open") || document.body.classList.contains("ah-oath-open")) return true;
    } catch (_) {}
    return false;
  }

  function isOpen() {
    if (!backEl) return false;
    if (backEl.hidden) return false;
    return backEl.style.display !== "none";
  }

  async function open(force = false) {
    ensureCSS();
    ensureHTML();

    if (!force && identitySequenceOpen()) {
      log("identity sequence open; skipping onboarding auto-open");
      return;
    }
    if (!force && _laterDeferUntil && Date.now() < _laterDeferUntil) {
      log("FIRST SIGNAL later-defer; skipping auto-open");
      return;
    }

    await fetchTutorialState();

    if (firstSignalEnabled()) {
      await fetchFirstSignalMissionState();
      const fsState = String(focusedState().state || "").toUpperCase();
      if (fsState === "COMPLETED") {
        if (focusedState().world_discovery === "pending") return showWorldDiscovery();
        log("FIRST SIGNAL completed; skipping tutorial checklist");
        close(false);
        return;
      }
      backEl.hidden = false;
      backEl.style.display = "flex";
      document.body.classList.add("ob-lock");
      renderFirstSignal();
      haptic("light");
      return;
    }

    // backend is canonical; if no tutorial exists, do not auto-open for legacy users
    if (!_tutorial || !_tutorial.exists || !_tutorial.started) {
      log("No active backend tutorial; skipping onboarding modal");
      return;
    }

    steps = buildStepsFromTutorial(_tutorial);
    if (!steps.length) {
      markDone();
      return;
    }

    if (!force && !shouldShow()) return;

    backEl.hidden = false;
    backEl.style.display = "flex";
    document.body.classList.add("ob-lock");

    idx = 0;
    render();
    haptic("light");
  }

  function close(done) {
    if (_forgeDiscoveryOpen) {
      markForgeDiscoverySeen();
      _forgeDiscoveryOpen = false;
    }
    if (_worldDiscoveryOpen) { void finishWorldDiscovery(false); return; }
    if (done && !firstSignalEnabled()) markDone();
    if (!backEl) return;

    if (_focusedTimer) clearInterval(_focusedTimer);
    _focusedTimer = null;

    backEl.style.display = "none";
    document.body.classList.remove("ob-lock");
    window.ScoutGuide?.refresh();
    try { window.FtueContinuity?.onPresentationClosed?.("onboarding"); } catch (_) {}
  }

  let _worldDiscoveryOpen = false, _worldDiscoveryBusy = false;
  function forgeDiscoverySeen() {
    return lsGet(FORGE_DISCOVERY_KEY) === "1";
  }
  function markForgeDiscoverySeen() {
    lsSet(FORGE_DISCOVERY_KEY, "1");
  }
  function renderForgeDiscovery() {
    if (!bodyEl) return;
    const modalTitle = document.querySelector("#obBack .ob-title");
    if (modalTitle) modalTitle.textContent = "FORGE";
    if (progressFill) progressFill.style.width = "100%";
    if (btnBack) btnBack.style.display = "none";
    if (btnNext) btnNext.style.display = "none";
    if (btnLater) btnLater.style.display = "block";
    bodyEl.innerHTML = `
      <div class="ob-card">
        <div class="ob-icon">⚒</div>
        <div class="ob-content">
          <div class="ob-step">DISCOVERY</div>
          <div class="ob-head">YOUR GEAR DOESN'T HAVE TO STAY THE WAY YOU FOUND IT.</div>
          <div class="ob-p">Use the Forge when you're ready to improve it.</div>
          <button class="ob-btn primary" id="obForgeContinue" style="margin-top:14px;width:100%" type="button">Continue</button>
          <button class="ob-btn ghost" id="obForgeOpen" style="margin-top:8px;width:100%" type="button">Open Forge</button>
        </div>
      </div>`;
    const cont = document.getElementById("obForgeContinue");
    const openBtn = document.getElementById("obForgeOpen");
    if (cont) cont.onclick = () => runFocusedAction("forge_continue");
    if (openBtn) openBtn.onclick = () => runFocusedAction("forge_open");
  }
  async function showForgeDiscovery() {
    if (focusedState().state !== "COMPLETED" || focusedState().world_discovery !== "pending") {
      return showWorldDiscovery();
    }
    if (forgeDiscoverySeen()) return showWorldDiscovery();
    _forgeDiscoveryOpen = true;
    ensureCSS(); ensureHTML();
    backEl.hidden = false;
    backEl.style.display = "flex";
    document.body.classList.add("ob-lock");
    renderForgeDiscovery();
    return true;
  }
  async function continueForgeDiscovery() {
    markForgeDiscoverySeen();
    _forgeDiscoveryOpen = false;
    return showWorldDiscovery();
  }
  async function openForgeFromDiscovery() {
    markForgeDiscoverySeen();
    _forgeDiscoveryOpen = false;
    close(false);
    try {
      if (window.ContextualDiscovery && typeof window.ContextualDiscovery.openDestination === "function") {
        return await window.ContextualDiscovery.openDestination("forge") === true;
      }
      if (typeof window.Forge?.open === "function") {
        window.HomeNav?.closeAll?.();
        return await window.Forge.open() !== false;
      }
    } catch (e) {
      log("forge discovery open failed", e);
    }
    return false;
  }
  async function showWorldDiscovery() {
    if (focusedState().world_discovery !== "pending") { close(false); return false; }
    _worldDiscoveryOpen = false;
    close(false);
    const started = window.GuidedNavigation?.start("bloodmoon") === true;
    if (!started) return false;
    try {
      if (typeof window.showSection === "function") await window.showSection("map");
    } catch (e) {
      log("world discovery map route failed", e);
    }
    window.GuidedNavigation?.refresh?.();
    return true;
  }

  async function finishWorldDiscovery() {
    window.GuidedNavigation?.dismiss("bloodmoon");
    _worldDiscoveryOpen = false;
    close(false);
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost || window.apiPost || null;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    ensureCSS();
    ensureHTML();

    window.openOnboarding = (force = false) => open(!!force);
    window.maybeOpenOnboarding = () => open(false);
    window.refreshOnboarding = () => refreshSteps(true);
    window.resumeOnboarding = () => open(true);

    log("Alpha Husky Onboarding v4 ready 🐺");
  }

  function boot() {
    init({ apiPost: window.apiPost, tg: window.Telegram?.WebApp || null, dbg: !!window.DBG });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.Onboarding = {
    openGuided,
    afterManualEquip,
    init,
    open,
    close,
    showForgeDiscovery,
    forgeDiscoverySeen,
    refresh: () => refreshSteps(true),
    refresh: () => refreshSteps(true),
    refreshContinuity: async () => {
      await fetchTutorialState(true);
      await fetchFirstSignalMissionState(true);
      if (isOpen()) render();
    },
    isOpen,
    getTutorial: () => _tutorial,
    getFirstSignal: () => {
      const merged = focusedState();
      if (_tutorial?.first_signal && typeof _tutorial.first_signal === "object") {
        return {
          ..._tutorial.first_signal,
          ...merged,
          eligible: _tutorial.first_signal.eligible === true || firstSignalEnabled()
        };
      }
      return {
        ...merged,
        eligible: firstSignalEnabled()
      };
    }
  };
})();
