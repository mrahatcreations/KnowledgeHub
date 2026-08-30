import React from 'react';
import { Compass, BookOpen } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'path', label: 'গেম পাথ (২০১ লেভেল)', icon: Compass },
    { id: 'vocab', label: 'শব্দকোষ (১,০০৫ শব্দ)', icon: BookOpen }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 sm:px-6 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg safe-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around gap-2.5">
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
              className={`relative flex items-center justify-center space-x-2 flex-1 min-w-0 py-2.5 px-3 rounded-xl transition-all duration-150 active:scale-95 min-h-[44px] ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span className="text-xs sm:text-sm tracking-tight leading-none truncate">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
