import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_1.json', 'r', encoding='utf-8') as f:
    d1 = json.load(f)
print("Chunk 1 sample item:", json.dumps(d1['levels'][0]['items'][0], ensure_ascii=False, indent=2))
