// js/scene_bg.js — Scene background overlay (Alpha Husky WebApp)
// Overlay sits between .bg (z=0) and .ui (z=2). Works with your existing video background.

(function () {
  function ver() {
    const v = (window.WEBAPP_VER && String(window.WEBAPP_VER).trim()) || "";
    return v ? `?v=${encodeURIComponent(v)}` : "";
  }

  // Root-level scenes (same place as index.html)
  const SCENES = Object.assign(
    {
      shop: `/shop_scene.webp${ver()}`,
    },
    (window.SCENE_BG || {})
  );

  const FADE_MS = 220;

  function ensureLayer() {
    let layer = document.getElementById("sceneBg");
    if (layer) return layer;

    layer = document.createElement("div");
    layer.id = "sceneBg";
    layer.setAttribute("aria-hidden", "true");

    // Insert inside your .app, between .bg and .ui
    const app = document.querySelector(".app");
    if (app) {
      layer.style.position = "absolute";
      layer.style.inset = "0";
      layer.style.zIndex = "1";
      const ui = app.querySelector(".ui");
      app.insertBefore(layer, ui || null);
    } else {
      layer.style.position = "fixed";
      layer.style.inset = "0";
      layer.style.zIndex = "1";
      document.body.prepend(layer);
    }

    layer.style.pointerEvents = "none";
    layer.style.opacity = "0";
    layer.style.transition = `opacity ${FADE_MS}ms ease`;
    layer.style.backgroundPosition = "center";
    layer.style.backgroundSize = "cover";
    layer.style.backgroundRepeat = "no-repeat";
    layer.style.filter = "contrast(1.06) brightness(.92) saturate(1.06)";

    return layer;
  }

  const layer = ensureLayer();
  const stack = [];
  let current = null;
  let busy = false;

  function setBg(url) {
    layer.style.backgroundImage = url
      ? `radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.60) 78%, rgba(0,0,0,0.80) 100%), url("${url}")`
      : "";
  }

  function preload(url) {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function show(key) {
    const url = SCENES[key];
    if (!url) return false;
    if (current === key) return true;
    if (busy) return false;
    busy = true;

    layer.style.opacity = "0";
    await new Promise((r) => setTimeout(r, 16));

    await preload(url);
    setBg(url);

    requestAnimationFrame(() => {
      layer.style.opacity = "1";
    });

    current = key;
    document.body.dataset.scene = key;

    setTimeout(() => (busy = false), FADE_MS + 40);
    return true;
  }

  function hide() {
    if (busy) return false;
    busy = true;

    layer.style.opacity = "0";
    current = null;
    document.body.dataset.scene = "";

    setTimeout(() => {
      setBg("");
      busy = false;
    }, FADE_MS + 40);

    return true;
  }

  window.SceneBg = {
    enter(key) { stack.length = 0; stack.push(key); return show(key); },
    exit() { stack.length = 0; return hide(); },
    push(key) { stack.push(key); return show(key); },
    pop() { if (stack.length) stack.pop(); const top = stack[stack.length - 1]; return top ? show(top) : hide(); },
    is(key) { return current === key; },
  };
})();
