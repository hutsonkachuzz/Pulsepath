import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { useAuth } from '../../context/AuthContext';
import { useCouple, useJourneyStats } from '../../context/CoupleContext';
import { formatRomanticDate } from '../../utils/dateUtils';
import {
  Heart,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  Infinity as InfinityIcon,
  Compass,
  Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function LivingJourneyHero() {
  const { currentUser } = useAuth();
  const { couple, partnerName, partnerAvatar, partnerMood } = useCouple();
  const journeyStats = useJourneyStats();

  // Pulse animation trigger on each ticking second
  const [pulseGlow, setPulseGlow] = useState(false);

  useEffect(() => {
    setPulseGlow(true);
    const t = setTimeout(() => setPulseGlow(false), 300);
    return () => clearTimeout(t);
  }, [journeyStats.seconds]);

  // Gentle heart bloom interaction on clicking the central heartbeat badge
  const handleHeartbeatClick = () => {
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.4 },
      colors: ['#FF4D6D', '#FF758F', '#FFE5EC', '#E0AAFF']
    });
  };

  const userAvatar = currentUser?.avatar || null;
  const userName = currentUser?.nickname || currentUser?.name || 'You';
  const displayPartnerName = partnerName || 'My Love';

  const daysVal = journeyStats?.days ?? 0;
  const hoursVal = String(journeyStats?.hours ?? 0).padStart(2, '0');
  const minutesVal = String(journeyStats?.minutes ?? 0).padStart(2, '0');
  const secondsVal = String(journeyStats?.seconds ?? 0).padStart(2, '0');

  // Dynamic font sizing for days to guarantee zero digit overflow (even for 4-5 digits like 1473 or 14373)
  const daysLength = String(daysVal).length;
  const daysFontSize = daysLength >= 5
    ? 'text-xs sm:text-sm md:text-base'
    : (daysLength >= 4
        ? 'text-sm sm:text-base md:text-lg'
        : 'text-base sm:text-xl md:text-2xl');

  return (
    <div className="relative z-10 w-full animate-fadeIn">
      <GlassCard
        glow
        className="p-4 sm:p-7 lg:p-9 relative overflow-hidden border-rose-500/25 bg-gradient-to-br from-white/[0.06] via-rose-950/20 to-purple-950/30 backdrop-blur-xl shadow-2xl"
      >
        {/* Subtle Ambient Radial Glow Behind Counter */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-rose-500/[0.12] blur-3xl pointer-events-none" />

        {/* Top Header Row: Continuous Journey Badge & Live Status */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 sm:mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/35 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-rose-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Our Journey</span>
            </span>

            <span className="text-xs text-rose-200/70 font-normal hidden sm:inline">
              • Still Growing Together
            </span>
          </div>

          {/* Living Heartbeat Indicator */}
          <button
            type="button"
            onClick={handleHeartbeatClick}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.05] hover:bg-rose-500/15 border border-white/10 hover:border-rose-400/40 text-xs text-rose-200 transition-all cursor-pointer group"
            title="Two hearts beating in real time (Click to send love buzz)"
          >
            <Heart
              className={`w-3.5 h-3.5 text-rose-400 fill-rose-500 transition-transform duration-300 ${
                pulseGlow ? 'scale-125' : 'scale-100'
              }`}
            />
            <span className="text-[11px] font-medium tracking-tight">
              Live Heartbeat
            </span>
            <Sparkles className="w-3 h-3 text-amber-300 opacity-60 group-hover:opacity-100" />
          </button>
        </div>

        {/* Central Love Story Headline */}
        <div className="relative z-10 text-center sm:text-left mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-1.5">
            Every Moment, Still Us ❤️
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-rose-200/80 font-normal max-w-xl leading-relaxed">
            Our story is still being written… continuously walking through this beautiful world together.
          </p>
        </div>

        {/* =========================================================================
            CONTINUOUS REAL-TIME JOURNEY COUNTER (HEARTBEAT OF PULSEPATH)
            ========================================================================= */}
        <div className="relative z-10 p-3 sm:p-5 lg:p-7 rounded-2xl bg-black/35 border border-rose-500/20 backdrop-blur-md shadow-inner journey-counter-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            {/* Primary Total Days Count */}
            <div>
              <div className="text-[11px] sm:text-xs uppercase font-medium tracking-wider text-rose-300/80 mb-0.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Together For</span>
              </div>
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-3xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 tracking-tight tabular-nums journey-hero-title leading-tight">
                  {journeyStats.totalDays || journeyStats.days || 1}
                </span>
                <div className="text-lg sm:text-2xl text-rose-100 font-semibold tracking-tight">
                  Days in Love
                </div>
              </div>
            </div>

            {/* Continuous Ticking Real-Time Subunit Blocks (DAYS, HOURS, MINS, SECS) */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
              {/* Days Box */}
              <div className="flex flex-col items-center justify-center p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
                <div className={`${daysFontSize} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-pink-200 tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]`}>
                  {daysVal}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
                  DAYS
                </div>
              </div>

              {/* Hours Box */}
              <div className="flex flex-col items-center justify-center p-2 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
                <div className="text-sm sm:text-base md:text-xl font-bold text-white tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                  {hoursVal}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
                  HOURS
                </div>
              </div>

              {/* Mins Box */}
              <div className="flex flex-col items-center justify-center p-2 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
                <div className="text-sm sm:text-base md:text-xl font-bold text-white tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
                  {minutesVal}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
                  MINS
                </div>
              </div>

              {/* Real-time Ticking Seconds with Neon Glow */}
              <div
                className={`flex flex-col items-center justify-center p-2 sm:p-3.5 rounded-2xl min-w-0 w-full transition-all duration-300 ${
                  pulseGlow
                    ? 'bg-gradient-to-b from-[#381648] via-[#240c32] to-[#140620] border border-rose-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_24px_rgba(244,63,94,0.5),inset_0_0_12px_rgba(244,63,94,0.25)] scale-[1.03]'
                    : 'bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)]'
                }`}
              >
                <div className="text-sm sm:text-base md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-rose-300 via-pink-400 to-rose-500 tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_10px_rgba(244,63,94,0.5)]">
                  {secondsVal}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/90 font-bold uppercase tracking-wider mt-1 text-center">
                  SECS
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Relationship Milestone Row */}
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200/70 font-normal">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Since{' '}
                <strong className="text-white font-medium">
                  {couple?.relationship_start_date || couple?.relationshipStartDate
                    ? formatRomanticDate(couple.relationship_start_date || couple.relationshipStartDate)
                    : 'the day our hearts aligned'}
                </strong>
              </span>
            </div>

            {/* Connected Partner avatars with infinity bridge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center -space-x-2">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-rose-400/60 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-rose-400/60">
                    {userName[0]}
                  </div>
                )}
                {partnerAvatar ? (
                  <img
                    src={partnerAvatar}
                    alt={displayPartnerName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-pink-400/60 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-pink-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-pink-400/60">
                    {displayPartnerName[0]}
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium text-white/90">
                {userName} & {displayPartnerName}
              </span>
              {partnerMood?.emoji && (
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] text-rose-200">
                  {partnerMood.emoji} {partnerMood.mood}
                </span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
