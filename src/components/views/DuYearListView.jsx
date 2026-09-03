import React from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  Volume2, 
  VolumeX,
  HelpCircle,
  PenTool,
  CheckCircle2
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

const MCQ_YEARS = [
  { year: '২০২৪-২৫', total: 60, bangla: 15, english: 15, gk: 30, tag: 'Latest' },
  { year: '২০২৩-২৪', total: 60, bangla: 15, english: 15, gk: 30 },
  { year: '২০২২-২৩', total: 60, bangla: 15, english: 15, gk: 30 },
  { year: '২০২১-২২', total: 60, bangla: 15, english: 15, gk: 30 },
  { year: '২০২০-২১', total: 60, bangla: 15, english: 15, gk: 30 },
  { year: '২০১৯-২০', total: 60, bangla: 16, english: 16, gk: 28 },
  { year: '২০১৮-১৯', total: 100, bangla: 25, english: 25, gk: 50 },
  { year: '২০১৭-১৮', total: 100, bangla: 25, english: 25, gk: 50 },
  { year: '২০১৬-১৭', total: 100, bangla: 25, english: 25, gk: 50 },
  { year: '২০১৫-১৬', total: 100, bangla: 25, english: 25, gk: 50 }
];

const WRITTEN_YEARS = [
  { year: '২০২৪-২৫', total: 6, bangla: 3, english: 3, tag: 'Latest' },
  { year: '২০২৩-২৪', total: 7, bangla: 4, english: 3 },
  { year: '২০২২-২৩', total: 6, bangla: 3, english: 3 },
  { year: '২০২১-২২', total: 6, bangla: 3, english: 3 },
  { year: '২০২০-২১', total: 6, bangla: 3, english: 3 },
  { year: '২০১৯-২০', total: 7, bangla: 4, english: 3, tag: '1st Written' }
];

export default function DuYearListView({
  mode = 'mcq', // 'mcq' | 'written'
  onSelectYear,
  onBack,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const isMcq = mode === 'mcq';
  const yearsList = isMcq ? MCQ_YEARS : WRITTEN_YEARS;
  const title = isMcq ? 'MCQ প্রশ্নব্যাংক' : 'Written প্রশ্নব্যাংক';
  const totalCount = isMcq ? '৭৬০টি প্রশ্ন' : '৩৮টি প্রশ্ন';

  const handlePickYear = (year) => {
    sound.playClick();
    if (onSelectYear) {
      onSelectYear(year, mode);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. ULTRA-COMPACT EDITORIAL STICKY HEADER (Budget <= 80px) */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c] border-b border-neutral-800 py-2.5 space-y-2 shadow-sm mb-3"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back Navigation + Title + Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onBack) onBack();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-semibold shrink-0 transition cursor-pointer active:scale-95"
              title="Back to Mode Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">BACK</span>
            </button>

            <div className="flex items-center space-x-1.5 min-w-0">
              {isMcq ? (
                <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <PenTool className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="font-mono text-[10px] px-2.5 py-1 font-bold rounded-lg bg-[#1e293b] text-white">
              {yearsList.length} Years • {totalCount}
            </span>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-7 h-7 rounded-lg bg-[#1e293b] hover:bg-[#334155] flex items-center justify-center text-white transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
              </button>
            )}
          </div>
        </div>

      </header>

      {/* 2. YEARS LIST CARDS - SOLID FLAT + ROUNDED */}
      <div className="w-full space-y-2 pt-1">
        {yearsList.map((item) => (
          <div
            key={item.year}
            onClick={() => handlePickYear(item.year)}
            className="w-full bg-[#1e293b] hover:bg-[#283548] rounded-xl p-3.5 transition cursor-pointer flex items-center justify-between active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center space-x-3.5 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center text-white shrink-0">
                <Calendar className="w-4 h-4" />
              </div>

              <div className="flex items-center space-x-2 truncate">
                <h2 className="text-sm font-bold text-white font-sans tracking-tight truncate">
                  ভর্তি পরীক্ষা: {item.year}
                </h2>
                {item.tag && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-[#0f172a] text-slate-300 shrink-0">
                    {item.tag}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#0f172a] text-white font-bold">
                {item.total} Qs
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
