// js/missions.js — WebApp Missions (EXPEDITIONS) UI
// Contract:
//   POST /webapp/missions/state  { run_id }
//   POST /webapp/missions/action { action:"refresh_offers"|"start"|"resolve", tier?, offerId?, run_id }

(function () {
  const esc = (s) => String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  function rid(prefix = "missions") {
    try { return `${prefix}:${crypto.randomUUID()}`; } catch {
      return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
    }
  }

  const el = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ===========
  // Assets (Cloudinary mapping for /assets/*)
  // ===========
  const CLOUD_BASE = (window.CLOUDINARY_BASE || "https://res.cloudinary.com/dnjwvxinh/image/upload/");
  const MISSIONS_UI_ICONS = Object.freeze({
    blue_signal_fragment: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780054311/alpha_ui/icons/blue_event/alpha_icon_blue_signal_fragment_v1_128.png",
    rare_bonus_signal: "https://res.cloudinary.com/dnjwvxinh/image/upload/v1780054311/alpha_ui/icons/blue_event/alpha_icon_rare_bonus_signal_v1_128.png"
  });
  const MISSION_DUEL_MOON_HUNTER_SCOUT_URL = "https://raw.githubusercontent.com/Skrwl1909/alpha-husky-webapp/main/images/bosses/moon_hunter_scout.png";
  const MISSION_DUEL_RUST_MARAUDER_URL = "https://raw.githubusercontent.com/Skrwl1909/alpha-husky-webapp/main/images/bosses/rust_marauder.png";
  const MISSION_DUEL_NAMED_ENEMY_VISUALS = Object.freeze({
    "moon hunter scout": Object.freeze({
      src: MISSION_DUEL_MOON_HUNTER_SCOUT_URL,
      source: "remote Moon Hunter Scout fallback art",
      displayName: "Moon Hunter Scout"
    }),
    "rust marauder": Object.freeze({
      src: MISSION_DUEL_RUST_MARAUDER_URL,
      source: "remote Rust Marauder fallback art",
      displayName: "Rust Marauder"
    })
  });
  const MISSION_DUEL_CORRUPTED_RELAY_URL = "https://raw.githubusercontent.com/Skrwl1909/alpha-husky-webapp/main/images/bosses/enemy_corrupted_relay_v1.png";
  const MISSION_DUEL_CORRUPTED_RELAY_NAME = "Corrupted Relay";
  const MISSION_DUEL_CORRUPTED_RELAY_KEYWORDS = Object.freeze([
    "signal",
    "relay",
    "corrupted",
    "transmission",
    "cache",
    "hostile trace",
    "phantom"
  ]);
const MISSION_DUEL_BOSS_ASSET_MAP = Object.freeze({
  atrium_sentinel: "images/bosses/atrium_sentinel.png",
  core_custodian: "images/bosses/core_custodian.png",
  echo_revenant: "images/bosses/echo_revenant.png",
  flux_scorpion: "images/bosses/flux_scorpion.png",
  gleam_warden: "images/bosses/gleam_warden.png",
  ion_sentry: "images/bosses/ion_sentry.png",
  lunar_myrmidon: "images/bosses/lunar_myrmidon.png",
  neon_goliath: "images/bosses/neon_goliath.png",
  pale_tyrant: "images/bosses/pale_tyrant.png",
  phase_knight: "images/bosses/phase_knight.png",
  shatter_hound: "images/bosses/shatter_hound.png"
});

function missionBossAssetVersion() {
  return textOrEmpty(window.WEBAPP_VER || window.__WEBAPP_VER || window.APP_VERSION || "");
}

function missionBossAssetUrl(path) {
  const base = assetUrl(path);
  if (!base) return "";
  if (/^(?:https?:|data:)/i.test(base)) return base;
  const version = missionBossAssetVersion();
  if (!version) return base;
  return base.includes("?")
    ? `${base}&v=${encodeURIComponent(version)}`
    : `${base}?v=${encodeURIComponent(version)}`;
}

function normalizeMissionBossAssetKey(value) {
  return textOrEmpty(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .trim();
}

function resolveMissionDuelBossAssetVisual(payload, last, enemyBlock) {
  const bossKeys = missionDuelUniqueStrings([
    enemyBlock?.bossAsset,
    enemyBlock?.boss_asset,
    enemyBlock?.visualKey,
    enemyBlock?.visual_key,
    enemyBlock?.key,
    enemyBlock?.code,
    last?.bossAsset,
    last?.boss_asset,
    last?.visualKey,
    last?.visual_key,
    payload?.bossAsset,
    payload?.boss_asset,
    payload?.visualKey,
    payload?.visual_key,
  ]);
  for (const rawKey of bossKeys) {
    const key = normalizeMissionBossAssetKey(rawKey);
    const mappedPath = MISSION_DUEL_BOSS_ASSET_MAP[key];
    if (!mappedPath) continue;
    return {
      src: missionBossAssetUrl(mappedPath),
      source: "local mission boss asset mapping",
      displayName: titleizeWord(key.replaceAll("_", " "))
    };
  }
  return null;
}
  function assetUrl(p) {
    p = String(p || "");
    if (!p) return "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith("data:")) return p;
    if (p.startsWith("/assets/")) return CLOUD_BASE + p.slice("/assets/".length);
    return p;
  }

  function missionUiIconUrl(key) {
    return assetUrl(MISSIONS_UI_ICONS[String(key || "")] || "");
  }

  function renderDecorativeIcon(iconKey, className = "") {
    const url = missionUiIconUrl(iconKey);
    if (!url) return "";
    const klass = ["m-ui-icon", className].filter(Boolean).join(" ");
    return `<span class="${klass}" aria-hidden="true"><img src="${esc(url)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode && this.parentNode.remove && this.parentNode.remove();" /></span>`;
  }

  function textOrEmpty(v) {
    if (v == null) return "";
    if (typeof v === "string") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return "";
  }

  function titleizeWord(v) {
    const s = textOrEmpty(v).toLowerCase();
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function normalizeModifierLabel(v) {
    return textOrEmpty(v);
  }

  function n(v, d = 0) {
    const x = Number(v);
    return Number.isFinite(x) ? x : d;
  }

  function toText(v, fallback = "") {
    const s = textOrEmpty(v);
    return s || String(fallback || "");
  }

  function getStatsPayload(res) {
    if (!res || typeof res !== "object") return null;
    if (res.ok === true && res.data && typeof res.data === "object") return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    if (res.stats && typeof res.stats === "object") return res.stats;
    if (res.state && typeof res.state === "object") return res.state;
    return null;
  }

  // Fallback only when progression_v1 is absent; backend progression_v1 is source of truth when present.
  const SIGNAL_THRESHOLDS = [
    { value: 500, label: "MoonLab Stabilization" },
    { value: 1000, label: "First Wall Break" },
    { value: 1500, label: "Elite Missions Tier I Preview" },
    { value: 2500, label: "Iron Siege Bracket Preview" },
    { value: 3500, label: "Relay Directive Missions Preview" },
    { value: 5000, label: "Deep Signal Interference" },
    { value: 6500, label: "Corrupted Signal Wall" },
    { value: 8000, label: "False Alpha Signal Prestige Wall" },
  ];

  function normalizeBackendThresholds(raw) {
    const list = Array.isArray(raw) ? raw : [];
    const out = [];
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const value = Math.max(0, n(item.value, 0));
      const label = toText(item.label, "");
      if (value > 0 && label) out.push({ value, label });
    }
    return out.length ? out : null;
  }

  function resolveSignalThresholds(raw) {
    if (!raw || typeof raw !== "object") return SIGNAL_THRESHOLDS;
    const fromBackend = normalizeBackendThresholds(raw.thresholds);
    return fromBackend || SIGNAL_THRESHOLDS;
  }

  function getNextThreshold(signalPower, thresholds) {
    const items = Array.isArray(thresholds) && thresholds.length ? thresholds : SIGNAL_THRESHOLDS;
    for (const item of items) {
      if (signalPower < item.value) return item;
    }
    return items[items.length - 1];
  }

  function normalizeBossWallPreview(raw) {
    if (!raw || typeof raw !== "object") return null;
    const boss = (raw.currentBoss && typeof raw.currentBoss === "object") ? raw.currentBoss : {};
    return {
      available: !!raw.available,
      previewOnly: raw.previewOnly !== false,
      isPreview: raw.isPreview !== false,
      currentFloor: Math.max(0, n(raw.currentFloor, 0)),
      highestClearedFloor: Math.max(0, n(raw.highestClearedFloor, 0)),
      maxFloor: Math.max(0, n(raw.maxFloor, 0)),
      sector: Math.max(0, n(raw.sector, 0)),
      sectorFloor: Math.max(0, n(raw.sectorFloor, 0)),
      ready: !!raw.ready,
      cooldownLeftSec: Math.max(0, n(raw.cooldownLeftSec, 0)),
      statusText: toText(raw.statusText, "Syncing"),
      currentBoss: {
        name: toText(boss.name, ""),
        requiredSignalPower: Math.max(0, n(boss.requiredSignalPower, 0)),
        playerSignalPower: Math.max(0, n(boss.playerSignalPower, 0)),
        missingPower: Math.max(0, n(boss.missingPower, 0)),
        status: toText(boss.status, ""),
        rewardPreview: toText(boss.rewardPreview, ""),
        recommendedAction: toText(boss.recommendedAction, ""),
        readyCopy: toText(boss.readyCopy, ""),
        notReadyCopy: toText(boss.notReadyCopy, ""),
      },
    };
  }

  function formatBossPrepStatusFromPreview(preview) {
    if (!preview || !preview.available) return "Syncing";
    const status = toText(preview.currentBoss?.status, "");
    if (status === "cooldown") return "Cooling Down";
    if (status === "ready_preview") return "Ready";
    if (status === "not_ready") return "Locked";
    return toText(preview.statusText, "Preview");
  }

  function normalizeProgressionV1(raw) {
    if (!raw || typeof raw !== "object") return null;

    const breakdown = (raw.breakdown && typeof raw.breakdown === "object") ? raw.breakdown : {};
    const thresholds = resolveSignalThresholds(raw);
    const signalPower = Math.max(0, n(raw.signalPower ?? breakdown.total, 0));
    const fallbackThreshold = getNextThreshold(signalPower, thresholds);
    const wall = (raw.moonlabWall && typeof raw.moonlabWall === "object") ? raw.moonlabWall : {};
    const nextThreshold = Math.max(0, n(raw.nextThreshold, fallbackThreshold.value));
    const missingPower = Math.max(0, n(raw.missingPower, Math.max(0, nextThreshold - signalPower)));

    return {
      signalPower,
      nextThreshold,
      missingPower,
      nextUnlockLabel: toText(raw.nextUnlockLabel, fallbackThreshold.label),
      recommendedAction: toText(raw.recommendedAction, "Complete missions to stabilize your signal."),
      thresholds,
      breakdown: {
        levelPower: Math.max(0, n(breakdown.levelPower, 0)),
        badgePower: Math.max(0, n(breakdown.badgePower, 0)),
        petPower: Math.max(0, n(breakdown.petPower, 0)),
        total: signalPower,
      },
      moonlabWall: {
        available: !!wall.available,
        currentFloor: Math.max(0, n(wall.currentFloor ?? wall.floor, 0)),
        bestFloor: Math.max(0, n(wall.bestFloor, 0)),
        bossName: toText(wall.bossName, ""),
        bossPower: Math.max(0, n(wall.bossPower, 0)),
        bossDanger: Math.max(0, n(wall.bossDanger ?? wall.danger, 0)),
        cooldownLeftSec: Math.max(0, n(wall.cooldownLeftSec ?? wall.cooldown, 0)),
        ready: !!wall.ready,
      },
      nextAlphaGoal: (raw.nextAlphaGoal && typeof raw.nextAlphaGoal === "object") ? raw.nextAlphaGoal : null,
      elitePreviewHints: (raw.elitePreviewHints && typeof raw.elitePreviewHints === "object") ? {
        previewOnly: raw.elitePreviewHints.previewOnly !== false,
        eliteUnlockThreshold: Math.max(0, n(raw.elitePreviewHints.eliteUnlockThreshold, 0)),
        eliteUnlockLabel: toText(raw.elitePreviewHints.eliteUnlockLabel, ""),
        eliteLockedLabel: toText(raw.elitePreviewHints.eliteLockedLabel, "Locked Preview"),
        eliteReadyLabel: toText(raw.elitePreviewHints.eliteReadyLabel, "Read-only Preview"),
        safetyCopy: toText(raw.elitePreviewHints.safetyCopy, "Preview only — standard routes below still handle rewards."),
        source: toText(raw.elitePreviewHints.source, "progression_v1"),
      } : null,
      bossWallPreview: normalizeBossWallPreview(raw.bossWallPreview),
      signalMilestones: (raw.signalMilestones && typeof raw.signalMilestones === "object") ? raw.signalMilestones : null,
    };
  }

  // Fallback when backend progression_v1.elitePreviewHints is absent.
  const ELITE_HUNT_SIGNAL_THRESHOLD_FALLBACK = 1500;

  function resolveEliteUnlockThreshold(progression) {
    const hints = progression?.elitePreviewHints;
    const fromBackend = Math.max(0, n(hints?.eliteUnlockThreshold, 0));
    if (fromBackend > 0) return fromBackend;
    return ELITE_HUNT_SIGNAL_THRESHOLD_FALLBACK;
  }

  function getMoonlabBossPressure(wall) {
    if (!wall || !wall.available) return 0;
    return Math.max(0, n(wall.bossPower, 0), n(wall.bossDanger, 0));
  }

  function formatBossPrepStatus(wall, signalPower) {
    if (!wall || !wall.available) return "Syncing";
    if (Math.max(0, n(wall.cooldownLeftSec, 0)) > 0) return "Cooling Down";
    if (getMoonlabBossPressure(wall) > Math.max(0, n(signalPower, 0))) return "Locked";
    if (wall.ready) return "Ready";
    return "Preview";
  }

  function resolveBossPrepBestMove(wall, signalPower, recommendedAction) {
    const fallback = toText(recommendedAction, "Complete standard routes and strengthen your profile.");
    if (!wall || !wall.available) return fallback;
    if (Math.max(0, n(wall.cooldownLeftSec, 0)) > 0) return fallback;
    if (getMoonlabBossPressure(wall) > Math.max(0, n(signalPower, 0))) {
      return "Build Signal Power before your next MoonLab run.";
    }
    if (wall.ready) return "Enter MoonLab and clear the wall.";
    return fallback;
  }

  function elitePreviewCtaLabel(status, locked) {
    if (locked || status === "Locked") return "Locked Preview";
    if (status === "Ready") return "Read-only Preview";
    return "Preview";
  }

  function normalizeOutcomeTier(last) {
    const direct = textOrEmpty(last?.outcomeTier || last?.outcome_tier);
    if (direct) return direct;
    const result = textOrEmpty(last?.result);
    if (result === "victory") return "Success";
    if (result === "defeat" || result === "failure" || result === "failed") return "Failed";
    return "";
  }

  function normalizeOutcomeTone(outcomeTier) {
    const key = textOrEmpty(outcomeTier).toLowerCase();
    if (key === "critical success") return "critical";
    if (key === "partial success") return "partial";
    if (key === "failed") return "failed";
    return "success";
  }

  function normalizeStatsText(v) {
    if (Array.isArray(v)) {
      const parts = v.map((x) => textOrEmpty(x).toUpperCase()).filter(Boolean);
      return parts.join(" / ");
    }
    return textOrEmpty(v).toUpperCase();
  }

  function normalizePetMatchLabel(last) {
    const direct = textOrEmpty(last?.activePetMatchLabel || last?.petMatchLabel);
    if (direct) return direct;
    const assist = textOrEmpty(last?.activePetAssistLabel || last?.petAssistLabel);
    if (assist) return assist.replace(/\s+match$/i, "");
    const matchKey = textOrEmpty(last?.activePetMatch || last?.petMatch);
    return matchKey ? titleizeWord(matchKey) : "";
  }

  function normalizePercentNumber(v) {
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.min(100, Math.round(v)));
    const s = textOrEmpty(v);
    if (!s) return null;
    const m = s.match(/-?\d+/);
    if (!m) return null;
    const n = Number(m[0]);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function normalizeProgressLine(last) {
    const direct = textOrEmpty(last?.progressLine);
    if (direct) return direct;
    const pct = normalizePercentNumber(last?.progressPercent);
    if (pct == null) return "";
    if (pct >= 100 && normalizeOutcomeTone(normalizeOutcomeTier(last)) !== "partial" && normalizeOutcomeTone(normalizeOutcomeTier(last)) !== "failed") {
      return "";
    }
    return `Recovery secured: ${pct}%`;
  }

  function normalizeShortfallLine(last) {
    const direct = textOrEmpty(last?.shortfallLine);
    if (direct) return direct;
    const pct = normalizePercentNumber(last?.shortByPercent);
    return pct == null || pct <= 0 ? "" : `Short by: ${pct}%`;
  }

  function normalizeRareChanceLabel(v) {
    const raw = textOrEmpty(v).replace(/\s+/g, " ").trim();
    if (!raw) return "";
    let core = raw.replace(/\s+chance$/i, "").trim();
    if (core && !/cache/i.test(core) && /vault/i.test(core)) core = `${core} cache`;
    return core;
  }

  function normalizeRecommendedLine(last) {
    const stats = normalizeStatsText(last?.recommendedStatsText || last?.recommendedStatLabels || last?.recommendedStats);
    return stats ? `Recommended: ${stats}` : "";
  }

  function normalizePetFitEffect(last) {
    const direct = textOrEmpty(last?.petFitEffect);
    if (direct) return `Effect: ${direct}`;
    const matchKey = textOrEmpty(last?.activePetMatch || last?.petMatch).toLowerCase();
    if (matchKey === "strong") return "Effect: stronger pet assist";
    if (matchKey === "neutral") return "Effect: steady pet assist";
    if (matchKey === "weak") return "Effect: weaker pet assist";
    return "";
  }

  function normalizeBonusFoundChip(last) {
    if (!(last?.bonusFound || last?.rareHit)) return "";
    const label = textOrEmpty(last?.bonusFoundLabel) || "Rare Cache";
    const details = normalizeRewardList(last?.bonusFoundDetails);
    return details.length
      ? `Bonus found: ${label} (${details.join(", ")})`
      : `Bonus found: ${label}`;
  }

  function normalizeMissionSignalNote(last) {
    if (last?.bonusFound || last?.rareHit) return "";
    const rareHint = normalizeRareChanceLabel(last?.rareHint);
    if (rareHint) return `Route signal: ${rareHint}. Rare Bonus Signal only - route hint, not loot and not stored progress.`;
    return "";
  }

  function normalizeRewardList(v) {
    if (Array.isArray(v)) {
      return v
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (typeof item === "number" && Number.isFinite(item)) return String(item);
          if (item && typeof item === "object") {
            const label = textOrEmpty(item.label || item.name || item.text || item.value);
            return label;
          }
          return "";
        })
        .filter(Boolean);
    }
    const text = textOrEmpty(v);
    return text ? [text] : [];
  }

  function splitLastResolveRewards(list) {
    const baseRewards = [];
    const eventRewards = [];
    const extraRecovered = [];

    (Array.isArray(list) ? list : []).forEach((raw) => {
      const item = textOrEmpty(raw);
      if (!item) return;
      const lower = item.toLowerCase();
      if (lower.includes("blue signal fragment")) {
        eventRewards.push(item);
        return;
      }
      if (/\bxp\b/i.test(item) || /\bbones\b/i.test(item)) {
        baseRewards.push(item);
        return;
      }
      extraRecovered.push(item);
    });

    return { baseRewards, eventRewards, extraRecovered };
  }

  function showMissionProgressToast(config, fallbackText) {
    const input = (config && typeof config === "object") ? config : {};
    try {
      if (window.AlphaToast && typeof window.AlphaToast.showProgressSummary === "function") {
        if (window.AlphaToast.showProgressSummary({
          type: input.type || "success",
          title: input.title || "Mission Result",
          lines: Array.isArray(input.lines) ? input.lines.filter(Boolean) : [],
          message: input.message || "",
          meta: input.meta || "",
          ttl: input.ttl || 3900,
        })) {
          return true;
        }
      }
    } catch (_) {}
    if (fallbackText && typeof window.toast === "function") {
      try { window.toast(fallbackText); return true; } catch (_) {}
    }
    return false;
  }

  function pushMissionToastLine(lines, value) {
    const text = textOrEmpty(value).replace(/\s+/g, " ").trim();
    if (!text || lines.includes(text)) return;
    lines.push(text);
  }

  function extractMissionSignalDelta(payload) {
    const progression = normalizeProgressionV1(
      payload?.progression_v1
      || payload?.stats?.progression_v1
      || getStatsPayload(payload)?.progression_v1
      || payload?.progression
    );
    const nextSignal = Math.max(0, n(progression?.signalPower, 0));
    const previousSignal = Math.max(0, n(_progressionV1?.signalPower, 0));
    if (nextSignal > previousSignal && previousSignal > 0) return nextSignal - previousSignal;
    return Math.max(0, n(payload?.signalPowerDelta ?? payload?.signal_power_delta ?? progression?.signalPowerDelta ?? progression?.signal_power_delta, 0));
  }

  function parseMissionRewardTextToLines(lines, value) {
    const entries = normalizeRewardList(value);
    entries.forEach((entry) => {
      const lower = entry.toLowerCase();
      if (!entry) return;
      const xpMatch = entry.match(/xp[^0-9]*([0-9]+)/i);
      if (xpMatch) {
        pushMissionToastLine(lines, `XP +${xpMatch[1]}`);
        return;
      }
      const bonesMatch = entry.match(/bones?[^0-9]*([0-9]+)/i);
      if (bonesMatch) {
        pushMissionToastLine(lines, `Bones +${bonesMatch[1]}`);
        return;
      }
      const signalMatch = entry.match(/signal power[^0-9]*([0-9]+)/i);
      if (signalMatch) {
        pushMissionToastLine(lines, `Signal Power +${signalMatch[1]}`);
        return;
      }
      const cleaned = entry.replace(/^(recovered|reward|loot|drop|found|bonus found)\s*:?\s*/i, "").trim();
      if (cleaned) pushMissionToastLine(lines, `Item found: ${cleaned}`);
    });
  }

  function buildMissionResolveToast(res) {
    const payload = normalizePayload(res) || res || {};
    const last = payload?.lastResolve || payload?.last_resolve || null;
    if (!last || typeof last !== "object") return null;
    const lines = [];
    parseMissionRewardTextToLines(lines, last?.recoveredRewards);
    if (!lines.length) parseMissionRewardTextToLines(lines, last?.rewardMsg || last?.reward_msg);
    if (!lines.length) parseMissionRewardTextToLines(lines, last?.lootMsg || last?.loot_msg);
    const signalDelta = extractMissionSignalDelta(payload);
    if (signalDelta > 0) pushMissionToastLine(lines, `Signal Power +${signalDelta}`);
    const tone = normalizeOutcomeTone(normalizeOutcomeTier(last));
    const title = tone === "failed" ? "Mission Resolved" : "Mission Completed";
    if (!lines.length) {
      const fallback = textOrEmpty(last?.rewardMsg || last?.reward_msg || last?.lootMsg || last?.loot_msg);
      if (fallback) pushMissionToastLine(lines, fallback);
    }
    return {
      title,
      type: lines.some((line) => /^Item found:/i.test(line)) ? "drop" : "success",
      lines,
    };
  }
  function rewardIconKeyFromLabel(label) {
    const lower = textOrEmpty(label).toLowerCase();
    if (!lower) return "";
    if (lower.includes("blue signal fragment")) return "blue_signal_fragment";
    return "";
  }

  function renderTagWithIcon(text, iconKey = "") {
    const label = textOrEmpty(text);
    if (!label) return "";
    return `<span class="m-tag m-tag-with-icon">${renderDecorativeIcon(iconKey, "m-tag-icon")}<span>${esc(label)}</span></span>`;
  }

  function renderClarityHint(opts = {}) {
    const eyebrow = textOrEmpty(opts.eyebrow);
    const title = textOrEmpty(opts.title);
    const body = textOrEmpty(opts.body);
    const tone = textOrEmpty(opts.tone);
    if (!title && !body) return "";
    return `
      <div class="m-clarity${tone ? ` is-${esc(tone)}` : ""}">
        ${renderDecorativeIcon(opts.iconKey, "m-clarity-icon")}
        <div class="m-clarity-copy">
          ${eyebrow ? `<div class="m-clarity-eyebrow">${esc(eyebrow)}</div>` : ""}
          ${title ? `<div class="m-clarity-title">${esc(title)}</div>` : ""}
          ${body ? `<div class="m-clarity-body">${esc(body)}</div>` : ""}
        </div>
      </div>
    `;
  }

  function renderRewardRows(list) {
    const items = Array.isArray(list) ? list.map((item) => textOrEmpty(item)).filter(Boolean) : [];
    if (!items.length) return "";
    return `<div class="m-reward-list">${items.map((item) => {
      const iconKey = rewardIconKeyFromLabel(item);
      return `<div class="m-reward-row">${renderDecorativeIcon(iconKey, "m-reward-icon")}<span class="m-reward-text">${esc(item)}</span></div>`;
    }).join("")}</div>`;
  }

  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  let _modal = null; // #missionsBack or #missionsModal
  let _root = null;  // #missionsRoot
  let _tick = null;
  let _state = null;
  let _stateLoadedAt = 0;
  let _missionsHelpOpen = false;
  const MISSIONS_STATE_STALE_MS = 10 * 1000;

  let _progressionV1 = null;
  let _progressionStatus = "syncing";
  let _progressionLoadedAt = 0;

  // ✅ start sync guard (prevents "blink back to offers")
  let _pendingStart = null; // { tier, offerId, startedClientSec, durationSec, title, untilMs, rareDrop? }
  let _missionDuelPlaybackSeq = 0;

  function log(...a) { if (_dbg) console.log("[Missions]", ...a); }

  // === TELEGRAM ANALYTICS HELPER (bezpieczny) ===
  function track(eventName, data = {}) {
    if (typeof window.telegramAnalytics?.trackEvent === "function") {
      window.telegramAnalytics.trackEvent(eventName, data);
    }
    // else { quietly ignore - SDK jeszcze się ładuje }
  }

  // =========================
  // Styles (S&F vibe inside Missions content; + full-screen for #missionsBack)
  // =========================
  function ensureStyles() {
    if (document.getElementById("missions-ui-css")) return;

    const st = document.createElement("style");
    st.id = "missions-ui-css";
    st.textContent = `
      :root{
        /* ✅ ZMIEŃ jeśli pliki są w innym folderze względem index.html */
        --missions-bg: url("mission_bg.webp");
        --missions-wait-bg: url("mission_waiting_bg.webp");
        --missions-dust: url("dust.png");
      }

      #missionsRoot{ display:block !important; }

      /* ✅ FULL SCREEN sheet — Missions feels like its own screen (not a popup) */
      #missionsBack{
        position:fixed !important;
        inset:0 !important;
        z-index: 99999999 !important;
        display:none; /* JS sets display:flex */
        align-items:stretch !important;
        justify-content:stretch !important;
        padding:0 !important;

        /* full-screen background */
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.88), rgba(6,10,14,.94)),
          var(--missions-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
      }
      #missionsBack.is-open{ display:flex !important; }

      /* wipe ALL typical modal wrappers inside missionsBack */
      #missionsBack > *,
      #missionsBack .modal,
      #missionsBack .panel,
      #missionsBack .sheet,
      #missionsBack .modal-panel,
      #missionsBack #missionsModal{
        width:100% !important;
        height:100% !important;
        max-width:none !important;
        max-height:none !important;
        margin:0 !important;
        border-radius:0 !important;
        box-shadow:none !important;
        background: transparent !important;
        border:0 !important;

        display:flex !important;
        flex-direction:column !important;
        min-height:0 !important;
      }

      /* content scroll area */
      #missionsBack #missionsRoot{
        flex: 1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        -webkit-overflow-scrolling:touch;
        padding: 10px 10px calc(12px + env(safe-area-inset-bottom)) 10px !important;
      }

      /* if you have a bottom button row from index, keep it sticky */
      #missionsBack .btn-row{
        display:none !important;
      }

      /* Base stage (offers screen) */
      #missionsRoot .m-stage{
        position:relative;
        border:1px solid rgba(36,50,68,.95);
        border-radius:16px;
        padding:10px;
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.55), rgba(6,10,14,.86)),
          var(--missions-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
        box-shadow:
          0 18px 48px rgba(0,0,0,.62),
          inset 0 1px 0 rgba(255,255,255,.08),
          inset 0 0 0 1px rgba(0,229,255,.06);
        outline:1px solid rgba(0,229,255,.08);
        overflow:hidden;
      }

      /* WAITING mode = whole screen switches background */
      #missionsRoot .m-stage.m-stage-wait{
        background:
          radial-gradient(circle at 18% 10%, rgba(0,229,255,.10), transparent 55%),
          radial-gradient(circle at 82% 92%, rgba(255,176,0,.10), transparent 58%),
          linear-gradient(to bottom, rgba(6,10,14,.55), rgba(6,10,14,.86)),
          var(--missions-wait-bg);
        background-position:center;
        background-size:cover;
        background-repeat:no-repeat;
      }

      #missionsRoot .m-stage::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        z-index:0;
        background:
          radial-gradient(circle at 50% 40%, rgba(0,0,0,.06), rgba(0,0,0,.56) 78%, rgba(0,0,0,.74) 100%),
          repeating-linear-gradient(
            to bottom,
            rgba(255,255,255,.030),
            rgba(255,255,255,.030) 1px,
            rgba(0,0,0,0) 3px,
            rgba(0,0,0,0) 6px
          );
        opacity:.28;
        mix-blend-mode: overlay;
      }

      #missionsRoot .m-stage::after{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        z-index:0;
        background: var(--missions-dust);
        background-size: cover;
        background-position: center;
        opacity: .18;
        mix-blend-mode: screen;
      }

      #missionsRoot .m-stage > *{ position:relative; z-index:1; }

      #missionsRoot .m-card{
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 12px;
        padding: 10px;
        background: rgba(0,0,0,.20);
        color: rgba(255,255,255,.92);
        backdrop-filter: blur(10px);
        box-shadow: 0 12px 28px rgba(0,0,0,.28);
      }

      #missionsRoot .m-title{
        font-weight:900;
        letter-spacing:.2px;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      #missionsRoot .m-muted{
        opacity:.78;
        font-size:12.5px;
        line-height:1.35;
        overflow-wrap:anywhere;
        word-break:break-word;
      }
      #missionsRoot .m-kicker{
        font-size: 11px;
        letter-spacing: .45px;
        text-transform: uppercase;
        opacity: .72;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-tag-row{
        display:flex;
        flex-wrap:wrap;
        gap:5px;
        margin-top:6px;
      }
      #missionsRoot .m-tag{
        display:inline-flex;
        align-items:center;
        min-height:19px;
        padding:0 7px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.05);
        font-size:10.5px;
        line-height:1.2;
        opacity:.9;
        white-space:normal;
        max-width:100%;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-tag-with-icon{
        gap:6px;
        padding:3px 8px 3px 5px;
      }
      #missionsRoot .m-ui-icon{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        flex:0 0 auto;
        pointer-events:none;
      }
      #missionsRoot .m-ui-icon img{
        display:block;
        width:100%;
        height:100%;
        object-fit:contain;
        transform:translateZ(0);
      }
      #missionsRoot .m-tag-icon{
        width:16px;
        height:16px;
      }
      #missionsRoot .m-clarity{
        display:flex;
        align-items:flex-start;
        gap:10px;
        margin-top:10px;
        padding:9px 10px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
      }
      #missionsRoot .m-clarity.is-fragment{
        border-color:rgba(76,176,255,.22);
      }
      #missionsRoot .m-clarity.is-signal{
        border-color:rgba(120,196,255,.18);
      }
      #missionsRoot .m-clarity-icon{
        width:34px;
        height:34px;
      }
      #missionsRoot .m-clarity-copy{
        min-width:0;
        flex:1 1 auto;
      }
      #missionsRoot .m-clarity-eyebrow{
        font-size:10.5px;
        font-weight:900;
        letter-spacing:.38px;
        text-transform:uppercase;
        opacity:.74;
      }
      #missionsRoot .m-clarity-title{
        margin-top:2px;
        font-size:12.5px;
        font-weight:900;
        line-height:1.28;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-clarity-body{
        margin-top:3px;
        font-size:11.5px;
        line-height:1.35;
        opacity:.84;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-reward-list{
        display:grid;
        gap:8px;
        margin-top:6px;
      }
      #missionsRoot .m-reward-row{
        display:flex;
        align-items:center;
        gap:10px;
        min-width:0;
      }
      #missionsRoot .m-reward-icon{
        width:30px;
        height:30px;
      }
      #missionsRoot .m-reward-text{
        min-width:0;
        line-height:1.42;
        overflow-wrap:anywhere;
      }

      #missionsRoot .m-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
        min-width:0;
      }

      #missionsRoot .m-hr{
        height:1px;
        background: rgba(255,255,255,.08);
        margin:8px 0;
      }

      #missionsRoot .m-shell-head{
        display:flex;
        flex-direction:column;
        gap:3px;
        margin-bottom:8px;
      }
      #missionsRoot .m-shell-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
      }
      #missionsRoot .m-shell-sub{
        font-size:12px;
        opacity:.76;
        line-height:1.3;
      }
      #missionsRoot .m-inline-status{
        margin-top:2px;
        font-size:12px;
        opacity:.82;
        line-height:1.3;
      }
      #missionsRoot .m-head-btn{
        flex:0 0 auto;
      }
      #missionsRoot .m-compact-btn{
        min-height:34px;
        padding:7px 12px;
        font-size:12px;
      }
      #missionsRoot .m-help-btn{
        min-width:34px;
        padding:7px 10px;
        border-radius:999px;
        font-weight:900;
      }
      #missionsRoot .m-help{
        margin-top:8px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:12px;
        padding:10px;
        background:rgba(255,255,255,.04);
      }
      #missionsRoot .m-help-title{
        font-size:12px;
        font-weight:900;
        letter-spacing:.4px;
        text-transform:uppercase;
        opacity:.88;
      }
      #missionsRoot .m-help-copy{
        margin-top:7px;
        font-size:12px;
        line-height:1.38;
        opacity:.84;
      }

      /* Offers */
      #missionsRoot .m-offer{
        border:1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.18);
        border-radius:12px;
        padding:9px 10px;
        overflow:hidden;
      }
      #missionsRoot .m-offer + .m-offer{ margin-top:8px; }
      #missionsRoot .m-offer:hover{
        border-color: rgba(0,229,255,.18);
        box-shadow: 0 10px 22px rgba(0,0,0,.26);
      }
      #missionsRoot .m-offer-main{
        display:flex;
        align-items:flex-start;
        gap:10px;
        min-width:0;
      }
      #missionsRoot .m-offer-copy{
        flex:1 1 auto;
        min-width:0;
      }
      #missionsRoot .m-offer-top{
        display:flex;
        align-items:center;
        gap:6px;
        flex-wrap:wrap;
        margin-bottom:4px;
      }
      #missionsRoot .m-offer-title{
        font-size:15px;
        font-weight:900;
        line-height:1.18;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-offer-body{
        margin-top:4px;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:2;
        overflow:hidden;
      }
      #missionsRoot .m-offer-helper{
        margin-top:5px;
        font-size:11.5px;
        opacity:.82;
        line-height:1.3;
      }
      #missionsRoot .m-offer-reward{
        margin-top:5px;
        font-size:11.5px;
        opacity:.8;
        line-height:1.3;
      }
      #missionsRoot .m-offer-cta{
        flex:0 0 auto;
        align-self:center;
      }
      #missionsRoot .m-offer-cta .btn{
        min-height:34px;
        padding:7px 12px;
      }
      #missionsRoot button[disabled]{ opacity:.55; cursor:not-allowed; }

      /* WAITING UI */
      #missionsRoot .m-wait-center{
        min-height: 360px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        text-align:center;
        gap:10px;
        padding:18px;
      }

      #missionsRoot .m-clock{
        font-size: 52px;
        font-weight: 950;
        letter-spacing: 1px;
        text-shadow: 0 10px 26px rgba(0,0,0,.60);
      }

      #missionsRoot .m-clock-sub{
        font-size: 12.5px;
        opacity: .86;
      }

      #missionsRoot .m-bar{
        height:10px;
        border-radius:999px;
        overflow:hidden;
        background: rgba(255,255,255,.10);
        border: 1px solid rgba(255,255,255,.10);
        width: min(520px, 92%);
        margin-top: 10px;
      }
      #missionsRoot .m-bar-fill{
        height:100%;
        width:0%;
        background: linear-gradient(90deg, rgba(0,229,255,.65), rgba(43,139,217,.92));
        transition: width .25s linear;
      }

      /* ✅ Possible rare drop card */
      #missionsRoot .m-rare{
        width: min(520px, 92%);
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(0,0,0,.24);
        backdrop-filter: blur(10px);
        box-shadow: 0 16px 34px rgba(0,0,0,.32);
        padding: 10px 10px;
        margin-top: 10px;
        text-align:left;
        position:relative;
        overflow:hidden;
      }
      #missionsRoot .m-rare::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background:
          radial-gradient(circle at 22% 18%, rgba(255,255,255,.10), transparent 55%),
          radial-gradient(circle at 92% 88%, rgba(0,229,255,.10), transparent 58%);
        opacity:.55;
        mix-blend-mode: overlay;
      }
      #missionsRoot .m-rare > *{ position:relative; z-index:1; }

      #missionsRoot .m-rare-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom: 8px;
      }
      #missionsRoot .m-rare-tag{
        font-size: 11px;
        letter-spacing: .4px;
        text-transform: uppercase;
        opacity: .86;
      }
      #missionsRoot .m-rare-chance{
        font-size: 11px;
        opacity: .82;
        white-space:nowrap;
      }

      #missionsRoot .m-rare-row{
        display:flex;
        gap:10px;
        align-items:center;
        min-width:0;
      }
      #missionsRoot .m-rare-ico{
        width: 46px;
        height: 46px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.06);
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
        flex: 0 0 auto;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
      }
      #missionsRoot .m-rare-ico img{
    width: 100%;
    height: 100%;
    object-fit: contain;
    transform: translateZ(0);
    filter: drop-shadow(0 10px 18px rgba(0,0,0,.35));
  }
  #missionsRoot .m-rare-ico .m-rare-fallback{
    font-weight: 950;
    opacity: .95;
    font-size: 20px;
    color: rgba(255,255,255,.92);
    text-shadow: 0 10px 22px rgba(0,0,0,.55);
  }
      #missionsRoot .m-rare-meta{
        min-width:0;
        display:flex;
        flex-direction:column;
        gap:2px;
      }
      #missionsRoot .m-rare-name{
        font-weight: 900;
        letter-spacing: .15px;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #missionsRoot .m-rare-sub{
        font-size: 12px;
        opacity: .84;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      /* rarity accents (subtle) */
      #missionsRoot .m-rare[data-rarity="uncommon"]{ border-color: rgba(120,255,120,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(120,255,120,.06); }
      #missionsRoot .m-rare[data-rarity="rare"]{ border-color: rgba(80,180,255,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(80,180,255,.06); }
      #missionsRoot .m-rare[data-rarity="epic"]{ border-color: rgba(200,120,255,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(200,120,255,.06); }
      #missionsRoot .m-rare[data-rarity="legendary"]{ border-color: rgba(255,200,90,.18); box-shadow: 0 16px 34px rgba(0,0,0,.32), inset 0 0 0 1px rgba(255,200,90,.06); }

      #missionsRoot .m-actions{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        justify-content:center;
        margin-top: 10px;
      }

      #missionsRoot .m-report{
        border:1px solid rgba(120,160,190,.16);
        background:
          linear-gradient(180deg, rgba(6,10,14,.42), rgba(6,10,14,.70)),
          radial-gradient(circle at top right, rgba(0,229,255,.08), transparent 42%);
      }
      #missionsRoot .m-outcome-badge{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:24px;
        padding:4px 10px;
        border-radius:999px;
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(255,255,255,.06);
        color:rgba(255,255,255,.95);
        max-width:100%;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-outcome-badge[data-tone="critical"]{
        border-color:rgba(255,208,96,.38);
        background:rgba(255,176,0,.12);
        color:rgba(255,232,188,.98);
      }
      #missionsRoot .m-outcome-badge[data-tone="success"]{
        border-color:rgba(92,222,180,.28);
        background:rgba(47,161,125,.14);
      }
      #missionsRoot .m-outcome-badge[data-tone="partial"]{
        border-color:rgba(120,188,255,.28);
        background:rgba(52,108,168,.16);
      }
      #missionsRoot .m-outcome-badge[data-tone="failed"]{
        border-color:rgba(255,128,128,.28);
        background:rgba(122,48,48,.18);
      }
      #missionsRoot .m-report-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        min-width:0;
      }
      #missionsRoot .m-report-title{
        font-size:15px;
        font-weight:900;
        letter-spacing:.15px;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-sub{
        margin-top:4px;
        font-size:12px;
        opacity:.78;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-line{
        margin-top:8px;
        font-size:12.5px;
        line-height:1.42;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-chipline{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        margin-top:8px;
      }
      #missionsRoot .m-report-chip{
        display:inline-flex;
        align-items:center;
        min-height:22px;
        padding:0 8px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.05);
        font-size:11px;
        line-height:1.2;
        white-space:normal;
        max-width:100%;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-report-section{
        margin-top:10px;
        padding-top:10px;
        border-top:1px solid rgba(255,255,255,.08);
      }
      #missionsRoot .m-report-label{
        font-size:11px;
        font-weight:900;
        letter-spacing:.45px;
        text-transform:uppercase;
        opacity:.72;
      }
      #missionsRoot .m-report-values{
        margin-top:6px;
        font-size:12.5px;
        line-height:1.42;
        overflow-wrap:anywhere;
      }

      #missionsRoot .m-elite-wrap{
        margin-top:10px;
        border-color:rgba(255,176,0,.14);
        box-shadow:0 12px 28px rgba(0,0,0,.24), inset 0 0 0 1px rgba(255,176,0,.05);
      }
      #missionsRoot .m-elite-kicker{
        font-size:11px;
        letter-spacing:.42px;
        text-transform:uppercase;
        opacity:.72;
      }
      #missionsRoot .m-elite-safety{
        margin-top:6px;
        font-size:11.5px;
        opacity:.76;
        line-height:1.35;
      }
      #missionsRoot .m-elite-sync{
        margin-top:10px;
        padding:9px 10px;
        border-radius:10px;
        border:1px dashed rgba(255,255,255,.12);
        background:rgba(255,255,255,.03);
        font-size:12px;
        opacity:.82;
      }
      #missionsRoot .m-elite-cards{
        display:grid;
        gap:8px;
        margin-top:10px;
      }
      #missionsRoot .m-elite-card{
        border:1px solid rgba(255,255,255,.10);
        border-radius:12px;
        padding:9px 10px;
        background:rgba(0,0,0,.16);
      }
      #missionsRoot .m-elite-card.is-locked{
        opacity:.88;
        border-color:rgba(255,255,255,.08);
      }
      #missionsRoot .m-elite-card-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
        min-width:0;
      }
      #missionsRoot .m-elite-card-title{
        font-size:14px;
        font-weight:900;
        line-height:1.22;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-elite-status{
        flex:0 0 auto;
        font-size:10.5px;
        font-weight:900;
        letter-spacing:.35px;
        text-transform:uppercase;
        padding:3px 7px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(255,255,255,.05);
        opacity:.92;
        white-space:nowrap;
      }
      #missionsRoot .m-elite-status.is-ready{
        border-color:rgba(92,222,180,.28);
        background:rgba(47,161,125,.14);
      }
      #missionsRoot .m-elite-status.is-locked{
        border-color:rgba(255,128,128,.22);
        background:rgba(122,48,48,.14);
      }
      #missionsRoot .m-elite-status.is-recommended{
        border-color:rgba(120,188,255,.24);
        background:rgba(52,108,168,.14);
      }
      #missionsRoot .m-elite-line{
        margin-top:6px;
        font-size:11.5px;
        line-height:1.35;
        opacity:.86;
        overflow-wrap:anywhere;
      }
      #missionsRoot .m-elite-line b{
        opacity:.95;
      }
      #missionsRoot .m-elite-cta{
        margin-top:8px;
        display:flex;
        justify-content:flex-end;
      }
      #missionsRoot .m-elite-cta .btn{
        min-height:32px;
        padding:6px 11px;
        font-size:11.5px;
        pointer-events:none;
      }
      .m-duel-overlay{
        position:absolute;
        inset:0;
        z-index:12;
        display:flex;
        align-items:stretch;
        justify-content:center;
        padding:16px;
        background:
          radial-gradient(circle at top, rgba(255,255,255,.04), transparent 40%),
          linear-gradient(180deg, rgba(4,6,10,.74), rgba(4,6,10,.95));
        overflow:hidden;
      }
      .m-duel-overlay::before{
        content:"";
        position:absolute;
        inset:0;
        background:
          repeating-linear-gradient(180deg, rgba(255,255,255,.042) 0 1px, transparent 1px 4px),
          linear-gradient(90deg, transparent 0, rgba(255,255,255,.05) 48%, transparent 54%);
        opacity:.34;
        pointer-events:none;
      }
      .m-duel-shell{
        position:relative;
        z-index:1;
        width:min(980px, 100%);
        min-height:100%;
        display:flex;
        flex-direction:column;
        gap:14px;
        padding:18px 18px 16px;
        border:1px solid rgba(255,255,255,.10);
        border-radius:24px;
        background:
          radial-gradient(circle at top center, rgba(255,110,72,.08), transparent 28%),
          linear-gradient(180deg, rgba(12,16,24,.95), rgba(7,9,14,.98));
        box-shadow:0 26px 90px rgba(0,0,0,.58), inset 0 0 0 1px rgba(255,255,255,.03);
        overflow:hidden;
      }
      .m-duel-shell::after{
        content:"";
        position:absolute;
        inset:auto -6% -90px;
        height:180px;
        background:radial-gradient(circle, rgba(255,255,255,.08), transparent 64%);
        opacity:.22;
        pointer-events:none;
      }
      .m-duel-head,
      .m-duel-stage-meta,
      .m-duel-panel-top,
      .m-duel-log-head,
      .m-duel-footer{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
      }
      .m-duel-head{
        align-items:flex-start;
      }
      .m-duel-kicker{
        font-size:10px;
        letter-spacing:.32em;
        text-transform:uppercase;
        color:rgba(255,196,140,.72);
      }
      .m-duel-title{
        margin-top:6px;
        font-size:28px;
        font-weight:900;
        letter-spacing:.05em;
        color:#f4f7fb;
      }
      .m-duel-sub{
        margin-top:4px;
        font-size:12px;
        line-height:1.45;
        color:rgba(225,233,244,.68);
      }
      .m-duel-stage{
        position:relative;
        flex:1 1 auto;
        display:flex;
        flex-direction:column;
        gap:14px;
      }
      .m-duel-arena{
        position:relative;
        display:grid;
        grid-template-columns:minmax(0,1fr) clamp(120px, 16vw, 172px) minmax(0,1fr);
        align-items:stretch;
        gap:18px;
      }
      .m-duel-panel{
        position:relative;
        display:flex;
        flex-direction:column;
        gap:12px;
        min-height:340px;
        padding:16px 16px 14px;
        border-radius:20px;
        border:1px solid rgba(255,255,255,.08);
        background:
          linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.015)),
          rgba(6,9,14,.84);
        box-shadow:inset 0 0 0 1px rgba(255,255,255,.02);
        transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, filter .18s ease;
        overflow:hidden;
      }
      .m-duel-panel::before{
        content:"";
        position:absolute;
        inset:0;
        background:linear-gradient(180deg, rgba(255,255,255,.05), transparent 24%, transparent 76%, rgba(255,255,255,.03));
        opacity:.4;
        pointer-events:none;
      }
      .m-duel-panel::after{
        content:"";
        position:absolute;
        inset:auto -10% -40px;
        height:130px;
        background:radial-gradient(circle, rgba(255,255,255,.08), transparent 62%);
        opacity:.34;
        pointer-events:none;
      }
      .m-duel-panel.is-player{
        border-color:rgba(132,208,255,.18);
      }
      .m-duel-panel.is-enemy{
        border-color:rgba(255,132,118,.18);
      }
      .m-duel-panel.is-hit{
        box-shadow:0 0 0 1px rgba(255,255,255,.04), inset 0 0 0 1px rgba(255,255,255,.04), 0 0 0 2px rgba(255,118,118,.14);
        filter:brightness(1.08);
      }
      .m-duel-panel.is-player.is-hit{
        background:
          linear-gradient(180deg, rgba(255,255,255,.038), rgba(255,255,255,.015)),
          rgba(40,17,18,.88);
      }
      .m-duel-panel.is-enemy.is-hit{
        background:
          linear-gradient(180deg, rgba(255,255,255,.038), rgba(255,255,255,.015)),
          rgba(74,23,19,.9);
      }
      .m-duel-panel.is-shake{
        animation:m-duel-shake .32s linear;
      }
      .m-duel-panel-top{
        position:relative;
        display:flex;
        justify-content:space-between;
        gap:10px;
        z-index:1;
        min-width:0;
        align-items:flex-start;
      }
      .m-duel-panel-top > :first-child{
        min-width:0;
        flex:1 1 auto;
      }
      .m-duel-side{
        font-size:10px;
        letter-spacing:.24em;
        text-transform:uppercase;
        color:rgba(220,227,236,.58);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .m-duel-name{
        margin-top:4px;
        font-size:22px;
        font-weight:900;
        line-height:1.06;
        color:#fbfdff;
        max-width:100%;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        overflow-wrap:normal;
        word-break:normal;
      }
      .m-duel-state{
        flex:0 0 auto;
        max-width:42%;
        padding:6px 9px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.05);
        font-size:10px;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(255,255,255,.8);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .m-duel-visual{
        position:relative;
        display:grid;
        place-items:center;
        flex:1 1 auto;
        min-height:184px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.06);
        background:
          radial-gradient(circle at center, rgba(255,255,255,.10), transparent 55%),
          linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));
        overflow:hidden;
      }
      .m-duel-visual.has-image{
        background:
          radial-gradient(circle at center, rgba(255,255,255,.06), transparent 56%),
          linear-gradient(180deg, rgba(255,255,255,.018), rgba(255,255,255,.01));
      }
      .m-duel-portrait{
        position:absolute;
        inset:0;
        z-index:2;
        width:100%;
        height:100%;
        object-fit:cover;
        object-position:center top;
      }
      .m-duel-panel.is-player .m-duel-portrait{
        object-fit:cover;
        object-position:center 22%;
        transform:scale(1.01);
      }
      .m-duel-panel.is-enemy .m-duel-portrait{
        object-position:center 18%;
      }
      .m-duel-visual.is-relay-visual .m-duel-portrait{
        object-fit:cover;
        object-position:56% 48%;
        transform:scale(1.09);
      }
      .m-duel-visual-fallback{
        position:absolute;
        inset:0;
        z-index:1;
        display:grid;
        place-items:center;
      }
      .m-duel-sigil{
        position:relative;
        width:112px;
        height:112px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:radial-gradient(circle, rgba(255,255,255,.08), rgba(255,255,255,.01) 60%, transparent 75%);
        box-shadow:0 0 28px rgba(0,0,0,.32), inset 0 0 22px rgba(255,255,255,.05);
      }
      .m-duel-sigil::before,
      .m-duel-sigil::after{
        content:"";
        position:absolute;
        inset:18px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
      }
      .m-duel-sigil::after{
        inset:36px;
        border-color:rgba(255,255,255,.18);
      }
      .m-duel-sigil-core{
        position:absolute;
        inset:50%;
        width:18px;
        height:18px;
        margin:-9px 0 0 -9px;
        transform:rotate(45deg);
        background:rgba(255,255,255,.78);
        box-shadow:0 0 18px rgba(255,255,255,.18);
      }
      .m-duel-sigil-lines{
        position:absolute;
        inset:18px;
      }
      .m-duel-sigil-lines::before,
      .m-duel-sigil-lines::after{
        content:"";
        position:absolute;
        left:50%;
        top:0;
        bottom:0;
        width:1px;
        margin-left:-.5px;
        background:linear-gradient(180deg, transparent, rgba(255,255,255,.28), transparent);
      }
      .m-duel-sigil-lines::after{
        top:50%;
        left:0;
        right:0;
        width:auto;
        height:1px;
        margin:0;
        background:linear-gradient(90deg, transparent, rgba(255,255,255,.28), transparent);
      }
      .m-duel-panel.is-player .m-duel-sigil{
        border-color:rgba(120,198,255,.24);
        box-shadow:0 0 28px rgba(43,128,217,.18), inset 0 0 22px rgba(120,198,255,.08);
      }
      .m-duel-panel.is-enemy .m-duel-sigil{
        border-color:rgba(255,142,108,.24);
        box-shadow:0 0 28px rgba(204,66,66,.18), inset 0 0 22px rgba(255,142,108,.08);
      }
      .m-duel-stamp{
        position:absolute;
        left:14px;
        bottom:12px;
        z-index:3;
        max-width:calc(100% - 28px);
        padding:5px 8px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(5,8,12,.58);
        font-size:10px;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(240,244,250,.82);
        backdrop-filter:blur(4px);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .m-duel-panel.is-player .m-duel-stamp{
        border-color:rgba(120,198,255,.16);
      }
      .m-duel-panel.is-enemy .m-duel-stamp{
        border-color:rgba(255,142,108,.18);
      }
      .m-duel-hp{
        font-size:11px;
        letter-spacing:.14em;
        text-transform:uppercase;
        color:rgba(230,236,244,.74);
      }
      .m-duel-bar{
        position:relative;
        height:14px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.06);
      }
      .m-duel-bar-fill{
        height:100%;
        width:100%;
        transition:width .52s cubic-bezier(.2,.8,.2,1), background .32s ease;
        background:linear-gradient(90deg, rgba(145,250,182,.96), rgba(41,169,109,.96));
      }
      .m-duel-panel.is-enemy .m-duel-bar-fill{
        background:linear-gradient(90deg, rgba(255,173,97,.95), rgba(214,62,62,.98));
      }
      .m-duel-bar.is-critical .m-duel-bar-fill{
        background:linear-gradient(90deg, rgba(255,214,97,.96), rgba(227,64,64,.99));
      }
      .m-duel-damage{
        position:absolute;
        top:16px;
        right:14px;
        z-index:4;
        padding:6px 10px;
        border-radius:999px;
        background:rgba(255,255,255,.08);
        border:1px solid rgba(255,255,255,.12);
        font-size:14px;
        font-weight:900;
        letter-spacing:.08em;
        color:#fff6f6;
        opacity:0;
        transform:translateY(12px) scale(.82);
        pointer-events:none;
      }
      .m-duel-damage.is-visible{
        opacity:1;
        transform:translateY(0) scale(1);
        transition:opacity .18s ease, transform .18s ease;
      }
      .m-duel-damage.is-player-hit{
        background:rgba(255,94,94,.14);
        border-color:rgba(255,148,148,.22);
      }
      .m-duel-damage.is-enemy-hit{
        background:rgba(255,176,92,.16);
        border-color:rgba(255,196,148,.24);
      }
      .m-duel-clash{
        position:relative;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:12px;
        min-height:340px;
      }
      .m-duel-clash::before{
        content:"";
        position:absolute;
        inset:18px 50% 18px auto;
        width:1px;
        margin-right:-.5px;
        background:linear-gradient(180deg, transparent, rgba(255,255,255,.08), transparent);
      }
      .m-duel-label{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:7px 11px;
        border-radius:999px;
        background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08);
        font-size:11px;
        text-transform:uppercase;
        letter-spacing:.18em;
        color:rgba(244,247,251,.82);
      }
      .m-duel-label::before{
        content:"";
        width:7px;
        height:7px;
        border-radius:999px;
        background:rgba(255,176,88,.92);
        box-shadow:0 0 10px rgba(255,176,88,.65);
      }
      .m-duel-vs{
        position:relative;
        width:100%;
        display:flex;
        align-items:center;
        justify-content:center;
      }
      .m-duel-vs-ring{
        position:relative;
        width:108px;
        height:108px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.12);
        background:
          radial-gradient(circle, rgba(255,255,255,.08), rgba(255,255,255,.015) 60%, transparent 78%);
        box-shadow:0 0 28px rgba(0,0,0,.28), inset 0 0 22px rgba(255,255,255,.06);
        display:grid;
        place-items:center;
      }
      .m-duel-vs-ring::before,
      .m-duel-vs-ring::after{
        content:"";
        position:absolute;
        inset:-18px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.06);
      }
      .m-duel-vs-ring::after{
        inset:18px;
        border-color:rgba(255,255,255,.14);
      }
      .m-duel-vs-core{
        position:relative;
        z-index:1;
        font-size:30px;
        font-weight:900;
        letter-spacing:.22em;
        text-indent:.22em;
        color:rgba(255,255,255,.88);
      }
      .m-duel-clash-text{
        min-height:34px;
        max-width:170px;
        text-align:center;
        font-size:12px;
        line-height:1.4;
        letter-spacing:.14em;
        text-transform:uppercase;
        color:rgba(239,244,250,.82);
      }
      .m-duel-clash.is-player-strike .m-duel-vs-ring{
        border-color:rgba(120,198,255,.22);
        box-shadow:0 0 26px rgba(43,128,217,.18), inset 0 0 22px rgba(120,198,255,.08);
      }
      .m-duel-clash.is-enemy-strike .m-duel-vs-ring{
        border-color:rgba(255,142,108,.22);
        box-shadow:0 0 26px rgba(214,62,62,.18), inset 0 0 22px rgba(255,142,108,.08);
      }
      .m-duel-clash.is-critical .m-duel-vs-ring{
        transform:scale(1.06);
      }
      .m-duel-progress{
        font-size:11px;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(221,229,238,.66);
      }
      .m-duel-result{
        opacity:0;
        transform:translateY(10px) scale(.96);
        transition:opacity .28s ease, transform .28s ease;
        padding:8px 12px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        font-size:12px;
        line-height:1.2;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(255,255,255,.82);
        text-align:center;
      }
      .m-duel-result.is-visible{
        opacity:1;
        transform:translateY(0) scale(1);
      }
      .m-duel-result[data-tone="victory"]{
        border-color:rgba(105,232,177,.24);
        background:rgba(39,115,88,.22);
        color:#dffaf0;
      }
      .m-duel-result[data-tone="defeat"]{
        border-color:rgba(255,116,116,.24);
        background:rgba(120,34,34,.24);
        color:#ffe7e7;
      }
      .m-duel-stage-meta{
        font-size:11px;
        letter-spacing:.1em;
        text-transform:uppercase;
        color:rgba(218,226,238,.68);
      }
      .m-duel-log{
        min-height:132px;
        max-height:164px;
        padding:12px 14px;
        border-radius:18px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(2,4,8,.54);
        display:flex;
        flex-direction:column;
        gap:10px;
      }
      .m-duel-log-head{
        font-size:11px;
        letter-spacing:.18em;
        text-transform:uppercase;
        color:rgba(235,240,247,.7);
      }
      .m-duel-log-lines{
        display:flex;
        flex-direction:column;
        gap:8px;
      }
      .m-duel-log-line{
        padding:8px 10px;
        border-radius:12px;
        background:rgba(255,255,255,.035);
        border:1px solid rgba(255,255,255,.05);
        font-size:12px;
        line-height:1.4;
        color:rgba(240,244,250,.82);
      }
      .m-duel-log-line.is-live{
        border-color:rgba(255,196,128,.18);
        background:rgba(255,255,255,.06);
        color:#fff8ef;
      }
      .m-duel-footer{
        font-size:11px;
        letter-spacing:.12em;
        text-transform:uppercase;
        color:rgba(225,232,240,.62);
      }
      .m-duel-footer-note{
        opacity:.84;
      }
      .m-duel-skip{
        flex:0 0 auto;
        min-height:28px;
        padding:5px 10px;
        border-color:rgba(255,255,255,.08);
        background:rgba(255,255,255,.035);
        font-size:11px;
        letter-spacing:.12em;
        text-transform:uppercase;
        color:rgba(240,244,250,.76);
        opacity:.78;
      }
      .m-duel-skip:hover{
        opacity:.96;
      }
      @keyframes m-duel-shake{
        0%{ transform:translate3d(0,0,0); }
        25%{ transform:translate3d(-4px,1px,0); }
        50%{ transform:translate3d(4px,-1px,0); }
        75%{ transform:translate3d(-3px,0,0); }
        100%{ transform:translate3d(0,0,0); }
      }

      @media (max-width: 520px){
        #missionsRoot .m-row,
        #missionsRoot .m-report-head,
        #missionsRoot .m-shell-top{
          flex-direction:column;
        }
        #missionsRoot .m-offer-main{
          flex-direction:column;
        }
        #missionsRoot .m-offer button.btn.primary{
          width:100%;
        }
        #missionsRoot .m-offer-cta{
          width:100%;
        }
        #missionsRoot .m-clock{
          font-size:42px;
        }
        #missionsRoot .m-clarity-icon{
          width:30px;
          height:30px;
        }
        #missionsRoot .m-reward-icon{
          width:28px;
          height:28px;
        }
        #missionsRoot .m-elite-card-top{
          flex-direction:column;
        }
        #missionsRoot .m-elite-cta .btn{
          width:100%;
        }
        .m-duel-overlay{
          padding:10px;
        }
        .m-duel-shell{
          padding:14px;
          border-radius:18px;
        }
        .m-duel-head,
        .m-duel-stage-meta,
        .m-duel-footer{
          flex-direction:column;
          align-items:stretch;
        }
        .m-duel-title{
          font-size:22px;
        }
        .m-duel-arena{
          gap:10px;
          grid-template-columns:minmax(0,1fr) 94px minmax(0,1fr);
        }
        .m-duel-panel{
          min-height:270px;
          padding:12px;
        }
        .m-duel-name{
          font-size:15px;
        }
        .m-duel-side,
        .m-duel-state,
        .m-duel-stamp{
          letter-spacing:.12em;
        }
        .m-duel-visual{
          min-height:138px;
        }
        .m-duel-panel.is-player .m-duel-portrait{
          transform:scale(1);
        }
        .m-duel-visual.is-relay-visual .m-duel-portrait{
          transform:scale(1.06);
        }
        .m-duel-vs-ring{
          width:78px;
          height:78px;
        }
        .m-duel-vs-core{
          font-size:23px;
          letter-spacing:.18em;
          text-indent:.18em;
        }
        .m-duel-clash-text{
          max-width:96px;
          font-size:10px;
        }
        .m-duel-progress,
        .m-duel-result{
          font-size:10px;
          letter-spacing:.12em;
        }
        .m-duel-log{
          min-height:120px;
          max-height:none;
        }
      }
    `;
    document.head.appendChild(st);
  }

  // =========================
  // Modal wiring
  // =========================
  function bindOnceModalClicks() {
    if (!_modal) return;
    if (_modal.__AH_MISSIONS_BOUND) return;
    _modal.__AH_MISSIONS_BOUND = 1;

    _modal.addEventListener("click", (e) => {
      if (e.target === _modal) close();
    });

    _modal.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-act], [data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (!act) return;

      if (act === "refresh") return void doRefresh();
      if (act === "start")   return void doStart(btn.dataset.tier || "", btn.dataset.offer || "");
      if (act === "resolve") return void doResolve();
      if (act === "claim_blue_signal_frame") return void doClaimBlueSignalFrame();
      if (act === "open_frames") return void openFrames();
      if (act === "close")   return void close();
      if (act === "toggle_help") { _missionsHelpOpen = !_missionsHelpOpen; return void render(); }
      if (act === "back_to_offers") { _pendingStart = null; stopTick(); return void loadState({ force: true, reason: "back_to_offers" }); }
    });

    const closeBtn = el("closeMissions");
    if (closeBtn && !closeBtn.__AH_MISSIONS_BOUND) {
      closeBtn.__AH_MISSIONS_BOUND = 1;
      closeBtn.addEventListener("click", (e) => { e.preventDefault(); close(); });
    }

    const refreshBtn = el("missionsRefresh");
    if (refreshBtn && !refreshBtn.__AH_MISSIONS_BOUND) {
      refreshBtn.__AH_MISSIONS_BOUND = 1;
      refreshBtn.addEventListener("click", (e) => { e.preventDefault(); doRefresh(); });
    }

    const resolveBtn = el("missionsResolve");
    if (resolveBtn && !resolveBtn.__AH_MISSIONS_BOUND) {
      resolveBtn.__AH_MISSIONS_BOUND = 1;
      resolveBtn.addEventListener("click", (e) => { e.preventDefault(); doResolve(); });
    }
  }

  function ensureModal() {
    ensureStyles();

    _modal = el("missionsBack") || el("missionsModal");
    _root  = el("missionsRoot");

    if (_modal && _root) {
      bindOnceModalClicks();
      return;
    }

    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div id="missionsModal" style="position:fixed; inset:0; display:none; align-items:center; justify-content:center; padding:12px; background:rgba(0,0,0,.72); z-index:999999;">
        <div style="width:min(560px, 100%); max-height:calc(100vh - 24px); overflow:hidden; background:rgba(14,16,18,.92); border:1px solid rgba(255,255,255,.10); border-radius:16px; box-shadow:0 18px 60px rgba(0,0,0,.65); display:flex; flex-direction:column; min-height:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 12px 0 12px;">
            <div style="font-weight:900;color:#fff;">Missions</div>
            <button type="button" class="btn" data-act="close">×</button>
          </div>
          <div id="missionsRoot" style="padding:12px; overflow:auto; min-height:0;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap.firstElementChild);

    _modal = el("missionsModal");
    _root  = el("missionsRoot");
    bindOnceModalClicks();
  }

  function open() {
    ensureModal();
    if (!_modal) return false;
    if (_modal.style.display !== "none" && _modal.classList.contains("is-open")) {
      return true;
    }
    
    // ANALYTICS: gracz otworzył ekran misji
    track("missions_opened");

    _modal.style.display = "flex";
    _modal.classList.add("is-open");
    document.body.classList.add("missions-open");

    try {
      window.navRegister?.(_modal.id, {
        close,
        isOpen: () => !!_modal && _modal.style.display !== "none",
      });
    } catch (_) {}
    try { window.navOpen?.(_modal.id); } catch (_) {}

    renderLoading("Loading missions…");
    loadState({ reason: "open" });
    return true;
  }

  function close() {
    if (!_modal) return;

    _modal.classList.remove("is-open");
    _modal.style.display = "none";
    document.body.classList.remove("missions-open");

    stopTick();
    try { window.navClose?.(_modal.id); } catch (_) {}
  }

  // =========================
  // Server clock + helpers
  // =========================
  let _serverOffsetSec = 0;

  function _syncServerClock(payload) {
    const nowTs = Number(payload?.now_ts || payload?.nowTs || 0);
    if (!nowTs) return;
    const clientNow = Date.now() / 1000;
    _serverOffsetSec = nowTs - clientNow;
  }

  function _nowSec() { return (Date.now() / 1000) + _serverOffsetSec; }

  function _fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function _fmtClock(ts) {
    try {
      const d = new Date(Number(ts) * 1000);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch (_) { return ""; }
  }

  // =========================
  // Rare Drop extraction (robust)
  // =========================
  function _normRarity(r) {
    r = String(r || "").toLowerCase().trim();
    if (!r) return "";
    if (r === "leg" || r === "legend") return "legendary";
    if (r === "epi") return "epic";
    return r;
  }

  function _chanceToPct(v) {
    if (v == null) return null;

    if (typeof v === "string") {
      const s = v.trim();

      const frac = s.match(/(\d+)\s*\/\s*(\d+)/);
      if (frac) {
        const a = Number(frac[1]), b = Number(frac[2]);
        if (Number.isFinite(a) && Number.isFinite(b) && b > 0) return (a * 100) / b;
      }

      const m = s.match(/([\d.]+)/);
      if (!m) return null;
      const n = Number(m[1]);
      if (!Number.isFinite(n)) return null;

      if (s.includes("%")) return n;
      if (n <= 1) return n * 100;
      return n;
    }

    if (typeof v === "number") {
      if (!Number.isFinite(v)) return null;
      if (v <= 1) return v * 100;
      return v;
    }

    return null;
  }

  function _fmtPct(pct) {
    if (pct == null || !Number.isFinite(pct)) return "";
    if (pct < 1) return `${pct.toFixed(2)}%`;
    if (pct < 10) return `${pct.toFixed(1)}%`;
    return `${Math.round(pct)}%`;
  }

  function _guessIconFromKey(key, slot) {
    key = String(key || "");
    slot = String(slot || "");
    if (!key) return "";

    if (key.startsWith("http://") || key.startsWith("https://") || key.startsWith("/")) return key;

    const ext = key.includes(".") ? "" : ".png";
    const base = key.replace(/^equip\//, "").replace(/^items\//, "");

    const isEquip =
      !!slot ||
      /weapon|armor|cloak|collar|helmet|ring|offhand|badge|pet|rune|gloves|fangs/i.test(base);

    const folder = isEquip ? "equip" : "items";
    return `/assets/${folder}/${base}${ext}`;
  }

  function _extractRareDrop(fromObj) {
  if (!fromObj || typeof fromObj !== "object") return null;

  // 1) Prefer nested object (ONLY if explicitly provided)
  const nested =
    fromObj.possibleRareDrop || fromObj.possible_rare_drop ||
    fromObj.rareDropPreview  || fromObj.rare_drop_preview ||
    fromObj.rareDrop         || fromObj.rare_drop ||
    fromObj.rareItem         || fromObj.rare_item ||
    fromObj.possibleDrop     || fromObj.possible_drop ||
    null;

  if (nested && typeof nested === "object") {
    return _normalizeRareDropObj(nested);
  }

  // 2) Allow FLAT fields, but ONLY if they look like real drop metadata
  const flatKey =
    fromObj.rare_item_key || fromObj.rareItemKey ||
    fromObj.rare_drop_key || fromObj.rareDropKey ||
    fromObj.rare_key      || fromObj.rareKey ||
    "";

  const flatIcon =
    fromObj.rare_icon_url || fromObj.rareIconUrl ||
    fromObj.rare_icon     || fromObj.rareIcon ||
    fromObj.rare_img      || fromObj.rareImg ||
    "";

  const flatChance =
    fromObj.rare_chance || fromObj.rareChance ||
    fromObj.rare_drop_chance || fromObj.rareDropChance ||
    fromObj.rare_pct || fromObj.rarePct ||
    fromObj.rare_percent || fromObj.rarePercent ||
    null;

  const flatRarity =
    fromObj.rare_rarity || fromObj.rareRarity ||
    fromObj.rare_quality || fromObj.rareQuality ||
    "";

  // ✅ IMPORTANT: if no key/icon/chance/rarity => DO NOT RENDER
  const hasAnySignal = !!(flatKey || flatIcon || flatChance != null || flatRarity);
  if (!hasAnySignal) return null;

  return _normalizeRareDropObj({
    item_key: flatKey,
    icon: flatIcon,
    chance: flatChance,
    rarity: flatRarity,
    name: fromObj.rare_name || fromObj.rareName || "",
    slot: fromObj.rare_slot || fromObj.rareSlot || "",
    note: fromObj.rare_note || fromObj.rareNote || "",
  });
}

// helper: requires real identity (key or icon). No more "title as item"
function _normalizeRareDropObj(obj) {
  if (!obj || typeof obj !== "object") return null;

  const key = String(obj.item_key || obj.itemKey || obj.key || obj.id || "");
  const iconRaw = String(obj.iconUrl || obj.icon_url || obj.icon || obj.img || obj.image || obj.url || "");

  // ✅ HARD GUARD: if neither key nor icon → not a real drop preview
  if (!key && !iconRaw) return null;

  const name = String(obj.name || obj.title || obj.label || obj.item_name || obj.itemName || key || "Rare Drop");
  const rarity = _normRarity(obj.rarity || obj.quality || obj.tier || obj.r || "");
  const chancePct = _chanceToPct(obj.chance ?? obj.chancePct ?? obj.pct ?? obj.percent ?? obj.odds ?? obj.prob ?? obj.probability);
  const slot = String(obj.slot || obj.item_slot || obj.itemSlot || "");
  const note = String(obj.note || obj.hint || obj.desc || obj.description || "");

  const icon = iconRaw || _guessIconFromKey(key, slot);

  return {
    name,
    rarity,
    chancePct,
    key,
    slot,
    note,
    iconUrl: assetUrl(icon),
    _raw: obj
  };
}

  function renderRareDropCard(rare) {
    if (!rare) return "";
    const rarity = _normRarity(rare.rarity);
    const chance = rare.chancePct != null ? _fmtPct(rare.chancePct) : "";
    const subParts = [];
    if (rarity) subParts.push(rarity.toUpperCase());
    if (rare.slot) subParts.push(String(rare.slot).toUpperCase());
    if (rare.note) subParts.push(rare.note);

    const sub = subParts.filter(Boolean).join(" · ");
    const img = rare.iconUrl ? `
      <img src="${esc(rare.iconUrl)}" alt="${esc(rare.name)}" loading="lazy" decoding="async"
        onerror="this.remove(); this.parentNode && this.parentNode.insertAdjacentHTML('beforeend','<div class=&quot;m-rare-fallback&quot;>★</div>');" />
    ` : `<div class="m-rare-fallback">★</div>`;

    return `
      <div class="m-rare" data-rarity="${esc(rarity || "")}">
        <div class="m-rare-top">
          <div class="m-rare-tag">Possible rare drop</div>
          <div class="m-rare-chance">${chance ? `Chance <b>${esc(chance)}</b>` : `<span style="opacity:.8">Rare</span>`}</div>
        </div>
        <div class="m-rare-row">
          <div class="m-rare-ico">${img}</div>
          <div class="m-rare-meta">
            <div class="m-rare-name">${esc(rare.name || "Rare Drop")}</div>
            <div class="m-rare-sub">${esc(sub || "Keep an eye on the loot…")}</div>
          </div>
        </div>
      </div>
    `;
  }

  // =========================
  // Active parsing (improved)
  // =========================
  let _legacyAnchor = null;

  function _missionTimeInfo(m) {
    const started = Number(m?.started_ts || m?.start_ts || m?.start_time || m?.startTime || 0);
    const dur = Number(m?.duration_sec || m?.duration || m?.durationSec || 0);
    const ends =
      Number(m?.ends_ts || m?.ready_at_ts || m?.ready_at || m?.endsTs || 0) ||
      (started && dur ? (started + dur) : 0);

    const now = _nowSec();
    let remaining = 0;

    if (ends) remaining = ends - now;
    else {
      const rawLeft = (m?.leftSec ?? m?.left_sec);
      remaining = (typeof rawLeft === "number") ? rawLeft : Number(rawLeft || 0);
    }

    remaining = Number.isFinite(remaining) ? remaining : 0;

    const st = String(m?.state || m?.status || "").toLowerCase();
    const isRunning = (remaining > 1) || (st === "in_progress" || st === "running" || st === "active");
    const isReady = (remaining <= 1) && (st === "completed" || st === "ready" || st === "done" || st === "");

    return {
      started,
      dur,
      ends,
      remaining,
      isRunning,
      isReady,
      sortTs: ends || started || 0
    };
  }

  function _pickActiveFromList(list) {
    if (!Array.isArray(list) || !list.length) return null;

    let best = null;
    let bestScore = -1;
    let bestTs = -1;

    for (const m of list) {
      if (!m || typeof m !== "object") continue;
      const t = _missionTimeInfo(m);

      // score: RUNNING (30) > READY (10) > ignore (0)
      const score = t.isRunning ? 30 : (t.isReady ? 10 : 0);
      if (score <= 0) continue;

      if (score > bestScore || (score === bestScore && t.sortTs > bestTs)) {
        best = m;
        bestScore = score;
        bestTs = t.sortTs;
      }
    }
    return best || null;
  }

  function _primaryActive(payload) {
    return (
      payload?.active_mission ||
      payload?.activeMission ||
      payload?.active ||
      payload?.current_mission ||
      payload?.currentMission ||
      payload?.mission ||
      payload?.current ||
      null
    );
  }

  function getActive(payload) {
    const list =
      payload?.user_missions || payload?.userMissions || payload?.missions || null;

    const primary = _primaryActive(payload);
    const listPick = _pickActiveFromList(list);

    // if primary exists but looks READY while list has RUNNING → trust list
    let am = primary && typeof primary === "object" ? primary : null;
    if (!am && listPick) am = listPick;

    if (am && listPick && am !== listPick) {
      const pInfo = _missionTimeInfo(am);
      const lInfo = _missionTimeInfo(listPick);
      if (pInfo.isReady && lInfo.isRunning) am = listPick;
    }

    if (!am || typeof am !== "object") return { status: "NONE" };

    const title = am.title || am.name || am.label || "Mission";
    const subtitle = String(am.subtitle || "");
    const lore = String(am.lore || am.desc || "");
    const modifierLabel = String(am.modifierLabel || "");
    const rareHint = String(am.rareHint || "");
    const rewardIntent = Array.isArray(am.rewardIntent) ? am.rewardIntent : [];

    const started = Number(am.started_ts || am.start_ts || am.start_time || am.startTime || 0);
    const dur = Number(am.duration_sec || am.duration || am.durationSec || 0);
    const ends =
      Number(am.ends_ts || am.ready_at_ts || am.ready_at || am.endsTs || 0) ||
      (started && dur ? (started + dur) : 0);

    const stRaw = String(am.status || am.state || "").toUpperCase();

    if (ends) {
      const now = _nowSec();
      const total = dur || Math.max(1, ends - (started || ends));
      const remaining = Math.max(0, Math.ceil(ends - now));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return {
        status: remaining > 0 ? "RUNNING" : "READY",
        title,
        subtitle,
        lore,
        modifierLabel,
        rareHint,
        rewardIntent,
        started_ts: started,
        duration_sec: dur || total,
        ends_ts: ends,
        remaining,
        total,
        pct,
        readyAt: am.readyAt || am.ready_at_label || _fmtClock(ends),
        __raw: am
      };
    }

    const rawLeft = (am.leftSec ?? am.left_sec);
    const left = (typeof rawLeft === "number") ? rawLeft : Number(rawLeft || 0);

    let status = stRaw;
    if (!status) status = (left > 0 ? "RUNNING" : "READY");
    if (status === "ACTIVE") status = "RUNNING";
    if (status === "COMPLETED") status = "READY";

    if (status === "RUNNING") {
      const now = _nowSec();
      if (!_legacyAnchor || _legacyAnchor.left !== left || _legacyAnchor.title !== title) {
        _legacyAnchor = { left, at: now, title };
      }
      const elapsed = Math.max(0, now - _legacyAnchor.at);
      const remaining = Math.max(0, Math.ceil(_legacyAnchor.left - elapsed));
      const total = Math.max(1, Number(am.duration_sec || am.duration || _legacyAnchor.left || 1));
      const pct = Math.min(1, Math.max(0, 1 - (remaining / total)));
      return { status: remaining > 0 ? "RUNNING" : "READY", title, subtitle, lore, modifierLabel, rareHint, rewardIntent, remaining, total, pct, readyAt: am.readyAt || "", __raw: am };
    }

    if (status === "READY") {
      return { status: "READY", title, subtitle, lore, modifierLabel, rareHint, rewardIntent, remaining: 0, total: Math.max(1, dur || 1), pct: 1, readyAt: am.readyAt || "", __raw: am };
    }

    return { status: "NONE" };
  }

  function _activeFromPending() {
    if (!_pendingStart) return { status: "NONE" };
    const now = _nowSec();
    const started = Number(_pendingStart.startedClientSec || now);
    const dur = Math.max(1, Number(_pendingStart.durationSec || 60));
    const ends = started + dur;
    const remaining = Math.max(0, Math.ceil(ends - now));
    const pct = Math.min(1, Math.max(0, 1 - (remaining / dur)));
    return {
      status: remaining > 0 ? "RUNNING" : "READY",
      title: _pendingStart.title || "Mission",
      subtitle: _pendingStart.subtitle || "",
      lore: _pendingStart.lore || "",
      modifierLabel: _pendingStart.modifierLabel || "",
      rareHint: _pendingStart.rareHint || "",
      rewardIntent: Array.isArray(_pendingStart.rewardIntent) ? _pendingStart.rewardIntent : [],
      started_ts: started,
      duration_sec: dur,
      ends_ts: ends,
      remaining,
      total: dur,
      pct,
      readyAt: _fmtClock(ends),
      __pending: true,
      __raw: null
    };
  }

  function _pendingValid() {
    return !!(_pendingStart && Date.now() < Number(_pendingStart.untilMs || 0));
  }

  // =========================
  // Tick
  // =========================
  function startTick() {
    stopTick();
    _tick = setInterval(() => {
      const payload = normalizePayload(_state);
      const real = payload ? getActive(payload) : { status: "NONE" };
      const a = (real.status === "NONE" && _pendingValid()) ? _activeFromPending() : real;
      if (a.status === "NONE") return;
      paintWaiting(a);
    }, 1000);
  }

  function stopTick() {
    if (_tick) clearInterval(_tick);
    _tick = null;
  }

  // =========================
  // API + normalize (keeps extras)
  // =========================
  async function api(path, body) {
    if (!_apiPost) throw new Error("Missions: apiPost missing");
    const res = await _apiPost(path, body);

    if (res && typeof res === "object" && res.ok === false) {
      const msg = res.message || res.reason || res.error || "NOT_OK";
      const err = new Error(String(msg));
      err.data = res;
      throw err;
    }
    return res;
  }

  function _mergeExtras(base, src, skipSet) {
    if (!src || typeof src !== "object") return base;
    for (const k of Object.keys(src)) {
      if (skipSet && skipSet.has(k)) continue;
      if (base[k] === undefined) base[k] = src[k];
    }
    return base;
  }

  function normalizePayload(res) {
    if (!res || typeof res !== "object") return null;

    if (res.state && typeof res.state === "object") {
      const base = { ...res.state };
      _mergeExtras(base, res, new Set(["state", "ok"]));
      return base;
    }

    if (res.data && typeof res.data === "object") {
      const d = res.data;
      if (d.state && typeof d.state === "object") {
        const base = { ...d.state };
        _mergeExtras(base, d, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["data", "ok"]));
        return base;
      }
      const base = { ...d };
      _mergeExtras(base, res, new Set(["data", "ok"]));
      return base;
    }

    if (res.payload && typeof res.payload === "object") {
      const p = res.payload;
      if (p.state && typeof p.state === "object") {
        const base = { ...p.state };
        _mergeExtras(base, p, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["payload", "ok"]));
        return base;
      }
      const base = { ...p };
      _mergeExtras(base, res, new Set(["payload", "ok"]));
      return base;
    }

    if (res.result && typeof res.result === "object") {
      const r = res.result;
      if (r.state && typeof r.state === "object") {
        const base = { ...r.state };
        _mergeExtras(base, r, new Set(["state", "ok"]));
        _mergeExtras(base, res, new Set(["result", "ok"]));
        return base;
      }
      const base = { ...r };
      _mergeExtras(base, res, new Set(["result", "ok"]));
      return base;
    }

    return res;
  }

  function renderTags(parts = []) {
    const tags = parts
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    if (!tags.length) return "";
    return `<div class="m-tag-row">${tags.map((tag) => `<span class="m-tag">${esc(tag)}</span>`).join("")}</div>`;
  }

  function blueSignalHuntProgress(payload) {
    const raw = payload?.blueSignalHunt || payload?.blue_signal_hunt || payload?.lastResolve?.blueSignalHunt || null;
    return raw && typeof raw === "object" ? raw : null;
  }

  // Blue Signal event is archived; keep helper/data compatibility but do not render in Missions.
  function renderBlueSignalHuntCard(progress) {
    if (!progress || typeof progress !== "object") return "";
    const eventEnabled = !!progress.eventEnabled;
    const eventArchived = !!progress.eventArchived || !eventEnabled;
    const fragments = Number(progress.fragments || 0);
    const frameRequirement = Number(progress.frameRequirement || 10);
    const fragmentCap = Number(progress.fragmentCap || 20);
    const frameClaimed = !!progress.frameClaimed;
    const canClaimFrame = !!progress.canClaimFrame && !eventArchived;
    const body = textOrEmpty(progress.body) || "Event ended. Blue Signal Hunt is now archived. Existing progress, claims, and history remain recorded.";
    const archiveCopy = textOrEmpty(progress.archiveCopy) || "Event ended. Blue Signal Hunt archived. No new Blue Signals can be earned.";
    const safetyLine = textOrEmpty(progress.safetyLine) || "Cosmetic only. No combat power.";
    const title = textOrEmpty(progress.eventName) || "Blue Signal Hunt";
    const shouldShow = eventEnabled || eventArchived || fragments > 0 || frameClaimed;
    if (!shouldShow) return "";

    let cta = "";
    if (frameClaimed) {
      cta = `<button type="button" class="btn primary" data-act="open_frames">Open Frames</button>`;
    } else if (canClaimFrame) {
      cta = `<button type="button" class="btn primary" data-act="claim_blue_signal_frame">Claim Frame</button>`;
    } else if (eventArchived) {
      cta = `<button type="button" class="btn" disabled>Event ended</button>`;
    } else if (eventEnabled) {
      cta = `<button type="button" class="btn" disabled>Need ${frameRequirement} Fragments</button>`;
    } else {
      cta = `<button type="button" class="btn" disabled>Event ended</button>`;
    }

    const progressText = `${fragments} / ${frameRequirement} fragments`;
    const subline = frameClaimed
      ? "Blue Signal Frame unlocked."
      : eventArchived
        ? archiveCopy
        : `Cap: ${fragmentCap} max fragments`;
    const fragmentClarity = renderClarityHint({
      iconKey: "blue_signal_fragment",
      eyebrow: eventArchived ? "Archived reward" : "Event progress",
      title: eventArchived ? "Blue Signal Hunt archived" : "Blue Signal Fragment",
      body: eventArchived
        ? "Event ended. No new Blue Signals can be earned. Existing progress and ownership remain recorded."
        : `${progressText}. Real event reward and progress item.`,
      tone: "fragment"
    });

    return `
      <div class="m-card" style="margin-top:10px;">
        <div class="m-row" style="align-items:flex-start; gap:12px;">
          <div style="min-width:0; flex:1;">
            <div class="m-title">${esc(title)}</div>
            <div class="m-muted" style="margin-top:6px;">${esc(body)}</div>
            ${fragmentClarity}
            <div class="m-tag-row" style="margin-top:10px;">
              ${renderTagWithIcon(progressText, "blue_signal_fragment")}
              <span class="m-tag">${frameClaimed ? "Frame claimed" : "Frame reward: Blue Signal Frame"}</span>
              ${eventArchived ? `<span class="m-tag">Event ended</span>` : ""}
            </div>
            <div class="m-muted" style="margin-top:8px;">${esc(subline)}</div>
            <div class="m-muted" style="margin-top:4px;">${esc(safetyLine)}</div>
          </div>
          <div style="display:flex; align-items:center; justify-content:flex-end;">
            ${cta}
          </div>
        </div>
      </div>
    `;
  }

  function renderHelpPanel() {
    if (!_missionsHelpOpen) return "";
    return `
      <div class="m-help">
        <div class="m-help-title">How Missions Work</div>
        <div class="m-help-copy">Pick a route. Each mission has a difficulty, reward focus and sometimes a special condition.</div>
        <div class="m-help-copy">Recommended stats: Stats like AGI / DEF show what helps on that route. They are not required, but they can improve the result.</div>
        <div class="m-help-copy">Mission completed = mission finished and rewards were resolved.</div>
        <div class="m-help-copy">Pet fit = how well your active pet matched recommended mission traits.</div>
        <div class="m-help-copy">Bonus found = extra result actually recovered during resolve.</div>
        <div class="m-help-copy">Outcomes: Critical Success = best result. Success = normal clear. Partial Success = you recovered something, but missed part of the reward. Failed = the route held. Return stronger.</div>
      </div>
    `;
  }


  function resolveNextMilestoneLabel(progression) {
    const milestones = progression?.signalMilestones;
    if (!milestones || typeof milestones !== "object") return "";
    const next = milestones.nextClaimable && typeof milestones.nextClaimable === "object"
      ? milestones.nextClaimable
      : (Array.isArray(milestones.milestones) ? milestones.milestones : []).find((m) => m && (m.status === "claimable" || m.status === "locked"));
    if (!next) return "";
    const label = toText(next.shortLabel || next.name, "");
    const missing = Math.max(0, n(next.missingPower, 0));
    if (!label) return "";
    return missing > 0 ? `Next milestone: ${label} — ${missing} missing` : `Next milestone: ${label}`;
  }

  function buildElitePreviewCards(progression) {
    if (!progression || typeof progression !== "object") return [];

    const sp = Math.max(0, n(progression.signalPower, 0));
    const bossPreview = progression.bossWallPreview;
    const wall = progression.moonlabWall || { available: false };
    const recommended = toText(progression.recommendedAction, "Complete standard routes and strengthen your profile.");
    const nextUnlock = toText(progression.nextUnlockLabel, "Next Signal threshold");
    const missingPower = Math.max(0, n(progression.missingPower, 0));
    const milestoneHint = resolveNextMilestoneLabel(progression);
    const cards = [];

    if (bossPreview && bossPreview.available) {
      const boss = bossPreview.currentBoss || {};
      const bossName = toText(boss.name, "Unknown Boss");
      const floorNum = Math.max(1, n(bossPreview.currentFloor, 1));
      const bossStatus = formatBossPrepStatusFromPreview(bossPreview);
      const bossLocked = bossStatus === "Locked" || bossStatus === "Cooling Down";
      const requiredPower = Math.max(0, n(boss.requiredSignalPower, 0));
      const bossMissing = Math.max(0, n(boss.missingPower, 0));
      const rewardPreview = toText(
        boss.rewardPreview,
        "MoonLab floor clear rewards remain handled by MoonLab."
      );
      const bestMove = boss.status === "ready_preview"
        ? toText(boss.readyCopy, "Your signal can challenge this chamber. Enter MoonLab from the Map/Hub.")
        : toText(boss.recommendedAction, resolveBossPrepBestMove(wall, sp, recommended));
      cards.push({
        title: `Boss Prep Preview: ${bossName} Pattern`,
        requires: `Requires: ${requiredPower} Signal Power`,
        purpose: "Study the current MoonLab wall before entering deeper.",
        link: bossMissing > 0
          ? `Missing: +${bossMissing} Signal Power`
          : `MoonLab Floor ${floorNum} · ${bossName}`,
        status: bossStatus,
        bestMove,
        rewardPreview,
        ctaLabel: elitePreviewCtaLabel(bossStatus, bossLocked),
        locked: bossLocked,
      });
    } else if (wall.available) {
      const bossName = toText(wall.bossName, "Unknown Boss");
      const floorNum = Math.max(1, n(wall.currentFloor, 1));
      const bossStatus = formatBossPrepStatus(wall, sp);
      const bossLocked = bossStatus === "Locked";
      cards.push({
        title: `Boss Prep: ${bossName} Pattern`,
        requires: "MoonLab Boss Wall active",
        purpose: "Study the current wall before entering MoonLab.",
        link: `MoonLab Floor ${floorNum} · ${bossName}`,
        status: bossStatus,
        bestMove: resolveBossPrepBestMove(wall, sp, recommended),
        ctaLabel: elitePreviewCtaLabel(bossStatus, bossLocked),
        locked: bossLocked,
      });
    } else {
      cards.push({
        title: "Boss Prep: MoonLab Wall Pattern",
        requires: "MoonLab wall syncing",
        purpose: "Study the current wall before entering MoonLab.",
        link: "MoonLab wall syncing…",
        status: "Syncing",
        bestMove: "Complete standard routes while MoonLab data loads.",
        ctaLabel: "Preview",
        locked: false,
      });
    }

    const eliteHints = progression.elitePreviewHints || {};
    const eliteThreshold = resolveEliteUnlockThreshold(progression);
    const eliteUnlockLabel = toText(eliteHints.eliteUnlockLabel, "Elite Missions Tier I Preview");
    const eliteLocked = sp < eliteThreshold;
    cards.push({
      title: "Elite Hunt: Red Static Trail",
      requires: `Eligibility · Progress toward ${eliteThreshold} Signal Power · ${eliteUnlockLabel}`,
      purpose: "Prepare for the Red Static Warden.",
      link: milestoneHint || `Next Signal Unlock — ${nextUnlock}`,
      status: eliteLocked ? "Locked" : "Ready",
      bestMove: "Build Signal Power through routes, badges, pets, and MoonLab progress.",
      ctaLabel: elitePreviewCtaLabel(eliteLocked ? "Locked" : "Ready", eliteLocked),
      locked: eliteLocked,
    });

    const recoveryRequires = missingPower > 0
      ? `Build ${missingPower} more Signal Power`
      : "Build more Signal Power";
    cards.push({
      title: "Signal Recovery: Broken Relay Cache",
      requires: recoveryRequires,
      purpose: "Strengthen your signal before the next wall.",
      link: `Signal Power ${sp} · growth path`,
      status: "Recommended",
      bestMove: recommended,
      ctaLabel: "Preview",
      locked: false,
    });

    const chainLocked = sp < Math.max(0, n(progression.nextThreshold, 0));
    const chainRequires = missingPower > 0
      ? `${Math.max(0, n(progression.nextThreshold, 0))} Signal Power`
      : "Higher Signal Power";
    cards.push({
      title: "Chain Noise Interference: Jammed Signal",
      requires: chainRequires,
      purpose: "Clear the noise around your next progression target.",
      link: `Future Signal threshold — ${nextUnlock}`,
      status: chainLocked ? "Locked" : "Preview",
      bestMove: "Keep building Signal Power.",
      ctaLabel: elitePreviewCtaLabel(chainLocked ? "Locked" : "Preview", chainLocked),
      locked: chainLocked,
    });

    return cards.slice(0, 4);
  }

  function eliteStatusClass(status) {
    const key = toText(status, "").toLowerCase();
    if (key === "ready") return "is-ready";
    if (key === "locked" || key === "cooling down") return "is-locked";
    if (key === "recommended") return "is-recommended";
    return "";
  }

  function renderElitePreviewCard(card) {
    if (!card || typeof card !== "object") return "";
    const title = toText(card.title, "Elite Preview");
    const requires = toText(card.requires, "");
    const purpose = toText(card.purpose, "");
    const link = toText(card.link, "");
    const status = toText(card.status, "Preview");
    const bestMove = toText(card.bestMove, "");
    const ctaLabel = toText(card.ctaLabel, "Preview");
    const locked = !!card.locked;

    return `
      <div class="m-elite-card${locked ? " is-locked" : ""}">
        <div class="m-elite-card-top">
          <div class="m-elite-card-title">${esc(title)}</div>
          <div class="m-elite-status ${eliteStatusClass(status)}">${esc(status)}</div>
        </div>
        ${requires ? `<div class="m-elite-line"><b>Requires:</b> ${esc(requires)}</div>` : ""}
        ${purpose ? `<div class="m-elite-line"><b>Purpose:</b> ${esc(purpose)}</div>` : ""}
        ${card.rewardPreview ? `<div class="m-elite-line"><b>Reward Preview:</b> ${esc(card.rewardPreview)}</div>` : ""}
        ${link ? `<div class="m-elite-line"><b>Progression Link:</b> ${esc(link)}</div>` : ""}
        ${bestMove ? `<div class="m-elite-line"><b>Best Move:</b> ${esc(bestMove)}</div>` : ""}
        <div class="m-elite-cta">
          <button type="button" class="btn" disabled aria-disabled="true">${esc(ctaLabel)}</button>
        </div>
      </div>
    `;
  }

  function renderEliteMissionsPreview() {
    const ready = _progressionStatus === "ready" && !!_progressionV1;
    const cards = ready ? buildElitePreviewCards(_progressionV1) : [];
    const signalHint = ready ? `Signal Power ${Math.max(0, n(_progressionV1.signalPower, 0))}` : "";

    return `
      <div class="m-card m-elite-wrap">
        <div class="m-elite-kicker">ELITE MISSIONS</div>
        <div class="m-muted" style="margin-top:6px;">High-risk operations tied to your Signal Power, MoonLab wall, and long-term path.</div>
        <div class="m-elite-safety">${esc(toText(_progressionV1?.elitePreviewHints?.safetyCopy, "Preview only — standard routes below still handle rewards."))}</div>
        ${signalHint ? `<div class="m-muted" style="margin-top:6px;">${esc(signalHint)}</div>` : ""}
        ${
          ready && cards.length
            ? `<div class="m-elite-cards">${cards.map((card) => renderElitePreviewCard(card)).join("")}</div>`
            : `<div class="m-elite-sync">Syncing progression link… Standard routes below are still live.</div>`
        }
      </div>
    `;
  }

  async function loadProgressionV1(options = {}) {
    const { force = false } = options || {};
    if (!force && _progressionV1 && _progressionLoadedAt && (Date.now() - _progressionLoadedAt) < MISSIONS_STATE_STALE_MS) {
      return _progressionV1;
    }

    if (!_apiPost) {
      _progressionV1 = null;
      _progressionStatus = "syncing";
      return null;
    }

    try {
      const res = await api("/webapp/stats/state", { run_id: rid("m:stats") });
      const stats = getStatsPayload(res);
      const progression = normalizeProgressionV1(stats?.progression_v1);
      if (progression) {
        _progressionV1 = progression;
        _progressionStatus = "ready";
        _progressionLoadedAt = Date.now();
        return progression;
      }
      _progressionV1 = null;
      _progressionStatus = "syncing";
      return null;
    } catch (e) {
      log("progression_v1 load failed", e?.message || e);
      _progressionV1 = null;
      _progressionStatus = "syncing";
      return null;
    }
  }

  // =========================
  // Rendering
  // =========================
  function renderLoading(msg) {
    if (!_root) return;
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-muted">${esc(msg)}</div>
        </div>
      </div>
    `;
  }

  function renderError(title, detail) {
    if (!_root) return;
    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
    const safeTitle = "Can't reach missions right now.";
    const safeDetail = _dbg ? textOrEmpty(detail) : "";
    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-card">
          <div class="m-title">${esc(safeTitle)}</div>
          ${safeDetail ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(safeDetail)}</div>` : ""}
          <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn m-compact-btn" data-act="refresh">Retry</button>
            <button type="button" class="btn" data-act="close">Close</button>
          </div>
        </div>
      </div>
    `;
    stopTick();
  }

  function renderOffer(o, active) {
    const tier  = String(o?.tier || "");
    const label = String(o?.label || tier || "Tier");
    const subtitle = String(o?.subtitle || o?.archetype || "");
    const title = String(o?.title || o?.name || "");
    const lore = String(o?.lore || "");
    const desc  = String(o?.desc || "");
    const modifierLabel = normalizeModifierLabel(o?.modifierLabel);
    const rewardIntent = Array.isArray(o?.rewardIntent) ? o.rewardIntent.map((x) => String(x || "").trim()).filter(Boolean) : [];
    const rareHint = textOrEmpty(o?.rareHint);
    const body = lore || desc;

    const durSec = Number(o?.durationSec || o?.duration_sec || 0);
    const dur =
      o?.durationLabel ||
      (durSec ? `${Math.max(1, Math.round(durSec / 60))}m` : "") ||
      (o?.tierTime ? `${o.tierTime}` : "—");

    const reward = o?.reward || o?.rewardPreview || {};
    const xp = (reward.xp ?? o?.xp ?? "?");
    const bones = (reward.bones ?? o?.bones ?? "?");
    const rolls = (o?.lootRolls ?? o?.loot_rolls ?? reward.rolls ?? reward.loot_rolls ?? "?");
    const petMatchLabel = normalizePetMatchLabel(o);
    const compactHint = textOrEmpty(o?.compactHint) ||
      (petMatchLabel ? `Pet fit: ${petMatchLabel}` : "") ||
      (normalizeStatsText(o?.recommendedStatsText || o?.recommendedStatLabels || o?.recommendedStats)
        ? `Recommended: ${normalizeStatsText(o?.recommendedStatsText || o?.recommendedStatLabels || o?.recommendedStats)}`
        : "");

    const offerId = String(o?.offerId || o?.id || o?.offer_id || "");

    const hasActive = !!(active?.status && active.status !== "NONE");
    const disabled = hasActive ? "disabled" : "";
    const flavorTags = [];
    if (modifierLabel) flavorTags.push(modifierLabel);
    if (rewardIntent.length) flavorTags.push(`Reward intent: ${rewardIntent.join(" · ")}`);
    return `
      <div class="m-offer">
        <div class="m-offer-main">
          <div class="m-offer-copy">
            <div class="m-offer-top">
              <span class="m-tag">${esc(label)}</span>
              <span class="m-tag">${esc(dur)}</span>
            </div>
            ${title ? `<div class="m-offer-title">${esc(title)}</div>` : ""}
            ${subtitle ? `<div class="m-kicker" style="margin-top:4px;">${esc(subtitle)}</div>` : ""}
            ${body ? `<div class="m-muted m-offer-body">${esc(body)}</div>` : ""}
            ${renderTags(flavorTags)}
            ${compactHint ? `<div class="m-offer-helper">${esc(compactHint)}</div>` : ""}
            <div class="m-offer-reward">
              XP: <b>${esc(xp)}</b> · Bones: <b>${esc(bones)}</b> · Rolls: <b>${esc(rolls)}</b>
            </div>
          </div>

          <div class="m-offer-cta">
            <button type="button" class="btn primary"
              data-act="start"
              data-tier="${esc(tier)}"
              data-offer="${esc(offerId)}"
              ${disabled}
            >Start</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderLast(last) {
    const result = String(last?.result || "");
    const victory = (result === "victory" || last?.victory) ? "✅ Victory" : "❌ Defeat";
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";
    const title = String(last?.title || last?.name || "");
    const subtitle = String(last?.subtitle || "");
    const report = String(last?.report || "");
    const outcomeTier = String(last?.outcomeTier || last?.outcome_tier || ((result === "victory" || last?.victory) ? "Success" : "Failed"));
    const modifierLabel = String(last?.modifierLabel || "");
    const progressLine = String(last?.progressLine || "");
    const shortfallLine = String(last?.shortfallLine || "");
    const petLine = String(last?.activePetContribution || last?.petAssistLine || "");
    const recoveredRewards = Array.isArray(last?.recoveredRewards) ? last.recoveredRewards.map((x) => String(x || "").trim()).filter(Boolean) : [];
    const missedRewards = Array.isArray(last?.missedRewards) ? last.missedRewards.map((x) => String(x || "").trim()).filter(Boolean) : [];

    const rewardMsg = String(last?.rewardMsg || last?.reward_msg || "");
    const lootMsg = String(last?.lootMsg || last?.loot_msg || "");
    const tokenLootMsg = String(last?.tokenLootMsg || last?.token_loot_msg || "");

    return `
      <div class="m-card" style="margin-top:10px;">
        <div class="m-title">Last Resolve</div>
        ${subtitle ? `<div class="m-kicker" style="margin-top:8px;">${esc(subtitle)}</div>` : ""}
        ${title ? `<div class="m-title" style="margin-top:4px;">${esc(title)}</div>` : ""}
        <div class="m-muted" style="margin-top:8px;">
          ${esc(victory)} ${ts ? `· <b>${esc(ts)}</b>` : ""}
        </div>
        ${report ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(report)}</div>` : ""}
        ${outcomeTier ? `<div class="m-muted" style="margin-top:6px;"><b>${esc(outcomeTier)}</b>${modifierLabel ? ` · ${esc(modifierLabel)}` : ""}</div>` : ""}
        ${progressLine ? `<div class="m-muted" style="margin-top:6px;">${esc(progressLine)}</div>` : ""}
        ${shortfallLine ? `<div class="m-muted" style="margin-top:4px;">${esc(shortfallLine)}</div>` : ""}
        ${petLine ? `<div class="m-muted" style="margin-top:6px;">${esc(petLine)}</div>` : ""}
        ${recoveredRewards.length ? `<div class="m-muted" style="margin-top:8px;">Recovered: ${esc(recoveredRewards.join(" · "))}</div>` : ""}
        ${missedRewards.length ? `<div class="m-muted" style="margin-top:4px;">Missed: ${esc(missedRewards.join(" · "))}</div>` : ""}
        ${rewardMsg ? `<div class="m-muted" style="margin-top:8px; white-space:pre-wrap;">${esc(rewardMsg)}</div>` : ""}
        ${lootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(lootMsg)}</div>` : ""}
        ${tokenLootMsg ? `<div class="m-muted" style="margin-top:6px; white-space:pre-wrap;">${esc(tokenLootMsg)}</div>` : ""}
      </div>
    `;
  }

  function renderLast(last) {
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";
    const title = textOrEmpty(last?.title || last?.name) || "Mission";
    const subtitle = textOrEmpty(last?.subtitle);
    const narrative = textOrEmpty(last?.narrativeLine || last?.report);
    const outcomeTier = normalizeOutcomeTier(last);
    const outcomeTone = normalizeOutcomeTone(outcomeTier);
    const modifierLabel = normalizeModifierLabel(last?.modifierLabel);
    const progressLine = normalizeProgressLine(last);
    const shortfallLine = normalizeShortfallLine(last);
    const petMatchLabel = normalizePetMatchLabel(last);
    const recommendedLine = normalizeRecommendedLine(last);
    const petFitEffect = normalizePetFitEffect(last);
    const recoveredRewards = normalizeRewardList(last?.recoveredRewards);
    const missedRewards = normalizeRewardList(last?.missedRewards);
    const rewardMsg = textOrEmpty(last?.rewardMsg || last?.reward_msg);
    const lootMsg = textOrEmpty(last?.lootMsg || last?.loot_msg);
    const tokenLootMsg = textOrEmpty(last?.tokenLootMsg || last?.token_loot_msg);
    const bonusFoundChip = normalizeBonusFoundChip(last);
    const missionSignalNote = normalizeMissionSignalNote(last);
    const petArchetype = "";
    const rareHint = "";
    const rareHit = false;
    const metaBits = [];
    if (modifierLabel) metaBits.push(modifierLabel);
    if (ts) metaBits.push(ts);

    const chipLines = [];
    if (progressLine) chipLines.push(progressLine);
    if (shortfallLine && shortfallLine !== progressLine) chipLines.push(shortfallLine);
    if (petMatchLabel) chipLines.push(`Pet Match: ${petMatchLabel}${petArchetype ? ` · ${petArchetype} assist` : ""}`);
    if (rareHit) chipLines.push("Rare cache recovered");
    else if (rareHint) chipLines.push(`Rare: ${rareHint}`);

    const petDetailLines = [];
    if (petMatchLabel && recommendedLine) petDetailLines.push(recommendedLine);
    if (petMatchLabel && petFitEffect) petDetailLines.push(petFitEffect);

    if (outcomeTone === "success" || outcomeTone === "critical") chipLines.unshift("Mission completed");
    for (let i = 0; i < chipLines.length; i += 1) {
      if (/^Pet Match:/i.test(chipLines[i])) chipLines[i] = `Pet fit: ${petMatchLabel}`;
    }
    chipLines.length = 0;
    if (outcomeTone === "success" || outcomeTone === "critical") chipLines.push("Mission completed");
    if (progressLine) chipLines.push(progressLine);
    if (shortfallLine && shortfallLine !== progressLine) chipLines.push(shortfallLine);
    if (petMatchLabel) chipLines.push(`Pet fit: ${petMatchLabel}`);
    if (bonusFoundChip) chipLines.push(bonusFoundChip);

    const fallbackRecovered = [];
    if (!recoveredRewards.length) {
      if (rewardMsg) fallbackRecovered.push(rewardMsg);
      if (lootMsg) fallbackRecovered.push(lootMsg);
      if (tokenLootMsg) fallbackRecovered.push(tokenLootMsg);
    }

    const showRecovered = recoveredRewards.length ? recoveredRewards : fallbackRecovered;
    const { baseRewards, extraRecovered } = splitLastResolveRewards(showRecovered);
    const showMissed = missedRewards.filter((x) => {
      if (!x) return false;
      if ((bonusFoundChip || missionSignalNote || last?.cacheSignalDetected || textOrEmpty(last?.rareHint)) && /cache/i.test(x)) return false;
      return true;
    });

    return `
      <div class="m-card m-report" style="margin-top:10px;">
        <div class="m-report-head">
          <div style="min-width:0;">
            <div class="m-title">Last Resolve</div>
            <div class="m-report-title" style="margin-top:8px;">${esc(title)}</div>
            ${(subtitle || metaBits.length) ? `<div class="m-report-sub">${esc([subtitle, ...metaBits].filter(Boolean).join(" · "))}</div>` : ""}
          </div>
          ${outcomeTier ? `<div class="m-outcome-badge" data-tone="${esc(outcomeTone)}">${esc(outcomeTier)}</div>` : ""}
        </div>
        ${narrative ? `<div class="m-report-line">${esc(narrative)}</div>` : ""}
        ${chipLines.length ? `<div class="m-report-chipline">${chipLines.map((chip) => `<span class="m-report-chip">${esc(chip)}</span>`).join("")}</div>` : ""}
        ${petDetailLines.length ? petDetailLines.map((line) => `<div class="m-report-line">${esc(line)}</div>`).join("") : ""}
        ${baseRewards.length ? `<div class="m-report-section"><div class="m-report-label">Base rewards</div><div class="m-report-values">${esc(baseRewards.join(" · "))}</div></div>` : ""}
        ${extraRecovered.length ? `<div class="m-report-section"><div class="m-report-label">Recovered</div><div class="m-report-values">${esc(extraRecovered.join(" · "))}</div></div>` : ""}
        ${showMissed.length ? `<div class="m-report-section"><div class="m-report-label">Missed</div><div class="m-report-values">${esc(showMissed.join(" · "))}</div></div>` : ""}
      </div>
    `;
  }

  function renderLastClarity(last) {
    const ts = last?.ts ? new Date(Number(last.ts) * 1000).toLocaleString() : "";
    const title = textOrEmpty(last?.title || last?.name) || "Mission";
    const subtitle = textOrEmpty(last?.subtitle);
    const narrative = textOrEmpty(last?.narrativeLine || last?.report);
    const outcomeTier = normalizeOutcomeTier(last);
    const outcomeTone = normalizeOutcomeTone(outcomeTier);
    const modifierLabel = normalizeModifierLabel(last?.modifierLabel);
    const progressLine = normalizeProgressLine(last);
    const shortfallLine = normalizeShortfallLine(last);
    const petMatchLabel = normalizePetMatchLabel(last);
    const recommendedLine = normalizeRecommendedLine(last);
    const petFitEffect = normalizePetFitEffect(last);
    const recoveredRewards = normalizeRewardList(last?.recoveredRewards);
    const missedRewards = normalizeRewardList(last?.missedRewards);
    const rewardMsg = textOrEmpty(last?.rewardMsg || last?.reward_msg);
    const lootMsg = textOrEmpty(last?.lootMsg || last?.loot_msg);
    const tokenLootMsg = textOrEmpty(last?.tokenLootMsg || last?.token_loot_msg);
    const bonusFoundChip = normalizeBonusFoundChip(last);
    const missionSignalNote = normalizeMissionSignalNote(last);
    const metaBits = [];
    if (modifierLabel) metaBits.push(modifierLabel);
    if (ts) metaBits.push(ts);

    const chipLines = [];
    if (outcomeTone === "success" || outcomeTone === "critical") chipLines.push("Mission completed");
    if (progressLine) chipLines.push(progressLine);
    if (shortfallLine && shortfallLine !== progressLine) chipLines.push(shortfallLine);
    if (petMatchLabel) chipLines.push(`Pet fit: ${petMatchLabel}`);
    if (bonusFoundChip) chipLines.push(bonusFoundChip);

    const petDetailLines = [];
    if (petMatchLabel && recommendedLine) petDetailLines.push(recommendedLine);
    if (petMatchLabel && petFitEffect) petDetailLines.push(petFitEffect);

    const fallbackRecovered = [];
    if (!recoveredRewards.length) {
      if (rewardMsg) fallbackRecovered.push(rewardMsg);
      if (lootMsg) fallbackRecovered.push(lootMsg);
      if (tokenLootMsg) fallbackRecovered.push(tokenLootMsg);
    }

    const showRecovered = recoveredRewards.length ? recoveredRewards : fallbackRecovered;
    const { baseRewards, extraRecovered } = splitLastResolveRewards(showRecovered);
    const showMissed = missedRewards.filter((x) => {
      if (!x) return false;
      if ((bonusFoundChip || missionSignalNote || last?.cacheSignalDetected || textOrEmpty(last?.rareHint)) && /cache/i.test(x)) return false;
      return true;
    });

    return `
      <div class="m-card m-report" style="margin-top:10px;">
        <div class="m-report-head">
          <div style="min-width:0;">
            <div class="m-title">Last Resolve</div>
            <div class="m-report-title" style="margin-top:8px;">${esc(title)}</div>
            ${(subtitle || metaBits.length) ? `<div class="m-report-sub">${esc([subtitle, ...metaBits].filter(Boolean).join(" - "))}</div>` : ""}
          </div>
          ${outcomeTier ? `<div class="m-outcome-badge" data-tone="${esc(outcomeTone)}">${esc(outcomeTier)}</div>` : ""}
        </div>
        ${narrative ? `<div class="m-report-line">${esc(narrative)}</div>` : ""}
        ${chipLines.length ? `<div class="m-report-chipline">${chipLines.map((chip) => `<span class="m-report-chip">${esc(chip)}</span>`).join("")}</div>` : ""}
        ${petDetailLines.length ? petDetailLines.map((line) => `<div class="m-report-line">${esc(line)}</div>`).join("") : ""}
        ${baseRewards.length ? `<div class="m-report-section"><div class="m-report-label">Base rewards</div><div class="m-report-values">${esc(baseRewards.join(" - "))}</div></div>` : ""}
        ${extraRecovered.length ? `<div class="m-report-section"><div class="m-report-label">Recovered</div><div class="m-report-values">${esc(extraRecovered.join(" - "))}</div></div>` : ""}
        ${showMissed.length ? `<div class="m-report-section"><div class="m-report-label">Missed</div><div class="m-report-values">${esc(showMissed.join(" - "))}</div></div>` : ""}
      </div>
    `;
  }

  function prefersReducedMotion() {
    try {
      return !!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch (_) {
      return false;
    }
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function hashPlaybackSeed(value) {
    const text = String(value || "mission-duel");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededPlaybackUnit(seed, step = 0) {
    let x = (seed + Math.imul((step + 1), 374761393)) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 1274126177);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967295;
  }

  function collectPlaybackText(value, out = [], seen = new Set()) {
    const addLine = (line) => {
      const text = textOrEmpty(line).replace(/\s+/g, " ").trim();
      if (!text) return;
      const key = text.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(text);
    };

    if (value == null) return out;
    if (Array.isArray(value)) {
      value.forEach((item) => collectPlaybackText(item, out, seen));
      return out;
    }
    if (typeof value === "string" || typeof value === "number") {
      addLine(value);
      return out;
    }
    if (typeof value !== "object") return out;

    addLine(value.text || value.message || value.log || value.line || value.summary || value.action || value.report || value.outcome || value.result);
    if (Array.isArray(value.lines)) collectPlaybackText(value.lines, out, seen);
    if (Array.isArray(value.entries)) collectPlaybackText(value.entries, out, seen);
    if (Array.isArray(value.events)) collectPlaybackText(value.events, out, seen);
    if (Array.isArray(value.rounds)) collectPlaybackText(value.rounds, out, seen);
    return out;
  }

  function extractMissionPlaybackLines(payload, last) {
    const candidates = [
      last?.battleLog,
      last?.battle_log,
      last?.combatLog,
      last?.combat_log,
      last?.duelLog,
      last?.duel_log,
      last?.roundLog,
      last?.round_log,
      last?.rounds,
      payload?.battleLog,
      payload?.battle_log,
      payload?.combatLog,
      payload?.combat_log,
      payload?.duelLog,
      payload?.duel_log,
      payload?.rounds,
    ];
    for (const candidate of candidates) {
      const lines = collectPlaybackText(candidate);
      if (lines.length) return lines;
    }
    return [];
  }

  function buildDamageSlices(totalLoss, hitCount, seed) {
    if (hitCount <= 0) return [];
    if (hitCount === 1) return [Math.max(1, totalLoss)];
    const slices = [];
    let remaining = Math.max(hitCount, totalLoss);
    for (let i = 0; i < hitCount; i += 1) {
      const remainingHits = hitCount - i;
      if (remainingHits === 1) {
        slices.push(Math.max(1, remaining));
        break;
      }
      const base = Math.floor(remaining / remainingHits);
      const swing = Math.max(1, Math.floor(totalLoss * 0.13));
      let amount = base + Math.floor((seededPlaybackUnit(seed, i) - 0.32) * swing);
      const minAllowed = 1;
      const maxAllowed = remaining - (remainingHits - 1);
      amount = clampNumber(amount, minAllowed, Math.max(minAllowed, maxAllowed));
      slices.push(amount);
      remaining -= amount;
    }
    return slices;
  }

  function buildFallbackPlaybackLines(isVictory) {
    return isVictory
      ? [
          "Signal locked.",
          "Hostile trace engaged.",
          "Alpha cuts through the static.",
          "Enemy counterstrike blocked.",
          "Critical breach.",
          "Final threat collapsing.",
          "Signal cleared.",
        ]
      : [
          "Signal locked.",
          "Hostile trace engaged.",
          "Static pressure mounting.",
          "Alpha loses ground.",
          "Signal integrity collapsing.",
          "Pack retreating.",
          "Mission signal broken.",
        ];
  }

  function missionDuelUniqueStrings(values = []) {
    const seen = new Set();
    const out = [];
    values.forEach((value) => {
      const text = textOrEmpty(value);
      if (!text || seen.has(text)) return;
      seen.add(text);
      out.push(text);
    });
    return out;
  }

  function missionDuelImageValue(value) {
    if (!value) return "";
    if (typeof value === "string") return textOrEmpty(value);
    if (typeof value !== "object") return "";
    return textOrEmpty(
      value.url ||
      value.img ||
      value.src ||
      value.image ||
      value.icon ||
      value.avatarUrl ||
      value.avatar_url ||
      value.portraitUrl ||
      value.portrait_url ||
      value.skinUrl ||
      value.skin_url ||
      value.previewUrl ||
      value.preview_url
    );
  }

  function missionDuelProfileState() {
    return window.__PROFILE__ || window.PROFILE || window.lastProfile || window.profileState || window._profile || null;
  }

  function missionDuelUsesCorruptedRelay(payload, last, enemyBlock) {
    const haystack = missionDuelUniqueStrings([
      last?.title,
      last?.name,
      last?.subtitle,
      last?.description,
      last?.desc,
      last?.report,
      last?.enemyName,
      last?.enemy_name,
      last?.targetName,
      last?.target_name,
      last?.type,
      last?.missionType,
      last?.mission_type,
      last?.targetType,
      last?.target_type,
      enemyBlock?.name,
      enemyBlock?.title,
      enemyBlock?.type,
      enemyBlock?.description,
      enemyBlock?.desc,
      payload?.missionTitle,
      payload?.mission_title,
      payload?.missionSubtitle,
      payload?.mission_subtitle,
      payload?.description,
      payload?.desc,
      payload?.enemyName,
      payload?.enemy_name,
      payload?.targetName,
      payload?.target_name,
      payload?.missionType,
      payload?.mission_type,
      payload?.targetType,
      payload?.target_type,
    ]).join(" ").toLowerCase();
    return !!haystack && MISSION_DUEL_CORRUPTED_RELAY_KEYWORDS.some((keyword) => haystack.includes(keyword));
  }

  function missionDuelVisualVariantClass(visual) {
    return textOrEmpty(visual?.variant) === "relay" ? "is-relay-visual" : "";
  }

  function normalizeMissionDuelEnemyArtKey(value) {
    return textOrEmpty(value)
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function resolveMissionDuelNamedEnemyVisual(payload, last, enemyBlock) {
    const lookupValues = missionDuelUniqueStrings([
      enemyBlock?.id,
      enemyBlock?.key,
      enemyBlock?.slug,
      enemyBlock?.code,
      enemyBlock?.name,
      enemyBlock?.title,
      enemyBlock?.type,
      last?.enemyId,
      last?.enemy_id,
      last?.enemyKey,
      last?.enemy_key,
      last?.enemySlug,
      last?.enemy_slug,
      last?.enemyCode,
      last?.enemy_code,
      last?.enemyName,
      last?.enemy_name,
      last?.targetId,
      last?.target_id,
      last?.targetKey,
      last?.target_key,
      last?.targetSlug,
      last?.target_slug,
      last?.targetCode,
      last?.target_code,
      last?.targetName,
      last?.target_name,
      payload?.enemyId,
      payload?.enemy_id,
      payload?.enemyKey,
      payload?.enemy_key,
      payload?.enemySlug,
      payload?.enemy_slug,
      payload?.enemyCode,
      payload?.enemy_code,
      payload?.enemyName,
      payload?.enemy_name,
      payload?.targetId,
      payload?.target_id,
      payload?.targetKey,
      payload?.target_key,
      payload?.targetSlug,
      payload?.target_slug,
      payload?.targetCode,
      payload?.target_code,
      payload?.targetName,
      payload?.target_name,
    ]);
    for (const value of lookupValues) {
      const meta = MISSION_DUEL_NAMED_ENEMY_VISUALS[normalizeMissionDuelEnemyArtKey(value)];
      if (meta?.src) return meta;
    }
    return null;
  }

  function missionDuelQueryImage(selectors) {
    try {
      const node = document.querySelector(selectors);
      return textOrEmpty(node?.currentSrc || node?.src);
    } catch (_) {
      return "";
    }
  }

  function resolveMissionDuelPlayerVisual(resultData, last) {
    const payload = normalizePayload(resultData) || resultData || {};
    const profile = missionDuelProfileState();
    const skinCandidates = missionDuelUniqueStrings([
      missionDuelQueryImage("#player-skin"),
      missionDuelImageValue(last?.player?.skin),
      last?.player?.skinUrl,
      last?.player?.skin_url,
      last?.playerSkin,
      last?.player_skin,
      missionDuelImageValue(payload?.player?.skin),
      payload?.player?.skinUrl,
      payload?.player?.skin_url,
      payload?.playerSkin,
      payload?.player_skin,
      typeof profile?.skin === "string" ? profile.skin : "",
      missionDuelImageValue(profile?.skin),
      profile?.heroImg,
      profile?.heroPng,
      profile?.character,
      profile?.characterPng,
      profile?.skinKey ? `/assets/skins/${profile.skinKey}.webp` : "",
    ]);
    if (skinCandidates[0]) {
      return { src: assetUrl(skinCandidates[0]), source: "active skin / hero visual" };
    }

    const avatarCandidates = missionDuelUniqueStrings([
      missionDuelImageValue(last?.player?.avatar),
      last?.player?.avatarUrl,
      last?.player?.avatar_url,
      last?.playerAvatar,
      last?.player_avatar,
      missionDuelImageValue(payload?.player?.avatar),
      payload?.player?.avatarUrl,
      payload?.player?.avatar_url,
      payload?.playerAvatar,
      payload?.player_avatar,
      profile?.avatarPng,
      profile?.avatar,
      profile?.avatarUrl,
      profile?.avatar_url,
      profile?.profileAvatar,
      missionDuelQueryImage("#hero-frame img, #heroFrame img, img#hero-img, img#profile-avatar, #avatarMain img"),
      missionDuelQueryImage("#equippedRoot img, #equippedModal img"),
      window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url,
    ]);
    if (avatarCandidates[0]) {
      return { src: assetUrl(avatarCandidates[0]), source: "player avatar / profile visual" };
    }

    return {
      src: assetUrl("/assets/skins/lunarhowl_skin.webp"),
      source: "Alpha Husky fallback skin",
    };
  }

  function resolveMissionDuelEnemyVisual(resultData, last) {
    const payload = normalizePayload(resultData) || resultData || {};
    const enemyBlock = last?.enemy || payload?.enemy || null;
    const candidates = missionDuelUniqueStrings([
      missionDuelImageValue(enemyBlock?.visual),
      missionDuelImageValue(enemyBlock?.avatar),
      enemyBlock?.avatarUrl,
      enemyBlock?.avatar_url,
      enemyBlock?.portraitUrl,
      enemyBlock?.portrait_url,
      enemyBlock?.iconUrl,
      enemyBlock?.icon_url,
      enemyBlock?.image,
      enemyBlock?.img,
      enemyBlock?.emblemUrl,
      enemyBlock?.emblem_url,
      last?.bossImage,
      last?.boss_image,
      payload?.bossImage,
      payload?.boss_image,
      last?.enemyVisual,
      last?.enemy_visual,
      last?.enemyImage,
      last?.enemy_image,
      last?.enemyAvatar,
      last?.enemy_avatar,
      last?.enemyPortrait,
      last?.enemy_portrait,
      last?.enemyIcon,
      last?.enemy_icon,
      last?.enemyIconUrl,
      last?.enemy_icon_url,
      last?.targetImage,
      last?.target_image,
      last?.targetAvatar,
      last?.target_avatar,
      last?.targetIcon,
      last?.target_icon,
      last?.hostileImage,
      last?.hostile_image,
      payload?.enemyVisual,
      payload?.enemy_visual,
      payload?.enemyImage,
      payload?.enemy_image,
      payload?.enemyAvatar,
      payload?.enemy_avatar,
      payload?.enemyPortrait,
      payload?.enemy_portrait,
      payload?.enemyIcon,
      payload?.enemy_icon,
      payload?.enemyIconUrl,
      payload?.enemy_icon_url,
      payload?.targetImage,
      payload?.target_image,
      payload?.targetAvatar,
      payload?.target_avatar,
      payload?.targetIcon,
      payload?.target_icon,
    ]);
    if (candidates[0]) {
      return { src: missionBossAssetUrl(candidates[0]), source: "enemy art / icon" };
    }
    const mappedBossVisual = resolveMissionDuelBossAssetVisual(payload, last, enemyBlock);
    if (mappedBossVisual) {
      return mappedBossVisual;
    }
    const namedVisual = resolveMissionDuelNamedEnemyVisual(payload, last, enemyBlock);
    if (namedVisual) {
      return namedVisual;
    }
    if (missionDuelUsesCorruptedRelay(payload, last, enemyBlock)) {
      return {
        src: MISSION_DUEL_CORRUPTED_RELAY_URL,
        source: "remote Corrupted Relay fallback art",
        displayName: MISSION_DUEL_CORRUPTED_RELAY_NAME,
        variant: "relay"
      };
    }
    return { src: "", source: "generated signal sigil" };
  }

  function renderMissionDuelVisual(visual, side, alt, stamp) {
    const hasImage = !!textOrEmpty(visual?.src);
    const variantClass = missionDuelVisualVariantClass(visual);
    return `
      <div class="m-duel-visual ${hasImage ? "has-image" : ""} ${variantClass}">
        <div class="m-duel-visual-fallback" aria-hidden="true">
          <div class="m-duel-sigil">
            <div class="m-duel-sigil-lines"></div>
            <div class="m-duel-sigil-core"></div>
          </div>
        </div>
        ${
          hasImage
            ? `<img class="m-duel-portrait" src="${esc(visual.src)}" alt="${esc(alt)}" loading="eager" decoding="async" onerror="this.closest('.m-duel-visual') && this.closest('.m-duel-visual').classList.remove('has-image'); this.remove();">`
            : ""
        }
        <div class="m-duel-stamp">${esc(stamp || (side === "player" ? "Pack Signal" : "Threat Trace"))}</div>
      </div>
    `;
  }

  function buildMissionDuelModel(resultData) {
    const payload = normalizePayload(resultData) || resultData || {};
    const last = payload?.lastResolve || payload?.last_resolve || resultData?.lastResolve || resultData?.last_resolve || null;
    if (!last || typeof last !== "object") return null;

    const missionTitle = toText(last?.title || last?.name || payload?.missionTitle || payload?.mission_title, "Mission Signal");
    const subtitle = toText(last?.subtitle || payload?.missionSubtitle || payload?.mission_subtitle, "");
    const playerName = toText(
      last?.playerName || last?.player_name || payload?.playerName || payload?.player_name || payload?.alphaName || payload?.alpha_name,
      "Alpha"
    );
    const enemyName = toText(
      last?.enemyName || last?.enemy_name || last?.targetName || last?.target_name || subtitle,
      "Hostile Signal"
    );
    const outcomeTier = normalizeOutcomeTier(last);
    const outcomeTone = normalizeOutcomeTone(outcomeTier);
    const resultKey = toText(last?.result, "").toLowerCase();
    const isVictory = !!(last?.victory || resultKey === "victory" || outcomeTone === "success" || outcomeTone === "critical" || outcomeTone === "partial");
    const playerVisual = resolveMissionDuelPlayerVisual(resultData, last);
    const enemyVisual = resolveMissionDuelEnemyVisual(resultData, last);
    const enemyDisplayName = textOrEmpty(enemyVisual?.displayName) || enemyName;
    const seed = hashPlaybackSeed([
      missionTitle,
      subtitle,
      playerName,
      enemyDisplayName,
      outcomeTier,
      resultKey,
      textOrEmpty(last?.report),
      textOrEmpty(last?.rewardMsg || last?.reward_msg),
      textOrEmpty(last?.lootMsg || last?.loot_msg),
    ].join("|"));
    const exchangeCount = 5 + Math.floor(seededPlaybackUnit(seed, 1) * 3);
    const winner = isVictory ? "player" : "enemy";
    const loser = isVictory ? "enemy" : "player";
    const labels = isVictory
      ? ["SIGNAL CLEARED", "THREAT NEUTRALIZED", "MISSION CLEARED"]
      : ["SIGNAL BROKEN", "PACK RETREATING", "MISSION FAILED"];
    const resultLabel = labels[Math.floor(seededPlaybackUnit(seed, 2) * labels.length)] || labels[0];

    const attackers = [];
    let winnerTurns = 0;
    let loserTurns = 0;
    for (let i = 0; i < exchangeCount; i += 1) {
      if (i === 0 || i === exchangeCount - 1) {
        attackers.push(winner);
        winnerTurns += 1;
        continue;
      }
      const attacker = seededPlaybackUnit(seed, 10 + i) > 0.36 ? winner : loser;
      attackers.push(attacker);
      if (attacker === winner) winnerTurns += 1;
      else loserTurns += 1;
    }
    if (loserTurns === 0 && exchangeCount > 2) {
      attackers[1] = loser;
      loserTurns = 1;
      winnerTurns = Math.max(1, winnerTurns - 1);
    }

    const enemyLossTotal = isVictory ? 100 : 18 + Math.floor(seededPlaybackUnit(seed, 30) * 22);
    const playerLossTotal = isVictory ? 24 + Math.floor(seededPlaybackUnit(seed, 31) * 32) : 100;
    const enemyHitCount = attackers.filter((attacker) => attacker === "player").length;
    const playerHitCount = attackers.filter((attacker) => attacker === "enemy").length;
    const enemySlices = buildDamageSlices(enemyLossTotal, enemyHitCount, seed + 101);
    const playerSlices = buildDamageSlices(playerLossTotal, playerHitCount, seed + 303);

    const backendLines = extractMissionPlaybackLines(payload, last);
    const fallbackLines = buildFallbackPlaybackLines(isVictory);
    const logLines = backendLines.length
      ? backendLines.slice(0, exchangeCount).concat(fallbackLines).slice(0, exchangeCount)
      : fallbackLines.slice(0, exchangeCount);

    const exchanges = [];
    let playerHp = 100;
    let enemyHp = 100;
    let playerHitsUsed = 0;
    let enemyHitsUsed = 0;

    for (let i = 0; i < exchangeCount; i += 1) {
      const attacker = attackers[i];
      const isFinal = i === exchangeCount - 1;
      let damage = 0;
      let target = "enemy";
      if (attacker === "player") {
        const hpBefore = enemyHp;
        damage = enemySlices[playerHitsUsed] ?? 1;
        playerHitsUsed += 1;
        enemyHp = clampNumber(enemyHp - damage, 0, 100);
        target = "enemy";
        if (isFinal) {
          damage = Math.max(1, hpBefore);
          enemyHp = 0;
        }
      } else {
        const hpBefore = playerHp;
        damage = playerSlices[enemyHitsUsed] ?? 1;
        enemyHitsUsed += 1;
        playerHp = clampNumber(playerHp - damage, 0, 100);
        target = "player";
        if (isFinal) {
          damage = Math.max(1, hpBefore);
          playerHp = 0;
        }
      }
      exchanges.push({
        attacker,
        target,
        damage: Math.max(1, damage),
        playerHp,
        enemyHp,
        critical: isFinal || damage >= 22,
        finalStrike: isFinal,
        logLine: logLines[i] || fallbackLines[Math.min(i, fallbackLines.length - 1)],
      });
    }

    return {
      missionTitle,
      subtitle,
      playerName,
      enemyName: enemyDisplayName,
      playerVisual,
      enemyVisual,
      isVictory,
      resultLabel,
      exchangeCount,
      exchanges,
      fieldLine: isVictory ? "Resolved signal playback." : "Signal replay degraded.",
      statusLabel: isVictory ? "Threat response stabilized" : "Threat pressure escalating",
    };
  }

  async function triggerMissionDuelPlayback(resultData, showResultCardCallback) {
    const revealResultCard = (() => {
      let done = false;
      return () => {
        if (done) return;
        done = true;
        try { showResultCardCallback?.(); } catch (_) {}
      };
    })();

    try {
      if (prefersReducedMotion()) {
        revealResultCard();
        return;
      }

      const model = buildMissionDuelModel(resultData);
      if (!model || !model.exchanges?.length || !_modal) {
        revealResultCard();
        return;
      }

      const seq = ++_missionDuelPlaybackSeq;
      const overlay = document.createElement("div");
      overlay.className = "m-duel-overlay";
      overlay.innerHTML = `
        <div class="m-duel-shell" role="dialog" aria-modal="true" aria-label="Mission duel playback">
          <div class="m-duel-head">
            <div style="min-width:0;">
              <div class="m-duel-kicker">Mission Duel Playback</div>
              <div class="m-duel-title">${esc(model.missionTitle)}</div>
              <div class="m-duel-sub">${esc(model.subtitle || model.fieldLine)}</div>
            </div>
            <button type="button" class="btn m-duel-skip">Skip</button>
          </div>
          <div class="m-duel-stage">
            <div class="m-duel-arena">
              <section class="m-duel-panel is-player" data-side="player">
                <div class="m-duel-panel-top">
                  <div style="min-width:0;">
                    <div class="m-duel-side">Alpha Pack</div>
                    <div class="m-duel-name">${esc(model.playerName)}</div>
                  </div>
                  <div class="m-duel-state">Ready</div>
                </div>
                ${renderMissionDuelVisual(model.playerVisual, "player", `${model.playerName} visual`, "Alpha")}
                <div class="m-duel-hp" data-hp="player">100 / 100 HP</div>
                <div class="m-duel-bar"><div class="m-duel-bar-fill" data-bar="player" style="width:100%"></div></div>
                <div class="m-duel-damage" data-damage="player"></div>
              </section>
              <div class="m-duel-clash">
                <div class="m-duel-label">Signal Feed Active</div>
                <div class="m-duel-vs">
                  <div class="m-duel-vs-ring">
                    <div class="m-duel-vs-core">VS</div>
                  </div>
                </div>
                <div class="m-duel-clash-text">Signal locked.</div>
                <div class="m-duel-progress">Exchange 0 / ${esc(model.exchangeCount)}</div>
                <div class="m-duel-result" data-tone="${model.isVictory ? "victory" : "defeat"}">${esc(model.resultLabel)}</div>
              </div>
              <section class="m-duel-panel is-enemy" data-side="enemy">
                <div class="m-duel-panel-top">
                  <div style="min-width:0;">
                    <div class="m-duel-side">Hostile Trace</div>
                    <div class="m-duel-name">${esc(model.enemyName)}</div>
                  </div>
                  <div class="m-duel-state">Scanning</div>
                </div>
                ${renderMissionDuelVisual(model.enemyVisual, "enemy", `${model.enemyName} visual`, "Hostile")}
                <div class="m-duel-hp" data-hp="enemy">100 / 100 HP</div>
                <div class="m-duel-bar"><div class="m-duel-bar-fill" data-bar="enemy" style="width:100%"></div></div>
                <div class="m-duel-damage" data-damage="enemy"></div>
              </section>
            </div>
            <div class="m-duel-stage-meta">
              <span>${esc(model.statusLabel)}</span>
              <span class="m-duel-live-status">Signal locked.</span>
            </div>
            <div class="m-duel-log">
              <div class="m-duel-log-head">
                <span>Field Report</span>
                <span>Playback trace</span>
              </div>
              <div class="m-duel-log-lines">
                <div class="m-duel-log-line">Signal locked.</div>
                <div class="m-duel-log-line">Hostile trace engaged.</div>
              </div>
            </div>
            <div class="m-duel-footer">
              <span class="m-duel-footer-note">Visual playback only. Rewards already resolved.</span>
              <span>Auto reveal in progress</span>
            </div>
          </div>
        </div>
      `;

      const host = _modal || document.body;
      host.appendChild(overlay);
      if (_modal && !_modal.style.position) _modal.style.position = "fixed";

      const skipButton = overlay.querySelector(".m-duel-skip");
      const progressNode = overlay.querySelector(".m-duel-progress");
      const resultNode = overlay.querySelector(".m-duel-result");
      const liveStatusNode = overlay.querySelector(".m-duel-live-status");
      const clashNode = overlay.querySelector(".m-duel-clash");
      const clashTextNode = overlay.querySelector(".m-duel-clash-text");
      const logLinesNode = overlay.querySelector(".m-duel-log-lines");
      const playerPanel = overlay.querySelector('[data-side="player"]');
      const enemyPanel = overlay.querySelector('[data-side="enemy"]');
      const playerBar = overlay.querySelector('[data-bar="player"]');
      const enemyBar = overlay.querySelector('[data-bar="enemy"]');
      const playerHp = overlay.querySelector('[data-hp="player"]');
      const enemyHp = overlay.querySelector('[data-hp="enemy"]');
      const playerDamage = overlay.querySelector('[data-damage="player"]');
      const enemyDamage = overlay.querySelector('[data-damage="enemy"]');
      const damageTimers = new Set();

      const sleepSafe = async (ms) => {
        if (ms <= 0) return;
        await sleep(ms);
      };

      const cleanup = () => {
        damageTimers.forEach((timerId) => clearTimeout(timerId));
        damageTimers.clear();
        overlay.remove();
      };

      const finishPlayback = () => {
        if (seq !== _missionDuelPlaybackSeq) return;
        _missionDuelPlaybackSeq += 1;
        cleanup();
        revealResultCard();
      };

      const renderDamage = (target, damage, critical) => {
        const node = target === "player" ? playerDamage : enemyDamage;
        if (!node) return;
        node.textContent = `${critical ? "CRIT " : ""}-${damage}`;
        node.className = `m-duel-damage is-visible ${target === "player" ? "is-player-hit" : "is-enemy-hit"}`;
        const timerId = setTimeout(() => {
          node.className = `m-duel-damage ${target === "player" ? "is-player-hit" : "is-enemy-hit"}`;
          damageTimers.delete(timerId);
        }, 720);
        damageTimers.add(timerId);
      };

      const setHpState = (side, hpValue) => {
        const bar = side === "player" ? playerBar : enemyBar;
        const hpNode = side === "player" ? playerHp : enemyHp;
        if (!bar || !hpNode) return;
        const safeHp = clampNumber(Math.round(hpValue), 0, 100);
        bar.style.width = `${safeHp}%`;
        hpNode.textContent = `${safeHp} / 100 HP`;
        hpNode.classList.toggle("is-critical", safeHp <= 25);
        bar.parentElement?.classList.toggle("is-critical", safeHp <= 25);
      };

      const flashPanel = (panel, finalStrike) => {
        if (!panel) return;
        panel.classList.remove("is-hit", "is-shake");
        void panel.offsetWidth;
        panel.classList.add("is-hit", "is-shake");
        const timerId = setTimeout(() => {
          panel.classList.remove("is-hit", "is-shake");
          if (finalStrike) panel.classList.add("is-hit");
          damageTimers.delete(timerId);
        }, finalStrike ? 420 : 280);
        damageTimers.add(timerId);
      };

      const pushLogLine = (text, isLive = false) => {
        if (!logLinesNode) return;
        const line = document.createElement("div");
        line.className = `m-duel-log-line${isLive ? " is-live" : ""}`;
        line.textContent = text;
        logLinesNode.appendChild(line);
        while (logLinesNode.children.length > 6) {
          logLinesNode.removeChild(logLinesNode.firstElementChild);
        }
      };

      const setPanelState = (panel, text) => {
        const stateNode = panel?.querySelector(".m-duel-state");
        if (stateNode) stateNode.textContent = text;
      };

      const pulseClash = (exchange) => {
        if (!clashNode || !clashTextNode) return;
        clashNode.classList.remove("is-player-strike", "is-enemy-strike", "is-critical");
        void clashNode.offsetWidth;
        clashNode.classList.add(exchange.attacker === "player" ? "is-player-strike" : "is-enemy-strike");
        if (exchange.critical) clashNode.classList.add("is-critical");
        clashTextNode.textContent = exchange.finalStrike
          ? model.resultLabel
          : exchange.critical
            ? "Critical breach"
            : exchange.attacker === "player"
              ? `${model.playerName} engages`
              : `${model.enemyName} surges`;
        const timerId = setTimeout(() => {
          clashNode.classList.remove("is-player-strike", "is-enemy-strike", "is-critical");
          damageTimers.delete(timerId);
        }, exchange.finalStrike ? 520 : 280);
        damageTimers.add(timerId);
      };

      skipButton?.addEventListener("click", () => {
        finishPlayback();
      });

      await sleepSafe(900);
      if (seq !== _missionDuelPlaybackSeq) return;

      for (let i = 0; i < model.exchanges.length; i += 1) {
        if (seq !== _missionDuelPlaybackSeq) return;
        const exchange = model.exchanges[i];
        const targetPanel = exchange.target === "player" ? playerPanel : enemyPanel;
        const attackerPanel = exchange.attacker === "player" ? playerPanel : enemyPanel;
        progressNode.textContent = `Exchange ${i + 1} / ${model.exchangeCount}`;
        liveStatusNode.textContent = exchange.logLine;
        setPanelState(playerPanel, exchange.target === "player" ? "Under fire" : (exchange.finalStrike && model.isVictory ? "Final strike" : "Advancing"));
        setPanelState(enemyPanel, exchange.target === "enemy" ? "Breached" : (exchange.finalStrike && !model.isVictory ? "Final strike" : "Countering"));

        pulseClash(exchange);
        flashPanel(targetPanel, exchange.finalStrike);
        if (attackerPanel && attackerPanel !== targetPanel) {
          attackerPanel.classList.remove("is-shake");
          void attackerPanel.offsetWidth;
          attackerPanel.classList.add("is-shake");
          const timerId = setTimeout(() => {
            attackerPanel.classList.remove("is-shake");
            damageTimers.delete(timerId);
          }, 220);
          damageTimers.add(timerId);
        }
        renderDamage(exchange.target, exchange.damage, exchange.critical);
        setHpState("player", exchange.playerHp);
        setHpState("enemy", exchange.enemyHp);
        pushLogLine(exchange.logLine, true);

        if (exchange.finalStrike) {
          resultNode.classList.add("is-visible");
          liveStatusNode.textContent = model.resultLabel;
          if (clashTextNode) clashTextNode.textContent = model.resultLabel;
          setPanelState(playerPanel, model.isVictory ? "Stable" : "Critical");
          setPanelState(enemyPanel, model.isVictory ? "Collapsed" : "Dominant");
        }

        await sleepSafe(exchange.finalStrike ? 1680 : 1520);
      }

      if (seq !== _missionDuelPlaybackSeq) return;
      await sleepSafe(900);
      finishPlayback();
    } catch (err) {
      log("mission duel playback failed", err?.message || err);
      try {
        const staleOverlay = (_modal || document).querySelector?.(".m-duel-overlay");
        staleOverlay?.remove?.();
      } catch (_) {}
      revealResultCard();
    }
  }

  function paintWaiting(a) {
    const clockEl = el("mClock");
    const subEl = el("mClockSub");
    const fillEl = el("mFill");
    const resolveBtn = el("mResolveBtn");

    if (!clockEl || !subEl || !fillEl) return;

    const status = a?.status || "NONE";
    const remaining = Number(a.remaining || 0);
    const pct = Math.round((Number(a.pct || 0)) * 100);

    fillEl.style.width = `${pct}%`;

    if (status === "RUNNING") {
      clockEl.textContent = _fmtTime(remaining);
      const syncing = a.__pending ? ` · <span style="opacity:.9">Syncing…</span>` : "";
      subEl.innerHTML = `Progress <b>${esc(pct)}%</b>${a.readyAt ? ` · Ready at <b>${esc(a.readyAt)}</b>` : ""}${syncing}`;
      if (resolveBtn) resolveBtn.style.display = "none";
    } else {
      clockEl.textContent = "READY";
      subEl.textContent = "Tap Resolve to claim rewards.";
      if (resolveBtn) resolveBtn.style.display = "";
    }

    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";
  }

  function _optimisticStart(tier, offerId) {
    const payload = normalizePayload(_state) || {};
    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const o = offers.find(x => String(x?.offerId || x?.id || x?.offer_id || "") === String(offerId));

    const durSec = Number(o?.durationSec || o?.duration_sec || 0) || 60;
    const started = Math.floor(_nowSec());
    const title = String(o?.title || o?.label || tier || "Mission");

    // ✅ rare drop can come from offer (recommended)
    const rareDrop = _extractRareDrop(o);

    _pendingStart = {
      tier,
      offerId,
      startedClientSec: started,
      durationSec: durSec,
      title,
      subtitle: String(o?.subtitle || o?.archetype || ""),
      lore: String(o?.lore || o?.desc || ""),
      modifierLabel: String(o?.modifierLabel || ""),
      rewardIntent: Array.isArray(o?.rewardIntent) ? o.rewardIntent : [],
      rareHint: String(o?.rareHint || ""),
      rareDrop,
      bossAsset: String(o?.bossAsset || ""),
      bossImage: String(o?.bossImage || ""),
      visualKey: String(o?.visualKey || ""),
      enemyVisual: String(o?.enemyVisual || o?.bossImage || ""),
      enemyImage: String(o?.enemyImage || o?.bossImage || ""),
      targetImage: String(o?.targetImage || o?.bossImage || ""),
      // ✅ keep optimistic timer until mission would be ready (+30s buffer)
      untilMs: Date.now() + (durSec * 1000) + 30000,
    };

    render(); // renders WAITING via pending
  }

  function render() {
    if (!_root) return;

    const payload = normalizePayload(_state);
    if (!payload || typeof payload !== "object") {
      renderError("Bad payload", JSON.stringify(_state).slice(0, 900));
      return;
    }

    _syncServerClock(payload);

    const offers = Array.isArray(payload.offers) ? payload.offers : [];
    const realActive = getActive(payload);
    const active = (realActive.status === "NONE" && _pendingValid()) ? _activeFromPending() : realActive;

    const last = payload.lastResolve || payload.last_resolve || null;
    blueSignalHuntProgress(payload);

    if (active.status && active.status !== "NONE") {
      // ✅ rare drop source order: pending.offer → active raw mission → payload (fallback)
      const rare =
        (active.__pending ? (_pendingStart?.rareDrop || null) : null) ||
        _extractRareDrop(active.__raw) ||
        _extractRareDrop(_primaryActive(payload)) ||
        null;
      const activeTags = [];
      if (active.modifierLabel) activeTags.push(active.modifierLabel);
      if (Array.isArray(active.rewardIntent) && active.rewardIntent.length) {
        activeTags.push(`Reward intent: ${active.rewardIntent.join(" · ")}`);
      }
      const activeMatchLabel = normalizePetMatchLabel(active);
      const activeHint = textOrEmpty(active.compactHint) || (activeMatchLabel ? `Pet fit: ${activeMatchLabel}` : "");

      _root.innerHTML = `
        <div class="m-stage m-stage-wait">
          <div class="m-wait-center">
            ${active.subtitle ? `<div class="m-kicker">${esc(active.subtitle)}</div>` : ""}
            <div class="m-title">${esc(active.title || "Mission")}</div>
            ${active.lore ? `<div class="m-muted" style="max-width:min(520px, 92%); margin-top:4px;">${esc(active.lore)}</div>` : ""}
            ${renderTags(activeTags)}
            ${activeHint ? `<div class="m-muted" style="max-width:min(520px, 92%); margin-top:6px;">${esc(activeHint)}</div>` : ""}
            <div id="mClock" class="m-clock">—</div>
            <div id="mClockSub" class="m-clock-sub">—</div>

            <div class="m-bar"><div id="mFill" class="m-bar-fill" style="width:0%"></div></div>

            ${rare ? renderRareDropCard(rare) : ""}

            <div class="m-actions">
              <button id="mResolveBtn" type="button" class="btn primary" data-act="resolve" style="display:none">Resolve</button>
              ${active.__pending ? `<button type="button" class="btn" data-act="back_to_offers">Back</button>` : ``}
            </div>
          </div>
        </div>
      `;

      paintWaiting(active);
      startTick();
      return;
    }

    stopTick();

    const row = el("missionsRefresh")?.closest?.(".btn-row") || el("missionsResolve")?.closest?.(".btn-row");
    if (row) row.style.display = "none";

    _root.innerHTML = `
      <div class="m-stage">
        <div class="m-shell-head">
          <div class="m-shell-top">
            <div class="m-title">Missions</div>
            <button type="button" class="btn m-compact-btn m-help-btn" data-act="toggle_help">?</button>
          </div>
          <div class="m-shell-sub">Pick a route. Start → Wait → Resolve.</div>
          <div class="m-inline-status">No active mission. Pick an offer to start.</div>
          ${renderHelpPanel()}
        </div>

        ${renderEliteMissionsPreview()}

        <div class="m-card">
          <div class="m-row">
            <div style="min-width:0;">
              <div class="m-title">Offers</div>
              <div class="m-muted" style="margin-top:4px;">Routes rotate with modifier, reward intent, and rare cache signals.</div>
            </div>
            <button type="button" class="btn m-compact-btn m-head-btn" data-act="refresh">Refresh</button>
          </div>

          <div class="m-hr"></div>

          <div>
            ${
              offers.length
                ? offers.map(o => renderOffer(o, realActive)).join("")
                : `<div class="m-muted">No offers yet. Refresh to scan for routes.</div>`
            }
          </div>
        </div>
        ${last ? renderLastClarity(last) : `<div class="m-muted" style="margin-top:8px;">No recent report.</div>`}
      </div>
    `;
  }

  // =========================
  // Sync after start (poll state until backend confirms active)
  // =========================
  async function _syncAfterStart(maxMs = 6500, intervalMs = 450) {
    const t0 = Date.now();
    while (Date.now() - t0 < maxMs) {
      try {
        const res = await api("/webapp/missions/state", { run_id: rid("m:state") });
        _state = res;

        // debug snapshots
        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}

        const p = normalizePayload(res);
        const a = p ? getActive(p) : { status: "NONE" };
        if (a.status && a.status !== "NONE") {
          _pendingStart = null;
          render();
          return true;
        }
      } catch (_) {}
      await sleep(intervalMs);
    }
    return false;
  }

  // =========================
  // Actions
  // =========================
  async function loadStateBase(options = {}) {
    const { force = false, reason = "auto" } = options || {};
    if (!force && _state && _stateLoadedAt && (Date.now() - _stateLoadedAt) < MISSIONS_STATE_STALE_MS) {
      log("skip missions/state; fresh cache", { reason, ageMs: Math.max(0, Date.now() - _stateLoadedAt) });
      render();
      return _state;
    }
    renderLoading("Loading missions…");
    try {
      const [res] = await Promise.all([
        api("/webapp/missions/state", { run_id: rid("m:state") }),
        loadProgressionV1({ force }),
      ]);
      _state = res;
      _stateLoadedAt = Date.now();

      // debug snapshots
      try {
        window.__AH_MISSIONS_RAW = res;
        window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
      } catch (_) {}

      const p = normalizePayload(_state);
      const a = p ? getActive(p) : { status: "NONE" };
      if (a.status && a.status !== "NONE") _pendingStart = null;

      render();
      return _state;
    } catch (e) {
      renderError("Missions backend error", String(e?.message || e || ""));
      return null;
    }
  }

  async function loadState(options = {}) {
    const perfT0 = window.__ahPerf?.now?.() || Date.now();
    const out = await loadStateBase(options);
    window.__ahPerf?.log?.("Missions.loadState", perfT0, { ok: !!out });
    return out;
  }

  async function doRefresh() {
    try {
      const refreshPromise = api("/webapp/missions/action", { action: "refresh_offers", run_id: rid("m:refresh") });
      const progressionPromise = loadProgressionV1({ force: true });
      const res = await refreshPromise;
      await progressionPromise.catch(() => null);
      if (res && typeof res === "object") {
        _state = res;
        _stateLoadedAt = Date.now();
        try {
          window.__AH_MISSIONS_RAW = res;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
        } catch (_) {}
        render();
        if (res.message) {
          try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
          try { _tg?.showAlert?.(String(res.message)); } catch (_) {}
        }
        return;
      }
      await loadState({ force: true, reason: "refresh_fallback" });
    } catch (e) {
      const msg = String(e?.data?.message || e?.message || e || "Refresh failed");
      try { _tg?.HapticFeedback?.notificationOccurred?.("error"); } catch (_) {}
      try { _tg?.showAlert?.(msg); } catch (_) {}
    }
  }

  async function doStart(tier, offerId) {
    try {
      const startRes = await api("/webapp/missions/action", {
        action: "start",
        tier,
        offerId,
        id: offerId,
        offer_id: offerId,
        run_id: rid("m:start"),
      });
      
      // optimistic wait immediately (prevents blink)
_optimisticStart(tier, offerId);

// ANALYTICS: rozpoczęcie misji (nie może psuć startu)
try {
  track("mission_started", {
    tier,
    offerId,
    title: String(_pendingStart?.title || tier || "Unknown Mission")
  });
} catch (err) {
  console.warn("[missions] track mission_started failed", err);
}

try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      // if backend returned state with active, great — but still poll to confirm
      if (startRes && typeof startRes === "object") {
        _state = startRes;
        _stateLoadedAt = Date.now();
        try {
          window.__AH_MISSIONS_RAW = startRes;
          window.__AH_MISSIONS_PAYLOAD = normalizePayload(startRes);
        } catch (_) {}
        render();
        if (startRes.message) {
          try { _tg?.showAlert?.(String(startRes.message)); } catch (_) {}
        }
      }

      // poll state until backend confirms active (or timeout)
      const ok = await _syncAfterStart();
      if (!ok) {
        log("start: backend did not confirm active within window");
      }
      return;

    } catch (e) {
      const msg = String(e?.message || e || "");
      if (msg.toUpperCase() === "ACTIVE") {
        await loadState({ force: true, reason: "start_active" });
        return;
      }
      _pendingStart = null;
      renderError("Start failed", msg);
    }
  }

  async function doResolve() {
    try {
      const res = await api("/webapp/missions/action", { action: "resolve", run_id: rid("m:resolve") });
      
      // ANALYTICS: ukończenie misji
      track("mission_resolved", {
        success: true,
        title: _state?.active_mission?.title || _pendingStart?.title || "Mission"
      });
      
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      const progressToast = buildMissionResolveToast(res);
      if (progressToast && Array.isArray(progressToast.lines) && progressToast.lines.length) {
        showMissionProgressToast(progressToast, progressToast.lines.join(" • "));
      }
      _pendingStart = null;
      if (res && typeof res === "object") {
        const showResultCard = () => {
          _state = res;
          _stateLoadedAt = Date.now();
          try {
            window.__AH_MISSIONS_RAW = res;
            window.__AH_MISSIONS_PAYLOAD = normalizePayload(res);
          } catch (_) {}
          render();
        };
        await triggerMissionDuelPlayback(res, showResultCard);
        return;
      }
      await loadState({ force: true, reason: "resolve_fallback" });
    } catch (e) {
      renderError("Resolve failed", String(e?.message || e || ""));
    }
  }

  async function doClaimBlueSignalFrame() {
    try {
      const res = await api("/webapp/blue-signal-hunt/claim", { run_id: rid("m:blue-signal-claim") });
      const progress = (res && (res.progress || res.blueSignalHunt || res.blue_signal_hunt)) || null;
      _state = { ...(_state || {}) };
      if (progress && typeof progress === "object") {
        _state.blueSignalHunt = progress;
      }
      _stateLoadedAt = Date.now();
      try { _tg?.HapticFeedback?.notificationOccurred?.("success"); } catch (_) {}
      render();
    } catch (e) {
      const progress = e?.data?.progress;
      if (progress && typeof progress === "object") {
        _state = { ...(_state || {}), blueSignalHunt: progress };
        _stateLoadedAt = Date.now();
        render();
        return;
      }
      renderError("Claim failed", String(e?.message || e || ""));
    }
  }

  function openFrames() {
    if (!window.Frames?.open) return;
    close();
    setTimeout(() => {
      try { window.Frames.open(); } catch (_) {}
    }, 30);
  }

  // =========================
  // Public API
  // =========================
  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg;
    _dbg = !!dbg;
    ensureStyles();
    ensureModal();
    log("init ok");
  }

  window.Missions = { init, open, close, reload: loadState, triggerMissionDuelPlayback };
})();
