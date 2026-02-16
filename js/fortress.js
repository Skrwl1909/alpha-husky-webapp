// js/fortress.js
// Alpha Husky — Moon Lab (Fortress) UI
// Użycie: window.Fortress.init({ apiPost, tg, dbg }); → window.Fortress.open();
(function (global) {
  const BID = "moonlab_fortress";

  const S = {
    apiPost: null,
    tg: null,
    dbg: (..._args) => {},
  };

  // ---------- helpers ----------
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
  const setWidth = (sel, v, root = document) => {
    const n = $(sel, root);
    if (n) n.style.width = String(v);
  };

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
    try {
      S.tg?.showAlert?.(String(msg));
    } catch (_) {
      try {
        alert(msg);
      } catch (_) {}
    }
  }

  // Bezpieczny fallback dla animowanych liczb obrażeń
  function ensureDamageParticles() {
    if (!global.Combat) global.Combat = {};
    if (typeof global.Combat.createDamageNumber !== "function") {
      global.Combat.createDamageNumber = function (x, y, dmg, crit) {
        const container = global.Combat.container || document.body;
        const span = document.createElement("div");
        span.className = "damage-number" + (crit ? " crit-damage" : "");
        span.textContent = String(dmg);
        span.style.left = x - 10 + "px";
        span.style.top = y - 10 + "px";
        span.style.position = "absolute";
        container.appendChild(span);
        setTimeout(() => span.remove(), 1100);
      };
    }
  }

  // === helper: ustaw sprite bossa; przyjmuje klucz/nazwę/URL ===
  function setEnemySprite(spriteOrNameOrKey) {
    const img = $("#fx-enemy");
    if (!img) return;
    const v = global.WEBAPP_VER || "dev";
    let src = spriteOrNameOrKey || "";
    const looksLikeUrl =
      /^https?:\/\//i.test(src) || /\/.+\.(png|webp|jpg|jpeg|gif)$/i.test(src);
    if (!looksLikeUrl) {
      const slug = String(src || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_|_$/g, "");
      if (slug) src = `images/bosses/${slug}.png`;
    }
    if (!src) src = "images/bosses/core_custodian.png";
    img.src = src + (src.includes("?") ? `&v=${encodeURIComponent(v)}` : `?v=${encodeURIComponent(v)}`);
  }

  // ---------- CSS (PATCH 1) ----------
  function injectCss() {
    if (document.getElementById("fortress-css")) return;
    const css = `
#fortress-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
#fortress-modal .mask{position:absolute;inset:0;background:rgba(0,0,0,.55);z-index:1}

/* ✅ card flex-col + min-height:0 => scroll działa */
#fortress-modal .card{
  position:relative;z-index:2;width:min(92vw,520px);max-height:86vh;
  background:rgba(12,14,18,.96);border:1px solid rgba(255,255,255,.12);
  border-radius:16px;padding:12px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.45);
  overflow:hidden;
  display:flex;flex-direction:column;
  min-height:0;
}

.fx-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.fx-title{font-weight:800;letter-spacing:.2px}
.fx-sub{opacity:.8;font-weight:600}
.fx-badge{font:600 12px system-ui;padding:4px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06)}
.fx-kv{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.fx-chip{padding:6px 10px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(255,255,255,.06);font-weight:700}
.fx-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.fx-col{display:grid;gap:8px}
.fx-prog{display:grid;gap:6px}
.fx-bar{position:relative;height:10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
.fx-bar>i{position:absolute;left:0;top:0;bottom:0;width:0%;background:linear-gradient(90deg,rgba(0,229,255,.6),rgba(155,77,255,.6))}

/* ✅ open modal body też może scrollować */
.fx-body{
  display:grid;gap:10px;
  overflow:auto;
  flex:1;
  min-height:0;
  padding-bottom:8px;
}

/* --- Portret przeciwnika (open modal) --- */
.fx-portrait{position:relative;display:grid;place-items:center;min-height:220px;border-radius:14px;
  background:radial-gradient(60% 60% at 50% 60%, rgba(255,255,255,.06), rgba(0,0,0,0));overflow:hidden}
#fx-enemy{max-width:min(46vh,440px);max-height:min(46vh,440px);object-fit:contain;
  filter:drop-shadow(0 14px 28px rgba(0,0,0,.45))}

/* --- Battle modal main scroll container --- */
.fb-main{
  display:flex;flex-direction:column;gap:10px;
  overflow:auto;
  flex:1;
  min-height:0;
  padding-bottom:8px;
}

/* ✅ stage ma zawsze wysokość */
#fb-stage{
  position:relative;
  height:clamp(200px, 34vh, 360px);
  border-radius:14px;
  overflow:hidden;
  background:radial-gradient(60% 60% at 50% 60%, rgba(255,255,255,.07), rgba(0,0,0,0));
  border:1px solid rgba(255,255,255,.10);
}
#fb-stage canvas{display:block;width:100%;height:100%}

/* DOM fallback kiedy PIXI brak */
#fb-stage .fb-fallback{
  position:absolute;inset:0;
  display:flex;align-items:center;justify-content:space-between;
  padding:16px;gap:10px;
  pointer-events:none;
}
#fb-stage .fb-side{
  width:45%;
  display:flex;flex-direction:column;align-items:center;gap:8px;
}
#fb-stage .fb-tag{font:700 12px system-ui;opacity:.85}
#fb-stage .fb-avatar{
  width:74px;height:74px;border-radius:999px;object-fit:cover;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.06);
  box-shadow:0 10px 28px rgba(0,0,0,.35);
}
#fb-stage .fb-boss{
  max-width:100%;
  max-height:210px;
  object-fit:contain;
  filter:drop-shadow(0 14px 28px rgba(0,0,0,.45));
}
#fb-stage .fb-name{font:800 13px system-ui;opacity:.92;text-align:center}

/* board + log */
#fb-board{margin:0;background:rgba(255,255,255,.06);padding:8px;border-radius:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
#fb-log{
  display:flex;flex-direction:column;gap:4px;
  overflow:auto;min-height:120px;max-height:none !important;
  padding-right:2px;
}

.fx-actions{
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);
  position:sticky;bottom:0;
  background:linear-gradient(180deg,rgba(12,14,18,0),rgba(12,14,18,.96) 35%);
  padding-bottom:6px;
}
.fx-actions-left,.fx-actions-right{display:flex;gap:8px;flex-wrap:wrap}
.fx-btn{padding:10px 12px;border-radius:12px;background:#2a2f45;border:1px solid rgba(255,255,255,.12);color:#fff;cursor:pointer}
.fx-btn.primary{background:rgba(16,185,129,.18);min-width:120px}
.fx-btn[disabled]{opacity:.55;cursor:not-allowed;filter:grayscale(.1)}
.fx-x{background:transparent;border:none;color:#fff;font-size:22px;padding:4px 8px;cursor:pointer}
.fx-note{opacity:.75;font-size:12px}

/* --- Animacje UI w walce --- */
@keyframes damageFloat { 0%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-30px) scale(1.2)} }
@keyframes critBurst { 0%{opacity:1;transform:scale(0)} 50%{opacity:1;transform:scale(1.2)} 100%{opacity:0;transform:scale(1.5)} }

.damage-number{
  position:absolute;font-weight:bold;font-size:18px;color:#ffcc00;pointer-events:none;z-index:10;
  animation:damageFloat 800ms ease-out forwards;text-shadow:1px 1px 2px rgba(0,0,0,0.8);
}
.damage-number.crit-damage{color:#ff4444;font-size:20px;animation:damageFloat 1000ms ease-out forwards}
.damage-number.crit-damage::after{content:' CRIT!';color:#ffff00}
.particle-burst{position:absolute;width:4px;height:4px;background:#ffff00;border-radius:50%;pointer-events:none;z-index:10;animation:critBurst 600ms ease-out forwards}

@media (max-width:480px){
  .fx-title{font-size:15px}
  .fx-btn{padding:12px 14px}
}
`;
    const s = el("style");
    s.id = "fortress-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function closeModal() {
    // ✅ zawsze sprzątnij PIXI zanim usuniesz modal
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__?.();
    } catch (_) {}
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__ = null;
    } catch (_) {}

    const m = document.getElementById("fortress-modal");
    if (m) m.remove();
    try {
      S.tg?.MainButton?.show?.();
    } catch (_) {}
  }

  // ---------- deps / fallback ----------
  async function defaultApiPost(path, payload) {
    const base = global.API_BASE || "";
    const initData =
      (global.Telegram && global.Telegram.WebApp && global.Telegram.WebApp.initData) || "";
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

  // ---------- fortress payload normalizer (pod fortress.py) ----------
  function normalizeFortressPayload(raw) {
    if (!raw) return null;
    const t = raw && raw.ok !== undefined && raw.data ? raw.data : raw;

    // steps z fortress.py: {att:'P'|'E', dmg, crit, dodge, p_hp, b_hp}
    const stepsIn = Array.isArray(t.steps) ? t.steps : [];
    const steps = stepsIn.map((s) => {
      const att = s.actor || s.att || s.who;
      const actor =
        att === "you" || att === "player" || att === "P" ? "you" : "boss";
      return {
        actor,
        dmg: Number(s.dmg ?? s.damage) || 0,
        crit: !!(s.crit ?? s.isCrit),
        dodge: !!(s.dodge ?? s.isDodge),
        p_hp: Number(s.p_hp ?? s.php ?? s.pHp ?? s.playerHp) || undefined,
        b_hp: Number(s.b_hp ?? s.bhp ?? s.bHp ?? s.enemyHp ?? s.ehp ?? s.eHp) || undefined,
      };
    });

    const bossLabel = String(t?.boss?.name || t?.bossName || "Boss");
    const bossSprite = t?.boss?.sprite || t?.bossSprite || null;

    const level = Number(t.floorCleared ?? t.floorAttempted ?? t.level ?? 1) || 1;

    const res = String(t.result || "").toUpperCase();
    const winner = res === "VICTORY" ? "you" : res === "DEFEAT" ? "boss" : (t.winner || "boss");

    const bossHpMax = Number(t?.boss?.hpMax ?? t.enemyHpMax ?? t.stats?.enemyHpMax) || 1;
    const playerHpMax = Number(t?.player?.hpMax ?? t.playerHpMax ?? t.stats?.playerHpMax) || 1;

    // rewards w fortress.py: rewards:{scrap,rune_dust} + firstClear na root
    const matsSrc = t.rewards || {};
    const firstClear = Array.isArray(t.firstClear) ? t.firstClear : (Array.isArray(matsSrc.firstClear) ? matsSrc.firstClear : []);

    return {
      mode: "fortress",
      level,
      boss: { name: bossLabel, hpMax: bossHpMax, sprite: bossSprite },
      player: { hpMax: playerHpMax },
      steps,
      winner,
      rewards: {
        materials: {
          scrap: Number(matsSrc.scrap || 0),
          rune_dust: Number(matsSrc.rune_dust || 0),
        },
        rare: !!t.rare,
        firstClear,
      },
      next: { level: winner === "you" ? level + 1 : level },
    };
  }

  // ---------- open modal ----------
  function open() {
    ensureDeps();
    injectCss();
    closeModal();

    const wrap = el("div");
    wrap.id = "fortress-modal";
    wrap.innerHTML = `
      <div class="mask" id="fx-mask"></div>
      <div class="card">
        <div class="fx-head">
          <div>
            <div class="fx-sub">Moon Lab — Fortress</div>
            <div class="fx-title" id="fx-title">Moon Lab — Fortress</div>
          </div>
          <div class="fx-kv">
            <span id="fx-badge" class="fx-badge">…</span>
            <button class="fx-x" id="fx-x" type="button" aria-label="Close">×</button>
          </div>
        </div>

        <div class="fx-body">
          <div class="fx-row">
            <div class="fx-col">
              <div class="fx-kv"><b>Status:</b> <span id="fx-status">—</span></div>
              <div class="fx-kv"><b>Cooldown:</b> <span id="fx-cd">—</span></div>
              <div class="fx-kv"><b>Next opponent:</b> <span id="fx-next">—</span></div>
            </div>
            <div class="fx-col" style="min-width:170px;align-items:flex-end">
              <div class="fx-kv">
                <span class="fx-chip" id="fx-lvl">L —</span>
                <span class="fx-chip" id="fx-best" style="display:none" title="Best floor">⭐ Best F —</span>
                <span class="fx-chip" id="fx-attempts" style="display:none" title="Attempts left">🎯 —</span>
              </div>
            </div>
          </div>

          <div class="fx-prog">
            <div class="fx-kv"><b>Encounter</b> <span class="fx-note" id="fx-encLbl">—/—</span></div>
            <div class="fx-bar"><i id="fx-barFill"></i></div>
          </div>

          <div class="fx-portrait">
            <img id="fx-enemy" alt="Enemy" src="images/bosses/core_custodian.png">
          </div>

          <div class="fx-actions">
            <div class="fx-actions-left">
              <button class="fx-btn" id="fx-close" type="button">Close</button>
              <button class="fx-btn" id="fx-refresh" type="button">Refresh</button>
            </div>
            <div class="fx-actions-right">
              <button class="fx-btn primary" id="fx-start" type="button" disabled>Start</button>
            </div>
          </div>

          <div class="fx-note" id="fx-hint">Win → next encounter after cooldown; lose → retry same encounter.</div>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);

    try {
      S.tg?.MainButton?.hide?.();
    } catch (_) {}

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) {
        if (e.target.id === "fx-mask") closeModal();
        return;
      }
      switch (btn.id) {
        case "fx-x":
        case "fx-close":
          closeModal();
          break;
        case "fx-refresh":
          refresh();
          break;
        case "fx-start":
          doStart();
          break;
      }
    });

    refresh();
  }

  // live ticker
  let ticker = null;
  function stopTicker() {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  }

  function setBadge(txt) {
    const b = $("#fx-badge");
    if (!b) return;
    b.textContent = txt;
    const base = "rgba(255,255,255,.06)";
    const green = "rgba(16,185,129,.18)";
    const blue = "rgba(59,130,246,.18)";
    b.style.background = txt === "Ready" ? green : txt === "Active" ? blue : base;
  }

  async function refresh() {
    ensureDeps();
    stopTicker();

    if (document.getElementById("fortress-modal") && !document.querySelector("#fx-lvl")) {
      closeModal();
      open();
      return;
    }

    try {
      let st = await S.apiPost("/webapp/building/state", { buildingId: BID });
      if (st && st.data) st = st.data;

      const cdRaw =
        (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0) | 0;
      const cd = Math.max(0, cdRaw);
      const ready =
        !!(st.canFight ?? st.canStart ?? st.ready ?? (st.status && String(st.status).toLowerCase() === "ready")) ||
        cd === 0;

      const curFloor = Number.isFinite(+st.currentFloor) ? +st.currentFloor : null;
      const bestFloor = Number.isFinite(+st.bestFloor) ? +st.bestFloor : null;
      const lvl = st.level ?? st.currentLevel ?? st.nextLevel ?? (curFloor != null ? curFloor + 1 : 1);

      const nx = st.next || st.progress?.next || st.encounter?.next || st.upcoming || {};
      const bossLabel = String(
        st.nextEncounterName || st.bossName || nx.name || st.nextName || st.nextId || st.next_opponent?.name || ""
      );
      const bossKey = st.nextEncounterKey || nx.key || st.nextKey || null;

      setText("#fx-next", (bossLabel || lvl) ? [bossLabel, lvl ? `(L${lvl})` : ""].filter(Boolean).join(" ") : "—");

      const spriteRaw = st.bossSprite || st.sprite || nx.sprite || st.nextSprite || null;
      setEnemySprite(spriteRaw || bossKey || bossLabel);

      const attemptsLeft = st.attemptsLeft ?? st.attack?.attemptsLeft;
      const atEl = $("#fx-attempts");
      if (atEl) {
        atEl.style.display = attemptsLeft != null ? "" : "none";
        if (attemptsLeft != null) atEl.textContent = `🎯 ${attemptsLeft}`;
      }

      const encCurRaw =
        (st.encounterIndex ?? st.encountersDone ?? st.progress?.encounterIndex ?? st.encounter?.index ?? 0) | 0;
      const encTotalRaw = (st.encountersTotal ?? st.encountersCount ?? st.progress?.encountersTotal ?? 10) | 0;
      const encCur = clamp(encCurRaw + 1, 1, Math.max(1, encTotalRaw));
      const encTot = Math.max(1, encTotalRaw || 10);
      setText("#fx-encLbl", `${encCur}/${encTot}`);
      const pct = clamp(Math.round(((encCur - 1) / Math.max(1, encTot - 1)) * 100), 0, 100);
      setWidth("#fx-barFill", pct + "%");

      const titleEl = $("#fx-title");
      if (titleEl) {
        let suffix = "";
        const node = Array.isArray(global.DATA?.nodes)
          ? global.DATA.nodes.find((n) => n.buildingId === BID)
          : null;
        const totalFloors = Array.isArray(node?.gameplay?.floors) ? node.gameplay.floors.length : null;
        if (Number.isFinite(curFloor)) suffix = totalFloors ? ` (F ${curFloor + 1}/${totalFloors})` : ` (F ${curFloor + 1})`;
        titleEl.textContent = "Moon Lab — Fortress" + suffix;
      }

      const bestEl = $("#fx-best");
      if (bestEl) {
        if (Number.isFinite(bestFloor) && bestFloor >= 0) {
          bestEl.style.display = "";
          bestEl.textContent = `⭐ Best F ${bestFloor + 1}`;
        } else bestEl.style.display = "none";
      }

      setText("#fx-lvl", curFloor != null ? `F ${curFloor + 1}` : `L ${lvl}`);
      setBadge(ready ? "Ready" : cd > 0 ? "Cooldown" : "");
      setText("#fx-status", ready ? "Ready" : cd > 0 ? "Cooldown" : "—");
      setText("#fx-cd", ready ? "—" : fmtLeft(cd));

      const btn = $("#fx-start");
      if (!btn) return;

      if (cd > 0) {
        btn.disabled = true;
        btn.textContent = "Start";
        let left = cd;
        ticker = setInterval(() => {
          left = Math.max(0, left - 1);
          setText("#fx-cd", fmtLeft(left));
          if (!document.getElementById("fortress-modal")) {
            stopTicker();
            return;
          }
          if (left <= 0) {
            stopTicker();
            setBadge("Ready");
            setText("#fx-status", "Ready");
            setText("#fx-cd", "—");
            btn.disabled = false;
            btn.textContent = "Start";
          }
        }, 1000);
      } else {
        btn.disabled = !ready;
        btn.textContent = "Start";
        btn.title = btn.disabled ? "Not ready" : "";
      }
    } catch (e) {
      const msg = e?.response?.data?.reason || e?.message || "Failed to load Moon Lab state.";
      S.dbg("fortress/state fail", e);
      toast("Fortress: " + msg);
    }
  }

  async function doStart() {
    ensureDeps();
    const btn = $("#fx-start");
    if (!btn || btn.disabled) return;
    btn.disabled = true;

    try {
      S.tg?.HapticFeedback?.impactOccurred?.("light");

      const out = await S.apiPost("/webapp/building/start", { buildingId: BID });
      const res = out?.data || out;

      const payload = normalizeFortressPayload(res);
      if (payload && payload.mode === "fortress") {
        closeModal();
        renderFortressBattle(payload);
        return;
      }

      // fallback
      await refresh();
    } catch (e) {
      const reason = e?.response?.data?.reason || e?.data?.reason || e?.message || "Start failed";
      if (/COOLDOWN/i.test(reason)) {
        const left = e?.response?.data?.cooldownLeftSec ?? e?.data?.cooldownLeftSec ?? 60;
        toast(`⏳ Cooldown: ${fmtLeft(left)}`);
        await refresh();
      } else if (/LOCKED_REGION|LOCKED/i.test(reason)) {
        toast("🔒 Region locked");
      } else {
        console.error(e);
        toast("Something went wrong.");
      }
    } finally {
      btn.disabled = false;
    }
  }

  // ---------- battle helpers ----------
  function hpbar(cur, max) {
    const W = 18;
    cur = Math.max(0, cur | 0);
    max = Math.max(1, max | 0);
    const fill = Math.round(W * (cur / max));
    return "█".repeat(fill) + "░".repeat(W - fill);
  }

  function getPlayerAvatarUrl(data) {
    const direct =
      data?.player?.avatar ||
      data?.playerAvatar ||
      data?.player?.img ||
      data?.playerImg ||
      "";
    if (direct) return String(direct).trim();

    const p = window.__PROFILE__ || window.lastProfile || window.profileState || window._profile || null;
    const cand1 = [p?.characterPng, p?.character, p?.heroImg, p?.heroPng, p?.avatar, p?.avatarPng].filter(Boolean);
    if (cand1[0]) return String(cand1[0]).trim();

    const img =
      document.querySelector("#hero-frame img, #heroFrame img, img#hero-img, img#profile-avatar, #avatarMain img") ||
      document.querySelector("#equippedRoot img, #equippedModal img");
    if (img?.src) return String(img.src).trim();
    return "";
  }

  function pixiTextureFromUrl(PIXI, url) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      return PIXI.Texture.from(img);
    } catch (_) {
      return PIXI.Texture.from(url);
    }
  }

  // ---------- battle renderer (PATCH 2 + 3 + fix redeclare) ----------
  function renderFortressBattle(data) {
    // ✅ kill previous PIXI if still alive
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__?.();
    } catch (_) {}
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__ = null;
    } catch (_) {}

    injectCss();
    ensureDamageParticles();
    closeModal();

    const bossLabel = String(data?.boss?.name || data?.bossName || "Boss");
    const bUrl = String(data?.boss?.sprite || data?.bossSprite || "images/bosses/core_custodian.png");
    const pUrl = getPlayerAvatarUrl(data);

    const cont = el("div", "fortress-battle");
    cont.innerHTML = `
      <div class="fx-head" style="margin-bottom:6px">
        <div>
          <div class="fx-sub">Moon Lab — Fortress</div>
          <div class="fx-title">L${data.level ?? data.lvl ?? "?"} · ${bossLabel}</div>
        </div>
        <button class="fx-x" id="fb-x" type="button">×</button>
      </div>

      <div class="fb-main">
        <!-- ✅ PIXI STAGE + DOM FALLBACK -->
        <div class="fx-stage" id="fb-stage">
          <div class="fb-fallback" id="fb-fallback">
            <div class="fb-side">
              <img class="fb-avatar" id="fb-you-img" alt="You">
              <div class="fb-tag">YOU</div>
            </div>
            <div class="fb-side">
              <img class="fb-boss" id="fb-boss-img" alt="Boss">
              <div class="fb-name" id="fb-boss-name">${bossLabel}</div>
            </div>
          </div>
        </div>

        <pre id="fb-board">YOU  [${hpbar(data.player?.hpMax ?? 0, data.player?.hpMax ?? 1)}] ${data.player?.hpMax ?? 0}/${data.player?.hpMax ?? 0}
BOSS [${hpbar(data.boss?.hpMax ?? 0, data.boss?.hpMax ?? 1)}] ${data.boss?.hpMax ?? 0}/${data.boss?.hpMax ?? 0}</pre>

        <div id="fb-log"></div>
      </div>

      <div class="fx-actions">
        <div class="fx-actions-left">
          <button class="fx-btn" id="fb-close" type="button">Close</button>
          <button class="fx-btn" id="fb-refresh" type="button">Refresh</button>
        </div>
        <div class="fx-actions-right"></div>
      </div>
    `;

    const wrap = el("div");
    wrap.id = "fortress-modal";
    const card = el("div", "card");
    card.style.padding = "12px";
    const mask = el("div", "mask");
    mask.id = "fb-mask";
    card.appendChild(cont);
    wrap.appendChild(mask);
    wrap.appendChild(card);
    document.body.appendChild(wrap);

    const stageHost = $("#fb-stage", cont);
    if (stageHost) stageHost.style.position = "relative";

    // DOM fallback setup (always)
    const youImg = $("#fb-you-img", cont);
    const bossImg = $("#fb-boss-img", cont);
    const bossNameEl = $("#fb-boss-name", cont);

    if (youImg) {
      youImg.src = pUrl || "";
      youImg.style.visibility = pUrl ? "visible" : "hidden";
    }
    if (bossImg) bossImg.src = bUrl;
    if (bossNameEl) bossNameEl.textContent = bossLabel;

    let app = null;
    let bossSpr = null;
    let playerG = null;
    let bossShakeT = 0;
    let playerShakeT = 0;

    // PIXI v8/v7 Application init helper (PATCH 2)
    async function makePixiApp(PIXI, w, h) {
      const dpr = window.devicePixelRatio || 1;
      try {
        let a = new PIXI.Application();
        if (typeof a.init === "function") {
          await a.init({
            width: w,
            height: h,
            backgroundAlpha: 0,
            antialias: true,
            resolution: dpr,
            autoDensity: true,
          });
          return a;
        }
        try {
          a.destroy?.(true);
        } catch (_) {}
      } catch (_) {}

      try {
        return new PIXI.Application({
          width: w,
          height: h,
          backgroundAlpha: 0,
          antialias: true,
          resolution: dpr,
          autoDensity: true,
        });
      } catch (_) {}
      return null;
    }

    // cross-version Graphics helpers
    function _gfxCircle(PIXI, r, color, alpha) {
      const g = new PIXI.Graphics();
      if (typeof g.beginFill === "function") {
        g.beginFill(color, alpha);
        g.drawCircle(0, 0, r);
        g.endFill();
      } else if (typeof g.circle === "function" && typeof g.fill === "function") {
        g.circle(0, 0, r);
        g.fill({ color, alpha });
      }
      return g;
    }

    function _gfxRoundedRect(PIXI, w, h, rad, color, alpha) {
      const g = new PIXI.Graphics();
      if (typeof g.beginFill === "function") {
        g.beginFill(color, alpha);
        if (typeof g.drawRoundedRect === "function") g.drawRoundedRect(0, 0, w, h, rad);
        else if (typeof g.roundRect === "function") g.roundRect(0, 0, w, h, rad);
        else g.drawRect(0, 0, w, h);
        g.endFill();
      } else if (typeof g.roundRect === "function" && typeof g.fill === "function") {
        g.roundRect(0, 0, w, h, rad);
        g.fill({ color, alpha });
      }
      return g;
    }

    // mount pixi (PATCH 3)
    async function mountPixi() {
      if (!stageHost) return;
      if (app) return; // ✅ guard
      const PIXI = globalThis.PIXI;
      if (!PIXI || !PIXI.Application) return;

      const w = Math.max(240, stageHost.clientWidth || 360);
      const h = Math.max(180, stageHost.clientHeight || 260);

      app = await makePixiApp(PIXI, w, h);
      if (!app) return;

      const view = app.view || app.canvas;
      if (view) {
        view.style.width = "100%";
        view.style.height = "100%";
        view.style.display = "block";
        stageHost.appendChild(view);
      }

      // hide fallback when pixi is mounted
      const fb = $("#fb-fallback", cont);
      if (fb) fb.style.display = "none";

      // bg panel
      const bgPanel = _gfxRoundedRect(PIXI, w, h, 14, 0x0b0d12, 0.55);
      app.stage.addChild(bgPanel);

      // player (left)
      playerG = new PIXI.Container();

      const radius = 34;
      const pBg = _gfxCircle(PIXI, radius + 6, 0x3b82f6, 0.10);
      const ring = new PIXI.Graphics();
      if (typeof ring.lineStyle === "function") ring.lineStyle(2, 0xffffff, 0.12).drawCircle(0, 0, radius + 2);
      playerG.addChild(pBg, ring);

      if (pUrl) {
        const tex = pixiTextureFromUrl(PIXI, pUrl);
        const spr = new PIXI.Sprite(tex);
        spr.anchor?.set?.(0.5);

        const m = new PIXI.Graphics();
        if (typeof m.beginFill === "function") {
          m.beginFill(0xffffff, 1);
          m.drawCircle(0, 0, radius);
          m.endFill();
        } else if (typeof m.circle === "function" && typeof m.fill === "function") {
          m.circle(0, 0, radius);
          m.fill({ color: 0xffffff, alpha: 1 });
        }
        spr.mask = m;
        playerG.addChild(m, spr);

        const fit = () => {
          const w0 = spr.texture?.width || spr.texture?.orig?.width || spr.width || 1;
          const h0 = spr.texture?.height || spr.texture?.orig?.height || spr.height || 1;
          const s = (radius * 2) / Math.max(1, w0, h0);
          spr.scale?.set?.(s);
        };
        if (spr.texture?.baseTexture?.valid) fit();
        else spr.texture?.baseTexture?.once?.("loaded", fit);
      } else {
        const core = _gfxCircle(PIXI, 18, 0xffffff, 0.10);
        playerG.addChild(core);
      }

      const pTxt = new PIXI.Text("YOU", { fontFamily: "system-ui", fontSize: 12, fill: 0xffffff, alpha: 0.85 });
      pTxt.anchor?.set?.(0.5, 0);
      pTxt.x = 0;
      pTxt.y = 42;
      playerG.addChild(pTxt);

      playerG.x = Math.round(w * 0.22);
      playerG.y = Math.round(h * 0.55);
      app.stage.addChild(playerG);

      // boss (right)
      bossSpr = PIXI.Sprite.from(bUrl);
      bossSpr.anchor?.set?.(0.5, 0.5);
      bossSpr.x = Math.round(w * 0.74);
      bossSpr.y = Math.round(h * 0.52);

      const maxW = w * 0.42;
      const maxH = h * 0.70;

      const fitBoss = () => {
        const bw = bossSpr.texture?.width || bossSpr.width || 1;
        const bh = bossSpr.texture?.height || bossSpr.height || 1;
        const sx = maxW / Math.max(1, bw);
        const sy = maxH / Math.max(1, bh);
        const s = Math.min(1, sx, sy);
        bossSpr.scale?.set?.(s);
      };
      if (bossSpr.texture?.baseTexture?.valid) fitBoss();
      else bossSpr.texture?.baseTexture?.once?.("loaded", fitBoss);

      app.stage.addChild(bossSpr);

      const bTxt = new PIXI.Text(bossLabel, { fontFamily: "system-ui", fontSize: 12, fill: 0xffffff, alpha: 0.85 });
      bTxt.anchor?.set?.(0.5, 0);
      bTxt.x = bossSpr.x;
      bTxt.y = bossSpr.y + maxH * 0.40;
      app.stage.addChild(bTxt);

      // ticker shake
      app.ticker.add(() => {
        if (!app || !bossSpr || !playerG) return;

        if (bossShakeT > 0) {
          bossShakeT--;
          bossSpr.x += Math.random() * 6 - 3;
          bossSpr.y += Math.random() * 6 - 3;
        } else {
          bossSpr.x = Math.round(app.renderer.width * 0.74);
          bossSpr.y = Math.round(app.renderer.height * 0.52);
        }

        if (playerShakeT > 0) {
          playerShakeT--;
          playerG.x += Math.random() * 6 - 3;
          playerG.y += Math.random() * 6 - 3;
        } else {
          playerG.x = Math.round(app.renderer.width * 0.22);
          playerG.y = Math.round(app.renderer.height * 0.55);
        }
      });

      // resize listener
      const onResize = () => {
        if (!app || !stageHost) return;
        const nw = Math.max(240, stageHost.clientWidth || 360);
        const nh = Math.max(180, stageHost.clientHeight || 260);
        try {
          app.renderer.resize(nw, nh);
        } catch (_) {}
      };
      window.addEventListener("resize", onResize);
      app.__onResize = onResize;
    }

    function destroyPixi() {
      try {
        if (app?.__onResize) window.removeEventListener("resize", app.__onResize);
        if (app) {
          const view = app.view || app.canvas;
          app.destroy(true, { children: true, texture: true, baseTexture: true });
          if (view && view.parentNode) view.parentNode.removeChild(view);
        }
      } catch (_) {}
      app = null;
      bossSpr = null;
      playerG = null;
      try {
        globalThis.__FORTRESS_PIXI_CLEANUP__ = null;
      } catch (_) {}
    }

    // DOM particles nad stage
    globalThis.Combat.container = stageHost || card;

    // mount pixi (jeśli dostępne)
    (async () => {
      try {
        await mountPixi();
      } catch (_) {}
    })();

    // expose cleanup hook
    try {
      globalThis.__FORTRESS_PIXI_CLEANUP__ = () => {
        try {
          destroyPixi();
        } catch (_) {}
      };
    } catch (_) {}

    try {
      S.tg?.MainButton?.hide?.();
    } catch (_) {}

    // events
    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) {
        if (e.target.id === "fb-mask") {
          destroyPixi();
          closeModal();
        }
        return;
      }

      if (btn.id === "fb-x" || btn.id === "fb-close") {
        destroyPixi();
        closeModal();
        return;
      }

      if (btn.id === "fb-refresh") {
        (async () => {
          try {
            let st = await S.apiPost("/webapp/building/state", { buildingId: BID });
            if (st && st.data) st = st.data;
            destroyPixi();
            closeModal();
            const cd = Math.max(
              0,
              (st.cooldownLeftSec ?? st.cooldownSec ?? st.cooldownSeconds ?? st.cooldown ?? 0) | 0
            );
            toast(cd > 0 ? `Cooldown: ${fmtLeft(cd)}` : "Ready");
          } catch (_) {
            toast("Error refreshing.");
          }
        })();
      }
    });

    const logEl = $("#fb-log", cont);
    const boardEl = $("#fb-board", cont);

    function dmgPos(actor) {
      const host = stageHost;
      if (!host) return { x: 140, y: 80 };
      const w = host.clientWidth || 360;
      const h = host.clientHeight || 260;
      return actor === "you"
        ? { x: Math.round(w * 0.74), y: Math.round(h * 0.40) }
        : { x: Math.round(w * 0.22), y: Math.round(h * 0.48) };
    }

    let pHpNow = data.player?.hpMax ?? 0;
    let bHpNow = data.boss?.hpMax ?? 0;
    let idx = 0;

    function step() {
      const steps = data.steps || [];
      if (idx >= steps.length) {
        const lines = [];
        lines.push(data.winner === "you" ? "✅ Victory!" : "❌ Defeat!");

        const matsSrc = data.rewards?.materials || data.rewards || {};
        const mats = [];
        if (matsSrc.scrap) mats.push(`Scrap ×${matsSrc.scrap}`);
        if (matsSrc.rune_dust) mats.push(`Rune Dust ×${matsSrc.rune_dust}`);
        if (mats.length) lines.push("Rewards: " + mats.join(", "));

        if (data.rewards?.rare) lines.push("💎 Rare drop!");
        if (data.rewards?.firstClear?.length) lines.push("🌟 First clear: " + data.rewards.firstClear.join(", "));
        if (data.next?.level) lines.push(`Next: L${data.next.level}`);

        logEl?.insertAdjacentHTML(
          "beforeend",
          `<div style="margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.12)">${lines.join("<br>")}</div>`
        );
        return;
      }

      const s0 = steps[idx++] || {};
      const actor =
        s0.actor ? s0.actor : (s0.att === "P" ? "you" : "boss");

      const dmg = Number(s0.dmg || 0);
      const crit = !!s0.crit;
      const dodge = !!s0.dodge;

      if (actor === "you") {
        bHpNow = s0.b_hp ?? bHpNow;
        const youTxt = dodge
          ? "shoot… boss <b>DODGED</b>!"
          : "hit for <b>" + dmg + "</b>" + (crit ? " <i>(CRIT)</i>" : "") + ".";
        logEl?.insertAdjacentHTML("beforeend", `<div>▶ You ${youTxt}</div>`);
        if (!dodge && dmg > 0) bossShakeT = 8;
      } else {
        pHpNow = s0.p_hp ?? pHpNow;
        const bossTxt = dodge
          ? "attacks… you <b>DODGE</b>!"
          : "hits for <b>" + dmg + "</b>" + (crit ? " <i>(CRIT)</i>" : "") + ".";
        logEl?.insertAdjacentHTML("beforeend", `<div>◀ Boss ${bossTxt}</div>`);
        if (!dodge && dmg > 0) playerShakeT = 8;
      }

      if (boardEl) {
        boardEl.textContent =
          `YOU  [${hpbar(pHpNow, data.player?.hpMax ?? 1)}] ${pHpNow}/${data.player?.hpMax ?? 0}\n` +
          `BOSS [${hpbar(bHpNow, data.boss?.hpMax ?? 1)}] ${bHpNow}/${data.boss?.hpMax ?? 0}`;
      }

      if (logEl) logEl.scrollTop = logEl.scrollHeight;

      if (!dodge && dmg > 0) {
        const pos = dmgPos(actor);
        try {
          globalThis.Combat.createDamageNumber(pos.x, pos.y, dmg, crit);
        } catch (_) {}
      }

      setTimeout(step, 500);
    }

    setTimeout(step, 350);
  }

  // ---------- API ----------
  function init(deps) {
    S.apiPost = deps?.apiPost || S.apiPost;
    S.tg = deps?.tg || S.tg;
    S.dbg = deps?.dbg || S.dbg;
    ensureDeps();
  }

  global.Fortress = { init, open, refresh, close: closeModal };
})(window);
