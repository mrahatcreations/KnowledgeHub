import json

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3.json', 'r', encoding='utf-8') as f:
    d = json.load(f)

for it in d['levels'][197 - 135]['items']:
    print(it['id'], it['word'])
