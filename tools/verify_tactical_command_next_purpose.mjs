/** Protect player purpose after permanently completing optional Relay Lockdown. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const text=readFileSync('tactical-ops-src/ui/returnPurpose.ts','utf8');
assert(text.includes('if (recorded) candidates.push(lockdown);'),'completed Lockdown must be optional');
assert(text.includes('else primary = lockdown;'),'unfinished Lockdown remains primary');
assert(text.includes("a.title === 'SECURE A FIELD OP' ? 0"),'unfinished Field Op first');
assert(text.includes("a.title === 'ADVANCED CHALLENGE' ? 2 : 3"),'finished practice ranks last');
assert(text.includes('if (!saved) for (const title'),'accepted-run alternatives stay suppressed');
assert(text.includes("const used = new Set(primary ? [primary.missionId] : []);"),'mission target dedup retained');
console.log('PASS: finished optional Lockdown cannot displace eligible rotation progress; no accepted-run changes');
