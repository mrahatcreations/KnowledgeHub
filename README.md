# 📱 Knowledge Hub (v1.1.0) - English Learning Game App
> Production-grade English Learning Platform with 201 Levels, 10 Interactive Gamified Stages, Modular Per-Level JSON Architecture, Encrypted Binary Audio Pack, and Real-Time GitHub Cloud Sync.

## 🚀 Key Highlights & Features (v1.1.0)
- **Modular Level Database**: 201 cleanly separated levels hosted at `level/english/level1.json` through `level201.json` with standard Phonetic IPA, authentic Bengali translations, verified Synonyms/Antonyms, and contextual sentences.
- **10-Stage Dynamic Game Engine**:
  1. **🃏 Flash Card**: 3D Flip card with IPA transcription, native pronunciation & Active Recall quiz.
  2. **🔗 Match Link**: Left-Right pair matching (Definition, Synonyms, Antonyms, PoS) with tactile feedback.
  3. **🧩 Drag & Drop**: Contextual sentence fill-in-the-blank with snap tokens and audio playback.
  4. **↔️ True/False Swipe**: Touch swipe card with TRUE/FALSE stamps and keyboard controls.
  5. **🎯 Odd One Out**: 4-card semantic anomaly discrimination grid.
- **5-Star Mastery Progression**: 0.5 stars earned per flawless 1st-attempt stage completion; unlock next levels upon achieving 5-star mastery.
- **Encrypted Binary Audio Pack Engine**: Custom single-stream `.khpack` (AES-256 + Gzip) offline voice container.
- **Ultra-Thin Installer**: Production APK under 25 MB with zero loose audio file bloat.
- **100% Offline-First Architecture**: Cold-start resilient with instant local hydration.

## 📦 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Mobile Native**: Capacitor 8.5 (@capacitor/core, @capacitor/android, @capacitor/app)
- **Dataset**: 201 Modular Levels containing 1,005 Vocabulary, Phrasal Verbs, Idioms, Prepositions, and Word Transformations

## 🛠️ Getting Started
```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run full test suite (17 test suites)
npm test

# Build production bundle
npm run build
```

## 🔄 Live Sync Endpoints
- **Modular Level CDN**: `https://raw.githubusercontent.com/mrahatcreations/KnowledgeHub/main/level/english/level{n}.json`
- **Master Dataset**: `https://raw.githubusercontent.com/mrahatcreations/KnowledgeHub/main/public/data/levels.json`
- **Audio Voice Pack**: `https://github.com/mrahatcreations/KnowledgeHub/releases/download/v1.1.0/voice_pack_v1.khpack`
