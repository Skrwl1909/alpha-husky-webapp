// Alpha Husky — Phaser Dojo Movement Lab / Exploration Sector V1
(function (global) {
  "use strict";

  const ROOT_ID = "alphaDojoRoom";
  const CANVAS_ID = "alphaDojoCanvas";
  const STYLE_ID = "ah-dojo-room-css";
  const WORLD_WIDTH = 2200;
  const WORLD_HEIGHT = 1300;
  const PLAYER_SPAWN = Object.freeze({ x: 250, y: 1080 });
  const EXIT_POS = Object.freeze({ x: 200, y: 1140 });
  const RELAY_POS = Object.freeze({ x: 2000, y: 400 });
  const PLAYER_SPEED = 230;
  const EXIT_RANGE_SQ = 118 * 118;
  const READY_TIMEOUT_MS = 9000;
  const SECTOR_ID = "movement_lab_sector_v1";
  const PLAYER_TEXTURE = "ah-dojo-room-player-v1";
  const PLAYER_SHEET_TEXTURE = "ah-dojo-alpha-player-sheet-v1";
  const PLAYER_SHEET_URL = "assets/dojo/v1/processed/alpha_husky_player_sheet_v1.png";
  const PLAYER_SHEET_SCALE = 0.32;
  const DUMMY_TEXTURE = "ah-dojo-room-dummy-v1";
  const TERMINAL_RANGE_SQ = 168 * 168;
  const FLOOR_TILE_SCALE = 0.52;
  const WALL_SCALE = 0.25;
  const VERTICAL_WALL_SCALE = 0.162;
  const SENTINEL_SCALE = 0.18;
  const EXIT_GATE_SCALE = 0.22;
  const TERMINAL_SCALE = 0.26;
  // Local-only vertical-slice tuning. Keep combat numbers together until stats are wired in.
  const COMBAT = global.AlphaSectorCombatConfig?.makeCombatConfig?.({
    playerMaxHp: 100,
    playerDamage: 30,
    playerSpeed: PLAYER_SPEED,
    playerAttackRange: 86,
    playerAttackCooldownMs: 360,
    playerRespawnMs: 700,
    enemyMaxHp: 78,
    enemyDamage: 6,
    enemySpeed: 92,
    enemyAggroRange: 260,
    enemyAttackRange: 48,
    enemyAttackCooldownMs: 920,
    lootValue: 1
  }) || Object.freeze({
    playerMaxHp: 100, playerDamage: 30, playerSpeed: PLAYER_SPEED, playerAttackRange: 86, playerAttackCooldownMs: 360, playerRespawnMs: 700,
    enemyMaxHp: 78, enemyDamage: 6, enemySpeed: 92, enemyAggroRange: 260, enemyAttackRange: 48, enemyAttackCooldownMs: 920, lootValue: 1
  });
  // Compact three-beat sector. Enemies stay on authored walkable pads — never on spawn.
  const ENCOUNTERS = Object.freeze([
    {
      id: "south_ward",
      name: "SOUTH WARD",
      required: true,
      trigger: { x: 1040, y: 1020, w: 560, h: 400 },
      spawns: [{ x: 920, y: 1040 }, { x: 1140, y: 940 }]
    },
    {
      id: "north_ward",
      name: "NORTH WARD",
      required: true,
      trigger: { x: 1180, y: 360, w: 580, h: 380 },
      spawns: [{ x: 1020, y: 340 }, { x: 1320, y: 420 }]
    },
    {
      id: "relay_approach",
      name: "RELAY APPROACH",
      required: true,
      trigger: { x: 1900, y: 480, w: 560, h: 560 },
      spawns: [{ x: 1760, y: 560 }]
    }
  ]);
  const REQUIRED_ENEMY_COUNT = ENCOUNTERS.reduce(function countRequired(total, encounter) {
    return total + (encounter.required ? encounter.spawns.length : 0);
  }, 0);
  const PLAYER_ATTACK_RANGE_SQ = COMBAT.playerAttackRange * COMBAT.playerAttackRange;
  const ENEMY_AGGRO_RANGE_SQ = COMBAT.enemyAggroRange * COMBAT.enemyAggroRange;
  const ENEMY_ATTACK_RANGE_SQ = COMBAT.enemyAttackRange * COMBAT.enemyAttackRange;
  const ENVIRONMENT_ASSETS = Object.freeze({
    floor: { key: "dojo-floor-base", url: "assets/dojo/v1/processed/floor.webp" },
    terminal: { key: "dojo-terminal", url: "assets/dojo/v1/processed/terminal.webp" },
    wall: { key: "dojo-wall-horizontal", url: "assets/dojo/v1/processed/wall.webp" },
    verticalWall: { key: "dojo-wall-vertical", url: "assets/dojo/v1/processed/vertical_wall.webp" },
    sentinel: { key: "dojo-sentinel", url: "assets/dojo/v1/processed/sentinel.webp" },
    exitGate: { key: "dojo-exit-gate", url: "assets/dojo/v1/processed/exit_gate.webp" }
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
.ah-dojo-room .ah-sector-result{position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:18px;background:rgba(4,8,12,.72)}
.ah-dojo-room .ah-sector-result__card{width:min(420px,92vw);padding:18px 16px 14px;border:1px solid rgba(101,232,255,.28);border-radius:14px;background:linear-gradient(180deg,#15212c,#0c141c);color:#e8f3ff;text-align:center;box-shadow:0 16px 40px rgba(0,0,0,.45)}
.ah-dojo-room .ah-sector-result__card--failed{border-color:rgba(232,160,122,.4)}
.ah-dojo-room .ah-sector-result__card .ah-sector-result__eyebrow{color:#7f96a8;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.ah-dojo-room .ah-sector-result__card h2{margin:8px 0 6px;font-size:20px;letter-spacing:.04em}
.ah-dojo-room .ah-sector-result__card p{margin:0 0 12px;color:#b7c6d1;font-size:13px;line-height:1.4}
.ah-dojo-room .ah-sector-result__actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ah-dojo-room .ah-sector-result__actions button{min-height:42px;padding:8px 12px;border:1px solid rgba(151,188,207,.3);border-radius:10px;background:#111c27;color:#dcecff;font:700 11px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
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
          <span class="ah-dojo-room__eyebrow">Exploration Sector V1 · local</span>
          <strong class="ah-dojo-room__title">Movement Lab</strong>
        </div>
        <button class="ah-dojo-room__button ah-dojo-room__button--legacy" type="button" data-dojo-room-action="legacy">DPS Test</button>
      </header>
      <div class="ah-dojo-room__stage">
        <div id="${CANVAS_ID}" class="ah-dojo-room__canvas"></div>
        <div class="ah-dojo-room__loading" role="status"><span>Entering exploration sector…</span></div>
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
    if (action === "back" || action === "map") void close();
    if (action === "legacy") void openLegacyAfterClose();
    if ((action === "again" || action === "restart") && S.scene) resetSectorRun(S.scene);
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
    if (S.scene) S.scene.ahAttackPointerId = null;
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

  function createChaserTexture(scene) {
    const key = "ah-dojo-corrupted-chaser-v1";
    if (scene.textures.exists(key)) return key;
    const g = scene.add.graphics();
    g.fillStyle(0x220b22, 1);
    g.fillCircle(24, 17, 15);
    g.fillRoundedRect(14, 29, 20, 25, 7);
    g.fillTriangle(10, 15, 15, 1, 21, 15);
    g.fillTriangle(28, 15, 34, 1, 39, 16);
    g.fillStyle(0xf05aab, 1);
    g.fillCircle(19, 17, 3);
    g.fillCircle(29, 17, 3);
    g.fillRect(17, 35, 14, 4);
    g.lineStyle(2, 0xff70bd, 0.94);
    g.strokeCircle(24, 17, 16);
    g.strokeRoundedRect(13, 28, 22, 27, 8);
    g.generateTexture(key, 48, 60);
    g.destroy();
    return key;
  }

  function createLootTexture(scene) {
    const key = "ah-dojo-signal-shard-v1";
    if (scene.textures.exists(key)) return key;
    const g = scene.add.graphics();
    g.fillStyle(0x49e9ff, 0.95);
    g.fillTriangle(12, 1, 23, 12, 12, 24);
    g.fillTriangle(12, 1, 1, 12, 12, 24);
    g.lineStyle(2, 0xd9fbff, 0.98);
    g.strokeTriangle(12, 1, 23, 12, 12, 24);
    g.strokeTriangle(12, 1, 1, 12, 12, 24);
    g.generateTexture(key, 24, 24);
    g.destroy();
    return key;
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
    for (let x = 420; x <= 720; x += 60) markings.fillRect(x, 1088, 34, 4);
    markings.fillStyle(0x65e8ff, 0.16);
    markings.fillRect(180, 1188, 150, 6);
    markings.fillRect(1680, 620, 180, 5);
    markings.fillRect(1880, 300, 142, 5);
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

  function addHorizontalWallCollider(scene, group, x, y, width, height) {
    const debug = !!S.dbg;
    const collider = scene.add.rectangle(x, y + 4, width, height, 0x65e8ff, debug ? 0.2 : 0)
      .setDepth(debug ? 11 : 0)
      .setVisible(debug);
    if (debug) collider.setStrokeStyle(1, 0x8cefff, 0.92);
    scene.physics.add.existing(collider, true);
    group.add(collider);
    return collider;
  }

  function addEnvironmentWall(scene, group, x, y, width, height) {
    const wallAsset = ENVIRONMENT_ASSETS.wall;
    if (!scene.textures.exists(wallAsset.key)) {
      return addStaticBlock(scene, group, x, y, width, height, 0x1c2934, 0x527083).setDepth(10);
    }
    const wall = scene.add.image(x, y, wallAsset.key).setOrigin(0.5).setScale(WALL_SCALE).setDepth(10);
    // The visible lower chassis is centered slightly below the image pivot. Keep the body inside its solid metal footprint.
    const collider = addHorizontalWallCollider(scene, group, x, y, Math.min(218, width), height);
    (scene.ahHorizontalWalls || (scene.ahHorizontalWalls = [])).push({ image: wall, collider });
    return wall;
  }

  function addVerticalBlocker(scene, group, x, y, height) {
    const wall = addEnvironmentVerticalWall(scene, group, x, y);
    if (wall) return wall;
    return addStaticBlock(scene, group, x, y, 38, height || 210, 0x1c2934, 0x527083).setDepth(10);
  }

  function addEnvironmentVerticalWall(scene, group, x, y) {
    const wallAsset = ENVIRONMENT_ASSETS.verticalWall;
    // Do not recreate the former procedural blocker if the matching art is unavailable.
    if (!scene.textures.exists(wallAsset.key)) return null;
    const wall = scene.add.image(x, y, wallAsset.key).setOrigin(0.5, 0.4606).setScale(VERTICAL_WALL_SCALE).setDepth(10);
    scene.physics.add.existing(wall, true);
    refreshStaticBody(wall);
    // Source alpha bounds: x 395-626, y 58-1357, converted to the 0.162 display scale.
    wall.body.setSize(38, 210).setOffset(64, 9);
    group.add(wall);
    return wall;
  }

  function addTrainingDummy(scene) {
    const x = 1025;
    const y = 450;
    const sentinelAsset = ENVIRONMENT_ASSETS.sentinel;
    if (scene.textures.exists(sentinelAsset.key)) {
      const sentinel = scene.add.image(x, y, sentinelAsset.key).setOrigin(0.5).setScale(SENTINEL_SCALE).setDepth(20);
      scene.physics.add.existing(sentinel, true);
      refreshStaticBody(sentinel);
      // The hologram is non-solid; this is the lower chassis at the 0.18 display scale.
      sentinel.body.setSize(94, 40).setOffset(45, 122);
      scene.ahDummy = sentinel;
      scene.ahDummyBaseScale = SENTINEL_SCALE;
      return;
    }

    createDummyTexture(scene);
    scene.ahDummy = scene.physics.add.staticSprite(x, y, DUMMY_TEXTURE);
    scene.ahDummy.body.setSize(42, 48).setOffset(7, 19);
    scene.ahDummy.refreshBody();
    scene.ahDummy.setDepth(20);
    scene.ahDummyBaseScale = 1;
  }

  function addExitGateFrameCollider(scene, group, x, y, width, height) {
    const frame = scene.add.rectangle(x, y, width, height, 0x000000, 0).setVisible(false);
    scene.physics.add.existing(frame, true);
    group.add(frame);
    return frame;
  }

  function addExitGate(scene, group) {
    const x = EXIT_POS.x;
    const y = EXIT_POS.y;
    scene.ahExit = { x, y };
    const gateAsset = ENVIRONMENT_ASSETS.exitGate;
    if (scene.textures.exists(gateAsset.key)) {
      const gate = scene.add.image(x, y, gateAsset.key).setOrigin(0.5).setScale(EXIT_GATE_SCALE).setDepth(10);
      // Source alpha bounds: x 27-994, y 502-967. Only the visible side pillars collide.
      scene.ahExitGateFrames = [
        addExitGateFrameCollider(scene, group, x - 82, y - 7, 50, 99),
        addExitGateFrameCollider(scene, group, x + 81, y - 7, 50, 99)
      ];
      scene.ahExitGate = gate;
      return;
    }

    scene.add.rectangle(x, y, 150, 82, 0x173b44, 0.38).setStrokeStyle(2, 0x65e8ff, 0.65);
    scene.add.text(x, y, "EXIT // MAP", {
      fontFamily: "system-ui, sans-serif", fontSize: "14px", color: "#8cefff", fontStyle: "bold", letterSpacing: 2
    }).setOrigin(0.5);
  }

  function addTrainingTerminal(scene) {
    const x = RELAY_POS.x;
    const y = RELAY_POS.y;
    const terminalAsset = ENVIRONMENT_ASSETS.terminal;
    if (scene.textures.exists(terminalAsset.key)) {
      const terminal = scene.add.image(x, y, terminalAsset.key).setOrigin(0.5).setScale(TERMINAL_SCALE).setDepth(12);
      scene.physics.add.existing(terminal, true);
      // The hologram occupies the upper half of the artwork. Only the console chassis blocks movement.
      terminal.body.setSize(780, 280).setOffset(122, 515);
      refreshStaticBody(terminal);
      scene.ahTerminal = terminal;
      scene.ahTerminalBaseScale = TERMINAL_SCALE;
      scene.ahTerminalAnchor = { x, y: y + 38 };
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

  function makeLocalCombatSnapshot() {
    return Object.freeze({
      version: 1,
      maxHp: COMBAT.playerMaxHp,
      meleeDamage: COMBAT.playerDamage,
      howlDamage: COMBAT.playerDamage,
      damageMitigation: 0,
      source: Object.freeze({ level: 1, equipmentApplied: false, localTraining: true })
    });
  }

  function makeRunState() {
    const combatSnapshot = makeLocalCombatSnapshot();
    return {
      runId: global.AlphaSectorCombatConfig?.makeRunId?.(SECTOR_ID, SECTOR_ID) || (SECTOR_ID + "_" + Date.now()),
      sectorId: SECTOR_ID,
      status: "active",
      startedAt: Date.now(),
      combatSnapshot,
      playerHP: combatSnapshot.maxHp,
      lootTally: 0,
      enemiesDead: 0,
      requiredKills: REQUIRED_ENEMY_COUNT,
      relayState: "locked",
      exitUnlocked: false,
      encounters: Object.fromEntries(ENCOUNTERS.map(function mapEncounter(encounter) {
        return [encounter.id, { activated: false, cleared: false, remaining: encounter.spawns.length }];
      }))
    };
  }

  function requiredEncountersCleared(run) {
    return ENCOUNTERS.filter(function requiredOnly(encounter) { return encounter.required; })
      .every(function isCleared(encounter) { return run?.encounters?.[encounter.id]?.cleared === true; });
  }

  function updateCombatHud(scene) {
    const run = scene.ahRun;
    if (!scene.ahPlayer || !run) return;
    const hp = Math.max(0, run.playerHP || 0);
    scene.ahHpLabel?.setText("HP  " + hp + " / " + run.combatSnapshot.maxHp);
    const remaining = Math.max(0, run.requiredKills - run.enemiesDead);
    const relay = run.relayState === "active" ? "RELAY ACTIVE" : run.relayState === "ready" ? "RELAY READY" : "RELAY LOCKED";
    scene.ahCounter?.setText("CHASERS  " + remaining + " / " + run.requiredKills + "   LOOT  " + (run.lootTally || 0) + "   " + relay);
    scene.ahPlayerHp = run.playerHP;
    scene.ahLootTally = run.lootTally;
    scene.ahEnemiesDead = run.enemiesDead;
  }

  function updateEnemyBar(enemy) {
    if (!enemy?.active || !enemy.ahCombat) return;
    const ratio = Math.max(0, enemy.ahCombat.hp / COMBAT.enemyMaxHp);
    enemy.ahHpBack?.setPosition(enemy.x, enemy.y - 42);
    enemy.ahHpBar?.setPosition(enemy.x - 15 + (30 * ratio) / 2, enemy.y - 42).setDisplaySize(30 * ratio, 4);
    enemy.ahName?.setPosition(enemy.x, enemy.y - 58);
  }

  function addCombatEnemy(scene, x, y, encounter) {
    const enemy = scene.physics.add.sprite(x, y, createChaserTexture(scene));
    enemy.setDepth(25).setCollideWorldBounds(true);
    enemy.body.setSize(28, 28).setOffset(10, 28);
    enemy.ahCombat = {
      hp: COMBAT.enemyMaxHp,
      nextAttackAt: 0,
      dead: false,
      encounterId: encounter.id,
      required: encounter.required !== false
    };
    enemy.ahHpBack = scene.add.rectangle(x, y - 42, 32, 6, 0x130a17, 0.9).setDepth(40);
    enemy.ahHpBar = scene.add.rectangle(x, y - 42, 30, 4, 0xff5fa8, 0.98).setDepth(41);
    enemy.ahName = scene.add.text(x, y - 58, "CORRUPTED CHASER", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", color: "#ff9bca", fontStyle: "bold", letterSpacing: 1
    }).setOrigin(0.5).setDepth(40);
    return enemy;
  }

  function addCombatEncounter(scene, blockers) {
    scene.ahBlockers = blockers;
    scene.ahEnemies = scene.physics.add.group();
    scene.ahLoot = scene.physics.add.group();
    scene.ahNextPlayerAttackAt = 0;
    scene.ahNextHowlAt = 0;
    scene.physics.add.collider(scene.ahEnemies, blockers);
    scene.physics.add.collider(scene.ahEnemies, scene.ahEnemies);
    scene.physics.add.collider(scene.ahPlayer, scene.ahEnemies);
    scene.physics.add.overlap(scene.ahPlayer, scene.ahLoot, collectLoot, undefined, scene);
  }

  function spawnEncounter(scene, encounter) {
    encounter.spawns.forEach(function addSpawn(spawn) {
      scene.ahEnemies.add(addCombatEnemy(scene, spawn.x, spawn.y, encounter));
    });
  }

  function playerInTrigger(player, trigger) {
    return player.x >= trigger.x - trigger.w / 2 && player.x <= trigger.x + trigger.w / 2 &&
      player.y >= trigger.y - trigger.h / 2 && player.y <= trigger.y + trigger.h / 2;
  }

  function activateEncounter(scene, encounter) {
    const run = scene.ahRun;
    const state = run?.encounters?.[encounter.id];
    if (!state || state.activated || run.status !== "active") return;
    state.activated = true;
    spawnEncounter(scene, encounter);
    showSceneMessage(scene, encounter.name + " // THREATS ACTIVE");
    updateCombatHud(scene);
  }

  function activateEncounters(scene) {
    const player = scene.ahPlayer;
    const run = scene.ahRun;
    if (!player?.active || run?.status !== "active") return;
    for (const encounter of ENCOUNTERS) {
      if (!run.encounters[encounter.id].activated && playerInTrigger(player, encounter.trigger)) {
        activateEncounter(scene, encounter);
      }
    }
  }

  function nearestLivingEnemy(scene) {
    const player = scene.ahPlayer;
    if (!player?.active || !scene.ahEnemies) return null;
    let nearest = null;
    let nearestDistanceSq = Infinity;
    for (const enemy of global.AlphaSectorCombatConfig.getEnemyChildren(scene)) {
      if (!enemy?.active || enemy.ahCombat?.dead) continue;
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < nearestDistanceSq) {
        nearest = enemy;
        nearestDistanceSq = distanceSq;
      }
    }
    return nearest ? { enemy: nearest, distanceSq: nearestDistanceSq } : null;
  }

  function showAttackSlash(scene, target) {
    const player = scene.ahPlayer;
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const slash = scene.add.arc(player.x + Math.cos(angle) * 32, player.y + Math.sin(angle) * 32, 24, 210, 510, false, 0x8cefff, 0)
      .setStrokeStyle(4, 0xbaf6ff, 0.95).setDepth(50);
    scene.tweens.add({ targets: slash, alpha: 0, scaleX: 1.35, scaleY: 1.35, duration: 120, onComplete: function () { slash.destroy(); } });
  }

  function dropLoot(scene, x, y) {
    const pickup = scene.physics.add.sprite(x, y, createLootTexture(scene)).setDepth(24);
    pickup.body.setCircle(9, 3, 3);
    pickup.setVelocity((Math.random() - 0.5) * 90, -45 - Math.random() * 45).setDrag(260, 260).setMaxVelocity(90, 90);
    pickup.ahLootValue = COMBAT.lootValue;
    scene.ahLoot.add(pickup);
    scene.tweens.add({ targets: pickup, angle: 360, duration: 950, repeat: -1 });
  }

  function setRelayState(scene, state) {
    if (scene.ahRun) scene.ahRun.relayState = state;
    scene.ahRelayState = state;
    scene.ahEncounterCleared = state === "ready" || state === "active";
    const ready = state === "ready";
    const active = state === "active";
    scene.ahRelayLabel?.setText(active ? "RELAY // ACTIVE" : ready ? "RELAY // READY" : "RELAY // LOCKED")
      .setColor(state === "locked" ? "#e3a17e" : "#a9edf7");
    if (state === "locked") scene.ahTerminal?.setTint?.(0x7e8a91);
    else scene.ahTerminal?.setTint?.(0xbffaff);
    scene.ahRelayGlow?.setAlpha(active ? 0.28 : ready ? 0.18 : 0.04)
      .setStrokeStyle(2, active || ready ? 0x65e8ff : 0x53636a, active || ready ? 0.84 : 0.18);
    if (ready) scene.tweens.add({ targets: scene.ahRelayGlow, alpha: 0.36, duration: 520, yoyo: true, repeat: 1 });
  }

  function setExitLocked(scene, locked) {
    if (scene.ahRun) scene.ahRun.exitUnlocked = !locked;
    scene.ahExitUnlocked = !locked;
    if (locked) scene.ahExitGate?.setTint?.(0x4f4a55);
    else scene.ahExitGate?.clearTint?.();
  }

  function markRelayReady(scene) {
    const run = scene.ahRun;
    if (!run || run.status !== "active" || run.relayState !== "locked") return;
    if (!requiredEncountersCleared(run)) return;
    setRelayState(scene, "ready");
    showSceneMessage(scene, "Relay READY. Activate the core.");
    updateCombatHud(scene);
    scene.ahContext = null;
    updateProximity(scene);
  }

  function activateRelay(scene) {
    const run = scene.ahRun;
    if (!run || run.status !== "active" || run.relayState !== "ready") return;
    setRelayState(scene, "active");
    setExitLocked(scene, false);
    showSceneMessage(scene, "Relay ACTIVE. Exit unsealed.");
    updateCombatHud(scene);
    scene.ahContext = null;
    updateProximity(scene);
  }

  function clearEncounter(scene, encounterId) {
    const run = scene.ahRun;
    const encounter = ENCOUNTERS.find(function findEncounter(item) { return item.id === encounterId; });
    const state = run?.encounters?.[encounterId];
    if (!run || !encounter || !state || state.cleared) return;
    state.cleared = true;
    showSceneMessage(scene, encounter.name + " SECURED");
    if (requiredEncountersCleared(run)) markRelayReady(scene);
    updateCombatHud(scene);
    updateProximity(scene);
  }

  function killEnemy(scene, enemy) {
    if (!enemy?.active || enemy.ahCombat?.dead) return;
    const run = scene.ahRun;
    enemy.ahCombat.dead = true;
    delete enemy.ahHowlKnockback;
    dropLoot(scene, enemy.x, enemy.y);
    enemy.ahHpBack?.destroy();
    enemy.ahHpBar?.destroy();
    enemy.ahName?.destroy();
    scene.tweens.add({ targets: enemy, alpha: 0, scaleX: 1.2, scaleY: 1.2, duration: 170, onComplete: function () { enemy.destroy(); } });
    enemy.body.enable = false;
    if (run) {
      run.enemiesDead += 1;
      const state = run.encounters[enemy.ahCombat.encounterId];
      if (state) {
        state.remaining = Math.max(0, state.remaining - 1);
        if (state.remaining === 0) clearEncounter(scene, enemy.ahCombat.encounterId);
      }
    }
    updateCombatHud(scene);
  }

  function damageEnemy(scene, enemy, damage) {
    if (!enemy?.active || enemy.ahCombat?.dead) return;
    enemy.ahCombat.hp = Math.max(0, enemy.ahCombat.hp - damage);
    enemy.setTint(0xffffff);
    scene.time.delayedCall(70, function () { if (enemy?.active) enemy.clearTint(); });
    updateEnemyBar(enemy);
    if (enemy.ahCombat.hp <= 0) killEnemy(scene, enemy);
  }

  function removeResultPanel() {
    S.root?.querySelector(".ah-sector-result")?.remove();
  }

  function showResultPanel(scene, failed) {
    removeResultPanel();
    const run = scene.ahRun;
    const panel = document.createElement("section");
    panel.className = "ah-sector-result";
    panel.innerHTML = failed
      ? `<div class="ah-sector-result__card ah-sector-result__card--failed"><div class="ah-sector-result__eyebrow">MOVEMENT LAB</div><h2>RUN FAILED</h2><p>The simulation collapsed. The sector will reset.</p><div class="ah-sector-result__actions"><button type="button" data-dojo-room-action="restart">RESTART SECTOR</button><button type="button" data-dojo-room-action="map">RETURN</button></div></div>`
      : `<div class="ah-sector-result__card"><div class="ah-sector-result__eyebrow">SECTOR COMPLETE</div><h2>Movement Lab</h2><p>Relay restored. Local simulation only — no rewards were claimed.</p><dl style="display:grid;grid-template-columns:1fr 1fr;gap:6px 12px;margin:0 0 14px;text-align:left;font-size:12px;color:#c5d5df"><dt>Chasers</dt><dd>${run?.enemiesDead || 0} / ${run?.requiredKills || REQUIRED_ENEMY_COUNT}</dd><dt>Loot</dt><dd>${run?.lootTally || 0}</dd></dl><div class="ah-sector-result__actions"><button type="button" data-dojo-room-action="again">RUN AGAIN</button><button type="button" data-dojo-room-action="map">RETURN</button></div></div>`;
    S.root?.querySelector(".ah-dojo-room__stage")?.appendChild(panel);
  }

  function clearRunObjects(scene) {
    for (const enemy of global.AlphaSectorCombatConfig.getEnemyChildren(scene)) {
      enemy.ahHpBack?.destroy?.();
      enemy.ahHpBar?.destroy?.();
      enemy.ahName?.destroy?.();
      delete enemy.ahHowlKnockback;
    }
    scene.ahEnemies?.clear(true, true);
    scene.ahLoot?.clear(true, true);
    scene.ahTargetRing?.setVisible(false);
    scene.ahResetTimer?.remove?.(false);
    scene.ahResetTimer = null;
    removeResultPanel();
  }

  function resetSectorRun(scene) {
    if (!scene || S.closing) return;
    scene.ahRunGeneration = (scene.ahRunGeneration || 0) + 1;
    global.AlphaSectorCombatConfig.clearHowlBurstState(scene);
    clearRunObjects(scene);
    scene.input.enabled = true;
    if (scene.input?.keyboard) scene.input.keyboard.enabled = true;
    scene.ahPlayerControl = true;
    scene.ahRun = makeRunState();
    scene.ahNextPlayerAttackAt = 0;
    scene.ahNextHowlAt = 0;
    scene.ahPlayerInvulnerableUntil = scene.time.now + 450;
    scene.ahContext = null;
    const player = scene.ahPlayer;
    if (player) {
      player.enableBody(true, PLAYER_SPAWN.x, PLAYER_SPAWN.y, true, true).setAlpha(1).clearTint();
      player.setVelocity(0, 0);
      setPlayerAnimation(scene, "down", false);
    }
    setRelayState(scene, "locked");
    setExitLocked(scene, true);
    updateCombatHud(scene);
    updateProximity(scene);
    showSceneMessage(scene, "Follow the sector deeper.");
  }

  function completeSector(scene) {
    const run = scene.ahRun;
    if (!run || run.relayState !== "active" || run.status === "completed") return;
    run.status = "completed";
    scene.ahPlayerControl = false;
    scene.ahPlayer?.setVelocity(0, 0);
    global.AlphaSectorCombatConfig.clearHowlBurstState(scene, false);
    setContext(scene, null);
    showResultPanel(scene, false);
  }

  function failRun(scene) {
    const run = scene.ahRun;
    if (!run || run.status !== "active") return;
    run.status = "failed";
    scene.ahPlayerControl = false;
    global.AlphaSectorCombatConfig.clearHowlBurstState(scene);
    for (const enemy of global.AlphaSectorCombatConfig.getEnemyChildren(scene)) {
      if (typeof enemy.setVelocity === "function") enemy.setVelocity(0, 0);
    }
    scene.ahPlayer?.disableBody(true, true);
    scene.input.enabled = false;
    setContext(scene, null);
    showSceneMessage(scene, "You were overwhelmed. Resetting sector...");
    showResultPanel(scene, true);
    const generation = scene.ahRunGeneration || 0;
    scene.ahResetTimer?.remove?.(false);
    scene.ahResetTimer = scene.time.delayedCall(COMBAT.playerRespawnMs, function resetAfterDeath() {
      if (S.closing || scene.ahRunGeneration !== generation) return;
      resetSectorRun(scene);
    });
  }

  function damagePlayer(scene, damage, time) {
    const player = scene.ahPlayer;
    const run = scene.ahRun;
    if (!player?.active || !run || run.status !== "active" || time < (scene.ahPlayerInvulnerableUntil || 0)) return;
    run.playerHP = Math.max(0, run.playerHP - damage);
    player.setTint(0xff8da7);
    scene.time.delayedCall(90, function () { if (player?.active && scene.ahRun?.runId === run.runId) player.clearTint(); });
    updateCombatHud(scene);
    if (run.playerHP > 0) return;
    failRun(scene);
  }

  function tryPlayerAttack(scene, time) {
    if (scene.ahRun?.status !== "active" || !scene.ahPlayer?.active || time < (scene.ahNextPlayerAttackAt || 0)) return false;
    const target = nearestLivingEnemy(scene);
    if (!target || target.distanceSq > PLAYER_ATTACK_RANGE_SQ) {
      if (!target) showSceneMessage(scene, "No hostile target.");
      else showSceneMessage(scene, "Target out of melee range.");
      return false;
    }
    scene.ahNextPlayerAttackAt = time + COMBAT.playerAttackCooldownMs;
    showAttackSlash(scene, target.enemy);
    damageEnemy(scene, target.enemy, COMBAT.playerDamage);
    return true;
  }

  function updateHowlControl(scene, time) {
    if (!global.AlphaSectorCombatConfig) return;
    const remaining = global.AlphaSectorCombatConfig.getHowlCooldownRemaining(scene, time);
    const active = scene.ahRun?.status === "active" && !!scene.ahPlayer?.active && !!scene.ahPlayerControl && scene.input?.enabled !== false;
    const ready = active && remaining <= 0;
    scene.ahHowlRing?.setAlpha(ready ? 1 : 0.38);
    scene.ahHowlLabel?.setAlpha(ready ? 1 : 0.52).setText(!active ? "HOWL\n--" : ready ? "HOWL" : "HOWL\n" + Math.ceil(remaining / 1000) + "s");
    if (scene.ahHowlHit?.input) scene.ahHowlHit.input.enabled = ready;
  }

  function tryHowlBurst(scene, time) {
    if (scene.ahRun?.status !== "active" || !scene.ahPlayer?.active || !scene.ahPlayerControl) return false;
    const result = global.AlphaSectorCombatConfig.triggerHowlBurst(scene, time, damageEnemy);
    if (!result.activated) return false;
    showSceneMessage(scene, result.affected ? "Howl Burst hit " + result.affected + " Chaser" + (result.affected === 1 ? "." : "s.") : "Howl Burst released.");
    updateHowlControl(scene, time);
    return true;
  }

  function collectLoot(player, pickup) {
    if (!pickup?.active) return;
    const scene = this;
    const value = pickup.ahLootValue || 0;
    pickup.disableBody(true, true);
    pickup.destroy();
    if (scene.ahRun) scene.ahRun.lootTally += value;
    else scene.ahLootTally += value;
    updateCombatHud(scene);
    showSceneMessage(scene, "+" + value + " signal shard");
  }

  function updateCombat(scene, time) {
    const player = scene.ahPlayer;
    const target = nearestLivingEnemy(scene);
    if (target) {
      scene.ahTargetRing.setPosition(target.enemy.x, target.enemy.y + 18).setVisible(true);
      scene.ahTargetLabel.setText("TARGET  " + Math.ceil(Math.sqrt(target.distanceSq))).setVisible(true);
    } else {
      scene.ahTargetRing.setVisible(false);
      const run = scene.ahRun;
      const label = run?.relayState === "active" ? "EXIT OPEN" : run?.relayState === "ready" ? "RELAY READY" : requiredEncountersCleared(run) ? "AREA CLEAR" : "EXPLORE";
      scene.ahTargetLabel.setText(label).setVisible(true);
    }
    if (!player?.active || !scene.ahEnemies || scene.ahRun?.status !== "active") return;
    for (const enemy of global.AlphaSectorCombatConfig.getEnemyChildren(scene)) {
      if (!enemy?.active || enemy.ahCombat?.dead) continue;
      if (global.AlphaSectorCombatConfig.updateHowlKnockback(enemy, time)) {
        updateEnemyBar(enemy);
        continue;
      }
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq <= ENEMY_ATTACK_RANGE_SQ) {
        enemy.setVelocity(0, 0);
        if (time >= enemy.ahCombat.nextAttackAt) {
          enemy.ahCombat.nextAttackAt = time + COMBAT.enemyAttackCooldownMs;
          damagePlayer(scene, COMBAT.enemyDamage, time);
        }
      } else if (distanceSq <= ENEMY_AGGRO_RANGE_SQ) {
        const length = Math.sqrt(distanceSq) || 1;
        enemy.setVelocity((dx / length) * COMBAT.enemySpeed, (dy / length) * COMBAT.enemySpeed);
      } else {
        enemy.setVelocity(0, 0);
      }
      updateEnemyBar(enemy);
    }
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

    addEnvironmentWall(scene, blockers, 400, 780, 230, 42);
    addEnvironmentWall(scene, blockers, 1180, 680, 230, 42);
    addEnvironmentWall(scene, blockers, 1450, 680, 190, 38);
    addEnvironmentWall(scene, blockers, 1980, 200, 190, 38);
    addVerticalBlocker(scene, blockers, 760, 180, 220);
    addVerticalBlocker(scene, blockers, 760, 1220, 220);
    addVerticalBlocker(scene, blockers, 1580, 180, 220);
    addVerticalBlocker(scene, blockers, 1580, 1220, 220);

    scene.add.text(120, 980, "SPAWN YARD", {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#577487", letterSpacing: 2
    }).setDepth(6);
    scene.add.text(980, 180, "NORTH WARD", {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#577487", letterSpacing: 2
    }).setDepth(6);
    scene.add.text(880, 1180, "SOUTH WARD", {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#577487", letterSpacing: 2
    }).setDepth(6);
    scene.add.text(1760, 160, "RELAY BAY", {
      fontFamily: "system-ui, sans-serif", fontSize: "15px", color: "#577487", letterSpacing: 2
    }).setDepth(6);
    scene.add.text(160, 1228, "LOCAL SIMULATION · NO REWARDS", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#566c79", letterSpacing: 1
    }).setDepth(6);

    addExitGate(scene, blockers);

    addTrainingTerminal(scene);

    scene.ahPlayerIsSheet = createPlayerAnimations(scene);
    if (scene.ahPlayerIsSheet) {
      scene.ahPlayer = scene.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_SHEET_TEXTURE, 0);
      scene.ahPlayer.setScale(PLAYER_SHEET_SCALE);
      scene.ahPlayer.body.setSize(70, 90).setOffset(93, 150);
      scene.ahPlayerDirection = "down";
      setPlayerAnimation(scene, "down", false);
    } else {
      createPlayerTexture(scene);
      scene.ahPlayer = scene.physics.add.sprite(PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_TEXTURE);
      scene.ahPlayer.body.setSize(22, 28).setOffset(13, 32);
    }
    scene.ahPlayer.setCollideWorldBounds(true);
    scene.ahPlayer.setDepth(30);
    scene.physics.add.collider(scene.ahPlayer, blockers);
    scene.physics.add.collider(scene.ahPlayer, scene.ahTerminal);
    addCombatEncounter(scene, blockers);
    scene.ahRelayGlow = scene.add.circle(scene.ahTerminalAnchor.x, scene.ahTerminalAnchor.y + 8, 62, 0x65e8ff, 0.04).setStrokeStyle(2, 0x65e8ff, 0.18).setDepth(11);
    scene.ahRelayLabel = scene.add.text(scene.ahTerminalAnchor.x, scene.ahTerminalAnchor.y - 72, "RELAY // LOCKED", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#e3a17e", fontStyle: "bold", letterSpacing: 2
    }).setOrigin(0.5).setDepth(40);
    setRelayState(scene, "locked");
    setExitLocked(scene, true);
  }

  function createControls(scene) {
    scene.ahMove = new global.Phaser.Math.Vector2(0, 0);
    scene.ahJoystickVector = { x: 0, y: 0 };
    scene.ahJoystickPointerId = null;
    scene.ahInteractionPointerId = null;
    scene.ahAttackPointerId = null;
    scene.ahHowlPointerId = null;
    scene.ahContext = null;
    scene.ahVisibilityPaused = false;

    scene.ahJoystickBase = scene.add.circle(86, 86, 54, 0x0b1620, 0.72).setStrokeStyle(2, 0x65e8ff, 0.44).setScrollFactor(0).setDepth(100);
    scene.ahJoystickThumb = scene.add.circle(86, 86, 25, 0x65e8ff, 0.28).setStrokeStyle(2, 0xbaf6ff, 0.7).setScrollFactor(0).setDepth(101);
    scene.ahJoystickHit = scene.add.zone(86, 86, 160, 160).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahInteractRing = scene.add.circle(100, 100, 37, 0x111a23, 0.8).setStrokeStyle(2, 0x50616f, 0.65).setScrollFactor(0).setDepth(100);
    scene.ahInteractLabel = scene.add.text(100, 100, "--", {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#71828e", fontStyle: "bold", align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    scene.ahInteractHit = scene.add.zone(100, 100, 104, 104).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahAttackRing = scene.add.circle(100, 100, 37, 0x3b122d, 0.88).setStrokeStyle(2, 0xff70bd, 0.92).setScrollFactor(0).setDepth(100);
    scene.ahAttackLabel = scene.add.text(100, 100, "ATTACK", {
      fontFamily: "system-ui, sans-serif", fontSize: "10px", color: "#ffd1e8", fontStyle: "bold", align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    scene.ahAttackHit = scene.add.zone(100, 100, 104, 104).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahHowlRing = scene.add.circle(100, 100, 32, 0x123741, 0.9).setStrokeStyle(2, 0xbaf6ff, 0.92).setScrollFactor(0).setDepth(100);
    scene.ahHowlLabel = scene.add.text(100, 100, "HOWL", {
      fontFamily: "system-ui, sans-serif", fontSize: "9px", color: "#e8fdff", fontStyle: "bold", align: "center"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    scene.ahHowlHit = scene.add.zone(100, 100, 84, 84).setScrollFactor(0).setDepth(102).setInteractive();

    scene.ahPrompt = scene.add.text(0, 18, "WASD / ARROWS · MOVE", {
      fontFamily: "system-ui, sans-serif", fontSize: "12px", color: "#88a2b3", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.72)", padding: { x: 10, y: 6 }, align: "center"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);
    scene.ahCounter = scene.add.text(14, 16, "CHASERS  " + REQUIRED_ENEMY_COUNT + " / " + REQUIRED_ENEMY_COUNT + "   LOOT  0   RELAY LOCKED", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#c5d5df", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.64)", padding: { x: 8, y: 6 }
    }).setScrollFactor(0).setDepth(100);
    scene.ahMessage = scene.add.text(0, 58, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "13px", color: "#d8b570", fontStyle: "bold",
      backgroundColor: "rgba(10,14,18,.78)", padding: { x: 12, y: 7 }, align: "center"
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    scene.ahHpLabel = scene.add.text(14, 52, "HP  100 / 100", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#baf6ff", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.64)", padding: { x: 8, y: 6 }
    }).setScrollFactor(0).setDepth(100);
    scene.ahTargetRing = scene.add.circle(0, 0, 29, 0xff70bd, 0).setStrokeStyle(2, 0xff9bca, 0.85).setDepth(22).setVisible(false);
    scene.ahTargetLabel = scene.add.text(0, 86, "", {
      fontFamily: "system-ui, sans-serif", fontSize: "11px", color: "#ffb6db", fontStyle: "bold",
      backgroundColor: "rgba(5,10,15,.64)", padding: { x: 8, y: 6 }
    }).setScrollFactor(0).setDepth(100).setOrigin(0, 0);

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
      if (pointer.id === scene.ahAttackPointerId) scene.ahAttackPointerId = null;
      if (pointer.id === scene.ahHowlPointerId) scene.ahHowlPointerId = null;
    };
    scene.ahOnGameOut = function () { resetJoystick(scene); };
    scene.ahOnInteractionDown = function (pointer) {
      if (scene.ahInteractionPointerId !== null || !scene.ahContext || !scene.input.enabled) return;
      scene.ahInteractionPointerId = pointer.id;
      performInteraction(scene);
    };
    scene.ahOnAttackDown = function (pointer) {
      if (scene.ahAttackPointerId !== null || !scene.input.enabled) return;
      scene.ahAttackPointerId = pointer.id;
      tryPlayerAttack(scene, scene.time.now);
    };
    scene.ahOnHowlDown = function (pointer) {
      if (scene.ahHowlPointerId !== null || !scene.input.enabled) return;
      scene.ahHowlPointerId = pointer.id;
      tryHowlBurst(scene, scene.time.now);
    };

    scene.ahJoystickHit.on("pointerdown", scene.ahOnJoystickDown);
    scene.ahInteractHit.on("pointerdown", scene.ahOnInteractionDown);
    scene.ahAttackHit.on("pointerdown", scene.ahOnAttackDown);
    scene.ahHowlHit.on("pointerdown", scene.ahOnHowlDown);
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
    updateCombatHud(scene);
    updateHowlControl(scene, scene.time.now);
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
    const attackX = Math.max(joyX + 96, interactX - (compact ? 84 : 94));
    scene.ahAttackRing?.setPosition(attackX, controlY);
    scene.ahAttackLabel?.setPosition(attackX, controlY);
    scene.ahAttackHit?.setPosition(attackX, controlY);
    scene.ahHowlRing?.setPosition(attackX, controlY - (compact ? 76 : 84));
    scene.ahHowlLabel?.setPosition(attackX, controlY - (compact ? 76 : 84));
    scene.ahHowlHit?.setPosition(attackX, controlY - (compact ? 76 : 84));
    scene.ahPrompt?.setPosition(width / 2, Math.max(12, insets.top + 12));
    scene.ahMessage?.setPosition(width / 2, Math.max(50, insets.top + 50));
    scene.ahCounter?.setPosition(Math.max(10, insets.left + 10), Math.max(10, insets.top + 10));
    scene.ahHpLabel?.setPosition(Math.max(10, insets.left + 10), Math.max(46, insets.top + 46));
    scene.ahTargetLabel?.setPosition(Math.max(10, insets.left + 10), Math.max(82, insets.top + 82));
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
    if (context === "terminal") {
      const relayState = scene.ahRun?.relayState || scene.ahRelayState || "locked";
      if (relayState === "ready") {
        scene.ahInteractLabel.setText("ACTIVATE").setFontSize(9).setColor("#baf6ff");
        scene.ahInteractRing.setFillStyle(0x123741, 0.9).setStrokeStyle(2, 0x65e8ff, 0.98);
        scene.ahPrompt.setText("RELAY READY - E / SPACE TO ACTIVATE").setColor("#a9edf7");
      } else if (relayState === "active") {
        scene.ahInteractLabel.setText("ACTIVE").setFontSize(10).setColor("#baf6ff");
        scene.ahInteractRing.setFillStyle(0x123741, 0.9).setStrokeStyle(2, 0x65e8ff, 0.98);
        scene.ahPrompt.setText("RELAY ACTIVE - RETURN TO THE EXIT").setColor("#a9edf7");
      } else {
        scene.ahInteractLabel.setText("LOCKED").setFontSize(10).setColor("#f1b08b");
        scene.ahInteractRing.setFillStyle(0x3a211d, 0.9).setStrokeStyle(2, 0xd77d5a, 0.98);
        scene.ahPrompt.setText("RELAY LOCKED - CLEAR THE SECTOR").setColor("#e7b28e");
      }
      return;
    }
    if (context === "exit") {
      if (scene.ahRun?.exitUnlocked || scene.ahExitUnlocked) {
        scene.ahInteractLabel.setText("EXIT").setFontSize(13).setColor("#b8f6ff");
        scene.ahInteractRing.setFillStyle(0x123741, 0.86).setStrokeStyle(2, 0x65e8ff, 0.95);
        scene.ahPrompt.setText("EXIT UNLOCKED - E / SPACE").setColor("#a9edf7");
      } else {
        scene.ahInteractLabel.setText("SEALED").setFontSize(10).setColor("#f1b08b");
        scene.ahInteractRing.setFillStyle(0x3a211d, 0.9).setStrokeStyle(2, 0xd77d5a, 0.98);
        scene.ahPrompt.setText("EXIT SEALED - ACTIVATE THE RELAY").setColor("#e7b28e");
      }
      return;
    }
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
    if (!context) scene.ahPrompt.setText("WASD / ARROWS - MOVE · F / SPACE - ATTACK · Q - HOWL · E INTERACT").setColor("#88a2b3");
  }

  function showSceneMessage(scene, text) {
    scene.ahMessageTimer?.remove?.(false);
    scene.ahMessage.setText(text).setVisible(true);
    scene.ahMessageTimer = scene.time.delayedCall(1500, function hideDojoMessage() {
      scene.ahMessage?.setVisible(false);
    });
  }

  function performInteraction(scene) {
    const run = scene.ahRun;
    if (!run || run.status === "failed" || run.status === "completed") return;
    if (scene.ahContext === "exit") {
      if (!run.exitUnlocked) {
        showSceneMessage(scene, run.relayState === "ready"
          ? "Exit sealed. Activate the Relay first."
          : "Exit sealed. Restore the Relay Core.");
        return;
      }
      completeSector(scene);
      return;
    }
    if (scene.ahContext === "terminal") {
      if (run.relayState === "locked") {
        const remaining = Math.max(0, run.requiredKills - run.enemiesDead);
        showSceneMessage(scene, remaining ? "Relay locked. " + remaining + " Chasers remain." : "Relay locked.");
        return;
      }
      if (run.relayState === "active") {
        showSceneMessage(scene, "Relay already active. Use the exit.");
        return;
      }
      activateRelay(scene);
      const terminal = scene.ahTerminal;
      if (!terminal) return;
      scene.tweens.killTweensOf(terminal);
      scene.tweens.killTweensOf(scene.ahTerminalGlow);
      scene.tweens.add({
        targets: terminal,
        scaleX: scene.ahTerminalBaseScale * 1.025,
        scaleY: scene.ahTerminalBaseScale * 1.025,
        duration: 105,
        yoyo: true,
        onComplete: function clearTerminalPulse() {
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
    const dummyBaseScale = scene.ahDummyBaseScale || 1;
    scene.tweens.add({
      targets: scene.ahDummy,
      scaleX: dummyBaseScale * 1.045,
      scaleY: dummyBaseScale * 1.045,
      duration: 90,
      yoyo: true,
      onComplete: function clearDummySignal() {
        scene.ahDummy?.clearTint?.();
        scene.ahDummy?.setScale?.(dummyBaseScale);
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
      attack: global.Phaser.Input.Keyboard.KeyCodes.F,
      howl: global.Phaser.Input.Keyboard.KeyCodes.Q,
      space: global.Phaser.Input.Keyboard.KeyCodes.SPACE,
      escape: global.Phaser.Input.Keyboard.KeyCodes.ESC
    });
  }

  function updatePlayer(scene, time) {
    if (!scene.ahPlayerControl || !scene.ahPlayer?.active) {
      scene.ahStopPlayer?.();
      return;
    }
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
    const run = scene.ahRun;
    if (!run || run.status === "failed" || run.status === "completed") {
      setContext(scene, null);
      return;
    }
    const player = scene.ahPlayer;
    const edx = player.x - scene.ahExit.x;
    const edy = player.y - scene.ahExit.y;
    const exitDistanceSq = edx * edx + edy * edy;
    const terminal = scene.ahTerminalAnchor;
    const tdx = terminal ? player.x - terminal.x : Infinity;
    const tdy = terminal ? player.y - terminal.y : Infinity;
    const terminalDistanceSq = tdx * tdx + tdy * tdy;
    const options = [];
    if (terminalDistanceSq <= TERMINAL_RANGE_SQ) options.push({ context: "terminal", distanceSq: terminalDistanceSq });
    if (exitDistanceSq <= EXIT_RANGE_SQ) options.push({ context: "exit", distanceSq: exitDistanceSq });
    options.sort(function nearestFirst(a, b) { return a.distanceSq - b.distanceSq; });
    setContext(scene, options[0]?.context || null);
  }

  function handleKeyboardActions(scene) {
    if (!scene.ahKeys) return;
    const keyboard = global.Phaser.Input.Keyboard;
    if (keyboard.JustDown(scene.ahKeys?.attack)) tryPlayerAttack(scene, scene.time.now);
    if (keyboard.JustDown(scene.ahKeys?.howl)) tryHowlBurst(scene, scene.time.now);
    if (keyboard.JustDown(scene.ahKeys?.interact)) {
      performInteraction(scene);
    }
    if (keyboard.JustDown(scene.ahKeys?.space)) {
      const target = nearestLivingEnemy(scene);
      if (target && target.distanceSq <= PLAYER_ATTACK_RANGE_SQ) tryPlayerAttack(scene, scene.time.now);
      else performInteraction(scene);
    }
    if (keyboard.JustDown(scene.ahKeys?.escape)) void close();
  }

  function onSceneShutdown() {
    const scene = this;
    resetJoystick(scene);
    scene.ahStopPlayer?.();
    scene.ahJoystickHit?.off("pointerdown", scene.ahOnJoystickDown);
    scene.ahInteractHit?.off("pointerdown", scene.ahOnInteractionDown);
    scene.ahAttackHit?.off("pointerdown", scene.ahOnAttackDown);
    scene.ahHowlHit?.off("pointerdown", scene.ahOnHowlDown);
    scene.input?.off("pointermove", scene.ahOnPointerMove);
    scene.input?.off("pointerup", scene.ahOnPointerUp);
    scene.input?.off("gameout", scene.ahOnGameOut);
    scene.ahMessageTimer?.remove?.(false);
    scene.ahResetTimer?.remove?.(false);
    scene.ahResetTimer = null;
    global.AlphaSectorCombatConfig.clearHowlBurstState(scene);
    removeResultPanel();
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
      resetSectorRun(this);
      S.canvas.setAttribute("aria-label", "Playable Alpha Husky exploration sector");
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
    activateEncounters(this);
    updateProximity(this);
    updateCombat(this, time);
    updateHowlControl(this, time);
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
