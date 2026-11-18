import { build } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const outDir = resolve(process.argv[2] ?? resolve(root, "artifacts/tactical-m2-workers"));
const suffix = process.argv[3] ?? "m2";
if (!["m2", "blood_scent_v1", "pack_link_v1"].includes(suffix)) throw Error("Unknown worker version");
for (const [entry, output] of [
  ["tactical_recover_engine_v1.ts", `tactical_recover_engine_${suffix}.cjs`],
  ["tactical_last_howl_engine_v11.ts", `tactical_last_howl_engine_${suffix}.cjs`],
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
