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
        style={{
          height: '100dvh',
          maxHeight: '100dvh',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
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
          
          {/* Mobile App Navigation Header */}
          {customHeader ? (
            customHeader
          ) : !hideAppHeader && !isChat && !isStoryActive ? (
            <header
              className="top-header shrink-0 sticky top-0 z-[1000] w-full px-3.5 sm:px-4 flex items-center justify-between border-b border-rose-500/15 bg-[#160b1a]/95 text-white shadow-md relative"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 47px) + 8px)',
                paddingBottom: '12px',
                background: 'rgba(22, 11, 26, 0.92)',
                WebkitBackdropFilter: 'blur(16px)',
                backdropFilter: 'blur(16px)',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                transform: 'translateZ(0)'
              }}
            >
              {/* Left: Couple Brand & Status */}
              <div className="flex items-center gap-2" style={{ transform: 'translateZ(0)' }}>
                <div
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center border border-white/20 shadow-sm shrink-0"
                  style={{ transform: 'translateZ(0)' }}
                >
                  <Heart className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <div style={{ transform: 'translateZ(0)' }}>
                  <span
                    className="text-xs font-bold text-white block leading-none font-sans"
                    style={{
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      transform: 'translateZ(0)'
                    }}
                  >
                    {couple?.nickname || "Eren & Mikasa"}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5" style={{ transform: 'translateZ(0)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span
                      className="text-[10px] text-rose-300/90 font-medium leading-none"
                      style={{
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        transform: 'translateZ(0)'
                      }}
                    >
                      Private Space
                    </span>
                  </div>
                </div>
              </div>

              {/* Center / Right: Partner Mood Pill, Theme Toggle, & Mobile Drawer Trigger */}
              <div className="flex items-center gap-1.5 shrink-0" style={{ transform: 'translateZ(0)' }}>
                {/* Status Indicator Pill */}
                {onOpenMoodModal && (
                  <button
                    type="button"
                    onClick={onOpenMoodModal}
                    className="liquid-pill px-2.5 py-1 text-[11px] text-rose-200 border-rose-400/30 hover:border-rose-400/50 transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                    title="Click to update status"
                    style={{
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale',
                      transform: 'translateZ(0)'
                    }}
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
                  style={{ transform: 'translateZ(0)' }}
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
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <Menu className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </header>
          ) : null}

          {/* Independently Scrollable Screen Viewport */}
          <main
            id="main-content-scroll"
            className={
              isChat
                ? 'flex-1 min-h-0 h-full w-full max-w-full overflow-hidden flex flex-col p-0 pb-0 box-border chat-container focus:outline-none'
                : 'flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4 pb-[calc(90px+env(safe-area-inset-bottom,20px))] sm:pb-28 ios-scroll pulsepath-iphone-frame focus:outline-none'
            }
            style={isChat ? { flex: '1 1 0%', height: '100%', minHeight: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflow: 'hidden' } : {}}
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

                {/* Popup action items centered above the bottom dock inside the frame */}
                <div className="absolute bottom-[calc(68px+max(10px,env(safe-area-inset-bottom,16px)))] left-0 right-0 z-[1001] flex flex-col items-center justify-end px-4 pointer-events-none">
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
              BOTTOM NAVIGATION DOCK (Solid Edge-to-Edge Backing - Sits Cleanly at Bottom)
              ========================================================================= */}
          {isStoryActive ? null : !hideBottomNav && !isChat ? (
            <nav
              className="absolute bottom-0 left-0 right-0 z-[1000] flex flex-col items-center select-none px-3 pt-2 pb-[max(10px,env(safe-area-inset-bottom,16px))] bg-[#160b1a]/95 border-t border-rose-500/15 shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
              style={{
                WebkitBackdropFilter: 'blur(16px)',
                backdropFilter: 'blur(16px)',
                transform: 'translateZ(0)',
                WebkitFontSmoothing: 'antialiased'
              }}
            >
              <BottomNav
                onOpenQuickAction={onOpenQuickAction}
                onOpenMoreMenu={onOpenMoreMenu}
                isQuickActionOpen={isQuickActionOpen}
              />
            </nav>
          ) : null}

          {/* =========================================================================
              CONTAINER-SCOPED OVERLAYS (More Menu Drawer & Modals Strictly Inside Frame)
              ========================================================================= */}
          {overlays}

        </div>
      </div>
    </div>
  );
}
