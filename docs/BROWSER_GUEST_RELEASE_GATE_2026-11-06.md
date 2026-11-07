# Browser Guest — release gate 2026-11-06

Scope: **only** browser entry at https://app.alphahusky.win/?browser_guest=1. Do not change Telegram or packaged Android authentication, accounts, gameplay economy, or public site entry as part of this gate.

## Verified baseline (not a release certificate)

- Frontend PRs #237, #242 and #252 are merged. PR #252 merge: dbc930295c37393b7cd6ef21a02e476eff3a03c5.
- PR #252 Browser Guest offline workflow succeeded (synthetic session and fetch).
- Founder Chrome QA reported First Signal → Rustfang equip → Rogue Byte faction bind → Faction HQ → F5, with identity/faction/progress maintained.
- Client provides explicit guest creation (never on boot), sessionStorage SecureSession bearer, saved recovery-code flow, and recovery UI.
- Production API reachability, authenticated recovery, full Tactical Ops settlement, Mailbox 401, production rate limits, and Android/Telegram physical QA **have not been certified by CI**.
- Do not treat green synthetic tests as proof of production backend behavior.

## Gate A — authenticated read-only live API

Use a dedicated, disposable browser QA guest already created by a real tester. Do not use owner accounts, Telegram initData, the one-time guest recovery code, or any real player's token. Run locally on a trusted machine; never put the session token into a PR, chat, screenshot, log, GitHub Actions, or shell history.

Example using a hidden interactive prompt in a trusted terminal:

    read -rsp 'Temporary QA guest SecureSession: ' AH_QA_GUEST_SESSION_TOKEN; echo
    export AH_QA_GUEST_SESSION_TOKEN
    node tools/browser_guest_live_readonly_gate.mjs
    unset AH_QA_GUEST_SESSION_TOKEN

This tests six **read-only** POST routes using the same bearer/body contract as the canonical frontend. Outputs only route labels, HTTP statuses and PASS/FAIL. It does not create accounts or mutate player state. If any check fails, **HOLD** and diagnose that endpoint on the backend. This script never stores any bearer or recovery code.

A PASS on Gate A is **not** release GO.

## Gate B — real Chrome guest E2E (human, same dedicated QA identity)

1. New Chrome profile/incognito: explicitly choose Play as Guest; confirm no account is created until the click.
2. Copy and safely retain the one-time recovery code. Complete First Signal, equip Rustfang, bind a faction, reach Faction HQ.
3. Open Equipped and Inventory: no demo fixture, both reflect that exact player.
4. Complete a real eligible mission, record before/after in-game earned reward and progression (without sharing identifying data), refresh and ensure no duplication.
5. F5 and navigation to clean / URL in the **same tab**: same guest and progress, no second account.
6. Close the browsing session and return with the saved recovery code. Verify same profile, faction, inventory and mission state. Test expired session separately and ensure it prompts recovery rather than auto-creating another account.
7. Check Hub Current Signal and Avatar. Check browser console/network for Mailbox 401, NO_UID, unexpected 5xx and failed critical state requests. Do not upload screenshots containing tokens, network authorization headers or recovery code.
8. On the first-run PC flow, ensure buttons, keyboard interactions and map controls remain usable.

## Gate C — backend and platform safety

- Owner must inspect the **actual running** implementation and configuration of public POST /mobile/auth/start-new: per-source quotas/rate limits, abuse handling, no automatic creation on page load, recovery secret lifecycle and expiry, identity isolation, CORS allowlist. **CORS is not rate limiting**. Verify security with bounded controlled checks; do not flood the public endpoint.
- Prove real Telegram Mini App launch, play, mission settlement and persistence.
- Prove packaged Android APK launch, SecureSession auth, mission settlement and persistence, including guest recovery.
- One independent PC tester should complete the first session without founder assistance.

## Release decision

**GO for public Reddit browser testing only when Gates A, B and C are recorded PASS with evidence.** If a gate cannot be exercised, mark it **NOT VERIFIED**, not PASS. If any critical auth, identity, reward persistence, anti-abuse, or platform regression fails, mark **HOLD**.

Do not expand scope into new logins, social OAuth, wallet integration, UI redesign, Tactical Ops new features, or production-account mutations.
