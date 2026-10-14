import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { RomanticButton } from './RomanticButton';
import { useCouple } from '../../context/CoupleContext';
import { triggerHaptic } from '../../utils/iosMotion';

const MOODS = [
  { mood: 'Loved', emoji: '❤️', desc: 'Surrounded by your affection' },
  { mood: 'Missing You', emoji: '🥰', desc: 'Counting minutes until I see you' },
  { mood: 'Happy', emoji: '😊', desc: 'Smiling from ear to ear' },
  { mood: 'Romantic', emoji: '💖', desc: 'Heart full of butterflies' },
  { mood: 'Sleepy', emoji: '😴', desc: 'Ready for warm cuddles' },
  { mood: 'Excited', emoji: '✨', desc: 'Looking forward to our next moment' },
  { mood: 'Peaceful', emoji: '🌙', desc: 'Quiet, calm and grateful' },
];

export function MoodSelectorModal({ isOpen, onClose }) {
  const { myMood, setMyMood } = useCouple();
  const [selectedMood, setSelectedMood] = useState(myMood?.mood || 'Loved');
  const [selectedEmoji, setSelectedEmoji] = useState(myMood?.emoji || '❤️');
  const [note, setNote] = useState(myMood?.note || '');
  const [saving, setSaving] = useState(false);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedMood(myMood?.mood || 'Loved');
      setSelectedEmoji(myMood?.emoji || '❤️');
      setNote(myMood?.note || '');
    }
  }, [isOpen, myMood]);

  // Instant update on card selection
  const handleSelect = async (item) => {
    setSelectedMood(item.mood);
    setSelectedEmoji(item.emoji);
    triggerHaptic('success');

    try {
      await setMyMood(item.mood, item.emoji, note);
    } catch (err) {
      console.warn('Mood save notice:', err);
    }

    // Immediately close modal on selection as required
    onClose();
  };

  const handleSave = async () => {
    setSaving(true);
    triggerHaptic('success');
    try {
      await setMyMood(selectedMood, selectedEmoji, note);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How is your heart feeling today? ❤️"
      subtitle="Select a status to update your heart indicator"
      scoped={true}
    >
      <div className="space-y-4">
        {/* Mood Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {MOODS.map((item) => {
            const isSelected = selectedMood === item.mood;
            return (
              <button
                key={item.mood}
                type="button"
                onClick={() => handleSelect(item)}
                className={`
                  p-3 rounded-xl text-left transition-all duration-200 border
                  flex flex-col items-center text-center
                  ${
                    isSelected
                      ? 'bg-rose-500/20 border-rose-500 shadow-glow-sm scale-[1.02]'
                      : 'bg-white/[0.03] border-white/10 hover:border-rose-400/40 hover:bg-white/[0.06]'
                  }
                `}
              >
                <span className="text-3xl mb-1.5 transform transition-transform hover:scale-125">
                  {item.emoji}
                </span>
                <span className="text-sm font-medium text-white">
                  {item.mood}
                </span>
                <span className="text-[11px] text-rose-200/60 line-clamp-1 mt-0.5">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-medium text-rose-200/80 mb-1.5">
            Add a sweet note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Can't wait for our dinner tonight..."
            className="w-full glass-input px-3 py-2 text-sm"
            maxLength={100}
          />
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-2 pt-2">
          <RomanticButton variant="secondary" onClick={onClose}>
            Cancel
          </RomanticButton>
          <RomanticButton variant="primary" loading={saving} onClick={handleSave}>
            Update Mood ❤️
          </RomanticButton>
        </div>
      </div>
    </Modal>
  );
}
