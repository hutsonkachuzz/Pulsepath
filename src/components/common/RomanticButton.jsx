import React from 'react';

export function RomanticButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  pulse = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  }[size] || "px-4 py-2.5 text-sm gap-2";

  const variantClasses = {
    primary: "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white shadow-liquid-glow hover:shadow-glow-lg hover:from-rose-400 hover:to-rose-500 border border-white/25 overflow-hidden",
    secondary: "liquid-glass text-white hover:border-rose-400/50 border border-white/15 backdrop-blur-md",
    liquid: "liquid-glass text-rose-100 hover:text-white border border-rose-400/30 hover:border-rose-400/60 shadow-liquid hover:shadow-liquid-hover backdrop-blur-lg",
    ghost: "bg-transparent text-rose-300 hover:text-white hover:bg-white/[0.06] border border-transparent",
    gold: "bg-gradient-to-r from-amber-400 to-amber-600 text-stone-900 font-semibold shadow-glow-gold hover:brightness-110",
    danger: "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30"
  }[variant] || "bg-gradient-to-r from-rose-500 to-rose-600 text-white";

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseClasses}
        ${sizeClasses}
        ${variantClasses}
        ${pulse ? 'animate-pulse-subtle' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Specular button top rim */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-white/25 pointer-events-none rounded-t-[inherit]" />

      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
