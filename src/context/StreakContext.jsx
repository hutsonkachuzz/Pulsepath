import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';

const StreakContext = createContext(null);

const STORAGE_KEY = 'pulsepath_streak_state_v1';

export const STREAK_EMOJIS = [
  { id: 'fire', emoji: '🔥', label: 'Flame', glow: 'from-amber-500 to-rose-500' },
  { id: 'heart', emoji: '💖', label: 'Sparkle Heart', glow: 'from-pink-500 to-rose-500' },
  { id: 'spark', emoji: '⚡', label: 'Lightning', glow: 'from-yellow-400 to-amber-500' },
  { id: 'sakura', emoji: '🌸', label: 'Sakura', glow: 'from-pink-400 to-purple-400' },
  { id: 'infinity', emoji: '♾️', label: 'Forever', glow: 'from-purple-500 to-indigo-500' },
  { id: 'moon', emoji: '🌙', label: 'Crescent', glow: 'from-indigo-400 to-violet-500' },
];

export const STREAK_GLOW_COLORS = [
  { id: 'rose', name: 'Romantic Rose', hex: '#f43f5e', class: 'shadow-[0_0_16px_rgba(244,63,94,0.6)] border-rose-500/40 text-rose-300' },
  { id: 'amber', name: 'Fire Amber', hex: '#f59e0b', class: 'shadow-[0_0_16px_rgba(245,158,11,0.6)] border-amber-500/40 text-amber-300' },
  { id: 'purple', name: 'Cyber Neon', hex: '#a855f7', class: 'shadow-[0_0_16px_rgba(168,85,247,0.6)] border-purple-500/40 text-purple-300' },
  { id: 'emerald', name: 'Mint Emerald', hex: '#10b981', class: 'shadow-[0_0_16px_rgba(16,185,129,0.6)] border-emerald-500/40 text-emerald-300' },
  { id: 'cyan', name: 'Electric Cyan', hex: '#06b6d4', class: 'shadow-[0_0_16px_rgba(6,182,212,0.6)] border-cyan-500/40 text-cyan-300' },
];

const DEFAULT_STREAK_STATE = {
  streakCount: 12,
  bestStreak: 24,
  streakEmoji: '🔥',
  streakGlowColor: 'rose',
  startDate: 'Oct 9, 2024',
  lastActivityTimestamp: Date.now() - (6 * 3600 * 1000), // 6 hours ago
  restoresRemaining: 1,
  snapsSentToday: 1,
};

export function StreakProvider({ children }) {
  const [streakState, setStreakState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STREAK_STATE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load streak state:', e);
    }
    return DEFAULT_STREAK_STATE;
  });

  const [isStreakHubOpen, setIsStreakHubOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeViewingSnap, setActiveViewingSnap] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streakState));
    } catch (e) {
      console.warn('Failed to persist streak state:', e);
    }
  }, [streakState]);

  // Compute 24-hour expiration window
  const windowInfo = useMemo(() => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - (streakState.lastActivityTimestamp || Date.now());
    const remainingMs = Math.max(0, TWENTY_FOUR_HOURS - elapsed);
    const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const isExpiringSoon = hoursRemaining < 4; // < 4 hours warning: shows ⌛
    const isBroken = remainingMs === 0;

    return {
      remainingMs,
      hoursRemaining,
      minutesRemaining,
      isExpiringSoon,
      isBroken,
      percentRemaining: Math.min(100, Math.max(0, (remainingMs / TWENTY_FOUR_HOURS) * 100)),
    };
  }, [streakState.lastActivityTimestamp]);

  // Record a sent snap or message: maintains or increments streak
  const recordSnapSent = useCallback(() => {
    setStreakState((prev) => {
      const now = Date.now();
      const newCount = prev.streakCount + 1;
      const newBest = Math.max(prev.bestStreak, newCount);

      return {
        ...prev,
        streakCount: newCount,
        bestStreak: newBest,
        lastActivityTimestamp: now,
        snapsSentToday: (prev.snapsSentToday || 0) + 1,
      };
    });

    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fb7185', '#a855f7', '#fbbf24']
      });
    } catch (e) {}
  }, []);

  // Customize Streak Emoji
  const setStreakEmoji = useCallback((emoji) => {
    setStreakState((prev) => ({ ...prev, streakEmoji: emoji }));
  }, []);

  // Customize Streak Glow Color
  const setStreakGlowColor = useCallback((colorId) => {
    setStreakState((prev) => ({ ...prev, streakGlowColor: colorId }));
  }, []);

  // Restore Streak (1 free per month)
  const restoreStreak = useCallback(() => {
    if (streakState.restoresRemaining <= 0) return false;

    setStreakState((prev) => ({
      ...prev,
      streakCount: Math.max(prev.streakCount, prev.bestStreak),
      lastActivityTimestamp: Date.now(),
      restoresRemaining: Math.max(0, prev.restoresRemaining - 1),
    }));

    try {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981']
      });
    } catch (e) {}

    return true;
  }, [streakState.restoresRemaining, streakState.bestStreak, streakState.streakCount]);

  const value = useMemo(
    () => ({
      streakCount: streakState.streakCount,
      bestStreak: streakState.bestStreak,
      streakEmoji: streakState.streakEmoji,
      streakGlowColor: streakState.streakGlowColor,
      startDate: streakState.startDate,
      lastActivityTimestamp: streakState.lastActivityTimestamp,
      restoresRemaining: streakState.restoresRemaining,
      windowInfo,
      isStreakHubOpen,
      setIsStreakHubOpen,
      openStreakHub: () => setIsStreakHubOpen(true),
      closeStreakHub: () => setIsStreakHubOpen(false),
      isCameraOpen,
      setIsCameraOpen,
      openCamera: () => setIsCameraOpen(true),
      closeCamera: () => setIsCameraOpen(false),
      activeViewingSnap,
      setActiveViewingSnap,
      recordSnapSent,
      setStreakEmoji,
      setStreakGlowColor,
      restoreStreak,
    }),
    [
      streakState,
      windowInfo,
      isStreakHubOpen,
      isCameraOpen,
      activeViewingSnap,
      recordSnapSent,
      setStreakEmoji,
      setStreakGlowColor,
      restoreStreak,
    ]
  );

  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
