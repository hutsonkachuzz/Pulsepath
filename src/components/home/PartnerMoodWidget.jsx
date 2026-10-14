import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { useCouple } from '../../context/CoupleContext';
import { MoodSelectorModal } from '../common/MoodSelectorModal';
import { formatTimeAgo } from '../../utils/dateUtils';
import { Heart, Smile } from 'lucide-react';

export function PartnerMoodWidget() {
  const { partnerName, partnerMood, myMood, hasPartner } = useCouple();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <GlassCard className="p-4 sm:p-5 lg:p-6 relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300">
              <Smile className="w-3.5 h-3.5 text-rose-400" />
              <span>Partner's Mood</span>
            </div>
            {partnerMood.updatedAt && (
              <span className="text-[10px] text-rose-200/60 font-medium">
                {formatTimeAgo(partnerMood.updatedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3.5 my-2">
            <div className="text-3xl sm:text-4xl lg:text-5xl animate-bounce-subtle p-2 sm:p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 shrink-0">
              {partnerMood.emoji || '❤️'}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-base sm:text-lg lg:text-xl font-semibold text-white tracking-tight leading-snug">
                {partnerName} is feeling {partnerMood.mood || 'Loved'}
              </h4>
              {partnerMood.note && (
                <p className="text-xs text-rose-200/80 font-normal mt-0.5 line-clamp-2">
                  “{partnerMood.note}”
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 mt-2 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-rose-200/70 truncate mr-2">
            You: <strong className="text-white">{myMood.emoji} {myMood.mood}</strong>
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="min-h-[40px] px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-4 cursor-pointer flex items-center shrink-0"
          >
            Update My Mood
          </button>
        </div>
      </GlassCard>

      <MoodSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
