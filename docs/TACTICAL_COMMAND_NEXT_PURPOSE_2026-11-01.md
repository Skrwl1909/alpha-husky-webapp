# Tactical Ops — Next Purpose After Relay Lockdown (Nov 1, 2026)

## Observed on Samsung S26 Ultra / Telegram
After an accepted Field Relay Intercept, the server recorded Veteran 1/12 and changed Signal Pressure. A later completed Relay Lockdown was nevertheless featured as the top Command Priority even though it offers no additional currency or progression.

## Implementation
- Preserve accepted-run resume as the top priority.
- Before first Lockdown clear: preserve legitimate relay challenge.
- Once first Lockdown clear is permanently recorded: prefer an unfinished eligible rotation first clear, optional challenge or Advanced objective before practice.
- Keep recorded Relay Lockdown available in a separate optional route. It stays reward-free.
- Do not change reward conditions, mission-start contracts, saved run, battle, backend or results.

## QA / Release gate
- Canonical bundle version `3.6.26-next-purpose`.
- `verify_tactical_depth01.mjs` validates that recorded Lockdown is not the primary target when a rotation has eligible progress, and that it remains selectable.
- Existing full Tactical CI, source/bundle parity and Playwright fixtures must pass on the final commit.
- In Telegram on a test account: verify accepted run resumes; a completed Lockdown at Veteran 1/12 yields unfinished eligible rotation as primary; optional Lockdown available; result receipts and Mastery unchanged.
- Vercel alone is not valid device/real-backend acceptance. No automatic merge.
