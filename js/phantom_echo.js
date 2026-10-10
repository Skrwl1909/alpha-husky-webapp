// Alpha Husky Phantom Echo P0-A. Cosmetic-only ownership preview; no trading.
(function (global) {
  'use strict';
  const ICON = '/images/map/phantom_node/sigil_rogue_byte.png'; // EXISTING Alpha art, provisional
  const state = { apiPost: null, data: null, petId: '', onChange: null, busy: false };
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const latest = () => state.data?.enabled === true ? state.data : null;
  const owned = () => latest()?.owned || [];
  const equippedFor = (petId) => latest()?.equipped_by_pet?.[petId] || null;
  const hasOwned = () => owned().some(e => e?.variant === 'ghost_relay');

  function notify(msg) {
    if (typeof global.toast === 'function') global.toast(msg);
    else if (global.DBG) console.info('[PhantomEcho]', msg);
  }
  function ensureDialog() {
    let panel = document.getElementById('phantomEchoP0');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'phantomEchoP0';
    panel.className = 'pe-mask';
    panel.hidden = true;
    panel.innerHTML = '<div class="pe-panel" role="dialog" aria-modal="true" aria-label="Phantom Echo"><button class="pe-close" type="button" data-pe-close aria-label="Close">×</button><div class="pe-body"></div></div>';
    panel.addEventListener('click', e => { if (e.target === panel || e.target.closest('[data-pe-close]')) close(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); e.stopPropagation(); close(); }
    });
    document.body.appendChild(panel);
    return panel;
  }
  function renderDialog() {
    const mask = ensureDialog();
    const content = mask.querySelector('.pe-body');
    const chosen = equippedFor(state.petId);
    const entry = owned().find(e => e?.echo_id === chosen) || owned()[0];
    if (!entry) { content.innerHTML = '<p>No Phantom Echo owned.</p>'; return; }
    const isEquipped = chosen === entry.echo_id;
    content.innerHTML = `<div class="pe-kicker">PHANTOM ECHO / COMPANION IMPRINT</div>
       <div class="pe-art"><div class="pe-halo"></div><img src="${ICON}" alt="Rogue Byte sigil"></div>
       <h2>GHOST RELAY</h2><p class="pe-sub">Recovered from Phantom Frontline · ${esc(entry.season || 'S01')}</p>
       <div class="pe-data"><span>PROPERTY</span><strong>COSMETIC ONLY</strong><span>COMBAT BONUS</span><strong>NONE</strong><span>IDENTIFIER</span><strong>${esc(entry.echo_id?.slice(0, 12) || '')}</strong></div>
       <p class="pe-disclaimer">Belongs to your account, not your Pet. No market or token transfers are active.</p>
       <button class="pe-action" type="button" data-pe-equip ${state.busy ? 'disabled' : ''}>${state.busy ? 'SAVING…' : isEquipped ? 'REMOVE ECHO' : 'EQUIP ON THIS PET'}</button>`;
    const button = content.querySelector('[data-pe-equip]');
    button?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); void equip(state.petId, isEquipped ? null : entry.echo_id); });
  }
  async function load() {
    if (!state.apiPost) return null;
    try {
      const value = await state.apiPost('/webapp/echo/state', {});
      state.data = value?.ok && value?.enabled === true ? value : null;
    } catch (_) { state.data = null; }
    return latest();
  }
  async function equip(petId, echoId) {
    if (state.busy || !latest() || !state.apiPost) return;
    state.busy = true;
    renderDialog();
    try {
      const run_id = typeof global.AH_makeRunId === 'function' ? global.AH_makeRunId('pe-equip', petId) : 'pe-equip-' + Date.now();
      const response = await state.apiPost('/webapp/echo/equip', { petId, echoId, run_id });
      if (!response?.ok) { notify('Echo update failed. Nothing changed.'); return; }
      state.data = response;
      if (typeof state.onChange === 'function') state.onChange();
      notify(echoId ? 'Ghost Relay equipped.' : 'Ghost Relay removed.');
    } catch (_) { notify('Echo update failed. Please try again.'); }
    finally { state.busy = false; renderDialog(); }
  }
  function openPet(petId, onChange) {
    if (!latest() || !hasOwned() || !petId) return;
    state.petId = String(petId);
    state.onChange = typeof onChange === 'function' ? onChange : null;
    const dialog = ensureDialog();
    dialog.hidden = false;
    renderDialog();
    dialog.querySelector('[data-pe-close]')?.focus();
  }
  function close() {
    const dialog = document.getElementById('phantomEchoP0');
    if (dialog) dialog.hidden = true;
    state.petId = '';
    state.onChange = null;
  }
  global.PhantomEcho = {
    init({apiPost} = {}) { if (typeof apiPost === 'function') state.apiPost = apiPost; },
    load, openPet, close,
    isAvailable: () => !!latest() && hasOwned(),
    equippedFor,
    hasOwned
  };
})(window);
