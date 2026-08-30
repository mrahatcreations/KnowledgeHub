import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

const LEVELS_FILE = path.resolve('public/data/levels.json')
const AUDIO_DIR = path.resolve('public/audio')
const MANIFEST_FILE = path.join(AUDIO_DIR, 'manifest.json')

if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

function getAudioHash(text) {
  const clean = String(text || '')
    .replace(/[\u0980-\u09FF]/g, '')
    .replace(/[-_/]+/g, ' ')
    .replace(/["“”'’`]/g, '')
    .replace(/[^a-zA-Z0-9\s.,?!]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()

  return crypto.createHash('md5').update(clean).digest('hex').slice(0, 12)
}

function collectAllUniqueTexts() {
  const data = JSON.parse(fs.readFileSync(LEVELS_FILE, 'utf8'))
  const levels = data.levels || []

  const uniqueItems = new Map()

  const addText = (text, type = 'word') => {
    if (!text) return
    const clean = String(text)
      .replace(/[\u0980-\u09FF]/g, '')
      .replace(/[-_/]+/g, ' ')
      .replace(/["“”'’`]/g, '')
      .replace(/[^a-zA-Z0-9\s.,?!]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!clean) return
    const key = clean.toLowerCase()
    if (!uniqueItems.has(key)) {
      const hash = getAudioHash(clean)
      const filename = `${type === 'sentence' ? 's_' : 'w_'}${hash}.opus`
      uniqueItems.set(key, { text: clean, type, filename })
    }
  }

  levels.forEach(lvl => {
    (lvl.items || []).forEach(it => {
      if (it.word) addText(it.word, 'word')
      if (it.forms) {
        if (typeof it.forms === 'string') {
          it.forms.split(/[,;/]+/).forEach(f => addText(f.trim(), 'word'))
        } else if (typeof it.forms === 'object') {
          Object.values(it.forms).forEach(f => addText(f, 'word'))
        }
      }
      if (Array.isArray(it.synonyms)) {
        it.synonyms.forEach(s => addText(s, 'word'))
      } else if (it.raw_synonyms) {
        it.raw_synonyms.split(/[,;|]+/).forEach(s => addText(s.trim(), 'word'))
      }
      if (Array.isArray(it.antonyms)) {
        it.antonyms.forEach(a => addText(a, 'word'))
      } else if (it.raw_antonyms) {
        it.raw_antonyms.split(/[,;|]+/).forEach(a => addText(a.trim(), 'word'))
      }
      if (it.sentence) addText(it.sentence, 'sentence')
    })
  })

  return uniqueItems
}

async function generateAudio(item, tts) {
  const filePath = path.join(AUDIO_DIR, item.filename)
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return true
  }

  return new Promise((resolve, reject) => {
    try {
      const { audioStream } = tts.toStream(item.text)
      const out = fs.createWriteStream(filePath)
      audioStream.pipe(out)

      out.on('finish', () => resolve(true))
      out.on('error', (err) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        reject(err)
      })
      audioStream.on('error', (err) => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

async function run() {
  console.log('🔍 Scanning dataset for unique audio items...')
  const itemsMap = collectAllUniqueTexts()
  const items = Array.from(itemsMap.values())
  console.log(`✨ Found ${items.length} unique audio items to generate.`)

  let manifest = {}
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'))
    } catch (e) {}
  }

  items.forEach(it => {
    manifest[it.text.toLowerCase()] = it.filename
  })
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2))

  const CONCURRENCY = 20
  let completed = 0
  let skipped = 0
  let failed = 0

  const queue = [...items]

  async function worker(workerId) {
    const tts = new MsEdgeTTS()
    await tts.setMetadata('en-US-ChristopherNeural', OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS)

    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) break

      const filePath = path.join(AUDIO_DIR, item.filename)
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        skipped++
        completed++
        if (completed % 100 === 0 || completed === items.length) {
          process.stdout.write(`\rProgress: ${completed}/${items.length} (${((completed/items.length)*100).toFixed(1)}%) - Skipped: ${skipped}, Failed: ${failed}`)
        }
        continue
      }

      let success = false
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await generateAudio(item, tts)
          success = true
          break
        } catch (err) {
          await new Promise(r => setTimeout(r, 1000 * attempt))
        }
      }

      if (success) {
        completed++
      } else {
        failed++
        completed++
      }

      if (completed % 50 === 0 || completed === items.length) {
        process.stdout.write(`\rProgress: ${completed}/${items.length} (${((completed/items.length)*100).toFixed(1)}%) - Skipped: ${skipped}, Failed: ${failed}`)
      }
    }
  }

  console.log(`🚀 Starting generation with ${CONCURRENCY} parallel workers...`)
  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1))
  await Promise.all(workers)

  console.log('\n🎉 Audio generation process finished!')
  
  const files = fs.readdirSync(AUDIO_DIR)
  let totalBytes = 0
  files.forEach(f => {
    if (f.endsWith('.opus')) {
      totalBytes += fs.statSync(path.join(AUDIO_DIR, f)).size
    }
  })
  console.log(`📦 Total Generated Audio Files: ${files.length}`)
  console.log(`💾 Total Audio Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`)
}

run().catch(console.error)
