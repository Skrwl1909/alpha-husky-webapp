// js/onboarding.js — Alpha Husky WebApp Onboarding v3 (premium & new-player friendly)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  const KEY = "ah_onboarding_v";
  const VERSION = "3"; // bump when you want to show onboarding again to everyone
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

  function log(...a) { if (_dbg) console.log("[Onboarding]", ...a); }

  function getTG() {
    return _tg || window.Telegram?.WebApp || null;
  }

  function getState() {
    return window.PLAYER_STATE || window.STATE || {};
  }

  function getProfile() {
    return window.PROFILE || {};
  }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

  function shouldShow() {
    return lsGet(KEY) !== VERSION;
  }

  function markDone() {
    lsSet(KEY, VERSION);
  }

  // ====================== FACTION NORMALIZER ======================
  function normFactionKey(raw) {
    const k = String(raw || "").toLowerCase().trim();
    if (!k) return "";

    // short codes
    if (["rb", "ew", "pb", "ih"].includes(k)) return k;

    // full names + keywords
    if (k.includes("rogue") || k.includes("byte")) return "rb";
    if (k.includes("echo") || k.includes("wardens")) return "ew";
    if (k.includes("pack") || k.includes("burners")) return "pb";
    if (k.includes("inner") || k.includes("howl")) return "ih";

    return "";
  }

  // ====================== STEP CONFIG ======================
  const STEP_CONFIG = {
    profile: {
      icon: "🆔",
      h: "Claim Your Identity",
      p: "Choose your nickname + look. Your legend starts here.",
      label: "Customize Profile"
    },
    faction: {
      icon: "🏴",
      h: "Choose Your Pack",
      p: "Rogue Byte, Echo Wardens, Pack Burners or Inner Howl — pick your faction.",
      label: "Pick Faction"
    },
    adopt: {
      icon: "🐺",
      h: "Adopt Your Companion",
      p: "Every Alpha needs a companion. Grab your pet now.",
      label: "Adopt Pet"
    },
    feed: {
      icon: "🥩",
      h: "Feed & Grow",
      p: "Use /feed in the Telegram bot to earn XP. Small actions add up.",
      label: "Copy /feed",
      note: "This is a Telegram bot command for now."
    },
    missions: {
      icon: "⚔️",
      h: "Start Your First Hunt",
      p: "Launch a mission and return for XP + loot. Fastest way to level up.",
      label: "Open Missions"
    },
    community: {
      icon: "🔥",
      h: "Join The Pack",
      p: "Co-op runs, Pet Arena battles, and tips from veteran wolves.",
      label: "Open Community",
      cta: true
    }
  };

  // ====================== STATE CHECKS ======================
  function hasProfile() {
    const st = getState();
    const p = st.profile || {};
    const prof = getProfile();
    const nick = String(p.nickname || p.name || prof.nickname || "").trim();
    if (nick && nick.toLowerCase() !== "alpha husky") return true;

    const hero = (document.getElementById("heroName")?.textContent || "").trim();
    return !!(hero && hero.toLowerCase() !== "alpha husky");
  }

  function hasFaction() {
    const st = getState();
    const p = st.profile || {};
    const prof = getProfile();
    const v = p.faction || prof.faction || lsGet("ah_faction") || "";
    return !!normFactionKey(v);
  }

  function hasPet() {
    const st = getState();

    if (st.profile?.active_pet || st.profile?.pet || st.profile?.pet_key) return true;
    if (st.pets?.active || st.pets?.active_key || st.pets?.activePet) return true;
    if (st.pet && (st.pet.key || st.pet.slug || st.pet.name)) return true;

    const petEl = document.getElementById("petLevel");
    if (petEl && (petEl.textContent || "").trim()) return true;

    return false;
  }

  function hasRunMission() {
    const st = getState();
    const m = st.missions || st.mission || st.expeditions || st.user_missions;
    if (!m) return false;

    if (String(m.status || "").toUpperCase() === "RUNNING") return true;
    if (String(m.state || "").toUpperCase() === "ACTIVE") return true;
    if (m.active_mission || m.activeMission || m.running || m.current) return true;

    if (Array.isArray(m)) return m.some(x => String(x?.status || "").toUpperCase() === "RUNNING" || x?.started_ts);

    return false;
  }

  // ====================== ACTIONS ======================
  function openProfile() {
    if (window.Skins?.open) return window.Skins.open();
    document.querySelector(".btn.profile")?.click();
  }

  function openFactionPicker() {
    if (window.Factions?.openPicker) return window.Factions.openPicker();
    if (window.chooseFaction) return window.chooseFaction();
    if (window.Factions?.open) return window.Factions.open({ mode: "select" });
  }

  function openAdopt() {
    if (window.Adopt?.open) return window.Adopt.open();
    document.querySelector(".btn.adopt")?.click();
  }

  function openFeedOrTip() {
    const tg = getTG();
    const cmd = "/feed";

    // copy (best effort)
    try { navigator.clipboard?.writeText?.(cmd); } catch (_) {}

    const msg = `Copied ${cmd}. Paste it in the bot to earn XP.`;
    try { tg?.showAlert ? tg.showAlert(msg) : alert(msg); }
    catch (_) { alert(msg); }
  }

  function openMissions() {
    if (window.Missions?.open) return window.Missions.open();
    document.querySelector('.btn.mission, [data-go="missions"]')?.click();
  }

  function openCommunity() {
    const tg = getTG();
    try {
      if (tg?.openTelegramLink) return tg.openTelegramLink(GROUP_LINK);
      if (tg?.openLink) return tg.openLink(GROUP_LINK);
    } catch (_) {}
    window.open(GROUP_LINK, "_blank");
  }

  // ====================== BUILD STEPS ======================
  function buildSteps() {
    const list = [];

    if (!hasProfile()) list.push({ key: "profile", ...STEP_CONFIG.profile, go: openProfile });
    if (!hasFaction()) list.push({ key: "faction", ...STEP_CONFIG.faction, go: openFactionPicker });
    if (!hasPet()) list.push({ key: "adopt", ...STEP_CONFIG.adopt, go: openAdopt });

    // always show feed tip (command-only for now)
    list.push({ key: "feed", ...STEP_CONFIG.feed, go: openFeedOrTip });

    if (!hasRunMission()) list.push({ key: "missions", ...STEP_CONFIG.missions, go: openMissions });

    // community only at the end (as you requested)
    list.push({ key: "community", ...STEP_CONFIG.community, go: openCommunity });

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
    btnLater.onclick = () => close(false);
    btnBack.onclick = () => { if (idx > 0) { idx--; render(); } };
    btnNext.onclick = () => {
      if (idx < steps.length - 1) { idx++; render(); }
      else close(true);
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

  // ====================== RENDER ======================
  function render() {
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
        try { s.go(); } catch (_) {}
        showToast("Opened for you ✨");

        // re-evaluate steps (smart) after user action
        setTimeout(() => {
          steps = buildSteps();
          if (!steps.length) { close(true); return; }
          if (idx >= steps.length) idx = Math.max(0, steps.length - 1);
          render();
        }, 900);
      };

      btnBack.style.display = idx === 0 ? "none" : "block";
      btnNext.textContent = idx === steps.length - 1 ? "Finish Onboarding" : "Next";
    }, 180);
  }

  function open(force = false) {
    ensureCSS();
    ensureHTML();

    steps = buildSteps();
    if (!steps.length) { markDone(); return; }

    if (!force && !shouldShow()) return;

    backEl.hidden = false;
    backEl.style.display = "flex";
    document.body.classList.add("ob-lock");

    idx = 0;
    render();
    haptic("light");
  }

  function close(done) {
    if (done) markDone();
    if (!backEl) return;

    backEl.style.display = "none";
    document.body.classList.remove("ob-lock");
  }

  function init({ apiPost, tg, dbg } = {}) {
    _apiPost = apiPost || _apiPost;
    _tg = tg || _tg || window.Telegram?.WebApp || null;
    _dbg = !!dbg;

    ensureCSS();
    ensureHTML();

    window.openOnboarding = (force = false) => open(!!force);
    window.maybeOpenOnboarding = () => open(false);
    window.refreshOnboarding = () => { steps = buildSteps(); render(); };

    log("Alpha Husky Onboarding v3 ready 🐺");
  }

  function boot() {
    init({ dbg: !!window.DBG });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.Onboarding = { init, open, close, refresh: () => { steps = buildSteps(); } };
})();
