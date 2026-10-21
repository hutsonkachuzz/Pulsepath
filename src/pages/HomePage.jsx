import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RomanticGreeting } from '../components/home/RomanticGreeting';
import { InstagramStoriesSection } from '../components/home/InstagramStoriesSection';
import { StoryViewerModal } from '../components/home/StoryViewerModal';
import { CreateSharedPostModal } from '../components/home/CreateSharedPostModal';
import { CreateStoryModal } from '../components/home/CreateStoryModal';
import { SharedPostCard } from '../components/home/SharedPostCard';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { subscribeToMemories, subscribeToStories, updateMemory } from '../services/firebaseService';
import { ensureImageDataUrl } from '../utils/imageUtils';
import { Plus, Sparkles, Heart } from 'lucide-react';

/**
 * Mobile-First Spring Animation Variants for Smooth 60fps Mobile Performance
 */
const dashboardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02
    }
  }
};

const widgetPopVariant = {
  hidden: {
    opacity: 0,
    y: 14
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 26,
      mass: 0.8
    }
  }
};

/**
 * Curated Instagram Stories for Eren & Mikasa
 */
const INITIAL_STORIES_DATA = {
  our_stories: {
    id: 'our_stories',
    title: 'Our Stories',
    subtext: 'Your Story with Eren & Us',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=300&q=80',
    slides: [
      {
        id: 's_our_1',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
        title: 'Sunset at the Cliffs 🌅',
        caption: 'Watching the Pacific sky catch fire in shades of crimson and violet. Right then, I knew you were my whole universe.',
        location: 'Sunset Cliffs, San Diego',
        tag: 'Golden Hour',
        timeAgo: '2h ago'
      },
      {
        id: 's_our_2',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
        title: 'Our Secret Trattoria ☕',
        caption: 'Warm espresso, rain outside the glass, and you laughing softly across the table.',
        location: 'Florence, Italy',
        tag: 'Cozy Moments',
        timeAgo: '5h ago'
      },
      {
        id: 's_our_3',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80',
        title: 'Under the Midnight Stars ✨',
        caption: 'No words needed. Just two souls walking beneath an infinite canopy of stars.',
        location: 'Big Sur, CA',
        tag: 'Forever Us',
        timeAgo: '1d ago'
      }
    ]
  },
  eren_updates: {
    id: 'eren_updates',
    title: "Eren's Updates",
    subtext: 'Your Story with Eren',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    slides: [
      {
        id: 's_eren_1',
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80',
        title: 'Just finished afternoon work 🌿',
        caption: 'My thoughts immediately wandered back to you. Counting down the minutes until our evening walk ❤️',
        location: 'Downtown San Francisco',
        tag: 'Thinking of You',
        timeAgo: '25m ago'
      },
      {
        id: 's_eren_2',
        image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1000&q=80',
        title: 'Cherry blossoms along our trail 🌸',
        caption: 'Saw these blooming today and wished you were right here with me, hand in hand.',
        location: 'Park Promenade',
        tag: 'Daily Bloom',
        timeAgo: '3h ago'
      },
      {
        id: 's_eren_3',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
        title: 'Reserved our table for Friday 🕯️',
        caption: 'The candlelit corner table you love so much. Can’t wait for our date night, Mikasa!',
        location: "L'Amore Trattoria",
        tag: 'Date Night',
        timeAgo: '6h ago'
      }
    ]
  }
};

/**
 * Initial Curated Feed Posts for Eren & Mikasa
 */
const DEFAULT_FEED_POSTS = [
  {
    id: 'feed_post_1',
    authorName: 'Eren',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    title: 'Our Sunset Picnic at Sunset Cliffs',
    description: 'We sat on the blanket watching the Pacific sky catch fire in shades of crimson and violet. You laughed at the seagull trying to steal our pastries, and right then I knew I was looking at my entire future.',
    location: 'Sunset Cliffs, San Diego',
    mood: 'Romantic 🥰',
    tags: ['Sunset', 'Beach', 'Picnic', 'GoldenHour'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'],
    likesCount: 2,
    isLiked: true,
    timeAgo: '2 hours ago',
    comments: [
      { id: 'c1', author: 'Mikasa', text: 'You looked so happy here... I will never forget that afternoon ❤️', timeAgo: '1h ago' },
      { id: 'c2', author: 'Eren', text: 'Because you were beside me ✨', timeAgo: '45m ago' }
    ]
  },
  {
    id: 'feed_post_2',
    authorName: 'Mikasa',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    title: 'The Rainy Night in Florence',
    description: 'Caught under a tiny trattoria canopy during a sudden summer downpour. The scent of rain, warm espresso, and your jacket wrapped around my shoulders.',
    location: 'Florence, Italy',
    mood: 'Loved ❤️',
    tags: ['Italy', 'Rain', 'Coffee', 'Travel'],
    images: ['https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1000&q=80'],
    likesCount: 4,
    isLiked: true,
    timeAgo: 'Yesterday',
    comments: [
      { id: 'c3', author: 'Eren', text: 'You were shivering so cute in my oversized coat 🥰', timeAgo: 'Yesterday' }
    ]
  },
  {
    id: 'feed_post_3',
    authorName: 'Eren',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    title: 'Stargazing at Joshua Tree',
    description: 'Away from all the noise. Looking up at a million galaxies, feeling so small yet having everything in the universe right next to me.',
    location: 'Joshua Tree National Park',
    mood: 'Blessed ✨',
    tags: ['Stargazing', 'Desert', 'Us', 'Cosmic'],
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80'],
    likesCount: 3,
    isLiked: false,
    timeAgo: '3 days ago',
    comments: [
      { id: 'c4', author: 'Mikasa', text: 'Take me back there soon please 🌌', timeAgo: '2d ago' }
    ]
  }
];

export function HomePage() {
  const { couple } = useCouple();
  const { currentUser } = useAuth();

  // Firestore memories and custom locally-added posts
  const [dbMemories, setDbMemories] = useState([]);
  const [customPosts, setCustomPosts] = useState([]);

  // Stories data state (seeded with initial, synced with live Firestore)
  const [storiesData, setStoriesData] = useState(INITIAL_STORIES_DATA);

  // Dynamically resolve Eren's story avatar from currentUser so custom uploaded DP always takes precedence
  const effectiveStoriesData = useMemo(() => {
    const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';
    const copy = { ...storiesData };
    if (copy.eren_updates) {
      const resolvedAvatar = (isEren && currentUser?.avatar)
        ? currentUser.avatar
        : (copy.eren_updates.avatar || currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80');
      copy.eren_updates = {
        ...copy.eren_updates,
        avatar: resolvedAvatar
      };
    }
    return copy;
  }, [storiesData, currentUser]);

  // Story Viewer Modal State
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [activeStoryType, setActiveStoryType] = useState('our_stories');

  // Create Story Modal State
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [targetStoryType, setTargetStoryType] = useState('our_stories');

  // Create Shared Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const coupleId = couple?.id || 'demo_couple_123';
    const unsubMem = subscribeToMemories(coupleId, (list) => {
      if (Array.isArray(list)) {
        setDbMemories(list);
      }
    });
    const unsubStories = subscribeToStories(coupleId, (fsStories) => {
      if (fsStories && Object.keys(fsStories).length > 0) {
        setStoriesData((prev) => ({ ...prev, ...fsStories }));
      }
    });
    return () => {
      unsubMem && unsubMem();
      unsubStories && unsubStories();
    };
  }, [couple?.id]);

  // Merge database memories with curated demo feed (ensures newly created posts stay at top)
  const allFeedPosts = useMemo(() => {
    const combined = [...customPosts];
    const isCurrentUserEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentUser?.id === 'user_eren_101';

    // Add Firestore memories formatted as feed items with binary-decoded images
    if (dbMemories.length > 0) {
      dbMemories.forEach((mem) => {
        if (!combined.some((p) => p.id === mem.id)) {
          const rawImages = mem.images && mem.images.length > 0
            ? mem.images
            : [mem.image || mem.momentPhoto || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80'];
          const decodedImages = rawImages.map(ensureImageDataUrl);

          const isAuthorEren = (mem.authorName || '').toLowerCase().includes('eren');
          const defaultAvatar = isAuthorEren
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

          const authorAvatar = (isAuthorEren && isCurrentUserEren && currentUser?.avatar)
            ? currentUser.avatar
            : (mem.authorAvatar || (isAuthorEren ? (currentUser?.avatar || defaultAvatar) : defaultAvatar));

          combined.push({
            id: mem.id,
            authorName: mem.authorName || 'Eren',
            authorAvatar: ensureImageDataUrl(authorAvatar),
            title: mem.postTitle || mem.title,
            postTitle: mem.postTitle || mem.title,
            description: mem.loveNote || mem.description,
            loveNote: mem.loveNote || mem.description,
            location: mem.location || 'Our Space',
            mood: (mem.moodTag || mem.mood) ? `${mem.moodTag || mem.mood}` : 'Loved ❤️',
            tags: mem.tags || ['Memories', 'Us'],
            images: decodedImages,
            image: decodedImages[0],
            momentPhoto: decodedImages[0],
            likesCount: mem.likesCount !== undefined ? mem.likesCount : (mem.isLiked ? 1 : 0),
            isLiked: mem.isLiked !== undefined ? mem.isLiked : false,
            timeAgo: mem.date || 'Recently',
            comments: Array.isArray(mem.comments) ? mem.comments : []
          });
        }
      });
    }

    // Append default curated posts if not already present
    DEFAULT_FEED_POSTS.forEach((seed) => {
      if (!combined.some((p) => p.id === seed.id || p.title === seed.title)) {
        const isAuthorEren = (seed.authorName || '').toLowerCase().includes('eren');
        const authorAvatar = (isAuthorEren && isCurrentUserEren && currentUser?.avatar)
          ? currentUser.avatar
          : seed.authorAvatar;

        combined.push({
          ...seed,
          authorAvatar: ensureImageDataUrl(authorAvatar)
        });
      }
    });

    return combined;
  }, [customPosts, dbMemories, currentUser]);

  const handleOpenStory = (storyKey) => {
    setActiveStoryType(storyKey);
    setIsStoryModalOpen(true);
  };

  const handleAddStory = (storyKey) => {
    setTargetStoryType(storyKey || 'our_stories');
    setIsCreateStoryModalOpen(true);
  };

  const handlePostCreated = (newPost) => {
    setCustomPosts((prev) => [newPost, ...prev]);
  };

  const handleLikeToggle = async (postId, isLiked) => {
    const coupleId = couple?.id || 'demo_couple_123';
    try {
      await updateMemory(coupleId, postId, {
        isLiked,
        likesCount: isLiked ? 2 : 1
      });
    } catch (e) {
      console.warn('Like toggle sync error:', e);
    }
  };

  return (
    <motion.div
      variants={dashboardContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-5 w-full pb-[calc(90px+env(safe-area-inset-bottom,20px))] relative"
    >
      {/* 1. Dynamic Romantic Greeting (Top bar, greeting, and Send Warmth untouched) */}
      <motion.div variants={widgetPopVariant}>
        <RomanticGreeting />
      </motion.div>

      {/* 2. Instagram-Style Stories Section for Two (Eren & Mikasa) */}
      <motion.div variants={widgetPopVariant}>
        <InstagramStoriesSection
          onOpenStory={handleOpenStory}
          onAddStory={handleAddStory}
          storyData={effectiveStoriesData}
        />
      </motion.div>

      {/* 3. "+ Create a New Shared Post" Button */}
      <motion.div variants={widgetPopVariant} className="px-0.5">
        <motion.button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full min-h-[46px] py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/25 to-purple-500/20 hover:from-rose-500/30 hover:via-pink-500/35 hover:to-purple-500/30 border border-rose-400/40 hover:border-rose-400/60 shadow-[0_4px_24px_rgba(255,42,122,0.25)] hover:shadow-[0_4px_30px_rgba(255,42,122,0.4)] backdrop-blur-xl flex items-center justify-center gap-2 text-white font-bold text-xs sm:text-sm tracking-wide cursor-pointer transition-all duration-300 group"
        >
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shadow-sm group-hover:rotate-90 transition-transform">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-pink-200">
            + Create a New Shared Post
          </span>
          <Sparkles className="w-3.5 h-3.5 text-rose-300 opacity-80 group-hover:scale-125 transition-transform" />
        </motion.button>
      </motion.div>

      {/* 4. Shared Moments / Card Feed View */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300/90">
              Shared Feed
            </span>
          </div>
          <span className="text-[10px] text-rose-300/60 font-medium">
            {allFeedPosts.length} Moments
          </span>
        </div>

        {allFeedPosts.map((post) => (
          <motion.div key={post.id} variants={widgetPopVariant}>
            <SharedPostCard post={post} onLikeToggle={handleLikeToggle} />
          </motion.div>
        ))}
      </div>

      {/* Interactive Story Viewer Modal */}
      <StoryViewerModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        initialStory={activeStoryType}
        storyData={effectiveStoriesData}
      />

      {/* "+ Add to Story" Modal (Direct Firebase Free Tier Binary Upload) */}
      <CreateStoryModal
        isOpen={isCreateStoryModalOpen}
        onClose={() => setIsCreateStoryModalOpen(false)}
        initialStoryType={targetStoryType}
        storyData={effectiveStoriesData}
        onStoryUpdated={(storyType, updatedDoc) => {
          setStoriesData((prev) => ({
            ...prev,
            [storyType]: updatedDoc
          }));
        }}
      />

      {/* "+ Create a New Shared Post" Modal (Direct Firebase Free Tier Binary Upload) */}
      <CreateSharedPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </motion.div>
  );
}

export default HomePage;
