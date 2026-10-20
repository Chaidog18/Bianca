import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Pause, Play } from 'lucide-react';

interface AudioPlayerProps {
  customMusicUrl?: string;
  enabled?: boolean;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ customMusicUrl, enabled = true }) => {
  // Default music to ON as requested
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.4);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [useSynth, setUseSynth] = useState(!customMusicUrl);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Soft romantic music-box chord progression in violet mood: Fmaj9 -> Dm9 -> Bbmaj7 -> Csus4
  const chordNotes = [
    [261.63, 329.63, 392.00, 493.88], // C, E, G, B
    [220.00, 261.63, 329.63, 392.00], // A, C, E, G
    [174.61, 220.00, 261.63, 349.23], // F, A, C, F
    [196.00, 246.94, 293.66, 392.00], // G, B, D, G
  ];

  // Play a soft bell/music-box chime tone using Web Audio API
  const playChime = (freq: number, timeOffset: number) => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

    // Warm, bell-like envelope
    const startTime = ctx.currentTime + timeOffset;
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.2, startTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.5);

    osc.connect(noteGain);
    noteGain.connect(gainNodeRef.current);

    osc.start(startTime);
    osc.stop(startTime + 2.6);
  };

  const startSynthMelody = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      const ctx = audioCtxRef.current;
      if (!gainNodeRef.current) {
        const masterGain = ctx.createGain();
        masterGain.gain.value = volume * 0.4;
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;
      }

      let chordIndex = 0;
      const playStep = () => {
        const chord = chordNotes[chordIndex % chordNotes.length];
        // Arpeggiate notes gently
        chord.forEach((freq, idx) => {
          playChime(freq, idx * 0.42);
        });
        // Occasional high sparkle chime
        if (Math.random() > 0.4) {
          playChime(chord[2] * 2, 1.8);
        }

        chordIndex++;
        synthTimerRef.current = window.setTimeout(playStep, 2800);
      };

      if (!synthTimerRef.current) {
        playStep();
      }
    } catch (e) {
      console.warn('Web Audio synth playback initialized:', e);
    }
  };

  const stopSynthMelody = () => {
    if (synthTimerRef.current) {
      clearTimeout(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.suspend().catch(() => {});
    }
  };

  // Auto-start on mount (and register gesture unlock for browsers blocking unprompted autoplay)
  useEffect(() => {
    if (!enabled) return;

    if (customMusicUrl && !useSynth && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to synth if external file is blocked
        setUseSynth(true);
        startSynthMelody();
      });
    } else {
      startSynthMelody();
    }

    // Browsers often require one user movement/interaction to resume AudioContext
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current
          .resume()
          .then(() => {
            if (isPlaying && !synthTimerRef.current) {
              startSynthMelody();
            }
          })
          .catch(() => {});
      }
      if (audioRef.current && isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }

      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAudio);
      });
    };

    const unlockEvents = [
      'mousemove',
      'pointermove',
      'pointerdown',
      'touchstart',
      'touchend',
      'wheel',
      'scroll',
      'keydown',
      'mouseenter',
      'focus',
      'click',
    ];

    unlockEvents.forEach((evt) => {
      window.addEventListener(evt, unlockAudio, { passive: true, once: false });
    });

    return () => {
      unlockEvents.forEach((evt) => {
        window.removeEventListener(evt, unlockAudio);
      });
    };
  }, [enabled, customMusicUrl, useSynth]);

  // Toggle playback
  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current && !useSynth) {
        audioRef.current.pause();
      } else {
        stopSynthMelody();
      }
      setIsPlaying(false);
    } else {
      if (customMusicUrl && !useSynth && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setUseSynth(true);
            startSynthMelody();
            setIsPlaying(true);
          });
      } else {
        startSynthMelody();
        setIsPlaying(true);
      }
    }
  };

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * 0.4;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthTimerRef.current) clearTimeout(synthTimerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-40 group"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      {customMusicUrl && !useSynth && (
        <audio
          ref={audioRef}
          src={customMusicUrl}
          loop
          preload="auto"
          onError={() => setUseSynth(true)}
        />
      )}

      {/* Compact Circular Music Logo Button */}
      <button
        onClick={togglePlay}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border cursor-pointer select-none ${
          isPlaying
            ? 'bg-white/95 backdrop-blur-md border-[#C084FC] text-[#7C3AED] shadow-[#A855F7]/25 hover:scale-110 active:scale-95 ring-2 ring-[#C084FC]/30'
            : 'bg-white/75 backdrop-blur-md border-[#DDD6FE] text-[#9CA3AF] hover:text-[#7C3AED] hover:border-[#C084FC] hover:scale-105'
        }`}
        title={isPlaying ? 'Romantic music playing ♡ (click to pause)' : 'Music paused (click to play ♡)'}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {/* Spinning Vinyl Record / Note Logo Graphic */}
        <div
          className={`relative flex items-center justify-center w-7 h-7 rounded-full ${
            isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
        >
          {/* Vinyl Grooves */}
          <div className="absolute inset-0 rounded-full border border-[#DDD6FE]/80 bg-gradient-to-tr from-[#F3E8FF] via-[#FAF5FF] to-[#EDE9FE]" />
          <div className="absolute inset-1 rounded-full border border-[#C084FC]/30" />
          <div className="absolute inset-2 rounded-full border border-[#C084FC]/20" />
          {/* Center Heart / Music Icon */}
          <div className="relative z-10 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#9333EA] to-[#6B21A8] flex items-center justify-center shadow-xs">
            {isPlaying ? (
              <Music className="w-2 h-2 text-white animate-pulse" />
            ) : (
              <VolumeX className="w-2 h-2 text-white" />
            )}
          </div>
        </div>

        {/* Sound Wave Ripple Ping Badge when ON */}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A855F7] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9333EA] border-2 border-white items-center justify-center">
              <span className="w-1 h-1 bg-white rounded-full"></span>
            </span>
          </span>
        )}
      </button>

      {/* Mini Volume Popover on Hover (floating right next to the logo) */}
      <div
        className={`absolute left-12 bottom-0 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-[#DDD6FE] transition-all duration-200 origin-left ${
          showVolumeSlider ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <button
          onClick={() => setVolume((v) => (v > 0 ? 0 : 0.4))}
          className="text-[#7C3AED] hover:text-[#9333EA] cursor-pointer"
        >
          {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-12 h-1 accent-[#9333EA] bg-[#E9D5FF] rounded-lg appearance-none cursor-pointer"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
};
