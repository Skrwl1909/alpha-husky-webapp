// Alpha Husky — Phaser Dojo Movement Lab V1
(function (global) {
  "use strict";

  const ROOT_ID = "alphaDojoRoom";
  const CANVAS_ID = "alphaDojoCanvas";
  const STYLE_ID = "ah-dojo-room-css";
  const WORLD_WIDTH = 1400;
  const WORLD_HEIGHT = 900;
  const PLAYER_SPEED = 230;
  const DUMMY_RANGE_SQ = 132 * 132;
  const EXIT_RANGE_SQ = 118 * 118;
  const READY_TIMEOUT_MS = 9000;
  const PLAYER_TEXTURE = "ah-dojo-room-player-v1";
  const PLAYER_SHEET_TEXTURE = "ah-dojo-alpha-player-sheet-v1";
  const PLAYER_SHEET_URL = "assets/dojo/v1/processed/alpha_husky_player_sheet_v1.png";
  const PLAYER_SHEET_SCALE = 0.32;
  const DUMMY_TEXTURE = "ah-dojo-room-dummy-v1";
  const TERMINAL_RANGE_SQ = 168 * 168;
  const FLOOR_TILE_SCALE = 0.52;
  const WALL_SCALE = 0.25;
  const TERMINAL_SCALE = 0.26;
  const ENVIRONMENT_ASSETS = Object.freeze({
    floor: { key: "dojo-floor-base", url: "assets/dojo/v1/processed/floor.webp" },
    terminal: { key: "dojo-terminal", url: "assets/dojo/v1/processed/terminal.webp" },
    wall: { key: "dojo-wall-horizontal", url: "assets/dojo/v1/processed/wall.webp" }
  });

  const S = {
    apiPost: null,
    tg: null,
    dbg: false,
    openLegacy: null,
    root: null,
    canvasParent: null,
    loading: null,
    error: null,
    game: null,
    scene: null,
    opening: null,
    closing: false,
    ready: false,
    generation: 0,
    readyResolve: null,
    readyReject: null,
    readyTimer: null,
    pageStyles: null,
    canvas: null,
    navRegistered: false,
    safeInsets: { top: 0, right: 0, bottom: 0, left: 0 }
  };

  function log(message, detail) {
    if (!S.dbg) return;
    try {
      if (typeof S.dbg === "function") S.dbg("[DojoRoom] " + message, detail);
      else console.debug("[DojoRoom] " + message, detail || "");
    } catch (_) {}
  }

  function logError(message, error) {
    try {
      if (typeof S.dbg === "function") S.dbg("[DojoRoom] " + message, error);
      else if (S.dbg) console.warn("[DojoRoom] " + message, error);
    } catch (_) {}
  }

  function injectCSS() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.ah-dojo-room{
  --dojo-room-cyan:#65e8ff;
  --dojo-room-amber:#d7a85a;
  position:fixed;inset:0;z-index:12050;display:grid;grid-template-rows:auto minmax(0,1fr);
  width:100%;height:100%;height:100dvh;overflow:hidden;background:#070b10;color:#e8f3ff;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  overscroll-behavior:none;touch-action:none;
}
.ah-dojo-room[hidden],.ah-dojo-room [hidden]{display:none!important}
.ah-dojo-room__header{
  min-height:58px;padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 8px max(10px,env(safe-area-inset-left));
  display:grid;grid-template-columns:minmax(72px,auto) minmax(0,1fr) minmax(86px,auto);gap:8px;align-items:center;
  background:linear-gradient(180deg,#111923,#0a1017);border-bottom:1px solid rgba(101,232,255,.22);
  box-shadow:0 4px 18px rgba(0,0,0,.32);
}
.ah-dojo-room__heading{min-width:0;text-align:center;line-height:1.05}
.ah-dojo-room__eyebrow{display:block;color:#7f96a8;font-size:9px;font-weight:700;letter-spacing:.17em;text-transform:uppercase}
.ah-dojo-room__title{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:16px;letter-spacing:.025em}
.ah-dojo-room__button{
  min-height:42px;padding:8px 11px;border:1px solid rgba(151,188,207,.28);border-radius:10px;
  background:#111c27;color:#dcecff;font:700 11px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;
  cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
}
.ah-dojo-room__button:focus-visible{outline:2px solid var(--dojo-room-cyan);outline-offset:2px}
.ah-dojo-room__button--legacy{border-color:rgba(215,168,90,.42);color:#f0c77f}
.ah-dojo-room__stage{position:relative;min-width:0;min-height:0;overflow:hidden;background:#071019;touch-action:none}
.ah-dojo-room__canvas{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.ah-dojo-room__canvas canvas{display:block!important;width:100%!important;height:100%!important;touch-action:none!important}
.ah-dojo-room__loading,.ah-dojo-room__error{
  position:absolute;inset:0;display:grid;place-items:center;padding:28px;text-align:center;pointer-events:none;
  background:radial-gradient(circle at 50% 44%,rgba(38,87,105,.2),transparent 45%),#071019;
  color:#9cb2c3;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
}
.ah-dojo-room__loading::before{
  content:"";position:absolute;width:48px;height:48px;border:1px solid rgba(101,232,255,.2);border-top-color:var(--dojo-room-cyan);border-radius:50%;
  animation:ah-dojo-room-spin 1.1s linear infinite;
}
.ah-dojo-room__loading span{margin-top:82px}
.ah-dojo-room__error{background:#090d12;color:#e3bb76}
@keyframes ah-dojo-room-spin{to{transform:rotate(360deg)}}
@media (max-width:380px){
  .ah-dojo-room__header{grid-template-columns:68px minmax(0,1fr) 80px;gap:5px}
  .ah-dojo-room__button{padding:7px 6px;font-size:10px}
  .ah-dojo-room__title{font-size:14px}
}
@media (prefers-reduced-motion:reduce){.ah-dojo-room__loading::before{animation:none}}
`;
    document.head.appendChild(style);
  }

  function buildShell() {
    const stale = document.getElementById(ROOT_ID);
    if (stale) stale.remove();

    const root = document.createElement("section");
    root.id = ROOT_ID;
    root.className = "ah-dojo-room";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Alpha Husky Movement Lab");
    root.innerHTML = `
      <header class="ah-dojo-room__header">
        <button class="ah-dojo-room__button" type="button" data-dojo-room-action="back" aria-label="Return to map">Back</button>
        <div class="ah-dojo-room__heading">
          <span class="ah-dojo-room__eyebrow">Testnet Wastes · zero-risk</span>
          <strong class="ah-dojo-room__title">Movement Lab</strong>
        </div>
        <button class="ah-dojo-room__button ah-dojo-room__button--legacy" type="button" data-dojo-room-action="legacy">DPS Test</button>
      </header>
      <div class="ah-dojo-room__stage">
        <div id="${CANVAS_ID}" class="ah-dojo-room__canvas"></div>
        <div class="ah-dojo-room__loading" role="status"><span>Entering training simulation…</span></div>
        <div class="ah-dojo-room__error" role="alert" hidden>Movement lab unavailable. Opening DPS test…</div>
      </div>`;

    document.body.appendChild(root);
    S.root = root;
    S.canvasParent = root.querySelector("#" + CANVAS_ID);
    S.loading = root.querySelector(".ah-dojo-room__loading");
    S.error = root.querySelector(".ah-dojo-room__error");
  }

  function saveAndLockPage() {
    if (S.pageStyles) return;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    S.pageStyles = {
      bodyOverflow: bodyStyle.overflow,
      bodyTouchAction: bodyStyle.touchAction,
      bodyOverscrollBehavior: bodyStyle.overscrollBehavior,
      htmlOverflow: htmlStyle.overflow,
      htmlTouchAction: htmlStyle.touchAction,
      htmlOverscrollBehavior: htmlStyle.overscrollBehavior
    };
    bodyStyle.overflow = "hidden";
    bodyStyle.touchAction = "none";
    bodyStyle.overscrollBehavior = "none";
    htmlStyle.overflow = "hidden";
    htmlStyle.touchAction = "none";
    htmlStyle.overscrollBehavior = "none";
  }

  function restorePage() {
    if (!S.pageStyles) return;
    const saved = S.pageStyles;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    bodyStyle.overflow = saved.bodyOverflow;
    bodyStyle.touchAction = saved.bodyTouchAction;
    bodyStyle.overscrollBehavior = saved.bodyOverscrollBehavior;
    htmlStyle.overflow = saved.htmlOverflow;
    htmlStyle.touchAction = saved.htmlTouchAction;
    htmlStyle.overscrollBehavior = saved.htmlOverscrollBehavior;
    S.pageStyles = null;
  }

  function readSafeInsets() {
    if (!S.root) return;
    const probe = document.createElement("div");
    probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
    S.root.appendChild(probe);
    const style = getComputedStyle(probe);
    S.safeInsets.top = parseFloat(style.paddingTop) || 0;
    S.safeInsets.right = parseFloat(style.paddingRight) || 0;
    S.safeInsets.bottom = parseFloat(style.paddingBottom) || 0;
    S.safeInsets.left = parseFloat(style.paddingLeft) || 0;
    probe.remove();
  }

  function registerNavigation() {
    if (!global.AlphaNav?.push) return;
    global.AlphaNav.push(ROOT_ID, {
      close: onNavigationClose,
      isOpen,
      fallback: false
    });
    S.navRegistered = true;
  }

  function unregisterNavigation(fromNavigation) {
    if (!S.navRegistered) return;
    if (!fromNavigation) {
      try { global.navClose?.(ROOT_ID); } catch (_) {}
    }
    try { global.navUnregister?.(ROOT_ID); } catch (_) {}
    S.navRegistered = false;
  }

  function onNavigationClose() {
    void close({ fromNavigation: true });
  }

  function onRootClick(event) {
    const button = event.target.closest?.("[data-dojo-room-action]");
    if (!button || !S.root?.contains(button)) return;
    const action = button.getAttribute("data-dojo-room-action");
    if (action === "back") void close();
    if (action === "legacy") void openLegacyAfterClose();
  }

  function onWindowResize() {
    if (!S.game || !S.canvasParent) return;
    readSafeInsets();
    const width = Math.max(1, S.canvasParent.clientWidth || global.innerWidth || 1);
    const height = Math.max(1, S.canvasParent.clientHeight || global.innerHeight || 1);
    try { S.game.scale.resize(width, height); } catch (error) { logError("resize failed", error); }
    try { S.scene?.ahLayoutControls?.(width, height, S.safeInsets); } catch (_) {}
  }

  function onViewportChanged() {
    onWindowResize();
  }

  function onVisibilityChange() {
    const scene = S.scene;
    if (!scene) return;
    if (document.hidden) {
      scene.ahVisibilityPaused = true;
      scene.ahResetJoystick?.();
      scene.ahStopPlayer?.();
      if (scene.input) scene.input.enabled = false;
      try { scene.physics?.world?.pause?.(); } catch (_) {}
    } else if (scene.ahVisibilityPaused && !S.closing) {
      scene.ahVisibilityPaused = false;
      try { scene.physics?.world?.resume?.(); } catch (_) {}
      if (scene.input) scene.input.enabled = true;
    }
  }

  function onCanvasPointerCancel() {
    S.scene?.ahResetJoystick?.();
    if (S.scene) S.scene.ahInteractionPointerId = null;
  }

  function bindRoomEvents() {
    S.root.addEventListener("click", onRootClick);
    global.addEventListener("resize", onWindowResize);
    document.addEventListener("visibilitychange", onVisibilityChange);
    try { S.tg?.onEvent?.("viewportChanged", onViewportChanged); } catch (_) {}
  }

  function unbindRoomEvents() {
    S.root?.removeEventListener("click", onRootClick);
    global.removeEventListener("resize", onWindowResize);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    try { S.tg?.offEvent?.("viewportChanged", onViewportChanged); } catch (_) {}
    S.canvas?.removeEventListener("pointercancel", onCanvasPointerCancel);
    S.canvas = null;
  }

  function addStaticBlock(scene, group, x, y, width, height, fill, stroke) {
    const block = scene.add.rectangle(x, y, width, height, fill, 1).setStrokeStyle(2, stroke, 0.72);
    scene.physics.add.existing(block, true);
    group.add(block);
    return block;
  }

  function refreshStaticBody(object) {
    if (typeof object?.refreshBody === "function") object.refreshBody();
    else object?.body?.updateFromGameObject?.();
  }

  function createPlayerTexture(scene) {
    if (scene.textures.exists(PLAYER_TEXTURE)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x08131c, 1);
    g.fillTriangle(8, 19, 14, 2, 22, 18);
    g.fillTriangle(26, 18, 34, 2, 40, 19);
    g.fillCircle(24, 20, 15);
    g.fillRoundedRect(13, 31, 22, 22, 7);
    g.fillRect(8, 34, 8, 22);
    g.fillRect(32, 34, 8, 22);
    g.fillRect(14, 50, 8, 12);
    g.fillRect(26, 50, 8, 12);
    g.fillStyle(0xdff7ff, 1);
    g.fillCircle(18, 18, 2);
    g.fillCircle(30, 18, 2);
    g.fillStyle(0x67e9ff, 1);
    g.fillRect(17, 28, 14, 3);
    g.lineStyle(2, 0x67e9ff, 0.95);
    g.strokeCircle(24, 20, 16);
    g.strokeRoundedRect(12, 30, 24, 24, 8);
    g.generateTexture(PLAYER_TEXTURE, 48, 64);
    g.destroy();
  }

  function createPlayerAnimations(scene) {
    if (!scene.textures.exists(PLAYER_SHEET_TEXTURE)) return false;
    const directions = ["down", "up", "right", "left"];
    directions.forEach(function createDirectionAnimations(direction, row) {
      const idleKey = "ah-dojo-alpha-" + direction + "-idle";
      const walkKey = "ah-dojo-alpha-" + direction + "-walk";
      if (!scene.anims.exists(idleKey)) {
        scene.anims.create({ key: idleKey, frames: [{ key: PLAYER_SHEET_TEXTURE, frame: row * 4 }], frameRate: 1, repeat: -1 });
      }
      if (!scene.anims.exists(walkKey)) {
        scene.anims.create({
          key: walkKey,
          frames: [row * 4 + 1, row * 4 + 2, row * 4 + 3, row * 4 + 2].map(function mapFrame(frame) {
            return { key: PLAYER_SHEET_TEXTURE, frame };
          }),
          frameRate: 7,
          repeat: -1
        });
      }
    });
    return true;
  }

  function setPlayerAnimation(scene, direction, moving) {
    const player = scene.ahPlayer;
    if (!player || !scene.ahPlayerIsSheet) return;
    const nextDirection = direction || scene.ahPlayerDirection || "down";
    scene.ahPlayerDirection = nextDirection;
    const key = "ah-dojo-alpha-" + nextDirection + (moving ? "-walk" : "-idle");
    if (player.anims?.currentAnim?.key !== key) player.play(key);
  }

  function createDummyTexture(scene) {
    if (scene.textures.exists(DUMMY_TEXTURE)) return;
    const g = scene.add.graphics();
    g.fillStyle(0x30271d, 1);
    g.fillCircle(28, 13, 10);
    g.fillRoundedRect(20, 24, 16, 32, 5);
    g.fillRect(8, 31, 40, 8);
    g.fillRect(23, 53, 10, 13);
    g.fillStyle(0xd7a85a, 0.9);
    g.fillRect(23, 26, 10, 4);
    g.fillCircle(28, 13, 3);
    g.lineStyle(2, 0xd7a85a, 0.9);
    g.strokeCircle(28, 13, 11);
    g.strokeRoundedRect(19, 23, 18, 34, 5);
    g.generateTexture(DUMMY_TEXTURE, 56, 70);
    g.destroy();
  }

  function drawTrainingFloorFallback(scene) {
    const floor = scene.add.graphics();
    floor.setDepth(0);
    floor.fillStyle(0x0d1822, 1);
    floor.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    floor.lineStyle(1, 0x254050, 0.25);
    for (let x = 60; x < WORLD_WIDTH; x += 80) floor.lineBetween(x, 0, x, WORLD_HEIGHT);
    for (let y = 60; y < WORLD_HEIGHT; y += 80) floor.lineBetween(0, y, WORLD_WIDTH, y);

    drawTrainingFloorMarkings(scene);
  }

  function drawTrainingFloorMarkings(scene) {
    const markings = scene.add.graphics().setDepth(5);
    markings.lineStyle(2, 0x4ecce4, 0.16);
    markings.strokeRect(88, 88, WORLD_WIDTH - 176, WORLD_HEIGHT - 176);
    markings.strokeRect(142, 142, WORLD_WIDTH - 284, WORLD_HEIGHT - 284);

    markings.fillStyle(0xd7a85a, 0.14);
    for (let x = 520; x <= 880; x += 60) markings.fillRect(x, 430, 34, 4);
    markings.fillStyle(0x65e8ff, 0.16);
    markings.fillRect(132, 716, 150, 6);
    markings.fillRect(1110, 162, 142, 5);
  }

  function buildFloor(scene) {
    const floorAsset = ENVIRONMENT_ASSETS.floor;
    if (!scene.textures.exists(floorAsset.key)) {
      log("floor asset unavailable; using procedural floor");
      drawTrainingFloorFallback(scene);
      return;
    }
    scene.add.tileSprite(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT, floorAsset.key)
      .setOrigin(0.5)
      .setTileScale(FLOOR_TILE_SCALE, FLOOR_TILE_SCALE)
      .setTint(0xc2d0d8)
      .setDepth(0);
    drawTrainingFloorMarkings(scene);
  }

  function addEnvironmentWall(scene, group, x, y, width, height) {
    const wallAsset = ENVIRONMENT_ASSETS.wall;
    if (!scene.textures.exists(wallAsset.key)) {
      return addStaticBlock(scene, group, x, y, width, height, 0x1c2934, 0x527083).setDepth(10);
    }
    const wall = scene.add.image(x, y, wallAsset.key).setOrigin(0.5).setScale(WALL_SCALE).setDepth(10);
    scene.physics.add.existing(wall, true);
    // Source-space bounds cover the metal chassis only; the transparent canvas and upper decoration stay passable.
    wall.body.setSize(900, 240).setOffset(62, 365);
    refreshStaticBody(wall);
    group.add(wall);
    return wall;
  }

  function addTrainingTerminal(scene) {
    const x = 1020;
    const y = 720;
    const terminalAsset = ENVIRONMENT_ASSETS.terminal;
    if (scene.textures.exists(terminalAsset.key)) {
      const terminal = scene.add.image(x, y, terminalAsset.key).setOrigin(0.5).setScale(TERMINAL_SCALE).setDepth(12);
      scene.physics.add.existing(terminal, true);
      // The hologram occupies the upper half of the artwork. Only the console chassis blocks movement.
      terminal.body.setSize(780, 280).setOffset(122, 515);
      refreshStaticBody(terminal);
      scene.ahTerminal = terminal;
      scene.ahTerminalBaseScale = TERMINAL_SCALE;
      scene.ahTerminalAnchor = { x, y: 758 };
      return;
    }

    log("terminal asset unavailable; using procedural terminal");
    const terminal = scene.add.rectangle(x, y + 38, 196, 78, 0x142731, 0.94).setStrokeStyle(2, 0x65e8ff, 0.7).setDepth(12);
    const screen = scene.add.rectangle(x, y + 12, 108, 26, 0x1b8ca4, 0.34).setStrokeStyle(1, 0x8aeeff, 0.7).setDepth(13);
    scene.physics.add.existing(terminal, true);
    scene.ahTerminal = terminal;
    scene.ahTerminalGlow = screen;
    scene.ahTerminalBaseScale = 1;
    scene.ahTerminalAnchor = { x, y: y + 38 };
  }

  function buildWorld(scene) {
    buildFloor(scene);
    const blockers = scene.physics.add.staticGroup();
    const wallFill = 0x151e29;
    const wallStroke = 0x39566a;
    addStaticBlock(scene, blockers, WORLD_WIDTH / 2, 26, WORLD_WIDTH, 52, wallFill, wallStroke);
    addStaticBlock(scene, blockers, WORLD_WIDTH / 2, WORLD_HEIGHT - 26, WORLD_WIDTH, 52, wallFill, wallStroke);
    addStaticBlock(scene, blockers, 26, WORLD_HEIGHT / 2, 52, WORLD_HEIGHT, wallFill, wallStroke);
    addStaticBlock(scene, blockers, WORLD_WIDTH - 26, WORLD_HEIGHT / 2, 52, WORLD_HEIGHT, wallFill, wallStroke);

    addEnvironmentWall(scene, blockers, 450, 278, 230, 42);
    addEnvironmentWall(scene, blockers, 450, 610, 230, 42);
    addStaticBlock(scene, blockers, 760, 190, 46, 210, 0x182630, 0x416677);
    addStaticBlock(scene, blockers, 760, 705, 46, 210, 0x182630, 0x416677);
    addEnvironmentWall(scene, blockers, 1115, 275, 190, 38);
    addEnvironmentWall(scene, blockers, 1115, 625, 190, 38);

    scene.add.text(104, 102, "MOVEMENT GRID 01", {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#577487", letterSpacing: 2
    });
    scene.add.text(1016, 774, "LOCAL SIMULATION · NO REWARDS", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#566c79", letterSpacing: 1
    });

    createDummyTexture(scene);
    scene.ahDummy = scene.physics.add.staticSprite(1025, 450, DUMMY_TEXTURE);
    scene.ahDummy.body.setSize(42, 48).setOffset(7, 19);
    scene.ahDummy.refreshBody();
    scene.ahDummy.setDepth(20);
    scene.add.circle(scene.ahDummy.x, scene.ahDummy.y + 28, 76, 0xd7a85a, 0.035).setStrokeStyle(2, 0xd7a85a, 0.22);
    scene.add.text(scene.ahDummy.x, scene.ahDummy.y - 58, "TRAINING UNIT", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#c59d5d", letterSpacing: 2
    }).setOrigin(0.5);

    scene.ahExit = { x: 188, y: 760 };
    scene.add.rectangle(scene.ahExit.x, scene.ahExit.y, 150, 82, 0x173b44, 0.38).setStrokeStyle(2, 0x65e8ff, 0.65);
    scene.add.text(scene.ahExit.x, scene.ahExit.y, "EXIT // MAP", {
      fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#8cefff", fontStyle: "bold", letterSpacing: 2
    }).setOrigin(0.5);

    addTrainingTerminal(scene);

    scene.ahPlayerIsSheet = createPlayerAnimations(scene);
    if (scene.ahPlayerIsSheet) {
      scene.ahPlayer = scene.physics.add.sprite(320, 690, PLAYER_SHEET_TEXTURE, 0);
      scene.ahPlayer.setScale(PLAYER_SHEET_SCALE);
      scene.ahPlayer.body.setSize(70, 90).setOffset(93, 150);
      scene.ahPlayerDirection = "down";
      setPlayerAnimation(scene, "down", false);
    } else {
      createPlayerTexture(scene);
      scene.ahPlayer = scene.physics.add.sprite(320, 690, PLAYER_TEXTURE);
      scene.ahPlayer.body.setSize(22, 28).setOffset(13, 32);
    }
    scene.ahPlayer.setCollideWorldBounds(true);
    scene.ahPlayer.setDepth(30);
    scene.physics.add.collider(scene.ahPlayer, blockers);
    scene.physics.add.collider(scene.ahPlayer, scene.ahDummy);
    scene.physics.add.collider(scene.ahPlayer, scene.ahTerminal);
  }

  function createControls(scene) {
    scene.ahMove = new global.Phaser.Math.Vector2(0, 0);
    scene.ahJoystickVector = { x: 0, y: 0 };
    scene.ahJoystickPointerId = null;
    scene.ahInteractionPointerId = null;
    scene.ahContext = null;
    scene.ahTrainingContacts = 0;
    scene.ahVisibilityPaused = false;

    scene.ahJoystickBase = scene.add.circle(86, 86, 54, 0x0b1620, 0.72).setStrokeStyle(2, 0x65e8ff, 0.44).setScrollFactor(0).setDepth(100);
    scene.ahJoystickThumb = scene.add.circle(86, 86, 25, 0x65e8ff, 0.28).setStrokeStyle(2, 0xbaf6ff, 0.7).setScrollFactor(0).setDepth(101);
    scene.ahJoystickHit = scene.add.zone(86, 86, 160, 160).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahInteractRing = scene.add.circle(100, 100, 37, 0x111a23, 0.8).setStrokeStyle(2, 0x50616f, 0.65).setScrollFactor(0).setDepth(100);
    scene.ahInteractLabel = scene.add.text(100, 100, "--", {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#71828e", fontStyle: "bold", align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    scene.ahInteractHit = scene.add.zone(100, 100, 104, 104).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahPrompt = scene.add.text(0, 18, "WASD / ARROWS · MOVE", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#88a2b3", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.72)", padding: { x: 10, y: 6 }, align: "center"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    scene.ahCounter = scene.add.text(14, 16, "CONTACTS  0", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#c5d5df", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.64)", padding: { x: 8, y: 6 }
    }).setScrollFactor(0).setDepth(100);
    scene.ahMessage = scene.add.text(0, 58, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#d8b570", fontStyle: "bold",
      backgroundColor: "rgba(10,14,18,.78)", padding: { x: 12, y: 7 }, align: "center"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setVisible(false);

    scene.ahOnJoystickDown = function (pointer) {
      if (scene.ahJoystickPointerId !== null || !scene.input.enabled) return;
      scene.ahJoystickPointerId = pointer.id;
      updateJoystick(scene, pointer);
    };
    scene.ahOnPointerMove = function (pointer) {
      if (pointer.id === scene.ahJoystickPointerId) updateJoystick(scene, pointer);
    };
    scene.ahOnPointerUp = function (pointer) {
      if (pointer.id === scene.ahJoystickPointerId) resetJoystick(scene);
      if (pointer.id === scene.ahInteractionPointerId) scene.ahInteractionPointerId = null;
    };
    scene.ahOnGameOut = function () { resetJoystick(scene); };
    scene.ahOnInteractionDown = function (pointer) {
      if (scene.ahInteractionPointerId !== null || !scene.ahContext || !scene.input.enabled) return;
      scene.ahInteractionPointerId = pointer.id;
      performInteraction(scene);
    };

    scene.ahJoystickHit.on("pointerdown", scene.ahOnJoystickDown);
    scene.ahInteractHit.on("pointerdown", scene.ahOnInteractionDown);
    scene.input.on("pointermove", scene.ahOnPointerMove);
    scene.input.on("pointerup", scene.ahOnPointerUp);
    scene.input.on("gameout", scene.ahOnGameOut);

    scene.ahResetJoystick = function () { resetJoystick(scene); };
    scene.ahStopPlayer = function () {
      scene.ahPlayer?.setVelocity(0, 0);
      if (scene.ahMove) scene.ahMove.set(0, 0);
      setPlayerAnimation(scene, scene.ahPlayerDirection, false);
    };
    scene.ahLayoutControls = function (width, height, safe) { layoutControls(scene, width, height, safe); };
    layoutControls(scene, scene.scale.width, scene.scale.height, S.safeInsets);
  }

  function layoutControls(scene, width, height, safe) {
    const insets = safe || { top: 0, right: 0, bottom: 0, left: 0 };
    const compact = width < 430;
    const joyX = Math.max(72, insets.left + (compact ? 72 : 88));
    const controlY = height - Math.max(76, insets.bottom + (compact ? 76 : 90));
    const interactX = width - Math.max(64, insets.right + (compact ? 64 : 78));

    scene.ahJoystickBase?.setPosition(joyX, controlY);
    scene.ahJoystickHit?.setPosition(joyX, controlY);
    if (scene.ahJoystickPointerId === null) scene.ahJoystickThumb?.setPosition(joyX, controlY);
    scene.ahInteractRing?.setPosition(interactX, controlY);
    scene.ahInteractLabel?.setPosition(interactX, controlY);
    scene.ahInteractHit?.setPosition(interactX, controlY);
    scene.ahPrompt?.setPosition(width / 2, Math.max(12, insets.top + 12));
    scene.ahMessage?.setPosition(width / 2, Math.max(50, insets.top + 50));
    scene.ahCounter?.setPosition(Math.max(10, insets.left + 10), Math.max(10, insets.top + 10));
  }

  function updateJoystick(scene, pointer) {
    const baseX = scene.ahJoystickBase.x;
    const baseY = scene.ahJoystickBase.y;
    let dx = pointer.x - baseX;
    let dy = pointer.y - baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 48;
    if (distance > maxRadius && distance > 0) {
      const scale = maxRadius / distance;
      dx *= scale;
      dy *= scale;
    }
    scene.ahJoystickThumb.setPosition(baseX + dx, baseY + dy);
    if (distance < 11) {
      scene.ahJoystickVector.x = 0;
      scene.ahJoystickVector.y = 0;
      return;
    }
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    scene.ahJoystickVector.x = dx / length;
    scene.ahJoystickVector.y = dy / length;
  }

  function resetJoystick(scene) {
    scene.ahJoystickPointerId = null;
    if (scene.ahJoystickVector) {
      scene.ahJoystickVector.x = 0;
      scene.ahJoystickVector.y = 0;
    }
    if (scene.ahJoystickBase && scene.ahJoystickThumb) {
      scene.ahJoystickThumb.setPosition(scene.ahJoystickBase.x, scene.ahJoystickBase.y);
    }
  }

  function setContext(scene, context) {
    if (scene.ahContext === context) return;
    scene.ahContext = context;
    if (context === "dummy") {
      scene.ahInteractLabel.setText("TRAIN").setFontSize(13).setColor("#f0c77f");
      scene.ahInteractRing.setFillStyle(0x5b3e1d, 0.86).setStrokeStyle(2, 0xd7a85a, 0.95);
      scene.ahPrompt.setText("TRAINING UNIT IN RANGE · E / SPACE").setColor("#e7c98e");
    } else if (context === "terminal") {
      scene.ahInteractLabel.setText("CALIBRATE").setFontSize(10).setColor("#baf6ff");
      scene.ahInteractRing.setFillStyle(0x123741, 0.9).setStrokeStyle(2, 0x65e8ff, 0.98);
      scene.ahPrompt.setText("TERMINAL IN RANGE - E / SPACE").setColor("#a9edf7");
    } else if (context === "exit") {
      scene.ahInteractLabel.setText("EXIT").setFontSize(13).setColor("#b8f6ff");
      scene.ahInteractRing.setFillStyle(0x123741, 0.86).setStrokeStyle(2, 0x65e8ff, 0.95);
      scene.ahPrompt.setText("EXIT TO MAP · E / SPACE").setColor("#a9edf7");
    } else {
      scene.ahInteractLabel.setText("--").setFontSize(13).setColor("#71828e");
      scene.ahInteractRing.setFillStyle(0x111a23, 0.8).setStrokeStyle(2, 0x50616f, 0.65);
      scene.ahPrompt.setText("WASD / ARROWS · MOVE").setColor("#88a2b3");
    }
  }

  function showSceneMessage(scene, text) {
    scene.ahMessageTimer?.remove?.(false);
    scene.ahMessage.setText(text).setVisible(true);
    scene.ahMessageTimer = scene.time.delayedCall(1500, function hideDojoMessage() {
      scene.ahMessage?.setVisible(false);
    });
  }

  function performInteraction(scene) {
    if (scene.ahContext === "exit") {
      void close();
      return;
    }
    if (scene.ahContext === "terminal") {
      showSceneMessage(scene, "Movement telemetry calibrated.");
      const terminal = scene.ahTerminal;
      if (!terminal) return;
      scene.tweens.killTweensOf(terminal);
      scene.tweens.killTweensOf(scene.ahTerminalGlow);
      terminal.setTint?.(0xbffaff);
      scene.tweens.add({
        targets: terminal,
        scaleX: scene.ahTerminalBaseScale * 1.025,
        scaleY: scene.ahTerminalBaseScale * 1.025,
        duration: 105,
        yoyo: true,
        onComplete: function clearTerminalPulse() {
          terminal?.clearTint?.();
          terminal?.setScale?.(scene.ahTerminalBaseScale);
        }
      });
      if (scene.ahTerminalGlow) {
        scene.tweens.add({ targets: scene.ahTerminalGlow, alpha: 0.95, duration: 105, yoyo: true });
      }
      return;
    }
    if (scene.ahContext !== "dummy") return;
    scene.ahTrainingContacts += 1;
    scene.ahCounter.setText("CONTACTS  " + scene.ahTrainingContacts);
    showSceneMessage(scene, "Training signal registered.");
    scene.tweens.killTweensOf(scene.ahDummy);
    scene.ahDummy.setTint(0xffd38a);
    scene.tweens.add({
      targets: scene.ahDummy,
      scaleX: 1.09,
      scaleY: 1.09,
      duration: 90,
      yoyo: true,
      onComplete: function clearDummySignal() {
        scene.ahDummy?.clearTint?.();
        scene.ahDummy?.setScale?.(1);
      }
    });
  }

  function createKeyboard(scene) {
    if (!scene.input.keyboard) return;
    scene.ahCursors = scene.input.keyboard.createCursorKeys();
    scene.ahKeys = scene.input.keyboard.addKeys({
      up: global.Phaser.Input.Keyboard.KeyCodes.W,
      left: global.Phaser.Input.Keyboard.KeyCodes.A,
      down: global.Phaser.Input.Keyboard.KeyCodes.S,
      right: global.Phaser.Input.Keyboard.KeyCodes.D,
      interact: global.Phaser.Input.Keyboard.KeyCodes.E,
      space: global.Phaser.Input.Keyboard.KeyCodes.SPACE,
      escape: global.Phaser.Input.Keyboard.KeyCodes.ESC
    });
  }

  function updatePlayer(scene, time) {
    const keys = scene.ahKeys;
    const cursors = scene.ahCursors;
    let x = scene.ahJoystickVector.x;
    let y = scene.ahJoystickVector.y;

    if (keys?.left?.isDown || cursors?.left?.isDown) x -= 1;
    if (keys?.right?.isDown || cursors?.right?.isDown) x += 1;
    if (keys?.up?.isDown || cursors?.up?.isDown) y -= 1;
    if (keys?.down?.isDown || cursors?.down?.isDown) y += 1;

    const move = scene.ahMove.set(x, y);
    if (move.lengthSq() > 0) {
      move.normalize().scale(PLAYER_SPEED);
      scene.ahPlayer.setVelocity(move.x, move.y);
      if (scene.ahPlayerIsSheet) {
        scene.ahPlayer.setScale(PLAYER_SHEET_SCALE);
        const direction = Math.abs(move.x) > Math.abs(move.y)
          ? (move.x < 0 ? "left" : "right")
          : (move.y < 0 ? "up" : "down");
        setPlayerAnimation(scene, direction, true);
      } else {
        scene.ahPlayer.setScale(1);
        if (move.x < -1) scene.ahPlayer.setFlipX(true);
        else if (move.x > 1) scene.ahPlayer.setFlipX(false);
      }
    } else {
      scene.ahPlayer.setVelocity(0, 0);
      if (scene.ahPlayerIsSheet) {
        scene.ahPlayer.setScale(PLAYER_SHEET_SCALE);
        setPlayerAnimation(scene, scene.ahPlayerDirection, false);
      } else {
        const idle = 1 + Math.sin(time * 0.0035) * 0.008;
        scene.ahPlayer.setScale(idle, idle);
      }
    }
  }

  function updateProximity(scene) {
    const player = scene.ahPlayer;
    const ddx = player.x - scene.ahDummy.x;
    const ddy = player.y - scene.ahDummy.y;
    const edx = player.x - scene.ahExit.x;
    const edy = player.y - scene.ahExit.y;
    const dummyDistanceSq = ddx * ddx + ddy * ddy;
    const exitDistanceSq = edx * edx + edy * edy;
    const terminal = scene.ahTerminalAnchor;
    const tdx = terminal ? player.x - terminal.x : Infinity;
    const tdy = terminal ? player.y - terminal.y : Infinity;
    const terminalDistanceSq = tdx * tdx + tdy * tdy;
    const options = [];
    if (dummyDistanceSq <= DUMMY_RANGE_SQ) options.push({ context: "dummy", distanceSq: dummyDistanceSq });
    if (terminalDistanceSq <= TERMINAL_RANGE_SQ) options.push({ context: "terminal", distanceSq: terminalDistanceSq });
    if (exitDistanceSq <= EXIT_RANGE_SQ) options.push({ context: "exit", distanceSq: exitDistanceSq });
    options.sort(function nearestFirst(a, b) { return a.distanceSq - b.distanceSq; });
    setContext(scene, options[0]?.context || null);
  }

  function handleKeyboardActions(scene) {
    if (!scene.ahKeys) return;
    const keyboard = global.Phaser.Input.Keyboard;
    if (keyboard.JustDown(scene.ahKeys?.interact) || keyboard.JustDown(scene.ahKeys?.space)) {
      performInteraction(scene);
    }
    if (keyboard.JustDown(scene.ahKeys?.escape)) void close();
  }

  function onSceneShutdown() {
    const scene = this;
    resetJoystick(scene);
    scene.ahStopPlayer?.();
    scene.ahJoystickHit?.off("pointerdown", scene.ahOnJoystickDown);
    scene.ahInteractHit?.off("pointerdown", scene.ahOnInteractionDown);
    scene.input?.off("pointermove", scene.ahOnPointerMove);
    scene.input?.off("pointerup", scene.ahOnPointerUp);
    scene.input?.off("gameout", scene.ahOnGameOut);
    scene.ahMessageTimer?.remove?.(false);
  }

  function sceneCreate() {
    try {
      this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      buildWorld(this);
      createControls(this);
      createKeyboard(this);

      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.startFollow(this.ahPlayer, true, 0.13, 0.13);
      this.cameras.main.setRoundPixels(true);
      this.sys.events.once("shutdown", onSceneShutdown, this);

      S.scene = this;
      S.canvas = S.canvasParent?.querySelector("canvas") || this.game.canvas || null;
      if (!S.canvas) throw new Error("Phaser renderer did not create a canvas");
      S.canvas.setAttribute("aria-label", "Playable Alpha Husky movement training room");
      S.canvas.addEventListener("pointercancel", onCanvasPointerCancel);
      onWindowResize();

      const rendererName = this.game.renderer?.type === global.Phaser.WEBGL ? "WebGL" : "Canvas";
      log("renderer ready: " + rendererName);
      settleReady(true);
    } catch (error) {
      settleReady(false, error);
    }
  }

  function scenePreload() {
    this.ahEnvironmentLoadErrors = new Set();
    this.ahOnAssetLoadError = function onAssetLoadError(file) {
      const key = file?.key;
      const asset = Object.values(ENVIRONMENT_ASSETS).find(function matchesEnvironmentAsset(item) { return item.key === key; });
      if (!asset || this.ahEnvironmentLoadErrors.has(key)) return;
      this.ahEnvironmentLoadErrors.add(key);
      log("environment asset failed to load; preserving fallback: " + asset.url);
    }.bind(this);
    this.load.on("loaderror", this.ahOnAssetLoadError);
    this.sys.events.once("shutdown", function removeAssetLoadListener() {
      this.load?.off?.("loaderror", this.ahOnAssetLoadError);
    }, this);
    Object.values(ENVIRONMENT_ASSETS).forEach(function preloadEnvironmentAsset(asset) {
      this.load.image(asset.key, asset.url);
    }, this);
    this.load.spritesheet(PLAYER_SHEET_TEXTURE, PLAYER_SHEET_URL, { frameWidth: 256, frameHeight: 256 });
  }

  function sceneUpdate(time) {
    if (S.closing || this.ahVisibilityPaused || !this.ahPlayer) return;
    updatePlayer(this, time);
    updateProximity(this);
    handleKeyboardActions(this);
  }

  function settleReady(ok, error) {
    if (!S.readyResolve && !S.readyReject) return;
    const resolve = S.readyResolve;
    const reject = S.readyReject;
    S.readyResolve = null;
    S.readyReject = null;
    if (S.readyTimer) {
      clearTimeout(S.readyTimer);
      S.readyTimer = null;
    }
    if (ok) resolve?.(true);
    else if (error) reject?.(error);
    else resolve?.(false);
  }

  function createGame() {
    return new Promise((resolve, reject) => {
      S.readyResolve = resolve;
      S.readyReject = reject;
      S.readyTimer = setTimeout(function onDojoReadyTimeout() {
        settleReady(false, new Error("Movement room renderer timed out"));
      }, READY_TIMEOUT_MS);

      const width = Math.max(1, S.canvasParent.clientWidth || global.innerWidth || 1);
      const height = Math.max(1, S.canvasParent.clientHeight || global.innerHeight || 1);
      const config = {
        type: global.Phaser.AUTO,
        parent: CANVAS_ID,
        width,
        height,
        backgroundColor: "#071019",
        transparent: false,
        antialias: true,
        audio: { noAudio: true },
        input: { activePointers: 4, touch: { capture: true } },
        scale: { mode: global.Phaser.Scale.RESIZE, width, height },
        physics: {
          default: "arcade",
          arcade: { gravity: { x: 0, y: 0 }, debug: !!global.DBG }
        },
        render: { roundPixels: true, powerPreference: "low-power" },
        scene: { preload: scenePreload, create: sceneCreate, update: sceneUpdate }
      };

      try {
        S.game = new global.Phaser.Game(config);
      } catch (error) {
        settleReady(false, error);
      }
    });
  }

  async function callLegacy() {
    const fallback = S.openLegacy || global.Dojo?.openLegacy;
    if (typeof fallback !== "function") return false;
    try {
      await fallback();
      return true;
    } catch (error) {
      logError("legacy fallback failed", error);
      return false;
    }
  }

  async function openLegacyAfterClose() {
    await close();
    await callLegacy();
  }

  async function cleanup(options) {
    const fromNavigation = !!options?.fromNavigation;
    settleReady(false);
    unbindRoomEvents();

    const scene = S.scene;
    if (scene) {
      scene.ahResetJoystick?.();
      scene.ahStopPlayer?.();
      if (scene.input) scene.input.enabled = false;
      if (scene.input?.keyboard) scene.input.keyboard.enabled = false;
    }

    const game = S.game;
    S.game = null;
    S.scene = null;
    if (game) {
      try { game.destroy(true); } catch (error) { logError("game destroy failed", error); }
    }

    if (S.canvasParent) S.canvasParent.replaceChildren();
    unregisterNavigation(fromNavigation);
    S.root?.remove();
    S.root = null;
    S.canvasParent = null;
    S.loading = null;
    S.error = null;
    S.ready = false;
    restorePage();
  }

  async function runOpen(generation) {
    try {
      injectCSS();
      buildShell();
      saveAndLockPage();
      readSafeInsets();
      bindRoomEvents();
      registerNavigation();

      if (global.AH_FLAGS?.dojoPhaserRoom === false) {
        await cleanup();
        await callLegacy();
        return false;
      }
      if (!global.Phaser?.Game) throw new Error("Phaser 4.2.1 is unavailable");

      const ready = await createGame();
      if (!ready || generation !== S.generation || S.closing) return false;
      if (S.loading) S.loading.hidden = true;
      S.ready = true;
      return true;
    } catch (error) {
      if (generation !== S.generation || S.closing) return false;
      logError("open failed; using legacy Dojo", error);
      if (S.loading) S.loading.hidden = true;
      if (S.error) S.error.hidden = false;
      await cleanup();
      await callLegacy();
      return false;
    }
  }

  function init(deps) {
    const next = deps || {};
    if (typeof next.apiPost === "function") S.apiPost = next.apiPost;
    S.tg = next.tg || S.tg || global.Telegram?.WebApp || null;
    if (typeof next.dbg === "function" || typeof next.dbg === "boolean") S.dbg = next.dbg;
    if (typeof next.openLegacy === "function") S.openLegacy = next.openLegacy;
    return API;
  }

  function open() {
    if (S.opening) return S.opening;
    if (isOpen() && S.ready) return Promise.resolve(true);

    S.closing = false;
    const generation = ++S.generation;
    const opening = runOpen(generation);
    const wrapped = opening.finally(function clearOpeningState() {
      if (S.opening === wrapped) S.opening = null;
    });
    S.opening = wrapped;
    return wrapped;
  }

  async function close(options) {
    if (S.closing) return false;
    if (!S.root && !S.game && !S.opening) return false;
    S.closing = true;
    ++S.generation;
    try {
      await cleanup(options);
      return true;
    } finally {
      S.closing = false;
    }
  }

  function isOpen() {
    return !!(S.root && document.documentElement.contains(S.root) && !S.closing);
  }

  const API = { init, open, close, isOpen };
  global.AlphaDojoRoom = API;
})(window);
