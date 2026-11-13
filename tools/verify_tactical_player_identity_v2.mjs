import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {pathToFileURL} from "node:url";
import {rolldown} from "rolldown";
const tmp=mkdtempSync(join(tmpdir(),"ah-identity-v2-"));
try {
  const bundle=await rolldown({input:"tactical-ops-src/host/identity.ts"});
  const output=await bundle.generate({format:"esm"});
  await bundle.close();
  const file=join(tmp,"identity.mjs");
  writeFileSync(file,output.output[0].code);
  const {resolvePlayerIdentity}=await import(pathToFileURL(file).href);
  const cloud="https://res.cloudinary.com/dnjwvxinh/image/upload/";
  const skin=cloud+"v123/skins/frostborn.png";
  const base=cloud+"v123/frames/pioneer/pioneer_frame_base.png";
  const glow=cloud+"v123/frames/pioneer/pioneer_frame_glow.png";
  const sweep=cloud+"v123/frames/pioneer/pioneer_frame_sweep.png";
  const node=(src="",key="",display="block")=>({
    dataset:{skinKey:key,frameKey:key},style:{display},src,currentSrc:src,
    alt:"Frostborn",getAttribute:(attr)=>attr==="src"?src:attr==="data-skin-key"?key:null,
  });
  const elements={
    "player-skin":node(skin,"frostborn"),
    "player-frame":node(base,"pioneer_frame"),
    "player-frame-glow":node(glow,"pioneer_frame"),
    "player-frame-sweep":node(sweep,"pioneer_frame"),
  };
  const session={sessionToken:"session-A"};
  globalThis.window={
    document:{getElementById:(key)=>elements[key]||null},
    __PROFILE__:{nickname:"Commander",skinKey:"frostborn",skin:{img:skin,key:"frostborn"}},
    __ahAlphaAccountSession:session,__AH_PROFILE_SESSION_REF__:session,
    __AH_SKIN_FIT__:{default:{scale:1},overrides:{frostborn:{scale:1.02,offsetX:0,offsetY:-2}}},
    __AH_FRAME_FIT__:{default:{scale:1},overrides:{pioneer_frame:{scale:1.03,offsetX:0,offsetY:8}}},
    __AH_SKIN_FRAME_COMBO_FIT__:{default:{scale:1}},
  };
  let c=resolvePlayerIdentity().cosmetic;
  assert.equal(c.confirmed,true); assert.equal(c.skinUrl,skin);
  assert.equal(c.frameUrl,base); assert.equal(c.glowUrl,glow); assert.equal(c.sweepUrl,sweep);
  assert.equal(c.frameKey,"pioneer_frame"); assert.equal(c.fit.scale,1.02*1.03); assert.equal(c.fit.offsetY,6);
  elements["player-frame"]=node("","","none");
  c=resolvePlayerIdentity().cosmetic;
  assert.equal(c.frameUrl,""); assert.equal(c.glowUrl,""); assert.equal(c.sweepUrl,"");
  elements["player-frame"]=node(base,"pioneer_frame");
  elements["player-frame-glow"]=node(glow,"signal_rank_plate");
  c=resolvePlayerIdentity().cosmetic;
  assert.equal(c.frameUrl,base); assert.equal(c.glowUrl,"");
  window.__ahAlphaAccountSession={sessionToken:"session-B"};
  const switched=resolvePlayerIdentity();
  assert.equal(switched.cosmetic.confirmed,false);
  assert.equal(switched.cosmetic.frameUrl,"");
  assert.equal(switched.nickname,"");
  window.__AH_PROFILE_SESSION_REF__=window.__ahAlphaAccountSession;
  elements["player-skin"]=node("https://cdn.example.com/skin-v2.avif","other_skin");
  elements["player-frame"]=node("","","none");
  c=resolvePlayerIdentity().cosmetic;
  assert.equal(c.skinUrl,"https://cdn.example.com/skin-v2.avif");
  assert.equal(c.frameUrl,"");
  elements["player-skin"]=node("","other_skin");
  const missing=resolvePlayerIdentity();
  assert.equal(missing.cosmetic.confirmed,false);
  assert.equal(missing.cosmetic.frameUrl,"");
  assert.equal(missing.cosmetic.glowUrl,"");
  console.log("PASS Tactical Player Identity V2: real resolver snapshots, frame effects, fits, unequip, account switch, custom extensions, missing assets");
} finally {delete globalThis.window;rmSync(tmp,{recursive:true,force:true});}
