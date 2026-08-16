// RF01-only production HUD skin. Shared RF02 HUD/runtime files stay untouched.
(function (global) {
  "use strict";

  const BASE = "assets/world_exploration/relay_fringe_01/ui/";
  const STYLE_ID = "ah-rf01-prod-hud-css-v2";
  const ASSETS = Object.freeze({
    portrait: "hud_portrait_frame_round.png",
    hpFrame: "hud_status_bar_long_top.png",
    hpFill: "hud_hp_bar_fill_red_trimmed.png",
    resFrame: "hud_status_bar_long_bottom.png",
    resFill: "hud_resource_bar_fill_cyan_trimmed.png",
    panelSmall: "hud_panel_small_rect.png",
    objPanel: "hud_objective_panel.png",
    objIcon: "hud_objective_icon.png",
    objDivider: "hud_objective_progress_divider.png",
    relayLocked: "hud_relay_locked_icon.png",
    relayReady: "hud_relay_ready_icon.png",
    relayActive: "hud_relay_active_icon.png",
    exitLocked: "hud_exit_locked_icon.png",
    exitOpen: "hud_exit_open_icon.png",
    mapFrame: "hud_minimap_frame.png",
    mapPanel: "hud_minimap_panel.png",
    mapPlayer: "hud_minimap_player_marker.png",
    mapDir: "hud_minimap_direction_marker.png",
    mapObj: "hud_minimap_objective_marker.png",
    mapExit: "hud_minimap_exit_marker.png",
    mapEnemy: "hud_minimap_enemy_marker.png",
    mapFog: "hud_minimap_unexplored_overlay_trimmed.png",
    compass: "hud_compass_tick_trimmed.png",
    prompt: "hud_interaction_prompt_frame.png",
    resultPanel: "hud_run_complete_panel.png",
    resultDiv: "hud_result_row_divider.png",
    success: "hud_success_marker.png",
    warn: "hud_sync_warning_marker.png",
    fail: "hud_sync_failed_marker.png",
    btnPrimary: "hud_primary_button.png",
    btnSecondary: "hud_secondary_button.png",
    btnDisabled: "hud_disabled_button.png",
    xp: "hud_xp_icon.png",
    bones: "hud_bones_icon.png",
    scrap: "hud_scrap_icon.png",
    gear: "hud_equipment_icon.png"
  });

  function url(name) { return BASE + name; }
  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  function inject() {
    document.getElementById("ah-rf01-prod-hud-css")?.remove();
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
.ah-exploration-room--pack .ah-exploration-room__header{min-height:32px;padding:max(2px,env(safe-area-inset-top)) max(7px,env(safe-area-inset-right)) 2px max(7px,env(safe-area-inset-left));background:linear-gradient(#0b1218,#070c11);border-bottom-color:rgba(101,232,255,.13)}
.ah-exploration-room--pack .ah-exploration-room__back{min-height:28px;border:0;background:url(${url(ASSETS.btnSecondary)}) center top/100% 200% no-repeat;color:#dcecff;font-size:8px}
.ah-exploration-room--pack .ah-exploration-room__heading span{font-size:7px;letter-spacing:.16em;color:#718895}
.ah-exploration-room--pack .ah-exploration-room__heading strong{margin-top:1px;font-size:11px;letter-spacing:.07em}
.ah-exploration-room--pack .ah-exploration-room__seal{visibility:hidden}
.ah-exploration-room.is-result-open .ah-rf-hud--pack{opacity:.16}
.ah-exploration-room.is-result-open .ah-exploration-room__canvas{filter:brightness(.32) saturate(.7)}
.ah-rf-hud--pack{position:absolute;inset:0;z-index:8;pointer-events:none;font-family:Inter,system-ui,sans-serif;color:#dcecff}
.ah-rf-hud--pack .ah-rf-hud__cluster,.ah-rf-hud--pack .ah-rf-hud__objective,.ah-rf-hud--pack .ah-rf-hud__radar{pointer-events:none}
.ah-rf-hud__cluster{position:absolute;top:3px;left:max(5px,env(safe-area-inset-left));width:110px;padding:4px 6px 3px;background-color:transparent;background-image:url(${url(ASSETS.panelSmall)});background-position:center;background-size:100% 100%;background-repeat:no-repeat}
.ah-rf-hud__id{display:grid;grid-template-columns:24px minmax(0,1fr);gap:4px;align-items:center}
.ah-rf-hud__portrait{width:24px;height:24px;border-radius:50%;background:
  url(assets/dojo/v1/processed/alpha_husky_player_sheet_v1.png) 8% 8%/400% 400% no-repeat,
  url(${url(ASSETS.portrait)}) center/contain no-repeat #05080c;box-shadow:inset 0 0 0 1px rgba(0,0,0,.55)}
.ah-rf-hud__id strong{display:block;font-size:8px;letter-spacing:.08em}
.ah-rf-hud__id em{display:block;color:#7c929f;font-size:5.5px;font-style:normal;letter-spacing:.1em;text-transform:uppercase}.ah-rf-hud__level{display:none}
.ah-rf-hud__bar-frame{position:relative;height:7px;margin-top:1px;background:url(${url(ASSETS.hpFrame)}) center/100% 100% no-repeat}
.ah-rf-hud__bar-frame--howl{height:5px;margin-top:1px;background-image:url(${url(ASSETS.resFrame)});opacity:.62}
.ah-rf-hud__bar-frame.is-inactive{opacity:.38}
.ah-rf-hud__bar-frame i{display:block;height:100%;width:0;max-width:100%;background:url(${url(ASSETS.hpFill)}) left center/cover no-repeat;clip-path:inset(18% 0 18% 0);transition:width .12s linear}
.ah-rf-hud__bar-frame--howl i{background-image:url(${url(ASSETS.resFill)})}
.ah-rf-hud__hp-text{display:block;margin-top:1px;color:#d9e8ee;font-size:6.5px;font-weight:800;letter-spacing:.05em}
.ah-rf-hud__howl-text{position:absolute;right:5px;top:50%;transform:translateY(-50%);color:#9abcc7;font-size:5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;z-index:1}
.ah-rf-hud__loot{display:none}
.ah-rf-hud__loot span{white-space:nowrap}
.ah-rf-hud__objective{position:absolute;top:3px;left:120px;right:70px;width:auto;min-height:32px;padding:5px 24px 4px 28px;background-color:transparent;background-image:url(${url(ASSETS.objIcon)}),url(${url(ASSETS.objPanel)});background-position:7px center,center;background-size:15px 15px,100% 100%;background-repeat:no-repeat;text-align:left}
.ah-rf-hud__obj-kicker{display:none}
.ah-rf-hud__obj-title{display:block;font-size:8px;letter-spacing:.02em;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ah-rf-hud__obj-detail{display:block;margin-top:1px;color:#8ba0aa;font-size:6px;font-style:normal;line-height:1.05;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ah-rf-hud__obj-states{position:absolute;right:5px;top:50%;transform:translateY(-50%);display:grid;gap:1px;justify-items:center}
.ah-rf-hud__state{width:12px;height:12px;object-fit:contain;filter:drop-shadow(0 1px 2px #000)}
.ah-rf-hud__radar{position:absolute;top:3px;right:max(4px,env(safe-area-inset-right));width:66px;height:66px}
.ah-rf-hud__radar-panel{position:absolute;inset:7px;background:url(${url(ASSETS.mapPanel)}) center/100% 100% no-repeat}
.ah-rf-hud__radar-inner{position:absolute;inset:12px;overflow:hidden}
.ah-rf-hud__radar-canvas{display:block;width:100%;height:100%}
.ah-rf-hud__radar-fog{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42;pointer-events:none;mix-blend-mode:multiply}
.ah-rf-hud__radar-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}
.ah-rf-hud__radar-compass{position:absolute;left:10%;right:10%;top:2px;height:8px;object-fit:contain;opacity:.85;pointer-events:none}
.ah-rf-hud__mk{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;object-fit:contain;pointer-events:none}
.ah-rf-hud__mk--player{width:11px;height:11px;margin:-5px 0 0 -5px;z-index:4}
.ah-rf-hud__mk--obj,.ah-rf-hud__mk--exit{width:10px;height:10px;z-index:3}
.ah-rf-hud__mk--exit{width:12px;height:12px;margin:-6px 0 0 -6px}
.ah-rf-hud__mk--enemy{width:7px;height:7px;margin:-3px 0 0 -3px;opacity:.85}
.ah-rf-hud__enemy-markers{position:absolute;inset:0;pointer-events:none}
.ah-rf-hud__prompt{position:absolute;left:50%;bottom:max(126px,calc(env(safe-area-inset-bottom) + 126px));transform:translateX(-50%);width:min(190px,66vw);min-height:30px;padding:7px 13px 5px;background:url(${url(ASSETS.prompt)}) center/100% 100% no-repeat;color:#d8fbff;font:800 9px/1.1 system-ui;letter-spacing:.08em;text-align:center;text-transform:uppercase}
.ah-rf-hud__prompt[hidden]{display:none!important}
.ah-rf01-result{position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:max(8px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom));background:rgba(2,5,8,.9);pointer-events:auto}
.ah-rf01-result__card{position:relative;box-sizing:border-box;width:min(336px,92vw);max-height:min(86dvh,620px);padding:14px 18px 12px;overflow:hidden;background:url(${url(ASSETS.resultPanel)}) center/100% 100% no-repeat;text-align:center;display:flex;flex-direction:column}
.ah-rf01-result__marker{width:34px;height:34px;margin:0 auto 2px;object-fit:contain;object-position:top;flex:0 0 auto}
.ah-rf01-result__eyebrow{color:#7f96a8;font-size:9px;font-weight:800;letter-spacing:.14em}
.ah-rf01-result__card h2{margin:2px 0 2px;font-size:16px;letter-spacing:.04em}
.ah-rf01-result__sync{margin:0 0 4px;color:#b7c6d1;font-size:11px;line-height:1.25}
.ah-rf01-result__card.is-saved .ah-rf01-result__sync{color:#9be7c4}
.ah-rf01-result__card.is-failed .ah-rf01-result__sync,.ah-rf01-result__card.is-dead .ah-rf01-result__sync{color:#f0b3a0}
.ah-rf01-result__card.is-warn .ah-rf01-result__sync{color:#ecd08a}
.ah-rf01-result__note{margin:0 0 6px;color:#6f8492;font-size:8px;letter-spacing:.06em;line-height:1.25}
.ah-rf01-result__story{margin:1px 0 6px;padding:5px 8px;border-top:1px solid rgba(101,232,255,.24);border-bottom:1px solid rgba(101,232,255,.18);color:#bfeef4;font:700 8px/1.35 system-ui;letter-spacing:.07em}
.ah-rf01-result__story strong{display:block;color:#72deed;font-size:9px;letter-spacing:.13em}.ah-rf01-result__story em{display:block;margin-top:3px;color:#d8eff2;font-style:normal;font-size:8px;letter-spacing:.02em}
.ah-rf01-result__rows{margin:2px 0 6px;flex:1 1 auto;min-height:0}
.ah-rf01-result__row{display:grid;grid-template-columns:16px 1fr auto;align-items:center;gap:6px;min-height:22px;padding:1px 8px;background:url(${url(ASSETS.resultDiv)}) center/100% 100% no-repeat;font-size:11px;text-align:left}
.ah-rf01-result__row img{width:14px;height:14px;object-fit:contain}
.ah-rf01-result__row span{color:#8aa3b2}
.ah-rf01-result__row b{color:#effaff;font-weight:800}
.ah-rf01-result__actions{display:grid;gap:5px;margin:0;flex:0 0 auto}
.ah-rf01-result__btn{height:40px;min-height:40px;border:0;background-color:transparent;background-image:url(${url(ASSETS.btnPrimary)});background-repeat:no-repeat;background-size:100% 200%;background-position:center top;color:#e5fdff;font:800 10px/1 system-ui;letter-spacing:.08em;text-transform:uppercase;padding:0 12px}
.ah-rf01-result__btn--sec{background-image:url(${url(ASSETS.btnSecondary)});color:#dce8f6}
.ah-rf01-result__btn:active{background-position:center bottom}
.ah-rf01-result__btn[disabled],.ah-rf01-result__btn.is-disabled{background-image:url(${url(ASSETS.btnDisabled)});background-size:100% 100%;background-position:center;color:#8b9aaa;pointer-events:none}
@media (max-width:420px){
  .ah-rf-hud__cluster{width:106px;padding:4px 6px 3px}
  .ah-rf-hud__objective{left:116px;right:68px;min-height:32px;padding:5px 23px 4px 27px}
  .ah-rf-hud__obj-title{font-size:7.5px}
  .ah-rf-hud__radar{width:64px;height:64px}
  .ah-rf01-result__card{padding:12px 14px 10px;max-height:min(84dvh,580px)}
  .ah-rf01-result__btn{height:38px;min-height:38px}
  .ah-rf-hud__prompt{bottom:max(120px,calc(env(safe-area-inset-bottom) + 120px))}
}
@media (max-width:340px){
  .ah-rf-hud__cluster{width:100px}
  .ah-rf-hud__objective{left:110px;right:64px;padding:4px 21px 4px 25px}
  .ah-rf-hud__radar{width:60px;height:60px}
  .ah-rf01-result__row{min-height:20px;font-size:10px}
}`.replace(/\n/g, "");
    document.head.appendChild(style);
  }

  function markup() {
    return `<div class="ah-rf-hud ah-rf-hud--pack" aria-hidden="false">
      <div class="ah-rf-hud__cluster">
        <div class="ah-rf-hud__id">
          <span class="ah-rf-hud__portrait" aria-hidden="true"></span>
          <div>
            <strong data-rf-hud="id">RF-01</strong>
            <em data-rf-hud="tier">STANDARD</em>
            <span class="ah-rf-hud__level" data-rf-hud="level"></span>
          </div>
        </div>
        <div class="ah-rf-hud__bar-frame ah-rf-hud__bar-frame--hp"><i data-rf-hud="hp-bar"></i></div>
        <span class="ah-rf-hud__hp-text" data-rf-hud="hp">HP -- / --</span>
        <div class="ah-rf-hud__bar-frame ah-rf-hud__bar-frame--howl is-inactive" data-rf-hud="howl-frame"><i data-rf-hud="howl-bar"></i><span class="ah-rf-hud__howl-text" data-rf-hud="howl">HOWL</span></div>
        <div class="ah-rf-hud__loot" data-rf-hud="loot"><span data-rf-hud="loot-exp">XP 0</span><span data-rf-hud="loot-bones">BN 0</span><span data-rf-hud="loot-scrap">SC 0</span><span data-rf-hud="loot-gear">EQ 0</span></div>
      </div>
      <div class="ah-rf-hud__objective">
        <span class="ah-rf-hud__obj-kicker">OBJECTIVE</span>
        <strong class="ah-rf-hud__obj-title" data-rf-hud="obj-title">Reach the Relay approach</strong>
        <em class="ah-rf-hud__obj-detail" data-rf-hud="obj-detail">Follow the fractured signal east</em>
        <div class="ah-rf-hud__obj-states">
          <img class="ah-rf-hud__state" data-rf-hud="relay-icon" alt="" src="${url(ASSETS.relayLocked)}">
          <img class="ah-rf-hud__state" data-rf-hud="exit-icon" alt="" src="${url(ASSETS.exitLocked)}">
        </div>
      </div>
      <div class="ah-rf-hud__radar" aria-label="Local sector map">
        <div class="ah-rf-hud__radar-panel"></div>
        <div class="ah-rf-hud__radar-inner">
          <canvas class="ah-rf-hud__radar-canvas" width="180" height="180"></canvas>
          <img class="ah-rf-hud__radar-fog" data-rf-hud="fog" alt="" src="${url(ASSETS.mapFog)}">
          <img class="ah-rf-hud__mk ah-rf-hud__mk--obj" data-rf-hud="mk-relay" alt="" src="${url(ASSETS.mapObj)}">
          <img class="ah-rf-hud__mk ah-rf-hud__mk--exit" data-rf-hud="mk-exit" alt="" src="${url(ASSETS.mapExit)}" hidden>
          <span class="ah-rf-hud__enemy-markers" data-rf-hud="enemy-markers"></span>
          <img class="ah-rf-hud__mk ah-rf-hud__mk--player" data-rf-hud="mk-player" alt="" src="${url(ASSETS.mapPlayer)}">
        </div>
        <img class="ah-rf-hud__radar-frame" alt="" src="${url(ASSETS.mapFrame)}">
        <img class="ah-rf-hud__radar-compass" alt="" src="${url(ASSETS.compass)}">
      </div>
      <div class="ah-rf-hud__prompt" data-rf-hud="prompt" hidden></div>
    </div>`;
  }

  function bind(root) {
    if (!root) return null;
    return {
      root,
      hpBar: root.querySelector("[data-rf-hud='hp-bar']"),
      hp: root.querySelector("[data-rf-hud='hp']"),
      howlBar: root.querySelector("[data-rf-hud='howl-bar']"),
      howl: root.querySelector("[data-rf-hud='howl']"),
      howlFrame: root.querySelector("[data-rf-hud='howl-frame']"),
      loot: root.querySelector("[data-rf-hud='loot']"),
      lootExp: root.querySelector("[data-rf-hud='loot-exp']"),
      lootBones: root.querySelector("[data-rf-hud='loot-bones']"),
      lootScrap: root.querySelector("[data-rf-hud='loot-scrap']"),
      lootGear: root.querySelector("[data-rf-hud='loot-gear']"),
      tier: root.querySelector("[data-rf-hud='tier']"),
      level: root.querySelector("[data-rf-hud='level']"),
      objTitle: root.querySelector("[data-rf-hud='obj-title']"),
      objDetail: root.querySelector("[data-rf-hud='obj-detail']"),
      relayIcon: root.querySelector("[data-rf-hud='relay-icon']"),
      exitIcon: root.querySelector("[data-rf-hud='exit-icon']"),
      radar: root.querySelector(".ah-rf-hud__radar-canvas"),
      fog: root.querySelector("[data-rf-hud='fog']"),
      mkPlayer: root.querySelector("[data-rf-hud='mk-player']"),
      mkRelay: root.querySelector("[data-rf-hud='mk-relay']"),
      mkExit: root.querySelector("[data-rf-hud='mk-exit']"),
      enemyMarkers: root.querySelector("[data-rf-hud='enemy-markers']"),
      prompt: root.querySelector("[data-rf-hud='prompt']"),
      fingerprint: "",
      howlFingerprint: "",
      radarFingerprint: "",
      radarAt: 0,
      geomDrawn: false
    };
  }

  function relayVisual(snap) {
    if (snap.relayActivated) return "active";
    if (snap.status === "cleared") return "ready";
    return "locked";
  }

  function update(hud, snap) {
    if (!hud || !snap) return;
    const relay = relayVisual(snap);
    const exitOpen = snap.relayActivated === true;
    const fp = [snap.hp, snap.maxHp, snap.title, snap.detail, snap.exp, snap.bones, snap.scrap, snap.gear, snap.tier, snap.status, snap.relayActivated, snap.level].join("|");
    if (fp === hud.fingerprint) return;
    hud.fingerprint = fp;
    const ratio = clamp01(snap.hp / Math.max(1, snap.maxHp));
    if (hud.hpBar) hud.hpBar.style.width = Math.round(ratio * 100) + "%";
    if (hud.hp) hud.hp.textContent = "HP  " + snap.hp + " / " + snap.maxHp;
    if (hud.lootExp) hud.lootExp.textContent = "XP " + snap.exp;
    if (hud.lootBones) hud.lootBones.textContent = "BN " + snap.bones;
    if (hud.lootScrap) hud.lootScrap.textContent = "SC " + snap.scrap;
    if (hud.lootGear) hud.lootGear.textContent = "EQ " + (snap.gear || 0);
    if (hud.tier) hud.tier.textContent = snap.tier || "STANDARD";
    if (hud.level) hud.level.textContent = snap.level ? ("LVL " + snap.level) : "";
    if (hud.objTitle) hud.objTitle.textContent = snap.title || "";
    if (hud.objDetail) hud.objDetail.textContent = snap.detail || "";
    if (hud.relayIcon) hud.relayIcon.src = url(relay === "active" ? ASSETS.relayActive : relay === "ready" ? ASSETS.relayReady : ASSETS.relayLocked);
    if (hud.exitIcon) hud.exitIcon.src = url(exitOpen ? ASSETS.exitOpen : ASSETS.exitLocked);
  }

  function updateHowl(hud, ratio, remaining, ready) {
    if (!hud) return;
    const r = clamp01(ratio);
    const fp = r.toFixed(2) + "|" + Math.ceil((remaining || 0) / 250) + "|" + !!ready;
    if (fp === hud.howlFingerprint) return;
    hud.howlFingerprint = fp;
    if (hud.howlBar) hud.howlBar.style.width = Math.round(r * 100) + "%";
    if (hud.howlFrame) hud.howlFrame.classList.toggle("is-inactive", !ready && !(remaining > 0));
    if (hud.howl) hud.howl.textContent = ready ? "READY" : (remaining > 0 ? (Math.ceil(remaining / 1000) + "s") : "HOWL");
  }

  function setPrompt(hud, text) {
    if (!hud?.prompt) return;
    const value = String(text || "").trim();
    hud.prompt.textContent = value;
    hud.prompt.hidden = !value;
  }

  function pct(value, size) {
    return (clamp01(value / Math.max(1, size)) * 100).toFixed(2) + "%";
  }

  function drawGeometry(ctx, w, h, world) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, w, h);
    const sx = w / world.width, sy = h / world.height;
    ctx.fillStyle = "rgba(36, 68, 84, .55)";
    ctx.fillRect(0, h * .42, w, h * .28);
    ctx.strokeStyle = "rgba(101,232,255,.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, h * .56);
    ctx.lineTo(w - 8, h * .50);
    ctx.stroke();
    return { sx, sy };
  }

  function updateMinimap(hud, snap, world, encounters, now) {
    const canvas = hud?.radar;
    if (!canvas || !snap || !world) return;
    const enemies = Array.isArray(snap.enemies) ? snap.enemies.slice(0, 4) : [];
    const enemyFingerprint = enemies.map(enemy => (enemy.x | 0) + "," + (enemy.y | 0)).join(";"), ping = snap.signalPing;
    const pingFingerprint = ping ? ((ping.x | 0) + "," + (ping.y | 0) + "," + (ping.until | 0) + "," + Math.floor(now / 120)) : "";
    const fp = (snap.x | 0) + "," + (snap.y | 0) + "|" + (snap.facing || "") + "|" + snap.status + "|" + !!snap.relayActivated + "|" + (snap.kills || 0) + "|" + enemyFingerprint + "|" + pingFingerprint;
    if (fp === hud.radarFingerprint && now - hud.radarAt < 160) return;
    hud.radarFingerprint = fp;
    hud.radarAt = now;
    if (typeof canvas.getContext !== "function") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    if (!hud.geomDrawn) {
      drawGeometry(ctx, w, h, world);
      hud.geomDrawn = true;
    }
    const sx = w / world.width, sy = h / world.height;
    ctx.clearRect(0, 0, w, h);
    drawGeometry(ctx, w, h, world);
    (encounters || []).forEach((encounter) => {
      const t = encounter.trigger;
      if (!t) return;
      const state = snap.encounters?.[encounter.id];
      ctx.fillStyle = state?.cleared ? "rgba(101,232,255,.45)" : state?.activated ? "rgba(232,140,90,.7)" : "rgba(90,110,124,.4)";
      ctx.fillRect(t.x * sx - 2, t.y * sy - 2, 4, 4);
    });
    if (ping && ping.until > now) {
      const phase = ((now % 900) / 900), radius = 3 + phase * 7;
      ctx.strokeStyle = "rgba(255,198,112," + (0.9 - phase * .55).toFixed(2) + ")";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ping.x * sx, ping.y * sy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,220,150,.95)";
      ctx.fillRect(ping.x * sx - 1.5, ping.y * sy - 1.5, 3, 3);
    }
    if (hud.mkRelay) {
      hud.mkRelay.style.left = pct(world.relay.x, world.width);
      hud.mkRelay.style.top = pct(world.relay.y, world.height);
    }
    if (hud.mkExit) {
      const open = snap.relayActivated === true;
      hud.mkExit.hidden = !open;
      if (open && world.extract) {
        hud.mkExit.style.left = pct(world.extract.x, world.width);
        hud.mkExit.style.top = pct(world.extract.y, world.height);
      }
    }
    if (hud.mkPlayer) {
      hud.mkPlayer.style.left = pct(snap.x, world.width);
      hud.mkPlayer.style.top = pct(snap.y, world.height);
      const rot = snap.facing === "left" ? 270 : snap.facing === "right" ? 90 : snap.facing === "up" ? 0 : 180;
      hud.mkPlayer.style.transform = "rotate(" + rot + "deg)";
    }
    if (hud.enemyMarkers) {
      while (hud.enemyMarkers.children.length < enemies.length) {
        const marker = document.createElement("img");
        marker.className = "ah-rf-hud__mk ah-rf-hud__mk--enemy";
        marker.alt = "";
        marker.src = url(ASSETS.mapEnemy);
        hud.enemyMarkers.appendChild(marker);
      }
      Array.from(hud.enemyMarkers.children).forEach((marker, index) => {
        const enemy = enemies[index];
        marker.hidden = !enemy;
        if (enemy) { marker.style.left = pct(enemy.x, world.width); marker.style.top = pct(enemy.y, world.height); }
      });
    }
    if (hud.fog) {
      const x = clamp01(snap.x / world.width) * 100;
      const y = clamp01(snap.y / world.height) * 100;
      hud.fog.style.webkitMaskImage = "radial-gradient(circle at " + x.toFixed(1) + "% " + y.toFixed(1) + "%, transparent 16%, black 46%)";
      hud.fog.style.maskImage = hud.fog.style.webkitMaskImage;
    }
  }

  function syncLabel(saveState, failed) {
    if (failed) return { kind: "dead", text: "Signal run collapsed. No rewards claimed." };
    if (saveState === "saved") return { kind: "saved", text: "SAVED" };
    if (saveState === "failed") return { kind: "failed", text: "SAVE FAILED" };
    if (saveState === "saving") return { kind: "warn", text: "SECURING SIGNAL..." };
    return { kind: "warn", text: "SECURING SIGNAL..." };
  }

  function row(icon, label, value) {
    return `<div class="ah-rf01-result__row"><img alt="" src="${url(icon)}"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
  }

  function btn(action, label, kind, disabled) {
    return `<button type="button" class="ah-rf01-result__btn${kind === "sec" ? " ah-rf01-result__btn--sec" : ""}${disabled ? " is-disabled" : ""}" data-sector-run-action="${esc(action)}"${disabled ? " disabled" : ""}>${esc(label)}</button>`;
  }

  function renderResult(host, model) {
    if (!host) return;
    host.querySelector(".ah-rf01-result")?.remove();
    const failed = model.failed === true;
    const saving = model.saveState === "saving" || model.saveState === "pending" || (!failed && !model.saveState);
    const sync = syncLabel(model.saveState, failed);
    const marker = failed || sync.kind === "failed" ? ASSETS.fail : sync.kind === "saved" ? ASSETS.success : ASSETS.warn;
    const reward = model.rewards || {};
    const panel = document.createElement("section");
    panel.className = "ah-rf01-result ah-sector-result";
    const continueBtn = !failed && model.saveState === "saved" && model.allowRf02 === true ? btn("continue", "CONTINUE TO RF02", "pri", false) : "";
    const retryBtn = !failed && model.saveState === "failed" ? btn("retry", "RETRY SAVE", "pri", false) : "";
    const againAction = failed ? "restart" : "again";
    const againLabel = failed ? "RESTART SECTOR" : "RUN AGAIN";
    const note = failed ? "" : "<p class=\"ah-rf01-result__note\">Rewards apply only after the server confirms the run.</p>";
    const branch = model.branchStoryResult;
    const story = !failed && branch ? `<div class="ah-rf01-result__story"><strong>${esc(branch.title || "SIGNAL RECOVERED")}</strong>${esc(branch.summary || "ROUTE: RF02")}<em>${esc(branch.lines?.[0] || "")}${branch.lines?.[1] ? "<br>" + esc(branch.lines[1]) : ""}</em></div>` : "";
    panel.innerHTML = `<div class="ah-rf01-result__card is-${sync.kind}"><img class="ah-rf01-result__marker" alt="" src="${url(marker)}"><div class="ah-rf01-result__eyebrow">RELAY FRINGE 01</div><h2>${failed ? "RUN FAILED" : "RUN COMPLETE"}</h2><p class="ah-rf01-result__sync">${esc(sync.text)}</p>${model.firstClear ? "<p class='ah-rf01-result__sync'>RELAY STABILIZED · RELAY-7 ONLINE</p>" : ""}${story}<div class="ah-rf01-result__rows">${row(ASSETS.xp, "Time", (model.duration || 0) + "s")}${row(ASSETS.gear, "Hostiles", (model.kills || 0) + " / 16")}${row(ASSETS.xp, "EXP", "+" + (reward.exp ?? model.exp ?? 0))}${row(ASSETS.bones, "Bones", "+" + (reward.bones ?? model.bones ?? 0))}${row(ASSETS.scrap, "Scrap", "+" + (reward.scrap ?? model.scrap ?? 0))}${row(ASSETS.gear, "Equipment", String(model.gear ?? 0))}</div>${note}<div class="ah-rf01-result__actions">${retryBtn}${continueBtn}${btn(againAction, againLabel, failed ? "pri" : "sec", saving)}${btn("map", "RETURN TO MAP", "sec", false)}</div></div>`;
    host.appendChild(panel);
  }

  function removeResult(host) {
    host?.querySelector(".ah-rf01-result")?.remove();
    host?.querySelector(".ah-sector-result")?.remove();
  }

  global.AlphaRf01ProductionHud = Object.freeze({
    BASE, ASSETS, url, inject, markup, bind, update, updateHowl, updateMinimap, setPrompt, renderResult, removeResult, syncLabel
  });
})(window);
