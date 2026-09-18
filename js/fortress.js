// js/fortress.js
// Alpha Husky - Moon Lab Ladder + autonomous Boss Duel
// Usage: window.Fortress.init({ apiPost, tg, dbg }); then window.Fortress.open();
(function (global) {
  const BID = "moonlab_fortress";
  const BOSS_CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload/v1771238762/bosses";
  const BOSS_FALLBACK = `${BOSS_CLOUD_BASE}/core_custodian.png`;
  const MILESTONE_FLOORS = { 10: 1, 20: 1, 30: 1 };
  const MINI_MILESTONE_FLOORS = { 5: 1, 15: 1, 25: 1 };

  const S = {
    apiPost: null,
    tg: null,
    dbg: (..._args) => {},
  };

  const UI = {
    state: null,
    selectedFloor: null,
    cooldownLeft: 0,
    ready: false,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (t, cls) => {
    const x = document.createElement(t);
    if (cls) x.className = cls;
    return x;
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const setText = (sel, v, root = document) => {
    const n = $(sel, root);
    if (n) n.textContent = String(v);
  };

  function artUrl(file) {
    const base = String(global.MOONLAB_ART_BASE || "images/moonlab").replace(/\/$/, "");
    return `${base}/${file}`;
  }

  function fmtLeft(sec) {
    sec = Math.max(0, sec | 0);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  function toast(msg) {
    const host = document.getElementById("fortress-modal") || document.body;
    let n = host.querySelector(".ml-toast");
    if (!n) {
      n = el("div", "ml-toast");
      host.appendChild(n);
    }
    n.textContent = String(msg || "");
    n.classList.add("is-on");
    clearTimeout(n._t);
    n._t = setTimeout(() => n.classList.remove("is-on"), 2200);
    try {
      S.tg?.showAlert?.(String(msg));
    } catch (_) {}
  }

  const RARE_PLUS_RARITIES = new Set(["rare", "epic", "legendary", "mythic"]);
  function isRarePlusRarity(rarity) {
    return RARE_PLUS_RARITIES.has(String(rarity || "").toLowerCase());
  }

  function formatFirstClearRewardPreview(st) {
    const preview = String(st?.firstClearRewardPreview || "").trim();
    if (preview) return preview;
    const floor = Number(st?.currentFloor || 1) || 1;
    const entry = (st?.firstClearRewards && typeof st.firstClearRewards === "object")
      ? st.firstClearRewards[String(floor)]
      : null;
    if (entry && entry.claimed) return "First Clear: Claimed";
    if (st?.firstClearAvailable) return "First Clear: Rare+ item";
    return "First Clear: Claimed";
  }

  function buildFirstClearPreviewChips(st) {
    const chips = [formatFirstClearRewardPreview(st)];
    const preview = st?.rewardPreview;
    if (preview && Array.isArray(preview.firstClear)) {
      for (const item of preview.firstClear) {
        const text = String(item || "").trim();
        if (!text || chips.includes(text)) continue;
        chips.push(text);
      }
    }
    return chips;
  }

  function rid(prefix = "fortress") {
    try {
      return `${prefix}:${crypto.randomUUID()}`;
    } catch (_) {
      return `${prefix}:${Date.now()}:${Math.floor(Math.random() * 1e6)}`;
    }
  }

  function ensureDamageParticles() {
    if (!global.Combat) global.Combat = {};
    if (typeof global.Combat.createDamageNumber !== "function") {
      global.Combat.createDamageNumber = function (x, y, dmg, crit) {
        const container = global.Combat.container || document.body;
        const span = document.createElement("div");
        span.className = "ml-dmg" + (crit ? " is-crit" : "");
        span.textContent = (crit ? "CRIT " : "") + String(dmg);
        span.style.left = x + "px";
        span.style.top = y + "px";
        container.appendChild(span);
        setTimeout(() => span.remove(), 900);
      };
    }
  }

  function bossUrlFromKeyOrName(keyOrName) {
    const raw = String(keyOrName || "").trim();
    if (!raw) return BOSS_FALLBACK;
    const looksLikeUrl = /^https?:\/\//i.test(raw) || /\/.+\.(png|webp|jpg|jpeg|gif)$/i.test(raw);
    if (looksLikeUrl) return raw;
    const slug = raw.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    return slug ? `${BOSS_CLOUD_BASE}/${slug}.png` : BOSS_FALLBACK;
  }

  function injectFonts() {
    if (document.getElementById("moonlab-fonts")) return;
    const l = document.createElement("link");
    l.id = "moonlab-fonts";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Rajdhani:wght@600;700&display=swap";
    document.head.appendChild(l);
  }

  function injectCss() {
    const prev = document.getElementById("fortress-css");
    if (prev) prev.remove();
    const css = `
:root{
  --ml-bg:#07090d;--ml-elev:#10151c;--ml-panel:rgba(12,16,22,.88);
  --ml-fg:#f3f6fb;--ml-muted:#8b97a8;--ml-faint:#6a7686;
  --ml-line:rgba(243,246,251,.10);--ml-line-strong:rgba(243,246,251,.18);
  --ml-cyan:#7dd3e8;--ml-red:#d36b6b;--ml-amber:#c4a35a;--ml-ok:#7dcea0;
  --ml-r-xs:4px;--ml-r-sm:8px;--ml-r-md:12px;--ml-r-lg:18px;
  --ml-display:"Rajdhani","Segoe UI",system-ui,sans-serif;
  --ml-body:"Barlow","Segoe UI",system-ui,sans-serif;
  --ml-fast:250ms;--ml-quick:150ms;--ml-out:cubic-bezier(.22,1,.36,1);
}
#fortress-modal{position:fixed;inset:0;z-index:9999;display:flex;color:var(--ml-fg);font-family:var(--ml-body);-webkit-font-smoothing:antialiased;overflow:hidden}
#fortress-modal.is-embedded{position:absolute;z-index:2}
#fortress-modal.is-duel{position:fixed!important;inset:0!important;z-index:20000;width:100%;max-width:none;height:100%;background:var(--ml-bg)}
#fortress-modal *{box-sizing:border-box}
#fortress-modal button{font:inherit;color:inherit}
body.ah-moonlab-active{overflow:hidden}
body.ah-moonlab-active #ahBottomNav,
body.ah-moonlab-active .ah-bottomnav,
body.ah-moonlab-active nav.ah-tabbar{display:none!important;pointer-events:none!important;visibility:hidden!important}
#fortress-modal img{outline:1px solid rgba(255,255,255,.08);outline-offset:-1px}
.ml-bg{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(7,9,13,.28) 0%,rgba(7,9,13,.55) 42%,rgba(7,9,13,.92) 100%),
  var(--ml-bg-image, none) center/cover no-repeat, var(--ml-bg);z-index:0}
.ml-app,.ml-duel{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;max-width:430px;height:100%;min-height:0;margin:0 auto;padding:calc(8px + env(safe-area-inset-top,0px)) 12px calc(10px + env(safe-area-inset-bottom,0px))}
#fortress-modal.is-embedded .ml-app{max-width:none;padding-top:8px;padding-bottom:8px}
#fortress-modal.is-duel .ml-duel{max-width:430px;height:100%;padding:calc(8px + env(safe-area-inset-top,0px)) 12px calc(10px + env(safe-area-inset-bottom,0px))}
.ml-top{display:flex;align-items:center;gap:8px;flex:0 0 auto;min-height:48px}
.ml-top-copy{flex:1;min-width:0}
.ml-kicker{font-family:var(--ml-display);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ml-muted);font-weight:700}
.ml-title{font-family:var(--ml-display);font-size:20px;line-height:1.05;font-weight:700;letter-spacing:.02em;text-wrap:balance;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-iconbtn{width:44px;height:44px;border:1px solid var(--ml-line);border-radius:999px;background:rgba(16,21,28,.72);display:grid;place-items:center;cursor:pointer;flex:0 0 auto}
.ml-iconbtn svg{width:18px;height:18px}
.ml-badge{flex:0 0 auto;font-family:var(--ml-display);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:7px 10px;border-radius:999px;border:1px solid var(--ml-line);background:rgba(255,255,255,.05)}
.ml-badge.is-ready{color:#0b1412;background:var(--ml-ok);border-color:transparent}
.ml-badge.is-cool{color:var(--ml-cyan);background:rgba(125,211,232,.12);border-color:rgba(125,211,232,.28)}
.ml-stage{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:92px minmax(0,1fr);gap:10px;margin-top:8px}
.ml-tower{display:flex;flex-direction:column;gap:4px;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-right:2px}
.ml-floor{position:relative;flex:1 1 0;min-height:34px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:4px;padding:0 8px;border-radius:var(--ml-r-sm);background:rgba(10,14,20,.72);border:1px solid var(--ml-line);color:var(--ml-muted);font-family:var(--ml-display);font-weight:700;font-size:12px;letter-spacing:.04em;cursor:pointer;appearance:none;-webkit-appearance:none;text-align:left}
.ml-floor b{font-size:13px;color:var(--ml-fg)}
.ml-floor.is-cleared{color:var(--ml-ok);border-color:rgba(125,206,160,.22)}
.ml-floor.is-current{color:#1a1408;background:linear-gradient(180deg,#d4b36a,#b68a3e);border-color:transparent;box-shadow:0 0 0 1px rgba(196,163,90,.45)}
.ml-floor.is-current b{color:#1a1408}
.ml-floor.is-locked{opacity:.55}
.ml-floor.is-boss:not(.is-current){border-color:rgba(211,107,107,.38)}
.ml-floor.is-selected:not(.is-current){outline:1px solid rgba(125,211,232,.55);outline-offset:0;box-shadow:0 0 0 1px rgba(125,211,232,.2);opacity:1}
.ml-floor.is-next{opacity:.78}
.ml-floor-mark{font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.ml-focus{min-width:0;min-height:0;display:flex;flex-direction:column;border-radius:var(--ml-r-lg);background:var(--ml-panel);border:1px solid var(--ml-line);box-shadow:0 0 0 1px rgba(255,255,255,.04);overflow:hidden}
.ml-focus-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:10px 12px 8px}
.ml-floor-kicker{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ml-muted);font-weight:600}
.ml-floor-num{font-family:var(--ml-display);font-size:28px;line-height:1;font-weight:700;letter-spacing:.04em}
.ml-floor-name{margin-top:4px;font-size:13px;font-weight:600;color:var(--ml-fg);line-height:1.2}
.ml-wall-name{margin-top:2px;font-size:11px;color:var(--ml-cyan);letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-tags{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.ml-tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;border:1px solid var(--ml-line);background:rgba(255,255,255,.04);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--ml-muted);white-space:nowrap}
.ml-tag.is-boss{color:#f3d0d0;border-color:rgba(211,107,107,.4)}
.ml-tag.is-now{color:#1a1408;background:var(--ml-amber);border-color:transparent}
.ml-tag.is-ok{color:var(--ml-ok);border-color:rgba(125,206,160,.32)}
.ml-tag.is-lock{color:var(--ml-faint)}
.ml-art{position:relative;flex:1 1 auto;min-height:132px;margin:0 10px;border-radius:var(--ml-r-md);overflow:hidden;background:#0a0e14;border:1px solid var(--ml-line)}
.ml-art img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 40%}
.ml-art-fade{position:absolute;inset:auto 0 0 0;height:44%;background:linear-gradient(180deg,transparent,rgba(8,11,16,.92))}
.ml-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:8px 10px 0}
.ml-stat{padding:7px 8px;border-radius:var(--ml-r-sm);background:rgba(255,255,255,.04);border:1px solid var(--ml-line);min-width:0}
.ml-stat span{display:block;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--ml-faint);font-weight:600}
.ml-stat b{display:block;margin-top:2px;font-family:var(--ml-display);font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-rewards{display:flex;flex-wrap:wrap;gap:6px;padding:8px 10px 0}
.ml-chip{display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--ml-line);font-size:11px;font-weight:600;color:var(--ml-fg)}
.ml-chip.is-muted{color:var(--ml-muted)}
.ml-last{margin:8px 10px 0;padding:8px 10px;border-radius:var(--ml-r-sm);background:rgba(255,255,255,.03);border:1px solid var(--ml-line);font-size:12px;color:var(--ml-muted);line-height:1.35}
.ml-last b{color:var(--ml-fg);font-weight:600}
.ml-dock{flex:0 0 auto;margin-top:8px;display:grid;gap:8px}
.ml-dock-note{font-size:12px;color:var(--ml-muted);line-height:1.35;min-height:16px}
.ml-dock-row{display:grid;grid-template-columns:minmax(88px,1fr) 2.2fr;gap:8px}
.ml-btn{min-height:48px;padding:0 14px;border-radius:var(--ml-r-md);border:1px solid var(--ml-line);background:rgba(16,21,28,.8);color:var(--ml-fg);font-family:var(--ml-display);font-size:15px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
.ml-btn.ghost{color:var(--ml-muted)}
.ml-btn.primary{background:linear-gradient(180deg,#d4b36a,#b68a3e);color:#1a1408;border-color:transparent}
.ml-btn.danger{background:rgba(211,107,107,.14);border-color:rgba(211,107,107,.35);color:#f3d0d0}
.ml-btn[disabled]{opacity:.5;cursor:not-allowed}
.ml-btn:not(:disabled):active{transform:scale(.98)}
.ml-toast{position:absolute;left:50%;bottom:86px;transform:translateX(-50%) translateY(8px);opacity:0;pointer-events:none;z-index:5;padding:8px 12px;border-radius:999px;background:rgba(10,14,20,.92);border:1px solid var(--ml-line);font-size:12px;font-weight:600;transition:opacity var(--ml-quick) var(--ml-out),transform var(--ml-quick) var(--ml-out)}
.ml-toast.is-on{opacity:1;transform:translateX(-50%) translateY(0)}

.ml-duel{position:relative;min-height:0;overflow:hidden;padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))}
.ml-boss-plate,.ml-you-plate{flex:0 0 auto;display:grid;gap:6px}
.ml-who{display:flex;align-items:center;justify-content:space-between;gap:8px}
.ml-who h2{margin:0;font-family:var(--ml-display);font-size:16px;font-weight:700;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-who small{color:var(--ml-muted);font-size:11px;letter-spacing:.08em;text-transform:uppercase}
.ml-hp{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.ml-hp-track{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.ml-hp-fill{display:block;height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#67e8f9,#7dcea0);transition:width var(--ml-quick) var(--ml-out)}
.ml-hp-fill.is-boss{background:linear-gradient(90deg,#d36b6b,#e3a26a)}
.ml-hp-num{font-family:var(--ml-display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;color:var(--ml-fg)}
.ml-arena{position:relative;flex:1 1 auto;min-height:148px;margin:8px 0;border-radius:var(--ml-r-lg);overflow:hidden;border:1px solid var(--ml-line);background:#07090d}
.ml-arena-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.9) brightness(.78)}
.ml-arena-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,9,13,.18),rgba(7,9,13,.08) 40%,rgba(7,9,13,.55))}
.ml-fighter{position:absolute;bottom:0;height:90%;width:50%;object-fit:contain;object-position:bottom center;filter:drop-shadow(0 18px 28px rgba(0,0,0,.7));transition:transform 180ms var(--ml-out),filter 180ms var(--ml-out);outline:none}
.ml-fighter.is-you{left:0}
.ml-fighter.is-boss{right:0}
.ml-fighter.is-hit{filter:drop-shadow(0 18px 24px rgba(0,0,0,.55)) brightness(1.35)}
.ml-fighter.is-you.is-hit{transform:translate3d(-6px,2px,0)}
.ml-fighter.is-boss.is-hit{transform:translate3d(8px,-2px,0)}
.ml-you-plate{display:grid;grid-template-columns:44px 1fr;gap:8px;align-items:center;padding:8px;border-radius:var(--ml-r-md);background:rgba(12,16,22,.78);border:1px solid var(--ml-line)}
.ml-you-plate img{width:44px;height:44px;border-radius:999px;object-fit:cover}
.ml-auto{display:grid;grid-template-columns:minmax(0,1fr) 88px;align-items:center;gap:8px;margin-top:8px;flex:0 0 auto}
.ml-btn.ghost#fb-skip{min-height:44px;padding:0 10px;font-size:13px}
.ml-live{flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--ml-r-md);background:rgba(12,16,22,.78);border:1px solid var(--ml-line)}
.ml-live-dot{width:7px;height:7px;border-radius:99px;background:var(--ml-red);box-shadow:0 0 0 4px rgba(211,107,107,.15)}
.ml-live b{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--ml-cyan)}
.ml-live span{flex:1;min-width:0;font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ml-log{display:flex;flex-direction:column;gap:2px;flex:0 0 clamp(70px,14vh,105px);height:clamp(70px,14vh,105px);margin-top:6px;padding:6px 8px;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;border-radius:var(--ml-r-md);background:rgba(12,16,22,.78);border:1px solid var(--ml-line)}
.ml-log-row{display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px;align-items:baseline;font-size:11px;line-height:1.35;color:var(--ml-muted)}
.ml-log-row i{font-style:normal;font-family:var(--ml-display);font-size:10px;font-variant-numeric:tabular-nums;color:var(--ml-faint)}
.ml-log-row.is-alpha{color:var(--ml-fg)}
.ml-log-row.is-boss{color:#c9d3df}
.ml-log-row.is-crit{color:var(--ml-amber)}
.ml-log-row.is-dodge{color:var(--ml-cyan)}
.ml-result{position:absolute;inset:0;z-index:8;display:none;align-items:flex-end;background:linear-gradient(180deg,rgba(7,9,13,.2),rgba(7,9,13,.88) 55%,rgba(7,9,13,.96))}
.ml-result.is-on{display:flex}
.ml-result-card{width:100%;padding:16px 12px calc(12px + env(safe-area-inset-bottom,0px));display:grid;gap:10px}
.ml-result-kicker{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ml-muted);font-weight:700}
.ml-result-title{font-family:var(--ml-display);font-size:42px;line-height:0.9;letter-spacing:.06em}
.ml-result.is-win .ml-result-title{color:var(--ml-ok)}
.ml-result.is-loss .ml-result-title{color:var(--ml-red)}
.ml-result-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--ml-muted)}
.ml-result-row b{color:var(--ml-fg);text-align:right}
.ml-result-actions{display:grid;grid-template-columns:1fr 1.4fr;gap:8px;margin-top:4px}
.ml-dmg{position:absolute;z-index:6;font-family:var(--ml-display);font-weight:700;font-size:20px;color:#e8f6ff;text-shadow:0 2px 8px #000;pointer-events:none;animation:mlFloat 900ms var(--ml-out) forwards}
.ml-dmg.is-crit{color:#ffd7a1;font-size:22px}
@keyframes mlFloat{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-36px)}}
@media (prefers-reduced-motion:reduce){
  .ml-btn:not(:disabled):active,.ml-fighter,.ml-hp-fill,.ml-toast{transition:none}
  .ml-dmg{animation:none}
}
@media (max-width:360px){
  .ml-title{font-size:17px}
  .ml-floor-num{font-size:24px}
  .ml-stage{grid-template-columns:78px minmax(0,1fr);gap:8px}
  .ml-meta{grid-template-columns:repeat(3,minmax(0,1fr))}
}
@media (max-height:700px){
  .ml-art{min-height:88px}
  .ml-floor-num{font-size:22px}
  .ml-result-title{font-size:34px}
  .ml-arena{min-height:128px}
  .ml-log{flex-basis:clamp(64px,12vh,84px);height:clamp(64px,12vh,84px)}
}
@media (max-height:600px){
  .ml-arena{min-height:96px;margin:6px 0}
  .ml-log{flex-basis:70px;height:70px}
  .ml-you-plate{padding:6px}
  .ml-auto{margin-top:6px}
  .ml-art{min-height:72px}
}
`;
    const s = el("style");
    s.id = "fortress-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  let _ticker = null;
  function stopTicker() {
    if (_ticker) {
      clearInterval(_ticker);
      _ticker = null;
    }
  }

  function setMoonlabActive(on) {
    try {
      document.body.classList.toggle("ah-moonlab-active", !!on);
    } catch (_) {}
  }

  function closeModal() {
    stopTicker();
    try { globalThis.__FORTRESS_PIXI_CLEANUP__?.(); } catch (_) {}
    try { globalThis.__FORTRESS_PIXI_CLEANUP__ = null; } catch (_) {}
    const m = document.getElementById("fortress-modal");
    if (m) m.remove();
    setMoonlabActive(false);
    try { S.tg?.MainButton?.show?.(); } catch (_) {}
  }

  async function defaultApiPost(path, payload) {
    const base = global.API_BASE || "";
    const initData = (global.Telegram && global.Telegram.WebApp && global.Telegram.WebApp.initData) || "";
    const r = await fetch(base + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + initData,
      },
      body: JSON.stringify(payload || {}),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = new Error(j?.reason || "HTTP " + r.status);
      err.response = { status: r.status, data: j };
      throw err;
    }
    return j;
  }

  function ensureDeps() {
    if (!S.apiPost) S.apiPost = defaultApiPost;
    if (!S.tg) S.tg = global.Telegram?.WebApp || null;
    if (!S.dbg) S.dbg = (..._args) => {};
  }

  function normalizeFortressPayload(raw) {
    if (!raw) return null;
    const t = raw && raw.ok !== undefined && raw.data ? raw.data : raw;
    const stepsIn = Array.isArray(t.steps) ? t.steps : [];
    const steps = stepsIn.map((s) => {
      const att = s.actor || s.att || s.who;
      const actor = att === "you" || att === "player" || att === "P" ? "you" : "boss";
      const pRaw = s.p_hp ?? s.php ?? s.pHp ?? s.playerHp;
      const bRaw = s.b_hp ?? s.bhp ?? s.bHp ?? s.enemyHp ?? s.ehp ?? s.eHp;
      return {
        actor,
        dmg: Number(s.dmg ?? s.damage) || 0,
        crit: !!(s.crit ?? s.isCrit),
        dodge: !!(s.dodge ?? s.isDodge ?? s.dodged),
        p_hp: pRaw == null || pRaw === "" ? undefined : Number(pRaw),
        b_hp: bRaw == null || bRaw === "" ? undefined : Number(bRaw),
      };
    });
    const bossLabel = String(t?.boss?.name || t?.bossName || "Boss");
    const bossSprite = t?.boss?.sprite || t?.bossSprite || null;
    const canonBossWall = t?.canonBossWall || t?.bossWallContext || t?.moonlabBossWall || null;
    const currentEncounter = t?.currentEncounter || t?.boss || null;
    const level = Number(t.floorCleared ?? t.floorAttempted ?? t.level ?? 1) || 1;
    const res = String(t.result || "").toUpperCase();
    const winner = res === "VICTORY" ? "you" : res === "DEFEAT" ? "boss" : (t.winner || "boss");
    const bossHpMax = Number(t?.boss?.hpMax ?? t.enemyHpMax ?? t.stats?.enemyHpMax) || 1;
    const playerHpMax = Number(t?.player?.hpMax ?? t.playerHpMax ?? t.stats?.playerHpMax) || 1;
    const matsSrc = t.rewards || {};
    const firstClear = Array.isArray(t.firstClear)
      ? t.firstClear
      : (Array.isArray(matsSrc.firstClear) ? matsSrc.firstClear : []);
    const firstClearRarePlus = matsSrc.firstClearRarePlus || t.firstClearRarePlus || null;
    const loot = t?.rewards?.loot || t?.loot || t?.gearDrop || null;
    const hasRarePlusGear =
      (firstClearRarePlus && isRarePlusRarity(firstClearRarePlus.rarity)) ||
      (loot && isRarePlusRarity(loot.rarity));
    return {
      mode: "fortress",
      level,
      currentFloor: Number(t.currentFloor ?? t.floorAttempted ?? level) || level,
      sector: Number(t.sector ?? 1) || 1,
      sectorFloor: Number(t.sectorFloor ?? (((Number(t.currentFloor ?? level) || level) - 1) % 10) + 1) || 1,
      isMilestoneBoss: !!t.isMilestoneBoss,
      isMiniMilestone: !!t.isMiniMilestone,
      boss: {
        name: bossLabel,
        hpMax: bossHpMax,
        sprite: bossSprite,
        power: Number(t?.boss?.power || 0) || 0,
        danger: Number(t?.boss?.danger || 0) || 0,
      },
      currentEncounter,
      canonBossWall,
      bossWallContext: canonBossWall,
      player: { hpMax: playerHpMax, avatar: t?.player?.avatar || t?.player?.battleAvatar || t?.playerBattleAvatar },
      steps,
      winner,
      rewards: {
        materials: {
          bones: Number(matsSrc.bones || 0),
          scrap: Number(matsSrc.scrap || 0),
          rune_dust: Number(matsSrc.rune_dust || 0),
          universal_key_shards: Number(matsSrc.universal_key_shards || 0),
        },
        rare: !!hasRarePlusGear,
        firstClear,
        firstClearRarePlus,
        milestone: Array.isArray(matsSrc.milestone) ? matsSrc.milestone : [],
        summary: Array.isArray(matsSrc.summary) ? matsSrc.summary : [],
        loot,
      },
      report: t.fightReport || null,
      next: {
        level: Number(t?.next?.level ?? (winner === "you" ? level + 1 : level)) || level,
        floor: Number(t?.next?.floor ?? t?.next?.level ?? (winner === "you" ? level + 1 : level)) || level,
        nextFloorUnlocked: Number(t?.next?.nextFloorUnlocked || 0) || null,
      },
    };
  }

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (ch) => {
      switch (ch) {
        case "&": return "\u0026amp;";
        case "<": return "\u0026lt;";
        case ">": return "\u0026gt;";
        case '"': return "\u0026quot;";
        default: return "\u0026#39;";
      }
    });
  }

  function asArray(v) {
    return Array.isArray(v) ? v.filter(Boolean) : [];
  }

  function canonBossWallFromState(st) {
    const raw = (st?.canonBossWall && typeof st.canonBossWall === "object")
      ? st.canonBossWall
      : (st?.bossWallContext && typeof st.bossWallContext === "object")
        ? st.bossWallContext
        : (st?.moonlabBossWall && typeof st.moonlabBossWall === "object")
          ? st.moonlabBossWall
          : {};
    const bossId = String(raw.bossId || raw.boss_id || "").trim();
    const displayName = String(raw.displayName || raw.display_name || "").trim();
    const floorRange = (raw.floorRange && typeof raw.floorRange === "object") ? raw.floorRange : (raw.floor_range || {});
    const start = Number(floorRange.start || 0) || 0;
    const end = Number(floorRange.end || 0) || 0;
    const imageUrl = String(raw.imageUrl || raw.image_url || "").trim();
    return {
      available: !!(bossId || displayName),
      bossId,
      displayName: displayName || bossId.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
      tier: String(raw.tier || "").trim(),
      arcName: String(raw.arcName || raw.arc_name || "").trim(),
      floorStart: start,
      floorEnd: end,
      milestoneFloor: Number(raw.milestoneFloor || raw.milestone_floor || 0) || 0,
      requiredSignalPower: Number(raw.requiredSignalPower || raw.required_signal_power || 0) || 0,
      shortLore: String(raw.shortLore || raw.short_lore || "").trim(),
      imageUrl,
      hasFinalAsset: !!(raw.hasFinalAsset || raw.has_final_asset) && !!imageUrl,
    };
  }

  function iconChevron() {
    return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function currentFloorOf(st) {
    return Number.isFinite(+st?.currentFloor) ? +st.currentFloor : 1;
  }

  function bestFloorOf(st) {
    return Number.isFinite(+st?.highestClearedFloor)
      ? +st.highestClearedFloor
      : (Number.isFinite(+st?.bestFloor) ? +st.bestFloor : 0);
  }

  function sectorRange(st) {
    const cur = currentFloorOf(st);
    const sector = Number(st?.sector || Math.ceil(cur / 10) || 1) || 1;
    const start = Number(st?.sectorStart || ((sector - 1) * 10 + 1)) || 1;
    const end = Number(st?.sectorEnd || Math.min(Number(st?.maxFloor || 30) || 30, start + 9)) || start;
    return { sector, start, end };
  }

  function previewFor(st, floor) {
    const list = Array.isArray(st?.floorPreviews) ? st.floorPreviews : [];
    return list.find((p) => Number(p?.floor) === Number(floor)) || null;
  }

  function floorStatusOf(st, floor) {
    const preview = previewFor(st, floor);
    if (preview && preview.status) return String(preview.status).toUpperCase();
    const cur = currentFloorOf(st);
    const best = bestFloorOf(st);
    if (floor === cur) return "CURRENT";
    if (floor < cur && floor <= best) return "CLEARED";
    return "LOCKED";
  }

  function renderTower(st, selectedFloor) {
    const cur = currentFloorOf(st);
    const best = bestFloorOf(st);
    const maxFloor = Number(st.maxFloor || 30) || 30;
    const { start, end } = sectorRange(st);
    const selected = Number(selectedFloor || cur);
    const parts = [];
    for (let f = end; f >= start; f--) {
      if (f > maxFloor) continue;
      const status = floorStatusOf(st, f);
      const current = status === "CURRENT" || f === cur;
      const cleared = status === "CLEARED" || (!current && f < cur && f <= best);
      const locked = !current && !cleared;
      const isNext = locked && f === cur + 1;
      const selectedRow = f === selected;
      const boss = !locked && !!MILESTONE_FLOORS[f];
      const mini = !locked && !!MINI_MILESTONE_FLOORS[f];
      let mark = "LOCK";
      if (current) mark = "NOW";
      else if (cleared) mark = "CLR";
      else if (isNext) mark = "NEXT";
      else if (locked) mark = "LOCK";
      else if (boss) mark = "BOSS";
      else if (mini) mark = "GATE";
      const cls = ["ml-floor"];
      if (current) cls.push("is-current");
      else if (cleared) cls.push("is-cleared");
      else cls.push("is-locked");
      if (isNext) cls.push("is-next");
      if (selectedRow && !current) cls.push("is-selected");
      if (boss) cls.push("is-boss");
      parts.push(
        `<button type="button" class="${cls.join(" ")}" data-floor="${f}" aria-pressed="${selectedRow ? "true" : "false"}"><b>${String(f).padStart(2, "0")}</b><span class="ml-floor-mark">${mark}</span></button>`
      );
    }
    return parts.join("");
  }

  function renderRewardChips(st) {
    const drops = asArray(st.possibleDrops || st.rewardPreview?.possibleDrops);
    const first = buildFirstClearPreviewChips(st);
    const chips = [];
    const seen = new Set();
    for (const item of [...first, ...drops].slice(0, 4)) {
      const text = String(item || "").trim();
      if (!text || seen.has(text)) continue;
      seen.add(text);
      chips.push(`<span class="ml-chip">${esc(text.replace(/^First Clear Reward:\s*/i, "First Clear: "))}</span>`);
    }
    if (!chips.length) chips.push(`<span class="ml-chip is-muted">Bones, scrap, chamber materials</span>`);
    return chips.join("");
  }

  function renderLastFight(report) {
    if (!report || typeof report !== "object") return "";
    const outcome = String(report.outcome || "");
    const boss = String(report.bossName || "Boss");
    const floor = report.floorCleared || report.floorHeld || report.floorAttempted || "";
    if (!outcome) return "";
    return `<b>${esc(outcome)}</b> · ${esc(boss)}${floor ? ` · Floor ${esc(floor)}` : ""}`;
  }

  function mountRoot(opts) {
    const forceBody = !!(opts && opts.forceBody);
    const wrap = el("div");
    wrap.id = "fortress-modal";
    const host = forceBody ? null : document.getElementById("moonlab-host");
    if (host) {
      wrap.classList.add("is-embedded");
      host.innerHTML = "";
      host.appendChild(wrap);
    } else {
      document.body.appendChild(wrap);
    }
    if (forceBody) wrap.classList.add("is-duel");
    setMoonlabActive(true);
    return wrap;
  }

  function returnToCurrentFloor() {
    const st = UI.state;
    if (!st) return;
    UI.selectedFloor = currentFloorOf(st);
    paintFromState();
  }

  function handleMainCta() {
    const st = UI.state;
    if (!st) return;
    const selected = Number(UI.selectedFloor || 0);
    const current = currentFloorOf(st);
    if (selected !== current) {
      returnToCurrentFloor();
      return;
    }
    doStart();
  }

  function open() {
    ensureDeps();
    injectFonts();
    injectCss();
    UI.selectedFloor = null;
    UI.state = null;
    closeModal();

    const wrap = mountRoot();
    wrap.innerHTML = `
      <div class="ml-bg" style="--ml-bg-image:url('${artUrl("tower.jpg")}')"></div>
      <div class="ml-app">
        <header class="ml-top">
          <button class="ml-iconbtn" id="fx-close" type="button" aria-label="Back">${iconChevron()}</button>
          <div class="ml-top-copy">
            <div class="ml-kicker">Moon Lab Ladder</div>
            <div class="ml-title" id="ml-title">Containment Floor</div>
          </div>
          <span class="ml-badge" id="fx-badge">...</span>
        </header>
        <div class="ml-stage">
          <div class="ml-tower" id="ml-tower"></div>
          <section class="ml-focus">
            <div class="ml-focus-head">
              <div>
                <div class="ml-floor-kicker" id="ml-sector">Sector -</div>
                <div class="ml-floor-num" id="ml-floor-num">Floor --</div>
                <div class="ml-floor-name" id="ml-floor-name">—</div>
                <div class="ml-wall-name" id="ml-wall-name"></div>
              </div>
              <div class="ml-tags">
                <span class="ml-tag is-now" id="ml-state">Current</span>
                <span class="ml-tag" id="ml-milestone">Boss</span>
                <span class="ml-tag" id="ml-best">Best -</span>
              </div>
            </div>
            <div class="ml-art">
              <img id="fx-enemy" alt="" src="${artUrl("chamber.jpg")}">
              <div class="ml-art-fade"></div>
            </div>
            <div class="ml-meta">
              <div class="ml-stat"><span>Power</span><b id="ml-power">—</b></div>
              <div class="ml-stat"><span>Cooldown</span><b id="fx-cd">—</b></div>
              <div class="ml-stat"><span>Clear</span><b id="ml-clear">—</b></div>
            </div>
            <div class="ml-rewards" id="ml-rewards"></div>
            <div class="ml-last" id="ml-last"></div>
          </section>
        </div>
        <footer class="ml-dock">
          <div class="ml-dock-note" id="fx-hint"></div>
          <div class="ml-dock-row">
            <button class="ml-btn ghost" id="fx-refresh" type="button">Refresh</button>
            <button class="ml-btn primary" id="fx-start" type="button" disabled>Enter Chamber</button>
          </div>
        </footer>
      </div>
    `;

    try { S.tg?.MainButton?.hide?.(); } catch (_) {}

    wrap.addEventListener("click", (e) => {
      const floorBtn = e.target.closest("[data-floor]");
      if (floorBtn && wrap.querySelector("#ml-tower")?.contains(floorBtn)) {
        const f = Number(floorBtn.getAttribute("data-floor"));
        if (Number.isFinite(f) && f > 0) {
          UI.selectedFloor = f;
          paintFromState();
        }
        return;
      }
      const btn = e.target.closest("button");
      if (!btn) return;
      switch (btn.id) {
        case "fx-x":
        case "fx-close":
          closeModal();
          break;
        case "fx-refresh":
          refresh();
          break;
        case "fx-start":
          handleMainCta();
          break;
      }
    });

    refresh();
  }

  function setBadge(txt, ready) {
    const b = $("#fx-badge");
    if (!b) return;
    b.textContent = txt;
    b.classList.toggle("is-ready", !!ready);
    b.classList.toggle("is-cool", !ready);
  }

  function setEnemyArt(st, wall, opts) {
    const img = $("#fx-enemy");
    if (!img) return;
    const chamber = artUrl("chamber.jpg");
    const fallback = artUrl("boss-fallback.jpg");
    img.alt = "";
    img.onerror = () => {
      img.onerror = () => {
        img.onerror = null;
        img.src = fallback;
      };
      img.src = chamber;
    };
    if (opts && opts.obscured) {
      img.src = chamber;
      return;
    }
    const preferWall = wall?.hasFinalAsset ? wall.imageUrl : "";
    const spriteRaw = preferWall || st.bossSprite || st.sprite || st.boss?.sprite || "";
    const remote = spriteRaw && /^https?:\/\//i.test(String(spriteRaw)) ? String(spriteRaw) : "";
    img.src = chamber;
    if (remote) {
      const probe = new Image();
      probe.onload = () => {
        if (document.getElementById("fx-enemy") === img) img.src = remote;
      };
      probe.src = remote;
    }
  }

  function setStateTag(text, kind) {
    const n = $("#ml-state");
    if (!n) return;
    n.textContent = text;
    n.classList.toggle("is-now", kind === "now");
    n.classList.toggle("is-ok", kind === "ok");
    n.classList.toggle("is-lock", kind === "lock");
  }

  function setStartButton({ disabled, label, primary }) {
    const btn = $("#fx-start");
    if (!btn) return;
    btn.disabled = !!disabled;
    btn.textContent = label;
    btn.classList.toggle("primary", !!primary);
  }

  function paintCurrentFocus(st) {
    const curFloor = currentFloorOf(st);
    const bestFloor = bestFloorOf(st);
    const sector = Number(st.sector ?? 1) || 1;
    const sectorFloor = Number(st.sectorFloor ?? (((curFloor || 1) - 1) % 10) + 1) || 1;
    const bossPower = Number(st.boss?.power || st.boss?.danger || 0) || 0;
    const milestoneText = st.boss?.isMilestoneBoss
      ? "Milestone"
      : st.boss?.isMiniMilestone
        ? "Gate"
        : "Containment";
    const wall = canonBossWallFromState(st);
    const encounterLabel = String(
      st.nextEncounterName || st.bossName || st.boss?.name || `Boss Floor ${curFloor}`
    );
    const ready = !!UI.ready;
    const cd = Math.max(0, UI.cooldownLeft | 0);

    const titleEl = $("#ml-title");
    if (titleEl) titleEl.textContent = wall.available ? wall.displayName : `Moon Lab Floor ${curFloor}`;
    setText("#ml-sector", `Sector ${sector} · Chamber ${sectorFloor}`);
    setText("#ml-floor-num", `Floor ${String(curFloor).padStart(2, "0")}`);
    setText("#ml-floor-name", encounterLabel);
    setText("#ml-wall-name", wall.available ? `${wall.arcName || "Boss Wall"} · ${wall.tier || ""}`.trim() : "");
    setText("#ml-milestone", milestoneText);
    setText("#ml-best", `Best ${Math.max(0, bestFloor)}`);
    setText("#ml-power", bossPower > 0 ? String(bossPower) : "—");
    setText("#fx-cd", ready ? "Ready" : fmtLeft(cd));
    setText("#ml-clear", st.firstClearAvailable ? "First" : "Replay");
    setStateTag(ready ? "Current" : "Cooling", "now");
    setBadge(ready ? "Chamber Ready" : "Cooling", ready);
    setEnemyArt(st, wall, { obscured: false });

    const rewardsEl = $("#ml-rewards");
    if (rewardsEl) rewardsEl.innerHTML = renderRewardChips(st);
    const lastEl = $("#ml-last");
    if (lastEl) {
      const html = renderLastFight(st.lastFightReport || st.lastResult || st.lastBattle?.fightReport || null);
      lastEl.style.display = html ? "" : "none";
      lastEl.innerHTML = html || "";
    }
    const hintEl = $("#fx-hint");
    if (hintEl) {
      hintEl.textContent = cd > 0
        ? (st.cooldownMessage || "Chamber cooling down. Return when the lock releases.")
        : (wall.shortLore || (st.boss?.isMilestoneBoss
          ? "Milestone boss. Break containment and claim the chamber reward."
          : "Boss chamber active. Break containment to unlock the next floor."));
    }
    if (cd > 0) {
      setStartButton({ disabled: true, label: "Cooling Down", primary: true });
    } else {
      setStartButton({
        disabled: !ready,
        label: ready ? "Enter Chamber" : "Return Stronger",
        primary: true,
      });
    }
  }

  function paintClearedFocus(st, preview) {
    const floor = Number(preview?.floor || UI.selectedFloor || 0) || 0;
    const sector = Number(preview?.sector || st.sector || 1) || 1;
    const sectorFloor = Number(preview?.sectorFloor || (((floor || 1) - 1) % 10) + 1) || 1;
    const wall = canonBossWallFromState({ canonBossWall: preview?.canonBossWall });
    const bossName = String(preview?.boss?.name || `Floor ${floor}`);
    const power = Number(preview?.boss?.power || preview?.boss?.danger || 0) || 0;
    const claimed = !!preview?.firstClearRewardClaimed;
    const milestoneText = preview?.isMilestoneBoss
      ? "Milestone"
      : preview?.isMiniMilestone
        ? "Gate"
        : "Containment";
    const titleEl = $("#ml-title");
    if (titleEl) titleEl.textContent = wall.available ? wall.displayName : bossName;
    setText("#ml-sector", `Sector ${sector} · Chamber ${sectorFloor}`);
    setText("#ml-floor-num", `Floor ${String(floor).padStart(2, "0")}`);
    setText("#ml-floor-name", bossName);
    setText("#ml-wall-name", wall.available ? `${wall.arcName || "Boss Wall"} · ${wall.tier || ""}`.trim() : "");
    setText("#ml-milestone", milestoneText);
    setText("#ml-best", "Defeated");
    setText("#ml-power", power > 0 ? String(power) : "—");
    setText("#fx-cd", "—");
    setText("#ml-clear", "Cleared");
    setStateTag("Cleared", "ok");
    setBadge("Cleared", false);
    setEnemyArt({ boss: preview?.boss, bossSprite: preview?.boss?.sprite }, wall, { obscured: false });
    const rewardsEl = $("#ml-rewards");
    if (rewardsEl) {
      rewardsEl.innerHTML = `<span class="ml-chip is-muted">${claimed ? "First Clear: Claimed" : "First Clear: Claimed"}</span>`;
    }
    const lastEl = $("#ml-last");
    if (lastEl) lastEl.style.display = "none";
    const hintEl = $("#fx-hint");
    if (hintEl) hintEl.textContent = "Archived chamber. This opponent has already been defeated.";
    setStartButton({ disabled: false, label: "Return to Current", primary: false });
  }

  function paintLockedFocus(st, floor, isNext) {
    const { sector } = sectorRange(st);
    const sectorFloor = ((floor - 1) % 10) + 1;
    const cur = currentFloorOf(st);
    const titleEl = $("#ml-title");
    if (titleEl) titleEl.textContent = isNext ? "Locked Chamber" : "Unknown Chamber";
    setText("#ml-sector", `Sector ${sector} · Chamber ${sectorFloor}`);
    setText("#ml-floor-num", `Floor ${String(floor).padStart(2, "0")}`);
    setText("#ml-floor-name", isNext ? "Locked Chamber" : "Unknown Chamber");
    setText("#ml-wall-name", "");
    setText("#ml-milestone", "Locked");
    setText("#ml-best", "Locked");
    setText("#ml-power", "—");
    setText("#fx-cd", "Locked");
    setText("#ml-clear", "Locked");
    setStateTag("Locked", "lock");
    setBadge("Locked", false);
    setEnemyArt(st, null, { obscured: true });
    const rewardsEl = $("#ml-rewards");
    if (rewardsEl) rewardsEl.innerHTML = "";
    const lastEl = $("#ml-last");
    if (lastEl) lastEl.style.display = "none";
    const hintEl = $("#fx-hint");
    if (hintEl) {
      hintEl.textContent = isNext
        ? `Clear Floor ${cur} to unlock this chamber.`
        : "Advance through the ladder to reveal this chamber.";
    }
    setStartButton({ disabled: false, label: "Return to Current", primary: false });
  }

  function paintFromState() {
    const st = UI.state;
    if (!st || !document.getElementById("fortress-modal")) return;
    const cur = currentFloorOf(st);
    const { start, end } = sectorRange(st);
    let selected = Number(UI.selectedFloor || cur);
    if (!Number.isFinite(selected) || selected < start || selected > end) {
      selected = cur;
      UI.selectedFloor = cur;
    }
    const towerEl = $("#ml-tower");
    if (towerEl) towerEl.innerHTML = renderTower(st, selected);
    const status = floorStatusOf(st, selected);
    if (status === "CURRENT" || selected === cur) {
      paintCurrentFocus(st);
      return;
    }
    if (status === "CLEARED") {
      paintClearedFocus(st, previewFor(st, selected) || { floor: selected });
      return;
    }
    paintLockedFocus(st, selected, selected === cur + 1);
  }

  async function refresh() {
    ensureDeps();
    stopTicker();
    try {
      let st = await S.apiPost("/webapp/building/state", { buildingId: BID });
      if (st && st.data) st = st.data;
      UI.state = st;

      const cdRaw = (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0) | 0;
      const cd = Math.max(0, cdRaw);
      UI.cooldownLeft = cd;
      UI.ready =
        !!(st.canFight ?? st.canStart ?? st.ready ?? (st.status && String(st.status).toLowerCase() === "ready")) ||
        cd === 0;

      const curFloor = currentFloorOf(st);
      const { start, end } = sectorRange(st);
      if (UI.selectedFloor == null || UI.selectedFloor < start || UI.selectedFloor > end) {
        UI.selectedFloor = curFloor;
      }

      paintFromState();

      if (cd > 0) {
        let left = cd;
        _ticker = setInterval(() => {
          left = Math.max(0, left - 1);
          UI.cooldownLeft = left;
          if (!document.getElementById("fortress-modal")) {
            stopTicker();
            return;
          }
          if (Number(UI.selectedFloor) === currentFloorOf(UI.state || st)) {
            setText("#fx-cd", left > 0 ? fmtLeft(left) : "Ready");
            if (left <= 0) {
              UI.ready = true;
              stopTicker();
              setBadge("Chamber Ready", true);
              setStateTag("Current", "now");
              setStartButton({ disabled: false, label: "Enter Chamber", primary: true });
            }
          } else if (left <= 0) {
            UI.ready = true;
            stopTicker();
          }
        }, 1000);
      }
    } catch (e) {
      const msg = e?.response?.data?.reason || e?.message || "Failed to load Moon Lab state.";
      S.dbg("fortress/state fail", e);
      toast("MoonLab: " + msg);
    }
  }

  async function doStart() {
    ensureDeps();
    const st = UI.state;
    const selected = Number(UI.selectedFloor || 0);
    const current = st ? currentFloorOf(st) : 0;
    if (!st || selected !== current) return;
    if (!UI.ready || UI.cooldownLeft > 0) return;
    const btn = $("#fx-start");
    if (!btn || btn.disabled) return;
    const label = String(btn.textContent || "");
    if (!/enter chamber/i.test(label)) return;
    btn.disabled = true;
    try {
      S.tg?.HapticFeedback?.impactOccurred?.("light");
      const out = await S.apiPost("/webapp/building/start", {
        buildingId: BID,
        run_id: rid("fx"),
      });
      const res = out?.data || out;
      const payload = normalizeFortressPayload(res);
      if (payload && payload.mode === "fortress") {
        closeModal();
        renderFortressBattle(payload);
        return;
      }
      await refresh();
    } catch (e) {
      const reason = e?.response?.data?.reason || e?.data?.reason || e?.message || "Start failed";
      if (/COOLDOWN/i.test(reason)) {
        const left = e?.response?.data?.cooldownLeftSec ?? e?.data?.cooldownLeftSec ?? 60;
        toast(`MoonLab is cooling down. ${fmtLeft(left)} remaining.`);
        await refresh();
      } else if (/LOCKED_REGION|LOCKED/i.test(reason)) {
        toast("Region locked");
      } else {
        console.error(e);
        toast("Something went wrong.");
      }
    } finally {
      btn.disabled = false;
    }
  }

  function cloudThumb(url, size = 256) {
    url = String(url || "").trim();
    if (!url) return "";
    const q = url.indexOf("?");
    if (q >= 0) url = url.slice(0, q);
    if (url.includes("/image/upload/")) {
      const trans = `f_png,w_${size},h_${size},c_fit,q_auto`;
      if (url.includes(`/image/upload/${trans}/`)) return url;
      return url.replace("/image/upload/", `/image/upload/${trans}/`);
    }
    return url;
  }

  function getPlayerBattleAvatarUrl(data) {
    const direct =
      data?.player?.battleAvatar ||
      data?.playerBattleAvatar ||
      data?.player?.avatar ||
      data?.playerAvatar ||
      "";
    if (direct) return cloudThumb(direct, 256);
    const p = window.__PROFILE__ || window.lastProfile || window.profileState || window._profile || null;
    const candidates = [p?.avatarPng, p?.avatar, p?.avatarUrl, p?.profileAvatar, p?.characterPng, p?.character, p?.heroImg, p?.heroPng].filter(Boolean);
    if (candidates[0]) return cloudThumb(candidates[0], 256);
    const img =
      document.querySelector("#hero-frame img, #heroFrame img, img#hero-img, img#profile-avatar, #avatarMain img") ||
      document.querySelector("#equippedRoot img, #equippedModal img");
    if (img?.src) return cloudThumb(img.src, 256);
    const tgPhoto = window.Telegram?.WebApp?.initDataUnsafe?.user?.photo_url;
    if (tgPhoto) return String(tgPhoto);
    return artUrl("alpha-portrait.jpg");
  }

  function renderFortressBattle(data) {
    try { globalThis.__FORTRESS_PIXI_CLEANUP__?.(); } catch (_) {}
    try { globalThis.__FORTRESS_PIXI_CLEANUP__ = null; } catch (_) {}
    injectFonts();
    injectCss();
    ensureDamageParticles();
    closeModal();

    const bossLabelTxt = String(data?.currentEncounter?.name || data?.boss?.name || data?.bossName || "Boss");
    const battleWall = canonBossWallFromState(data);
    const rawBossSprite = data?.boss?.sprite || data?.bossSprite || BOSS_FALLBACK;
    const bossSpriteUrl = bossUrlFromKeyOrName(rawBossSprite);
    const playerAvatarUrl = getPlayerBattleAvatarUrl(data) || artUrl("alpha-portrait.jpg");
    const floorLabel = data.currentFloor ?? data.level ?? data.lvl ?? "?";

    function hpPct(cur, max) {
      const c = Math.max(0, Number(cur) || 0);
      const m = Math.max(1, Number(max) || 1);
      return clamp(Math.round((c / m) * 100), 0, 100);
    }

    const wrap = mountRoot({ forceBody: true });
    wrap.innerHTML = `
      <div class="ml-duel">
        <header class="ml-top">
          <button class="ml-iconbtn" id="fb-x" type="button" aria-label="Back">${iconChevron()}</button>
          <div class="ml-top-copy">
            <div class="ml-kicker">Moon Lab · Floor ${esc(floorLabel)}</div>
            <div class="ml-title">${esc(battleWall.available ? battleWall.displayName : "Boss Duel")}</div>
          </div>
          <span class="ml-badge is-cool" id="fb-live-badge">Auto</span>
        </header>
        <div class="ml-boss-plate">
          <div class="ml-who">
            <h2 id="fb-boss-name">${esc(bossLabelTxt)}</h2>
            <small>${data.isMilestoneBoss ? "Milestone" : data.isMiniMilestone ? "Gate" : "Encounter"}</small>
          </div>
          <div class="ml-hp">
            <div class="ml-hp-track"><i class="ml-hp-fill is-boss" id="fb-boss-hp" style="width:100%"></i></div>
            <div class="ml-hp-num" id="fb-boss-hp-num">${esc(data.boss?.hpMax ?? 0)}/${esc(data.boss?.hpMax ?? 1)}</div>
          </div>
        </div>
        <div class="ml-arena" id="fb-stage">
          <img class="ml-arena-bg" alt="" src="${artUrl("arena.jpg")}">
          <div class="ml-arena-veil"></div>
          <img class="ml-fighter is-you" id="fb-you-img" alt="Alpha" src="${artUrl("alpha.jpg")}">
          <img class="ml-fighter is-boss" id="fb-boss-img" alt="Boss" src="${artUrl("boss-fallback.jpg")}">
        </div>
        <div class="ml-you-plate">
          <img id="fb-you-av" alt="Alpha" src="${esc(playerAvatarUrl)}">
          <div>
            <div class="ml-who"><h2>Alpha</h2><small>Autonomous duel</small></div>
            <div class="ml-hp">
              <div class="ml-hp-track"><i class="ml-hp-fill" id="fb-you-hp" style="width:100%"></i></div>
              <div class="ml-hp-num" id="fb-you-hp-num">${esc(data.player?.hpMax ?? 0)}/${esc(data.player?.hpMax ?? 1)}</div>
            </div>
          </div>
        </div>
        <div class="ml-auto">
          <div class="ml-live">
            <i class="ml-live-dot"></i>
            <b>Auto</b>
            <span id="fb-latest">Duel resolving</span>
          </div>
          <button class="ml-btn ghost" id="fb-skip" type="button">Skip</button>
        </div>
        <div class="ml-log" id="fb-log"></div>
        <div class="ml-result" id="fb-result">
          <div class="ml-result-card">
            <div class="ml-result-kicker" id="fb-result-kicker">Moon Lab</div>
            <div class="ml-result-title" id="fb-result-title">—</div>
            <div id="fb-result-body"></div>
            <div class="ml-result-actions">
              <button class="ml-btn ghost" id="fb-back" type="button">Back</button>
              <button class="ml-btn primary" id="fb-next" type="button">Ascend</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const stageHost = $("#fb-stage", wrap);
    const youImgEl = $("#fb-you-img", wrap);
    const bossImgEl = $("#fb-boss-img", wrap);
    if (bossImgEl && bossSpriteUrl) {
      const probe = new Image();
      probe.onload = () => {
        if (bossImgEl.isConnected) bossImgEl.src = bossSpriteUrl;
      };
      probe.src = bossSpriteUrl;
    }

    let battleTimer = null;
    let skipped = false;
    function stopBattleTimer() {
      if (battleTimer) {
        clearTimeout(battleTimer);
        battleTimer = null;
      }
    }
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__ = () => {
        try { stopBattleTimer(); } catch (_) {}
      };
    } catch (_) {}
    try { S.tg?.MainButton?.hide?.(); } catch (_) {}
    globalThis.Combat.container = stageHost || wrap;

    function leaveBattle() {
      stopBattleTimer();
      closeModal();
    }
    function returnToLadder() {
      stopBattleTimer();
      closeModal();
      open();
    }

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.id === "fb-x" || btn.id === "fb-close" || btn.id === "fb-back") {
        leaveBattle();
        return;
      }
      if (btn.id === "fb-refresh") {
        returnToLadder();
        return;
      }
      if (btn.id === "fb-next") {
        returnToLadder();
        return;
      }
      if (btn.id === "fb-skip") {
        skipped = true;
        stopBattleTimer();
        finishPlayback(true);
      }
    });

    const youHpEl = $("#fb-you-hp", wrap);
    const bossHpEl = $("#fb-boss-hp", wrap);
    const youNumEl = $("#fb-you-hp-num", wrap);
    const bossNumEl = $("#fb-boss-hp-num", wrap);
    const latestEl = $("#fb-latest", wrap);
    const logEl = $("#fb-log", wrap);
    const pMax = Math.max(1, Number(data.player?.hpMax) || 1);
    const bMax = Math.max(1, Number(data.boss?.hpMax) || 1);
    let pHpNow = pMax;
    let bHpNow = bMax;
    let idx = 0;
    let logCount = 0;
    let logPinned = true;

    if (logEl) {
      logEl.addEventListener("scroll", () => {
        const gap = logEl.scrollHeight - logEl.clientHeight - logEl.scrollTop;
        logPinned = gap <= 20;
      }, { passive: true });
    }

    function logLine(actor, dmg, crit, dodge) {
      if (actor === "you") {
        return dodge ? "Alpha missed. Boss dodged." : `Alpha hits for ${dmg}${crit ? " CRIT" : ""}.`;
      }
      return dodge ? "Boss missed. Alpha dodged." : `Boss hits for ${dmg}${crit ? " CRIT" : ""}.`;
    }

    function appendLogRow(actor, dmg, crit, dodge) {
      if (!logEl) return;
      logCount += 1;
      const row = el("div", "ml-log-row");
      row.classList.add(actor === "you" ? "is-alpha" : "is-boss");
      if (dodge) row.classList.add("is-dodge");
      else if (crit) row.classList.add("is-crit");
      const num = el("i");
      num.textContent = String(logCount).padStart(2, "0");
      const span = el("span");
      span.textContent = logLine(actor, dmg, crit, dodge);
      row.appendChild(num);
      row.appendChild(span);
      logEl.appendChild(row);
      if (logPinned) logEl.scrollTop = logEl.scrollHeight;
    }

    function setHp() {
      if (youHpEl) youHpEl.style.width = hpPct(pHpNow, pMax) + "%";
      if (bossHpEl) bossHpEl.style.width = hpPct(bHpNow, bMax) + "%";
      if (youNumEl) youNumEl.textContent = `${Math.max(0, pHpNow | 0)}/${pMax}`;
      if (bossNumEl) bossNumEl.textContent = `${Math.max(0, bHpNow | 0)}/${bMax}`;
    }
    function setLatest(msg) {
      if (latestEl) latestEl.textContent = String(msg || "");
    }
    function pulseHit(node) {
      if (!node) return;
      node.classList.remove("is-hit");
      void node.offsetWidth;
      node.classList.add("is-hit");
      setTimeout(() => node.classList.remove("is-hit"), 220);
    }
    function dmgPos(actor) {
      const host = stageHost;
      if (!host) return { x: 140, y: 80 };
      const w = host.clientWidth || 360;
      const h = host.clientHeight || 260;
      return actor === "you"
        ? { x: Math.round(w * 0.72), y: Math.round(h * 0.34) }
        : { x: Math.round(w * 0.22), y: Math.round(h * 0.42) };
    }
    function renderResultRow(label, value) {
      if (value == null || value === "") return "";
      return `<div class="ml-result-row"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
    }
    function rewardLines() {
      const matsSrc = data.rewards?.materials || data.rewards || {};
      const rewards = [];
      if (matsSrc.bones) rewards.push(`Bones x${matsSrc.bones}`);
      if (matsSrc.scrap) rewards.push(`Scrap x${matsSrc.scrap}`);
      if (matsSrc.rune_dust) rewards.push(`Rune Dust x${matsSrc.rune_dust}`);
      if (matsSrc.universal_key_shards) rewards.push(`Key Shards x${matsSrc.universal_key_shards}`);
      if (data.rewards?.loot && isRarePlusRarity(data.rewards.loot.rarity)) {
        const rr = String(data.rewards.loot.rarity || "").toUpperCase();
        const nm = data.rewards.loot.name ? `: ${data.rewards.loot.name}` : "";
        rewards.push(`${rr} gear${nm}`);
      }
      const firstClear = [];
      const seenFc = new Set();
      const pushFc = (text) => {
        const t = String(text || "").trim();
        if (!t) return;
        const key = t.toLowerCase();
        if (seenFc.has(key)) return;
        seenFc.add(key);
        firstClear.push(t);
      };
      const fcRarePlus = data.rewards?.firstClearRarePlus || data.firstClearRarePlus || null;
      if (fcRarePlus && isRarePlusRarity(fcRarePlus.rarity)) {
        const rr = String(fcRarePlus.rarity || "rare").toUpperCase();
        const nm = fcRarePlus.name ? `: ${fcRarePlus.name}` : "";
        pushFc(`${rr} gear${nm}`);
      }
      for (const item of asArray(data.rewards?.firstClear)) {
        if (fcRarePlus && /^first clear:/i.test(String(item))) continue;
        pushFc(item);
      }
      return { rewards, firstClear };
    }
    function finishPlayback(fromSkip) {
      const steps = data.steps || [];
      if (fromSkip) {
        while (idx < steps.length) {
          const s0 = steps[idx++] || {};
          const actor = s0.actor ? s0.actor : (s0.att === "P" ? "you" : "boss");
          appendLogRow(actor, Number(s0.dmg || 0), !!s0.crit, !!s0.dodge);
        }
        if (steps.length) {
          const last = steps[steps.length - 1] || {};
          if (last.p_hp != null) pHpNow = last.p_hp;
          if (last.b_hp != null) bHpNow = last.b_hp;
        }
        if (data.winner === "you") bHpNow = Math.min(bHpNow, 0);
        if (data.winner !== "you") pHpNow = Math.min(pHpNow, 0);
        setHp();
      }
      const won = data.winner === "you";
      const { rewards, firstClear } = rewardLines();
      const notes = [];
      if (data.report?.hint) notes.push(data.report.hint);
      const nextFloor = data.next?.nextFloorUnlocked || data.next?.floor || data.next?.level || "";
      setLatest(won ? "Victory" : "Defeat");
      const badge = $("#fb-live-badge", wrap);
      if (badge) {
        badge.textContent = won ? "Victory" : "Defeat";
        badge.classList.toggle("is-ready", won);
        badge.classList.toggle("is-cool", !won);
      }
      const skip = $("#fb-skip", wrap);
      if (skip) skip.style.display = "none";
      const auto = wrap.querySelector(".ml-auto");
      if (auto) auto.style.display = "none";
      const overlay = $("#fb-result", wrap);
      const title = $("#fb-result-title", wrap);
      const body = $("#fb-result-body", wrap);
      const nextBtn = $("#fb-next", wrap);
      if (overlay) {
        overlay.classList.add("is-on", won ? "is-win" : "is-loss");
        overlay.classList.remove(won ? "is-loss" : "is-win");
      }
      if (title) title.textContent = won ? "Victory" : "Defeat";
      if (body) {
        body.innerHTML =
          renderResultRow(won ? "Floor cleared" : "Floor held", floorLabel) +
          renderResultRow("Rewards", rewards.join(" · ")) +
          renderResultRow("First Clear", firstClear.join(" · ")) +
          renderResultRow("Next Floor", nextFloor) +
          renderResultRow("Notes", notes.join(" · "));
      }
      if (nextBtn) nextBtn.textContent = won ? "Ascend" : "Retry";
    }

    function applyStep(s0, { animate }) {
      const actor = s0.actor ? s0.actor : (s0.att === "P" ? "you" : "boss");
      const dmg = Number(s0.dmg || 0);
      const crit = !!s0.crit;
      const dodge = !!s0.dodge;
      if (actor === "you") {
        bHpNow = s0.b_hp ?? bHpNow;
        if (!dodge && dmg > 0 && animate) pulseHit(bossImgEl);
      } else {
        pHpNow = s0.p_hp ?? pHpNow;
        if (!dodge && dmg > 0 && animate) pulseHit(youImgEl);
      }
      setLatest(logLine(actor, dmg, crit, dodge));
      appendLogRow(actor, dmg, crit, dodge);
      setHp();
      if (animate && !dodge && dmg > 0) {
        const pos = dmgPos(actor);
        try { globalThis.Combat.createDamageNumber(pos.x, pos.y, dmg, crit); } catch (_) {}
      }
    }

    function step() {
      if (skipped) return;
      const steps = data.steps || [];
      if (idx >= steps.length) {
        finishPlayback(false);
        return;
      }
      applyStep(steps[idx++] || {}, { animate: true });
      battleTimer = setTimeout(step, 420);
    }

    setHp();
    battleTimer = setTimeout(step, 280);
  }

  function init(deps) {
    S.apiPost = deps?.apiPost || S.apiPost;
    S.tg = deps?.tg || S.tg;
    S.dbg = deps?.dbg || S.dbg;
    ensureDeps();
  }

  global.Fortress = { init, open, refresh, close: closeModal };
})(window);
