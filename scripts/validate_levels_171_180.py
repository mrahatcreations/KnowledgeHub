import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

all_passed = True
total_items_validated = 0
seen_ids = set()

for lid in range(171, 181):
    file_path = os.path.join("public", "data", "levels", f"level_{lid}.json")
    if not os.path.exists(file_path):
        print(f"FAIL: File {file_path} does not exist!")
        all_passed = False
        continue

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"FAIL: {file_path} is invalid JSON: {e}")
        all_passed = False
        continue

    # Check top level
    if data.get("level_id") != lid:
        print(f"FAIL: {file_path} level_id mismatch: expected {lid}, got {data.get('level_id')}")
        all_passed = False

    items = data.get("items", [])
    if len(items) != 5:
        print(f"FAIL: {file_path} does not have 5 items (has {len(items)})")
        all_passed = False

    for item in items:
        iid = item.get("id")
        word = item.get("word")
        ipa = item.get("ipa")
        pos = item.get("pos")
        meaning = item.get("meaning")
        synonyms = item.get("synonyms")
        antonyms = item.get("antonyms")
        raw_syn = item.get("raw_synonyms")
        raw_ant = item.get("raw_antonyms")
        sentence = item.get("sentence")
        sentence_meaning = item.get("sentence_meaning")

        if not isinstance(iid, int) or iid in seen_ids:
            print(f"FAIL in Level {lid}: Invalid or duplicate id {iid}")
            all_passed = False
        seen_ids.add(iid)

        if not word or not isinstance(word, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid word '{word}'")
            all_passed = False

        if not ipa or not ipa.startswith("/") or not ipa.endswith("/"):
            print(f"FAIL in Level {lid}, item {iid}: Invalid IPA '{ipa}'")
            all_passed = False

        if not pos or not isinstance(pos, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid pos '{pos}'")
            all_passed = False

        if not meaning or not isinstance(meaning, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid meaning '{meaning}'")
            all_passed = False

        if not isinstance(synonyms, list) or not (3 <= len(synonyms) <= 4):
            print(f"FAIL in Level {lid}, item {iid}: Synonyms count should be 3-4, got {len(synonyms) if isinstance(synonyms, list) else 'non-list'}")
            all_passed = False

        if not isinstance(antonyms, list) or not (2 <= len(antonyms) <= 4):
            print(f"FAIL in Level {lid}, item {iid}: Antonyms count should be 2-4, got {len(antonyms) if isinstance(antonyms, list) else 'non-list'}")
            all_passed = False

        if not raw_syn or not isinstance(raw_syn, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid raw_synonyms '{raw_syn}'")
            all_passed = False

        if not raw_ant or not isinstance(raw_ant, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid raw_antonyms '{raw_ant}'")
            all_passed = False

        if not sentence or not isinstance(sentence, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid sentence '{sentence}'")
            all_passed = False

        if not sentence_meaning or not isinstance(sentence_meaning, str):
            print(f"FAIL in Level {lid}, item {iid}: Invalid sentence_meaning '{sentence_meaning}'")
            all_passed = False

        total_items_validated += 1

if all_passed:
    print(f"SUCCESS: All 10 levels (171-180) and all {total_items_validated} items passed full validation!")
    print(f"IDs validated: {min(seen_ids)} to {max(seen_ids)}")
else:
    print("VALIDATION FAILED with errors.")
