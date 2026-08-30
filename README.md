# 📱 VocabMaster - English Mobile Learning Game App
> Dynamic English Vocabulary Game with 5 Interactive Stages, The Blender Cross-Stage Randomizer, and Real-Time GitHub Sync.

## 🚀 Features
- **Duolingo / Candy Crush Style Saga Path**: 201 winding levels with 3D bouncing nodes and milestone chests.
- **5 Dynamic Game Stages**:
  1. **🃏 Flash Card**: 3D Flip card with English pronunciation (Web Speech API) & Active Recall quiz.
  2. **🔗 Match Link**: Left-Right connect matching with tactile audio feedback.
  3. **🧩 Drag & Drop**: Contextual sentence fill-in-the-blank with snap chips.
  4. **↔️ True/False Swipe**: Tinder-style touch swipe card with TRUE/FALSE stamps.
  5. **🎯 Odd One Out**: 4-card challenge grid to find the semantic odd word.
- **The Blender Engine**: Scrambles stage types and option positions on level retry.
- **5-Star Requirement**: Next level unlocks ONLY if all 5 stages in the current level are answered correctly on the 1st attempt.
- **Zero-Emoji Pure Vector UI**: Premium colorful SVG icons via Lucide.
- **Pure Web Audio API**: Procedural sound effects with zero external audio assets.
- **Live GitHub Sync**: Automatically fetches new level data from data/version.json and caches locally for 100% offline play.

## 📦 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Mobile Native**: Capacitor Ready (@capacitor/core, @capacitor/android)
- **Dataset**: 201 Levels containing 1,005 Vocabulary, Phrases, Idioms, Prepositions, and Word Transformations

## 🛠️ Getting Started
`ash
# Install dependencies
npm install

# Run local development server
npm run dev

# Build production bundle
npm run build
`

## 🔄 Live Sync Endpoint
- Remote Version: https://raw.githubusercontent.com/mrahatcreations/English-Easy/main/data/version.json
- Remote Levels: https://raw.githubusercontent.com/mrahatcreations/English-Easy/main/data/levels.json
