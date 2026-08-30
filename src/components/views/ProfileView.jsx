import React from 'react';
import { User, Star, Flame, Diamond, Heart, Trophy, Award, Shield, Settings, Volume2, VolumeX, RefreshCw, CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function ProfileView({ 
  levels, 
  unlockedLevel, 
  levelStars, 
  streak = 5, 
  gems = 240, 
  lives = 5,
  isAudioMuted,
  setIsAudioMuted,
  onOpenSettings
}) {
  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  const masteredCount = Object.values(levelStars).filter(s => s === 5).length;
  const maxPossibleStars = levels.length * 5;
  const progressPercent = Math.min(100, Math.round((totalStars / (maxPossibleStars || 1)) * 100));

  const badges = [
    { id: 1, title: 'শব্দ শিকারী', desc: 'প্রথম লেভেল ৫-স্টার সম্পন্ন করুন', earned: masteredCount >= 1, icon: '🎯' },
    { id: 2, title: '৫-স্টার মাস্টার', desc: '১০টি লেভেলে ৫-স্টার অর্জন করুন', earned: masteredCount >= 10, icon: '👑' },
    { id: 3, title: 'অগ্নি শিখা', desc: 'টানা ৫ দিন অনুশীলনের স্ট্রিক', earned: streak >= 5, icon: '🔥' },
    { id: 4, title: 'ভোকাবুলারি টাইটান', desc: '১০০টি লেভেল আনলক করুন', earned: unlockedLevel >= 100, icon: '⚡' },
    { id: 5, title: 'রত্ন সংগ্রাহক', desc: '২০০ এর বেশি রত্ন (Gems) অর্জন', earned: gems >= 200, icon: '💎' },
    { id: 6, title: 'পারফেকশনিস্ট', desc: '২৫টি লেভেলে ফুল স্কোর করুন', earned: masteredCount >= 25, icon: '🏆' }
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-32 pt-2 select-none animate-pop">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-5 border border-indigo-500/30 mb-5 shadow-2xl text-center">
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-500/30 border-2 border-indigo-300">
          <User className="w-10 h-10 text-white" />
          <div className="absolute -bottom-2 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-white">
            PRO
          </div>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight">শিক্ষার্থী প্রোফাইল</h2>
        <p className="text-xs text-indigo-300 font-medium mt-0.5">ভোকাবুলারি লার্নিং জার্নি</p>

        {/* Level Mastery Progress Bar */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-bold">সারগ্রাহী অগ্রগতি</span>
            <span className="text-amber-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-medium">
            <span>অর্জিত স্টার: <b className="text-amber-300 font-mono">{totalStars}</b></span>
            <span>মাস্টার লেভেল: <b className="text-indigo-300 font-mono">{masteredCount}/{levels.length}</b></span>
          </div>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-md">
          <Flame className="w-5 h-5 text-amber-400 fill-amber-400 mx-auto mb-1 animate-bounce" />
          <div className="text-lg font-black text-white font-mono">{streak} দিন</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">স্ট্রিক</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-md">
          <Diamond className="w-5 h-5 text-cyan-400 fill-cyan-400 mx-auto mb-1" />
          <div className="text-lg font-black text-white font-mono">{gems}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">রত্ন (Gems)</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center shadow-md">
          <Heart className="w-5 h-5 text-rose-400 fill-rose-400 mx-auto mb-1" />
          <div className="text-lg font-black text-white font-mono">{lives}/৫</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">হার্টস</div>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 mb-5 shadow-xl">
        <div className="flex items-center space-x-2 text-xs font-black text-slate-300 uppercase tracking-wider mb-4">
          <Award className="w-4 h-4 text-amber-400" />
          <span>অর্জিত মেডেল ও ব্যাজসমূহ</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                b.earned
                  ? 'bg-slate-950/80 border-amber-500/40 shadow-sm'
                  : 'bg-slate-950/40 border-slate-800/80 opacity-40'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <h4 className="text-xs font-black text-white">{b.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{b.desc}</p>
                </div>
              </div>
              <div className="mt-2 text-right">
                {b.earned ? (
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider">
                    ✓ Unlocked
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings / Preferences Buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onOpenSettings}
          className="w-full p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm flex items-center justify-between transition shadow-md active:scale-95"
        >
          <div className="flex items-center space-x-3">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>ডেটাবেজ সিঙ্ক ও সেটিংস</span>
          </div>
          <span className="text-xs text-slate-500">খুলুন ›</span>
        </button>
      </div>
    </div>
  );
}
