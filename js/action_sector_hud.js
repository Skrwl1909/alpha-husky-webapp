// Shared RF01/RF02 HUD + lightweight radar. DOM writes are fingerprint-gated.
(function (global) {
  "use strict";
  const STYLE_ID = "ah-action-sector-hud-css";
  function inject() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `.ah-exploration-room{position:fixed;inset:0;z-index:12060;display:grid;grid-template-rows:auto minmax(0,1fr);height:100dvh;overflow:hidden;background:#05090d;color:#e8f3ff;font-family:Inter,system-ui,sans-serif;touch-action:none}.ah-exploration-room__header{min-height:56px;display:grid;grid-template-columns:76px minmax(0,1fr) 76px;align-items:center;gap:8px;padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 8px max(10px,env(safe-area-inset-left));background:linear-gradient(#111a23,#091018);border-bottom:1px solid rgba(101,232,255,.24)}.ah-exploration-room__back{min-height:40px;border:1px solid rgba(151,188,207,.3);border-radius:9px;background:#101a25;color:#dcecff;font:700 11px/1 system-ui;letter-spacing:.08em;text-transform:uppercase}.ah-exploration-room__heading{text-align:center;min-width:0}.ah-exploration-room__heading span{display:block;color:#7f96a8;font-size:9px;font-weight:800;letter-spacing:.17em}.ah-exploration-room__heading strong{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}.ah-exploration-room__seal{color:#65e8ff;text-align:center;font-size:10px;letter-spacing:.12em}.ah-exploration-room__stage,.ah-exploration-room__canvas{position:relative;min-width:0;min-height:0;overflow:hidden;touch-action:none}.ah-exploration-room__canvas{position:absolute;inset:0}.ah-exploration-room__canvas canvas{display:block!important;width:100%!important;height:100%!important}.ah-rf-hud{position:absolute;inset:0;z-index:8;pointer-events:none;display:grid;grid-template-columns:minmax(132px,28%) minmax(0,1fr) 118px;align-items:start;gap:8px;padding:8px}.ah-rf-hud__cluster,.ah-rf-hud__objective,.ah-rf-hud__radar{border:1px solid rgba(101,232,255,.18);border-radius:10px;background:linear-gradient(180deg,rgba(10,18,26,.86),rgba(6,10,14,.78))}.ah-rf-hud__cluster{padding:8px 9px}.ah-rf-hud__id{display:flex;align-items:center;gap:8px}.ah-rf-hud__portrait{width:28px;height:28px;border-radius:50%;border:1px solid rgba(101,232,255,.5);background:radial-gradient(circle at 40% 30%,#65e8ff 0,#16323d 58%,#071018 100%)}.ah-rf-hud__id strong{display:block;font-size:11px;letter-spacing:.08em}.ah-rf-hud__id em{display:block;color:#7f96a8;font-size:9px;font-style:normal;letter-spacing:.12em}.ah-rf-hud__bar{height:7px;margin-top:7px;border-radius:99px;background:#141c24;overflow:hidden}.ah-rf-hud__bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#3ad7e8,#65e8ff)}.ah-rf-hud__hp-text,.ah-rf-hud__loot{display:block;margin-top:4px;color:#b7c8d3;font-size:9px;font-weight:700}.ah-rf-hud__objective{justify-self:center;max-width:280px;padding:7px 10px;text-align:center}.ah-rf-hud__obj-kicker{display:block;color:#65e8ff;font-size:8px;font-weight:800;letter-spacing:.16em}.ah-rf-hud__obj-title{display:block;margin-top:3px;font-size:12px}.ah-rf-hud__obj-detail{display:block;margin-top:2px;color:#9cb2c3;font-size:10px;font-style:normal}.ah-rf-hud__radar{width:118px;height:76px;padding:4px;justify-self:end}.ah-rf-hud__radar-canvas{display:block;width:100%;height:100%}@media (max-width:420px){.ah-rf-hud{grid-template-columns:minmax(118px,34%) minmax(0,1fr) 96px}.ah-rf-hud__radar{width:96px;height:64px}}`;
    document.head.appendChild(style);
  }
  function markup(meta) {
    return `<div class="ah-rf-hud"><div class="ah-rf-hud__cluster"><div class="ah-rf-hud__id"><span class="ah-rf-hud__portrait" aria-hidden="true"></span><div><strong>${meta.code || "RF"}</strong><em data-rf-hud="tier">${meta.seal || "STANDARD"}</em></div></div><div class="ah-rf-hud__bar"><i data-rf-hud="hp-bar"></i></div><span class="ah-rf-hud__hp-text" data-rf-hud="hp">HP -- / --</span><span class="ah-rf-hud__loot" data-rf-hud="loot">EXP 0  BONES 0  SCRAP 0</span></div><div class="ah-rf-hud__objective"><span class="ah-rf-hud__obj-kicker">OBJECTIVE</span><strong class="ah-rf-hud__obj-title" data-rf-hud="obj-title">${meta.objective || "EXPLORE"}</strong><em class="ah-rf-hud__obj-detail" data-rf-hud="obj-detail">${meta.detail || ""}</em></div><div class="ah-rf-hud__radar" aria-label="Local sector map"><canvas class="ah-rf-hud__radar-canvas" width="110" height="66"></canvas></div></div>`;
  }
  function bind(root) {
    if (!root) return null;
    return {
      root,
      hpBar: root.querySelector("[data-rf-hud='hp-bar']"),
      hp: root.querySelector("[data-rf-hud='hp']"),
      loot: root.querySelector("[data-rf-hud='loot']"),
      tier: root.querySelector("[data-rf-hud='tier']"),
      objTitle: root.querySelector("[data-rf-hud='obj-title']"),
      objDetail: root.querySelector("[data-rf-hud='obj-detail']"),
      radar: root.querySelector(".ah-rf-hud__radar-canvas"),
      fingerprint: "",
      radarFingerprint: "",
      radarAt: 0,
    };
  }
  function update(hud, snap) {
    if (!hud || !snap) return;
    const fp = [snap.hp, snap.maxHp, snap.title, snap.detail, snap.exp, snap.bones, snap.scrap, snap.gear, snap.tier, snap.status].join("|");
    if (fp === hud.fingerprint) return;
    hud.fingerprint = fp;
    const ratio = Math.max(0, Math.min(1, snap.hp / Math.max(1, snap.maxHp)));
    if (hud.hpBar && hud.hpBar.style) hud.hpBar.style.width = Math.round(ratio * 100) + "%";
    if (hud.hp) hud.hp.textContent = "HP  " + snap.hp + " / " + snap.maxHp;
    if (hud.loot) hud.loot.textContent = "EXP " + snap.exp + "  BONES " + snap.bones + "  SCRAP " + snap.scrap + (snap.gear ? "  GEAR " + snap.gear : "");
    if (hud.tier) hud.tier.textContent = snap.tier || "STANDARD";
    if (hud.objTitle) hud.objTitle.textContent = snap.title || "";
    if (hud.objDetail) hud.objDetail.textContent = snap.detail || "";
  }
  function triggerXY(encounter) {
    const t = encounter?.trigger;
    if (Array.isArray(t)) return { x: t[0], y: t[1], optional: encounter.id === "maintenance_cache" || encounter.id === "side_cache" };
    if (t && typeof t === "object") return { x: t.x, y: t.y, optional: encounter.required === false || encounter.id === "side_cache" };
    return null;
  }
  function radar(hud, snap, world, encounters, now) {
    const canvas = hud?.radar;
    if (!canvas || !snap || !world) return;
    const fp = (snap.x | 0) + "," + (snap.y | 0) + "|" + snap.status + "|" + !!snap.relayActivated + "|" + (snap.kills || 0) + "|" + !!snap.cacheOpened;
    if (fp === hud.radarFingerprint && now - hud.radarAt < 180) return;
    hud.radarFingerprint = fp;
    hud.radarAt = now;
    if (typeof canvas.getContext !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height, sx = w / world.width, sy = h / world.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(101,232,255,.18)";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    (encounters || []).forEach((encounter) => {
      const point = triggerXY(encounter);
      const state = snap.encounters?.[encounter.id];
      if (!point) return;
      ctx.fillStyle = state?.cleared ? "rgba(101,232,255,.55)" : state?.activated ? "rgba(255,112,189,.8)" : (point.optional ? "rgba(211,167,239,.55)" : "rgba(127,150,168,.45)");
      ctx.fillRect(point.x * sx - 2, point.y * sy - 2, 4, 4);
    });
    if (world.relay) {
      ctx.fillStyle = snap.relayActivated ? "#baf6ff" : (snap.status === "cleared" ? "#65e8ff" : "#e8af91");
      ctx.fillRect(world.relay.x * sx - 2, world.relay.y * sy - 2, 5, 5);
    }
    if (world.extract && snap.relayActivated) {
      ctx.fillStyle = "#65e8ff";
      ctx.fillRect(world.extract.x * sx - 2, world.extract.y * sy - 2, 5, 5);
    }
    ctx.fillStyle = "#dffcff";
    ctx.fillRect((snap.x * sx) - 2, (snap.y * sy) - 2, 4, 4);
  }
  global.AlphaActionSectorHud = { inject, markup, bind, update, radar };
})(window);
