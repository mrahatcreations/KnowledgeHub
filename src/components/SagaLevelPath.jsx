import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Star, Lock, Trophy, Sparkles, Gift, Crown, Play, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function SagaLevelPath({ 
  levels = [], 
  unlockedLevel = 1, 
  levelStars = {}, 
  gems = 100, 
  streak = 1, 
  lives = 5, 
  onSelectLevel,
  isAudioMuted = false,
  setIsAudioMuted
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

  const totalMaxStars = levels.length * 5;
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
  const TOP_PAD = 50;        // top padding for first node inside the path canvas

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
    return nodePositions[nodePositions.length - 1].y + 80;
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
        <p className="text-sm font-bold text-slate-400">Loading Levels...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pt-[calc(145px+env(safe-area-inset-top,0px))] pb-28 sm:pb-32">
      {/* 1. PERMANENTLY FIXED TOP DASHBOARD (Status + Progress + Filter Pills) */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 bg-[#0b0f19] border-b border-slate-800 shadow-md safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)' }}
      >
        <div className="max-w-md w-full mx-auto px-3.5 pb-2.5">
          {/* Top Status & Controls Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-xs">
                V
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="font-black text-sm text-white tracking-tight">Level Path</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-0.2 rounded-full border border-slate-700">
                    {levels.length}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                  Level {Math.min(unlockedLevel, levels.length)} of {levels.length}
                </span>
              </div>
            </div>

            {/* Right: Stars, Completed & Mute */}
            <div className="flex items-center space-x-1.5 shrink-0">
              {/* Total Stars */}
              <div 
                className="flex items-center space-x-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-xl border border-amber-500/20"
                title="Total Stars Collected"
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                <span className="font-mono text-xs font-black">{String(totalStarsEarned).replace('.0', '')}</span>
              </div>

              {/* Mastered Levels */}
              <div 
                className="flex items-center space-x-1 bg-slate-800 text-slate-200 px-2 py-1 rounded-xl border border-slate-700"
                title="Mastered Levels"
              >
                <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span className="font-mono text-xs font-black">{totalMastered}</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={toggleAudio}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition active:scale-95 shrink-0"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
                aria-label="Sound Toggle"
              >
                {isAudioMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden mb-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>

          {/* Horizontal Unit Filter Pills */}
          <div className="w-full flex items-center space-x-2 overflow-x-auto scrollbar-none whitespace-nowrap touch-pan-x">
            {units.map((u, i) => {
              const isSelected = selectedUnit === u;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedUnit(u);
                    sound.playClick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-black'
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

      {/* 3. Winding Path */}
      <div 
        ref={pathContainerRef}
        className="relative w-[320px] mx-auto flex justify-center pt-8 pb-4"
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
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Locked Stepping Dashes */}
          <path
            d={svgCurves.fullPath}
            stroke="#334155"
            strokeWidth="4"
            strokeDasharray="6 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Unlocked Solid Active Line */}
          {svgCurves.unlockedPath && (
            <path
              d={svgCurves.unlockedPath}
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
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
                  <div className="absolute -top-10 z-30 animate-float flex flex-col items-center pointer-events-none">
                    <div className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-md border border-blue-400 flex items-center space-x-1">
                      <Play className="w-2.5 h-2.5 fill-white" />
                      <span>START</span>
                    </div>
                    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-blue-600" />
                  </div>
                )}

                {/* Duolingo-style 3D Circle Node Button */}
                <button
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playClick();
                      onSelectLevel(lvl);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`saga-node-base w-15 h-15 sm:w-16 sm:h-16 ${
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
                    <div className="absolute -top-2.5 bg-amber-400 border-2 border-white rounded-full p-0.5 shadow-sm">
                      <Crown className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                    </div>
                  )}

                  {/* Level Number or Lock */}
                  {isUnlocked ? (
                    <span className={`text-xl sm:text-2xl font-black font-mono leading-none ${
                      isMastered ? 'text-amber-950' : 'text-white'
                    }`}>
                      {lvl.level_id}
                    </span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-500" />
                  )}
                </button>

                {/* Star Rating Badge (Only shown if unlocked & has stars) */}
                {isUnlocked && displayStars > 0 && (
                  <div className={`flex items-center justify-center space-x-1 mt-1.5 px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                    isMastered
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
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
