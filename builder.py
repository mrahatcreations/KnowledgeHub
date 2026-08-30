import re
import sys
import json
import os

sys.stdout.reconfigure(encoding='utf-8')

def clean_text(text):
    if not text:
        return ""
    t = text.strip()
    # Remove markdown bold/italics/backticks
    t = re.sub(r'[*_`]', '', t)
    # Remove leading bullets
    t = re.sub(r'^[•⦿\-\s]+', '', t)
    # Remove trailing/leading quotes if wrapping whole string
    t = t.strip()
    return t

def parse_pos_and_word(raw_word, default_pos="word"):
    raw_word = clean_text(raw_word)
    # Match pos in parentheses: (v), (adj), (n), (adv), (prep), (phr)
    m = re.search(r'\((v|adj|n|adv|prep|conj|pron|interj|phr)\)', raw_word, re.IGNORECASE)
    pos = default_pos
    if m:
        p = m.group(1).lower()
        pos_map = {
            'v': 'verb',
            'adj': 'adjective',
            'n': 'noun',
            'adv': 'adverb',
            'prep': 'preposition',
            'conj': 'conjunction',
            'pron': 'pronoun',
            'phr': 'phrase'
        }
        pos = pos_map.get(p, p)
        word = re.sub(r'\((v|adj|n|adv|prep|conj|pron|interj|phr)\)', '', raw_word, flags=re.IGNORECASE).strip()
    else:
        word = raw_word
    word = re.sub(r'[*]', '', word).strip()
    return word, pos

def parse_list(raw_str):
    if not raw_str:
        return []
    cleaned = clean_text(raw_str)
    if not cleaned or cleaned in ['-', '--', 'N/A', 'none', 'None']:
        return []
    # Split by comma, semicolon, newline, bullet
    items = [x.strip() for x in re.split(r'[,;•\n]+', cleaned) if x.strip()]
    # Filter out empty or dash
    items = [x for x in items if x not in ['-', '--', '']]
    return items

def generate_context_sentence(word, meaning, pos, category):
    if category == 'Appropriate Preposition':
        return f'Practice using "{word}" ({meaning}) in a sentence.'
    elif category == 'Phrasal Verb':
        return f'The phrasal verb "{word}" means "{meaning}".'
    elif category == 'Idiom':
        return f'The idiom "{word}" means "{meaning}".'
    elif category == 'Word Transformation':
        return f'Word Transformation: {word} ({meaning}).'
    else:
        return f'The word "{word}" ({pos}) means "{meaning}".'

def extract_all():
    with open('English_Lecture_Notes_Complete_OCR.md', 'r', encoding='utf-8') as f:
        text = f.read()

    lines = text.splitlines()

    current_h1 = ''
    current_h2 = ''
    current_h3 = ''
    current_h4 = ''

    tables = []
    current_table = []
    table_context = {}

    for i, line in enumerate(lines):
        if line.startswith('# '):
            current_h1 = line[2:].strip()
            current_h2 = ''
            current_h3 = ''
            current_h4 = ''
        elif line.startswith('## '):
            current_h2 = line[3:].strip()
            current_h3 = ''
            current_h4 = ''
        elif line.startswith('### '):
            current_h3 = line[4:].strip()
            current_h4 = ''
        elif line.startswith('#### '):
            current_h4 = line[5:].strip()
        
        if line.startswith('|'):
            if not current_table:
                table_context = {
                    'start_line': i+1,
                    'h1': current_h1,
                    'h2': current_h2,
                    'h3': current_h3,
                    'h4': current_h4,
                }
            current_table.append(line)
        else:
            if current_table:
                tables.append((table_context, current_table))
                current_table = []

    if current_table:
        tables.append((table_context, current_table))

    all_items = []
    item_id = 1
    seen_keys = set() # (word.lower(), meaning) to deduplicate if exact identical

    for idx, (ctx, tbl) in enumerate(tables):
        if len(tbl) < 3:
            continue
        header_cols = [clean_text(c).lower() for c in tbl[0].strip('|').split('|')]
        h2 = ctx['h2']
        h3 = ctx['h3']
        h4 = ctx['h4']

        # Unit name
        unit_name = h2
        if h3:
            unit_name += f" - {h3}"
        unit_name = clean_text(unit_name)
        # Clean image file references from unit name
        unit_name = re.sub(r'\(`image \(\d+\)\.jpg`\)', '', unit_name)
        unit_name = re.sub(r'Image \(\d+\)\.jpg', '', unit_name)
        unit_name = re.sub(r'Image \(\d+\)', '', unit_name)
        unit_name = re.sub(r'\s+', ' ', unit_name).strip(' -:')

        # Table rows
        for row_str in tbl[2:]:
            cells = [c.strip() for c in row_str.strip('|').split('|')]
            if not cells or all(c == '' for c in cells):
                continue
            
            # --- Check Word Transformation (Tables 8, 23, 37) ---
            if len(cells) >= 5 and 'noun' in header_cols[0] and ('verb' in header_cols[2] or 'meaning' in header_cols[1]):
                raw_noun = clean_text(cells[0])
                meaning = clean_text(cells[1])
                raw_verb = clean_text(cells[2])
                raw_adj = clean_text(cells[3])
                raw_adv = clean_text(cells[4]) if len(cells) > 4 else ""

                forms = []
                if raw_noun and raw_noun not in ['-', '--']: forms.append(f"Noun: {raw_noun}")
                if raw_verb and raw_verb not in ['-', '--']: forms.append(f"Verb: {raw_verb}")
                if raw_adj and raw_adj not in ['-', '--']: forms.append(f"Adj: {raw_adj}")
                if raw_adv and raw_adv not in ['-', '--']: forms.append(f"Adv: {raw_adv}")

                sentence = f"Transformation Forms: {', '.join(forms)}"
                
                if not raw_noun or not meaning:
                    continue

                syn_list = [x for x in [raw_verb, raw_adj, raw_adv] if x and x not in ['-', '--']]
                all_items.append({
                    'id': item_id,
                    'word': raw_noun,
                    'pos': 'noun',
                    'meaning': meaning,
                    'synonyms': syn_list,
                    'antonyms': [],
                    'raw_synonyms': ', '.join(syn_list),
                    'raw_antonyms': '',
                    'sentence': sentence,
                    'category': 'Word Transformation',
                    'unit': unit_name or 'Transformation of Word'
                })
                item_id += 1

            # --- Check Multi-column Preposition tables (Table 7 & Table 36) ---
            elif len(cells) >= 3 and ('with' in tbl[0].lower() or 'column' in tbl[0].lower() or 'super preposition' in h3.lower()):
                for cell in cells:
                    cell_clean = clean_text(cell)
                    if not cell_clean:
                        continue
                    m = re.match(r'^(.*?)\s*[\(\（](.*?)[\)\）]$', cell_clean)
                    if m:
                        prep_word = clean_text(m.group(1))
                        prep_meaning = clean_text(m.group(2))
                    else:
                        prep_word = cell_clean
                        prep_meaning = "উপযুক্ত Preposition"
                    
                    if prep_word:
                        all_items.append({
                            'id': item_id,
                            'word': prep_word,
                            'pos': 'preposition',
                            'meaning': prep_meaning,
                            'synonyms': [],
                            'antonyms': [],
                            'raw_synonyms': '',
                            'raw_antonyms': '',
                            'sentence': f'Practice sentence with "{prep_word}" ({prep_meaning}).',
                            'category': 'Appropriate Preposition',
                            'unit': unit_name or 'Appropriate Preposition'
                        })
                        item_id += 1

            # --- Check 5 cols [Word, PoS, Meaning, Synonyms, Antonyms] ---
            elif len(cells) >= 5 and 'pos' in header_cols[1]:
                raw_w, raw_pos, raw_m, raw_syn, raw_ant = cells[0], cells[1], cells[2], cells[3], cells[4]
                word, pos = parse_pos_and_word(raw_w, default_pos=clean_text(raw_pos).lower())
                meaning = clean_text(raw_m)
                syns = parse_list(raw_syn)
                ants = parse_list(raw_ant)
                if not word or not meaning:
                    continue
                all_items.append({
                    'id': item_id,
                    'word': word,
                    'pos': pos or 'word',
                    'meaning': meaning,
                    'synonyms': syns,
                    'antonyms': ants,
                    'raw_synonyms': ', '.join(syns),
                    'raw_antonyms': ', '.join(ants),
                    'sentence': generate_context_sentence(word, meaning, pos, 'Vocabulary'),
                    'category': 'Vocabulary',
                    'unit': unit_name or 'Vocabulary'
                })
                item_id += 1

            # --- Check 4 cols [Word, Meaning, Synonyms, Antonyms] ---
            elif len(cells) >= 4 and any(k in header_cols[2] for k in ['synonym', 'meaning']) and any(k in header_cols[3] for k in ['antonym']):
                raw_w, raw_m, raw_syn, raw_ant = cells[0], cells[1], cells[2], cells[3]
                word, pos = parse_pos_and_word(raw_w, default_pos='adjective' if 'adj' in raw_w.lower() else ('verb' if '(v)' in raw_w.lower() else ('noun' if '(n)' in raw_w.lower() else 'word')))
                meaning = clean_text(raw_m)
                syns = parse_list(raw_syn)
                ants = parse_list(raw_ant)
                if not word or not meaning:
                    continue
                all_items.append({
                    'id': item_id,
                    'word': word,
                    'pos': pos or 'word',
                    'meaning': meaning,
                    'synonyms': syns,
                    'antonyms': ants,
                    'raw_synonyms': ', '.join(syns),
                    'raw_antonyms': ', '.join(ants),
                    'sentence': generate_context_sentence(word, meaning, pos, 'Vocabulary'),
                    'category': 'Vocabulary',
                    'unit': unit_name or 'Vocabulary'
                })
                item_id += 1

            # --- Check 3 cols [Word / Appropriate Preposition / Phrasal Verb / Idiom, Meaning / বাংলা অর্থ, Sentence] ---
            elif len(cells) >= 3 and ('sentence' in header_cols[2] or 'meaning' in header_cols[1] or 'অর্থ' in header_cols[1]):
                raw_w, raw_m, raw_sent = cells[0], cells[1], cells[2]
                raw_w_clean = clean_text(raw_w)
                raw_m_clean = clean_text(raw_m)
                sentence = clean_text(raw_sent)
                
                header0 = header_cols[0]
                if 'phrasal' in header0 or 'phrasal' in h3.lower() or 'group verb' in h3.lower() or 'group verb' in h2.lower():
                    category = 'Phrasal Verb'
                    pos = 'verb phrase'
                elif 'preposition' in header0 or 'preposition' in h3.lower() or 'preposition' in h2.lower():
                    category = 'Appropriate Preposition'
                    pos = 'preposition'
                elif 'idiom' in header0 or 'idiom' in h3.lower() or 'idiom' in h2.lower():
                    category = 'Idiom'
                    pos = 'idiom'
                else:
                    category = 'Vocabulary'
                    pos = 'word'

                word, extracted_pos = parse_pos_and_word(raw_w_clean, default_pos=pos)
                if not sentence:
                    sentence = generate_context_sentence(word, raw_m_clean, extracted_pos or pos, category)

                if not word or not raw_m_clean:
                    continue

                all_items.append({
                    'id': item_id,
                    'word': word,
                    'pos': extracted_pos or pos,
                    'meaning': raw_m_clean,
                    'synonyms': [],
                    'antonyms': [],
                    'raw_synonyms': '',
                    'raw_antonyms': '',
                    'sentence': sentence,
                    'category': category,
                    'unit': unit_name or category
                })
                item_id += 1

    # --- Extract Supplementary Techniques (Root Words, Super Prepositions, Super Group Verbs) ---
    # 1. Root Word Technique-1 (Bel-)
    root_bel_words = [
        ("Antebellum", "noun", "যুদ্ধের পূর্ববর্তী অবস্থা", ["pre-war"], ["post-war"], "Antebellum refers to the period before a war.", "Vocabulary", "Root Word Technique: Bel (War)"),
        ("Belligerent", "adjective", "যুদ্ধংদেহী / ঝগড়াটে ভাব", ["aggressive", "hostile", "combative"], ["peaceful", "friendly"], "The belligerent nation refused to negotiate.", "Vocabulary", "Root Word Technique: Bel (War)"),
        ("Bellicose", "adjective", "যুদ্ধ যুদ্ধ ভাব / মারমুখী", ["warlike", "pugnacious"], ["pacifist", "calm"], "His bellicose attitude provoked an argument.", "Vocabulary", "Root Word Technique: Bel (War)"),
        ("Rebel", "noun", "বিদ্রোহী / মতামতের বিরুদ্ধে যুদ্ধকারী", ["insurgent", "mutineer", "revolutionary"], ["loyalist", "conformist"], "The rebel forces captured the city.", "Vocabulary", "Root Word Technique: Bel (War)")
    ]
    for w, p, m, syn, ant, s, cat, u in root_bel_words:
        all_items.append({
            'id': item_id, 'word': w, 'pos': p, 'meaning': m,
            'synonyms': syn, 'antonyms': ant, 'raw_synonyms': ', '.join(syn), 'raw_antonyms': ', '.join(ant),
            'sentence': s, 'category': cat, 'unit': u
        })
        item_id += 1

    # 2. Super Vocabulary Technique-2 (Ben-)
    ben_words = [
        ("Benefit", "noun", "লাভ, উপকার", ["advantage", "profit", "gain"], ["harm", "disadvantage"], "Regular exercise provides huge physical benefit.", "Vocabulary", "Super Vocabulary Technique: Ben (Good)"),
        ("Benevolent", "adjective", "দয়ালু, পরোপকারী", ["kind", "generous", "charitable"], ["malevolent", "cruel"], "The benevolent donor funded the school library.", "Vocabulary", "Super Vocabulary Technique: Ben (Good)"),
        ("Benefaction", "noun", "দান, অনুদান", ["donation", "gift", "charity"], ["theft", "extortion"], "The hospital was built through public benefaction.", "Vocabulary", "Super Vocabulary Technique: Ben (Good)"),
        ("Benign", "adjective", "সদয়, অমায়িক, নির্দোষ", ["gentle", "harmless", "favorable"], ["malignant", "hostile"], "The doctor confirmed that the tumor was benign.", "Vocabulary", "Super Vocabulary Technique: Ben (Good)"),
        ("Benediction", "noun", "আশীর্বাণী / আশীর্বচন", ["blessing", "benison"], ["curse", "malediction"], "The priest offered a benediction at the end of the service.", "Vocabulary", "Super Vocabulary Technique: Ben (Good)")
    ]
    for w, p, m, syn, ant, s, cat, u in ben_words:
        all_items.append({
            'id': item_id, 'word': w, 'pos': p, 'meaning': m,
            'synonyms': syn, 'antonyms': ant, 'raw_synonyms': ', '.join(syn), 'raw_antonyms': ', '.join(ant),
            'sentence': s, 'category': cat, 'unit': u
        })
        item_id += 1

    # 3. Super Vocabulary Technique-3 (Bon-)
    bon_words = [
        ("Bonus", "noun", "অতিরিক্ত সুযোগ / সুবিধা", ["reward", "extra", "incentive"], ["penalty"], "Employees received an annual performance bonus.", "Vocabulary", "Super Vocabulary Technique: Bon (Good)"),
        ("Bonny", "adjective", "সুন্দর, প্রফুল্ল", ["attractive", "pretty", "cheerful"], ["ugly", "gloomy"], "She has a bonny smile that lights up the room.", "Vocabulary", "Super Vocabulary Technique: Bon (Good)"),
        ("Bonafide", "adjective", "খাঁটি, প্রকৃত", ["authentic", "genuine", "real"], ["fake", "spurious"], "Make sure you are dealing with a bonafide dealer.", "Vocabulary", "Super Vocabulary Technique: Bon (Good)"),
        ("Bounty", "noun", "দানশীলতা / প্রাচুর্য", ["generosity", "abundance", "reward"], ["scarcity", "meagerness"], "Nature offers a bounty of fresh fruits and vegetables.", "Vocabulary", "Super Vocabulary Technique: Bon (Good)"),
        ("Bonify", "verb", "ভালোতে পরিবর্তন বা রূপান্তর করা", ["improve", "ameliorate"], ["worsen", "deteriorate"], "We must strive to bonify our surrounding environment.", "Vocabulary", "Super Vocabulary Technique: Bon (Good)")
    ]
    for w, p, m, syn, ant, s, cat, u in bon_words:
        all_items.append({
            'id': item_id, 'word': w, 'pos': p, 'meaning': m,
            'synonyms': syn, 'antonyms': ant, 'raw_synonyms': ', '.join(syn), 'raw_antonyms': ', '.join(ant),
            'sentence': s, 'category': cat, 'unit': u
        })
        item_id += 1

    # 4. Super Preposition Technique-2 (words with 'for')
    prep_for_words = [
        ("Apologize for", "preposition", "ক্ষমা চাওয়া", [], [], "You should apologize for your rude behavior.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Apply for", "preposition", "আবেদন করা", [], [], "He decided to apply for the new job opening.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Ask for", "preposition", "অনুরোধ / চাওয়া", [], [], "Don't hesitate to ask for help when needed.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Care for", "preposition", "পরিচর্যা করা / পছন্দ করা", [], [], "Nurses care for patients with utmost dedication.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Demand for", "preposition", "চাহিদা", [], [], "There is a growing demand for skilled programmers.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Desire for", "preposition", "আকাঙ্ক্ষা", [], [], "She has a strong desire for higher education.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Eligible for", "preposition", "উপযুক্ত / যোগ্য", [], [], "Graduates are eligible for this competitive scholarship.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Famous for", "preposition", "খ্যাত / বিখ্যাত", [], [], "Paris is famous for its art museums and architecture.", "Appropriate Preposition", "Super Preposition Technique: For"),
        ("Hope for", "preposition", "আশা করা", [], [], "We hope for better weather tomorrow.", "Appropriate Preposition", "Super Preposition Technique: For")
    ]
    for w, p, m, syn, ant, s, cat, u in prep_for_words:
        all_items.append({
            'id': item_id, 'word': w, 'pos': p, 'meaning': m,
            'synonyms': syn, 'antonyms': ant, 'raw_synonyms': ', '.join(syn), 'raw_antonyms': ', '.join(ant),
            'sentence': s, 'category': cat, 'unit': u
        })
        item_id += 1

    # Structure into 5-item Game Levels
    levels = []
    level_id = 1
    total_items = len(all_items)

    for i in range(0, total_items, 5):
        chunk = all_items[i:i+5]
        # Main category of this chunk
        cat_counts = {}
        for it in chunk:
            cat_counts[it['category']] = cat_counts.get(it['category'], 0) + 1
        main_cat = max(cat_counts, key=cat_counts.get)
        unit_name = chunk[0]['unit']

        levels.append({
            'level_id': level_id,
            'title': f'Level {level_id}: {main_cat}',
            'unit': unit_name,
            'category': main_cat,
            'items': chunk
        })
        level_id += 1

    print(f"Total extracted items: {len(all_items)}")
    print(f"Total structured levels (5 items/level): {len(levels)}")
    cats = {}
    for it in all_items:
        c = it['category']
        cats[c] = cats.get(c, 0) + 1
    print("Category breakdown:", cats)

    dataset = {
        'schema_version': '1.0.0',
        'total_levels': len(levels),
        'total_items': len(all_items),
        'levels': levels
    }

    version_info = {
        'version': '1.0.0',
        'release_date': '2026-08-30',
        'total_levels': len(levels),
        'total_items': len(all_items),
        'categories': cats,
        'checksum': f'v1.0-{len(levels)}-{len(all_items)}',
        'changelog': 'Complete refined OCR English lecture dataset with 5-stage Blender game levels.'
    }

    # Save to data/ and public/data/
    os.makedirs('data', exist_ok=True)
    os.makedirs('public/data', exist_ok=True)

    for p in ['data/levels.json', 'public/data/levels.json']:
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, ensure_ascii=False, indent=2)
        print(f"Saved {p} ({os.path.getsize(p)} bytes)")

    # Validation pass
    print("\n--- Running Strict Validation Pass ---")
    for path in ['data/levels.json', 'public/data/levels.json', 'data/version.json', 'public/data/version.json']:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        assert '???' not in content, f'{path} has ???'
        assert '\ufffd' not in content, f'{path} has replacement character'
        parsed = json.loads(content)
        print(f"Passed UTF-8 & JSON validity check: {path}")

    with open('public/data/levels.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    levels = data['levels']
    all_ids = set()
    required_fields = ['id', 'word', 'pos', 'meaning', 'synonyms', 'antonyms', 'raw_synonyms', 'raw_antonyms', 'sentence', 'category', 'unit']
    allowed_categories = {'Vocabulary', 'Appropriate Preposition', 'Phrasal Verb', 'Idiom', 'Word Transformation'}

    errors = []
    item_count = 0
    for lvl_idx, lvl in enumerate(levels):
        items = lvl['items']
        item_count += len(items)
        for it_idx, item in enumerate(items):
            for f in required_fields:
                if f not in item:
                    errors.append(f'Level {lvl_idx+1} Item {it_idx+1} missing {f}')
            if item['id'] in all_ids:
                errors.append(f'Duplicate id {item["id"]}')
            all_ids.add(item['id'])
            if not item['word']:
                errors.append(f'Empty word in item {item["id"]}')
            if not item['meaning']:
                errors.append(f'Empty meaning in item {item["id"]}')
            if item['category'] not in allowed_categories:
                errors.append(f'Invalid category {item["category"]} in item {item["id"]}')
            if not isinstance(item['synonyms'], list):
                errors.append(f'synonyms not a list in item {item["id"]}')
            if not isinstance(item['antonyms'], list):
                errors.append(f'antonyms not a list in item {item["id"]}')

    if errors:
        print(f"Validation FAILED with {len(errors)} errors:")
        for err in errors[:10]:
            print('  ', err)
        raise ValueError("Validation failed")
    else:
        print(f"ALL 100% OF ITEMS PASSED VALIDATION!")
        print(f"Verified {item_count} items across {len(levels)} levels.")

    return dataset

if __name__ == '__main__':
    extract_all()
