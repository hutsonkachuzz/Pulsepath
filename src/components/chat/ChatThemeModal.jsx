import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Check,
  Sparkles,
  X,
  Palette,
  ArrowRight,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { CHAT_THEMES, getChatTheme } from '../../config/chatThemes';
import { RomanticButton } from '../common/RomanticButton';

const PRESET_WALLPAPERS = [
  {
    id: 'wp_galaxy',
    name: 'Cosmic Galaxy',
    tag: 'Romantic Stars',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wp_roses',
    name: 'Velvet Roses',
    tag: 'Petal Dreams',
    url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wp_sunset',
    name: 'Twilight Sunset',
    tag: 'Warm Horizon',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wp_midnight',
    name: 'Midnight Purple',
    tag: 'Deep Amethyst',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wp_bokeh',
    name: 'Fairy Lights',
    tag: 'Golden Sparkles',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'wp_candle',
    name: 'Soft Glow',
    tag: 'Intimate Ambiance',
    url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80'
  }
];

export function ChatThemeModal({
  isOpen,
  onClose,
  currentTheme = 'classic',
  onApplyTheme,
  currentWallpaper = '',
  currentWallpaperOpacity = 0.35,
  currentWallpaperBlur = 0,
  onApplyWallpaper,
  partnerName = 'Mikasa'
}) {
  const [activeTab, setActiveTab] = useState('wallpaper'); // 'wallpaper' | 'theme'
  const [selectedThemeId, setSelectedThemeId] = useState(currentTheme);
  const [wallpaperUrl, setWallpaperUrl] = useState(currentWallpaper);
  const [wallpaperOpacity, setWallpaperOpacity] = useState(currentWallpaperOpacity);
  const [wallpaperBlur, setWallpaperBlur] = useState(currentWallpaperBlur);
  const wallpaperFileRef = useRef(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedThemeId(currentTheme);
      setWallpaperUrl(currentWallpaper);
      setWallpaperOpacity(currentWallpaperOpacity);
      setWallpaperBlur(currentWallpaperBlur);
    }
  }, [isOpen, currentTheme, currentWallpaper, currentWallpaperOpacity, currentWallpaperBlur]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewTheme = getChatTheme(selectedThemeId);
  const themeList = Object.values(CHAT_THEMES);

  // Custom photo upload for wallpaper
  const handleUploadWallpaper = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setWallpaperUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
    if (wallpaperFileRef.current) wallpaperFileRef.current.value = '';
  };

  const handleApplyAll = () => {
    if (onApplyTheme) onApplyTheme(selectedThemeId);
    if (onApplyWallpaper) {
      onApplyWallpaper({
        url: wallpaperUrl,
        opacity: wallpaperOpacity,
        blur: wallpaperBlur
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-xl z-10 rounded-3xl liquid-glass border border-rose-500/30 bg-[#160a26]/98 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-white hover:bg-white/10 transition-colors -ml-1 cursor-pointer focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="text-center">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center justify-center gap-2">
                <Palette className="w-4 h-4 text-rose-400" />
                <span>Chat Wallpaper & Theme</span>
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs (Wallpaper vs Theme) */}
          <div className="flex items-center gap-2 px-5 pt-3 pb-1 shrink-0 border-b border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('wallpaper')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'wallpaper'
                  ? 'bg-rose-500/25 border border-rose-400/50 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <ImageIcon className="w-4 h-4 text-rose-300" />
              <span>Chat Wallpaper</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-purple-500/25 border border-purple-400/50 text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Palette className="w-4 h-4 text-purple-300" />
              <span>Color Themes</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 chat-scroll-area">
            {/* LIVE PREVIEW BOX */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Live Chat Preview</span>
                </span>
                <span className="text-[11px] text-rose-200/60 font-medium">
                  {wallpaperUrl ? 'Custom Wallpaper' : previewTheme.name}
                </span>
              </div>

              {/* Mock Chat Viewport with dynamic wallpaper preview */}
              <div
                className="rounded-2xl border border-white/15 p-4 sm:p-5 relative overflow-hidden shadow-inner bg-[#12071d]"
                style={{ minHeight: '160px' }}
              >
                {/* Wallpaper background image */}
                {wallpaperUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all"
                    style={{
                      backgroundImage: `url(${wallpaperUrl})`,
                      opacity: wallpaperOpacity,
                      filter: `blur(${wallpaperBlur}px)`
                    }}
                  />
                )}

                {/* Vector doodle pattern overlay */}
                <div className="absolute inset-0 bg-black/35 pointer-events-none" />

                {/* Mock message stream */}
                <div className="space-y-2.5 relative z-10 text-xs">
                  {/* Received bubble */}
                  <div className="flex items-end gap-2 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {partnerName[0] || 'M'}
                    </div>
                    <div className="px-3.5 py-2 rounded-[22px] rounded-bl-[6px] bg-[#221038]/95 border border-white/15 text-white shadow-md backdrop-blur-md">
                      <span>Thinking of you, my love ❤️</span>
                    </div>
                  </div>

                  {/* Sent bubble */}
                  <div className="flex items-end justify-end gap-2">
                    <div className="px-3.5 py-2 rounded-[22px] rounded-br-[6px] bg-gradient-to-tr from-[#e11d48] to-[#ec4899] text-white shadow-md border border-rose-400/30">
                      <span>Always by your side ✨</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAB 1: WALLPAPER CONTROLS */}
            {activeTab === 'wallpaper' && (
              <div className="space-y-4">
                {/* Upload Button & Reset Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <input
                    ref={wallpaperFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadWallpaper}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => wallpaperFileRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/25 to-purple-600/25 hover:from-rose-500/35 hover:to-purple-600/35 border border-rose-400/40 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-300" />
                    <span>Upload Custom Wallpaper</span>
                  </button>

                  {wallpaperUrl && (
                    <button
                      type="button"
                      onClick={() => setWallpaperUrl('')}
                      className="px-3 py-1.5 rounded-xl text-xs text-rose-300/70 hover:text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Remove Wallpaper</span>
                    </button>
                  )}
                </div>

                {/* Opacity & Blur Sliders */}
                {wallpaperUrl && (
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Wallpaper Display Controls</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-white/70 mb-1">
                        <span>Wallpaper Opacity</span>
                        <span>{Math.round(wallpaperOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="0.8"
                        step="0.05"
                        value={wallpaperOpacity}
                        onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-white/70 mb-1">
                        <span>Background Blur</span>
                        <span>{wallpaperBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="1"
                        value={wallpaperBlur}
                        onChange={(e) => setWallpaperBlur(parseInt(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Preset Wallpapers Grid */}
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300 block mb-2.5">
                    Curated Romantic Wallpapers
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {PRESET_WALLPAPERS.map((wp) => {
                      const isSelected = wallpaperUrl === wp.url;
                      return (
                        <button
                          key={wp.id}
                          type="button"
                          onClick={() => setWallpaperUrl(wp.url)}
                          className={`relative rounded-xl overflow-hidden aspect-[16/10] border text-left transition-all group cursor-pointer ${
                            isSelected
                              ? 'border-rose-400 ring-2 ring-rose-400/60 scale-[1.02]'
                              : 'border-white/15 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={wp.url}
                            alt={wp.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-2 flex flex-col justify-end">
                            <span className="text-[11px] font-semibold text-white leading-tight">
                              {wp.name}
                            </span>
                            <span className="text-[9px] text-rose-200/70">{wp.tag}</span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: THEME PALETTE SELECTION GRID */}
            {activeTab === 'theme' && (
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-3">
                  Select a Theme Palette ({themeList.length} styles)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {themeList.map((t) => {
                    const isSelected = selectedThemeId === t.id;
                    const isCurrent = currentTheme === t.id;

                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedThemeId(t.id)}
                        className={`
                          p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2.5 cursor-pointer
                          ${
                            isSelected
                              ? 'bg-white/[0.12] border-rose-400 shadow-liquid-glow scale-[1.02]'
                              : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold text-white text-xs tracking-tight">
                              {t.name}
                            </div>
                            <div className="text-[10px] text-rose-200/60 line-clamp-1 mt-0.5">
                              {t.tagline}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-1.5">
                            {t.swatch.map((color, idx) => (
                              <span
                                key={idx}
                                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          {isCurrent && (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Current
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-black/30 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <RomanticButton
              size="md"
              onClick={handleApplyAll}
              icon={ArrowRight}
              className="px-6 py-2.5 text-xs shadow-liquid-hover"
            >
              <span>Apply Wallpaper & Theme</span>
            </RomanticButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ChatThemeModal;
