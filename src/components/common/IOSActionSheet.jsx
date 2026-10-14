import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { iosSheet, triggerHaptic } from '../../utils/iosMotion';

/**
 * IOSActionSheet — Apple iOS-Grade Bottom Drawer & Action Sheet
 * 
 * Features:
 * - Accessible close action with smooth spring physics
 * - Frosted blur backdrop with click-outside dismissal
 * - Cupertino rounded top corners and pull indicator handle
 */
export function IOSActionSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  showClose = true,
  maxHeight = 'max-h-[85vh]',
}) {
  // Lock body scroll when sheet is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      triggerHaptic('light');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Frosted iOS Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* iOS Sheet Content with Explicit Visible Navigation */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={iosSheet}
            className={`
              relative w-full max-w-lg bg-[#140D24]/95 border border-rose-500/25
              rounded-t-[28px] sm:rounded-[28px] shadow-2xl backdrop-blur-2xl
              overflow-hidden flex flex-col ${maxHeight} z-10
            `}
            style={{
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 77, 109, 0.15)',
            }}
          >

            {/* Sheet Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-white tracking-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-rose-200/60 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-rose-200/80 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Sheet Body */}
            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default IOSActionSheet;
