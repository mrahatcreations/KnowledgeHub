import React, { useState, useEffect } from 'react';
import { 
  X, 
  DownloadCloud, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { updateManager, CURRENT_APP_VERSION } from '../../utils/updateManager';
import { sound } from '../../audio/SoundSynthesizer';

export default function UpdateModal({
  isOpen,
  onClose,
  initialUpdateInfo = null,
  autoCheck = false
}) {
  const [status, setStatus] = useState(initialUpdateInfo ? 'available' : 'checking'); // 'checking' | 'available' | 'upToDate' | 'error'
  const [updateInfo, setUpdateInfo] = useState(initialUpdateInfo);
  const [copied, setCopied] = useState(false);
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(updateManager.getUpdateUrl());

  useEffect(() => {
    if (!isOpen) return;

    if (initialUpdateInfo) {
      setUpdateInfo(initialUpdateInfo);
      setStatus(initialUpdateInfo.hasUpdate ? 'available' : 'upToDate');
    } else {
      runCheck();
    }
  }, [isOpen, initialUpdateInfo]);

  if (!isOpen) return null;

  const runCheck = async () => {
    setStatus('checking');
    try {
      const res = await updateManager.checkForUpdates({ force: true });
      setUpdateInfo(res);
      if (res.hasUpdate) {
        setStatus('available');
        sound.playCorrect();
      } else if (res.error) {
        setStatus('error');
        sound.playWrong();
      } else {
        setStatus('upToDate');
        sound.playClick();
      }
    } catch (err) {
      setStatus('error');
      sound.playWrong();
    }
  };

  const handleDownload = () => {
    sound.playClick();
    const url = updateInfo?.downloadUrl || 'https://github.com/mrahatcreations/VocabMaster/releases/latest';
    if (url) {
      window.open(url, '_system');
    }
  };

  const handleCopyLink = () => {
    const url = updateInfo?.downloadUrl || window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    sound.playClick();
    if (updateInfo?.remoteVersion) {
      updateManager.dismissUpdate(updateInfo.remoteVersion);
    }
    if (onClose) onClose();
  };

  const handleSaveCustomUrl = (e) => {
    e.preventDefault();
    updateManager.setUpdateUrl(customUrlInput);
    setShowCustomUrl(false);
    runCheck();
  };

  const isMandatory = updateInfo?.isMandatory;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 select-none">
      <div 
        className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] border-b border-slate-700/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-amber-400">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white">
                অ্যাপ আপডেট ও সংস্করণ
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                বর্তমান সংস্করণ: v{CURRENT_APP_VERSION}
              </span>
            </div>
          </div>

          {!isMandatory && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-white bg-[#1e293b] hover:bg-[#334155] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* STATE 1: CHECKING */}
          {status === 'checking' && (
            <div className="py-10 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
              <div className="font-bold text-sm text-white">
                নতুন সংস্করণ অনুসন্ধান করা হচ্ছে...
              </div>
              <p className="text-xs text-slate-400">
                অনুগ্রহ করে অপেক্ষা করুন
              </p>
            </div>
          )}

          {/* STATE 2: NEW UPDATE AVAILABLE */}
          {status === 'available' && (
            <div className="space-y-4">
              {/* Version Comparison Card */}
              <div className="p-3.5 bg-[#0f172a] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-400 block">
                    {updateInfo?.title || 'নতুন আপডেট উপলভ্য'}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-400">v{CURRENT_APP_VERSION}</span>
                    <span className="text-xs text-amber-400">→</span>
                    <span className="text-sm font-bold text-white font-mono">
                      v{updateInfo?.remoteVersion}
                    </span>
                  </div>
                </div>

                {updateInfo?.releaseDate && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {updateInfo.releaseDate}
                  </span>
                )}
              </div>

              {/* Release Notes */}
              {updateInfo?.releaseNotes && updateInfo.releaseNotes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>কী কী নতুন এসেছে:</span>
                  </span>
                  <div className="p-3.5 bg-[#0f172a] rounded-xl space-y-1.5 text-xs text-slate-200">
                    {updateInfo.releaseNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold leading-relaxed">•</span>
                        <span className="leading-relaxed">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleDownload}
                  className="w-full py-3.5 px-4 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition rounded-xl cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>এখনই আপডেট করুন (APK ডাউনলোড)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 px-3 bg-[#0f172a] hover:bg-[#182033] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition rounded-xl cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">লিঙ্ক কপি হয়েছে!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>ডাউনলোড লিঙ্ক কপি</span>
                      </>
                    )}
                  </button>

                  {!isMandatory && (
                    <button
                      onClick={handleDismiss}
                      className="py-2.5 px-4 bg-[#0f172a] hover:bg-[#182033] text-slate-400 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      পরে করব
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STATE 3: UP TO DATE */}
          {status === 'upToDate' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#0f172a] flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  আপনার অ্যাপটি আপ-টু-ডেট আছে
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  আপনি বর্তমানে সর্বশেষ সংস্করণ (v{CURRENT_APP_VERSION}) ব্যবহার করছেন।
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={runCheck}
                  className="py-2.5 px-3.5 bg-[#0f172a] hover:bg-[#182033] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>পুনরায় চেক করুন</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  ঠিক আছে
                </button>
              </div>
            </div>
          )}

          {/* STATE 4: ERROR / OFFLINE */}
          {status === 'error' && (
            <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#b91c1c] flex items-center justify-center text-white">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  আপডেট তথ্য যাচাই করা যায়নি
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {updateInfo?.error || 'ইন্টারনেট সংযোগ চালু আছে কিনা তা পরীক্ষা করুন।'}
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={runCheck}
                  className="py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>আবার চেষ্টা করুন</span>
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 px-3 bg-[#0f172a] hover:bg-[#182033] text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          )}

          {/* ADVANCED CUSTOM URL ACCORDION */}
          <div className="pt-2 border-t border-slate-700/60">
            <button
              onClick={() => setShowCustomUrl(!showCustomUrl)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 transition cursor-pointer"
            >
              <Globe className="w-3 h-3" />
              <span>{showCustomUrl ? 'সার্ভার কনফিগারেশন লুকান' : 'আপডেট সার্ভার সেটিংস'}</span>
            </button>

            {showCustomUrl && (
              <form onSubmit={handleSaveCustomUrl} className="mt-2 space-y-2">
                <input
                  type="text"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://.../version.json"
                  className="w-full px-3 py-2 rounded-xl bg-[#0f172a] text-xs text-white font-mono focus:outline-none"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateManager.setUpdateUrl('');
                      setCustomUrlInput(updateManager.getUpdateUrl());
                    }}
                    className="px-3 py-1.5 bg-[#0f172a] rounded-lg text-[10px] text-slate-400"
                  >
                    ডিফল্ট
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#059669] text-white rounded-lg text-[10px] font-bold"
                  >
                    সংরক্ষণ ও চেক
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
