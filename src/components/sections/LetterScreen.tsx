import React, { useState, useEffect } from 'react';
import { LetterConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import { Heart, RotateCcw, Calendar, Sparkles } from 'lucide-react';

interface LetterScreenProps {
  config: LetterConfig;
  personalTouches: PersonalTouchesConfig;
  onRestart: () => void;
}

export const LetterScreen: React.FC<LetterScreenProps> = ({
  config,
  personalTouches,
  onRestart,
}) => {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [revealedParagraphs, setRevealedParagraphs] = useState<number>(1);
  const [showAllDirectly, setShowAllDirectly] = useState(false);

  // Open envelope automatically after 600ms or on click
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEnvelopeOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Progressive paragraph reveal animation
  useEffect(() => {
    if (!isEnvelopeOpen || showAllDirectly) return;
    if (revealedParagraphs < config.paragraphs.length) {
      const timer = setTimeout(() => {
        setRevealedParagraphs((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isEnvelopeOpen, revealedParagraphs, showAllDirectly, config.paragraphs.length]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center px-3 py-1 sm:py-2 relative z-10 select-none">
      {/* Sealed Envelope Opening Animation */}
      {!isEnvelopeOpen ? (
        <div
          onClick={() => setIsEnvelopeOpen(true)}
          className="cursor-pointer group flex flex-col items-center p-6 bg-white/90 backdrop-blur-md rounded-3xl border border-[#DDD6FE] shadow-xl hover:scale-105 transition-all"
        >
          <div className="w-16 h-16 mb-3 bg-gradient-to-tr from-[#A855F7] to-[#7E22CE] rounded-2xl flex items-center justify-center text-white shadow-md group-hover:rotate-6 transition-transform">
            <Heart className="w-8 h-8 fill-white animate-pulse" />
          </div>
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#3B0764] mb-1">
            {config.envelopeTitle || 'a letter for you'}
          </h2>
          <p className="text-xs text-[#7E22CE] tracking-wider uppercase">
            Click to open envelope 💜
          </p>
        </div>
      ) : (
        <div className="w-full transition-all duration-700 ease-out transform translate-y-0 opacity-100">
          {/* Letter Card in frosted glass romantic stationery */}
          <div className="bg-white/92 sm:bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-2xl shadow-[#581C87]/15 text-left relative overflow-hidden max-h-[calc(100dvh-5.5rem)] overflow-y-auto">
            {/* Soft decorative stamps and seal */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-80">
              <div className="border border-dashed border-[#C084FC] rounded-lg p-1 bg-[#F3E8FF]">
                <Heart className="w-3.5 h-3.5 text-[#9333EA] fill-[#C084FC]" />
              </div>
            </div>

            {/* Decorative letter GIF / Rickroll / Sweet Kiss */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 mb-2 mx-auto flex items-center justify-center shrink-0">
              <CuteGif
                src={config.gifUrl}
                alt="Love letter animation"
                fallbackType="letter"
                className="w-full h-full object-contain rounded-2xl will-change-transform mix-blend-multiply"
              />
            </div>

            {/* Salutation */}
            <h2 className="font-serif-title text-xl sm:text-2xl font-semibold text-[#3B0764] mb-2 sm:mb-3 border-b border-[#E9D5FF] pb-1.5 shrink-0">
              {config.greeting}
            </h2>

            {/* Paragraphs with gentle progressive reveal */}
            <div className="space-y-2 text-[#4C1D95] text-xs sm:text-sm md:text-base font-light leading-relaxed">
              {config.paragraphs.map((p, idx) => {
                const isVisible = showAllDirectly || idx < revealedParagraphs;
                if (!isVisible) return null;
                return (
                  <p
                    key={idx}
                    className="transition-opacity duration-700 opacity-100 animate-fadeIn"
                  >
                    {p}
                  </p>
                );
              })}
            </div>

            {/* "Show all text" button if still typing */}
            {!showAllDirectly && revealedParagraphs < config.paragraphs.length && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => setShowAllDirectly(true)}
                  className="text-xs text-[#7E22CE] hover:underline cursor-pointer"
                >
                  Show entire letter immediately ✨
                </button>
              </div>
            )}

            {/* Closing & Handwritten Signature */}
            <div className="mt-4 pt-2 border-t border-[#E9D5FF]">
              <p className="text-xs text-[#6B21A8] italic mb-0.5">{config.closing}</p>
              <p className="font-handwriting text-2xl sm:text-3xl text-[#7E22CE] font-bold">
                {personalTouches.senderNickname || config.signature}
              </p>
            </div>

            {/* Bottom Official Milestone & Monthsary Badge */}
            <div className="mt-3 pt-2 border-t border-dashed border-[#DDD6FE] flex items-center justify-between text-[11px] text-[#6B21A8]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#9333EA]" />
                <span>Our Love Story Milestone ♡</span>
              </span>
              <span className="text-[10px] bg-[#EDE9FE] px-2 py-0.5 rounded-full font-medium">
                Monthsary every month 🌸
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium text-[#7E22CE] bg-white/90 border border-[#DDD6FE] hover:bg-[#EDE9FE] shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>replay our story ♡</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
