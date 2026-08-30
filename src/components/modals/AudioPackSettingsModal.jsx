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
        className="w-full max-w-md bg-[#131418] border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Audio & Storage Settings</h2>
              <p className="text-[11px] text-neutral-400 font-mono">Manage voice packs & offline access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 transition flex items-center justify-center text-neutral-400 hover:text-white"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Offline Audio Pack Card */}
        <div className="bg-[#181a20] border border-neutral-800/90 rounded-2xl p-4.5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">Offline Audio Pack</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono font-semibold">
                  86 MB
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                5,868 studio pronunciations (Words, Verb Forms, Synonyms, Antonyms & Sentences).
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-neutral-400 block">Voice Actor</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">Christopher HD</span>
            </div>
          </div>

          {/* Status Details */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800/70 text-xs">
            <div className="flex items-center space-x-2 text-neutral-300">
              <HardDrive className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>Storage: <strong className="text-white">{packStatus.sizeMB} MB</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-300">
              <Wifi className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>
                Status: {packStatus.isDownloaded ? (
                  <strong className="text-emerald-400">100% Offline</strong>
                ) : (
                  <strong className="text-amber-400">Online Stream</strong>
                )}
              </span>
            </div>
          </div>

          {/* Progress Bar (When Downloading) */}
          {packStatus.isDownloading && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-300 flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading Audio Pack...</span>
                </span>
                <span className="text-white font-bold">{packStatus.percent}%</span>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${packStatus.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{packStatus.downloadedCount.toLocaleString()} / {packStatus.totalCount.toLocaleString()} files</span>
                <span>{packStatus.sizeMB} MB</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            {packStatus.isDownloading ? (
              <button
                onClick={handleCancel}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-98 transition font-semibold text-xs text-rose-300 border border-neutral-700 flex items-center justify-center space-x-2"
              >
                <span>Cancel Download</span>
              </button>
            ) : packStatus.isDownloaded ? (
              <div className="flex items-center space-x-2">
                <div className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Installed & Ready (86 MB)</span>
                </div>
                <button
                  onClick={handleDelete}
                  className="py-2.5 px-3.5 rounded-xl bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-400 active:scale-95 transition text-xs font-semibold text-neutral-400 border border-neutral-700 flex items-center space-x-1.5"
                  title="Delete pack to free device storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleDownload}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition font-bold text-xs sm:text-sm text-black shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download Offline Pack (86 MB)</span>
              </button>
            )}
          </div>
        </div>

        {/* Benefits Note */}
        <div className="text-[11px] text-neutral-400 leading-relaxed bg-neutral-900/50 p-3 rounded-xl border border-neutral-800/60">
          💡 <strong>Tip:</strong> If you don't download the pack, all pronunciations will still play seamlessly online via GitHub Cloud CDN.
        </div>
      </div>
    </div>
  );
}
