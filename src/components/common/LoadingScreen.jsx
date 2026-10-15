import React from 'react';
import { PulsePathLogo } from './PulsePathLogo';

/**
 * PulsePath Official Loading Component
 *
 * Implements Prompt Section 10 Requirements:
 * - Uses the official PulsePath logo
 * - Gentle heartbeat rhythm animation
 * - Very subtle romantic glow
 * - Smooth fade-in
 * - No spinning loader directly around the logo
 */
export function LoadingScreen({
  message = 'Connecting two hearts...',
  fullScreen = true,
  size = 56
}) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      {/* Heartbeat Pulsing PulsePath Logo */}
      <div className="relative flex items-center justify-center">
        {/* Soft Ambient Breathing Glow */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/25 via-rose-500/20 to-purple-600/25 blur-xl pointer-events-none transform scale-125 animate-pulse-subtle"
          aria-hidden="true"
        />

        {/* Gentle Heartbeat Logo */}
        <PulsePathLogo
          size={size}
          variant="primary"
          animated={true}
          withGlow={false}
          alt="PulsePath logo loading"
          className="relative z-10 filter drop-shadow-[0_4px_16px_rgba(255,42,122,0.4)]"
        />
      </div>

      {/* Gentle Loading Subtitle */}
      {message && (
        <p className="mt-4 text-xs sm:text-sm font-medium text-rose-200/70 tracking-wide animate-pulse-subtle">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="min-h-[100dvh] h-[100dvh] w-full bg-romantic-dark flex items-center justify-center p-4 pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
        style={{ minHeight: 'calc(var(--vh, 1vh) * 100)', height: 'calc(var(--vh, 1vh) * 100)' }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
}

export default LoadingScreen;
