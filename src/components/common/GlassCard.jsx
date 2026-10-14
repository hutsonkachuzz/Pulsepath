import React from 'react';

export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glow = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        liquid-glass relative overflow-hidden
        ${hoverEffect ? 'liquid-glass-interactive cursor-pointer' : ''}
        ${glow ? 'border-rose-500/40 shadow-liquid-glow ring-1 ring-rose-500/25' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Specular fluid light reflection sweep */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-transparent to-rose-500/[0.03] pointer-events-none rounded-[inherit]" />

      {glow && (
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/25 rounded-full blur-2xl pointer-events-none animate-pulse-subtle" />
      )}

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}
