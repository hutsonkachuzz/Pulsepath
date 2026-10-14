import React, { useEffect, useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { RomanticButton } from '../common/RomanticButton';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import {
  subscribeToDailyQuestion,
  submitDailyAnswer
} from '../../services/firebaseService';
import { HelpCircle, Send, CheckCircle2 } from 'lucide-react';

export function DailyQuestionWidget() {
  const { currentUser } = useAuth();
  const { couple, partnerId, partnerName } = useCouple();

  const [questionData, setQuestionData] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!couple?.id) return;
    const unsubscribe = subscribeToDailyQuestion(couple.id, (data) => {
      setQuestionData(data);
    });
    return unsubscribe;
  }, [couple?.id]);

  const currentUserId = currentUser?.id || currentUser?.uid;
  const answers = questionData?.answers || {};
  const myAnswer = currentUserId ? answers[currentUserId] : null;
  const partnerAnswer = partnerId ? answers[partnerId] : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || !couple?.id || !currentUser) return;
    setIsSubmitting(true);
    try {
      await submitDailyAnswer(couple.id, currentUserId, currentUser.name, answerInput.trim());
      setAnswerInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5 lg:p-6 relative">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300 mb-3">
        <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
        <span>Our Daily Ritual</span>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mb-4 leading-snug">
        “{questionData?.question || 'What was your favorite little moment with me this week?'}”
      </h3>

      {/* Answers Display */}
      <div className="space-y-3 mb-2">
        {/* Partner's Answer */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] font-semibold text-rose-300/80 mb-1 flex items-center justify-between">
            <span>{partnerName}'s Answer</span>
            {partnerAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
          </div>
          {partnerAnswer ? (
            <p className="text-xs text-white/90 font-normal leading-relaxed">
              “{partnerAnswer.text}”
            </p>
          ) : (
            <p className="text-xs text-rose-200/50 font-normal">
              Waiting for {partnerName} to share...
            </p>
          )}
        </div>

        {/* My Answer */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
          <div className="text-[11px] font-semibold text-rose-300 mb-1 flex items-center justify-between">
            <span>Your Answer</span>
            {myAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
          </div>
          {myAnswer ? (
            <p className="text-xs text-white/95 font-normal leading-relaxed">
              “{myAnswer.text}”
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-2 flex gap-2">
              <input
                type="text"
                required
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full glass-input px-3 py-2 text-xs min-h-[40px]"
              />
              <RomanticButton size="sm" type="submit" loading={isSubmitting} icon={Send} className="min-h-[40px] px-3 shrink-0">
                Send
              </RomanticButton>
            </form>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
