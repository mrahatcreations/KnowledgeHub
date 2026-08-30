import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import fs from 'fs'
import path from 'path'

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

function audioLoggerPlugin() {
  const logFile = path.resolve(process.cwd(), 'audio_debug.log')
  return {
    name: 'audio-logger',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 1. Live Audio Logger Beacon
        if (req.url === '/__log_audio' && req.method === 'POST') {
          let body = ''
          req.on('data', chunk => { body += chunk })
          req.on('end', () => {
            try {
              const data = JSON.parse(body)
              const line = `[${new Date().toLocaleTimeString()}] ${data.msg}\n`
              console.log(`\x1b[36m${line}\x1b[0m`)
              fs.appendFileSync(logFile, line)
            } catch (e) {}
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          })
          return
        }

        // 2. Microsoft Edge Neural HD Voice Engine (en-US-ChristopherNeural)
        if (req.url.startsWith('/__edge_tts')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:5173')
            const text = urlObj.searchParams.get('text') || ''
            if (!text) {
              res.writeHead(400)
              res.end('Missing text')
              return
            }

            const tts = new MsEdgeTTS()
            tts.setMetadata('en-US-ChristopherNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
              .then(() => {
                const { audioStream } = tts.toStream(text)
                res.writeHead(200, {
                  'Content-Type': 'audio/mpeg',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'public, max-age=86400'
                })
                audioStream.pipe(res)
              })
              .catch((err) => {
                console.error('Edge TTS Error:', err)
                res.writeHead(500)
                res.end()
              })
            return
          } catch (e) {
            res.writeHead(500)
            res.end()
            return
          }
        }

        // 3. High-Definition Studio Word Proxy (Fallback)
        if (req.url.startsWith('/__tts_word')) {
          try {
            const urlObj = new URL(req.url, 'http://localhost:5173')
            const w = urlObj.searchParams.get('w') || ''
            if (!w) {
              res.writeHead(400)
              res.end('Missing word')
              return
            }

            const targetUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(w)}&type=2`
            fetch(targetUrl)
              .then(resp => {
                if (!resp.ok) {
                  res.writeHead(resp.status)
                  res.end()
                  return
                }
                res.writeHead(200, {
                  'Content-Type': 'audio/mpeg',
                  'Access-Control-Allow-Origin': '*',
                  'Cache-Control': 'public, max-age=86400'
                })
                resp.body.pipeTo(new WritableStream({
                  write(chunk) { res.write(chunk) },
                  close() { res.end() }
                }))
              })
              .catch(() => {
                res.writeHead(500)
                res.end()
              })
            return
          } catch (e) {
            res.writeHead(500)
            res.end()
            return
          }
        }
        next()
      })
    }
  }
}

function excludeHeavyAudioPlugin() {
  return {
    name: 'exclude-heavy-audio',
    closeBundle() {
      const distAudio = path.resolve(process.cwd(), 'dist', 'audio');
      if (fs.existsSync(distAudio)) {
        const files = fs.readdirSync(distAudio);
        let removed = 0;
        for (const file of files) {
          if (file.endsWith('.opus') || file.endsWith('.mp3')) {
            try {
              fs.unlinkSync(path.join(distAudio, file));
              removed++;
            } catch (e) {}
          }
        }
        console.log(`✨ Ultra-thin installer: Excluded ${removed} offline audio files from dist.`);
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), audioLoggerPlugin(), excludeHeavyAudioPlugin()],
  server: {
    watch: {
      ignored: ['**/android/**', '**/dist/**', '**/*.apk', '**/audio_debug.log']
    }
  },
  build: {
    target: ['chrome58', 'es2015'],
    cssTarget: 'chrome61',
    emptyOutDir: false
  }
})

