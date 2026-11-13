import { stepRecover } from "../tactical-ops-src/combat/recoverAuthority";

// Private stdin/stdout contract. The Python service supplies the frozen encounter and state.
async function main() {
  process.stdin.setEncoding("utf8");
  let text = "";
  for await (const chunk of process.stdin) {
    text += chunk;
    if (text.length > 256_000) throw Error("recover_input_too_large");
  }
  const { encounter, snapshot, command } = JSON.parse(text);
  process.stdout.write(JSON.stringify(stepRecover(encounter, snapshot, command)));
}

void main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
