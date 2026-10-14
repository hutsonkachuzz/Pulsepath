import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { SwitchUI } from '../components/common/SwitchUI';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { PageHeader } from '../components/common/PageHeader';
import { triggerHaptic, iosSpring } from '../utils/iosMotion';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import { useTheme } from '../context/ThemeContext';
import { formatRomanticDate } from '../utils/dateUtils';
import { api } from '../services/api';
import {
  Settings,
  Heart,
  User,
  Bell,
  Palette,
  Shield,
  Copy,
  Check,
  Sun,
  Moon,
  LogOut,
  Smartphone,
  Sparkles,
  Volume2,
  Sliders,
  Zap,
  Share2,
  Camera,
  Upload,
  KeyRound,
  Lock,
  ShieldCheck,
  Eye,
  Fingerprint,
  Timer,
  Ghost,
  Trash2
} from 'lucide-react';
import { useSecurity } from '../context/SecurityContext';
import { ChangePasscodeModal } from '../components/security/ChangePasscodeModal';
import { processUploadedImage, ensureImageDataUrl } from '../utils/imageUtils';
import { updateStory } from '../services/firebaseService';

export function SettingsPage() {
  const { currentUser, updateProfile, logout, isDemo } = useAuth();
  const { couple, partnerName } = useCouple();
  const { isDark, toggleTheme } = useTheme();
  const {
    customPasscode,
    hasCustomPasscode,
    passcodeHint,
    autoLockTime,
    setAutoLockTime,
    privacyBlurEnabled,
    setPrivacyBlurEnabled,
    lockOnBackground,
    setLockOnBackground,
    biometricsSupported,
    biometricsEnabled,
    setBiometricsEnabled,
    lockApp,
    toggleCamouflageMode
  } = useSecurity();

  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:00');
  const [morningMsg, setMorningMsg] = useState('Good morning ❤️ It’s time to wake up. Your favorite person is waiting for another beautiful day with you.');
  const [bedtimeEnabled, setBedtimeEnabled] = useState(true);
  const [bedtimeTime, setBedtimeTime] = useState('23:15');
  const [bedtimeMsg, setBedtimeMsg] = useState('Good night ❤️ Close your eyes and rest. Tomorrow we create another memory.');
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [motion120Hz, setMotion120Hz] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingReminders, setSavingReminders] = useState(false);

  // Keep state in sync with currentUser when loaded or updated
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !name) setName(currentUser.name);
      if (currentUser.nickname && !nickname) setNickname(currentUser.nickname);
      if (currentUser.avatar) setAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  useEffect(() => {
    async function loadReminders() {
      try {
        const data = await api.getReminders();
        if (data) {
          if (data.morning_time) setMorningTime(data.morning_time);
          if (data.morning_msg) setMorningMsg(data.morning_msg);
          if (data.bedtime_time) setBedtimeTime(data.bedtime_time);
          if (data.bedtime_msg) setBedtimeMsg(data.bedtime_msg);
        }
      } catch (e) {
        console.warn('Could not load reminders:', e);
      }
    }
    loadReminders();
  }, []);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    const code = couple?.couple_code || couple?.coupleCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyMobileLink = () => {
    const code = couple?.couple_code || couple?.coupleCode || 'PULSE-7K29';
    const mobileLink = `${window.location.origin}/welcome?login=true&view=mobile&code=${code}`;
    navigator.clipboard.writeText(mobileLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({ name, nickname, avatar });
    const coupleId = couple?.id || 'demo_couple_123';
    const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
    if (isEren && avatar) {
      try {
        await updateStory(coupleId, 'eren_updates', { avatar });
      } catch {}
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid photo file (JPEG, PNG, WEBP)');
      return;
    }

    setUploadingAvatar(true);
    try {
      // High-performance client-side compression to square profile DP (~40-80KB Base64 JPEG)
      // Saves directly to Firebase/Firestore without Cloud Storage fees or quota limits
      const processed = await processUploadedImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.82,
        maxSizeBytes: 120 * 1024
      });

      setAvatar(processed.dataUrl);
      await updateProfile({ name, nickname, avatar: processed.dataUrl });

      const coupleId = couple?.id || 'demo_couple_123';
      const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
      if (isEren) {
        try {
          await updateStory(coupleId, 'eren_updates', { avatar: processed.dataUrl });
        } catch (err) {
          console.warn('Update story avatar notice:', err);
        }
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Avatar upload failed:', err);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetAvatar = async () => {
    const defaultErenPhoto = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';
    setAvatar('');
    try {
      await updateProfile({ name, nickname, avatar: '' });
      const coupleId = couple?.id || 'demo_couple_123';
      const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
      if (isEren) {
        try {
          await updateStory(coupleId, 'eren_updates', { avatar: defaultErenPhoto });
        } catch {}
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to reset avatar:', e);
    }
  };

  const handleSaveReminders = async () => {
    setSavingReminders(true);
    try {
      await api.updateReminders({
        morning_time: morningTime,
        morning_msg: morningMsg,
        bedtime_time: bedtimeTime,
        bedtime_msg: bedtimeMsg
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingReminders(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-16">
      {/* Header with iOS Back Arrow */}
      <PageHeader
        backLabel="Our Space"
        title="Settings & Couple Preferences ⚙️"
        subtitle="Manage your account, couple connection code, reminder alarms, and romantic aesthetics."
      />

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Preferences updated successfully! ❤️</span>
        </div>
      )}

      {/* Couple Connection Box */}
      <GlassCard glow className="p-6 border-rose-500/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-2">
          <Heart className="w-4 h-4 text-rose-400" />
          <span>Our Couple Connection</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-3">
          <div>
            <div className="text-lg font-bold text-white tracking-tight">
              Space Code: <span className="font-semibold tabular-nums text-rose-300">{couple?.coupleCode || 'PULSE-7K29'}</span>
            </div>
            <p className="text-xs text-rose-200/70 mt-0.5">
              Share the mobile link or couple code with your partner to launch their private mobile view with security login.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopyMobileLink}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/30 to-purple-600/30 hover:from-rose-500/40 hover:to-purple-600/40 text-white text-xs font-semibold border border-rose-400/50 flex items-center gap-2 transition-all shadow-glow-sm cursor-pointer"
              title="Copy mobile link with password prompt"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-rose-300" />}
              <span>{copiedLink ? 'Mobile Link Copied!' : 'Copy Mobile Access Link'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white text-xs font-medium border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs text-rose-200/80">
          <div>
            <span className="text-rose-300/60 block text-[11px]">Partner</span>
            <span className="font-medium text-white">{partnerName || 'Waiting for partner'}</span>
          </div>
          <div>
            <span className="text-rose-300/60 block text-[11px]">Together Since</span>
            <span className="font-medium text-white">{formatRomanticDate(couple?.relationshipStartDate)}</span>
          </div>
          <div>
            <span className="text-rose-300/60 block text-[11px]">Mode</span>
            <span className="font-medium text-white">{isDemo ? 'Demo Space (1-Click)' : 'Firebase Cloud Sync'}</span>
          </div>
        </div>
      </GlassCard>

      {/* Profile & Account Settings with Interactive DP Manager */}
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-4">
          <User className="w-4 h-4 text-rose-400" />
          <span>My Profile & Display Picture (DP)</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Circular DP Manager with Clean Border & Interactive Upload */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Circular DP Bubble with clean border and hover overlay */}
            <div className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-rose-400/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shrink-0">
              {avatar ? (
                <img
                  src={ensureImageDataUrl(avatar)}
                  alt="Profile DP"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {name ? name[0].toUpperCase() : 'U'}
                </span>
              )}
              {/* Overlay camera trigger button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                title="Upload custom photo"
              >
                <Camera className="w-6 h-6 text-rose-300" />
                <span className="text-[10px] font-semibold mt-1">Change DP</span>
              </button>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-1">
                  <div className="w-5 h-5 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                  <span className="text-[9px] text-rose-200 font-medium">Optimizing...</span>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="text-sm font-semibold text-white">Profile Picture (DP)</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                  Free Tier Ready
                </span>
              </div>
              <p className="text-xs text-rose-200/70 mt-1">
                Upload your personal photo from your device. Scaled and compressed directly for Firestore.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-3.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-bold border border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)] flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{uploadingAvatar ? 'Optimizing photo...' : 'Upload Photo'}</span>
                </button>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300/80 hover:text-rose-100 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400/80" />
                    <span>Reset DP</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Your Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Romantic Nickname (used in greetings)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Eren, Baby, Honey"
                className="w-full glass-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <RomanticButton type="submit" size="sm">
              Save Profile Changes
            </RomanticButton>
          </div>
        </form>
      </GlassCard>

      {/* Reminder Preferences with SwitchUI */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-4">
          <Bell className="w-4 h-4 text-rose-400" />
          <span>Morning & Bedtime Reminders</span>
        </div>

        <div className="space-y-4">
          {/* Morning Reminder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Morning Wake-Up Reminder ☀️</span>
                <p className="text-xs text-rose-200/60 mt-0.5">Gentle romantic prompt when waking up</p>
              </div>
              <SwitchUI
                checked={morningEnabled}
                onChange={(val) => {
                  setMorningEnabled(val);
                  triggerHaptic('light');
                }}
                color="rose"
                size="md"
              />
            </div>

            <AnimatePresence>
              {morningEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={iosSpring}
                  className="space-y-2 overflow-hidden pt-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-200/80">Alarm Time</span>
                    <input
                      type="time"
                      value={morningTime}
                      onChange={(e) => setMorningTime(e.target.value)}
                      className="glass-input px-2.5 py-1 text-xs text-white rounded-lg"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={morningMsg}
                    onChange={(e) => setMorningMsg(e.target.value)}
                    className="w-full glass-input p-2.5 text-xs text-rose-100 rounded-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bedtime Reminder */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Bedtime Sweet Dreams Reminder 🌙</span>
                <p className="text-xs text-rose-200/60 mt-0.5">Sweet affectionate goodnight message</p>
              </div>
              <SwitchUI
                checked={bedtimeEnabled}
                onChange={(val) => {
                  setBedtimeEnabled(val);
                  triggerHaptic('light');
                }}
                color="indigo"
                size="md"
              />
            </div>

            <AnimatePresence>
              {bedtimeEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={iosSpring}
                  className="space-y-2 overflow-hidden pt-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-200/80">Bedtime</span>
                    <input
                      type="time"
                      value={bedtimeTime}
                      onChange={(e) => setBedtimeTime(e.target.value)}
                      className="glass-input px-2.5 py-1 text-xs text-white rounded-lg"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={bedtimeMsg}
                    onChange={(e) => setBedtimeMsg(e.target.value)}
                    className="w-full glass-input p-2.5 text-xs text-rose-100 rounded-xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end pt-2">
            <RomanticButton size="sm" onClick={handleSaveReminders} loading={savingReminders}>
              Save Reminder Preferences 🔔
            </RomanticButton>
          </div>
        </div>
      </GlassCard>

      {/* Privacy, Security & Screen Shields Vault */}
      <GlassCard glow className="p-5 sm:p-6 border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Privacy & Security Vault 🔒</span>
          </div>
          <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
            Protected Space
          </span>
        </div>

        <div className="space-y-4">
          {/* Master Passcode & Security PIN Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Master Passcode / PIN</span>
                {hasCustomPasscode ? (
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    Custom PIN Active
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
                    Default (pulsepath)
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-200/60 mt-0.5">
                {hasCustomPasscode
                  ? (passcodeHint ? `Protected with custom secret PIN (Hint: ${passcodeHint})` : 'Protected with your secret couple PIN')
                  : 'Change default passcode to a custom PIN known only to both of you'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPasscodeModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white text-xs font-semibold transition-all shadow-glow-sm cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{hasCustomPasscode ? 'Change PIN' : 'Set Custom PIN'}</span>
              </button>
            </div>
          </div>

          {/* Inactivity Auto-Lock Duration */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-white">Inactivity Auto-Lock</span>
              </div>
              <p className="text-xs text-rose-200/60 mt-0.5">
                Automatically locks PulsePath after idle time to protect private moments
              </p>
            </div>

            <SegmentedControl
              options={[
                { value: 'off', label: 'Off' },
                { value: '1m', label: '1 min' },
                { value: '3m', label: '3 min' },
                { value: '5m', label: '5 min' }
              ]}
              value={autoLockTime}
              onChange={(val) => {
                setAutoLockTime(val);
                triggerHaptic('light');
              }}
              size="sm"
            />
          </div>

          {/* Anti-Snoop Privacy Blur Shield */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={privacyBlurEnabled}
              onChange={(val) => {
                setPrivacyBlurEnabled(val);
                triggerHaptic('medium');
              }}
              label="Anti-Snoop Privacy Blur Shield"
              description="Blurs chats and memories when switching browser tabs or multitasking to prevent shoulder surfing"
              color="rose"
              size="md"
            />
          </div>

          {/* Lock Immediately on Background */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={lockOnBackground}
              onChange={(val) => {
                setLockOnBackground(val);
                triggerHaptic('medium');
              }}
              label="Lock on App Switch / Background"
              description="Immediately requires passcode when returning to PulsePath from another app or tab"
              color="purple"
              size="md"
            />
          </div>

          {/* Biometrics (Face ID / Fingerprint) */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={biometricsEnabled}
              onChange={(val) => {
                setBiometricsEnabled(val);
                triggerHaptic('medium');
              }}
              label="Biometric Quick Unlock"
              description="Use Apple Face ID, Touch ID, or Android Fingerprint for instant 1-tap entry"
              color="emerald"
              size="md"
            />
          </div>

          {/* Camouflage / Panic Mode & Manual Lock Actions */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Ghost className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-white">Camouflage & Panic Disguise</span>
              </div>
              <p className="text-xs text-rose-200/60 mt-0.5">
                Instantly disguise PulsePath as a harmless "Daily Notes" app when prying eyes are near
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  toggleCamouflageMode();
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Ghost className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Disguise</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  lockApp();
                }}
                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-purple-300" />
                <span>Lock Now</span>
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Change Passcode Modal */}
      <ChangePasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
      />

      {/* Appearance & Theme (SwitchUI + SegmentedControl) */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-4">
          <Palette className="w-4 h-4 text-rose-400" />
          <span>Visual Aesthetics & Theme</span>
        </div>

        <div className="space-y-4">
          {/* iOS Segmented Theme Switcher */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">Interface Theme</div>
              <div className="text-xs text-rose-200/60 mt-0.5">
                Choose your romantic ambience mode
              </div>
            </div>

            <SegmentedControl
              options={[
                { value: 'dark', label: 'Dark Romance', icon: <Moon className="w-3.5 h-3.5" /> },
                { value: 'light', label: 'Blush Cream', icon: <Sun className="w-3.5 h-3.5" /> }
              ]}
              value={isDark ? 'dark' : 'light'}
              onChange={(val) => {
                if ((val === 'dark' && !isDark) || (val === 'light' && isDark)) {
                  toggleTheme();
                }
              }}
              size="sm"
            />
          </div>

          {/* Quick SwitchUI Toggle */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={isDark}
              onChange={() => toggleTheme()}
              label="Midnight Dark Mode"
              description="Deep midnight background with glowing crimson and rose luminescence"
              color="rose"
              size="md"
              iconOn="🌙"
              iconOff="☀️"
            />
          </div>
        </div>
      </GlassCard>

      {/* iOS-Grade Motion & Processor Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider mb-4">
          <Zap className="w-4 h-4 text-rose-400" />
          <span>iOS Smooth Processing & Interaction Engine</span>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={motion120Hz}
              onChange={(val) => {
                setMotion120Hz(val);
                triggerHaptic('success');
              }}
              label="ProMotion 120Hz Smooth Physics Engine"
              description="Apple iOS spring physics with sub-pixel GPU compositing layer acceleration"
              color="emerald"
              size="md"
            />
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <SwitchUI
              checked={hapticsEnabled}
              onChange={(val) => {
                setHapticsEnabled(val);
                if (val) triggerHaptic('medium');
              }}
              label="Tactile Haptic Feedback"
              description="Simulates Apple Taptic Engine micro-pulses on buttons and switches"
              color="rose"
              size="md"
            />
          </div>
        </div>
      </GlassCard>

      {/* Session Management */}
      <div className="pt-2 text-center">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of PulsePath</span>
        </button>
      </div>
    </div>
  );
}
