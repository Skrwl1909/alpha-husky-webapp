(function (global) {
  const CARD_WIDTH = 1200;
  const CARD_HEIGHT = 1500;
  const DEFAULT_SHARE_LINK = "https://app.alphahusky.win/";
  const TELEGRAM_PACK_LINK = "https://t.me/The_Alpha_husky";
  const PREVIEW_WAIT_MS = 3500;
  const NETWORK_TIMEOUT_MS = 45000;
  const HUB_FRAME = {
    viewportTop: 0.11,
    viewportSide: 0.15,
    viewportBottom: 0.16,
    skinScale: 1.06,
    skinFocusY: 0.25,
    frameScale: 1.34,
    frameBleed: 0.04,
    frameOffsetY: 0.012,
  };
  const STATE = {
    variant: "hub",
    presentation: null,
    pngBlob: null,
    pngObjectUrl: "",
    upload: null,
    busy: false,
    openPromise: null,
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
    ctx.font = "700 24px system-ui, sans-serif";
    const padX = 18;
    const width = Math.ceil(ctx.measureText(value).width) + padX * 2;
    const height = 48;
    const left = align === "right" ? x - width : x;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.24)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(7,12,20,0.70)";
    ctx.strokeStyle = "rgba(255,224,170,0.16)";
    roundRect(ctx, left, y, width, height, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f5f7fb";
    ctx.textBaseline = "middle";
    ctx.fillText(value, left + padX, y + height / 2);
    ctx.restore();
    return y + height + 12;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = String(text || "").trim().split(/\s+/).filter(Boolean);
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
    bg.addColorStop(0, "#060d17");
    bg.addColorStop(0.45, "#0f1930");
    bg.addColorStop(1, "#170d1a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.save();
    const topGlow = ctx.createRadialGradient(CARD_WIDTH * 0.52, 210, 40, CARD_WIDTH * 0.52, 210, 520);
    topGlow.addColorStop(0, "rgba(255,191,92,0.34)");
    topGlow.addColorStop(1, "rgba(255,191,92,0)");
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const sideGlow = ctx.createRadialGradient(160, 930, 30, 160, 930, 420);
    sideGlow.addColorStop(0, "rgba(91,160,255,0.18)");
    sideGlow.addColorStop(1, "rgba(91,160,255,0)");
    ctx.fillStyle = sideGlow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 18; i += 1) {
      const x = 110 + (i * 59) % (CARD_WIDTH - 180);
      const y = 120 + (i * 97) % (CARD_HEIGHT - 220);
      const size = (i % 3) + 1.5;
      ctx.fillStyle = i % 4 === 0 ? "rgba(255,212,138,0.75)" : "rgba(255,255,255,0.55)";
      ctx.fillRect(x, y, size, size);
    }
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
    ctx.shadowColor = "rgba(0,0,0,0.40)";
    ctx.shadowBlur = 36;
    ctx.shadowOffsetY = 18;
    roundRect(ctx, x, y, w, h, radius + 10);
    ctx.fillStyle = "rgba(2,6,12,0.46)";
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

  function drawFooterNameplate(ctx, presentation, x, y, w) {
    ctx.save();
    roundRect(ctx, x, y, w, 122, 28);
    ctx.fillStyle = "rgba(4,9,16,0.70)";
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#f8fbff";
    let nameSize = 54;
    do {
      ctx.font = `700 ${nameSize}px system-ui, sans-serif`;
      if (ctx.measureText(presentation.playerName).width <= (w - 210) || nameSize <= 38) break;
      nameSize -= 2;
    } while (nameSize > 38);
    ctx.fillText(presentation.playerName, x + 34, y + 52);

    ctx.fillStyle = "rgba(230,236,244,0.80)";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText("ALPHA HUSKY IDENTITY", x + 34, y + 86);

    ctx.textAlign = "right";
    ctx.fillStyle = "#f5d18b";
    ctx.font = "800 46px system-ui, sans-serif";
    ctx.fillText(`LV ${presentation.level}`, x + w - 30, y + 62);
    ctx.textAlign = "left";
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

    ctx.save();
    roundRect(ctx, 54, 54, CARD_WIDTH - 108, CARD_HEIGHT - 108, 44);
    ctx.fillStyle = "rgba(5,10,20,0.20)";
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (presentation.variant === "hub") {
      const portraitW = 700;
      const portraitH = Math.round(portraitW * 4 / 3);
      const portraitX = Math.round((CARD_WIDTH - portraitW) / 2);
      const portraitY = 176;

      ctx.fillStyle = "rgba(226,232,240,0.76)";
      ctx.font = "700 20px system-ui, sans-serif";
      ctx.fillText("OFFICIAL ALPHA HUSKY IDENTITY", 92, 86);

      let chipY = 88;
      chipY = drawChip(ctx, presentation.tag, CARD_WIDTH - 92, chipY, "right");
      chipY = drawChip(ctx, presentation.auraText, CARD_WIDTH - 92, chipY, "right");

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

      drawFooterNameplate(ctx, presentation, 132, 1134, CARD_WIDTH - 264);
      drawChip(ctx, presentation.factionMeta || "PACK", 132, 1276, "left");
      drawChip(ctx, `Level ${presentation.level}`, CARD_WIDTH - 132, 1276, "right");

      if (badgeImg) {
        drawFactionSeal(ctx, badgeImg, 104, 1060, 116);
      }

      ctx.fillStyle = "rgba(226,232,240,0.62)";
      ctx.font = "600 20px system-ui, sans-serif";
      ctx.fillText("Collectible profile card", 92, CARD_HEIGHT - 88);
      ctx.textAlign = "right";
      ctx.fillText("#AlphaHusky", CARD_WIDTH - 92, CARD_HEIGHT - 88);
      ctx.textAlign = "left";
      return;
    }

    ctx.fillStyle = "rgba(226,232,240,0.76)";
    ctx.font = "700 20px system-ui, sans-serif";
    ctx.fillText("ALPHA HUSKY LOADOUT CARD", 92, 86);

    let chipY = 88;
    chipY = drawChip(ctx, presentation.tag, CARD_WIDTH - 92, chipY, "right");
    chipY = drawChip(ctx, presentation.auraText, CARD_WIDTH - 92, chipY, "right");

    const artX = 98;
    const artY = 164;
    const artW = CARD_WIDTH - 196;
    const artH = 872;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.38)";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 18;
    roundRect(ctx, artX, artY, artW, artH, 40);
    ctx.fillStyle = "rgba(4,8,16,0.58)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(ctx, artX, artY, artW, artH, 40);
    ctx.clip();
    const artBg = ctx.createLinearGradient(artX, artY, artX, artY + artH);
    artBg.addColorStop(0, "rgba(18,27,42,0.96)");
    artBg.addColorStop(1, "rgba(7,11,20,0.98)");
    ctx.fillStyle = artBg;
    ctx.fillRect(artX, artY, artW, artH);
    drawContain(ctx, artImg, artX + 40, artY + 34, artW - 80, artH - 70);
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

    drawFooterNameplate(ctx, presentation, 122, 1066, CARD_WIDTH - 244);

    const stats = presentation.equippedStats || {};
    const slotLines = presentation.equippedSlots
      .filter((slot) => slot && !slot.empty)
      .slice(0, 3)
      .map((slot) => {
        const label = String(slot.label || slot.slot || "Slot");
        const name = String(slot.name || slot.item_key || "Equipped");
        return `${label}: ${name}`;
      });

    ctx.fillStyle = "rgba(228,234,242,0.84)";
    ctx.font = "600 24px system-ui, sans-serif";
    drawWrappedText(ctx, slotLines.join("  •  "), 126, 1218, CARD_WIDTH - 252, 34, 2);

    const statChips = [
      stats.hp != null ? `HP ${stats.hp}` : "",
      stats.attack != null ? `ATK ${stats.attack}` : "",
      stats.defense != null ? `DEF ${stats.defense}` : "",
      stats.agility != null ? `AGI ${stats.agility}` : "",
      stats.luck != null ? `LUCK ${stats.luck}` : "",
    ].filter(Boolean);
    let statX = 126;
    let statY = 1300;
    statChips.forEach((chip) => {
      ctx.font = "700 22px system-ui, sans-serif";
      const width = Math.ceil(ctx.measureText(chip).width) + 34;
      if (statX + width > CARD_WIDTH - 126) {
        statX = 126;
        statY += 58;
      }
      ctx.save();
      roundRect(ctx, statX, statY, width, 44, 999);
      ctx.fillStyle = "rgba(7,12,20,0.68)";
      ctx.strokeStyle = "rgba(255,224,170,0.14)";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f5f7fb";
      ctx.fillText(chip, statX + 17, statY + 29);
      ctx.restore();
      statX += width + 12;
    });

    if (badgeImg) {
      drawFactionSeal(ctx, badgeImg, 104, 1004, 110);
    }

    ctx.fillStyle = "rgba(226,232,240,0.62)";
    ctx.font = "600 20px system-ui, sans-serif";
    ctx.fillText("Live equipped state", 92, CARD_HEIGHT - 88);
    ctx.textAlign = "right";
    ctx.fillText("#AlphaHusky", CARD_WIDTH - 92, CARD_HEIGHT - 88);
    ctx.textAlign = "left";
  }

  function buildCaption(presentation) {
    const link = TELEGRAM_PACK_LINK;
    const name = presentation?.playerName || "Howler";
    const level = presentation?.level || 1;
    if (presentation?.variant === "equipped") {
      return `${name}'s current Alpha Husky loadout is live.\nLevel ${level}. Built from the in-app equipped state, not promo art.\n\nJoin the pack on Telegram: ${link}\n#AlphaHusky #TelegramMiniApp`;
    }
    return `${name}'s Alpha Husky identity is live.\nLevel ${level}. This card matches the active hub presentation in-game.\n\nJoin the pack on Telegram: ${link}\n#AlphaHusky #TelegramMiniApp`;
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
    if (titleEl) titleEl.textContent = STATE.presentation.variant === "equipped" ? "Share Equipped Build" : "Share Hub Identity";
    if (contextEl) contextEl.textContent = STATE.presentation.variant === "equipped" ? "Equipped preview" : "Main Hub preview";
    if (captionEl) captionEl.textContent = caption;
    if (noteEl) {
      noteEl.textContent = STATE.presentation.variant === "equipped"
        ? "Rendered from live profile state plus the current equipped preview."
        : "Rendered from the same live profile state the Hub is showing.";
    }
    if (helpEl) {
      helpEl.textContent = "X opens a prefilled compose screen. Save the image first, then attach it in X manually.";
    }

    const tgBtn = $("shareCardTelegramBtn");
    const canNativeShare = !!(getTg()?.shareMessage);
    if (tgBtn) {
      tgBtn.dataset.unavailable = canNativeShare ? "0" : "1";
      tgBtn.disabled = !canNativeShare;
      tgBtn.title = canNativeShare ? "" : "Telegram native share is unavailable in this client.";
    }
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
    toast("X compose is open. Use Save Image first, then attach the generated image manually.", "Share on X");
  }

  function hideModal() {
    const modal = $("shareBack");
    if (!modal) return;
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
  }

  global.ShareCard = global.ShareCard || {};
  global.ShareCard.buildSharePresentation = buildSharePresentation;
  global.ShareCard.open = open;
  global.ShareCard.openHub = function openHub() { return open("hub"); };
  global.ShareCard.openEquipped = function openEquipped() { return open("equipped"); };
  global.ShareCard.hide = hideModal;
  bindUi();
})(window);
