import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for lvl in d['levels']:
    words = [it['word'] for it in lvl['items']]
    print(f"L{lvl['level_id']} [{lvl.get('title', '')}] ({lvl.get('category', '')}): {', '.join(words)}")
