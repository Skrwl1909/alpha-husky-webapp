(function (global) {
  const CARD_WIDTH = 1200;
  const CARD_HEIGHT = 1500;
  const DEFAULT_SHARE_LINK = "https://app.alphahusky.win/";
  const TELEGRAM_PACK_LINK = "https://t.me/The_Alpha_husky";
  const X_MANUAL_ATTACH_NOTE = "Image saved. To post on X, attach the saved image manually.";
  const PREVIEW_WAIT_MS = 3500;
  const NETWORK_TIMEOUT_MS = 45000;
  const HUB_FRAME = {
    viewportTop: 0.08,
    viewportSide: 0.14,
    viewportBottom: 0.13,
    skinScale: 1.14,
    skinFocusY: 0.17,
    frameScale: 1.30,
    frameBleed: 0.04,
    frameOffsetY: 0.008,
  };
  const EQUIPPED_ART = {
    focusX: 0.5,
    focusY: 0.33,
    scale: 1.16,
  };
  const DEFAULT_CAPTION_VARIANT_INDEX = 0;
  const CAPTION_VARIANTS = [
    function premiumFounderCaption(presentation, modeLabel) {
      return `${presentation.playerName} - Founder LV ${presentation.level}\nOfficial ${modeLabel} collectible.\n@The_Alpha_Husky #AlphaHusky\n${TELEGRAM_PACK_LINK}`;
    },
    function statusFounderCaption(presentation, modeLabel) {
      return `Founder ${presentation.playerName} - LV ${presentation.level}\n${modeLabel} // Alpha Husky collectible.\n@The_Alpha_Husky #AlphaHusky\n${TELEGRAM_PACK_LINK}`;
    },
    function packCollectibleCaption(presentation, modeLabel) {
      return `${presentation.playerName} // LV ${presentation.level}\nPack-certified ${modeLabel} card.\n@The_Alpha_Husky #AlphaHusky\n${TELEGRAM_PACK_LINK}`;
    },
  ];
  const STATE = {
    variant: "hub",
    presentation: null,
    pngBlob: null,
    pngObjectUrl: "",
    upload: null,
    busy: false,
    openPromise: null,
    previewFxAnimations: [],
  };
  const DEBUG = !!global.DBG;

  function $(id) {
    return document.getElementById(id);
  }

  function log(event, extra) {
    if (!DEBUG) return;
    try {
      console.info("[ShareCard]", event, extra || "");
    } catch (_) {}
  }

  function getTg() {
    return global.Telegram?.WebApp || global.tg || null;
  }

  function getInitData() {
    return getTg()?.initData || global.INIT_DATA || "";
  }

  function getApiBase() {
    return String(global.API_BASE || "").trim();
  }

  function getShareLink() {
    return String(global.WEBAPP_BASE || global.location?.origin || DEFAULT_SHARE_LINK).replace(/\/+$/, "") + "/";
  }

  function toast(message, title) {
    const tg = getTg();
    const t = String(title || "Share");
    const m = String(message || "");
    try {
      if (tg?.showPopup) {
        tg.showPopup({ title: t, message: m, buttons: [{ type: "close" }] });
        return;
      }
    } catch (_) {}
    try {
      if (tg?.showAlert) {
        tg.showAlert(m || t);
        return;
      }
    } catch (_) {}
    alert((t ? t + "\n\n" : "") + m);
  }

  function openLink(url) {
    const href = String(url || "").trim();
    if (!href) return;
    try {
      if (getTg()?.openLink) {
        getTg().openLink(href);
        return;
      }
    } catch (_) {}
    global.open(href, "_blank", "noopener");
  }

  async function fetchJsonWithTimeout(url, options, timeoutMs) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), Math.max(1000, Number(timeoutMs || 0) || NETWORK_TIMEOUT_MS)) : null;
    try {
      const res = await fetch(url, ctrl ? Object.assign({}, options || {}, { signal: ctrl.signal }) : (options || {}));
      const data = await res.json().catch(() => ({}));
      return { res, data };
    } catch (err) {
      if (err?.name === "AbortError") {
        throw new Error("NETWORK_TIMEOUT");
      }
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function copyText(text) {
    const value = String(text ?? "");
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    } catch (_) {
      return false;
    }
  }

  function sanitizeVariant(value) {
    return value === "equipped" ? "equipped" : "hub";
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function textOf(id, fallback) {
    const value = ($(id)?.textContent || "").replace(/\s+/g, " ").trim();
    return value || String(fallback || "").trim();
  }

  function getLevelNumber(raw, fallback) {
    const source = String(raw || "").trim();
    const match = source.match(/(\d+)/);
    const picked = match ? Number(match[1]) : Number(fallback || 0);
    return Number.isFinite(picked) && picked > 0 ? picked : 1;
  }

  function pickFrameUrl(profile) {
    return (
      profile?.frameUrl ||
      profile?.frame_url ||
      profile?.cosmetics?.frameUrl ||
      profile?.cosmetics?.frame_url ||
      profile?.cosmetics?.frame ||
      ""
    );
  }

  function proxifyAssetUrl(rawUrl) {
    const input = String(rawUrl || "").trim();
    if (!input) return "";
    if (/^blob:/i.test(input) || /^data:/i.test(input)) return input;
    try {
      const url = new URL(input, global.location?.origin || DEFAULT_SHARE_LINK);
      if (url.hostname === "res.cloudinary.com" && url.pathname.startsWith("/dnjwvxinh/image/upload/")) {
        const proxied = new URL((getApiBase() || "") + "/webapp/img", global.location?.origin || DEFAULT_SHARE_LINK);
        proxied.searchParams.set("u", url.toString());
        return proxied.toString();
      }
      return url.toString();
    } catch (_) {
      return input;
    }
  }

  function buildSharePresentation(variant) {
    const mode = sanitizeVariant(variant);
    const profile = global.__PROFILE__ || global.PROFILE || global.profileState || {};
    const equippedState = global.Equipped?.state || {};
    const heroLevelText = textOf("heroLevel", profile?.level ? `Lv.${profile.level}` : "Lv.1");
    const equippedPreview = $("equipped-character-img")?.currentSrc || $("equipped-character-img")?.src || global.__EquippedCharImgUrl || equippedState?.characterUrl || "";
    const stats = equippedState?.stats || {};

    return {
      variant: mode,
      playerName: textOf("heroName", profile?.name || profile?.nickname || "Howler"),
      level: getLevelNumber(heroLevelText, profile?.level || stats?.level || 1),
      heroLevelText,
      tag: textOf("factionTag", profile?.tag || profile?.cosmetics?.tag || "PACK"),
      title: textOf("factionTag", profile?.tag || profile?.cosmetics?.tag || "PACK"),
      factionMeta: textOf("factionMeta", ""),
      factionId: String(profile?.faction || "").trim(),
      factionBadgeUrl: proxifyAssetUrl($("factionBadgeImg")?.currentSrc || $("factionBadgeImg")?.src || ""),
      skinUrl: proxifyAssetUrl($("player-skin")?.currentSrc || $("player-skin")?.src || profile?.heroImg || profile?.skin?.img || profile?.skin || ""),
      frameUrl: proxifyAssetUrl($("player-frame")?.currentSrc || $("player-frame")?.src || pickFrameUrl(profile)),
      auraText: textOf("heroAuraBadge", ""),
      equippedPreviewUrl: proxifyAssetUrl(equippedPreview),
      equippedStats: stats,
      equippedSlots: Array.isArray(equippedState?.slots) ? equippedState.slots : [],
      shareLink: getShareLink(),
    };
  }

  async function waitForImageElement(imgEl, timeoutMs) {
    if (!imgEl) return false;
    if (imgEl.complete && imgEl.naturalWidth > 0) return true;
    const deadline = Date.now() + Math.max(250, Number(timeoutMs || 0) || PREVIEW_WAIT_MS);
    while (Date.now() < deadline) {
      if (imgEl.complete && imgEl.naturalWidth > 0) return true;
      await sleep(60);
    }
    return !!(imgEl.complete && imgEl.naturalWidth > 0);
  }

  async function waitForEquippedPreviewFreshness() {
    if (sanitizeVariant(STATE.variant) !== "equipped") return true;
    const imgEl = $("equipped-character-img");
    if (!imgEl) return true;
    const deadline = Date.now() + PREVIEW_WAIT_MS;
    while (Date.now() < deadline) {
      const ready = global.__EquippedPreviewReady !== false;
      if (ready && imgEl.complete && imgEl.naturalWidth > 0) return true;
      await sleep(70);
    }
    const ready = await waitForImageElement(imgEl, 120);
    log("preview:wait_timeout", { ready, src: imgEl.currentSrc || imgEl.src || "" });
    return ready;
  }

  async function waitForFonts() {
    try {
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
    } catch (_) {}
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const url = String(src || "").trim();
      if (!url) return resolve(null);
      const img = new Image();
      if (!/^blob:/i.test(url) && !/^data:/i.test(url)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = async () => {
        try {
          if (typeof img.decode === "function") {
            await img.decode().catch(() => {});
          }
        } catch (_) {}
        resolve(img);
      };
      img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
      img.src = url;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r || 0, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function drawCover(ctx, img, x, y, w, h) {
    if (!img) return;
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawContain(ctx, img, x, y, w, h) {
    if (!img) return;
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) / 2;
    const dy = y + (h - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawCoverFocus(ctx, img, x, y, w, h, focusX, focusY, extraScale) {
    if (!img) return;
    const fx = Math.max(0, Math.min(1, Number(focusX ?? 0.5)));
    const fy = Math.max(0, Math.min(1, Number(focusY ?? 0.5)));
    const scale = Math.max(w / img.width, h / img.height) * Math.max(0.01, Number(extraScale || 1));
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x - Math.max(0, dw - w) * fx;
    const dy = y - Math.max(0, dh - h) * fy;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawContainScaled(ctx, img, x, y, w, h, scaleFactor, offsetX, offsetY) {
    if (!img) return;
    const scale = Math.min(w / img.width, h / img.height) * Math.max(0.01, Number(scaleFactor || 1));
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = x + (w - dw) / 2 + Number(offsetX || 0);
    const dy = y + (h - dh) / 2 + Number(offsetY || 0);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawChip(ctx, text, x, y, align) {
    const value = String(text || "").trim();
    if (!value) return y;
    ctx.font = "700 21px system-ui, sans-serif";
    const padX = 16;
    const width = Math.ceil(ctx.measureText(value).width) + padX * 2;
    const height = 42;
    const left = align === "right" ? x - width : x;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.20)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "rgba(8,13,21,0.72)";
    ctx.strokeStyle = "rgba(255,224,170,0.12)";
    roundRect(ctx, left, y, width, height, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(243,247,253,0.94)";
    ctx.textBaseline = "middle";
    ctx.fillText(value, left + padX, y + height / 2);
    ctx.restore();
    return y + height + 10;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const normalized = String(text || "")
      .replace(/(?:\u00e2\u20ac\u00a2|\u2022)/g, "|")
      .replace(/\s*\|\s*/g, " | ")
      .trim();
    const words = normalized.split(/\s+/).filter(Boolean);
    const lines = [];
    let current = "";
    for (const word of words) {
      const next = current ? current + " " + word : word;
      if (ctx.measureText(next).width <= maxWidth || !current) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
      if (lines.length >= maxLines) break;
    }
    if (current && lines.length < maxLines) lines.push(current);
    lines.forEach((line, idx) => ctx.fillText(line, x, y + idx * lineHeight));
  }

  function drawAmbientBackground(ctx) {
    const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bg.addColorStop(0, "#03060d");
    bg.addColorStop(0.56, "#0a1221");
    bg.addColorStop(1, "#090c13");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.save();
    const topGlow = ctx.createRadialGradient(CARD_WIDTH * 0.50, 128, 32, CARD_WIDTH * 0.50, 128, 600);
    topGlow.addColorStop(0, "rgba(228,198,146,0.22)");
    topGlow.addColorStop(1, "rgba(225,194,142,0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const sideGlow = ctx.createRadialGradient(190, 1010, 30, 190, 1010, 470);
    sideGlow.addColorStop(0, "rgba(90,148,240,0.14)");
    sideGlow.addColorStop(1, "rgba(91,160,255,0)");
    ctx.fillStyle = sideGlow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const stageFalloff = ctx.createLinearGradient(0, 138, 0, CARD_HEIGHT);
    stageFalloff.addColorStop(0, "rgba(0,0,0,0)");
    stageFalloff.addColorStop(0.62, "rgba(0,0,0,0.12)");
    stageFalloff.addColorStop(1, "rgba(0,0,0,0.24)");
    ctx.fillStyle = stageFalloff;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const vignette = ctx.createRadialGradient(
      CARD_WIDTH * 0.5,
      CARD_HEIGHT * 0.45,
      CARD_WIDTH * 0.12,
      CARD_WIDTH * 0.5,
      CARD_HEIGHT * 0.45,
      CARD_WIDTH * 0.84
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.48)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    ctx.restore();
  }

  function drawCollectibleStage(ctx, x, y, w, h, radius) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.50)";
    ctx.shadowBlur = 52;
    ctx.shadowOffsetY = 24;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = "rgba(4,8,15,0.62)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    const panel = ctx.createLinearGradient(x, y, x, y + h);
    panel.addColorStop(0, "rgba(15,23,38,0.72)");
    panel.addColorStop(0.44, "rgba(8,14,24,0.70)");
    panel.addColorStop(1, "rgba(6,9,17,0.78)");
    roundRect(ctx, x, y, w, h, radius);
    ctx.fillStyle = panel;
    ctx.fill();
    ctx.restore();

    ctx.save();
    const border = ctx.createLinearGradient(x, y, x + w, y + h);
    border.addColorStop(0, "rgba(255,239,210,0.22)");
    border.addColorStop(1, "rgba(156,182,228,0.10)");
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, w, h, radius);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    roundRect(ctx, x + 3, y + 3, w - 6, h - 6, Math.max(0, radius - 3));
    ctx.stroke();
    ctx.restore();

    ctx.save();
    const sheen = ctx.createLinearGradient(x, y, x, y + h * 0.34);
    sheen.addColorStop(0, "rgba(255,255,255,0.14)");
    sheen.addColorStop(1, "rgba(255,255,255,0)");
    roundRect(ctx, x + 1, y + 1, w - 2, Math.max(12, h * 0.34), Math.max(0, radius - 1));
    ctx.clip();
    ctx.fillStyle = sheen;
    ctx.fillRect(x, y, w, h * 0.34);
    ctx.restore();
  }

  function drawFramePortrait(ctx, artImg, frameImg, x, y, w, h) {
    const bleed = Math.round(w * HUB_FRAME.frameBleed);
    const viewportX = x + Math.round(w * HUB_FRAME.viewportSide);
    const viewportY = y + Math.round(h * HUB_FRAME.viewportTop);
    const viewportW = w - Math.round(w * HUB_FRAME.viewportSide * 2);
    const viewportH = h - Math.round(h * (HUB_FRAME.viewportTop + HUB_FRAME.viewportBottom));
    const radius = Math.round(Math.min(w, h) * 0.08);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.46)";
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    roundRect(ctx, x, y, w, h, radius + 10);
    ctx.fillStyle = "rgba(2,6,12,0.50)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, viewportX, viewportY, viewportW, viewportH, radius);
    ctx.clip();
    const inner = ctx.createLinearGradient(viewportX, viewportY, viewportX, viewportY + viewportH);
    inner.addColorStop(0, "rgba(22,31,49,0.92)");
    inner.addColorStop(1, "rgba(5,9,18,0.98)");
    ctx.fillStyle = inner;
    ctx.fillRect(viewportX, viewportY, viewportW, viewportH);
    drawCoverFocus(ctx, artImg, viewportX, viewportY, viewportW, viewportH, 0.5, HUB_FRAME.skinFocusY, HUB_FRAME.skinScale);

    const vignette = ctx.createLinearGradient(viewportX, viewportY, viewportX, viewportY + viewportH);
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(0.58, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.36)");
    ctx.fillStyle = vignette;
    ctx.fillRect(viewportX, viewportY, viewportW, viewportH);
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    roundRect(ctx, viewportX + 1, viewportY + 1, viewportW - 2, viewportH - 2, radius - 2);
    ctx.stroke();
    ctx.restore();

    if (frameImg) {
      ctx.save();
      drawContainScaled(
        ctx,
        frameImg,
        x - bleed,
        y - bleed,
        w + bleed * 2,
        h + bleed * 2,
        HUB_FRAME.frameScale,
        0,
        Math.round(h * HUB_FRAME.frameOffsetY)
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, h, radius + 10);
      ctx.stroke();
      ctx.restore();
    }

    return { viewportX, viewportY, viewportW, viewportH, radius };
  }

  function drawFactionSeal(ctx, badgeImg, x, y, size) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.32)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(12,18,30,0.95)";
    ctx.fill();
    ctx.restore();

    if (badgeImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2 - 6, 0, Math.PI * 2);
      ctx.clip();
      drawCover(ctx, badgeImg, x + 6, y + 6, size - 12, size - 12);
      ctx.restore();
    }

    const ring = ctx.createLinearGradient(x, y, x + size, y + size);
    ring.addColorStop(0, "rgba(255,220,170,0.95)");
    ring.addColorStop(1, "rgba(255,255,255,0.60)");
    ctx.strokeStyle = ring;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawFooterNameplate(ctx, presentation, x, y, w, options) {
    const opts = options || {};
    const subtitle = String(opts.subtitle || "ALPHA HUSKY COLLECTIBLE").trim();
    const metaLeft = String(opts.metaLeft || "").trim();
    const metaRight = String(opts.metaRight || "").trim();
    const h = Number(opts.height || 178);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.36)";
    ctx.shadowBlur = 26;
    ctx.shadowOffsetY = 12;
    roundRect(ctx, x, y, w, h, 30);
    ctx.fillStyle = "rgba(5,10,18,0.86)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    const panel = ctx.createLinearGradient(x, y, x, y + h);
    panel.addColorStop(0, "rgba(18,27,42,0.84)");
    panel.addColorStop(0.46, "rgba(8,14,26,0.84)");
    panel.addColorStop(1, "rgba(6,10,18,0.92)");
    roundRect(ctx, x, y, w, h, 30);
    ctx.fillStyle = panel;
    ctx.fill();
    const rim = ctx.createLinearGradient(x, y, x + w, y + h);
    rim.addColorStop(0, "rgba(255,230,186,0.24)");
    rim.addColorStop(1, "rgba(255,255,255,0.10)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(232,239,249,0.74)";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.fillText(subtitle, x + 34, y + 38);

    const levelW = 196;
    const levelH = 94;
    const levelX = x + w - levelW - 26;
    const levelY = y + 22;
    ctx.save();
    const levelBg = ctx.createLinearGradient(levelX, levelY, levelX, levelY + levelH);
    levelBg.addColorStop(0, "rgba(40,54,78,0.86)");
    levelBg.addColorStop(1, "rgba(19,29,46,0.92)");
    roundRect(ctx, levelX, levelY, levelW, levelH, 22);
    ctx.fillStyle = levelBg;
    ctx.fill();
    ctx.strokeStyle = "rgba(245,210,146,0.34)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(245,218,165,0.88)";
    ctx.font = "700 14px system-ui, sans-serif";
    ctx.fillText("LEVEL", levelX + 22, levelY + 28);
    ctx.fillStyle = "#f7d9a2";
    ctx.font = "800 48px system-ui, sans-serif";
    ctx.fillText(`LV ${presentation.level}`, levelX + 20, levelY + 76);

    ctx.fillStyle = "#f8fbff";
    let nameSize = 68;
    const nameMaxW = w - levelW - 110;
    do {
      ctx.font = `800 ${nameSize}px system-ui, sans-serif`;
      if (ctx.measureText(presentation.playerName).width <= nameMaxW || nameSize <= 42) break;
      nameSize -= 2;
    } while (nameSize > 42);
    ctx.fillText(presentation.playerName, x + 34, y + 112);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 34, y + h - 42);
    ctx.lineTo(x + w - 34, y + h - 42);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "rgba(222,232,246,0.68)";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.fillText(metaLeft || "Official collectible render", x + 34, y + h - 14);
    if (metaRight) {
      ctx.textAlign = "right";
      ctx.fillText(metaRight, x + w - 34, y + h - 14);
      ctx.textAlign = "left";
    }
    return h;
  }

  async function renderPresentationToCanvas(canvas, presentation) {
    if (!canvas || !presentation) throw new Error("MISSING_RENDER_TARGET");
    await waitForFonts();

    const [skinImg, frameImg, badgeImg, equippedImg] = await Promise.all([
      loadImage(presentation.skinUrl).catch(() => null),
      loadImage(presentation.frameUrl).catch(() => null),
      loadImage(presentation.factionBadgeUrl).catch(() => null),
      loadImage(presentation.equippedPreviewUrl).catch(() => null),
    ]);

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("NO_CANVAS_CONTEXT");

    const artImg = presentation.variant === "equipped" ? (equippedImg || skinImg) : skinImg;
    ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    drawAmbientBackground(ctx);

    const stageX = 66;
    const stageY = 62;
    const stageW = CARD_WIDTH - 132;
    const stageH = CARD_HEIGHT - 174;
    drawCollectibleStage(ctx, stageX, stageY, stageW, stageH, 52);

    if (presentation.variant === "hub") {
      const portraitW = 792;
      const portraitH = Math.round(portraitW * 4 / 3);
      const portraitX = Math.round((CARD_WIDTH - portraitW) / 2);
      const portraitY = 166;

      ctx.fillStyle = "rgba(231,238,249,0.86)";
      ctx.font = "700 18px system-ui, sans-serif";
      ctx.fillText("OFFICIAL ALPHA HUSKY COLLECTIBLE", 104, 104);

      let chipY = 92;
      chipY = drawChip(ctx, presentation.tag, CARD_WIDTH - 104, chipY, "right");
      const auraText = String(presentation.auraText || "").trim();
      if (auraText && auraText.toLowerCase() !== String(presentation.tag || "").trim().toLowerCase()) {
        chipY = drawChip(ctx, auraText, CARD_WIDTH - 104, chipY, "right");
      }

      drawFramePortrait(ctx, artImg, frameImg, portraitX, portraitY, portraitW, portraitH);

      if (!artImg) {
        ctx.fillStyle = "rgba(226,232,240,0.84)";
        ctx.textAlign = "center";
        ctx.font = "600 38px system-ui, sans-serif";
        ctx.fillText("Preview is still loading", CARD_WIDTH / 2, portraitY + portraitH / 2 - 12);
        ctx.font = "500 24px system-ui, sans-serif";
        ctx.fillText("Identity details are still safe to share.", CARD_WIDTH / 2, portraitY + portraitH / 2 + 34);
        ctx.textAlign = "left";
      }

      drawFooterNameplate(ctx, presentation, 128, 1022, CARD_WIDTH - 256, {
        subtitle: "ALPHA HUSKY IDENTITY CARD",
        metaLeft: presentation.factionMeta || presentation.tag || "Pack Identity",
        metaRight: "Hub Presentation",
      });

      if (badgeImg) {
        drawFactionSeal(ctx, badgeImg, 106, 966, 124);
      }

      ctx.fillStyle = "rgba(219,229,243,0.48)";
      ctx.font = "600 17px system-ui, sans-serif";
      ctx.fillText("Live hub snapshot", 102, CARD_HEIGHT - 124);
      ctx.textAlign = "right";
      ctx.fillText("#AlphaHusky", CARD_WIDTH - 102, CARD_HEIGHT - 124);
      ctx.textAlign = "left";
      return;
    }

    ctx.fillStyle = "rgba(231,238,249,0.86)";
    ctx.font = "700 18px system-ui, sans-serif";
    ctx.fillText("ALPHA HUSKY LOADOUT COLLECTIBLE", 104, 104);

    let chipY = 92;
    chipY = drawChip(ctx, presentation.tag, CARD_WIDTH - 104, chipY, "right");
    const auraTextEq = String(presentation.auraText || "").trim();
    if (auraTextEq && auraTextEq.toLowerCase() !== String(presentation.tag || "").trim().toLowerCase()) {
      chipY = drawChip(ctx, auraTextEq, CARD_WIDTH - 104, chipY, "right");
    }

    const artX = 138;
    const artY = 174;
    const artW = CARD_WIDTH - 276;
    const artH = 796;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.44)";
    ctx.shadowBlur = 38;
    ctx.shadowOffsetY = 20;
    roundRect(ctx, artX, artY, artW, artH, 42);
    ctx.fillStyle = "rgba(4,8,16,0.66)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, artX, artY, artW, artH, 42);
    ctx.clip();
    const artBg = ctx.createLinearGradient(artX, artY, artX, artY + artH);
    artBg.addColorStop(0, "rgba(18,29,46,0.98)");
    artBg.addColorStop(1, "rgba(8,12,22,0.98)");
    ctx.fillStyle = artBg;
    ctx.fillRect(artX, artY, artW, artH);
    drawCoverFocus(
      ctx,
      artImg,
      artX + 26,
      artY + 22,
      artW - 52,
      artH - 52,
      EQUIPPED_ART.focusX,
      EQUIPPED_ART.focusY,
      EQUIPPED_ART.scale
    );
    const artVignette = ctx.createLinearGradient(artX, artY, artX, artY + artH);
    artVignette.addColorStop(0, "rgba(255,255,255,0.02)");
    artVignette.addColorStop(0.58, "rgba(0,0,0,0)");
    artVignette.addColorStop(1, "rgba(0,0,0,0.44)");
    ctx.fillStyle = artVignette;
    ctx.fillRect(artX, artY, artW, artH);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 2;
    roundRect(ctx, artX, artY, artW, artH, 42);
    ctx.stroke();
    ctx.restore();

    if (!artImg) {
      ctx.fillStyle = "rgba(226,232,240,0.84)";
      ctx.textAlign = "center";
      ctx.font = "600 36px system-ui, sans-serif";
      ctx.fillText("Preview is still loading", CARD_WIDTH / 2, artY + artH / 2 - 10);
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillText("Loadout details are still safe to share.", CARD_WIDTH / 2, artY + artH / 2 + 28);
      ctx.textAlign = "left";
    }

    const stats = presentation.equippedStats || {};
    const slotLines = presentation.equippedSlots
      .filter((slot) => slot && !slot.empty)
      .slice(0, 2)
      .map((slot) => {
        const label = String(slot.label || slot.slot || "Slot");
        const name = String(slot.name || slot.item_key || "Equipped");
        return `${label}: ${name}`;
      });

    drawFooterNameplate(ctx, presentation, 122, 990, CARD_WIDTH - 244, {
      subtitle: "EQUIPPED LOADOUT",
      metaLeft: "Live equipped state",
      metaRight: slotLines.length ? `${slotLines.length} slot${slotLines.length > 1 ? "s" : ""}` : "",
    });

    ctx.fillStyle = "rgba(223,232,244,0.74)";
    ctx.font = "600 20px system-ui, sans-serif";
    drawWrappedText(ctx, slotLines.join("  •  "), 126, 1158, CARD_WIDTH - 252, 32, 2);

    const statChips = [
      stats.hp != null ? `HP ${stats.hp}` : "",
      stats.attack != null ? `ATK ${stats.attack}` : "",
      stats.defense != null ? `DEF ${stats.defense}` : "",
      stats.agility != null ? `AGI ${stats.agility}` : "",
      stats.luck != null ? `LUCK ${stats.luck}` : "",
    ].filter(Boolean);
    let statX = 126;
    let statY = slotLines.length ? 1260 : 1222;
    statChips.forEach((chip) => {
      ctx.font = "700 20px system-ui, sans-serif";
      const width = Math.ceil(ctx.measureText(chip).width) + 32;
      if (statX + width > CARD_WIDTH - 126) {
        statX = 126;
        statY += 50;
      }
      ctx.save();
      roundRect(ctx, statX, statY, width, 38, 999);
      ctx.fillStyle = "rgba(8,14,24,0.74)";
      ctx.strokeStyle = "rgba(245,210,146,0.16)";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f2f6fd";
      ctx.fillText(chip, statX + 16, statY + 26);
      ctx.restore();
      statX += width + 12;
    });

    if (badgeImg) {
      drawFactionSeal(ctx, badgeImg, 104, 928, 118);
    }

    ctx.fillStyle = "rgba(226,232,240,0.48)";
    ctx.font = "600 17px system-ui, sans-serif";
    ctx.fillText("Build snapshot", 102, CARD_HEIGHT - 124);
    ctx.textAlign = "right";
    ctx.fillText("#AlphaHusky", CARD_WIDTH - 102, CARD_HEIGHT - 124);
    ctx.textAlign = "left";
  }

  function captionModeLabel(variant) {
    return variant === "equipped" ? "live loadout" : "live identity";
  }

  function getCaptionVariants(presentation) {
    const source = presentation || {};
    const normalized = {
      playerName: String(source.playerName || "Howler").trim() || "Howler",
      level: Number(source.level) > 0 ? Number(source.level) : 1,
      variant: sanitizeVariant(source.variant),
    };
    const modeLabel = captionModeLabel(normalized.variant);
    return CAPTION_VARIANTS.map((builder) => builder(normalized, modeLabel));
  }

  function buildCaption(presentation) {
    const variants = getCaptionVariants(presentation);
    return variants[DEFAULT_CAPTION_VARIANT_INDEX] || variants[0] || "@The_Alpha_Husky #AlphaHusky";
  }

  function stopPreviewFx() {
    if (Array.isArray(STATE.previewFxAnimations)) {
      STATE.previewFxAnimations.forEach((anim) => {
        try { anim?.cancel?.(); } catch (_) {}
      });
    }
    STATE.previewFxAnimations = [];
    const fxRoot = $("shareCardPreviewFx");
    if (fxRoot) fxRoot.style.opacity = "0";
  }

  function positionPreviewFx(variant) {
    const fxRoot = $("shareCardPreviewFx");
    if (!fxRoot) return null;
    const eyes = fxRoot.querySelector('[data-fx="eyes"]');
    const core = fxRoot.querySelector('[data-fx="core"]');
    const sheen = fxRoot.querySelector('[data-fx="sheen"]');
    if (!eyes || !core || !sheen) return null;

    const mode = sanitizeVariant(variant);
    fxRoot.dataset.variant = mode;
    if (mode === "equipped") {
      eyes.style.top = "27%";
      eyes.style.width = "19%";
      core.style.top = "50.5%";
      core.style.width = "14%";
      sheen.style.top = "72.5%";
      sheen.style.left = "56%";
      sheen.style.width = "34%";
      sheen.style.height = "10%";
    } else {
      eyes.style.top = "28.5%";
      eyes.style.width = "16%";
      core.style.top = "47%";
      core.style.width = "12%";
      sheen.style.top = "74%";
      sheen.style.left = "57%";
      sheen.style.width = "30%";
      sheen.style.height = "10%";
    }
    return { eyes, core, sheen, fxRoot };
  }

  function startPreviewFx(variant) {
    stopPreviewFx();
    const nodes = positionPreviewFx(variant);
    if (!nodes) return;
    const { eyes, core, sheen, fxRoot } = nodes;

    const modal = $("shareBack");
    if (!modal || modal.style.display === "none" || modal.dataset.open !== "1") return;
    if (document.hidden) return;

    const reduceMotion = !!(global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const supportsAnimate = typeof eyes.animate === "function" && typeof core.animate === "function" && typeof sheen.animate === "function";
    if (reduceMotion || !supportsAnimate) {
      fxRoot.style.opacity = "0.26";
      return;
    }

    fxRoot.style.opacity = "1";
    const baseEye = "translate(-50%, -50%)";
    const baseCore = "translate(-50%, -50%)";
    const baseSheen = "translate(-16%, 0)";

    STATE.previewFxAnimations = [
      eyes.animate(
        [
          { opacity: 0.08, transform: `${baseEye} scale(0.94)` },
          { opacity: 0.34, transform: `${baseEye} scale(1.04)` },
          { opacity: 0.10, transform: `${baseEye} scale(0.96)` },
        ],
        { duration: 2400, iterations: Infinity, easing: "ease-in-out" }
      ),
      core.animate(
        [
          { opacity: 0.07, transform: `${baseCore} scale(0.92)` },
          { opacity: 0.28, transform: `${baseCore} scale(1.05)` },
          { opacity: 0.09, transform: `${baseCore} scale(0.96)` },
        ],
        { duration: 3050, iterations: Infinity, easing: "ease-in-out", delay: 240 }
      ),
      sheen.animate(
        [
          { opacity: 0, transform: `${baseSheen} skewX(-16deg)` },
          { opacity: 0.16, transform: "translate(16%, 0) skewX(-16deg)" },
          { opacity: 0, transform: "translate(42%, 0) skewX(-16deg)" },
        ],
        { duration: 5400, iterations: Infinity, easing: "ease-in-out", delay: 520 }
      ),
    ];
  }

  function buildXIntent(caption, link) {
    const params = new URLSearchParams();
    params.set("text", String(caption || "").trim());
    if (link) params.set("url", String(link).trim());
    return "https://x.com/intent/tweet?" + params.toString();
  }

  function describeShareError(err, scope) {
    const code = String(err?.message || err || "").trim().toUpperCase();
    if (scope === "render") return "We couldn't build the share card yet. Give the preview a moment and try again.";
    if (code === "NO_INIT_DATA") return "Open the Mini App inside Telegram before sharing.";
    if (code === "UPLOAD_FAILED" || code === "BAD_MULTIPART" || code === "BAD_IMAGE" || code === "SAVE_FAILED") {
      return "Image upload failed. Please try Save Image first, then retry Telegram share.";
    }
    if (code === "BAD_PHOTO_URL") return "The shared image was stored, but Telegram couldn't read it yet. Please try again.";
    if (code === "TELEGRAM_PREPARE_FAILED" || code === "NO_PREPARED_MESSAGE_ID") {
      return "Telegram couldn't prepare the message. Please try again in a moment.";
    }
    if (code === "TELEGRAM_UPSTREAM_FAIL") return "Telegram is temporarily unavailable. Please try again shortly.";
    if (code === "NETWORK_TIMEOUT") return "The network is taking too long. Please try again.";
    if (code === "TELEGRAM_SHARE_CANCELLED") return "";
    if (code === "PNG_EXPORT_FAILED") return "Image export failed. Please reopen share and try again.";
    return "Sharing failed. Please try again.";
  }

  function revokeObjectUrl() {
    if (STATE.pngObjectUrl) {
      URL.revokeObjectURL(STATE.pngObjectUrl);
      STATE.pngObjectUrl = "";
    }
  }

  async function canvasToBlob(canvas) {
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) return resolve(blob);
        reject(new Error("PNG_EXPORT_FAILED"));
      }, "image/png");
    });
  }

  function setBusy(isBusy) {
    STATE.busy = !!isBusy;
    ["shareCardTelegramBtn", "shareCardXBtn", "shareCardSaveBtn", "shareCardCopyBtn"].forEach((id) => {
      const el = $(id);
      if (!el) return;
      el.disabled = !!isBusy || el.dataset.unavailable === "1";
    });
  }

  async function ensureRendered() {
    const canvas = $("shareCardCanvas");
    const helpEl = $("shareCardHelp");
    if (sanitizeVariant(STATE.variant) === "equipped") {
      await waitForEquippedPreviewFreshness();
    }
    STATE.presentation = buildSharePresentation(STATE.variant);
    log("render:start", { variant: STATE.variant, hasSkin: !!STATE.presentation.skinUrl, hasPreview: !!STATE.presentation.equippedPreviewUrl });
    await renderPresentationToCanvas(canvas, STATE.presentation);
    STATE.pngBlob = await canvasToBlob(canvas);
    revokeObjectUrl();
    STATE.pngObjectUrl = URL.createObjectURL(STATE.pngBlob);
    STATE.upload = null;

    const caption = buildCaption(STATE.presentation);
    const titleEl = $("shareCardTitle");
    const contextEl = $("shareCardContext");
    const captionEl = $("shareCardCaptionPreview");
    const noteEl = $("shareCardMeta");
    const canvasWrap = $("shareCardCanvasWrap");
    if (titleEl) titleEl.textContent = STATE.presentation.variant === "equipped" ? "Share Equipped Build" : "Share Hub Identity";
    if (contextEl) contextEl.textContent = STATE.presentation.variant === "equipped" ? "Equipped preview" : "Main Hub preview";
    if (captionEl) captionEl.textContent = caption;
    if (canvasWrap) canvasWrap.dataset.variant = sanitizeVariant(STATE.presentation.variant);
    if (noteEl) {
      noteEl.textContent = STATE.presentation.variant === "equipped"
        ? "Rendered from live profile + current equipped preview."
        : "Rendered from the same live profile state shown in Hub.";
    }
    if (helpEl) {
      helpEl.textContent = "X opens a prefilled compose screen. To post on X, attach the saved image manually.";
    }

    const tgBtn = $("shareCardTelegramBtn");
    const canNativeShare = !!(getTg()?.shareMessage);
    if (tgBtn) {
      tgBtn.dataset.unavailable = canNativeShare ? "0" : "1";
      tgBtn.disabled = !canNativeShare;
      tgBtn.title = canNativeShare ? "" : "Telegram native share is unavailable in this client.";
    }
    startPreviewFx(STATE.presentation.variant);
    log("render:done", { variant: STATE.variant, size: STATE.pngBlob?.size || 0 });
    return STATE.pngBlob;
  }

  async function ensureUpload() {
    if (STATE.upload) return STATE.upload;
    const initData = getInitData();
    if (!initData) throw new Error("NO_INIT_DATA");
    if (!STATE.pngBlob) await ensureRendered();
    log("telegram:upload:start", { variant: STATE.variant, pngBytes: STATE.pngBlob?.size || 0 });

    const form = new FormData();
    form.append("file", STATE.pngBlob, `alpha-husky-${STATE.variant}.png`);
    form.append("variant", STATE.variant);

    const { res, data } = await fetchJsonWithTimeout((getApiBase() || "") + "/webapp/share/card/upload", {
      method: "POST",
      headers: { Authorization: "Bearer " + initData },
      body: form,
    }, NETWORK_TIMEOUT_MS);
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.reason || "UPLOAD_FAILED");
    }
    STATE.upload = data;
    log("telegram:upload:done", { variant: STATE.variant, jpgUrl: data?.jpg_url || "", jpgBytes: data?.jpg_bytes || 0 });
    return data;
  }

  async function shareOnTelegram() {
    const tg = getTg();
    if (!tg?.shareMessage) {
      toast("Telegram native prepared-message sharing is not available in this client.");
      return;
    }

    const caption = buildCaption(STATE.presentation || buildSharePresentation(STATE.variant));
    const upload = await ensureUpload();
    const initData = getInitData();
    const { res, data } = await fetchJsonWithTimeout((getApiBase() || "") + "/webapp/share/card/telegram/prepare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + initData,
      },
      body: JSON.stringify({
        variant: STATE.variant,
        caption,
        photo_url: upload?.jpg_abs || upload?.jpg_url || upload?.abs || upload?.url,
      }),
    }, NETWORK_TIMEOUT_MS);
    if (!res.ok || data?.ok === false || !data?.prepared_message_id) {
      throw new Error(data?.reason || "TELEGRAM_PREPARE_FAILED");
    }
    log("telegram:prepare:done", { preparedMessageId: data.prepared_message_id });

    await new Promise((resolve, reject) => {
      try {
        tg.shareMessage(data.prepared_message_id, (sent) => {
          if (sent === false) return reject(new Error("TELEGRAM_SHARE_CANCELLED"));
          resolve(true);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  async function saveImage() {
    if (!STATE.pngBlob) await ensureRendered();
    const a = document.createElement("a");
    a.href = STATE.pngObjectUrl;
    a.download = `alpha-husky-${STATE.variant}.png`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function shareOnX() {
    const presentation = STATE.presentation || buildSharePresentation(STATE.variant);
    const caption = buildCaption(presentation);
    openLink(buildXIntent(caption, presentation.shareLink));
    toast("X compose is open. Use Save Image, then attach it manually.", "Share on X");
  }

  function hideModal() {
    const modal = $("shareBack");
    if (!modal) return;
    stopPreviewFx();
    modal.style.display = "none";
    delete modal.dataset.open;
    document.body.classList.remove("ah-sheet-open");
    STATE.presentation = null;
    STATE.pngBlob = null;
    STATE.upload = null;
    revokeObjectUrl();
    try { global.navClose?.(modal); } catch (_) {}
  }

  async function open(variant) {
    const nextVariant = sanitizeVariant(variant);
    const modal = $("shareBack");
    if (!modal) return;
    if (STATE.busy && STATE.openPromise && modal.style.display !== "none" && STATE.variant === nextVariant) {
      return STATE.openPromise;
    }
    STATE.variant = nextVariant;
    stopPreviewFx();
    modal.style.display = "flex";
    modal.dataset.open = "1";
    document.body.classList.add("ah-sheet-open");
    try { global.navOpen?.(modal); } catch (_) {}
    STATE.openPromise = (async () => {
      setBusy(true);
      try {
        await ensureRendered();
      } catch (err) {
        console.error("[ShareCard] render failed", err);
        toast(describeShareError(err, "render"));
      } finally {
        setBusy(false);
        STATE.openPromise = null;
      }
    })();
    return STATE.openPromise;
  }

  function bindUi() {
    if (global.__shareCardBound) return;
    global.__shareCardBound = true;

    $("shareCardTelegramBtn")?.addEventListener("click", async () => {
      if (STATE.busy) return;
      setBusy(true);
      try {
        await shareOnTelegram();
      } catch (err) {
        const msg = describeShareError(err, "telegram");
        if (msg) {
          console.error("[ShareCard] telegram failed", err);
          toast(msg);
        }
      } finally {
        setBusy(false);
      }
    });

    $("shareCardSaveBtn")?.addEventListener("click", async () => {
      if (STATE.busy) return;
      setBusy(true);
      try {
        await saveImage();
        toast(X_MANUAL_ATTACH_NOTE, "Save Image");
      } catch (err) {
        console.error("[ShareCard] save failed", err);
        toast(describeShareError(err, "save"));
      } finally {
        setBusy(false);
      }
    });

    $("shareCardCopyBtn")?.addEventListener("click", async () => {
      const ok = await copyText(buildCaption(STATE.presentation || buildSharePresentation(STATE.variant)));
      if (!ok) toast("Caption copy failed. Please try again.");
    });

    $("shareCardXBtn")?.addEventListener("click", async () => {
      if (STATE.busy) return;
      try {
        await shareOnX();
      } catch (err) {
        console.error("[ShareCard] x share failed", err);
        toast("X share link failed to open.");
      }
    });

    document.addEventListener("visibilitychange", () => {
      const modal = $("shareBack");
      if (!modal || modal.style.display === "none" || modal.dataset.open !== "1") {
        stopPreviewFx();
        return;
      }
      if (document.hidden) {
        stopPreviewFx();
      } else {
        startPreviewFx(STATE.variant);
      }
    });
  }

  global.ShareCard = global.ShareCard || {};
  global.ShareCard.buildSharePresentation = buildSharePresentation;
  global.ShareCard.getCaptionVariants = getCaptionVariants;
  global.ShareCard.open = open;
  global.ShareCard.openHub = function openHub() { return open("hub"); };
  global.ShareCard.openEquipped = function openEquipped() { return open("equipped"); };
  global.ShareCard.hide = hideModal;
  bindUi();
})(window);
