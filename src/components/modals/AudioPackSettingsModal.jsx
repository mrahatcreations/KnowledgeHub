import React, { useState, useEffect } from 'react';
import { 
  X, 
  DownloadCloud, 
  Trash2, 
  CheckCircle2, 
  Headphones, 
  Sparkles, 
  HardDrive, 
  Wifi, 
  Loader2 
} from 'lucide-react';
import { audioPackManager } from '../../audio/AudioPackManager';

export default function AudioPackSettingsModal({ isOpen, onClose }) {
  const [packStatus, setPackStatus] = useState({
    isDownloaded: false,
    downloadedCount: 0,
    totalCount: 5868,
    sizeMB: 0,
    percent: 0,
    isDownloading: false
  });
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // Load initial status
    audioPackManager.getStatus().then(setPackStatus);

    // Subscribe to real-time download updates
    const unsubscribe = audioPackManager.subscribe((status) => {
      setPackStatus(status);
    });

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setErrorMsg(null);
    try {
      await audioPackManager.downloadPack();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to download audio pack.');
    }
  };

  const handleCancel = () => {
    audioPackManager.cancelDownload();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete the offline audio pack to free up storage? (Audio will stream online when needed).')) {
      const updated = await audioPackManager.deletePack();
      if (updated) setPackStatus(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop">
      <div 
        className="w-full max-w-md bg-[#121316] border-2 border-slate-700 rounded-none p-5 sm:p-6 shadow-2xl text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-none bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight font-sans">Audio & Storage Settings</h2>
              <p className="text-[11px] text-slate-400 font-mono">Encrypted voice pack & offline access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-slate-800 hover:bg-slate-700 active:scale-95 transition flex items-center justify-center text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Offline Audio Pack Card */}
        <div className="bg-[#181a20] border-2 border-slate-800 rounded-none p-4.5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">Offline Voice Pack</span>
                <span className="text-[10px] px-2 py-0.5 rounded-none bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold">
                  78.6 MB (.khpack)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                5,867 studio pronunciations (Words, Verb Forms, Synonyms, Antonyms & Sentences).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-slate-400 block">Voice Engine</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">Christopher HD</span>
            </div>
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Storage: <strong className="text-white">{packStatus.sizeMB} MB</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Status: {packStatus.isDownloaded ? (
                  <strong className="text-emerald-400">100% Offline</strong>
                ) : (
                  <strong className="text-amber-400">Cloud Stream</strong>
                )}
              </span>
            </div>
          </div>

          {/* Progress Bar (When Downloading or Unpacking) */}
          {packStatus.isDownloading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 flex items-center space-x-1.5 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {packStatus.phase === 'unpacking'
                      ? 'Unpacking & Securing Cache...'
                      : 'Downloading Encrypted Pack...'}
                  </span>
                </span>
                <span className="text-white font-bold">{packStatus.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 border border-slate-700 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-200"
                  style={{ width: `${packStatus.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{packStatus.downloadedCount.toLocaleString()} / {packStatus.totalCount.toLocaleString()} files</span>
                <span>{packStatus.sizeMB} MB / 78.6 MB</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-rose-300 bg-rose-950/80 border border-rose-500/40 p-2.5 rounded-none font-medium">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            {packStatus.isDownloading ? (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-3 px-4 rounded-none bg-slate-800 hover:bg-slate-700 active:translate-y-0.5 transition font-bold text-xs text-rose-300 border-2 border-rose-500/40 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_3px_0_#4c0519]"
              >
                <span>Cancel Download</span>
              </button>
            ) : packStatus.isDownloaded ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 py-3 px-3.5 rounded-none bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 text-xs font-black flex items-center space-x-2 shadow-[0_3px_0_#064e3b]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Installed & Ready (78.6 MB)</span>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="py-3 px-3.5 rounded-none bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 active:translate-y-0.5 transition text-xs font-bold text-slate-400 border-2 border-slate-700 hover:border-rose-500/50 flex items-center space-x-1.5 shadow-[0_3px_0_#020617] cursor-pointer"
                  title="Delete pack to free device storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3.5 px-4 rounded-none bg-amber-500 hover:bg-amber-400 active:translate-y-1 active:shadow-none transition font-black text-xs sm:text-sm text-slate-950 shadow-[0_4px_0_#78350f] border-2 border-amber-300 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
              >
                <DownloadCloud className="w-4 h-4 stroke-[2.5]" />
                <span>Download Encrypted Pack (78.6 MB)</span>
              </button>
            )}
          </div>
        </div>

        {/* Benefits Note */}
        <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/90 p-3 rounded-none border border-slate-800 font-mono">
          💡 <strong>Tip:</strong> If you don&apos;t download the pack, all pronunciations will still play seamlessly online via GitHub Cloud CDN.
        </div>
      </div>
    </div>
  );
}
