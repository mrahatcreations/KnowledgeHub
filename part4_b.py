# -*- coding: utf-8 -*-
# Part 4b: Levels 189 to 195 (IDs 941 to 975) - Prepositions and Transformations

ITEMS = {
    941: {
        "pos": "phrase",
        "meaning": "ক্ষতি, অপচয়",
        "synonyms": ["Harm to", "Destruction of", "Impairment of", "Ruin to"],
        "antonyms": ["Benefit to", "Repair of", "Restoration of", "Improvement to"],
        "sentence": "The catastrophic hurricane caused extensive damage to coastal infrastructure and power lines."
    },
    942: {
        "pos": "phrase",
        "meaning": "উৎসর্গীকৃত, একনিষ্ঠ",
        "synonyms": ["Devoted to", "Committed to", "Loyal to", "Given over to"],
        "antonyms": ["Disloyal to", "Indifferent to", "Uncommitted to", "Neglectful of"],
        "sentence": "The newly constructed wing of the hospital is dedicated to treating pediatric cancer patients."
    },
    943: {
        "pos": "phrase",
        "meaning": "একাগ্রতা, আত্মনিয়োগ",
        "synonyms": ["Devotion to", "Commitment to", "Allegiance to", "Loyalty to"],
        "antonyms": ["Apathy toward", "Neglect of", "Indifference to", "Disloyalty to"],
        "sentence": "Her extraordinary dedication to scientific inquiry earned her international prestige and awards."
    },
    944: {
        "pos": "phrase",
        "meaning": "নিবেদন করা, আত্মনিয়োগ করা",
        "synonyms": ["Dedicate to", "Allocate to", "Commit to", "Give up to"],
        "antonyms": ["Withhold from", "Misuse", "Divert from", "Deprive of"],
        "sentence": "The philanthropist chose to devote his retirement years to promoting female literacy in rural areas."
    },
    945: {
        "pos": "phrase",
        "meaning": "সমান, সমকক্ষ",
        "synonyms": ["Equivalent to", "Commensurate with", "Parallel to", "Identical to"],
        "antonyms": ["Unequal to", "Inferior to", "Superior to", "Disparate from"],
        "sentence": "The constitution guarantees that all citizens are equal to one another in the eyes of the law."
    },
    946: {
        "pos": "phrase",
        "meaning": "অপরিহার্য, অত্যাবশ্যক",
        "synonyms": ["Indispensable to", "Vital to", "Crucial to", "Necessary for"],
        "antonyms": ["Superfluous to", "Unnecessary for", "Optional to", "Redundant to"],
        "sentence": "Unrestricted access to clean water is essential to public hygiene and disease prevention."
    },
    947: {
        "pos": "phrase",
        "meaning": "কারো কাছে ব্যাখ্যা করা",
        "synonyms": ["Clarify for", "Explicate to", "Describe to", "Elucidate to"],
        "antonyms": ["Obscure for", "Confuse", "Conceal from", "Complicate for"],
        "sentence": "The physics teacher used simple analogies to explain the quantum mechanical principles to his students."
    },
    948: {
        "pos": "phrase",
        "meaning": "বিশ্বস্ত, অনুগত",
        "synonyms": ["Loyal to", "Devoted to", "True to", "Constant to"],
        "antonyms": ["Unfaithful to", "Disloyal to", "Treacherous toward", "Perfidious to"],
        "sentence": "The brave sentry remained faithful to his post throughout the bitterly cold winter night."
    },
    949: {
        "pos": "phrase",
        "meaning": "কৃতজ্ঞ",
        "synonyms": ["Thankful to", "Obliged to", "Appreciative of", "Indebted to"],
        "antonyms": ["Ungrateful to", "Unappreciative of", "Resentful toward", "Thankless to"],
        "sentence": "We are profoundly grateful to the healthcare workers who served selflessly during the global health crisis."
    },
    950: {
        "pos": "phrase",
        "meaning": "ক্ষতিকর, অনিষ্টকর",
        "synonyms": ["Detrimental to", "Damaging to", "Pernicious to", "Hazardous to"],
        "antonyms": ["Beneficial to", "Helpful to", "Salubrious to", "Advantageous to"],
        "sentence": "Prolonged exposure to toxic industrial smog is severely harmful to the human respiratory system."
    },
    951: {
        "pos": "phrase",
        "meaning": "উদাসীন, নির্বিকার",
        "synonyms": ["Apathetic to", "Unconcerned with", "Insensitive to", "Callous to"],
        "antonyms": ["Sensitive to", "Concerned about", "Passionate about", "Caring for"],
        "sentence": "A responsible government cannot remain indifferent to the suffering of marginalized citizens."
    },
    952: {
        "pos": "phrase",
        "meaning": "সদয়, দয়ালু",
        "synonyms": ["Compassionate toward", "Gentle to", "Benevolent to", "Generous to"],
        "antonyms": ["Cruel to", "Harsh to", "Unkind to", "Callous toward"],
        "sentence": "Society should always be compassionate and kind to the elderly and the destitute."
    },
    953: {
        "pos": "phrase",
        "meaning": "মনোযোগ দিয়ে শোনা, মান্য করা",
        "synonyms": ["Pay heed to", "Attend to", "Hear out", "Give ear to"],
        "antonyms": ["Ignore", "Disregard", "Overlook", "Neglect"],
        "sentence": "A successful corporate executive must actively listen to the feedback of frontline employees."
    },
    954: {
        "pos": "phrase",
        "meaning": "আজ্ঞাবহ, বাধ্য",
        "synonyms": ["Submissive to", "Compliant with", "Dutiful to", "Tractable to"],
        "antonyms": ["Disobedient to", "Rebellious against", "Defiant toward", "Insubordinate to"],
        "sentence": "The trained service canine remained perfectly obedient to the commands of its handler."
    },
    955: {
        "pos": "phrase",
        "meaning": "আপত্তি জানানো",
        "synonyms": ["Oppose", "Protest against", "Disapprove of", "Demur to"],
        "antonyms": ["Approve of", "Agree to", "Endorse", "Sanction"],
        "sentence": "Local environmentalists strongly object to the commercial construction inside the wildlife sanctuary."
    },
    956: {
        "pos": "phrase",
        "meaning": "বিরোধী, প্রতিকূল",
        "synonyms": ["Against", "In opposition to", "Hostile to", "Averse to"],
        "antonyms": ["In favor of", "Supportive of", "Backing", "Friendly to"],
        "sentence": "The labor union is firmly opposed to the proposed reduction in employee health benefits."
    },
    957: {
        "pos": "phrase",
        "meaning": "প্রতিক্রিয়া প্রদর্শন করা",
        "synonyms": ["Respond to", "Act in response to", "Acknowledge", "Answer to"],
        "antonyms": ["Ignore", "Overlook", "Disregard", "Neglect"],
        "sentence": "Financial markets often react sharply to sudden changes in central bank interest rate policies."
    },
    958: {
        "pos": "phrase",
        "meaning": "সাড়া দেওয়া, উত্তর দেওয়া",
        "synonyms": ["Reply to", "Answer", "Counter", "Feedback to"],
        "antonyms": ["Ignore", "Disregard", "Neglect", "Overlook"],
        "sentence": "Emergency medical teams responded to the distress call within minutes of the accident."
    },
    959: {
        "pos": "phrase",
        "meaning": "সদৃশ, অনুরূপ",
        "synonyms": ["Akin to", "Resembling", "Comparable to", "Parallel to"],
        "antonyms": ["Different from", "Distinct from", "Dissimilar to", "Opposite to"],
        "sentence": "The architecture of the ancient courthouse is strikingly similar to classical Roman temples."
    },
    960: {
        "pos": "phrase",
        "meaning": "সমাধান",
        "synonyms": ["Answer to", "Remedy for", "Resolution of", "Key to"],
        "antonyms": ["Cause of problem", "Complication", "Dilemma", "Obstacle"],
        "sentence": "Diplomatic dialogue and compromise offer the only lasting solution to the border conflict."
    },
    961: {
        "pos": "phrase",
        "meaning": "উত্তরাধিকারসূত্রে লাভ করা বা পদে বসা",
        "synonyms": ["Inherit", "Take over", "Accede to", "Follow into"],
        "antonyms": ["Abdicate", "Relinquish", "Forfeit", "Yield"],
        "sentence": "Upon the monarch's untimely demise, the crown prince was crowned to succeed to the royal throne."
    },
    962: {
        "pos": "phrase",
        "meaning": "উৎকৃষ্টতর, উন্নত",
        "synonyms": ["Better than", "Finer than", "Higher quality than", "Preeminent to"],
        "antonyms": ["Inferior to", "Substandard to", "Worse than", "Poorer than"],
        "sentence": "Handmade leather shoes are generally far superior to cheap synthetic footwear in durability."
    },
    963: {
        "pos": "phrase",
        "meaning": "কথা বলা, আলাপ করা",
        "synonyms": ["Speak with", "Converse with", "Communicate with", "Chat with"],
        "antonyms": ["Avoid", "Shun", "Silence", "Ignore"],
        "sentence": "The school counselor scheduled a meeting to talk to the struggling student about career options."
    },
    964: {
        "pos": "phrase",
        "meaning": "হুমকি, বিপদের কারণ",
        "synonyms": ["Danger to", "Menace to", "Hazard to", "Risk to"],
        "antonyms": ["Protection for", "Boon to", "Safeguard for", "Shield to"],
        "sentence": "Cyber terrorism poses an escalating national threat to modern telecommunications and banking systems."
    },
    965: {
        "pos": "phrase",
        "meaning": "উপকারী, কাজের",
        "synonyms": ["Beneficial to", "Helpful to", "Advantageous to", "Valuable to"],
        "antonyms": ["Useless to", "Harmful to", "Detrimental to", "Worthless to"],
        "sentence": "Bilingual proficiency is exceptionally useful to diplomats working in foreign international embassies."
    },
    966: {
        "pos": "n",
        "meaning": "বোধগম্যতা, উপলব্ধি, অন্তর্ভুক্তি",
        "synonyms": ["Understanding", "Grasp", "Apprehension", "Perception"],
        "antonyms": ["Incomprehension", "Misunderstanding", "Ignorance", "Confusion"],
        "sentence": "Advanced reading comprehension exercises help develop analytical thinking and critical evaluation skills."
    },
    967: {
        "pos": "n",
        "meaning": "ধারণা, কল্পনা, উদ্ভাবন",
        "synonyms": ["Notion", "Idea", "Concept", "Formulation"],
        "antonyms": ["Misconception", "Ignorance", "Confusion", "Reality"],
        "sentence": "The architect's innovative conception of eco-friendly skyscrapers won international design accolades."
    },
    968: {
        "pos": "n",
        "meaning": "উপসংহার, সমাপ্তি, সিদ্ধান্ত",
        "synonyms": ["Ending", "Deduction", "Inference", "Termination"],
        "antonyms": ["Beginning", "Commencement", "Introduction", "Start"],
        "sentence": "In the final conclusion of his dissertation, the scholar summarized his findings on ancient civilizations."
    },
    969: {
        "pos": "n",
        "meaning": "অভিনন্দন, শুভকামনা",
        "synonyms": ["Compliment", "Felicitation", "Praise", "Commendation"],
        "antonyms": ["Condolence", "Criticism", "Disapproval", "Reproach"],
        "sentence": "The dean sent a formal letter of congratulation to the student for winning the national debate cup."
    },
    970: {
        "pos": "n",
        "meaning": "সামঞ্জস্যতা, ধারাবাহিকতা",
        "synonyms": ["Consistency", "Uniformity", "Stability", "Regularity"],
        "antonyms": ["Inconsistency", "Fluctuation", "Irregularity", "Instability"],
        "sentence": "Maintaining consistency in daily preparation is the true key to clearing competitive recruitment exams."
    },
    971: {
        "pos": "n",
        "meaning": "ঘৃণা, অবজ্ঞা, তাচ্ছিল্য",
        "synonyms": ["Scorn", "Disdain", "Derision", "Despisal"],
        "antonyms": ["Respect", "Admiration", "Regard", "Esteem"],
        "sentence": "The corrupt official was held in utter contempt by citizens who suffered under his maladministration."
    },
    972: {
        "pos": "n",
        "meaning": "ধারাবাহিকতা, নিরবচ্ছিন্নতা",
        "synonyms": ["Unbrokenness", "Permanence", "Persistence", "Continuation"],
        "antonyms": ["Interruption", "Discontinuity", "Cessation", "Break"],
        "sentence": "The newly elected government ensured administrative continuity by retaining experienced policy advisors."
    },
    973: {
        "pos": "n",
        "meaning": "কথোপকথন, বাক্যালাপ, আলোচনা",
        "synonyms": ["Dialogue", "Discussion", "Discourse", "Talk"],
        "antonyms": ["Silence", "Monologue", "Quiet", "Reticence"],
        "sentence": "Engaging in meaningful conversation with domain experts broadened her perspective on artificial intelligence."
    },
    974: {
        "pos": "n",
        "meaning": "দুর্নীতি, নীতিভ্রষ্টতা, বিকৃতি",
        "synonyms": ["Dishonesty", "Bribery", "Venality", "Degeneracy"],
        "antonyms": ["Integrity", "Honesty", "Probity", "Uprightness"],
        "sentence": "Eradicating systemic corruption is essential for attracting foreign investments and fostering economic growth."
    },
    975: {
        "pos": "n",
        "meaning": "সাহস, বীরত্ব, নির্ভীকতা",
        "synonyms": ["Bravery", "Valor", "Fortitude", "Gallantry"],
        "antonyms": ["Cowardice", "Timidity", "Fearfulness", "Faint-heartedness"],
        "sentence": "The young firefighter demonstrated immense courage when entering the blazing building to rescue trapped residents."
    }
}
