// Faction HQ Premium Master V1 — Echo Wardens master ported to all factions.
(function(global){
  "use strict";
  const ROOT_ID="factionHQLivingP0";
  const esc=(v)=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const canon=(v)=>String(v||"").toLowerCase().replace(/\s+/g,"_");
  const CFG={
    echo_wardens:{cls:"hq-living-echo",rgb:"255,211,77",name:"ECHO WARDENS",creed:"REMEMBER",icon:"/images/factions/echo_wardens_80.webp",scene:"/hq_warroom_ew.webp",fallback:"/hq_warroom_ew.webp",progression:{1:"/images/hq/progression/echo_wardens/lv1.webp",3:"/images/hq/progression/echo_wardens/lv3.webp",4:"/images/hq/progression/echo_wardens/lv4.webp",6:"/images/hq/progression/echo_wardens/lv6.webp"},idle:"LINES HOLDING",active:"SIGNAL PRESSURE",recognition:"ah_hq_recognition_echo_wardens_v1"},
    inner_howl:{cls:"hq-living-inner",rgb:"64,196,255",name:"INNER HOWL",creed:"ENDURE",icon:"/images/factions/inner_howl_80.webp",scene:"/hq_warroom_ih.webp",fallback:"/hq_warroom_ih.webp",progression:{1:"/images/hq/progression/inner_howl/lv1.webp",3:"/images/hq/progression/inner_howl/lv3.webp",4:"/images/hq/progression/inner_howl/lv4.webp",6:"/images/hq/progression/inner_howl/lv6.webp"},idle:"LINE STABLE",active:"PRESSURE RISING",recognition:"ah_hq_recognition_inner_howl_v1"},
    rogue_byte:{cls:"hq-living-rogue",rgb:"255,59,59",name:"ROGUE BYTE",creed:"BREAK IN",icon:"/images/factions/rogue_byte_80.webp",scene:"/hq_warroom_rb.webp",fallback:"/hq_warroom_rb.webp",progression:{1:"/images/hq/progression/rogue_byte/lv1.webp",3:"/images/hq/progression/rogue_byte/lv3.webp",4:"/images/hq/progression/rogue_byte/lv4.webp",6:"/images/hq/progression/rogue_byte/lv6.webp"},idle:"CHANNEL QUIET",active:"BREACH SIGNAL",recognition:"ah_hq_recognition_rogue_byte_v1"},
    pack_burners:{cls:"hq-living-burners",rgb:"255,122,26",name:"PACK BURNERS",creed:"BE SEEN",icon:"/images/factions/pack_burners_80.webp",scene:"/hq_warroom_pb.webp",fallback:"/hq_warroom_pb.webp",progression:{1:"/images/hq/progression/pack_burners/lv1.webp",3:"/images/hq/progression/pack_burners/lv3.webp",4:"/images/hq/progression/pack_burners/lv4.webp",6:"/images/hq/progression/pack_burners/lv6.webp"},idle:"HEAT LOW",active:"PRESSURE IGNITED",recognition:"ah_hq_recognition_pack_burners_v1"}
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
  const HQ_STAGE_BY_LEVEL={
    1:"Raw Core",
    2:"First Expansion",
    3:"Network Expansion",
    4:"Data Fortress",
    5:"Energy Core",
    6:"Ghost Layer"
  };
  function previewLevel(faction=""){
    if(!CFG[faction]?.progression)return 0;
    try {
      const q=new URLSearchParams(global.location.search);
      const raw=Number(q.get("hqpreview")||0);
      return [1,3,4,6].includes(raw)?raw:0;
    } catch(_){ return 0; }
  }
  function previewEnabled(faction=""){ return previewLevel(faction)>0; }
  function previewSelectorEnabled(faction=""){
    if(!CFG[faction]?.progression)return false;
    try {
      const q=new URLSearchParams(global.location.search);
      return q.get("hqselector")==="1";
    } catch(_){ return false; }
  }
  const HQ_PREVIEW_FACTIONS=["echo_wardens","inner_howl","rogue_byte","pack_burners"];
  const HQ_PREVIEW_LABELS={echo_wardens:"EW",inner_howl:"IH",rogue_byte:"RB",pack_burners:"PB"};
  function previewFaction(realFaction=""){
    try{
      const q=new URLSearchParams(global.location.search);
      const requested=canon(q.get("hqfactionpreview")||"");
      if(requested&&HQ_PREVIEW_FACTIONS.includes(requested)&&CFG[requested]?.progression)return requested;
    }catch(_){}
    return "";
  }
  function progressionAnchor(level=1){
    const n=Math.max(1,Math.min(6,Number(level)||1));
    if(n>=6)return 6;
    if(n>=4)return 4;
    if(n>=3)return 3;
    return 1;
  }
  function progressionScene(cfg,faction,level){
    if(!cfg?.progression)return cfg?.scene||"";
    return cfg.progression[progressionAnchor(level)]||cfg.scene;
  }
  function previewStageName(faction="",level=1){
    if(faction==="rogue_byte")return HQ_STAGE_BY_LEVEL[level]||"HQ ONLINE";
    return "VISUAL STATE";
  }
  function mount(detail={}){
    const realKey=factionKey(detail);
    const forcedFaction=previewFaction(realKey);
    const key=forcedFaction||realKey;
    const cfg=CFG[key];
    if(!CFG[realKey]||!cfg){remove();return}
    const back=document.getElementById("factionHQBack");
    const modal=document.getElementById("factionHQModal");
    if(!back||!modal)return;
    remove(); back.classList.add(cfg.cls);
    const node=document.createElement("div");
    const name=callsign(detail);
    const forcedPreview=previewLevel(key);
    const liveLevel=Math.max(1,Number(detail.level||1)||1);
    const level=forcedPreview||liveLevel;
    const selectorOn=previewSelectorEnabled(key);
    const crossFactionPreview=!!forcedFaction&&forcedFaction!==realKey;
    const visualOnly=!!forcedPreview||crossFactionPreview;
    const visualLevel=cfg.progression?progressionAnchor(level):level;
    const scene=progressionScene(cfg,key,visualLevel);
    node.id=ROOT_ID;
    node.style.setProperty("--hq-accent",cfg.rgb);
    node.style.setProperty("--hq-scene",'url("'+scene+'")');
    node.style.setProperty("--hq-fallback",'url("'+cfg.fallback+'")');
    node.setAttribute("data-faction",key);
    node.setAttribute("data-hq-real-faction",realKey);
    node.setAttribute("data-hq-level",String(level));
    node.setAttribute("data-hq-visual-level",String(visualLevel));
    if(cfg.progression) node.setAttribute("data-hq-progress-art","1");
    if(visualOnly) node.setAttribute("data-hq-preview","1");
    if(crossFactionPreview) node.setAttribute("data-hq-cross-faction-preview","1");
    node.setAttribute("aria-label",cfg.name+" Living Headquarters");
    back.dataset.hqFaction=realKey;
    back.dataset.hqLevel=String(liveLevel);
    const nextLevel=forcedPreview
      ? Math.min(6,level+1)
      : Math.max(level+1,Number(detail.nextLevel||level+1)||level+1);
    const currentStageName=visualOnly
      ? previewStageName(key,level)
      : String(detail.currentStageName||"HQ ONLINE");
    const nextStageName=visualOnly
      ? (level>=6?"Maximum HQ":previewStageName(key,nextLevel))
      : String(detail.nextStageName||"STAGE");
    const bones=Math.max(0,Number(detail.bones||0)||0);
    const scrap=Math.max(0,Number(detail.scrap||0)||0);
    const needBones=Math.max(0,Number(detail.needBones||0)||0);
    const needScrap=Math.max(0,Number(detail.needScrap||0)||0);
    const canUpgrade=!!detail.canUpgrade;
    const pct=(v,max)=>max>0?Math.max(0,Math.min(100,Math.round((v/max)*100))):0;
    const frontState=detail.frontLive?String(detail.frontLabel||"ACTIVE"):"STABLE";
    const first=!visualOnly&&!recognitionSeen(cfg.recognition);
    node.innerHTML=`
      <div class="lhq-scene"></div>
      <div class="lhq-growth" aria-hidden="true">
        <div class="lhq-growth-layer lhq-growth-l2"><span class="g-node n1"></span><span class="g-node n2"></span><span class="g-rail r1"></span></div>
        <div class="lhq-growth-layer lhq-growth-l3"><span class="g-node n3"></span><span class="g-node n4"></span><span class="g-link l1"></span><span class="g-link l2"></span></div>
        <div class="lhq-growth-layer lhq-growth-l4"><span class="g-brace b1"></span><span class="g-brace b2"></span><span class="g-rail r2"></span><span class="g-rail r3"></span></div>
        <div class="lhq-growth-layer lhq-growth-l5"><span class="g-core-pulse"></span><span class="g-link l3"></span><span class="g-link l4"></span></div>
        <div class="lhq-growth-layer lhq-growth-l6"><span class="g-prestige"></span><span class="g-orbit o1"></span><span class="g-orbit o2"></span></div>
      </div>
      <div class="lhq-scan"></div>
      <div class="lhq-top">
        <div class="lhq-title-zone"><div class="lhq-title">${cfg.name} · HQ LV ${esc(level)}${forcedPreview?" · PREVIEW":""}</div><div class="lhq-creed">${cfg.creed}</div></div>
        <button class="lhq-close" type="button" aria-label="Close HQ">×</button>
      </div>
      <div class="lhq-core"><img class="lhq-sigil" src="${cfg.icon}" alt="" aria-hidden="true"></div>
      <div class="lhq-conduit c1"></div><div class="lhq-conduit c2"></div><div class="lhq-conduit c3"></div>
      <button class="lhq-front" type="button" aria-label="Open Current Front">
        <span class="lhq-front-copy"><span class="lhq-kicker">CURRENT FRONT</span><strong class="lhq-front-title">${detail.frontLive?cfg.active:cfg.idle}</strong><span class="lhq-front-state">${esc(frontState)} · TAP TO OPEN</span></span>
      </button>
      <div class="lhq-personal"><small>BOUND SIGNAL</small><strong>${esc(name)}</strong></div>
      ${selectorOn?`<div class="lhq-visual-selector" aria-label="HQ Visual Lab" style="display:flex;flex-direction:column;gap:5px;align-items:center;">
        <div style="display:flex;gap:4px;align-items:center;justify-content:center;flex-wrap:wrap;">
          <span>FACTION</span>
          ${HQ_PREVIEW_FACTIONS.map(f=>`<button type="button" data-hq-preview-faction="${f}" aria-pressed="${key===f?"true":"false"}">${HQ_PREVIEW_LABELS[f]}</button>`).join("")}
        </div>
        <div style="display:flex;gap:4px;align-items:center;justify-content:center;flex-wrap:wrap;">
          <span>LEVEL</span>
          ${[1,3,4,6].map(v=>`<button type="button" data-hq-preview-level="${v}" aria-pressed="${forcedPreview===v?"true":"false"}">LV${v}</button>`).join("")}
          <button type="button" data-hq-preview-level="live" aria-pressed="${!visualOnly?"true":"false"}">LIVE</button>
        </div>
      </div>`:""}
      ${visualOnly?`<div class="lhq-preview-chip">VISUAL LAB · ${esc(cfg.name)} · LV ${esc(visualLevel)}</div>`:""}
      <button class="lhq-build" type="button" aria-label="${visualOnly?"HQ visual preview only":"Open HQ build progression"}" ${visualOnly?'aria-disabled="true" tabindex="-1"':""}>
        <span class="lhq-build-kicker">HQ BUILD</span>
        <span class="lhq-build-level">LV ${esc(level)} <b>→</b> ${level>=6?"MAX":`LV ${esc(nextLevel)}`}</span>
        <span class="lhq-build-stage">${esc(currentStageName)} ${level>=6?"· MAX":`· NEXT ${esc(nextStageName)}`}</span>
        ${visualOnly
          ? `<span class="lhq-build-preview-note">VISUAL STATE ONLY · LIVE ECONOMY UNCHANGED</span>`
          : `<span class="lhq-build-bars">
              <span class="lhq-build-meter"><em>BONES ${esc(bones)} / ${esc(needBones)}</em><span><i style="width:${pct(bones,needBones)}%"></i></span></span>
              <span class="lhq-build-meter"><em>SCRAP ${esc(scrap)} / ${esc(needScrap)}</em><span><i style="width:${pct(scrap,needScrap)}%"></i></span></span>
            </span>`}
        <span class="lhq-build-cta">${visualOnly?"VISUAL ONLY":level>=6?"COMPLETE":canUpgrade?"UPGRADE READY":"SUPPORT HQ"}</span>
      </button>
      ${first?`<div class="lhq-recognition"><div><small>SIGNAL RECOGNIZED</small><strong>WELCOME HOME, ${esc(name)}</strong></div></div>`:""}
    `;
    modal.insertBefore(node,document.getElementById("factionHQRoot")||modal.firstChild);
    node.querySelector(".lhq-close")?.addEventListener("click",()=>global.FactionHQ?.close?.());

    // Hidden real-device dev trigger: five quick taps in the enlarged HQ title zone
    // reveal/hide the existing visual-only LV1/LV3/LV4/LV6/LIVE selector.
    // Pointer-down is intentional: it is more reliable than pointer-up for rapid taps in Android WebView.
    // This only changes URL presentation state and never writes HQ level/resources/backend data.
    const titleZone=node.querySelector(".lhq-title-zone");
    if(cfg.progression&&titleZone){
      let titleTapCount=0;
      let titleTapWindowStart=0;
      titleZone.addEventListener("pointerdown",(event)=>{
        const now=Date.now();
        if(!titleTapWindowStart||now-titleTapWindowStart>3000){
          titleTapWindowStart=now;
          titleTapCount=1;
        }else{
          titleTapCount+=1;
        }
        event.preventDefault();
        if(titleTapCount<5)return;
        titleTapCount=0;
        titleTapWindowStart=0;
        event.stopPropagation();
        try{
          const q=new URLSearchParams(global.location.search);
          const enabled=q.get("hqselector")==="1";
          if(enabled){
            q.delete("hqselector");
            q.delete("hqpreview");
            q.delete("hqfactionpreview");
          }else{
            q.set("hqselector","1");
          }
          const qs=q.toString();
          global.history.replaceState(null,"",global.location.pathname+(qs?"?"+qs:"")+global.location.hash);
          mount(detail);
        }catch(_){}
      });
    }

    node.querySelector(".lhq-front")?.addEventListener("click",()=>{
      if(visualOnly)return;
      global.FactionHQ?._switchView?.("front");
    });
    node.querySelectorAll("[data-hq-preview-faction]").forEach((btn)=>btn.addEventListener("click",()=>{
      try{
        const requested=String(btn.dataset.hqPreviewFaction||"");
        if(!HQ_PREVIEW_FACTIONS.includes(requested))return;
        const q=new URLSearchParams(global.location.search);
        if(requested===realKey)q.delete("hqfactionpreview");
        else q.set("hqfactionpreview",requested);
        q.set("hqselector","1");
        const qs=q.toString();
        global.history.replaceState(null,"",global.location.pathname+(qs?"?"+qs:"")+global.location.hash);
        mount(detail);
      }catch(_){}
    }));
    node.querySelectorAll("[data-hq-preview-level]").forEach((btn)=>btn.addEventListener("click",()=>{
      try{
        const requested=String(btn.dataset.hqPreviewLevel||"live");
        const q=new URLSearchParams(global.location.search);
        if(requested==="live"){
          q.delete("hqpreview");
          q.delete("hqfactionpreview");
        }else{
          q.set("hqpreview",requested);
        }
        q.set("hqselector","1");
        const qs=q.toString();
        global.history.replaceState(null,"",global.location.pathname+(qs?"?"+qs:"")+global.location.hash);
        mount(detail);
      }catch(_){}
    }));
    node.querySelector(".lhq-build")?.addEventListener("click",()=>{
      if(visualOnly)return;
      if(level>=6)return;
      if(canUpgrade)global.FactionHQ?._upgrade?.();
      else global.FactionHQ?._openSheet?.("support");
    });
    if(first)markRecognitionSeen(cfg.recognition);
  }
  function upgradeMoment(detail={}){
    const node=document.getElementById(ROOT_ID);
    if(!node||node.dataset.hqPreview==="1")return;
    const fromLevel=Math.max(1,Number(detail.fromLevel||node.dataset.hqLevel||1)||1);
    const toLevel=Math.max(fromLevel,Math.min(6,Number(detail.toLevel||fromLevel+1)||fromLevel+1));
    node.classList.remove("is-upgrading");
    void node.offsetWidth;
    node.classList.add("is-upgrading");
    const old=node.querySelector(".lhq-upgrade-moment");
    old?.remove();
    const fx=document.createElement("div");
    fx.className="lhq-upgrade-moment";
    fx.innerHTML='<div class="lhq-upgrade-surge"></div><div class="lhq-upgrade-copy"><small>HQ NETWORK EXPANDING</small><strong>LEVEL '+esc(toLevel)+' — '+esc(detail.stageName||"NEW STAGE")+' ONLINE</strong></div>';
    node.appendChild(fx);
    setTimeout(()=>{
      node.dataset.hqLevel=String(toLevel);
      const faction=String(node.dataset.faction||"");
      const cfg=CFG[faction];
      if(cfg?.progression){
        const visualLevel=progressionAnchor(toLevel);
        const scene=progressionScene(cfg,faction,visualLevel);
        node.dataset.hqVisualLevel=String(visualLevel);
        node.style.setProperty("--hq-scene",'url("'+scene+'")');
      }
      const back=document.getElementById("factionHQBack");
      if(back)back.dataset.hqLevel=String(toLevel);
    },850);
    setTimeout(()=>{ node.classList.remove("is-upgrading"); fx.remove(); },2600);
  }
  global.addEventListener("ah:faction-hq-rendered",(event)=>mount(event.detail||{}));
  global.addEventListener("ah:faction-hq-upgrade-confirmed",(event)=>upgradeMoment(event.detail||{}));
  global.addEventListener("ah:faction-hq-closed",remove);
  global.FactionHQLivingP0={mount,remove,previewLevel,previewEnabled,previewSelectorEnabled,previewFaction,progressionAnchor,progressionScene,HQ_STAGE_BY_LEVEL};
})(window);