// js/siege_pixi.js
// Alpha Husky — Siege Battle Viewer
// Hybrid viewer: Pixi v8 if available, safe DOM fallback if not.

(function () {
  const SiegePixi = {};

  let _container = null;
let _root = null;
let _stageMount = null;
let _stageBg = null;
let _logEl = null;
let _metaEl = null;
let _badgeEl = null;

let _leftAvatarEl = null;
let _leftNameEl = null;
let _leftFactionEl = null;
let _leftHpTextEl = null;
let _leftHpFillEl = null;
let _leftPopupEl = null;

let _rightAvatarEl = null;
let _rightNameEl = null;
let _rightFactionEl = null;
let _rightHpTextEl = null;
let _rightHpFillEl = null;
let _rightPopupEl = null;

let _app = null;
let _gfx = null;
let _pixiReady = false;
let _usingPixi = false;

let _lastReplay = null;
let _playState = null;
let _opts = {};

let _runToken = 0;
let _timers = [];

  function esc(v) {
    return String(v == null ? "" : v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function num(v, d = 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  }

  function pct(v, max) {
    const m = Math.max(1, num(max, 1));
    return Math.max(0, Math.min(100, (num(v, 0) / m) * 100));
  }

  function pick(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  }
  function initials(name, fallback = "?") {
  const s = String(name || "").trim();
  if (!s) return fallback;
  const parts = s.split(/\s+/).filter(Boolean).slice(0, 2);
  const out = parts.map(p => p.charAt(0)).join("").toUpperCase();
  return out || fallback;
}

function replayAvatar(side) {
  return String(pick(
    side?.avatarUrl,
    side?.avatar_url,
    side?.portraitUrl,
    side?.portrait_url,
    side?.avatar,
    side?.portrait,
    side?.img,
    side?.image,
    side?.icon,
    side?.iconUrl,
    side?.icon_url,
    ""
  ) || "");
}

function replayHpMax(side) {
  const out = num(pick(
    side?.hpMax,
    side?.hp_max,
    side?.maxHp,
    side?.max_hp,
    side?.playerHpMax,
    side?.player_hp_max,
    side?.youHpMax,
    side?.you_hp_max,
    side?.targetHpMax,
    side?.target_hp_max,
    side?.hpStart,
    side?.hp_start,
    side?.hp,
    side?.currentHp,
    side?.current_hp,
    0
  ), 0);

  return Math.max(1, out || 1);
}

function replayHpStart(side, hpMax) {
  const out = num(pick(
    side?.hpStart,
    side?.hp_start,
    side?.hp,
    side?.currentHp,
    side?.current_hp,
    hpMax
  ), hpMax);

  return Math.max(0, out);
}

function avatarNodeHtml(data, fallback) {
  const src = String(data?.avatarUrl || "").trim();
  if (src) {
    return `<img src="${esc(src)}" alt="${esc(data?.name || fallback || "avatar")}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }

  return `
    <div style="
      width:100%;
      height:100%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:15px;
      font-weight:900;
      color:#eef4ff;
      background:
        radial-gradient(circle at 30% 30%, rgba(255,255,255,.10), transparent 40%),
        linear-gradient(180deg, rgba(24,28,44,.96), rgba(10,12,22,.98));
    ">${esc(initials(data?.name || "", fallback || "?"))}</div>
  `;
}

  function clearTimers() {
    for (const t of _timers) clearTimeout(t);
    _timers = [];
  }

  function later(ms, fn) {
    const id = setTimeout(fn, ms);
    _timers.push(id);
    return id;
  }

  function hasPixi() {
    const P = window.PIXI;
    return !!(P && P.Application && P.Graphics);
  }

  function popupColor(kind) {
    if (kind === "heal") return "#8bffb2";
    if (kind === "crit") return "#ffd86b";
    return "#ff8f8f";
  }

  function fighterHudHtml(side) {
  const right = side === "right";
  const align = right ? "right" : "left";
  const prefix = side === "left" ? "LEFT" : "RIGHT";

  return `
    <div style="
      position:relative;
      min-width:0;
      pointer-events:none;
      border:1px solid rgba(255,255,255,.10);
      background:rgba(9,12,24,.68);
      backdrop-filter:blur(6px);
      border-radius:14px;
      padding:10px;
      box-shadow:0 8px 24px rgba(0,0,0,.24);
      text-align:${align};
    ">
      <div style="
        position:absolute;
        top:8px;
        ${right ? "left:10px" : "right:10px"};
        opacity:0;
        transition:opacity .16s ease;
        padding:3px 8px;
        border-radius:999px;
        background:rgba(10,12,24,.88);
        border:1px solid rgba(255,255,255,.12);
        font-size:11px;
        font-weight:900;
        letter-spacing:.02em;
      " id="ah-siege-${side}-popup"></div>

      <div style="font-size:11px;opacity:.72;margin-bottom:8px;letter-spacing:.04em;font-weight:800;">${prefix}</div>

      <div style="display:flex;align-items:center;gap:10px;${right ? "flex-direction:row-reverse;" : ""}">
        <div id="ah-siege-${side}-avatar" style="
          width:54px;
          height:54px;
          min-width:54px;
          border-radius:14px;
          overflow:hidden;
          border:1px solid rgba(255,255,255,.12);
          box-shadow:inset 0 1px 0 rgba(255,255,255,.06), 0 6px 18px rgba(0,0,0,.22);
          background:rgba(8,10,22,.82);
        ">
          ${avatarNodeHtml({ name: prefix, avatarUrl: "" }, side === "left" ? "L" : "R")}
        </div>

        <div style="min-width:0;flex:1;">
          <div id="ah-siege-${side}-name" style="font-size:15px;font-weight:900;line-height:1.15;">—</div>
          <div id="ah-siege-${side}-faction" style="font-size:12px;opacity:.72;margin-top:4px;">—</div>
        </div>
      </div>

      <div style="margin-top:10px;">
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;opacity:.84;margin-bottom:5px;">
          <span>HP</span>
          <b id="ah-siege-${side}-hp-text">0 / 0</b>
        </div>
        <div style="
          height:10px;
          border-radius:999px;
          background:rgba(255,255,255,.07);
          overflow:hidden;
          border:1px solid rgba(255,255,255,.08);
        ">
          <div id="ah-siege-${side}-hp-fill" style="
            width:0%;
            height:100%;
            border-radius:999px;
            transition:width .28s ease;
            background:${right
              ? "linear-gradient(90deg, rgba(255,105,190,.95), rgba(255,105,190,.55))"
              : "linear-gradient(90deg, rgba(0,246,255,.95), rgba(0,246,255,.55))"};
            box-shadow:${right
              ? "0 0 16px rgba(255,105,190,.18)"
              : "0 0 16px rgba(0,246,255,.18)"};
          "></div>
        </div>
      </div>
    </div>
  `;
}

  function replayInfo(replay) {
  const left = replay?.left || {};
  const right = replay?.right || {};

  const leftHpMax = replayHpMax(left);
  const rightHpMax = replayHpMax(right);
  const leftHpStart = replayHpStart(left, leftHpMax);
  const rightHpStart = replayHpStart(right, rightHpMax);

  const winnerSide = String(replay?.winner || "");
  const winnerName =
    winnerSide === "left"
      ? String(left.name || "Left")
      : winnerSide === "right"
      ? String(right.name || "Right")
      : String(replay?.winner || "Unknown");

  return {
    fightNo: num(replay?.fightNo, num(replay?.fight_no, 0)),
    turns: Array.isArray(replay?.turns) ? replay.turns : [],
    left: {
      uid: String(left.uid || ""),
      name: String(left.name || "Left"),
      faction: String(left.faction || ""),
      hpStart: leftHpStart,
      hpMax: leftHpMax,
      avatarUrl: replayAvatar(left),
    },
    right: {
      uid: String(right.uid || ""),
      name: String(right.name || "Right"),
      faction: String(right.faction || ""),
      hpStart: rightHpStart,
      hpMax: rightHpMax,
      avatarUrl: replayAvatar(right),
    },
    winnerSide,
    winnerName,
  };
}

  function makeTurnText(turn, info) {
    const actorSide = String(turn?.actor || "");
    const targetSide = String(turn?.target || "");
    const kind = String(turn?.kind || "hit");
    const value = num(turn?.value, 0);
    const hpAfter = num(turn?.targetHpAfter, 0);

    const actorName =
      actorSide === "left"
        ? info.left.name
        : actorSide === "right"
        ? info.right.name
        : "Unknown";

    const targetName =
      targetSide === "left"
        ? info.left.name
        : targetSide === "right"
        ? info.right.name
        : "Target";

    const custom = pick(turn?.text, turn?.msg, turn?.message);
    if (custom) return String(custom);

    if (kind === "heal") return `${actorName} healed ${targetName} for ${value}. HP now ${hpAfter}`;
    if (kind === "crit") return `${actorName} crit ${targetName} for ${value}. HP now ${hpAfter}`;
    if (kind === "block") return `${actorName} blocked the attack.`;
    if (kind === "miss") return `${actorName} missed ${targetName}.`;
    if (kind === "log") return `${actorName}: ${value}`;

    return `${actorName} hit ${targetName} for ${value}. HP now ${hpAfter}`;
  }

  function ensureRoot(container) {
    if (!container) throw new Error("SiegePixi.init: missing container");

    if (_container && _container !== container) {
      SiegePixi.destroy();
    }

    _container = container;

    if (_root && _root.parentNode === _container) return _root;

    _container.innerHTML = "";
    _container.style.position = "relative";
    _container.style.overflow = "hidden";

    _root = document.createElement("div");
    _root.className = "ah-siege-viewer-root";
    _root.style.cssText = [
      "position:absolute",
      "inset:0",
      "display:flex",
      "flex-direction:column",
      "gap:10px",
      "padding:10px",
      "border-radius:14px",
      "background:linear-gradient(180deg, rgba(5,10,24,.94), rgba(11,14,28,.98))",
      "box-sizing:border-box",
      "overflow:hidden",
      "color:#e8edf7",
      "font-family:inherit"
    ].join(";");

    _root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <div style="font-weight:900;font-size:14px;letter-spacing:.04em;">Siege Viewer</div>
        <div id="ah-siege-meta" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>

      <div id="ah-siege-stage" style="
        position:relative;
        flex:0 0 230px;
        min-height:230px;
        border-radius:14px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.08);
        background:linear-gradient(180deg, rgba(7,12,24,.92), rgba(16,14,28,.98));
      ">
        <div id="ah-siege-stage-bg" style="
          position:absolute;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          text-align:center;
          padding:16px;
          color:rgba(232,237,247,.82);
          font-size:13px;
          line-height:1.5;
          background:
            radial-gradient(circle at 30% 20%, rgba(0,246,255,.08), transparent 30%),
            radial-gradient(circle at 70% 75%, rgba(255,80,170,.08), transparent 32%);
        "></div>

        <div style="
          position:absolute;
          inset:0;
          padding:12px;
          display:grid;
          grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
          gap:10px;
          align-items:end;
          pointer-events:none;
        ">
          ${fighterHudHtml("left")}

          <div id="ah-siege-center-badge" style="
            align-self:start;
            justify-self:center;
            margin-top:6px;
            padding:6px 10px;
            border-radius:999px;
            background:rgba(8,10,22,.82);
            border:1px solid rgba(255,255,255,.10);
            font-size:11px;
            font-weight:900;
            letter-spacing:.03em;
            text-align:center;
            white-space:nowrap;
          ">READY</div>

          ${fighterHudHtml("right")}
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.04em;opacity:.88;">Combat Log</div>
        <div style="font-size:11px;opacity:.65;">Replay</div>
      </div>

      <div id="ah-siege-log" style="
        flex:1;
        min-height:120px;
        overflow:auto;
        display:flex;
        flex-direction:column;
        gap:8px;
        padding-right:2px;
      "></div>
    `;

    _container.appendChild(_root);

    _stageMount = _root.querySelector("#ah-siege-stage");
    _stageBg = _root.querySelector("#ah-siege-stage-bg");
    _logEl = _root.querySelector("#ah-siege-log");
    _metaEl = _root.querySelector("#ah-siege-meta");
    _badgeEl = _root.querySelector("#ah-siege-center-badge");

   _leftAvatarEl = _root.querySelector("#ah-siege-left-avatar");
_leftNameEl = _root.querySelector("#ah-siege-left-name");
_leftFactionEl = _root.querySelector("#ah-siege-left-faction");
_leftHpTextEl = _root.querySelector("#ah-siege-left-hp-text");
_leftHpFillEl = _root.querySelector("#ah-siege-left-hp-fill");
_leftPopupEl = _root.querySelector("#ah-siege-left-popup");

_rightAvatarEl = _root.querySelector("#ah-siege-right-avatar");
_rightNameEl = _root.querySelector("#ah-siege-right-name");
_rightFactionEl = _root.querySelector("#ah-siege-right-faction");
_rightHpTextEl = _root.querySelector("#ah-siege-right-hp-text");
_rightHpFillEl = _root.querySelector("#ah-siege-right-hp-fill");
_rightPopupEl = _root.querySelector("#ah-siege-right-popup");
    return _root;
  }

  async function ensurePixi() {
    if (!hasPixi()) {
      _usingPixi = false;
      return false;
    }

    if (_pixiReady && _app) {
      _usingPixi = true;
      return true;
    }

    const PIXI = window.PIXI;

    _app = new PIXI.Application();
    await _app.init({
      resizeTo: _stageMount,
      antialias: true,
      backgroundAlpha: 0,
      autoDensity: true
    });

    _app.canvas.style.position = "absolute";
    _app.canvas.style.inset = "0";
    _app.canvas.style.width = "100%";
    _app.canvas.style.height = "100%";
    _app.canvas.style.display = "block";

    _stageMount.insertBefore(_app.canvas, _stageMount.firstChild);

    _gfx = new PIXI.Graphics();
    _app.stage.addChild(_gfx);

    _pixiReady = true;
    _usingPixi = true;
    _stageBg.innerHTML = "";

    return true;
  }

  function setPopup(el, text, kind) {
    if (!el) return;
    el.textContent = text || "";
    el.style.opacity = text ? "1" : "0";
    el.style.color = popupColor(kind || "");
  }

  function metaPill(text, tint) {
    return `
      <div style="
        padding:4px 8px;
        border-radius:999px;
        background:${tint || "rgba(255,255,255,.06)"};
        border:1px solid rgba(255,255,255,.08);
        font-size:11px;
        font-weight:800;
        letter-spacing:.02em;
      ">${esc(text)}</div>
    `;
  }

  function updateHud(info, state) {
  if (_leftAvatarEl) _leftAvatarEl.innerHTML = avatarNodeHtml(info.left, "L");
  if (_leftNameEl) _leftNameEl.textContent = info.left.name || "Left";
  if (_leftFactionEl) _leftFactionEl.textContent = info.left.faction || "—";
  if (_leftHpTextEl) _leftHpTextEl.textContent = `${num(state.leftHp, 0)} / ${num(info.left.hpMax, 0)}`;
  if (_leftHpFillEl) _leftHpFillEl.style.width = `${pct(state.leftHp, info.left.hpMax)}%`;
  setPopup(_leftPopupEl, state.leftFx?.popupText || "", state.leftFx?.popupKind || "");

  if (_rightAvatarEl) _rightAvatarEl.innerHTML = avatarNodeHtml(info.right, "R");
  if (_rightNameEl) _rightNameEl.textContent = info.right.name || "Right";
  if (_rightFactionEl) _rightFactionEl.textContent = info.right.faction || "—";
  if (_rightHpTextEl) _rightHpTextEl.textContent = `${num(state.rightHp, 0)} / ${num(info.right.hpMax, 0)}`;
  if (_rightHpFillEl) _rightHpFillEl.style.width = `${pct(state.rightHp, info.right.hpMax)}%`;
  setPopup(_rightPopupEl, state.rightFx?.popupText || "", state.rightFx?.popupKind || "");

  if (_metaEl) {
    _metaEl.innerHTML = [
      metaPill(`Fight ${info.fightNo || "—"}`),
      metaPill(
        state.currentTurn >= 0
          ? `Turn ${state.currentTurn + 1} / ${Math.max(1, info.turns.length)}`
          : `Turn 0 / ${Math.max(1, info.turns.length)}`
      ),
      metaPill(`Winner: ${info.winnerName}`),
      metaPill(_usingPixi ? "PIXI" : "FALLBACK", _usingPixi ? "rgba(0,246,255,.08)" : "rgba(255,255,255,.06)")
    ].join("");
  }

  if (_badgeEl) {
    if (state.finished) {
      _badgeEl.textContent = `WINNER • ${info.winnerName}`;
      _badgeEl.style.borderColor = "rgba(255,215,90,.25)";
      _badgeEl.style.background = "rgba(255,215,90,.10)";
    } else if (state.currentTurn >= 0) {
      _badgeEl.textContent = `TURN ${state.currentTurn + 1}`;
      _badgeEl.style.borderColor = "rgba(255,255,255,.10)";
      _badgeEl.style.background = "rgba(8,10,22,.82)";
    } else {
      _badgeEl.textContent = "READY";
      _badgeEl.style.borderColor = "rgba(255,255,255,.10)";
      _badgeEl.style.background = "rgba(8,10,22,.82)";
    }
  }
}

  function renderLog(info, state) {
    if (!_logEl) return;

    if (!state.visibleTurns.length) {
      _logEl.innerHTML = `
        <div style="
          padding:14px;
          border-radius:12px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.05);
          font-size:12px;
          opacity:.8;
        ">
          Waiting for replay start...
        </div>
      `;
      return;
    }

    _logEl.innerHTML = state.visibleTurns.map((turn, idx) => {
      const actorColor =
        turn?.actor === "left"
          ? "rgba(0,246,255,.95)"
          : turn?.actor === "right"
          ? "rgba(255,105,190,.96)"
          : "rgba(255,255,255,.88)";

      const isActive = idx === state.currentTurn;

      return `
        <div style="
          display:flex;
          gap:10px;
          align-items:flex-start;
          padding:8px 10px;
          border-radius:10px;
          background:${isActive ? "rgba(255,255,255,.075)" : "rgba(255,255,255,.035)"};
          border:1px solid ${isActive ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)"};
          transition:all .18s ease;
        ">
          <div style="
            min-width:34px;
            height:22px;
            display:flex;
            align-items:center;
            justify-content:center;
            border-radius:999px;
            background:rgba(255,255,255,.06);
            font-size:11px;
            font-weight:800;
          ">#${idx + 1}</div>

          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;line-height:1.45;color:${actorColor};font-weight:700;">
              ${esc(makeTurnText(turn, info))}
            </div>
          </div>
        </div>
      `;
    }).join("");

    _logEl.scrollTop = _logEl.scrollHeight;
  }

  function drawFighter(g, x, y, isLeft, flash, active) {
    const accent = isLeft ? 0x00f6ff : 0xff69be;
    const fill = isLeft ? 0x102436 : 0x311528;
    const dir = isLeft ? 1 : -1;

    g.beginFill(0x000000, 0.22);
    g.drawEllipse(x, y + 58, 54, 12);
    g.endFill();

    if (flash) {
      g.lineStyle(3, accent, 0.28);
      g.drawCircle(x, y, 68);
    }

    g.lineStyle(active ? 4 : 2, accent, active ? 0.55 : 0.36);

    g.beginFill(accent, active ? 0.08 : 0.04);
    g.drawCircle(x, y - 10, active ? 58 : 52);
    g.endFill();

    g.beginFill(fill, 0.96);
    g.drawCircle(x, y - 30, 22);
    g.drawCircle(x - 18, y - 46, 9);
    g.drawCircle(x + 18, y - 46, 9);
    g.drawRect(x - 26, y - 8, 52, 64);
    g.endFill();

    g.lineStyle(5, accent, 0.72);
    g.moveTo(x + dir * 18, y - 4);
    g.lineTo(x + dir * 42, y - 18);

    g.lineStyle(3, 0xffffff, 0.10);
    g.moveTo(x - 10, y + 18);
    g.lineTo(x + 10, y + 18);
  }

  function drawPixiFrame(info, state) {
    if (!_pixiReady || !_app || !_gfx || !_stageMount) return;

    const g = _gfx;
    const w = Math.max(320, _stageMount.clientWidth || 320);
    const h = Math.max(190, _stageMount.clientHeight || 230);

    g.clear();

    g.beginFill(0x09101d, 0.96);
    g.drawRect(0, 0, w, h);
    g.endFill();

    g.lineStyle(1, 0xffffff, 0.04);
    for (let i = 1; i < 4; i++) {
      const yy = (h / 4) * i;
      g.moveTo(0, yy);
      g.lineTo(w, yy);
    }

    g.lineStyle(2, 0xffffff, 0.05);
    g.moveTo(w * 0.5, 20);
    g.lineTo(w * 0.5, h - 20);

    g.beginFill(0x00f6ff, 0.05);
    g.drawCircle(w * 0.25, h * 0.24, 60);
    g.endFill();

    g.beginFill(0xff69be, 0.05);
    g.drawCircle(w * 0.75, h * 0.26, 60);
    g.endFill();

    const leftActive = state.activeSide === "left";
    const rightActive = state.activeSide === "right";

    const leftX = w * 0.26 + (leftActive ? 18 : 0);
    const rightX = w * 0.74 + (rightActive ? -18 : 0);
    const y = h * 0.56;

    drawFighter(g, leftX, y, true, !!state.leftFx?.flash, leftActive);
    drawFighter(g, rightX, y, false, !!state.rightFx?.flash, rightActive);

    if (leftActive) {
      g.lineStyle(6, 0x00f6ff, 0.22);
      g.moveTo(leftX + 26, y - 10);
      g.lineTo((leftX + rightX) * 0.5, y - 18);
      g.lineTo(rightX - 30, y - 8);
    }

    if (rightActive) {
      g.lineStyle(6, 0xff69be, 0.22);
      g.moveTo(rightX - 26, y - 10);
      g.lineTo((leftX + rightX) * 0.5, y - 18);
      g.lineTo(leftX + 30, y - 8);
    }

    if (state.leftFx?.flash) {
      g.lineStyle(3, 0x00f6ff, 0.18);
      g.drawCircle(leftX, y - 10, 76);
    }

    if (state.rightFx?.flash) {
      g.lineStyle(3, 0xff69be, 0.18);
      g.drawCircle(rightX, y - 10, 76);
    }

    if (state.finished) {
      g.beginFill(0xffd76b, 0.08);
      g.drawRect(0, 0, w, 28);
      g.endFill();
      g.lineStyle(1, 0xffd76b, 0.24);
      g.moveTo(0, 28);
      g.lineTo(w, 28);
    }

    _stageBg.innerHTML = "";
  }

  function drawFallbackStage(info, state) {
    if (!_stageBg) return;

    const msg = state.finished
      ? `Winner: ${info.winnerName}`
      : state.currentTurn >= 0
      ? `Turn ${state.currentTurn + 1} / ${Math.max(1, info.turns.length)}`
      : `Replay viewer ready`;

    _stageBg.innerHTML = `
      <div>
        <div style="font-size:22px;font-weight:900;margin-bottom:8px;">Battle Viewer</div>
        <div style="font-size:13px;opacity:.82;line-height:1.5;">
          PIXI not loaded — DOM fallback active.<br>${esc(msg)}
        </div>
      </div>
    `;
  }

  function renderFrame() {
    if (!_root || !_playState || !_lastReplay) return;

    const info = replayInfo(_lastReplay);

    updateHud(info, _playState);
    renderLog(info, _playState);

    if (_usingPixi) {
      drawPixiFrame(info, _playState);
    } else {
      drawFallbackStage(info, _playState);
    }
  }

  function renderIdle(message = "Replay viewer ready.") {
    if (!_root) return;

    if (_metaEl) {
      _metaEl.innerHTML = [
        metaPill("Fight —"),
        metaPill("Turn 0 / 0"),
        metaPill("Winner: —"),
        metaPill(_usingPixi ? "PIXI" : "FALLBACK", _usingPixi ? "rgba(0,246,255,.08)" : "rgba(255,255,255,.06)")
      ].join("");
    }

    if (_badgeEl) {
      _badgeEl.textContent = "READY";
      _badgeEl.style.borderColor = "rgba(255,255,255,.10)";
      _badgeEl.style.background = "rgba(8,10,22,.82)";
    }

    if (_leftAvatarEl) _leftAvatarEl.innerHTML = avatarNodeHtml({ name: "Attacker", avatarUrl: "" }, "L");
if (_leftNameEl) _leftNameEl.textContent = "Attacker";
if (_leftFactionEl) _leftFactionEl.textContent = "—";
if (_leftHpTextEl) _leftHpTextEl.textContent = "0 / 0";
if (_leftHpFillEl) _leftHpFillEl.style.width = "0%";
setPopup(_leftPopupEl, "", "");

if (_rightAvatarEl) _rightAvatarEl.innerHTML = avatarNodeHtml({ name: "Defender", avatarUrl: "" }, "R");
if (_rightNameEl) _rightNameEl.textContent = "Defender";
if (_rightFactionEl) _rightFactionEl.textContent = "—";
if (_rightHpTextEl) _rightHpTextEl.textContent = "0 / 0";
if (_rightHpFillEl) _rightHpFillEl.style.width = "0%";
setPopup(_rightPopupEl, "", "");

    if (_logEl) {
      _logEl.innerHTML = `
        <div style="
          padding:14px;
          border-radius:12px;
          background:rgba(255,255,255,.035);
          border:1px solid rgba(255,255,255,.05);
          font-size:12px;
          opacity:.82;
        ">
          ${esc(message)}
        </div>
      `;
    }

    if (_usingPixi) {
      drawPixiFrame(
        {
          fightNo: 0,
          turns: [],
          left: { name: "Attacker", faction: "", hpStart: 0, hpMax: 1 },
          right: { name: "Defender", faction: "", hpStart: 0, hpMax: 1 },
          winnerName: "—"
        },
        {
          currentTurn: -1,
          activeSide: "",
          finished: false,
          leftHp: 0,
          rightHp: 0,
          leftFx: { flash: false, popupText: "", popupKind: "" },
          rightFx: { flash: false, popupText: "", popupKind: "" },
          visibleTurns: []
        }
      );
    } else {
      _stageBg.innerHTML = `
        <div>
          <div style="font-size:22px;font-weight:900;margin-bottom:8px;">Battle Viewer Ready</div>
          <div style="font-size:13px;opacity:.82;line-height:1.5;">${esc(message)}</div>
        </div>
      `;
    }
  }

  function startReplayPlayback(token) {
    const info = replayInfo(_lastReplay);
    const turns = info.turns;
    const stepMs = Math.max(450, num(_opts.stepMs, 850));
    const introMs = Math.max(150, num(_opts.introMs, 220));

    function finishIfCurrent() {
      if (token !== _runToken || !_playState) return;
      _playState.currentTurn = turns.length - 1;
      _playState.activeSide = "";
      _playState.finished = true;
      renderFrame();
    }

    if (!turns.length) {
      _playState.finished = true;
      renderFrame();
      return;
    }

    turns.forEach((turn, idx) => {
      later(introMs + idx * stepMs, () => {
        if (token !== _runToken || !_playState) return;

        const actor = String(turn?.actor || "");
        const target = String(turn?.target || "");
        const value = num(turn?.value, 0);
        const kind = String(turn?.kind || "hit");

        _playState.currentTurn = idx;
        _playState.activeSide = actor;

        _playState.leftFx = { flash: false, popupText: "", popupKind: "" };
        _playState.rightFx = { flash: false, popupText: "", popupKind: "" };

        _playState.visibleTurns.push(turn);

        if (target === "left") {
          if (kind === "heal") {
            _playState.leftHp = Math.min(info.left.hpMax, num(turn?.targetHpAfter, _playState.leftHp + value));
            _playState.leftFx = { flash: true, popupText: `+${value}`, popupKind: "heal" };
          } else {
            _playState.leftHp = num(turn?.targetHpAfter, Math.max(0, _playState.leftHp - Math.max(0, value)));
            _playState.leftFx = {
              flash: true,
              popupText: kind === "crit" ? `CRIT ${value}` : `-${value}`,
              popupKind: kind === "crit" ? "crit" : "hit"
            };
          }
        } else if (target === "right") {
          if (kind === "heal") {
            _playState.rightHp = Math.min(info.right.hpMax, num(turn?.targetHpAfter, _playState.rightHp + value));
            _playState.rightFx = { flash: true, popupText: `+${value}`, popupKind: "heal" };
          } else {
            _playState.rightHp = num(turn?.targetHpAfter, Math.max(0, _playState.rightHp - Math.max(0, value)));
            _playState.rightFx = {
              flash: true,
              popupText: kind === "crit" ? `CRIT ${value}` : `-${value}`,
              popupKind: kind === "crit" ? "crit" : "hit"
            };
          }
        }

        renderFrame();

        later(Math.max(180, stepMs - 240), () => {
          if (token !== _runToken || !_playState) return;
          if (_playState.currentTurn === idx) {
            _playState.activeSide = "";
            _playState.leftFx = { flash: false, popupText: "", popupKind: "" };
            _playState.rightFx = { flash: false, popupText: "", popupKind: "" };
            renderFrame();
          }
        });

        if (idx === turns.length - 1) {
          later(Math.max(260, stepMs - 80), finishIfCurrent);
        }
      });
    });
  }

  SiegePixi.init = async function init(container, opts = {}) {
    _opts = { ..._opts, ...(opts || {}) };
    ensureRoot(container);

    try {
      _usingPixi = await ensurePixi();
    } catch (err) {
      _usingPixi = false;
      if (_opts.dbg) console.warn("[SIEGE PIXI INIT FALLBACK]", err);
    }

    renderIdle("Click Play Replay to preview the latest siege duel.");
    return true;
  };

  SiegePixi.play = async function play(replay, opts = {}) {
    _opts = { ..._opts, ...(opts || {}) };

    if (!_container) throw new Error("SiegePixi.play: call init(container) first");

    ensureRoot(_container);

    try {
      _usingPixi = await ensurePixi();
    } catch (err) {
      _usingPixi = false;
      if (_opts.dbg) console.warn("[SIEGE PIXI PLAY FALLBACK]", err);
    }

    clearTimers();
    _runToken += 1;

    _lastReplay = replay && typeof replay === "object" ? replay : null;

    if (!_lastReplay) {
      renderIdle("No replay payload provided.");
      return false;
    }

    const info = replayInfo(_lastReplay);

    _playState = {
      currentTurn: -1,
      activeSide: "",
      finished: false,
      leftHp: info.left.hpStart || info.left.hpMax,
      rightHp: info.right.hpStart || info.right.hpMax,
      visibleTurns: [],
      leftFx: { flash: false, popupText: "", popupKind: "" },
      rightFx: { flash: false, popupText: "", popupKind: "" }
    };

    renderFrame();
    startReplayPlayback(_runToken);
    return true;
  };

  SiegePixi.stop = function stop() {
    clearTimers();
    _runToken += 1;
    _playState = null;
    renderIdle("Replay stopped.");
  };

  SiegePixi.destroy = function destroy() {
    clearTimers();
    _runToken += 1;
    _playState = null;
    _lastReplay = null;

    if (_app) {
      try {
        _app.destroy({ removeView: true }, { children: true });
      } catch (_) {}
    }

    _app = null;
    _gfx = null;
    _pixiReady = false;
    _usingPixi = false;

    if (_root && _root.parentNode) {
      _root.parentNode.removeChild(_root);
    }

    _root = null;
    _container = null;
    _stageMount = null;
    _stageBg = null;
    _logEl = null;
    _metaEl = null;
    _badgeEl = null;

    _leftAvatarEl = null;
_leftNameEl = null;
_leftFactionEl = null;
_leftHpTextEl = null;
_leftHpFillEl = null;
_leftPopupEl = null;

_rightAvatarEl = null;
_rightNameEl = null;
_rightFactionEl = null;
_rightHpTextEl = null;
_rightHpFillEl = null;
_rightPopupEl = null;

    _opts = {};
  };

  window.SiegePixi = SiegePixi;
})();
