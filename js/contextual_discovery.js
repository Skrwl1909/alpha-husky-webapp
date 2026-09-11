(function (global) {
  "use strict";
  const KEY = "ah.contextualDiscovery.v1";
  let saved = { seen: 0, improved: false };
  try { saved = { ...saved, ...JSON.parse(global.localStorage.getItem(KEY) || "{}") }; } catch (_) {}
  let facts = {}, active = null, card = null, paused = false, probing = false, lastProbe = 0;
  const definitions = [
    { id: "stats", eligible: (f, i) => !!f.improved || !!(i.firstSignal?.eligible && i.firstSignal.state === "COMPLETED"), scout: "Your build grew stronger. Stats shows what changed.", destination: "stats", consumed: 1 },
    { id: "forge", eligible: f => !!f.forge, scout: "Your equipped gear has room to grow. The Forge can improve it with the materials you own.", destination: "forge", consumed: 2 },
    { id: "skin", eligible: f => !!f.skin, scout: "You own another look. Open Skins to make it yours.", destination: "skins", consumed: 4 },
    { id: "daily", eligible: f => !!f.daily, scout: "Looking for a daily trail? The Quest Board has activities to return to.", destination: "quests", consumed: 8 }
  ];
  function persist() { try { global.localStorage.setItem(KEY, JSON.stringify(saved)); } catch (_) {} }
  function coreComplete(inputs) {
    const fs = inputs?.firstSignal || inputs?.tutorial?.first_signal;
    const cp = inputs?.campaign, camp = cp?.campaign;
    if (!cp || cp.ok !== true) return false;
    if (!fs && cp.eligible !== false) return false;
    if (fs?.eligible && fs.state !== "COMPLETED") return false;
    if (cp.eligible && cp.show !== false && !camp?.markLeft) return false;
    return true;
  }
  function resolve(inputs, state, context, seen = saved.seen) {
    if (!coreComplete(inputs) || !context?.safe || context.blocked) return null;
    return definitions.find(d => !(seen & d.consumed) && d.eligible(state, inputs)) || null;
  }
  function visible(id) {
    const el = document.getElementById(id);
    return !!(el && !el.hidden && el.getClientRects().length && global.getComputedStyle(el).visibility !== "hidden");
  }
  function context() {
    const stack = global.AH_NAV?.stack;
    const top = stack?.length ? stack[stack.length - 1] : null;
    return {
      safe: document.visibilityState !== "hidden" && visible("hubBack") && (!top || top === "hubBack")
        && !["tacticalOpsRoot", "missionsModal", "campaignBack", "equipped-root"].some(visible)
        && !global.Onboarding?.isOpen?.() && !global.Awakening?.isOpen?.() && !global.Oath?.isOpen?.(),
      blocked: !global.StoryDelivery?.contextualDiscoveryReady?.()
        || !!(document.getElementById("ahScoutGuide")?.isConnected && document.getElementById("ahScoutGuide").dataset.beat !== "32")
    };
  }
  function observe(path, out) {
    if (!out || out.ok !== true) return;
    const data = out.data || out;
    if (path === "/webapp/forge/upgrade") { saved.improved = true; persist(); facts.forge = false; lastProbe = 0; }
    if (path === "/webapp/forge/state") facts.forge = Array.isArray(data.equipped) && data.equipped.some(it => it.key && it.canUpgrade === true && it.costNext && Number(it.stars) < Number(it.maxStars));
    if (path === "/webapp/skins") {
      const owned = Array.isArray(data.owned) ? data.owned : [];
      const equipped = data.equipped?.skin || data.active || "default";
      facts.skin = Array.isArray(data.skins) && data.skins.some(s => s.key && s.key !== "default" && s.key !== equipped && owned.includes(s.key)
        && !s.preview_only && s.acquisition !== "spins_only" && !["spins", "spins_only"].includes(s.unlock?.kind));
    }
    if (path === "/webapp/quests/state") {
      const board = data.board && !Array.isArray(data.board) ? data.board : data;
      facts.daily = [...(Array.isArray(board.quests) ? board.quests : []), ...(Array.isArray(board.board) ? board.board : [])]
        .some(q => ["daily", "daily_pack"].includes(q.category || q.type) && !["claimed", "cooldown", "done", "locked"].includes(q.status));
    }
    // Re-evaluate only the guide; never perform a gameplay action from a response.
    if (["/webapp/forge/upgrade", "/webapp/forge/state", "/webapp/skins", "/webapp/quests/state"].includes(path)) refresh();
  }
  async function probe() {
    if (probing || Date.now() - lastProbe < 60000) return;
    const api = global.S?.apiPost || global.apiPost;
    if (typeof api !== "function") return;
    probing = true; lastProbe = Date.now();
    const paths = [[2, "/webapp/forge/state"], [4, "/webapp/skins"], [8, "/webapp/quests/state"]];
    await Promise.allSettled(paths.filter(([bit]) => !(saved.seen & bit)).map(async ([, path]) => {
      try { observe(path, await api(path, {})); } catch (_) { /* unavailable means no discovery */ }
    }));
    probing = false;
  }
  function hide() { card?.remove(); }
  function dismiss() { if (active) { saved.seen |= active.consumed; persist(); } active = null; paused = true; hide(); }
  async function openDestination(destination) {
    if (destination === "stats") {
      const button = document.querySelector('#charBack [data-action="stats"]');
      if (!button || !global.Stats?.refresh) return false;
      global.HomeNav?.closeAll?.(); button.click(); return true;
    }
    const route = { forge: global.Forge, skins: global.Skins, quests: global.Quests }[destination];
    if (typeof route?.open !== "function") return false;
    global.HomeNav?.closeAll?.();
    return await route.open() !== false;
  }
  async function go() {
    const choice = active, inputs = global.StoryDelivery?.gatherInputs?.(), ctx = context();
    if (!choice || !coreComplete(inputs) || !ctx.safe || ctx.blocked) return false;
    // Check current availability again, without changing any unlock or owned item.
    const path = { forge: "/webapp/forge/state", skin: "/webapp/skins", daily: "/webapp/quests/state" }[choice.id];
    if (path) {
      const api = global.S?.apiPost || global.apiPost;
      try { const out = await api(path, {}); if (out?.ok !== true) return false; observe(path, out); } catch (_) { return false; }
    }
    const current = context();
    if (!current.safe || current.blocked || !choice.eligible({ ...facts, improved: saved.improved }, global.StoryDelivery.gatherInputs())) return false;
    const ok = await openDestination(choice.destination);
    if (ok) dismiss();
    return ok;
  }
  function refresh() {
    const ctx = context(), inputs = global.StoryDelivery?.gatherInputs?.();
    if (!ctx.safe) { hide(); if (!visible("hubBack")) { active = null; paused = false; } return; }
    if (ctx.blocked || !coreComplete(inputs)) { hide(); return; }
    if (!probing) void probe();
    if (paused) return;
    const state = { ...facts, improved: saved.improved };
    if (active && !active.eligible(state, inputs)) { active = null; hide(); }
    const next = active || resolve(inputs, state, ctx);
    const host = document.getElementById("hubStoryRoot");
    if (!next || !host || !global.Missions?.renderScoutVoice) return;
    if (!card) {
      card = document.createElement("aside"); card.id = "ahContextualDiscovery";
      card.className = "ah-scout-context"; card.setAttribute("aria-label", "Scout discovery");
    }
    if (card.dataset.discovery !== next.id) {
      card.dataset.discovery = next.id;
      card.innerHTML = global.Missions.renderScoutVoice(next.scout)
        + '<div class="ah-context-actions"><button type="button" data-context-go>GO</button><button type="button" data-context-dismiss>Dismiss</button></div><small role="status"></small>';
      card.querySelector("[data-context-dismiss]").onclick = dismiss;
      card.querySelector("[data-context-go]").onclick = async function () {
        this.disabled = true;
        try { if (!await go()) card.querySelector('[role="status"]').textContent = "Unavailable right now. Try later."; }
        catch (_) { card.querySelector('[role="status"]').textContent = "Could not open. Try later."; }
        finally { this.disabled = false; }
      };
    }
    active = next; saved.seen |= next.consumed; persist();
    const secondaryScout = document.getElementById("ahScoutGuide");
    if (secondaryScout?.dataset.beat === "32") secondaryScout.remove();
    host.appendChild(card);
  }
  function reset() { saved = { seen: 0, improved: false }; facts = {}; active = null; paused = false; lastProbe = 0; hide(); try { global.localStorage.removeItem(KEY); } catch (_) {} }
  function init() {
    const style = document.createElement("style");
    style.textContent = '.ah-scout-context{margin-top:12px;padding:10px;border:1px solid #91e2ff2e;border-radius:14px;background:#08121df0;color:#eef8ff}.ah-scout-context .m-debrief-voice{display:flex;gap:10px;align-items:flex-start}.ah-scout-context .m-debrief-avatar,.ah-scout-context .m-debrief-avatar-fallback{width:44px;height:44px;flex:0 0 44px;border-radius:12px;object-fit:cover}.ah-scout-context .m-debrief-copy{min-width:0}.ah-scout-context .m-report-label{font-size:11px;letter-spacing:.1em;font-weight:900;color:#9fd6ff}.ah-scout-context .m-debrief-line{font-size:13px;line-height:1.4}.ah-context-actions{display:flex;justify-content:flex-end;gap:12px}.ah-context-actions button{min-height:44px;padding:8px 12px;border:0;background:transparent;color:#bdd7e8;cursor:pointer}';
    document.head.appendChild(style);
    global.StoryDelivery?.subscribe(refresh);
    const hub = document.getElementById("hubBack");
    if (hub) new MutationObserver(refresh).observe(hub, { attributes: true, attributeFilter: ["style", "data-open"] });
    document.addEventListener("visibilitychange", refresh);
    refresh();
  }
  global.ContextualDiscovery = { resolve, coreComplete, observe, refresh, go, dismiss, openDestination, reset };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})(window);
