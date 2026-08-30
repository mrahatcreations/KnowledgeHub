/**
 * Unified Engine API Entry Point
 */
export {
  STAGE_TYPES,
  CORE_STAGE_MODES,
  STAGE_TITLES,
  STAGE_INSTRUCTIONS,
  shuffleArray,
  extractWordList,
  getRandomDistractors,
  generateFlashcardStage,
  generateMatchingStage,
  generateDragDropStage,
  generateTrueFalseStage,
  generateOddOneOutStage,
  buildStageByType,
  buildLevelStages,
  compileLevel,
  default as levelCompiler
} from './levelCompiler.js';

export * from './levelCompiler.js';
