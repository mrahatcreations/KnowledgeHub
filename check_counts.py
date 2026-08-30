import json

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for lvl in d['levels']:
    if len(lvl['items']) != 5:
        print(f"Level {lvl['level_id']} has {len(lvl['items'])} items: {[it['word'] for it in lvl['items']]}")

all_ids = [it['id'] for lvl in d['levels'] for it in lvl['items']]
print("Total levels:", len(d['levels']))
print("Total items:", len(all_ids))
print("Min id:", min(all_ids), "Max id:", max(all_ids))
print("Are IDs unique?", len(all_ids) == len(set(all_ids)))
