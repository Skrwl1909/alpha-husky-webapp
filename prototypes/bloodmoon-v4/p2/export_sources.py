"""READ ONLY source extraction. Never import or execute the working backend.

Only reviewed function/constant AST nodes and two catalog definitions are copied.
No config/env, state, credentials, databases or player documents are read/copied.
"""
import ast
import hashlib
import json
from pathlib import Path
import zipfile

HERE = Path(__file__).resolve().parent
ROOT = Path('K:/ALPHA_WORKSPACE/ALPHA_BACKEND')
SNAPSHOT = Path('K:/ALPHA_WORKSPACE/AI_SNAPSHOTS/ALPHA_BACKEND_AI.zip')
SELECT = {
    'stats.py': ['STAT_KEYS','SHORT_OF','LONG_OF','norm_stats','add_stats','get_active_pet','get_equipment_bonus_long','get_set_bonuses_long','compute_full_stats'],
    'stats_core.py': ['STAT_KEYS','FRESH_PLAYER_DEFAULT_STATS','SHORT_OF','LONG_OF','norm_stats','_safe_int','add_stats','get_active_pet_id','get_active_pet','get_equipment_bonus_long','get_set_bonuses_long','compute_full_stats'],
    'equipment.py': ['SET_BONUSES','ALIASES_EQ','EQUIPMENT_SLOTS','ensure_equipment_data','get_item_effective_bonus','_mirror_keys_eq','get_total_equipment_bonus','get_active_set_bonuses'],
    'pets.py': ['PET_STAT_KEYS_LONG','compute_pet_effective_stats'],
    'bloodmoon_core.py': ['_safe_int','_extract_totals_from_user','_bloodmoon_player_hp_max','bloodmoon_roll_damage','_default_wave_hp','_default_wave'],
    'combat.py': ['CFG','_clamp','_pick','compute_player_max_hp','player_from_totals'],
}

def node_name(node):
    if isinstance(node, ast.FunctionDef): return node.name
    if isinstance(node, ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name): return node.targets[0].id
    return None

def export():
    destination = HERE/'verified_source'
    destination.mkdir(exist_ok=True)
    manifest = {'source':'owner-designated working backend, not verified deployed VPS','files':{},'unsupported':['active pets','prepared attempts','production rewards/attempt mutations']}
    with zipfile.ZipFile(SNAPSHOT) as archive:
        for filename,names in SELECT.items():
            original=(ROOT/filename).read_bytes(); text=original.decode('utf-8-sig'); tree=ast.parse(text)
            nodes=[n for n in tree.body if node_name(n) in names]
            if set(map(node_name,nodes))!=set(names): raise ValueError(f'Missing selected nodes: {filename}')
            excerpts=[]; evidence=[]
            for n in nodes:
                code=ast.get_source_segment(text,n)
                excerpts.append(f'# Original {filename}:{n.lineno}-{n.end_lineno}\n'+code.replace('\r\n','\n'))
                evidence.append({'name':node_name(n),'lines':[n.lineno,n.end_lineno],'sha256':hashlib.sha256(code.encode()).hexdigest()})
            content='# Isolated reviewed excerpts. See ../source-manifest.json.\nfrom __future__ import annotations\nfrom typing import Any, Dict, List, Tuple, Optional\n\n'+'\n\n'.join(excerpts)+'\n'
            (destination/filename).write_text(content,encoding='utf-8',newline='\n')
            matches=[i for i in archive.infolist() if Path(i.filename.replace('\\','/')).name==filename]
            manifest['files'][filename]={'workingFileSha256':hashlib.sha256(original).hexdigest(),'excerpts':evidence,'exportSha256':hashlib.sha256(content.encode()).hexdigest(),'snapshot':'ALPHA_BACKEND_AI.zip','snapshotSameBytes':any(archive.read(i)==original for i in matches)}
    catalog=json.loads((ROOT/'all_items.json').read_text(encoding='utf-8-sig'))
    safe={key:{field:catalog[key][field] for field in ['slot','stat_bonus','set','star_cap'] if field in catalog[key]} for key in ['rustfang_blade','rustfang_armor','frostborn_armor']}
    (destination/'catalog.json').write_text(json.dumps(safe,indent=2)+'\n',encoding='utf-8')
    manifest['catalog']={'keys':list(safe),'source':'all_items.json, game definitions only','sha256':hashlib.sha256(json.dumps(safe,sort_keys=True).encode()).hexdigest()}
    manifest['auditOnly']={}
    for filename,names in {
        'webapp_bloodmoon.py':['_auth_uid','_require_uid','bloodmoon_state_handler','bloodmoon_attack_handler'],
        'bloodmoon_transactions.py':['production','_command_key','_locks','_recover_locked','execute'],
        'alpha_den.py':['apply_war_room_prepared_attempt_damage_bonus','consume_war_room_prepared_attempt'],
        'data_store.py':['strict_user_state_path'],
    }.items():
        data=(ROOT/filename).read_bytes();text=data.decode('utf-8-sig');tree=ast.parse(text)
        manifest['auditOnly'][filename]={'workingFileSha256':hashlib.sha256(data).hexdigest(),'functions':[{'name':n.name,'lines':[n.lineno,n.end_lineno]} for n in ast.walk(tree) if isinstance(n,(ast.FunctionDef,ast.AsyncFunctionDef)) and n.name in names]}
    (HERE/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print('Exported reviewed source nodes and three item definitions; original backend untouched.')

if __name__=='__main__': export()
