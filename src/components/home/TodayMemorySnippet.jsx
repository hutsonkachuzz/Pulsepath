import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { Heart, MapPin, Calendar, ArrowRight, Camera, Mail } from 'lucide-react';
import { formatRomanticDate } from '../../utils/dateUtils';

export function TodayMemorySnippet({ memory }) {
  if (!memory) {
    return (
      <GlassCard className="p-4 sm:p-5 lg:p-6 text-center flex flex-col items-center justify-center min-h-[220px] bg-gradient-to-br from-white/[0.04] to-rose-950/20 border-rose-500/20">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-3 shadow-glow-sm">
          <Heart className="w-6 h-6 text-rose-400 fill-rose-400/20" />
        </div>
        <h3 className="text-base font-semibold text-white tracking-tight">
          Our Moments Await
        </h3>
        <p className="text-xs text-rose-200/70 max-w-xs mt-1 mb-4 leading-relaxed font-normal">
          Every conversation, laugh, and quiet evening is a moment waiting to be etched into our journey.
        </p>
        <Link
          to="/memories"
          className="min-h-[40px] text-xs font-semibold text-rose-300 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-rose-500/20 border border-white/10 transition-all cursor-pointer"
        >
          <span>Explore Our Moments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </GlassCard>
    );
  }

  const hasPhoto = memory.images && memory.images.length > 0;

  return (
    <GlassCard className="p-4 sm:p-5 lg:p-6 relative overflow-hidden flex flex-col justify-between bg-gradient-to-br from-white/[0.05] to-rose-950/25 border-rose-500/20">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300">
            <Camera className="w-3.5 h-3.5 text-rose-400" />
            <span>Our Moments • Highlight</span>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {memory.moodEmoji || '❤️'} {memory.mood || 'Loved'}
          </span>
        </div>

        <div className="flex gap-3 sm:gap-4 items-start">
          {hasPhoto && (
            <img
              src={memory.images[0]}
              alt={memory.title}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl object-cover shrink-0 border border-white/15 shadow-md"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-white tracking-tight line-clamp-1">
              {memory.title}
            </h4>

            {/* Date */}
            <div className="flex items-center gap-2 text-[11px] text-rose-300/80 my-1 font-normal flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-rose-400" />
                <span>{formatRomanticDate(memory.date)}</span>
              </span>
              {memory.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{memory.location}</span>
                  </span>
                </>
              )}
            </div>

            {/* Message preview */}
            <p className="text-xs text-rose-100/80 mt-1 line-clamp-2 leading-relaxed font-normal">
              💌 {memory.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-rose-200/60 font-normal truncate mr-2">
          Milestone on our path
        </span>
        <Link
          to="/memories"
          className="min-h-[40px] text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors shrink-0"
        >
          <span>View All Moments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </GlassCard>
  );
}
