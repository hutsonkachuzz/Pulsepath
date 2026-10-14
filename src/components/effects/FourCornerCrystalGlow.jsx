import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FourCornerCrystalGlow
 *
 * Subtle 4-Corner Crystal Glow Entry Effect:
 * - Gently pulses and blows shimmering crystal light from all four corners simultaneously
 * - Strictly NO paper-folding and NO chunky star shapes
 * - Clean, elegant diamond-facet needle glints and soft iridescent crystal blooms
 * - 60fps+ hardware accelerated (transform, opacity, will-change, translateZ(0))
 * - Automatically unmounts after completion to leave zero DOM or GPU footprint
 */
export function FourCornerCrystalGlow({ forceTrigger = false, onComplete }) {
  const [active, setActive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if entered from login action via sessionStorage or navigation state
    const hasSessionFlag = sessionStorage.getItem('pulsepath_crystal_corner_glow') === 'true';
    const hasNavState = location.state?.crystalEntry === true;

    if (hasSessionFlag || hasNavState || forceTrigger) {
      sessionStorage.removeItem('pulsepath_crystal_corner_glow');
      setActive(true);

      const timer = setTimeout(() => {
        setActive(false);
        if (onComplete) onComplete();
      }, 2350);

      return () => clearTimeout(timer);
    }
  }, [location.state, forceTrigger, onComplete]);

  // Support custom event for developer testing/preview
  useEffect(() => {
    const handleCustomTrigger = () => {
      setActive(true);
      setTimeout(() => setActive(false), 2350);
    };

    window.addEventListener('pulsepath:trigger-crystal-glow', handleCustomTrigger);
    return () => window.removeEventListener('pulsepath:trigger-crystal-glow', handleCustomTrigger);
  }, []);

  if (!active) return null;

  return (
    <AnimatePresence>
      {active && (
        <div
          className="fixed inset-0 pointer-events-none z-[100] overflow-hidden will-change-[transform,opacity]"
          style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
          aria-hidden="true"
        >
          {/* ============================================================== */}
          {/* CORNER 1: TOP-LEFT (Blowing diagonally Down-Right: +X, +Y)      */}
          {/* ============================================================== */}
          <div className="absolute top-0 left-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none">
            {/* Soft Crystalline Radial Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0, 0.75, 0.85, 0.45, 0],
                scale: [0.7, 1.1, 1.25, 1.4]
              }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-br-full will-change-[transform,opacity]"
              style={{
                background:
                  'radial-gradient(circle at 0% 0%, rgba(255,255,255,0.7) 0%, rgba(255,190,225,0.38) 22%, rgba(200,225,255,0.24) 45%, rgba(230,195,255,0.1) 68%, transparent 85%)',
                filter: 'blur(22px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Inward Fluid Wind Breeze Wave (Top-Left -> Center) */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0.6, 0],
                x: [0, 20, 55, 80],
                y: [0, 20, 55, 80],
                scale: [0.8, 1.08, 1.22, 1.35],
                skewX: [0, -6, 4, 0]
              }}
              transition={{ duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-0 w-64 h-64 pointer-events-none will-change-[transform,opacity]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,182,210,0.28) 28%, rgba(210,230,255,0.16) 52%, transparent 75%)',
                filter: 'blur(16px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Fine Diamond Needle Glint (Non-chunky, clean crystal shimmer) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: 0, x: 20, y: 20 }}
              animate={{
                opacity: [0, 0.95, 0.85, 0],
                scale: [0.4, 1.15, 0.9, 0],
                rotate: [0, 20, 35],
                x: [20, 32, 48],
                y: [20, 32, 48]
              }}
              transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="absolute top-6 left-6 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
            >
              {/* Horizontal needle ray */}
              <div
                className="absolute h-[1px] w-14 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              {/* Vertical needle ray */}
              <div
                className="absolute w-[1px] h-14 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              {/* Diamond facet core */}
              <div
                className="w-2 h-2 rotate-45 bg-white border border-rose-200 shadow-[0_0_12px_rgba(255,255,255,1)]"
              />
            </motion.div>

            {/* Secondary delicate crystal sparkle mote drifting inward */}
            <motion.div
              initial={{ opacity: 0, x: 45, y: 15 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [45, 65, 85],
                y: [15, 35, 55],
                scale: [0.6, 1.2, 0.4]
              }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
              className="absolute top-4 left-4 w-1.5 h-1.5 rotate-45 bg-white rounded-[1px] shadow-[0_0_10px_#ffffff] will-change-[transform,opacity]"
            />
          </div>

          {/* ============================================================== */}
          {/* CORNER 2: TOP-RIGHT (Blowing diagonally Down-Left: -X, +Y)     */}
          {/* ============================================================== */}
          <div className="absolute top-0 right-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none">
            {/* Soft Crystalline Radial Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0, 0.75, 0.85, 0.45, 0],
                scale: [0.7, 1.1, 1.25, 1.4]
              }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-bl-full will-change-[transform,opacity]"
              style={{
                background:
                  'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.7) 0%, rgba(255,190,225,0.38) 22%, rgba(200,225,255,0.24) 45%, rgba(230,195,255,0.1) 68%, transparent 85%)',
                filter: 'blur(22px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Inward Fluid Wind Breeze Wave (Top-Right -> Center) */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0.6, 0],
                x: [0, -20, -55, -80],
                y: [0, 20, 55, 80],
                scale: [0.8, 1.08, 1.22, 1.35],
                skewX: [0, 6, -4, 0]
              }}
              transition={{ duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 w-64 h-64 pointer-events-none will-change-[transform,opacity]"
              style={{
                background:
                  'linear-gradient(225deg, rgba(255,255,255,0.45) 0%, rgba(255,182,210,0.28) 28%, rgba(210,230,255,0.16) 52%, transparent 75%)',
                filter: 'blur(16px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Fine Diamond Needle Glint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: 0, x: -20, y: 20 }}
              animate={{
                opacity: [0, 0.95, 0.85, 0],
                scale: [0.4, 1.15, 0.9, 0],
                rotate: [0, -20, -35],
                x: [-20, -32, -48],
                y: [20, 32, 48]
              }}
              transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="absolute top-6 right-6 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
            >
              <div
                className="absolute h-[1px] w-14 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="absolute w-[1px] h-14 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="w-2 h-2 rotate-45 bg-white border border-rose-200 shadow-[0_0_12px_rgba(255,255,255,1)]"
              />
            </motion.div>

            {/* Secondary delicate crystal sparkle mote */}
            <motion.div
              initial={{ opacity: 0, x: -45, y: 15 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [-45, -65, -85],
                y: [15, 35, 55],
                scale: [0.6, 1.2, 0.4]
              }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
              className="absolute top-4 right-4 w-1.5 h-1.5 rotate-45 bg-white rounded-[1px] shadow-[0_0_10px_#ffffff] will-change-[transform,opacity]"
            />
          </div>

          {/* ============================================================== */}
          {/* CORNER 3: BOTTOM-LEFT (Blowing diagonally Up-Right: +X, -Y)    */}
          {/* ============================================================== */}
          <div className="absolute bottom-0 left-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none">
            {/* Soft Crystalline Radial Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0, 0.75, 0.85, 0.45, 0],
                scale: [0.7, 1.1, 1.25, 1.4]
              }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-tr-full will-change-[transform,opacity]"
              style={{
                background:
                  'radial-gradient(circle at 0% 100%, rgba(255,255,255,0.7) 0%, rgba(255,190,225,0.38) 22%, rgba(200,225,255,0.24) 45%, rgba(230,195,255,0.1) 68%, transparent 85%)',
                filter: 'blur(22px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Inward Fluid Wind Breeze Wave (Bottom-Left -> Center) */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0.6, 0],
                x: [0, 20, 55, 80],
                y: [0, -20, -55, -80],
                scale: [0.8, 1.08, 1.22, 1.35],
                skewX: [0, 6, -4, 0]
              }}
              transition={{ duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none will-change-[transform,opacity]"
              style={{
                background:
                  'linear-gradient(45deg, rgba(255,255,255,0.45) 0%, rgba(255,182,210,0.28) 28%, rgba(210,230,255,0.16) 52%, transparent 75%)',
                filter: 'blur(16px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Fine Diamond Needle Glint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: 0, x: 20, y: -20 }}
              animate={{
                opacity: [0, 0.95, 0.85, 0],
                scale: [0.4, 1.15, 0.9, 0],
                rotate: [0, -20, -35],
                x: [20, 32, 48],
                y: [-20, -32, -48]
              }}
              transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="absolute bottom-6 left-6 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
            >
              <div
                className="absolute h-[1px] w-14 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="absolute w-[1px] h-14 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="w-2 h-2 rotate-45 bg-white border border-rose-200 shadow-[0_0_12px_rgba(255,255,255,1)]"
              />
            </motion.div>

            {/* Secondary delicate crystal sparkle mote */}
            <motion.div
              initial={{ opacity: 0, x: 45, y: -15 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [45, 65, 85],
                y: [-15, -35, -55],
                scale: [0.6, 1.2, 0.4]
              }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
              className="absolute bottom-4 left-4 w-1.5 h-1.5 rotate-45 bg-white rounded-[1px] shadow-[0_0_10px_#ffffff] will-change-[transform,opacity]"
            />
          </div>

          {/* ============================================================== */}
          {/* CORNER 4: BOTTOM-RIGHT (Blowing diagonally Up-Left: -X, -Y)   */}
          {/* ============================================================== */}
          <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-96 sm:h-96 pointer-events-none">
            {/* Soft Crystalline Radial Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{
                opacity: [0, 0.75, 0.85, 0.45, 0],
                scale: [0.7, 1.1, 1.25, 1.4]
              }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-tl-full will-change-[transform,opacity]"
              style={{
                background:
                  'radial-gradient(circle at 100% 100%, rgba(255,255,255,0.7) 0%, rgba(255,190,225,0.38) 22%, rgba(200,225,255,0.24) 45%, rgba(230,195,255,0.1) 68%, transparent 85%)',
                filter: 'blur(22px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Inward Fluid Wind Breeze Wave (Bottom-Right -> Center) */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.7, 0.6, 0],
                x: [0, -20, -55, -80],
                y: [0, -20, -55, -80],
                scale: [0.8, 1.08, 1.22, 1.35],
                skewX: [0, -6, 4, 0]
              }}
              transition={{ duration: 2.05, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none will-change-[transform,opacity]"
              style={{
                background:
                  'linear-gradient(315deg, rgba(255,255,255,0.45) 0%, rgba(255,182,210,0.28) 28%, rgba(210,230,255,0.16) 52%, transparent 75%)',
                filter: 'blur(16px)',
                transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden'
              }}
            />

            {/* Fine Diamond Needle Glint */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4, rotate: 0, x: -20, y: -20 }}
              animate={{
                opacity: [0, 0.95, 0.85, 0],
                scale: [0.4, 1.15, 0.9, 0],
                rotate: [0, 20, 35],
                x: [-20, -32, -48],
                y: [-20, -32, -48]
              }}
              transition={{ duration: 1.85, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="absolute bottom-6 right-6 flex items-center justify-center will-change-[transform,opacity]"
              style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
            >
              <div
                className="absolute h-[1px] w-14 bg-gradient-to-r from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="absolute w-[1px] h-14 bg-gradient-to-b from-transparent via-white to-transparent"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.9), 0 0 14px rgba(255,180,215,0.6)' }}
              />
              <div
                className="w-2 h-2 rotate-45 bg-white border border-rose-200 shadow-[0_0_12px_rgba(255,255,255,1)]"
              />
            </motion.div>

            {/* Secondary delicate crystal sparkle mote */}
            <motion.div
              initial={{ opacity: 0, x: -45, y: -15 }}
              animate={{
                opacity: [0, 0.8, 0],
                x: [-45, -65, -85],
                y: [-15, -35, -55],
                scale: [0.6, 1.2, 0.4]
              }}
              transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
              className="absolute bottom-4 right-4 w-1.5 h-1.5 rotate-45 bg-white rounded-[1px] shadow-[0_0_10px_#ffffff] will-change-[transform,opacity]"
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
