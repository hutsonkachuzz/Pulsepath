import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { rafThrottle } from '../../utils/perfUtils';

/**
 * LivingRomanticBackground
 * 
 * Ultra-high-performance living romantic atmosphere:
 * - Hardware-accelerated canvas rendering with frame-rate independent pacing (60Hz / 120Hz / 144Hz)
 * - Optimized 2-pass particle shaders avoiding costly CPU shadowBlur rasterization
 * - RAF-throttled resize handling to eliminate layout thrashing
 * - Battery-conscious (pauses execution on background tab or reduced motion)
 * - Layer promoted to GPU compositor thread with zero layout shift
 */
function LivingRomanticBackgroundComponent() {
  const canvasRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const resizeRafRef = useRef(null);
  const particlesRef = useRef({
    hearts: [],
    stardust: [],
    ripples: []
  });

  // Check accessibility preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Optimized heart path drawing helper
  const drawHeart = (ctx, x, y, size, color, alpha, glowColor, glowSize = 0, shouldGlow = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Only apply expensive shadowBlur on prominent or user-triggered blooming hearts
    if (shouldGlow && glowSize > 0 && glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowSize;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(0, topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, size / 3, 0, size);
    // Right curve
    ctx.bezierCurveTo(size, size / 3, size / 2, -topCurveHeight, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Ultra-fast 2-pass stardust drawing without costly shadowBlur rasterization
  const drawStardust = (ctx, x, y, radius, color, alpha) => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    ctx.save();
    ctx.fillStyle = color;

    // Outer soft glow halo pass (hardware accelerated arc)
    ctx.globalAlpha = clampedAlpha * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core pass
    ctx.globalAlpha = clampedAlpha;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Create single blooming heart
  const createHeart = (w, h, initialX = null, initialY = null, isUserBloom = false) => {
    const depth = Math.random(); // 0 = far, 1 = near
    const minSize = isUserBloom ? 18 : 8;
    const maxSize = isUserBloom ? 38 : (depth > 0.7 ? 24 : (depth > 0.3 ? 16 : 10));
    const targetSize = minSize + Math.random() * (maxSize - minSize);

    // Color palette: soft rose quartz, blush, champagne gold, lavender wine
    const colorPalette = [
      { fill: '#FF758F', glow: 'rgba(255, 117, 143, 0.7)' },
      { fill: '#FF4D6D', glow: 'rgba(255, 77, 109, 0.8)' },
      { fill: '#FFA8BD', glow: 'rgba(255, 168, 189, 0.6)' },
      { fill: '#FFC8DD', glow: 'rgba(255, 200, 221, 0.5)' },
      { fill: '#E0AAFF', glow: 'rgba(224, 170, 255, 0.6)' },
      { fill: '#FFE5EC', glow: 'rgba(255, 229, 236, 0.8)' }
    ];
    const themeColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

    return {
      x: initialX !== null ? initialX : Math.random() * w,
      y: initialY !== null ? initialY : h + Math.random() * 80,
      baseX: initialX !== null ? initialX : Math.random() * w,
      size: 0, // starts at 0 to bloom
      targetSize,
      depth,
      isUserBloom,
      phase: isUserBloom ? 0 : Math.random() * Math.PI * 2, // wave offset
      driftSpeed: 0.25 + Math.random() * 0.45 * (depth + 0.5),
      swaySpeed: 0.4 + Math.random() * 0.6,
      swayWidth: 20 + Math.random() * 35,
      alpha: 0,
      maxAlpha: isUserBloom ? 0.95 : (depth > 0.7 ? 0.45 : (depth > 0.3 ? 0.3 : 0.18)),
      state: 'emerging', // 'emerging' -> 'blooming' -> 'fading'
      life: 0,
      maxLife: isUserBloom ? 240 : (450 + Math.random() * 400),
      bloomSpeed: 0.015 + Math.random() * 0.02,
      color: themeColor.fill,
      glowColor: themeColor.glow,
      glowSize: isUserBloom ? 16 : (depth > 0.75 ? 10 : 0)
    };
  };

  // Create single stardust particle
  const createStardust = (w, h) => {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: 0.75 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.5,
      pulseSpeed: 0.02 + Math.random() * 0.04,
      driftY: -0.15 - Math.random() * 0.25,
      driftX: (Math.random() - 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? '#FFE5EC' : '#FFCCD5'
    };
  };

  // Interactive Tap/Click: spawn gentle bloom ripple
  const handleInteraction = useCallback((clientX, clientY) => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newHearts = [
      createHeart(canvas.width, canvas.height, x, y - 5, true),
      createHeart(canvas.width, canvas.height, x - 15 + Math.random() * 30, y + 10, true)
    ];

    const ripple = {
      x,
      y,
      radius: 10,
      maxRadius: 80 + Math.random() * 40,
      alpha: 0.4,
      color: 'rgba(255, 117, 143, 0.4)'
    };

    particlesRef.current.hearts.push(...newHearts);
    particlesRef.current.ripples.push(ripple);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const heartCount = isMobile ? 16 : 28;
    const stardustCount = isMobile ? 22 : 44;

    // Initialize particles
    particlesRef.current.hearts = Array.from({ length: heartCount }, () =>
      createHeart(width, height)
    );
    particlesRef.current.stardust = Array.from({ length: stardustCount }, () =>
      createStardust(width, height)
    );

    // RAF-throttled resize to avoid layout thrashing on browser window adjust
    const throttledResize = rafThrottle(() => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('resize', throttledResize);

    // Window click listener for tap interaction
    const onWindowClick = (e) => handleInteraction(e.clientX, e.clientY);
    window.addEventListener('pointerdown', onWindowClick, { passive: true });

    // Animation Loop with delta time scaling for 120Hz/144Hz monitors
    let running = true;

    const render = (now) => {
      if (!running) return;
      // Normalize dt to 60fps base scale (1.0 at 60fps, 0.5 at 120fps, 0.41 at 144fps)
      const elapsed = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;
      const speedScale = elapsed * 60;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw ripples
      const ripples = particlesRef.current.ripples;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.8 * speedScale;
        r.alpha -= 0.008 * speedScale;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, r.alpha);
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 2. Draw Stardust particles
      const stardust = particlesRef.current.stardust;
      for (let i = 0; i < stardust.length; i++) {
        const s = stardust[i];
        s.y += s.driftY * speedScale;
        s.x += (s.driftX + Math.sin(now * 0.001 + s.phase) * 0.15) * speedScale;
        s.phase += s.pulseSpeed * speedScale;

        const currentAlpha = Math.sin(s.phase) * 0.25 + s.alpha;

        if (s.y < -10) s.y = height + 10;
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        drawStardust(ctx, s.x, s.y, s.radius, s.color, currentAlpha);
      }

      // 3. Draw and update Blooming Hearts
      const hearts = particlesRef.current.hearts;
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.life += speedScale;

        // Lifecycle state machine: emerging -> blooming -> fading
        if (h.state === 'emerging') {
          h.size += (h.targetSize - h.size) * h.bloomSpeed * 2.5 * speedScale;
          h.alpha += (h.maxAlpha - h.alpha) * 0.04 * speedScale;
          if (h.size >= h.targetSize * 0.9) {
            h.state = 'blooming';
          }
        } else if (h.state === 'blooming') {
          const pulse = Math.sin(now * 0.002 + h.phase) * (h.targetSize * 0.08);
          h.size = h.targetSize + pulse;

          if (h.life > h.maxLife * 0.75) {
            h.state = 'fading';
          }
        } else if (h.state === 'fading') {
          h.alpha -= 0.006 * speedScale;
          h.size += 0.05 * speedScale;
        }

        h.y -= h.driftSpeed * speedScale;
        h.x = h.baseX + Math.sin(now * 0.0008 * h.swaySpeed + h.phase) * h.swayWidth;

        if (h.alpha <= 0 || h.y < -50) {
          if (hearts.length > heartCount) {
            hearts.splice(i, 1);
            continue;
          } else {
            Object.assign(h, createHeart(width, height));
          }
        }

        drawHeart(
          ctx,
          h.x,
          h.y,
          Math.max(1, h.size),
          h.color,
          h.alpha,
          h.glowColor,
          h.glowSize,
          h.isUserBloom || h.depth > 0.75
        );
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Pause on hidden document (tab switch)
    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      } else {
        running = true;
        lastTimeRef.current = performance.now();
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      throttledResize.cancel && throttledResize.cancel();
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('pointerdown', onWindowClick);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [prefersReducedMotion, handleInteraction]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none will-change-[transform,opacity]"
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
      aria-hidden="true"
    >
      {/* 1. Base Luxury Romantic Gradient Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#18051C] via-[#220726] via-[#1A0624] to-[#120316]" />

      {/* 2. Soft Fluid Radial Glowing Light Meshes (GPU promoted) */}
      <div
        className="absolute -top-[15%] left-1/4 w-[600px] h-[600px] rounded-full bg-rose-600/[0.14] blur-[120px] pointer-events-none animate-pulse-subtle"
        style={{ transform: 'translateZ(0)', willChange: 'opacity' }}
      />
      <div
        className="absolute top-1/3 -right-[10%] w-[550px] h-[550px] rounded-full bg-purple-600/[0.12] blur-[140px] pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      />
      <div
        className="absolute bottom-[5%] left-[-5%] w-[650px] h-[650px] rounded-full bg-rose-900/[0.22] blur-[130px] pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      />
      <div
        className="absolute top-2/3 right-1/4 w-[450px] h-[450px] rounded-full bg-pink-500/[0.1] blur-[110px] pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      />

      {/* 3. Subtle Vignette Depth Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(10,2,12,0.65)_100%)] pointer-events-none" />

      {/* 4. Living Blooming Hearts & Stardust Canvas */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
        />
      )}
    </div>
  );
}

export const LivingRomanticBackground = memo(LivingRomanticBackgroundComponent);
