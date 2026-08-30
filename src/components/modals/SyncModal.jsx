import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, ShieldCheck, Database, Globe } from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';

export default function SyncModal({ onClose, totalLevels, onReloadLevels }) {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [githubUrl, setGithubUrl] = useState('https://raw.githubusercontent.com/mrahatcreations/English-Easy/main/data');

  const handleSync = async () => {
    setIsLoading(true);
    sound.playClick();
    try {
      // First try fetching from live remote GitHub repository
      const remoteRes = await fetch(`${githubUrl}/version.json`, { cache: 'no-store' });
      if (remoteRes.ok) {
        const ver = await remoteRes.json();
        // Fetch new levels
        const levelsRes = await fetch(`${githubUrl}/levels.json`, { cache: 'no-store' });
        if (levelsRes.ok) {
          const levelsData = await levelsRes.json();
          localStorage.setItem('vocabmaster_cached_levels', JSON.stringify(levelsData));
          setSyncStatus(`?????? ???? ????? ???! ??????: ${ver.version} (${ver.total_levels}?? ????? ??? ?????)`);
          onReloadLevels();
          setIsLoading(false);
          return;
        }
      }
      // Fallback local sync
      const res = await fetch('/data/version.json');
      const ver = await res.json();
      setSyncStatus(`????? ???? ????? ???????! ??????: ${ver.version} (${ver.total_levels}?? ????? ????????)`);
      onReloadLevels();
    } catch (e) {
      setSyncStatus('?????? ??? ???? ?????? ????? ??????? ???????? ???????');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-pop text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">?????? ????? ? ???????</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4 text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">???????? ??? ???? ?????</div>
              <div className="text-xl font-bold text-slate-900">{totalLevels} ?? ?????</div>
            </div>
            <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline Ready</span>
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>GitHub Remote Data URL:</span>
            </label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-500 leading-relaxed">
            ??????? ???? ????? ??? ???? ?? ?? ????? ????? ?????????????? ???? ??????? ??????? ??? ????? ???????? ??? ??? ?????
          </div>

          {syncStatus && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleSync}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? '????? ??? ?????...' : '?????? ???? ???? ????? ????'}</span>
        </button>
      </div>
    </div>
  );
}