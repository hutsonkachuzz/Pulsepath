import React, { useEffect, useState, useMemo, memo } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { RomanticButton } from '../components/common/RomanticButton';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { useCouple } from '../context/CoupleContext';
import { subscribeToMemories } from '../services/firebaseService';
import { formatRomanticDate } from '../utils/dateUtils';
import { Image, Heart, Star, ChevronLeft, ChevronRight, X, Calendar } from 'lucide-react';

function GalleryPageComponent() {
  const { couple } = useCouple();
  const [memories, setMemories] = useState([]);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [lightboxData, setLightboxData] = useState(null); // { images, index, title, date }

  useEffect(() => {
    if (!couple?.id) return;
    const unsub = subscribeToMemories(couple.id, (list) => setMemories(list));
    return () => unsub && unsub();
  }, [couple?.id]);

  // Extract all photos with parent memory context (Memoized)
  const { photoItems, allTags } = useMemo(() => {
    const items = [];
    const tags = new Set(['ALL']);

    memories.forEach((mem) => {
      if (mem.tags) mem.tags.forEach((t) => tags.add(t));
      if (mem.images && mem.images.length > 0) {
        mem.images.forEach((imgUrl, imgIdx) => {
          items.push({
            url: imgUrl,
            title: mem.title,
            description: mem.description,
            date: mem.date,
            tags: mem.tags || [],
            isFavorite: mem.isFavorite,
            memoryId: mem.id,
            allImages: mem.images,
            index: imgIdx
          });
        });
      }
    });

    return { photoItems: items, allTags: tags };
  }, [memories]);

  const filteredPhotos = useMemo(() => {
    if (selectedTag === 'ALL') return photoItems;
    return photoItems.filter((p) => p.tags.includes(selectedTag));
  }, [photoItems, selectedTag]);

  const openLightbox = (photo) => {
    setLightboxData({
      images: photo.allImages,
      index: photo.index,
      title: photo.title,
      date: photo.date
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Our Gallery"
        description="Every frozen heartbeat, quiet sunset, and spontaneous smile in our private visual vault."
        icon={Image}
        badge={`${photoItems.length} moments`}
      />

      {/* Tags Filter */}
      {allTags.size > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Array.from(allTags).map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-glow-sm'
                  : 'bg-white/5 hover:bg-white/10 text-rose-200/80 border border-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <EmptyState
          emoji="📸"
          title="No photos in our gallery yet"
          description="Capture your first memory and upload your favorite snapshot! Click the + button at any time to add."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo, i) => (
            <div
              key={`${photo.memoryId}_${photo.index}_${i}`}
              onClick={() => openLightbox(photo)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-lg will-change-[transform,opacity]"
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 will-change-transform"
              />

              {/* Gradient hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-left">
                <h4 className="text-xs font-semibold text-white tracking-tight line-clamp-1">
                  {photo.title}
                </h4>
                <span className="text-[10px] text-rose-200/70 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-2.5 h-2.5" />
                  {formatRomanticDate(photo.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxData && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxData(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxData.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setLightboxData((prev) => ({
                    ...prev,
                    index: (prev.index - 1 + prev.images.length) % prev.images.length
                  }))
                }
                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() =>
                  setLightboxData((prev) => ({
                    ...prev,
                    index: (prev.index + 1) % prev.images.length
                  }))
                }
                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center">
            <img
              src={lightboxData.images[lightboxData.index]}
              alt={lightboxData.title}
              decoding="async"
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-base font-semibold text-white tracking-tight">
                {lightboxData.title}
              </h3>
              <p className="text-xs text-rose-300/70 mt-1">
                {formatRomanticDate(lightboxData.date)} • ({lightboxData.index + 1} of{' '}
                {lightboxData.images.length})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const GalleryPage = memo(GalleryPageComponent);
export default GalleryPage;
