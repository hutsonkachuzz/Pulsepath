import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Play, Eye, RotateCcw, Clock } from 'lucide-react';

export function SnapMessageBubble({ snap, isOutgoing, onOpenSnap }) {
  const isUnopened = Boolean(snap?.unopened);
  const timerLabel = snap?.timerDuration ? `${snap.timerDuration}s` : 'Loop';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => onOpenSnap(snap)}
      className={`
        w-full max-w-[260px] sm:max-w-[280px] p-3 rounded-2xl text-left cursor-pointer transition-all select-none
        ${
          isUnopened
            ? 'bg-gradient-to-r from-purple-800/90 via-pink-700/80 to-rose-700/90 border-2 border-rose-400/80 shadow-[0_8px_24px_rgba(244,63,94,0.45),0_0_12px_rgba(236,72,153,0.3)] animate-pulse-subtle'
            : 'bg-[#180a29]/80 border border-purple-500/25 shadow-md hover:border-purple-400/40'
        }
      `}
      style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
    >
      <div className="flex items-center gap-3">
        {/* Snap Icon Box */}
        <div
          className={`
            w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform
            ${
              isUnopened
                ? 'bg-white text-rose-600 shadow-md animate-bounce'
                : 'bg-white/10 text-purple-300 border border-white/10'
            }
          `}
        >
          {isUnopened ? (
            <Flame className="w-6 h-6 fill-rose-500 text-rose-500" />
          ) : (
            <RotateCcw className="w-5 h-5 text-purple-300" />
          )}
        </div>

        {/* Snap Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-extrabold text-white tracking-wide truncate flex items-center gap-1">
              <span>Pulse Snap</span>
              {snap?.streakDay && (
                <span className="text-[10px] text-amber-300 font-bold">
                  {snap.streakEmoji || '🔥'} {snap.streakDay}
                </span>
              )}
            </span>
            <span className="text-[9px] font-mono text-white/70 px-1.5 py-0.5 rounded bg-black/30 border border-white/10 shrink-0 flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {timerLabel}
            </span>
          </div>

          <p className="text-[11px] text-white/80 mt-0.5 truncate font-medium">
            {isUnopened ? (
              <span className="text-white font-semibold flex items-center gap-1">
                <span>Tap to view snap</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
              </span>
            ) : (
              <span className="text-purple-300/80">Opened • Tap to replay</span>
            )}
          </p>

          {snap?.caption && (
            <p className="text-[10px] text-white/60 italic truncate mt-0.5">
              “{snap.caption}”
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
