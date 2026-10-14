import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { Heart, Sparkles, Copy, Check, ArrowRight, Bell, Calendar, User, Share2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { PulsePathLogo } from '../components/common/PulsePathLogo';

export function OnboardingPage() {
  const { currentUser, updateProfile } = useAuth();
  const { createSpace, joinSpace } = useCouple();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [partnerName, setPartnerName] = useState('');
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [createdCouple, setCreatedCouple] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nickname, setNickname] = useState('');
  const [description, setDescription] = useState('');
  const [morningReminder, setMorningReminder] = useState(true);
  const [bedtimeReminder, setBedtimeReminder] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Trigger romantic celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF4D6D', '#FF758F', '#FFCCD5', '#FFEAD2']
    });
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (!partnerName.trim()) return;
    setStep(3);
  };

  const handleCreateOrJoin = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        const couple = await createSpace(startDate, nickname || `${currentUser?.name} & ${partnerName}`);
        setCreatedCouple(couple);
        setGeneratedCode(couple.couple_code || couple.coupleCode);
        triggerConfetti();
        setStep(4);
      } else {
        const couple = await joinSpace(joinCode);
        setCreatedCouple(couple);
        triggerConfetti();
        setStep(5);
      }
    } catch (err) {
      setError(err.message || 'Error processing couple code.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalStep = async () => {
    try {
      await api.updateReminders({
        morning_enabled: morningReminder,
        bedtime_enabled: bedtimeReminder
      });
    } catch (e) {
      console.warn('Could not save reminder preferences:', e);
    }
    triggerConfetti();
    sessionStorage.setItem('pulsepath_logged_in', 'true');
    navigate('/home');
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyMobileLink = () => {
    const link = `${window.location.origin}/welcome?code=${generatedCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="h-full min-h-full w-full flex flex-col items-center justify-center p-3 text-white relative overflow-y-auto select-none">
      <div className="w-full max-w-sm relative z-10 py-2 my-auto">
        {/* Brand Anchor Logo */}
        <div className="flex justify-center mb-6">
          <PulsePathLogo
            size={52}
            variant="primary"
            alt="PulsePath logo"
            className="filter drop-shadow-[0_4px_16px_rgba(255,42,122,0.4)]"
          />
        </div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`
                h-1.5 rounded-full transition-all duration-300
                ${step === i ? 'w-8 bg-rose-500' : (step > i ? 'w-4 bg-rose-500/50' : 'w-4 bg-white/10')}
              `}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Your Name Confirmation */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 text-center border-rose-500/25">
                <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-rose-400" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Welcome to PulsePath ❤️
                </h2>
                <p className="text-sm text-rose-200/70 mb-6 font-normal">
                  Let's confirm your name before we create your private couple space.
                </p>

                <form onSubmit={handleStep1} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={currentUser?.name || ''}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full glass-input px-4 py-3 text-center text-lg font-medium"
                  />
                  <RomanticButton type="submit" size="lg" className="w-full" icon={ArrowRight}>
                    Next: Your Partner
                  </RomanticButton>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2: Partner's Name */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 text-center border-rose-500/25">
                <div className="w-14 h-14 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-pink-400 fill-pink-400 animate-pulse-subtle" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Who is this journey with?
                </h2>
                <p className="text-sm text-rose-200/70 mb-6 font-normal">
                  Tell us the name or nickname of your special person.
                </p>

                <form onSubmit={handleStep2} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="e.g. Mikasa, Eren, My Sweetheart"
                    className="w-full glass-input px-4 py-3 text-center text-lg font-medium"
                  />
                  <div className="flex gap-2">
                    <RomanticButton variant="secondary" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </RomanticButton>
                    <RomanticButton type="submit" size="lg" className="flex-1" icon={ArrowRight}>
                      Continue
                    </RomanticButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3: Create vs Join Couple Space */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 text-center border-rose-500/25">
                <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Connect Your Two Hearts ❤️
                </h2>
                <p className="text-sm text-rose-200/70 mb-6 font-normal">
                  One partner creates the space and shares the code; the second partner enters it to join.
                </p>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('create')}
                    className={`
                      p-4 rounded-xl text-center border transition-all
                      ${mode === 'create' ? 'bg-rose-500/20 border-rose-500 shadow-glow-sm' : 'bg-white/[0.03] border-white/10'}
                    `}
                  >
                    <div className="font-semibold text-white text-sm">Create New Space</div>
                    <div className="text-[11px] text-rose-200/60 mt-1">I will generate a code for us</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('join')}
                    className={`
                      p-4 rounded-xl text-center border transition-all
                      ${mode === 'join' ? 'bg-rose-500/20 border-rose-500 shadow-glow-sm' : 'bg-white/[0.03] border-white/10'}
                    `}
                  >
                    <div className="font-semibold text-white text-sm">Join Partner's Space</div>
                    <div className="text-[11px] text-rose-200/60 mt-1">I have a code from my partner</div>
                  </button>
                </div>

                {mode === 'join' ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      required
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter Couple Code (e.g. PULSE-7K29)"
                      className="w-full glass-input px-4 py-3 text-center text-lg font-semibold tabular-nums uppercase tracking-wider"
                    />
                    <RomanticButton
                      size="lg"
                      loading={loading}
                      onClick={handleCreateOrJoin}
                      className="w-full"
                    >
                      Connect to Our Space ❤️
                    </RomanticButton>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-left font-medium text-rose-200/80 mb-1">
                        Relationship Start Date (or First Date)
                      </label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full glass-input px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-left font-medium text-rose-200/80 mb-1">
                        Space Nickname (Optional)
                      </label>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={`e.g. ${currentUser?.name || 'Us'} & ${partnerName || 'Love'}`}
                        className="w-full glass-input px-3 py-2 text-sm"
                      />
                    </div>
                    <RomanticButton
                      size="lg"
                      loading={loading}
                      onClick={handleCreateOrJoin}
                      className="w-full"
                    >
                      Create Our Couple Space ❤️
                    </RomanticButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 4: Share Couple Code */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className="p-8 text-center border-rose-500/30 shadow-glow-rose">
                <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-2 animate-bounce" />
                <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                  Your Space is Ready! ❤️
                </h2>
                <p className="text-sm text-rose-200/80 mb-6">
                  Share this private code with <strong className="text-white">{partnerName}</strong> so they can join:
                </p>

                <div className="p-4 rounded-2xl bg-white/[0.05] border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-rose-300 tracking-wider tabular-nums">
                    {generatedCode}
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={copyMobileLink}
                      className="flex-1 sm:flex-initial p-2.5 px-3.5 rounded-xl bg-gradient-to-r from-rose-500/30 to-purple-600/30 hover:from-rose-500/40 hover:to-purple-600/40 text-white transition-all flex items-center justify-center gap-1.5 text-xs font-semibold border border-rose-400/50 cursor-pointer shadow-glow-sm"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Smartphone className="w-4 h-4 text-rose-300" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Mobile Link'}</span>
                    </button>
                    <button
                      onClick={copyCode}
                      className="p-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-rose-200 hover:text-white transition-colors flex items-center justify-center gap-1 text-xs border border-white/10 cursor-pointer"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-rose-200/60 mb-6">
                  Don't worry, you can always find this code anytime in your Couple Settings.
                </p>

                <RomanticButton size="lg" onClick={() => setStep(5)} className="w-full" icon={ArrowRight}>
                  Set Reminders & Enter
                </RomanticButton>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 5: Notification Reminders & Enter */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GlassCard className="p-8 border-rose-500/25 text-left">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-rose-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Morning & Bedtime Whispers
                  </h2>
                  <p className="text-xs text-rose-200/70 mt-1">
                    Receive gentle notifications to wake up and fall asleep feeling loved.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-white">Morning Wake-up Note ☀️</div>
                      <div className="text-xs text-rose-200/60">“Good morning ❤️ It's time to wake up...”</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={morningReminder}
                      onChange={(e) => setMorningReminder(e.target.checked)}
                      className="w-5 h-5 accent-rose-500 rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10 cursor-pointer">
                    <div>
                      <div className="text-sm font-semibold text-white">Bedtime Sweet Dreams 🌙</div>
                      <div className="text-xs text-rose-200/60">“Good night ❤️ Close your eyes and rest...”</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={bedtimeReminder}
                      onChange={(e) => setBedtimeReminder(e.target.checked)}
                      className="w-5 h-5 accent-rose-500 rounded"
                    />
                  </label>
                </div>

                <RomanticButton size="lg" pulse onClick={handleFinalStep} className="w-full text-base">
                  Enter Our PulsePath Space ❤️
                </RomanticButton>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
