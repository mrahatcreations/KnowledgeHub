import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for lvl in d['levels']:
    if 177 <= lvl['level_id'] <= 201:
        print(f"--- Level {lvl['level_id']} ({lvl.get('title')}) ---")
        for it in lvl['items']:
            print(f"ID:{it['id']} | Word:{it['word']} | POS:{it.get('pos')} | Meaning:{it.get('meaning')} | Sentence:{it.get('sentence')}")
