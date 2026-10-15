import React, { useEffect, useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { SegmentedControl } from '../components/common/SegmentedControl';
import { SwitchUI } from '../components/common/SwitchUI';
import { PageHeader } from '../components/common/PageHeader';
import { iosSpring, triggerHaptic } from '../utils/iosMotion';
import { useCouple } from '../context/CoupleContext';
import {
  subscribeToMemories,
  updateMemory,
  deleteMemory
} from '../services/firebaseService';
import { formatRomanticDate } from '../utils/dateUtils';
import { PulsePathLogo } from '../components/common/PulsePathLogo';
import {
  Heart,
  Calendar,
  MapPin,
  Search,
  Filter,
  Trash2,
  Star,
  Plus,
  Layers,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';

function MemoriesPageComponent() {
  const { couple } = useCouple();
  const [memories, setMemories] = useState([]);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'vault'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Photo Lightbox state
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!couple?.id) return;
    const unsub = subscribeToMemories(couple.id, (list) => setMemories(list));
    return () => unsub && unsub();
  }, [couple?.id]);

  // Filtered list (Memoized for high performance)
  const filteredMemories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return memories.filter((m) => {
      const matchesSearch =
        !query ||
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        (m.tags && m.tags.some(t => t.toLowerCase().includes(query)));

      const matchesMood = selectedMood === 'ALL' || m.mood === selectedMood;
      const matchesFav = !onlyFavorites || m.isFavorite;

      return matchesSearch && matchesMood && matchesFav;
    });
  }, [memories, searchQuery, selectedMood, onlyFavorites]);

  const handleToggleFavorite = async (memory) => {
    if (!couple?.id) return;
    await updateMemory(couple.id, memory.id, { isFavorite: !memory.isFavorite });
  };

  const handleDelete = async (id) => {
    if (!couple?.id) return;
    if (window.confirm('Are you sure you want to delete this memory?')) {
      await deleteMemory(couple.id, id);
    }
  };

  const openLightbox = (images, index = 0) => {
    setLightboxImages(images);
    setLightboxIndex(index);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative">
      {/* Extremely subtle background brand watermark (5-8% opacity) per Prompt Section 11 */}
      <PulsePathLogo
        variant="watermark"
        size={460}
        className="top-24 left-1/2 -translate-x-1/2 pointer-events-none"
      />
      {/* Header with iOS Back Arrow */}
      <PageHeader
        backLabel="Our Space"
        title="Our Moments ❤️"
        subtitle="Walking through our journey together, every moment becomes an eternal memory."
        badge="Our Continuous Story"
        badgeIcon={Sparkles}
        rightAction={
          <SegmentedControl
            options={[
              { value: 'timeline', label: 'Moments Path', icon: <Clock className="w-3.5 h-3.5" /> },
              { value: 'vault', label: 'Vault Grid', icon: <Layers className="w-3.5 h-3.5" /> }
            ]}
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val);
              triggerHaptic('light');
            }}
            size="sm"
          />
        }
      />

      {/* Filter & Search Bar with SwitchUI */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories by title, feelings, or tags..."
            className="w-full glass-input pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="glass-input px-3 py-2 text-xs text-white rounded-xl"
          >
            <option value="ALL" className="bg-romantic-dark">All Moods</option>
            <option value="Loved" className="bg-romantic-dark">❤️ Loved</option>
            <option value="Happy" className="bg-romantic-dark">😊 Happy</option>
            <option value="Romantic" className="bg-romantic-dark">🥰 Romantic</option>
            <option value="Peaceful" className="bg-romantic-dark">🌙 Peaceful</option>
            <option value="Nostalgic" className="bg-romantic-dark">✨ Nostalgic</option>
          </select>

          {/* iOS-Style Favorites Switch */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 shrink-0">
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : 'text-rose-300/60'}`} />
            <span className="text-xs text-rose-200/80 font-medium">Favorites</span>
            <SwitchUI
              checked={onlyFavorites}
              onChange={(val) => {
                setOnlyFavorites(val);
                triggerHaptic('light');
              }}
              size="sm"
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredMemories.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Your story is still being written."
        />
      ) : activeTab === 'timeline' ? (
        /* CHRONOLOGICAL TIMELINE VIEW */
        <div className="relative pl-6 sm:pl-10 space-y-8 mt-6">
          {/* Vertical glowing spine */}
          <div className="absolute left-2.5 sm:left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-rose-500 via-pink-500/60 to-purple-500/20" />

          {filteredMemories.map((mem, index) => (
            <motion.div
              key={mem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="relative"
            >
              {/* Illuminated Timeline Milestone Node */}
              <div className="absolute -left-6 sm:-left-10 top-5 -translate-x-1/2 w-8 h-8 rounded-full bg-romantic-dark border-2 border-rose-400 flex items-center justify-center shadow-glow-md z-10 animate-pulse-subtle">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
              </div>

              {/* Memory Card */}
              <GlassCard hoverEffect className="p-5 sm:p-6 ml-2 sm:ml-4 border-rose-500/25 bg-gradient-to-br from-white/[0.05] via-rose-950/20 to-purple-950/25">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>{formatRomanticDate(mem.date)}</span>
                      {mem.location && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="flex items-center gap-1 text-rose-200/70 font-normal">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {mem.location}
                          </span>
                        </>
                      )}
                      {mem.mood && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[10px] text-rose-300 border border-rose-500/30">
                            {mem.moodEmoji || '❤️'} {mem.mood}
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {mem.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(mem)}
                      className="p-1.5 rounded-lg text-rose-300/70 hover:text-amber-400 transition-colors"
                      title="Toggle favorite"
                    >
                      <Star className={`w-4 h-4 ${mem.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleDelete(mem.id)}
                      className="p-1.5 rounded-lg text-rose-300/40 hover:text-red-400 transition-colors"
                      title="Delete memory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Memory Message */}
                <div className="my-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-sm text-rose-100/90 leading-relaxed font-normal whitespace-pre-line">
                  <div className="text-[10px] uppercase font-semibold text-rose-300/70 mb-1 tracking-wider flex items-center gap-1">
                    <span>💌 Memory Note</span>
                  </div>
                  {mem.description}
                </div>

                {/* Photo Gallery Grid */}
                {mem.images && mem.images.length > 0 && (
                  <div className="mt-3.5">
                    <div className="text-[10px] uppercase font-semibold text-rose-300/70 mb-1.5 tracking-wider flex items-center gap-1">
                      <span>📸 Captured Moments ({mem.images.length})</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {mem.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          onClick={() => openLightbox(mem.images, imgIdx)}
                          className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group border border-white/10"
                        >
                          <img
                            src={imgUrl}
                            alt={mem.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs font-medium text-white px-2 py-1 rounded bg-black/60">
                              View
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags & Author Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                  <div className="flex flex-wrap gap-1.5">
                    {mem.tags && mem.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-2 py-0.5 rounded-md bg-white/[0.04] text-rose-300/80 border border-white/10 text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-rose-300/50 text-[11px]">
                    Added by {mem.authorName || 'Partner'}
                  </span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      ) : (
        /* VAULT GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {filteredMemories.map((mem) => (
            <GlassCard key={mem.id} hoverEffect className="p-5 flex flex-col justify-between">
              <div>
                {/* Image header if available */}
                {mem.images && mem.images.length > 0 && (
                  <div
                    onClick={() => openLightbox(mem.images, 0)}
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer mb-3.5 border border-white/10"
                  >
                    <img
                      src={mem.images[0]}
                      alt={mem.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {mem.images.length > 1 && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] text-white">
                        +{mem.images.length - 1} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-rose-300 mb-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3" />
                    {formatRomanticDate(mem.date)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-[11px]">
                    {mem.moodEmoji || '❤️'} {mem.mood}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mb-2 line-clamp-1">
                  {mem.title}
                </h3>
                <p className="text-xs text-rose-200/80 line-clamp-3 leading-relaxed">
                  {mem.description}
                </p>
              </div>

              <div className="pt-3 mt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleToggleFavorite(mem)}
                  className="p-1 rounded-lg text-rose-300/70 hover:text-amber-400 transition-colors"
                >
                  <Star className={`w-4 h-4 ${mem.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleDelete(mem.id)}
                  className="p-1 rounded-lg text-rose-300/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxImages && (
        <div className="fixed sm:absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxImages(null)}
            className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 z-10 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxImages.length > 1 && (
            <>
              <button
                onClick={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxImages.length - 1))}
                className="absolute left-[max(1rem,env(safe-area-inset-left,0px))] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-10 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setLightboxIndex((prev) => (prev < lightboxImages.length - 1 ? prev + 1 : 0))}
                className="absolute right-[max(1rem,env(safe-area-inset-right,0px))] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 z-10 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={lightboxImages[lightboxIndex]}
            alt="Fullscreen memory preview"
            className="max-h-[85dvh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

export const MemoriesPage = memo(MemoriesPageComponent);
export default MemoriesPage;
