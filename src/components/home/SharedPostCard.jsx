import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Send, MoreHorizontal, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { updateMemory } from '../../services/firebaseService';
import { ensureImageDataUrl } from '../../utils/imageUtils';

export function SharedPostCard({ post, onLikeToggle }) {
  const { currentUser } = useAuth();
  const { couple } = useCouple();

  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isSaved, setIsSaved] = useState(post.isFavorite ?? false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const authorName = post.authorName || 'Eren';
  const rawPostImage = (post.images && post.images[0]) || post.image || post.momentPhoto || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80';
  const postImage = ensureImageDataUrl(rawPostImage);

  const isAuthorEren = authorName.toLowerCase().includes('eren');
  const isCurrentUserEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';

  const defaultAvatar = isAuthorEren
    ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

  const isDefaultUnsplash = post.authorAvatar?.includes('photo-1539571696357');
  const effectiveAvatar = (isAuthorEren && isCurrentUserEren && currentUser?.avatar)
    ? currentUser.avatar
    : ((isAuthorEren && isDefaultUnsplash && currentUser?.avatar) ? currentUser.avatar : (post.authorAvatar || (isAuthorEren ? (currentUser?.avatar || defaultAvatar) : defaultAvatar)));
  const avatar = ensureImageDataUrl(effectiveAvatar);

  const handleLike = async () => {
    const nextState = !isLiked;
    const nextCount = nextState ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextState);
    setLikesCount(nextCount);

    if (nextState) {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FF2A7A', '#FF758F', '#FFE5EC']
      });
    }

    if (onLikeToggle) {
      onLikeToggle(post.id, nextState);
    }

    // Persist to Firestore if post has an ID
    if (post.id) {
      const coupleId = couple?.id || 'demo_couple_123';
      try {
        await updateMemory(coupleId, post.id, {
          isLiked: nextState,
          likesCount: nextCount
        });
      } catch (err) {
        console.warn('Firestore updateMemory like error:', err);
      }
    }
  };

  const handleDoubleTap = async () => {
    if (!isLiked) {
      const nextCount = likesCount + 1;
      setIsLiked(true);
      setLikesCount(nextCount);
      if (onLikeToggle) onLikeToggle(post.id, true);

      if (post.id) {
        const coupleId = couple?.id || 'demo_couple_123';
        try {
          await updateMemory(coupleId, post.id, {
            isLiked: true,
            likesCount: nextCount
          });
        } catch (err) {
          console.warn('Firestore updateMemory double tap error:', err);
        }
      }
    }

    setShowDoubleTapHeart(true);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#FF2A7A', '#FF4D6D', '#FF758F']
    });
    setTimeout(() => setShowDoubleTapHeart(false), 900);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PulsePath - ${post.title}`,
          text: `Shared moment between Eren & Mikasa: ${post.title}`,
          url: window.location.href
        });
        return;
      } catch (err) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2400);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const currentUserName = currentUser?.nickname || currentUser?.name || 'You';
    const commentItem = {
      id: `c_${Date.now()}`,
      author: currentUserName,
      text: newComment.trim(),
      timeAgo: 'Just now'
    };

    const updatedComments = [...comments, commentItem];
    setComments(updatedComments);
    setNewComment('');

    // Persist comment to Firestore
    if (post.id) {
      const coupleId = couple?.id || 'demo_couple_123';
      try {
        await updateMemory(coupleId, post.id, {
          comments: updatedComments
        });
      } catch (err) {
        console.warn('Firestore updateMemory comment error:', err);
      }
    }
  };

  return (
    <article className="card glass-panel w-full rounded-3xl bg-[#14081c]/85 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300 hover:border-rose-500/25">
      {/* 1. Post Header */}
      <div className="flex items-center justify-between p-3 sm:p-3.5">
        <div className="flex items-center gap-2.5">
          {/* Avatar with Instagram-style mini ring */}
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 shadow-sm">
            <div className="w-full h-full rounded-full p-[1.5px] bg-[#14081c]">
              <img
                src={avatar}
                alt={authorName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {authorName}
              </span>
              {post.mood && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                  {post.mood}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-rose-300/70">
              {post.location && (
                <>
                  <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <span className="truncate max-w-[140px]">{post.location}</span>
                  <span>•</span>
                </>
              )}
              <span>{post.timeAgo || post.date || 'Today'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 text-rose-300/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Post options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Photo / Media Viewport (with Double-Tap to Heart) */}
      <div
        className="relative w-full aspect-square sm:aspect-[4/3] bg-black/50 overflow-hidden cursor-pointer"
        onDoubleClick={handleDoubleTap}
      >
        <img
          src={postImage}
          alt={post.title}
          className="w-full h-full object-cover select-none transition-transform duration-500 hover:scale-[1.02]"
          loading="lazy"
        />

        {/* Double-Tap Heart Burst Overlay */}
        <AnimatePresence>
          {showDoubleTapHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 fill-rose-500 text-rose-400 filter drop-shadow-[0_0_30px_rgba(255,42,122,0.9)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle photo ambient gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 3. Interactive Action Bar (Like, Comment, Share, Save) */}
      <div className="p-3 sm:p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Normal Like Button (Heart Icon) */}
            <motion.button
              type="button"
              onClick={handleLike}
              whileTap={{ scale: 0.8 }}
              className="group flex items-center gap-1.5 cursor-pointer focus:outline-none"
              aria-label={isLiked ? 'Unlike moment' : 'Like moment'}
            >
              <Heart
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-200 ${
                  isLiked
                    ? 'fill-rose-500 text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)] scale-110'
                    : 'text-rose-200 hover:text-rose-400 group-hover:scale-110'
                }`}
              />
              <span className="text-xs font-semibold text-rose-200/90">
                {likesCount}
              </span>
            </motion.button>

            {/* Comment Button */}
            <motion.button
              type="button"
              onClick={() => setShowComments(!showComments)}
              whileTap={{ scale: 0.8 }}
              className="group flex items-center gap-1.5 cursor-pointer focus:outline-none text-rose-200 hover:text-white"
              aria-label="View comments"
            >
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-rose-200/90">
                {comments.length}
              </span>
            </motion.button>

            {/* Share Option */}
            <motion.button
              type="button"
              onClick={handleShare}
              whileTap={{ scale: 0.8 }}
              className="group cursor-pointer focus:outline-none text-rose-200 hover:text-white"
              aria-label="Share moment"
              title="Share private moment"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            </motion.button>
          </div>

          {/* Bookmark / Favorite Button */}
          <motion.button
            type="button"
            onClick={() => setIsSaved(!isSaved)}
            whileTap={{ scale: 0.8 }}
            className="cursor-pointer focus:outline-none text-rose-200 hover:text-white"
            aria-label="Save to favorites"
          >
            <Bookmark
              className={`w-5 h-5 sm:w-6 sm:h-6 transition-all ${
                isSaved ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : ''
              }`}
            />
          </motion.button>
        </div>

        {/* Share Toast Confirmation */}
        <AnimatePresence>
          {shareToast && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-[11px] text-center py-1 px-2.5 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-500/30 font-medium"
            >
              💌 Private link copied for Eren & Mikasa!
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Caption & Romantic Content */}
        <div className="space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
            {post.postTitle || post.title}
          </h4>

          {(post.loveNote || post.description) && (
            <p className="text-xs text-rose-100/80 leading-relaxed font-normal">
              {post.loveNote || post.description}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-rose-400/90 font-medium hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 5. Inline Comment Preview / Tray */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          {/* Quick preview of last comment */}
          {comments.length > 0 && !showComments && (
            <div
              onClick={() => setShowComments(true)}
              className="text-[11px] text-rose-300/75 hover:text-rose-200 cursor-pointer flex items-center gap-1.5"
            >
              <span className="font-semibold text-white">
                {comments[comments.length - 1].author}:
              </span>
              <span className="truncate">{comments[comments.length - 1].text}</span>
              {comments.length > 1 && (
                <span className="text-[10px] text-rose-400 font-medium">
                  (View all {comments.length})
                </span>
              )}
            </div>
          )}

          {/* Expanded Comments List */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 max-h-36 overflow-y-auto pr-1"
              >
                {comments.map((c) => (
                  <div key={c.id} className="text-xs flex items-baseline justify-between gap-2">
                    <div>
                      <span className="font-bold text-white text-[11px] mr-1.5">
                        {c.author}
                      </span>
                      <span className="text-rose-200/80 text-[11px]">{c.text}</span>
                    </div>
                    <span className="text-[9px] text-rose-300/50 shrink-0">{c.timeAgo}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Comment Input */}
          <form onSubmit={handleAddComment} className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment for your love..."
              className="flex-1 min-h-[34px] px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400/60"
            />
            {newComment.trim() && (
              <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                type="submit"
                className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 active:scale-90 transition-all cursor-pointer"
                title="Post comment"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </form>
        </div>
      </div>
    </article>
  );
}

export default SharedPostCard;
