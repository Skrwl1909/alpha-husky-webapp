// js/stats.js — Stats modal (WebApp)
// Layout polish version: cleaner hero panel, stat cards, gear summary, active sets
// Source of truth stays on backend: /webapp/stats/state + /webapp/mystats/state
(function () {
  const Stats = {};
  let _apiPost = null, _tg = null, _dbg = false;
  let _loading = false;
  let _inited = false;
  let _loadSeq = 0;
  let _hubGoalSeq = 0;
  let _lastStats = null;
  let _lastMystats = null;
  let _progressionExtras = {
    badgeCount: 0,
    fortress: null,
  };

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

  function qs(id){ return document.getElementById(id); }

  function esc(s){
    return String(s ?? "").replace(/[&<>"']/g, m => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#39;"
    }[m]));
  }

  function n(v, d = 0){
    const x = Number(v);
    return Number.isFinite(x) ? x : d;
  }

  function clampPct(v){
    return Math.max(0, Math.min(100, n(v, 0)));
  }

  function asArray(v){
    return Array.isArray(v) ? v : [];
  }

  function toText(v, fallback = ""){
    return String(v ?? fallback).trim();
  }

  function getOkPayload(res){
    if (!res || typeof res !== "object") return null;
    if (res.ok === true && res.data && typeof res.data === "object") return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    return res.ok === false ? null : res;
  }

  function normalizeBadgeCount(res){
    const payload = getOkPayload(res);
    if (!payload || typeof payload !== "object") return 0;
    if (Number.isFinite(Number(payload.total))) return Math.max(0, Number(payload.total));
    const list = asArray(payload.badges);
    return list.reduce((acc, badge) => acc + (badge?.owned === false ? 0 : 1), 0);
  }

  function normalizeFortressState(res){
    const st = getOkPayload(res);
    if (!st || typeof st !== "object") return null;

    const currentFloor = Math.max(1, n(st.currentFloor, 1));
    const bestFloor = Math.max(0, n(st.highestClearedFloor ?? st.bestFloor, 0));
    const maxFloor = Math.max(0, n(st.maxFloor, 30));
    const sector = Math.max(1, n(st.sector, currentFloor > 20 ? 3 : currentFloor > 10 ? 2 : 1));
    const sectorFloor = Math.max(1, n(st.sectorFloor, ((currentFloor - 1) % 10) + 1));
    const boss = (st.boss && typeof st.boss === "object") ? st.boss : {};
    const bossName = toText(
      boss.name || st.nextEncounterName || st.bossName || st.nextName || st.nextId || "Unknown"
    );
    const bossPower = Math.max(0, n(boss.power ?? boss.danger, 0));
    const bossDanger = Math.max(0, n(boss.danger ?? boss.power, 0));
    const cooldownLeftSec = Math.max(0, n(st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown, 0));
    return {
      ready: !!(st.ready ?? st.canFight ?? st.canStart ?? cooldownLeftSec <= 0),
      cooldownLeftSec,
      currentFloor,
      bestFloor,
      maxFloor,
      sector,
      sectorFloor,
      bossName,
      bossPower,
      bossDanger,
      bossFloorNumber: Math.max(1, n(boss.floorNumber ?? currentFloor, currentFloor)),
      rewardPreview: st.rewardPreview && typeof st.rewardPreview === "object" ? st.rewardPreview : null,
    };
  }

  function getNextThreshold(signalPower){
    for (const item of SIGNAL_THRESHOLDS) {
      if (signalPower < item.value) return item;
    }
    return SIGNAL_THRESHOLDS[SIGNAL_THRESHOLDS.length - 1];
  }

  function summarizeRewardPreview(rewardPreview){
    if (!rewardPreview || typeof rewardPreview !== "object") return "No reward preview exposed yet.";
    const parts = [];
    const addItems = (items) => {
      for (const item of asArray(items)) {
        const text = toText(item);
        if (!text || parts.includes(text)) continue;
        parts.push(text);
        if (parts.length >= 4) break;
      }
    };

    addItems(rewardPreview.summary);
    addItems(rewardPreview.firstClear);
    addItems(rewardPreview.possibleDrops);
    addItems(rewardPreview.milestone);
    addItems(rewardPreview.replay);

    return parts.length ? parts.join(" / ") : "Reward preview ready in MoonLab.";
  }

  function normalizeMoonlabWallFromFortress(fortress){
    if (!fortress || typeof fortress !== "object") return { available: false };
    return {
      available: true,
      currentFloor: Math.max(0, n(fortress.currentFloor, 0)),
      bestFloor: Math.max(0, n(fortress.bestFloor, 0)),
      highestClearedFloor: Math.max(0, n(fortress.highestClearedFloor ?? fortress.bestFloor, 0)),
      maxFloor: Math.max(0, n(fortress.maxFloor, 30)),
      sector: Math.max(0, n(fortress.sector, 0)),
      sectorFloor: Math.max(0, n(fortress.sectorFloor, 0)),
      bossName: toText(fortress.bossName, ""),
      bossPower: Math.max(0, n(fortress.bossPower, 0)),
      bossDanger: Math.max(0, n(fortress.bossDanger, 0)),
      cooldownLeftSec: Math.max(0, n(fortress.cooldownLeftSec, 0)),
      ready: !!fortress.ready,
    };
  }

  function getMoonlabBossPressure(wall){
    if (!wall || !wall.available) return 0;
    return Math.max(0, n(wall.bossPower, 0), n(wall.bossDanger, 0));
  }

  function formatMoonlabStatus(wall, signalPower){
    if (!wall || !wall.available) return "Syncing";
    if (Math.max(0, n(wall.cooldownLeftSec, 0)) > 0) return "Cooling Down";
    if (getMoonlabBossPressure(wall) > Math.max(0, n(signalPower, 0))) return "Boss Overpowers Signal";
    if (wall.ready) return "Ready";
    return "Chamber Active";
  }

  function getMoonlabWallContext(stats, extras, goal){
    const progression = normalizeProgressionV1(stats?.progression_v1);
    if (progression) {
      return {
        wall: progression.moonlabWall,
        signalPower: progression.signalPower,
        missingPower: progression.missingPower,
        nextUnlockLabel: progression.nextUnlockLabel,
        recommendedAction: progression.recommendedAction,
      };
    }

    const wall = goal?.fortress ? normalizeMoonlabWallFromFortress(goal.fortress) : { available: false };
    const nextThreshold = goal?.nextThreshold;
    return {
      wall,
      signalPower: Math.max(0, n(goal?.signalPower, 0)),
      missingPower: Math.max(0, n(goal?.missingPower, 0)),
      nextUnlockLabel: toText(
        typeof nextThreshold === "object" ? nextThreshold?.label : "",
        ""
      ),
      recommendedAction: toText(goal?.bestMove, "Complete missions to stabilize your signal."),
    };
  }

  function resolveHubBestMove(ctx){
    const wall = ctx?.wall || { available: false };
    const signalPower = Math.max(0, n(ctx?.signalPower, 0));
    const fallback = toText(
      ctx?.recommendedAction,
      "Complete missions to stabilize your signal."
    );

    if (!wall.available) return fallback;
    if (Math.max(0, n(wall.cooldownLeftSec, 0)) > 0) return fallback;
    if (getMoonlabBossPressure(wall) > signalPower) return fallback;
    if (wall.ready) return "Enter MoonLab and break the wall.";
    return fallback;
  }

  function resolveStatsMoonlabRecommended(ctx){
    const wall = ctx?.wall || { available: false };
    const signalPower = Math.max(0, n(ctx?.signalPower, 0));
    const fallback = toText(
      ctx?.recommendedAction,
      "Complete missions to stabilize your signal."
    );

    if (!wall.available) {
      return "Progression data is not available yet.";
    }
    if (Math.max(0, n(wall.cooldownLeftSec, 0)) > 0) return fallback;
    if (getMoonlabBossPressure(wall) > signalPower) {
      return "Build signal power before your next MoonLab run.";
    }
    if (wall.ready) return "Enter MoonLab and clear the wall.";
    return fallback;
  }

  function normalizeProgressionV1(raw){
    if (!raw || typeof raw !== "object") return null;

    const breakdown = (raw.breakdown && typeof raw.breakdown === "object") ? raw.breakdown : {};
    const fallbackThreshold = getNextThreshold(Math.max(0, n(raw.signalPower ?? breakdown.total, 0)));
    const wall = (raw.moonlabWall && typeof raw.moonlabWall === "object") ? raw.moonlabWall : {};
    const signalPower = Math.max(0, n(raw.signalPower ?? breakdown.total, 0));
    const nextThreshold = Math.max(0, n(raw.nextThreshold, fallbackThreshold.value));
    const missingPower = Math.max(0, n(raw.missingPower, Math.max(0, nextThreshold - signalPower)));

    return {
      signalPower,
      nextThreshold,
      missingPower,
      nextUnlockLabel: toText(raw.nextUnlockLabel, fallbackThreshold.label),
      recommendedAction: toText(raw.recommendedAction, "Complete missions to stabilize your signal."),
      breakdown: {
        levelPower: Math.max(0, n(breakdown.levelPower, 0)),
        badgePower: Math.max(0, n(breakdown.badgePower, 0)),
        petPower: Math.max(0, n(breakdown.petPower, 0)),
        total: signalPower,
      },
      moonlabWall: {
        available: !!wall.available,
        currentFloor: Math.max(0, n(wall.currentFloor, 0)),
        bestFloor: Math.max(0, n(wall.bestFloor, 0)),
        highestClearedFloor: Math.max(0, n(wall.highestClearedFloor, 0)),
        maxFloor: Math.max(0, n(wall.maxFloor, 0)),
        sector: Math.max(0, n(wall.sector, 0)),
        sectorFloor: Math.max(0, n(wall.sectorFloor, 0)),
        bossName: toText(wall.bossName, ""),
        bossPower: Math.max(0, n(wall.bossPower, 0)),
        bossDanger: Math.max(0, n(wall.bossDanger, 0)),
        cooldownLeftSec: Math.max(0, n(wall.cooldownLeftSec, 0)),
        ready: !!wall.ready,
      },
    };
  }

  function getSignalBreakdown(stats, extras){
    const progression = normalizeProgressionV1(stats?.progression_v1);
    if (progression) return {
      levelPower: progression.breakdown.levelPower,
      badgePower: progression.breakdown.badgePower,
      petPower: progression.breakdown.petPower,
      signalPower: progression.breakdown.total,
      hasActivePet: progression.breakdown.petPower > 0,
      petLevel: 0,
      badgeCount: 0,
    };

    const level = Math.max(0, n(stats?.level, 0));
    const pet = (stats && typeof stats.pet === "object") ? stats.pet : {};
    const petName = toText(pet?.name, "None");
    const petLevel = Math.max(0, n(pet?.level, 0));
    const hasActivePet = petName.toLowerCase() !== "none";
    const badgeCount = Math.max(0, n(extras?.badgeCount, 0));
    const fortress = extras?.fortress || null;

    const levelPower = level * 10;
    const badgePower = badgeCount * 15;
    const petPower = hasActivePet ? petLevel * 5 : 0;
    const signalPower = levelPower + badgePower + petPower;

    return {
      levelPower,
      badgePower,
      petPower,
      signalPower,
      hasActivePet,
      petLevel,
      badgeCount,
    };
  }

  function buildGoalState(stats, extras){
    const progression = normalizeProgressionV1(stats?.progression_v1);
    if (progression) {
      const wall = progression.moonlabWall || {};
      const wallLabel = wall.available
        ? `MoonLab Floor ${Math.max(1, wall.currentFloor || 1)} - ${toText(wall.bossName, "Unknown")}`
        : "MoonLab wall syncing...";
      return {
        signalPower: progression.signalPower,
        nextThreshold: { value: progression.nextThreshold, label: progression.nextUnlockLabel },
        missingPower: progression.missingPower,
        bestMove: progression.recommendedAction,
        fortress: wall.available ? {
          currentFloor: wall.currentFloor,
          bestFloor: wall.bestFloor,
          maxFloor: wall.maxFloor,
          sector: wall.sector,
          sectorFloor: wall.sectorFloor,
          bossName: wall.bossName,
          bossPower: wall.bossPower,
          bossDanger: wall.bossDanger,
          cooldownLeftSec: wall.cooldownLeftSec,
          ready: wall.ready,
        } : null,
        nextWallLabel: wallLabel,
        rewardPreviewText: "",
        levelPower: progression.breakdown.levelPower,
        badgePower: progression.breakdown.badgePower,
        petPower: progression.breakdown.petPower,
      };
    }

    const breakdown = getSignalBreakdown(stats, extras);
    const fortress = extras?.fortress || null;

    const nextThreshold = getNextThreshold(breakdown.signalPower);
    const missingPower = Math.max(0, nextThreshold.value - breakdown.signalPower);
    const bossPower = Math.max(0, n(fortress?.bossPower ?? fortress?.bossDanger, 0));
    const moonlabCoolingDown = Math.max(0, n(fortress?.cooldownLeftSec, 0)) > 0;

    let bestMove = "Complete missions to stabilize your signal.";
    if (missingPower <= 150) {
      bestMove = "You are close. Push one more mission cycle.";
    } else if (moonlabCoolingDown) {
      bestMove = "MoonLab is cooling down. Run missions while the chamber stabilizes.";
    } else if (bossPower > breakdown.signalPower) {
      bestMove = "MoonLab boss is stronger than your current signal. Build power before the next run.";
    } else if (breakdown.hasActivePet) {
      bestMove = "Complete missions or upgrade your active pet.";
    }

    const nextWallFloor = Math.max(1, n(fortress?.bossFloorNumber ?? fortress?.currentFloor, 1));
    const nextWallLabel = fortress
      ? `MoonLab Floor ${nextWallFloor} - ${toText(fortress.bossName, "Unknown")}`
      : "MoonLab wall syncing...";

    return {
      ...breakdown,
      nextThreshold,
      missingPower,
      bestMove,
      fortress,
      nextWallLabel,
      rewardPreviewText: summarizeRewardPreview(fortress?.rewardPreview),
    };
  }

  function statLabel(k){
    const map = {
      strength: "STR",
      agility: "AGI",
      defense: "DEF",
      vitality: "VIT",
      intelligence: "INT",
      luck: "LUCK"
    };
    return map[k] || String(k || "").toUpperCase();
  }

  function statFullName(k){
    const map = {
      strength: "Strength",
      agility: "Agility",
      defense: "Defense",
      vitality: "Vitality",
      intelligence: "Intelligence",
      luck: "Luck"
    };
    return map[k] || String(k || "");
  }

  function show(){
    const b = qs("statsBack");
    if (!b) return;
    if ("hidden" in b) b.hidden = false;
    b.style.display = "flex";
    b.dataset.open = "1";
  }

  function hide(){
    const b = qs("statsBack");
    if (!b) return;
    if ("hidden" in b) b.hidden = true;
    b.style.display = "none";
    delete b.dataset.open;
  }

  function bindClickOnce(el, fn){
    if (!el) return;
    if (el.dataset.statsBound === "1") return;
    el.addEventListener("click", fn);
    el.dataset.statsBound = "1";
  }

  function normalizeSet(s){
    if (Array.isArray(s)) {
      return {
        name: s[0] ?? "Set",
        count: n(s[1], 0),
        bonus: (s[2] && typeof s[2] === "object") ? s[2] : {},
        totalParts: n(s[3], 0)
      };
    }
    if (s && typeof s === "object") {
      return {
        name: s.name ?? "Set",
        count: n(s.count, 0),
        bonus: (s.bonus && typeof s.bonus === "object") ? s.bonus : {},
        totalParts: n(s.totalParts, 0)
      };
    }
    return {
      name: "Set",
      count: 0,
      bonus: {},
      totalParts: 0
    };
  }

  function getPayload(res){
    if (!res || typeof res !== "object") return null;
    if (res.ok === true && res.data && typeof res.data === "object") return res.data;
    if (res.data && typeof res.data === "object") return res.data;
    return null;
  }

  function ensureStyles(){
    if (document.getElementById("ah-stats-styles")) return;

    const style = document.createElement("style");
    style.id = "ah-stats-styles";
    style.textContent = `
      #statsRoot { color: #e9edf6; }

      .ahs-wrap{
        display:flex;
        flex-direction:column;
        gap:12px;
        padding:2px 2px 8px;
      }

      .ahs-card{
        position:relative;
        border:1px solid rgba(255,255,255,.10);
        border-radius:16px;
        background:
          linear-gradient(180deg, rgba(17,20,28,.96), rgba(10,12,18,.94));
        box-shadow:
          0 8px 24px rgba(0,0,0,.24),
          inset 0 1px 0 rgba(255,255,255,.04);
        overflow:hidden;
      }

      .ahs-card::before{
        content:"";
        position:absolute;
        inset:0 0 auto 0;
        height:1px;
        background:linear-gradient(90deg, transparent, rgba(120,180,255,.25), transparent);
        pointer-events:none;
      }

      .ahs-pad{ padding:14px; }
      .ahs-section-title{
        font-size:13px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:#9fb6d9;
        margin-bottom:10px;
      }

      .ahs-hero-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:12px;
      }

      .ahs-title{
        display:flex;
        flex-direction:column;
        gap:4px;
      }

      .ahs-title-main{
        font-size:16px;
        font-weight:900;
        line-height:1.1;
        color:#f3f7ff;
      }

      .ahs-title-sub{
        font-size:12px;
        color:rgba(220,230,255,.62);
      }

      .ahs-badges{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
        justify-content:flex-end;
      }

      .ahs-badge{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:800;
        border:1px solid rgba(255,255,255,.10);
        background:rgba(255,255,255,.04);
        color:#eaf1ff;
      }

      .ahs-badge.-level{
        background:linear-gradient(180deg, rgba(55,95,160,.34), rgba(30,54,92,.28));
        border-color:rgba(120,170,255,.28);
      }

      .ahs-badge.-unspent{
        background:linear-gradient(180deg, rgba(130,92,24,.42), rgba(78,53,12,.34));
        border-color:rgba(255,200,100,.28);
        color:#ffe8b8;
      }

      .ahs-grid-3{
        display:grid;
        grid-template-columns:1fr;
        gap:10px;
      }

      .ahs-mini{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:rgba(255,255,255,.03);
        padding:10px 10px 9px;
      }

      .ahs-mini-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:6px;
      }

      .ahs-mini-label{
        font-size:12px;
        font-weight:800;
        color:#c7d7f2;
      }

      .ahs-mini-value{
        font-size:12px;
        font-weight:800;
        color:#f4f7ff;
      }

      .ahs-bar{
        position:relative;
        height:9px;
        border-radius:999px;
        overflow:hidden;
        background:rgba(255,255,255,.06);
        box-shadow: inset 0 1px 2px rgba(0,0,0,.35);
      }

      .ahs-bar-fill{
        position:absolute;
        inset:0 auto 0 0;
        border-radius:999px;
      }

      .ahs-bar-fill.-hp{
        background:linear-gradient(90deg, #8f3036, #e45d67);
      }

      .ahs-bar-fill.-xp{
        background:linear-gradient(90deg, #2d578f, #59a1ff);
      }

      .ahs-bar-fill.-pet{
        background:linear-gradient(90deg, #5a3a8f, #a774ff);
      }

      .ahs-mini-foot{
        margin-top:6px;
        font-size:11px;
        color:rgba(228,235,248,.58);
        display:flex;
        justify-content:flex-end;
      }

      .ahs-stats-grid{
        display:grid;
        grid-template-columns:1fr 1fr;
        gap:10px;
      }

      .ahs-stat{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:
          linear-gradient(180deg, rgba(255,255,255,.035), rgba(255,255,255,.02));
        padding:11px 11px 10px;
      }

      .ahs-stat-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:8px;
        margin-bottom:8px;
      }

      .ahs-stat-right{
        display:flex;
        align-items:flex-start;
        gap:8px;
      }

      .ahs-plus{
        width:28px;
        height:28px;
        border-radius:10px;
        border:1px solid rgba(255,255,255,.10);
        background:linear-gradient(180deg, rgba(120,170,255,.18), rgba(70,110,180,.14));
        color:#eef4ff;
        font-size:18px;
        font-weight:900;
        line-height:1;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
      }

      .ahs-plus:disabled{
        opacity:.38;
        cursor:default;
      }

      .ahs-stat-code{
        font-size:12px;
        font-weight:900;
        letter-spacing:.06em;
        color:#eef4ff;
      }

      .ahs-stat-name{
        font-size:11px;
        color:rgba(220,230,255,.56);
        margin-top:2px;
      }

      .ahs-stat-total{
        font-size:22px;
        font-weight:900;
        line-height:1;
        color:#f7fbff;
      }

      .ahs-stat-break{
        display:grid;
        grid-template-columns:repeat(3, 1fr);
        gap:6px;
      }

      .ahs-chip{
        border-radius:10px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.035);
        padding:6px 6px 5px;
        text-align:center;
      }

      .ahs-chip-label{
        display:block;
        font-size:10px;
        text-transform:uppercase;
        letter-spacing:.06em;
        color:rgba(215,225,245,.48);
        margin-bottom:3px;
      }

      .ahs-chip-value{
        display:block;
        font-size:12px;
        font-weight:800;
        color:#eaf2ff;
      }

      .ahs-list{
        display:flex;
        flex-direction:column;
        gap:8px;
      }

      .ahs-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:10px 12px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:12px;
        background:rgba(255,255,255,.03);
      }

      .ahs-row-left{
        display:flex;
        flex-direction:column;
        gap:2px;
      }

      .ahs-row-title{
        font-size:13px;
        font-weight:800;
        color:#edf4ff;
      }

      .ahs-row-sub{
        font-size:11px;
        color:rgba(220,230,255,.5);
      }

      .ahs-row-value{
        font-size:14px;
        font-weight:900;
        color:#f4f7ff;
      }

      .ahs-sets{
        display:flex;
        flex-direction:column;
        gap:10px;
      }

      .ahs-set{
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:rgba(255,255,255,.03);
        padding:12px;
      }

      .ahs-set-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-bottom:8px;
      }

      .ahs-set-name{
        font-size:13px;
        font-weight:900;
        color:#f0f5ff;
      }

      .ahs-set-count{
        font-size:11px;
        font-weight:800;
        color:#a8bddf;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        border-radius:999px;
        padding:4px 8px;
      }

      .ahs-set-bonuses{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
      }

      .ahs-pill{
        display:inline-flex;
        align-items:center;
        gap:6px;
        min-height:28px;
        padding:0 9px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.04);
        color:#e9f1ff;
        font-size:12px;
        font-weight:800;
      }

      .ahs-empty{
        font-size:12px;
        color:rgba(220,230,255,.52);
        padding:2px 0;
      }

      .ahs-note{
        margin-top:10px;
        font-size:11px;
        color:rgba(255,235,190,.72);
      }

      .ahs-breakdown{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
      }

      .ahs-breakdown-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:10px 12px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:12px;
        background:rgba(255,255,255,.03);
      }

      .ahs-breakdown-row span{
        font-size:12px;
        color:#c7d7f2;
      }

      .ahs-breakdown-row b{
        font-size:13px;
        color:#f3f7ff;
        text-align:right;
      }

      #hubGoalRoot{
        padding:0 14px 12px;
      }

      .ahg-card{
        position:relative;
        overflow:hidden;
        border-radius:16px;
        border:1px solid rgba(173,206,242,.16);
        background:
          radial-gradient(circle at 12% -10%, rgba(97,140,194,.18), transparent 42%),
          radial-gradient(circle at 100% 120%, rgba(118,92,52,.14), transparent 50%),
          linear-gradient(180deg, rgba(14,20,31,.92), rgba(9,13,21,.96));
        box-shadow:
          0 12px 28px rgba(0,0,0,.28),
          inset 0 1px 0 rgba(255,255,255,.05);
      }

      .ahg-card::before{
        content:"";
        position:absolute;
        inset:0 0 auto 0;
        height:1px;
        background:linear-gradient(90deg, transparent, rgba(120,180,255,.26), transparent);
        pointer-events:none;
      }

      .ahg-pad{
        padding:14px;
      }

      .ahg-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }

      .ahg-kicker{
        font-size:11px;
        font-weight:900;
        letter-spacing:.12em;
        text-transform:uppercase;
        color:#9fb6d9;
      }

      .ahg-sub{
        margin-top:4px;
        font-size:11px;
        color:rgba(220,230,255,.56);
      }

      .ahg-tag{
        flex:0 0 auto;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        border:1px solid rgba(110,174,255,.20);
        background:linear-gradient(180deg, rgba(44,81,126,.34), rgba(21,38,64,.28));
        color:#dcebff;
        font-size:12px;
        font-weight:900;
        display:inline-flex;
        align-items:center;
      }

      .ahg-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
      }

      .ahg-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:rgba(255,255,255,.03);
      }

      .ahg-row span{
        flex:1 1 auto;
        font-size:12px;
        color:#c7d7f2;
      }

      .ahg-row b{
        flex:0 1 58%;
        font-size:13px;
        line-height:1.35;
        color:#f3f7ff;
        text-align:right;
        overflow-wrap:anywhere;
      }

      .ahg-move{
        margin-top:10px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,214,140,.16);
        background:linear-gradient(180deg, rgba(82,60,24,.28), rgba(42,30,10,.20));
        color:#ffe7b6;
        font-size:12px;
        line-height:1.4;
      }

      .ahs-goal-head{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }

      .ahs-goal-kicker{
        font-size:12px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:#9fb6d9;
      }

      .ahs-goal-sub{
        margin-top:4px;
        font-size:11px;
        color:rgba(220,230,255,.58);
      }

      .ahs-goal-tag{
        flex:0 0 auto;
        min-height:28px;
        padding:0 10px;
        border-radius:999px;
        border:1px solid rgba(110,174,255,.20);
        background:linear-gradient(180deg, rgba(44,81,126,.34), rgba(21,38,64,.28));
        color:#dcebff;
        font-size:12px;
        font-weight:900;
        display:inline-flex;
        align-items:center;
      }

      .ahs-goal-grid{
        display:grid;
        grid-template-columns:1fr;
        gap:8px;
      }

      .ahs-goal-row{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:12px;
        padding:10px 12px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:12px;
        background:rgba(255,255,255,.03);
      }

      .ahs-goal-row span{
        flex:1 1 auto;
        font-size:12px;
        color:#c7d7f2;
      }

      .ahs-goal-row b{
        flex:0 1 58%;
        font-size:13px;
        color:#f3f7ff;
        text-align:right;
        line-height:1.35;
        overflow-wrap:anywhere;
      }

      .ahs-goal-wall{
        margin-top:10px;
        border:1px solid rgba(255,255,255,.08);
        border-radius:14px;
        background:rgba(255,255,255,.03);
        padding:12px;
      }

      .ahs-goal-wall-title{
        font-size:12px;
        font-weight:900;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:#dcebff;
        margin-bottom:8px;
      }

      .ahs-goal-empty{
        font-size:12px;
        color:rgba(220,230,255,.58);
      }

      .ahs-moonlab-head{
        font-size:15px;
        font-weight:900;
        color:#f3f7ff;
        margin-bottom:8px;
        line-height:1.25;
      }

      .ahs-moonlab-meta{
        font-size:12px;
        color:#c7d7f2;
        line-height:1.4;
        margin-bottom:10px;
      }

      .ahs-moonlab-section{
        margin-top:10px;
        font-size:11px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:#9fb6d9;
      }

      .ahs-moonlab-copy{
        margin-top:6px;
        font-size:12px;
        color:rgba(220,230,255,.72);
        line-height:1.4;
      }

      .ahs-goal-move{
        margin-top:10px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,214,140,.16);
        background:linear-gradient(180deg, rgba(82,60,24,.28), rgba(42,30,10,.20));
        color:#ffe7b6;
        font-size:12px;
        line-height:1.4;
      }

      .ahs-error{
        padding:14px;
      }

      @media (min-width: 430px){
        .ahs-grid-3{
          grid-template-columns:repeat(3, 1fr);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderError(msg){
    ensureStyles();
    const root = qs("statsRoot");
    if (!root) return;
    root.innerHTML = `
      <div class="ahs-wrap">
        <div class="ahs-card">
          <div class="ahs-error">
            <div class="ahs-section-title">Stats</div>
            <div class="ahs-empty">${esc(msg || "Failed to load stats.")}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderBarBlock(label, cur, max, cls, percent, foot){
    return `
      <div class="ahs-mini">
        <div class="ahs-mini-top">
          <div class="ahs-mini-label">${esc(label)}</div>
          <div class="ahs-mini-value">${esc(cur)} / ${esc(max)}</div>
        </div>
        <div class="ahs-bar">
          <div class="ahs-bar-fill ${cls}" style="width:${percent.toFixed(1)}%"></div>
        </div>
        <div class="ahs-mini-foot">${foot}</div>
      </div>
    `;
  }

  function renderHubGoalLoading(msg){
    const root = qs("hubGoalRoot");
    if (!root) return;
    root.innerHTML = `
      <div class="ahg-card">
        <div class="ahg-pad">
          <div class="ahg-kicker">Next Alpha Goal</div>
          <div class="ahg-sub">${esc(msg || "Loading your next objective...")}</div>
        </div>
      </div>
    `;
  }

  function renderHubGoalCard(stats, extras){
    const root = qs("hubGoalRoot");
    if (!root || !stats) return;

    const goal = buildGoalState(stats, extras);
    const ctx = getMoonlabWallContext(stats, extras, goal);
    const wall = ctx.wall || { available: false };
    const hubBestMove = resolveHubBestMove(ctx);
    const statusLabel = formatMoonlabStatus(wall, ctx.signalPower);
    const moonlabWallLabel = wall.available ? toText(wall.bossName, "Unknown") : "Syncing…";
    const floorLabel = wall.available
      ? `${Math.max(1, n(wall.currentFloor, 1))} / ${Math.max(1, n(wall.maxFloor, 30))}`
      : "—";
    const missingPower = Math.max(0, n(ctx.missingPower, 0));
    const unlockName = toText(ctx.nextUnlockLabel, "Next threshold");
    const nextSignalUnlock = missingPower > 0
      ? `+${missingPower} · ${unlockName}`
      : unlockName;

    root.innerHTML = `
      <div class="ahg-card">
        <div class="ahg-pad">
          <div class="ahg-head">
            <div>
              <div class="ahg-kicker">Next Alpha Goal</div>
              <div class="ahg-sub">Signal path and MoonLab wall preview.</div>
            </div>
            <div class="ahg-tag">Signal ${esc(ctx.signalPower)}</div>
          </div>

          <div class="ahg-grid">
            <div class="ahg-row"><span>Signal Power</span><b>${esc(ctx.signalPower)}</b></div>
            <div class="ahg-row"><span>MoonLab Wall</span><b>${esc(moonlabWallLabel)}</b></div>
            <div class="ahg-row"><span>Floor</span><b>${esc(floorLabel)}</b></div>
            <div class="ahg-row"><span>Status</span><b>${esc(statusLabel)}</b></div>
            <div class="ahg-row"><span>Next Signal Unlock</span><b>${esc(nextSignalUnlock)}</b></div>
          </div>

          <div class="ahg-move"><b>Best Move:</b> ${esc(hubBestMove)}</div>
        </div>
      </div>
    `;
  }

  function renderMoonlabBossWallCard(stats, extras){
    const goal = buildGoalState(stats, extras);
    const ctx = getMoonlabWallContext(stats, extras, goal);
    const wall = ctx.wall || { available: false };

    if (!wall.available) {
      return `
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-goal-wall">
              <div class="ahs-goal-wall-title">MoonLab Boss Wall</div>
              <div class="ahs-goal-empty">MoonLab wall syncing…</div>
              <div class="ahs-goal-empty" style="margin-top:6px">Progression data is not available yet.</div>
            </div>
          </div>
        </div>
      `;
    }

    const bossName = toText(wall.bossName, "Unknown");
    const floor = Math.max(1, n(wall.currentFloor, 1));
    const maxFloor = Math.max(floor, n(wall.maxFloor, 30));
    const sector = Math.max(1, n(wall.sector, 1));
    const sectorFloor = Math.max(1, n(wall.sectorFloor, 1));
    const bossPower = Math.max(0, n(wall.bossPower, 0));
    const bossDanger = Math.max(0, n(wall.bossDanger, 0));
    const statusLabel = formatMoonlabStatus(wall, ctx.signalPower);
    const highestCleared = Math.max(0, n(wall.highestClearedFloor ?? wall.bestFloor, 0));
    const recommended = resolveStatsMoonlabRecommended(ctx);

    return `
      <div class="ahs-card">
        <div class="ahs-pad">
          <div class="ahs-goal-wall">
            <div class="ahs-goal-wall-title">MoonLab Boss Wall</div>
            <div class="ahs-moonlab-head">${esc(bossName)}</div>
            <div class="ahs-moonlab-meta">
              Floor ${esc(floor)} / ${esc(maxFloor)} · Sector ${esc(sector)} · Chamber ${esc(sectorFloor)}<br>
              Boss Power ${esc(bossPower)} · Danger ${esc(bossDanger)}<br>
              Status: ${esc(statusLabel)}
            </div>
            <div class="ahs-moonlab-section">Progress</div>
            <div class="ahs-breakdown" style="margin-top:6px">
              <div class="ahs-breakdown-row"><span>Highest Cleared</span><b>${esc(highestCleared)}</b></div>
              <div class="ahs-breakdown-row"><span>Current Chamber</span><b>${esc(floor)}</b></div>
            </div>
            <div class="ahs-moonlab-section">Recommended</div>
            <div class="ahs-moonlab-copy">${esc(recommended)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSignalBreakdownCard(stats, extras){
    const breakdown = getSignalBreakdown(stats, extras);
    return `
      <div class="ahs-card">
        <div class="ahs-pad">
          <div class="ahs-section-title">Signal Power Breakdown</div>
          <div class="ahs-breakdown">
            <div class="ahs-breakdown-row"><span>Level</span><b>+${esc(breakdown.levelPower)}</b></div>
            <div class="ahs-breakdown-row"><span>Badges</span><b>+${esc(breakdown.badgePower)}</b></div>
            <div class="ahs-breakdown-row"><span>Active Pet</span><b>+${esc(breakdown.petPower)}</b></div>
            <div class="ahs-breakdown-row"><span>Total</span><b>${esc(breakdown.signalPower)}</b></div>
          </div>
        </div>
      </div>
    `;
  }

  function render(stats, mystats, extras = _progressionExtras){
    ensureStyles();

    _lastStats = stats || null;
    _lastMystats = mystats || null;

    const root = qs("statsRoot");
    if (!root) return;

    const t = (stats && typeof stats.totals === "object") ? stats.totals : {};
    const base = (stats && typeof stats.base === "object") ? stats.base : {};
    const petS = (stats && typeof stats.petStats === "object") ? stats.petStats : {};
    const gear = (stats && typeof stats.gear === "object") ? stats.gear : {};
    const hp = (stats && typeof stats.hp === "object") ? stats.hp : {};
    const xp = (stats && typeof stats.xp === "object") ? stats.xp : {};
    const pet = (stats && typeof stats.pet === "object") ? stats.pet : {};
    const rawSets = Array.isArray(stats?.sets) ? stats.sets : [];
    const sets = rawSets.map(normalizeSet);
    const unspent = mystats && mystats.unspentPoints != null ? n(mystats.unspentPoints, 0) : 0;

    const hpCur = n(hp?.current, n(stats?.hpCur, 0));
    const hpMax = n(hp?.max, n(stats?.hpMax, 0));
    const xpCur = n(xp?.current_in_level, n(stats?.xpCur, 0));
    const xpNeed = n(xp?.needed_for_next_level, n(stats?.xpNeed, 0));
    const level = n(stats?.level, 1);

    const petName = String(pet?.name || "None");
    const petLevel = n(pet?.level, 0);
    const petXpCur = n(pet?.current, n(pet?.xpCur, 0));
    const petXpNeed = n(pet?.max, n(pet?.xpNeed, 0));
    const petLabel = String(pet?.label || `${petName}${petName !== "None" ? ` - lvl ${petLevel}` : ""}`).trim();

    const hpPct = clampPct(hp?.pct ?? stats?.hpPct);
    const xpPct = clampPct(xp?.pct ?? stats?.xpPct);
    const petXpPct = clampPct(pet?.pct ?? stats?.petPct);

    const statKeys = ["strength","agility","defense","vitality","intelligence","luck"];

    const canSpend = unspent > 0;

    const statCards = statKeys.map((k) => {
      const total = n(t[k], 0);
      const b = n(base[k], 0);
      const p = n(petS[k], 0);
      const g = n(gear[k], 0);

      return `
        <div class="ahs-stat" data-stat-key="${esc(k)}">
          <div class="ahs-stat-head">
            <div>
              <div class="ahs-stat-code">${esc(statLabel(k))}</div>
              <div class="ahs-stat-name">${esc(statFullName(k))}</div>
            </div>

            <div class="ahs-stat-right">
              <div class="ahs-stat-total">${esc(total)}</div>
              <button
                type="button"
                class="ahs-plus"
                data-stat="${esc(k)}"
                ${canSpend ? "" : "disabled"}
                title="${canSpend ? `Add 1 ${statFullName(k)}` : "No unspent points"}"
              >+</button>
            </div>
          </div>

          <div class="ahs-stat-break">
            <div class="ahs-chip">
              <span class="ahs-chip-label">Base</span>
              <span class="ahs-chip-value">${esc(b)}</span>
            </div>
            <div class="ahs-chip">
              <span class="ahs-chip-label">Pet</span>
              <span class="ahs-chip-value">${esc(p)}</span>
            </div>
            <div class="ahs-chip">
              <span class="ahs-chip-label">Gear</span>
              <span class="ahs-chip-value">${esc(g)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");

    const gearRows = statKeys
      .map((k) => ({ key:k, val:n(gear[k], 0) }))
      .filter((x) => x.val !== 0)
      .sort((a, b) => Math.abs(b.val) - Math.abs(a.val))
      .map((x) => `
        <div class="ahs-row">
          <div class="ahs-row-left">
            <div class="ahs-row-title">${esc(statLabel(x.key))}</div>
            <div class="ahs-row-sub">${esc(statFullName(x.key))}</div>
          </div>
          <div class="ahs-row-value">+${esc(x.val)}</div>
        </div>
      `)
      .join("");

    const gearHtml = gearRows
      ? `
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Equipment Bonuses</div>
            <div class="ahs-list">${gearRows}</div>
          </div>
        </div>
      `
      : "";

    const setsHtml = sets.length
      ? `
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Active Sets</div>
            <div class="ahs-sets">
              ${sets.map((s) => {
                const bonus = s.bonus || {};
                const bonusLines = Object.keys(bonus)
                  .filter((k) => n(bonus[k], 0) !== 0)
                  .map((k) => `<span class="ahs-pill">${esc(statLabel(k))} +${esc(n(bonus[k], 0))}</span>`)
                  .join("");

                const progress = s.totalParts > 0
                  ? `${n(s.count, 0)}/${n(s.totalParts, 0)}`
                  : `${n(s.count, 0)}`;

                return `
                  <div class="ahs-set">
                    <div class="ahs-set-head">
                      <div class="ahs-set-name">${esc(s.name)}</div>
                      <div class="ahs-set-count">${esc(progress)}</div>
                    </div>
                    <div class="ahs-set-bonuses">
                      ${bonusLines || `<div class="ahs-empty">No active bonus</div>`}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      `
      : "";

    root.innerHTML = `
      <div class="ahs-wrap">
        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-hero-top">
              <div class="ahs-title">
                <div class="ahs-title-main">Character Stats</div>
                <div class="ahs-title-sub">Live character totals</div>
              </div>

              <div class="ahs-badges">
                <div class="ahs-badge -level">Lvl ${esc(level)}</div>
                <div class="ahs-badge -unspent">${esc(unspent)} points ready</div>
              </div>
            </div>

            <details style="margin:4px 0 2px 0"><summary style="cursor:pointer;font-size:11px;color:#9fb6d9;outline:none">How stats work (tap)</summary><div style="font-size:11px;color:rgba(220,230,255,.72);margin-top:3px;line-height:1.3">Full details in FAQ → Stats Scheme. STR hits harder • AGI helps dodge • DEF/ VIT for survival • INT pierces • LUCK for crits.</div></details>

            <div class="ahs-grid-3">
              ${renderBarBlock("HP", hpCur, hpMax, "-hp", hpPct, `${hpPct.toFixed(0)}%`)}
              ${renderBarBlock("XP", xpCur, xpNeed, "-xp", xpPct, `${xpPct.toFixed(0)}%`)}
              ${renderBarBlock("Pet", petXpCur, petXpNeed, "-pet", petXpPct, esc(petLabel))}
            </div>

            ${unspent > 0 ? `<div class="ahs-note">${esc(unspent)} stat point${unspent === 1 ? "" : "s"} ready to spend.</div>` : ``}
          </div>
        </div>

        ${renderSignalBreakdownCard(stats, extras)}

        ${renderMoonlabBossWallCard(stats, extras)}

        <div class="ahs-card">
          <div class="ahs-pad">
            <div class="ahs-section-title">Attributes</div>
            <div class="ahs-stats-grid">
              ${statCards}
            </div>
          </div>
        </div>

        ${gearHtml}
        ${setsHtml}
      </div>
    `;
  }
  async function upgradeStat(stat){
    if (_loading) return;

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_apiPost && typeof window.S?.apiPost === "function") _apiPost = window.S.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      renderError("Stats: api not ready.");
      return;
    }

    _loading = true;

    try {
      const res = await _apiPost("/webapp/stats/upgrade", {
        stat,
        run_id: `stat_${stat}_${Date.now()}`
      });

      if (_dbg) console.log("[Stats] upgradeRes =", res);

      const payload = getPayload(res);
      const nextStats = payload?.stats || null;
      const nextMystats = payload?.mystats || null;

      if (!res?.ok || !nextStats) {
        const reason = res?.reason || "Upgrade failed.";
        if (reason === "NO_POINTS") {
          try { _tg?.showAlert?.("No unspent points left."); } catch(_) {}
        } else if (reason === "BAD_STAT") {
          try { _tg?.showAlert?.("Unknown stat."); } catch(_) {}
        } else {
          try { _tg?.showAlert?.(String(reason)); } catch(_) {}
        }
        return;
      }

      render(nextStats, nextMystats, _progressionExtras);
      try { _tg?.HapticFeedback?.impactOccurred?.("medium"); } catch (_) {}
    } catch (e) {
      if (_dbg) console.error("[Stats] upgrade failed", e);
      try { _tg?.showAlert?.("Stat upgrade failed"); } catch (_) {}
    } finally {
      _loading = false;
    }
  }

  async function refreshHubGoal(){
    const root = qs("hubGoalRoot");
    if (!root) return;

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_apiPost && typeof window.S?.apiPost === "function") _apiPost = window.S.apiPost;

    if (_lastStats) renderHubGoalCard(_lastStats, _progressionExtras);
    else renderHubGoalLoading("Loading your next objective...");

    if (typeof _apiPost !== "function") {
      renderHubGoalLoading("Next goal is not ready yet.");
      return;
    }

    const hubGoalSeq = ++_hubGoalSeq;
    const now = Date.now();

    try {
      const statsRes = await _apiPost("/webapp/stats/state", { t: now });
      const stats = getPayload(statsRes);
      if (!stats) {
        if (_lastStats) {
          renderHubGoalCard(_lastStats, _progressionExtras);
        } else {
          renderHubGoalLoading("Next goal is syncing right now.");
        }
        return;
      }

      if (hubGoalSeq !== _hubGoalSeq) return;

      _lastStats = stats;
      renderHubGoalCard(stats, _progressionExtras);

      if (normalizeProgressionV1(stats?.progression_v1)) {
        return;
      }

      const badgesPromise = _apiPost("/webapp/badges/state", { t: now }).catch(() => null);
      const fortressPromise = _apiPost("/webapp/building/state", {
        buildingId: "moonlab_fortress",
        t: now,
      }).catch(() => null);

      Promise.all([badgesPromise, fortressPromise]).then(([badgesRes, fortressRes]) => {
        if (hubGoalSeq !== _hubGoalSeq) return;

        _progressionExtras = {
          badgeCount: normalizeBadgeCount(badgesRes),
          fortress: normalizeFortressState(fortressRes),
        };

        renderHubGoalCard(_lastStats, _progressionExtras);

        const statsBack = qs("statsBack");
        if (statsBack && statsBack.dataset.open === "1" && _lastStats) {
          render(_lastStats, _lastMystats, _progressionExtras);
        }
      }).catch(() => {});
    } catch (_) {
      if (_lastStats) renderHubGoalCard(_lastStats, _progressionExtras);
      else renderHubGoalLoading("Next goal is syncing right now.");
    }
  }
  
  async function load(){
    if (_loading) return;
    _loading = true;
    const loadSeq = ++_loadSeq;

    ensureStyles();

    const root = qs("statsRoot");
    if (root) {
      root.innerHTML = `
        <div class="ahs-wrap">
          <div class="ahs-card">
            <div class="ahs-pad">
              <div class="ahs-section-title">Stats</div>
              <div class="ahs-empty">Loading…</div>
            </div>
          </div>
        </div>
      `;
    }

    if (!_apiPost && typeof window.apiPost === "function") _apiPost = window.apiPost;
    if (!_apiPost && typeof window.S?.apiPost === "function") _apiPost = window.S.apiPost;
    if (!_tg) _tg = window.Telegram?.WebApp || null;

    if (typeof _apiPost !== "function") {
      renderError("Stats: api not ready.");
      _loading = false;
      return;
    }

    try {
      const now = Date.now();

      const [statsRes, myRes] = await Promise.all([
        _apiPost("/webapp/stats/state", { t: now }),
        _apiPost("/webapp/mystats/state", { t: now }).catch(() => null),
      ]);

      if (_dbg) {
        console.log("[Stats] statsRes =", statsRes);
        console.log("[Stats] myRes =", myRes);
      }

      const stats = getPayload(statsRes);
      const mystats = getPayload(myRes);
      _progressionExtras = {
        badgeCount: 0,
        fortress: null,
      };

      if (!stats) {
        const reason = statsRes?.reason || "No data.";
        if (reason === "HTTP_401") {
          renderError("Unauthorized. Reopen the app from Telegram.");
        } else {
          renderError(reason);
        }
        return;
      }

      render(stats, mystats, _progressionExtras);
      try { _tg?.HapticFeedback?.impactOccurred?.("light"); } catch (_) {}

      if (normalizeProgressionV1(stats?.progression_v1)) {
        return;
      }

      const badgesPromise = _apiPost("/webapp/badges/state", { t: now }).catch(() => null);
      badgesPromise.then((badgesRes) => {
        if (_dbg) {
          console.log("[Stats] badgesRes =", badgesRes);
        }

        if (loadSeq !== _loadSeq) return;

        _progressionExtras = {
          badgeCount: normalizeBadgeCount(badgesRes),
          fortress: _progressionExtras?.fortress || null,
        };

        const back = qs("statsBack");
        if (!back || back.dataset.open !== "1") return;
        if (!_lastStats) return;

        render(_lastStats, _lastMystats, _progressionExtras);
      }).catch(() => {});
    } catch (e) {
      if (_dbg) console.error("[Stats] load failed", e);
      renderError("Failed to load stats.");
      try { _tg?.showAlert?.("Stats load failed"); } catch (_) {}
    } finally {
      _loading = false;
    }
  }

  Stats.refresh = load;
  Stats.refreshHubGoal = refreshHubGoal;
  Stats.open = function(){ show(); load(); };
  Stats.close = function(){ hide(); };

  Stats.init = function({ apiPost, tg, dbg } = {}){
    ensureStyles();

    _apiPost = apiPost || _apiPost || window.apiPost || window.S?.apiPost || null;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    if (_inited) return;
    _inited = true;

    bindClickOnce(qs("btnStatsRefresh"), load);
    bindClickOnce(qs("refreshStats"), load);
    bindClickOnce(qs("closeStats"), Stats.close);

    bindClickOnce(qs("statsRoot"), (e) => {
      const btn = e.target.closest(".ahs-plus");
      if (!btn) return;

      e.preventDefault();

      const stat = String(btn.dataset.stat || "").trim().toLowerCase();
      if (!stat) return;

      upgradeStat(stat);
    });

    window.openStats = Stats.open;
    window.closeStats = Stats.close;

    if (qs("hubGoalRoot")) renderHubGoalLoading("Open Hub to see your next objective.");
  };

  window.Stats = Stats;
})();
