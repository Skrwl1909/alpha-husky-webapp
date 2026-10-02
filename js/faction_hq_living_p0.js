// Echo Wardens Living HQ P0 — visual/runtime layer over the authoritative HQ state.
(function(global){
  "use strict";
  const ROOT_ID="factionHQLivingP0";
  const RECOGNITION_KEY="ah_echo_hq_recognition_v1";
  const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canon=(v)=>String(v||"").toLowerCase().replace(/\s+/g,"_");
  const callsign=(detail)=>{
    const raw=detail?.callsign||global.PROFILE?.nickname||global.PLAYER_STATE?.profile?.nickname||detail?.playerName||"HOWLER";
    return String(raw||"HOWLER").trim().slice(0,20)||"HOWLER";
  };
  function remove(){
    document.getElementById(ROOT_ID)?.remove();
    document.getElementById("factionHQBack")?.classList.remove("hq-living-echo");
  }
  function recognitionSeen(){
    try{return localStorage.getItem(RECOGNITION_KEY)==="1"}catch(_){return false}
  }
  function markRecognitionSeen(){try{localStorage.setItem(RECOGNITION_KEY,"1")}catch(_){}}
  function mount(detail={}){
    const faction=canon(detail.faction||detail.fk);
    if(!(faction==="echo_wardens"||faction==="ew")){remove();return}
    const back=document.getElementById("factionHQBack");
    const modal=document.getElementById("factionHQModal");
    if(!back||!modal)return;
    remove();
    back.classList.add("hq-living-echo");
    const node=document.createElement("div");
    node.id=ROOT_ID;
    node.setAttribute("aria-label","Echo Wardens Living Headquarters");
    const name=callsign(detail);
    const frontState=detail.frontLive?String(detail.frontLabel||"ACTIVE"):"STABLE";
    const first=!recognitionSeen();
    node.innerHTML=`
      <div class="lhq-scene"></div>
      <div class="lhq-scan"></div>
      <div class="lhq-top">
        <div><div class="lhq-title">ECHO WARDENS · HQ LV ${esc(detail.level||1)}</div><div class="lhq-creed">REMEMBER</div></div>
        <button class="lhq-close" type="button" aria-label="Close HQ">×</button>
      </div>
      <div class="lhq-core"><img class="lhq-sigil" src="/images/factions/echo_wardens_80.webp" alt="" aria-hidden="true"></div>
      <div class="lhq-conduit c1"></div><div class="lhq-conduit c2"></div><div class="lhq-conduit c3"></div>
      <button class="lhq-front" type="button" aria-label="Open Current Front">
        <span class="lhq-front-copy"><span class="lhq-kicker">CURRENT FRONT</span><strong class="lhq-front-title">FACTION SIGNAL</strong><span class="lhq-front-state">${esc(frontState)}</span></span>
      </button>
      <div class="lhq-personal"><small>BOUND SIGNAL</small><strong>${esc(name)}</strong></div>
      ${first?`<div class="lhq-recognition"><div><small>SIGNAL RECOGNIZED</small><strong>WELCOME HOME, ${esc(name)}</strong></div></div>`:""}
    `;
    modal.insertBefore(node,document.getElementById("factionHQRoot")||modal.firstChild);
    node.querySelector(".lhq-close")?.addEventListener("click",()=>global.FactionHQ?.close?.());
    node.querySelector(".lhq-front")?.addEventListener("click",()=>global.FactionHQ?._switchView?.("front"));
    if(first)markRecognitionSeen();
  }
  global.addEventListener("ah:faction-hq-rendered",(event)=>mount(event.detail||{}));
  global.addEventListener("ah:faction-hq-closed",remove);
  global.FactionHQLivingP0={mount,remove};
})(window);