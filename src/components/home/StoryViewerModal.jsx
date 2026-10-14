import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Heart,
  Send,
  Share2,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Volume2,
  VolumeX,
  Check,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { ensureImageDataUrl } from '../../utils/imageUtils';

const STORY_DURATION = 5000; // 5 seconds per slide (Instagram standard)
const TICK_INTERVAL = 50; // 50ms tick for fluid 60fps progress bar

export function StoryViewerModal({
  isOpen,
  onClose,
  initialStory = 'our_stories',
  storyData = {}
}) {
  const { currentUser } = useAuth();
  const { partnerName } = useCouple();

  // Active group ('our_stories' or 'eren_updates')
  const [activeStoryType, setActiveStoryType] = useState(initialStory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100

  // Interaction & UI states
  const [isPaused, setIsPaused] = useState(false);
  const [hideUI, setHideUI] = useState(false); // hides chrome during hold
  const [replyText, setReplyText] = useState('');
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [likedSlides, setLikedSlides] = useState({}); // { [slideId]: boolean }
  const [likeCounts, setLikeCounts] = useState({}); // { [slideId]: number }
  const [showViewersSheet, setShowViewersSheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Press & hold tracking
  const pressTimerRef = useRef(null);
  const isPressHoldingRef = useRef(false);
  const touchStartPosRef = useRef({ x: 0, y: 0, time: 0 });

  // Story groups ordering
  const storyKeys = Object.keys(storyData).length > 0 ? Object.keys(storyData) : ['our_stories', 'eren_updates'];
  const currentStoryGroup = storyData[activeStoryType] || storyData['our_stories'] || {};
  const slides = currentStoryGroup.slides || [];
  const currentSlide = slides[currentIndex] || slides[0] || {};
  const slideId = currentSlide.id || `${activeStoryType}_${currentIndex}`;

  const isErenGroup = activeStoryType === 'eren_updates' || (currentStoryGroup.title || '').toLowerCase().includes('eren');
  const isErenUser = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
  const effectiveStoryAvatar = (isErenGroup && isErenUser && currentUser?.avatar)
    ? currentUser.avatar
    : (currentStoryGroup.avatar || (isErenGroup ? currentUser?.avatar : null) || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80');

  const currentLiked = Boolean(likedSlides[slideId]);
  const currentLikesCount = (likeCounts[slideId] !== undefined)
    ? likeCounts[slideId]
    : (currentSlide.likesCount || 1);

  // 1. Notify parent layout (IPhoneMockupFrame) to completely hide the app header, status bar, and bottom navigation bar
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('pulsepath_story_state', { detail: { isOpen } })
    );

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      window.dispatchEvent(
        new CustomEvent('pulsepath_story_state', { detail: { isOpen: false } })
      );
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Sync initial story on open
  useEffect(() => {
    if (isOpen) {
      setActiveStoryType(initialStory);
      setCurrentIndex(0);
      setProgress(0);
      setIsPaused(false);
      setHideUI(false);
      setShowViewersSheet(false);
      setShowShareSheet(false);
    }
  }, [isOpen, initialStory]);

  // Reset progress when slide or story changes
  useEffect(() => {
    setProgress(0);
  }, [currentIndex, activeStoryType]);

  // -------------------------------------------------------------
  // Navigation Callbacks (Next / Prev Slide / Next Story Group)
  // -------------------------------------------------------------
  const goToNextSlide = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // Find next story group (e.g., from 'our_stories' to 'eren_updates')
      const currentGroupIndex = storyKeys.indexOf(activeStoryType);
      if (currentGroupIndex < storyKeys.length - 1) {
        const nextGroupKey = storyKeys[currentGroupIndex + 1];
        setActiveStoryType(nextGroupKey);
        setCurrentIndex(0);
        setProgress(0);
      } else {
        // End of all stories -> close viewer cleanly
        onClose();
      }
    }
  }, [currentIndex, slides.length, storyKeys, activeStoryType, onClose]);

  const goToPrevSlide = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else {
      // Go to previous story group's last slide
      const currentGroupIndex = storyKeys.indexOf(activeStoryType);
      if (currentGroupIndex > 0) {
        const prevGroupKey = storyKeys[currentGroupIndex - 1];
        const prevGroupSlides = storyData[prevGroupKey]?.slides || [];
        setActiveStoryType(prevGroupKey);
        setCurrentIndex(Math.max(0, prevGroupSlides.length - 1));
        setProgress(0);
      } else {
        // Restart current slide
        setProgress(0);
      }
    }
  }, [currentIndex, storyKeys, activeStoryType, storyData]);

  // -------------------------------------------------------------
  // High-Precision Segmented Timer (50ms Interval)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen || isPaused || showViewersSheet || showShareSheet || !slides.length) {
      return;
    }

    const increment = (TICK_INTERVAL / STORY_DURATION) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNextSlide();
          return 0;
        }
        return prev + increment;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isOpen, isPaused, showViewersSheet, showShareSheet, slides.length, goToNextSlide]);

  // -------------------------------------------------------------
  // Keyboard Controls (Esc, Left Arrow, Right Arrow, Space to Pause)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showViewersSheet) setShowViewersSheet(false);
        else if (showShareSheet) setShowShareSheet(false);
        else onClose();
      } else if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      } else if (e.key === ' ') {
        setIsPaused((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showViewersSheet, showShareSheet, goToNextSlide, goToPrevSlide, onClose]);

  // -------------------------------------------------------------
  // Touch / Pointer Gestures (Tap Left/Right, Press-and-Hold to Pause)
  // -------------------------------------------------------------
  const handlePointerDown = (e) => {
    if (showViewersSheet || showShareSheet) return;

    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;
    touchStartPosRef.current = { x: clientX, y: clientY, time: Date.now() };

    isPressHoldingRef.current = false;

    // After 180ms hold, freeze progress and hide all UI chrome for clean photo viewing
    pressTimerRef.current = setTimeout(() => {
      isPressHoldingRef.current = true;
      setIsPaused(true);
      setHideUI(true);
    }, 180);
  };

  const handlePointerUp = (e) => {
    if (showViewersSheet || showShareSheet) return;

    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    // If user was holding down, restore UI and unpause
    if (isPressHoldingRef.current) {
      isPressHoldingRef.current = false;
      setIsPaused(false);
      setHideUI(false);
      return;
    }

    // Short tap: Tap left 35% -> Prev, Right 65% -> Next
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0]?.clientX) || 0;
    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();
    const relativeX = clientX - rect.left;

    if (relativeX < rect.width * 0.35) {
      goToPrevSlide();
    } else {
      goToNextSlide();
    }

    setIsPaused(false);
    setHideUI(false);
  };

  const handlePointerCancel = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    isPressHoldingRef.current = false;
    setIsPaused(false);
    setHideUI(false);
  };

  // -------------------------------------------------------------
  // Reactions & Floating Animations
  // -------------------------------------------------------------
  const spawnFloatingReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const left = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingReactions((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((item) => item.id !== id));
    }, 1900);
  };

  const handleLikeToggle = (e) => {
    e?.stopPropagation();
    const nextState = !currentLiked;
    setLikedSlides((prev) => ({ ...prev, [slideId]: nextState }));
    setLikeCounts((prev) => ({
      ...prev,
      [slideId]: nextState ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1)
    }));

    if (nextState) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FF2A7A', '#FF4D6D', '#FF758F', '#FFE5EC']
      });
      spawnFloatingReaction('❤️');
    }
  };

  const handleDoubleTap = (e) => {
    e?.stopPropagation();
    if (!currentLiked) {
      setLikedSlides((prev) => ({ ...prev, [slideId]: true }));
      setLikeCounts((prev) => ({ ...prev, [slideId]: currentLikesCount + 1 }));
    }
    setShowDoubleTapHeart(true);
    spawnFloatingReaction('❤️');
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#FF2A7A', '#FF4D6D', '#FF758F']
    });
    setTimeout(() => setShowDoubleTapHeart(false), 900);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    spawnFloatingReaction('💌');
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.85 },
      colors: ['#FF2A7A', '#FF758F', '#A855F7']
    });

    setReplyText('');
    setIsPaused(false);
  };

  const handleShareStory = (e) => {
    e?.stopPropagation();
    setShowShareSheet(true);
    setIsPaused(true);
  };

  const handleConfirmShareToPartner = () => {
    confetti({
      particleCount: 40,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#FF2A7A', '#A855F7', '#FFE5EC']
    });
    setShareSuccessToast(true);
    setTimeout(() => {
      setShareSuccessToast(false);
      setShowShareSheet(false);
      setIsPaused(false);
    }, 1800);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShareSuccessToast(true);
    setTimeout(() => {
      setShareSuccessToast(false);
      setShowShareSheet(false);
      setIsPaused(false);
    }, 1800);
  };

  // Mock social viewers for realistic Instagram Activity tracking
  const viewersList = currentSlide.viewers || [
    {
      id: 'v1',
      name: partnerName || 'Mikasa',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      timeAgo: '2m ago',
      reaction: '❤️',
      status: 'Viewed your shared story'
    },
    {
      id: 'v2',
      name: currentUser?.nickname || currentUser?.name || 'Eren',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      timeAgo: 'Just now',
      reaction: '✨',
      status: 'Story Author'
    }
  ];

  // Target portal container: #phone-screen-container covers 100% of the phone frame, or fallback to body
  const portalRoot =
    (typeof document !== 'undefined' && document.getElementById('phone-screen-container')) ||
    (typeof document !== 'undefined' && document.body);

  if (!isOpen || !currentSlide || !portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.8 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100 || info.velocity.y > 500) {
            onClose();
          }
        }}
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="absolute inset-0 z-[100] w-full h-full bg-black flex flex-col justify-between overflow-hidden select-none touch-none"
      >
        {/* ============================================================ */}
        {/* 1. MEDIA LAYER (Story Background Photo + Double-Tap Heart) */}
        {/* ============================================================ */}
        <div
          className="absolute inset-0 z-0 bg-black cursor-pointer overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onDoubleClick={handleDoubleTap}
        >
          <motion.img
            key={currentSlide.image}
            src={ensureImageDataUrl(currentSlide.image || currentSlide.mediaUrl)}
            alt={currentSlide.title || 'Story slide'}
            initial={{ scale: 1 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 5, ease: 'easeOut' }}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* Top & Bottom Ambient Shadow Vignettes for High Readability */}
          <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-rose-950/15 mix-blend-color pointer-events-none" />

          {/* Double-Tap Heart Burst Animation */}
          <AnimatePresence>
            {showDoubleTapHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 0.95] }}
                exit={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-28 h-28 fill-rose-500 text-rose-400 drop-shadow-[0_0_40px_rgba(255,42,122,0.95)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================ */}
        {/* 2. FLOATING REACTION PARTICLES LAYER */}
        {/* ============================================================ */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingReactions.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: '78vh', scale: 0.7 }}
              animate={{ opacity: 0, y: '16vh', scale: 1.7 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              style={{ left: `${item.left}%` }}
              className="absolute text-5xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        {/* ============================================================ */}
        {/* 3. TOP CHROME: Progress Bars & Instagram Story Header */}
        {/* ============================================================ */}
        <div
          className={`relative z-20 pt-3 px-3 sm:px-4 flex flex-col gap-2 transition-opacity duration-200 ${
            hideUI ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Top Segmented Progress Indicators */}
          <div className="flex items-center gap-1.5 w-full">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-1 rounded-full bg-white/25 overflow-hidden backdrop-blur-sm"
              >
                <div
                  className="h-full bg-white rounded-full transition-none"
                  style={{
                    width:
                      idx < currentIndex
                        ? '100%'
                        : idx === currentIndex
                        ? `${progress}%`
                        : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Instagram Header: Author Info, Time, Audio Toggle & Close */}
          <div className="flex items-center justify-between mt-1">
            {/* Left: Avatar with Ring + Names */}
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Vibrant Instagram Gradient Ring */}
              <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-md shrink-0">
                <div className="w-full h-full rounded-full p-[1px] bg-black">
                  <img
                    src={ensureImageDataUrl(effectiveStoryAvatar)}
                    alt={currentStoryGroup.title}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-xs font-bold tracking-tight truncate">
                    {currentStoryGroup.title}
                  </span>
                  <span className="text-[11px] text-white/75 shrink-0">
                    • {currentSlide.timeAgo || '2h'}
                  </span>
                </div>
                <span className="text-[10px] text-rose-300/90 font-medium truncate">
                  {currentStoryGroup.subtext}
                </span>
              </div>
            </div>

            {/* Right: Audio Toggle & Close (X) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white/90 flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-md"
                aria-label="Close stories"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. BOTTOM CHROME: Caption, Seen-by Pill & Actions Bar */}
        {/* ============================================================ */}
        <div
          className={`relative z-20 pb-4 px-3 sm:px-4 flex flex-col gap-2.5 transition-opacity duration-200 ${
            hideUI ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {/* Story Caption & Location Card */}
          <motion.div
            key={slideId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/15 text-white shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 font-semibold tracking-wider">
                {currentSlide.tag || 'Our Moment'}
              </span>
              {currentSlide.location && (
                <span className="text-[10px] text-white/75 truncate flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                  <span>{currentSlide.location}</span>
                </span>
              )}
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
              {currentSlide.title}
            </h3>
            {currentSlide.caption && (
              <p className="text-xs text-rose-100/90 font-normal mt-1 leading-relaxed line-clamp-3">
                {currentSlide.caption}
              </p>
            )}
          </motion.div>

          {/* Instagram "Seen by" Activity Strip (Social Tracking) */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setShowViewersSheet(true);
                setIsPaused(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/45 hover:bg-black/65 border border-white/15 text-[11px] text-rose-200/90 font-medium backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex -space-x-1.5 items-center">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Viewer"
                  className="w-4 h-4 rounded-full border border-black object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80"
                  alt="Viewer"
                  className="w-4 h-4 rounded-full border border-black object-cover"
                />
              </div>
              <span>Seen by {partnerName || 'Mikasa'}</span>
              <Eye className="w-3 h-3 text-rose-400 ml-0.5" />
            </button>

            {/* Quick Floating Emojis */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {['❤️', '😍', '🔥', '🥺', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => spawnFloatingReaction(emoji)}
                  className="text-base hover:scale-130 active:scale-95 transition-transform p-0.5 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Instagram Footer Actions Bar (Input + Like + Send) */}
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            {/* Rounded Capsule Message Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => {
                  if (!showViewersSheet && !showShareSheet) setIsPaused(false);
                }}
                placeholder={`Send message to ${activeStoryType === 'our_stories' ? 'Us' : (partnerName || 'Eren')}...`}
                className="w-full min-h-[42px] px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 text-xs text-white placeholder-white/55 focus:outline-none focus:border-rose-400 backdrop-blur-md transition-colors"
              />
            </div>

            {/* Like Button with Animation & Heart Counter */}
            <motion.button
              type="button"
              onClick={handleLikeToggle}
              whileTap={{ scale: 0.8 }}
              className="relative w-11 h-11 rounded-full bg-white/[0.08] hover:bg-rose-500/25 border border-white/20 hover:border-rose-400/40 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md shrink-0"
              title={currentLiked ? 'Unlike story' : 'Like story'}
            >
              <Heart
                className={`w-5 h-5 transition-transform ${
                  currentLiked
                    ? 'fill-rose-500 text-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.9)] scale-110'
                    : 'text-white/90'
                }`}
              />
              {currentLikesCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md">
                  {currentLikesCount}
                </span>
              )}
            </motion.button>

            {/* Instagram Share / Paper Plane Button */}
            {replyText.trim() ? (
              <motion.button
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                type="submit"
                className="w-11 h-11 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={handleShareStory}
                className="w-11 h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer backdrop-blur-md shrink-0"
                title="Share story"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* ============================================================ */}
        {/* 5. INSTAGRAM STORY ACTIVITY / VIEWERS BOTTOM SHEET */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showViewersSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-end"
              onClick={() => {
                setShowViewersSheet(false);
                setIsPaused(false);
              }}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-h-[70vh] rounded-t-3xl bg-[#14081c] border-t border-rose-500/30 p-4 sm:p-5 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Story Activity & Viewers
                    </h4>
                  </div>
                  <span className="text-xs text-rose-300 font-semibold">
                    {viewersList.length} Viewers
                  </span>
                </div>

                <div className="mt-3 space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                  {viewersList.map((viewer) => (
                    <div
                      key={viewer.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/5"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={ensureImageDataUrl(viewer.avatar)}
                          alt={viewer.name}
                          className="w-9 h-9 rounded-full object-cover border border-rose-400/40"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{viewer.name}</span>
                            <span className="text-sm">{viewer.reaction}</span>
                          </div>
                          <span className="text-[10px] text-rose-300/70">{viewer.status}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/50">{viewer.timeAgo}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowViewersSheet(false);
                    setIsPaused(false);
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-rose-200 active:scale-98 transition-all cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* 6. INSTAGRAM SHARE STORY BOTTOM SHEET */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showShareSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-end"
              onClick={() => {
                setShowShareSheet(false);
                setIsPaused(false);
              }}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full rounded-t-3xl bg-[#14081c] border-t border-rose-500/30 p-4 sm:p-5 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-rose-400" />
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Share Story
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareSheet(false);
                      setIsPaused(false);
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleConfirmShareToPartner}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-purple-500/20 hover:from-rose-500/30 hover:to-purple-500/30 border border-rose-400/40 flex items-center justify-between transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                        alt="Partner"
                        className="w-10 h-10 rounded-full object-cover border-2 border-rose-400/60"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white group-hover:text-rose-200">
                          Send to {partnerName || 'Mikasa'}
                        </div>
                        <div className="text-[10px] text-rose-300/80">
                          Private message flutter 💌
                        </div>
                      </div>
                    </div>
                    <Send className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
                      <Bookmark className="w-4 h-4 text-rose-400" />
                      <span>Copy Story Link</span>
                    </div>
                    <span className="text-[10px] text-rose-300">Copy</span>
                  </button>
                </div>

                <AnimatePresence>
                  {shareSuccessToast && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 py-2 px-3 rounded-xl bg-rose-500/30 border border-rose-400/40 text-center text-xs text-rose-200 font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Story shared successfully! 💌</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    portalRoot
  );
}

export default StoryViewerModal;
