"""Isolated execution of audited source excerpts, never production imports/I/O.

The casing bridge, strike divisor and incoming hazard damage are PROPOSED P2
choices. The observed V3 path is reported separately and retained unchanged.
"""
import builtins
from copy import deepcopy
import json
from pathlib import Path
import random
from types import SimpleNamespace

HERE=Path(__file__).resolve().parent
SOURCE=HERE/'verified_source'
PROPOSED={'id':'p2-proposal-1','statBridge':'long keys to the uppercase Blood Moon interface','strikeDivisor':8,'hazardDamage':60,'defenseMitigation':'not applied: no Blood Moon retaliation rule verified'}

def _load(filename,dependencies=None):
    namespace={'__name__':'isolated_'+filename.replace('.py',''),**(dependencies or {})}
    exec(compile((SOURCE/filename).read_text(encoding='utf-8'),str(SOURCE/filename),'exec'),namespace)
    return namespace

CATALOG=json.loads((SOURCE/'catalog.json').read_text(encoding='utf-8'))
equipment=_load('equipment.py',{'ALL_ITEMS':deepcopy(CATALOG)})
pets=_load('pets.py')
dependencies={name:equipment[name] for name in ['get_total_equipment_bonus','get_active_set_bonuses']}
dependencies['compute_pet_effective_stats']=pets['compute_pet_effective_stats']
legacy=_load('stats.py',dependencies)
canonical=_load('stats_core.py',dependencies)
shared=_load('combat.py')

def validate_user(user):
    if not isinstance(user,dict) or type(user.get('level')) is not int or not 1<=user['level']<=1000: raise ValueError('Invalid synthetic character level')
    for key,value in (user.get('stats') or {}).items():
        if key not in canonical['STAT_KEYS'] or type(value) is not int or not 0<=value<=1_000_000: raise ValueError('Invalid allocated stat')
    if user.get('active_pet_id') or user.get('active_pet') or (user.get('equipment') or {}).get('pet') or (user.get('equipped') or {}).get('pet'):
        raise ValueError('Active-pet integration is not supported by this deliberately bounded source slice')
    if user.get('alpha_den'):
        raise ValueError('Prepared-attempt and other War Room modifiers are outside this bounded preview')
    slots={row['slot']:row['level_req'] for row in equipment['EQUIPMENT_SLOTS']}
    for slot,key in (user.get('equipment') or user.get('equipped') or {}).items():
        if key not in CATALOG or CATALOG[key]['slot']!=slot or user['level']<slots.get(slot,1001): raise ValueError('Invalid or locked equipment slot')
        data=(user.get('equipment_data') or {}).get(key)
        if data:
            level=data.get('level'); bonus=data.get('stat_bonus')
            if type(level) is not int or not 1<=level<=5 or not isinstance(bonus,dict): raise ValueError('Invalid equipment snapshot')
            base=CATALOG[key]['stat_bonus']
            # Synthetic saved upgrades must be reachable through the inspected
            # forge branch: each level adds one or two points to existing stats.
            if set(bonus)!=set(base) or any(type(v) is not int or v<base[k] for k,v in bonus.items()): raise ValueError('Invalid equipment bonuses')
            gain=sum(bonus.values())-sum(base.values())
            if not level-1<=gain<=2*(level-1): raise ValueError('Unreachable synthetic upgrade')

def resolve_user(user,seed=1909):
    validate_user(user); untouched=deepcopy(user)
    effective=canonical['compute_full_stats'](deepcopy(user))
    legacy_effective=legacy['compute_full_stats'](deepcopy(user))
    if effective['totals']!=legacy_effective['totals']: raise ValueError('Resolver paths disagree for supported fixture')
    def roll(bridge):
        def stats_resolution(value):
            full=legacy['compute_full_stats'](deepcopy(value))
            if bridge:
                aliases={'strength':'STR','agility':'AGI','intelligence':'INT','vitality':'VIT','luck':'LUCK'}
                full={**full,'totals':{out:full['totals'][key] for key,out in aliases.items()}}
            return full
        def isolated_import(name,globals=None,locals=None,fromlist=(),level=0):
            if name=='stats': return SimpleNamespace(compute_full_stats=stats_resolution)
            if name in ('typing','__future__'): return builtins.__import__(name,globals,locals,fromlist,level)
            raise ImportError('Production imports prohibited: '+name)
        bm=_load('bloodmoon_core.py',{'random':random.Random(seed),'__builtins__':{**vars(builtins),'__import__':isolated_import}})
        result=bm['bloodmoon_roll_damage'](deepcopy(user))
        return result,bm['_bloodmoon_player_hp_max'](result['totals']),bm['_default_wave'](1,True)
    observed,observed_hp,wave=roll(False)
    proposed,player_hp,_=roll(True)
    if user!=untouched: raise AssertionError('Source resolver mutated caller input')
    return {'input':untouched,'effective':effective,'sharedCombatInformationalOnly':shared['player_from_totals'](effective['totals']),
            'observedV3':{**observed,'playerHP':observed_hp},'bridgedRoll':proposed,'proposal':deepcopy(PROPOSED),'wave':wave,
            'parameters':{'version':1,'provenance':'resolved-input','player':{'maxHP':player_hp,'damagePerHit':proposed['damage']/PROPOSED['strikeDivisor']},'enemy':{'id':'tower_husk','maxHP':wave['hpMax'],'damagePerHit':PROPOSED['hazardDamage']}}}

def fixture_users():
    baseline={'level':10,'stats':{'strength':10,'agility':5,'defense':4,'vitality':10,'luck':2,'intelligence':2},'stat_points':0,'equipment':{'weapon':'rustfang_blade','armor':'rustfang_armor'},'pets':{}}
    progressed={'level':20,'stats':{'strength':20,'agility':10,'defense':8,'vitality':16,'luck':5,'intelligence':5},'stat_points':0,'equipment':{'weapon':'rustfang_blade','armor':'frostborn_armor'},'pets':{},
                'equipment_data':{'rustfang_blade':{'level':3,'stat_bonus':{'strength':4}},'frostborn_armor':{'level':3,'stat_bonus':{**CATALOG['frostborn_armor']['stat_bonus'],'vitality':3}}}}
    return {'baseline':baseline,'progressed':progressed}

def export_scenarios():
    output={key:resolve_user(user) for key,user in fixture_users().items()}
    for key,scenario in output.items():
        scenario['label']='Backend-resolved synthetic '+key+' (P2 proposal)'
        print(key,json.dumps({'totals':scenario['effective']['totals'],'observedV3':scenario['observedV3'],'bridgedRoll':scenario['bridgedRoll'],'parameters':scenario['parameters']},sort_keys=True))
    (HERE/'scenarios.js').write_text('// Generated by resolver.py from audited source and synthetic inputs. Not account data.\nexport const P2_SCENARIOS = '+json.dumps(output,indent=2)+';\n',encoding='utf-8')
    return output

if __name__=='__main__':
    import sys
    if len(sys.argv)==3 and sys.argv[1]=='--json':
        key=sys.argv[2]
        if key not in fixture_users(): raise SystemExit('Unknown synthetic profile')
        print(json.dumps(resolve_user(fixture_users()[key]),sort_keys=True))
    else: export_scenarios()
