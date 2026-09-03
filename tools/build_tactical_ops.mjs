#!/usr/bin/env node
/**
 * Canonical production builder for Tactical Ops.
 * The only runtime entry is tactical-ops-src/host/production-entry.ts.
 */
import { build } from "vite";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "tactical-ops-src");
const versionSource = readFileSync(join(sourceRoot, "version.ts"), "utf8");
const version = versionSource.match(/VERSION\s*=\s*"([^"]+)"/)?.[1];
const cacheKey = versionSource.match(/CACHE_KEY\s*=\s*"([^"]+)"/)?.[1];
if (!version || !cacheKey) {
  throw new Error("tactical-ops-src/version.ts must define VERSION and CACHE_KEY.");
}

const outFile = join(root, "js", "tactical_ops.js");
await build({
  configFile: false,
  root,
  build: {
    emptyOutDir: false,
    outDir: join(root, "js"),
    lib: {
      entry: join(sourceRoot, "host", "production-entry.ts"),
      name: "TacticalOpsBundle",
      formats: ["iife"],
      fileName: () => "tactical_ops.js",
    },
    minify: true,
    sourcemap: false,
    target: "es2020",
    rollupOptions: {
      output: {
        entryFileNames: "tactical_ops.js",
        exports: "named",
      },
    },
  },
  logLevel: "warn",
  define: { "process.env.NODE_ENV": '"production"' },
});

const bundled = readFileSync(outFile, "utf8");
writeFileSync(outFile, "/* " + version + " */\n" + bundled.replace(/^\/\* tactical_ops\.js[^*]*\*\/\s*/m, ""));

const loaderFile = join(root, "js", "boot_loaders.js");
const loader = readFileSync(loaderFile, "utf8");
const cacheMarker = /global\.WEBAPP_VER = "tops-[^"]+";/;
if (!cacheMarker.test(loader)) {
  throw new Error("Could not find Tactical Ops cache key in js/boot_loaders.js.");
}
const updatedLoader = loader.replace(
  cacheMarker,
  'global.WEBAPP_VER = "' + cacheKey + '";',
);
if (updatedLoader !== loader) writeFileSync(loaderFile, updatedLoader);
console.log("build_tactical_ops: wrote js/tactical_ops.js (" + version + ")");
