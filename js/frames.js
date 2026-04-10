// js/frames.js - lightweight Frames modal (owned/equipped cosmetic slot)
(function () {
  let _apiPost = null;
  let _tg = null;
  let _dbg = false;
  let _bound = false;

  let framesBack;
  let closeBtn;
  let previewSkin;
  let previewFrame;
  let frameDesc;
  let equipBtn;
  let clearBtn;
  let frameButtonsWrap;

  let _catalog = [];
  let _owned = [];
  let _equipped = { frame: "" };
  let _selectedKey = "";

  function dbg(msg, obj) {
    if (_dbg) console.log("[Frames]", msg, obj ?? "");
  }

  function haptic(kind) {
    try { _tg?.HapticFeedback?.impactOccurred?.(kind || "light"); } catch (_) {}
  }

  function showAlert(msg) {
    try { _tg?.showAlert?.(msg); } catch (_) {}
  }

  function normKey(value) {
    return String(value || "").trim().toLowerCase();
  }

  function ensureCss() {
    if (document.getElementById("ah-frames-style")) return;
    const style = document.createElement("style");
    style.id = "ah-frames-style";
    style.textContent = `
      #framesBack .ah-frames-preview-wrap{
        width:min(360px, 88vw);
        margin:14px auto 10px;
      }
      #framesBack .ah-frames-preview{
        position:relative;
        width:100%;
        aspect-ratio: 2 / 3;
        border-radius:16px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        background:rgba(0,0,0,.35);
      }
      #framesBack .ah-frames-preview-skin,
      #framesBack .ah-frames-preview-frame{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        object-fit:cover;
      }
      #framesBack .ah-frames-preview-skin{
        object-fit:contain;
      }
      #framesBack .ah-frames-preview-frame{
        pointer-events:none;
      }
      #framesBack .ah-frames-help{
        text-align:center;
        opacity:.76;
        font-size:12px;
        margin:6px 0 10px;
      }
      #framesBack .frame-btn{
        white-space:nowrap;
      }
      #framesBack .frame-btn.active{
        background:var(--tg-theme-button-color, rgba(16,185,129,.18));
        color:var(--tg-theme-button-text-color, #fff);
      }
      #framesBack .frame-btn.locked{
        opacity:.62;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDom() {
    framesBack = document.getElementById("framesBack");
    if (!framesBack) {
      framesBack = document.createElement("div");
      framesBack.id = "framesBack";
      framesBack.className = "sheet-back avatar-sheet";
      framesBack.style.display = "none";
      framesBack.innerHTML = `
        <div class="sheet-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:700;">Frame Gallery</div>
            <button class="btn" id="closeFrames" type="button">X</button>
          </div>

          <div class="ah-frames-preview-wrap">
            <div class="ah-frames-preview">
              <img id="framePreviewSkin" class="ah-frames-preview-skin" alt="Skin preview" />
              <img id="framePreviewOverlay" class="ah-frames-preview-frame" alt="" style="display:none;" />
            </div>
          </div>

          <div id="frameDesc" style="text-align:center; opacity:.84; font-size:12px;">-</div>
          <div class="ah-frames-help">Frames are cosmetic only.</div>

          <div style="display:flex;gap:8px;justify-content:center;margin:10px 0;">
            <button class="btn primary" id="equipFrame" type="button">Equip Frame</button>
            <button class="btn" id="clearFrame" type="button">Clear</button>
          </div>

          <div id="frameButtons" class="skins-grid"></div>
        </div>
      `;
      document.body.appendChild(framesBack);
    }

    closeBtn = document.getElementById("closeFrames");
    previewSkin = document.getElementById("framePreviewSkin");
    previewFrame = document.getElementById("framePreviewOverlay");
    frameDesc = document.getElementById("frameDesc");
    equipBtn = document.getElementById("equipFrame");
    clearBtn = document.getElementById("clearFrame");
    frameButtonsWrap = document.getElementById("frameButtons");
  }

  function currentHeroSkinUrl() {
    const hero = document.getElementById("player-skin");
    const src = hero?.currentSrc || hero?.src || "";
    if (src) return src;
    const profile = window.__PROFILE__ || window.PROFILE || {};
    if (typeof profile?.skin === "string" && profile.skin) return profile.skin;
    if (profile?.skin?.img) return profile.skin.img;
    return "/assets/skins/lunarhowl_skin.webp";
  }

  function setPreview(frameUrl) {
    if (!previewSkin || !previewFrame) return;
    previewSkin.src = currentHeroSkinUrl();
    if (frameUrl) {
      previewFrame.src = frameUrl;
      previewFrame.style.display = "block";
    } else {
      previewFrame.removeAttribute("src");
      previewFrame.style.display = "none";
    }
  }

  function framePreviewUrl(item) {
    return String(
      item?.preview_url ||
      item?.previewUrl ||
      item?.img ||
      item?.frame_url ||
      item?.frameUrl ||
      ""
    ).trim();
  }

  function frameDisplayName(item) {
    return String(item?.display_name || item?.displayName || item?.name || item?.key || "Frame").trim();
  }

  function frameSourceLabel(item) {
    return String(item?.source || item?.source_label || item?.sourceLabel || "").trim();
  }

  function isOwnedKey(key) {
    const k = normKey(key);
    if (!k || k === "default") return true;
    return Array.isArray(_owned) && _owned.includes(k);
  }

  function frameOwned(item, key) {
    const k = normKey(key);
    if (!k || k === "default") return true;
    if (typeof item?.effective === "boolean") return !!item.effective;
    if (typeof item?.owned === "boolean") return !!item.owned;
    return isOwnedKey(k);
  }

  function close() {
    if (!framesBack) return;
    framesBack.style.display = "none";
  }

  function setPrimaryState() {
    if (!equipBtn) return;
    const k = normKey(_selectedKey);
    const equipped = normKey(_equipped?.frame || "");

    if (!k) {
      equipBtn.disabled = true;
      equipBtn.textContent = "Pick a frame";
      return;
    }
    if (k === equipped) {
      equipBtn.disabled = true;
      equipBtn.textContent = k === "default" ? "No Frame Equipped" : "Equipped";
      return;
    }
    if (k === "default") {
      equipBtn.disabled = false;
      equipBtn.textContent = "Use No Frame";
      return;
    }
    if (isOwnedKey(k)) {
      equipBtn.disabled = false;
      equipBtn.textContent = "Equip Frame";
      return;
    }
    equipBtn.disabled = true;
    equipBtn.textContent = "Locked";
  }

  function buildButtons() {
    if (!frameButtonsWrap) return;
    frameButtonsWrap.innerHTML = "";

    const all = [{ key: "default", display_name: "No Frame", preview_url: "", source: "" }, ...(_catalog || [])];
    const equippedKey = normKey(_equipped?.frame || "") || "default";

    all.forEach((item) => {
      const key = normKey(item?.key);
      const owned = frameOwned(item, key);
      const equipped = key === equippedKey;
      const name = frameDisplayName(item);
      const source = frameSourceLabel(item);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn skin-btn frame-btn" + (owned ? "" : " locked");
      button.dataset.frame = key;
      button.textContent = `${name}${equipped ? " [equipped]" : (owned || key === "default" ? "" : " [locked]")}`;
      button.addEventListener("click", () => {
        frameButtonsWrap.querySelectorAll(".frame-btn").forEach((el) => el.classList.remove("active"));
        button.classList.add("active");
        _selectedKey = key;

        if (frameDesc) {
          if (key === "default") {
            frameDesc.textContent = "No frame equipped.";
          } else if (owned && equipped) {
            frameDesc.textContent = `${name}${source ? ` - ${source}` : ""} - equipped.`;
          } else if (owned) {
            frameDesc.textContent = `${name}${source ? ` - ${source}` : ""} - unlocked.`;
          } else {
            frameDesc.textContent = `${name}${source ? ` - ${source}` : ""} - locked.`;
          }
        }

        setPreview(framePreviewUrl(item));
        setPrimaryState();
        haptic("light");
      });
      frameButtonsWrap.appendChild(button);
    });

    const eq = normKey(_equipped?.frame || "") || "default";
    _selectedKey = eq;
    const btn =
      frameButtonsWrap.querySelector(`[data-frame="${_selectedKey}"]`) ||
      frameButtonsWrap.querySelector(".frame-btn");
    btn?.click?.();
  }

  async function reloadState(preferKey) {
    if (!_apiPost) throw new Error("NO_API_POST");
    const out = await _apiPost("/webapp/frames", {});
    if (!out || !out.ok) throw new Error(out?.reason || "frames_get_failed");

    _catalog = Array.isArray(out.frames) ? out.frames : [];
    _owned = Array.isArray(out.owned) ? out.owned.map(normKey) : ["default"];
    _equipped = (out.equipped && typeof out.equipped === "object")
      ? out.equipped
      : { frame: (out.active || "") };

    buildButtons();
    const wanted = normKey(preferKey);
    if (wanted && frameButtonsWrap) {
      const btn = [...frameButtonsWrap.querySelectorAll(".frame-btn")]
        .find((x) => normKey(x.dataset.frame) === wanted);
      btn?.click?.();
    }
  }

  async function equipSelected(forceKey) {
    const key = normKey(forceKey || _selectedKey);
    if (!key) return;
    if (!_apiPost) {
      showAlert("Frames are not ready yet.");
      return;
    }
    if (key !== "default" && !isOwnedKey(key)) {
      showAlert("This frame is locked.");
      return;
    }

    const out = await _apiPost("/webapp/frames/equip", { frame: key === "default" ? "default" : key });
    if (!out || !out.ok) throw new Error(out?.reason || "equip_failed");

    showAlert(key === "default" ? "Frame cleared." : "Frame equipped!");
    close();
    try { await window.loadProfile?.(); } catch (_) {}
    haptic("medium");
  }

  async function open() {
    if (!_apiPost) {
      showAlert("Frames are not ready yet.");
      return;
    }
    try {
      await reloadState();
      if (framesBack) framesBack.style.display = "flex";
      setPrimaryState();
    } catch (err) {
      dbg("open failed", err);
      showAlert("Failed to load frames.");
    }
  }

  function init({ apiPost, tg, dbg: debugFlag } = {}) {
    _apiPost = apiPost || window.S?.apiPost || _apiPost || null;
    _tg = tg || window.Telegram?.WebApp || _tg || null;
    _dbg = !!debugFlag;

    ensureCss();
    ensureDom();
    if (_bound) return true;
    _bound = true;

    framesBack?.addEventListener("click", (e) => {
      if (e.target === framesBack) close();
    });
    closeBtn?.addEventListener("click", close);
    equipBtn?.addEventListener("click", () => {
      equipSelected().catch((err) => {
        dbg("equip failed", err);
        showAlert(err?.message || "Failed to equip frame.");
      });
    });
    clearBtn?.addEventListener("click", () => {
      equipSelected("default").catch((err) => {
        dbg("clear failed", err);
        showAlert(err?.message || "Failed to clear frame.");
      });
    });

    return true;
  }

  window.Frames = { init, open };
})();
