import { useEffect, useState } from "react";
import { useBattleStore } from "../../store/battleStore";
import { HERO_PATHS, HERO_SKILLS, type Discipline, type HeroId } from "../../data/playerGrowth";
import { getSkill } from "../../data/skills";
import { UNIT_DEFS } from "../../data/units";
import { tacticalActionImageForSkill } from "../tacticalActionIcons";
import { tacticalEmblemFor } from "../tacticalEmblems";
import { portraitFallback } from "../PlayerIdentity";
import { ATLAS_SECTORS, HERO_TITLES, HERO_SUBTITLES, PATH_EXPLANATIONS, getNodeView, atlasSectorPosition, type AtlasSector, type NodeView } from "./model";

type Feedback = { kind: "success" | "error"; text: string } | null;
type Selection = { skillId: string; rank: 0|1|2 };
const RESERVES = [
  {id:"future-a", title:"FUTURE 01",x:14,y:62},
  {id:"future-b", title:"FUTURE 02",x:86,y:62},
  {id:"future-c", title:"FUTURE 03",x:14,y:86},
  {id:"future-d", title:"FUTURE 04",x:86,y:86},
];

export function SignalAtlas({ onClose }: { onClose: () => void }) {
  const progression = useBattleStore(s=>s.progression);
  const growth = progression?.playerGrowth;
  const progressionPending = useBattleStore(s=>s.progressionCommitPending);
  const progressionError = useBattleStore(s=>s.progressionError);
  const upgrade = useBattleStore(s=>s.upgradeGrowth);
  const respec = useBattleStore(s=>s.respecGrowth);
  const [heroId,setHeroId] = useState<HeroId>("alpha");
  const [view,setView] = useState<"atlas"|"sector">("atlas");
  const [sectorId,setSectorId] = useState("assault");
  const [sectorPage,setSectorPage] = useState(0);
  const [pathPreview,setPathPreview] = useState<Discipline>("vanguard");
  const [selection,setSelection] = useState<Selection | null>(null);
  const [confirm,setConfirm] = useState<"upgrade"|"respec"|null>(null);
  const [saving,setSaving] = useState(false);
  const [feedback,setFeedback] = useState<Feedback>(null);
  const [showFuture,setShowFuture] = useState(false);
  const sectors=ATLAS_SECTORS[heroId];
  const sectorPageCount=Math.ceil(sectors.length/3);
  const visibleSectors=sectors.slice(sectorPage*3,(sectorPage+1)*3);
  const sector=sectors.find(s=>s.id===sectorId) || sectors[0];
  const hero=growth?.heroes.find(h=>h.heroId===heroId) || null;
  const chosenPath=pathPreview;
  useEffect(()=>{setPathPreview(hero?.discipline || HERO_PATHS[heroId][0]);},[heroId,hero?.discipline]);
  const points=growth ? growth.earnedPoints-growth.spentPoints : 0;
  const unavailable=saving || progressionPending;
  const node=selection && sector.skillIds.includes(selection.skillId)
    ? getNodeView(heroId,selection.skillId,selection.rank,hero,chosenPath,points) : null;
  const canBuy=Boolean(node?.state==="available" && !unavailable && growth);
  const canRespec=Boolean(hero?.discipline && !hero.respecUsed && Object.keys(hero.ranks).length>0 && !unavailable);
  const purchased=hero?.ranks || {};

  function changeHero(id:HeroId){
    if(unavailable)return;
    setHeroId(id);setSectorPage(0);setSectorId(ATLAS_SECTORS[id][0].id);setPathPreview(growth?.heroes.find(h=>h.heroId===id)?.discipline || HERO_PATHS[id][0]);
    setView("atlas");setSelection(null);setFeedback(null);setConfirm(null);
  }
  function openSector(s:AtlasSector){
    if(unavailable)return;
    setSectorId(s.id);setView("sector");setSelection(null);setConfirm(null);setFeedback(null);
  }
  async function commitUpgrade(){
    if(!node || !canBuy || !growth || !progression || !hero)return;
    const captured={ heroId, path:chosenPath, skillId:node.skillId, rank:node.rank as 1|2, revision:progression.revision };
    setConfirm(null);setFeedback(null);setSaving(true);
    try {
      await upgrade(captured.heroId,captured.path,captured.skillId,captured.rank);
      const current=useBattleStore.getState();
      const saved=current.progression?.playerGrowth?.heroes.find(h=>h.heroId===captured.heroId);
      if(current.progression && current.progression.revision>captured.revision &&
        (saved?.ranks[captured.skillId]||0)>=captured.rank && !current.progressionError) {
        setFeedback({kind:"success",text:`SERVER RECORDED · ${getSkill(captured.skillId).name} RANK ${captured.rank}. Your next battle will use the saved skill.`});
      } else {
        setFeedback({kind:"error",text:current.progressionError || "Upgrade not confirmed by the server. Points and skill ownership remain server-owned; refresh and retry."});
      }
    } catch {
      setFeedback({kind:"error",text:"Could not verify server receipt. Refresh before retrying."});
    } finally {setSaving(false);}
  }
  async function commitRespec(){
    if(!canRespec || !progression)return;
    const initial=progression.revision;
    const id=heroId;
    setConfirm(null);setFeedback(null);setSaving(true);
    try{
      await respec(id);
      const current=useBattleStore.getState();
      const saved=current.progression?.playerGrowth?.heroes.find(h=>h.heroId===id);
      if(current.progression && current.progression.revision>initial && saved?.respecUsed && !Object.keys(saved.ranks).length && !current.progressionError){
        setPathPreview(HERO_PATHS[id][0]);setSelection(null);
        setFeedback({kind:"success",text:"SERVER RECORDED · This hero's one-time reset was used."});
      } else setFeedback({kind:"error",text:current.progressionError||"Reset not confirmed. Refresh and check server progression."});
    } catch{setFeedback({kind:"error",text:"Reset receipt could not be verified."});}
    finally{setSaving(false);}
  }

  return <section className="tsa-root" aria-label="Signal Atlas character Skillbook">
    <header className="tsa-header">
      <div><span className="tsa-eyebrow">TACTICAL OPS / CHARACTER DEVELOPMENT</span>
        <h2>THE SIGNAL ATLAS</h2><span className="tsa-subtitle">THE CHAIN REMEMBERS · SERVER-OWNED PROGRESSION</span></div>
      <div className="tsa-points" aria-label={growth?`${points} unspent skill points`:"Points unavailable"}><strong>{growth?points:"—"}</strong><small>POINTS<br/>AVAILABLE</small></div>
    </header>
    <div className="tsa-hero-tabs" role="group" aria-label="Choose character">
      {(Object.keys(HERO_TITLES) as HeroId[]).map(id=><button type="button" key={id} disabled={unavailable} aria-pressed={heroId===id}
        className={heroId===id?"is-active":""} onClick={()=>changeHero(id)}>
        <img src={UNIT_DEFS[id].portrait} onError={portraitFallback} alt=""/>
        <span><b>{HERO_TITLES[id]}</b><small>{HERO_SUBTITLES[id]}</small></span></button>)}
    </div>
    {!growth?<p className="tsa-banner" role="status">Waiting for authenticated Skillbook progression. No skills can be purchased offline.</p>:null}
    <div className="tsa-nav" role="group" aria-label="Skillbook view">
      <button type="button" className={view==="atlas"?"is-current":""} aria-pressed={view==="atlas"} onClick={()=>{setView("atlas");setConfirm(null);setFeedback(null);}} disabled={unavailable}>◈ ATLAS OVERVIEW</button>
      <button type="button" className={view==="sector"?"is-current":""} aria-pressed={view==="sector"} onClick={()=>setView("sector")} disabled={unavailable}>◇ SECTOR FOCUS</button>
      <button type="button" onClick={onClose} disabled={unavailable} aria-label="Close Signal Atlas">✕ CLOSE</button>
    </div>
    {view==="atlas"?<div className="tsa-overview">
      <div className="tsa-atlas-title"><span>ALPHA HUSKY / {HERO_TITLES[heroId]}</span><strong>COMBAT NETWORK</strong><small>Select a live sector to inspect its real skills.</small></div>
      <div className="tsa-atlas-map" aria-label="Interactive skill sector map">
        <svg className="tsa-links" viewBox="0 0 360 370" preserveAspectRatio="none" aria-hidden="true">
          <circle cx="180" cy="185" r="129" fill="none" stroke="#426074" strokeWidth="1" strokeDasharray="4 9"/>
          <circle cx="180" cy="185" r="99" fill="none" stroke="#2F728D" strokeWidth="1"/>
          {visibleSectors.map((s,i)=>{const p=atlasSectorPosition(i,visibleSectors.length);return <path key={s.id} d={`M180 185 L${p.x*3.6} ${p.y*3.7}`} fill="none" stroke="#6AC4DF" strokeWidth="2.8"/>;})}
          <path d="M180 185 L47 126 M180 185 L313 126 M180 185 L47 289 M180 185 L313 289" fill="none" stroke="#466071" strokeWidth="1.5" strokeDasharray="5 7"/>
        </svg>
        <div className="tsa-core"><img className="tsa-core-portrait" src={UNIT_DEFS[heroId].portrait} onError={portraitFallback} alt=""/><img className="tsa-core-emblem" src={tacticalEmblemFor(heroId,null)||""} alt=""/><b>{HERO_TITLES[heroId]}</b><small>COMBAT CORE</small></div>
        {visibleSectors.map((s,i)=><button key={s.id} className={`tsa-sector tsa-tone-${s.tone}`} style={{left:`${atlasSectorPosition(i,visibleSectors.length).x}%`,top:`${atlasSectorPosition(i,visibleSectors.length).y}%`}} type="button" onClick={()=>openSector(s)} disabled={unavailable} aria-label={`Open ${s.title} sector, ${s.skillIds.length} skills`}>
          <span className="tsa-sector-glyph">{s.tone==="amber"?"✦":"◎"}</span><b>{s.title}</b><small>{s.description}</small><em>LIVE · {s.skillIds.reduce((sum,id)=>sum+(purchased[id]||0),0)}/{s.skillIds.length*2}</em>
        </button>)}
        {sectors.length<=2 && RESERVES.map(s=><div className="tsa-reserve" key={s.id} style={{left:`${s.x}%`,top:`${s.y}%`}} aria-label="Unreleased expansion placeholder">⊕</div>)}
      </div>
      {sectorPageCount>1?<div className="tsa-page-controls" aria-label="Sector pages"><button type="button" disabled={unavailable||sectorPage===0} onClick={()=>setSectorPage(p=>Math.max(0,p-1))}>← PREVIOUS</button><span>SECTORS {sectorPage+1} / {sectorPageCount}</span><button type="button" disabled={unavailable||sectorPage===sectorPageCount-1} onClick={()=>setSectorPage(p=>Math.min(sectorPageCount-1,p+1))}>NEXT →</button></div>:null}
      <div className="tsa-atlas-footer">
        <span><b>●</b> LIVE SECTOR</span><span>◌ DESIGN RESERVE — NOT RELEASED</span>
      </div>
      <button type="button" className="tsa-future-toggle" aria-expanded={showFuture} onClick={()=>setShowFuture(v=>!v)}>FUTURE EXPANSION {showFuture?"−":"+"}</button>
      {showFuture?<p className="tsa-explain">This atlas can accept additional sectors without changing existing skill IDs. Grey markers are design space only—not earnable abilities, locked missions or promised rewards.</p>:null}
    </div>:<div className="tsa-focus">
      <div className="tsa-focus-heading"><div><span className="tsa-eyebrow">{HERO_TITLES[heroId]} / {sector.title} SECTOR</span><h3>{sector.title} NETWORK</h3><small>{sector.description} · only actual authored skills</small></div><button type="button" onClick={()=>setView("atlas")} disabled={unavailable}>← ATLAS</button></div>
      <div className="tsa-disciplines" role="group" aria-label="Choose specialization preview">
        {HERO_PATHS[heroId].map(p=><button key={p} type="button" aria-pressed={chosenPath===p} disabled={unavailable}
          onClick={()=>{setPathPreview(p);setSelection(null);setFeedback(null);}}
          className={chosenPath===p?"is-chosen":""}>
          <img src={tacticalEmblemFor(heroId,p)||""} alt=""/><b>{p.toUpperCase()}</b>
          <span>{hero?.discipline===p?"SERVER RECORDED":hero?.discipline?"ALTERNATIVE · UNAVAILABLE":"PREVIEW PATH"}</span></button>)}
      </div>
      <p className="tsa-path-explain">{PATH_EXPLANATIONS[chosenPath]} {hero?.discipline?"Your recorded discipline is fixed until an eligible one-time reset.":"Previewing does not save a discipline. Your first successful skill purchase selects it."}</p>
      <div className="tsa-lanes">
        {sector.skillIds.map(skillId=>{
          const skill=getSkill(skillId);
          return <div className="tsa-lane" key={skillId}>
            <div className="tsa-lane-title"><img src={tacticalActionImageForSkill(skillId)||""} alt=""/><div><b>{skill.name}</b><small>{skill.slot} · {skill.desc}</small></div><span>{purchased[skillId]||0}/2</span></div>
            <div className="tsa-node-line" role="group" aria-label={`${skill.name} upgrade ranks`}>
              {([0,1,2] as const).map((rank,index)=>{
                const current=getNodeView(heroId,skillId,rank,hero,chosenPath,points);
                const focused=selection?.skillId===skillId && selection.rank===rank;
                return <div className="tsa-node-wrap" key={current.id}>
                  {index>0?<span className={`tsa-connector ${(purchased[skillId]||0)>=rank?"is-lit":""}`} aria-hidden="true"/>:null}
                  <button type="button" disabled={unavailable} aria-pressed={focused} onClick={()=>{setSelection({skillId,rank});setFeedback(null);setConfirm(null);}}
                    className={`tsa-node tsa-state-${current.state} ${focused?"is-focused":""}`}
                    aria-label={`${skill.name} rank ${rank}, ${current.state}: ${current.reason}`}>
                    {rank===0?<img src={tacticalActionImageForSkill(skillId)||""} alt=""/>:<span aria-hidden="true">{current.state==="maxed"||current.state==="recorded"?"✓":current.state==="needs-rank-one"?"▧":rank===2?"Ⅱ":"Ⅰ"}</span>}
                  </button><small>{rank===0?"BASE":`RANK ${rank===1?"I":"II"}`}</small>
                </div>;
              })}
            </div>
          </div>;
        })}
      </div>
      <section className="tsa-inspector" aria-label="Skill node inspection" aria-live="polite">
        {node ? <><span className="tsa-eyebrow">{getSkill(node.skillId).name} / {node.rank===0?"BASE":`RANK ${node.rank===1?"I":"II"}`}</span>
          <h3>{node.title}</h3><p>{node.reason}</p>
          {node.changes.length?<div className="tsa-deltas">{node.changes.map(c=><strong key={c}>{c}</strong>)}</div>:null}
          <div className="tsa-inspector-bottom"><span>{node.rank===0?"ALREADY OWNED":node.state==="recorded"||node.state==="maxed"?"SERVER RECORDED":"COST: 1 SKILL POINT"}</span>
          <button type="button" disabled={!canBuy} onClick={()=>setConfirm("upgrade")}>{saving?"SAVING…":node.state==="available"?"REVIEW UPGRADE":"UNAVAILABLE"}</button></div>
        </>:<><span className="tsa-eyebrow">SELECT A NODE</span><h3>BUILD YOUR COMBAT IDENTITY</h3><p>Tap a rank to inspect its real effect, prerequisite and server ownership before spending a point.</p></>}
      </section>
      <div className="tsa-secondary"><button type="button" disabled={!canRespec} onClick={()=>setConfirm("respec")}>{hero?.respecUsed?"ONE-TIME RESET USED":"RESET THIS HERO · ONCE FREE"}</button><small>Pack Mastery remains separate.</small></div>
    </div>}
    {feedback?<p className={`tsa-feedback ${feedback.kind}`} role={feedback.kind==="error"?"alert":"status"}>{feedback.text}</p>:null}
    {progressionError && !feedback?<p className="tsa-feedback error" role="alert">{progressionError}</p>:null}
    {confirm?<div className="tsa-dialog-backdrop"><div className="tsa-dialog" role="dialog" aria-modal="true" aria-labelledby="tsa-confirm-title">
      <span className="tsa-eyebrow">SERVER-RECORDED ACTION</span>
      <h3 id="tsa-confirm-title">{confirm==="upgrade"?"CONFIRM SKILL UPGRADE":"CONFIRM ONE-TIME RESET"}</h3>
      <p>{confirm==="upgrade" ? `${node?.title} · cost 1 shared skill point. ${hero?.discipline?"Existing discipline remains recorded.":`First purchase will record ${chosenPath.toUpperCase()} as this hero's discipline.`}` : "Refund this hero's spent skill points and clear their specialization. You cannot use this one-time reset again."}</p>
      <div className="tsa-dialog-actions"><button type="button" onClick={()=>setConfirm(null)}>CANCEL</button><button type="button" className="is-primary" disabled={confirm==="upgrade"?!canBuy:!canRespec} onClick={()=>void (confirm==="upgrade"?commitUpgrade():commitRespec())}>CONFIRM</button></div>
    </div></div>:null}
  </section>;
}
