import json

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

lines = []
for lvl in d['levels']:
    lines.append(f"=== Level {lvl['level_id']} ({lvl.get('title')}) ===")
    for it in lvl['items']:
        lines.append(f"ID: {it['id']} | Word: {it['word']} | POS: {it.get('pos')} | Meaning: {it.get('meaning')} | Sentence: {it.get('sentence')}")

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3_raw_list.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))
print('Success, total levels:', len(d['levels']))
