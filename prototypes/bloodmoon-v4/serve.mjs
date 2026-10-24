import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root = new URL('./',import.meta.url), port = Number(process.env.PORT || 4173);
http.createServer(async(req,res)=>{
  try {
    const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'') || 'index.html';
    const file=new URL(name,root);
    if(!file.href.startsWith(root.href)) {res.writeHead(403);return res.end();}
    const content=await readFile(fileURLToPath(file));
    res.setHeader('Content-Type',file.pathname.endsWith('.js')?'text/javascript':file.pathname.endsWith('.css')?'text/css':file.pathname.endsWith('.html')?'text/html':file.pathname.endsWith('.png')?'image/png':'application/octet-stream');res.end(content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Last Stand: http://127.0.0.1:${port}`));
