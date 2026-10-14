import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  MapPin,
  Tag,
  Heart,
  Check,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { updateStory } from '../../services/firebaseService';
import { processUploadedImage, ensureImageDataUrl } from '../../utils/imageUtils';

const STORY_PRESET_IMAGES = [
  {
    name: 'Sunset Coast',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tag: 'Golden Hour'
  },
  {
    name: 'Cafe Glow',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Cozy Moments'
  },
  {
    name: 'Midnight Sky',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    tag: 'Forever Us'
  },
  {
    name: 'Blossoms',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80',
    tag: 'Daily Bloom'
  }
];

const STORY_TAGS = [
  'Thinking of You',
  'Daily Bloom',
  'Date Night',
  'Forever Us',
  'Golden Hour',
  'Cozy Moments'
];

export function CreateStoryModal({
  isOpen,
  onClose,
  initialStoryType = 'our_stories',
  storyData = {},
  onStoryUpdated
}) {
  const { currentUser } = useAuth();
  const { couple } = useCouple();

  const fileInputRef = useRef(null);

  const [selectedStoryType, setSelectedStoryType] = useState(initialStoryType);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedTag, setSelectedTag] = useState(STORY_TAGS[0]);

  // Image Upload & Binary Conversion State
  const [uploadedImage, setUploadedImage] = useState(null);
  const [presetImage, setPresetImage] = useState(STORY_PRESET_IMAGES[0].url);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const activeImage = uploadedImage?.dataUrl || presetImage;

  // Handle local file selection & compress directly to Base64 binary for Firestore Free Tier
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid photo (JPEG, PNG, WEBP)');
      return;
    }

    try {
      setIsCompressing(true);
      setUploadError(null);

      // High-performance compression specifically configured for vertical Instagram Story dimensions
      const processed = await processUploadedImage(file, {
        maxWidth: 1080,
        maxHeight: 1920,
        quality: 0.8,
        maxSizeBytes: 380 * 1024 // Well under Firestore's 1MB limit
      });

      setUploadedImage(processed);
      setCompressionStats({
        original: processed.originalSizeFormatted,
        compressed: processed.compressedSizeFormatted,
        savings: processed.savingsPercent
      });
    } catch (err) {
      console.error('Image compression failed:', err);
      setUploadError('Could not process photo. Please try another image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClearUploadedImage = () => {
    setUploadedImage(null);
    setCompressionStats(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() && !caption.trim()) return;

    setIsSubmitting(true);
    const coupleId = couple?.id || 'demo_couple_123';
    const targetStory = storyData[selectedStoryType] || {
      id: selectedStoryType,
      title: selectedStoryType === 'our_stories' ? 'Our Stories' : "Eren's Updates",
      subtext: selectedStoryType === 'our_stories' ? 'Your Story with Eren & Us' : 'Your Story with Eren',
      slides: []
    };

    const newSlide = {
      id: `s_${Date.now()}`,
      title: title.trim() || 'A Special Moment',
      caption: caption.trim() || 'Cherishing every heartbeat with you.',
      image: activeImage,
      location: location.trim() || 'Our Sanctuary',
      tag: selectedTag,
      timeAgo: 'Just now',
      likesCount: 1,
      viewers: [
        {
          name: currentUser?.nickname || currentUser?.name || 'Eren',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
          time: 'Just now'
        }
      ]
    };

    const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
    const updatedSlides = [...(targetStory.slides || []), newSlide];
    const updatedStoryDoc = {
      ...targetStory,
      avatar: (selectedStoryType === 'eren_updates' && isEren && currentUser?.avatar)
        ? currentUser.avatar
        : (targetStory.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'),
      slides: updatedSlides,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateStory(coupleId, selectedStoryType, updatedStoryDoc);
    } catch (err) {
      console.warn('updateStory Firestore error fallback:', err);
    }

    if (onStoryUpdated) {
      onStoryUpdated(selectedStoryType, updatedStoryDoc);
    }

    confetti({
      particleCount: 60,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#FF2A7A', '#FF758F', '#FFE5EC', '#A855F7']
    });

    setIsSubmitting(false);
    handleClearUploadedImage();
    setTitle('');
    setCaption('');
    setLocation('');
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-0"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-[430px] max-h-[92vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl bg-[#14081c] border border-rose-500/30 p-4 sm:p-5 shadow-[0_0_60px_rgba(255,42,122,0.4)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#14081c] flex items-center justify-center">
                  <Camera className="w-3.5 h-3.5 text-rose-300" />
                </div>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Add to Story
                </h2>
                <p className="text-[11px] text-rose-300/80">
                  Post a 24h moment to Instagram Stories
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
            {/* 1. Target Story Ring Choice */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1.5">
                Select Story Ring
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStoryType('our_stories')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedStoryType === 'our_stories'
                      ? 'border-rose-400 bg-rose-500/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/[0.04] text-rose-200/70 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full border border-rose-400 flex items-center justify-center">
                    {selectedStoryType === 'our_stories' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Our Stories</div>
                    <div className="text-[10px] opacity-75">Shared with Us</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStoryType('eren_updates')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    selectedStoryType === 'eren_updates'
                      ? 'border-purple-400 bg-purple-500/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/[0.04] text-rose-200/70 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full border border-purple-400 flex items-center justify-center">
                    {selectedStoryType === 'eren_updates' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">Eren's Updates</div>
                    <div className="text-[10px] opacity-75">Personal Story</div>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Photo Upload / Compression Dropzone */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Story Photo (Device Upload)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Firestore Free Tier Ready
                </span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="story-file-upload"
              />

              {uploadedImage ? (
                /* Live Preview with Compression Stats */
                <div className="relative rounded-2xl overflow-hidden border border-rose-400/50 bg-black/40">
                  <img
                    src={ensureImageDataUrl(uploadedImage.dataUrl)}
                    alt="Story preview"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                  {/* Top Stats Tag */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                    {compressionStats && (
                      <div className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md flex items-center gap-1.5 text-[10px] text-emerald-300 font-medium">
                        <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>
                          {compressionStats.original} → {compressionStats.compressed} ({compressionStats.savings}% saved)
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleClearUploadedImage}
                      className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-rose-200 hover:text-white transition-all cursor-pointer ml-auto"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                    <span className="text-[10px] text-rose-200/90 font-medium truncate">
                      ✓ Binary encoded directly for Firestore
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-[10px] text-white font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Drag/Click to Pick Image */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                    isCompressing
                      ? 'border-rose-400 bg-rose-500/10'
                      : 'border-white/20 hover:border-rose-400/80 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    {isCompressing ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {isCompressing ? 'Converting photo to binary...' : 'Click to Upload from Device'}
                    </div>
                    <div className="text-[10px] text-rose-300/70 mt-0.5">
                      Automatically compresses to ~100KB for Firebase Free Tier
                    </div>
                  </div>
                </div>
              )}

              {uploadError && (
                <p className="mt-1 text-[10px] text-rose-400 font-medium">
                  {uploadError}
                </p>
              )}

              {/* Or Quick Preset Moments */}
              {!uploadedImage && (
                <div className="mt-2.5">
                  <span className="text-[10px] text-rose-300/60 block mb-1">
                    Or select a preset romantic moment:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {STORY_PRESET_IMAGES.map((item) => {
                      const isSel = presetImage === item.url;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setPresetImage(item.url)}
                          className={`relative h-14 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            isSel
                              ? 'border-rose-400 shadow-sm scale-102'
                              : 'border-white/10 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {isSel && (
                            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-rose-500 flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Title */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cherry blossoms along our trail 🌸"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* 4. Caption / Thought */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1">
                Romantic Caption / Note
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write what you felt in this moment..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            {/* 5. Mood / Tag Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-rose-400" />
                <span>Story Sticker Tag</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STORY_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTag(t)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer ${
                      selectedTag === t
                        ? 'bg-rose-500 text-white font-bold shadow-md'
                        : 'bg-white/[0.06] text-rose-200/80 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Location */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sunset Cliffs, San Diego"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-rose-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCompressing || !title.trim()}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-600 hover:opacity-95 active:scale-98 text-xs font-bold text-white shadow-[0_0_20px_rgba(255,42,122,0.5)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
                <span>{isSubmitting ? 'Publishing Story...' : 'Share to Story'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  const phoneContainer = typeof document !== 'undefined'
    ? document.getElementById('phone-screen-container')
    : null;

  return phoneContainer ? createPortal(modalContent, phoneContainer) : modalContent;
}

export default CreateStoryModal;
