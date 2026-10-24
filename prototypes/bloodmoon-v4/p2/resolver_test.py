import ast
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import unittest
from resolver import HERE, SOURCE, CATALOG, fixture_users, resolve_user, equipment

class SourceResolverTests(unittest.TestCase):
    def test_source_integrity_and_no_module_side_effects(self):
        manifest=json.loads((HERE/'source-manifest.json').read_text(encoding='utf-8'))
        for filename,entry in manifest['files'].items():
            data=(SOURCE/filename).read_bytes();self.assertEqual(hashlib.sha256(data).hexdigest(),entry['exportSha256'])
            tree=ast.parse(data.decode());self.assertTrue(all(isinstance(n,(ast.ImportFrom,ast.Assign,ast.FunctionDef)) for n in tree.body))
            self.assertTrue(entry['snapshotSameBytes'])
        self.assertEqual(set(CATALOG),{'rustfang_blade','rustfang_armor','frostborn_armor'})

    def test_real_resolver_totals_and_equipment_upgrades_without_caller_mutation(self):
        users=fixture_users(); original=deepcopy(users)
        a,b=(resolve_user(users[k]) for k in ('baseline','progressed'))
        self.assertEqual(users,original)
        self.assertEqual(a['effective']['gear']['strength'],2)
        self.assertEqual(a['effective']['totals']['strength'],12)
        self.assertEqual(b['effective']['gear']['strength'],7)
        self.assertEqual(b['effective']['totals']['vitality'],19)
        isolated=deepcopy(users['baseline']);isolated['equipment_data']={'rustfang_blade':{'level':3,'stat_bonus':{'strength':4}}}
        upgraded=resolve_user(isolated)
        self.assertGreater(upgraded['parameters']['player']['damagePerHit'],a['parameters']['player']['damagePerHit'])
        self.assertEqual(upgraded['wave'],a['wave'])

    def test_observed_v3_casing_fault_is_not_hidden(self):
        user=fixture_users()['baseline'];a=resolve_user(user);user['stats']['strength']+=100;b=resolve_user(user)
        self.assertEqual(a['observedV3']['totals']['STR'],0)
        self.assertEqual(a['observedV3']['damage'],b['observedV3']['damage'])
        self.assertGreater(b['bridgedRoll']['damage'],a['bridgedRoll']['damage'])
        self.assertEqual(a['observedV3']['playerHP'],50)

    def test_level_hp_and_unsupported_defense_are_separated(self):
        user=fixture_users()['baseline'];a=resolve_user(user)
        higher=deepcopy(user);higher['level']+=5
        self.assertGreater(resolve_user(higher)['bridgedRoll']['damage'],a['bridgedRoll']['damage'])
        tank=deepcopy(user);tank['stats']['vitality']+=5
        self.assertEqual(resolve_user(tank)['parameters']['player']['maxHP']-a['parameters']['player']['maxHP'],60)
        defense=deepcopy(user);defense['stats']['defense']+=100
        self.assertEqual(resolve_user(defense)['parameters'],a['parameters'])
        self.assertEqual(a['parameters']['enemy']['maxHP'],1000)
        self.assertEqual(resolve_user(higher)['parameters']['enemy']['maxHP'],1000)

    def test_invalid_unreachable_and_unsupported_inputs_fail_closed(self):
        user=fixture_users()['baseline']
        for value in (-1,float('nan'),True,'10'):
            bad=deepcopy(user);bad['stats']['strength']=value
            with self.assertRaises(ValueError):resolve_user(bad)
        bad=deepcopy(user);bad['equipment_data']={'rustfang_blade':{'level':2,'stat_bonus':{'strength':999}}}
        with self.assertRaises(ValueError):resolve_user(bad)
        bad=deepcopy(user);bad['active_pet_id']='unsupported'
        with self.assertRaises(ValueError):resolve_user(bad)

if __name__=='__main__':unittest.main(verbosity=2)
