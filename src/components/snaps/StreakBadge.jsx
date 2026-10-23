import React from 'react';
import { motion } from 'framer-motion';
import { useStreak, STREAK_GLOW_COLORS } from '../../context/StreakContext';

export function StreakBadge({ size = 'md', className = '', showLabel = false }) {
  const { streakCount, streakEmoji, streakGlowColor, windowInfo, openStreakHub } = useStreak();

  const glowConfig = STREAK_GLOW_COLORS.find((c) => c.id === streakGlowColor) || STREAK_GLOW_COLORS[0];
  const isExpiring = windowInfo.isExpiringSoon;

  const displayEmoji = isExpiring ? '⌛' : streakEmoji;

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-2'
  }[size] || 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      onClick={(e) => {
        e.stopPropagation();
        openStreakHub();
      }}
      className={`
        inline-flex items-center rounded-full font-bold select-none cursor-pointer transition-all duration-200
        ${size === 'sm' ? 'bg-[#1e0a2e] border border-purple-400/40 text-purple-200 shadow-sm' : `bg-[#1b0a2c]/90 border backdrop-blur-xl ${glowConfig.class}`}
        ${sizeStyles} ${className}
      `}
      title={
        isExpiring
          ? `Streak expiring soon! ${windowInfo.hoursRemaining}h ${windowInfo.minutesRemaining}m remaining`
          : `Active ${streakCount}-day streak! Tap to customize.`
      }
      aria-label={`Streak: ${streakCount} days with ${streakEmoji}`}
    >
      <span className={`inline-block ${isExpiring ? 'animate-bounce' : 'animate-pulse'}`}>
        {displayEmoji}
      </span>
      <span className="font-extrabold tracking-tight text-white font-mono">
        {streakCount}
      </span>
      {showLabel && (
        <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-300/80">
          Streak
        </span>
      )}
    </motion.button>
  );
}
