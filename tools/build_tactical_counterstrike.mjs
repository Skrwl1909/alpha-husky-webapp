import {build} from "vite";
import {resolve} from "node:path";
await build({configFile:false,logLevel:"warn",build:{
 outDir:resolve(process.argv[2]??"artifacts/counterstrike-workers"),emptyOutDir:false,target:"node22",minify:true,
 lib:{entry:resolve("tools/tactical_counterstrike_engine_v1.ts"),formats:["cjs"],fileName:()=>"tactical_counterstrike_engine_v1.cjs"}}});
