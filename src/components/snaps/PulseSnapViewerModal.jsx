import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, Clock, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStreak } from '../../context/StreakContext';

export function PulseSnapViewerModal({ snap, onClose, onReactHeart }) {
  const { openCamera } = useStreak();
  const [progress, setProgress] = useState(100);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [heartCoords, setHeartCoords] = useState({ x: 0, y: 0 });

  const durationSec = snap?.timerDuration || 10;
  const isLoop = snap?.timerMode === 'loop' || durationSec <= 0;

  // Double tap detection
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (isLoop) return;

    const intervalTime = 50; // ms
    const totalSteps = (durationSec * 1000) / intervalTime;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [durationSec, isLoop, onClose]);

  if (!snap) return null;

  // Handle Double Tap Heart Reaction
  const handleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap detected!
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setHeartCoords({ x, y });
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 1200);

      try {
        confetti({
          particleCount: 30,
          spread: 70,
          origin: {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
          },
          colors: ['#f43f5e', '#ec4899', '#f472b6']
        });
      } catch (err) {}

      if (onReactHeart) {
        onReactHeart(snap.id);
      }
    }
    lastTapRef.current = now;
  };

  const handleReplySnap = () => {
    onClose();
    openCamera();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[3000] bg-black flex flex-col justify-between overflow-hidden select-none"
        onClick={handleTap}
      >
        {/* Full-Screen Snap Image */}
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
          <img
            src={snap.mediaUrl}
            alt="Pulse Snap"
            className="w-full h-full object-cover"
            style={{ filter: snap.filterCss || 'none' }}
          />

          {/* Caption Overlay */}
          {snap.caption && (
            <div className="absolute bottom-28 left-4 right-4 z-20 pointer-events-none">
              <div className="max-w-md mx-auto p-3 rounded-2xl bg-black/65 backdrop-blur-xl border border-white/20 text-center shadow-2xl">
                <p className="text-sm sm:text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]">
                  {snap.caption}
                </p>
              </div>
            </div>
          )}

          {/* Streak Watermark Badge Overlay */}
          {snap.showStreakStamp && (
            <div className="absolute top-16 right-4 z-20 px-3 py-1.5 rounded-full bg-[#1c082e]/85 backdrop-blur-md border border-rose-400/40 shadow-lg text-white font-bold text-xs flex items-center gap-1.5 animate-pulse">
              <span>{snap.streakEmoji || '🔥'}</span>
              <span>Day {snap.streakDay || 12} Streak</span>
            </div>
          )}

          {/* Animated Double-Tap Heart Burst */}
          {showHeartBurst && (
            <motion.div
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.4, 1.1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="absolute z-40 pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: heartCoords.x, top: heartCoords.y }}
            >
              <Heart className="w-24 h-24 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_24px_rgba(244,63,94,0.9)]" />
            </motion.div>
          )}
        </div>

        {/* Top Progress Timer Bar (Snapchat Style) */}
        <div className="relative z-30 p-3 pt-[calc(env(safe-area-inset-top,20px)+8px)] space-y-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {!isLoop && (
            <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
                {snap.senderName ? snap.senderName[0] : 'M'}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {snap.senderName || 'Partner'}
                </span>
                <span className="text-[10px] text-white/70 flex items-center gap-1 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  {isLoop ? 'Looping' : `${Math.ceil((progress / 100) * durationSec)}s remaining`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/15 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Reply Bar */}
        <div className="relative z-30 p-4 pb-[calc(env(safe-area-inset-bottom,20px)+12px)] bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleReplySnap();
            }}
            className="flex-1 py-3 px-4 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all shadow-lg hover:bg-white/25"
          >
            <Camera className="w-4 h-4 text-rose-300" />
            <span>Reply with a Snap 📷</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onReactHeart) onReactHeart(snap.id);
              try {
                confetti({
                  particleCount: 20,
                  spread: 60,
                  origin: { y: 0.9 },
                  colors: ['#f43f5e', '#fb7185']
                });
              } catch (err) {}
            }}
            className="w-12 h-12 rounded-full bg-rose-500/30 backdrop-blur-xl border border-rose-400/50 flex items-center justify-center text-rose-400 hover:text-white cursor-pointer active:scale-90 transition-transform shadow-md"
            title="Double-tap screen or tap to send Love Heart"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
}
