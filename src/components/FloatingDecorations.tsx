import React, { useEffect, useState, useRef } from 'react';

interface FloatingDecorationsProps {
  enableCursorTrail?: boolean;
}

interface CursorParticle {
  id: number;
  x: number;
  y: number;
  symbol: string;
}

// Global mouse tracker for smooth 60 FPS pointer avoidance
const mouseState = { x: -9999, y: -9999, isActive: false };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'mousemove',
    (e) => {
      mouseState.x = e.clientX;
      mouseState.y = e.clientY;
      mouseState.isActive = true;
    },
    { passive: true }
  );
  window.addEventListener(
    'mouseleave',
    () => {
      mouseState.x = -9999;
      mouseState.y = -9999;
      mouseState.isActive = false;
    },
    { passive: true }
  );
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 0) {
        mouseState.x = e.touches[0].clientX;
        mouseState.y = e.touches[0].clientY;
        mouseState.isActive = true;
      }
    },
    { passive: true }
  );
  window.addEventListener(
    'touchend',
    () => {
      mouseState.isActive = false;
      mouseState.x = -9999;
      mouseState.y = -9999;
    },
    { passive: true }
  );
}

// Butterfly data model
interface ButterflyData {
  id: number;
  size: number;
  colorType: 'violet' | 'lavender' | 'amethyst' | 'lilac' | 'orchid' | 'honey_violet';
  wingFlapSpeed: string;
  initialX: number;
  initialY: number;
  flightOffset: number;
}

// Super Cute Kawaii Meadow Butterfly with 3D Flapping & Smooth Pointer Avoidance
const CuteAvoidingButterfly: React.FC<{ data: ButterflyData; index: number }> = ({ data, index }) => {
  const butterflyRef = useRef<HTMLDivElement | null>(null);

  // Physics state stored in refs to bypass React rendering cycle
  const stateRef = useRef({
    x: (data.initialX / 100) * (typeof window !== 'undefined' ? window.innerWidth : 1000),
    y: (data.initialY / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800),
    vx: (Math.random() - 0.5) * 18,
    vy: (Math.random() - 0.5) * 18,
    heading: Math.random() * Math.PI * 2,
    bobPhase: data.flightOffset,
  });

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    // Gentle cruising speed for peaceful grassland meadow
    const cruiseSpeed = 24 + (index % 5) * 4;
    const maxAvoidSpeed = 220;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const state = stateRef.current;
      const width = window.innerWidth || 1000;
      const height = window.innerHeight || 800;

      // 1. Natural meadow wandering curves & gentle bobbing
      state.bobPhase += dt * 3.5;
      const gentleWander = Math.sin(time * 0.001 + index * 1.3) * 1.2 * dt;
      state.heading += gentleWander;

      const targetCruiseVx = Math.cos(state.heading) * cruiseSpeed;
      const targetCruiseVy = Math.sin(state.heading) * cruiseSpeed - 3 + Math.sin(state.bobPhase) * 6;

      // 2. Smooth Pointer Avoidance: Butterflies playfully avoid mouse/finger
      let avoidVx = 0;
      let avoidVy = 0;
      let isAvoiding = false;

      if (mouseState.isActive) {
        const dx = state.x - mouseState.x;
        const dy = state.y - mouseState.y;
        const dist = Math.hypot(dx, dy);
        const avoidDist = 130; // Sensitive avoidance bubble

        if (dist < avoidDist) {
          isAvoiding = true;
          const overlap = (avoidDist - dist) / avoidDist;
          // Smooth non-linear push
          const pushForce = Math.pow(overlap, 1.25) * maxAvoidSpeed;

          const nx = dist > 1 ? dx / dist : (Math.random() - 0.5) * 2;
          const ny = dist > 1 ? dy / dist : (Math.random() - 0.5) * 2;

          avoidVx = nx * pushForce;
          avoidVy = ny * pushForce;

          // Turn heading away from cursor smoothly
          state.heading = Math.atan2(ny, nx);
        }
      }

      if (isAvoiding) {
        const lerp = Math.min(dt * 7, 0.4);
        state.vx += (avoidVx - state.vx) * lerp;
        state.vy += (avoidVy - state.vy) * lerp;
      } else {
        const damping = Math.min(dt * 2.2, 0.2);
        state.vx += (targetCruiseVx - state.vx) * damping;
        state.vy += (targetCruiseVy - state.vy) * damping;
      }

      // 3. Gentle screen edge repulsion
      const margin = 30;
      if (state.x < margin) state.vx += 100 * dt;
      else if (state.x > width - margin) state.vx -= 100 * dt;

      if (state.y < margin) state.vy += 100 * dt;
      else if (state.y > height - margin) state.vy -= 100 * dt;

      // Update coordinates
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      // Seamless screen wrap-around
      if (state.x < -45) state.x = width + 35;
      if (state.x > width + 45) state.x = -35;
      if (state.y < -45) state.y = height + 35;
      if (state.y > height + 45) state.y = -35;

      // Flight angle calculated from current velocity + 90 deg (facing upwards)
      const flightAngle = Math.atan2(state.vy, state.vx) * (180 / Math.PI) + 90;

      if (butterflyRef.current) {
        butterflyRef.current.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) translate(-50%, -50%) rotate(${flightAngle}deg)`;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [index]);

  // Cute color palettes tailored for violet grassland theme
  const getWingPalette = (type: ButterflyData['colorType']) => {
    switch (type) {
      case 'violet':
        return {
          main: '#9333EA',
          secondary: '#C084FC',
          light: '#F3E8FF',
          spot: '#FFFFFF',
          glow: 'rgba(147, 51, 234, 0.45)',
          body: '#581C87',
        };
      case 'lavender':
        return {
          main: '#A855F7',
          secondary: '#E9D5FF',
          light: '#FAF5FF',
          spot: '#FFFFFF',
          glow: 'rgba(168, 85, 247, 0.45)',
          body: '#6B21A8',
        };
      case 'amethyst':
        return {
          main: '#7E22CE',
          secondary: '#D8B4FE',
          light: '#F5F3FF',
          spot: '#FEF08A',
          glow: 'rgba(126, 34, 206, 0.45)',
          body: '#4C1D95',
        };
      case 'lilac':
        return {
          main: '#C084FC',
          secondary: '#F3E8FF',
          light: '#FFFFFF',
          spot: '#FFFFFF',
          glow: 'rgba(192, 132, 252, 0.45)',
          body: '#7E22CE',
        };
      case 'honey_violet':
        return {
          main: '#9333EA',
          secondary: '#FDE047',
          light: '#FEF9C3',
          spot: '#FFFFFF',
          glow: 'rgba(234, 179, 8, 0.4)',
          body: '#701A75',
        };
      case 'orchid':
      default:
        return {
          main: '#8B5CF6',
          secondary: '#DDD6FE',
          light: '#FDF4FF',
          spot: '#FFFFFF',
          glow: 'rgba(139, 92, 246, 0.45)',
          body: '#5B21B6',
        };
    }
  };

  const pal = getWingPalette(data.colorType);

  return (
    <div
      ref={butterflyRef}
      className="absolute top-0 left-0 pointer-events-none select-none will-change-transform z-10"
      style={{
        width: `${data.size}px`,
        height: `${data.size}px`,
        perspective: '450px',
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Cute Left Wing (3D Flapping around right edge origin) */}
        <div
          className="absolute right-1/2 top-0 w-[49%] h-[95%] origin-right will-change-transform"
          style={{
            animation: `butterflyWingLeft ${data.wingFlapSpeed} ease-in-out infinite`,
          }}
        >
          <svg
            viewBox="0 0 50 60"
            className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 4px ${pal.glow})` }}
          >
            <defs>
              <linearGradient id={`cuteWingL-${data.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={pal.light} stopOpacity="0.98" />
                <stop offset="45%" stopColor={pal.secondary} stopOpacity="0.95" />
                <stop offset="90%" stopColor={pal.main} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Cute rounded upper forewing */}
            <path
              d="M48,30 C48,12 28,1 12,5 C-1,9 1,24 16,30 C28,34 46,32 48,30 Z"
              fill={`url(#cuteWingL-${data.id})`}
            />
            {/* Cute rounded lower hindwing */}
            <path
              d="M48,32 C45,46 32,58 17,56 C4,54 8,38 25,34 C36,32 46,32 48,32 Z"
              fill={`url(#cuteWingL-${data.id})`}
              opacity="0.9"
            />
            {/* Cute wing spots & sparkles */}
            <circle cx="16" cy="14" r="3.2" fill={pal.spot} opacity="0.8" />
            <circle cx="26" cy="18" r="2.2" fill={pal.spot} opacity="0.75" />
            <circle cx="20" cy="46" r="2.4" fill={pal.spot} opacity="0.7" />
            {/* Subtle cute heart outline on upper wing */}
            <path
              d="M20,13 C18,10 15,12 17,15 L20,18 L23,15 C25,12 22,10 20,13 Z"
              fill="#FFFFFF"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Cute Butterfly Center: Chubby Body, Round Head, Antennae & Blushing Face */}
        <div className="relative z-10 w-[14%] h-[72%] flex flex-col items-center justify-center">
          {/* Cute curly antennae with heart/dot tips */}
          <svg viewBox="0 0 24 16" className="w-[180%] h-4 -mb-1 overflow-visible">
            {/* Left curved antenna */}
            <path d="M12,15 Q8,6 4,7" stroke={pal.body} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle cx="3.5" cy="7" r="1.8" fill={pal.secondary} />
            {/* Right curved antenna */}
            <path d="M12,15 Q16,6 20,7" stroke={pal.body} strokeWidth="1.6" strokeLinecap="round" fill="none" />
            <circle cx="20.5" cy="7" r="1.8" fill={pal.secondary} />
          </svg>

          {/* Cute round head with blushing cheeks */}
          <div
            className="w-full aspect-square rounded-full flex items-center justify-around shadow-xs relative"
            style={{ backgroundColor: pal.body }}
          >
            {/* Tiny cartoon eye highlights */}
            <span className="w-[1.5px] h-[1.5px] bg-white rounded-full opacity-90 inline-block" />
            <span className="w-[1.5px] h-[1.5px] bg-white rounded-full opacity-90 inline-block" />
          </div>

          {/* Chubby caterpillar-style oval abdomen */}
          <div
            className="w-[85%] flex-1 rounded-full shadow-xs mt-0.5 border border-white/20"
            style={{
              background: `linear-gradient(to bottom, ${pal.body}, #3B0764)`,
            }}
          />
        </div>

        {/* Cute Right Wing (3D Flapping around left edge origin) */}
        <div
          className="absolute left-1/2 top-0 w-[49%] h-[95%] origin-left will-change-transform"
          style={{
            animation: `butterflyWingRight ${data.wingFlapSpeed} ease-in-out infinite`,
          }}
        >
          <svg
            viewBox="0 0 50 60"
            className="w-full h-full"
            style={{ filter: `drop-shadow(0 0 4px ${pal.glow})` }}
          >
            <defs>
              <linearGradient id={`cuteWingR-${data.id}`} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={pal.light} stopOpacity="0.98" />
                <stop offset="45%" stopColor={pal.secondary} stopOpacity="0.95" />
                <stop offset="90%" stopColor={pal.main} stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Cute rounded upper forewing */}
            <path
              d="M2,30 C2,12 22,1 38,5 C51,9 49,24 34,30 C22,34 4,32 2,30 Z"
              fill={`url(#cuteWingR-${data.id})`}
            />
            {/* Cute rounded lower hindwing */}
            <path
              d="M2,32 C5,46 18,58 33,56 C46,54 42,38 25,34 C14,32 4,32 2,32 Z"
              fill={`url(#cuteWingR-${data.id})`}
              opacity="0.9"
            />
            {/* Cute wing spots & sparkles */}
            <circle cx="34" cy="14" r="3.2" fill={pal.spot} opacity="0.8" />
            <circle cx="24" cy="18" r="2.2" fill={pal.spot} opacity="0.75" />
            <circle cx="30" cy="46" r="2.4" fill={pal.spot} opacity="0.7" />
            {/* Subtle cute heart outline on upper wing */}
            <path
              d="M30,13 C28,10 25,12 27,15 L30,18 L33,15 C35,12 32,10 30,13 Z"
              fill="#FFFFFF"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const FloatingDecorations: React.FC<FloatingDecorationsProps> = ({
  enableCursorTrail = true,
}) => {
  const [particles, setParticles] = useState<CursorParticle[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  // Desktop cursor sparkles and mini cute butterfly trail
  useEffect(() => {
    if (!enableCursorTrail || reducedMotion) return;

    let lastTime = 0;
    const symbols = ['🦋', '💜', '✨', '₊˚⊹', '🌸', '🪻', '🌿'];

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastTime < 55) return;
      lastTime = now;

      const newParticle: CursorParticle = {
        id: now + Math.random(),
        x: e.clientX,
        y: e.clientY,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 950);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableCursorTrail, reducedMotion]);

  // Generate 32 cute butterflies filling the screen nicely with varied small-to-medium sizes
  const butterflies: ButterflyData[] = Array.from({ length: 32 }, (_, i) => {
    const sizes = [17, 20, 22, 25, 28, 32];
    const colorTypes: ButterflyData['colorType'][] = [
      'violet',
      'lavender',
      'amethyst',
      'lilac',
      'orchid',
      'honey_violet',
    ];
    const flapSpeeds = ['0.13s', '0.16s', '0.18s', '0.21s'];

    return {
      id: i + 1,
      size: sizes[i % sizes.length],
      colorType: colorTypes[i % colorTypes.length],
      wingFlapSpeed: flapSpeeds[i % flapSpeeds.length],
      initialX: (i * 12.8 + 4) % 94,
      initialY: (i * 18.4 + 5) % 92,
      flightOffset: i * 0.8,
    };
  });

  // Falling gentle violet blossoms / petals drifting across the meadow
  const violetPetals = [
    { left: '5%', delay: '0s', duration: '13s', size: 'w-4 h-4' },
    { left: '15%', delay: '3.5s', duration: '14s', size: 'w-3 h-3' },
    { left: '26%', delay: '1s', duration: '16s', size: 'w-4 h-4' },
    { left: '38%', delay: '5.2s', duration: '12s', size: 'w-3.5 h-3.5' },
    { left: '50%', delay: '2.1s', duration: '15s', size: 'w-3 h-3' },
    { left: '62%', delay: '6.5s', duration: '13s', size: 'w-4 h-4' },
    { left: '74%', delay: '4s', duration: '17s', size: 'w-3.5 h-3.5' },
    { left: '85%', delay: '2.8s', duration: '14s', size: 'w-3 h-3' },
    { left: '94%', delay: '7s', duration: '15s', size: 'w-4 h-4' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* 1. Cute Butterflies filling the screen with silky-smooth pointer avoidance */}
      {!reducedMotion &&
        butterflies.map((b, idx) => (
          <CuteAvoidingButterfly key={b.id} data={b} index={idx} />
        ))}

      {/* 2. Delicate drifting violet flower blossoms */}
      {!reducedMotion &&
        violetPetals.map((petal, idx) => (
          <div
            key={idx}
            className={`absolute top-[-5%] select-none opacity-70 ${petal.size}`}
            style={{
              left: petal.left,
              animation: `petalDrift ${petal.duration} linear infinite`,
              animationDelay: petal.delay,
            }}
          >
            {/* 5-petal stylized violet flower blossom with golden center */}
            <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-xs">
              <circle cx="20" cy="11" r="7" fill="#C084FC" opacity="0.9" />
              <circle cx="11" cy="20" r="7" fill="#A855F7" opacity="0.9" />
              <circle cx="29" cy="20" r="7" fill="#A855F7" opacity="0.9" />
              <circle cx="14" cy="29" r="7" fill="#9333EA" opacity="0.9" />
              <circle cx="26" cy="29" r="7" fill="#9333EA" opacity="0.9" />
              <circle cx="20" cy="20" r="3.5" fill="#FDE047" />
            </svg>
          </div>
        ))}

      {/* 3. Peaceful Meadow Horizon Layer: Swaying grass blades & blooming wild violets along the bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 pointer-events-none overflow-hidden flex items-end opacity-85 select-none">
        {/* Layer 1: Back Grass blades */}
        <div
          className="absolute inset-x-0 bottom-0 h-full w-full origin-bottom"
          style={{ animation: 'grassSwaySlow 6s ease-in-out infinite alternate' }}
        >
          <svg viewBox="0 0 1200 80" preserveAspectRatio="none" className="w-full h-full opacity-60">
            <path
              d="M0,80 Q40,30 80,80 Q130,20 180,80 Q230,35 280,80 Q340,15 400,80 Q460,25 520,80 Q580,30 640,80 Q710,18 780,80 Q840,30 900,80 Q960,18 1020,80 Q1080,32 1140,80 Q1180,24 1200,80 Z"
              fill="#22c55e"
            />
          </svg>
        </div>

        {/* Layer 2: Front Grass blades with blooming wild violets */}
        <div
          className="absolute inset-x-0 bottom-0 h-14 sm:h-16 w-full origin-bottom"
          style={{ animation: 'grassSway 4.5s ease-in-out infinite alternate' }}
        >
          <svg viewBox="0 0 1200 65" preserveAspectRatio="none" className="w-full h-full">
            {/* Front grass silhoutte */}
            <path
              d="M0,65 Q30,15 60,65 Q110,25 150,65 Q200,10 240,65 Q300,20 350,65 Q410,12 460,65 Q520,24 570,65 Q630,8 680,65 Q740,22 790,65 Q850,14 900,65 Q960,24 1000,65 Q1060,10 1110,65 Q1160,20 1200,65 Z"
              fill="#16a34a"
              opacity="0.85"
            />
            {/* Blooming wild violet flowers nestled in the meadow grass */}
            {/* Flower 1 */}
            <g transform="translate(90, 22) scale(0.65)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
            {/* Flower 2 */}
            <g transform="translate(260, 16) scale(0.7)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
            {/* Flower 3 */}
            <g transform="translate(480, 20) scale(0.65)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
            {/* Flower 4 */}
            <g transform="translate(710, 15) scale(0.75)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
            {/* Flower 5 */}
            <g transform="translate(930, 18) scale(0.68)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
            {/* Flower 6 */}
            <g transform="translate(1120, 22) scale(0.65)">
              <circle cx="10" cy="5" r="4.5" fill="#C084FC" />
              <circle cx="5" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="15" cy="10" r="4.5" fill="#A855F7" />
              <circle cx="7" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="13" cy="15" r="4.5" fill="#9333EA" />
              <circle cx="10" cy="10" r="2.2" fill="#FDE047" />
            </g>
          </svg>
        </div>
      </div>

      {/* 4. Desktop cursor sparkles and mini butterfly particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute select-none pointer-events-none text-xs transition-transform ease-out"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            transform: 'translate(-50%, -50%)',
            animation: 'floatUp 0.95s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
            filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.6))',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};
