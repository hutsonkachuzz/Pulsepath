import React, { useState } from 'react';
import { GlassCard } from '../common/GlassCard';
import { DAILY_LOVE_MESSAGES } from '../../services/demoData';
import { Quote, RefreshCw, Heart, Edit3 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RomanticButton } from '../common/RomanticButton';

export function DailyMessageWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customMessages, setCustomMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsepath_custom_daily_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMsg, setNewMsg] = useState('');

  const allMessages = [...customMessages, ...DAILY_LOVE_MESSAGES];
  const activeMessage = allMessages[currentIndex % allMessages.length];

  const handleNextMessage = () => {
    setCurrentIndex((prev) => (prev + 1) % allMessages.length);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const updated = [newMsg.trim(), ...customMessages];
    setCustomMessages(updated);
    localStorage.setItem('pulsepath_custom_daily_messages', JSON.stringify(updated));
    setNewMsg('');
    setIsModalOpen(false);
    setCurrentIndex(0);
  };

  return (
    <>
      <GlassCard className="p-4 sm:p-5 lg:p-6 relative flex flex-col justify-between bg-gradient-to-br from-white/[0.05] via-rose-950/20 to-purple-950/25 border-rose-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-300">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Daily Love Note</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center rounded-lg text-rose-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="Write our own message"
              aria-label="Write our own message"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMessage}
              className="min-w-[36px] min-h-[36px] sm:min-w-[32px] sm:min-h-[32px] flex items-center justify-center rounded-lg text-rose-300/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              title="See another note"
              aria-label="See another note"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="my-2 relative pl-6">
          <Quote className="w-5 h-5 text-rose-500/30 absolute left-0 top-0 -scale-x-100" />
          <p className="text-base sm:text-lg font-medium text-white/95 leading-relaxed">
            “{activeMessage}”
          </p>
        </div>

        <div className="mt-3 text-[11px] text-rose-300/60 font-normal flex items-center justify-between">
          <span>Fresh every morning</span>
          <span>Click ↻ for more</span>
        </div>
      </GlassCard>

      {/* Add custom note modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Write a Daily Love Note ❤️"
        subtitle="This will appear in your daily message rotation"
      >
        <form onSubmit={handleAddCustom} className="space-y-4">
          <textarea
            rows={3}
            required
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Write a sweet reminder for your partner..."
            className="w-full glass-input p-3 text-sm font-normal"
          />
          <div className="flex justify-end gap-2">
            <RomanticButton variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </RomanticButton>
            <RomanticButton type="submit">
              Save Note
            </RomanticButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
