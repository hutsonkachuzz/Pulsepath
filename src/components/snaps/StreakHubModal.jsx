import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, ShieldAlert, Sparkles, RefreshCw, Camera, Clock, Trophy, Calendar } from 'lucide-react';
import { useStreak, STREAK_EMOJIS, STREAK_GLOW_COLORS } from '../../context/StreakContext';

export function StreakHubModal() {
  const {
    streakCount,
    bestStreak,
    startDate,
    streakEmoji,
    streakGlowColor,
    windowInfo,
    isStreakHubOpen,
    closeStreakHub,
    setStreakEmoji,
    setStreakGlowColor,
    restoreStreak,
    restoresRemaining,
    openCamera
  } = useStreak();

  const [restoreStatus, setRestoreStatus] = useState(null);

  if (!isStreakHubOpen) return null;

  const activeGlow = STREAK_GLOW_COLORS.find((c) => c.id === streakGlowColor) || STREAK_GLOW_COLORS[0];

  const handleRestore = () => {
    const success = restoreStreak();
    if (success) {
      setRestoreStatus('Streak successfully restored! ❤️');
      setTimeout(() => setRestoreStatus(null), 4000);
    } else {
      setRestoreStatus('No streak restores remaining this month.');
      setTimeout(() => setRestoreStatus(null), 3000);
    }
  };

  const handleLaunchCamera = () => {
    closeStreakHub();
    openCamera();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStreakHub}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[390px] rounded-[32px] bg-[#150a24]/95 border border-rose-500/30 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(244,63,94,0.3)] backdrop-blur-2xl overflow-hidden text-white"
          style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
        >
          {/* Ambient Top Glow */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-35 pointer-events-none"
            style={{ backgroundColor: activeGlow.hex }}
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Streak Hub & Badges</h3>
                <p className="text-[10px] text-rose-300/70">Our daily spark of love</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeStreakHub}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-4 space-y-4 max-h-[72vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden relative z-10">
            {/* Massive Hero Streak Counter Card */}
            <div className={`p-4 rounded-2xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 flex flex-col items-center text-center relative overflow-hidden ${activeGlow.class}`}>
              <div className="text-5xl sm:text-6xl mb-1 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-pulse">
                {windowInfo.isExpiringSoon ? '⌛' : streakEmoji}
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {streakCount} <span className="text-sm font-medium text-rose-200 uppercase tracking-widest font-sans">Days</span>
              </div>
              <p className="text-[11px] text-rose-200/80 mt-1">
                {windowInfo.isExpiringSoon
                  ? `🔥 Expiring in ${windowInfo.hoursRemaining}h ${windowInfo.minutesRemaining}m! Send a snap now.`
                  : 'Your love flame is burning bright! Keep it alive daily.'}
              </p>

              {/* 24-Hour Expiration Progress Bar */}
              <div className="w-full mt-3">
                <div className="flex items-center justify-between text-[10px] text-white/60 mb-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-rose-400" />
                    {windowInfo.hoursRemaining}h {windowInfo.minutesRemaining}m left
                  </span>
                  <span>24h Window</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${windowInfo.percentRemaining}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>

            {/* Streak Records Stats */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                  <Trophy className="w-3 h-3" />
                  <span>Best Streak</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{bestStreak} Days</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-1.5 text-purple-300 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>Started On</span>
                </div>
                <div className="text-xs font-semibold text-white/90 truncate">{startDate}</div>
              </div>
            </div>

            {/* 1. Custom Emoji Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Select Streak Emoji Badge</span>
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {STREAK_EMOJIS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStreakEmoji(item.emoji)}
                    className={`
                      h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer active:scale-90
                      ${streakEmoji === item.emoji
                        ? 'bg-rose-500/30 border-2 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)] scale-105'
                        : 'bg-white/[0.05] border border-white/10 hover:bg-white/[0.1]'
                      }
                    `}
                    title={item.label}
                  >
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Custom Neon Glow Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-rose-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Neon Glow Aura</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {STREAK_GLOW_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setStreakGlowColor(color.id)}
                    className={`
                      py-2 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-medium transition-all cursor-pointer active:scale-95 border
                      ${streakGlowColor === color.id
                        ? 'bg-white/15 border-white shadow-md'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                      }
                    `}
                  >
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="truncate w-full text-center text-[9px] text-white/80">{color.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Monthly Streak Restore */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-left space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-200">
                  <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                  <span>Free Streak Restore</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  {restoresRemaining} available this month
                </span>
              </div>
              <p className="text-[10px] text-white/70 leading-relaxed">
                Missed a day? Every couple gets 1 free monthly restore so you never lose the momentum of your journey.
              </p>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoresRemaining <= 0}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restore Streak with Love ❤️</span>
              </button>
              {restoreStatus && (
                <div className="text-[11px] text-emerald-300 text-center font-semibold animate-fadeIn">
                  {restoreStatus}
                </div>
              )}
            </div>

            {/* Launch Camera Button */}
            <button
              type="button"
              onClick={handleLaunchCamera}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:brightness-110 text-white font-bold text-xs sm:text-sm tracking-wide shadow-[0_4px_24px_rgba(244,63,94,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Send a Pulse Snap 📷</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
