# Public synthetic progression demo

This directory contains public demo fixtures and a local validation utility. It contains no backend stat formula, raw backend implementation, account record, source-derived stat breakdown or production integration. The numeric demonstration values remain unchanged:

| Fixture | Player HP | Damage/hit | Same enemy HP | Incoming hazard |
|---|---:|---:|---:|---:|
| Baseline | 170 | 10.5 | 1000 | 60 |
| Progressed | 278 | 16.875 | 1000 | 60 |

These are synthetic resolved snapshots. Public tests prove deterministic behavior and local validation rules, **not private backend stat resolution or live account integration**. The validation utility has no HTTP endpoint, persistence or rewards; every receipt awards zero credit. Input replay cannot prove human input.

## Clean public checkout

Node 22+, original repository assets present, no dependency installation or Python required:

```sh
node prototypes/bloodmoon-v4/simulation.test.mjs
node prototypes/bloodmoon-v4/presentation.test.mjs
node prototypes/bloodmoon-v4/p2/authority.test.mjs
node prototypes/bloodmoon-v4/p2/compatibility.test.mjs
node prototypes/bloodmoon-v4/p2/public-safety.test.mjs
node prototypes/bloodmoon-v4/serve.mjs
```

Open http://127.0.0.1:4173/ . Default is Baseline; select Progressed in local progression controls. P1 Standard/Stronger remain available. The engine, warnings, recovery escalation and collision rules are unchanged. Historical V1/V2/V3 traces are stored compactly with original event digests.

Set `DEMO_URL` to the running demo URL to enable the HTTP serving-boundary test; otherwise that one check is explicitly **SKIPPED**. Use `node prototypes/bloodmoon-v4/p2/public-safety.test.mjs --public-export` on a clean export to require that private material is absent.

Browser checks use the established dedicated Chrome/CDP setup. Run `node prototypes/bloodmoon-v4/browser.test.mjs` for P1 regression and `node prototypes/bloodmoon-v4/p2/browser-p2.test.mjs` for both progression fixtures. `DEMO_URL` / `CDP_URL` select alternate local ports. Output is generated under ignored `evidence-local/`, including recordings, screenshots and replay data; it is not committed. No external/live API calls are needed.

## Optional developer-only integration

The owner can provision a private adapter under ignored `.private/adapter.mjs`, or set `BLOODMOON_PRIVATE_ADAPTER` to an owner-controlled local module. That adapter may extract required non-sensitive source from the designated read-only backend into its own ignored working directory. Do not import or run original backend startup code, read player databases, expose credentials or contact production.

The adapter protocol exports async `verifySources()`, `resolveProfile(id)` and `resolveFreshProfile()`. It returns only validated resolved parameters; raw source, paths, formulas, input/account data, extraction tools and provenance manifests stay local or in an appropriate private repository. No adapter or backend source is distributed in this public checkout.

```sh
node prototypes/bloodmoon-v4/p2/private-integration.test.mjs
```

With an owner-provisioned adapter this runs separate source integration checks. Without it, the command exits **2 / NOT AVAILABLE**, with zero integration tests run; it does not substitute synthetic fixtures or report success.

## Balance and verification limits

At the 50-HP fresh-player boundary, the unchanged 60-damage hazard is lethal in one hit. The public safety test isolates that HP risk; it does not claim to calculate private fresh-account offense. The optional local integration check verifies fresh-character resolved HP independently. No tuning was silently changed to address this risk.

Physical Android/iPhone, broad human balance, production account/authentication, authoritative economic settlement and anti-cheat remain unverified/unimplemented. Keep production attempts, cooldowns, contribution and rewards untouched.

## Exact public files

`.gitignore`, `README.md`, `demo-profiles.js`, `driver.mjs`, `preview-authority.mjs`, `authority.test.mjs`, `compatibility-fixtures.json`, `compatibility.test.mjs`, `private-integration.test.mjs`, `public-safety.test.mjs`, `browser-p2.test.mjs`.

Everything under `.private/` and `evidence-local/` is local-only. The demo server rejects private/dot paths and only serves approved runtime files, original asset paths and non-sensitive generated image/video output. Git ignore alone is not a serving boundary.
