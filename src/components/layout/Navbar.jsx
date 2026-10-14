import React, { useState, useRef, useEffect, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sun, Moon, Sparkles, LogOut, Settings as SettingsIcon, ChevronRight, Monitor, Smartphone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCouple } from '../../context/CoupleContext';
import { useTheme } from '../../context/ThemeContext';
import { useViewMode } from '../../context/ViewModeContext';
import { MoodSelectorModal } from '../common/MoodSelectorModal';
import { ensureImageDataUrl } from '../../utils/imageUtils';

import { PulsePathLogo } from '../common/PulsePathLogo';

function NavbarComponent() {
  const { currentUser, logout, isDemo } = useAuth();
  const { couple, partnerName, partnerMood, myMood, hasPartner } = useCouple();
  const { isDark, toggleTheme } = useTheme();
  const { viewMode, setViewMode } = useViewMode();
  const navigate = useNavigate();

  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileMenuOpen]);

  return (
    <>
      <header className="shrink-0 w-full z-40 liquid-nav border-b border-rose-500/10 relative">
        <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4 relative">
          
          {/* Left Section: Mobile Brand or Partner Mood Quick Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile / Compact Logo & Space Name */}
            <Link to="/home" className="flex items-center gap-2.5 group shrink-0" aria-label="PulsePath Home">
              <PulsePathLogo
                size={36}
                variant="primary"
                alt="PulsePath logo"
                className="group-hover:scale-105 transition-transform"
              />
              <div className="hidden xs:block">
                <span className="text-base font-bold tracking-tight text-white block leading-none font-sans">
                  PulsePath
                </span>
                <span className="text-[10px] text-rose-300/80 font-medium tracking-normal truncate max-w-[110px] block mt-0.5">
                  {couple?.nickname || "Eren & Mikasa"}
                </span>
              </div>
            </Link>

            {/* Desktop Left: Live Partner Mood & My Mood Pills */}
            {currentUser && couple && (
              <div className="hidden lg:flex items-center gap-2.5">
                {/* Partner Mood Pill */}
                {hasPartner && (
                  <button
                    type="button"
                    onClick={() => setIsMoodModalOpen(true)}
                    className="liquid-pill px-3 py-1.5 text-xs text-rose-200 hover:border-rose-400/50 transition-colors"
                    title="Click to update mood"
                  >
                    <span className="text-sm">{partnerMood?.emoji || '❤️'}</span>
                    <span>
                      <strong className="text-white font-medium">{partnerName}</strong> is feeling {partnerMood?.mood || 'Loved'}
                    </span>
                  </button>
                )}

                {/* My Mood pill */}
                <button
                  type="button"
                  onClick={() => setIsMoodModalOpen(true)}
                  className="liquid-pill px-3 py-1.5 bg-rose-500/25 border-rose-500/40 text-xs text-white hover:bg-rose-500/35 transition-colors"
                  title="Change my mood"
                >
                  <span>{myMood?.emoji || '❤️'}</span>
                  <span>My Mood</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Center Section: Dynamic View Switcher (Desktop View / Mobile View) */}
          <div className="flex items-center justify-center mx-auto my-auto shrink-0">
            <div className="relative flex items-center p-1 rounded-full bg-white/[0.06] border border-rose-400/30 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.35),0_0_15px_rgba(244,63,94,0.15)] will-change-[transform,opacity]">
              {/* Sliding Pill Indicator */}
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 shadow-[0_0_14px_rgba(244,63,94,0.7)]"
                style={{
                  left: viewMode === 'desktop' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)',
                  transform: 'translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden'
                }}
              />
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  viewMode === 'desktop' ? 'text-white drop-shadow' : 'text-rose-200/75 hover:text-white'
                }`}
                title="Switch to Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop View</span>
                <span className="sm:hidden">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`relative z-10 flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                  viewMode === 'mobile' ? 'text-white drop-shadow' : 'text-rose-200/75 hover:text-white'
                }`}
                title="Switch to Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile View</span>
                <span className="sm:hidden">Mobile</span>
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Demo indicator badge */}
            {isDemo && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Demo Space
              </span>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-rose-400" />}
            </button>

            {/* User Profile / Menu with Floating Bubble Pop-Up */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full hover:ring-2 hover:ring-rose-400/50 bg-white/5 hover:bg-white/10 transition-all cursor-pointer focus:outline-none"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="User Profile & Settings Menu"
                >
                  <div className="relative">
                    {currentUser.avatar ? (
                      <img
                        src={ensureImageDataUrl(currentUser.avatar)}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 border border-rose-300/50 flex items-center justify-center text-xs font-bold text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                        {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    {/* Active pulse dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#130822] rounded-full shadow-[0_0_6px_#34d399]" />
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-white max-w-[110px] truncate tracking-wide">
                    {currentUser.name}
                  </span>
                </button>

                {/* Floating Bubble Pop-Up Dropdown */}
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.88, y: -10, transformOrigin: 'top right' }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -8 }}
                      transition={{
                        type: 'spring',
                        damping: 24,
                        stiffness: 380,
                        mass: 0.8
                      }}
                      className="absolute right-0 mt-3 w-64 sm:w-72 rounded-2xl p-2 z-[70] will-change-[transform,opacity]
                        bg-gradient-to-b from-[#1d1230]/95 via-[#150b24]/95 to-[#0e0719]/98
                        backdrop-blur-2xl border border-rose-400/35
                        shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(244,63,94,0.22),inset_0_1px_1px_rgba(255,255,255,0.2)]
                        before:content-[''] before:absolute before:-top-1.5 before:right-5 before:w-3 before:h-3
                        before:rotate-45 before:bg-[#1d1230] before:border-t before:border-l before:border-rose-400/40 before:z-10"
                    >
                      {/* Top Header Bubble Card */}
                      <div className="px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/5 mb-1.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500/30 to-pink-500/30 border border-rose-400/40 flex items-center justify-center shrink-0">
                          {currentUser.avatar ? (
                            <img
                              src={ensureImageDataUrl(currentUser.avatar)}
                              alt={currentUser.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-rose-200">
                              {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate leading-tight">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-rose-300/80 truncate">
                            {currentUser.email || (couple?.nickname || "Eren & Mikasa's Space")}
                          </p>
                        </div>
                      </div>

                      {/* Menu List */}
                      <div className="space-y-1">
                        {/* Option 1: Update My Mood */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setIsMoodModalOpen(true);
                          }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-rose-100 hover:text-white
                            bg-white/[0.02] hover:bg-gradient-to-r hover:from-rose-500/20 hover:to-pink-500/10
                            border border-transparent hover:border-rose-400/30 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 group-hover:animate-pulse" />
                            </div>
                            <div>
                              <span className="font-medium text-white block">Update My Mood</span>
                              <span className="text-[10px] text-rose-300/60 block">Share how you feel</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-rose-300 group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Option 2: Couple Settings */}
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-rose-100 hover:text-white
                            bg-white/[0.02] hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/10
                            border border-transparent hover:border-purple-400/30 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                              <SettingsIcon className="w-3.5 h-3.5 text-purple-300 group-hover:rotate-45 transition-transform duration-300" />
                            </div>
                            <div>
                              <span className="font-medium text-white block">Couple Settings</span>
                              <span className="text-[10px] text-rose-300/60 block">Space & preferences</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                        </Link>

                        {/* Divider */}
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent my-1" />

                        {/* Option 3: Sign Out */}
                        <button
                          type="button"
                          onClick={async () => {
                            setIsProfileMenuOpen(false);
                            sessionStorage.removeItem('pulsepath_logged_in');
                            await logout();
                            navigate('/');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-300 hover:text-red-100
                            bg-red-500/[0.04] hover:bg-red-500/20
                            border border-transparent hover:border-red-400/40 transition-all flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                              <LogOut className="w-3.5 h-3.5 text-red-400" />
                            </div>
                            <div>
                              <span className="font-medium text-red-200 block">Sign Out</span>
                              <span className="text-[10px] text-red-300/60 block">Return to welcome screen</span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-red-400/40 group-hover:text-red-300 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-medium text-rose-200 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium shadow-glow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mood Selector Modal */}
      <MoodSelectorModal
        isOpen={isMoodModalOpen}
        onClose={() => setIsMoodModalOpen(false)}
      />
    </>
  );
}

export const Navbar = memo(NavbarComponent);
export default Navbar;
