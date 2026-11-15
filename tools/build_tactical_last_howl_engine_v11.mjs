import { build } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
await build({
  root,
  configFile: false,
  logLevel: "warn",
  build: {
    emptyOutDir: false,
    outDir: resolve(process.argv[2] ?? resolve(root, "artifacts/last-howl-v11")),
    target: "node22",
    minify: true,
    lib: {
      entry: resolve(root, "tools/tactical_last_howl_engine_v11.ts"),
      formats: ["cjs"],
      fileName: () => "tactical_last_howl_engine_v11.cjs",
    },
  },
});
