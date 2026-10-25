import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {ASSETS} from './assets.js';
const root = new URL('./',import.meta.url), port = Number(process.env.PORT || 4173);
const repo = new URL('../../',root), assetPaths = new Set(Object.values(ASSETS));
const modules=new Set(['index.html','last-stand.css','last-stand.js','simulation.js','input.js','assets.js','presentation.js','combat-parameters.js','p2/demo-profiles.js','p3/balance.js']);
http.createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'') || 'index.html';
    // Git ignore is not a serving boundary. Never expose local adapters/source,
    // dot directories, traversal, tests or review files over the demo server.
    if(name.split(/[\\/]/).some(part=>part.startsWith('.'))||name.includes('\\')){res.writeHead(404);return res.end('Not found');}
    const asset = name.startsWith('assets/');
    if(asset&&!assetPaths.has('/'+name)){res.writeHead(404);return res.end('Not found');}
    const media=(name.startsWith('evidence/')||name.startsWith('p2/evidence-local/')||name.startsWith('p3/evidence-local/'))&&/\.(png|webm)$/.test(name);
    if(!asset&&!modules.has(name)&&!media){res.writeHead(404);return res.end('Not found');}
    const file=new URL(name,asset?repo:root);
    if(!file.href.startsWith((asset?repo:root).href)) {res.writeHead(403);return res.end();}
    const content=await readFile(fileURLToPath(file));
    res.setHeader('Content-Type',file.pathname.endsWith('.js')?'text/javascript':file.pathname.endsWith('.css')?'text/css':file.pathname.endsWith('.html')?'text/html':file.pathname.endsWith('.png')?'image/png':file.pathname.endsWith('.webp')?'image/webp':file.pathname.endsWith('.webm')?'video/webm':'application/octet-stream');res.end(content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Last Stand: http://127.0.0.1:${port}`));
