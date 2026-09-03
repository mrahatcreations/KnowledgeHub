import React, { useState, useEffect } from 'react';
import { 
  X, 
  DownloadCloud, 
  Trash2, 
  CheckCircle2, 
  Headphones, 
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

    audioPackManager.getStatus().then(setPackStatus);

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
      setErrorMsg(err?.message || 'Download failed.');
    }
  };

  const handleCancel = () => {
    audioPackManager.cancelDownload();
  };

  const handleDelete = async () => {
    if (window.confirm('Delete offline audio?')) {
      const updated = await audioPackManager.deletePack();
      if (updated) setPackStatus(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none">
      <div 
        className="w-full max-w-sm bg-[#1e293b] rounded-2xl p-5 shadow-2xl text-white space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-2">
            <Headphones className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">Offline Audio</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-[#0f172a] hover:bg-[#182033] transition flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content & Action */}
        <div className="space-y-3">
          {errorMsg && (
            <div className="text-xs text-white bg-[#b91c1c] p-2.5 rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {packStatus.isDownloading ? (
            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400 flex items-center space-x-1.5 font-bold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Downloading...</span>
                </span>
                <span className="text-white font-bold">{packStatus.percent}%</span>
              </div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-200 rounded-full"
                  style={{ width: `${packStatus.percent}%` }}
                />
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 bg-[#0f172a] hover:bg-[#182033] text-rose-400 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : packStatus.isDownloaded ? (
            <div className="space-y-3">
              <div className="py-2.5 px-3 bg-[#0f172a] rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Installed (78.6 MB)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-2.5 bg-[#0f172a] hover:bg-[#b91c1c] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Audio</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300 py-1">
                <span>Total Size</span>
                <span className="text-white font-bold">78.6 MB</span>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="w-full py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer uppercase tracking-wider active:scale-[0.99]"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Download (78.6 MB)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
