import React, { useState } from 'react';
import { Trophy, Flame, Crown, Shield, Sparkles, ChevronUp, ChevronDown, Diamond, Star } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function LeaderboardView({ unlockedLevel, levelStars, streak = 5 }) {
  const [selectedLeague, setSelectedLeague] = useState('Diamond');

  const totalStars = Object.values(levelStars).reduce((sum, s) => sum + s, 0);
  const userXP = totalStars * 20 + unlockedLevel * 50;

  const mockUsers = [
    { rank: 1, name: 'Tanvir Ahmed', xp: 4850, streak: 18, isUser: false, avatar: '👑', badge: 'Titan' },
    { rank: 2, name: 'Nusrat Jahan', xp: 4420, streak: 14, isUser: false, avatar: '⚡', badge: 'Pro' },
    { rank: 3, name: 'You (আপনি)', xp: Math.max(userXP, 2850), streak: streak, isUser: true, avatar: '🌟', badge: 'Champ' },
    { rank: 4, name: 'Sabbir Hossain', xp: 2650, streak: 9, isUser: false, avatar: '🔥', badge: 'Elite' },
    { rank: 5, name: 'Farzana Akter', xp: 2310, streak: 7, isUser: false, avatar: '💎', badge: 'Scholar' },
    { rank: 6, name: 'Mahmud Hasan', xp: 1980, streak: 6, isUser: false, avatar: '🎯', badge: 'Ace' },
    { rank: 7, name: 'Ayesha Siddiqua', xp: 1740, streak: 4, isUser: false, avatar: '📚', badge: 'Learner' },
    { rank: 8, name: 'Rayan Chowdhury', xp: 1520, streak: 3, isUser: false, avatar: '🚀', badge: 'Novice' },
  ];

  return (
    <div className="w-full max-w-md mx-auto px-4 pb-32 pt-2 select-none animate-pop">
      {/* Top League Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 rounded-3xl p-5 border border-purple-500/30 mb-5 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20 border border-cyan-300">
          <Diamond className="w-7 h-7 text-white fill-cyan-200" />
        </div>
        <span className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">
          DIAMOND LEAGUE
        </span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
          সাপ্তাহিক লিডারবোর্ড
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          শীর্ষ ৩ জন পরবর্তী গোল্ড ডিভিশনে উত্তীর্ণ হবেন!
        </p>

        <div className="mt-4 pt-3 border-t border-purple-900/60 flex items-center justify-around text-xs font-bold">
          <div>
            <span className="text-slate-400 text-[10px] block">আপনার র‍্যাংক</span>
            <span className="text-amber-400 font-mono text-base font-black">#৩</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">মোট অর্জিত XP</span>
            <span className="text-cyan-400 font-mono text-base font-black">{Math.max(userXP, 2850)}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] block">বাকি সময়</span>
            <span className="text-emerald-400 font-mono text-base font-black">২ দিন</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2.5">
        {mockUsers.map((u) => {
          const isTop3 = u.rank <= 3;
          return (
            <div
              key={u.rank}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between shadow-md ${
                u.isUser
                  ? 'bg-indigo-950/80 border-indigo-500/80 ring-2 ring-indigo-400 shadow-indigo-500/20'
                  : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              {/* Rank & Avatar */}
              <div className="flex items-center space-x-3">
                <div className="w-7 text-center font-black font-mono text-sm">
                  {u.rank === 1 ? (
                    <span className="text-amber-400 text-lg">🥇</span>
                  ) : u.rank === 2 ? (
                    <span className="text-slate-300 text-lg">🥈</span>
                  ) : u.rank === 3 ? (
                    <span className="text-amber-600 text-lg">🥉</span>
                  ) : (
                    <span className="text-slate-500">#{u.rank}</span>
                  )}
                </div>

                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
                  {u.avatar}
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-sm font-black ${u.isUser ? 'text-indigo-300' : 'text-white'}`}>
                      {u.name}
                    </span>
                    {u.badge && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                        {u.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center text-amber-400 font-mono">
                      <Flame className="w-3 h-3 fill-amber-400 mr-0.5" />
                      {u.streak}d
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{u.xp} XP</span>
                  </div>
                </div>
              </div>

              {/* Status / Points */}
              <div className="text-right">
                <span className="font-mono text-sm font-black text-amber-300">
                  {u.xp}
                </span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">
                  POINTS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
