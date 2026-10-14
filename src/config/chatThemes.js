/**
 * PulsePath Chat Themes Configuration
 * 
 * Provides distinct, elegant themes scoped specifically for the Our Chat experience:
 * - Default / Classic (PulsePath Romance)
 * - Soft Love (Pastel Blush & Peach)
 * - Midnight (Deep Obsidian & Sapphire)
 * - Sunset (Warm Amber & Coral Dusk)
 * - Ocean (Aquatic Navy & Biocyan)
 * - Lavender (Misty Lilac & Violet)
 * - Minimal (Crisp Monochrome & Slate)
 * - Dark (OLED Pure Black & Charcoal)
 * - Rose Velvet (Luxury Royal Crimson & Wine)
 */

export const CHAT_THEMES = {
  classic: {
    id: 'classic',
    name: 'Default / Classic',
    tagline: 'PulsePath Signature Romance',
    category: 'Romantic',
    swatch: ['#FF4D6D', '#7B1E48', '#1E0824'],
    styles: {
      container: 'bg-[#18051E]/95 border-rose-500/30 text-rose-50 shadow-2xl',
      header: 'bg-white/[0.05] backdrop-blur-md border-b border-rose-500/20 text-white',
      inputDock: 'bg-[#1E0824]/95 backdrop-blur-xl border-t border-rose-500/20',
      inputField: 'bg-white/[0.06] text-white placeholder-rose-200/50 border-rose-500/30 focus:border-rose-400',
      meBubble: 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white rounded-2xl rounded-br-none shadow-md border-transparent',
      partnerBubble: 'bg-white/[0.08] border border-white/15 text-rose-50 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      activeColor: 'text-rose-400',
      sendBtn: 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white hover:opacity-95 shadow-glow-sm',
      accent: '#FF4D6D',
      wallpaperOpacity: 0.04
    }
  },

  soft_love: {
    id: 'soft_love',
    name: 'Soft Love',
    tagline: 'Blush Pink & Tender Pastels',
    category: 'Romantic',
    swatch: ['#FFA8BA', '#FFD6DF', '#2D1420'],
    styles: {
      container: 'bg-[#24111C]/95 border-pink-400/30 text-pink-50 shadow-2xl',
      header: 'bg-white/[0.06] backdrop-blur-md border-b border-pink-400/25 text-white',
      inputDock: 'bg-[#2B1522]/95 backdrop-blur-xl border-t border-pink-400/25',
      inputField: 'bg-white/[0.07] text-white placeholder-pink-200/50 border-pink-400/30 focus:border-pink-300',
      meBubble: 'bg-gradient-to-tr from-pink-500 via-rose-400 to-peach text-white rounded-2xl rounded-br-none shadow-md border-transparent',
      partnerBubble: 'bg-pink-950/40 border border-pink-400/20 text-pink-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-sm',
      badge: 'bg-pink-500/20 text-pink-200 border border-pink-400/30',
      activeColor: 'text-pink-300',
      sendBtn: 'bg-gradient-to-tr from-pink-400 to-rose-400 text-white hover:opacity-95 shadow-sm',
      accent: '#FFA8BA',
      wallpaperOpacity: 0.05
    }
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep Obsidian & Starry Sapphire',
    category: 'Modern',
    swatch: ['#3B82F6', '#1E1B4B', '#070913'],
    styles: {
      container: 'bg-[#080B14]/95 border-blue-500/30 text-slate-100 shadow-2xl',
      header: 'bg-blue-950/30 backdrop-blur-md border-b border-blue-500/25 text-white',
      inputDock: 'bg-[#0B101E]/95 backdrop-blur-xl border-t border-blue-500/25',
      inputField: 'bg-white/[0.05] text-white placeholder-blue-200/50 border-blue-500/30 focus:border-blue-400',
      meBubble: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white rounded-2xl rounded-br-none shadow-lg shadow-blue-950/40 border-transparent',
      partnerBubble: 'bg-blue-950/35 border border-blue-500/20 text-blue-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      activeColor: 'text-blue-400',
      sendBtn: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:opacity-95 shadow-sm',
      accent: '#3B82F6',
      wallpaperOpacity: 0.03
    }
  },

  sunset: {
    id: 'sunset',
    name: 'Sunset',
    tagline: 'Warm Amber, Coral & Dusk',
    category: 'Romantic',
    swatch: ['#F97316', '#EC4899', '#240F1D'],
    styles: {
      container: 'bg-[#1D0D19]/95 border-orange-500/30 text-amber-50 shadow-2xl',
      header: 'bg-white/[0.05] backdrop-blur-md border-b border-orange-500/20 text-white',
      inputDock: 'bg-[#251020]/95 backdrop-blur-xl border-t border-orange-500/20',
      inputField: 'bg-white/[0.06] text-white placeholder-orange-200/50 border-orange-500/30 focus:border-orange-400',
      meBubble: 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white rounded-2xl rounded-br-none shadow-lg shadow-orange-950/30 border-transparent',
      partnerBubble: 'bg-white/[0.08] border border-orange-400/20 text-orange-50 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
      activeColor: 'text-orange-400',
      sendBtn: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:opacity-95 shadow-sm',
      accent: '#F97316',
      wallpaperOpacity: 0.04
    }
  },

  ocean: {
    id: 'ocean',
    name: 'Ocean',
    tagline: 'Deep Aquatic Navy & Biocyan',
    category: 'Modern',
    swatch: ['#06B6D4', '#0E7490', '#06131C'],
    styles: {
      container: 'bg-[#06151F]/95 border-cyan-500/30 text-cyan-50 shadow-2xl',
      header: 'bg-cyan-950/40 backdrop-blur-md border-b border-cyan-500/25 text-white',
      inputDock: 'bg-[#091B28]/95 backdrop-blur-xl border-t border-cyan-500/25',
      inputField: 'bg-white/[0.05] text-white placeholder-cyan-200/50 border-cyan-500/30 focus:border-cyan-400',
      meBubble: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-2xl rounded-br-none shadow-lg shadow-cyan-950/40 border-transparent',
      partnerBubble: 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      activeColor: 'text-cyan-400',
      sendBtn: 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:opacity-95 shadow-sm',
      accent: '#06B6D4',
      wallpaperOpacity: 0.04
    }
  },

  lavender: {
    id: 'lavender',
    name: 'Lavender',
    tagline: 'Misty Lilac & Ethereal Violet',
    category: 'Romantic',
    swatch: ['#A855F7', '#C084FC', '#180B26'],
    styles: {
      container: 'bg-[#170B24]/95 border-purple-500/30 text-purple-50 shadow-2xl',
      header: 'bg-white/[0.05] backdrop-blur-md border-b border-purple-500/20 text-white',
      inputDock: 'bg-[#1E0E2F]/95 backdrop-blur-xl border-t border-purple-500/20',
      inputField: 'bg-white/[0.06] text-white placeholder-purple-200/50 border-purple-500/30 focus:border-purple-400',
      meBubble: 'bg-gradient-to-r from-purple-600 to-violet-500 text-white rounded-2xl rounded-br-none shadow-md border-transparent',
      partnerBubble: 'bg-purple-950/40 border border-purple-400/20 text-purple-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      activeColor: 'text-purple-400',
      sendBtn: 'bg-gradient-to-tr from-purple-500 to-violet-500 text-white hover:opacity-95 shadow-sm',
      accent: '#A855F7',
      wallpaperOpacity: 0.04
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Graphite Monochrome & Clean Slate',
    category: 'Modern',
    swatch: ['#E2E8F0', '#64748B', '#0F172A'],
    styles: {
      container: 'bg-[#0F141C]/95 border-slate-700/40 text-slate-100 shadow-2xl',
      header: 'bg-slate-900/60 backdrop-blur-md border-b border-slate-700/40 text-white',
      inputDock: 'bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/40',
      inputField: 'bg-slate-800/60 text-white placeholder-slate-400 border-slate-700/50 focus:border-slate-400',
      meBubble: 'bg-slate-700 text-white rounded-2xl rounded-br-none shadow-sm border border-slate-600',
      partnerBubble: 'bg-slate-800/80 border border-slate-700 text-slate-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-sm',
      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      activeColor: 'text-slate-300',
      sendBtn: 'bg-slate-100 text-slate-900 hover:bg-white shadow-sm font-semibold',
      accent: '#94A3B8',
      wallpaperOpacity: 0.02
    }
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    tagline: 'OLED Pure Black & Native iOS Charcoal',
    category: 'Modern',
    swatch: ['#FFFFFF', '#2C2C2E', '#000000'],
    styles: {
      container: 'bg-black text-neutral-100 border border-neutral-800/80 shadow-2xl',
      header: 'bg-[#121212]/90 backdrop-blur-xl border-b border-neutral-800 text-white',
      inputDock: 'bg-[#121212]/95 backdrop-blur-xl border-t border-neutral-800',
      inputField: 'bg-[#1C1C1E] text-white placeholder-neutral-500 border-neutral-800 focus:border-neutral-600',
      meBubble: 'bg-[#0A84FF] text-white rounded-2xl rounded-br-none shadow-sm border-transparent',
      partnerBubble: 'bg-[#1C1C1E] border border-neutral-800 text-neutral-100 rounded-2xl rounded-bl-none shadow-sm',
      badge: 'bg-[#1C1C1E] text-neutral-300 border border-neutral-800',
      activeColor: 'text-sky-400',
      sendBtn: 'bg-[#0A84FF] hover:bg-[#0071E3] text-white shadow-sm',
      accent: '#0A84FF',
      wallpaperOpacity: 0.015
    }
  },

  rose_velvet: {
    id: 'rose_velvet',
    name: 'Rose Velvet',
    tagline: 'Luxury Crimson Velvet & Rose Gold',
    category: 'Romantic',
    swatch: ['#BE123C', '#E11D48', '#1C060E'],
    styles: {
      container: 'bg-[#19040D]/95 border-rose-600/35 text-rose-50 shadow-2xl',
      header: 'bg-rose-950/40 backdrop-blur-md border-b border-rose-600/25 text-white',
      inputDock: 'bg-[#220613]/95 backdrop-blur-xl border-t border-rose-600/25',
      inputField: 'bg-white/[0.06] text-white placeholder-rose-200/50 border-rose-600/35 focus:border-rose-400',
      meBubble: 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white rounded-2xl rounded-br-none shadow-lg shadow-rose-950/50 border border-rose-500/30',
      partnerBubble: 'bg-rose-950/50 border border-rose-600/25 text-rose-100 backdrop-blur-md rounded-2xl rounded-bl-none shadow-md',
      badge: 'bg-rose-600/25 text-rose-300 border border-rose-600/40',
      activeColor: 'text-rose-400',
      sendBtn: 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:opacity-95 shadow-glow-rose',
      accent: '#E11D48',
      wallpaperOpacity: 0.045
    }
  }
};

export const DEFAULT_CHAT_THEME = 'classic';

const LEGACY_THEME_ALIASES = {
  whatsapp: 'ocean',
  instagram: 'sunset',
  romantic: 'classic'
};

export function getChatTheme(themeId) {
  if (!themeId) return CHAT_THEMES[DEFAULT_CHAT_THEME];
  const resolvedId = LEGACY_THEME_ALIASES[themeId] || themeId;
  return CHAT_THEMES[resolvedId] || CHAT_THEMES[DEFAULT_CHAT_THEME];
}
