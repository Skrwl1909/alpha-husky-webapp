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
  let howlBuyBtn;
  let howlPayPanel;
  let howlPayAmount;
  let howlPayTimer;
  let howlPayStatus;
  let howlPayLink;
  let howlPayQr;
  let howlOpenBtn;
  let howlCopyBtn;
  let howlCheckBtn;
  let frameButtonsWrap;

  let _catalog = [];
  let _owned = [];
  let _equipped = { frame: "" };
  let _selectedKey = "";
  let _selectedItem = null;
  let _howlPayment = null;
  let _howlPollTimer = null;
  let _howlCountdownTimer = null;
  let _howlPollStartedAt = 0;
  let _howlInitInFlight = false;
  const HOWL_GENESIS_FRAME_KEY = "genesis_frame";
  const HOWL_POLL_MS = 9000;
  const HOWL_POLL_TIMEOUT_MS = 12 * 60 * 1000;
  const HOWL_QR_TOTAL_CODEWORDS = Object.freeze([
    0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346,
    404, 466, 532, 581, 655, 733, 815, 901, 991, 1085,
  ]);
  const HOWL_QR_M_ECC_PER_BLOCK = Object.freeze([
    0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26,
    30, 22, 22, 24, 24, 28, 28, 26, 26, 26,
  ]);
  const HOWL_QR_M_BLOCKS = Object.freeze([
    0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5,
    5, 8, 9, 9, 10, 10, 11, 13, 14, 16,
  ]);
  const SKIN_PREVIEW_FIT_DEFAULT = Object.freeze({ scale: 1, offsetX: 0, offsetY: 0 });
  const SKIN_PREVIEW_FIT_OVERRIDES = Object.freeze({
    unbroken_alpha: { scale: 1.03, offsetX: 0, offsetY: -3 },
  });
  const FRAME_PREVIEW_FIT_DEFAULT = Object.freeze({ scale: 0.82, offsetX: 0, offsetY: 4 });
  const FRAME_PREVIEW_FIT_OVERRIDES = Object.freeze({
    pioneer_frame: { scale: 0.82, offsetX: 0, offsetY: 4 },
    rogue_byte_overclock: { scale: 0.82, offsetX: 0, offsetY: 4 }, // map-influence frame tuning example
  });
  const COMBO_PREVIEW_FIT_DEFAULT = Object.freeze({ scale: 1, offsetX: 0, offsetY: 0 });
  const COMBO_PREVIEW_FIT_OVERRIDES = Object.freeze({
    "unbroken_alpha::founder_ember_mark": { scale: 1.01, offsetX: 0, offsetY: -2 },
    "unbroken_alpha::rogue_byte_overclock": { scale: 1.04, offsetX: 0, offsetY: 5 },
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

  function frameAssetOverrides() {
    const raw = window.__AH_FRAME_ASSET_OVERRIDES__;
    return raw && typeof raw === "object" ? raw : {};
  }

  function frameAssetOverride(frameKey) {
    const key = normKey(frameKey);
    if (!key) return null;
    const raw = frameAssetOverrides()[key];
    if (!raw || typeof raw !== "object") return null;
    return {
      key,
      displayName: String(raw.display_name || raw.displayName || raw.name || "").trim(),
      source: String(raw.source || "").trim(),
      base: String(raw.base || raw.frame_url || raw.frameUrl || raw.preview || "").trim(),
      glow: String(raw.glow || "").trim(),
      sweep: String(raw.sweep || "").trim(),
      preview: String(raw.preview || raw.base || raw.frame_url || raw.frameUrl || "").trim(),
    };
  }

  function frameKeyFromUrl(url) {
    const input = String(url || "").trim();
    if (!input) return "";
    const m = input.match(/\/frames\/([a-z0-9_:-]+)\.(?:webp|png|jpg|jpeg)(?:[?#].*)?$/i);
    if (m?.[1]) return normKey(m[1]);
    const lowered = input.toLowerCase();
    const overrides = frameAssetOverrides();
    for (const [key, raw] of Object.entries(overrides)) {
      if (!raw || typeof raw !== "object") continue;
      const candidates = [raw.base, raw.frame_url, raw.frameUrl, raw.preview, raw.glow, raw.sweep];
      const matched = candidates.some((candidate) => {
        const value = String(candidate || "").trim().toLowerCase();
        return !!value && lowered.includes(value);
      });
      if (matched) return normKey(key);
    }
    return "";
  }

  function skinKeyFromUrl(url) {
    const input = String(url || "").trim();
    if (!input) return "";
    const m = input.match(/\/skins\/([a-z0-9_:-]+)\.(?:webp|png|jpg|jpeg|avif|gif)(?:[?#].*)?$/i);
    return normKey(m?.[1] || "");
  }

  function fitNum(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeFit(raw, fallback) {
    const base = fallback || FRAME_PREVIEW_FIT_DEFAULT;
    return {
      scale: fitNum(raw?.scale, base.scale),
      offsetX: fitNum(raw?.offsetX, base.offsetX),
      offsetY: fitNum(raw?.offsetY, base.offsetY),
    };
  }

  function skinFrameComboKey(skinKey, frameKey) {
    const sk = normKey(skinKey);
    const fk = normKey(frameKey);
    if (!sk || !fk || fk === "default") return "";
    return `${sk}::${fk}`;
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
        display:block;
        max-width:none;
        object-fit:contain;
        object-position:center center;
        transform-origin:center center;
      }
      #framesBack .ah-frames-preview-skin{
        inset:6% 10% 6%;
        width:auto;
        height:auto;
        z-index:1;
        transform:scale(.82) translateY(4px);
        filter:drop-shadow(0 12px 18px rgba(0,0,0,.36));
      }
      #framesBack .ah-frames-preview-frame{
        z-index:2;
        transform:none;
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
      #framesBack .ah-howl-buy{
        display:none;
      }
      #framesBack .ah-howl-buy.is-visible{
        display:inline-flex;
      }
      #framesBack .ah-howl-pay-panel{
        display:none;
        width:min(368px, 88vw);
        margin:8px auto 10px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.14);
        background:linear-gradient(180deg, rgba(255,255,255,.065), rgba(255,255,255,.025));
      }
      #framesBack .ah-howl-pay-panel.is-open{
        display:block;
      }
      #framesBack .ah-howl-pay-top{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        margin-bottom:8px;
      }
      #framesBack .ah-howl-pay-title{
        font-size:13px;
        font-weight:800;
        color:rgba(247,251,255,.96);
      }
      #framesBack .ah-howl-pay-meta,
      #framesBack .ah-howl-pay-status,
      #framesBack .ah-howl-pay-safety{
        font-size:11px;
        line-height:1.35;
        color:rgba(230,238,255,.74);
      }
      #framesBack .ah-howl-pay-status{
        margin:7px 0;
        color:rgba(240,249,255,.88);
      }
      #framesBack .ah-howl-pay-link-wrap{
        margin:8px 0;
      }
      #framesBack .ah-howl-pay-label{
        margin-bottom:4px;
        font-size:10px;
        line-height:1.25;
        text-transform:uppercase;
        letter-spacing:0;
        color:rgba(230,238,255,.58);
      }
      #framesBack .ah-howl-pay-link{
        width:100%;
        min-height:54px;
        resize:vertical;
        border-radius:8px;
        border:1px solid rgba(255,255,255,.14);
        background:rgba(0,0,0,.22);
        color:rgba(244,249,255,.9);
        font-size:10px;
        line-height:1.35;
        padding:7px 8px;
        box-sizing:border-box;
      }
      #framesBack .ah-howl-pay-qr{
        display:flex;
        align-items:center;
        flex-wrap:wrap;
        gap:9px;
        margin:8px 0;
        padding:8px;
        border-radius:8px;
        border:1px dashed rgba(255,255,255,.16);
        background:rgba(255,255,255,.035);
      }
      #framesBack .ah-howl-pay-qr-svg{
        flex:0 0 auto;
        width:min(176px, 52vw);
        max-width:176px;
        min-width:132px;
        aspect-ratio:1;
        display:block;
        border-radius:8px;
        background:#fff;
        padding:6px;
        box-sizing:border-box;
      }
      #framesBack .ah-howl-pay-qr-box{
        flex:0 0 auto;
        width:132px;
        height:132px;
        display:grid;
        place-items:center;
        border-radius:7px;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(0,0,0,.22);
        color:rgba(255,255,255,.72);
        font-size:11px;
        font-weight:800;
      }
      #framesBack .ah-howl-pay-qr-copy{
        flex:1 1 128px;
        min-width:0;
      }
      #framesBack .ah-howl-pay-actions{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin:8px 0;
      }
      #framesBack .ah-howl-pay-actions .btn{
        min-height:32px;
        padding:7px 9px;
        font-size:12px;
      }
      #framesBack .ah-howl-pay-safety{
        margin-top:7px;
        color:rgba(230,238,255,.68);
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
            <div class="ah-frames-preview frame-preview-card">
              <img id="framePreviewSkin" class="ah-frames-preview-skin frame-preview-portrait" alt="Skin preview" />
              <img id="framePreviewOverlay" class="ah-frames-preview-frame frame-preview-frame" alt="" style="display:none;" />
            </div>
          </div>

          <div class="ah-frame-info">
            <div class="ah-frame-info-top">
              <div id="frameInfoName" class="ah-frame-info-name">No Frame</div>
              <span id="frameStateChip" class="ah-frame-chip">Base</span>
            </div>
            <div id="frameInfoMeta" class="ah-frame-info-meta">Base · Cosmetic frame</div>
          </div>
          <div class="ah-frames-help">Frames are cosmetic only. Previewed on your current hero skin.</div>

          <div style="display:flex;gap:8px;justify-content:center;margin:10px 0;">
            <button class="btn primary" id="equipFrame" type="button">Equip Frame</button>
            <button class="btn primary ah-howl-buy" id="buyHowlFrame" type="button">Buy with $HOWL</button>
            <button class="btn" id="clearFrame" type="button">Clear</button>
          </div>

          <div id="howlPayPanel" class="ah-howl-pay-panel" aria-live="polite">
            <div class="ah-howl-pay-top">
              <div>
                <div class="ah-howl-pay-title">HOWL Genesis Frame</div>
                <div class="ah-howl-pay-meta">Amount: <span id="howlPayAmount">-</span> HOWL</div>
              </div>
              <div id="howlPayTimer" class="ah-howl-pay-meta"></div>
            </div>
            <div id="howlPayStatus" class="ah-howl-pay-status">Payment link ready.</div>
            <div class="ah-howl-pay-link-wrap">
              <div class="ah-howl-pay-label">Solana Pay link</div>
              <textarea id="howlPayLink" class="ah-howl-pay-link" readonly rows="2" spellcheck="false"></textarea>
            </div>
            <div id="howlPayQr" class="ah-howl-pay-qr" aria-live="polite"></div>
            <div class="ah-howl-pay-actions">
              <button class="btn primary" id="howlOpenPayment" type="button">Open Phantom</button>
              <button class="btn" id="howlCopyPayment" type="button">Copy Payment Link</button>
              <button class="btn" id="howlCheckPayment" type="button">Check Payment</button>
            </div>
            <div class="ah-howl-pay-safety">
              Open with mobile Phantom or copy the payment link. Desktop Phantom may open the wallet without showing payment confirmation.
              Cosmetic only. No power. Never share your seed phrase. Wrong token or wrong address cannot be auto-credited.
            </div>
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
    howlBuyBtn = document.getElementById("buyHowlFrame");
    howlPayPanel = document.getElementById("howlPayPanel");
    howlPayAmount = document.getElementById("howlPayAmount");
    howlPayTimer = document.getElementById("howlPayTimer");
    howlPayStatus = document.getElementById("howlPayStatus");
    howlPayLink = document.getElementById("howlPayLink");
    howlPayQr = document.getElementById("howlPayQr");
    howlOpenBtn = document.getElementById("howlOpenPayment");
    howlCopyBtn = document.getElementById("howlCopyPayment");
    howlCheckBtn = document.getElementById("howlCheckPayment");
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

  function currentHeroSkinKey() {
    const hero = document.getElementById("player-skin");
    const attrKey = normKey(hero?.dataset?.skinKey || hero?.getAttribute?.("data-skin-key") || "");
    if (attrKey && !attrKey.includes("/") && !attrKey.includes(".")) return attrKey;

    const profile = window.__PROFILE__ || window.PROFILE || {};
    const rawKey = normKey(
      profile?.skinKey ||
      profile?.skin_key ||
      profile?.cosmetics?.skinKey ||
      profile?.cosmetics?.skin_key ||
      profile?.skin?.key ||
      profile?.activeSkin?.key ||
      ""
    );
    if (rawKey && !rawKey.includes("/") && !rawKey.includes(".")) return rawKey;

    const fromProfileUrl = skinKeyFromUrl(
      (typeof profile?.skin === "string" ? profile.skin : profile?.skin?.img) || ""
    );
    if (fromProfileUrl) return fromProfileUrl;

    return skinKeyFromUrl(currentHeroSkinUrl());
  }

  function setPreviewSkinSource() {
    if (!previewSkin) return;
    const src = currentHeroSkinUrl();
    previewSkin.onerror = () => {
      previewSkin.onerror = null;
      previewSkin.src = "/assets/skins/lunarhowl_skin.webp";
    };
    previewSkin.src = src || "/assets/skins/lunarhowl_skin.webp";
    previewSkin.style.display = "block";
  }

  function setPreview(item) {
    if (!previewSkin || !previewFrame) return;
    const frameUrl = framePreviewUrl(item);
    const frameKey = frameKeyForFit(item);
    const skinKey = currentHeroSkinKey();
    applyPreviewSkinFit(frameKey, skinKey);
    setPreviewSkinSource();
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

  function frameKeyFromItem(item) {
    const direct =
      item?.key ||
      item?.frame_key ||
      item?.frameKey ||
      item?.frame ||
      "";
    const k = normKey(direct);
    if (k && !k.includes("/") && !k.includes(".")) return k;
    return frameKeyFromUrl(framePreviewUrl(item));
  }

  function applyFrameAssetOverride(item) {
    const entry = item && typeof item === "object" ? { ...item } : {};
    const key = frameKeyFromItem(entry);
    if (!key || key === "default") return entry;
    if (!entry.key) entry.key = key;
    const override = frameAssetOverride(key);
    if (!override) return entry;
    if (!String(entry.display_name || entry.displayName || entry.name || "").trim() && override.displayName) {
      entry.display_name = override.displayName;
    }
    if (!String(entry.source || entry.source_label || entry.sourceLabel || "").trim() && override.source) {
      entry.source = override.source;
    }
    if (!String(entry.frame_url || entry.frameUrl || "").trim() && override.base) {
      entry.frame_url = override.base;
    }
    if (!String(entry.preview_url || entry.previewUrl || entry.img || "").trim() && override.preview) {
      entry.preview_url = override.preview;
    }
    return entry;
  }

  function mergeCatalogWithFrameOverrides(catalog, explicitKeys) {
    const list = Array.isArray(catalog) ? catalog : [];
    const merged = list.map((item) => applyFrameAssetOverride(item));
    const presentKeys = new Set(
      merged.map((item) => frameKeyFromItem(item)).filter(Boolean)
    );
    const keys = Array.isArray(explicitKeys) ? explicitKeys : [];
    for (const rawKey of keys) {
      const key = normKey(rawKey);
      if (!key || key === "default" || presentKeys.has(key)) continue;
      const override = frameAssetOverride(key);
      if (!override || !override.base) continue;
      merged.push({
        key,
        display_name: override.displayName || key,
        source: override.source || "",
        frame_url: override.base,
        preview_url: override.preview || override.base,
      });
      presentKeys.add(key);
    }
    return merged;
  }

  function getPreviewFrameFit(frameKey) {
    const cfg = window.__AH_FRAME_PREVIEW_FIT__ || window.__AH_FRAME_PREVIEW_SKIN_FIT__ || {};
    const defaultFit = normalizeFit(cfg.default, FRAME_PREVIEW_FIT_DEFAULT);
    const k = normKey(frameKey);
    const override = k ? (cfg?.overrides?.[k] || FRAME_PREVIEW_FIT_OVERRIDES[k]) : null;
    return normalizeFit(override, defaultFit);
  }

  function getPreviewSkinBaseFit(skinKey) {
    const cfg = window.__AH_SKIN_PREVIEW_FIT__ || {};
    const defaultFit = normalizeFit(cfg.default, SKIN_PREVIEW_FIT_DEFAULT);
    const k = normKey(skinKey);
    const override = k ? (cfg?.overrides?.[k] || SKIN_PREVIEW_FIT_OVERRIDES[k]) : null;
    return normalizeFit(override, defaultFit);
  }

  function getPreviewComboFit(skinKey, frameKey) {
    const cfg = window.__AH_SKIN_FRAME_PREVIEW_COMBO_FIT__ || window.__AH_SKIN_FRAME_COMBO_FIT__ || {};
    const defaultFit = normalizeFit(cfg.default, COMBO_PREVIEW_FIT_DEFAULT);
    const comboKey = skinFrameComboKey(skinKey, frameKey);
    const override = comboKey ? (cfg?.overrides?.[comboKey] || COMBO_PREVIEW_FIT_OVERRIDES[comboKey]) : null;
    return normalizeFit(override, defaultFit);
  }

  function composePreviewFit(frameKey, skinKey) {
    const resolvedFrameKey = normKey(frameKey);
    const frameFit = getPreviewFrameFit(resolvedFrameKey);
    return {
      scale: frameFit.scale,
      offsetX: frameFit.offsetX,
      offsetY: frameFit.offsetY,
    };
  }

  function applyPreviewSkinFit(frameKey, skinKey) {
    if (!previewSkin) return;
    const fit = composePreviewFit(frameKey, skinKey);
    previewSkin.style.transform = `scale(${fit.scale}) translate(${fit.offsetX}px, ${fit.offsetY}px)`;
  }

  function frameLaneLabel(item, key) {
    const k = normKey(key);
    const src = frameSourceLabel(item);
    const source = src.toLowerCase();
    if (k === "default") return "Base";
    if (k === "pioneer_frame" || source.includes("pioneer")) return "Pioneer";
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

  function isGenesisFrame(key) {
    return normKey(key) === HOWL_GENESIS_FRAME_KEY;
  }

  function selectedGenesisLocked() {
    const key = normKey(_selectedKey);
    return isGenesisFrame(key) && !isOwnedKey(key);
  }

  function isHowlpayDisabled(out) {
    const reason = normKey(out?.reason || out?.error || out?.code || "");
    return reason === "howlpay_disabled" || reason === "feature_disabled" || reason === "coming_soon";
  }

  function setHowlStatus(message) {
    if (howlPayStatus) howlPayStatus.textContent = String(message || "");
  }

  function terminalHowlStatus(status) {
    return ["completed", "expired", "failed", "manual_review"].includes(normKey(status));
  }

  function paymentPanelOpen() {
    return !!howlPayPanel?.classList?.contains("is-open");
  }

  function stopHowlPolling() {
    if (_howlPollTimer) {
      clearTimeout(_howlPollTimer);
      _howlPollTimer = null;
    }
    if (_howlCountdownTimer) {
      clearInterval(_howlCountdownTimer);
      _howlCountdownTimer = null;
    }
  }

  function formatSeconds(total) {
    const sec = Math.max(0, Math.floor(Number(total) || 0));
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function updateHowlCountdown() {
    if (!howlPayTimer) return;
    const expiresAt = Number(_howlPayment?.expires_at || _howlPayment?.expiresAt || 0);
    if (!expiresAt) {
      howlPayTimer.textContent = "";
      return;
    }
    const left = expiresAt - Math.floor(Date.now() / 1000);
    howlPayTimer.textContent = left > 0 ? `Expires ${formatSeconds(left)}` : "Expired";
  }

  function howlPaymentUrl(payment) {
    return String(payment?.payment_url || payment?.paymentUrl || "").trim();
  }

  function howlPaymentAmount(payment) {
    const raw =
      payment?.amount_display ||
      payment?.amountDisplay ||
      payment?.amount_ui ||
      payment?.amountUi ||
      payment?.amount ||
      "";
    return String(raw || "").trim() || "-";
  }

  function howlQrUtf8Bytes(value) {
    const text = String(value || "");
    if (typeof TextEncoder !== "undefined") {
      return Array.from(new TextEncoder().encode(text));
    }
    return Array.from(text, (ch) => ch.charCodeAt(0) & 0xff);
  }

  function howlQrDataCodewords(version) {
    return HOWL_QR_TOTAL_CODEWORDS[version] -
      (HOWL_QR_M_ECC_PER_BLOCK[version] * HOWL_QR_M_BLOCKS[version]);
  }

  function howlQrChooseVersion(bytes) {
    for (let version = 1; version < HOWL_QR_TOTAL_CODEWORDS.length; version += 1) {
      const countBits = version < 10 ? 8 : 16;
      const neededBits = 4 + countBits + (bytes.length * 8);
      if (bytes.length < (1 << countBits) && neededBits <= howlQrDataCodewords(version) * 8) {
        return version;
      }
    }
    throw new Error("payment_url_too_long_for_qr");
  }

  function howlQrAppendBits(bits, value, length) {
    for (let i = length - 1; i >= 0; i -= 1) {
      bits.push(((value >>> i) & 1) === 1);
    }
  }

  function howlQrDataBytes(bytes, version) {
    const dataCodewords = howlQrDataCodewords(version);
    const capacityBits = dataCodewords * 8;
    const bits = [];
    howlQrAppendBits(bits, 0x4, 4); // Byte mode.
    howlQrAppendBits(bits, bytes.length, version < 10 ? 8 : 16);
    bytes.forEach((byte) => howlQrAppendBits(bits, byte, 8));

    const terminatorBits = Math.min(4, capacityBits - bits.length);
    for (let i = 0; i < terminatorBits; i += 1) bits.push(false);
    while (bits.length % 8) bits.push(false);

    const out = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let j = 0; j < 8; j += 1) byte = (byte << 1) | (bits[i + j] ? 1 : 0);
      out.push(byte);
    }
    for (let pad = 0; out.length < dataCodewords; pad += 1) {
      out.push((pad % 2) === 0 ? 0xec : 0x11);
    }
    return out;
  }

  let _howlQrExp = null;
  let _howlQrLog = null;
  const _howlQrRsCache = {};

  function howlQrInitGf() {
    if (_howlQrExp && _howlQrLog) return;
    _howlQrExp = new Array(512);
    _howlQrLog = new Array(256);
    let x = 1;
    for (let i = 0; i < 255; i += 1) {
      _howlQrExp[i] = x;
      _howlQrLog[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i += 1) {
      _howlQrExp[i] = _howlQrExp[i - 255];
    }
  }

  function howlQrGfMultiply(a, b) {
    if (!a || !b) return 0;
    howlQrInitGf();
    return _howlQrExp[_howlQrLog[a] + _howlQrLog[b]];
  }

  function howlQrRsGenerator(degree) {
    if (_howlQrRsCache[degree]) return _howlQrRsCache[degree];
    const result = new Array(degree).fill(0);
    result[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i += 1) {
      for (let j = 0; j < degree; j += 1) {
        result[j] = howlQrGfMultiply(result[j], root);
        if (j + 1 < degree) result[j] ^= result[j + 1];
      }
      root = howlQrGfMultiply(root, 2);
    }
    _howlQrRsCache[degree] = result;
    return result;
  }

  function howlQrRsRemainder(data, degree) {
    const generator = howlQrRsGenerator(degree);
    const result = new Array(degree).fill(0);
    data.forEach((byte) => {
      const factor = byte ^ result.shift();
      result.push(0);
      for (let i = 0; i < degree; i += 1) {
        result[i] ^= howlQrGfMultiply(generator[i], factor);
      }
    });
    return result;
  }

  function howlQrAddEcc(data, version) {
    const eccPerBlock = HOWL_QR_M_ECC_PER_BLOCK[version];
    const blockCount = HOWL_QR_M_BLOCKS[version];
    const shortBlockLen = Math.floor(data.length / blockCount);
    const longBlockCount = data.length % blockCount;
    const blocks = [];
    let offset = 0;

    for (let i = 0; i < blockCount; i += 1) {
      const dataLen = shortBlockLen + (i >= blockCount - longBlockCount ? 1 : 0);
      const blockData = data.slice(offset, offset + dataLen);
      offset += dataLen;
      blocks.push({ data: blockData, ecc: howlQrRsRemainder(blockData, eccPerBlock) });
    }

    const result = [];
    const maxDataLen = shortBlockLen + (longBlockCount ? 1 : 0);
    for (let i = 0; i < maxDataLen; i += 1) {
      blocks.forEach((block) => {
        if (i < block.data.length) result.push(block.data[i]);
      });
    }
    for (let i = 0; i < eccPerBlock; i += 1) {
      blocks.forEach((block) => result.push(block.ecc[i]));
    }
    return result;
  }

  function howlQrBit(value, index) {
    return ((value >>> index) & 1) === 1;
  }

  function howlQrAlignmentPositions(version) {
    if (version === 1) return [];
    const size = (version * 4) + 17;
    const count = Math.floor(version / 7) + 2;
    const step = Math.ceil(((version * 4) + 4) / ((count * 2) - 2)) * 2;
    const result = [6];
    for (let pos = size - 7; result.length < count; pos -= step) {
      result.splice(1, 0, pos);
    }
    return result;
  }

  function howlQrFormatBits(mask) {
    const data = mask; // Error correction level M has format bits 00.
    let rem = data;
    for (let i = 0; i < 10; i += 1) {
      rem = (rem << 1) ^ (((rem >>> 9) & 1) ? 0x537 : 0);
    }
    return ((data << 10) | (rem & 0x3ff)) ^ 0x5412;
  }

  function howlQrVersionBits(version) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) {
      rem = (rem << 1) ^ (((rem >>> 11) & 1) ? 0x1f25 : 0);
    }
    return (version << 12) | (rem & 0xfff);
  }

  function howlQrMask(mask, x, y) {
    switch (mask) {
      case 0: return ((x + y) % 2) === 0;
      case 1: return (y % 2) === 0;
      case 2: return (x % 3) === 0;
      case 3: return ((x + y) % 3) === 0;
      case 4: return ((Math.floor(y / 2) + Math.floor(x / 3)) % 2) === 0;
      case 5: return (((x * y) % 2) + ((x * y) % 3)) === 0;
      case 6: return ((((x * y) % 2) + ((x * y) % 3)) % 2) === 0;
      case 7: return ((((x + y) % 2) + ((x * y) % 3)) % 2) === 0;
      default: return false;
    }
  }

  function howlQrPenalty(matrix) {
    const size = matrix.length;
    let score = 0;
    let dark = 0;

    function runPenalty(line) {
      let total = 0;
      let runColor = line[0];
      let runLen = 1;
      for (let i = 1; i <= line.length; i += 1) {
        if (i < line.length && line[i] === runColor) {
          runLen += 1;
        } else {
          if (runLen >= 5) total += 3 + (runLen - 5);
          runColor = line[i];
          runLen = 1;
        }
      }
      return total;
    }

    function finderPenalty(line) {
      const text = line.map((bit) => (bit ? "1" : "0")).join("");
      let total = 0;
      for (let i = 0; i <= text.length - 11; i += 1) {
        const chunk = text.slice(i, i + 11);
        if (chunk === "10111010000" || chunk === "00001011101") total += 40;
      }
      return total;
    }

    for (let y = 0; y < size; y += 1) {
      const row = matrix[y];
      score += runPenalty(row) + finderPenalty(row);
      row.forEach((bit) => { if (bit) dark += 1; });
    }
    for (let x = 0; x < size; x += 1) {
      const col = [];
      for (let y = 0; y < size; y += 1) col.push(matrix[y][x]);
      score += runPenalty(col) + finderPenalty(col);
    }
    for (let y = 0; y < size - 1; y += 1) {
      for (let x = 0; x < size - 1; x += 1) {
        const color = matrix[y][x];
        if (color === matrix[y][x + 1] && color === matrix[y + 1][x] && color === matrix[y + 1][x + 1]) {
          score += 3;
        }
      }
    }

    const totalModules = size * size;
    score += Math.floor(Math.abs((dark * 20) - (totalModules * 10)) / totalModules) * 10;
    return score;
  }

  function howlQrMatrix(value) {
    const bytes = howlQrUtf8Bytes(value);
    const version = howlQrChooseVersion(bytes);
    const data = howlQrDataBytes(bytes, version);
    const codewords = howlQrAddEcc(data, version);
    const size = (version * 4) + 17;
    const modules = Array.from({ length: size }, () => Array(size).fill(false));
    const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

    function setFunction(x, y, dark) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      modules[y][x] = !!dark;
      isFunction[y][x] = true;
    }

    function setFormat(target, x, y, dark, mark) {
      target[y][x] = !!dark;
      if (mark) isFunction[y][x] = true;
    }

    function drawFinder(cx, cy) {
      for (let dy = -4; dy <= 4; dy += 1) {
        for (let dx = -4; dx <= 4; dx += 1) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunction(cx + dx, cy + dy, dist === 3 || dist <= 1);
        }
      }
    }

    function drawAlignment(cx, cy) {
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          setFunction(cx + dx, cy + dy, dist === 2 || dist === 0);
        }
      }
    }

    function drawFormat(target, mask, mark) {
      const bits = howlQrFormatBits(mask);
      for (let i = 0; i <= 5; i += 1) setFormat(target, 8, i, howlQrBit(bits, i), mark);
      setFormat(target, 8, 7, howlQrBit(bits, 6), mark);
      setFormat(target, 8, 8, howlQrBit(bits, 7), mark);
      setFormat(target, 7, 8, howlQrBit(bits, 8), mark);
      for (let i = 9; i < 15; i += 1) setFormat(target, 14 - i, 8, howlQrBit(bits, i), mark);
      for (let i = 0; i < 8; i += 1) setFormat(target, size - 1 - i, 8, howlQrBit(bits, i), mark);
      for (let i = 8; i < 15; i += 1) setFormat(target, 8, size - 15 + i, howlQrBit(bits, i), mark);
      setFormat(target, 8, size - 8, true, mark);
    }

    drawFinder(3, 3);
    drawFinder(size - 4, 3);
    drawFinder(3, size - 4);

    for (let i = 0; i < size; i += 1) {
      if (!isFunction[6][i]) setFunction(i, 6, (i % 2) === 0);
      if (!isFunction[i][6]) setFunction(6, i, (i % 2) === 0);
    }

    const align = howlQrAlignmentPositions(version);
    align.forEach((x, xi) => {
      align.forEach((y, yi) => {
        const last = align.length - 1;
        const overlapsFinder =
          (xi === 0 && yi === 0) ||
          (xi === last && yi === 0) ||
          (xi === 0 && yi === last);
        if (!overlapsFinder) drawAlignment(x, y);
      });
    });

    drawFormat(modules, 0, true);
    if (version >= 7) {
      const bits = howlQrVersionBits(version);
      for (let i = 0; i < 18; i += 1) {
        const bit = howlQrBit(bits, i);
        const a = size - 11 + (i % 3);
        const b = Math.floor(i / 3);
        setFunction(a, b, bit);
        setFunction(b, a, bit);
      }
    }

    let bitIndex = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert += 1) {
        const y = upward ? size - 1 - vert : vert;
        for (let j = 0; j < 2; j += 1) {
          const x = right - j;
          if (isFunction[y][x]) continue;
          const byte = codewords[Math.floor(bitIndex / 8)] || 0;
          modules[y][x] = bitIndex < codewords.length * 8 && howlQrBit(byte, 7 - (bitIndex % 8));
          bitIndex += 1;
        }
      }
      upward = !upward;
    }

    let bestMask = 0;
    let bestScore = Infinity;
    for (let mask = 0; mask < 8; mask += 1) {
      const candidate = modules.map((row) => row.slice());
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          if (!isFunction[y][x] && howlQrMask(mask, x, y)) candidate[y][x] = !candidate[y][x];
        }
      }
      drawFormat(candidate, mask, false);
      const score = howlQrPenalty(candidate);
      if (score < bestScore) {
        bestScore = score;
        bestMask = mask;
      }
    }

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (!isFunction[y][x] && howlQrMask(bestMask, x, y)) modules[y][x] = !modules[y][x];
      }
    }
    drawFormat(modules, bestMask, false);
    return modules;
  }

  function buildHowlQrSvg(value) {
    const matrix = howlQrMatrix(value);
    const quiet = 4;
    const size = matrix.length;
    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "ah-howl-pay-qr-svg");
    svg.setAttribute("viewBox", `0 0 ${size + (quiet * 2)} ${size + (quiet * 2)}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Solana Pay QR code");
    svg.setAttribute("focusable", "false");
    svg.style.shapeRendering = "crispEdges";

    const bg = document.createElementNS(svgNs, "rect");
    bg.setAttribute("width", String(size + (quiet * 2)));
    bg.setAttribute("height", String(size + (quiet * 2)));
    bg.setAttribute("fill", "#fff");
    svg.appendChild(bg);

    let d = "";
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (matrix[y][x]) d += `M${x + quiet} ${y + quiet}h1v1h-1z`;
      }
    }
    const path = document.createElementNS(svgNs, "path");
    path.setAttribute("fill", "#111");
    path.setAttribute("d", d);
    svg.appendChild(path);
    return svg;
  }

  function renderHowlQr(payment) {
    if (!howlPayQr) return;
    const url = howlPaymentUrl(payment);
    howlPayQr.innerHTML = "";

    const text = document.createElement("div");
    text.className = "ah-howl-pay-meta ah-howl-pay-qr-copy";

    if (!url) {
      const box = document.createElement("div");
      box.className = "ah-howl-pay-qr-box";
      box.textContent = "QR";
      text.textContent = "Payment link will appear after checkout starts.";
      howlPayQr.appendChild(box);
      howlPayQr.appendChild(text);
      return;
    }

    try {
      howlPayQr.appendChild(buildHowlQrSvg(url));
      text.textContent = "Scan with mobile Phantom or another Solana Pay wallet.";
    } catch (err) {
      dbg("howl qr render failed", err);
      const box = document.createElement("div");
      box.className = "ah-howl-pay-qr-box";
      box.textContent = "QR unavailable";
      howlPayQr.appendChild(box);
      text.textContent = "QR could not be generated. Copy the payment link instead.";
    }
    howlPayQr.appendChild(text);
  }

  function showHowlDisabledState() {
    stopHowlPolling();
    _howlPayment = null;
    if (howlPayPanel) howlPayPanel.classList.add("is-open");
    if (howlPayAmount) howlPayAmount.textContent = "-";
    if (howlPayLink) howlPayLink.value = "";
    renderHowlQr(null);
    setHowlStatus("HOWL payments are not live yet.");
  }

  function showHowlPanel(payment) {
    _howlPayment = payment && typeof payment === "object" ? payment : null;
    if (!howlPayPanel || !_howlPayment) return;
    howlPayPanel.classList.add("is-open");
    if (howlPayAmount) howlPayAmount.textContent = howlPaymentAmount(_howlPayment);
    if (howlPayLink) howlPayLink.value = howlPaymentUrl(_howlPayment);
    renderHowlQr(_howlPayment);
    updateHowlCountdown();
    setHowlStatus("Payment link ready. Open with mobile Phantom or copy the link. Desktop Phantom may only open the wallet menu.");
    stopHowlPolling();
    _howlPollStartedAt = Date.now();
    _howlCountdownTimer = setInterval(updateHowlCountdown, 1000);
    scheduleHowlPoll();
  }

  function hideHowlPanel() {
    stopHowlPolling();
    _howlPayment = null;
    if (howlPayLink) howlPayLink.value = "";
    renderHowlQr(null);
    howlPayPanel?.classList?.remove("is-open");
  }

  function updateHowlControls() {
    const showBuy = selectedGenesisLocked();
    const pending = !!(_howlPayment?.payment_id && normKey(_howlPayment?.status || "pending") === "pending");
    if (howlBuyBtn) {
      howlBuyBtn.classList.toggle("is-visible", showBuy);
      howlBuyBtn.disabled = !showBuy || _howlInitInFlight;
      howlBuyBtn.textContent = pending ? "View HOWL Payment" : "Buy with $HOWL";
    }
    if (!showBuy && _howlPayment?.status !== "pending") {
      hideHowlPanel();
    }
  }

  function refreshAfterHowlUnlock() {
    return reloadState(HOWL_GENESIS_FRAME_KEY)
      .then(() => window.loadProfile?.())
      .catch((err) => dbg("post unlock refresh failed", err));
  }

  function handleHowlStatus(out) {
    const status = normKey(out?.status || (_howlPayment?.status || "pending"));
    if (_howlPayment) _howlPayment.status = status;

    if (status === "completed") {
      stopHowlPolling();
      setHowlStatus("Payment confirmed — HOWL Genesis Frame unlocked.");
      updateHowlControls();
      refreshAfterHowlUnlock();
      return status;
    }
    if (status === "expired") {
      stopHowlPolling();
      setHowlStatus("Payment expired. Start a new payment if you still want the frame.");
      updateHowlControls();
      return status;
    }
    if (status === "manual_review") {
      stopHowlPolling();
      setHowlStatus("Payment under manual review. Do not pay again yet.");
      updateHowlControls();
      return status;
    }
    if (status === "failed") {
      stopHowlPolling();
      setHowlStatus("Payment could not be credited. Check the token, address, and amount before trying again.");
      updateHowlControls();
      return status;
    }

    setHowlStatus("Waiting for payment confirmation...");
    return "pending";
  }

  async function checkHowlPayment({ manual = false } = {}) {
    if (!_apiPost || !_howlPayment?.payment_id) return "pending";
    if (!paymentPanelOpen()) return "closed";
    if ((Date.now() - _howlPollStartedAt) > HOWL_POLL_TIMEOUT_MS) {
      stopHowlPolling();
      setHowlStatus("Still pending. Use Check Payment if your wallet shows the transfer completed.");
      return "timeout";
    }
    if (manual) setHowlStatus("Checking payment...");
    const out = await _apiPost("/webapp/howlpay/status", { payment_id: _howlPayment.payment_id });
    if (!out || !out.ok) throw new Error(out?.reason || "status_failed");
    return handleHowlStatus(out);
  }

  function scheduleHowlPoll() {
    if (!_howlPayment?.payment_id || !paymentPanelOpen()) return;
    if (_howlPollTimer) clearTimeout(_howlPollTimer);
    _howlPollTimer = setTimeout(async () => {
      _howlPollTimer = null;
      try {
        const status = await checkHowlPayment();
        if (!terminalHowlStatus(status) && status !== "timeout" && paymentPanelOpen()) {
          scheduleHowlPoll();
        }
      } catch (err) {
        dbg("howl poll failed", err);
        if (paymentPanelOpen()) scheduleHowlPoll();
      }
    }, HOWL_POLL_MS);
  }

  async function beginHowlPurchase() {
    if (!_apiPost) {
      showAlert("Frames are not ready yet.");
      return;
    }
    if (!selectedGenesisLocked()) return;
    if (_howlInitInFlight) return;
    if (_howlPayment?.payment_id && normKey(_howlPayment?.status || "pending") === "pending") {
      showHowlPanel(_howlPayment);
      updateHowlControls();
      return;
    }
    _howlInitInFlight = true;
    if (howlBuyBtn) howlBuyBtn.disabled = true;
    setHowlStatus("Creating payment link...");
    try {
      const out = await _apiPost("/webapp/howlpay/init", {
        item_type: "frame",
        item_key: HOWL_GENESIS_FRAME_KEY,
      });

      if (out?.already_owned) {
        showAlert("HOWL Genesis Frame already unlocked.");
        await refreshAfterHowlUnlock();
        return;
      }

      if (!out || !out.ok) {
        if (isHowlpayDisabled(out)) {
          showHowlDisabledState();
          return;
        }
        throw new Error(out?.reason || "payment_init_failed");
      }

      showHowlPanel(out);
      haptic("medium");
    } catch (err) {
      dbg("howl init failed", err);
      if (isHowlpayDisabled(err?.data || err)) {
        showHowlDisabledState();
        return;
      }
      showAlert(err?.message || "Failed to create payment link.");
    } finally {
      _howlInitInFlight = false;
      updateHowlControls();
    }
  }

  async function copyHowlPaymentLink() {
    const url = howlPaymentUrl(_howlPayment);
    if (!url) return;
    try {
      await navigator.clipboard?.writeText?.(url);
      setHowlStatus("Payment link copied. Open it with mobile Phantom if desktop Phantom does not show confirmation.");
      haptic("light");
    } catch (_) {
      showAlert(url);
    }
  }

  function openHowlPaymentLink() {
    const url = howlPaymentUrl(_howlPayment);
    if (!url) return;
    setHowlStatus("Opening payment link. If desktop Phantom only opens the wallet, copy the link and use mobile Phantom.");
    try {
      window.open(url, "_blank", "noopener");
    } catch (_) {
      window.location.href = url;
    }
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
    hideHowlPanel();
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
      updateHowlControls();
      return;
    }
    equipBtn.disabled = true;
    equipBtn.textContent = "Locked";
    updateHowlControls();
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
        _selectedItem = item;
        refreshButtonStates();
        setFrameInfo(item, key, owned);
        setPreview(item);
        setPrimaryState();
        updateHowlControls();
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

    const explicitKeys = [
      out?.equipped?.frame,
      out?.active,
      preferKey,
      ...(Array.isArray(out?.owned) ? out.owned : []),
    ];
    _catalog = mergeCatalogWithFrameOverrides(out.frames, explicitKeys);
    _owned = Array.isArray(out.owned) ? out.owned.map(normKey) : ["default"];
    _equipped = (out.equipped && typeof out.equipped === "object")
      ? out.equipped
      : { frame: (out.active || "") };

    buildButtons();
    updateHowlControls();
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
      updateHowlControls();
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
    howlBuyBtn?.addEventListener("click", () => {
      beginHowlPurchase();
    });
    howlOpenBtn?.addEventListener("click", openHowlPaymentLink);
    howlCopyBtn?.addEventListener("click", () => {
      copyHowlPaymentLink();
    });
    howlCheckBtn?.addEventListener("click", () => {
      checkHowlPayment({ manual: true }).catch((err) => {
        dbg("howl status failed", err);
        showAlert(err?.message || "Failed to check payment.");
      });
    });
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
