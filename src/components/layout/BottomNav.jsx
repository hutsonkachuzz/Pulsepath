import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircleHeart, Heart, Plus, Menu } from 'lucide-react';
import { triggerHaptic } from '../../utils/iosMotion';

export function BottomNav({ onOpenQuickAction, onOpenMoreMenu, isQuickActionOpen = false }) {
  return (
    <div className="w-full max-w-[380px] pointer-events-auto select-none">
      {/* iOS Floating Capsule Pill Dock */}
      <div className="relative px-3 py-1.5 rounded-full bg-[#18072b]/88 backdrop-blur-2xl border border-rose-400/35 shadow-[0_14px_40px_rgba(0,0,0,0.85),0_0_24px_rgba(244,63,94,0.22),inset_0_1px_1px_rgba(255,255,255,0.25)] flex items-center justify-between transition-all will-change-[transform,opacity]">
        {/* Top ambient glass specular sheen */}
        <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-rose-300/40 to-transparent pointer-events-none" />

        {/* 1. Home */}
        <NavLink
          to="/home"
          end
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) => `
            flex flex-col items-center justify-center min-w-[50px] min-h-[42px] px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90 cursor-pointer
            ${
              isActive
                ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                : 'text-rose-200/70 hover:text-white'
            }
          `}
        >
          <Home className="w-4 h-4 stroke-[2.2]" />
          <span className="leading-tight mt-0.5">Home</span>
        </NavLink>

        {/* 2. Our Chat */}
        <NavLink
          to="/chat"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) => `
            flex flex-col items-center justify-center min-w-[50px] min-h-[42px] px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90 cursor-pointer
            ${
              isActive
                ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                : 'text-rose-200/70 hover:text-white'
            }
          `}
        >
          <MessageCircleHeart className="w-4 h-4 stroke-[2.2]" />
          <span className="leading-tight mt-0.5">Chat</span>
        </NavLink>

        {/* 3. Central Elevated Glowing Add Action (+) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            if (onOpenQuickAction) onOpenQuickAction();
          }}
          className={`relative -my-1 w-11 h-11 rounded-full bg-gradient-to-tr from-rose-600 via-pink-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(244,63,94,0.8),inset_0_1px_1px_rgba(255,255,255,0.4)] active:scale-90 hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none ${
            isQuickActionOpen ? 'rotate-45 shadow-[0_0_26px_rgba(244,63,94,0.95)]' : ''
          }`}
          aria-label={isQuickActionOpen ? 'Close action menu' : 'Add new moment'}
        >
          <Plus className="w-5 h-5 stroke-[2.6]" />
        </button>

        {/* 4. Memories & Photo Vault */}
        <NavLink
          to="/memories"
          onClick={() => triggerHaptic('light')}
          className={({ isActive }) => `
            flex flex-col items-center justify-center min-w-[50px] min-h-[42px] px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 active:scale-90 cursor-pointer
            ${
              isActive
                ? 'bg-rose-500/20 text-rose-300 font-semibold shadow-[0_0_12px_rgba(244,63,94,0.35)]'
                : 'text-rose-200/70 hover:text-white'
            }
          `}
        >
          <Heart className="w-4 h-4 stroke-[2.2]" />
          <span className="leading-tight mt-0.5">Memories</span>
        </NavLink>

        {/* 5. Mobile More Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            if (onOpenMoreMenu) onOpenMoreMenu();
          }}
          className="flex flex-col items-center justify-center min-w-[50px] min-h-[42px] px-2.5 py-1 rounded-full text-[10px] font-medium text-rose-200/70 hover:text-white transition-all duration-200 active:scale-90 cursor-pointer focus:outline-none"
        >
          <Menu className="w-4 h-4 stroke-[2.2]" />
          <span className="leading-tight mt-0.5">More</span>
        </button>
      </div>
    </div>
  );
}
