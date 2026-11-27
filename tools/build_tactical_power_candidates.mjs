import {build} from "vite";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
const root=fileURLToPath(new URL("../",import.meta.url));
const outDir=resolve(process.argv[2]??resolve(root,"artifacts/meaningful-power-candidates"));
await mkdir(outDir,{recursive:true});
const manifest={status:"CANDIDATE_NOT_CERTIFIED",sourceCommit:execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim(),workers:{}};
for(const family of ["operation","counterstrike","last-howl"]){
 const name="tactical_power_"+family.replaceAll("-","_")+"_candidate_v1.cjs";
 await build({root,configFile:false,logLevel:"warn",define:{POWER_WORKER_FAMILY:JSON.stringify(family)},build:{outDir,emptyOutDir:false,target:"node22",minify:true,lib:{entry:resolve(root,"tools/tactical_power_candidate_worker.ts"),formats:["cjs"],fileName:()=>name}}});
 const data=await readFile(resolve(outDir,name));
 manifest.workers[family]={file:name,sha256:createHash("sha256").update(data).digest("hex"),bytes:data.length};
}
await writeFile(resolve(outDir,"candidate-worker-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
console.log("Built candidate workers; NOT a production deployment package.");
