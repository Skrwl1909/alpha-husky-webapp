(function (global) {
  const CARD_WIDTH = 1200;
  const CARD_HEIGHT = 1500;
  const DEFAULT_SHARE_LINK = "https://app.alphahusky.win/";
  const PREVIEW_WAIT_MS = 3500;
  const NETWORK_TIMEOUT_MS = 45000;
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

  function drawChip(ctx, text, x, y, align) {
    const value = String(text || "").trim();
    if (!value) return y;
    ctx.font = "600 30px system-ui, sans-serif";
    const padX = 22;
    const padY = 14;
    const width = Math.ceil(ctx.measureText(value).width) + padX * 2;
    const height = 60;
    const left = align === "right" ? x - width : x;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    roundRect(ctx, left, y, width, height, 999);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#f8fafc";
    ctx.textBaseline = "middle";
    ctx.fillText(value, left + padX, y + height / 2);
    ctx.restore();
    return y + height + 16;
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
    const bg = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    bg.addColorStop(0, "#071019");
    bg.addColorStop(0.56, "#101f35");
    bg.addColorStop(1, "#261227");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.22;
    const glow = ctx.createRadialGradient(880, 320, 80, 880, 320, 560);
    glow.addColorStop(0, "#f59e0b");
    glow.addColorStop(1, "rgba(245,158,11,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
    ctx.restore();

    ctx.save();
    roundRect(ctx, 58, 58, CARD_WIDTH - 116, CARD_HEIGHT - 116, 42);
    ctx.fillStyle = "rgba(5,10,20,0.36)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#f7fafc";
    ctx.font = "700 34px system-ui, sans-serif";
    ctx.fillText(presentation.variant === "equipped" ? "Equipped Loadout" : "Hub Identity", 92, 116);

    ctx.font = "700 88px system-ui, sans-serif";
    ctx.fillText(presentation.playerName, 92, 208);
    ctx.font = "500 34px system-ui, sans-serif";
    ctx.fillStyle = "rgba(241,245,249,0.84)";
    ctx.fillText(`Level ${presentation.level}`, 92, 258);

    let chipY = 96;
    chipY = drawChip(ctx, presentation.tag, CARD_WIDTH - 92, chipY, "right");
    chipY = drawChip(ctx, presentation.factionMeta, CARD_WIDTH - 92, chipY, "right");
    chipY = drawChip(ctx, presentation.auraText, CARD_WIDTH - 92, chipY, "right");

    const artX = 92;
    const artY = 310;
    const artW = CARD_WIDTH - 184;
    const artH = presentation.variant === "equipped" ? 700 : 790;

    ctx.save();
    roundRect(ctx, artX, artY, artW, artH, 34);
    ctx.clip();
    const artBg = ctx.createLinearGradient(artX, artY, artX + artW, artY + artH);
    artBg.addColorStop(0, "rgba(17,24,39,0.95)");
    artBg.addColorStop(1, "rgba(15,23,42,0.80)");
    ctx.fillStyle = artBg;
    ctx.fillRect(artX, artY, artW, artH);
    drawContain(ctx, artImg, artX + 40, artY + 26, artW - 80, artH - 52);
    if (!artImg) {
      ctx.fillStyle = "rgba(226,232,240,0.84)";
      ctx.textAlign = "center";
      ctx.font = "600 38px system-ui, sans-serif";
      ctx.fillText("Preview is still loading", artX + artW / 2, artY + artH / 2 - 12);
      ctx.font = "500 24px system-ui, sans-serif";
      ctx.fillText("Identity details are still safe to share.", artX + artW / 2, artY + artH / 2 + 34);
      ctx.textAlign = "left";
    }
    ctx.restore();

    if (frameImg) {
      ctx.save();
      roundRect(ctx, artX, artY, artW, artH, 34);
      ctx.clip();
      drawContain(ctx, frameImg, artX + 18, artY + 18, artW - 36, artH - 36);
      ctx.restore();
    }

    if (badgeImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(146, artY + artH - 76, 48, 0, Math.PI * 2);
      ctx.clip();
      drawCover(ctx, badgeImg, 98, artY + artH - 124, 96, 96);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(146, artY + artH - 76, 49, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = "700 40px system-ui, sans-serif";
    ctx.fillText(presentation.variant === "equipped" ? "Current build" : "Current player presentation", 92, artY + artH + 84);
    ctx.font = "500 28px system-ui, sans-serif";
    ctx.fillStyle = "rgba(226,232,240,0.86)";

    if (presentation.variant === "equipped") {
      const stats = presentation.equippedStats || {};
      const slotLines = presentation.equippedSlots
        .filter((slot) => slot && !slot.empty)
        .slice(0, 4)
        .map((slot) => {
          const label = String(slot.label || slot.slot || "Slot");
          const name = String(slot.name || slot.item_key || "Equipped");
          const level = slot.level ? ` Lv ${slot.level}` : "";
          return `${label}: ${name}${level}`;
        });

      drawWrappedText(
        ctx,
        slotLines.join("  •  ") || "Live equipped preview from the current build.",
        92,
        artY + artH + 132,
        CARD_WIDTH - 184,
        38,
        2
      );

      const statChips = [
        stats.hp != null ? `HP ${stats.hp}` : "",
        stats.attack != null ? `ATK ${stats.attack}` : "",
        stats.defense != null ? `DEF ${stats.defense}` : "",
        stats.agility != null ? `AGI ${stats.agility}` : "",
        stats.luck != null ? `LUCK ${stats.luck}` : "",
      ].filter(Boolean);

      let statX = 92;
      let statY = artY + artH + 226;
      statChips.forEach((chip) => {
        ctx.font = "600 28px system-ui, sans-serif";
        const width = Math.ceil(ctx.measureText(chip).width) + 34;
        if (statX + width > CARD_WIDTH - 92) {
          statX = 92;
          statY += 72;
        }
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.strokeStyle = "rgba(255,255,255,0.10)";
        roundRect(ctx, statX, statY, width, 54, 999);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#f8fafc";
        ctx.fillText(chip, statX + 17, statY + 35);
        statX += width + 14;
      });
    } else {
      drawWrappedText(
        ctx,
        "Shared from the live Hub presentation. Skin, frame, faction tag, level, and aura all come from the same state the player is currently seeing in the app.",
        92,
        artY + artH + 132,
        CARD_WIDTH - 184,
        42,
        3
      );
    }

    ctx.fillStyle = "rgba(226,232,240,0.62)";
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText("alphahusky.win", 92, CARD_HEIGHT - 94);
    ctx.textAlign = "right";
    ctx.fillText("#AlphaHusky", CARD_WIDTH - 92, CARD_HEIGHT - 94);
    ctx.textAlign = "left";
  }

  function buildCaption(presentation) {
    const link = presentation?.shareLink || getShareLink();
    const name = presentation?.playerName || "Howler";
    const level = presentation?.level || 1;
    if (presentation?.variant === "equipped") {
      return `${name}'s current Alpha Husky loadout is live.\nLevel ${level}. Built from the in-app equipped state, not promo art.\n\nPlay now: ${link}\n#AlphaHusky #TelegramMiniApp`;
    }
    return `${name}'s Alpha Husky identity is live.\nLevel ${level}. This card matches the active hub presentation in-game.\n\nJoin the pack: ${link}\n#AlphaHusky #TelegramMiniApp`;
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
