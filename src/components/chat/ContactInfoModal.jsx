import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  Check,
  Phone,
  Video,
  Palette,
  ShieldCheck,
  Star,
  Image as ImageIcon,
  Heart,
  Sparkles,
  Upload,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { RomanticButton } from '../common/RomanticButton';
import { processUploadedImage, ensureImageDataUrl } from '../../utils/imageUtils';

const ROMANTIC_STATUS_PRESETS = [
  'Loving you more every day ❤️',
  'Always by your side 🌹',
  'Counting stars with you ✨',
  'In your arms is my favorite place 🕊️',
  'My favorite human 🥰',
  'Thinking of you always 💫'
];

export function ContactInfoModal({
  isOpen,
  onClose,
  partnerName = 'Mikasa',
  partnerAvatar = '',
  partnerPhone = '+1 (555) 782-9012',
  partnerBio = 'Forever by your side. Loving you more every single day ❤️',
  onSaveContactInfo,
  onOpenWallpaper,
  onStartVideoCall
}) {
  const [name, setName] = useState(partnerName);
  const [phone, setPhone] = useState(partnerPhone);
  const [bio, setBio] = useState(partnerBio);
  const [avatar, setAvatar] = useState(partnerAvatar);
  const [savedBadge, setSavedBadge] = useState(false);
  const fileInputRef = useRef(null);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      setName(partnerName);
      setPhone(partnerPhone);
      setBio(partnerBio);
      setAvatar(partnerAvatar);
      setSavedBadge(false);
    }
  }, [isOpen, partnerName, partnerPhone, partnerBio, partnerAvatar]);

  const [isCompressing, setIsCompressing] = useState(false);

  // Handle image upload from device with Free Tier Canvas compression
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const processed = await processUploadedImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.82,
        maxSizeBytes: 120 * 1024
      });
      setAvatar(processed.dataUrl);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (onSaveContactInfo) {
      onSaveContactInfo({
        name: name.trim() || 'Mikasa',
        phone: phone.trim() || '+1 (555) 782-9012',
        bio: bio.trim() || 'Loving you always ❤️',
        avatar: avatar
      });
    }
    setSavedBadge(true);
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex flex-col bg-[#11071c] text-white overflow-hidden animate-fadeIn select-none">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-rose-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* TOP APP BAR */}
        <div className="relative z-10 shrink-0 min-h-14 pt-[env(safe-area-inset-top,0px)] px-3 sm:px-4 pl-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] flex items-center justify-between border-b border-white/[0.08] bg-[#140822]/90 backdrop-blur-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-white transition-colors p-1.5 -ml-1 rounded-xl hover:bg-white/10 active:scale-95 cursor-pointer focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Chat</span>
          </button>

          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Contact Info
          </h2>

          <button
            type="button"
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(244,63,94,0.4)] active:scale-95 cursor-pointer focus:outline-none"
          >
            {savedBadge ? 'Saved ✓' : 'Done'}
          </button>
        </div>

        {/* SCROLLABLE PROFILE BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.5rem))] pl-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] space-y-5 chat-scroll-area relative z-10">
          {/* HERO PROFILE PICTURE & NAME CARD */}
          <div className="flex flex-col items-center text-center pt-2 pb-4 border-b border-white/[0.08]">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-rose-400/50 shadow-[0_0_30px_rgba(244,63,94,0.35)] bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center">
                {avatar ? (
                  <img
                    src={ensureImageDataUrl(avatar)}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">{name ? name[0] : 'M'}</span>
                )}
              </div>

              {/* Hover/Tap Camera Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-6 h-6 text-rose-300" />
                <span className="text-[10px] font-semibold mt-1">Change DP</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-[#11071c] active:scale-95 transition-transform cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-3 flex items-center gap-1.5 justify-center">
              <span>{name || 'Mikasa'}</span>
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            </h3>

            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active now • Private Couple Space</span>
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/15 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-rose-300" />
                <span>{isCompressing ? 'Optimizing...' : 'Upload Photo'}</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="px-3 py-1.5 rounded-xl text-xs text-rose-300/80 hover:text-rose-100 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  Reset DP
                </button>
              )}
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onStartVideoCall) onStartVideoCall();
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Video className="w-5 h-5 text-rose-400" />
                <span className="text-[11px] font-medium text-white/90">Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenWallpaper) onOpenWallpaper();
                }}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Palette className="w-5 h-5 text-purple-400" />
                <span className="text-[11px] font-medium text-white/90">Wallpaper</span>
              </button>
            </div>
          </div>

          {/* EDITABLE CONTACT FIELDS */}
          <div className="space-y-4">
            {/* Contact Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300/80 mb-1.5">
                Contact Name / Romantic Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mikasa, My Love, Baby"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-rose-400/60 text-white text-sm outline-none transition-all"
                />
              </div>
              <span className="text-[10px] text-white/40 mt-1 block">
                This name updates the chat header, notifications, and call modal.
              </span>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300/80 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 782-9012"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-rose-400/60 text-white text-sm outline-none transition-all"
              />
            </div>

            {/* About / Bio Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-rose-300/80 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>About / Romantic Status</span>
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a sweet bio or love quote..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.09] focus:bg-white/[0.12] border border-white/15 focus:border-rose-400/60 text-white text-sm outline-none transition-all resize-none"
              />

              {/* Romantic Status Chips */}
              <div className="mt-2">
                <span className="text-[10px] text-rose-300/60 block mb-1">Quick Love Statuses:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ROMANTIC_STATUS_PRESETS.map((status, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBio(status)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[0.06] hover:bg-rose-500/20 hover:text-rose-200 border border-white/10 hover:border-rose-400/40 text-white/80 transition-colors cursor-pointer"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PRIVACY & SECURITY BADGE */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">End-to-End Encrypted Space</h4>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Messages, calls, and shared memories are encrypted specifically between you two.
              </p>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-2 pb-4">
            <RomanticButton
              type="button"
              onClick={handleSave}
              icon={Check}
              className="w-full py-3 text-xs shadow-liquid-hover"
            >
              <span>Save Contact Profile Changes</span>
            </RomanticButton>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default ContactInfoModal;
