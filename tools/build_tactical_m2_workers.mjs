import { build } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outDir = resolve(process.argv[2] ?? resolve(root, "artifacts/tactical-m2-workers"));
for (const [entry, output] of [
  ["tactical_recover_engine_v1.ts", "tactical_recover_engine_m2.cjs"],
  ["tactical_last_howl_engine_v11.ts", "tactical_last_howl_engine_m2.cjs"],
]) {
  await build({
    root,
    configFile: false,
    logLevel: "warn",
    build: {
      outDir,
      emptyOutDir: false,
      target: "node22",
      minify: true,
      lib: { entry: resolve(root, "tools", entry), formats: ["cjs"], fileName: () => output },
    },
  });
}
