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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 py-2 px-3 safe-bottom shadow-2xl">
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
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-indigo-400 font-black scale-105'
                  : 'text-slate-500 hover:text-slate-300 font-bold'
              }`}
            >
              {/* Active Indicator Pip */}
              {isActive && (
                <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8]" />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-indigo-400' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

