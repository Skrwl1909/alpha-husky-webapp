import {stepCounterstrike} from "../tactical-ops-src/combat/counterstrikeAuthority";
async function main(){
 let input="";process.stdin.setEncoding("utf8");
 for await(const chunk of process.stdin){input+=chunk;if(input.length>512000)throw Error("input_too_large");}
 const {encounter,snapshot,command}=JSON.parse(input);
 process.stdout.write(JSON.stringify(stepCounterstrike(encounter,snapshot,command)));
}
void main().catch(e=>{console.error(e.message);process.exitCode=1;});
