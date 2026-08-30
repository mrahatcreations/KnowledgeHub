import React from 'react';
import { Compass, BookOpen } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'path', label: 'গেম পাথ (২০১ লেভেল)', icon: Compass },
    { id: 'vocab', label: 'শব্দকোষ (১,০০৫ শব্দ)', icon: BookOpen }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-3 sm:px-6 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl safe-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative flex items-center justify-center space-x-2 flex-1 min-w-0 py-2.5 px-3 rounded-2xl transition-all duration-200 active:scale-95 min-h-[48px] ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 font-black border border-indigo-500/40 shadow-md shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 font-semibold'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {/* Active Glow Dot */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'stroke-[2.5] text-indigo-400 scale-110' : 'stroke-[1.8]'}`} />
              <span className="text-xs sm:text-sm tracking-tight leading-none truncate font-bold">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

