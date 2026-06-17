(function () {
  const STORAGE_KEY = "alpha_husky_den_preview_v1";
  const ROOT_ID = "alphaDenRoot";
  const STYLE_ID = "alphaDenStyles";
  const BUILDING_ORDER = ["signal_core", "pet_kennel", "war_table"];
  const MAX_BUILD_LEVEL = 3;
  const BUILD_LEVELS = {
    1: { cost: { bones: 7500, scrap: 100 }, buildSeconds: 43200 },
    2: { cost: { bones: 22500, scrap: 300 }, buildSeconds: 86400 },
    3: { cost: { bones: 50000, scrap: 650 }, buildSeconds: 172800 }
  };
  const SIGNAL_CORE_BENEFITS = {
    1: {
      level: 1,
      cooldownSeconds: 64800,
      rewardPreview: { scrapMin: 8, scrapMax: 14, bones: 0 },
      label: "Recover 8-14 Scrap every 18h."
    },
    2: {
      level: 2,
      cooldownSeconds: 64800,
      rewardPreview: { scrapMin: 12, scrapMax: 20, bones: 50 },
      label: "Recover 12-20 Scrap + 50 Bones every 18h."
    },
    3: {
      level: 3,
      cooldownSeconds: 50400,
      rewardPreview: { scrapMin: 18, scrapMax: 30, bones: 75 },
      label: "Recover 18-30 Scrap + 75 Bones every 14h."
    }
  };
  const WAR_TABLE_BRIEF_LEVELS = {
    1: { durationSeconds: 21600 },
    2: { durationSeconds: 21600 },
    3: { durationSeconds: 14400 }
  };

  const DEFAULT_STATE = {
    denLevel: 1,
    buildings: {
      signal_core: { level: 0 },
      pet_kennel: { level: 0 },
      war_table: { level: 0 }
    }
  };

  const DEN_BUILDINGS = {
    signal_core: {
      id: "signal_core",
      name: "Signal Core",
      unbuiltName: "Empty Signal Conduit",
      level1Name: "Primitive Signal Core",
      unbuiltCopy: "An empty relay point waiting for its first signal engine.",
      level1Copy: "Primitive Signal Core online. Future scans and signal charge will connect here.",
      role: "Future source of signal charge, scans, and Den energy.",
      buildTimeLabel: "Level 1 build time: 12h",
      costPreview: "Level 1 cost: 7500 Bones + 100 Scrap",
      positionLabel: "Back wall cable relay point",
      x: 62,
      y: 40,
      labelX: 72,
      labelY: 27,
      overlayStyle: "left:62.5%; top:38.5%; width:32%; transform:translate(-50%, -50%) rotate(-1.5deg) scale(1.12);",
      mobilePlacement: {
        hotspotX: 66,
        hotspotY: 39,
        labelX: 74,
        labelY: 28,
        overlayLeft: 65,
        overlayTop: 38,
        overlayWidth: 34,
        overlayTransform: "translate(-50%, -50%) rotate(-1.5deg) scale(1.12)"
      },
      glyph: "SC"
    },
    pet_kennel: {
      id: "pet_kennel",
      name: "Pet Kennel",
      unbuiltName: "Empty Pack Corner",
      level1Name: "Scrap Pet Kennel",
      unbuiltCopy: "An empty pack corner. Your active pet will eventually rest and train here.",
      level1Copy: "Scrap Pet Kennel built. Future pet training and expeditions will connect here.",
      role: "Future pet resting, training, and expedition space.",
      buildTimeLabel: "Level 1 build time: 12h",
      costPreview: "Level 1 cost: 7500 Bones + 100 Scrap",
      positionLabel: "Lower-left pack corner",
      x: 24,
      y: 75,
      labelX: 18,
      labelY: 84,
      overlayStyle: "left:25%; top:75.5%; width:49%; transform:translate(-50%, -50%) rotate(-2deg) scale(1.14);",
      mobilePlacement: {
        hotspotX: 27,
        hotspotY: 75,
        labelX: 20,
        labelY: 84,
        overlayLeft: 28,
        overlayTop: 76,
        overlayWidth: 51,
        overlayTransform: "translate(-50%, -50%) rotate(-2deg) scale(1.14)"
      },
      glyph: "PK"
    },
    war_table: {
      id: "war_table",
      name: "War Table",
      unbuiltName: "Empty Tactical Floor",
      level1Name: "Field War Table",
      unbuiltCopy: "An empty command spot. Future faction orders will be planned here.",
      level1Copy: "Field War Table assembled. Future SITREP orders and strategy will connect here.",
      role: "Future faction orders, SITREP planning, and map strategy space.",
      buildTimeLabel: "Level 1 build time: 12h",
      costPreview: "Level 1 cost: 7500 Bones + 100 Scrap",
      positionLabel: "Right-side table surface",
      x: 78,
      y: 62,
      labelX: 83,
      labelY: 51,
      overlayStyle: "left:78%; top:63%; width:42%; transform:translate(-50%, -50%) rotate(-3deg) scale(1.08);",
      mobilePlacement: {
        hotspotX: 81,
        hotspotY: 62,
        labelX: 84,
        labelY: 52,
        overlayLeft: 80,
        overlayTop: 63,
        overlayWidth: 44,
        overlayTransform: "translate(-50%, -50%) rotate(-3deg) scale(1.08)"
      },
      glyph: "WT"
    }
  };

  const DEN_ASSETS = {
    roomBackground: "images/alpha_den/den_background_empty.webp",
    signal_core: {
      unbuilt: "",
      l1: "images/alpha_den/signal_core_l1.png",
      l3: "",
      l5: "",
      l7: "",
      l9: ""
    },
    pet_kennel: {
      unbuilt: "",
      l1: "images/alpha_den/pet_kennel_l1.png",
      l3: "",
      l5: "",
      l7: "",
      l9: ""
    },
    war_table: {
      unbuilt: "",
      l1: "images/alpha_den/war_table_l1.png",
      l3: "",
      l5: "",
      l7: "",
      l9: ""
    }
  };

  let currentState = null;
  let memoryState = cloneState(DEFAULT_STATE);
  let selectedBuildingId = BUILDING_ORDER[0];
  let isOpen = false;
  let domReadyQueued = false;
  let serverState = null;
  let usingServerState = false;
  let lastSyncError = "";
  let lastActionMessage = "";
  let isActionBusy = false;
  let syncPromise = null;

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeLevel(raw) {
    const level = Number(raw);
    if (!Number.isFinite(level) || level < 0) return 0;
    return Math.floor(level);
  }

  function sanitizeState(raw) {
    const next = cloneState(DEFAULT_STATE);
    if (!raw || typeof raw !== "object") return next;

    next.denLevel = normalizeLevel(raw.denLevel) || 1;
    for (const id of BUILDING_ORDER) {
      next.buildings[id].level = normalizeLevel(raw?.buildings?.[id]?.level);
    }
    return next;
  }

  function readStoredState() {
    try {
      if (!window.localStorage) return null;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return sanitizeState(JSON.parse(raw));
    } catch (_) {
      return null;
    }
  }

  function ensureState() {
    if (!currentState) {
      currentState = sanitizeState(readStoredState() || memoryState);
    }
    return currentState;
  }

  function getApiPost() {
    const fn = window.apiPost || window.S?.apiPost || window.AH?.apiPost || null;
    return typeof fn === "function" ? fn : null;
  }

  function asUnix(value) {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : null;
  }

  function asCount(value) {
    const num = Number(value);
    return Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0;
  }

  function notify(message) {
    const text = String(message || "").trim();
    if (!text) return;
    try {
      if (typeof window.showToast === "function") {
        window.showToast(text);
        return;
      }
      if (typeof window.toast === "function") {
        window.toast(text);
        return;
      }
      if (typeof window.notify === "function") {
        window.notify(text);
        return;
      }
      if (typeof window.showNotice === "function") {
        window.showNotice(text);
        return;
      }
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(text);
        return;
      }
    } catch (_) {}
    try { console.warn(text); } catch (_) {}
  }

  function formatDuration(seconds) {
    const total = Math.max(0, asCount(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (mins > 0) return `${mins}m ${String(secs).padStart(2, "0")}s`;
    return `${secs}s`;
  }

  function formatCost(cost) {
    if (!cost || typeof cost !== "object") return "No cost";
    const parts = [];
    const bones = asCount(cost.bones);
    const scrap = asCount(cost.scrap);
    if (bones > 0) parts.push(`${bones} Bones`);
    if (scrap > 0) parts.push(`${scrap} Scrap`);
    return parts.length ? parts.join(" + ") : "No cost";
  }

  function formatMissingResources(missing) {
    if (!missing || typeof missing !== "object") return "";
    const parts = [];
    const bones = asCount(missing.bones);
    const scrap = asCount(missing.scrap);
    if (bones > 0) parts.push(`Missing ${bones} Bones`);
    if (scrap > 0) parts.push(`Missing ${scrap} Scrap`);
    return parts.join(" | ");
  }

  function formatReadyTime(unixTs) {
    const ts = asUnix(unixTs);
    if (!ts) return "";
    try {
      return new Date(ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (_) {
      return "";
    }
  }

  function formatSignalCacheReward(reward) {
    const scrap = asCount(reward?.scrap);
    const bones = asCount(reward?.bones);
    if (scrap <= 0 && bones <= 0) return "No reward";
    if (scrap > 0 && bones > 0) return `${scrap} Scrap + ${bones} Bones`;
    if (scrap > 0) return `${scrap} Scrap`;
    return `${bones} Bones`;
  }

  function normalizeSignalCacheBenefit(raw) {
    if (!raw || typeof raw !== "object") return null;
    const preview = raw?.rewardPreview && typeof raw.rewardPreview === "object"
      ? {
          scrapMin: asCount(raw.rewardPreview.scrapMin),
          scrapMax: asCount(raw.rewardPreview.scrapMax),
          bones: asCount(raw.rewardPreview.bones)
        }
      : { scrapMin: 0, scrapMax: 0, bones: 0 };
    const level = asCount(raw.level);
    const cooldownSeconds = asCount(raw.cooldownSeconds);
    const label = String(raw.label || "").trim();
    if (level <= 0 && cooldownSeconds <= 0 && !label && preview.scrapMin <= 0 && preview.scrapMax <= 0 && preview.bones <= 0) {
      return null;
    }
    return {
      level,
      cooldownSeconds,
      rewardPreview: preview,
      label
    };
  }

  function getSignalCoreBenefitForLevel(level) {
    const src = SIGNAL_CORE_BENEFITS[asCount(level)];
    return src ? normalizeSignalCacheBenefit(src) : null;
  }

  function getNextSignalCoreBenefitForLevel(level) {
    const currentLevel = asCount(level);
    if (currentLevel <= 0) return getSignalCoreBenefitForLevel(1);
    if (currentLevel >= MAX_BUILD_LEVEL) return null;
    return getSignalCoreBenefitForLevel(currentLevel + 1);
  }

  function formatSignalCoreBenefit(benefit) {
    const text = String(benefit?.label || "").trim();
    return text || "No recovery unlocked.";
  }

  function formatSignalCacheLastRecovered(reward) {
    const label = formatSignalCacheReward(reward);
    return label === "No reward" ? "No recovered cache yet." : label;
  }

  function formatSignalCachePreview(preview) {
    const scrapMin = asCount(preview?.scrapMin);
    const scrapMax = asCount(preview?.scrapMax);
    const bones = asCount(preview?.bones);
    const scrapLabel = scrapMin > 0 || scrapMax > 0
      ? `${scrapMin}-${Math.max(scrapMin, scrapMax)} Scrap`
      : "";
    if (scrapLabel && bones > 0) return `${scrapLabel} + ${bones} Bones`;
    return scrapLabel || (bones > 0 ? `${bones} Bones` : "No reward");
  }

  function formatLongDuration(seconds) {
    const total = Math.max(0, asCount(seconds));
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const mins = Math.floor((total % 3600) / 60);
    if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    if (mins > 0) return `${mins}m`;
    return `${total}s`;
  }

  function isCompactMobileViewport() {
    try {
      return !!window.matchMedia && window.matchMedia("(max-width: 640px)").matches;
    } catch (_) {
      return false;
    }
  }

  function buildOverlayStyle(left, top, width, transform) {
    const parts = [];
    if (Number.isFinite(left)) parts.push(`left:${left}%`);
    if (Number.isFinite(top)) parts.push(`top:${top}%`);
    if (Number.isFinite(width)) parts.push(`width:${width}%`);
    if (transform) parts.push(`transform:${transform}`);
    return parts.length ? `${parts.join(";")};` : "";
  }

  function getPlacement(config) {
    const mobile = isCompactMobileViewport() ? (config.mobilePlacement || null) : null;
    const hotspotX = Number.isFinite(Number(mobile?.hotspotX)) ? Number(mobile.hotspotX) : Number(config.x);
    const hotspotY = Number.isFinite(Number(mobile?.hotspotY)) ? Number(mobile.hotspotY) : Number(config.y);
    const labelX = Number.isFinite(Number(mobile?.labelX))
      ? Number(mobile.labelX)
      : (Number.isFinite(Number(config.labelX)) ? Number(config.labelX) : hotspotX);
    const labelY = Number.isFinite(Number(mobile?.labelY))
      ? Number(mobile.labelY)
      : (Number.isFinite(Number(config.labelY)) ? Number(config.labelY) : hotspotY);

    if (mobile) {
      return {
        hotspotX,
        hotspotY,
        labelX,
        labelY,
        overlayStyle: buildOverlayStyle(
          Number(mobile.overlayLeft),
          Number(mobile.overlayTop),
          Number(mobile.overlayWidth),
          String(mobile.overlayTransform || "").trim()
        ) || config.overlayStyle || ""
      };
    }

    return {
      hotspotX,
      hotspotY,
      labelX,
      labelY,
      overlayStyle: config.overlayStyle || ""
    };
  }

  function getSceneStateLabel(display) {
    if (!display || typeof display !== "object") return "L0";
    if (display.stateLabel === "Build ready") return "Ready";
    if (display.stateLabel === "Building") return "Building";
    if (display.isMaxLevel) return `L${asCount(display.level)} Max`;
    return `L${asCount(display.level)}`;
  }

  function makeRunId(action, buildingId) {
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `alpha_den:${String(action || "action")}:${String(buildingId || "building")}:${stamp}:${rand}`;
  }

  function makeApiError(out, fallback) {
    const err = new Error(String(out?.error || out?.reason || fallback || "REQUEST_FAILED"));
    err.data = out || null;
    return err;
  }

  function humanizeReason(reason) {
    const code = String(reason || "").trim().toUpperCase();
    if (code === "APIPOST MISSING") return "Local preview only. Connect live backend to test real construction.";
    if (code === "BUILD_DISABLED") return "Build system disabled for this test window";
    if (code === "TRAINING_DISABLED") return "Pet Training coming soon.";
    if (code === "FEATURE_DISABLED") return "This Alpha Den feature is currently disabled.";
    if (code === "INVALID_BUILDING") return "That build zone is unavailable right now.";
    if (code === "ALREADY_BUILT") return "This structure is already built.";
    if (code === "ALREADY_BUILDING") return "This structure is already building.";
    if (code === "ALREADY_TRAINING") return "Pet Training is already active.";
    if (code === "CLAIM_REQUIRED") return "Pet Training is ready. Claim Pet XP.";
    if (code === "ALREADY_PREPARING") return "Tactical Brief is already preparing.";
    if (code === "BRIEF_CLAIM_REQUIRED") return "Tactical Brief is ready. Claim the latest note first.";
    if (code === "INSUFFICIENT_RESOURCES") return "Not enough Bones or Scrap for this build.";
    if (code === "KENNEL_REQUIRED") return "Build Pet Kennel to unlock training.";
    if (code === "KENNEL_UNDER_CONSTRUCTION" || code === "BUILDING_UNDER_CONSTRUCTION") return "Pet Training is offline while Pet Kennel is under construction.";
    if (code === "SIGNAL_CORE_REQUIRED" || code === "LOCKED") return "Build Signal Core Level 1 to unlock Signal Cache.";
    if (code === "SIGNAL_CORE_UNDER_CONSTRUCTION") return "Signal Cache is offline while Signal Core is under construction.";
    if (code === "WAR_TABLE_REQUIRED") return "Build War Table Level 1 to unlock Tactical Brief.";
    if (code === "WAR_TABLE_UNDER_CONSTRUCTION") return "Tactical Brief is offline while War Table is under construction.";
    if (code === "MAX_LEVEL_REACHED") return "This structure is at max level for this phase.";
    if (code === "NO_ACTIVE_PET") return "Set an active pet before starting training.";
    if (code === "NO_ACTIVE_TRAINING") return "No Pet Training is active right now.";
    if (code === "NO_ACTIVE_BRIEF") return "No Tactical Brief is active right now.";
    if (code === "NOT_BUILDING") return "This structure is not building right now.";
    if (code === "NOT_READY") return "This timer is not ready yet.";
    if (code === "PET_NOT_FOUND") return "The trained pet is unavailable right now.";
    if (code === "STATE_ERROR" || code === "ACTION_FAILED") return "Alpha Den is unavailable right now.";
    if (code === "STATE_FAIL" || code === "DEN_STATE_INVALID") return "Live Den state is unavailable right now.";
    if (code === "USER_NOT_FOUND" || code === "USER_NOT_REGISTERED" || code === "USER_NOT_FOUND") return "Your live Den state is not ready yet.";
    return "Alpha Den is unavailable right now.";
  }

  function buildActionMessage(data, fallbackReason) {
    const code = String(data?.error || data?.reason || fallbackReason || "").trim().toUpperCase();
    if (code === "INSUFFICIENT_RESOURCES") {
      const missing = formatMissingResources(data?.missingResources);
      return missing || "Not enough Bones or Scrap for this build.";
    }
    if (code === "NOT_READY") {
      const secondsRemaining = asCount(data?.secondsRemaining);
      return secondsRemaining > 0
        ? `Not ready yet. Ready in ${formatLongDuration(secondsRemaining)}.`
        : "Not ready yet.";
    }
    return humanizeReason(code);
  }

  function normalizePetKennelTraining(raw) {
    const activePet = raw?.activePet && typeof raw.activePet === "object"
      ? {
          petId: String(raw.activePet.petId || "").trim(),
          name: String(raw.activePet.name || "").trim(),
          type: String(raw.activePet.type || "").trim(),
          level: Math.max(0, asCount(raw.activePet.level))
        }
      : null;

    return {
      trainingEnabled: !!raw?.trainingEnabled,
      buildingUnderConstruction: !!raw?.buildingUnderConstruction,
      petKennelLevel: asCount(raw?.petKennelLevel),
      activePet,
      trainingStatus: String(raw?.trainingStatus || raw?.status || "").trim().toLowerCase() || "idle",
      status: String(raw?.status || "").trim().toLowerCase() || "idle",
      canTrain: !!raw?.canTrain,
      canClaim: !!raw?.canClaim,
      reason: String(raw?.reason || "").trim(),
      secondsRemaining: asCount(raw?.secondsRemaining),
      readyAt: asUnix(raw?.readyAt),
      claimedAt: asUnix(raw?.claimedAt),
      rewardPetXp: asCount(raw?.rewardPetXp),
      trainingType: String(raw?.trainingType || "").trim(),
      durationSeconds: asCount(raw?.durationSeconds),
      startedAt: asUnix(raw?.startedAt),
      targetKennelLevel: raw?.targetKennelLevel == null ? null : asCount(raw?.targetKennelLevel),
      activeTrainingPetId: String(raw?.activeTrainingPetId || "").trim(),
      activeTrainingPetName: String(raw?.activeTrainingPetName || "").trim()
    };
  }

  function normalizeSignalCache(raw) {
    const preview = raw?.rewardPreview && typeof raw.rewardPreview === "object"
      ? {
          scrapMin: asCount(raw.rewardPreview.scrapMin),
          scrapMax: asCount(raw.rewardPreview.scrapMax),
          bones: asCount(raw.rewardPreview.bones)
        }
      : { scrapMin: 0, scrapMax: 0, bones: 0 };

    const lastReward = raw?.lastReward && typeof raw.lastReward === "object"
      ? {
          scrap: asCount(raw.lastReward.scrap),
          bones: asCount(raw.lastReward.bones)
        }
      : { scrap: 0, bones: 0 };

    return {
      featureEnabled: !!raw?.featureEnabled,
      buildingUnderConstruction: !!raw?.buildingUnderConstruction,
      signalCoreLevel: asCount(raw?.signalCoreLevel),
      cacheStatus: String(raw?.cacheStatus || raw?.status || "").trim().toLowerCase() || "locked",
      status: String(raw?.status || raw?.cacheStatus || "").trim().toLowerCase() || "locked",
      canClaim: !!raw?.canClaim,
      reason: String(raw?.reason || "").trim(),
      secondsRemaining: asCount(raw?.secondsRemaining),
      nextReadyAt: asUnix(raw?.nextReadyAt),
      lastClaimedAt: asUnix(raw?.lastClaimedAt),
      lastReward,
      rewardPreview: preview,
      cooldownSeconds: asCount(raw?.cooldownSeconds),
      currentBenefit: normalizeSignalCacheBenefit(raw?.currentBenefit),
      nextBenefit: normalizeSignalCacheBenefit(raw?.nextBenefit),
      sourceLevel: raw?.sourceLevel == null ? null : asCount(raw?.sourceLevel),
      claimedCount: asCount(raw?.claimedCount),
      version: String(raw?.version || "").trim()
    };
  }

  function normalizeWarTableBrief(raw) {
    const lastBrief = raw?.lastBrief && typeof raw.lastBrief === "object"
      ? {
          title: String(raw.lastBrief.title || "").trim(),
          message: String(raw.lastBrief.message || "").trim()
        }
      : null;

    return {
      featureEnabled: !!raw?.featureEnabled,
      buildingUnderConstruction: !!raw?.buildingUnderConstruction,
      warTableLevel: asCount(raw?.warTableLevel),
      briefStatus: String(raw?.briefStatus || raw?.status || "").trim().toLowerCase() || "idle",
      status: String(raw?.status || raw?.briefStatus || "").trim().toLowerCase() || "idle",
      canStart: !!raw?.canStart,
      canClaim: !!raw?.canClaim,
      reason: String(raw?.reason || "").trim(),
      secondsRemaining: asCount(raw?.secondsRemaining),
      startedAt: asUnix(raw?.startedAt),
      readyAt: asUnix(raw?.readyAt),
      claimedAt: asUnix(raw?.claimedAt),
      sourceLevel: raw?.sourceLevel == null ? null : asCount(raw?.sourceLevel),
      lastBrief,
      durationSeconds: asCount(raw?.durationSeconds),
      version: String(raw?.version || "").trim()
    };
  }

  function normalizeServerState(raw) {
    if (!raw || typeof raw !== "object" || !raw.buildings || typeof raw.buildings !== "object") return null;

    const next = {
      version: asCount(raw.version) || 1,
      denLevel: Math.max(1, asCount(raw.denLevel) || 1),
      buildEnabled: !!raw.buildEnabled,
      warTableEnabled: !!raw.warTableEnabled,
      now: asUnix(raw.now) || Math.floor(Date.now() / 1000),
      balances: {
        bones: asCount(raw?.balances?.bones),
        scrap: asCount(raw?.balances?.scrap)
      },
      petKennelTraining: normalizePetKennelTraining(raw?.petKennelTraining || null),
      signalCache: normalizeSignalCache(raw?.signalCache || null),
      warTableBrief: normalizeWarTableBrief(raw?.warTableBrief || null),
      buildings: {}
    };

    for (const id of BUILDING_ORDER) {
      const src = raw.buildings[id] || {};
        next.buildings[id] = {
          id,
          name: String(src.name || DEN_BUILDINGS[id]?.name || id),
          level: asCount(src.level),
          maxLevel: asCount(src.maxLevel) || MAX_BUILD_LEVEL,
          uiStatus: String(src.uiStatus || "").trim().toLowerCase() || (asCount(src.level) > 0 ? "built" : "unbuilt"),
          rawStatus: String(src.rawStatus || src.status || "").trim().toLowerCase() || "idle",
          targetLevel: src.targetLevel == null ? null : asCount(src.targetLevel),
          buildStartedAt: asUnix(src.buildStartedAt),
          buildReadyAt: asUnix(src.buildReadyAt),
          lastClaimedAt: asUnix(src.lastClaimedAt),
        secondsRemaining: asCount(src.secondsRemaining),
        canStart: !!src.canStart,
          canClaim: !!src.canClaim,
          nextLevel: src.nextLevel == null ? null : asCount(src.nextLevel),
          nextCost: src.nextCost && typeof src.nextCost === "object"
            ? { bones: asCount(src.nextCost.bones), scrap: asCount(src.nextCost.scrap) }
            : null,
          buildSeconds: asCount(src.buildSeconds),
          hasResources: src.hasResources !== false,
          enoughResources: src.enoughResources == null ? src.hasResources !== false : !!src.enoughResources,
          isMaxLevel: !!src.isMaxLevel,
          missingResources: src.missingResources && typeof src.missingResources === "object"
            ? { bones: asCount(src.missingResources.bones), scrap: asCount(src.missingResources.scrap) }
            : null
        };
      }

    return next;
  }

  function getLocalBuildingState(buildingId) {
    const local = ensureState()?.buildings?.[buildingId] || {};
    const level = normalizeLevel(local.level);
    const nextLevel = level < MAX_BUILD_LEVEL ? level + 1 : null;
    const nextBuild = nextLevel ? BUILD_LEVELS[nextLevel] : null;
    return {
      id: buildingId,
      name: DEN_BUILDINGS[buildingId]?.name || buildingId,
      level,
      maxLevel: MAX_BUILD_LEVEL,
      uiStatus: level >= 1 ? "built" : "unbuilt",
      rawStatus: "idle",
      targetLevel: null,
      buildStartedAt: null,
      buildReadyAt: null,
      lastClaimedAt: null,
      secondsRemaining: 0,
      canStart: level < MAX_BUILD_LEVEL,
      canClaim: false,
      nextLevel,
      nextCost: nextBuild ? cloneState(nextBuild.cost) : null,
      buildSeconds: nextBuild ? asCount(nextBuild.buildSeconds) : 0,
      hasResources: true,
      enoughResources: true,
      isMaxLevel: level >= MAX_BUILD_LEVEL,
      missingResources: null
    };
  }

  function getEffectiveState() {
    if (usingServerState && serverState?.buildings) return serverState;
    return ensureState();
  }

  function getEffectiveBuildingState(buildingId) {
    if (usingServerState && serverState?.buildings?.[buildingId]) {
      return serverState.buildings[buildingId];
    }
    return getLocalBuildingState(buildingId);
  }

  function getEffectivePetKennelTraining() {
    if (usingServerState && serverState?.petKennelTraining) {
      return serverState.petKennelTraining;
    }
    const level = getBuildingLevel("pet_kennel");
    return {
      trainingEnabled: false,
      buildingUnderConstruction: false,
      petKennelLevel: level,
      activePet: null,
      trainingStatus: level > 0 ? "disabled" : "locked",
      status: "idle",
      canTrain: false,
      canClaim: false,
      reason: level > 0 ? "TRAINING_DISABLED" : "KENNEL_REQUIRED",
      secondsRemaining: 0,
      readyAt: null,
      claimedAt: null,
      rewardPetXp: level >= 3 ? 100 : level >= 2 ? 45 : level >= 1 ? 30 : 0,
      trainingType: level >= 3 ? "Reinforced Training" : level >= 2 ? "Basic Training+" : level >= 1 ? "Basic Training" : "",
      durationSeconds: level >= 3 ? 21600 : level >= 1 ? 10800 : 0,
      startedAt: null,
      targetKennelLevel: level > 0 ? level : null,
      activeTrainingPetId: "",
      activeTrainingPetName: ""
    };
  }

  function getWarTableBriefPreviewForLevel(level) {
    const durationSeconds = level >= 3 ? 14400 : level >= 1 ? 21600 : 0;
    return {
      featureEnabled: false,
      buildingUnderConstruction: false,
      warTableLevel: level,
      briefStatus: level > 0 ? "disabled" : "locked",
      status: level > 0 ? "disabled" : "locked",
      canStart: false,
      canClaim: false,
      reason: level > 0 ? "FEATURE_DISABLED" : "WAR_TABLE_REQUIRED",
      secondsRemaining: 0,
      startedAt: null,
      readyAt: null,
      claimedAt: null,
      sourceLevel: level > 0 ? level : null,
      lastBrief: level > 0
        ? {
            title: "Tactical Brief",
            message: "War Table calibrated. The next signal is easier to read."
          }
        : null,
      durationSeconds,
      version: "p2e_war_table_brief_v1"
    };
  }

  function getEffectiveWarTableBrief() {
    if (usingServerState && serverState?.warTableBrief) {
      return serverState.warTableBrief;
    }
    return getWarTableBriefPreviewForLevel(getBuildingLevel("war_table"));
  }

  function getSignalCachePreviewForLevel(level) {
    const currentBenefit = getSignalCoreBenefitForLevel(level);
    const nextBenefit = getNextSignalCoreBenefitForLevel(level);
    if (level >= 3) {
      return {
        featureEnabled: false,
        buildingUnderConstruction: false,
        signalCoreLevel: level,
        cacheStatus: level > 0 ? "disabled" : "locked",
        status: level > 0 ? "disabled" : "locked",
        canClaim: false,
        reason: level > 0 ? "FEATURE_DISABLED" : "SIGNAL_CORE_REQUIRED",
        secondsRemaining: 0,
        nextReadyAt: null,
        lastClaimedAt: null,
        lastReward: { scrap: 0, bones: 0 },
        rewardPreview: { scrapMin: 18, scrapMax: 30, bones: 75 },
        cooldownSeconds: 50400,
        currentBenefit,
        nextBenefit,
        sourceLevel: level > 0 ? level : null,
        claimedCount: 0,
        version: "p2b_signal_cache_v1"
      };
    }
    if (level >= 2) {
      return {
        featureEnabled: false,
        buildingUnderConstruction: false,
        signalCoreLevel: level,
        cacheStatus: "disabled",
        status: "disabled",
        canClaim: false,
        reason: "FEATURE_DISABLED",
        secondsRemaining: 0,
        nextReadyAt: null,
        lastClaimedAt: null,
        lastReward: { scrap: 0, bones: 0 },
        rewardPreview: { scrapMin: 12, scrapMax: 20, bones: 50 },
        cooldownSeconds: 64800,
        currentBenefit,
        nextBenefit,
        sourceLevel: level,
        claimedCount: 0,
        version: "p2b_signal_cache_v1"
      };
    }
    if (level >= 1) {
      return {
        featureEnabled: false,
        buildingUnderConstruction: false,
        signalCoreLevel: level,
        cacheStatus: "disabled",
        status: "disabled",
        canClaim: false,
        reason: "FEATURE_DISABLED",
        secondsRemaining: 0,
        nextReadyAt: null,
        lastClaimedAt: null,
        lastReward: { scrap: 0, bones: 0 },
        rewardPreview: { scrapMin: 8, scrapMax: 14, bones: 0 },
        cooldownSeconds: 64800,
        currentBenefit,
        nextBenefit,
        sourceLevel: level,
        claimedCount: 0,
        version: "p2b_signal_cache_v1"
      };
    }
    return {
      featureEnabled: false,
      buildingUnderConstruction: false,
      signalCoreLevel: 0,
      cacheStatus: "locked",
      status: "locked",
      canClaim: false,
      reason: "SIGNAL_CORE_REQUIRED",
      secondsRemaining: 0,
      nextReadyAt: null,
      lastClaimedAt: null,
      lastReward: { scrap: 0, bones: 0 },
      rewardPreview: { scrapMin: 0, scrapMax: 0, bones: 0 },
      cooldownSeconds: 0,
      currentBenefit: null,
      nextBenefit,
      sourceLevel: null,
      claimedCount: 0,
      version: "p2b_signal_cache_v1"
    };
  }

  function getEffectiveSignalCache() {
    if (usingServerState && serverState?.signalCache) {
      return serverState.signalCache;
    }
    return getSignalCachePreviewForLevel(getBuildingLevel("signal_core"));
  }

  async function refreshServerState({ rerender = true } = {}) {
    const apiPost = getApiPost();
    if (!apiPost) {
      usingServerState = false;
      serverState = null;
      lastSyncError = "apiPost missing";
      if (rerender && isOpen) render(selectedBuildingId);
      return null;
    }
    if (syncPromise) return syncPromise;

    syncPromise = (async () => {
      try {
        const out = await apiPost("/webapp/den/state", {});
        if (!out || out.ok === false) throw makeApiError(out, "STATE_FAIL");
        const payload = normalizeServerState(out.alphaDen || out?.data?.alphaDen || out?.data || out);
        if (!payload) throw makeApiError(out, "DEN_STATE_INVALID");
        serverState = payload;
        usingServerState = true;
        lastSyncError = "";
        return payload;
      } catch (err) {
        usingServerState = false;
        serverState = null;
        lastSyncError = String(err?.data?.reason || err?.message || "STATE_FAIL");
        return null;
      } finally {
        syncPromise = null;
        if (rerender && isOpen) render(selectedBuildingId);
      }
    })();

    return syncPromise;
  }

  async function runServerAction(path, buildingId) {
    const apiPost = getApiPost();
    if (!apiPost) {
      notify("Local preview only. Connect live backend to test real construction.");
      return null;
    }
    if (isActionBusy) return null;

    isActionBusy = true;
    render(buildingId);
    try {
      const out = await apiPost(path, {
        buildingId,
        run_id: makeRunId(path.split("/").pop(), buildingId)
      });
      if (!out || out.ok === false) throw makeApiError(out, "ACTION_FAILED");
      const payload = normalizeServerState(out.alphaDen || out?.data?.alphaDen || out?.data || out);
      if (payload) {
        const updatedBuilding = payload?.buildings?.[buildingId] || null;
        const training = payload?.petKennelTraining || null;
        const signalCache = payload?.signalCache || null;
        const warTableBrief = payload?.warTableBrief || null;
        serverState = payload;
        usingServerState = true;
        lastSyncError = "";
        lastActionMessage = path.includes("/build/start")
          ? `Build started${updatedBuilding?.targetLevel ? ` for Level ${updatedBuilding.targetLevel}` : ""}. Use Refresh to update this timer.`
          : path.includes("/build/claim")
            ? `Level ${updatedBuilding?.level || ""} complete. Function coming later.`.replace("Level  complete", "Build claimed")
            : path.includes("/pet-training/start")
              ? `${String(training?.trainingType || "Training").trim() || "Training"} started${training?.activeTrainingPetName ? ` for ${training.activeTrainingPetName}` : ""}. Reward: +${asCount(training?.rewardPetXp)} Pet XP. Refresh to update.`
              : path.includes("/pet-training/claim")
                ? `${String(out?.petName || training?.activeTrainingPetName || "Pet").trim()} claimed +${asCount(out?.rewardPetXp || training?.rewardPetXp)} Pet XP${out?.petLeveledUp ? " and leveled up." : "."}`
                : path.includes("/signal-cache/claim")
                  ? `Recovered ${formatSignalCacheReward(out?.lastReward || signalCache?.lastReward)} from Signal Cache.${signalCache?.nextReadyAt ? " Refresh later when the cache is ready again." : ""}`
                  : path.includes("/war-table/brief/start")
                    ? `Tactical Brief started. Return in ${formatLongDuration(asCount(out?.durationSeconds || warTableBrief?.durationSeconds))}.`
                    : path.includes("/war-table/brief/claim")
                      ? `${String(out?.message || warTableBrief?.lastBrief?.message || "Tactical Brief received.").trim()}`
            : "";
      }
      return out;
    } catch (err) {
      lastActionMessage = buildActionMessage(err?.data, err?.message || "ACTION_FAILED");
      notify(lastActionMessage);
      await refreshServerState({ rerender: false });
      return null;
    } finally {
      isActionBusy = false;
      render(buildingId);
    }
  }

  function persistState() {
    memoryState = sanitizeState(currentState);
    try {
      if (window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState));
      }
    } catch (_) {}
  }

  function clearStoredState() {
    try {
      window.localStorage?.removeItem(STORAGE_KEY);
    } catch (_) {}
  }

  function getTierForLevel(level) {
    const tierLevel = getVisualTierLevel(level);
    if (!tierLevel) return "unbuilt";
    if (tierLevel >= 9) return "legendary";
    if (tierLevel >= 7) return "alpha";
    if (tierLevel >= 5) return "advanced";
    if (tierLevel >= 3) return "reinforced";
    return "primitive";
  }

  function getVisualTierLevel(level) {
    const safeLevel = normalizeLevel(level);
    if (safeLevel <= 0) return 0;
    if (safeLevel >= 9) return 9;
    if (safeLevel >= 7) return 7;
    if (safeLevel >= 5) return 5;
    if (safeLevel >= 3) return 3;
    return 1;
  }

  function getAssetForLevel(buildingId, level) {
    const buildingAssets = DEN_ASSETS?.[buildingId];
    if (!buildingAssets) return "";
    if (normalizeLevel(level) <= 0) return String(buildingAssets.unbuilt || "").trim();

    const targetTier = getVisualTierLevel(level);
    const fallbacks = [9, 7, 5, 3, 1].filter((tier) => tier <= targetTier);
    for (const tier of fallbacks) {
      const assetUrl = String(buildingAssets[`l${tier}`] || "").trim();
      if (assetUrl) return assetUrl;
    }
    return "";
  }

  function queueForDom(callback) {
    if (document.body) {
      callback();
      return true;
    }
    if (domReadyQueued) return false;
    domReadyQueued = true;
    document.addEventListener("DOMContentLoaded", () => {
      domReadyQueued = false;
      callback();
    }, { once: true });
    return false;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
#${ROOT_ID}{
  position:fixed;
  inset:0;
  z-index:1400;
  pointer-events:none;
}
#${ROOT_ID}[data-open="1"]{
  pointer-events:auto;
}
.alpha-den-overlay{
  position:absolute;
  inset:0;
  opacity:0;
  transition:opacity .18s ease;
}
#${ROOT_ID}[data-open="1"] .alpha-den-overlay{
  opacity:1;
}
.alpha-den-shell{
  position:absolute;
  inset:0;
  display:flex;
  align-items:stretch;
  justify-content:center;
  padding:18px;
}
.alpha-den-shell::before,
.alpha-den-shell::after{
  content:"";
  position:absolute;
  pointer-events:none;
}
.alpha-den-shell::before{
  top:18px;
  right:22px;
  width:96px;
  height:96px;
  border-top:1px solid rgba(105,192,255,.26);
  border-right:1px solid rgba(105,192,255,.26);
  opacity:.7;
}
.alpha-den-shell::after{
  left:22px;
  bottom:18px;
  width:112px;
  height:112px;
  border-left:1px solid rgba(255,111,77,.20);
  border-bottom:1px solid rgba(255,111,77,.20);
  opacity:.6;
}
.alpha-den-backdrop{
  position:absolute;
  inset:0;
  border:0;
  background:rgba(2,5,9,.78);
  backdrop-filter:blur(8px);
}
.alpha-den-panel{
  position:relative;
  display:flex;
  flex-direction:column;
  width:min(100%, 980px);
  min-height:min(88vh, 820px);
  margin:auto;
  padding:18px;
  border:1px solid rgba(127,164,196,.22);
  border-radius:24px;
  background:
    linear-gradient(180deg, rgba(8,13,21,.98), rgba(5,9,15,.98)),
    #050910;
  box-shadow:0 28px 90px rgba(0,0,0,.55);
  overflow:hidden;
}
.alpha-den-frame{
  position:relative;
  z-index:1;
  display:flex;
  flex-direction:column;
  gap:16px;
  height:100%;
}
.alpha-den-topbar{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
}
.alpha-den-heading{
  display:flex;
  flex-direction:column;
  gap:6px;
  min-width:0;
}
.alpha-den-kicker{
  font-size:11px;
  font-weight:800;
  letter-spacing:.24em;
  text-transform:uppercase;
  color:#8ea6bf;
}
.alpha-den-title{
  margin:0;
  font-size:clamp(28px, 5vw, 40px);
  line-height:1;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:#f2f6ff;
}
.alpha-den-subtitle{
  margin:0;
  font-size:14px;
  color:#b9c8d8;
}
.alpha-den-topbar-actions{
  display:flex;
  align-items:center;
  gap:10px;
  flex-shrink:0;
}
.alpha-den-btn--back{
  min-height:38px;
}
.alpha-den-btn{
  border:1px solid rgba(154,183,212,.22);
  border-radius:999px;
  background:rgba(10,16,25,.82);
  color:#eff6ff;
  font:inherit;
  cursor:pointer;
  transition:transform .16s ease, border-color .16s ease, background .16s ease;
}
.alpha-den-btn:hover{
  transform:translateY(-1px);
  border-color:rgba(130,191,247,.34);
}
.alpha-den-btn:disabled{
  opacity:.62;
  cursor:default;
  transform:none;
}
.alpha-den-btn--ghost{
  padding:8px 12px;
  font-size:12px;
  background:rgba(11,17,26,.62);
}
.alpha-den-btn--close{
  width:38px;
  height:38px;
  font-size:20px;
  line-height:1;
}
.alpha-den-btn--primary{
  min-height:46px;
  padding:12px 16px;
  font-weight:700;
  letter-spacing:.03em;
  background:
    linear-gradient(180deg, rgba(42,103,149,.92), rgba(20,62,96,.96));
  border-color:rgba(115,193,255,.28);
}
.alpha-den-btn--passive{
  min-height:46px;
  padding:12px 16px;
  background:rgba(16,22,30,.82);
}
.alpha-den-status{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.alpha-den-status__pill{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:32px;
  padding:7px 12px;
  border-radius:999px;
  border:1px solid rgba(117,148,178,.20);
  background:rgba(10,17,26,.74);
  color:#dce7f5;
  font-size:12px;
  text-transform:uppercase;
  letter-spacing:.08em;
}
.alpha-den-status__pill strong{
  color:#f7fbff;
}
.alpha-den-room{
  display:grid;
  grid-template-columns:minmax(0, 1.62fr) minmax(280px, .76fr);
  gap:16px;
  min-height:0;
  flex:1;
}
.alpha-den-room__scene{
  position:relative;
  width:100%;
  min-height:424px;
  aspect-ratio:16 / 9;
  border-radius:24px;
  overflow:hidden;
  border:1px solid rgba(136,162,190,.18);
  background:
    radial-gradient(circle at 50% 12%, rgba(77,132,168,.18), transparent 30%),
    linear-gradient(180deg, rgba(8,14,23,.94), rgba(5,8,13,.98));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.05),
    inset 0 -80px 120px rgba(0,0,0,.38);
}
.alpha-den-room__background,
.alpha-den-room__layer,
.alpha-den-room__overlays{
  position:absolute;
  inset:0;
}
.alpha-den-room__background{
  z-index:0;
  overflow:hidden;
  background:
    linear-gradient(180deg, rgba(18,28,39,.28), rgba(7,10,16,.68));
}
.alpha-den-room__background-img{
  width:100%;
  height:100%;
  display:block;
  object-fit:cover;
  object-position:center 48%;
}
.alpha-den-room__background::before{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(180deg, rgba(5,8,13,.12) 0%, rgba(5,8,13,.06) 26%, rgba(5,8,13,.38) 74%, rgba(2,4,7,.64) 100%),
    radial-gradient(circle at 52% 15%, rgba(255,230,170,.22), rgba(255,230,170,0) 20%),
    linear-gradient(90deg, rgba(2,4,7,.28), rgba(2,4,7,.02) 28%, rgba(2,4,7,.18) 100%);
  opacity:1;
}
.alpha-den-room__background::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(180deg, rgba(255,255,255,.06), transparent 22%),
    radial-gradient(circle at center, rgba(255,245,214,.10), rgba(255,245,214,0) 58%);
  mix-blend-mode:screen;
  opacity:.55;
}
.alpha-den-room__scene::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:
    linear-gradient(180deg, rgba(0,0,0,0) 56%, rgba(0,0,0,.22) 80%, rgba(0,0,0,.46) 100%),
    radial-gradient(circle at 50% 55%, rgba(255,255,255,.04), rgba(255,255,255,0) 42%);
}
.alpha-den-room__overlays{
  z-index:1;
  pointer-events:none;
}
.alpha-den-room__overlay{
  position:absolute;
  transform:translate(-50%, -50%);
  transform-origin:center;
  will-change:transform;
  isolation:isolate;
}
.alpha-den-room__overlay::after{
  content:"";
  position:absolute;
  left:50%;
  bottom:4%;
  width:58%;
  height:16%;
  transform:translateX(-50%);
  border-radius:999px;
  background:radial-gradient(circle, rgba(0,0,0,.44), rgba(0,0,0,0) 72%);
  filter:blur(12px);
  opacity:.72;
  z-index:-1;
}
.alpha-den-room__overlay img{
  display:block;
  width:100%;
  height:auto;
  user-select:none;
  filter:drop-shadow(0 16px 26px rgba(0,0,0,.42));
}
.alpha-den-room__overlay--signal-core{
  z-index:3;
}
.alpha-den-room__overlay--signal-core img{
  filter:drop-shadow(0 14px 22px rgba(0,0,0,.36)) drop-shadow(0 0 18px rgba(255,191,87,.22));
}
.alpha-den-room__overlay--signal-core::after{
  width:46%;
  height:12%;
  bottom:2%;
  opacity:.52;
}
.alpha-den-room__overlay--pet-kennel{
  z-index:2;
}
.alpha-den-room__overlay--pet-kennel img{
  filter:drop-shadow(0 14px 22px rgba(0,0,0,.34));
}
.alpha-den-room__overlay--pet-kennel::after{
  width:68%;
  height:18%;
  bottom:1%;
}
.alpha-den-room__overlay--war-table{
  z-index:4;
}
.alpha-den-room__overlay--war-table img{
  filter:drop-shadow(0 14px 20px rgba(0,0,0,.30));
}
.alpha-den-room__overlay--war-table::after{
  width:64%;
  height:18%;
  bottom:5%;
  opacity:.64;
}
.alpha-den-room__layer{
  z-index:2;
}
.alpha-den-room__layer--details{
  pointer-events:none;
}
.alpha-den-room__layer--hotspots{
  z-index:5;
}
.alpha-den-room__layer--details::before,
.alpha-den-room__layer--details::after{
  display:none;
}
.alpha-den-zone{
  position:absolute;
  transform:translate(-50%, -50%);
  display:inline-flex;
  align-items:center;
  gap:6px;
  width:auto;
  max-width:min(24vw, 154px);
  padding:0;
  border:0;
  background:transparent;
  color:#eff6ff;
  text-align:left;
  cursor:pointer;
}
.alpha-den-zone.is-detached-label{
  width:42px;
  height:42px;
  min-width:42px;
  min-height:42px;
  display:block;
  overflow:visible;
}
.alpha-den-zone::before,
.alpha-den-zone::after{
  content:none;
}
.alpha-den-zone > *{
  position:relative;
  z-index:1;
}
.alpha-den-zone.is-selected .alpha-den-zone__marker{
  box-shadow:0 0 0 1px rgba(100,196,255,.30), 0 0 20px rgba(100,196,255,.22);
}
.alpha-den-zone__marker{
  position:relative;
  flex:0 0 auto;
  width:14px;
  height:14px;
  border-radius:999px;
  border:1px solid rgba(197,223,247,.42);
  background:rgba(5,10,16,.54);
  box-shadow:0 5px 12px rgba(0,0,0,.20);
}
.alpha-den-zone.is-detached-label .alpha-den-zone__marker{
  position:absolute;
  left:50%;
  top:50%;
  transform:translate(-50%, -50%);
}
.alpha-den-zone__marker::before{
  content:"";
  position:absolute;
  inset:3px;
  border-radius:999px;
  background:rgba(226,237,247,.88);
}
.alpha-den-zone__marker::after{
  content:"";
  position:absolute;
  border-radius:999px;
  inset:-5px;
  border:1px solid rgba(190,221,246,.24);
  opacity:.44;
}
.alpha-den-zone__labelwrap{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-height:28px;
  padding:4px 7px 4px 8px;
  border-radius:999px;
  background:linear-gradient(180deg, rgba(8,13,20,.62), rgba(5,9,14,.72));
  border:1px solid rgba(125,156,185,.22);
  box-shadow:0 8px 16px rgba(0,0,0,.16);
  backdrop-filter:blur(4px);
}
.alpha-den-zone.is-selected .alpha-den-zone__labelwrap{
  border-color:rgba(100,196,255,.28);
  box-shadow:0 10px 20px rgba(0,0,0,.24), 0 0 0 1px rgba(100,196,255,.06);
}
.alpha-den-zone.is-detached-label .alpha-den-zone__labelwrap{
  position:absolute;
  left:calc(50% + var(--label-shift-x, 0%));
  top:calc(50% + var(--label-shift-y, 0%));
  transform:translate(-50%, -50%);
  width:max-content;
  max-width:min(24vw, 136px);
  pointer-events:auto;
}
.alpha-den-zone__label{
  font-size:9px;
  font-weight:800;
  letter-spacing:.08em;
  text-transform:uppercase;
  color:#edf5ff;
  line-height:1;
  white-space:nowrap;
}
.alpha-den-zone__state{
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:2px 6px 2px 5px;
  border-radius:999px;
  border:1px solid rgba(118,147,176,.18);
  background:rgba(12,18,27,.46);
  font-size:8px;
  color:#a9bdd3;
  line-height:1;
  white-space:nowrap;
  flex:0 0 auto;
}
.alpha-den-zone__state::before{
  content:"";
  width:4px;
  height:4px;
  border-radius:999px;
  background:rgba(111,156,192,.56);
}
.den-building--unbuilt .alpha-den-zone__marker::before{
  background:rgba(161,180,198,.68);
}
.den-building--unbuilt .alpha-den-zone__labelwrap{
  border-style:dashed;
  color:#d5e0ec;
}
.den-building--primitive .alpha-den-zone__marker{
  border-color:rgba(99,179,255,.48);
}
.den-building--primitive .alpha-den-zone__marker::before{
  background:rgba(112,201,255,.96);
}
.den-building--primitive .alpha-den-zone__marker::after{
  border-color:rgba(99,179,255,.38);
}
.den-building--primitive .alpha-den-zone__labelwrap{
  border-color:rgba(99,179,255,.26);
  box-shadow:0 12px 22px rgba(0,0,0,.28), 0 0 0 1px rgba(99,179,255,.06);
}
.alpha-den-drawer{
  display:flex;
  flex-direction:column;
  gap:14px;
  min-height:0;
}
.alpha-den-card{
  border:1px solid rgba(131,160,189,.16);
  border-radius:22px;
  background:rgba(9,14,21,.82);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
}
.alpha-den-card--summary{
  padding:16px;
}
.alpha-den-card--detail{
  padding:18px;
  display:flex;
  flex-direction:column;
  gap:12px;
  flex:1;
}
.alpha-den-detail__eyebrow{
  font-size:11px;
  font-weight:800;
  letter-spacing:.2em;
  text-transform:uppercase;
  color:#8ea6bf;
}
.alpha-den-detail__title{
  margin:0;
  font-size:22px;
  color:#f4f8ff;
}
.alpha-den-detail__state{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.alpha-den-detail__pill{
  display:inline-flex;
  align-items:center;
  min-height:28px;
  padding:6px 10px;
  border-radius:999px;
  border:1px solid rgba(129,164,198,.20);
  background:rgba(10,16,24,.76);
  color:#d8e5f3;
  font-size:11px;
  letter-spacing:.08em;
  text-transform:uppercase;
}
.alpha-den-detail__copy{
  margin:0;
  color:#cad7e5;
  line-height:1.55;
}
.alpha-den-detail__meta{
  display:grid;
  gap:8px;
}
.alpha-den-detail__meta-row{
  padding:10px 12px;
  border-radius:16px;
  background:rgba(13,19,29,.78);
  border:1px solid rgba(128,160,189,.12);
}
.alpha-den-detail__meta-label{
  display:block;
  margin-bottom:4px;
  font-size:10px;
  letter-spacing:.14em;
  text-transform:uppercase;
  color:#879ab0;
}
.alpha-den-detail__meta-value{
  font-size:13px;
  color:#eff5ff;
}
.alpha-den-detail__actions{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:auto;
}
.alpha-den-detail__note{
  margin:0;
  color:#93a7bf;
  line-height:1.5;
  font-size:12px;
}
.alpha-den-footnote{
  padding:14px 16px;
  font-size:12px;
  line-height:1.5;
  color:#a5b7cb;
}
@media (max-width: 860px){
  .alpha-den-room{
    grid-template-columns:1fr;
  }
  .alpha-den-zone{
    max-width:min(26vw, 128px);
  }
}
@media (max-width: 640px){
  .alpha-den-shell{
    padding:0;
    overflow-y:auto;
    overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;
  }
  .alpha-den-panel{
    width:100%;
    min-height:100vh;
    min-height:100dvh;
    border-radius:0;
    border-left:0;
    border-right:0;
    padding:10px 10px calc(16px + env(safe-area-inset-bottom, 0px));
    overflow:visible;
  }
  .alpha-den-frame{
    gap:9px;
  }
  .alpha-den-shell{
    padding-top:max(6px, env(safe-area-inset-top, 0px));
  }
  .alpha-den-topbar{
    gap:8px;
  }
  .alpha-den-heading{
    gap:4px;
  }
  .alpha-den-kicker{
    font-size:10px;
    letter-spacing:.18em;
  }
  .alpha-den-title{
    font-size:clamp(24px, 7vw, 30px);
  }
  .alpha-den-subtitle{
    font-size:12px;
    line-height:1.35;
  }
  .alpha-den-topbar-actions{
    gap:8px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }
  .alpha-den-btn--back,
  .alpha-den-btn--ghost{
    padding:7px 10px;
    font-size:11px;
  }
  .alpha-den-btn--close{
    width:34px;
    height:34px;
    font-size:18px;
  }
  .alpha-den-status{
    gap:6px;
  }
  .alpha-den-status__pill{
    min-height:28px;
    padding:6px 9px;
    font-size:9px;
  }
  .alpha-den-room{
    gap:12px;
  }
  .alpha-den-room__scene{
    min-height:374px;
    aspect-ratio:4 / 3.28;
  }
  .alpha-den-room__background-img{
    object-position:center 46%;
  }
  .alpha-den-zone{
    max-width:min(27vw, 102px);
    gap:3px;
  }
  .alpha-den-zone.is-detached-label{
    width:38px;
    height:38px;
    min-width:38px;
    min-height:38px;
  }
  .alpha-den-zone__marker{
    width:13px;
    height:13px;
  }
  .alpha-den-zone__labelwrap{
    gap:5px;
    min-height:24px;
    padding:3px 6px 3px 7px;
  }
  .alpha-den-zone.is-detached-label .alpha-den-zone__labelwrap{
    max-width:min(27vw, 92px);
  }
  .alpha-den-zone__label{
    font-size:8px;
    letter-spacing:.05em;
  }
  .alpha-den-zone__state{
    padding:2px 5px 2px 4px;
    font-size:7px;
    gap:3px;
  }
  .alpha-den-drawer{
    gap:10px;
  }
  .alpha-den-card--summary,
  .alpha-den-card--detail,
  .alpha-den-footnote{
    padding:14px;
  }
}
@media (prefers-reduced-motion: reduce){
  .alpha-den-overlay,
  .alpha-den-btn{
    transition:none;
  }
}
    `;
    document.head.appendChild(style);
  }

  function ensureRootNow() {
    ensureStyles();

    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.setAttribute("data-open", "0");
      document.body.appendChild(root);
      root.addEventListener("click", onRootClick);
      document.addEventListener("keydown", onKeyDown);
    }
    return root;
  }

  function ensureRoot() {
    if (!document.body) {
      queueForDom(ensureRootNow);
      return null;
    }
    return ensureRootNow();
  }

  function onKeyDown(event) {
    if (!isOpen) return;
    if (event.key === "Escape") close();
  }

  async function onRootClick(event) {
    const actionEl = event.target.closest("[data-alpha-den-action]");
    if (!actionEl) return;

    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();

    const action = String(actionEl.getAttribute("data-alpha-den-action") || "").trim();
    const buildingId = String(actionEl.getAttribute("data-building-id") || "").trim();

    if (action === "back" || action === "close") {
      close();
      return;
    }
    if (action === "reset") {
      if (usingServerState) {
        await refreshServerState();
        return;
      }
      resetPreview();
      return;
    }
    if (action === "refresh") {
      await refreshServerState();
      return;
    }
    if (action === "select" && buildingId) {
      selectedBuildingId = buildingId;
      render(buildingId);
      return;
    }
    if (action === "build" && buildingId) {
      if (usingServerState) {
        await runServerAction("/webapp/den/build/start", buildingId);
        return;
      }
      buildPreview(buildingId);
      return;
    }
    if (action === "claim" && buildingId) {
      await runServerAction("/webapp/den/build/claim", buildingId);
      return;
    }
    if (action === "pet-training-start") {
      await runServerAction("/webapp/den/pet-training/start", "pet_kennel");
      return;
    }
    if (action === "pet-training-claim") {
      await runServerAction("/webapp/den/pet-training/claim", "pet_kennel");
      return;
    }
    if (action === "signal-cache-claim") {
      await runServerAction("/webapp/den/signal-cache/claim", "signal_core");
      return;
    }
    if (action === "war-table-brief-start") {
      await runServerAction("/webapp/den/war-table/brief/start", "war_table");
      return;
    }
    if (action === "war-table-brief-claim") {
      await runServerAction("/webapp/den/war-table/brief/claim", "war_table");
    }
  }

  function getBuildingLevel(buildingId) {
    return normalizeLevel(getEffectiveBuildingState(buildingId)?.level);
  }

  function getBuildingDisplay(config, buildingId) {
    const building = getEffectiveBuildingState(buildingId);
    const level = normalizeLevel(building?.level);
    const built = level > 0;
    const tier = getTierForLevel(level);
    const placement = getPlacement(config);
    const maxLevel = asCount(building?.maxLevel) || MAX_BUILD_LEVEL;
    const nextLevel = building?.nextLevel == null ? null : asCount(building?.nextLevel);
    const targetLevel = building?.targetLevel == null ? null : asCount(building?.targetLevel);
    const isMaxLevel = !!building?.isMaxLevel || level >= maxLevel;
    const levelLabel = `Level ${level}`;
    const maxLevelLabel = `Max ${maxLevel}`;

    if (!usingServerState) {
      const previewLabel = "LOCAL PREVIEW / NOT LIVE";
      return {
        level,
        built,
        tier,
        placement,
        maxLevel,
        nextLevel,
        targetLevel,
        isMaxLevel,
        levelLabel,
        maxLevelLabel,
        progressLabel: isMaxLevel ? "Max Level" : `Next ${nextLevel || 1}`,
        stateLabel: built ? `Level ${level}` : "Level 0",
        title: built ? `${config.name} Level ${level}` : config.unbuiltName,
        copy: built
          ? (isMaxLevel
            ? `${previewLabel} | Level ${level} complete. Function coming later.`
            : `${previewLabel} | Level ${level} complete. Preview only.`)
          : "Local preview only. Connect live backend to test real construction.",
        buttonLabel: isMaxLevel ? "Max Level for this phase" : "Build Preview",
        buttonAction: isMaxLevel ? "noop" : "build",
        buttonDisabled: isMaxLevel,
        helperCopy: isMaxLevel
          ? `${previewLabel} | Function coming later.`
          : `${previewLabel} | Next Level ${nextLevel || 1} | ${formatCost(building?.nextCost)} | ${formatDuration(building?.buildSeconds)} build`
      };
    }

    const uiStatus = String(building?.uiStatus || "").trim().toLowerCase() || (built ? "built" : "unbuilt");
    const buildEnabled = !!serverState?.buildEnabled;
    const nextCost = building?.nextCost || null;
    const buildSeconds = asCount(building?.buildSeconds);
    const enoughResources = building?.enoughResources !== false && building?.hasResources !== false;
    const missingResources = formatMissingResources(building?.missingResources);
    const readyAtLabel = formatReadyTime(building?.buildReadyAt);
    let stateLabel = level > 0 ? `Level ${level}` : "Level 0";
    let buttonLabel = "Function coming later";
    let buttonAction = "noop";
    let buttonDisabled = true;
    let helperCopy = "Live Den state";
    let copy = built
      ? `Level ${level} complete. Function coming later.`
      : config.unbuiltCopy;
    let progressLabel = isMaxLevel ? "Max Level" : `Next ${nextLevel || targetLevel || 1}`;

    if (!buildEnabled) {
      stateLabel = isMaxLevel ? "Max level" : levelLabel;
      helperCopy = "Server synced. Build system disabled for this test window.";
      copy = built ? copy : config.unbuiltCopy;
    } else if (uiStatus === "building") {
      stateLabel = "Building";
      progressLabel = targetLevel ? `Target ${targetLevel}` : progressLabel;
      buttonLabel = "Building...";
      helperCopy = targetLevel
        ? `Target Level ${targetLevel} | Ready in ${formatDuration(building?.secondsRemaining)}${readyAtLabel ? ` | Ready at ${readyAtLabel}` : ""}. Use Refresh to update.`
        : `Ready in ${formatDuration(building?.secondsRemaining)}. Use Refresh to update.`;
      copy = targetLevel
        ? `Construction underway. Target Level ${targetLevel}.`
        : "Construction underway.";
    } else if (uiStatus === "claim_available") {
      stateLabel = "Build ready";
      progressLabel = targetLevel ? `Target ${targetLevel}` : progressLabel;
      buttonLabel = "Claim Build";
      buttonAction = "claim";
      buttonDisabled = isActionBusy || !building?.canClaim;
      helperCopy = targetLevel
        ? `Target Level ${targetLevel} is ready. Claim Build to complete this structure.`
        : "Build ready. Claim Build to complete this structure.";
      copy = targetLevel
        ? `Level ${targetLevel} is ready to claim.`
        : "Build ready. Claim Build to complete this structure.";
    } else if (isMaxLevel) {
      stateLabel = "Max level";
      buttonLabel = "Max Level for this phase";
      helperCopy = "Level 3 complete. Function coming later.";
      copy = "Level 3 complete. Function coming later.";
    } else {
      stateLabel = levelLabel;
      buttonLabel = "Start Build";
      buttonAction = "build";
      buttonDisabled = isActionBusy || !building?.canStart;
      helperCopy = `Next Level ${nextLevel || 1} | ${formatCost(nextCost)} | ${formatDuration(buildSeconds)} build`;
      if (!enoughResources) {
        helperCopy = missingResources
          ? `${missingResources} | Next Level ${nextLevel || 1} | Need ${formatCost(nextCost)} to start this build.`
          : `Need ${formatCost(nextCost)} to start this build.`;
      }
      copy = level > 0
        ? `Level ${level} complete. Start Build to begin Level ${nextLevel}.`
        : config.unbuiltCopy;
    }

    return {
      level,
      built,
      tier,
      placement,
      maxLevel,
      nextLevel,
      targetLevel,
      isMaxLevel,
      levelLabel,
      maxLevelLabel,
      progressLabel,
      stateLabel,
      title: built ? `${config.name} Level ${level}` : config.unbuiltName,
      copy,
      buttonLabel,
      buttonAction,
      buttonDisabled,
      helperCopy
    };
  }

  function renderZone(config, buildingId, activeId) {
    const display = getBuildingDisplay(config, buildingId);
    const tierClass = `den-building--${display.tier}`;
    const selectedClass = activeId === config.id ? " is-selected" : "";
    const placement = display.placement || getPlacement(config);
    const sceneStateLabel = getSceneStateLabel(display);
    const detachedLabel = Math.abs(placement.labelX - placement.hotspotX) > 0.5 || Math.abs(placement.labelY - placement.hotspotY) > 0.5;
    const zoneStyle = detachedLabel
      ? `left:${placement.hotspotX}%; top:${placement.hotspotY}%; --label-shift-x:${placement.labelX - placement.hotspotX}%; --label-shift-y:${placement.labelY - placement.hotspotY}%;`
      : `left:${placement.hotspotX}%; top:${placement.hotspotY}%`;

    return `
<button
  type="button"
  class="alpha-den-zone ${tierClass}${selectedClass}${detachedLabel ? " is-detached-label" : ""}"
  style="${zoneStyle}"
  data-alpha-den-action="select"
  data-building-id="${config.id}"
  aria-pressed="${activeId === config.id ? "true" : "false"}"
>
  <span class="alpha-den-zone__marker" aria-hidden="true"></span>
  <span class="alpha-den-zone__labelwrap">
    <span class="alpha-den-zone__label">${escapeHtml(config.name)}</span>
    <span class="alpha-den-zone__state">${escapeHtml(sceneStateLabel)}</span>
  </span>
</button>`;
  }

  function renderStructureOverlay(config, level) {
    const assetUrl = getAssetForLevel(config.id, level);
    if (!assetUrl || level <= 0) return "";
    const placement = getPlacement(config);

    return `
<div
  class="alpha-den-room__overlay alpha-den-room__overlay--${config.id.replace(/_/g, "-")} den-building--${escapeHtml(getTierForLevel(level))}"
  style="${placement.overlayStyle || config.overlayStyle || ""}"
  aria-hidden="true"
>
  <img src="${escapeHtml(assetUrl)}" alt="">
</div>`;
  }

  function renderDetail(buildingId) {
    const config = DEN_BUILDINGS[buildingId] || DEN_BUILDINGS[BUILDING_ORDER[0]];
    const display = getBuildingDisplay(config, config.id);
    const buttonClass = display.buttonDisabled ? "alpha-den-btn alpha-den-btn--passive" : "alpha-den-btn alpha-den-btn--primary";
    const building = getEffectiveBuildingState(config.id);
    const buildMeta = usingServerState
      ? (display.isMaxLevel
        ? `Max Level ${display.maxLevel} for this phase | Function coming later`
        : display.stateLabel === "Building" || display.stateLabel === "Build ready"
          ? `Target Level ${display.targetLevel || display.nextLevel || "?"} | ${formatCost(building?.nextCost)}${building?.buildSeconds ? ` | ${formatDuration(building.buildSeconds)} build` : ""}`
          : `Next Level ${display.nextLevel || "?"} | ${formatCost(building?.nextCost)}${building?.buildSeconds ? ` | ${formatDuration(building.buildSeconds)} build` : ""}`)
      : `${escapeHtml(config.buildTimeLabel)} | ${escapeHtml(config.costPreview)}`;

    return `
<section class="alpha-den-card alpha-den-card--detail">
  <div class="alpha-den-detail__eyebrow">Selected zone</div>
  <h2 class="alpha-den-detail__title">${escapeHtml(config.name)}</h2>
  <div class="alpha-den-detail__state">
    <span class="alpha-den-detail__pill">${escapeHtml(display.stateLabel)}</span>
    <span class="alpha-den-detail__pill">${escapeHtml(display.levelLabel)}</span>
    <span class="alpha-den-detail__pill">${escapeHtml(display.progressLabel)}</span>
  </div>
  <p class="alpha-den-detail__copy">${escapeHtml(display.copy)}</p>
  <div class="alpha-den-detail__meta">
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Future role</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(config.role)}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Room position</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(config.positionLabel)}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Later build flow</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(buildMeta)}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Construction cap</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(`Current ${display.levelLabel} | ${display.maxLevelLabel}`)}</span>
    </div>
  </div>
  <div class="alpha-den-detail__actions">
    <button
      type="button"
      class="${buttonClass}"
      data-alpha-den-action="${display.buttonDisabled ? "noop" : display.buttonAction}"
      data-building-id="${config.id}"
      ${display.buttonDisabled ? "disabled" : ""}
    >${escapeHtml(display.buttonLabel)}</button>
    <p class="alpha-den-detail__note">${escapeHtml(display.helperCopy)}</p>
  </div>
</section>
${config.id === "pet_kennel" ? renderPetTrainingCard() : ""}
${config.id === "signal_core" ? renderSignalCacheCard() : ""}
${config.id === "war_table" ? renderWarTableBriefCard() : ""}`;
  }

  function renderDetailMetaRow(label, value) {
    return `
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">${escapeHtml(label)}</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(value)}</span>
    </div>`;
  }

  function renderSignalCacheCard() {
    const building = getEffectiveBuildingState("signal_core");
    const signalCoreLevel = normalizeLevel(building?.level);
    const cache = getEffectiveSignalCache();
    const currentBenefit = cache?.currentBenefit || getSignalCoreBenefitForLevel(signalCoreLevel);
    const nextBenefit = cache?.nextBenefit || getNextSignalCoreBenefitForLevel(signalCoreLevel);
    const benefitSource = currentBenefit || nextBenefit;
    const nextReadyLabel = formatReadyTime(cache?.nextReadyAt);
    const previewLabel = formatSignalCachePreview(cache?.rewardPreview || benefitSource?.rewardPreview);
    const cooldownLabel = formatLongDuration(cache?.cooldownSeconds || benefitSource?.cooldownSeconds);
    const lastRewardLabel = formatSignalCacheLastRecovered(cache?.lastReward);
    const currentBenefitLabel = signalCoreLevel > 0
      ? formatSignalCoreBenefit(currentBenefit)
      : "Locked until Level 1.";
    const nextBenefitLabel = nextBenefit
      ? formatSignalCoreBenefit(nextBenefit)
      : "Max phase reached.";
    const basePurposeCopy = "Signal Core intercepts broken Alpha network signals and converts them into recovered resources.";
    const manualClaimCopy = "Cache must be claimed manually. No passive farming.";

    let copy = "Signal Cache coming later.";
    let metaRows = [
      renderDetailMetaRow("Signal Core Level", `Level ${signalCoreLevel}`),
      renderDetailMetaRow("Current Benefit", currentBenefitLabel),
      renderDetailMetaRow("Next Upgrade Benefit", nextBenefitLabel),
      renderDetailMetaRow("Cache Cooldown", cooldownLabel || "Locked"),
      renderDetailMetaRow("Reward Preview", previewLabel || "Locked"),
      renderDetailMetaRow("Last Recovered Cache", lastRewardLabel)
    ].join("");
    let buttonLabel = "Function coming later";
    let buttonAction = "noop";
    let buttonDisabled = true;
    let helperCopy = "Signal Cache coming later.";

    if (!usingServerState) {
      if (signalCoreLevel <= 0) {
        copy = "Build Signal Core Level 1 to unlock Signal Cache.";
        helperCopy = `${basePurposeCopy} ${manualClaimCopy}`;
        buttonLabel = "Signal Core Required";
      } else {
        copy = basePurposeCopy;
        helperCopy = `Upgrade Signal Core to recover stronger caches. ${manualClaimCopy}`;
      }
    } else if (signalCoreLevel <= 0 || cache?.cacheStatus === "locked") {
      copy = "Build Signal Core Level 1 to unlock Signal Cache.";
      helperCopy = `${basePurposeCopy} ${manualClaimCopy}`;
      buttonLabel = "Signal Core Required";
    } else if (cache?.reason === "SIGNAL_CORE_UNDER_CONSTRUCTION" || cache?.buildingUnderConstruction) {
      copy = "Signal Cache is offline while Signal Core is under construction.";
      helperCopy = `Upgrade Signal Core to recover stronger caches. ${manualClaimCopy}`;
      buttonLabel = "Cache Offline";
    } else if (!cache?.featureEnabled) {
      copy = basePurposeCopy;
      helperCopy = "Signal Cache is offline right now.";
      buttonLabel = "Cache Offline";
    } else if (cache?.cacheStatus === "charging") {
      copy = "Signal Cache is charging.";
      metaRows += renderDetailMetaRow(
        "Time Remaining",
        `${formatLongDuration(cache?.secondsRemaining)}${nextReadyLabel ? ` | Ready at ${nextReadyLabel}` : ""}`
      );
      helperCopy = manualClaimCopy;
      buttonLabel = "Cache Charging";
    } else {
      copy = "Signal Cache is ready to claim.";
      helperCopy = `Claim manually when the cache is ready. ${manualClaimCopy}`;
      buttonLabel = "Claim Signal Cache";
      buttonAction = "signal-cache-claim";
      buttonDisabled = isActionBusy || !cache?.canClaim;
    }

    const buttonClass = buttonDisabled ? "alpha-den-btn alpha-den-btn--passive" : "alpha-den-btn alpha-den-btn--primary";
    return `
<section class="alpha-den-card alpha-den-card--detail">
  <div class="alpha-den-detail__eyebrow">Signal Cache</div>
  <h3 class="alpha-den-detail__title">Signal Core Cache</h3>
  <p class="alpha-den-detail__copy">${escapeHtml(copy)}</p>
  <div class="alpha-den-detail__meta">${metaRows}</div>
  <div class="alpha-den-detail__actions">
    <button
      type="button"
      class="${buttonClass}"
      data-alpha-den-action="${buttonDisabled ? "noop" : buttonAction}"
      ${buttonDisabled ? "disabled" : ""}
    >${escapeHtml(buttonLabel)}</button>
    <p class="alpha-den-detail__note">${escapeHtml(helperCopy)}</p>
  </div>
</section>`;
  }

  function renderWarTableBriefCard() {
    const building = getEffectiveBuildingState("war_table");
    const warTableLevel = normalizeLevel(building?.level);
    const brief = getEffectiveWarTableBrief();
    const readyAtLabel = formatReadyTime(brief?.readyAt);
    const lastBrief = brief?.lastBrief || null;
    const durationSeconds = asCount(
      brief?.durationSeconds || WAR_TABLE_BRIEF_LEVELS[Math.min(Math.max(warTableLevel, 1), 3)]?.durationSeconds
    );
    const basePurposeCopy = "War Table turns map noise into tactical notes. Prepare a brief, return later, and read the next signal.";

    let copy = "Tactical Brief coming later.";
    let metaRows = [
      renderDetailMetaRow("War Table Level", `Level ${warTableLevel}`),
      renderDetailMetaRow("Brief Duration", durationSeconds > 0 ? formatLongDuration(durationSeconds) : "Locked")
    ].join("");
    let buttonLabel = "Function coming later";
    let buttonAction = "noop";
    let buttonDisabled = true;
    let helperCopy = "Tactical Brief coming later.";

    if (!usingServerState) {
      if (warTableLevel <= 0) {
        copy = "Build War Table Level 1 to unlock Tactical Brief.";
        helperCopy = "Local preview only. Connect live backend to test Tactical Brief.";
        buttonLabel = "War Table Required";
      } else {
        copy = basePurposeCopy;
        if (lastBrief?.message) {
          metaRows += renderDetailMetaRow("Last Brief", lastBrief.message);
        }
        helperCopy = "Local preview only. Connect live backend to test Tactical Brief.";
        buttonLabel = "Tactical Brief Preview";
      }
    } else if (warTableLevel <= 0 || brief?.briefStatus === "locked") {
      copy = "Build War Table Level 1 to unlock Tactical Brief.";
      helperCopy = "Build War Table to Level 1 first.";
      buttonLabel = "War Table Required";
    } else if (!brief?.featureEnabled) {
      copy = basePurposeCopy;
      if (lastBrief?.message) {
        metaRows += renderDetailMetaRow("Last Brief", lastBrief.message);
      }
      helperCopy = "Feature flag is currently off.";
      buttonLabel = "Brief Offline";
    } else if (brief?.briefStatus === "offline" || brief?.reason === "WAR_TABLE_UNDER_CONSTRUCTION") {
      copy = "Tactical Brief is offline while War Table is under construction.";
      helperCopy = "Claim the construction first to bring the table back online.";
      buttonLabel = "Brief Offline";
    } else if (brief?.briefStatus === "preparing") {
      copy = "Tactical Brief is preparing.";
      metaRows += renderDetailMetaRow(
        "Time Remaining",
        `${formatLongDuration(brief?.secondsRemaining)}${readyAtLabel ? ` | Ready at ${readyAtLabel}` : ""}`
      );
      if (lastBrief?.message) {
        metaRows += renderDetailMetaRow("Last Brief", lastBrief.message);
      }
      helperCopy = "Return later and claim the next signal note.";
      buttonLabel = "Brief Preparing";
    } else if (brief?.briefStatus === "ready") {
      copy = "Tactical Brief is ready to read.";
      if (lastBrief?.message) {
        metaRows += renderDetailMetaRow("Last Brief", lastBrief.message);
      }
      helperCopy = "Claim the latest note when you are ready.";
      buttonLabel = "Claim Tactical Brief";
      buttonAction = "war-table-brief-claim";
      buttonDisabled = isActionBusy || !brief?.canClaim;
    } else if (brief?.briefStatus === "claimed") {
      copy = lastBrief?.message || "Latest Tactical Brief is stored.";
      metaRows += renderDetailMetaRow("Last Brief", lastBrief?.message || "No brief stored yet.");
      helperCopy = "Prepare another brief when you want a fresh note.";
      buttonLabel = "Prepare Next Brief";
      buttonAction = "war-table-brief-start";
      buttonDisabled = isActionBusy || !brief?.canStart;
    } else {
      copy = basePurposeCopy;
      if (lastBrief?.message) {
        metaRows += renderDetailMetaRow("Last Brief", lastBrief.message);
      }
      helperCopy = "Prepare a brief now and return when the timer finishes.";
      buttonLabel = "Prepare Tactical Brief";
      buttonAction = "war-table-brief-start";
      buttonDisabled = isActionBusy || !brief?.canStart;
    }

    const buttonClass = buttonDisabled ? "alpha-den-btn alpha-den-btn--passive" : "alpha-den-btn alpha-den-btn--primary";
    return `
<section class="alpha-den-card alpha-den-card--detail">
  <div class="alpha-den-detail__eyebrow">Tactical Brief</div>
  <h3 class="alpha-den-detail__title">War Table Tactical Brief</h3>
  <p class="alpha-den-detail__copy">${escapeHtml(copy)}</p>
  <div class="alpha-den-detail__meta">${metaRows}</div>
  <div class="alpha-den-detail__actions">
    <button
      type="button"
      class="${buttonClass}"
      data-alpha-den-action="${buttonDisabled ? "noop" : buttonAction}"
      ${buttonDisabled ? "disabled" : ""}
    >${escapeHtml(buttonLabel)}</button>
    <p class="alpha-den-detail__note">${escapeHtml(helperCopy)}</p>
  </div>
</section>`;
  }

  function renderPetTrainingCard() {
    const building = getEffectiveBuildingState("pet_kennel");
    const kennelLevel = normalizeLevel(building?.level);
    const training = getEffectivePetKennelTraining();
    const activePet = training?.activePet || null;
    const readyAtLabel = formatReadyTime(training?.readyAt);

    let copy = "Pet Training coming soon.";
    let metaRows = "";
    let buttonLabel = "Function coming later";
    let buttonAction = "noop";
    let buttonDisabled = true;
    let helperCopy = "Pet Training coming soon.";

    if (!usingServerState) {
      if (kennelLevel <= 0) {
        copy = "Build Pet Kennel to unlock training.";
        helperCopy = "Local preview only. Connect live backend to test real training.";
      } else {
        copy = "Pet Training coming soon.";
        metaRows = `
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Training Type</span>
      <span class="alpha-den-detail__meta-value">Basic Training</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Reward</span>
      <span class="alpha-den-detail__meta-value">+30 Pet XP</span>
    </div>`;
        helperCopy = "Local preview only. Connect live backend to test real training.";
      }
    } else if (kennelLevel <= 0) {
      copy = "Build Pet Kennel to unlock training.";
      helperCopy = "Build Pet Kennel to Level 1 first.";
    } else if (!training?.trainingEnabled) {
      copy = "Pet Training coming soon.";
      helperCopy = "Feature flag is currently off.";
    } else if (training?.trainingStatus === "offline" || training?.reason === "KENNEL_UNDER_CONSTRUCTION") {
      copy = "Pet Training is offline while Pet Kennel is under construction.";
      helperCopy = "Training will come back online after construction is claimed.";
    } else if (training?.trainingStatus === "training") {
      copy = `Training active${training?.activeTrainingPetName ? ` for ${training.activeTrainingPetName}` : ""}.`;
      metaRows = `
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Training Type</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(training?.trainingType || "Training")}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Reward</span>
      <span class="alpha-den-detail__meta-value">+${escapeHtml(String(asCount(training?.rewardPetXp)))} Pet XP</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Time Remaining</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(formatLongDuration(training?.secondsRemaining))}${readyAtLabel ? ` | Ready at ${escapeHtml(readyAtLabel)}` : ""}</span>
    </div>`;
      helperCopy = "Refresh to update this timer.";
      buttonLabel = "Training Active";
    } else if (training?.trainingStatus === "ready") {
      copy = "Training ready. Claim Pet XP when you are ready.";
      metaRows = `
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Training Type</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(training?.trainingType || "Training")}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Reward</span>
      <span class="alpha-den-detail__meta-value">+${escapeHtml(String(asCount(training?.rewardPetXp)))} Pet XP</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Trained Pet</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(training?.activeTrainingPetName || activePet?.name || "Active Pet")}</span>
    </div>`;
      helperCopy = "Claim Pet XP to finish this training.";
      buttonLabel = "Claim Pet XP";
      buttonAction = "pet-training-claim";
      buttonDisabled = isActionBusy || !training?.canClaim;
    } else {
      copy = activePet
        ? `${activePet.name} can start training now.`
        : "Set an active pet before starting training.";
      metaRows = `
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Training Type</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(training?.trainingType || "Basic Training")}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Duration</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(formatLongDuration(training?.durationSeconds))}</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Reward</span>
      <span class="alpha-den-detail__meta-value">+${escapeHtml(String(asCount(training?.rewardPetXp)))} Pet XP</span>
    </div>
    <div class="alpha-den-detail__meta-row">
      <span class="alpha-den-detail__meta-label">Active Pet</span>
      <span class="alpha-den-detail__meta-value">${escapeHtml(activePet?.name || "No active pet")}</span>
    </div>`;
      helperCopy = training?.canTrain
        ? "Start Training to begin the kennel timer."
        : humanizeReason(training?.reason || "NO_ACTIVE_PET");
      buttonLabel = training?.canTrain ? "Start Training" : "Training Locked";
      buttonAction = training?.canTrain ? "pet-training-start" : "noop";
      buttonDisabled = isActionBusy || !training?.canTrain;
    }

    const buttonClass = buttonDisabled ? "alpha-den-btn alpha-den-btn--passive" : "alpha-den-btn alpha-den-btn--primary";
    return `
<section class="alpha-den-card alpha-den-card--detail">
  <div class="alpha-den-detail__eyebrow">Pet Training</div>
  <h3 class="alpha-den-detail__title">Pet Kennel Training</h3>
  <p class="alpha-den-detail__copy">${escapeHtml(copy)}</p>
  <div class="alpha-den-detail__meta">${metaRows}</div>
  <div class="alpha-den-detail__actions">
    <button
      type="button"
      class="${buttonClass}"
      data-alpha-den-action="${buttonDisabled ? "noop" : buttonAction}"
      ${buttonDisabled ? "disabled" : ""}
    >${escapeHtml(buttonLabel)}</button>
    <p class="alpha-den-detail__note">${escapeHtml(helperCopy)}</p>
  </div>
</section>`;
  }

  function render(buildingId) {
    const root = ensureRoot();
    if (!root) return null;

    const state = getEffectiveState();
    const liveMode = !!(usingServerState && serverState?.buildings);

    if (buildingId && DEN_BUILDINGS[buildingId]) {
      selectedBuildingId = buildingId;
    } else if (!DEN_BUILDINGS[selectedBuildingId]) {
      selectedBuildingId = BUILDING_ORDER[0];
    }

    const backgroundMarkup = DEN_ASSETS.roomBackground
      ? `<img class="alpha-den-room__background-img" src="${escapeHtml(DEN_ASSETS.roomBackground)}" alt="">`
      : "";
    const topAction = liveMode ? "refresh" : "reset";
    const topActionLabel = liveMode ? "Refresh" : "Reset Preview";
    const previewMessage = "Local preview only. Connect live backend to test real construction.";
    const summaryCopy = liveMode
      ? "Server synced. Level 1-3 construction config loaded."
      : previewMessage;
    const footnote = liveMode
      ? (state.buildEnabled
        ? "Server synced. Build system enabled for controlled test."
        : "Server synced. Build system disabled for this test window.")
      : "LOCAL PREVIEW / NOT LIVE";
    const modePill = liveMode ? "LIVE SERVER STATE" : "LOCAL PREVIEW / NOT LIVE";
    const syncPill = liveMode && !state.buildEnabled
      ? "Build system disabled for this test window"
      : liveMode
        ? "Server synced"
        : "Preview only";
    const statusMessage = !liveMode && lastSyncError
      ? humanizeReason(lastSyncError)
      : lastActionMessage
        ? lastActionMessage
        : lastSyncError
          ? humanizeReason(lastSyncError)
          : "";
    const errorNote = statusMessage
      ? `<section class="alpha-den-card alpha-den-card--summary"><div class="alpha-den-detail__eyebrow">${escapeHtml(liveMode ? "Build status" : "Sync status")}</div><p class="alpha-den-detail__copy">${escapeHtml(statusMessage)}</p></section>`
      : "";

    root.setAttribute("data-open", isOpen ? "1" : "0");
    root.innerHTML = `
<div class="alpha-den-overlay">
  <div class="alpha-den-shell">
    <button type="button" class="alpha-den-backdrop" data-alpha-den-action="close" aria-label="Close Alpha Den"></button>
    <section class="alpha-den-panel" role="dialog" aria-modal="true" aria-label="Alpha Den">
      <div class="alpha-den-frame">
        <div class="alpha-den-topbar">
          <div class="alpha-den-heading">
            <div class="alpha-den-kicker">Personal command room</div>
            <h1 class="alpha-den-title">ALPHA DEN</h1>
            <p class="alpha-den-subtitle">Build the first pieces of your Den. Functions unlock in later phases.</p>
          </div>
          <div class="alpha-den-topbar-actions">
            <button type="button" class="alpha-den-btn alpha-den-btn--ghost alpha-den-btn--back" data-alpha-den-action="back" aria-label="Back to map">&lt;- Back</button>
            <button type="button" class="alpha-den-btn alpha-den-btn--ghost" data-alpha-den-action="${topAction}" ${isActionBusy ? "disabled" : ""}>${topActionLabel}</button>
            <button type="button" class="alpha-den-btn alpha-den-btn--close" data-alpha-den-action="close" aria-label="Close Alpha Den">x</button>
          </div>
        </div>

        <div class="alpha-den-status">
          <span class="alpha-den-status__pill"><strong>Den Level 1</strong></span>
          <span class="alpha-den-status__pill">Foundation stage</span>
          <span class="alpha-den-status__pill">${escapeHtml(modePill)}</span>
          <span class="alpha-den-status__pill">${escapeHtml(syncPill)}</span>
        </div>

        <div class="alpha-den-room">
          <section class="alpha-den-room__scene">
            <div class="alpha-den-room__background">${backgroundMarkup}</div>
            <div class="alpha-den-room__overlays">
              ${BUILDING_ORDER.map((id) => renderStructureOverlay(DEN_BUILDINGS[id], getBuildingLevel(id))).join("")}
            </div>
            <div class="alpha-den-room__layer alpha-den-room__layer--details">
            </div>
            <div class="alpha-den-room__layer alpha-den-room__layer--hotspots">
              ${BUILDING_ORDER.map((id) => renderZone(DEN_BUILDINGS[id], id, selectedBuildingId)).join("")}
            </div>
          </section>

          <aside class="alpha-den-drawer">
            <section class="alpha-den-card alpha-den-card--summary">
              <div class="alpha-den-detail__eyebrow">Den status</div>
              <p class="alpha-den-detail__copy">${escapeHtml(summaryCopy)}</p>
            </section>
            ${errorNote}
            ${renderDetail(selectedBuildingId)}
            <section class="alpha-den-card alpha-den-footnote">${escapeHtml(footnote)}</section>
          </aside>
        </div>
      </div>
    </section>
  </div>
</div>`;

    return root;
  }

  function openNow(buildingId) {
    isOpen = true;
    render(buildingId || selectedBuildingId);
    void refreshServerState();
  }

  function open(buildingId) {
    if (!document.body) {
      queueForDom(() => openNow(buildingId));
      return;
    }
    openNow(buildingId);
  }

  function close() {
    const root = ensureRoot();
    if (!root) return;
    isOpen = false;
    render(selectedBuildingId);
    root.setAttribute("data-open", "0");
  }

  function resetPreview() {
    currentState = cloneState(DEFAULT_STATE);
    memoryState = cloneState(DEFAULT_STATE);
    lastActionMessage = "";
    clearStoredState();
    render(selectedBuildingId);
  }

  function getState() {
    return cloneState(ensureState());
  }

  function buildPreview(buildingId) {
    if (!DEN_BUILDINGS[buildingId]) return getState();

    const state = ensureState();
    const currentLevel = normalizeLevel(state?.buildings?.[buildingId]?.level);
    state.buildings[buildingId].level = Math.min(MAX_BUILD_LEVEL, Math.max(1, currentLevel + 1));
    currentState = sanitizeState(state);
    persistState();
    render(buildingId);
    return getState();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  window.AlphaDen = {
    open,
    close,
    render,
    resetPreview,
    getState,
    buildPreview
  };
})();
