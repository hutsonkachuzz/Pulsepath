import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Mail, Image, CalendarHeart, Sun, Moon, Menu } from 'lucide-react';
import { useCouple } from '../../context/CoupleContext';
import { useTheme } from '../../context/ThemeContext';
import { BottomNav } from './BottomNav';

const QUICK_ACTIONS = [
  { id: 'date', label: 'Special Date', icon: CalendarHeart, color: 'from-amber-500 via-rose-500 to-pink-500' },
  { id: 'photo', label: 'Photo Memory', icon: Image, color: 'from-purple-500 via-pink-500 to-rose-400' },
  { id: 'letter', label: 'Love Letter', icon: Mail, color: 'from-rose-600 via-pink-600 to-purple-600' },
  { id: 'thought', label: 'Love Thought', icon: Sparkles, color: 'from-pink-500 via-rose-400 to-amber-400' },
  { id: 'memory', label: 'Memory', icon: Heart, color: 'from-rose-500 via-pink-500 to-rose-600' },
];

export function IPhoneMockupFrame({
  children,
  onOpenQuickAction,
  onOpenMoreMenu,
  onOpenMoodModal,
  isQuickActionOpen = false,
  onCloseQuickAction,
  onSelectQuickAction,
  hideAppHeader = false,
  hideBottomNav = false,
  customHeader = null,
  overlays = null
}) {
  const { couple, partnerMood, myMood } = useCouple();
  const { isDark, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const location = useLocation();
  const isChat = location.pathname === '/chat';

  // Story Fullscreen Active State (Hides app header and bottom nav while watching stories)
  const [isStoryActive, setIsStoryActive] = useState(false);

  useEffect(() => {
    const handleStoryState = (e) => {
      setIsStoryActive(Boolean(e.detail?.isOpen));
    };
    window.addEventListener('pulsepath_story_state', handleStoryState);
    return () => window.removeEventListener('pulsepath_story_state', handleStoryState);
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center p-0 sm:p-2 lg:p-4 overflow-hidden relative select-none">
      {/* Outer Smartphone Bezel Frame:
          - Screen < 640px: Fills edge-to-edge natively (100% width, 100dvh, zero border, zero radius).
          - Screen >= 640px: Max 430px centered smartphone frame with titanium bezel, hardware buttons, and ambient glow shadow.
      */}
      <div
        className="relative w-full sm:w-[420px] lg:w-[430px] max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[calc(100dvh-2rem)]
          border-0 sm:border-[12px] border-[#1e132b] rounded-none sm:rounded-[52px]
          bg-[#12071d] shadow-none sm:shadow-[0_25px_80px_rgba(0,0,0,0.92),0_0_40px_rgba(244,63,94,0.18),inset_0_0_0_1.5px_rgba(255,255,255,0.18),inset_0_0_0_3px_#10071c]
          flex flex-col will-change-[transform,opacity]"
        style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      >
        {/* =========================================================================
            HARDWARE SIDE BUTTONS (Titanium Beveled Geometry - Desktop Frame Only)
            ========================================================================= */}
        {/* Left Side: Action Button */}
        <div
          className="hidden sm:block absolute -left-[14.5px] sm:-left-[15.5px] top-[96px] w-[3.5px] h-[26px]
            bg-gradient-to-r from-[#4d3363] via-[#331c44] to-[#1e102c]
            rounded-l-[3px] border-l border-t border-b border-white/30
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none"
          title="Action Button"
        />

        {/* Left Side: Volume Up Button */}
        <div
          className="hidden sm:block absolute -left-[14.5px] sm:-left-[15.5px] top-[142px] w-[3.5px] h-[48px]
            bg-gradient-to-r from-[#4d3363] via-[#331c44] to-[#1e102c]
            rounded-l-[3px] border-l border-t border-b border-white/30
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none"
          title="Volume Up"
        />

        {/* Left Side: Volume Down Button */}
        <div
          className="hidden sm:block absolute -left-[14.5px] sm:-left-[15.5px] top-[202px] w-[3.5px] h-[48px]
            bg-gradient-to-r from-[#4d3363] via-[#331c44] to-[#1e102c]
            rounded-l-[3px] border-l border-t border-b border-white/30
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none"
          title="Volume Down"
        />

        {/* Right Side: Power / Sleep Button */}
        <div
          className="hidden sm:block absolute -right-[14.5px] sm:-right-[15.5px] top-[154px] w-[3.5px] h-[68px]
            bg-gradient-to-l from-[#4d3363] via-[#331c44] to-[#1e102c]
            rounded-r-[3px] border-r border-t border-b border-white/30
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_2px_4px_rgba(0,0,0,0.6)] pointer-events-none"
          title="Power / Side Button"
        />

        {/* =========================================================================
            SCREEN DISPLAY CONTAINER (All screen content and popups strictly bounded here)
            ========================================================================= */}
        <div id="phone-screen-container" className="relative w-full h-full bg-romantic-dark rounded-none sm:rounded-[40px] overflow-hidden flex flex-col isolate">
          
          {/* Status Bar with Dynamic Island, Wi-Fi, Signal Bars & Battery */}
          {!isStoryActive && (
            <div className="shrink-0 w-full h-11 sm:h-12 px-4 sm:px-6 pt-2 sm:pt-3 flex items-center justify-between text-white text-[13px] font-semibold tracking-tight z-40 bg-gradient-to-b from-[#11061c] to-transparent select-none">
            {/* Left: Real-time Clock */}
            <div className="w-14 text-left">
              <span className="font-semibold tracking-tight text-white/95 tabular-nums text-[13px] sm:text-[14px] leading-none font-sans">
                {isChat ? '12:10' : currentTime}
              </span>
            </div>

            {/* Center: Dynamic Island Pill with Interactive Soft Glow */}
            <div className="w-[112px] sm:w-[120px] h-[28px] sm:h-[30px] bg-black rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] flex items-center justify-between px-3 mx-auto border border-white/[0.08] relative group">
              {/* TrueDepth Front Camera Lens with Sapphire Reflection */}
              <div className="w-3 h-3 rounded-full bg-[#080812] border border-[#222238] flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-indigo-900 to-indigo-600/75" />
                <div className="w-0.5 h-0.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
              </div>

              {/* Ambient Sensor & Active Indicator Dot */}
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#090914] border border-white/10" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399]" />
              </div>
            </div>

            {/* Right: Sharp Mobile Network (Cellular), Wi-Fi, and Battery */}
            <div className="w-14 flex items-center justify-end gap-1.5 text-white/95">
              {/* 4 Sharp Mobile Network Signal Bars */}
              <svg className="w-[17px] h-[11px] shrink-0" viewBox="0 0 17 11" fill="none">
                <rect x="0.5" y="8" width="2.5" height="3" rx="0.75" fill="currentColor" />
                <rect x="4.5" y="5.5" width="2.5" height="5.5" rx="0.75" fill="currentColor" />
                <rect x="8.5" y="3" width="2.5" height="8" rx="0.75" fill="currentColor" />
                <rect x="12.5" y="0" width="2.5" height="11" rx="0.75" fill="currentColor" />
              </svg>

              {/* Sharp 3-Arc Wi-Fi Icon */}
              <svg className="w-[15px] h-[11px] shrink-0" viewBox="0 0 16 12" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 2.2C10.8 2.2 13.3 3.35 15.1 5.2C15.4 5.5 15.4 6 15.1 6.3C14.8 6.6 14.3 6.6 14 6.3C12.5 4.7 10.4 3.7 8 3.7C5.6 3.7 3.5 4.7 2 6.3C1.7 6.6 1.2 6.6 0.9 6.3C0.6 6 0.6 5.5 0.9 5.2C2.7 3.35 5.2 2.2 8 2.2ZM8 5.7C9.8 5.7 11.4 6.5 12.6 7.8C12.9 8.1 12.9 8.6 12.6 8.9C12.3 9.2 11.8 9.2 11.5 8.9C10.6 7.9 9.4 7.2 8 7.2C6.6 7.2 5.4 7.9 4.5 8.9C4.2 9.2 3.7 9.2 3.4 8.9C3.1 8.6 3.1 8.1 3.4 7.8C4.6 6.5 6.2 5.7 8 5.7ZM6.6 10.7C6.6 9.9 7.2 9.3 8 9.3C8.8 9.3 9.4 9.9 9.4 10.7C9.4 11.5 8.8 12.1 8 12.1C7.2 12.1 6.6 11.5 6.6 10.7Z" />
              </svg>

              {/* Clean Apple iOS Battery Icon */}
              <div className="flex items-center shrink-0">
                <div className="w-[23px] h-[11.5px] rounded-[3.5px] border-[1.2px] border-white/80 p-[1.5px] flex items-center">
                  <div className="w-[82%] h-full bg-white rounded-[1.5px]" />
                </div>
                <div className="w-[1.2px] h-[4px] bg-white/80 rounded-r-[1px] ml-[1px]" />
              </div>
            </div>
          </div>
          )}

          {/* Mobile App Navigation Header */}
          {customHeader ? (
            customHeader
          ) : !hideAppHeader && !isChat && !isStoryActive ? (
            <div className="shrink-0 px-3.5 sm:px-4 py-2 flex items-center justify-between border-b border-rose-500/15 bg-white/[0.03] backdrop-blur-md z-30">
              {/* Left: Couple Brand & Status */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                  <Heart className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block leading-none">
                    {couple?.nickname || "Eren & Mikasa"}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-rose-300/80 font-medium leading-none">
                      Private Space
                    </span>
                  </div>
                </div>
              </div>

              {/* Center / Right: Partner Mood Pill, Theme Toggle, & Mobile Drawer Trigger */}
              <div className="flex items-center gap-1.5">
                {/* Status Indicator Pill */}
                {onOpenMoodModal && (
                  <button
                    type="button"
                    onClick={onOpenMoodModal}
                    className="liquid-pill px-2.5 py-1 text-[11px] text-rose-200 border-rose-400/30 hover:border-rose-400/50 transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                    title="Click to update status"
                  >
                    <span>{myMood?.emoji || partnerMood?.emoji || '❤️'}</span>
                    <span className="truncate max-w-[75px]">{myMood?.mood || partnerMood?.mood || 'Loved'}</span>
                  </button>
                )}

                {/* Theme Toggle Button */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg text-rose-200/80 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-rose-400" />}
                </button>

                {/* Mobile Drawer / Menu Trigger Button */}
                {onOpenMoreMenu && (
                  <button
                    type="button"
                    onClick={onOpenMoreMenu}
                    className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                    aria-label="Open Space Menu Drawer"
                    title="Menu"
                  >
                    <Menu className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Independently Scrollable Screen Viewport */}
          <main
            id="main-content-scroll"
            className={
              isChat
                ? 'flex-1 min-h-0 h-full w-full max-w-full overflow-hidden overflow-x-hidden flex flex-col p-0 pb-0 box-border chat-container focus:outline-none'
                : 'flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4 pb-24 sm:pb-28 ios-scroll pulsepath-iphone-frame focus:outline-none'
            }
            style={isChat ? { flex: '1 1 0%', height: '100%', minHeight: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' } : {}}
          >
            {children}
          </main>

          {/* Quick Action Radial Popup Menu strictly bound inside mobile frame */}
          <AnimatePresence>
            {!isChat && isQuickActionOpen && (
              <>
                {/* Backdrop strictly inside mobile frame */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={onCloseQuickAction || onOpenQuickAction}
                  className="absolute inset-0 bg-black/65 backdrop-blur-md z-40"
                />

                {/* Popup action items centered above the floating capsule dock inside the frame */}
                <div className="absolute bottom-[74px] sm:bottom-[80px] left-0 right-0 z-50 flex flex-col items-center justify-end px-4 pointer-events-none">
                  <div className="flex flex-col-reverse items-center gap-2.5 w-full max-w-[270px] pointer-events-auto">
                    {QUICK_ACTIONS.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.button
                          key={action.id}
                          initial={{ opacity: 0, scale: 0.45, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.45, y: 20 }}
                          transition={{
                            delay: index * 0.035,
                            type: 'spring',
                            stiffness: 420,
                            damping: 26
                          }}
                          onClick={() => {
                            if (onSelectQuickAction) onSelectQuickAction(action.id);
                            if (onCloseQuickAction) onCloseQuickAction();
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl liquid-glass border border-white/20 bg-[#1b0a2c]/95 hover:bg-[#27103f] hover:border-rose-400/60 shadow-[0_10px_28px_rgba(0,0,0,0.7),0_0_18px_rgba(244,63,94,0.25)] group focus:outline-none transition-all active:scale-95 cursor-pointer backdrop-blur-2xl"
                        >
                          <span className="text-xs font-semibold text-white tracking-wide group-hover:text-rose-200 transition-colors drop-shadow-sm">
                            {action.label}
                          </span>
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-tr ${action.color} flex items-center justify-center text-white shadow-glow-sm group-hover:scale-110 transition-transform shrink-0`}
                          >
                            <Icon className="w-4 h-4 stroke-[2.2]" />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>

          {/* =========================================================================
              FLOATING PILL CAPSULE DOCK (iOS Floating Navigation Bar & Home Indicator)
              ========================================================================= */}
          {isStoryActive ? null : !hideBottomNav && !isChat ? (
            <div className="absolute bottom-2.5 sm:bottom-3 left-0 right-0 z-30 flex flex-col items-center pointer-events-none select-none px-3">
              <BottomNav
                onOpenQuickAction={onOpenQuickAction}
                onOpenMoreMenu={onOpenMoreMenu}
                isQuickActionOpen={isQuickActionOpen}
              />
              {/* Sleek iOS Home Indicator Bar underneath Floating Pill */}
              <div className="w-28 h-1 bg-white/40 rounded-full mt-2 pointer-events-none shadow-sm" />
            </div>
          ) : (
            /* Dedicated Bottom Bar for Chat screen or Auth views with iOS Home Indicator */
            <div className="w-full py-1.5 flex justify-center bg-[#140822] shrink-0 z-30 select-none">
              <div className="w-32 h-1 bg-white/35 rounded-full pointer-events-none shadow-sm" />
            </div>
          )}

          {/* =========================================================================
              CONTAINER-SCOPED OVERLAYS (More Menu Drawer & Modals Strictly Inside Frame)
              ========================================================================= */}
          {overlays}

        </div>
      </div>
    </div>
  );
}
