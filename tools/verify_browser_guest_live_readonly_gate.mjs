// Offline contract tests only. No real network, no real accounts or credentials.
import assert from "node:assert/strict";
import { CHECKS, runReadOnlyGate } from "./browser_guest_live_readonly_gate.mjs";

const sessionToken = "QA_TEST_TOKEN_ONLY_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const calls = [];
const passing = await runReadOnlyGate({
  sessionToken,
  fetchFn: async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 200, json: async () => ({ ok: true, data: {} }) };
  },
});
assert.equal(passing.pass, true);
assert.equal(passing.results.length, CHECKS.length);
assert.equal(calls.length, CHECKS.length);
for (let i = 0; i < calls.length; i++) {
  const { url, options } = calls[i];
  assert.equal(url, "https://api.alphahusky.win" + CHECKS[i][1]);
  assert.equal(options.method, "POST");
  assert.equal(options.headers.Authorization, "Bearer " + sessionToken);
  assert.deepEqual(JSON.parse(options.body), { session_token: sessionToken });
  assert.equal(options.cache, "no-store");
  assert.equal(options.redirect, "error");
  assert.ok(!url.includes("/mobile/auth/"));
  assert.ok(!url.includes("/action"));
  assert.ok(!url.includes("/dismiss"));
}

const mailboxFail = await runReadOnlyGate({
  sessionToken,
  fetchFn: async (url) => url.endsWith("/mailbox/state")
    ? { ok: false, status: 401, json: async () => ({ reason: "UNAUTHORIZED" }) }
    : { ok: true, status: 200, json: async () => ({ ok: true }) },
});
assert.equal(mailboxFail.pass, false);
assert.equal(mailboxFail.results.filter((row) => !row.pass).length, 1);
assert.deepEqual(mailboxFail.results.at(-1), { label: "Mailbox", status: 401, pass: false });

const transportFail = await runReadOnlyGate({
  sessionToken,
  fetchFn: async () => { throw new Error("TEST_NETWORK_ERROR_WITH_SENSITIVE_DETAIL"); },
});
assert.equal(transportFail.pass, false);
assert.ok(transportFail.results.every((row) => row.status === 0 && !row.pass));
await assert.rejects(runReadOnlyGate({ sessionToken: "" }), /session is required/);
console.log("PASS: Browser Guest read-only API gate offline contract, no account creation or mutations");
