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

    // Browsers often require one user click/tap to resume AudioContext
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => {
          if (isPlaying && !synthTimerRef.current) {
            startSynthMelody();
          }
        }).catch(() => {});
      }
      if (audioRef.current && isPlaying && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
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
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full shadow-md border border-[#DDD6FE] transition-all hover:shadow-lg"
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

      <button
        onClick={togglePlay}
        className="flex items-center gap-2 text-xs font-medium text-[#6B21A8] hover:text-[#9333EA] focus:outline-none focus:ring-2 focus:ring-[#C084FC] rounded-full p-1 cursor-pointer"
        title={isPlaying ? 'Pause romantic melody' : 'Play soft music ♡'}
        aria-label={isPlaying ? 'Pause romantic melody' : 'Play soft music'}
      >
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#EDE9FE] text-[#7C3AED]">
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
          {isPlaying && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9333EA] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9333EA]"></span>
            </span>
          )}
        </span>
        <span className="hidden sm:inline text-xs font-medium">
          {isPlaying ? 'soft melody playing ♡' : 'music off'}
        </span>
      </button>

      {/* Volume slider on hover or touch */}
      <div
        className={`flex items-center gap-1.5 transition-all duration-300 overflow-hidden ${
          showVolumeSlider || isPlaying ? 'w-20 opacity-100 ml-1' : 'w-0 opacity-0'
        }`}
      >
        <button
          onClick={() => setVolume((v) => (v > 0 ? 0 : 0.4))}
          className="text-[#7C3AED] hover:text-[#9333EA] focus:outline-none cursor-pointer"
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
