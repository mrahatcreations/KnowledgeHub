import React from 'react';
import { Compass, BookOpen } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'path', label: 'Level Path', icon: Compass },
    { id: 'vocab', label: 'Word List', icon: BookOpen }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f19] border-t border-slate-800 px-3.5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg safe-bottom select-none">
      <div className="max-w-md w-full mx-auto flex items-center justify-around gap-2.5">
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
                  ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isActive ? 'text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]' : 'text-slate-400'}`} />
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
