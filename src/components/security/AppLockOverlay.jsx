import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Sparkles, Heart, ShieldCheck, Fingerprint, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSecurity } from '../../context/SecurityContext';
import { useAuth } from '../../context/AuthContext';
import { PulsePathLogo } from '../common/PulsePathLogo';
import { triggerHaptic } from '../../utils/iosMotion';

export function AppLockOverlay() {
  const {
    isAppLocked,
    unlockApp,
    passcodeHint,
    biometricsSupported,
    biometricsEnabled,
    triggerBiometricUnlock
  } = useSecurity();

  const { currentUser } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAppLocked) {
      setPasscode('');
      setError('');
      setShowHint(false);
      setIsUnlocking(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isAppLocked]);

  if (!isAppLocked) return null;

  const handleUnlock = (e) => {
    e?.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter your passcode.');
      triggerShake();
      return;
    }

    const success = unlockApp(passcode);
    if (success) {
      triggerHaptic('success');
      setIsUnlocking(true);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FF4D6D', '#FF758F', '#A855F7']
      });
    } else {
      triggerHaptic('error');
      setError('Incorrect passcode. Please try again.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    inputRef.current?.select();
  };

  const handleBiometric = async () => {
    triggerHaptic('medium');
    const success = await triggerBiometricUnlock();
    if (success) {
      triggerHaptic('success');
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.5 }
      });
    } else {
      setError('Biometric authentication failed. Use your passcode.');
      triggerShake();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-50 flex items-center justify-center p-3 select-none bg-[#110519]/95 backdrop-blur-2xl"
      >
        {/* Ambient Romantic Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-rose-600/25 via-pink-500/20 to-purple-700/25 blur-3xl pointer-events-none" />

        {/* Lock Screen Container */}
        <motion.div
          initial={{ scale: 0.92, y: 16 }}
          animate={{
            scale: 1,
            y: 0,
            x: isShaking ? [-8, 8, -6, 6, -3, 3, 0] : 0
          }}
          transition={{
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
            x: { duration: 0.45 }
          }}
          className="relative w-full max-w-[340px] flex flex-col items-center text-center p-5 rounded-3xl bg-white/[0.04] border border-rose-500/25 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(244,63,94,0.18)]"
        >
          {/* Logo with Soft Aura */}
          <div className="relative mb-3">
            <div className="absolute -inset-3 rounded-full bg-rose-500/20 blur-xl pointer-events-none animate-pulse-subtle" />
            <PulsePathLogo
              size={54}
              variant="primary"
              alt="PulsePath Protected"
              className="relative filter drop-shadow-[0_4px_16px_rgba(255,42,122,0.5)]"
            />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[10px] font-medium text-rose-300 mb-2">
            <Lock className="w-3 h-3 text-rose-400" />
            <span>Space Locked for Privacy</span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Welcome Back ❤️
          </h2>
          <p className="text-xs text-rose-200/70 mt-0.5 max-w-[240px]">
            {currentUser?.name ? `${currentUser.name}, enter` : 'Enter'} your secret passcode to unlock
          </p>

          {/* Form */}
          <form onSubmit={handleUnlock} className="w-full mt-4 space-y-3">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type={showPasscode ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter secret passcode..."
                disabled={isUnlocking}
                className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/[0.06] border text-center text-white placeholder-rose-300/40 text-sm focus:outline-none transition-all ${
                  error
                    ? 'border-red-400/80 bg-red-950/20 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'border-white/15 focus:border-rose-400/70 focus:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                tabIndex={-1}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-rose-300/60 hover:text-white transition-colors cursor-pointer"
                aria-label={showPasscode ? 'Hide password' : 'Show password'}
              >
                {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] text-red-300 bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            {/* Hint Box (if available) */}
            {passcodeHint && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[10px] text-rose-300/80 hover:text-rose-200 flex items-center gap-1 mx-auto transition-colors"
                >
                  <HelpCircle className="w-3 h-3 text-rose-400" />
                  <span>{showHint ? 'Hide Passcode Hint' : 'Show Passcode Hint'}</span>
                </button>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1 p-2 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] text-rose-200/90 text-center"
                  >
                    💡 Hint: <strong className="text-rose-300">{passcodeHint}</strong>
                  </motion.div>
                )}
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isUnlocking}
              className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:via-pink-600 hover:to-purple-700 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all cursor-pointer focus:outline-none"
            >
              {isUnlocking ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Opening Space...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Unlock Space</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Biometric Unlock Option */}
            {(biometricsSupported || biometricsEnabled) && (
              <button
                type="button"
                onClick={handleBiometric}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-95 text-[11px] font-medium text-rose-200 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <Fingerprint className="w-3.5 h-3.5 text-rose-400" />
                <span>Unlock with Face ID / Biometrics</span>
              </button>
            )}
          </form>

          {/* Quick Default Passcode Hint for Testing */}
          <div className="mt-3.5 pt-2 border-t border-white/[0.08] text-center w-full">
            <button
              type="button"
              onClick={() => {
                setPasscode('pulsepath');
                if (error) setError('');
              }}
              className="text-[10px] text-rose-300/60 hover:text-rose-200 transition-colors"
            >
              Default demo passcode: <span className="underline font-mono">pulsepath</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default AppLockOverlay;
