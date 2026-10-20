import React, { useState, useEffect, useRef } from 'react';
import { FloatingGifConfig, TargetSection } from '../types/romantic';
import { CuteGif } from './CuteGif';
import { Heart, X } from 'lucide-react';

interface FloatingGifsOverlayProps {
  gifs: FloatingGifConfig[];
  currentSection: TargetSection;
}

// Global mouse tracker shared across all floating GIFs (zero React re-renders)
const mousePos = { x: -9999, y: -9999, isActive: false };
if (typeof window !== 'undefined') {
  window.addEventListener(
    'mousemove',
    (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
      mousePos.isActive = true;
    },
    { passive: true }
  );

  window.addEventListener(
    'mouseleave',
    () => {
      mousePos.x = -9999;
      mousePos.y = -9999;
      mousePos.isActive = false;
    },
    { passive: true }
  );

  // Mobile touch support: touch also activates repulsion smoothly
  window.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches.length > 0) {
        mousePos.x = e.touches[0].clientX;
        mousePos.y = e.touches[0].clientY;
        mousePos.isActive = true;
      }
    },
    { passive: true }
  );

  window.addEventListener(
    'touchend',
    () => {
      mousePos.isActive = false;
      mousePos.x = -9999;
      mousePos.y = -9999;
    },
    { passive: true }
  );
}

// Physics-based, silky-smooth wandering and pointer avoidance
const SmoothFloatingGif: React.FC<{
  gif: FloatingGifConfig;
  index: number;
}> = ({ gif, index }) => {
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Position, velocity, and wander angle stored in refs for pure 60 FPS hardware acceleration
  const stateRef = useRef({
    x: typeof window !== 'undefined'
      ? (gif.customPosition?.x != null ? (gif.customPosition.x / 100) * window.innerWidth : (0.15 + (index * 0.18) % 0.7) * window.innerWidth)
      : 300,
    y: typeof window !== 'undefined'
      ? (gif.customPosition?.y != null ? (gif.customPosition.y / 100) * window.innerHeight : (0.2 + (index * 0.15) % 0.6) * window.innerHeight)
      : 300,
    vx: (Math.random() - 0.5) * 15,
    vy: (Math.random() - 0.5) * 15,
    wanderAngle: (index * 1.3) + Math.random() * 2,
    tilt: gif.rotation || 0,
  });

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    // Speed setting factors
    const speedFactor = gif.speed === 'slow' ? 0.65 : gif.speed === 'fast' ? 1.4 : 1.0;
    const baseCruiseSpeed = 28 * speedFactor; // Gentle, slow floating speed
    const maxAvoidSpeed = 260 * speedFactor;

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // Cap dt to avoid spikes on tab switch
      lastTime = time;

      const state = stateRef.current;
      const width = window.innerWidth || 1000;
      const height = window.innerHeight || 800;

      // 1. Gentle Ambient Wandering (slow, dreamy movement around the screen)
      state.wanderAngle += Math.sin(time * 0.0008 + index * 1.7) * 0.8 * dt;
      const targetAmbientVx = Math.cos(state.wanderAngle) * baseCruiseSpeed;
      const targetAmbientVy = Math.sin(state.wanderAngle) * baseCruiseSpeed;

      // 2. Buttery-Smooth Pointer Avoidance (glides away when mouse points on or near it)
      let avoidVx = 0;
      let avoidVy = 0;
      let isAvoiding = false;

      if (mousePos.isActive) {
        const dx = state.x - mousePos.x;
        const dy = state.y - mousePos.y;
        const dist = Math.hypot(dx, dy);
        const avoidRadius = 155; // Sensitive, comfortable avoidance perimeter

        if (dist < avoidRadius) {
          isAvoiding = true;
          // Smooth curve: stronger repulsion as cursor nears, smoothly tapering to 0 at perimeter
          const overlap = (avoidRadius - dist) / avoidRadius;
          const repulsionForce = Math.pow(overlap, 1.3) * maxAvoidSpeed;

          const nx = dist > 1 ? dx / dist : (Math.random() - 0.5) * 2;
          const ny = dist > 1 ? dy / dist : (Math.random() - 0.5) * 2;

          avoidVx = nx * repulsionForce;
          avoidVy = ny * repulsionForce;

          // Gentle tilt when avoiding
          state.tilt = (gif.rotation || 0) + nx * 14 * overlap;
        }
      }

      if (isAvoiding) {
        // Accelerate smoothly away from cursor
        const smoothLerp = Math.min(dt * 8, 0.4);
        state.vx += (avoidVx - state.vx) * smoothLerp;
        state.vy += (avoidVy - state.vy) * smoothLerp;
      } else {
        // Smoothly return to slow ambient wander & upright tilt
        const friction = Math.min(dt * 2.5, 0.2);
        state.vx += (targetAmbientVx - state.vx) * friction;
        state.vy += (targetAmbientVy - state.vy) * friction;
        state.tilt += ((gif.rotation || 0) - state.tilt) * Math.min(dt * 3, 0.2);
      }

      // 3. Screen Boundary Repulsion (keeps GIF safely and gracefully inside the viewport)
      const margin = 45;
      const boundaryPush = 140 * dt;

      if (state.x < margin) {
        state.vx += boundaryPush;
        state.wanderAngle = Math.atan2(state.vy, Math.abs(state.vx));
      } else if (state.x > width - margin) {
        state.vx -= boundaryPush;
        state.wanderAngle = Math.atan2(state.vy, -Math.abs(state.vx));
      }

      if (state.y < margin) {
        state.vy += boundaryPush;
        state.wanderAngle = Math.atan2(Math.abs(state.vy), state.vx);
      } else if (state.y > height - margin) {
        state.vy -= boundaryPush;
        state.wanderAngle = Math.atan2(-Math.abs(state.vy), state.vx);
      }

      // 4. Center Message / Content Card Avoidance:
      // Floating GIFs must stay in peripheral screen areas and NEVER enter behind or over the message card
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const cardHalfW = Math.min(width * 0.44, 280) + displaySize * 0.4;
      const cardHalfH = Math.min(height * 0.42, 290) + displaySize * 0.4;

      const dxCard = state.x - centerX;
      const dyCard = state.y - centerY;

      if (Math.abs(dxCard) < cardHalfW && Math.abs(dyCard) < cardHalfH) {
        // Calculate outward push towards nearest edge of the card
        const overlapX = cardHalfW - Math.abs(dxCard);
        const overlapY = cardHalfH - Math.abs(dyCard);

        if (overlapX < overlapY) {
          const pushDirX = dxCard >= 0 ? 1 : -1;
          state.vx += pushDirX * (overlapX * 10 + 70) * dt;
          state.wanderAngle = Math.atan2(state.vy, pushDirX * Math.abs(state.vx || 1));
        } else {
          const pushDirY = dyCard >= 0 ? 1 : -1;
          state.vy += pushDirY * (overlapY * 10 + 70) * dt;
          state.wanderAngle = Math.atan2(pushDirY * Math.abs(state.vy || 1), state.vx);
        }
      }

      // 5. Update Position
      state.x += state.vx * dt;
      state.y += state.vy * dt;

      // Hard clamp bounds as fallback
      state.x = Math.max(margin - 10, Math.min(width - margin + 10, state.x));
      state.y = Math.max(margin - 10, Math.min(height - margin + 10, state.y));

      // 6. Direct GPU Transform Update (No React re-renders = pure 60 FPS buttery smoothness)
      if (elementRef.current) {
        const half = displaySize * 0.5;
        elementRef.current.style.transform = `translate3d(${(state.x - half).toFixed(2)}px, ${(state.y - half).toFixed(2)}px, 0) rotate(${state.tilt}deg)`;
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gif.speed, gif.rotation, index]);

  const displaySize = typeof window !== 'undefined' && window.innerWidth < 640
    ? Math.min(gif.size, 85)
    : gif.size;

  return (
    <div
      ref={elementRef}
      className="absolute top-0 left-0 pointer-events-none select-none will-change-transform"
      style={{
        width: `${displaySize}px`,
        opacity: gif.opacity,
      }}
    >
      <div className={gif.direction === 'bounce' ? 'animate-bounce' : 'animate-wiggle'}>
        <CuteGif
          src={gif.url}
          alt={gif.name}
          className="w-full h-auto drop-shadow-md rounded-2xl transition-transform duration-300 pointer-events-none mix-blend-multiply"
        />
      </div>
    </div>
  );
};

export const FloatingGifsOverlay: React.FC<FloatingGifsOverlayProps> = ({
  gifs,
  currentSection,
}) => {
  const [clickPopupGif, setClickPopupGif] = useState<FloatingGifConfig | null>(null);

  // Filter GIFs for the current active section
  const activeGifs = gifs.filter((g) => {
    if (!g.visible) return false;
    // Strict requirement: floating GIFs must not appear in message background
    if (currentSection === 'message' && g.targetSection !== 'message') {
      return false;
    }
    if (g.targetSection === 'all') return true;
    return g.targetSection === currentSection;
  });

  const clickToShowGifs = activeGifs.filter((g) => g.displayMode === 'clickToShow');
  const wanderingGifs = activeGifs.filter((g) => g.displayMode !== 'clickToShow');

  return (
    <>
      {/* Non-blocking overlay container: pointer-events-none ensures buttons underneath are always clickable */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-20">
        {wanderingGifs.map((gif, index) => (
          <SmoothFloatingGif
            key={gif.id}
            gif={gif}
            index={index}
          />
        ))}
      </div>

      {/* Click-to-Show floating heart trigger icon (bottom-right) */}
      {clickToShowGifs.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={() => {
              const randomItem = clickToShowGifs[Math.floor(Math.random() * clickToShowGifs.length)];
              setClickPopupGif(randomItem);
            }}
            className="group flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-[#B33951] px-3.5 py-2 rounded-full shadow-md border border-[#FFD5DF] hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Click for a cute little surprise ♡"
          >
            <Heart className="w-4 h-4 fill-[#FF6B8B] text-[#FF6B8B] group-hover:scale-125 transition-transform animate-pulse" />
            <span className="text-xs font-medium text-[#7D3855] hidden sm:inline">
              little surprise ♡
            </span>
          </button>
        </div>
      )}

      {/* Modal popup when click-to-show heart is tapped */}
      {clickPopupGif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs transition-opacity"
          onClick={() => setClickPopupGif(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 shadow-2xl border border-[#FFD1DC] max-w-xs w-full text-center relative animate-pulse-gentle"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setClickPopupGif(null)}
              className="absolute top-3 right-3 text-[#A86478] hover:text-[#B33951] p-1 rounded-full hover:bg-[#FFF0F3]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-32 h-32 mx-auto mb-3 flex items-center justify-center">
              <CuteGif
                src={clickPopupGif.url}
                alt={clickPopupGif.name}
                className="w-full h-full object-contain rounded-2xl"
              />
            </div>

            <p className="font-serif-title text-xl text-[#B33951] italic mb-1 flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4 fill-[#FF758F] text-[#FF758F]" />
              <span>a little love for you</span>
              <Heart className="w-4 h-4 fill-[#FF758F] text-[#FF758F]" />
            </p>
            <p className="text-xs text-[#7A5867]">
              {clickPopupGif.name || 'just wanted to make you smile ♡'}
            </p>

            <button
              onClick={() => setClickPopupGif(null)}
              className="mt-4 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-[#FF758F] to-[#FF4D6D] rounded-full shadow-sm hover:opacity-90 active:scale-95"
            >
              aww, thank you ♡
            </button>
          </div>
        </div>
      )}
    </>
  );
};
