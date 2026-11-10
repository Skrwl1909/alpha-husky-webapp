import { build } from "vite";
import { fileURLToPath } from "node:url";

await build({
  configFile: false,
  logLevel: "warn",
  build: {
    emptyOutDir: false,
    outDir: fileURLToPath(new URL("../artifacts/recover-authority-v1/", import.meta.url)),
    target: "node22",
    minify: true,
    lib: {
      entry: fileURLToPath(new URL("./tactical_recover_engine_v1.ts", import.meta.url)),
      formats: ["cjs"],
      fileName: () => "tactical_recover_engine_v1.cjs",
    },
  },
});
