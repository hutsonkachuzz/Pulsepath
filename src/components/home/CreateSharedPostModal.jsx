import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  MapPin,
  Smile,
  Heart,
  Sparkles,
  Check,
  UploadCloud,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { addSharedMoment } from '../../services/firebaseService';
import { processUploadedImage, ensureImageDataUrl } from '../../utils/imageUtils';

export const PRESET_MOMENT_IMAGES = [
  {
    name: 'Sunset Glow',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    tag: 'Golden Hour'
  },
  {
    name: 'Cozy Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    tag: 'Warmth'
  },
  {
    name: 'Starry Sky',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
    tag: 'Eternal'
  },
  {
    name: 'Cherry Blossoms',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80',
    tag: 'Romance'
  },
  {
    name: 'Florence Walk',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
    tag: 'Adventures'
  },
  {
    name: 'Holding Hands',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=80',
    tag: 'Together'
  }
];

export const MOOD_OPTIONS = [
  { label: 'Loved', emoji: '❤️' },
  { label: 'Romantic', emoji: '🥰' },
  { label: 'Blessed', emoji: '✨' },
  { label: 'Cozy', emoji: '☕' },
  { label: 'Missing You', emoji: '🥺' }
];

export function CreateSharedPostModal({ isOpen, onClose, onPostCreated }) {
  const { currentUser } = useAuth();
  const { couple } = useCouple();

  const fileInputRef = useRef(null);

  // 1. Core State Management Variables per Requirements
  const [momentPhoto, setMomentPhoto] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [loveNote, setLoveNote] = useState('');
  const [moodTag, setMoodTag] = useState('Loved');
  const [location, setLocation] = useState('');

  // 2. Upload, compression & UI interaction states
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File upload handler with direct Canvas Base64 compression
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    try {
      setIsCompressing(true);
      setUploadError(null);
      setValidationError('');

      // High-performance client-side Canvas compression to ensure binary size stays well under Firestore 1MB cap
      const processed = await processUploadedImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.78,
        maxSizeBytes: 380 * 1024
      });

      setMomentPhoto(processed.dataUrl);
      setCompressionStats({
        original: processed.originalSizeFormatted,
        compressed: processed.compressedSizeFormatted,
        savings: processed.savingsPercent
      });
      setCustomUrlInput('');
    } catch (err) {
      console.error('Failed to process image:', err);
      setUploadError('Failed to process image. Please try another photo.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClearPhoto = () => {
    setMomentPhoto('');
    setCompressionStats(null);
    setCustomUrlInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectPreset = (url) => {
    setMomentPhoto(url);
    setCompressionStats(null);
    setValidationError('');
  };

  const handleUrlInputChange = (e) => {
    const val = e.target.value;
    setCustomUrlInput(val);
    setMomentPhoto(val.trim());
    setCompressionStats(null);
    setValidationError('');
  };

  // 3. Form Submission & Firestore Integration Handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setValidationError('');
    setSubmitError('');

    // Requirement 2: Validation check
    if (!postTitle.trim()) {
      setValidationError('Please enter a Post Title / Moment Caption.');
      return;
    }

    if (!momentPhoto || !momentPhoto.trim()) {
      setValidationError('Please choose or upload a Moment Photo before publishing.');
      return;
    }

    setIsSubmitting(true);

    try {
      const authorName = currentUser?.nickname || currentUser?.name || 'Eren';
      const currentUserId = currentUser?.id || currentUser?.uid || 'user_eren_101';
      const effectiveCoupleId = couple?.id || couple?.coupleCode || 'demo_couple_123';
      const isEren = authorName.toLowerCase().includes('eren') || currentUserId === 'user_eren_101';

      // Dynamically resolve author avatar prioritizing custom uploaded DP
      const authorAvatar = (isEren && currentUser?.avatar)
        ? currentUser.avatar
        : (currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80');

      const newPostData = {
        id: `moment_${Date.now()}`,
        coupleId: effectiveCoupleId,
        createdBy: currentUserId,
        authorName: authorName,
        authorAvatar: authorAvatar,
        postTitle: postTitle.trim(),
        title: postTitle.trim(), // for broad component compatibility
        loveNote: loveNote.trim(),
        description: loveNote.trim(), // for broad component compatibility
        momentPhoto: momentPhoto,
        image: momentPhoto,
        images: [momentPhoto],
        moodTag: moodTag,
        mood: moodTag,
        location: location.trim() || 'Our Private Sanctuary',
        tags: [moodTag, 'Shared Moment', 'Us'],
        likesCount: 1,
        isLiked: true,
        comments: [
          {
            id: `c_${Date.now()}`,
            author: authorName,
            text: 'Forever cherish this moment ❤️',
            timeAgo: 'Just now'
          }
        ],
        createdAt: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };

      // Requirement 3: Save directly to Firestore collection
      const savedResult = await addSharedMoment(effectiveCoupleId, newPostData);

      // Requirement 4: Post-Submission Actions
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FF2A7A', '#FF758F', '#FFE5EC', '#A855F7']
      });

      if (onPostCreated) {
        onPostCreated(savedResult || newPostData);
      }

      // Reset form states
      setPostTitle('');
      setLoveNote('');
      setMomentPhoto('');
      setCustomUrlInput('');
      setCompressionStats(null);
      setLocation('');
      setMoodTag('Loved');
      setValidationError('');
      setSubmitError('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error('Failed to publish shared moment:', err);
      setSubmitError(err.message || 'Failed to publish to feed. Please check your connection and try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="absolute inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 z-0"
        />

        {/* Modal Sheet Content */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.95 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-[430px] max-h-[min(90dvh,calc(100dvh-env(safe-area-inset-top,0px)-1rem))] overflow-y-auto rounded-t-[32px] sm:rounded-3xl bg-[#14081c] border border-rose-500/30 p-4 sm:p-5 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] sm:pb-5 pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] shadow-[0_0_50px_rgba(255,42,122,0.35)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Create Shared Moment
                </h2>
                <p className="text-[11px] text-rose-300/80">
                  A new story for Eren & Mikasa
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

          {/* Validation & Submission Error Banners */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{validationError}</span>
              </motion.div>
            )}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-3 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{submitError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
            {/* 1. Moment Photo Selection & Upload Tabs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-rose-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Moment Photo *</span>
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'text-rose-300/70 hover:text-rose-200'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      activeTab === 'presets'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'text-rose-300/70 hover:text-rose-200'
                    }`}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('url')}
                    className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      activeTab === 'url'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'text-rose-300/70 hover:text-rose-200'
                    }`}
                  >
                    URL
                  </button>
                </div>
              </div>

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="post-file-upload"
                  />

                  {momentPhoto && activeTab === 'upload' ? (
                    <div className="relative rounded-2xl overflow-hidden border border-rose-400/50 bg-black/40">
                      <img
                        src={ensureImageDataUrl(momentPhoto)}
                        alt="Uploaded moment"
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                        {compressionStats && (
                          <div className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                            <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>
                              {compressionStats.original} → {compressionStats.compressed} ({compressionStats.savings}% saved)
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleClearPhoto}
                          className="p-1 rounded-full bg-black/60 hover:bg-black/80 text-rose-200 hover:text-white transition-all cursor-pointer ml-auto"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
                        <span className="text-[10px] text-emerald-300 font-medium">
                          ✓ Ready for Firestore Free Tier
                        </span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-500 text-[10px] text-white font-semibold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Change Photo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
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
                          {isCompressing ? 'Compressing photo for Free Tier...' : 'Choose Photo from Device'}
                        </div>
                        <div className="text-[10px] text-rose-300/70 mt-0.5">
                          Stores binary directly in Firestore without Cloud Storage fees
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-1 text-[10px] text-rose-400 font-medium">
                      {uploadError}
                    </p>
                  )}
                </div>
              )}

              {/* Presets Tab */}
              {activeTab === 'presets' && (
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_MOMENT_IMAGES.map((img) => {
                    const isSelected = momentPhoto === img.url;
                    return (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => handleSelectPreset(img.url)}
                        className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)] scale-[1.02]'
                            : 'border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                          <span className="text-[9px] text-white font-medium truncate">
                            {img.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* URL Tab */}
              {activeTab === 'url' && (
                <div>
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={handleUrlInputChange}
                    placeholder="Paste an image URL here..."
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
                  />
                  {customUrlInput.trim() && (
                    <div className="mt-2 h-28 rounded-xl overflow-hidden border border-white/10">
                      <img
                        src={customUrlInput}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => setUploadError('Could not load image from this URL')}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Post Title / Moment Caption * */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1">
                Post Title / Moment Caption *
              </label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => {
                  setPostTitle(e.target.value);
                  setValidationError('');
                }}
                placeholder="e.g. Our cozy evening under the city lights"
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400"
              />
            </div>

            {/* 3. Love Note / Description */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1">
                Love Note / Description
              </label>
              <textarea
                rows={2}
                value={loveNote}
                onChange={(e) => setLoveNote(e.target.value)}
                placeholder="Write your feelings for this memory..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-rose-400 resize-none"
              />
            </div>

            {/* 4. Mood Tag Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-rose-200 mb-1.5 flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-rose-400" />
                <span>Mood Tag</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOOD_OPTIONS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setMoodTag(item.label)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1 ${
                      moodTag === item.label
                        ? 'bg-rose-500 text-white font-semibold shadow-md'
                        : 'bg-white/[0.06] text-rose-200/80 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Location */}
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

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-rose-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isCompressing}
                className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:opacity-95 active:scale-98 text-xs font-bold text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Publish to Feed</span>
                  </>
                )}
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

export default CreateSharedPostModal;
