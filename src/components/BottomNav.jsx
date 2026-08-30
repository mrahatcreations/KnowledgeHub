import React from 'react';
import { Compass, BookOpen, Trophy, User } from 'lucide-react';
import { sound } from '../audio/SoundSynthesizer';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'path', label: 'গেম পাথ', icon: Compass },
    { id: 'vocab', label: 'শব্দকোষ', icon: BookOpen },
    { id: 'ranks', label: 'র‍্যাংকিং', icon: Trophy },
    { id: 'profile', label: 'প্রোফাইল', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-1 sm:px-3 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl safe-bottom select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
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
              className={`relative flex flex-col items-center justify-center flex-1 min-w-0 py-1 px-1 rounded-xl transition-all duration-200 active:scale-95 min-h-[44px] ${
                isActive
                  ? 'text-indigo-400 font-black'
                  : 'text-slate-400 hover:text-slate-200 font-semibold'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute top-0 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
              )}
              <Icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'stroke-[2.5] text-indigo-400 scale-110' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight leading-tight truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

