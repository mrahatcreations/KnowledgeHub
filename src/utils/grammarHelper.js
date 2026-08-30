/**
 * Comprehensive English Grammar & Verb Conjugation (V1, V2, V3) Utility
 */

export const POS_LABELS = {
  n: { full: 'Noun (বিশেষ্য)', short: 'NOUN', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  v: { full: 'Verb (ক্রিয়া)', short: 'VERB', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  adj: { full: 'Adjective (বিশেষণ)', short: 'ADJ', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  adv: { full: 'Adverb (ক্রিয়া-বিশেষণ)', short: 'ADV', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  prep: { full: 'Preposition (অব্যয়)', short: 'PREP', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  phrase: { full: 'Phrase (বাক্যাংশ)', short: 'PHRASE', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  idiom: { full: 'Idiom (বাগধারা)', short: 'IDIOM', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' }
};

export function getPosInfo(pos) {
  if (!pos) return { full: 'Word', short: 'WORD', color: 'bg-slate-800 text-slate-300 border-slate-700' };
  const clean = String(pos).toLowerCase().trim();
  return POS_LABELS[clean] || { 
    full: clean.charAt(0).toUpperCase() + clean.slice(1), 
    short: clean.toUpperCase(), 
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
  };
}

// Common English Irregular Verbs Table
export const IRREGULAR_VERBS = {
  arise: ['arose', 'arisen'],
  awake: ['awoke', 'awoken'],
  be: ['was/were', 'been'],
  bear: ['bore', 'borne'],
  beat: ['beat', 'beaten'],
  become: ['became', 'become'],
  begin: ['began', 'begun'],
  bend: ['bent', 'bent'],
  bind: ['bound', 'bound'],
  bite: ['bit', 'bitten'],
  bleed: ['bled', 'bled'],
  blow: ['blew', 'blown'],
  break: ['broke', 'broken'],
  breed: ['bred', 'bred'],
  bring: ['brought', 'brought'],
  build: ['built', 'built'],
  burn: ['burnt/burned', 'burnt/burned'],
  burst: ['burst', 'burst'],
  buy: ['bought', 'bought'],
  catch: ['caught', 'caught'],
  choose: ['chose', 'chosen'],
  cling: ['clung', 'clung'],
  come: ['came', 'come'],
  cost: ['cost', 'cost'],
  creep: ['crept', 'crept'],
  cut: ['cut', 'cut'],
  deal: ['dealt', 'dealt'],
  dig: ['dug', 'dug'],
  do: ['did', 'done'],
  draw: ['drew', 'drawn'],
  drink: ['drank', 'drunk'],
  drive: ['drove', 'driven'],
  eat: ['ate', 'eaten'],
  fall: ['fell', 'fallen'],
  feed: ['fed', 'fed'],
  feel: ['felt', 'felt'],
  fight: ['fought', 'fought'],
  find: ['found', 'found'],
  flee: ['fled', 'fled'],
  fly: ['flew', 'flown'],
  forbid: ['forbade', 'forbidden'],
  forget: ['forgot', 'forgotten'],
  forgive: ['forgave', 'forgiven'],
  freeze: ['froze', 'frozen'],
  get: ['got', 'got'],
  give: ['gave', 'given'],
  go: ['went', 'gone'],
  grind: ['ground', 'ground'],
  grow: ['grew', 'grown'],
  hang: ['hung', 'hung'],
  have: ['had', 'had'],
  hear: ['heard', 'heard'],
  hide: ['hid', 'hidden'],
  hit: ['hit', 'hit'],
  hold: ['held', 'held'],
  hurt: ['hurt', 'hurt'],
  keep: ['kept', 'kept'],
  know: ['knew', 'known'],
  lay: ['laid', 'laid'],
  lead: ['led', 'led'],
  leave: ['left', 'left'],
  lend: ['lent', 'lent'],
  let: ['let', 'let'],
  lie: ['lay', 'lain'],
  lose: ['lost', 'lost'],
  make: ['made', 'made'],
  mean: ['meant', 'meant'],
  meet: ['met', 'met'],
  pay: ['paid', 'paid'],
  put: ['put', 'put'],
  read: ['read', 'read'],
  ride: ['rode', 'ridden'],
  ring: ['rang', 'rung'],
  rise: ['rose', 'risen'],
  run: ['ran', 'run'],
  say: ['said', 'said'],
  see: ['saw', 'seen'],
  seek: ['sought', 'sought'],
  sell: ['sold', 'sold'],
  send: ['sent', 'sent'],
  set: ['set', 'set'],
  shake: ['shook', 'shaken'],
  shoot: ['shot', 'shot'],
  show: ['showed', 'shown'],
  shrink: ['shrank', 'shrunk'],
  shut: ['shut', 'shut'],
  sing: ['sang', 'sung'],
  sink: ['sank', 'sunk'],
  sit: ['sat', 'sat'],
  sleep: ['slept', 'slept'],
  speak: ['spoke', 'spoken'],
  spend: ['spent', 'spent'],
  stand: ['stood', 'stood'],
  steal: ['stole', 'stolen'],
  strike: ['struck', 'struck'],
  swim: ['swam', 'swum'],
  take: ['took', 'taken'],
  teach: ['taught', 'taught'],
  tear: ['tore', 'torn'],
  tell: ['told', 'told'],
  think: ['thought', 'thought'],
  throw: ['threw', 'thrown'],
  understand: ['understood', 'understood'],
  wake: ['woke', 'woken'],
  wear: ['wore', 'worn'],
  win: ['won', 'won'],
  write: ['wrote', 'written']
};

/**
 * Calculates Verb Conjugation Forms (V1, V2, V3)
 * @param {string} word - Base verb
 * @param {string} [pos] - Part of speech tag
 * @returns {{ v1: string, v2: string, v3: string } | null}
 */
export function getVerbForms(word, pos) {
  if (!word || typeof word !== 'string') return null;
  const isVerb = pos && String(pos).toLowerCase().includes('v') && !String(pos).toLowerCase().includes('adv');
  const base = word.trim().toLowerCase();
  
  if (!isVerb && !IRREGULAR_VERBS[base]) return null;

  if (IRREGULAR_VERBS[base]) {
    const [v2, v3] = IRREGULAR_VERBS[base];
    return { v1: word, v2, v3 };
  }

  // Regular conjugation
  let v2, v3;
  if (base.endsWith('e')) {
    v2 = base + 'd';
    v3 = base + 'd';
  } else if (base.endsWith('y') && !/[aeiou]y$/.test(base)) {
    v2 = base.slice(0, -1) + 'ied';
    v3 = base.slice(0, -1) + 'ied';
  } else if (/[^aeiou][aeiou][^aeiouwxy]$/.test(base) && base.length <= 5) {
    const lastChar = base[base.length - 1];
    v2 = base + lastChar + 'ed';
    v3 = base + lastChar + 'ed';
  } else {
    v2 = base + 'ed';
    v3 = base + 'ed';
  }

  return { v1: word, v2, v3 };
}
