// js/siege_pixi.js
// Alpha Husky — Siege Battle Viewer v2
// MVP animated replay without real PIXI sprites yet.
// API kept stable: init / play / stop / destroy

(function () {
  const SiegePixi = {};

  let _container = null;
  let _root = null;
  let _lastReplay = null;
  let _opts = {};

  let _runToken = 0;
  let _timers = [];
  let _playState = null;

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
    const p = Math.max(0, Math.min(100, (num(v, 0) / m) * 100));
    return p;
  }

  function pick(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
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

  function replayInfo(replay) {
    const left = replay?.left || {};
    const right = replay?.right || {};

    const leftHpStart = num(pick(left.hpStart, left.hpMax), 0);
    const rightHpStart = num(pick(right.hpStart, right.hpMax), 0);
    const leftHpMax = Math.max(leftHpStart, num(left.hpMax, leftHpStart || 1));
    const rightHpMax = Math.max(rightHpStart, num(right.hpMax, rightHpStart || 1));

    const winnerSide = String(replay?.winner || "");
    const winnerName =
      winnerSide === "left"
        ? String(left.name || "Left")
        : winnerSide === "right"
        ? String(right.name || "Right")
        : String(replay?.winner || "Unknown");

    return {
      fightNo: num(replay?.fightNo, 0),
      turns: Array.isArray(replay?.turns) ? replay.turns : [],
      left: {
        uid: String(left.uid || ""),
        name: String(left.name || "Left"),
        faction: String(left.faction || ""),
        hpStart: leftHpStart,
        hpMax: leftHpMax,
      },
      right: {
        uid: String(right.uid || ""),
        name: String(right.name || "Right"),
        faction: String(right.faction || ""),
        hpStart: rightHpStart,
        hpMax: rightHpMax,
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

    if (kind === "heal") {
      return `${actorName} healed ${targetName} for ${value}. HP now ${hpAfter}`;
    }
    if (kind === "crit") {
      return `${actorName} crit ${targetName} for ${value}. HP now ${hpAfter}`;
    }
    if (kind === "block") {
      return `${actorName} blocked the attack.`;
    }
    if (kind === "miss") {
      return `${actorName} missed ${targetName}.`;
    }
    if (kind === "log") {
      return `${actorName}: ${value}`;
    }

    return `${actorName} hit ${targetName} for ${value}. HP now ${hpAfter}`;
  }

  function ensureRoot(container) {
    if (!container) throw new Error("SiegePixi.init: missing container");

    if (_container !== container) {
      SiegePixi.destroy();
      _container = container;
    }

    if (_root && _root.parentNode === _container) return _root;

    _container.innerHTML = "";
    _container.style.position = "relative";
    _container.style.overflow = "hidden";

    _root = document.createElement("div");
    _root.className = "ah-siege-pixi-root";
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

    _container.appendChild(_root);
    return _root;
  }

  function fighterCardHtml(side, data, currentHp, active, fx = {}) {
    const isLeft = side === "left";
    const percent = pct(currentHp, data.hpMax);
    const accent = isLeft ? "0,255,255" : "255,90,180";
    const label = isLeft ? "LEFT" : "RIGHT";

    const flash = !!fx.flash;
    const popupText = fx.popupText || "";
    const popupKind = fx.popupKind || "";
    const popupColor =
      popupKind === "heal"
        ? "rgba(120,255,160,.96)"
        : popupKind === "crit"
        ? "rgba(255,210,90,.98)"
        : "rgba(255,120,120,.96)";

    const shiftX =
      active ? (isLeft ? "translateX(6px)" : "translateX(-6px)") : "translateX(0px)";

    return `
      <div style="
        position:relative;
        min-width:0;
        border-radius:14px;
        padding:12px;
        border:1px solid rgba(${accent}, ${flash ? ".55" : active ? ".40" : ".20"});
        background:
          radial-gradient(circle at ${isLeft ? "20%" : "80%"} 20%, rgba(${accent}, ${active ? ".18" : ".08"}), transparent 35%),
          ${flash ? `linear-gradient(0deg, rgba(${accent}, .10), rgba(255,255,255,.04))` : "rgba(255,255,255,.03)"};
        box-shadow:${flash ? `0 0 26px rgba(${accent}, .18)` : active ? `0 0 18px rgba(${accent}, .10)` : "none"};
        transform:${shiftX};
        transition:all .22s ease;
        overflow:hidden;
      ">
        ${
          popupText
            ? `
        <div style="
          position:absolute;
          top:8px;
          ${isLeft ? "right:10px" : "left:10px"};
          padding:3px 8px;
          border-radius:999px;
          background:rgba(10,12,24,.82);
          border:1px solid rgba(255,255,255,.10);
          color:${popupColor};
          font-size:11px;
          font-weight:900;
          letter-spacing:.02em;
          pointer-events:none;
        ">${esc(popupText)}</div>
      `
            : ""
        }

        <div style="font-size:11px;opacity:.72;margin-bottom:6px;letter-spacing:.04em;font-weight:800;">${label}</div>

        <div style="font-size:16px;font-weight:900;line-height:1.15;">${esc(data.name)}</div>
        <div style="font-size:12px;opacity:.72;margin-top:4px;">${esc(data.faction || "—")}</div>

        <div style="margin-top:12px;">
          <div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;opacity:.82;margin-bottom:5px;">
            <span>HP</span>
            <b>${num(currentHp, 0)} / ${num(data.hpMax, 0)}</b>
          </div>
          <div style="height:10px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;border:1px solid rgba(255,255,255,.06);">
            <div style="
              width:${percent}%;
              height:100%;
              border-radius:999px;
              transition:width .35s ease;
              background:linear-gradient(90deg, rgba(${accent}, .95), rgba(${accent}, .55));
            "></div>
          </div>
        </div>
      </div>
    `;
  }

  function turnBadgeHtml(info, state) {
    return `
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Fight ${info.fightNo || "—"}</div>
        <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Turn ${Math.max(0, state.currentTurn + 1)} / ${info.turns.length}</div>
        <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Winner: ${esc(info.winnerName)}</div>
        <div style="padding:4px 8px;border-radius:999px;background:rgba(0,255,255,.08);border:1px solid rgba(0,255,255,.18);font-size:11px;font-weight:700;">AUTO PLAY</div>
      </div>
    `;
  }

  function winnerBannerHtml(info, state) {
    if (!state.finished) return "";
    return `
      <div style="
        padding:10px 12px;
        border-radius:12px;
        border:1px solid rgba(255,215,90,.28);
        background:linear-gradient(90deg, rgba(255,215,90,.10), rgba(255,150,40,.08));
        font-size:13px;
        font-weight:900;
        text-align:center;
        letter-spacing:.03em;
      ">
        Winner: ${esc(info.winnerName)}
      </div>
    `;
  }

  function logHtml(info, state) {
    const rows = state.visibleTurns.length
      ? state.visibleTurns
          .map((turn, idx) => {
            const actorColor =
              turn?.actor === "left"
                ? "rgba(0,255,255,.92)"
                : turn?.actor === "right"
                ? "rgba(255,90,180,.96)"
                : "rgba(255,255,255,.82)";

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
                <div style="min-width:34px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;font-weight:800;">#${idx + 1}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;line-height:1.45;color:${actorColor};font-weight:700;">${esc(makeTurnText(turn, info))}</div>
                </div>
              </div>
            `;
          })
          .join("")
      : `
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

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.04em;opacity:.88;">Combat Log</div>
        <div style="font-size:11px;opacity:.65;">MVP viewer</div>
      </div>

      <div id="ah-siege-pixi-log" style="flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-right:2px;">
        ${rows}
      </div>
    `;
  }

  function centerStageHtml(info, state) {
    const activeSide = state.activeSide || "";
    const leftActive = activeSide === "left";
    const rightActive = activeSide === "right";

    return `
      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;">
        ${fighterCardHtml("left", info.left, state.leftHp, leftActive, state.leftFx)}

        <div style="
          font-size:18px;
          font-weight:900;
          opacity:.9;
          text-align:center;
          padding:0 4px;
          transform:${leftActive || rightActive ? "scale(1.04)" : "scale(1)"};
          transition:transform .18s ease;
        ">VS</div>

        ${fighterCardHtml("right", info.right, state.rightHp, rightActive, state.rightFx)}
      </div>
    `;
  }

  function renderFrame() {
    if (!_root || !_playState || !_lastReplay) return;

    const info = replayInfo(_lastReplay);

    _root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <div style="font-weight:800;font-size:14px;letter-spacing:.04em;">Siege Viewer</div>
        ${turnBadgeHtml(info, _playState)}
      </div>

      ${winnerBannerHtml(info, _playState)}

      ${centerStageHtml(info, _playState)}

      ${logHtml(info, _playState)}
    `;

    const log = _root.querySelector("#ah-siege-pixi-log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  function renderIdle(message = "Replay viewer ready.") {
    if (!_root) return;
    _root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-weight:800;font-size:14px;letter-spacing:.04em;">Siege Viewer</div>
        <div style="padding:4px 8px;border-radius:999px;background:rgba(0,255,255,.08);border:1px solid rgba(0,255,255,.18);font-size:11px;font-weight:700;">READY</div>
      </div>

      <div style="
        flex:1;
        display:flex;
        align-items:center;
        justify-content:center;
        border-radius:12px;
        border:1px solid rgba(255,255,255,.08);
        background:
          radial-gradient(circle at 50% 30%, rgba(0,255,255,.12), transparent 35%),
          radial-gradient(circle at 50% 80%, rgba(255,0,200,.10), transparent 35%),
          rgba(8,10,22,.85);
        text-align:center;
        padding:18px;
      ">
        <div>
          <div style="font-size:24px;font-weight:900;margin-bottom:8px;">Battle Viewer Ready</div>
          <div style="font-size:13px;opacity:.82;line-height:1.5;">${esc(message)}</div>
        </div>
      </div>
    `;
  }

  function startReplayPlayback(token) {
    const info = replayInfo(_lastReplay);
    const turns = info.turns;
    const stepMs = Math.max(450, num(_opts.stepMs, 850));
    const introMs = Math.max(150, num(_opts.introMs, 260));

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

        if (!_playState.visibleTurns[idx]) {
          _playState.visibleTurns.push(turn);
        } else {
          _playState.visibleTurns[idx] = turn;
        }

        if (target === "left") {
          if (kind === "heal") {
            _playState.leftHp = Math.min(info.left.hpMax, num(turn?.targetHpAfter, _playState.leftHp + value));
            _playState.leftFx = {
              flash: true,
              popupText: `+${value}`,
              popupKind: "heal",
            };
          } else {
            _playState.leftHp = num(turn?.targetHpAfter, Math.max(0, _playState.leftHp - Math.max(0, value)));
            _playState.leftFx = {
              flash: true,
              popupText: kind === "crit" ? `CRIT ${value}` : `-${value}`,
              popupKind: kind === "crit" ? "crit" : "hit",
            };
          }
        } else if (target === "right") {
          if (kind === "heal") {
            _playState.rightHp = Math.min(info.right.hpMax, num(turn?.targetHpAfter, _playState.rightHp + value));
            _playState.rightFx = {
              flash: true,
              popupText: `+${value}`,
              popupKind: "heal",
            };
          } else {
            _playState.rightHp = num(turn?.targetHpAfter, Math.max(0, _playState.rightHp - Math.max(0, value)));
            _playState.rightFx = {
              flash: true,
              popupText: kind === "crit" ? `CRIT ${value}` : `-${value}`,
              popupKind: kind === "crit" ? "crit" : "hit",
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
    renderIdle("Click Play Replay to preview the latest siege duel.");
    return true;
  };

  SiegePixi.play = async function play(replay, opts = {}) {
    _opts = { ..._opts, ...(opts || {}) };
    ensureRoot(_container || opts.container || null);

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
      rightFx: { flash: false, popupText: "", popupKind: "" },
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

    if (_root && _root.parentNode) {
      _root.parentNode.removeChild(_root);
    }

    _root = null;
    _container = null;
    _opts = {};
  };

  window.SiegePixi = SiegePixi;
})();
