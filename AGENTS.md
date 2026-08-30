# Global Agent Guidelines & UI/UX Architectural Rules

## 1. UI/UX Design & Visual Quality (Editorial / Premium Standard)

- **Avoid Button Overload & Box Inception (Visual Noise)**:
  - NEVER wrap every single word, synonym, antonym, or tag in heavy, saturated neon pill boxes/borders.
  - Use clean editorial layouts: structured icon rows (e.g. `[Icon] SYNONYMS: word1 • word2 • word3`), elegant typography, and generous breathing room.
  - Interactive items (like synonyms/antonyms with audio pronunciation) should look subtle and natural, not like a cluttered board of buttons.

- **Strict Header Height & Mobile Viewport Budget**:
  - Sticky headers MUST be ultra-compact (1 to 2 slim rows maximum, ideally <= 80px total height).
  - Row 1: Unified navigation (`HUB` / Back), Search Input, and Item Counter all in ONE row.
  - Row 2: Category Filter chips (horizontal scroll).
  - NEVER create 3 or 4 tall rows in a sticky header that eats up 20-30% of the mobile screen.

- **Color Harmony & Visual Hierarchy**:
  - Avoid competing bright neon colors (e.g. bright yellow meaning box + neon green synonym pills + neon red antonym pills + purple badge all in one card).
  - Use muted dark slate backgrounds, subtle accent borders (`border-slate-800`), and purposeful high-contrast text (`text-slate-100`, `text-slate-300`).
  - Example sentences should be styled as elegant quote blocks with quotation marks (`“ ”`) and subtle vertical accent lines rather than blunt heavy boxes.

---

## 2. CSS & Layout Architecture Guardrails

- **NEVER use CSS `float` for Side Rails or Layouts**:
  - Floated elements with fixed or tall height push normal full-width block elements down below the float, creating massive empty voids (Float Displacement Bug).
  - Use Flexbox, CSS Grid, or `fixed` / `sticky` positioning with proper margin offsets.

- **NEVER leave Permanent CSS `transform` on Sticky Parent Containers**:
  - Any ancestor element with CSS `transform` (e.g. `animation: popIn` with `transform: scale(...)`), `filter`, or `perspective` creates a new stacking context and containing block, which **BREAKS `position: sticky` on window scroll**.
  - Always ensure parents and wrappers of sticky elements have `transform: none` after mounting.

- **Mobile Safe Area & Notch Support**:
  - Always include safe-area insets for notched devices (`paddingTop: max(env(safe-area-inset-top, 0px), ...)`).
