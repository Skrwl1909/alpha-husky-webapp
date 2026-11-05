#!/usr/bin/env node
/** Global arena routing contract: presentation-only, no changes to accepted runs. */
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const source=readFileSync(resolve(root,'tactical-ops-src/data/operations.ts'),'utf8');
const battlefieldMap=source.match(/export const MISSION_BATTLEFIELDS:[\s\S]*?\n};/)?.[0]||'';
const mapping={
 'broken-signal':'battlefield_broken_signal_mobile.webp',
 'dead-relay':'battlefield_dead_relay_mobile.webp',
 'field-ops':'battlefield_field_ops_mobile.webp'
};
for(const [key,file] of Object.entries(mapping)){
 assert(battlefieldMap.includes(`"${key}": { art: "/images/tactical_ops/battlefields/${file}" }`), 'Missing arena mapping '+key);
 const path=resolve(root,'images/tactical_ops/battlefields',file);
 assert(statSync(path).size>100000, 'Missing or suspiciously small authored arena: '+file);
 const buffer=readFileSync(path);
 assert.equal(buffer.toString('ascii',0,4),'RIFF','WebP RIFF header '+file);
 assert.equal(buffer.toString('ascii',8,12),'WEBP','WebP signature '+file);
}
assert(source.includes('regionId: "broken-signal", battlefield: "field-ops"'), 'Field Ops region must not be mutated while selecting new art');
for(const id of ['dead-relay-courier','dead-relay-hold','dead-relay-guardian']){
 const m=source.match(new RegExp('missionId: "'+id+'"[^\\n]*\\n\\s*battlefield: "dead-relay"'));
 assert(m, 'Dead Relay scene missing for '+id);
}
const battle=readFileSync(resolve(root,'tactical-ops-src/ui/Battle.tsx'),'utf8');
assert(battle.includes('src={missionBattlefield(mission).art}'),'Battle must use mission scene selector');
assert(battle.includes('data-projection="relay-overhead-v1"'),'Missing overhead camera marker');
console.log('PASS three distinct authored arena WebPs, global mission families and shared overhead renderer');
