import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye } from 'lucide-react';
import { useSecurity } from '../../context/SecurityContext';

export function PrivacyBlurShield() {
  const { isScreenBlurred, setIsScreenBlurred, isAppLocked } = useSecurity();

  // If already locked, the lock overlay takes precedence
  if (!isScreenBlurred || isAppLocked) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsScreenBlurred(false)}
        className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-3xl select-none cursor-pointer"
        title="Click to reveal screen"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.04] border border-rose-500/30 max-w-[280px] shadow-2xl"
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-sm font-bold text-white tracking-tight">
            Screen Hidden for Privacy
          </h3>
          <p className="text-[11px] text-rose-200/70 mt-1 leading-relaxed">
            Intimate chats and memories are shielded from shoulder surfing.
          </p>

          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-[11px] font-medium text-rose-200">
            <Eye className="w-3 h-3 text-rose-300" />
            <span>Tap anywhere to reveal</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PrivacyBlurShield;
