import React from 'react';
import { Compass, BookOpen, RefreshCw } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function BottomNav({ activeTab, setActiveTab, onOpenSync }) {
  const tabs = [
    { id: 'path', label: 'গেম পাথ', icon: Compass, sub: '২০১ লেভেল' },
    { id: 'vocab', label: 'শব্দকোষ', icon: BookOpen, sub: '১,০০৫ শব্দ' },
    { id: 'sync', label: 'গিটহাব সিঙ্ক', icon: RefreshCw, sub: 'লাইভ ডাটা' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 sm:px-4 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl safe-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                if (tab.id === 'sync') {
                  if (onOpenSync) onOpenSync();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`relative flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-95 min-h-[48px] ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 font-black border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 font-semibold'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <span className="absolute -top-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8]" />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'stroke-[2.5] text-indigo-400 scale-110' : 'stroke-[1.8]'}`} />
              <span className="text-[11px] sm:text-xs mt-0.5 tracking-tight leading-none truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

