import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

levels = [
    {
        "level_id": 171,
        "title": "Level 171: Idiom",
        "unit": "Image 31 (image (31).jpg)",
        "category": "Idiom",
        "items": [
            {
                "id": 851,
                "word": "Come to light",
                "ipa": "/kʌm tuː laɪt/",
                "pos": "phrase",
                "meaning": "প্রকাশ পাওয়া, জানাজানি হওয়া",
                "synonyms": [
                    "be revealed",
                    "be disclosed",
                    "emerge",
                    "surface"
                ],
                "antonyms": [
                    "remain hidden",
                    "stay secret",
                    "be concealed",
                    "stay obscure"
                ],
                "raw_synonyms": "be revealed, be disclosed, emerge, surface",
                "raw_antonyms": "remain hidden, stay secret, be concealed, stay obscure",
                "sentence": "Startling evidence of widespread financial fraud came to light during the federal investigation.",
                "sentence_meaning": "ফেডারেল তদন্তের সময় ব্যাপক আর্থিক জালিয়াতির চাঞ্চল্যকর প্রমাণ প্রকাশ পেয়েছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 852,
                "word": "Come to nothing",
                "ipa": "/kʌm tuː ˈnʌθɪŋ/",
                "pos": "phrase",
                "meaning": "ব্যর্থ হওয়া, পণ্ড হওয়া, ফলপ্রসূ না হওয়া",
                "synonyms": [
                    "fail",
                    "fall through",
                    "prove futile",
                    "yield no result"
                ],
                "antonyms": [
                    "succeed",
                    "bear fruit",
                    "materialize",
                    "prosper"
                ],
                "raw_synonyms": "fail, fall through, prove futile, yield no result",
                "raw_antonyms": "succeed, bear fruit, materialize, prosper",
                "sentence": "All their ambitious plans to establish a regional research centre came to nothing due to budget cuts.",
                "sentence_meaning": "বাজেট কাটছাঁটের কারণে আঞ্চলিক গবেষণা কেন্দ্র প্রতিষ্ঠার তাদের সমস্ত উচ্চাভিলাষী পরিকল্পনা পণ্ড হয়ে গিয়েছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 853,
                "word": "Come to the point",
                "ipa": "/kʌm tuː ðə pɔɪnt/",
                "pos": "phrase",
                "meaning": "মূল কথায় আসা, কাজের কথায় আসা",
                "synonyms": [
                    "cut to the chase",
                    "get to the crux",
                    "speak directly",
                    "focus"
                ],
                "antonyms": [
                    "beat about the bush",
                    "digress",
                    "ramble",
                    "wander"
                ],
                "raw_synonyms": "cut to the chase, get to the crux, speak directly, focus",
                "raw_antonyms": "beat about the bush, digress, ramble, wander",
                "sentence": "Please stop beating about the bush and come to the point so that we can conclude this meeting promptly.",
                "sentence_meaning": "দয়া করে ভূমিকা না করে মূল কথায় আসুন যাতে আমরা দ্রুত এই সভা শেষ করতে পারি।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 854,
                "word": "Come true",
                "ipa": "/kʌm truː/",
                "pos": "phrase",
                "meaning": "বাস্তবায়িত হওয়া, সত্য প্রমাণিত হওয়া",
                "synonyms": [
                    "materialize",
                    "be fulfilled",
                    "realize",
                    "actualize"
                ],
                "antonyms": [
                    "fail",
                    "prove false",
                    "fall apart",
                    "dissipate"
                ],
                "raw_synonyms": "materialize, be fulfilled, realize, actualize",
                "raw_antonyms": "fail, prove false, fall apart, dissipate",
                "sentence": "Her lifelong aspiration of becoming an internationally recognized cardiac surgeon finally came true.",
                "sentence_meaning": "একজন আন্তর্জাতিকভাবে স্বীকৃত কার্ডিয়াক সার্জন হওয়ার তার আজীবনের স্বপ্ন অবশেষে বাস্তবায়িত হলো।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 855,
                "word": "Crocodile tears",
                "ipa": "/ˈkrɑːkədaɪl tɪrz/",
                "pos": "phrase",
                "meaning": "মায়াকান্না, কপট বা কৃত্রিম শোক প্রকাশ",
                "synonyms": [
                    "insincere grief",
                    "fake sorrow",
                    "hypocritical tears",
                    "feigned sadness"
                ],
                "antonyms": [
                    "genuine sorrow",
                    "sincere grief",
                    "heartfelt sadness",
                    "true empathy"
                ],
                "raw_synonyms": "insincere grief, fake sorrow, hypocritical tears, feigned sadness",
                "raw_antonyms": "genuine sorrow, sincere grief, heartfelt sadness, true empathy",
                "sentence": "The deceitful heir shed crocodile tears at the funeral while secretly rejoicing over the vast inheritance.",
                "sentence_meaning": "প্রতারক উত্তরাধিকারীটি শেষকৃত্যে মায়াকান্না কেঁদেছিল, অথচ গোপনে বিশাল সম্পত্তির প্রাপ্তিতে আনন্দিত ছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            }
        ]
    },
    {
        "level_id": 172,
        "title": "Level 172: Idiom",
        "unit": "Image 31 (image (31).jpg)",
        "category": "Idiom",
        "items": [
            {
                "id": 856,
                "word": "Crying need",
                "ipa": "/ˈkraɪɪŋ niːd/",
                "pos": "phrase",
                "meaning": "জরুরি প্রয়োজন, অত্যাবশ্যকীয় দাবি",
                "synonyms": [
                    "urgent necessity",
                    "pressing requirement",
                    "vital need",
                    "dire demand"
                ],
                "antonyms": [
                    "luxury",
                    "superfluous matter",
                    "unnecessary item",
                    "dispensable want"
                ],
                "raw_synonyms": "urgent necessity, pressing requirement, vital need, dire demand",
                "raw_antonyms": "luxury, superfluous matter, unnecessary item, dispensable want",
                "sentence": "Reforming the public healthcare infrastructure is the crying need of the hour for developing nations.",
                "sentence_meaning": "উন্নয়নশীল দেশগুলোর জন্য এই মুহূর্তে জনস্বাস্থ্য অবকাঠামো সংস্কার করা একটি অত্যন্ত জরুরি প্রয়োজন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 857,
                "word": "Cut a sorry figure",
                "ipa": "/kʌt ə ˈsɑːri ˈfɪɡjər/",
                "pos": "phrase",
                "meaning": "লজ্জাজনক বা হতাশাজনক প্রভাব ফেলা, খারাপ প্রদর্শন করা",
                "synonyms": [
                    "make a poor impression",
                    "disappoint",
                    "embarrass oneself",
                    "fumble"
                ],
                "antonyms": [
                    "make a strong impression",
                    "cut a fine figure",
                    "excel",
                    "distinguish oneself"
                ],
                "raw_synonyms": "make a poor impression, disappoint, embarrass oneself, fumble",
                "raw_antonyms": "make a strong impression, cut a fine figure, excel, distinguish oneself",
                "sentence": "The unprepared candidate cut a sorry figure during the viva voce exam when asked basic questions.",
                "sentence_meaning": "মৌখিক পরীক্ষায় মৌলিক প্রশ্ন জিজ্ঞাসা করা হলে অপ্রস্তুত প্রার্থীটি বেশ হতাশাজনক ও অপ্রস্তুত পারফরম্যান্স প্রদর্শন করেছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 858,
                "word": "Cut one's teeth",
                "ipa": "/kʌt wʌnz tiːθ/",
                "pos": "phrase",
                "meaning": "প্রাথমিক অভিজ্ঞতা অর্জন করা, হাতেখড়ি হওয়া",
                "synonyms": [
                    "gain experience",
                    "learn the ropes",
                    "start one's career",
                    "acquire skills"
                ],
                "antonyms": [
                    "retire",
                    "conclude career",
                    "step down",
                    "withdraw"
                ],
                "raw_synonyms": "gain experience, learn the ropes, start one's career, acquire skills",
                "raw_antonyms": "retire, conclude career, step down, withdraw",
                "sentence": "The renowned investigative journalist cut his teeth covering local municipal crime stories.",
                "sentence_meaning": "খ্যাতনামা অনুসন্ধানী সাংবাদিকটি স্থানীয় পৌরসভার অপরাধসংক্রান্ত খবর কভার করার মাধ্যমে তার প্রাথমিক অভিজ্ঞতা অর্জন করেছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 859,
                "word": "Cut to the quick",
                "ipa": "/kʌt tuː ðə kwɪk/",
                "pos": "phrase",
                "meaning": "মর্মাহত হওয়া, মনে গভীর আঘাত পাওয়া",
                "synonyms": [
                    "deeply hurt",
                    "deeply wound",
                    "offend",
                    "pain"
                ],
                "antonyms": [
                    "comfort",
                    "console",
                    "soothe",
                    "reassure"
                ],
                "raw_synonyms": "deeply hurt, deeply wound, offend, pain",
                "raw_antonyms": "comfort, console, soothe, reassure",
                "sentence": "She was cut to the quick by her supervisor's harsh and unfounded accusations of professional incompetence.",
                "sentence_meaning": "পেশাগত অদক্ষতার বিষয়ে তার সুপারভাইজারের কঠোর এবং ভিত্তিহীন অভিযোগে তিনি মর্মাহত হয়েছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 860,
                "word": "Cut to the chase",
                "ipa": "/kʌt tuː ðə tʃeɪs/",
                "pos": "phrase",
                "meaning": "অযথা কথা না বাড়িয়ে সরাসরি আসল কথায় আসা",
                "synonyms": [
                    "get to the point",
                    "skip formalities",
                    "focus on essentials",
                    "come to the crux"
                ],
                "antonyms": [
                    "beat around the bush",
                    "procrastinate",
                    "ramble",
                    "delay"
                ],
                "raw_synonyms": "get to the point, skip formalities, focus on essentials, come to the crux",
                "raw_antonyms": "beat around the bush, procrastinate, ramble, delay",
                "sentence": "With limited time remaining on our agenda, let us cut to the chase and discuss the budgetary allocations.",
                "sentence_meaning": "আমাদের এজেন্ডায় সীমিত সময় থাকায়, চলুন ভূমিকা পরিহার করে সরাসরি বাজেট বরাদ্দের বিষয়ে আলোচনা করি।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            }
        ]
    },
    {
        "level_id": 173,
        "title": "Level 173: Idiom",
        "unit": "Image 31 (image (31).jpg)",
        "category": "Idiom",
        "items": [
            {
                "id": 861,
                "word": "A cut above",
                "ipa": "/ə kʌt əˈbʌv/",
                "pos": "phrase",
                "meaning": "অন্য কারো বা কিছুর চেয়ে স্পষ্টভাবে শ্রেয় বা উন্নত (Superior)",
                "synonyms": [
                    "superior",
                    "better",
                    "distinguished",
                    "exceptional"
                ],
                "antonyms": [
                    "inferior",
                    "substandard",
                    "worse",
                    "mediocre"
                ],
                "raw_synonyms": "superior, better, distinguished, exceptional",
                "raw_antonyms": "inferior, substandard, worse, mediocre",
                "sentence": "Her exceptional analytical presentation was clearly a cut above the rest of the candidates.",
                "sentence_meaning": "তার অসাধারণ বিশ্লেষণধর্মী উপস্থাপনাটি স্পষ্টতই অন্যান্য প্রার্থীদের তুলনায় অনেক বেশি উন্নত ছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 862,
                "word": "Double game",
                "ipa": "/ˈdʌbl ɡeɪm/",
                "pos": "phrase",
                "meaning": "দ্বিমুখী নীতি, কপটতা, প্রতারণামূলক আচরণ",
                "synonyms": [
                    "duplicity",
                    "deceit",
                    "treachery",
                    "double-dealing"
                ],
                "antonyms": [
                    "honesty",
                    "sincerity",
                    "transparency",
                    "integrity"
                ],
                "raw_synonyms": "duplicity, deceit, treachery, double-dealing",
                "raw_antonyms": "honesty, sincerity, transparency, integrity",
                "sentence": "The double agent was caught playing a dangerous double game between rival intelligence agencies.",
                "sentence_meaning": "প্রতিদ্বন্দ্বী গোয়েন্দা সংস্থাগুলোর মাঝে বিপজ্জনক দ্বিমুখী খেলা খেলার সময় দ্বৈত গুপ্তচরটি ধরা পড়েছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 863,
                "word": "Devil's advocate",
                "ipa": "/ˈdevlz ˈædvəkət/",
                "pos": "phrase",
                "meaning": "যুক্তির ত্রুটি যাচাইয়ের স্বার্থে বিপক্ষ মত সমর্থনকারী ব্যক্তি",
                "synonyms": [
                    "counter-arguer",
                    "challenger",
                    "dissenter",
                    "questioner"
                ],
                "antonyms": [
                    "supporter",
                    "ally",
                    "backer",
                    "collaborator"
                ],
                "raw_synonyms": "counter-arguer, challenger, dissenter, questioner",
                "raw_antonyms": "supporter, ally, backer, collaborator",
                "sentence": "To ensure all potential risks were evaluated, the strategist played devil's advocate during the executive meeting.",
                "sentence_meaning": "সমস্ত সম্ভাব্য ঝুঁকি যাচাই নিশ্চিত করার জন্য, কৌশলবিদ নির্বাহী সভায় তর্কের খাতিরে বিপক্ষ মত তুলে ধরেছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 864,
                "word": "Diehard",
                "ipa": "/ˈdaɪhɑːrd/",
                "pos": "adj",
                "meaning": "চরম অনড়, গোঁড়া, আপসহীন",
                "synonyms": [
                    "stubborn",
                    "fanatical",
                    "uncompromising",
                    "staunch"
                ],
                "antonyms": [
                    "flexible",
                    "moderate",
                    "open-minded",
                    "yielding"
                ],
                "raw_synonyms": "stubborn, fanatical, uncompromising, staunch",
                "raw_antonyms": "flexible, moderate, open-minded, yielding",
                "sentence": "Diehard supporters of the club stood in pouring rain for hours to cheer for their team.",
                "sentence_meaning": "ক্লাবের অন্ধ ও অনড় সমর্থকেরা তাদের দলকে উৎসাহিত করতে টানা বৃষ্টির মধ্যেও ঘণ্টার পর ঘণ্টা দাঁড়িয়ে ছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 865,
                "word": "Dilly-dally",
                "ipa": "/ˈdɪliˌdæli/",
                "pos": "phrase",
                "meaning": "অযথা সময় নষ্ট করা, দ্বিধাগ্রস্ত হয়ে গড়িমসি করা",
                "synonyms": [
                    "dawdle",
                    "waste time",
                    "procrastinate",
                    "loiter"
                ],
                "antonyms": [
                    "hurry",
                    "expedite",
                    "act promptly",
                    "hasten"
                ],
                "raw_synonyms": "dawdle, waste time, procrastinate, loiter",
                "raw_antonyms": "hurry, expedite, act promptly, hasten",
                "sentence": "Do not dilly-dally on this urgent assignment, as the client expects the completed project by tomorrow morning.",
                "sentence_meaning": "এই জরুরি অ্যাসাইনমেন্টে অহেতুক গড়িমসি করবেন না, কারণ মক্কেল আগামীকাল সকালের মধ্যে সম্পন্ন প্রকল্প প্রত্যাশা করছেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            }
        ]
    },
    {
        "level_id": 174,
        "title": "Level 174: Idiom",
        "unit": "Image 31 (image (31).jpg)",
        "category": "Idiom",
        "items": [
            {
                "id": 866,
                "word": "Dog's age",
                "ipa": "/dɔːɡz eɪdʒ/",
                "pos": "phrase",
                "meaning": "অনেক দীর্ঘ সময়, যুগ যুগ",
                "synonyms": [
                    "a long time",
                    "ages",
                    "eternity",
                    "decades"
                ],
                "antonyms": [
                    "a brief moment",
                    "a short while",
                    "an instant",
                    "a split second"
                ],
                "raw_synonyms": "a long time, ages, eternity, decades",
                "raw_antonyms": "a brief moment, a short while, an instant, a split second",
                "sentence": "I have not crossed paths with my childhood classmates in a dog's age since moving overseas.",
                "sentence_meaning": "বিদেশে চলে আসার পর থেকে দীর্ঘ বহু কাল যাবৎ আমি আমার শৈশবের সহপাঠীদের সাথে দেখা করিনি।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 867,
                "word": "Dry facts",
                "ipa": "/draɪ fækts/",
                "pos": "phrase",
                "meaning": "নীরস তথ্য, নিরেট বাস্তবতা",
                "synonyms": [
                    "plain data",
                    "raw facts",
                    "unadorned truth",
                    "cold statistics"
                ],
                "antonyms": [
                    "embellished stories",
                    "fiction",
                    "rumors",
                    "colorful tales"
                ],
                "raw_synonyms": "plain data, raw facts, unadorned truth, cold statistics",
                "raw_antonyms": "embellished stories, fiction, rumors, colorful tales",
                "sentence": "Rather than relying on emotional rhetoric, the defense lawyer presented dry facts to persuade the jury.",
                "sentence_meaning": "আবেগঘন বক্তব্যের উপর নির্ভর না করে, বিবাদী পক্ষের আইনজীবী জুরিকে বোঝাতে নিরেট তথ্য উপস্থাপন করেছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 868,
                "word": "Dead against",
                "ipa": "/ded əˈɡeɪnst/",
                "pos": "phrase",
                "meaning": "চরম বা ঘোর বিরোধী, অনড়ভাবে প্রতিকূল",
                "synonyms": [
                    "strongly opposed to",
                    "bitterly against",
                    "hostile to",
                    "unfavorable to"
                ],
                "antonyms": [
                    "in favor of",
                    "supportive of",
                    "in agreement with",
                    "advocating"
                ],
                "raw_synonyms": "strongly opposed to, bitterly against, hostile to, unfavorable to",
                "raw_antonyms": "in favor of, supportive of, in agreement with, advocating",
                "sentence": "Environmental groups are dead against the construction of a thermal power plant near the pristine national park.",
                "sentence_meaning": "পরিবেশবাদী দলগুলো আদিম জাতীয় উদ্যানের কাছে তাপবিদ্যুৎ কেন্দ্র নির্মাণের ঘোর বিরোধী।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 869,
                "word": "Die in harness",
                "ipa": "/daɪ ɪn ˈhɑːrnɪs/",
                "pos": "phrase",
                "meaning": "কর্মরত বা চাকুরিরত অবস্থায় মৃত্যুবরণ করা",
                "synonyms": [
                    "die on duty",
                    "die before retirement",
                    "perish in service",
                    "pass away while active"
                ],
                "antonyms": [
                    "retire",
                    "live in leisure",
                    "step down",
                    "survive into pension"
                ],
                "raw_synonyms": "die on duty, die before retirement, perish in service, pass away while active",
                "raw_antonyms": "retire, live in leisure, step down, survive into pension",
                "sentence": "The dedicated judge wished to die in harness rather than spend his golden years away from the courtroom.",
                "sentence_meaning": "নিবেদিতপ্রাণ বিচারপতি আদালত প্রাঙ্গণ থেকে দূরে অবসর জীবন কাটানোর চেয়ে কর্মরত অবস্থায় মৃত্যুবরণ করতে চেয়েছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 870,
                "word": "Dark horse",
                "ipa": "/ˌdɑːrk ˈhɔːrs/",
                "pos": "phrase",
                "meaning": "অপ্রত্যাশিত বিজয়ী, যার জয়ের সম্ভাবনা পূর্বানুমান করা যায়নি",
                "synonyms": [
                    "unforeseen winner",
                    "unknown quantity",
                    "surprise contender",
                    "underdog victor"
                ],
                "antonyms": [
                    "clear favorite",
                    "expected winner",
                    "frontrunner",
                    "top seed"
                ],
                "raw_synonyms": "unforeseen winner, unknown quantity, surprise contender, underdog victor",
                "raw_antonyms": "clear favorite, expected winner, frontrunner, top seed",
                "sentence": "Starting as an underdog, the young gymnast proved to be the dark horse of the international tournament.",
                "sentence_meaning": "শুরুতে অবহেলিত থাকলেও তরুণ জিমন্যাস্টটি আন্তর্জাতিক টুর্নামেন্টে অপ্রত্যাশিত বিজয়ী বা চমক হিসেবে আত্মপ্রকাশ করেছিল।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            }
        ]
    },
    {
        "level_id": 175,
        "title": "Level 175: Idiom",
        "unit": "Image 31 (image (31).jpg)",
        "category": "Idiom",
        "items": [
            {
                "id": 871,
                "word": "Dead letter",
                "ipa": "/ˌded ˈletər/",
                "pos": "phrase",
                "meaning": "অকার্যকর আইন, বাতিল বা প্রয়োগহীন বিধি",
                "synonyms": [
                    "obsolete law",
                    "ineffective rule",
                    "null regulation",
                    "dormant statute"
                ],
                "antonyms": [
                    "enforced law",
                    "active rule",
                    "valid statute",
                    "binding decree"
                ],
                "raw_synonyms": "obsolete law, ineffective rule, null regulation, dormant statute",
                "raw_antonyms": "enforced law, active rule, valid statute, binding decree",
                "sentence": "Due to decades of non-enforcement, the outdated municipal regulation has become a virtual dead letter.",
                "sentence_meaning": "কয়েক দশক ধরে কার্যকর না করার কারণে পুরানো পৌর বিধিটি কার্যত একটি অচল আইনে পরিণত হয়েছে।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 872,
                "word": "Dead wood",
                "ipa": "/ˌded ˈwʊd/",
                "pos": "phrase",
                "meaning": "অকর্মণ্য ব্যক্তি বা অপ্রয়োজনীয় বোঝা",
                "synonyms": [
                    "useless personnel",
                    "incompetent staff",
                    "excess baggage",
                    "redundant members"
                ],
                "antonyms": [
                    "essential assets",
                    "productive staff",
                    "core talent",
                    "valuable contributors"
                ],
                "raw_synonyms": "useless personnel, incompetent staff, excess baggage, redundant members",
                "raw_antonyms": "essential assets, productive staff, core talent, valuable contributors",
                "sentence": "The newly appointed CEO initiated corporate restructuring to cut out dead wood and optimize workflow.",
                "sentence_meaning": "নতুন নিযুক্ত প্রধান নির্বাহী কর্মকর্তা অকর্মণ্য কর্মীদের ছাঁটাই করতে এবং কাজের গতি বাড়াতে কর্পোরেট পুনর্গঠন শুরু করেছিলেন।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 873,
                "word": "Cold comfort",
                "ipa": "/ˌkoʊld ˈkʌmfərt/",
                "pos": "phrase",
                "meaning": "নামমাত্র সান্ত্বনা, অতি সামান্য বা অপর্যাপ্ত সান্ত্বনা",
                "synonyms": [
                    "slight consolation",
                    "poor comfort",
                    "inadequate solace",
                    "meager relief"
                ],
                "antonyms": [
                    "great relief",
                    "immense consolation",
                    "true comfort",
                    "heartfelt solace"
                ],
                "raw_synonyms": "slight consolation, poor comfort, inadequate solace, meager relief",
                "raw_antonyms": "great relief, immense consolation, true comfort, heartfelt solace",
                "sentence": "Knowing that other businesses were also suffering losses provided cold comfort to the bankrupt store owner.",
                "sentence_meaning": "অন্যান্য ব্যবসাপ্রতিষ্ঠানও ক্ষতির শিকার হচ্ছে তা জানা দেউলিয়া দোকান মালিকের জন্য ছিল এক নামমাত্র সান্ত্বনা।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 874,
                "word": "A drug on the market",
                "ipa": "/ə drʌɡ ɒn ðə ˈmɑːrkɪt/",
                "pos": "phrase",
                "meaning": "বাজারে অপ্রয়োজনীয় বা অবিক্রীত জিনিস, চাহিদাহীন উদ্বৃত্ত পণ্য",
                "synonyms": [
                    "unsalable goods",
                    "glut",
                    "surplus product",
                    "unwanted merchandise"
                ],
                "antonyms": [
                    "best-seller",
                    "high-demand item",
                    "popular product",
                    "scarce commodity"
                ],
                "raw_synonyms": "unsalable goods, glut, surplus product, unwanted merchandise",
                "raw_antonyms": "best-seller, high-demand item, popular product, scarce commodity",
                "sentence": "With the rise of advanced smartphones, standalone digital cameras have become a drug on the market.",
                "sentence_meaning": "উন্নত স্মার্টফোনের উত্থানের সাথে সাথে একক ডিজিটাল ক্যামেরাগুলো বাজারে এক অপ্রচলিত ও অবিক্রীত পণ্যে পরিণত হয়েছে।",
                "category": "Idiom",
                "unit": "Image 31 (image (31).jpg)"
            },
            {
                "id": 875,
                "word": "Done up with",
                "ipa": "/dʌn ʌp wɪð/",
                "pos": "phrase",
                "meaning": "ক্লান্ত বা পরিশ্রান্ত হওয়া, কাহিল হয়ে পড়া",
                "synonyms": [
                    "exhausted",
                    "worn out",
                    "fatigued",
                    "tired"
                ],
                "antonyms": [
                    "refreshed",
                    "reinvigorated",
                    "energized",
                    "revitalized"
                ],
                "raw_synonyms": "exhausted, worn out, fatigued, tired",
                "raw_antonyms": "refreshed, reinvigorated, energized, revitalized",
                "sentence": "After walking fifteen miles across hilly terrain, the trekkers were completely done up with exhaustion.",
                "sentence_meaning": "পাহাড়ি এলাকায় পনেরো মাইল হাঁটার পর ট্র্যাকাররা ক্লান্তিতে সম্পূর্ণভাবে কাহিল ও পরিশ্রান্ত হয়ে পড়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            }
        ]
    },
    {
        "level_id": 176,
        "title": "Level 176: Phrasal Verb",
        "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs",
        "category": "Phrasal Verb",
        "items": [
            {
                "id": 876,
                "word": "Do without",
                "ipa": "/duː wɪˈðaʊt/",
                "pos": "phrase",
                "meaning": "কোনো কিছু ছাড়া চলা বা চালানো, বর্জন করে কাজ সারা",
                "synonyms": [
                    "manage without",
                    "dispense with",
                    "forgo",
                    "abstain from"
                ],
                "antonyms": [
                    "require",
                    "depend on",
                    "need",
                    "demand"
                ],
                "raw_synonyms": "manage without, dispense with, forgo, abstain from",
                "raw_antonyms": "require, depend on, need, demand",
                "sentence": "In times of severe financial austerity, the organization had to do without luxury office perks.",
                "sentence_meaning": "তীব্র অর্থনৈতিক কৃচ্ছ্রতার সময়ে প্রতিষ্ঠানটিকে বিলাসবহুল অফিস সুবিধা ছাড়াই কাজ চালাতে হয়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 877,
                "word": "Deal in",
                "ipa": "/diːl ɪn/",
                "pos": "phrase",
                "meaning": "ব্যবসা বা কারবার করা, কেনাবেচা করা",
                "synonyms": [
                    "trade in",
                    "sell",
                    "market",
                    "specialize in"
                ],
                "antonyms": [
                    "boycott",
                    "avoid",
                    "neglect",
                    "refrain from"
                ],
                "raw_synonyms": "trade in, sell, market, specialize in",
                "raw_antonyms": "boycott, avoid, neglect, refrain from",
                "sentence": "His family has been dealing in antique Persian carpets and handmade textiles for three generations.",
                "sentence_meaning": "তার পরিবার তিন প্রজন্ম ধরে প্রাচীন পারস্যের গালিচা এবং হাতে বোনা বস্ত্রের ব্যবসা করে আসছে।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 878,
                "word": "Deal with",
                "ipa": "/diːl wɪð/",
                "pos": "phrase",
                "meaning": "মোকাবেলা করা, সমাধান করা, আলোচনা বা আচরণ করা",
                "synonyms": [
                    "handle",
                    "address",
                    "manage",
                    "tackle"
                ],
                "antonyms": [
                    "ignore",
                    "avoid",
                    "evade",
                    "neglect"
                ],
                "raw_synonyms": "handle, address, manage, tackle",
                "raw_antonyms": "ignore, avoid, evade, neglect",
                "sentence": "A seasoned diplomat possesses the composure required to deal with high-stakes international crises.",
                "sentence_meaning": "একজন অভিজ্ঞ কূটনীতিকের অত্যন্ত জটিল আন্তর্জাতিক সংকট মোকাবেলা করার মতো প্রয়োজনীয় ধৈর্য থাকে।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 879,
                "word": "Draw away",
                "ipa": "/drɔː əˈweɪ/",
                "pos": "phrase",
                "meaning": "দূরত্ব বাড়িয়ে দূরে সরে যাওয়া",
                "synonyms": [
                    "pull away",
                    "move apart",
                    "distance oneself",
                    "withdraw"
                ],
                "antonyms": [
                    "approach",
                    "draw near",
                    "advance",
                    "close in"
                ],
                "raw_synonyms": "pull away, move apart, distance oneself, withdraw",
                "raw_antonyms": "approach, draw near, advance, close in",
                "sentence": "The luxury yacht began to draw away slowly from the crowded harbor as the voyage commenced.",
                "sentence_meaning": "যাত্রা শুরুর সাথে সাথে বিলাসবহুল প্রমোদতরিটি ধীরে ধীরে জনাকীর্ণ বন্দর থেকে দূরে সরে যেতে লাগল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 880,
                "word": "Draw back",
                "ipa": "/drɔː bæk/",
                "pos": "phrase",
                "meaning": "পিছু হটা, ভয় বা আশঙ্কায় পিছিয়ে যাওয়া",
                "synonyms": [
                    "retreat",
                    "recoil",
                    "withdraw",
                    "shrink back"
                ],
                "antonyms": [
                    "advance",
                    "proceed",
                    "forge ahead",
                    "step forward"
                ],
                "raw_synonyms": "retreat, recoil, withdraw, shrink back",
                "raw_antonyms": "advance, proceed, forge ahead, step forward",
                "sentence": "Sensing immense danger from the collapsing roof, the firefighters drew back to establish a safer perimeter.",
                "sentence_meaning": "ছাদ ধসে পড়ার তীব্র বিপদের আভাস পেয়ে অগ্নিনির্বাপক কর্মীরা একটি নিরাপদ বলয় তৈরি করতে পিছু হটেছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            }
        ]
    },
    {
        "level_id": 177,
        "title": "Level 177: Phrasal Verb",
        "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs",
        "category": "Phrasal Verb",
        "items": [
            {
                "id": 881,
                "word": "Draw in",
                "ipa": "/drɔː ɪn/",
                "pos": "phrase",
                "meaning": "সংকুচিত করা, খরচ কমানো, প্রলুব্ধ করা",
                "synonyms": [
                    "curtail",
                    "shorten",
                    "reduce",
                    "attract"
                ],
                "antonyms": [
                    "expand",
                    "lengthen",
                    "increase",
                    "extend"
                ],
                "raw_synonyms": "curtail, shorten, reduce, attract",
                "raw_antonyms": "expand, lengthen, increase, extend",
                "sentence": "Faced with declining quarterly revenues, the management was forced to draw in operational expenditures.",
                "sentence_meaning": "ত্রৈমাসিক রাজস্ব হ্রাসের মুখে কর্তৃপক্ষ তাদের পরিচালন ব্যয় সংকুচিত বা হ্রাস করতে বাধ্য হয়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 882,
                "word": "Draw on",
                "ipa": "/drɔː ɒn/",
                "pos": "phrase",
                "meaning": "ঘনিয়ে আসা, সমাগত হওয়া",
                "synonyms": [
                    "approach",
                    "near",
                    "close in",
                    "arrive"
                ],
                "antonyms": [
                    "recede",
                    "depart",
                    "retreat",
                    "withdraw"
                ],
                "raw_synonyms": "approach, near, close in, arrive",
                "raw_antonyms": "recede, depart, retreat, withdraw",
                "sentence": "As winter drew on, mountain villages stocked up on firewood and non-perishable food supplies.",
                "sentence_meaning": "শীত ঘনিয়ে আসার সাথে সাথে পাহাড়ি গ্রামগুলো জ্বালানি কাঠ এবং অপচনশীল খাদ্য সরবরাহ মজুত করেছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 32 (image (32).jpg) - Phrasal Verbs/Group Verbs"
            },
            {
                "id": 883,
                "word": "Draw out",
                "ipa": "/drɔː aʊt/",
                "pos": "phrase",
                "meaning": "টেনে বের করা, মনের কথা প্রকাশে উৎসাহিত করা",
                "synonyms": [
                    "extract",
                    "elicit",
                    "pull out",
                    "evoke"
                ],
                "antonyms": [
                    "suppress",
                    "conceal",
                    "push in",
                    "silence"
                ],
                "raw_synonyms": "extract, elicit, pull out, evoke",
                "raw_antonyms": "suppress, conceal, push in, silence",
                "sentence": "The skilled psychologist gently asked questions to draw out the traumatized child's suppressed emotions.",
                "sentence_meaning": "অভিজ্ঞ মনোবিজ্ঞানী কোমলভাবে প্রশ্ন করে ট্রমাগ্রস্ত শিশুটির মনের অবদমিত আবেগ টেনে বের করেছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 884,
                "word": "Draw out",
                "ipa": "/drɔː aʊt/",
                "pos": "phrase",
                "meaning": "দীর্ঘায়িত করা, প্রলম্বিত করা",
                "synonyms": [
                    "prolong",
                    "extend",
                    "stretch",
                    "lengthen"
                ],
                "antonyms": [
                    "shorten",
                    "abbreviate",
                    "curtail",
                    "condense"
                ],
                "raw_synonyms": "prolong, extend, stretch, lengthen",
                "raw_antonyms": "shorten, abbreviate, curtail, condense",
                "sentence": "The defense attorney attempted to draw out the cross-examination to buy time for the key witness to arrive.",
                "sentence_meaning": "প্রধান সাক্ষীর আসার জন্য সময় নিতে বিবাদী পক্ষের আইনজীবী জেরা প্রলম্বিত করার চেষ্টা করেছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 885,
                "word": "Draw aside",
                "ipa": "/drɔː əˈsaɪd/",
                "pos": "phrase",
                "meaning": "একপাশে ডেকে নেওয়া, আলাদা করে সরিয়ে নেওয়া",
                "synonyms": [
                    "pull aside",
                    "step aside",
                    "separate",
                    "isolate"
                ],
                "antonyms": [
                    "join",
                    "merge",
                    "integrate",
                    "advance into"
                ],
                "raw_synonyms": "pull aside, step aside, separate, isolate",
                "raw_antonyms": "join, merge, integrate, advance into",
                "sentence": "The mentor drew the young apprentice aside to impart confidential advice regarding the upcoming election.",
                "sentence_meaning": "আসন্ন নির্বাচন সম্পর্কে গোপন পরামর্শ দেওয়ার জন্য মেন্টর তরুণ শিক্ষানবিশটিকে একপাশে ডেকে নিয়েছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            }
        ]
    },
    {
        "level_id": 178,
        "title": "Level 178: Phrasal Verb",
        "unit": "Image 33 (image (33).jpg)",
        "category": "Phrasal Verb",
        "items": [
            {
                "id": 886,
                "word": "Draw back",
                "ipa": "/drɔː bæk/",
                "pos": "phrase",
                "meaning": "প্রতিশ্রুতি থেকে পিছু হটা, অঙ্গীকার প্রত্যাহার করা",
                "synonyms": [
                    "back out",
                    "retreat",
                    "recoil",
                    "renounce"
                ],
                "antonyms": [
                    "commit",
                    "pursue",
                    "stand by",
                    "advance"
                ],
                "raw_synonyms": "back out, retreat, recoil, renounce",
                "raw_antonyms": "commit, pursue, stand by, advance",
                "sentence": "Having pledged his full financial backing, it was unethical for the partner to draw back at the final hour.",
                "sentence_meaning": "সম্পূর্ণ আর্থিক সহায়তার প্রতিশ্রুতি দিয়ে শেষ মুহূর্তে অংশীদারের পিছু হটা অনৈতিক ছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 887,
                "word": "Draw down",
                "ipa": "/drɔː daʊn/",
                "pos": "phrase",
                "meaning": "বিপদ বা নিন্দা ডেকে আনা, হ্রাস পাওয়া",
                "synonyms": [
                    "incur",
                    "attract",
                    "deplete",
                    "bring upon"
                ],
                "antonyms": [
                    "ward off",
                    "avoid",
                    "accumulate",
                    "augment"
                ],
                "raw_synonyms": "incur, attract, deplete, bring upon",
                "raw_antonyms": "ward off, avoid, accumulate, augment",
                "sentence": "His reckless statements during the live interview drew down severe condemnation from civic organizations.",
                "sentence_meaning": "সরাসরি সাক্ষাৎকারে তার বেপরোয়া মন্তব্য নাগরিক সংগঠনগুলোর তীব্র নিন্দাকে ডেকে এনেছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 888,
                "word": "Draw in",
                "ipa": "/drɔː ɪn/",
                "pos": "phrase",
                "meaning": "আকৃষ্ট করা, সম্পৃক্ত বা আকৃষ্ট করে টেনে আনা",
                "synonyms": [
                    "entice",
                    "attract",
                    "lure",
                    "involve"
                ],
                "antonyms": [
                    "repel",
                    "drive away",
                    "deter",
                    "disperse"
                ],
                "raw_synonyms": "entice, attract, lure, involve",
                "raw_antonyms": "repel, drive away, deter, disperse",
                "sentence": "The grand opening of the shopping festival drew in thousands of eager shoppers from neighboring towns.",
                "sentence_meaning": "শপিং উৎসবের জমকালো উদ্বোধনে পার্শ্ববর্তী শহরগুলো থেকে হাজার হাজার উৎসাহী ক্রেতা আকৃষ্ট হয়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 889,
                "word": "Draw off",
                "ipa": "/drɔː ɔːf/",
                "pos": "phrase",
                "meaning": "নিষ্কাশন করা, অপসারণ করা, পিছু হটানো",
                "synonyms": [
                    "withdraw",
                    "drain",
                    "siphon off",
                    "divert"
                ],
                "antonyms": [
                    "advance",
                    "pour in",
                    "infiltrate",
                    "flood"
                ],
                "raw_synonyms": "withdraw, drain, siphon off, divert",
                "raw_antonyms": "advance, pour in, infiltrate, flood",
                "sentence": "The medical team used a syringe to draw off excess fluid surrounding the patient's injured knee joint.",
                "sentence_meaning": "রোগীর আঘাতপ্রাপ্ত হাঁটুর জয়েন্টের চারপাশের অতিরিক্ত তরল বের করে নিতে চিকিৎসাদল একটি সিরিঞ্জ ব্যবহার করেছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 890,
                "word": "Draw on",
                "ipa": "/drɔː ɒn/",
                "pos": "phrase",
                "meaning": "জমানো তহবিল বা পূর্ব অভিজ্ঞতা কাজে লাগানো",
                "synonyms": [
                    "tap",
                    "rely upon",
                    "utilize",
                    "exploit"
                ],
                "antonyms": [
                    "replenish",
                    "deposit",
                    "save",
                    "ignore"
                ],
                "raw_synonyms": "tap, rely upon, utilize, exploit",
                "raw_antonyms": "replenish, deposit, save, ignore",
                "sentence": "The veteran author drew on his extensive wartime experiences to write a bestselling historical masterpiece.",
                "sentence_meaning": "প্রবীণ লেখক একটি সর্বাধিক বিক্রিত ঐতিহাসিক মাস্টারপিস লিখতে তার ব্যাপক যুদ্ধকালীন অভিজ্ঞতাকে কাজে লাগিয়েছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            }
        ]
    },
    {
        "level_id": 179,
        "title": "Level 179: Phrasal Verb",
        "unit": "Image 33 (image (33).jpg)",
        "category": "Phrasal Verb",
        "items": [
            {
                "id": 891,
                "word": "Draw over",
                "ipa": "/drɔː ˈoʊvər/",
                "pos": "phrase",
                "meaning": "নিজের পক্ষে টেনে আনা, স্বপক্ষে দলভুক্ত করা",
                "synonyms": [
                    "win over",
                    "persuade",
                    "convert",
                    "attract"
                ],
                "antonyms": [
                    "alienate",
                    "drive away",
                    "repel",
                    "estrange"
                ],
                "raw_synonyms": "win over, persuade, convert, attract",
                "raw_antonyms": "alienate, drive away, repel, estrange",
                "sentence": "Through persuasive diplomacy and charisma, the party leader drew over undecided voters to his camp.",
                "sentence_meaning": "কার্যকর কূটনীতি এবং ব্যক্তিত্বের মাধ্যমে দলীয় নেতা সিদ্ধান্তহীন ভোটারদের নিজের পক্ষে টেনে এনেছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 892,
                "word": "Draw up",
                "ipa": "/drɔː ʌp/",
                "pos": "phrase",
                "meaning": "দলিল বা চুক্তি খসড়া করা, নিয়মমাফিক সাজানো",
                "synonyms": [
                    "draft",
                    "formulate",
                    "compose",
                    "prepare"
                ],
                "antonyms": [
                    "destroy",
                    "cancel",
                    "annul",
                    "discard"
                ],
                "raw_synonyms": "draft, formulate, compose, prepare",
                "raw_antonyms": "destroy, cancel, annul, discard",
                "sentence": "Corporate attorneys were instructed to draw up a legally binding contract before final signature exchange.",
                "sentence_meaning": "চূড়ান্ত স্বাক্ষর বিনিময়ের আগে একটি আইনত বাধ্যতামূলক চুক্তি খসড়া করতে কর্পোরেট আইনজীবীদের নির্দেশ দেওয়া হয়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 893,
                "word": "Draw to",
                "ipa": "/drɔː tuː/",
                "pos": "phrase",
                "meaning": "আকৃষ্ট হওয়া, অনুরাগী বা আকৃষ্ট বোধ করা",
                "synonyms": [
                    "attracted to",
                    "drawn toward",
                    "fascinated by",
                    "charmed by"
                ],
                "antonyms": [
                    "repelled by",
                    "averse to",
                    "indifferent to",
                    "disgusted by"
                ],
                "raw_synonyms": "attracted to, drawn toward, fascinated by, charmed by",
                "raw_antonyms": "repelled by, averse to, indifferent to, disgusted by",
                "sentence": "The young scholar was naturally drawn to the profound philosophy of classical Greek metaphysics.",
                "sentence_meaning": "তরুণ পণ্ডিতটি স্বভাবতই প্রাচীন গ্রিক দর্শনের গভীর তত্ত্বের প্রতি আকৃষ্ট হয়েছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 894,
                "word": "Do away with",
                "ipa": "/duː əˈweɪ wɪð/",
                "pos": "phrase",
                "meaning": "বিলোপ করা, বাতিল বা অবসান ঘটানো",
                "synonyms": [
                    "abolish",
                    "eliminate",
                    "eradicate",
                    "discard"
                ],
                "antonyms": [
                    "establish",
                    "retain",
                    "preserve",
                    "institute"
                ],
                "raw_synonyms": "abolish, eliminate, eradicate, discard",
                "raw_antonyms": "establish, retain, preserve, institute",
                "sentence": "Modern democratic societies must do away with archaic discriminatory practices in employment.",
                "sentence_meaning": "আধুনিক গণতান্ত্রিক সমাজগুলোকে কর্মসংস্থানে বিদ্যমান প্রাচীন বৈষম্যমূলক প্রথা বিলোপ করতে হবে।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 895,
                "word": "Do for",
                "ipa": "/duː fɔːr/",
                "pos": "phrase",
                "meaning": "উপযুক্ত হওয়া, কাজে লাগা, প্রয়োজন মেটানো",
                "synonyms": [
                    "serve as",
                    "suffice for",
                    "suit",
                    "fit"
                ],
                "antonyms": [
                    "disqualify",
                    "be useless for",
                    "mismatch",
                    "fail to serve"
                ],
                "raw_synonyms": "serve as, suffice for, suit, fit",
                "raw_antonyms": "disqualify, be useless for, mismatch, fail to serve",
                "sentence": "In the absence of a proper tablecloth, this clean white linen fabric will do for tonight's dinner.",
                "sentence_meaning": "একটি উপযুক্ত টেবিলক্লথের অভাবে আজকের রাতের খাবারের জন্য এই পরিষ্কার সাদা লিনেন কাপড়টিই কাজে লাগবে।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            }
        ]
    },
    {
        "level_id": 180,
        "title": "Level 180: Phrasal Verb",
        "unit": "Image 33 (image (33).jpg)",
        "category": "Phrasal Verb",
        "items": [
            {
                "id": 896,
                "word": "Do for",
                "ipa": "/duː fɔːr/",
                "pos": "phrase",
                "meaning": "ধ্বংস বা সর্বনাশ করা, নিঃস্ব করা",
                "synonyms": [
                    "ruin",
                    "destroy",
                    "defeat",
                    "wreck"
                ],
                "antonyms": [
                    "save",
                    "rescue",
                    "restore",
                    "build"
                ],
                "raw_synonyms": "ruin, destroy, defeat, wreck",
                "raw_antonyms": "save, rescue, restore, build",
                "sentence": "That disastrous investment in fraudulent cryptocurrencies completely did for his lifetime savings.",
                "sentence_meaning": "প্রতারণামূলক ক্রিপ্টোকারেন্সিতে সেই বিপর্যয়মূলক বিনিয়োগ তার আজীবনের সঞ্চয়কে পুরোপুরি ধ্বংস করে দিয়েছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 897,
                "word": "Do into",
                "ipa": "/duː ˈɪntuː/",
                "pos": "phrase",
                "meaning": "অনুবাদ করা, অন্য ভাষায় রূপান্তর করা",
                "synonyms": [
                    "translate into",
                    "render into",
                    "convert into",
                    "transcribe"
                ],
                "antonyms": [
                    "misinterpret",
                    "distort",
                    "scramble",
                    "keep original"
                ],
                "raw_synonyms": "translate into, render into, convert into, transcribe",
                "raw_antonyms": "misinterpret, distort, scramble, keep original",
                "sentence": "Scholars spent years doing the ancient Sanskrit manuscripts into modern English prose.",
                "sentence_meaning": "পণ্ডিতেরা প্রাচীন সংস্কৃত পাণ্ডুলিপিগুলো আধুনিক ইংরেজি গদ্যে অনুবাদ করতে কয়েক বছর ব্যয় করেছিলেন।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 898,
                "word": "Do up",
                "ipa": "/duː ʌp/",
                "pos": "phrase",
                "meaning": "মেরামত করা, সাজানো, নবায়ন করা",
                "synonyms": [
                    "renovate",
                    "decorate",
                    "refurbish",
                    "fasten"
                ],
                "antonyms": [
                    "tear down",
                    "neglect",
                    "demolish",
                    "destroy"
                ],
                "raw_synonyms": "renovate, decorate, refurbish, fasten",
                "raw_antonyms": "tear down, neglect, demolish, destroy",
                "sentence": "They spent the summer vacation doing up their ancestral cottage by the lake.",
                "sentence_meaning": "তারা গ্রীষ্মের ছুটি হ্রদের তীরে অবস্থিত তাদের পৈতৃক কুটির মেরামত ও সাজানোর কাজে ব্যয় করেছিল।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 899,
                "word": "Do about",
                "ipa": "/duː əˈbaʊt/",
                "pos": "phrase",
                "meaning": "ব্যবস্থা গ্রহণ করা, প্রতিকারের পদক্ষেপ নেওয়া",
                "synonyms": [
                    "take action regarding",
                    "address",
                    "remedy",
                    "deal with"
                ],
                "antonyms": [
                    "ignore",
                    "overlook",
                    "disregard",
                    "neglect"
                ],
                "raw_synonyms": "take action regarding, address, remedy, deal with",
                "raw_antonyms": "ignore, overlook, disregard, neglect",
                "sentence": "City authorities must urgently decide what to do about the rising levels of airborne toxic pollutants.",
                "sentence_meaning": "বাতাসে বিষাক্ত দূষণকারী পদার্থের মাত্রা বৃদ্ধির বিষয়ে কী ব্যবস্থা গ্রহণ করা উচিত তা নগর কর্তৃপক্ষকে জরুরিভাবে সিদ্ধান্ত নিতে হবে।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            },
            {
                "id": 900,
                "word": "Die down",
                "ipa": "/daɪ daʊn/",
                "pos": "phrase",
                "meaning": "ধীরে ধীরে প্রশমিত হওয়া বা তীব্রতা কমে যাওয়া",
                "synonyms": [
                    "subside",
                    "wane",
                    "diminish",
                    "fade"
                ],
                "antonyms": [
                    "intensify",
                    "escalate",
                    "increase",
                    "flare up"
                ],
                "raw_synonyms": "subside, wane, diminish, fade",
                "raw_antonyms": "intensify, escalate, increase, flare up",
                "sentence": "We waited patiently for the ferocious thunderstorm to die down before venturing out into the open.",
                "sentence_meaning": "বাইরে উন্মুক্ত স্থানে বের হওয়ার আগে আমরা ধৈর্য ধরে প্রচণ্ড কালবৈশাখী ঝড় প্রশমিত হওয়ার জন্য অপেক্ষা করেছিলাম।",
                "category": "Phrasal Verb",
                "unit": "Image 33 (image (33).jpg)"
            }
        ]
    }
]

output_dir = os.path.join("public", "data", "levels")
os.makedirs(output_dir, exist_ok=True)

for lvl in levels:
    lid = lvl["level_id"]
    file_path = os.path.join(output_dir, f"level_{lid}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(lvl, f, indent=2, ensure_ascii=False)
    print(f"Generated {file_path}")

print("All levels 171-180 generated successfully.")
