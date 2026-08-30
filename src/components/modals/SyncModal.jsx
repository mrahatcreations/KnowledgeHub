import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, ShieldCheck, Database, Globe, AlertCircle } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function SyncModal({ onClose, totalLevels, onReloadLevels }) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('https://raw.githubusercontent.com/mrahatcreations/VocabMaster/main/data');

  const handleSync = async () => {
    setIsLoading(true);
    sound.playClick();
    try {
      const remoteRes = await fetch(`${githubUrl}/version.json`, { cache: 'no-store' });
      if (remoteRes.ok) {
        const ver = await remoteRes.json();
        const levelsRes = await fetch(`${githubUrl}/levels.json`, { cache: 'no-store' });
        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          localStorage.setItem('vocabmaster_cached_levels', JSON.stringify(levelsData));
          setSyncStatus(`গিটহাব লাইভ সিঙ্ক সফল! ভার্সন: ${ver.version} (${ver.total_levels}টি লেভেল লোড হয়েছে)`);
          onReloadLevels();
          setIsLoading(false);
          return;
        }
      }
      const res = await fetch('/data/version.json');
      const ver = await res.json();
      setSyncStatus(`লোকাল ডাটা সিঙ্ক সম্পন্ন! ভার্সন: ${ver.version} (${ver.total_levels}টি লেভেল প্রস্তুত)`);
      onReloadLevels();
    } catch (e) {
      setSyncStatus('অফলাইন মোড চালু রয়েছে। লোকাল ডাটাবেস সম্পূর্ণ সক্রিয়।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm sm:max-w-md mx-3 sm:mx-4 shadow-2xl border border-slate-100 animate-pop overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[90vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600 shrink-0" />
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">গিটহাব সিঙ্ক ও ডাটাবেজ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="বন্ধ করুন"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0 text-xs sm:text-sm text-slate-600 overscroll-contain">
          {/* Level Stats Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-xs">
            <div>
              <div className="text-[11px] sm:text-xs text-slate-500 font-medium">বর্তমানে লোড হওয়া লেভেল</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-0.5">{totalLevels} টি লেভেল</div>
            </div>
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full text-xs font-bold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Offline Ready</span>
            </span>
          </div>

          {/* GitHub Remote Input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>GitHub Remote Data URL:</span>
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-3 py-2.5 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              placeholder="https://..."
            />
          </div>

          <div className="text-xs text-slate-500 leading-relaxed text-left bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            গিটহাবে নতুন লেভেল পুশ করার পর এই বাটনে চাপলে স্বয়ংক্রিয়ভাবে নতুন কনটেন্ট ডাউনলোড হয়ে লোকাল স্টোরেজে সেভ হয়ে যাবে।
          </div>

          {syncStatus && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-semibold flex items-start gap-2 text-left leading-relaxed break-words animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span className="break-words">{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Pinned Footer Action */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'সিঙ্ক করা হচ্ছে...' : 'গিটহাব থেকে লাইভ সিঙ্ক করুন'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}