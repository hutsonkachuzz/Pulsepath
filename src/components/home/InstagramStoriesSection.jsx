import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Plus, Camera } from 'lucide-react';
import { ensureImageDataUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';

export function InstagramStoriesSection({ onOpenStory, onAddStory, storyData = {} }) {
  const { currentUser } = useAuth();
  const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';

  const ourStories = storyData['our_stories'] || {
    title: 'Our Stories',
    subtext: 'Your Story with Eren & Us',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80',
    slides: []
  };
  const erenUpdates = storyData['eren_updates'] || {
    title: "Eren's Updates",
    subtext: 'Your Story with Eren',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    slides: []
  };

  const effectiveErenAvatar = (isEren && currentUser?.avatar)
    ? currentUser.avatar
    : (erenUpdates.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80');

  const ourSlideCount = (ourStories.slides && ourStories.slides.length) || 0;
  const erenSlideCount = (erenUpdates.slides && erenUpdates.slides.length) || 0;

  return (
    <section className="w-full select-none" aria-label="Stories and Shared Moments">
      {/* Section Sub-header */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90">
            Shared Moments
          </span>
        </div>

        {/* Quick Add Story Action */}
        <button
          type="button"
          onClick={() => onAddStory && onAddStory('our_stories')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[10px] font-semibold text-rose-300 hover:text-white transition-all cursor-pointer shadow-sm group"
        >
          <Camera className="w-3 h-3 text-rose-400 group-hover:scale-110 transition-transform" />
          <span>+ Add Story</span>
        </button>
      </div>

      {/* Stories Circles Container */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Story Circle 1: "Our Stories" */}
        <div className="relative group flex flex-col items-center text-center p-2 rounded-xl hover:bg-white/[0.04] transition-all">
          <motion.button
            type="button"
            onClick={() => onOpenStory('our_stories')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center text-center cursor-pointer focus:outline-none w-full"
          >
            {/* Instagram-Style Gradient Ring with Avatar */}
            <div className="relative mb-2">
              <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600 shadow-[0_0_18px_rgba(244,63,94,0.45)] group-hover:shadow-[0_0_24px_rgba(244,63,94,0.7)] transition-shadow">
                <div className="w-full h-full rounded-full p-[2.5px] bg-[#12071a]">
                  <img
                    src={ensureImageDataUrl(ourStories.avatar)}
                    alt="Our Stories"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Bottom-right Romantic Floating Badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 border-2 border-[#12071a] flex items-center justify-center shadow-md">
                <Heart className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            </div>

            {/* Title & Subtext */}
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-rose-200 transition-colors">
                Our Stories
              </span>
              {ourSlideCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-[9px] text-rose-300 font-bold">
                  {ourSlideCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-rose-300/80 font-normal leading-tight mt-0.5 line-clamp-2 max-w-[130px]">
              Your Story with Eren & Us
            </span>
          </motion.button>

          {/* Quick-add + Badge */}
          <button
            type="button"
            title="Upload slide to Our Stories"
            onClick={(e) => {
              e.stopPropagation();
              onAddStory && onAddStory('our_stories');
            }}
            className="absolute top-1 right-2 w-6 h-6 rounded-full bg-rose-500/90 hover:bg-rose-500 border border-white/30 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Story Circle 2: "Eren's Updates" */}
        <div className="relative group flex flex-col items-center text-center p-2 rounded-xl hover:bg-white/[0.04] transition-all">
          <motion.button
            type="button"
            onClick={() => onOpenStory('eren_updates')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center text-center cursor-pointer focus:outline-none w-full"
          >
            {/* Instagram-Style Gradient Ring with Avatar */}
            <div className="relative mb-2">
              <div className="w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] rounded-full p-[3px] bg-gradient-to-tr from-pink-500 via-rose-500 to-purple-600 shadow-[0_0_18px_rgba(236,72,153,0.45)] group-hover:shadow-[0_0_24px_rgba(236,72,153,0.7)] transition-shadow">
                <div className="w-full h-full rounded-full p-[2.5px] bg-[#12071a]">
                  <img
                    src={ensureImageDataUrl(effectiveErenAvatar)}
                    alt="Eren's Updates"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Bottom-right Status Badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-purple-500 border-2 border-[#12071a] flex items-center justify-center shadow-md">
                <Sparkles className="w-2.5 h-2.5 fill-white text-white" />
              </div>
            </div>

            {/* Title & Subtext */}
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight group-hover:text-rose-200 transition-colors">
                Eren's Updates
              </span>
              {erenSlideCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-[9px] text-purple-300 font-bold">
                  {erenSlideCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] text-rose-300/80 font-normal leading-tight mt-0.5 line-clamp-2 max-w-[130px]">
              Your Story with Eren
            </span>
          </motion.button>

          {/* Quick-add + Badge */}
          <button
            type="button"
            title="Upload slide to Eren's Updates"
            onClick={(e) => {
              e.stopPropagation();
              onAddStory && onAddStory('eren_updates');
            }}
            className="absolute top-1 right-2 w-6 h-6 rounded-full bg-purple-500/90 hover:bg-purple-500 border border-white/30 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer z-10"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default InstagramStoriesSection;
