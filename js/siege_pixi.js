// js/siege_pixi.js
// Alpha Husky — Siege Battle Viewer skeleton
// Current goal:
// - provide a separate viewer module for Siege replay
// - no real Pixi combat yet
// - clean API: init / play / stop / destroy
// Later we can replace the internals with actual PIXI.Application.

(function () {
  const SiegePixi = {};
  let _container = null;
  let _root = null;
  let _lastReplay = null;
  let _opts = {};

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

  function pick(...vals) {
    for (const v of vals) {
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  }

  function replayNames(replay) {
    const left = replay?.left || {};
    const right = replay?.right || {};
    return {
      leftName: String(left.name || "Left"),
      rightName: String(right.name || "Right"),
      leftFaction: String(left.faction || ""),
      rightFaction: String(right.faction || ""),
      winnerSide: String(replay?.winner || ""),
      winnerName:
        replay?.winner === "left"
          ? String(left.name || "Left")
          : replay?.winner === "right"
          ? String(right.name || "Right")
          : String(replay?.winner || "Unknown"),
      fightNo: num(replay?.fightNo, 0),
      turnsCount: Array.isArray(replay?.turns) ? replay.turns.length : 0,
    };
  }

  function makeTurnText(turn, replay) {
    const left = replay?.left || {};
    const right = replay?.right || {};

    const actorSide = String(turn?.actor || "");
    const targetSide = String(turn?.target || "");
    const kind = String(turn?.kind || "hit");
    const value = num(turn?.value, 0);
    const hpAfter = num(turn?.targetHpAfter, 0);

    const actorName =
      actorSide === "left"
        ? String(left.name || "Left")
        : actorSide === "right"
        ? String(right.name || "Right")
        : "Unknown";

    const targetName =
      targetSide === "left"
        ? String(left.name || "Left")
        : targetSide === "right"
        ? String(right.name || "Right")
        : "Target";

    const custom = pick(turn?.text, turn?.msg, turn?.message);
    if (custom) return String(custom);

    if (kind === "heal") {
      return `${actorName} healed ${targetName} for ${value}. HP now ${hpAfter}`;
    }
    if (kind === "crit") {
      return `${actorName} crit ${targetName} for ${value}. HP now ${hpAfter}`;
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
      "background:linear-gradient(180deg, rgba(5,10,24,.92), rgba(11,14,28,.96))",
      "box-sizing:border-box",
      "overflow:hidden",
      "color:#e8edf7",
      "font-family:inherit",
    ].join(";");

    _container.appendChild(_root);
    return _root;
  }

  function renderIdle(message = "Replay viewer ready.") {
    if (!_root) return;
    _root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-weight:800;font-size:14px;letter-spacing:.04em;">Siege Viewer</div>
        <div style="padding:4px 8px;border-radius:999px;background:rgba(0,255,255,.08);border:1px solid rgba(0,255,255,.18);font-size:11px;font-weight:700;">SKELETON</div>
      </div>

      <div style="flex:1;display:flex;align-items:center;justify-content:center;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:
        radial-gradient(circle at 50% 30%, rgba(0,255,255,.12), transparent 35%),
        radial-gradient(circle at 50% 80%, rgba(255,0,200,.10), transparent 35%),
        rgba(8,10,22,.85); text-align:center; padding:18px;">
        <div>
          <div style="font-size:24px;font-weight:900;margin-bottom:8px;">Battle Viewer Ready</div>
          <div style="font-size:13px;opacity:.82;line-height:1.5;">${esc(message)}</div>
        </div>
      </div>
    `;
  }

  function renderReplay(replay) {
    if (!_root) return;

    const info = replayNames(replay);
    const turns = Array.isArray(replay?.turns) ? replay.turns : [];
    const turnItems = turns.length
      ? turns
          .map((t, idx) => {
            const actorColor =
              t?.actor === "left"
                ? "rgba(0,255,255,.85)"
                : t?.actor === "right"
                ? "rgba(255,90,180,.90)"
                : "rgba(255,255,255,.75)";
            return `
              <div style="display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.04);">
                <div style="min-width:34px;height:22px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,.06);font-size:11px;font-weight:800;">#${idx + 1}</div>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;line-height:1.45;color:${actorColor};font-weight:700;">${esc(makeTurnText(t, replay))}</div>
                </div>
              </div>
            `;
          })
          .join("")
      : `
        <div style="padding:14px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.05);font-size:12px;opacity:.8;">
          No turn log available.
        </div>
      `;

    _root.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
        <div style="font-weight:800;font-size:14px;letter-spacing:.04em;">Siege Viewer</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Fight ${info.fightNo || "—"}</div>
          <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Winner: ${esc(info.winnerName)}</div>
          <div style="padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);font-size:11px;font-weight:700;">Turns: ${info.turnsCount}</div>
          <div style="padding:4px 8px;border-radius:999px;background:rgba(0,255,255,.08);border:1px solid rgba(0,255,255,.18);font-size:11px;font-weight:700;">SKELETON</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);background:
        linear-gradient(90deg, rgba(0,255,255,.06), rgba(255,255,255,.02), rgba(255,0,200,.06));">
        <div style="min-width:0;">
          <div style="font-size:12px;opacity:.72;margin-bottom:4px;">LEFT</div>
          <div style="font-size:16px;font-weight:900;line-height:1.2;">${esc(info.leftName)}</div>
          <div style="font-size:12px;opacity:.75;">${esc(info.leftFaction || "—")}</div>
        </div>

        <div style="font-size:18px;font-weight:900;opacity:.85;">VS</div>

        <div style="min-width:0;text-align:right;">
          <div style="font-size:12px;opacity:.72;margin-bottom:4px;">RIGHT</div>
          <div style="font-size:16px;font-weight:900;line-height:1.2;">${esc(info.rightName)}</div>
          <div style="font-size:12px;opacity:.75;">${esc(info.rightFaction || "—")}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="font-size:12px;font-weight:800;letter-spacing:.04em;opacity:.88;">Combat Log</div>
        <div style="font-size:11px;opacity:.65;">MVP viewer</div>
      </div>

      <div style="flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px;padding-right:2px;">
        ${turnItems}
      </div>
    `;
  }

  SiegePixi.init = async function init(container, opts = {}) {
    _opts = opts || {};
    ensureRoot(container);
    renderIdle("Click Play Replay to preview the latest siege duel.");
    return true;
  };

  SiegePixi.play = async function play(replay, opts = {}) {
    _opts = { ..._opts, ...(opts || {}) };
    ensureRoot(_container || opts.container || null);

    _lastReplay = replay && typeof replay === "object" ? replay : null;

    if (!_lastReplay) {
      renderIdle("No replay payload provided.");
      return false;
    }

    renderReplay(_lastReplay);
    return true;
  };

  SiegePixi.stop = function stop() {
    if (!_root) return;
    renderIdle("Replay stopped.");
  };

  SiegePixi.destroy = function destroy() {
    if (_root && _root.parentNode) {
      _root.parentNode.removeChild(_root);
    }
    _root = null;
    _container = null;
    _lastReplay = null;
    _opts = {};
  };

  window.SiegePixi = SiegePixi;
})();
