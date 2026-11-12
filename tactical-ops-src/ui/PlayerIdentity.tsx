import { useState, type SyntheticEvent, type CSSProperties } from "react";
import { FIELD_HONOR } from "../data/fieldContracts";
import { FALLBACK_PORTRAIT } from "../data/units";
import type { PlayerIdentity } from "../host/identity";
import { useBattleStore } from "../store/battleStore";
export function portraitFallback(e:SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.onerror=null; e.currentTarget.src=FALLBACK_PORTRAIT;
}
/** Composes the live main-profile skin/frame. Does not affect the battle sprite. */
export function CommanderPortrait({className="",fallbackUrl,identity:supplied}:{
  className?:string;fallbackUrl?:string;identity?:PlayerIdentity;
}) {
  const current=useBattleStore(s=>s.identity);
  const identity=supplied||current,c=identity.cosmetic,active=!!c?.confirmed;
  const raw=active?c.skinUrl:(fallbackUrl||identity.portraitUrl||FALLBACK_PORTRAIT);
  const frame=active?c.frameUrl:"";
  const [failed,setFailed]=useState<Record<string,boolean>>({});
  const available=(url:string)=>url&&!failed[url]?url:"";
  const fail=(url:string)=>()=>setFailed(prev=>({...prev,[url]:true}));
  const src=available(raw)||FALLBACK_PORTRAIT;
  const fit=active?c.fit:{scale:1,offsetX:0,offsetY:0};
  const vars={"--t-skin-scale":fit.scale,"--t-skin-x":fit.offsetX+"px","--t-skin-y":fit.offsetY+"px"} as CSSProperties;
  return <span className={`t-cosmetic-portrait ${className}`} style={vars}
    data-frame-key={frame?c.frameKey:undefined} data-cosmetic-confirmed={active?"yes":"no"} aria-hidden="true">
    <span className="t-cosmetic-viewport"><img key={src} className="t-cosmetic-skin" src={src} alt=""
      draggable={false} onError={src===FALLBACK_PORTRAIT?e=>{e.currentTarget.hidden=true;}:fail(src)} /></span>
    {available(frame)?<img className="t-cosmetic-frame" src={frame} alt="" onError={fail(frame)} draggable={false}/>:null}
    {frame&&available(c.glowUrl)?<img className="t-cosmetic-frame t-cosmetic-glow" src={c.glowUrl} alt="" onError={fail(c.glowUrl)} draggable={false}/>:null}
    {frame&&available(c.sweepUrl)?<img className="t-cosmetic-frame t-cosmetic-sweep" src={c.sweepUrl} alt="" onError={fail(c.sweepUrl)} draggable={false}/>:null}
  </span>;
}
export function PlayerIdentityCard() {
  const identity=useBattleStore(s=>s.identity);
  const honor=useBattleStore(s=>s.progression?.fieldOps?.fieldContracts?.honor);
  return <div className="t-id-card" aria-label="Player identity"><CommanderPortrait />
    <div className="t-id-copy"><strong>{identity.unitName}</strong><small>{identity.summary}</small>
      {honor?<small className="t-field-contract-honor">Field Honor · {FIELD_HONOR}</small>:null}
    </div></div>;
}
