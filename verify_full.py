# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    orig = json.load(f)

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3_enriched.json', 'r', encoding='utf-8') as f:
    enr = json.load(f)

print("=== VERIFICATION REPORT ===")
print("Original levels count:", len(orig['levels']))
print("Enriched levels count:", len(enr['levels']))

assert len(orig['levels']) == len(enr['levels']) == 67

allowed_pos = {'n', 'v', 'adj', 'adv', 'prep', 'phrase'}

issues = []

total_items = 0
for idx, (olvl, elvl) in enumerate(zip(orig['levels'], enr['levels'])):
    if olvl['level_id'] != elvl['level_id']:
        issues.append(f"Level ID mismatch at index {idx}: {olvl['level_id']} vs {elvl['level_id']}")
    if len(elvl['items']) != 5:
        issues.append(f"Level {elvl['level_id']} has {len(elvl['items'])} items instead of 5")
        
    for oitem, eitem in zip(olvl['items'], elvl['items']):
        total_items += 1
        iid = eitem['id']
        word = eitem['word']
        
        if oitem['id'] != eitem['id']:
            issues.append(f"ID mismatch: {oitem['id']} vs {eitem['id']}")
        if oitem['word'] != eitem['word']:
            issues.append(f"Word mismatch at ID {iid}: {oitem['word']} vs {eitem['word']}")
            
        pos = eitem.get('pos')
        if pos not in allowed_pos:
            issues.append(f"Invalid POS '{pos}' at ID {iid} ({word})")
            
        meaning = eitem.get('meaning', '')
        if not meaning or len(meaning.strip()) < 2:
            issues.append(f"Invalid/empty meaning at ID {iid} ({word})")
            
        syns = eitem.get('synonyms', [])
        if not isinstance(syns, list) or not (2 <= len(syns) <= 4):
            issues.append(f"Invalid synonyms count {len(syns)} at ID {iid} ({word})")
            
        ants = eitem.get('antonyms', [])
        if not isinstance(ants, list) or not (2 <= len(ants) <= 4):
            issues.append(f"Invalid antonyms count {len(ants)} at ID {iid} ({word})")
            
        raw_syn = eitem.get('raw_synonyms', '')
        if raw_syn != ", ".join(syns):
            issues.append(f"Raw synonyms mismatch at ID {iid} ({word})")
            
        raw_ant = eitem.get('raw_antonyms', '')
        if raw_ant != ", ".join(ants):
            issues.append(f"Raw antonyms mismatch at ID {iid} ({word})")
            
        sentence = eitem.get('sentence', '')
        if not sentence or len(sentence.strip()) < 15:
            issues.append(f"Sentence too short/empty at ID {iid} ({word}): '{sentence}'")

print(f"Total items verified: {total_items}")
print(f"Level IDs range: {enr['levels'][0]['level_id']} to {enr['levels'][-1]['level_id']}")
print(f"Item IDs range: {enr['levels'][0]['items'][0]['id']} to {enr['levels'][-1]['items'][-1]['id']}")

if issues:
    print(f"FAILED: Found {len(issues)} issues:")
    for iss in issues:
        print(" -", iss)
else:
    print("ALL 335 ITEMS AND 67 LEVELS PASSED 100% OF VALIDATION CHECKS!")
