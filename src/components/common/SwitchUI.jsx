import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { iosSnappy, triggerHaptic } from '../../utils/iosMotion';

/**
 * SwitchUI — Apple iOS-Grade Fluid Toggle Switch
 * 
 * Replicates the authentic iOS UISwitch interaction physics:
 * - Fluid spring sliding animation
 * - Dynamic pill thumb elongation on press/hold (iOS thumb stretching)
 * - Accessible keyboard & screen reader support (role="switch")
 * - Tactile romantic glows and optional haptic feedback
 */
export function SwitchUI({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'rose',
  iconOn,
  iconOff,
  className = '',
  id,
}) {
  const [isPressed, setIsPressed] = useState(false);

  // Size dimensions matching Apple iOS proportions
  const sizeMap = {
    sm: {
      track: 'w-9 h-5 p-0.5',
      thumb: 'w-4 h-4',
      travel: 16,
      stretch: 'w-5',
    },
    md: {
      track: 'w-[52px] h-[31px] p-[2px]',
      thumb: 'w-[27px] h-[27px]',
      travel: 21,
      stretch: 'w-[32px]',
    },
    lg: {
      track: 'w-16 h-9 p-1',
      thumb: 'w-7 h-7',
      travel: 28,
      stretch: 'w-9',
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Track colors
  const activeColorMap = {
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-[0_0_16px_rgba(244,63,94,0.45)]',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_16px_rgba(16,185,129,0.45)]',
    indigo: 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_16px_rgba(99,102,241,0.45)]',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_16px_rgba(245,158,11,0.45)]',
  };

  const inactiveTrack = 'bg-white/15 dark:bg-white/10 hover:bg-white/20 border border-white/10';

  const handleToggle = () => {
    if (disabled) return;
    triggerHaptic('light');
    onChange?.(!checked);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const switchButton = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        relative inline-flex items-center shrink-0 rounded-full cursor-pointer
        transition-colors duration-250 ease-out select-none outline-none
        focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0813]
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${checked ? activeColorMap[color] || activeColorMap.rose : inactiveTrack}
        ${currentSize.track}
        ${className}
      `}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* iOS Spring Thumb */}
      <motion.div
        animate={{
          x: checked ? currentSize.travel : 0,
          width: isPressed
            ? (size === 'sm' ? 20 : size === 'lg' ? 36 : 32)
            : (size === 'sm' ? 16 : size === 'lg' ? 28 : 27),
        }}
        transition={iosSnappy}
        className={`
          ${currentSize.thumb}
          rounded-full bg-white shadow-md flex items-center justify-center
          pointer-events-none text-[#0B0813]
        `}
        style={{
          boxShadow: '0 2px 5px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.2)',
          willChange: 'transform, width',
        }}
      >
        {checked && iconOn && (
          <span className="text-[10px] leading-none select-none">{iconOn}</span>
        )}
        {!checked && iconOff && (
          <span className="text-[10px] leading-none select-none text-gray-400">{iconOff}</span>
        )}
      </motion.div>
    </button>
  );

  if (!label && !description) {
    return switchButton;
  }

  return (
    <div
      onClick={handleToggle}
      className={`
        flex items-center justify-between gap-4 py-2 px-1 rounded-xl
        transition-colors cursor-pointer select-none
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/[0.03]'}
      `}
    >
      <div className="flex-1 pr-2">
        {label && (
          <div className="text-sm font-medium text-white tracking-wide">
            {label}
          </div>
        )}
        {description && (
          <div className="text-xs text-rose-200/60 mt-0.5 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <div>{switchButton}</div>
    </div>
  );
}
export default SwitchUI;
