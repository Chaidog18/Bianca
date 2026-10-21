import React, { useState, useRef } from 'react';
import { QuestionConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import { Heart, RefreshCw } from 'lucide-react';

interface QuestionScreenProps {
  config: QuestionConfig;
  personalTouches: PersonalTouchesConfig;
  onYes: () => void;
  onLetterDirect: () => void;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  config,
  onYes,
}) => {
  const [dodgeCount, setDodgeCount] = useState(0);
  const [playfulMessage, setPlayfulMessage] = useState<string | null>(null);
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasClickedYes, setHasClickedYes] = useState(false);
  const [showPrankModal, setShowPrankModal] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const noButtonRef = useRef<HTMLButtonElement | null>(null);

  // Dynamic scales: NO shrinks smaller and smaller, YES expands bigger and bigger!
  const noScale = Math.max(0.08, 1 - dodgeCount * 0.13);
  const yesScale = Math.min(2.35, 1 + dodgeCount * 0.16);

  // Playful notices that cycle with every click of NO in violet mood
  const funnyMessages = [
    'wait… are you sure? ',
    'nuh-uh, that button doesn’t work! ',
    'the button is shrinking… look! ',
    'YES is getting bigger for a reason! ',
    'Error 404: Rejection is not supported! ',
    'you’re gonna need a microscope to click that! ',
    'almost too tiny to touch! ',
    'resistance is futile, say YES! ',
    'look how big and pretty the YES button is! ',
    'you clicked NO again?! It just shrunk more! ',
    'there is no escape from my love hehe',
    'just say yes, I promise to make you happy! for the rest of your life! ',
  ];

  // Random dynamic jump offsets that keep NO on screen while avoiding center YES
  const getRandomOffset = (step: number) => {
    const angle = (step * 1.618 * 2 * Math.PI) + (Math.random() * 0.5);
    const radiusX = 90 + Math.random() * 70;
    const radiusY = 40 + Math.random() * 45;
    return {
      x: Math.round(Math.cos(angle) * radiusX),
      y: Math.round(Math.sin(angle) * radiusY),
    };
  };

  // STRICT REQUIREMENT: Shrink and move ONLY when actually clicked!
  // NO hover or pointerenter triggers! User must click before shrinking!
  const handleNoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const nextCount = dodgeCount + 1;
    setDodgeCount(nextCount);

    // Pick playful cycling message
    const msg = funnyMessages[(nextCount - 1) % funnyMessages.length];
    setPlayfulMessage(msg);

    // Generate jump offset
    setNoOffset(getRandomOffset(nextCount));

    // After 4 clicks, trigger funny viral prank modal (with infinite loop options)
    if (nextCount >= 4 && nextCount % 2 === 0) {
      setShowPrankModal(true);
    }
  };

  const handleYesClick = () => {
    if (hasClickedYes) return;
    setHasClickedYes(true);
    onYes();
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg mx-auto flex flex-col items-center justify-center px-3 py-2 sm:py-4 relative z-10 transition-all duration-500 ease-out select-none"
    >
      <div className="w-full bg-white/90 sm:bg-white/94 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-white/80 shadow-2xl shadow-[#581C87]/15 relative">
        {/* Intro prompt */}
        <p className="text-xs sm:text-sm font-light text-[#7E22CE] mb-1 sm:mb-2 flex items-center justify-center gap-1.5 animate-pulse-gentle">
          <Heart className="w-3.5 h-3.5 fill-[#9333EA] text-[#9333EA]" />
          <span>{config.leadText}</span>
          <Heart className="w-3.5 h-3.5 fill-[#9333EA] text-[#9333EA]" />
        </p>

        {/* Main Cute GIF */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 mb-2 sm:mb-3 mx-auto flex items-center justify-center shrink-0">
          <CuteGif
            src={config.gifUrl}
            alt="Shy cute bear"
            fallbackType="shy"
            className="w-full h-full object-contain drop-shadow-md rounded-2xl will-change-transform"
          />
        </div>

        {/* The Big Question */}
        <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#3B0764] mb-1 sm:mb-2 tracking-tight">
          {config.questionText}
        </h1>

        {/* Subtext */}
        <p className="text-[#581C87] text-xs sm:text-sm font-light italic mb-3 sm:mb-4 max-w-md mx-auto">
          “{config.subText}”
        </p>

        {/* Dynamic playful notice when NO is clicked */}
        {playfulMessage && (
          <div className="mb-3 px-3 py-1.5 bg-[#F3E8FF] border border-[#DDD6FE] text-[#6B21A8] text-xs font-medium rounded-2xl shadow-xs transition-all duration-300 transform scale-100 animate-fadeIn flex items-center justify-center gap-1.5">
            <Heart className="w-3 h-3 text-[#9333EA] fill-[#9333EA] shrink-0" />
            <span>{playfulMessage}</span>
          </div>
        )}

        {/* Buttons Area: YES grows bigger, NO shrinks smaller and moves ONLY when clicked! */}
        <div className="relative flex items-center justify-center gap-4 sm:gap-6 w-full min-h-[60px] sm:min-h-[70px]">
          {/* YES Button (Expands with every click on NO!) */}
          <button
            type="button"
            onClick={handleYesClick}
            disabled={hasClickedYes}
            style={{
              transform: `scale(${yesScale})`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            className="relative inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-lg shadow-[#9333EA]/40 hover:shadow-xl hover:shadow-[#9333EA]/50 hover:brightness-105 active:scale-95 transition-all duration-300 z-30 cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#C084FC]/50 disabled:opacity-70"
          >
            <Heart className="w-4 h-4 fill-white text-white animate-pulse" />
            <span>{config.yesButtonText}</span>
          </button>

          {/* NO Button (Shrinks smaller and moves ONLY when clicked - no hover action!) */}
          <button
            ref={noButtonRef}
            type="button"
            onClick={handleNoClick}
            style={{
              transform: `translate3d(${noOffset.x}px, ${noOffset.y}px, 0) scale(${noScale})`,
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'transform',
              transformOrigin: 'center center',
            }}
            className="inline-flex items-center justify-center gap-1.5 px-6 py-3 text-sm sm:text-base font-medium rounded-full border bg-white/95 border-[#DDD6FE] text-[#6B21A8] hover:bg-[#F3E8FF] hover:text-[#581C87] active:scale-95 transition-colors duration-200 select-none cursor-pointer z-20 shadow-xs"
          >
            <span>{config.noButtonText}</span>
            {dodgeCount > 0 && (
              <span className="text-[10px] text-purple-400 font-mono">
                ({Math.max(8, Math.round(noScale * 100))}%)
              </span>
            )}
          </button>
        </div>

        {/* Helpful hint for recipient */}
        {dodgeCount >= 2 && (
          <p className="mt-8 text-xs text-[#7E22CE]/80 font-light animate-fadeIn">
            Hehe, there is no way to reject! The button will just keep shrinking ♡
          </p>
        )}
      </div>

      {/* =========================================================================
          VIRAL PRANK MODAL: Infinite loop for saying NO (No way to reject!)
          ========================================================================= */}
      {showPrankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-[#FAF5FF] rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border border-[#DDD6FE] shadow-2xl relative animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-3 bg-[#EDE9FE] rounded-full flex items-center justify-center text-[#9333EA]">
              <Heart className="w-8 h-8 fill-[#9333EA] animate-bounce" />
            </div>

            <h3 className="font-serif-title text-2xl font-bold text-[#3B0764] mb-2">
              Nice try, but you can't reject me! 
            </h3>

            <p className="text-[#581C87] text-sm font-light leading-relaxed mb-6">
              The universe has decreed that only <strong>YES</strong> is valid today! 💜 The NO button will just keep shrinking and moving around!
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleYesClick}
                className="w-full py-3.5 px-4 text-base font-bold text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart className="w-5 h-5 fill-white animate-pulse" />
                <span>Okay fine, YES! 💜</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPrankModal(false);
                  const next = dodgeCount + 1;
                  setDodgeCount(next);
                  setNoOffset(getRandomOffset(next));
                }}
                className="w-full py-2.5 px-4 text-xs font-medium text-[#7E22CE] hover:text-[#581C87] rounded-full hover:bg-[#EDE9FE] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try clicking the tiny NO again (it shrinks more!) </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
