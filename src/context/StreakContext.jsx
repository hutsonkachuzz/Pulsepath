import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';

const StreakContext = createContext(null);

const STORAGE_KEY = 'pulsepath_streak_state_v1';
const SNAPS_STORAGE_KEY = 'pulsepath_recent_snaps_v1';

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

const INITIAL_PARTNER_SNAP = {
  id: 'snap_partner_mikasa_1',
  sender: 'Mikasa',
  senderId: 'user_mikasa_202',
  senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  mediaUrl: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80',
  caption: 'Thinking of you during our 12-day streak! 🌸❤️',
  filter: 'sunset',
  filterCss: 'sepia(0.25) saturate(1.4) contrast(1.05)',
  showStreakStamp: true,
  streakDay: 12,
  streakEmoji: '🔥',
  timerDuration: 10,
  timerMode: '10s',
  unopened: true,
  createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  displayTime: '5m ago'
};

const INITIAL_RECENT_SNAPS = [
  INITIAL_PARTNER_SNAP,
  {
    id: 'snap_recent_2',
    sender: 'Eren',
    senderId: 'user_eren_101',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Sunset skies for my favorite person 🌅',
    filter: 'rose',
    filterCss: 'hue-rotate(-15deg) saturate(1.35) contrast(1.05)',
    showStreakStamp: true,
    streakDay: 11,
    streakEmoji: '🔥',
    timerDuration: 10,
    timerMode: '10s',
    unopened: false,
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    displayTime: 'Yesterday'
  },
  {
    id: 'snap_recent_3',
    sender: 'Mikasa',
    senderId: 'user_mikasa_202',
    mediaUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
    caption: 'Warm coffee on our rainy walk ☕🌧️',
    filter: 'vintage',
    filterCss: 'contrast(0.92) brightness(1.08) saturate(0.85) sepia(0.18)',
    showStreakStamp: true,
    streakDay: 10,
    streakEmoji: '🔥',
    timerDuration: 10,
    timerMode: '10s',
    unopened: false,
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    displayTime: '2d ago'
  }
];

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

  const [partnerSnap, setPartnerSnap] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsepath_partner_snap_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return INITIAL_PARTNER_SNAP;
  });

  const [recentSnaps, setRecentSnaps] = useState(() => {
    try {
      const saved = localStorage.getItem(SNAPS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_RECENT_SNAPS;
  });

  const [isStreakHubOpen, setIsStreakHubOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeViewingSnap, setActiveViewingSnap] = useState(null);
  const [lastSentSnapTime, setLastSentSnapTime] = useState(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streakState));
    } catch (e) {
      console.warn('Failed to persist streak state:', e);
    }
  }, [streakState]);

  useEffect(() => {
    try {
      localStorage.setItem('pulsepath_partner_snap_v1', JSON.stringify(partnerSnap));
    } catch (e) {}
  }, [partnerSnap]);

  useEffect(() => {
    try {
      localStorage.setItem(SNAPS_STORAGE_KEY, JSON.stringify(recentSnaps));
    } catch (e) {}
  }, [recentSnaps]);

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

  // Record a sent snap: increments streak, updates window, triggers confetti
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

    setLastSentSnapTime(Date.now());

    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#fb7185', '#a855f7', '#fbbf24']
      });
    } catch (e) {}
  }, []);

  // Send a new snap and add to archives
  const sendSnap = useCallback((snapPayload) => {
    recordSnapSent();

    const formattedSnap = {
      id: `snap_${Date.now()}`,
      sender: 'You',
      senderId: 'user_eren_101',
      ...snapPayload,
      displayTime: 'Just now',
      unopened: false,
    };

    setRecentSnaps((prev) => [formattedSnap, ...prev]);

    // Dispatch custom event for real-time chat listener
    window.dispatchEvent(new CustomEvent('pulsepath_snap_sent', { detail: formattedSnap }));
  }, [recordSnapSent]);

  // Open / View a Snap (marks as opened)
  const openSnap = useCallback((snap) => {
    if (!snap) return;
    setActiveViewingSnap(snap);

    // If opening partner's snap, mark as opened
    if (snap.id === partnerSnap.id || snap.unopened) {
      setPartnerSnap((prev) => ({
        ...prev,
        unopened: false,
        openedAt: Date.now()
      }));

      setRecentSnaps((prev) =>
        prev.map((s) => (s.id === snap.id ? { ...s, unopened: false, openedAt: Date.now() } : s))
      );
    }
  }, [partnerSnap.id]);

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

  // Compute partner's current snap status label
  const partnerSnapStatus = useMemo(() => {
    if (lastSentSnapTime && Date.now() - lastSentSnapTime < 120000) {
      return 'Delivered • Just now';
    }
    if (partnerSnap?.unopened) {
      return 'New Snap • Tap to open';
    }
    return 'Opened • 15m ago';
  }, [partnerSnap?.unopened, lastSentSnapTime]);

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
      partnerSnap,
      partnerSnapStatus,
      hasUnopenedSnap: Boolean(partnerSnap?.unopened),
      recentSnaps,
      openSnap,
      sendSnap,
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
      partnerSnap,
      partnerSnapStatus,
      recentSnaps,
      openSnap,
      sendSnap,
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
