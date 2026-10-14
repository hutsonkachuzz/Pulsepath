import React from 'react';
import { DailyQuestionWidget } from '../components/home/DailyQuestionWidget';
import { GlassCard } from '../components/common/GlassCard';
import { PageHeader } from '../components/common/PageHeader';
import { HelpCircle, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCouple } from '../context/CoupleContext';

export function QuestionPage() {
  const { partnerName } = useCouple();

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header with iOS Back Arrow */}
      <PageHeader
        backLabel="Our Space"
        title="Our Daily Ritual ✨"
        subtitle="A new question every day to spark meaningful conversations and keep your connection deep."
      />

      {/* Today's Question Container */}
      <DailyQuestionWidget />

      {/* Past Questions Inspiration Card */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-4">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Why this ritual matters</span>
        </div>

        <p className="text-xs sm:text-sm text-rose-200/80 leading-relaxed font-normal mb-4">
          Over time, the rhythm of day-to-day life can make couples forget to ask the little questions. PulsePath presents one thoughtful prompt each morning so you and {partnerName} always have a sacred moment to reflect, laugh, and listen.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-rose-100">Both answers are revealed once you both complete today's prompt.</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-rose-100">Every response is preserved in your private relationship archive.</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
