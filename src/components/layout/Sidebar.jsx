import React, { useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  MessageCircleHeart,
  Heart,
  Sparkles,
  Mail,
  Image,
  CalendarHeart,
  Settings,
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useCouple } from '../../context/CoupleContext';
import { PulsePathLogo } from '../common/PulsePathLogo';

const NAV_ITEMS = [
  {
    to: '/home',
    label: 'Home',
    desc: 'Dashboard & live heartbeat',
    icon: Home,
    exact: true
  },
  {
    to: '/chat',
    label: 'Our Chat',
    desc: 'Whisper live & real-time',
    icon: MessageCircleHeart,
    hasLiveBadge: true
  },
  {
    to: '/memories',
    label: 'Memories',
    desc: 'Moments etched in time',
    icon: Heart
  },
  {
    to: '/thoughts',
    label: 'Love Talks',
    desc: 'Heart-to-heart topics',
    icon: Sparkles
  },
  {
    to: '/letters',
    label: 'Love Letter',
    desc: 'Sealed notes for tomorrow',
    icon: Mail
  },
  {
    to: '/gallery',
    label: 'Gallery',
    desc: 'Our visual vault',
    icon: Image
  },
  {
    to: '/dates',
    label: 'Special Day',
    desc: 'Milestones & countdowns',
    icon: CalendarHeart
  },
  {
    to: '/settings',
    label: 'Settings',
    desc: 'Space & preferences',
    icon: Settings
  }
];

/**
 * Portal-rendered floating interactive tooltip.
 * Appended to document.body so it can NEVER be clipped by any parent overflow or translate.
 */
function SidebarTooltipPortal({ tooltip }) {
  if (!tooltip || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key={tooltip.id}
        initial={{ opacity: 0, x: -10, scale: 0.93 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -8, scale: 0.93 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: `${tooltip.rect.top + tooltip.rect.height / 2}px`,
          left: `${tooltip.rect.right + 14}px`,
          transform: 'translateY(-50%)',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
        className="select-none will-change-[transform,opacity]"
        role="tooltip"
      >
        <div className="relative px-3.5 py-2.5 rounded-2xl bg-[#160826]/95 backdrop-blur-2xl border border-rose-500/35 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(244,63,94,0.3)] min-w-[155px] max-w-[250px] text-left">
          {/* Left triangle caret pointing back directly at the center of the hovered icon */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-[#160826] border-l border-b border-rose-500/35" />

          {/* Header: Prominent Name Label + Status Badges */}
          <div className="relative z-10 flex items-center justify-between gap-2.5">
            <span className="text-[13.5px] font-bold text-white tracking-tight leading-none font-sans drop-shadow-sm">
              {tooltip.label}
            </span>

            {tooltip.hasLiveBadge && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/35 px-1.5 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}

            {tooltip.badge && !tooltip.hasLiveBadge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/35 font-medium shrink-0">
                {tooltip.badge}
              </span>
            )}

            {tooltip.isActive && (
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-rose-500/30 to-pink-500/30 text-rose-200 border border-rose-400/40 font-bold shrink-0">
                Active
              </span>
            )}
          </div>

          {/* Subtitle / Description text */}
          {tooltip.desc && (
            <p className="relative z-10 text-[11px] text-rose-300/80 font-normal mt-1 leading-snug">
              {tooltip.desc}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function SidebarComponent() {
  const { couple, journeyStats } = useCouple();
  const location = useLocation();

  // Collapsed by default (Icon-only view)
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsepath_sidebar_expanded');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  // Floating portal tooltip state
  const [activeTooltip, setActiveTooltip] = useState(null);

  const toggleSidebar = () => {
    setActiveTooltip(null);
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('pulsepath_sidebar_expanded', JSON.stringify(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  const showTooltip = useCallback((e, data) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      ...data,
      rect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      }
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setActiveTooltip(null);
  }, []);

  const handleNavClick = (item) => {
    hideTooltip();
    // When selecting chat, sync the chat box and scroll to latest messages smoothly
    if (item.to === '/chat') {
      window.dispatchEvent(new CustomEvent('pulsepath_sync_chat', { detail: { focus: true } }));
    }
  };

  const coupleNickname = couple?.nickname || "Eren & Mikasa's Universe";
  const daysInLove = journeyStats?.days ?? 0;

  return (
    <>
      <aside
        aria-label="Sidebar Navigation"
        className={`
          hidden lg:flex flex-col shrink-0 h-screen sticky top-0
          bg-romantic-dark/55 backdrop-blur-2xl border-r border-rose-500/15
          select-none z-30 overflow-visible
          transition-[width] duration-300 ease-in-out
          ${isExpanded ? 'w-64' : 'w-[76px]'}
        `}
      >
        {/* 1. Header: Brand Logo & Title */}
        <div
          className={`h-16 border-b border-rose-500/15 flex items-center shrink-0 ${
            isExpanded ? 'px-4 gap-3' : 'justify-center px-2'
          }`}
        >
          <div
            className="relative group flex items-center justify-center cursor-pointer"
            onMouseEnter={(e) =>
              showTooltip(e, {
                id: 'logo',
                label: 'PulsePath',
                desc: coupleNickname,
                badge: 'Universe',
                isActive: location.pathname === '/home'
              })
            }
            onMouseLeave={hideTooltip}
            onFocus={(e) =>
              showTooltip(e, {
                id: 'logo',
                label: 'PulsePath',
                desc: coupleNickname,
                badge: 'Universe',
                isActive: location.pathname === '/home'
              })
            }
            onBlur={hideTooltip}
          >
            <NavLink
              to="/home"
              onClick={hideTooltip}
              aria-label="PulsePath Home"
              className="flex items-center justify-center rounded-2xl hover:scale-105 active:scale-95 transition-transform focus:outline-none"
            >
              <PulsePathLogo
                size={36}
                variant="primary"
                alt="PulsePath logo"
              />
            </NavLink>
          </div>

          {/* Text Title (Visible when expanded) */}
          {isExpanded && (
            <div className="min-w-0 flex-1 overflow-hidden animate-fadeIn">
              <span className="text-lg font-bold tracking-tight text-white block leading-none font-sans">
                PulsePath
              </span>
              <span className="text-xs text-rose-300/80 font-medium tracking-normal truncate block mt-1">
                {coupleNickname}
              </span>
            </div>
          )}
        </div>

        {/* 2. Days in Love Indicator */}
        <div className="px-3 pt-3.5 pb-2 shrink-0">
          {isExpanded ? (
            /* Expanded Card */
            <div
              className="px-3.5 py-2.5 rounded-2xl liquid-glass border-rose-500/20 bg-gradient-to-br from-rose-500/15 via-purple-500/5 to-rose-500/10 relative overflow-hidden animate-fadeIn cursor-pointer"
              onMouseEnter={(e) =>
                showTooltip(e, {
                  id: 'days-expanded',
                  label: 'Shared Private Space',
                  desc: `${daysInLove} days in love together`,
                  badge: 'Private'
                })
              }
              onMouseLeave={hideTooltip}
              onFocus={(e) =>
                showTooltip(e, {
                  id: 'days-expanded',
                  label: 'Shared Private Space',
                  desc: `${daysInLove} days in love together`,
                  badge: 'Private'
                })
              }
              onBlur={hideTooltip}
              tabIndex={0}
            >
              <div className="flex items-center justify-between text-xs text-rose-300/80 font-medium">
                <span>Shared Space</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Private
                </span>
              </div>
              <div className="mt-1 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-300 flex items-baseline gap-1.5">
                <span>{daysInLove}</span>
                <span className="text-xs font-normal text-rose-200/70">days in love</span>
              </div>
            </div>
          ) : (
            /* Icon-Only Compact Pill with Interactive Tooltip */
            <div
              className="relative group flex justify-center cursor-pointer"
              onMouseEnter={(e) =>
                showTooltip(e, {
                  id: 'days-compact',
                  label: 'Shared Private Space',
                  desc: `${daysInLove} days in love together`,
                  badge: 'Private'
                })
              }
              onMouseLeave={hideTooltip}
              onFocus={(e) =>
                showTooltip(e, {
                  id: 'days-compact',
                  label: 'Shared Private Space',
                  desc: `${daysInLove} days in love together`,
                  badge: 'Private'
                })
              }
              onBlur={hideTooltip}
              tabIndex={0}
              aria-label={`${daysInLove} days in love`}
            >
              <div className="w-12 h-11 rounded-2xl liquid-glass border-rose-500/25 bg-gradient-to-br from-rose-500/20 to-purple-600/15 flex flex-col items-center justify-center hover:border-rose-400/50 hover:shadow-glow-sm transition-all group-hover:scale-105">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" />
                <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-200 leading-none mt-0.5 tabular-nums">
                  {daysInLove}d
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Navigation Links (Interactive Tooltips on Hover & Focus) */}
        <nav className="space-y-2 flex-1 px-3 py-2 overflow-y-auto overflow-x-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isItemActive = location.pathname === item.to;

            return (
              <div
                key={item.to}
                className="relative group flex justify-center"
                onMouseEnter={(e) =>
                  showTooltip(e, {
                    id: item.to,
                    label: item.label,
                    desc: item.desc,
                    hasLiveBadge: item.hasLiveBadge,
                    isActive: isItemActive
                  })
                }
                onMouseLeave={hideTooltip}
                onFocus={(e) =>
                  showTooltip(e, {
                    id: item.to,
                    label: item.label,
                    desc: item.desc,
                    hasLiveBadge: item.hasLiveBadge,
                    isActive: isItemActive
                  })
                }
                onBlur={hideTooltip}
              >
                <NavLink
                  to={item.to}
                  end={item.exact}
                  onClick={() => handleNavClick(item)}
                  aria-label={item.label}
                  className={({ isActive }) => `
                    relative flex items-center rounded-2xl transition-all duration-200 focus:outline-none
                    ${
                      isExpanded
                        ? 'w-full justify-between px-3.5 py-2.5 sm:py-3 text-[15px]'
                        : 'w-12 h-12 justify-center'
                    }
                    ${
                      isActive
                        ? 'liquid-glass bg-gradient-to-tr from-rose-500/30 to-purple-600/25 text-white border-rose-400/50 shadow-liquid-glow font-semibold'
                        : 'text-rose-200/70 hover:text-white hover:bg-white/[0.08] hover:border-rose-400/30 border border-transparent'
                    }
                    group-hover:scale-105 active:scale-95
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Edge Indicator Pill (in collapsed mode) */}
                      {!isExpanded && isActive && (
                        <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-gradient-to-b from-rose-400 to-pink-500 shadow-[0_0_10px_#f43f5e]" />
                      )}

                      <div className="flex items-center gap-3.5 min-w-0">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-colors ${
                            isActive
                              ? 'text-rose-300'
                              : 'text-rose-400/80 group-hover:text-rose-200'
                          }`}
                        />
                        {isExpanded && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.hasLiveBadge && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Live
                            </span>
                          )}
                          <ChevronRight
                            className={`w-4 h-4 shrink-0 transition-all ${
                              isActive
                                ? 'opacity-80 text-rose-300'
                                : 'opacity-0 -translate-x-1 group-hover:opacity-70 group-hover:translate-x-0 text-white/40'
                            }`}
                          />
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* 4. Bottom Footer: Expand/Collapse Toggle & Romantic Whisper */}
        <div className="p-3 border-t border-rose-500/15 shrink-0 flex flex-col items-center gap-2">
          {/* Sleek Toggle Button */}
          <div
            className="relative group w-full flex justify-center"
            onMouseEnter={(e) =>
              showTooltip(e, {
                id: 'toggle-btn',
                label: isExpanded ? 'Collapse Menu' : 'Expand Menu',
                desc: isExpanded ? 'Switch to compact icon view' : 'Show full titles & details',
                badge: isExpanded ? 'Compact' : 'Expand'
              })
            }
            onMouseLeave={hideTooltip}
            onFocus={(e) =>
              showTooltip(e, {
                id: 'toggle-btn',
                label: isExpanded ? 'Collapse Menu' : 'Expand Menu',
                desc: isExpanded ? 'Switch to compact icon view' : 'Show full titles & details',
                badge: isExpanded ? 'Compact' : 'Expand'
              })
            }
            onBlur={hideTooltip}
          >
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isExpanded ? 'Collapse sidebar to icons' : 'Expand sidebar'}
              className={`
                flex items-center rounded-xl text-rose-300/70 hover:text-white hover:bg-white/[0.08]
                border border-transparent hover:border-rose-500/25 transition-all cursor-pointer focus:outline-none
                ${
                  isExpanded
                    ? 'w-full justify-between px-3 py-2 text-xs font-medium'
                    : 'w-10 h-10 justify-center'
                }
              `}
            >
              {isExpanded ? (
                <>
                  <span className="flex items-center gap-2">
                    <PanelLeftClose className="w-4 h-4 text-rose-400" />
                    <span>Collapse Menu</span>
                  </span>
                  <ChevronLeft className="w-4 h-4 text-rose-400/60" />
                </>
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-rose-400 hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          {/* Romantic Whisper (visible when expanded) */}
          {isExpanded && (
            <p className="text-[11px] font-normal text-rose-300/60 text-center leading-relaxed px-1 animate-fadeIn">
              “Two hearts. One journey. Every moment becomes a memory.”
            </p>
          )}
        </div>
      </aside>

      {/* Floating Interactive Tooltip Portal */}
      <SidebarTooltipPortal tooltip={activeTooltip} />
    </>
  );
}

export const Sidebar = memo(SidebarComponent);
export default Sidebar;
