import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const files = Object.fromEntries([
  'js/factions.js',
  'js/faction_hq.js',
  'js/faction_identity.js',
  'js/oath.js',
  'js/campaign.js',
  'js/story_delivery.js',
  'js/onboarding.js',
  'js/map.js',
].map(path => [path, load(path)]));
const map = JSON.parse(load('map.json'));
const node = id => {
  const found = map.nodes.find(n => n.id === id);
  assert.ok(found, 'Missing map node: ' + id);
  return found;
};
const includes = (path, text) => assert.ok(files[path].includes(text), path + ': missing expected lore phrase: ' + text);
const excludes = (path, text) => assert.ok(!files[path].includes(text), path + ': stale lore phrase: ' + text);

includes('js/faction_identity.js', 'creed:"ENDURE"');
includes('js/faction_identity.js', 'creed:"REMEMBER"');
includes('js/factions.js', 'Line-holding war-path of the fractured Alpha Network.');
includes('js/factions.js', 'Memory-and-strategy war-path of the fractured Alpha Network.');
includes('js/factions.js', 'Loyalty | Defense | Endurance');
includes('js/factions.js', 'Memory | Strategy | Legacy');
includes('js/faction_hq.js', 'Inner Howl holds the line through loyalty, discipline, and endurance');
includes('js/faction_hq.js', "Echo Wardens preserve the Pack's knowledge, records, and hard-won lessons");
excludes('js/factions.js', 'Insight doctrine of the fractured Alpha Network');
excludes('js/factions.js', 'Line-holding war-path of the fractured Alpha Network. Defend signal routes');
excludes('js/faction_hq.js', 'Inner Howl reads anomalies, echoes, and hidden pressure');
excludes('js/faction_hq.js', 'Echo Wardens guard routes, archives, and ground');

includes('js/campaign.js', 'The Pack is still divided.');
includes('js/story_delivery.js', "The Meme War didn't end the struggle. The Pack is still divided.");
includes('js/map.js', 'line1El.textContent = "Fractured Network"');
excludes('js/campaign.js', 'Now the Pack is fracturing.');
excludes('js/campaign.js', 'The fracture has begun');
excludes('js/story_delivery.js', 'The Pack is fracturing.');
excludes('js/campaign.js', 'return "Inner Howlers";');

includes('js/onboarding.js', 'Check your stats');
excludes('js/onboarding.js', 'See what Alpha recorded');
assert.ok(node('phantom_nodes').desc.includes('Static Maw'));
assert.ok(node('phantom_nodes').lore.factionAngles.pack_burners.includes('Static Maw'));
assert.ok(node('phantom_nodes').lore.factionAngles.inner_howl.includes('holds vital relay'));
assert.ok(node('phantom_nodes').lore.factionAngles.echo_wardens.includes('signal records'));
for (const id of ['phantom_nodes', 'blood_moon_tower', 'edge_of_chain', 'alpha_network_hq', 'broken_contracts']) {
  const angles = node(id).lore.factionAngles;
  assert.equal(typeof angles.inner_howl, 'string', id + ' Inner Howl missing');
  assert.equal(typeof angles.echo_wardens, 'string', id + ' Echo Wardens missing');
}
assert.ok(node('howl_treasury').lore.identity.includes("Pack's world and community events"));
console.log('PASS: Canon copy alignment — factions, campaign, map, onboarding and continuity.');
