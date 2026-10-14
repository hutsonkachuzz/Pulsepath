import React from 'react';

/**
 * PulsePath Official Brand Logo Component
 *
 * Requirements & Features:
 * - Represents two intertwined hearts with glowing pink/violet gradient
 * - Heartbeat/ECG line inside the heart
 * - Flowing ribbon/path forming the base
 * - Soft, glossy, realistic 3D/glass appearance
 * - Icon-only mark (no embedded text)
 * - Supports variants: primary (3D glossy), svg (vector), icon, light, dark, monochrome, watermark
 * - Heartbeat pulse animation option
 * - Always preserves original aspect ratio
 * - Accessible alt text: "PulsePath logo"
 */
export function PulsePathLogo({
  size = 40,
  variant = 'primary',
  animated = false,
  withGlow = true,
  className = '',
  alt = 'PulsePath logo',
  onClick,
  ...props
}) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // 1. Watermark Variant (Extremely subtle 5-8% opacity for romantic memory backdrops)
  if (variant === 'watermark') {
    return (
      <div
        className={`pointer-events-none select-none absolute z-0 flex items-center justify-center opacity-[0.06] ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        aria-hidden="true"
        {...props}
      >
        <img
          src="/assets/pulsepath-logo.png"
          alt=""
          className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(255,77,141,0.5)]"
          loading="lazy"
        />
      </div>
    );
  }

  // 2. Monochrome Variant (Single-color stroke/fill for high-contrast or print/minimal states)
  if (variant === 'monochrome') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${animated ? 'animate-heartbeat' : ''} ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        onClick={onClick}
        {...props}
      >
        <svg
          viewBox="0 0 128 128"
          width="100%"
          height="100%"
          fill="none"
          role="img"
          aria-label={alt}
          className="w-full h-full text-current"
        >
          {/* Outer Intertwined Heart Body */}
          <path
            d="M64 42 C58 28, 38 22, 28 34 C16 48, 24 70, 48 88 L64 100 L80 88 C104 70, 112 48, 100 34 C90 22, 70 28, 64 42 Z"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Flowing Ribbon Base */}
          <path
            d="M26 80 C26 96, 50 102, 64 91 C78 102, 102 96, 102 80 C102 68, 86 64, 64 78 C42 64, 26 68, 26 80 Z"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* ECG Line */}
          <path
            d="M28 62 L48 62 L54 50 L60 76 L66 42 L72 70 L78 62 L100 62"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 3. Vector SVG Variant (Crisp scalable gradient vector)
  if (variant === 'svg') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 transition-transform ${
          animated ? 'animate-pulse-subtle' : ''
        } ${className}`}
        style={{ width: pixelSize, height: pixelSize }}
        onClick={onClick}
        {...props}
      >
        <svg
          viewBox="0 0 128 128"
          width="100%"
          height="100%"
          fill="none"
          role="img"
          aria-label={alt}
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="svgHeartGrad" x1="10%" y1="10%" x2="90%" y2="90%">
              <stop offset="0%" stopColor="#FF6B99" />
              <stop offset="40%" stopColor="#FF2A7A" />
              <stop offset="75%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="svgEcgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFAAC5" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E9D5FF" />
            </linearGradient>
            <filter id="svgGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g filter={withGlow ? 'url(#svgGlowFilter)' : undefined}>
            {/* Flowing Lower Ribbon Path */}
            <path
              d="M26 80 C26 96, 50 102, 64 91 C78 102, 102 96, 102 80 C102 68, 86 64, 64 78 C42 64, 26 68, 26 80 Z"
              stroke="url(#svgHeartGrad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Intertwined Heart Body */}
            <path
              d="M64 42 C58 28, 38 22, 28 34 C16 48, 24 70, 48 88 L64 100 L80 88 C104 70, 112 48, 100 34 C90 22, 70 28, 64 42 Z"
              stroke="url(#svgHeartGrad)"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Central Heartbeat / ECG Wave */}
            <path
              d="M28 62 L48 62 L54 50 L60 76 L66 42 L72 70 L78 62 L100 62"
              stroke="url(#svgEcgGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    );
  }

  // 4. Primary & Icon Variants (Photorealistic 3D Glass Render)
  // Preserves exact aspect ratio, uses subtle ambient glow, perfectly rounded
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 relative select-none ${
        animated ? 'animate-heartbeat' : ''
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      onClick={onClick}
      {...props}
    >
      {/* Ambient Romantic Aura Glow (Behind Logo) */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-pink-500/25 via-rose-500/20 to-purple-600/25 blur-md -z-10 pointer-events-none transform scale-110"
          aria-hidden="true"
        />
      )}

      {/* Official 3D Glossy Heart Logo */}
      <img
        src="/assets/pulsepath-logo.png"
        alt={alt}
        className={`w-full h-full object-contain rounded-2xl transition-all duration-300 ${
          variant === 'light'
            ? 'filter drop-shadow-[0_4px_12px_rgba(255,42,122,0.35)]'
            : 'filter drop-shadow-[0_4px_16px_rgba(255,42,122,0.4)]'
        }`}
        loading="eager"
      />
    </div>
  );
}

export default PulsePathLogo;
