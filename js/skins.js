// js/skins.js — Skins modal (owned/equipped + buy/equip) for Alpha Husky WebApp
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;

  // DOM
  let avatarBack, skinCanvas, skinCtx, skinDesc, closeAvatar, equipBtn, shareBtn, skinButtonsWrap;

  // state
  let _catalog = [];
  let _owned = [];
  let _equipped = { skin: "" };
  let _selectedKey = "";

  function init({ apiPost, tg, dbg }) {
    _apiPost = apiPost || null;
    _tg = tg || (window.Telegram && window.Telegram.WebApp) || null;
    _dbg = !!dbg;

    avatarBack = document.getElementById("avatarBack");
    skinCanvas = document.getElementById("skinCanvas");
    skinCtx = skinCanvas ? skinCanvas.getContext("2d") : null;
    skinDesc = document.getElementById("skinDesc");
    closeAvatar = document.getElementById("closeAvatar");
    equipBtn = document.getElementById("equipSkin");
    shareBtn = document.getElementById("shareSkin");
    skinButtonsWrap = document.getElementById("skinButtons");

    avatarBack?.addEventListener("click", (e) => {
      if (e.target === avatarBack) avatarBack.style.display = "none";
    });
    closeAvatar?.addEventListener("click", () => (avatarBack.style.display = "none"));

    equipBtn?.addEventListener("click", onPrimaryAction);
    shareBtn?.addEventListener("click", onShare);
  }

  function dbg(msg) {
    if (_dbg) console.log("[Skins]", msg);
  }

  function haptic(kind) {
    try { _tg?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function isOwned(key) {
    const k = (key || "").trim().toLowerCase();
    if (!k || k === "default") return true;
    return Array.isArray(_owned) && _owned.includes(k);
  }

  function getMeta(key) {
    const k = (key || "").trim().toLowerCase();
    return _catalog.find(s => (s.key || "").toLowerCase() === k) || null;
  }

  function getCostBones(key) {
    const m = getMeta(key);
    const c = m && m.cost ? m.cost : null;
    const bones = c && c.bones != null ? Number(c.bones) : 0;
    return Number.isFinite(bones) ? bones : 0;
  }

  function setPrimaryButtonState() {
    if (!equipBtn) return;

    const k = (_selectedKey || "").trim().toLowerCase();
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
      const price = getCostBones(k);
      if (price > 0) {
        equipBtn.textContent = `Buy (${price} bones)`;
        equipBtn.disabled = false;
      } else {
        // jeśli jeszcze nie masz cen / buy endpointu
        equipBtn.textContent = "Locked";
        equipBtn.disabled = true;
      }
    }
  }

  function drawPlaceholder(text) {
    if (!skinCtx || !skinCanvas) return;
    skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "rgba(0,0,0,.35)";
    skinCtx.fillRect(0, 0, skinCanvas.width, skinCanvas.height);
    skinCtx.fillStyle = "#fff";
    skinCtx.font = "18px Arial";
    skinCtx.textAlign = "center";
    skinCtx.fillText(text || "Preview", skinCanvas.width / 2, skinCanvas.height / 2);
  }

  function renderSkinPreview(imgUrl, name) {
    if (!skinCtx || !skinCanvas) return;

    if (!imgUrl) {
      drawPlaceholder(name || "Default Skin");
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgUrl;

    img.onload = () => {
      skinCtx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);
      const scaleX = skinCanvas.width / img.width;
      const scaleY = skinCanvas.height / img.height;
      const scale = Math.min(scaleX, scaleY);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const offsetX = (skinCanvas.width - drawW) / 2;
      const offsetY = (skinCanvas.height - drawH) / 2;
      skinCtx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    img.onerror = () => drawPlaceholder("Skin not found");
  }

  function buildSkinButtons() {
    if (!skinButtonsWrap) return;
    skinButtonsWrap.innerHTML = "";

    // pseudo "Default"
    const all = [{ key: "default", name: "Default", img: "" }, ...(_catalog || [])];

    all.forEach((s) => {
      const key = (s.key || "").toLowerCase();
      const b = document.createElement("button");
      const owned = isOwned(key);

      b.className = "btn skin-btn" +
        (key === (_selectedKey || "").toLowerCase() ? " active" : "") +
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
          const price = getCostBones(key);
          if (key === "default") skinDesc.textContent = "Default — clean Alpha.";
          else if (ownedNow) skinDesc.textContent = `${s.name || s.key} — owned.`;
          else if (price > 0) skinDesc.textContent = `${s.name || s.key} — locked. Buy to unlock (${price} bones).`;
          else skinDesc.textContent = `${s.name || s.key} — locked.`;
        }

        setPrimaryButtonState();
        haptic("light");
      });

      skinButtonsWrap.appendChild(b);
    });

    // select current equipped or first
    const eq = ((_equipped && _equipped.skin) || "").toLowerCase() || "default";
    _selectedKey = eq;

    const btn = skinButtonsWrap.querySelector(`[data-skin="${_selectedKey}"]`)
      || skinButtonsWrap.querySelector(".skin-btn");

    btn?.click?.();
  }

  async function open() {
    try {
      const out = await _apiPost("/webapp/skins", {});
      if (!out || !out.ok) throw new Error(out?.reason || "skins get failed");

      _catalog = Array.isArray(out.skins) ? out.skins : [];
      _owned = Array.isArray(out.owned) ? out.owned : ["default"];
      _equipped = (out.equipped && typeof out.equipped === "object") ? out.equipped : { skin: (out.active || "") };

      buildSkinButtons();
      avatarBack.style.display = "flex";
      setPrimaryButtonState();
    } catch (e) {
      console.warn(e);
      _tg?.showAlert?.("Failed to load skins.");
    }
  }

  async function onPrimaryAction() {
    const key = (_selectedKey || "").trim().toLowerCase();
    if (!key) return;

    try {
      // owned -> equip
      if (isOwned(key)) {
        const out = await _apiPost("/webapp/skins/equip", { skin: key === "default" ? "default" : key });
        if (!out || !out.ok) throw new Error(out?.reason || "equip failed");
        _tg?.showAlert?.("Skin equipped!");
        avatarBack.style.display = "none";
        try { window.loadProfile?.(); } catch (_) {}
        return;
      }

      // not owned -> buy
      const price = getCostBones(key);
      if (price <= 0) {
        _tg?.showAlert?.("This skin is locked.");
        return;
      }

      const outBuy = await _apiPost("/webapp/skins/buy", { skin: key });
      if (!outBuy || !outBuy.ok) throw new Error(outBuy?.reason || "buy failed");

      // refresh state after buy
      const out = await _apiPost("/webapp/skins", {});
      if (out && out.ok) {
        _owned = Array.isArray(out.owned) ? out.owned : _owned;
        _equipped = (out.equipped && typeof out.equipped === "object") ? out.equipped : _equipped;
      }

      _tg?.showAlert?.("Unlocked! Now equip it.");
      buildSkinButtons();
      setPrimaryButtonState();
      haptic("medium");

    } catch (e) {
      console.warn(e);
      const msg = (e && e.data && e.data.reason) ? e.data.reason : (e?.message || "Action failed");
      _tg?.showAlert?.(msg);
    }
  }

  function onShare() {
    if (!_tg?.shareToStory || !skinCanvas?.toBlob) {
      _tg?.showAlert?.("Sharing not supported");
      return;
    }
    const key = (_selectedKey || "skin").toLowerCase();
    skinCanvas.toBlob((blob) => {
      _tg?.shareToStory?.(blob, {
        text: `Flex my ${key} skin in @The_Alpha_Husky! 🐺`,
        widgetLink: "https://t.me/Alpha_husky_bot"
      });
      haptic("medium");
    }, "image/png");
  }

  window.Skins = { init, open };
})();
