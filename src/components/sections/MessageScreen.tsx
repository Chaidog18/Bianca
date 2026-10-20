import React from 'react';
import { PersonalMessageConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import { Heart, ArrowRight } from 'lucide-react';

interface MessageScreenProps {
  config: PersonalMessageConfig;
  personalTouches: PersonalTouchesConfig;
  onNext: () => void;
  onBack: () => void;
}

export const MessageScreen: React.FC<MessageScreenProps> = ({
  config,
  onNext,
  onBack,
}) => {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center px-3 py-2 sm:py-4 relative z-10 select-none">
      <div className="w-full bg-white/96 sm:bg-white/98 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-2xl shadow-[#581C87]/15 flex flex-col items-center text-center">
        {/* Decorative sweet top badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/90 text-[#6B21A8] text-xs font-medium border border-[#DDD6FE] mb-2 sm:mb-3 shadow-2xs">
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
          <span>a special thought for you</span>
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
        </div>

        {/* Cute Animated GIF - compact to guarantee everything fits without scrolling */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 mb-2 sm:mb-3 mx-auto flex items-center justify-center shrink-0">
          <CuteGif
            src={config.gifUrl}
            alt="Cute kitten cuddles"
            fallbackType="cat"
            className="w-full h-full object-contain drop-shadow-md rounded-2xl"
          />
        </div>

        {/* Title */}
        <h2 className="font-serif-title text-xl sm:text-2xl font-semibold text-[#3B0764] mb-2 sm:mb-3 tracking-tight shrink-0">
          {config.title}
        </h2>

        {/* Message Box - all text displayed clearly and cleanly with zero scrolling */}
        <div className="w-full bg-[#FAF5FF]/85 rounded-2xl p-3 sm:p-4 border border-[#DDD6FE] shadow-2xs mb-3 sm:mb-4 text-left space-y-2">
          {config.lines.map((line, idx) => (
            <p
              key={idx}
              className="text-[#4C1D95] text-xs sm:text-sm md:text-base font-normal leading-relaxed tracking-wide italic"
            >
              “{line}”
            </p>
          ))}
        </div>

        {/* Navigation Buttons in Violet styling */}
        <div className="flex items-center justify-center gap-3 w-full shrink-0">
          <button
            onClick={onBack}
            className="text-xs text-[#7E22CE] hover:text-[#581C87] py-2 px-3 transition-colors cursor-pointer"
          >
            ← go back
          </button>

          <button
            onClick={onNext}
            className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-md shadow-[#9333EA]/30 hover:shadow-lg hover:shadow-[#9333EA]/40 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#C084FC]/40 cursor-pointer"
          >
            <span>{config.buttonText}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
