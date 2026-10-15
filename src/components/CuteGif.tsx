import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { cleanGifUrl } from '../utils/sanitizeConfig';

interface CuteGifProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: 'cat' | 'hug' | 'shy' | 'bunny' | 'bear' | 'celebration' | 'letter' | 'puppy' | 'stars';
  onClick?: () => void;
}

const LOCAL_MAP: Record<string, string> = {
  cat: '/gifs/opening.gif',
  shy: '/gifs/opening.gif',
  hug: '/gifs/message.gif',
  bear: '/gifs/question.gif',
  celebration: '/gifs/celebration.gif',
  letter: '/gifs/letter.gif',
  bunny: '/gifs/letter.gif',
  puppy: '/gifs/floating-puppy.gif',
  stars: '/gifs/floating-stars.gif',
};

export const CuteGif: React.FC<CuteGifProps> = ({
  src,
  alt,
  className = '',
  fallbackType = 'cat',
  onClick,
}) => {
  const defaultLocalGif = LOCAL_MAP[fallbackType] || '/gifs/opening.gif';
  const initialSafeSrc = cleanGifUrl(src, (fallbackType === 'hug' ? 'message' : fallbackType === 'bear' ? 'question' : fallbackType === 'celebration' ? 'celebration' : fallbackType === 'letter' ? 'letter' : 'opening') as any);

  const [currentSrc, setCurrentSrc] = useState<string>(initialSafeSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [attemptedLocal, setAttemptedLocal] = useState(false);

  // Synchronize when the src prop changes from outside (e.g. editor change)
  useEffect(() => {
    const nextSafe = cleanGifUrl(src, (fallbackType === 'hug' ? 'message' : fallbackType === 'bear' ? 'question' : fallbackType === 'celebration' ? 'celebration' : fallbackType === 'letter' ? 'letter' : 'opening') as any);
    setCurrentSrc(nextSafe);
    setHasError(false);
    setIsLoaded(false);
    setAttemptedLocal(nextSafe.startsWith('/gifs/'));
  }, [src, fallbackType]);

  const handleImageError = () => {
    if (!attemptedLocal && currentSrc !== defaultLocalGif) {
      setAttemptedLocal(true);
      setCurrentSrc(defaultLocalGif);
    } else {
      setHasError(true);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;

    // Detect Giphy's "THIS CONTENT IS NOT AVAILABLE" image (exactly 480x270 px)
    const isGiphyPlaceholder =
      currentSrc.includes('giphy.com') &&
      img.naturalWidth === 480 &&
      img.naturalHeight === 270;

    const isZeroDimension = img.naturalWidth === 0 || img.naturalHeight === 0;

    if (isGiphyPlaceholder || isZeroDimension) {
      if (!attemptedLocal && currentSrc !== defaultLocalGif) {
        setAttemptedLocal(true);
        setCurrentSrc(defaultLocalGif);
        return;
      } else {
        setHasError(true);
        return;
      }
    }

    setIsLoaded(true);
  };

  // High fidelity animated SVG fallback in case network restricts GIF loading
  const renderSvgFallback = () => {
    switch (fallbackType) {
      case 'hug':
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#FFF0F5] to-[#FFE4E8] rounded-2xl border border-[#FFD1DC] shadow-sm select-none">
            <svg viewBox="0 0 160 120" className="w-36 h-28 drop-shadow-sm">
              {/* Floating hearts */}
              <path d="M75,20 C75,15 80,10 85,15 C90,10 95,15 95,20 C95,25 85,32 85,32 C85,32 75,25 75,20 Z" fill="#FF6B8B">
                <animateTransform attributeName="transform" type="translate" values="0,5; 0,-8; 0,5" dur="2.5s" repeatCount="indefinite" />
              </path>
              <path d="M98,28 C98,24 102,20 106,24 C110,20 114,24 114,28 C114,32 106,37 106,37 C106,37 98,32 98,28 Z" fill="#FFA5BA">
                <animateTransform attributeName="transform" type="translate" values="0,2; 0,-6; 0,2" dur="3s" repeatCount="indefinite" />
              </path>
              {/* Left Bear */}
              <circle cx="56" cy="42" r="12" fill="#E8D5C4" />
              <circle cx="56" cy="42" r="7" fill="#FCEEE3" />
              <circle cx="36" cy="44" r="10" fill="#E8D5C4" />
              <circle cx="36" cy="44" r="6" fill="#FCEEE3" />
              <ellipse cx="48" cy="62" rx="22" ry="20" fill="#E8D5C4" />
              <circle cx="43" cy="58" r="2.5" fill="#4A3B43" />
              <circle cx="53" cy="58" r="2.5" fill="#4A3B43" />
              <ellipse cx="48" cy="65" rx="5" ry="3.5" fill="#CBB6A3" />
              <circle cx="48" cy="64" r="1.5" fill="#33222A" />
              {/* Right Bunny/Bear hugging */}
              <circle cx="102" cy="42" r="12" fill="#FFFFFF" />
              <circle cx="102" cy="42" r="7" fill="#FFDEE9" />
              <circle cx="122" cy="44" r="10" fill="#FFFFFF" />
              <circle cx="122" cy="44" r="6" fill="#FFDEE9" />
              <ellipse cx="110" cy="62" rx="22" ry="20" fill="#FFFFFF" />
              <circle cx="105" cy="58" r="2.5" fill="#4A3B43" />
              <circle cx="115" cy="58" r="2.5" fill="#4A3B43" />
              <ellipse cx="110" cy="65" rx="5" ry="3.5" fill="#FFDEE9" />
              <circle cx="110" cy="64" r="1.5" fill="#FF6B8B" />
              {/* Cute Blushes */}
              <circle cx="39" cy="64" r="3.5" fill="#FF9EAA" opacity="0.6" />
              <circle cx="57" cy="64" r="3.5" fill="#FF9EAA" opacity="0.6" />
              <circle cx="101" cy="64" r="3.5" fill="#FF9EAA" opacity="0.6" />
              <circle cx="119" cy="64" r="3.5" fill="#FF9EAA" opacity="0.6" />
              {/* Hugging Arms joined with heart */}
              <path d="M55,68 Q78,78 103,68" stroke="#E8D5C4" strokeWidth="8" strokeLinecap="round" fill="none" />
              <circle cx="79" cy="74" r="9" fill="#FF6B8B" />
              <path d="M75,72 C75,69 78,67 80,70 C82,67 85,69 85,72 C85,75 80,78 80,78 C80,78 75,75 75,72 Z" fill="#FFFFFF" />
            </svg>
            <span className="text-xs text-[#B33951] font-medium tracking-wide mt-1 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#FF6B8B] text-[#FF6B8B]" /> forever with you
            </span>
          </div>
        );

      case 'shy':
      case 'cat':
      default:
        return (
          <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[#FFF5F7] to-[#FFE8EE] rounded-2xl border border-[#FFD5DF] shadow-sm select-none">
            <svg viewBox="0 0 140 120" className="w-32 h-28 drop-shadow-sm">
              {/* Ears */}
              <polygon points="35,45 42,20 60,35" fill="#F4ACB7" />
              <polygon points="39,42 44,25 56,36" fill="#FFD1DC" />
              <polygon points="105,45 98,20 80,35" fill="#F4ACB7" />
              <polygon points="101,42 96,25 84,36" fill="#FFD1DC" />
              {/* Cat Face */}
              <circle cx="70" cy="60" r="32" fill="#FFFFFF" stroke="#F4ACB7" strokeWidth="1.5" />
              {/* Eyes with gentle blink */}
              <circle cx="58" cy="56" r="3.5" fill="#3D2B35">
                <animate attributeName="ry" values="3.5; 0.5; 3.5" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="82" cy="56" r="3.5" fill="#3D2B35">
                <animate attributeName="ry" values="3.5; 0.5; 3.5" dur="4s" repeatCount="indefinite" />
              </circle>
              {/* Eye sparkle */}
              <circle cx="56.5" cy="54.5" r="1.2" fill="#FFFFFF" />
              <circle cx="80.5" cy="54.5" r="1.2" fill="#FFFFFF" />
              {/* Nose & Mouth */}
              <polygon points="70,62 67,65 73,65" fill="#FF85A1" />
              <path d="M66,66 Q70,70 74,66" stroke="#5C4D56" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Shy Rosy Cheeks */}
              <ellipse cx="50" cy="62" rx="5" ry="3" fill="#FFB3C1" opacity="0.75" />
              <ellipse cx="90" cy="62" rx="5" ry="3" fill="#FFB3C1" opacity="0.75" />
              {/* Holding little heart */}
              <g style={{ transformOrigin: '73px 77px' }}>
                <path d="M64,74 C64,68 70,65 73,69 C76,65 82,68 82,74 C82,80 73,86 73,86 C73,86 64,80 64,74 Z" fill="#FF4D6D">
                  <animateTransform attributeName="transform" type="scale" values="1; 1.08; 1" additive="sum" dur="1.5s" repeatCount="indefinite" />
                </path>
                {/* Paws */}
                <ellipse cx="61" cy="78" rx="4.5" ry="4" fill="#FFFFFF" stroke="#F4ACB7" strokeWidth="1" />
                <ellipse cx="85" cy="78" rx="4.5" ry="4" fill="#FFFFFF" stroke="#F4ACB7" strokeWidth="1" />
              </g>
            </svg>
            <span className="text-xs text-[#B33951] font-medium tracking-wide mt-1 flex items-center gap-1">
              <Heart className="w-3 h-3 fill-[#FF758F] text-[#FF758F]" /> for my favorite person
            </span>
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ${className} ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#FFF0F3] animate-pulse rounded-2xl">
          <Heart className="w-6 h-6 text-[#FFB3C1] animate-bounce" />
        </div>
      )}

      {hasError ? (
        renderSvgFallback()
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-contain rounded-2xl transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
