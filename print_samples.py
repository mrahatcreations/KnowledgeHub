import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('c:/Users/Rahat/Pictures/English/scratch/chunk_3_enriched.json', 'r', encoding='utf-8') as f:
    enr = json.load(f)

for lvl_idx in [0, 15, 33, 41, 59, 66]:
    lvl = enr['levels'][lvl_idx]
    print(f"\n==================== Level {lvl['level_id']}: {lvl.get('title')} ====================")
    for it in lvl['items']:
        print(f"ID {it['id']}: {it['word']} ({it['pos']}) -> {it['meaning']}")
        print(f"  Synonyms: {it['raw_synonyms']}")
        print(f"  Antonyms: {it['raw_antonyms']}")
        print(f"  Sentence: {it['sentence']}")
