// js/arena.js — Pet Arena Replay (minimal) + optional Pixi overlay (dynamic load, zero index.html changes)
(function () {
  function el(id) { return document.getElementById(id); }
  function esc(s){ return String(s ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // ===================== Cloudinary Pet Sprites (DOM fallback) =====================
  const CLOUD_BASE = "https://res.cloudinary.com/dnjwvxinh/image/upload";

  function _isLikelyId(raw) {
  const x = String(raw || "").trim().toLowerCase();
  if (/^[a-f0-9]{32}$/.test(x)) return true; // md5-like
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(x)) return true; // uuid
  return false;
}

function _slugifyBase(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";

  // ✅ mapuj grecką alfę → zwykłe "a" (bo masz np. Dark Husky α)
  s = s.replace(/[αΑ]/g, "a");

  s = s.replace(/^pets\//i, "");
  s = s.replace(/\.(png|webp|jpg|jpeg)$/i, "");
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9 _-]/g, "");
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function _cloudPetUrl(key, folder = "pets") {
  const ver = String(window.__PET_CLOUD_VER__ || "").trim(); // "v176..." albo ""
  const mid = ver ? (ver.replace(/^\/?/, "").replace(/\/?$/, "") + "/") : "";
  return `${CLOUD_BASE}/f_png,q_auto,w_256,c_fit/${mid}${folder}/${encodeURIComponent(key)}.png`;
}

function petUrlCandidatesFromPlayer(p) {
  const out = [];

  // ✅ 1) Najpierw backendowe URL-e (pet_img/pet_icon). Ale NIE rób return — dopnij fallbacki.
  const best = String(p?.pet_img || p?.pet_icon || p?.petImg || p?.petIcon || "").trim();
  if (best) out.push(best);

  // ✅ 2) Kluczowe: NIE używamy pet_key/petId/UUID jako źródła ścieżki.
  // Preferuj public_id / type / name.
  const raw =
    p?.pet_public_id || p?.petPublicId ||
    p?.pet_type || p?.petType ||
    p?.pet_name || p?.petName ||
    "";

  const base = _slugifyBase(raw);
  if (!base) return Array.from(new Set(out.filter(Boolean)));
  if (_isLikelyId(base)) return Array.from(new Set(out.filter(Boolean)));

  // Generujemy kilka wariantów nazwy (żeby złapać: darkhusky_alpha / darkhuskypup / dark-husky-pup)
  const noSpace = base.replace(/\s+/g, "");
  const under   = base.replace(/\s+/g, "_");
  const dash    = base.replace(/\s+/g, "-");

  const keys = Array.from(new Set([base, noSpace, under, dash].filter(Boolean)));

  for (const k of keys) {
    out.push(_cloudPetUrl(k, "pets"));
    out.push(_cloudPetUrl(k, "pets/icons")); // jeśli kiedyś użyjesz iconów
  }

  // dedupe
  return Array.from(new Set(out.filter(Boolean)));
}

  function setIconSprite(iconEl, urlOrList, mirror = false) {
  if (!iconEl) return;

  // clear previous content
  try {
    const prevImg = iconEl.querySelector("img");
    if (prevImg) prevImg.remove();
  } catch (_) {}

  const list = Array.isArray(urlOrList) ? urlOrList.slice() : (urlOrList ? [urlOrList] : []);
  if (!list.length) {
    iconEl.textContent = "🐺";
    return;
  }

  iconEl.textContent = "";

  const img = document.createElement("img");
  img.alt = "pet";
  img.decoding = "async";
  img.loading = "eager";
  img.referrerPolicy = "no-referrer";

  img.style.width = "96px";
  img.style.height = "96px";
  img.style.objectFit = "contain";
  img.style.filter = "drop-shadow(0 10px 20px rgba(0,0,0,.45))";
  if (mirror) img.style.transform = "scaleX(-1)";

  let i = 0;
  const tryNext = () => {
    if (i >= list.length) {
      try { iconEl.innerHTML = ""; } catch (_) {}
      iconEl.textContent = "🐺";
      return;
    }
    img.src = list[i++];
  };

  img.onerror = tryNext;
  iconEl.appendChild(img);
  tryNext();
}

  // ===================== Pixi dynamic loader (no index.html edits needed) =====================
  function loadScriptOnce(url, testFn) {
  return new Promise((resolve, reject) => {
    try { if (testFn && testFn()) return resolve(true); } catch(_) {}

    const base = url.split("?")[0];

    // Jeśli skrypt już jest w DOM, ale testFn nadal false, usuń go i wczytaj ponownie
    const existing = Array.from(document.scripts || []).filter(s =>
      String(s.src || "").includes(base)
    );
    if (existing.length) {
      existing.forEach(s => { try { s.remove(); } catch(_) {} });
    }

    const s = document.createElement("script");
    s.src = url;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load: " + url));
    document.head.appendChild(s);
  });
}
  async function ensureArenaPixi() {
  const v = (window.WEBAPP_VER || Date.now());

  // 1) Pixi (LOCAL)
  if (!window.PIXI) {
    await loadScriptOnce(
  `/js/pixi.min.js?v=${encodeURIComponent(v)}`,
  () => !!window.PIXI
);
  }

  // 2) Your Pixi overlay module hosted in your app
  if (!window.ArenaPixi) {
    await loadScriptOnce(
      `/js/arena_pixi.js?v=${encodeURIComponent(v)}`,
      () => !!window.ArenaPixi
    );
  }
  return true;
}

  window.Arena = {
    _apiPost: null,
    _tg: null,
    _dbg: false,

    init({ apiPost, tg, dbg }) {
      this._apiPost = apiPost || null;
      this._tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
      this._dbg = !!dbg;
    },

    async open(battleId) {
      document.querySelectorAll(".map-back, .q-modal, .sheet-back, .locked-back")
        .forEach(x => x.style.display = "none");

      document.body.dataset.prevOverflow = document.body.style.overflow || "";
      document.body.style.overflow = "hidden";

      const container = el("app") || document.body;
      container.innerHTML = `
        <style>
          @keyframes atkL {0%{transform:translateX(0);}50%{transform:translateX(28px);}100%{transform:translateX(0);}}
          @keyframes atkR {0%{transform:translateX(0);}50%{transform:translateX(-28px);}100%{transform:translateX(0);}}
          @keyframes hit  {0%,100%{transform:scale(1);}25%{transform:scale(1.06) rotate(-2deg);}75%{transform:scale(0.98) rotate(2deg);}}
          @keyframes fly  {0%{opacity:1; transform:translateY(0) scale(1);}100%{opacity:0; transform:translateY(-60px) scale(1.25);}}
          .atkL{animation:atkL .55s;}
          .atkR{animation:atkR .55s;}
          .hit{animation:hit .45s;}
          .dmg{position:absolute;font-weight:800;font-size:20px;pointer-events:none;animation:fly .8s forwards;}
          .bar{height:12px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);overflow:hidden;}
          .fill{height:100%;width:100%;transition:width .35s;}
          .card{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);border-radius:14px;padding:12px;}
        </style>

        <div style="padding:14px;color:#fff;max-width:680px;margin:0 auto;font-family:system-ui;height:78vh;display:flex;flex-direction:column;gap:10px;">
          <div class="card">
            <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
              <div style="min-width:0">
                <div style="font-weight:800">Pet Arena Replay</div>
                <div id="arena-meta" style="opacity:.85;font-size:13px;margin-top:2px;">loading…</div>
              </div>
              <button id="arena-close" type="button" style="padding:10px 12px;border-radius:12px;border:0;cursor:pointer;">Close</button>
            </div>
          </div>

          <div class="card" style="flex:1;min-height:0;position:relative;overflow:hidden;">
            <!-- PIXI stage (background layer) -->
            <div id="arenaStage" style="position:absolute;inset:0;z-index:0;"></div>
            <!-- UI layer (foreground) -->
            <div id="arenaUi" style="position:relative;z-index:1;height:100%;">

              <div style="display:flex;gap:10px;align-items:center;">
                <div style="flex:1;min-width:0">
                  <div id="you-name" style="font-weight:800;"></div>
                  <div class="bar" style="margin-top:6px;"><div id="you-fill" class="fill"></div></div>
                </div>
                <div style="flex:1;min-width:0;text-align:right">
                  <div id="foe-name" style="font-weight:800;"></div>
                  <div class="bar" style="margin-top:6px;"><div id="foe-fill" class="fill"></div></div>
                </div>
              </div>

              <div style="position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:space-between;padding:0 16px;">
                <div id="you-sprite" style="width:42%;height:64%;display:flex;align-items:flex-end;justify-content:center;position:relative;">
                  <div id="you-icon" style="font-size:64px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));">🐺</div>
                </div>
                <div id="foe-sprite" style="width:42%;height:64%;display:flex;align-items:flex-end;justify-content:center;position:relative;">
                  <div id="foe-icon" style="font-size:64px;filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));transform:scaleX(-1);">🐺</div>
                </div>
              </div>

              <div id="result" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                font-weight:900;font-size:42px;opacity:0;transition:opacity .6s; text-shadow:0 10px 30px rgba(0,0,0,.6);">
              </div>

            </div>
          </div>

          <button id="arena-replay" type="button" style="width:100%;padding:14px;border-radius:12px;border:0;cursor:pointer;">
            Replay Again
          </button>
        </div>
      `;

      // optional: load Pixi only for Arena (no index.html changes)
      try { await ensureArenaPixi(); } catch(e) { if (this._dbg) console.warn("Pixi load failed:", e); }

      el("arena-close").onclick = () => {
        try { window.ArenaPixi?.destroy?.(); } catch(e){}
        document.body.style.overflow = document.body.dataset.prevOverflow || "";
        delete document.body.dataset.prevOverflow;
        if (window.Map?.open) return window.Map.open();
        window.location.reload();
      };

      el("arena-replay").onclick = () => {
        try { window.ArenaPixi?.destroy?.(); } catch(e){}
        this.open(battleId);
      };

      const res = await this._apiPost("/webapp/arena/replay", { battle_id: battleId });
      if (!res?.ok) {
        el("arena-meta").textContent = "Replay not found.";
        return;
      }
      await this.play(res.data);
    },

    _stepPerspective(step, youAreP1) {
      const dmg = Number(step.dmg || 0);
      const crit = !!step.crit;
      const who = step.who; // "player" = p1
      const pHp = Number(step.pHp || 0);
      const eHp = Number(step.eHp || 0);

      if (youAreP1) {
        return { youAttacked: (who === "player"), dmg, crit, youHp: pHp, foeHp: eHp };
      } else {
        return { youAttacked: (who !== "player"), dmg, crit, youHp: eHp, foeHp: pHp };
      }
    },

    async play(data) {
      const youAreP1 = !!data.you_are_p1;

      const you = youAreP1 ? data.p1 : data.p2;
      const foe = youAreP1 ? data.p2 : data.p1;

      el("you-name").textContent = you?.name || "You";
      el("foe-name").textContent = foe?.name || "Enemy";

      const wager = Number(data.match_wager || 0);
      el("arena-meta").textContent = `Wager: ${wager} • Turns: ${(data.steps||[]).length}`;

      // HP setup
      const youMax = Math.max(1, Number(you?.hpMax || 100));
      const foeMax = Math.max(1, Number(foe?.hpMax || 100));
      let youHp = youMax, foeHp = foeMax;

      el("you-fill").style.width = "100%";
      el("foe-fill").style.width = "100%";

      const youSprite = el("you-sprite");
      const foeSprite = el("foe-sprite");
      const youIcon = el("you-icon");
      const foeIcon = el("foe-icon");
      const result = el("result");
      result.style.opacity = 0;

      // ✅ DOM fallback sprite swap (safe; Pixi may hide these later)
      try {
        setIconSprite(youIcon, petUrlCandidatesFromPlayer(you), false);
setIconSprite(foeIcon, petUrlCandidatesFromPlayer(foe), true);
      } catch (_) {}

      // ---- PIXI overlay (optional) ----
      const stageEl = el("arenaStage");
      const usePixi = !!(stageEl && window.PIXI && window.ArenaPixi);

      if (usePixi) {
        try {
          // hide DOM emoji/sprites; Pixi draws actors underneath
          youIcon.style.opacity = "0";
          foeIcon.style.opacity = "0";

          window.ArenaPixi.init(stageEl);
          // if your arena_pixi.js supports images, it can use you/foe fields to pick sprite URLs
          await window.ArenaPixi.setActors({ you, foe, flipFoe: true });
        } catch (e) {
          if (this._dbg) console.warn("ArenaPixi init failed:", e);
          // show DOM again if Pixi fails
          try { youIcon.style.opacity = "1"; foeIcon.style.opacity = "1"; } catch(_) {}
        }
      } else {
        // ensure they are visible in fallback mode
        youIcon.style.opacity = "1";
        foeIcon.style.opacity = "1";
      }

      const steps = data.steps || [];
      for (const st of steps) {
        const p = this._stepPerspective(st, youAreP1);

        if (usePixi && window.ArenaPixi?.attack) {
          try { window.ArenaPixi.attack(p.youAttacked, p.dmg, p.crit); } catch(e){}
          await sleep(220);
        } else {
          // --- DOM fallback (your original animations) ---
          const attacker = p.youAttacked ? youIcon : foeIcon;
          const target   = p.youAttacked ? foeIcon : youIcon;

          attacker.classList.add(p.youAttacked ? "atkL" : "atkR");
          setTimeout(() => attacker.classList.remove(p.youAttacked ? "atkL" : "atkR"), 560);

          await sleep(220);

          target.classList.add("hit");
          setTimeout(() => target.classList.remove("hit"), 460);

          // dmg pop
          const dmgEl = document.createElement("div");
          dmgEl.className = "dmg";
          dmgEl.textContent = `-${p.dmg}${p.crit ? " CRIT!" : ""}`;
          dmgEl.style.left = "50%";
          dmgEl.style.top = "48%";
          dmgEl.style.transform = "translate(-50%,-50%)";
          dmgEl.style.color = p.crit ? "#ffd166" : "#ff5d5d";
          (p.youAttacked ? foeSprite : youSprite).appendChild(dmgEl);
          setTimeout(() => dmgEl.remove(), 900);
        }

        // hp update (use step hp values)
        youHp = Math.max(0, Number(p.youHp || youHp));
        foeHp = Math.max(0, Number(p.foeHp || foeHp));

        el("you-fill").style.width = `${Math.round((youHp / youMax) * 100)}%`;
        el("foe-fill").style.width = `${Math.round((foeHp / foeMax) * 100)}%`;

        // haptics
        try { this._tg?.HapticFeedback?.impactOccurred?.("light"); } catch(e){}

        await sleep(520);
      }

      const youWon = String(data.winner_uid) === (youAreP1 ? String(data.p1_uid) : String(data.p2_uid));
      result.textContent = youWon ? "🏆 VICTORY!" : "💀 DEFEAT";
      result.style.opacity = 1;
    }
  };
})();
