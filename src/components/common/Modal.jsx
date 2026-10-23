import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-[360px]',
  variant = 'center', // 'center' (default compact popup) | 'bottom-sheet'
  scoped = false
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isCenter = variant === 'center';
  const containerPosition = scoped ? 'absolute inset-0' : 'fixed inset-0';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`${containerPosition} pulsepath-modal-container z-[100000] flex ${
            isCenter ? 'items-center justify-center p-3 sm:p-4' : 'items-end sm:items-center justify-center p-2 sm:p-3 pb-0 sm:pb-3'
          } overflow-hidden pointer-events-auto select-none`}
        >
          {/* Dimmed Backdrop with high z-index above bottom navbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className={`${containerPosition} bg-black/80 backdrop-blur-md z-0`}
          />

          {/* Centered Compact Dialog Card */}
          <motion.div
            initial={isCenter ? { opacity: 0, scale: 0.92, y: 10 } : { opacity: 0, y: 50, scale: 0.95 }}
            animate={isCenter ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isCenter ? { opacity: 0, scale: 0.92, y: 10 } : { opacity: 0, y: 50, scale: 1 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className={`
              relative w-[92%] sm:w-full ${maxWidth} z-10
              liquid-glass border border-rose-500/35 bg-[#170a24]/98
              p-4 sm:p-4.5 ${isCenter ? 'rounded-[24px]' : 'rounded-t-[32px] sm:rounded-3xl pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.85rem))] sm:pb-5'}
              shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(244,63,94,0.25)]
              overflow-hidden ${isCenter ? 'max-h-[75vh]' : 'max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top,0px)-1.5rem))]'}
              flex flex-col will-change-[transform,opacity]
            `}
            style={isCenter ? { maxHeight: '75vh' } : {}}
          >
            {/* Mobile Sheet Drag Indicator Handle only if bottom-sheet */}
            {!isCenter && (
              <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-2.5 pointer-events-none" />
            )}

            {/* Top ambient specular line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-400/80 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between mb-3 shrink-0">
              <div className="pr-2">
                {title && (
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-[10.5px] text-rose-300/80 mt-0.5 font-normal leading-normal">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 text-rose-300/70 hover:text-white transition-all shrink-0 cursor-pointer focus:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content (Smooth vertical scrollable area) */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 scrollbar-none text-left">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
