// js/skins.js — Skins modal (owned/equipped + buy/equip) for Alpha Husky WebApp
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _bound = false;

  // DOM
  let avatarBack, skinCanvas, skinCtx, skinPreviewImg, skinDesc, closeAvatar, equipBtn, shareBtn, skinButtonsWrap;

  // state
  let _catalog = [];
  let _owned = [];
  let _equipped = { skin: "" };
  let _selectedKey = "";
  let _inited = false;

  // animated webp detection cache + anti-race guard
  const _animCache = new Map();
  let _previewSeq = 0;

  function init({ apiPost, tg, dbg } = {}) {
    // ✅ always refresh apiPost even on re-init
    _apiPost = apiPost || window.S?.apiPost || _apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || _tg || null;
    _dbg = !!dbg;

    if (_inited) return true;   // ✅ don't re-bind
    _inited = true;

    avatarBack = document.getElementById("avatarBack");
    skinCanvas = document.getElementById("skinCanvas");
    skinCtx = skinCanvas ? skinCanvas.getContext("2d") : null;
    skinPreviewImg = document.getElementById("skinPreviewImg"); // ✅ new (optional)
    skinDesc = document.getElementById("skinDesc");
    closeAvatar = document.getElementById("closeAvatar");
    equipBtn = document.getElementById("equipSkin");
    shareBtn = document.getElementById("shareSkin");
    skinButtonsWrap = document.getElementById("skinButtons");

    if (_bound) return true;
    _bound = true;

    avatarBack?.addEventListener("click", (e) => {
      if (e.target === avatarBack) {
        _cleanupPreview();
        avatarBack.style.display = "none";
      }
    });
    closeAvatar?.addEventListener("click", () => {
      if (avatarBack) {
        _cleanupPreview();
        avatarBack.style.display = "none";
      }
    });

    equipBtn?.addEventListener("click", onPrimaryAction);
    shareBtn?.addEventListener("click", onShare);

    return true;
  }

  function dbg(msg, obj) {
    if (_dbg) console.log("[Skins]", msg, obj ?? "");
  }

  function haptic(kind) {
    try { _tg?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function uuid() {
    try { return crypto.randomUUID(); } catch (_) {}
    return "rid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 10);
  }

  function normKey(key) {
    return (key || "").trim().toLowerCase();
  }

  function isOwned(key) {
    const k = normKey(key);
    if (!k || k === "default") return true;
    return Array.isArray(_owned) && _owned.includes(k);
  }

  function getMeta(key) {
    const k = normKey(key);
    return (_catalog || []).find(s => normKey(s.key) === k) || null;
  }

  // ✅ supports catalog: cost:{bones:..., tokens:...} (also accepts bone/token variants)
  function getCost(key) {
    const m = getMeta(key);
    const c = (m && m.cost) ? m.cost : {};

    const bonesRaw = (c.bones ?? c.bone ?? 0);
    const tokensRaw = (c.tokens ?? c.token ?? 0);

    const bones = Number(bonesRaw);
    const tokens = Number(tokensRaw);

    return {
      bones: Number.isFinite(bones) ? bones : 0,
      tokens: Number.isFinite(tokens) ? tokens : 0,
    };
  }

  function fmtCostLabel(cost) {
    const b = Number(cost?.bones || 0);
    const t = Number(cost?.tokens || 0);
    if (b > 0 && t > 0) return `${b} bones + ${t} tokens`;
    if (t > 0) return `${t} tokens`;
    if (b > 0) return `${b} bones`;
    return "";
  }

  function setPrimaryButtonState() {
    if (!equipBtn) return;

    const k = normKey(_selectedKey);
    const owned = isOwned(k);

    if (!k) {
      equipBtn.textContent = "Pick a skin";
      equipBtn.disabled = true;
      return;
    }

    // default/clear
    if (k === "default") {
      equipBtn.textContent = "Equip Default";
      equipBtn.disabled = false;
      return;
    }

    if (owned) {
      equipBtn.textContent = "Equip";
      equipBtn.disabled = false;
    } else {
      const cost = getCost(k);
      const label = fmtCostLabel(cost);

      if (label) {
        equipBtn.textContent = `Buy (${label})`;
        equipBtn.disabled = false;
      } else {
        equipBtn.textContent = "Locked";
        equipBtn.disabled = true;
      }
    }
  }

  function _useImgPreview(on) {
    if (skinPreviewImg) skinPreviewImg.style.display = on ? "block" : "none";
    if (skinCanvas) skinCanvas.style.display = on ? "none" : "block";
  }

  function _cleanupPreview() {
    // stop any running animated preview
    _previewSeq++;
    if (skinPreviewImg) skinPreviewImg.src = "";
    // prefer canvas visible next time
    _useImgPreview(false);
  }

  function drawPlaceholder(text) {
    // placeholder is canvas-based, so ensure canvas is visible
    _useImgPreview(false);
    if (skinPreviewImg) skinPreviewImg.src = "";

    if (!skinCtx || !skinCanvas) return;
    skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "rgba(0,0,0,.35)";
    skinCtx.fillRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "#fff";
    skinCtx.font = "18px Arial";
    skinCtx.textAlign = "center";
    skinCtx.fillText(text || "Preview", skinCanvas.width / 2, skinCanvas.height / 2);
  }

  async function _isAnimatedWebp(url) {
    if (!url || !/\.webp(\?|#|$)/i.test(url)) return false;
    if (_animCache.has(url)) return _animCache.get(url);

    try {
      const res = await fetch(url, { cache: "force-cache" });
      const buf = await res.arrayBuffer();
      const u8 = new Uint8Array(buf);

      // WebP animations typically include "ANIM" and/or "ANMF"
      for (let i = 0; i < u8.length - 3; i++) {
        const a = u8[i], b = u8[i + 1], c = u8[i + 2], d = u8[i + 3];
        // "ANIM"
        if (a === 65 && b === 78 && c === 73 && d === 77) { _animCache.set(url, true); return true; }
        // "ANMF"
        if (a === 65 && b === 78 && c === 77 && d === 70) { _animCache.set(url, true); return true; }
      }
    } catch (e) {
      // If fetch fails (CORS/CDN), we can't reliably detect animation.
      // Keep default: not animated => canvas path (still works for first frame).
      dbg("_isAnimatedWebp fetch failed", e);
    }

    _animCache.set(url, false);
    return false;
  }

  // ✅ CORS fallback (some CDN/canvas combos fail with anonymous)
  function renderSkinPreview(imgUrl, name) {
    if ((!skinCtx || !skinCanvas) && !skinPreviewImg) return;

    if (!imgUrl) {
      drawPlaceholder(name || "Default Skin");
      return;
    }

    const seq = ++_previewSeq;

    const tryLoad = (withCors) => new Promise((resolve, reject) => {
      const img = new Image();
      if (withCors) img.crossOrigin = "anonymous";
      img.src = imgUrl;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    (async () => {
      try {
        // 1) if animated webp => use <img> preview
        const animated = await _isAnimatedWebp(imgUrl);
        if (seq !== _previewSeq) return; // user clicked another skin meanwhile

        if (animated && skinPreviewImg) {
          _useImgPreview(true);
          skinPreviewImg.src = imgUrl;
          return;
        }

        // 2) static => render on canvas (existing behavior)
        if (skinPreviewImg) skinPreviewImg.src = "";
        _useImgPreview(false);

        let img;
        try { img = await tryLoad(true); }
        catch { img = await tryLoad(false); }

        if (seq !== _previewSeq) return;

        if (!skinCtx || !skinCanvas) return;

        skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
        const scaleX = skinCanvas.width / img.width;
        const scaleY = skinCanvas.height / img.height;
        const scale = Math.min(scaleX, scaleY);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const offsetX = (skinCanvas.width - drawW) / 2;
        const offsetY = (skinCanvas.height - drawH) / 2;
        skinCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
      } catch (e) {
        dbg("renderSkinPreview failed", e);
        drawPlaceholder("Skin not found");
      }
    })();
  }

  function buildSkinButtons() {
    if (!skinButtonsWrap) return;
    skinButtonsWrap.innerHTML = "";

    // pseudo "Default"
    const all = [{ key: "default", name: "Default", img: "" }, ...(_catalog || [])];

    all.forEach((s) => {
      const key = normKey(s.key);
      const owned = isOwned(key);

      const b = document.createElement("button");
      b.className =
        "btn skin-btn" +
        (key === normKey(_selectedKey) ? " active" : "") +
        (!owned ? " locked" : "");

      b.type = "button";
      b.textContent = (s.name || s.key) + (!owned ? " 🔒" : "");
      b.dataset.skin = key;

      b.addEventListener("click", () => {
        [...skinButtonsWrap.querySelectorAll(".skin-btn")].forEach(x => x.classList.remove("active"));
        b.classList.add("active");

        _selectedKey = key;

        // preview + desc
        renderSkinPreview(s.img, s.name || s.key);

        if (skinDesc) {
          const ownedNow = isOwned(key);
          const cost = getCost(key);
          const label = fmtCostLabel(cost);

          if (key === "default") skinDesc.textContent = "Default — clean Alpha.";
          else if (ownedNow) skinDesc.textContent = `${s.name || s.key} — owned.`;
          else if (label) skinDesc.textContent = `${s.name || s.key} — locked. Buy to unlock (${label}).`;
          else skinDesc.textContent = `${s.name || s.key} — locked.`;
        }

        setPrimaryButtonState();
        haptic("light");
      });

      skinButtonsWrap.appendChild(b);
    });

    // select current equipped or first
    const eq = normKey((_equipped && _equipped.skin) || "") || "default";
    _selectedKey = eq;

    const btn =
      skinButtonsWrap.querySelector(`[data-skin="${_selectedKey}"]`) ||
      skinButtonsWrap.querySelector(".skin-btn");

    btn?.click?.();
  }

  async function open() {
    // ✅ guard: init might not have set apiPost yet
    if (!_apiPost) {
      console.warn("[Skins] apiPost missing (init not called yet?)");
      try { _tg?.showAlert?.("Skins not ready yet."); } catch (_) {}
      return;
    }

    try {
      const out = await _apiPost("/webapp/skins", {});
      if (!out || !out.ok) throw new Error(out?.reason || "skins get failed");

      _catalog = Array.isArray(out.skins) ? out.skins : [];
      _owned = Array.isArray(out.owned) ? out.owned : ["default"];
      _equipped = (out.equipped && typeof out.equipped === "object")
        ? out.equipped
        : { skin: (out.active || "") };

      buildSkinButtons();

      if (avatarBack) avatarBack.style.display = "flex";
      setPrimaryButtonState();
    } catch (e) {
      console.warn(e);
      try { _tg?.showAlert?.("Failed to load skins."); } catch (_) {}
    }
  }

  async function onPrimaryAction() {
    const key = normKey(_selectedKey);
    if (!key) return;

    if (!_apiPost) {
      try { _tg?.showAlert?.("Skins not ready yet."); } catch (_) {}
      return;
    }

    try {
      // owned -> equip
      if (isOwned(key)) {
        const out = await _apiPost("/webapp/skins/equip", { skin: key === "default" ? "default" : key });
        if (!out || !out.ok) throw new Error(out?.reason || "equip failed");

        try { _tg?.showAlert?.("Skin equipped!"); } catch (_) {}
        if (avatarBack) {
          _cleanupPreview();
          avatarBack.style.display = "none";
        }
        try { window.loadProfile?.(); } catch (_) {}
        return;
      }

      // not owned -> buy (bones or tokens or hybrid)
      const cost = getCost(key);
      if ((cost.bones <= 0) && (cost.tokens <= 0)) {
        try { _tg?.showAlert?.("This skin is locked."); } catch (_) {}
        return;
      }

      const rid = uuid();
      const outBuy = await _apiPost("/webapp/skins/buy", { skin: key, run_id: rid });

      if (!outBuy || !outBuy.ok) {
        const r = outBuy?.reason || "buy failed";
        const msg =
          (r === "NOT_ENOUGH_TOKENS") ? "Not enough tokens." :
          (r === "NOT_ENOUGH_BONES") ? "Not enough bones." :
          (r === "ALREADY_OWNED") ? "Already owned." :
          r;
        throw new Error(msg);
      }

      // refresh state after buy
      const out = await _apiPost("/webapp/skins", {});
      if (out && out.ok) {
        _owned = Array.isArray(out.owned) ? out.owned : _owned;
        _equipped = (out.equipped && typeof out.equipped === "object") ? out.equipped : _equipped;
        _catalog = Array.isArray(out.skins) ? out.skins : _catalog;
      }

      try { _tg?.showAlert?.("Unlocked! Now equip it."); } catch (_) {}
      buildSkinButtons();
      setPrimaryButtonState();
      haptic("medium");
    } catch (e) {
      console.warn(e);
      const msg = (e && e.data && e.data.reason) ? e.data.reason : (e?.message || "Action failed");
      try { _tg?.showAlert?.(msg); } catch (_) {}
    }
  }

  async function onShare() {
    const key = normKey(_selectedKey); // "" = flex active

    try {
      let res;
      if (_apiPost) {
        res = await _apiPost("/webapp/skins/flex", { skinKey: key });
      } else {
        const API_BASE = window.API_BASE || "";
        const initData = (_tg && _tg.initData) || window.__INIT_DATA__ || "";
        const r = await fetch(API_BASE + "/webapp/skins/flex", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skinKey: key, init_data: initData }),
        });
        res = await r.json();
      }

      if (!res?.ok) {
        const reason = res?.reason || "Failed";
        if (reason === "COOLDOWN" && res.cooldownLeftSec != null) {
          try { _tg?.showAlert?.(`Cooldown: ${res.cooldownLeftSec}s`); } catch (_) {}
        } else {
          try { _tg?.showAlert?.(reason); } catch (_) {}
        }
        return;
      }

      try { _tg?.showAlert?.("Posted to community ✅"); } catch (_) {}
      haptic("medium");
    } catch (e) {
      try { _tg?.showAlert?.("Flex failed"); } catch (_) {}
    }
  }

  window.Skins = { init, open };
})();
