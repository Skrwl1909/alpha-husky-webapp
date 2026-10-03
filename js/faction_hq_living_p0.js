// Faction HQ Premium Master V1 — Echo Wardens master ported to all factions.
(function(global){
  "use strict";
  const ROOT_ID="factionHQLivingP0";
  const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canon=(v)=>String(v||"").toLowerCase().replace(/\s+/g,"_");
  const CFG={
    echo_wardens:{cls:"hq-living-echo",rgb:"255,211,77",name:"ECHO WARDENS",creed:"REMEMBER",icon:"/images/factions/echo_wardens_80.webp",scene:"/hq_warroom_ew.webp",fallback:"/hq_warroom_ew.webp",idle:"LINES HOLDING",active:"SIGNAL PRESSURE",recognition:"ah_hq_recognition_echo_wardens_v1"},
    inner_howl:{cls:"hq-living-inner",rgb:"64,196,255",name:"INNER HOWL",creed:"ENDURE",icon:"/images/factions/inner_howl_80.webp",scene:"/hq_warroom_ih.webp",fallback:"/hq_warroom_ih.webp",idle:"LINE STABLE",active:"PRESSURE RISING",recognition:"ah_hq_recognition_inner_howl_v1"},
    rogue_byte:{cls:"hq-living-rogue",rgb:"255,59,59",name:"ROGUE BYTE",creed:"BREAK IN",icon:"/images/factions/rogue_byte_80.webp",scene:"/hq_warroom_rb.webp",fallback:"/hq_warroom_rb.webp",idle:"CHANNEL QUIET",active:"BREACH SIGNAL",recognition:"ah_hq_recognition_rogue_byte_v1"},
    pack_burners:{cls:"hq-living-burners",rgb:"255,122,26",name:"PACK BURNERS",creed:"BE SEEN",icon:"/images/factions/pack_burners_80.webp",scene:"/hq_warroom_pb.webp",fallback:"/hq_warroom_pb.webp",idle:"HEAT LOW",active:"PRESSURE IGNITED",recognition:"ah_hq_recognition_pack_burners_v1"}
  };
  function factionKey(detail={}){
    const raw=canon(detail.faction||detail.fk);
    if(raw==="ew")return"echo_wardens";
    if(raw==="ih")return"inner_howl";
    if(raw==="rb")return"rogue_byte";
    if(raw==="pb")return"pack_burners";
    return raw;
  }
  const callsign=(detail)=>{
    const raw=detail?.callsign||global.PROFILE?.nickname||global.PLAYER_STATE?.profile?.nickname||detail?.playerName||"HOWLER";
    return String(raw||"HOWLER").trim().slice(0,20)||"HOWLER";
  };
  function clearFactionClasses(back){
    ["hq-living-echo","hq-living-inner","hq-living-rogue","hq-living-burners"].forEach(x=>back?.classList.remove(x));
  }
  function remove(){
    document.getElementById(ROOT_ID)?.remove();
    const back=document.getElementById("factionHQBack");
    clearFactionClasses(back);
    if(back){ delete back.dataset.hqFaction; delete back.dataset.hqLevel; }
  }
  function recognitionSeen(key){try{return localStorage.getItem(key)==="1"}catch(_){return false}}
  function markRecognitionSeen(key){try{localStorage.setItem(key,"1")}catch(_){}}
  function mount(detail={}){
    const key=factionKey(detail),cfg=CFG[key];
    if(!cfg){remove();return}
    const back=document.getElementById("factionHQBack");
    const modal=document.getElementById("factionHQModal");
    if(!back||!modal)return;
    remove(); back.classList.add(cfg.cls);
    const node=document.createElement("div");
    node.id=ROOT_ID;
    node.style.setProperty("--hq-accent",cfg.rgb);
    node.style.setProperty("--hq-scene",'url("'+cfg.scene+'")');
    node.style.setProperty("--hq-fallback",'url("'+cfg.fallback+'")');
    node.setAttribute("data-faction",key);
    node.setAttribute("data-hq-level",String(level));
    node.setAttribute("aria-label",cfg.name+" Living Headquarters");
    back.dataset.hqFaction=key;
    back.dataset.hqLevel=String(level);
    const name=callsign(detail);
    const level=Math.max(1,Number(detail.level||1)||1);
    const nextLevel=Math.max(level+1,Number(detail.nextLevel||level+1)||level+1);
    const bones=Math.max(0,Number(detail.bones||0)||0);
    const scrap=Math.max(0,Number(detail.scrap||0)||0);
    const needBones=Math.max(0,Number(detail.needBones||0)||0);
    const needScrap=Math.max(0,Number(detail.needScrap||0)||0);
    const canUpgrade=!!detail.canUpgrade;
    const pct=(v,max)=>max>0?Math.max(0,Math.min(100,Math.round((v/max)*100))):0;
    const frontState=detail.frontLive?String(detail.frontLabel||"ACTIVE"):"STABLE";
    const first=!recognitionSeen(cfg.recognition);
    node.innerHTML=`
      <div class="lhq-scene"></div>
      <div class="lhq-scan"></div>
      <div class="lhq-top">
        <div><div class="lhq-title">${cfg.name} · HQ LV ${esc(detail.level||1)}</div><div class="lhq-creed">${cfg.creed}</div></div>
        <button class="lhq-close" type="button" aria-label="Close HQ">×</button>
      </div>
      <div class="lhq-core"><img class="lhq-sigil" src="${cfg.icon}" alt="" aria-hidden="true"></div>
      <div class="lhq-conduit c1"></div><div class="lhq-conduit c2"></div><div class="lhq-conduit c3"></div>
      <button class="lhq-front" type="button" aria-label="Open Current Front">
        <span class="lhq-front-copy"><span class="lhq-kicker">CURRENT FRONT</span><strong class="lhq-front-title">${detail.frontLive?cfg.active:cfg.idle}</strong><span class="lhq-front-state">${esc(frontState)} · TAP TO OPEN</span></span>
      </button>
      <div class="lhq-personal"><small>BOUND SIGNAL</small><strong>${esc(name)}</strong></div>
      <button class="lhq-build" type="button" aria-label="Open HQ build progression">
        <span class="lhq-build-kicker">HQ BUILD</span>
        <span class="lhq-build-level">LV ${esc(level)} <b>→</b> ${level>=6?"MAX":`LV ${esc(nextLevel)}`}</span>
        <span class="lhq-build-stage">${level>=6?"MAXIMUM HQ":esc(detail.nextStageName||"Next stage")}</span>
        <span class="lhq-build-bars">
          <span><i style="width:${pct(bones,needBones)}%"></i></span>
          <span><i style="width:${pct(scrap,needScrap)}%"></i></span>
        </span>
        <span class="lhq-build-cta">${level>=6?"COMPLETE":canUpgrade?"UPGRADE READY":"SUPPORT HQ"}</span>
      </button>
      ${first?`<div class="lhq-recognition"><div><small>SIGNAL RECOGNIZED</small><strong>WELCOME HOME, ${esc(name)}</strong></div></div>`:""}
    `;
    modal.insertBefore(node,document.getElementById("factionHQRoot")||modal.firstChild);
    node.querySelector(".lhq-close")?.addEventListener("click",()=>global.FactionHQ?.close?.());
    node.querySelector(".lhq-front")?.addEventListener("click",()=>global.FactionHQ?._switchView?.("front"));
    node.querySelector(".lhq-build")?.addEventListener("click",()=>{
      if(level>=6)return;
      if(canUpgrade)global.FactionHQ?._upgrade?.();
      else global.FactionHQ?._openSheet?.("support");
    });
    if(first)markRecognitionSeen(cfg.recognition);
  }
  global.addEventListener("ah:faction-hq-rendered",(event)=>mount(event.detail||{}));
  global.addEventListener("ah:faction-hq-closed",remove);
  global.FactionHQLivingP0={mount,remove};
})(window);