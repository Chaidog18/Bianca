import React from 'react';
import { RejectionScreenConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import { Heart, RotateCcw, Mail } from 'lucide-react';

interface RejectionScreenProps {
  config: RejectionScreenConfig;
  personalTouches: PersonalTouchesConfig;
  onRestart: () => void;
  onReadLetterAnyway: () => void;
}

export const RejectionScreen: React.FC<RejectionScreenProps> = ({
  config,
  personalTouches,
  onRestart,
  onReadLetterAnyway,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-8 max-w-lg mx-auto relative z-10 animate-fadeIn">
      {/* Decorative calm heart badge */}
      <div className="w-12 h-12 rounded-full bg-[#FFE8EE] text-[#B33951] flex items-center justify-center mb-5 border border-[#FFD5DF] shadow-xs">
        <Heart className="w-6 h-6 fill-[#FF85A1] text-[#FF85A1]" />
      </div>

      {/* Main Comforting GIF */}
      <div className="w-44 h-44 sm:w-52 sm:h-52 mb-6 mx-auto flex items-center justify-center">
        <CuteGif
          src={config.gifUrl}
          alt="Comforting character"
          fallbackType="shy"
          className="w-full h-full object-contain drop-shadow-md rounded-2xl"
        />
      </div>

      {/* Title */}
      <h1 className="font-serif-title text-3xl sm:text-4xl font-semibold text-[#8B263E] mb-4">
        {config.title || 'Thank you for being honest with me ♡'}
      </h1>

      {/* Card with respectful message */}
      <div className="bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[#FFCAD4] shadow-sm mb-8 text-center space-y-3">
        <p className="text-[#5A3E4B] text-base sm:text-lg font-light leading-relaxed">
          {config.message ||
            'I really appreciate you telling me your true feelings. Having you in my life already means the world to me, and nothing changes that.'}
        </p>
        <p className="text-xs sm:text-sm text-[#8C5D6C] italic">
          {config.subMessage || 'Thank you for being someone so special to me. ♡'}
        </p>
      </div>

      {/* Real exit / restart options (No infinite traps!) */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center w-full">
        <button
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-[#8B263E] bg-[#FFE8EE] hover:bg-[#FFD5DF] rounded-full transition-all duration-300"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{config.restartButtonText || 'Start over from beginning ♡'}</span>
        </button>

        <button
          onClick={onReadLetterAnyway}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] rounded-full shadow-sm hover:shadow hover:scale-102 active:scale-98 transition-all duration-300"
        >
          <Mail className="w-4 h-4 text-white" />
          <span>Read the little letter anyway ♡</span>
        </button>
      </div>

      <p className="mt-8 text-xs text-[#9C7A87] font-light">
        No hard feelings whatsoever. You will always be appreciated. ♡
      </p>
    </div>
  );
};
