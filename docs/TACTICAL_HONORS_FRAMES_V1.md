# Tactical Honors — Profile Frames V1

- Broken Signal Frame (Rare): win a server-verified Signal Commander battle that clears Operation 01.
- Fracture Vanguard Frame (Epic): win a normal server-verified Advanced Field Op and meet its bonus challenge.
- Both assets already exist in Tactical Honors V2. These are cosmetic, permanent, opt-in profile frames; no combat power, new currencies, or auto-equip.
- The Tactical Honors collection queries the authenticated existing profile frames endpoint; missing or inconsistent records cannot yield an unlocked state.
- The saved reward receipt links to the existing profile frame gallery. On a backend preceding this release, the collection reports frame ownership as unverified.
- No retrospective awards from historical unverified combat or practice. Verified new victories/replays of the battle (not API receipt replays) can earn the frame once.
- Deploy the isolated backend delta first. No frontend-only ownership or grant.
