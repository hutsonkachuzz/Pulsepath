import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, Heart, X, ArrowRight, ShieldCheck, CheckCircle2, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PulsePathLogo } from '../common/PulsePathLogo';

/**
 * Predefined master passwords accepted for instant couple access.
 * You can also set a custom master password in localStorage under 'pulsepath_master_password'.
 */
const DEFAULT_MASTER_PASSWORDS = [
  'pulsepath',
  'pulsepath2026',
  'demo1234',
  'forever',
  'love'
];

export function MasterPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  initialPartner = 'eren',
  coupleCode = null,
  isMobileLink = false,
  scoped = true
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(initialPartner || 'eren');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  // Sync initial partner if provided from URL or props
  useEffect(() => {
    if (initialPartner) {
      setSelectedPartner(initialPartner.toLowerCase());
    }
  }, [initialPartner]);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsSuccess(false);
      setIsLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setError('');
    const trimmed = password.trim();

    if (!trimmed) {
      setError('Please enter our master password.');
      triggerShake();
      return;
    }

    const customMaster = localStorage.getItem('pulsepath_custom_passcode') || localStorage.getItem('pulsepath_master_password');
    const validPasswords = [...DEFAULT_MASTER_PASSWORDS];
    if (customMaster) validPasswords.push(customMaster.trim());

    // Verify master password
    const isMasterValid = validPasswords.some(
      (valid) => valid.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isMasterValid) {
      setError('தவறான பாஸ்வேர்ட்! மீண்டும் முயற்சிக்கவும். (Incorrect passcode)');
      triggerShake();
      return;
    }

    // Success flow
    setIsLoading(true);
    try {
      // Trigger sweet celebration confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.55 },
        colors: ['#FF4D6D', '#FF758F', '#E0AAFF', '#FFCCD5']
      });

      setIsSuccess(true);

      // Brief delay for unlock feedback animation
      setTimeout(async () => {
        if (onSuccess) {
          await onSuccess({ partner: selectedPartner, password: trimmed });
        }
      }, 500);
    } catch (err) {
      setIsLoading(false);
      setIsSuccess(false);
      setError(err.message || 'Authentication error. Please try again.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    inputRef.current?.select();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`${scoped ? 'absolute inset-0' : 'fixed inset-0'} z-50 flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto overscroll-contain`}>
          {/* Backdrop with dreamy blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={isLoading ? undefined : onClose}
            className={`${scoped ? 'absolute inset-0' : 'fixed inset-0'} bg-black/80 backdrop-blur-md`}
          />

          {/* Modal Container: Perfectly responsive on all mobile viewports (320px+) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0
            }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
              x: { duration: 0.45 }
            }}
            className="relative w-full max-w-[390px] rounded-3xl bg-gradient-to-b from-[#1e0828] via-[#16061e] to-[#120419] p-5 sm:p-6 border border-rose-500/25 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.35)] overflow-hidden z-10 my-auto will-change-[transform,opacity]"
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
          >
            {/* Top ambient highlight gradient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full bg-gradient-to-r from-pink-500/30 via-rose-500/20 to-purple-600/30 blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-2 rounded-full text-rose-300/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close access modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2.5">
                <PulsePathLogo
                  size={52}
                  variant="primary"
                  withGlow={false}
                  alt="PulsePath logo"
                  className="filter drop-shadow-[0_4px_18px_rgba(255,42,122,0.45)]"
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                Our Private Space
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-rose-200/75 font-normal max-w-xs">
                Enter our master password to open our universe
              </p>

              {/* Mobile Access Link Detection Badge */}
              {(isMobileLink || coupleCode) && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-medium text-rose-300 mt-2.5">
                  <Smartphone className="w-3 h-3 text-rose-400" />
                  <span>Secure Mobile Access • {coupleCode || 'PULSE-7K29'}</span>
                </div>
              )}
            </div>

            {/* Partner Identity Toggle (Designed exclusively for two people) */}
            <div className="mt-4 p-1 rounded-2xl bg-white/[0.04] border border-white/10 flex gap-1">
              <button
                type="button"
                onClick={() => setSelectedPartner('eren')}
                className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                  selectedPartner === 'eren'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(244,63,94,0.35)] font-semibold'
                    : 'text-rose-200/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Eren</span>
                <Heart className={`w-3.5 h-3.5 ${selectedPartner === 'eren' ? 'fill-white text-white' : 'text-rose-400'}`} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedPartner('mikasa')}
                className={`flex-1 min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
                  selectedPartner === 'mikasa'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_2px_12px_rgba(244,63,94,0.35)] font-semibold'
                    : 'text-rose-200/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>Mikasa</span>
                <Heart className={`w-3.5 h-3.5 ${selectedPartner === 'mikasa' ? 'fill-white text-white' : 'text-rose-400'}`} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
              <div>
                <label className="block text-xs font-medium text-rose-200/80 mb-1.5 text-left">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300/60 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    ref={inputRef}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter secret passcode..."
                    autoComplete="current-password"
                    disabled={isLoading || isSuccess}
                    className={`w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-2xl bg-white/[0.06] border text-white placeholder-rose-300/40 text-base sm:text-sm focus:outline-none transition-all ${
                      error
                        ? 'border-red-400/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-red-950/20'
                        : isSuccess
                        ? 'border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.3)] bg-emerald-950/20'
                        : 'border-white/15 focus:border-rose-400/70 focus:shadow-[0_0_20px_rgba(244,63,94,0.35)]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-300/60 hover:text-white transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message with smooth animation */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 text-left flex items-start gap-2"
                  >
                    <span className="shrink-0 text-red-400 mt-0.5">⚠️</span>
                    <span className="flex-1 leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full min-h-[48px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 active:scale-[0.98] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(244,63,94,0.4)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] transition-all duration-300 border border-rose-300/30 cursor-pointer disabled:opacity-75 focus:outline-none touch-manipulation"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white animate-bounce-subtle" />
                    <span>Welcome Home ❤️</span>
                  </>
                ) : isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Unlocking Our World...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Open Our Space</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Subtext & Quick Hint */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.08] text-center">
              <p className="text-[11px] text-rose-300/60 flex items-center justify-center gap-1.5 flex-wrap">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                <span>Protected private space • Passcode:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPassword('pulsepath');
                    if (error) setError('');
                  }}
                  className="text-rose-200 bg-white/10 hover:bg-white/20 active:scale-95 px-2 py-0.5 rounded font-mono text-[11px] cursor-pointer transition-all border border-white/10 hover:border-rose-400/30"
                  title="Click to auto-fill password"
                >
                  pulsepath
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default MasterPasswordModal;
