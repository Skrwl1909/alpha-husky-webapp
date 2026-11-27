/** Normalize authored frames without changing their relative body scale.
 * Foot baseline is measured per frame; x stays fixed so a punch cannot recenter
 * the entire body. The generated source sheets are kept for reproduction.
 */
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';

const out = 'images/tactical_ops/unit_motion/v1';
const manifest = {version:1, columns:4, rows:2, tile:512, baseline:480, bodyHeight:400, assets:[]};
for (const name of ['alpha','skirmisher']) {
  const source = `assets/tactical_motion_sources/${name}-strike-source.png`;
  const bytes = readFileSync(source);
  const {width,height,hasAlpha} = await sharp(bytes).metadata();
  if(width !== 1536 || height !== 1024 || !hasAlpha) throw Error(`Unexpected source sheet: ${source}`);
  const frames=[];
  let bodyHeight;
  for(let i=0;i<8;i++) {
    const tile=await sharp(bytes).extract({left:i%4*384,top:Math.floor(i/4)*512,width:384,height:512}).raw().toBuffer();
    let top=512,bottom=0;
    for(let y=0;y<512;y++) for(let x=0;x<384;x++) if(tile[(y*384+x)*4+3]>100) {top=Math.min(top,y);bottom=Math.max(bottom,y+1);}
    if(bottom<=top) throw Error(`Empty frame ${name}:${i}`);
    if(i===0) bodyHeight=bottom-top;
    const scale=400/bodyHeight;
    const w=Math.round(384*scale),h=Math.round(512*scale);
    const x=Math.round(256-192*scale),y=Math.round(480-bottom*scale);
    // A transparent staging canvas permits negative y without clipping limbs.
    const pad=256;
    const staged=await sharp({create:{width:1024,height:1024,channels:4,background:'#0000'}})
      .composite([{input:await sharp(tile,{raw:{width:384,height:512,channels:4}}).resize(w,h).png().toBuffer(),left:x+pad,top:y+pad}])
      .png().toBuffer();
    const frame=await sharp(staged).extract({left:pad,top:pad,width:512,height:512}).png().toBuffer();
    frames.push({input:frame,left:i%4*512,top:Math.floor(i/4)*512});
  }
  const output=`${out}/${name}-strike.webp`;
  await sharp({create:{width:2048,height:1024,channels:4,background:'#0000'}}).composite(frames).webp({quality:88,alphaQuality:100,effort:6}).toFile(output);
  manifest.assets.push({name,source,sourceSha256:createHash('sha256').update(bytes).digest('hex'),output,outputSha256:createHash('sha256').update(readFileSync(output)).digest('hex'),frames:8,sourceNeutralHeight:bodyHeight});
  console.log(`${name}: 8 frames, fixed scale, foot baseline 480/512`);
}
writeFileSync(`${out}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
