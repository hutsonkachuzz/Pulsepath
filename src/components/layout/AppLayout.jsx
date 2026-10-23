import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IPhoneMockupFrame } from './IPhoneMockupFrame';
import { Modal } from '../common/Modal';
import { MoodSelectorModal } from '../common/MoodSelectorModal';
import { RomanticButton } from '../common/RomanticButton';
import { LivingRomanticBackground } from '../common/LivingRomanticBackground';
import { FourCornerCrystalGlow } from '../effects/FourCornerCrystalGlow';
import {
  Sparkles,
  Mail,
  Image,
  CalendarHeart,
  HelpCircle,
  Settings,
  Heart,
  MessageCircleHeart,
  Sun,
  Moon,
  LogOut,
  User,
  Users,
  SmilePlus,
  Lock,
  Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { useTheme } from '../../context/ThemeContext';
import { useSecurity } from '../../context/SecurityContext';
import { AppLockOverlay } from '../security/AppLockOverlay';
import { PrivacyBlurShield } from '../security/PrivacyBlurShield';
import { CamouflageDisguise } from '../security/CamouflageDisguise';
import { StreakHubModal } from '../snaps/StreakHubModal';
import { PulseSnapCameraModal } from '../snaps/PulseSnapCameraModal';
import {
  addMemory,
  addLoveThought,
  addLoveLetter,
  addSpecialDate
} from '../../services/firebaseService';
import { uploadImage } from '../../services/storageService';

export function AppLayout() {
  const { currentUser, logout, loginAsDemo } = useAuth();
  const { couple, partnerName, partnerMood } = useCouple();
  const { isDark, toggleTheme } = useTheme();
  const { lockApp } = useSecurity();
  const navigate = useNavigate();
  const location = useLocation();
  const isChat = location.pathname === '/chat';

  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // Modals triggered from FAB
  const [activeModal, setActiveModal] = useState(null); // 'memory' | 'thought' | 'letter' | 'date' | null

  // State for forms
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDesc, setMemoryDesc] = useState('');
  const [memoryMood, setMemoryMood] = useState('Loved');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memoryTags, setMemoryTags] = useState('');
  const [memoryFiles, setMemoryFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Love thought state
  const [thoughtContent, setThoughtContent] = useState('');
  const [thoughtVisibility, setThoughtVisibility] = useState('shared');

  // Love letter state
  const [letterTitle, setLetterTitle] = useState('');
  const [letterContent, setLetterContent] = useState('');

  // Special date state
  const [dateTitle, setDateTitle] = useState('');
  const [dateVal, setDateVal] = useState('');
  const [dateDesc, setDateDesc] = useState('');
  const [dateCategory, setDateCategory] = useState('anniversary');

  const handleActionSelect = (id) => {
    setActiveModal(id);
  };

  const handleSwitchPartner = async () => {
    const isEren = (currentUser?.name || '').toLowerCase().includes('eren');
    const target = isEren ? 'mikasa' : 'eren';
    try {
      await loginAsDemo(target);
      setIsMoreMenuOpen(false);
    } catch (e) {
      console.warn('Switch partner error:', e);
    }
  };

  // Submit Memory
  const handleSaveMemory = async (e) => {
    e.preventDefault();
    if (!memoryTitle.trim() || !couple?.id) return;
    setIsSubmitting(true);
    try {
      const uploadedUrls = [];
      for (const file of memoryFiles) {
        const url = await uploadImage(file, `couples/${couple.id}/memories`);
        uploadedUrls.push(url);
      }

      const currentUserId = currentUser.id || currentUser.uid;
      await addMemory(couple.id, {
        coupleId: couple.id,
        createdBy: currentUserId,
        authorName: currentUser.name,
        title: memoryTitle,
        description: memoryDesc,
        date: memoryDate,
        mood: memoryMood,
        tags: memoryTags.split(',').map(t => t.trim()).filter(Boolean),
        images: uploadedUrls,
        isFavorite: false
      });

      // Reset
      setMemoryTitle('');
      setMemoryDesc('');
      setMemoryFiles([]);
      setMemoryTags('');
      setActiveModal(null);
      navigate('/memories');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Thought
  const handleSaveThought = async (e) => {
    e.preventDefault();
    if (!thoughtContent.trim() || !couple?.id) return;
    setIsSubmitting(true);
    try {
      const currentUserId = currentUser.id || currentUser.uid;
      await addLoveThought(couple.id, {
        coupleId: couple.id,
        createdBy: currentUserId,
        authorName: currentUser.name,
        content: thoughtContent,
        visibility: thoughtVisibility,
        isFavorite: false
      });
      setThoughtContent('');
      setActiveModal(null);
      navigate('/thoughts');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Letter
  const handleSaveLetter = async (e) => {
    e.preventDefault();
    if (!letterTitle.trim() || !letterContent.trim() || !couple?.id) return;
    setIsSubmitting(true);
    try {
      const currentUserId = currentUser.id || currentUser.uid;
      await addLoveLetter(couple.id, {
        coupleId: couple.id,
        createdBy: currentUserId,
        authorName: currentUser.name,
        title: letterTitle,
        content: letterContent,
        visibility: 'shared',
        isFavorite: false
      });
      setLetterTitle('');
      setLetterContent('');
      setActiveModal(null);
      navigate('/letters');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Special Date
  const handleSaveDate = async (e) => {
    e.preventDefault();
    if (!dateTitle.trim() || !dateVal || !couple?.id) return;
    setIsSubmitting(true);
    try {
      await addSpecialDate(couple.id, {
        coupleId: couple.id,
        title: dateTitle,
        date: new Date(dateVal).toISOString(),
        category: dateCategory,
        description: dateDesc,
        reminderEnabled: true
      });
      setDateTitle('');
      setDateVal('');
      setDateDesc('');
      setActiveModal(null);
      navigate('/dates');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentIsEren = (currentUser?.name || '').toLowerCase().includes('eren');

  return (
    <div
      className="app-container main-wrapper w-full flex items-center justify-center overflow-hidden bg-romantic-dark text-white relative"
      style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
    >
      {/* 4-Corner Crystal Subtle Entry Glow */}
      <FourCornerCrystalGlow />

      {/* Living Romantic Background (Liquid Blooming Hearts & Ambient Depth) */}
      <LivingRomanticBackground />

      {/* Strictly Locked Mobile Device Frame Container (Edge-to-edge on mobile, 430px smartphone bezel on desktop) */}
      <div
        className="w-full h-full flex items-center justify-center relative z-10"
        style={{ minHeight: 'var(--app-height, 100dvh)', height: 'var(--app-height, 100dvh)' }}
      >
        <IPhoneMockupFrame
          onOpenQuickAction={() => setIsFabOpen(!isFabOpen)}
          onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
          onOpenMoodModal={() => setIsMoodModalOpen(true)}
          isQuickActionOpen={isFabOpen}
          onCloseQuickAction={() => setIsFabOpen(false)}
          onSelectQuickAction={handleActionSelect}
          overlays={
            <>
              {/* =====================================================================
                  Mobile Space Navigation Drawer & Menu Sheet (Strictly Scoped Inside Frame)
                  ===================================================================== */}
              <Modal
                isOpen={isMoreMenuOpen}
                onClose={() => setIsMoreMenuOpen(false)}
                title="Our Space Menu ✨"
                subtitle="Explore every room in your shared world"
                scoped={false}
                variant="center"
                maxWidth="max-w-[360px]"
              >
                <div className="space-y-2 py-0.5 text-left">
                  {/* User Profile Summary Card */}
                  <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
                        {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight">
                          {currentUser?.name || 'You'}
                        </div>
                        <div className="text-[10px] text-rose-300/80 mt-0.5">
                          With <strong className="text-rose-200">{partnerName || 'Partner'}</strong>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchPartner}
                      className="px-2 py-1 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-[10px] font-semibold text-rose-200 hover:text-white transition-all cursor-pointer flex items-center gap-1 border border-white/10"
                      title="Switch demo partner profile"
                    >
                      <Users className="w-3 h-3" />
                      <span>Switch to {currentIsEren ? 'Mikasa' : 'Eren'}</span>
                    </button>
                  </div>

                  {/* Space Navigation Grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Featured: Pulse Snaps & Streaks */}
                    <Link
                      to="/snaps"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="col-span-2 p-2.5 rounded-2xl bg-gradient-to-r from-rose-500/25 via-pink-500/20 to-purple-500/25 border border-rose-400/40 flex items-center justify-between hover:border-rose-300 transition-all group shadow-[0_4px_16px_rgba(244,63,94,0.2)]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
                          <Flame className="w-4 h-4 fill-white" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Pulse Snaps & Streaks</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-amber-300 border border-amber-400/30">
                              🔥 12
                            </span>
                          </div>
                          <span className="text-[10px] text-rose-200/80 block truncate">Camera, live filters & daily streaks</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-300 group-hover:text-white transition-colors shrink-0">
                        Open →
                      </span>
                    </Link>

                    <Link
                      to="/chat"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <MessageCircleHeart className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Our Chat</span>
                        <span className="text-[9px] text-rose-300/70 block">Instant</span>
                      </div>
                    </Link>

                    <Link
                      to="/memories"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform shrink-0">
                        <Heart className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Memories</span>
                        <span className="text-[9px] text-rose-300/70 block">Photo Vault</span>
                      </div>
                    </Link>

                    <Link
                      to="/thoughts"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                        <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Love Talks</span>
                        <span className="text-[9px] text-rose-300/70 block">Thoughts</span>
                      </div>
                    </Link>

                    <Link
                      to="/letters"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-600/20 border border-rose-600/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                        <Mail className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Letters</span>
                        <span className="text-[9px] text-rose-300/70 block">Sealed</span>
                      </div>
                    </Link>

                    <Link
                      to="/gallery"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform shrink-0">
                        <Image className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Gallery</span>
                        <span className="text-[9px] text-rose-300/70 block">Album</span>
                      </div>
                    </Link>

                    <Link
                      to="/dates"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                        <CalendarHeart className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Special Days</span>
                        <span className="text-[9px] text-rose-300/70 block">Countdowns</span>
                      </div>
                    </Link>

                    <Link
                      to="/question"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-pink-600/20 border border-pink-600/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform shrink-0">
                        <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Daily Ritual</span>
                        <span className="text-[9px] text-rose-300/70 block">Prompts</span>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="p-2 rounded-xl liquid-glass liquid-glass-interactive flex items-center gap-2 hover:border-rose-400/50 group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-500/20 border border-gray-500/30 flex items-center justify-center text-rose-300 group-hover:scale-105 transition-transform shrink-0">
                        <Settings className="w-3.5 h-3.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-white block truncate">Settings</span>
                        <span className="text-[9px] text-rose-300/70 block">Preferences</span>
                      </div>
                    </Link>
                  </div>

                  {/* Quick Actions Footer (Mood Selector, Theme, Logout) */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsMoodModalOpen(true);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-medium text-rose-200 hover:text-white transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
                    >
                      <SmilePlus className="w-3 h-3 text-rose-400" />
                      <span>Update Mood</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-rose-200 hover:text-white transition-all border border-white/10 cursor-pointer"
                      title="Toggle theme"
                    >
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-rose-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        lockApp();
                      }}
                      className="p-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-100 transition-all border border-purple-500/20 cursor-pointer"
                      title="Lock Space Now"
                    >
                      <Lock className="w-3.5 h-3.5 text-purple-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        logout();
                      }}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 transition-all border border-rose-500/20 cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </div>
              </Modal>

              {/* CREATE MEMORY MODAL (Scoped inside phone frame) */}
              <Modal
                isOpen={activeModal === 'memory' || activeModal === 'photo'}
                onClose={() => setActiveModal(null)}
                title="Add a Beautiful Memory ❤️"
                subtitle="Capture this moment forever in your shared vault"
                scoped={true}
              >
                <form onSubmit={handleSaveMemory} className="space-y-3 text-left">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={memoryTitle}
                      onChange={(e) => setMemoryTitle(e.target.value)}
                      placeholder="e.g. Our Autumn Walk in the Park"
                      className="w-full glass-input px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Story / Note</label>
                    <textarea
                      rows={3}
                      required
                      value={memoryDesc}
                      onChange={(e) => setMemoryDesc(e.target.value)}
                      placeholder="What made this moment so special..."
                      className="w-full glass-input px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={memoryDate}
                        onChange={(e) => setMemoryDate(e.target.value)}
                        className="w-full glass-input px-2.5 py-1.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Mood</label>
                      <select
                        value={memoryMood}
                        onChange={(e) => setMemoryMood(e.target.value)}
                        className="w-full glass-input px-2.5 py-1.5 text-[11px]"
                      >
                        <option value="Loved" className="bg-romantic-dark">❤️ Loved</option>
                        <option value="Happy" className="bg-romantic-dark">😊 Happy</option>
                        <option value="Romantic" className="bg-romantic-dark">🥰 Romantic</option>
                        <option value="Peaceful" className="bg-romantic-dark">🌙 Peaceful</option>
                        <option value="Excited" className="bg-romantic-dark">✨ Excited</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={memoryTags}
                      onChange={(e) => setMemoryTags(e.target.value)}
                      placeholder="e.g. Sunset, Beach, Roadtrip"
                      className="w-full glass-input px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Upload Photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setMemoryFiles(Array.from(e.target.files))}
                      className="w-full text-[11px] text-rose-200/70 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-rose-500/20 file:text-rose-300 hover:file:bg-rose-500/30"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <RomanticButton variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                      Cancel
                    </RomanticButton>
                    <RomanticButton type="submit" size="sm" loading={isSubmitting}>
                      Save Memory ❤️
                    </RomanticButton>
                  </div>
                </form>
              </Modal>

              {/* CREATE LOVE THOUGHT MODAL (Scoped inside phone frame) */}
              <Modal
                isOpen={activeModal === 'thought'}
                onClose={() => setActiveModal(null)}
                title="Share a Love Thought 💭"
                subtitle="Write what your heart is thinking right now"
                scoped={true}
              >
                <form onSubmit={handleSaveThought} className="space-y-3">
                  <div>
                    <textarea
                      rows={3}
                      required
                      value={thoughtContent}
                      onChange={(e) => setThoughtContent(e.target.value)}
                      placeholder="“I don't always know how to explain what you mean to me...”"
                      className="w-full glass-input p-2.5 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-[11px] text-rose-200 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="shared"
                          checked={thoughtVisibility === 'shared'}
                          onChange={() => setThoughtVisibility('shared')}
                          className="accent-rose-500"
                        />
                        <span>Share ❤️</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-rose-200/70 cursor-pointer">
                        <input
                          type="radio"
                          name="visibility"
                          value="private"
                          checked={thoughtVisibility === 'private'}
                          onChange={() => setThoughtVisibility('private')}
                          className="accent-rose-500"
                        />
                        <span>Only me 🔒</span>
                      </label>
                    </div>

                    <div className="flex gap-1.5">
                      <RomanticButton variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                        Cancel
                      </RomanticButton>
                      <RomanticButton type="submit" size="sm" loading={isSubmitting}>
                        Save Thought
                      </RomanticButton>
                    </div>
                  </div>
                </form>
              </Modal>

              {/* CREATE LOVE LETTER MODAL (Scoped inside phone frame) */}
              <Modal
                isOpen={activeModal === 'letter'}
                onClose={() => setActiveModal(null)}
                title="Write a Cinematic Love Letter ✉️"
                subtitle="Words that will be sealed in a digital envelope"
                scoped={true}
              >
                <form onSubmit={handleSaveLetter} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Letter Title</label>
                    <input
                      type="text"
                      required
                      value={letterTitle}
                      onChange={(e) => setLetterTitle(e.target.value)}
                      placeholder="e.g. To The One Who Holds My Heart"
                      className="w-full glass-input px-3 py-1.5 text-xs font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Your Letter</label>
                    <textarea
                      rows={5}
                      required
                      value={letterContent}
                      onChange={(e) => setLetterContent(e.target.value)}
                      placeholder="My dearest..."
                      className="w-full glass-input p-3 text-xs font-normal leading-relaxed letter-paper"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <RomanticButton variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                      Cancel
                    </RomanticButton>
                    <RomanticButton type="submit" size="sm" loading={isSubmitting}>
                      Seal & Send ✉️
                    </RomanticButton>
                  </div>
                </form>
              </Modal>

              {/* CREATE SPECIAL DATE MODAL (Scoped inside phone frame) */}
              <Modal
                isOpen={activeModal === 'date'}
                onClose={() => setActiveModal(null)}
                title="Add a Special Date 📅"
                subtitle="Create an upcoming countdown milestone"
                scoped={true}
              >
                <form onSubmit={handleSaveDate} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Event Title</label>
                    <input
                      type="text"
                      required
                      value={dateTitle}
                      onChange={(e) => setDateTitle(e.target.value)}
                      placeholder="e.g. Our Anniversary, Mikasa's Birthday"
                      className="w-full glass-input px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={dateVal}
                        onChange={(e) => setDateVal(e.target.value)}
                        className="w-full glass-input px-2.5 py-1.5 text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Category</label>
                      <select
                        value={dateCategory}
                        onChange={(e) => setDateCategory(e.target.value)}
                        className="w-full glass-input px-2.5 py-1.5 text-[11px]"
                      >
                        <option value="anniversary" className="bg-romantic-dark">Anniversary ❤️</option>
                        <option value="birthday" className="bg-romantic-dark">Birthday 🎂</option>
                        <option value="first_date" className="bg-romantic-dark">First Date ☕</option>
                        <option value="trip" className="bg-romantic-dark">Trip / Adventure ✈️</option>
                        <option value="custom" className="bg-romantic-dark">Custom Event ✨</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-rose-200/90 mb-1">Description / Plans</label>
                    <input
                      type="text"
                      value={dateDesc}
                      onChange={(e) => setDateDesc(e.target.value)}
                      placeholder="e.g. Romantic rooftop dinner and stargazing"
                      className="w-full glass-input px-3 py-1.5 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <RomanticButton variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
                      Cancel
                    </RomanticButton>
                    <RomanticButton type="submit" size="sm" loading={isSubmitting}>
                      Add Countdown ⏳
                    </RomanticButton>
                  </div>
                </form>
              </Modal>

              {/* Mood Selector Modal (Scoped inside phone frame) */}
              <MoodSelectorModal
                isOpen={isMoodModalOpen}
                onClose={() => setIsMoodModalOpen(false)}
              />

              {/* Advanced Privacy & Security Overlays (Strictly Scoped) */}
              <PrivacyBlurShield />
              <CamouflageDisguise />
              <AppLockOverlay />

              {/* Snapchat-Style Streak Hub & Pulse Snap Camera Modals */}
              <StreakHubModal />
              <PulseSnapCameraModal />
            </>
          }
        >
          <Outlet />
        </IPhoneMockupFrame>
      </div>
    </div>
  );
}
