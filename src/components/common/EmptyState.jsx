import React from 'react';
import { PulsePathLogo } from './PulsePathLogo';

/**
 * PulsePath Official Empty State Component
 *
 * Implements Prompt Section 6 Requirements:
 * - Uses a smaller version of the official PulsePath logo
 * - Subtle opacity / gentle romantic glow
 * - Clean, non-overwhelming emotional layout
 * - Default: "Nothing here yet" & "Your story is still being written."
 */
export function EmptyState({
  title = 'Nothing here yet',
  description = 'Your story is still being written.',
  action = null,
  logoSize = 48,
  emoji = null,
  className = ''
}) {
  return (
    <div
      className={`w-full py-12 px-4 flex flex-col items-center justify-center text-center select-none relative ${className}`}
    >
      {/* Small PulsePath Logo with subtle opacity & gentle glow */}
      <div className="relative mb-3.5 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/15 via-rose-500/10 to-purple-600/15 blur-lg pointer-events-none scale-125"
          aria-hidden="true"
        />
        {emoji ? (
          <div className="relative flex items-center justify-center">
            <span className="text-3xl filter drop-shadow-[0_2px_10px_rgba(255,77,109,0.3)]">{emoji}</span>
            <div className="absolute -bottom-1 -right-1">
              <PulsePathLogo size={20} variant="primary" withGlow={false} alt="PulsePath" />
            </div>
          </div>
        ) : (
          <PulsePathLogo
            size={logoSize}
            variant="primary"
            withGlow={false}
            alt="PulsePath logo"
            className="opacity-80 filter drop-shadow-[0_2px_10px_rgba(255,77,109,0.3)] transition-opacity duration-300 hover:opacity-100"
          />
        )}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-rose-200/60 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {/* Optional Call to Action */}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
