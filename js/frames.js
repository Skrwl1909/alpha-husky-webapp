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
  let frameInfoName;
  let frameInfoMeta;
  let frameStateChip;
  let equipBtn;
  let clearBtn;
  let frameButtonsWrap;

  let _catalog = [];
  let _owned = [];
  let _equipped = { frame: "" };
  let _selectedKey = "";
  const FRAME_PREVIEW_SKIN_FIT_DEFAULT = Object.freeze({ scale: 0.9, offsetX: 0, offsetY: 0 });
  const FRAME_PREVIEW_SKIN_FIT_OVERRIDES = Object.freeze({
    rogue_byte_overclock: { scale: 0.96, offsetX: 0, offsetY: -6 }, // map-influence frame tuning example
  });

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

  function frameKeyFromUrl(url) {
    const input = String(url || "").trim();
    if (!input) return "";
    const m = input.match(/\/frames\/([a-z0-9_:-]+)\.(?:webp|png|jpg|jpeg)(?:[?#].*)?$/i);
    return normKey(m?.[1] || "");
  }

  function fitNum(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeFit(raw, fallback) {
    const base = fallback || FRAME_PREVIEW_SKIN_FIT_DEFAULT;
    return {
      scale: fitNum(raw?.scale, base.scale),
      offsetX: fitNum(raw?.offsetX, base.offsetX),
      offsetY: fitNum(raw?.offsetY, base.offsetY),
    };
  }

  function ensureCss() {
    if (document.getElementById("ah-frames-style")) return;
    const style = document.createElement("style");
    style.id = "ah-frames-style";
    style.textContent = `
      #framesBack .sheet-card{
        overflow-x:hidden;
        padding-bottom:calc(14px + var(--ah-safe-bottom, 0px));
      }
      #framesBack .ah-frames-preview-wrap{
        width:min(368px, 88vw);
        margin:12px auto 8px;
        animation:ahFrameStageIn .22s ease-out both;
      }
      #framesBack .ah-frames-preview{
        position:relative;
        width:100%;
        aspect-ratio: 2 / 3;
        border-radius:18px;
        overflow:hidden;
        isolation:isolate;
        border:1px solid rgba(255,255,255,.14);
        background:
          radial-gradient(130% 90% at 50% 18%, rgba(255,255,255,.11) 0%, rgba(255,255,255,0) 55%),
          linear-gradient(180deg, rgba(11,14,22,.96), rgba(3,5,10,.96));
        box-shadow:0 18px 42px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.06);
      }
      #framesBack .ah-frames-preview::before{
        content:"";
        position:absolute;
        inset:-12% -8% 26%;
        background:radial-gradient(closest-side, rgba(130,151,196,.26), rgba(130,151,196,0));
        pointer-events:none;
        z-index:0;
      }
      #framesBack .ah-frames-preview::after{
        content:"";
        position:absolute;
        inset:0;
        background:
          radial-gradient(120% 110% at 50% 110%, rgba(0,0,0,0) 48%, rgba(0,0,0,.44) 100%),
          linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.26));
        pointer-events:none;
        z-index:3;
      }
      #framesBack .ah-frames-preview-skin,
      #framesBack .ah-frames-preview-frame{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
      }
      #framesBack .ah-frames-preview-skin{
        z-index:1;
        object-fit:contain;
        object-position:center 38%;
        transform:scale(.9);
        transform-origin:center center;
        filter:drop-shadow(0 12px 18px rgba(0,0,0,.36));
      }
      #framesBack .ah-frames-preview-frame{
        z-index:2;
        object-fit:contain;
        object-position:center center;
        transform:scale(.95);
        transform-origin:center center;
        filter:drop-shadow(0 8px 14px rgba(0,0,0,.30));
        pointer-events:none;
      }
      #framesBack .ah-frame-info{
        width:min(368px, 88vw);
        margin:8px auto 6px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.11);
        background:linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
      }
      #framesBack .ah-frame-info-top{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
      }
      #framesBack .ah-frame-info-name{
        min-width:0;
        font-size:14px;
        font-weight:700;
        letter-spacing:.01em;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      #framesBack .ah-frame-info-meta{
        margin-top:4px;
        font-size:12px;
        color:rgba(230,238,255,.74);
      }
      #framesBack .ah-frame-chip{
        flex:0 0 auto;
        border-radius:999px;
        padding:2px 8px;
        font-size:11px;
        font-weight:700;
        border:1px solid rgba(255,255,255,.22);
        background:rgba(255,255,255,.07);
        color:rgba(255,255,255,.92);
      }
      #framesBack .ah-frames-help{
        text-align:center;
        opacity:.72;
        font-size:12px;
        margin:4px 0 10px;
      }
      #framesBack #frameButtons.skins-grid{
        display:grid;
        grid-template-columns:repeat(2, minmax(0,1fr));
        gap:8px;
        margin:10px 0 2px;
      }
      #framesBack .frame-btn.ah-frame-tile{
        display:flex;
        flex-direction:column;
        align-items:stretch;
        gap:6px;
        min-height:118px;
        text-align:left;
        white-space:normal;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
        transition:border-color .18s ease, box-shadow .18s ease, transform .18s ease, opacity .18s ease, filter .18s ease;
      }
      #framesBack .frame-btn.ah-frame-tile.equipped{
        border-color:rgba(147,197,253,.44);
      }
      #framesBack .frame-btn.ah-frame-tile.active{
        border-color:rgba(196,232,255,.8);
        box-shadow:0 0 0 1px rgba(196,232,255,.24), 0 8px 18px rgba(0,0,0,.24);
      }
      #framesBack .frame-btn.ah-frame-tile.locked{
        opacity:.6;
        filter:grayscale(.5);
      }
      #framesBack .ah-frame-thumb{
        position:relative;
        height:56px;
        border-radius:10px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.08);
        background:
          radial-gradient(100% 70% at 50% 22%, rgba(255,255,255,.10), rgba(255,255,255,0)),
          linear-gradient(180deg, rgba(13,17,26,.94), rgba(6,9,15,.94));
        display:flex;
        align-items:center;
        justify-content:center;
      }
      #framesBack .ah-frame-thumb img{
        width:100%;
        height:100%;
        object-fit:contain;
        object-position:center;
        opacity:.95;
        pointer-events:none;
      }
      #framesBack .ah-frame-thumb-empty{
        font-size:10px;
        font-weight:700;
        letter-spacing:.06em;
        text-transform:uppercase;
        color:rgba(255,255,255,.65);
      }
      #framesBack .ah-frame-title{
        font-size:12px;
        font-weight:700;
        line-height:1.2;
        color:rgba(247,251,255,.95);
        display:-webkit-box;
        -webkit-line-clamp:2;
        -webkit-box-orient:vertical;
        overflow:hidden;
      }
      #framesBack .ah-frame-state{
        align-self:flex-start;
        border-radius:999px;
        padding:2px 7px;
        font-size:10px;
        font-weight:700;
        letter-spacing:.03em;
        border:1px solid rgba(255,255,255,.2);
        background:rgba(255,255,255,.06);
        color:rgba(255,255,255,.9);
      }
      #framesBack .ah-frame-state.is-equipped,
      #framesBack .ah-frame-chip.is-equipped{
        border-color:rgba(196,232,255,.72);
        background:rgba(196,232,255,.2);
        color:rgba(225,244,255,.98);
      }
      #framesBack .ah-frame-state.is-selected,
      #framesBack .ah-frame-chip.is-selected{
        border-color:rgba(255,255,255,.42);
        background:rgba(255,255,255,.12);
      }
      #framesBack .ah-frame-state.is-locked,
      #framesBack .ah-frame-chip.is-locked{
        border-color:rgba(255,255,255,.18);
        background:rgba(255,255,255,.04);
        color:rgba(255,255,255,.7);
      }
      @keyframes ahFrameStageIn{
        from{ opacity:.75; transform:translateY(4px) scale(.995); }
        to{ opacity:1; transform:translateY(0) scale(1); }
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

          <div class="ah-frame-info">
            <div class="ah-frame-info-top">
              <div id="frameInfoName" class="ah-frame-info-name">No Frame</div>
              <span id="frameStateChip" class="ah-frame-chip">Base</span>
            </div>
            <div id="frameInfoMeta" class="ah-frame-info-meta">Base · Cosmetic frame</div>
          </div>
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
    frameInfoName = document.getElementById("frameInfoName");
    frameInfoMeta = document.getElementById("frameInfoMeta");
    frameStateChip = document.getElementById("frameStateChip");
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

  function setPreview(item) {
    if (!previewSkin || !previewFrame) return;
    const frameUrl = framePreviewUrl(item);
    const frameKey = frameKeyForFit(item);
    applyPreviewSkinFit(frameKey);
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

  function frameKeyForFit(item) {
    const direct =
      item?.key ||
      item?.frame_key ||
      item?.frameKey ||
      item?.frame ||
      "";
    const k = normKey(direct);
    if (k && k !== "default" && !k.includes("/") && !k.includes(".")) return k;
    return frameKeyFromUrl(framePreviewUrl(item));
  }

  function getPreviewSkinFit(frameKey) {
    const cfg = window.__AH_FRAME_PREVIEW_SKIN_FIT__ || {};
    const defaultFit = normalizeFit(cfg.default, FRAME_PREVIEW_SKIN_FIT_DEFAULT);
    const k = normKey(frameKey);
    const override = k ? (cfg?.overrides?.[k] || FRAME_PREVIEW_SKIN_FIT_OVERRIDES[k]) : null;
    return normalizeFit(override, defaultFit);
  }

  function applyPreviewSkinFit(frameKey) {
    if (!previewSkin) return;
    const fit = getPreviewSkinFit(frameKey);
    previewSkin.style.transform = `translate(${fit.offsetX}px, ${fit.offsetY}px) scale(${fit.scale})`;
  }

  function frameLaneLabel(item, key) {
    const k = normKey(key);
    const src = frameSourceLabel(item);
    const source = src.toLowerCase();
    if (k === "default") return "Base";
    if (k === "founder_ember_mark" || source.includes("founder")) return "Founder";
    if (k === "believe_support_frame" || source.includes("support")) return "Support";
    if (k === "believe_holder_frame" || source.includes("holder") || source.includes("believe")) return "Believer";
    if (
      k === "rogue_byte_overclock" ||
      k === "echo_warden_reliquary" ||
      k === "inner_howl_mooncrest" ||
      k === "pack_burner_ashline" ||
      source.includes("faction") ||
      source.includes("influence") ||
      source.includes("weekly")
    ) return "Faction";
    return src || "Cosmetic";
  }

  function frameStateMeta({ key, owned, equipped, selected }) {
    if (key === "default") {
      if (equipped) return { label: "Equipped", className: "is-equipped" };
      if (selected) return { label: "Selected", className: "is-selected" };
      return { label: "Base", className: "is-owned" };
    }
    if (!owned) return { label: "Locked", className: "is-locked" };
    if (equipped) return { label: "Equipped", className: "is-equipped" };
    if (selected) return { label: "Selected", className: "is-selected" };
    return { label: "Owned", className: "is-owned" };
  }

  function refreshButtonStates() {
    if (!frameButtonsWrap) return;
    const selectedKey = normKey(_selectedKey);
    const equippedKey = normKey(_equipped?.frame || "") || "default";

    frameButtonsWrap.querySelectorAll(".frame-btn").forEach((button) => {
      const key = normKey(button.dataset.frame);
      const owned = button.dataset.owned === "1";
      const selected = key === selectedKey;
      const equipped = key === equippedKey;
      const state = frameStateMeta({ key, owned, equipped, selected });
      const chip = button.querySelector(".ah-frame-state");

      button.classList.toggle("active", selected);
      button.classList.toggle("equipped", equipped);

      if (chip) {
        chip.textContent = state.label;
        chip.className = `ah-frame-state ${state.className}`;
      }
    });
  }

  function setFrameInfo(item, key, owned) {
    const k = normKey(key);
    const lane = frameLaneLabel(item, k);
    const source = frameSourceLabel(item);
    const state = frameStateMeta({
      key: k,
      owned,
      selected: k === normKey(_selectedKey),
      equipped: k === (normKey(_equipped?.frame || "") || "default"),
    });

    if (frameInfoName) {
      frameInfoName.textContent = k === "default" ? "No Frame" : frameDisplayName(item);
    }
    if (frameInfoMeta) {
      const parts = [lane, "Cosmetic frame"];
      if (source && source.toLowerCase() !== lane.toLowerCase()) parts.push(source);
      frameInfoMeta.textContent = parts.join(" · ");
    }
    if (frameStateChip) {
      frameStateChip.textContent = state.label;
      frameStateChip.className = `ah-frame-chip ${state.className}`;
    }
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

    all.forEach((item) => {
      const key = normKey(item?.key);
      const owned = frameOwned(item, key);
      const name = frameDisplayName(item);
      const previewUrl = framePreviewUrl(item);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn skin-btn frame-btn ah-frame-tile" + (owned ? "" : " locked");
      button.dataset.frame = key;
      button.dataset.owned = owned ? "1" : "0";

      const thumb = document.createElement("div");
      thumb.className = "ah-frame-thumb";
      if (previewUrl && key !== "default") {
        const thumbImg = document.createElement("img");
        thumbImg.src = previewUrl;
        thumbImg.alt = "";
        thumb.appendChild(thumbImg);
      } else {
        const empty = document.createElement("div");
        empty.className = "ah-frame-thumb-empty";
        empty.textContent = key === "default" ? "No Frame" : "Preview";
        thumb.appendChild(empty);
      }

      const title = document.createElement("div");
      title.className = "ah-frame-title";
      title.textContent = name;

      const chip = document.createElement("span");
      chip.className = "ah-frame-state";

      button.appendChild(thumb);
      button.appendChild(title);
      button.appendChild(chip);
      button.addEventListener("click", () => {
        _selectedKey = key;
        refreshButtonStates();
        setFrameInfo(item, key, owned);
        setPreview(item);
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
