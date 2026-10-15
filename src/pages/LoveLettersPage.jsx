import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import {
  subscribeToLoveLetters,
  markLetterOpened
} from '../services/firebaseService';
import { formatRomanticDate } from '../utils/dateUtils';
import { Mail, Heart, Sparkles, X, Stamp } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LoveLettersPage() {
  const { currentUser } = useAuth();
  const { couple, partnerName } = useCouple();

  const [letters, setLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    if (!couple?.id) return;
    const unsub = subscribeToLoveLetters(couple.id, (list) => setLetters(list));
    return () => unsub && unsub();
  }, [couple?.id]);

  const handleOpenLetter = async (letter) => {
    setIsOpening(true);
    setSelectedLetter(letter);

    // Trigger sweet opening confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#FF4D6D', '#FFB3C1', '#FFEAD2']
    });

    if (couple?.id && !letter.openedAt) {
      await markLetterOpened(couple.id, letter.id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn pb-12">
      {/* Header with iOS Back Arrow */}
      <PageHeader
        backLabel="Our Space"
        title="Our Love Letters ✉️"
        subtitle="Words become memories when they're written with love. Sealed envelopes to open and cherish forever."
      />

      {/* Envelopes Grid */}
      {letters.length === 0 ? (
        <EmptyState
          emoji="✉️"
          title="No sealed love letters yet"
          description="Send your partner their very first digital love letter. Click the + button at any time to compose one."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {letters.map((letter) => {
            const currentUserId = currentUser?.id || currentUser?.uid;
            const isMe = letter.createdBy === currentUserId || letter.created_by === currentUserId;
            const isOpened = Boolean(letter.openedAt || letter.opened_at);

            return (
              <motion.div
                key={letter.id}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenLetter(letter)}
                className="cursor-pointer"
              >
                {/* Vintage Romantic Envelope Shell */}
                <div className="relative rounded-2xl bg-gradient-to-b from-[#2A1828] to-[#1A1020] border border-rose-500/30 p-6 shadow-xl overflow-hidden group hover:border-rose-400/60 transition-all">
                  {/* Flap triangle decoration */}
                  <div className="absolute top-0 left-0 right-0 h-16 bg-white/[0.03] clip-path-triangle border-b border-rose-500/20 pointer-events-none" />

                  {/* Wax Seal */}
                  <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-700 via-rose-600 to-crimson flex items-center justify-center mx-auto mb-4 shadow-glow-sm border border-rose-400/50 group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>

                  <div className="text-center relative z-10">
                    <span className="text-[11px] font-medium text-rose-300/70 uppercase tracking-widest block mb-1">
                      {formatRomanticDate(letter.createdAt)}
                    </span>
                    <h3 className="text-base font-semibold text-white tracking-tight line-clamp-1 group-hover:text-rose-300 transition-colors">
                      {letter.title}
                    </h3>
                    <p className="text-xs text-rose-200/60 mt-1">
                      From: {isMe ? 'You' : (letter.authorName || partnerName)}
                    </p>
                  </div>

                  {/* Opened badge */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-300/60">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{isOpened ? 'Opened' : 'Sealed with Love'}</span>
                    </span>
                    <span className="text-rose-400 font-semibold group-hover:underline">
                      Read Letter →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CINEMATIC ENVELOPE OPENING MODAL */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed sm:absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="fixed sm:absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-xl max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-2rem))] overflow-y-auto z-10 p-6 sm:p-8 pb-[max(1.5rem,calc(env(safe-area-inset-bottom,0px)+1rem))] rounded-3xl letter-paper shadow-2xl border border-rose-400/30 text-stone-900 bg-[#FFFDF9] flex flex-col"
            >
              {/* Close Icon */}
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute top-4 right-4 p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Envelope Stamp / Wax Seal icon */}
              <div className="flex items-center justify-between border-b border-rose-200 pb-4 mb-6">
                <div>
                  <div className="text-xs text-rose-800 font-medium uppercase tracking-widest">
                    A letter for you
                  </div>
                  <div className="text-xs text-stone-500">
                    {formatRomanticDate(selectedLetter.createdAt)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
              </div>

              {/* Letter Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-6">
                {selectedLetter.title}
              </h2>

              {/* Letter Body Text */}
              <div className="max-h-[min(50dvh,340px)] overflow-y-auto pr-2">
                <p className="text-base sm:text-lg text-stone-800 font-normal leading-relaxed whitespace-pre-wrap">
                  {selectedLetter.content}
                </p>
              </div>

              {/* Letter Footer */}
              <div className="mt-8 pt-4 border-t border-rose-200 flex items-center justify-between text-xs text-stone-600">
                <span className="font-medium text-stone-700">
                  Penned by {selectedLetter.authorName || 'My Love'} ❤️
                </span>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="px-4 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-medium"
                >
                  Fold & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
