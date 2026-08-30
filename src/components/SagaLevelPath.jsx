import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Lock, Trophy, Sparkles, Gift, Crown, Play, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function SagaLevelPath({ 
  levels = [], 
  unlockedLevel = 1, 
  levelStars = {}, 
  gems = 100, 
  streak = 1, 
  lives = 5, 
  onSelectLevel,
  onBackToHub,
  isAudioMuted = false,
  setIsAudioMuted,
  onOpenAudioSettings
}) {
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const currentNodeRef = useRef(null);
  const pathContainerRef = useRef(null);

  const toggleAudio = () => {
    const next = !isAudioMuted;
    if (setIsAudioMuted) setIsAudioMuted(next);
    sound.enabled = !next;
  };

  // Extract units for category filter pills
  const units = useMemo(() => {
    return ['ALL', ...new Set(levels.map(l => l.unit || l.category).filter(Boolean))];
  }, [levels]);

  const filteredLevels = useMemo(() => {
    return selectedUnit === 'ALL' ? levels : levels.filter(l => (l.unit || l.category) === selectedUnit);
  }, [levels, selectedUnit]);

  // Global Mastery and Star statistics
  const totalMastered = useMemo(() => {
    return Object.values(levelStars).filter(s => Number(s) >= 5 || Number(s) === 10).length;
  }, [levelStars]);

  const totalStarsEarned = useMemo(() => {
    return Number(
      Object.values(levelStars).reduce((sum, s) => {
        const num = Number(s) || 0;
        return sum + (num > 5 ? num * 0.5 : num);
      }, 0).toFixed(1)
    );
  }, [levelStars]);

  const progressPercent = Math.min(100, Math.round((Math.min(unlockedLevel - 1, levels.length) / levels.length) * 100));

  // Auto-scroll to the current unlocked level node only if beyond level 2
  useEffect(() => {
    if (currentNodeRef.current && unlockedLevel > 2) {
      const timer = setTimeout(() => {
        currentNodeRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedUnit, unlockedLevel]);

  const formatUnitName = (u) => {
    if (u === 'ALL') return 'All Levels';
    const match = u.match(/(?:Unit|Image)\s*[-:]?\s*(\d+)/i);
    if (match) {
      return `Unit ${match[1]}`;
    }
    return u;
  };

  // Geometric constants for smooth Winding Path
  const SINE_PERIOD = 6;     // 6 nodes per full sine wave
  const AMPLITUDE = 60;      // horizontal sway (px)
  const CENTER_X = 160;      // center point in a 320px SVG canvas
  const ROW_HEIGHT = 105;    // vertical distance between node centers (px)
  const TOP_PAD = 80;        // top padding for first node inside the path canvas to give START badge clearance

  // Calculate coordinates for every level node in the current view
  const nodePositions = useMemo(() => {
    return filteredLevels.map((lvl, index) => {
      const x = CENTER_X + Math.sin((index / SINE_PERIOD) * Math.PI * 2) * AMPLITUDE;
      const y = TOP_PAD + index * ROW_HEIGHT;
      return { x, y, level_id: lvl.level_id };
    });
  }, [filteredLevels]);

  const totalSvgHeight = useMemo(() => {
    if (nodePositions.length === 0) return 300;
    return nodePositions[nodePositions.length - 1].y + 70;
  }, [nodePositions]);

  // Generate SVG Cubic Bezier Curve connecting all node centers
  const svgCurves = useMemo(() => {
    if (nodePositions.length < 2) return { fullPath: '', unlockedPath: '' };

    let fullPath = `M ${nodePositions[0].x} ${nodePositions[0].y}`;
    let unlockedPath = `M ${nodePositions[0].x} ${nodePositions[0].y}`;

    for (let i = 0; i < nodePositions.length - 1; i++) {
      const p0 = nodePositions[i];
      const p1 = nodePositions[i + 1];
      const controlY1 = p0.y + ROW_HEIGHT * 0.5;
      const controlY2 = p1.y - ROW_HEIGHT * 0.5;

      const segment = ` C ${p0.x} ${controlY1}, ${p1.x} ${controlY2}, ${p1.x} ${p1.y}`;
      fullPath += segment;

      if (p1.level_id <= unlockedLevel) {
        unlockedPath += segment;
      }
    }

    return { fullPath, unlockedPath };
  }, [nodePositions, unlockedLevel]);

  if (!levels || levels.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto py-20 flex flex-col items-center justify-center space-y-3">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Loading Levels...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-[calc(96px+env(safe-area-inset-top,0px))] pb-12 sm:pb-16">
      {/* 1. PERMANENTLY FIXED TOP ULTRA-COMPACT DASHBOARD (<= 80px total height, 2 Slim Rows) */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xs safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 6px)' }}
      >
        <div className="max-w-md w-full mx-auto px-3 pb-2">
          {/* Row 1: Back Button + Level Progress Center + Stats & Audio on Right */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Hub Navigation */}
            <button
              onClick={() => {
                sound.playClick();
                if (onBackToHub) onBackToHub();
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded-none bg-slate-900 hover:bg-slate-800 active:bg-slate-700 transition border border-slate-700/80 text-slate-200 shrink-0 cursor-pointer font-mono font-bold text-xs"
              title="Back to Subjects Hub"
              aria-label="Back to Subjects"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>HUB</span>
            </button>

            {/* Center: Title & Mini Level Progress Bar */}
            <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1">
              <div className="flex items-center space-x-1.5 leading-none">
                <span className="font-mono font-bold text-xs text-white uppercase tracking-wider truncate">English Saga</span>
                <span className="text-[9px] font-mono font-bold text-indigo-300 shrink-0">
                  Lvl {Math.min(unlockedLevel, levels.length)}/{levels.length}
                </span>
              </div>
              <div className="w-full max-w-[120px] h-1 bg-slate-900 rounded-none border border-slate-800/90 overflow-hidden mt-1">
                <div 
                  className="h-full bg-indigo-500 rounded-none transition-all duration-300"
                  style={{ width: `${Math.max(3, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Right: Stars, Completed & Mute */}
            <div className="flex items-center space-x-1 shrink-0 font-mono">
              {/* Total Stars */}
              <div 
                className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-1.5 py-1 rounded-none border border-amber-500/20"
                title="Total Stars Collected"
              >
                <Star className="w-3 h-3 fill-amber-400 shrink-0" />
                <span className="text-xs font-bold">{String(totalStarsEarned).replace('.0', '')}</span>
              </div>

              {/* Mastered Levels */}
              <div 
                className="flex items-center space-x-1 bg-slate-900 text-slate-200 px-1.5 py-1 rounded-none border border-slate-700/80"
                title="Mastered Levels"
              >
                <Crown className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <span className="text-xs font-bold">{totalMastered}</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={toggleAudio}
                className="w-7 h-7 flex items-center justify-center rounded-none bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition active:scale-95 shrink-0 cursor-pointer"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label="Sound Toggle"
              >
                {isAudioMuted ? (
                  <VolumeX className="w-3 h-3 text-rose-400" />
                ) : (
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Horizontal Unit Filter Chips */}
          <div className="w-full flex items-center space-x-1.5 overflow-x-auto scrollbar-none whitespace-nowrap touch-pan-x mt-1.5 pt-0.5">
            {units.map((u, i) => {
              const isSelected = selectedUnit === u;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedUnit(u);
                    sound.playClick();
                  }}
                  className={`px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border border-indigo-400/40 shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {formatUnitName(u)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Winding Path Canvas */}
      <div 
        ref={pathContainerRef}
        className="relative w-[320px] mx-auto flex justify-center pt-6 pb-4"
        style={{ minHeight: `${totalSvgHeight}px` }}
      >
        {/* Clean SVG Connecting Path */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox={`0 0 320 ${totalSvgHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
        >
          {/* Base Road Track */}
          <path
            d={svgCurves.fullPath}
            stroke="#0f172a"
            strokeWidth="14"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Stepping Track Border */}
          <path
            d={svgCurves.fullPath}
            stroke="#1e293b"
            strokeWidth="4"
            strokeDasharray="4 6"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />

          {/* Unlocked Solid Active Line */}
          {svgCurves.unlockedPath && (
            <path
              d={svgCurves.unlockedPath}
              stroke="#4f46e5"
              strokeWidth="4"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          )}
        </svg>

        {/* Level Nodes */}
        {filteredLevels.map((lvl, index) => {
          const pos = nodePositions[index] || { x: CENTER_X, y: TOP_PAD + index * ROW_HEIGHT };
          const isUnlocked = lvl.level_id <= unlockedLevel;
          const isCurrent = lvl.level_id === unlockedLevel;
          const rawStars = levelStars[lvl.level_id] || 0;
          const displayStars = rawStars > 5 ? Number((rawStars * 0.5).toFixed(1)) : Number(Number(rawStars).toFixed(1));
          const isMastered = displayStars >= 5.0;

          return (
            <React.Fragment key={lvl.level_id}>
              {/* Node Container with Virtualized Content Visibility for 60FPS Performance */}
              <div
                ref={isCurrent ? currentNodeRef : null}
                style={{
                  position: 'absolute',
                  top: `${pos.y}px`,
                  left: `${pos.x}px`,
                  transform: 'translate3d(-50%, -50%, 0)',
                  zIndex: isCurrent ? 25 : 10,
                  contentVisibility: isCurrent ? 'visible' : 'auto',
                  containIntrinsicSize: '80px 105px'
                }}
                className="flex flex-col items-center"
              >
                {/* Floating "START" Indicator for Active Node */}
                {isCurrent && (
                  <div className="absolute -top-8 z-30 animate-float flex flex-col items-center pointer-events-none">
                    <div className="bg-indigo-600 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-none shadow-md border border-indigo-400 flex items-center space-x-1">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>START</span>
                    </div>
                    <div className="w-0 h-0 border-x-3 border-x-transparent border-t-3 border-t-indigo-600" />
                  </div>
                )}

                {/* Hard Corner 3D Square Node Button */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`saga-node-base w-14 h-14 sm:w-15 sm:h-15 rounded-none font-mono ${
                    isMastered
                      ? 'saga-node-mastered'
                      : isCurrent
                      ? 'saga-node-current animate-pulse-subtle'
                      : isUnlocked
                      ? 'saga-node-unlocked'
                      : 'saga-node-locked'
                  }`}
                  aria-label={`Level ${lvl.level_id}`}
                >
                  {/* Mastered Crown Badge */}
                  {isMastered && (
                    <div className="absolute -top-2 bg-amber-400 border border-amber-200 rounded-none px-1 py-0.5 shadow-xs flex items-center justify-center">
                      <Crown className="w-3 h-3 fill-amber-950 text-amber-950" />
                    </div>
                  )}

                  {/* Level Number or Lock */}
                  {isUnlocked ? (
                    <span className={`text-lg sm:text-xl font-black font-mono leading-none ${
                      isMastered ? 'text-amber-950' : 'text-white'
                    }`}>
                      {lvl.level_id}
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {/* Star Rating Badge (Only shown if unlocked & has stars) */}
                {isUnlocked && displayStars > 0 && (
                  <div className={`flex items-center justify-center space-x-1 mt-1 px-1.5 py-0.5 rounded-none border text-[9px] font-mono font-bold ${
                    isMastered
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-slate-950/90 border-slate-800 text-slate-300'
                  }`}>
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span>{String(displayStars).replace('.0', '')}/5</span>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
