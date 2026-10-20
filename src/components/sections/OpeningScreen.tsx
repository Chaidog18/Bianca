import React from 'react';
import { OpeningConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import { Heart } from 'lucide-react';

interface OpeningScreenProps {
  config: OpeningConfig;
  personalTouches: PersonalTouchesConfig;
  onNext: () => void;
}

export const OpeningScreen: React.FC<OpeningScreenProps> = ({
  config,
  personalTouches,
  onNext,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center px-3 py-2 sm:py-4 relative z-10 select-none">
      <div className="w-full bg-white/90 sm:bg-white/94 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-2xl shadow-[#581C87]/15 flex flex-col items-center text-center">
        {/* Decorative tiny top badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/90 text-[#6B21A8] text-xs font-medium tracking-wide mb-2 sm:mb-3 border border-[#DDD6FE] shadow-2xs animate-pulse-gentle">
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
          <span>just for {personalTouches.recipientName || 'you'}</span>
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
        </div>

        {/* Main Animated GIF - compact to fit neatly in viewport */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 mb-2 sm:mb-3 mx-auto flex items-center justify-center shrink-0">
          <CuteGif
            src={config.gifUrl}
            alt="Cute romantic greeting"
            fallbackType="shy"
            className="w-full h-full object-contain drop-shadow-md rounded-2xl"
          />
        </div>

        {/* Heading */}
        <h1 className="font-serif-title text-2xl sm:text-3xl font-semibold text-[#3B0764] mb-1 sm:mb-2 tracking-tight shrink-0">
          {config.greeting}
        </h1>

        {/* Tender introductory lines */}
        <div className="space-y-1 mb-3 sm:mb-4 text-[#581C87] text-xs sm:text-sm font-light leading-relaxed max-w-sm">
          <p className="italic">“{config.subtitle1}”</p>
          <p className="italic">“{config.subtitle2}”</p>
        </div>

        {/* Interactive Heart Button in Violet Gradient */}
        <button
          onClick={onNext}
          className="group relative inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-lg shadow-[#9333EA]/30 hover:shadow-xl hover:shadow-[#9333EA]/50 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#C084FC]/40 cursor-pointer shrink-0"
        >
          <span>{config.buttonText}</span>
          <Heart className="w-4 h-4 fill-white/90 text-white group-hover:scale-125 transition-transform" />
        </button>

        {/* Bottom subtle note */}
        <p className="mt-3 sm:mt-4 text-[11px] sm:text-xs text-[#7E22CE]/80 font-light tracking-wide flex items-center justify-center gap-1 shrink-0">
          <span>{config.footerText}</span>
          <span className="text-[#9333EA]">♡</span>
        </p>
      </div>
    </div>
  );
};
