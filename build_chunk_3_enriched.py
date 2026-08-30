# -*- coding: utf-8 -*-
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

import enrich_part1
import part2_a
import part2_b
import part3_a
import part3_b
import part4_a
import part4_b
import part4_c

all_enrichments = {}
all_enrichments.update(enrich_part1.PART_1)
all_enrichments.update(part2_a.ITEMS)
all_enrichments.update(part2_b.ITEMS)
all_enrichments.update(part3_a.ITEMS)
all_enrichments.update(part3_b.ITEMS)
all_enrichments.update(part4_a.ITEMS)
all_enrichments.update(part4_b.ITEMS)
all_enrichments.update(part4_c.ITEMS)

print(f"Total enrichments compiled: {len(all_enrichments)}")
assert len(all_enrichments) == 335, f"Expected 335, got {len(all_enrichments)}"

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    chunk3_data = json.load(f)

valid_pos = {'n', 'v', 'adj', 'adv', 'prep', 'phrase'}

errors = []
enriched_levels = []

for lvl in chunk3_data['levels']:
    lvl_id = lvl['level_id']
    enriched_items = []
    
    for item in lvl['items']:
        item_id = item['id']
        if item_id not in all_enrichments:
            errors.append(f"Missing enrichment for item {item_id} ({item.get('word')})")
            continue
            
        enr = all_enrichments[item_id]
        
        # Validations
        pos = enr['pos']
        if pos not in valid_pos:
            errors.append(f"Invalid POS '{pos}' for item {item_id} ({item.get('word')})")
            
        meaning = enr['meaning'].strip()
        if not meaning:
            errors.append(f"Empty meaning for item {item_id}")
            
        synonyms = enr['synonyms']
        if not (2 <= len(synonyms) <= 4):
            errors.append(f"Synonyms count {len(synonyms)} not in [2, 4] for item {item_id} ({item.get('word')})")
            
        antonyms = enr['antonyms']
        if not (2 <= len(antonyms) <= 4):
            errors.append(f"Antonyms count {len(antonyms)} not in [2, 4] for item {item_id} ({item.get('word')})")
            
        raw_synonyms = ", ".join(synonyms)
        raw_antonyms = ", ".join(antonyms)
        sentence = enr['sentence'].strip()
        
        if not sentence or len(sentence) < 15:
            errors.append(f"Sentence too short or empty for item {item_id}: '{sentence}'")
            
        enriched_item = {
            "id": item_id,
            "word": item['word'],
            "pos": pos,
            "meaning": meaning,
            "synonyms": synonyms,
            "antonyms": antonyms,
            "raw_synonyms": raw_synonyms,
            "raw_antonyms": raw_antonyms,
            "sentence": sentence,
            "category": item.get('category', lvl.get('category', 'Vocabulary')),
            "unit": item.get('unit', lvl.get('unit', 'Vocabulary'))
        }
        enriched_items.append(enriched_item)
        
    enriched_lvl = dict(lvl)
    enriched_lvl['items'] = enriched_items
    enriched_levels.append(enriched_lvl)

if errors:
    print(f"FAILED with {len(errors)} errors:")
    for err in errors[:20]:
        print(" -", err)
    sys.exit(1)

output_data = {
    "levels": enriched_levels
}

output_path = 'c:/Users/Rahat/Pictures/English/scratch/chunk_3_enriched.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {output_path} with {len(enriched_levels)} levels and {sum(len(l['items']) for l in enriched_levels)} items.")
