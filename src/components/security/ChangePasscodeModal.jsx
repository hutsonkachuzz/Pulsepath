import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, X, HelpCircle, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSecurity } from '../../context/SecurityContext';
import { triggerHaptic } from '../../utils/iosMotion';
import { Modal } from '../common/Modal';

export function ChangePasscodeModal({ isOpen, onClose }) {
  const {
    customPasscode,
    hasCustomPasscode,
    passcodeHint,
    verifyPasscode,
    updatePasscode,
    resetPasscodeToDefault
  } = useSecurity();

  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [hint, setHint] = useState(passcodeHint || '');
  const [showPasscodes, setShowPasscodes] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // If custom passcode was already set, verify current
    if (hasCustomPasscode) {
      if (!currentPasscode.trim()) {
        setError('Please enter your current passcode.');
        triggerHaptic('error');
        return;
      }
      if (!verifyPasscode(currentPasscode)) {
        setError('Current passcode is incorrect.');
        triggerHaptic('error');
        return;
      }
    }

    if (newPasscode.length < 4) {
      setError('New passcode must be at least 4 characters.');
      triggerHaptic('error');
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setError('New passcodes do not match.');
      triggerHaptic('error');
      return;
    }

    const updated = updatePasscode(newPasscode, hint);
    if (updated) {
      triggerHaptic('success');
      setSuccess(true);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FF4D6D', '#FF758F', '#A855F7']
      });

      setTimeout(() => {
        setSuccess(false);
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
        onClose();
      }, 1500);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset secret passcode back to default ("pulsepath")?')) {
      resetPasscodeToDefault();
      triggerHaptic('medium');
      alert('Passcode reset to default: pulsepath');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Master Passcode & Security PIN 🔑"
      subtitle="Create a secret code known only to you and your partner"
      scoped={true}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-left">
        {error && (
          <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Passcode updated successfully! ❤️</span>
          </div>
        )}

        {/* Current Passcode (only if custom is set) */}
        {hasCustomPasscode && (
          <div>
            <label className="block text-xs font-medium text-rose-200/90 mb-1">
              Current Passcode
            </label>
            <div className="relative">
              <input
                type={showPasscodes ? 'text' : 'password'}
                required
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                placeholder="Enter current passcode..."
                className="w-full glass-input px-3 py-2 text-xs rounded-xl"
              />
            </div>
          </div>
        )}

        {/* New Passcode */}
        <div>
          <label className="block text-xs font-medium text-rose-200/90 mb-1">
            New Secret Passcode / PIN
          </label>
          <div className="relative">
            <input
              type={showPasscodes ? 'text' : 'password'}
              required
              minLength={4}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder="e.g. 2026 or secret word"
              className="w-full glass-input px-3 py-2 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Confirm Passcode */}
        <div>
          <label className="block text-xs font-medium text-rose-200/90 mb-1">
            Confirm New Passcode
          </label>
          <div className="relative">
            <input
              type={showPasscodes ? 'text' : 'password'}
              required
              minLength={4}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Re-enter new passcode..."
              className="w-full glass-input px-3 py-2 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Secret Hint */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-rose-200/90">
              Passcode Hint (Optional)
            </label>
            <span className="text-[10px] text-rose-300/60">Visible on lock screen</span>
          </div>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. Our anniversary month or favorite movie"
            className="w-full glass-input px-3 py-2 text-xs rounded-xl"
          />
        </div>

        {/* Show/Hide Passcode Toggle */}
        <div className="flex items-center justify-between pt-1 text-xs text-rose-200/80">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showPasscodes}
              onChange={() => setShowPasscodes(!showPasscodes)}
              className="accent-rose-500 rounded"
            />
            <span>Show characters</span>
          </label>

          {hasCustomPasscode && (
            <button
              type="button"
              onClick={handleReset}
              className="text-rose-400 hover:text-rose-300 text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to default</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs text-rose-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white text-xs font-semibold shadow-glow-sm cursor-pointer"
          >
            Save Secret Passcode ❤️
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePasscodeModal;
