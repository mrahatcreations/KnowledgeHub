import React from 'react';
import { 
  ArrowLeft, 
  BookText, 
  Languages, 
  Globe2, 
  GraduationCap, 
  ChevronRight, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { sound } from '../../audio/SoundSynthesizer';
import { DU_SUBJECTS } from '../../utils/duDataHelper';

export default function DuSubjectListView({
  onSelectSubject,
  onBack,
  isAudioMuted = false,
  setIsAudioMuted
}) {
  const handlePickSubject = (subj, mode = 'mcq') => {
    sound.playClick();
    if (onSelectSubject) {
      onSelectSubject(subj, { mode });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center select-none pb-16 bg-[#0a0a0c] min-h-screen text-neutral-100 font-sans px-3">
      {/* 1. ULTRA-COMPACT EDITORIAL STICKY HEADER (Budget <= 80px) */}
      <header 
        className="sticky top-0 z-40 w-full bg-[#0a0a0c]/98 backdrop-blur-md border-b border-neutral-800/80 py-2.5 space-y-2 shadow-sm mb-3"
        style={{ paddingTop: 'max(0.6rem, env(safe-area-inset-top, 0px))' }}
      >
        {/* Row 1: Back Navigation + Title + Sound */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                sound.playClick();
                if (onBack) onBack();
              }}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-none bg-[#141518] hover:bg-[#1b1d22] border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold shrink-0 transition cursor-pointer active:scale-95"
              title="Back to Learning Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold">HUB</span>
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                ঢাবি 'খ' ইউনিট প্রশ্নব্যাংক
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="font-mono text-[10px] text-amber-300 bg-amber-950/40 border border-amber-800/60 px-2 py-0.5 font-bold">
              ২০১৫-২০২৫
            </span>

            {setIsAudioMuted && (
              <button
                onClick={() => {
                  const next = !isAudioMuted;
                  setIsAudioMuted(next);
                  sound.enabled = !next;
                }}
                className="w-7 h-7 rounded-none bg-[#141518] hover:bg-[#1b1d22] border border-neutral-800 flex items-center justify-center text-neutral-300 transition cursor-pointer active:scale-90"
                title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-neutral-300" />}
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Prompt */}
        <p className="text-xs text-neutral-400 pl-1">
          অনুশীলন শুরু করতে নিচের যেকোনো একটি বিষয় বেছে নিন:
        </p>
      </header>

      {/* 2. SUBJECTS CARDS LIST */}
      <div className="w-full space-y-3 pt-1">
        {/* SUBJECT 1: BANGLA */}
        <div 
          onClick={() => handlePickSubject(DU_SUBJECTS.BANGLA, 'mcq')}
          className="w-full bg-[#121316] hover:bg-[#16181d] border border-neutral-800 hover:border-neutral-700 rounded-none p-4 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition shrink-0">
              <BookText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-neutral-100 group-hover:text-white font-sans tracking-tight">
                Bangla <span className="text-neutral-400 font-normal">| বাংলা</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                বাংলা সাহিত্য ও ব্যাকরণ • ১৯১ MCQ + ২০ লিখিত
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-neutral-400">211 Items</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          </div>
        </div>

        {/* SUBJECT 2: ENGLISH */}
        <div 
          onClick={() => handlePickSubject(DU_SUBJECTS.ENGLISH, 'mcq')}
          className="w-full bg-[#121316] hover:bg-[#16181d] border border-neutral-800 hover:border-neutral-700 rounded-none p-4 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition shrink-0">
              <Languages className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-neutral-100 group-hover:text-white font-sans tracking-tight">
                English <span className="text-neutral-400 font-normal">| ইংরেজি</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                Grammar, Vocabulary & Comprehension • ১৯১ MCQ + ১৮ লিখিত
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-neutral-400">209 Items</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          </div>
        </div>

        {/* SUBJECT 3: GENERAL KNOWLEDGE */}
        <div 
          onClick={() => handlePickSubject(DU_SUBJECTS.GK, 'mcq')}
          className="w-full bg-[#121316] hover:bg-[#16181d] border border-neutral-800 hover:border-neutral-700 rounded-none p-4 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 group-hover:text-white transition shrink-0">
              <Globe2 className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-neutral-100 group-hover:text-white font-sans tracking-tight">
                General Knowledge <span className="text-neutral-400 font-normal">| সাধারণ জ্ঞান</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                বাংলাদেশ ও আন্তর্জাতিক বিষয়াবলি • ৩৭৮ MCQ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-neutral-400">378 Items</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          </div>
        </div>

        {/* SUBJECT 4: ALL SUBJECTS (COMBINED) */}
        <div 
          onClick={() => handlePickSubject('ALL', 'mcq')}
          className="w-full bg-[#121318] hover:bg-[#161820] border border-amber-500/40 hover:border-amber-400/80 rounded-none p-4 transition cursor-pointer flex items-center justify-between group active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            <div className="w-11 h-11 rounded-none bg-amber-950/40 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:text-amber-200 transition shrink-0">
              <GraduationCap className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white group-hover:text-amber-200 font-sans tracking-tight">
                All Subjects <span className="text-amber-300 font-normal">| সকল বিষয় একসাথে</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                ৭৬০ MCQ কুইজ ও ৩৮টি লিখিত প্রশ্ন
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 border border-amber-800/80">798 Items</span>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition" />
          </div>
        </div>
      </div>
    </div>
  );
}
