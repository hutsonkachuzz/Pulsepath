import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Mail, Image, CalendarHeart, Plus } from 'lucide-react';

export function QuickActionFab({
  isOpen,
  onToggle,
  onSelectAction
}) {
  const actions = [
    { id: 'date', label: 'Special Date', icon: CalendarHeart, color: 'from-amber-500 via-rose-500 to-pink-500' },
    { id: 'photo', label: 'Photo Memory', icon: Image, color: 'from-purple-500 via-pink-500 to-rose-400' },
    { id: 'letter', label: 'Love Letter', icon: Mail, color: 'from-rose-600 via-pink-600 to-purple-600' },
    { id: 'thought', label: 'Love Thought', icon: Sparkles, color: 'from-pink-500 via-rose-400 to-amber-400' },
    { id: 'memory', label: 'Memory', icon: Heart, color: 'from-rose-500 via-pink-500 to-rose-600' },
  ];

  return (
    <div className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-6 z-40 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            />

            {/* Menu items centered above bottom nav on mobile, aligned on desktop */}
            <div className="flex flex-col-reverse items-center lg:items-end gap-2.5 mb-3 pointer-events-auto w-full max-w-[280px] lg:max-w-none">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.45, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.45, y: 20 }}
                    transition={{ delay: index * 0.035, type: 'spring', stiffness: 420, damping: 26 }}
                    onClick={() => {
                      onSelectAction(action.id);
                      onToggle();
                    }}
                    className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 px-4 py-2.5 lg:px-0 lg:py-0 rounded-2xl lg:rounded-none liquid-glass lg:bg-transparent lg:border-0 border border-white/20 bg-[#1b0a2c]/95 hover:bg-[#27103f] hover:border-rose-400/60 shadow-[0_10px_28px_rgba(0,0,0,0.7),0_0_18px_rgba(244,63,94,0.25)] group focus:outline-none cursor-pointer active:scale-95 transition-all"
                  >
                    <span className="lg:px-3 lg:py-1.5 lg:rounded-lg lg:bg-romantic-surface/90 text-xs font-semibold lg:font-medium text-white lg:border lg:border-rose-500/20 lg:shadow-lg group-hover:text-rose-200 lg:group-hover:text-white lg:group-hover:border-rose-400/50 backdrop-blur-md transition-all drop-shadow-sm">
                      {action.label}
                    </span>
                    <div
                      className={`
                        w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gradient-to-tr ${action.color}
                        flex items-center justify-center text-white shadow-glow-sm
                        group-hover:scale-110 active:scale-95 transition-transform shrink-0
                      `}
                    >
                      <Icon className="w-4 h-4 lg:w-5 lg:h-5 stroke-[2.2]" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main Trigger Button (desktop floating button) */}
      <button
        onClick={onToggle}
        className={`
          hidden lg:flex w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-500
          items-center justify-center text-white shadow-glow-rose hover:scale-105 active:scale-95
          transition-all duration-300 pointer-events-auto
          ${isOpen ? 'rotate-45' : ''}
        `}
        aria-label="Create new memory or note"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
}
