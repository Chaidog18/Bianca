import React, { useEffect, useState } from 'react';
import { CelebrationConfig, PersonalTouchesConfig } from '../../types/romantic';
import { CuteGif } from '../CuteGif';
import confetti from 'canvas-confetti';
import { Heart, Mail, Calendar, Clock, Copy, Check, Sparkles } from 'lucide-react';

interface CelebrationScreenProps {
  config: CelebrationConfig;
  personalTouches: PersonalTouchesConfig;
  onNext: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  config,
  personalTouches,
  onNext,
}) => {
  const [copiedCertificate, setCopiedCertificate] = useState(false);
  const [liveCounter, setLiveCounter] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Violet & lavender romantic celebration confetti palette
    const violetColors = ['#9333EA', '#A855F7', '#C084FC', '#DDD6FE', '#FAF5FF', '#F472B6', '#E879F9'];

    // 1. Initial big celebratory pop
    confetti({
      particleCount: 95,
      spread: 90,
      origin: { y: 0.55 },
      colors: violetColors,
      disableForReducedMotion: true,
    });

    // 2. Gentle violet shower waves
    const end = Date.now() + 3500;
    const interval: any = setInterval(() => {
      if (Date.now() > end) {
        return clearInterval(interval);
      }
      confetti({
        startVelocity: 25,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() * 0.4 },
        colors: violetColors,
        particleCount: 22,
        shapes: ['circle'],
        scalar: 1.2,
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Determine official start date
  const targetDateStr =
    config.dates?.officialStartDate ||
    personalTouches.startDate ||
    new Date().toISOString().split('T')[0];

  const startDate = new Date(targetDateStr);
  const dayOfMonth = startDate.getDate() || 15;

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const formattedStartDate = !isNaN(startDate.getTime())
    ? startDate.toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'October 15, 2026';

  // Compute Next Monthsary
  const now = new Date();
  let nextMonthsary = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (now.getDate() >= dayOfMonth) {
    nextMonthsary = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }
  const msUntilNext = Math.max(0, nextMonthsary.getTime() - now.getTime());
  const daysUntilNext = Math.ceil(msUntilNext / (1000 * 60 * 60 * 24));
  const nextMonthsaryFormatted = nextMonthsary.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
  });

  // Live Timer since official start date
  useEffect(() => {
    const updateTime = () => {
      const startTime = startDate.getTime();
      const current = Date.now();
      const diff = Math.max(0, current - startTime);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setLiveCounter({ days, hours, minutes, seconds });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  // Copy Couple Milestone Certificate to clipboard
  const handleCopyCertificate = () => {
    const certificateText = `💍 OFFICIAL COUPLE CERTIFICATE 💜\n` +
      `Recipient: ${personalTouches.recipientName || 'My Love'}\n` +
      `Official Date: ${formattedStartDate}\n` +
      `Our Monthly Monthsary: Every ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} of the month! 🌸\n` +
      `"Somehow you made today the best day ever. I'm so happy it's you! ♡"`;

    navigator.clipboard.writeText(certificateText);
    setCopiedCertificate(true);
    setTimeout(() => setCopiedCertificate(false), 2500);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center px-3 py-1 sm:py-2 relative z-10 animate-fadeIn select-none">
      <div className="w-full bg-white/90 sm:bg-white/94 backdrop-blur-md rounded-3xl p-3.5 sm:p-5 border border-white/80 shadow-2xl shadow-[#581C87]/15 max-h-[calc(100dvh-4.5rem)] overflow-y-auto">
        {/* Floating Violet Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6B21A8] text-xs font-semibold tracking-wider uppercase mb-2 border border-[#DDD6FE] shadow-2xs">
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
          <span>She said yes! 💜</span>
          <Heart className="w-3 h-3 fill-[#9333EA] text-[#9333EA]" />
        </div>

        {/* Main Cute Hugging GIF */}
        <div className="w-20 h-20 sm:w-28 sm:h-28 mb-2 mx-auto flex items-center justify-center shrink-0">
          <CuteGif
            src={config.gifUrl}
            alt="Happy hugging couple"
            fallbackType="hug"
            className="w-full h-full object-contain drop-shadow-md rounded-2xl"
          />
        </div>

        {/* Big joyful title in deep violet */}
        <h1 className="font-serif-title text-xl sm:text-2xl font-extrabold text-[#3B0764] mb-1 tracking-tight shrink-0">
          {config.title}
        </h1>

        {/* Soft romantic quotes */}
        <div className="space-y-0.5 mb-2 text-[#581C87] text-xs sm:text-sm font-light leading-relaxed">
          <p className="italic">“{config.subtitle1}”</p>
          <p className="italic">“{config.subtitle2}”</p>
        </div>

        {/* Emphasized tender love note */}
        <div className="p-2 sm:p-2.5 mb-2.5 bg-white/85 backdrop-blur-md rounded-xl border border-[#DDD6FE] shadow-xs">
          <p className="font-serif-title text-base sm:text-lg font-bold text-[#7E22CE] tracking-wide flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 fill-[#9333EA] text-[#9333EA]" />
            <span>{config.happyText}</span>
            <Heart className="w-4 h-4 fill-[#9333EA] text-[#9333EA]" />
          </p>
        </div>

        {/* =========================================================================
            OFFICIAL DATES & MONTHSARY CARD (Revealed when she says YES!)
            ========================================================================= */}
        {config.dates?.showMonthsary !== false && (
          <div className="w-full bg-[#FAF5FF] rounded-2xl p-3 sm:p-4 border-2 border-[#DDD6FE] shadow-sm mb-3 text-center relative overflow-hidden animate-slideUpFade">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#EDE9FE] rounded-full text-[#6B21A8] text-[10px] font-bold tracking-wider uppercase mb-1.5">
              <Calendar className="w-3 h-3 text-[#9333EA]" />
              <span>Our Official Couple Milestone 💜</span>
            </div>

            <h3 className="font-serif-title text-lg sm:text-xl font-bold text-[#3B0764] mb-0.5">
              {config.dates?.anniversaryTitle || 'Day 1 as Official Boyfriend & Girlfriend 💜'}
            </h3>

            <p className="text-[11px] sm:text-xs text-[#6B21A8] font-light mb-2.5">
              {config.dates?.monthsaryNote || 'Every month on this special day is our Monthsary! ♡'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
              {/* Anniversary Date Box */}
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-[#E9D5FF] flex flex-col items-center shadow-xs">
                <span className="text-[9px] text-[#7E22CE] uppercase font-bold tracking-wider mb-0.5">
                  Official Anniversary Date
                </span>
                <span className="font-serif-title text-sm sm:text-base font-bold text-[#3B0764] flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-[#9333EA] text-[#9333EA]" />
                  {formattedStartDate}
                </span>
              </div>

              {/* Monthly Monthsary Box */}
              <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-[#E9D5FF] flex flex-col items-center shadow-xs">
                <span className="text-[9px] text-[#7E22CE] uppercase font-bold tracking-wider mb-0.5">
                  Our Monthly Monthsary
                </span>
                <span className="font-serif-title text-sm sm:text-base font-bold text-[#6B21A8]">
                  Every {dayOfMonth}{getOrdinalSuffix(dayOfMonth)} of month 🌸
                </span>
                <span className="text-[9px] text-[#7E22CE] mt-0.5">
                  Next: {nextMonthsaryFormatted} ({daysUntilNext}d away ♡)
                </span>
              </div>
            </div>

            {/* Live Relationship Counter */}
            <div className="pt-2 border-t border-[#E9D5FF]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#7E22CE] flex items-center justify-center gap-1 mb-1.5">
                <Clock className="w-2.5 h-2.5 text-[#9333EA]" />
                <span>Official Time Together</span>
              </span>

              <div className="grid grid-cols-4 gap-1.5 max-w-xs mx-auto mb-2">
                <div className="bg-white rounded-lg p-1 border border-[#DDD6FE] shadow-xs">
                  <div className="font-serif-title text-sm sm:text-base font-bold text-[#3B0764]">{liveCounter.days}</div>
                  <div className="text-[8px] text-[#6B21A8] uppercase">days</div>
                </div>
                <div className="bg-white rounded-lg p-1 border border-[#DDD6FE] shadow-xs">
                  <div className="font-serif-title text-sm sm:text-base font-bold text-[#3B0764]">{liveCounter.hours}</div>
                  <div className="text-[8px] text-[#6B21A8] uppercase">hrs</div>
                </div>
                <div className="bg-white rounded-lg p-1 border border-[#DDD6FE] shadow-xs">
                  <div className="font-serif-title text-sm sm:text-base font-bold text-[#3B0764]">{liveCounter.minutes}</div>
                  <div className="text-[8px] text-[#6B21A8] uppercase">mins</div>
                </div>
                <div className="bg-white rounded-lg p-1 border border-[#DDD6FE] shadow-xs">
                  <div className="font-serif-title text-sm sm:text-base font-bold text-[#3B0764]">{liveCounter.seconds}</div>
                  <div className="text-[8px] text-[#6B21A8] uppercase">secs</div>
                </div>
              </div>

              {/* Copy Couple Certificate Keepsake Button */}
              <button
                onClick={handleCopyCertificate}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDE9FE] text-[#6B21A8] hover:bg-[#DDD6FE] text-[11px] font-medium transition-all cursor-pointer shadow-xs"
              >
                {copiedCertificate ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span className="text-green-700 font-semibold">Copied milestone note! ♡</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#9333EA]" />
                    <span>Copy our official date certificate 📜</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Next button to read final letter */}
        <button
          onClick={onNext}
          className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-[#A855F7] via-[#9333EA] to-[#7E22CE] rounded-full shadow-lg shadow-[#9333EA]/30 hover:shadow-xl hover:shadow-[#9333EA]/50 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#C084FC]/40 cursor-pointer shrink-0"
        >
          <Mail className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
          <span>{config.buttonText}</span>
        </button>
      </div>
    </div>
  );
};
