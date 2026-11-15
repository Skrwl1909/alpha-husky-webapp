import { stepLastHowl } from "../tactical-ops-src/combat/lastHowlAuthority";

async function main() {
  process.stdin.setEncoding("utf8");
  let input = "";
  for await (const chunk of process.stdin) {
    input += chunk;
    if (input.length > 256_000) throw Error("last_howl_input_too_large");
  }
  const { encounter, snapshot, command } = JSON.parse(input);
  process.stdout.write(JSON.stringify(stepLastHowl(encounter, snapshot, command)));
}

void main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
