import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { EmptyState } from '../components/common/EmptyState';
import { SwitchUI } from '../components/common/SwitchUI';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { PageHeader } from '../components/common/PageHeader';
import { iosSpring, triggerHaptic } from '../utils/iosMotion';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import {
  subscribeToLoveThoughts,
  addLoveThought,
  deleteLoveThought
} from '../services/firebaseService';
import { formatTimeAgo } from '../utils/dateUtils';
import { Sparkles, Heart, Eye, EyeOff, Trash2, Send, Lock } from 'lucide-react';

export function LoveThoughtsPage() {
  const { currentUser } = useAuth();
  const { couple, partnerName } = useCouple();

  const [thoughts, setThoughts] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [visibility, setVisibility] = useState('shared');
  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!couple?.id) return;
    const unsub = subscribeToLoveThoughts(couple.id, (list) => setThoughts(list));
    return () => unsub && unsub();
  }, [couple?.id]);

  const currentUserId = currentUser?.id || currentUser?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.trim() || !couple?.id || !currentUser) return;
    setSubmitting(true);
    try {
      await addLoveThought(couple.id, {
        coupleId: couple.id,
        createdBy: currentUserId,
        authorName: currentUser.name,
        content: newContent.trim(),
        visibility,
        isFavorite: false
      });
      setNewContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!couple?.id) return;
    if (window.confirm('Delete this thought?')) {
      await deleteLoveThought(couple.id, id);
    }
  };

  // Filter: creator sees all; partner sees only "shared", filtered by active tab
  const visibleThoughts = thoughts
    .filter((t) => {
      if (t.createdBy === currentUserId || t.created_by === currentUserId) return true;
      return t.visibility === 'shared';
    })
    .filter((t) => {
      if (filter === 'shared') return t.visibility === 'shared';
      if (filter === 'private') return t.visibility === 'private';
      return true;
    });

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      {/* Header with iOS Back Navigation */}
      <PageHeader
        backLabel="Our Space"
        title="Love Talks & Thoughts 💭"
        subtitle="Some feelings deserve to be written down. Whisper thoughts softly across the distance."
      />

      {/* Write New Thought Card with SwitchUI */}
      <GlassCard glow className="p-6 border-rose-500/25">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            rows={3}
            required
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="“I don't always know how to explain what you mean to me, but somehow every ordinary day becomes special...”"
            className="w-full glass-input p-3.5 text-sm font-normal leading-relaxed rounded-xl"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1 border-t border-white/5">
            <div className="flex items-center gap-3">
              <SwitchUI
                checked={visibility === 'shared'}
                onChange={(val) => {
                  setVisibility(val ? 'shared' : 'private');
                  triggerHaptic('light');
                }}
                color="rose"
                size="sm"
                iconOn="❤️"
                iconOff="🔒"
              />
              <div className="text-xs">
                <span className="text-white font-medium">
                  {visibility === 'shared' ? `Share with ${partnerName || 'Partner'} ❤️` : 'Private (Only Me) 🔒'}
                </span>
                <span className="text-rose-200/50 block text-[11px]">
                  {visibility === 'shared' ? 'Visible in both partner feeds' : 'Visible only in your private journal'}
                </span>
              </div>
            </div>

            <RomanticButton type="submit" loading={submitting} icon={Send} size="md">
              Save Thought
            </RomanticButton>
          </div>
        </form>
      </GlassCard>

      {/* iOS Segmented Filter */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <h2 className="text-xs sm:text-sm font-semibold text-rose-200/80">
          Whispered Moments ({visibleThoughts.length})
        </h2>
        <SegmentedControl
          options={[
            { value: 'all', label: 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { value: 'shared', label: 'Shared', icon: <Heart className="w-3.5 h-3.5" /> },
            { value: 'private', label: 'Private', icon: <Lock className="w-3.5 h-3.5" /> }
          ]}
          value={filter}
          onChange={(val) => setFilter(val)}
          size="sm"
        />
      </div>

      {/* Stream of Thoughts with iOS Spring Physics */}
      {visibleThoughts.length === 0 ? (
        <EmptyState
          emoji="💭"
          title="No love thoughts written yet"
          description="Maybe today is the perfect day to write what your heart has been trying to say."
        />
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence>
            {visibleThoughts.map((thought) => {
              const isMe = thought.createdBy === currentUserId || thought.created_by === currentUserId;
              return (
                <motion.div
                  key={thought.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={iosSpring}
                >
                  <GlassCard hoverEffect className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center justify-center">
                          {thought.authorName ? thought.authorName[0] : '❤️'}
                        </span>
                        <div>
                          <span className="text-xs font-semibold text-white block">
                            {isMe ? 'You' : thought.authorName}
                          </span>
                          <span className="text-[10px] text-rose-200/50 block">
                            {formatTimeAgo(thought.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {thought.visibility === 'private' ? (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-rose-200/60 border border-white/5">
                            <EyeOff className="w-3 h-3" />
                            <span>Private</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Heart className="w-3 h-3 fill-rose-400" />
                            <span>Shared</span>
                          </span>
                        )}

                        {isMe && (
                          <button
                            onClick={() => handleDelete(thought.id)}
                            className="p-1.5 rounded-lg text-rose-300/40 hover:text-red-400 hover:bg-white/5 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-base font-normal text-white/95 leading-relaxed pl-3 border-l-2 border-rose-400/40">
                      “{thought.content}”
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
