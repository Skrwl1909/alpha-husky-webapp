(function (global) {
  "use strict";

  const STYLE_ID = "worldExplorationPathStyles";
  const ROUTE_CLASS = "world-proof-route-layer";
  const PHASES = new Set([
    "LOCKED",
    "ELIGIBLE",
    "SCOUT_SELECTION",
    "TRACE_CHOICE",
    "ENCOUNTER_READY",
    "ENCOUNTER_ACTIVE",
    "ANCHOR_CHOICE",
    "UNLOCKED",
  ]);
  const STATUS = {
    LOCKED: "LOCKED",
    ELIGIBLE: "SIGNAL DETECTED",
    SCOUT_SELECTION: "SIGNAL DETECTED",
    TRACE_CHOICE: "SCOUT ASSIGNED",
    ENCOUNTER_READY: "ROUTE TRACED",
    ENCOUNTER_ACTIVE: "HOSTILE CONTACT",
    ANCHOR_CHOICE: "ANCHOR READY",
    UNLOCKED: "ROUTE PROVEN",
  };
  const runtime = {
    deps: {},
    routeGeneration: 0,
    panelGeneration: 0,
    routeFrame: 0,
    routePetSprite: null,
    tacticalHydration: null,
    tacticalMounted: false,
    mapVisible: true,
  };

  function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function number(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function pathFor(sector) {
    return object(sector?.pathOfProof);
  }

  function phaseFor(sector) {
    const phase = String(pathFor(sector)?.phase || "").toUpperCase();
    return PHASES.has(phase) ? phase : "";
  }

  function isPathSector(sector) {
    const path = pathFor(sector);
    if (path?.completionMode === "legacy_scan" && path?.phase === "UNLOCKED" && !path?.pathId) return false;
    return !!(
      path?.configured
      && (
        path.enabled
        || path.pathId
        || path.regionalAnchor
        || path.completionMode === "path_of_proof"
      )
    );
  }

  function prefersReducedMotion() {
    try {
      return !!global.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    } catch (_) {
      return false;
    }
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .world-proof-kicker{display:block;margin-top:6px;color:#d6b978;font:800 10px/1 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .world-exploration-backdrop{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
      .world-exploration-sector[data-status="path_active"] .world-exploration-lock-asset{opacity:0;visibility:hidden}
      .world-exploration-sector[data-status="path_active"] .world-exploration-region-asset{opacity:.34;filter:saturate(.82) contrast(.98)}
      .world-exploration-sector[data-status="path_active"] .world-exploration-sector-shade{background:radial-gradient(ellipse at 50% 48%,rgba(45,131,139,.1),transparent 52%)}
      .world-proof-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0 0 16px;padding:0;list-style:none}
      .world-proof-steps li{position:relative;padding:9px 7px;border:1px solid rgba(135,191,198,.16);background:rgba(255,255,255,.025);color:#6f898e;font:800 10px/1 system-ui,sans-serif;letter-spacing:.1em;text-align:center}
      .world-proof-steps li[data-step-state="current"]{border-color:rgba(111,216,222,.42);color:#dcf6f7;background:rgba(40,137,145,.14)}
      .world-proof-steps li[data-step-state="complete"]{border-color:rgba(94,172,129,.32);color:#9ed7b5;background:rgba(39,108,72,.12)}
      .world-proof-copy{margin:0 0 13px;color:#b4c7ca;font-size:13px;line-height:1.48}
      .world-proof-copy strong{color:#edf7f8}
      .world-proof-selection{display:grid;gap:8px;margin:10px 0 14px}
      .world-proof-card{position:relative;display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;min-width:0;padding:10px;border:1px solid rgba(135,193,200,.17);border-radius:10px;background:rgba(255,255,255,.028);color:#d7e7e9;cursor:pointer}
      .world-proof-card:has(input:checked){border-color:rgba(107,217,223,.46);background:rgba(34,121,130,.13);box-shadow:inset 0 0 0 1px rgba(132,224,226,.06)}
      .world-proof-card input{position:absolute;opacity:0;pointer-events:none}
      .world-proof-card-copy{min-width:0}
      .world-proof-card-copy b{display:block;color:#ecf8f8;font-size:13px}
      .world-proof-card-copy span{display:block;margin-top:4px;color:#9fb4b8;font-size:12px;line-height:1.4}
      .world-proof-pet-thumb{width:49px;height:49px;border:1px solid rgba(139,203,210,.2);border-radius:50%;object-fit:contain;background:radial-gradient(circle,rgba(73,142,149,.14),rgba(4,10,14,.72))}
      .world-proof-pet-fallback{display:grid;width:49px;height:49px;place-items:center;border:1px solid rgba(139,203,210,.2);border-radius:50%;color:#7fa1a6;background:rgba(4,10,14,.72);font:800 10px/1 system-ui,sans-serif}
      .world-proof-report{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:11px 0 14px}
      .world-proof-report div{min-width:0;padding:9px;border:1px solid rgba(135,193,200,.14);background:rgba(255,255,255,.025)}
      .world-proof-report dt{color:#77969b;font:800 9px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .world-proof-report dd{margin:5px 0 0;color:#dcebec;font-size:12px;font-weight:700;overflow-wrap:anywhere}
      .world-proof-intent{margin:9px 0;padding:10px;border-left:2px solid #79bfc5;background:rgba(29,90,98,.1);color:#dbecee;font-size:12px}
      .world-proof-intent.is-obscured{border-color:#8e849b;color:#c6bdcf;background:rgba(86,69,99,.1)}
      .world-proof-meters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0}
      .world-proof-meter{padding:9px;border:1px solid rgba(139,196,202,.14);background:rgba(255,255,255,.025)}
      .world-proof-meter span{display:block;color:#87a3a7;font:800 9px/1 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}
      .world-proof-pips{display:flex;gap:4px;margin-top:7px}
      .world-proof-pips i{width:12px;height:5px;border-radius:2px;background:#20353a}
      .world-proof-pips i.is-on{background:#72c3c8;box-shadow:0 0 7px rgba(100,213,218,.24)}
      .world-proof-combat-stage{position:relative;min-height:226px;margin:8px 0;border:1px solid rgba(133,194,201,.16);overflow:hidden;background:radial-gradient(circle at 50% 70%,rgba(40,99,108,.14),rgba(3,8,12,.88))}
      .world-proof-static-contact{position:absolute;inset:0;display:grid;grid-template-columns:1fr auto 1fr;gap:9px;align-items:center;padding:14px}
      .world-proof-static-contact img{display:block;width:min(96px,100%);height:126px;margin:auto;object-fit:contain;filter:drop-shadow(0 8px 12px rgba(0,0,0,.5))}
      .world-proof-static-contact span{color:#7fa4a8;font:800 10px/1 system-ui,sans-serif;letter-spacing:.08em}
      .world-proof-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:11px}
      .world-proof-actions .world-exploration-action{min-height:42px;padding:7px;font-size:11px}
      .world-proof-proof-list{display:grid;gap:7px;margin:10px 0;padding:0;list-style:none}
      .world-proof-proof-list li{display:flex;justify-content:space-between;gap:8px;padding:9px;border:1px solid rgba(137,190,196,.14);color:#9eb3b7;background:rgba(255,255,255,.024);font-size:12px}
      .world-proof-proof-list li.is-earned{color:#a9ddbd;border-color:rgba(96,188,133,.25)}
      .world-proof-anchor{padding:12px;border:1px solid rgba(95,188,133,.24);background:linear-gradient(135deg,rgba(38,109,73,.14),rgba(15,43,38,.08))}
      .world-proof-anchor h3{margin:0 0 7px;color:#9dd6b5}
      .world-proof-anchor-level{margin:0;color:#e2f4e8;font-weight:800;letter-spacing:.08em}
      .world-proof-route-layer{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:visible}
      .world-proof-route-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
      .world-proof-route-segment{fill:none;stroke:#5a7479;stroke-width:5;stroke-linecap:round;stroke-dasharray:12 16;opacity:.34;vector-effect:non-scaling-stroke}
      .world-proof-route-segment.is-traced{stroke:#72c5ca;stroke-dasharray:9 8;opacity:.62}
      .world-proof-route-segment.is-proven{stroke:#7ac49a;stroke-dasharray:none;opacity:.74}
      .world-proof-route-segment.is-anchored{stroke:#8bd3aa;stroke-width:6;stroke-dasharray:none;opacity:.82}
      .world-proof-route-node{fill:#102329;stroke:#789aa0;stroke-width:3;opacity:.84;vector-effect:non-scaling-stroke}
      .world-proof-route-node.is-complete{fill:#294d3d;stroke:#8bcaa5}
      .world-proof-scout-token{position:absolute;width:46px;height:46px;transform:translate(-50%,-50%) scale(var(--ah-map-marker-ui-scale,1));transform-origin:center;transition:left .82s cubic-bezier(.22,.7,.24,1),top .82s cubic-bezier(.22,.7,.24,1);will-change:left,top}
      .world-proof-scout-frame{position:absolute;inset:0;border:1px solid rgba(129,222,224,.7);border-radius:50%;background:radial-gradient(circle,rgba(56,131,139,.2),rgba(3,9,13,.92));box-shadow:0 0 0 3px rgba(3,9,13,.7),0 0 15px rgba(89,198,205,.22);overflow:hidden}
      .world-proof-scout-visual,.world-proof-scout-visual>*,.world-proof-scout-visual canvas,.world-proof-scout-visual img{width:100%;height:100%;object-fit:contain}
      .world-proof-scout-visual{display:grid;place-items:center;border-radius:50%;overflow:hidden}
      .world-proof-scout-name{position:absolute;left:50%;top:calc(100% + 5px);transform:translateX(-50%);max-width:96px;padding:3px 5px;color:#d9f2f3;background:rgba(2,8,11,.78);font:800 8px/1 system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .world-proof-sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}
      @media(max-width:360px){
        .world-proof-report,.world-proof-meters{grid-template-columns:1fr}
        .world-proof-card{padding:9px}
        .world-proof-actions{gap:5px}
        .world-proof-actions .world-exploration-action{font-size:10px}
      }
      @media(prefers-reduced-motion:reduce){
        .world-proof-scout-token{transition:opacity .08s linear}
        .world-proof-route-segment{animation:none}
      }
    `;
    document.head.appendChild(style);
  }

  function stepState(phase, step) {
    const order = {
      LOCKED: 0,
      ELIGIBLE: 0,
      SCOUT_SELECTION: 0,
      TRACE_CHOICE: 0,
      ENCOUNTER_READY: 1,
      ENCOUNTER_ACTIVE: 1,
      ANCHOR_CHOICE: 2,
      UNLOCKED: 3,
    };
    const current = order[phase] ?? 0;
    if (phase === "UNLOCKED" || step < current) return "complete";
    if (step === current) return "current";
    return "pending";
  }

  function stepsHtml(phase) {
    return `<ol class="world-proof-steps" aria-label="Path of Proof progress">${["TRACE", "SURVIVE", "ANCHOR"].map((label, index) => (
      `<li data-step-state="${stepState(phase, index)}">${label}</li>`
    )).join("")}</ol>`;
  }

  function selectedPetHtml(path) {
    const pet = object(path?.selectedScout);
    if (!pet) return "No scout assigned";
    return esc(pet.name || "Pet");
  }

  function checkedAttr(condition) {
    return condition ? " checked" : "";
  }

  function petCards(path) {
    const pets = Array.isArray(path?.ownedPets) ? path.ownedPets : [];
    const selected = String(path?.selectedScout?.petId || path?.activePetId || pets[0]?.id || "");
    if (!pets.length) {
      return '<p class="world-proof-copy">No owned pet is available. Open My Pets after adopting a pet, then return to this route.</p>';
    }
    return `<div class="world-proof-selection" role="radiogroup" aria-label="Owned scout pets">${pets.map((pet) => {
      const id = String(pet?.id || pet?.petId || "");
      const image = String(pet?.imageUrl || "");
      return `<label class="world-proof-card"><input type="radio" name="worldProofScout" value="${esc(id)}"${checkedAttr(id === selected)}><span aria-hidden="true">${image ? `<img class="world-proof-pet-thumb" src="${esc(image)}" alt="" loading="lazy" decoding="async">` : '<span class="world-proof-pet-fallback">SIGNAL</span>'}</span><span class="world-proof-card-copy"><b>${esc(pet?.name || "Pet")}</b><span>${esc(pet?.isActive ? "Current active pet" : (pet?.type || "Owned pet"))}</span></span></label>`;
    }).join("")}</div>`;
  }

  function traceCards(path) {
    const choices = Array.isArray(path?.config?.traceChoices) ? path.config.traceChoices : [];
    return `<div class="world-proof-selection" role="radiogroup" aria-label="Signal route">${choices.map((choice, index) => (
      `<label class="world-proof-card"><input type="radio" name="worldProofTrace" value="${esc(choice.id)}"${checkedAttr(index === 0)}><span class="world-proof-card-copy"><b>${esc(choice.title)}</b><span>${esc(choice.body)}</span></span></label>`
    )).join("")}</div>`;
  }

  function protocolCards(path) {
    const protocols = Array.isArray(path?.config?.anchorProtocols) ? path.config.anchorProtocols : [];
    return `<div class="world-proof-selection" role="radiogroup" aria-label="Relay anchor protocol">${protocols.map((protocol, index) => (
      `<label class="world-proof-card"><input type="radio" name="worldProofProtocol" value="${esc(protocol.id)}"${checkedAttr(index === 0)}><span class="world-proof-card-copy"><b>${esc(protocol.title)}</b><span>${esc(protocol.body)}</span></span></label>`
    )).join("")}</div>`;
  }

  function pips(value) {
    const count = Math.max(0, Math.min(3, Math.floor(number(value))));
    return `<span class="world-proof-pips" aria-hidden="true">${[1, 2, 3].map((index) => `<i class="${index <= count ? "is-on" : ""}"></i>`).join("")}</span>`;
  }

  function meterHtml(label, value) {
    return `<div class="world-proof-meter"><span>${esc(label)}: ${Math.max(0, Math.min(3, number(value)))}</span>${pips(value)}</div>`;
  }

  function reportHtml(path) {
    const encounter = object(path?.encounter);
    const points = pathPointList(path);
    const checkpoint = checkpointIndex(path);
    const checkpointLabel = points[Math.max(0, checkpoint)]?.label || (checkpoint >= 0 ? `Checkpoint ${checkpoint + 1}` : "Route origin");
    return `<dl class="world-proof-report"><div><dt>Scout</dt><dd>${selectedPetHtml(path)}</dd></div><div><dt>Route</dt><dd>${esc(path?.traceChoice?.title || "Signal not selected")}</dd></div><div><dt>Checkpoint</dt><dd>${esc(checkpointLabel)}</dd></div>${encounter ? `<div><dt>Contact</dt><dd>${esc(path?.config?.encounter?.enemyName || "Relay contact")}</dd></div><div><dt>Attempt</dt><dd>${Math.max(1, number(encounter.attempt, 1))}</dd></div>` : ""}</dl>`;
  }

  function combatHtml(path, busy) {
    const encounter = object(path?.encounter) || {};
    const scout = object(path?.selectedScout) || {};
    const enemy = object(path?.config?.encounter) || {};
    const scoutImage = String(scout.imageUrl || "");
    const enemyImage = String(enemy.enemyImageUrl || "");
    const intent = String(encounter.enemyIntent || "SIGNAL SHIFT").replace(/_/g, " ");
    const latest = object(encounter.latestRound);
    return `
      <div id="worldProofCombatStage" class="world-proof-combat-stage" data-operation-id="${esc(path.pathId || "")}" role="img" aria-label="${esc(`Tactical contact. ${scout.name || "Scout"} against ${enemy.enemyName || "relay contact"}.`)}">
        <div class="world-proof-static-contact" aria-hidden="true">
          <span>${scoutImage ? `<img src="${esc(scoutImage)}" alt="">` : "SCOUT SIGNAL"}</span>
          <span>CONTACT</span>
          <span>${enemyImage ? `<img src="${esc(enemyImage)}" alt="">` : "CORRUPTED SIGNAL"}</span>
        </div>
      </div>
      <p class="world-proof-intent ${encounter.intentObscured ? "is-obscured" : ""}"><strong>Enemy intent:</strong> ${esc(intent)}</p>
      <p class="world-proof-copy">Round ${Math.max(1, number(encounter.round, 1))} / ${Math.max(1, number(encounter.roundCount, 3))}${latest ? ` · Last response: ${esc(latest.correct ? "counter held" : "control lost")}` : ""}</p>
      <div class="world-proof-meters">${meterHtml("Stability", encounter.enemyStability)}${meterHtml("Control", encounter.operationControl)}</div>
      <div class="world-proof-actions">${["STRIKE", "GUARD", "EXPLOIT"].map((action) => (
        `<button class="world-exploration-action" type="button" data-we-path-action="TACTICAL_ACTION" data-tactical-action="${action}"${busy ? " disabled" : ""}>${action}</button>`
      )).join("")}</div>
    `;
  }

  function anchorRecordHtml(path) {
    const anchor = object(path?.regionalAnchor);
    if (!anchor) return "";
    const slots = Array.isArray(anchor.proofSlots) ? anchor.proofSlots : [];
    return `<section class="world-proof-anchor" aria-label="Regional Anchor record"><h3>${esc(anchor.name || "RELAY ANCHOR")}</h3><p class="world-proof-anchor-level">${esc(anchor.levelLabel || "SIGNAL FOUND")}</p><dl class="world-proof-report"><div><dt>Initial protocol</dt><dd>${esc(anchor.protocol?.title || path?.anchorProtocol?.title || "Recorded")}</dd></div><div><dt>Anchor level</dt><dd>${Math.max(1, number(anchor.level, 1))}</dd></div></dl><ul class="world-proof-proof-list">${slots.map((slot) => `<li class="${slot.earned ? "is-earned" : ""}"><span>${esc(slot.earned ? slot.label : "Unknown proof")}</span><b>${slot.earned ? "RECORDED" : "UNRECOVERED"}</b></li>`).join("")}</ul><p class="world-proof-copy">This initial protocol is stored for future compatible Relay Fringe activities. No cross-game modifier is active in this release.</p></section>`;
  }

  function actionButton(action, label, busy, busyLabel) {
    return `<button class="world-exploration-action" type="button" data-we-path-action="${esc(action)}"${busy ? " disabled" : ""}>${esc(busy ? (busyLabel || "Resolving…") : label)}</button>`;
  }

  function phaseContent({ sector, path, phase, busy, busyLabel, requirementsHtml, fragmentRecoveryHtml }) {
    const requirements = typeof requirementsHtml === "function" ? requirementsHtml(sector) : "";
    const recovery = typeof fragmentRecoveryHtml === "function" ? fragmentRecoveryHtml(sector) : "";
    const encounter = object(path.encounter);
    if (phase === "LOCKED") {
      const reason = String((sector?.blockingReasons || [])[0] || "The signal remains outside verified Pack reach.").replace(/_/g, " ");
      return `<p class="world-proof-copy">The route cannot be trusted yet. Complete the listed eligibility proof before attempting contact.</p><h3>Requirements</h3>${requirements}${recovery}<button class="world-exploration-action" type="button" disabled>${esc(reason.toUpperCase())}</button>`;
    }
    if (phase === "ELIGIBLE") {
      const cost = Math.max(0, number(sector?.itemRequirements?.map_key_fragment));
      return `<p class="world-proof-copy"><strong>Proof before belief.</strong> The signal can now be traced, but the sector is not yet open.</p><h3>Requirements</h3>${requirements}<p class="world-exploration-confirmation">Beginning consumes ${cost} map key fragment${cost === 1 ? "" : "s"} once. Relay-7 lifetime credits are not spent.</p>${actionButton("BEGIN", "BEGIN TRACE", busy, busyLabel || "Tracing…")}`;
    }
    if (phase === "SCOUT_SELECTION") {
      return `<p class="world-proof-copy">Choose one of your owned pets to carry the Pack signal through the damaged route. The scout remains available elsewhere.</p>${petCards(path)}${actionButton("SELECT_SCOUT", "ASSIGN SCOUT", busy, busyLabel || "Assigning…")}`;
    }
    if (phase === "TRACE_CHOICE") {
      const intro = object(path.config?.traceIntroduction) || {};
      return `${reportHtml(path)}<p class="world-proof-copy"><strong>${esc(intro.title)}</strong></p><p class="world-proof-copy">${esc(intro.body)}</p>${traceCards(path)}${actionButton("CHOOSE_TRACE", "FOLLOW SIGNAL", busy, busyLabel || "Tracing…")}`;
    }
    if (phase === "ENCOUNTER_READY") {
      const defeated = encounter?.result === "FAILED_OPERATION" || encounter?.status === "defeat";
      return `${reportHtml(path)}${defeated ? '<p class="world-proof-intent is-obscured"><strong>Contact lost.</strong> The route and scout remain fixed. Re-enter when ready.</p>' : '<p class="world-proof-copy">The carrier terminates at a hostile relay signal. No timer remains between the Pack and contact.</p>'}${actionButton(defeated ? "RETRY_ENCOUNTER" : "START_ENCOUNTER", defeated ? "RETRY CONTACT" : "ENTER CONTACT", busy, busyLabel || "Resolving contact…")}`;
    }
    if (phase === "ENCOUNTER_ACTIVE") {
      return `${reportHtml(path)}${combatHtml(path, busy)}`;
    }
    if (phase === "ANCHOR_CHOICE") {
      return `${reportHtml(path)}<p class="world-proof-copy"><strong>ANCHOR THE RELAY</strong></p><p class="world-proof-copy">Choose the initial protocol through which this recovered route joins the Pack Network.</p>${protocolCards(path)}${actionButton("SELECT_ANCHOR_PROTOCOL", "ANCHOR RELAY", busy, busyLabel || "Anchoring…")}`;
    }
    if (phase === "UNLOCKED") {
      return `<p class="world-proof-copy"><strong>ROUTE PROVEN.</strong> The signal was traced, survived, and anchored into the Pack Network.</p>${reportHtml(path)}${anchorRecordHtml(path)}`;
    }
    return '<p class="world-proof-copy">Path state is unavailable.</p>';
  }

  function renderPanel(options = {}) {
    ensureStyles();
    const sector = options.sector;
    const path = pathFor(sector);
    const phase = phaseFor(sector);
    if (!path || !phase) return "";
    const sectorName = String(sector?.name || sector?.id || "Relay sector");
    return `
      <header class="world-exploration-panel-head">
        <span>WORLD EXPLORATION</span>
        <b class="world-proof-kicker">PATH OF PROOF</b>
        <h2 id="worldExplorationTitle">${esc(sectorName)}</h2>
        <p class="world-exploration-status" data-status="${esc(phase.toLowerCase())}">${esc(STATUS[phase] || phase)}</p>
      </header>
      <div class="world-exploration-panel-body">
        ${stepsHtml(phase)}
        ${phaseContent({
          sector,
          path,
          phase,
          busy: !!options.busy,
          busyLabel: String(options.busyLabel || ""),
          requirementsHtml: options.requirementsHtml,
          fragmentRecoveryHtml: options.fragmentRecoveryHtml,
        })}
        <p class="world-exploration-message" aria-live="polite">${esc(options.message || "")}</p>
      </div>
    `;
  }

  function findChecked(root, name) {
    try {
      return root?.querySelector?.(`input[name="${name}"]:checked`)?.value || "";
    } catch (_) {
      return "";
    }
  }

  function buildAction(button, root) {
    const action = String(button?.dataset?.wePathAction || "").trim().toUpperCase();
    if (!action) return null;
    if (action === "SELECT_SCOUT") {
      const petId = findChecked(root, "worldProofScout");
      return petId ? { action, payload: { petId } } : { error: "Select an owned scout." };
    }
    if (action === "CHOOSE_TRACE") {
      const traceChoiceId = findChecked(root, "worldProofTrace");
      return traceChoiceId ? { action, payload: { traceChoiceId } } : { error: "Select a signal route." };
    }
    if (action === "TACTICAL_ACTION") {
      const tacticalAction = String(button?.dataset?.tacticalAction || "").toUpperCase();
      const encounter = object(runtime.deps.getSelectedSector?.()?.pathOfProof?.encounter);
      return tacticalAction
        ? { action, payload: { tacticalAction, expectedRound: Math.max(1, number(encounter?.round, 1)) } }
        : { error: "Tactical action is unavailable." };
    }
    if (action === "SELECT_ANCHOR_PROTOCOL") {
      const protocolId = findChecked(root, "worldProofProtocol");
      return protocolId ? { action, payload: { protocolId } } : { error: "Select an anchor protocol." };
    }
    return { action, payload: {} };
  }

  function destroyTacticalStage(reason = "") {
    runtime.panelGeneration += 1;
    runtime.tacticalHydration = null;
    if (!runtime.tacticalMounted) return;
    runtime.tacticalMounted = false;
    try {
      global.EliteCombatStage?.destroy?.();
    } catch (error) {
      runtime.deps.log?.("path tactical destroy failed", reason, error?.message || error);
    }
  }

  function tacticalConfig(path) {
    const encounter = object(path?.encounter) || {};
    const scout = object(path?.selectedScout) || {};
    const enemy = object(path?.config?.encounter) || {};
    return {
      operationId: String(path?.pathId || ""),
      round: Math.max(1, number(encounter.round, 1)),
      roundCount: Math.max(1, number(encounter.roundCount, 3)),
      planLabel: String(path?.traceChoice?.title || "Proven route"),
      player: {
        src: String(scout.imageUrl || ""),
        displayName: String(scout.name || "Scout"),
      },
      enemy: {
        src: String(enemy.enemyImageUrl || ""),
        displayName: String(enemy.enemyName || "Corrupted Relay Sentinel"),
      },
      enemyIntent: String(encounter.enemyIntent || "SIGNAL_SHIFT"),
      enemyStability: number(encounter.enemyStability),
      operationControl: number(encounter.operationControl),
      reducedMotion: prefersReducedMotion(),
    };
  }

  function installImageFallbacks(root) {
    root?.querySelectorAll?.("img").forEach((image) => {
      image.addEventListener("error", () => {
        image.hidden = true;
      }, { once: true });
    });
  }

  function afterPanelRender(options = {}) {
    const sector = options.sector;
    const panel = options.panel;
    const path = pathFor(sector);
    const phase = phaseFor(sector);
    installImageFallbacks(panel);
    if (!path || phase !== "ENCOUNTER_ACTIVE" || !panel?.isConnected || options.panelOpen === false) {
      destroyTacticalStage("phase_or_panel");
      return Promise.resolve(false);
    }
    const host = panel.querySelector?.("#worldProofCombatStage");
    if (!host || host.dataset.operationId !== String(path.pathId || "")) {
      destroyTacticalStage("host_mismatch");
      return Promise.resolve(false);
    }
    const generation = ++runtime.panelGeneration;
    const task = (async () => {
      try {
        const ensureLoaded = global.ensureEliteCombatStageLoaded || global.AHBootLoaders?.ensureEliteCombatStageLoaded;
        if (typeof ensureLoaded !== "function") throw new Error("Tactical renderer loader is unavailable");
        await ensureLoaded(runtime.deps.apiPost, runtime.deps.tg, runtime.deps.dbg);
        if (
          generation !== runtime.panelGeneration
          || !runtime.mapVisible
          || !host.isConnected
          || host.dataset.operationId !== String(path.pathId || "")
        ) return false;
        const mounted = await global.EliteCombatStage?.mount?.(host, tacticalConfig(path));
        runtime.tacticalMounted = !!mounted;
        return !!mounted;
      } catch (error) {
        runtime.deps.log?.("path tactical hydration failed; DOM fallback retained", error?.message || error);
        if (generation === runtime.panelGeneration && runtime.tacticalMounted) {
          try { global.EliteCombatStage?.destroy?.(); } catch (_) {}
          runtime.tacticalMounted = false;
        }
        return false;
      }
    })();
    runtime.tacticalHydration = task;
    task.finally(() => {
      if (runtime.tacticalHydration === task) runtime.tacticalHydration = null;
    });
    return task;
  }

  function pathPointList(path) {
    const config = object(path?.config) || {};
    return [
      object(config.origin),
      ...(Array.isArray(config.checkpoints) ? config.checkpoints.map(object) : []),
      object(config.destination),
    ].filter((point) => point && Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y)));
  }

  function checkpointIndex(path) {
    const phase = String(path?.phase || "").toUpperCase();
    const lastIndex = Math.max(0, pathPointList(path).length - 1);
    const contactIndex = Math.max(1, lastIndex - 1);
    if (!path?.selectedScout) return -1;
    if (phase === "TRACE_CHOICE" || phase === "SCOUT_SELECTION") return 0;
    if (phase === "ENCOUNTER_READY") {
      return path?.encounter?.result === "FAILED_OPERATION" || number(path?.encounter?.attempt) > 0 ? contactIndex : 1;
    }
    if (phase === "ENCOUNTER_ACTIVE") return contactIndex;
    if (phase === "ANCHOR_CHOICE" || phase === "UNLOCKED") return lastIndex;
    return -1;
  }

  function segmentClass(index, checkpoint, phase) {
    if (phase === "UNLOCKED") return "is-anchored";
    if (index < checkpoint) return index + 1 === checkpoint ? "is-traced" : "is-proven";
    return "";
  }

  function destroyRoute() {
    runtime.routeGeneration += 1;
    if (runtime.routeFrame) {
      try { global.cancelAnimationFrame(runtime.routeFrame); } catch (_) {}
      runtime.routeFrame = 0;
    }
    try { runtime.routePetSprite?.destroy?.(); } catch (_) {}
    runtime.routePetSprite = null;
    try {
      document.querySelectorAll(`.${ROUTE_CLASS}`).forEach((node) => node.remove());
    } catch (_) {}
  }

  function hydrateRoutePet(token, pet, generation) {
    if (!token?.isConnected || !pet?.spriteSheetUrl || !object(pet?.sprite)) return;
    const ensureLoaded = global.ensurePetSpriteLoaded || global.AHBootLoaders?.ensurePetSpriteLoaded;
    if (typeof ensureLoaded !== "function") return;
    Promise.resolve(ensureLoaded()).then(() => {
      if (generation !== runtime.routeGeneration || !runtime.mapVisible || !token.isConnected) return;
      if (!global.PetSprite?.hasSprite?.({
        spriteSheetUrl: pet.spriteSheetUrl,
        sprite: pet.sprite,
      })) return;
      const host = token.querySelector(".world-proof-scout-visual");
      if (!host) return;
      try {
        runtime.routePetSprite?.destroy?.();
        runtime.routePetSprite = global.PetSprite.mount(host, {
          name: pet.name,
          img: pet.imageUrl,
          spriteSheetUrl: pet.spriteSheetUrl,
          sprite: pet.sprite,
        }, {
          state: "idle",
          className: "world-proof-scout-visual",
          fallbackUrl: pet.imageUrl,
          alt: pet.name || "Scout",
        });
      } catch (_) {
        runtime.routePetSprite = null;
      }
    }).catch(() => {});
  }

  function renderRoute(options = {}) {
    ensureStyles();
    destroyRoute();
    const host = options.host;
    const sector = options.sector;
    const path = pathFor(sector);
    if (!host || !path || !isPathSector(sector) || !runtime.mapVisible) return null;
    const points = pathPointList(path);
    if (points.length < 4) return null;
    const bounds = object(options.projection?.worldBounds) || { width: 3200, height: 1800 };
    const width = Math.max(1, number(bounds.width, 3200));
    const height = Math.max(1, number(bounds.height, 1800));
    const checkpoint = Math.max(-1, Math.min(points.length - 1, checkpointIndex(path)));
    const previousPath = pathFor(options.previousSector);
    const previousCheckpoint = previousPath?.pathId === path.pathId ? checkpointIndex(previousPath) : checkpoint;
    const layer = document.createElement("div");
    layer.className = ROUTE_CLASS;
    layer.dataset.pathId = String(path.pathId || "");
    layer.dataset.phase = String(path.phase || "");
    layer.setAttribute("aria-hidden", "true");
    const segments = points.slice(0, -1).map((point, index) => {
      const next = points[index + 1];
      return `<line class="world-proof-route-segment ${segmentClass(index, checkpoint, String(path.phase || ""))}" x1="${number(point.x)}" y1="${number(point.y)}" x2="${number(next.x)}" y2="${number(next.y)}"></line>`;
    }).join("");
    const nodes = points.map((point, index) => `<circle class="world-proof-route-node ${index <= checkpoint ? "is-complete" : ""}" cx="${number(point.x)}" cy="${number(point.y)}" r="${index === points.length - 1 ? 13 : 9}"></circle>`).join("");
    layer.innerHTML = `<svg class="world-proof-route-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">${segments}${nodes}</svg>`;

    const pet = object(path.selectedScout);
    let token = null;
    if (pet && checkpoint >= 0) {
      token = document.createElement("div");
      token.className = "world-proof-scout-token";
      const initialIndex = Math.max(0, Math.min(points.length - 1, previousCheckpoint));
      const initial = points[initialIndex] || points[checkpoint];
      token.style.left = `${(number(initial.x) / width) * 100}%`;
      token.style.top = `${(number(initial.y) / height) * 100}%`;
      token.innerHTML = `<span class="world-proof-scout-frame"><span class="world-proof-scout-visual">${pet.imageUrl ? `<img src="${esc(pet.imageUrl)}" alt="">` : '<span class="world-proof-pet-fallback">SIGNAL</span>'}</span></span><span class="world-proof-scout-name">${esc(pet.name || "Scout")}</span><span class="world-proof-sr-only">${esc(`${pet.name || "Scout"}, current Path checkpoint ${checkpoint + 1}`)}</span>`;
      layer.appendChild(token);
    }
    host.appendChild(layer);
    const generation = runtime.routeGeneration;
    installImageFallbacks(layer);
    if (token) hydrateRoutePet(token, pet, generation);
    if (token && previousCheckpoint !== checkpoint && !prefersReducedMotion() && options.animate !== false) {
      const target = points[checkpoint];
      void token.offsetWidth;
      runtime.routeFrame = global.requestAnimationFrame(() => {
        runtime.routeFrame = 0;
        if (generation !== runtime.routeGeneration || !token.isConnected) return;
        token.style.left = `${(number(target.x) / width) * 100}%`;
        token.style.top = `${(number(target.y) / height) * 100}%`;
      });
    } else if (token) {
      const target = points[checkpoint];
      token.style.left = `${(number(target.x) / width) * 100}%`;
      token.style.top = `${(number(target.y) / height) * 100}%`;
    }
    return layer;
  }

  async function playCanonicalRound(previousSector, nextSector) {
    const previousPath = pathFor(previousSector);
    const nextPath = pathFor(nextSector);
    const before = object(previousPath?.encounter);
    const after = object(nextPath?.encounter);
    if (!before || !after || !nextPath?.pathId || nextPath.phase !== "ENCOUNTER_ACTIVE") return false;
    const beforeLog = Array.isArray(before.roundLog) ? before.roundLog : [];
    const afterLog = Array.isArray(after.roundLog) ? after.roundLog : [];
    if (afterLog.length !== beforeLog.length + 1) return false;
    const latest = object(afterLog[afterLog.length - 1]);
    if (!latest) return false;
    try {
      const hydrated = runtime.tacticalHydration ? await runtime.tacticalHydration : runtime.tacticalMounted;
      if (!hydrated || !runtime.tacticalMounted) return false;
      return !!(await global.EliteCombatStage?.playRound?.({
        operationId: String(nextPath.pathId),
        round: number(latest.round, before.round),
        nextRound: number(after.round, latest.round),
        action: String(latest.action || ""),
        enemyIntent: String(latest.enemyIntent || before.enemyIntent || "SIGNAL_SHIFT"),
        nextEnemyIntent: String(after.enemyIntent || "SIGNAL_SHIFT"),
        correct: !!latest.correct,
        previousEnemyStability: number(latest.stabilityBefore, before.enemyStability),
        enemyStability: number(latest.stabilityAfter, after.enemyStability),
        previousOperationControl: number(latest.controlBefore, before.operationControl),
        operationControl: number(latest.controlAfter, after.operationControl),
        stabilityDelta: number(latest.stabilityAfter) - number(latest.stabilityBefore),
        controlDelta: number(latest.controlAfter) - number(latest.controlBefore),
      }));
    } catch (error) {
      runtime.deps.log?.("path tactical animation skipped", error?.message || error);
      return false;
    }
  }

  function setMapVisible(visible) {
    runtime.mapVisible = !!visible;
    if (!runtime.mapVisible) {
      destroyTacticalStage("map_hidden");
      destroyRoute();
    }
  }

  function init(deps = {}) {
    runtime.deps = { ...runtime.deps, ...deps };
    ensureStyles();
    return API;
  }

  function destroy() {
    destroyTacticalStage("destroy");
    destroyRoute();
  }

  const API = {
    init,
    isPathSector,
    phaseFor,
    renderPanel,
    afterPanelRender,
    buildAction,
    renderRoute,
    playCanonicalRound,
    destroyTacticalStage,
    destroyRoute,
    setMapVisible,
    destroy,
    __test: {
      checkpointIndex,
      pathPointList,
      stepState,
      segmentClass,
      prefersReducedMotion,
    },
  };

  global.WorldExplorationPath = API;
})(window);
