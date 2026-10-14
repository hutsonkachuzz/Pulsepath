import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { iosSpring, triggerHaptic } from '../../utils/iosMotion';

/**
 * SegmentedControl — Apple iOS-Grade Sliding Pill Selector
 * 
 * Replicates the authentic iOS UISegmentedControl:
 * - Fluid sliding background pill indicator with spring damping
 * - Subtle elevation and frosted container background
 * - Full keyboard navigation and haptic trigger
 */
export function SegmentedControl({
  options = [], // [{ value, label, icon }]
  value,
  onChange,
  size = 'md',
  className = '',
  fullWidth = false,
}) {
  const instanceId = useId();

  const sizeStyles = {
    sm: 'p-1 text-xs gap-0.5',
    md: 'p-1.5 text-xs sm:text-sm gap-1',
    lg: 'p-2 text-sm sm:text-base gap-1.5',
  };

  const itemPadding = {
    sm: 'px-2.5 py-1',
    md: 'px-3.5 py-1.5',
    lg: 'px-5 py-2',
  };

  return (
    <div
      role="tablist"
      className={`
        inline-flex items-center rounded-2xl bg-white/[0.06] backdrop-blur-xl
        border border-white/10 p-1 relative select-none
        ${fullWidth ? 'w-full flex' : ''}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.25)',
      }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={isSelected}
            onClick={() => {
              if (!isSelected) {
                triggerHaptic('light');
                onChange?.(option.value);
              }
            }}
            className={`
              relative z-10 flex items-center justify-center gap-1.5 font-medium
              transition-colors duration-200 outline-none rounded-xl
              ${fullWidth ? 'flex-1' : ''}
              ${itemPadding[size] || itemPadding.md}
              ${isSelected ? 'text-white font-semibold' : 'text-rose-200/60 hover:text-white/90'}
            `}
          >
            {/* Sliding Pill Background for Selected Item */}
            {isSelected && (
              <motion.div
                layoutId={`segmented-active-pill-${instanceId}`}
                transition={iosSpring}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600/90 to-pink-600/90 shadow-[0_2px_12px_rgba(225,29,72,0.45)] border border-white/20"
                style={{ zIndex: -1 }}
              />
            )}
            {option.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedControl;
