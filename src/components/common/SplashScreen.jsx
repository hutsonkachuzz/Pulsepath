import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PulsePathLogo } from './PulsePathLogo';

/**
 * PulsePath Official App Splash Screen
 *
 * Implements Prompt Section 1 Requirements:
 * - Full-screen soft romantic background with gentle ambient gradients
 * - Centered official PulsePath logo (large, comfortable breathing room)
 * - Subtle ambient glow aura around logo
 * - Floating effect above background with soft reflection light underneath
 * - Brand wordmark: "PulsePath" in clean, modern, slightly bold rounded sans-serif font
 * - Secondary subtle tagline: "Our journey, day by day."
 * - Smooth sequential animation:
 *   1. Background fades in
 *   2. Logo softly fades in
 *   3. Logo performs subtle scale animation
 *   4. Small glow appears around logo
 *   5. Logo settles into final position
 *   6. Smooth transition into the app
 */
export function SplashScreen({ onFinish, minDuration = 2200 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onFinish) {
        setTimeout(onFinish, 600); // Allow exit animation to complete
      }
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="pulsepath-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#140518] via-[#1a0823] to-[#0f0413] overflow-hidden select-none"
        >
          {/* Soft Romantic Ambient Background Lights */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-600/15 via-rose-500/10 to-violet-600/15 blur-3xl" />
            <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-b from-purple-600/10 to-transparent blur-2xl" />
          </div>

          {/* Centered Logo Container with Floating Effect & Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.15
            }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Soft Ambient Glow Halo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.75, scale: 1.12 }}
              transition={{ duration: 1.4, delay: 0.35, ease: 'easeOut' }}
              className="absolute w-44 h-44 rounded-full bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-purple-600/30 blur-2xl pointer-events-none"
            />

            {/* Floating PulsePath Logo (140px on mobile, 160px on desktop) */}
            <motion.div
              animate={{
                y: [0, -6, 0]
              }}
              transition={{
                duration: 3.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.1
              }}
              className="relative z-10"
            >
              <PulsePathLogo
                size={144}
                variant="primary"
                withGlow={false}
                alt="PulsePath logo"
                className="filter drop-shadow-[0_12px_30px_rgba(255,42,122,0.45)]"
              />
            </motion.div>

            {/* Soft Light / Reflection Beneath Logo */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.7 }}
              animate={{ opacity: 0.6, scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
              className="w-32 h-3.5 mt-3 rounded-full bg-gradient-to-r from-transparent via-rose-500/25 to-transparent blur-sm pointer-events-none"
            />

            {/* Brand Wordmark & Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55, ease: 'easeOut' }}
              className="mt-6 text-center"
            >
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                PulsePath
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.75 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="mt-2 text-xs sm:text-sm text-rose-200/75 font-normal tracking-wide"
              >
                Our journey, day by day.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SplashScreen;
