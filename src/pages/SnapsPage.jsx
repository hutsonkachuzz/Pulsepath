import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Flame,
  Clock,
  Sparkles,
  ChevronLeft,
  MessageCircle,
  RotateCcw,
  Plus,
  Play,
  Heart,
  Calendar,
  Award,
  Zap,
  Sliders,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStreak } from '../context/StreakContext';
import { useCouple } from '../context/CoupleContext';
import { StreakBadge } from '../components/snaps/StreakBadge';
import { PulseSnapViewerModal } from '../components/snaps/PulseSnapViewerModal';

export function SnapsPage() {
  const navigate = useNavigate();
  const { partnerName, partnerAvatar } = useCouple();
  const {
    streakCount,
    bestStreak,
    streakEmoji,
    streakGlowColor,
    startDate,
    windowInfo,
    partnerSnap,
    partnerSnapStatus,
    hasUnopenedSnap,
    recentSnaps,
    openSnap,
    openCamera,
    openStreakHub,
    activeViewingSnap,
    setActiveViewingSnap
  } = useStreak();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'memories'

  const effectivePartnerName = partnerName || 'Mikasa';
  const effectivePartnerAvatar =
    partnerAvatar ||
    partnerSnap?.senderAvatar ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  // Handle clicking on partner row / avatar: open snap if unopened, or camera
  const handlePartnerClick = () => {
    if (hasUnopenedSnap && partnerSnap) {
      openSnap(partnerSnap);
    } else {
      openCamera();
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col min-h-full pb-8 select-none">
      {/* =========================================================================
          TOP PAGE HEADER
          ========================================================================= */}
      <div className="sticky top-0 z-30 pt-1 pb-3 px-1 flex items-center justify-between border-b border-white/[0.08] bg-[#12071d]/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="p-1.5 -ml-1 rounded-full text-rose-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            aria-label="Back to Home"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
              <span>Pulse Snaps</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-purple-500/20 text-rose-300 border border-rose-500/30">
                Streaks
              </span>
            </h1>
            <p className="text-[10px] text-rose-300/70">
              Ephemeral moments & daily connection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Customizer Trigger Badge */}
          <StreakBadge size="md" />

          {/* Quick Camera Action */}
          <button
            type="button"
            onClick={openCamera}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] active:scale-90 hover:scale-105 transition-all cursor-pointer"
            title="Open Camera"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 pt-3">
        {/* =========================================================================
            SNAPCHAT PARTNER HERO ROW (Glowing Camera Ring & Streak Status)
            ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-[#20092c]/90 via-[#190724]/90 to-[#120419]/90 border border-rose-500/30 shadow-[0_12px_36px_rgba(0,0,0,0.7),0_0_20px_rgba(244,63,94,0.18)]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* Left: Interactive Avatar with Glowing Multi-Color Camera Ring */}
            <div
              onClick={handlePartnerClick}
              className="relative cursor-pointer group shrink-0"
              title={hasUnopenedSnap ? 'Tap to view new snap!' : 'Tap to capture snap'}
            >
              {/* Animated Glowing Ring */}
              <div
                className={`
                  w-[64px] h-[64px] rounded-full p-[3px] transition-all duration-300
                  ${
                    hasUnopenedSnap
                      ? 'bg-gradient-to-tr from-rose-500 via-pink-400 to-purple-500 animate-spin-slow shadow-[0_0_20px_rgba(244,63,94,0.7)]'
                      : 'bg-gradient-to-tr from-rose-500/60 to-purple-500/60 group-hover:scale-105'
                  }
                `}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-black border-2 border-[#190724]">
                  <img
                    src={effectivePartnerAvatar}
                    alt={effectivePartnerName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Status Indicator Badge on Avatar */}
              {hasUnopenedSnap ? (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-[#190724] flex items-center justify-center text-white shadow-md animate-bounce">
                  <Flame className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#190724] flex items-center justify-center text-white shadow-sm">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Middle: Partner Info & Live Snap Status */}
            <div
              onClick={handlePartnerClick}
              className="flex-1 min-w-0 cursor-pointer text-left"
            >
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-rose-200 transition-colors">
                  {effectivePartnerName} 🌸
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                  <span>{streakEmoji}</span>
                  <span>{streakCount}</span>
                </span>
              </div>

              {/* Dynamic Snapchat Status */}
              <div className="mt-1 flex items-center gap-1.5">
                {hasUnopenedSnap ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 animate-pulse">
                    <span className="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-rose-500 to-pink-400 inline-block shadow-sm" />
                    <span>New Snap • Tap to open</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                    <span className="w-3 h-3 rounded-[3px] border border-rose-400/60 inline-block" />
                    <span>{partnerSnapStatus}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: Direct Actions (Camera & Chat) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={openCamera}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-white flex items-center justify-center border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Send a Snap"
                aria-label="Send a Snap"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/chat')}
                className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-purple-500/20 hover:text-purple-300 text-white flex items-center justify-center border border-white/10 transition-all active:scale-95 cursor-pointer"
                title="Open Chat"
                aria-label="Open Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            STREAK STATS & 24H COUNTDOWN PROGRESS CARD
            ========================================================================= */}
        <div className="rounded-3xl p-4 bg-[#180a24]/80 border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">
                  Daily Streak Journey
                </span>
                <span className="text-[10px] text-rose-300/70 block leading-tight">
                  Started {startDate}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={openStreakHub}
              className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-semibold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
            >
              <Sliders className="w-3 h-3" />
              <span>Customize</span>
            </button>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xl sm:text-2xl font-black text-rose-400 block leading-none font-mono">
                {streakEmoji} {streakCount}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/50 block mt-1 font-semibold">
                Current
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xl sm:text-2xl font-black text-amber-300 block leading-none font-mono">
                🏆 {bestStreak}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/50 block mt-1 font-semibold">
                Best
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xl sm:text-2xl font-black text-purple-300 block leading-none font-mono">
                {windowInfo.hoursRemaining}h
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/50 block mt-1 font-semibold">
                Time Left
              </span>
            </div>
          </div>

          {/* 24h Expiration Warning & Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/70 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-400" />
                <span>Next Reset Window</span>
              </span>
              <span
                className={`font-semibold font-mono ${
                  windowInfo.isExpiringSoon ? 'text-amber-400 animate-pulse' : 'text-rose-300'
                }`}
              >
                {windowInfo.isExpiringSoon ? '⚠️ ' : ''}
                {windowInfo.hoursRemaining}h {windowInfo.minutesRemaining}m left
              </span>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  windowInfo.isExpiringSoon
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : 'bg-gradient-to-r from-rose-500 to-purple-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                }`}
                style={{ width: `${windowInfo.percentRemaining}%` }}
              />
            </div>
            <p className="text-[10px] text-white/50 text-right">
              Send at least 1 Snap every 24 hours to keep the flame burning! 🔥
            </p>
          </div>
        </div>

        {/* =========================================================================
            SNAP MEMORIES ARCHIVE / GALLERY (Snapchat Memories style)
            ========================================================================= */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Recent Pulse Snaps</span>
            </h3>
            <span className="text-[10px] text-rose-300/70">
              {recentSnaps.length} Snaps Preserved
            </span>
          </div>

          {/* Snaps Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {recentSnaps.map((snap) => (
              <motion.div
                key={snap.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openSnap(snap)}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border border-white/10 shadow-md group cursor-pointer"
              >
                {/* Background Snap Photo */}
                <img
                  src={snap.mediaUrl}
                  alt={snap.caption || 'Pulse Snap'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ filter: snap.filterCss || 'none' }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Top Streak Stamp */}
                {snap.showStreakStamp && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white flex items-center gap-1">
                    <span>{snap.streakEmoji || '🔥'}</span>
                    <span>Day {snap.streakDay}</span>
                  </div>
                )}

                {/* Top Duration */}
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/10">
                  {snap.timerDuration || 10}s
                </div>

                {/* Bottom Sender & Caption */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left">
                  <div className="text-[10px] font-bold text-rose-300 flex items-center gap-1">
                    <span>{snap.sender || 'Mikasa'}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-[9px] text-white/60 font-normal">
                      {snap.displayTime || 'Today'}
                    </span>
                  </div>
                  {snap.caption && (
                    <p className="text-[11px] font-semibold text-white truncate mt-0.5 drop-shadow">
                      {snap.caption}
                    </p>
                  )}
                </div>

                {/* Play / View Overlay on Hover */}
                <div className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            BOTTOM QUICK SNAP CAPTURE HERO BUTTON
            ========================================================================= */}
        <div className="pt-2">
          <button
            type="button"
            onClick={openCamera}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 active:scale-98 text-white font-bold text-sm shadow-[0_8px_24px_rgba(244,63,94,0.45)] flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Camera className="w-5 h-5" />
            <span>Open Pulse Snap Camera (60 FPS)</span>
          </button>
        </div>
      </div>

      {/* Full-Screen Snap Viewer Modal */}
      {activeViewingSnap && (
        <PulseSnapViewerModal
          snap={activeViewingSnap}
          onClose={() => setActiveViewingSnap(null)}
          onReactHeart={(snapId) => {
            // Heart burst animation
          }}
        />
      )}
    </div>
  );
}
