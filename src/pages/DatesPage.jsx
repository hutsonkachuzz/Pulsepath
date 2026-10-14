import React, { useEffect, useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { useCouple } from '../context/CoupleContext';
import {
  subscribeToSpecialDates,
  deleteSpecialDate
} from '../services/firebaseService';
import { calculateCountdown, formatRomanticDate } from '../utils/dateUtils';
import { CalendarHeart, Sparkles, Trash2, Clock, Calendar } from 'lucide-react';

export function DatesPage() {
  const { couple } = useCouple();
  const [dates, setDates] = useState([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!couple?.id) return;
    const unsub = subscribeToSpecialDates(couple.id, (list) => setDates(list));
    return () => unsub && unsub();
  }, [couple?.id]);

  // Update countdown clock every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDelete = async (id) => {
    if (!couple?.id) return;
    if (window.confirm('Delete this milestone date?')) {
      await deleteSpecialDate(couple.id, id);
    }
  };

  // Sort dates by closest upcoming
  const upcomingDates = [...dates].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Header with iOS Back Arrow */}
      <PageHeader
        backLabel="Our Space"
        title="Our Special Dates & Anniversaries 📅"
        subtitle="The days that became part of your story. Every milestone counted down with love."
      />

      {/* Featured Next Milestone Countdown */}
      {upcomingDates.length > 0 && (
        (() => {
          const next = upcomingDates[0];
          const cd = calculateCountdown(next.date);

          return (
            <GlassCard glow className="p-6 sm:p-8 border-rose-500/30 bg-gradient-to-r from-rose-500/15 via-purple-500/10 to-rose-500/15 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Next Big Milestone</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {next.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-200/80 mt-1 max-w-md">
                    {next.description || `Celebrating our special day on ${formatRomanticDate(next.date)}`}
                  </p>
                </div>

                {/* Animated Countdown Ticker */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center shrink-0">
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 min-w-[65px] sm:min-w-[75px]">
                    <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-white">
                      {cd.days}
                    </div>
                    <div className="text-[10px] sm:text-xs text-rose-300/70 uppercase">Days</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 min-w-[65px] sm:min-w-[75px]">
                    <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-white">
                      {String(cd.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs text-rose-300/70 uppercase">Hours</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 min-w-[65px] sm:min-w-[75px]">
                    <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-white">
                      {String(cd.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs text-rose-300/70 uppercase">Mins</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/10 min-w-[65px] sm:min-w-[75px]">
                    <div className="text-2xl sm:text-3xl font-semibold tabular-nums text-rose-400">
                      {String(cd.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] sm:text-xs text-rose-300/70 uppercase">Secs</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })()
      )}

      {/* Dates List */}
      {upcomingDates.length === 0 ? (
        <EmptyState
          emoji="📅"
          title="No special dates added yet"
          description="Add your anniversary, partner's birthday, or the date of your first kiss! Click the + button at any time to add."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingDates.map((item) => {
            const cd = calculateCountdown(item.date);
            return (
              <GlassCard key={item.id} hoverEffect className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                    <CalendarHeart className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white tracking-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-rose-300/80 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{formatRomanticDate(item.date)}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-rose-200/60 mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-medium tabular-nums whitespace-nowrap">
                    {cd.isPast ? 'Celebrated' : `${cd.days}d left`}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-rose-300/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
