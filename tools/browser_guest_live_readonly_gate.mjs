// Browser Guest release gate: authenticated production reads only.
// Never create accounts, recover guests, mutate gameplay, or print secrets.
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const CHECKS = Object.freeze([
  ["Player state", "/webapp/state"],
  ["Player profile", "/webapp/profile"],
  ["Equipped", "/webapp/equipped/state"],
  ["Inventory", "/webapp/inventory/state"],
  ["Mission state", "/webapp/missions/state"],
  ["Mailbox", "/webapp/mailbox/state"],
]);
const API_ORIGIN = "https://api.alphahusky.win";

export async function runReadOnlyGate({ sessionToken, fetchFn = fetch, timeoutMs = 10000 } = {}) {
  const token = String(sessionToken || "").trim();
  if (token.length < 16) throw new Error("A temporary QA guest session is required; no account will be created.");
  const results = [];
  for (const [label, path] of CHECKS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchFn(API_ORIGIN + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ session_token: token }),
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => null);
      const pass = response.ok && payload && typeof payload === "object" &&
        !Array.isArray(payload) && payload.ok !== false && !payload.error;
      results.push({ label, status: Number(response.status) || 0, pass: Boolean(pass) });
    } catch (_) {
      // Do not print network exceptions: they may contain request details.
      results.push({ label, status: 0, pass: false });
    } finally {
      clearTimeout(timeout);
    }
  }
  return { pass: results.every((result) => result.pass), results };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const sessionToken = process.env.AH_QA_GUEST_SESSION_TOKEN;
  if (!sessionToken) {
    console.error("HOLD: provide AH_QA_GUEST_SESSION_TOKEN from an existing disposable QA guest.");
    process.exitCode = 2;
  } else {
    const result = await runReadOnlyGate({ sessionToken });
    for (const row of result.results) {
      console.log((row.pass ? "PASS" : "FAIL") + " | " + row.label + " | HTTP " + row.status);
    }
    console.log(result.pass
      ? "READ-ONLY PASS. NOT RELEASE GO: browser E2E, recovery, mission persistence, anti-abuse and APK/TG checks are still required."
      : "HOLD: authenticated browser guest read-only API check failed.");
    if (!result.pass) process.exitCode = 1;
  }
}
