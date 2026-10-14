import React, { useState, useEffect } from 'react';
import { GlassCard } from '../common/GlassCard';
import { useCouple, useJourneyStats } from '../../context/CoupleContext';
import { formatRomanticDate } from '../../utils/dateUtils';
import { Sparkles, Calendar, Clock, Heart } from 'lucide-react';

export function JourneyCounter() {
  const { couple } = useCouple();
  const journeyStats = useJourneyStats();
  const [pulseGlow, setPulseGlow] = useState(false);

  useEffect(() => {
    setPulseGlow(true);
    const t = setTimeout(() => setPulseGlow(false), 300);
    return () => clearTimeout(t);
  }, [journeyStats.seconds]);

  const daysVal = journeyStats?.days ?? 0;
  const hoursVal = String(journeyStats?.hours ?? 0).padStart(2, '0');
  const minutesVal = String(journeyStats?.minutes ?? 0).padStart(2, '0');
  const secondsVal = String(journeyStats?.seconds ?? 0).padStart(2, '0');

  const daysLength = String(daysVal).length;
  const daysFontSize = daysLength >= 5
    ? 'text-xs sm:text-sm md:text-base'
    : (daysLength >= 4
        ? 'text-sm sm:text-base md:text-lg'
        : 'text-base sm:text-xl md:text-2xl');

  return (
    <GlassCard glow className="p-6 sm:p-8 relative overflow-hidden border-rose-500/25 bg-gradient-to-br from-white/[0.05] via-rose-950/20 to-purple-950/30">
      <div className="relative z-10 max-w-xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
          <span>Our Continuous Journey</span>
        </div>

        {/* Primary Days Count */}
        <div className="flex items-baseline gap-3">
          <span className="text-4xl sm:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 tracking-tight tabular-nums journey-hero-title">
            {journeyStats.totalDays || journeyStats.days || 1}
          </span>
          <div className="text-xl sm:text-2xl text-rose-100 font-semibold tracking-tight">
            Days of Love
          </div>
        </div>

        {/* Dynamic ticking subunits */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 max-w-md">
          {/* Days Box */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
            <div className={`${daysFontSize} font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-rose-100 to-pink-200 tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]`}>
              {daysVal}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
              DAYS
            </div>
          </div>

          {/* Hours Box */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
            <div className="text-sm sm:text-base md:text-xl font-bold text-white tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
              {hoursVal}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
              HOURS
            </div>
          </div>

          {/* Mins Box */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#25103a]/90 via-[#1a0a2a]/95 to-[#12061e] border border-rose-500/35 hover:border-rose-400/60 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(244,63,94,0.18),inset_0_1px_1px_rgba(255,255,255,0.12)] min-w-0 w-full transition-all group">
            <div className="text-sm sm:text-base md:text-xl font-bold text-white tabular-nums leading-none tracking-tight text-center w-full px-0.5 truncate drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
              {minutesVal}
            </div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-rose-300/80 font-bold uppercase tracking-wider mt-1 text-center">
              MINS
            </div>
          </div>

          {/* Secs Box */}
          <div
            className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl min-w-0 w-full transition-all duration-300 ${
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

        {/* Start Date Footer */}
        {couple?.relationshipStartDate && (
          <div className="flex items-center gap-1.5 mt-5 text-xs text-rose-200/60 font-normal">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span>Still growing together since {formatRomanticDate(couple.relationshipStartDate)}</span>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
