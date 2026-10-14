// High-fidelity seed data for PulsePath (Eren ❤️ Mikasa)

const erenUser = {
  id: 'user_eren_101',
  uid: 'user_eren_101',
  email: 'eren@pulsepath.love',
  name: 'Eren',
  nickname: 'Eren ❤️',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  coupleId: 'demo_couple_123',
  couple_id: 'demo_couple_123',
  role: 'userOne'
};

const mikasaUser = {
  id: 'user_mikasa_202',
  uid: 'user_mikasa_202',
  email: 'mikasa@pulsepath.love',
  name: 'Mikasa',
  nickname: 'Mikasa 🌸',
  avatar: '/assets/mikasa_avatar.jpg',
  coupleId: 'demo_couple_123',
  couple_id: 'demo_couple_123',
  role: 'userTwo'
};

export const DEMO_USERS = {
  eren: erenUser,
  mikasa: mikasaUser,
  leo: erenUser,
  mia: mikasaUser
};

// Calculate relationship start date ~427 days ago from today
const startDate = new Date();
startDate.setDate(startDate.getDate() - 427);

export const DEMO_COUPLE = {
  id: 'demo_couple_123',
  coupleCode: 'PULSE-7K29',
  userOneId: 'user_eren_101',
  user_one_id: 'user_eren_101',
  userTwoId: 'user_mikasa_202',
  user_two_id: 'user_mikasa_202',
  userOneName: 'Eren',
  user_one_name: 'Eren',
  userTwoName: 'Mikasa',
  user_two_name: 'Mikasa',
  nickname: "Eren & Mikasa's Universe",
  description: 'Two souls, one heartbeat, forever adventuring together.',
  relationshipStartDate: startDate.toISOString(),
  relationship_start_date: startDate.toISOString(),
  createdAt: startDate.toISOString()
};

export const DEMO_MEMORIES = [
  {
    id: 'mem_1',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_eren',
    authorName: 'Eren',
    title: 'Our Evening Walk Under the Stars 🌙',
    description: 'We walked through the silent park holding hands for hours. The autumn breeze was cool, but your hand was so warm. We talked about our childhood dreams and laughed until our cheeks hurt.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    mood: 'Loved',
    moodEmoji: '❤️',
    location: 'Riverside Promenade',
    tags: ['Night Walk', 'Stargazing', 'Deep Talks'],
    images: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80'
    ],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'mem_2',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_mikasa',
    authorName: 'Mikasa',
    title: 'The Little Corner Café Where We Met ☕',
    description: 'Returning to table 4 where we shared our first nervous conversation over cinnamon lattes. It feels like yesterday, yet I cannot imagine life before you.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
    mood: 'Nostalgic',
    moodEmoji: '✨',
    location: 'Café de L’Amour',
    tags: ['First Date', 'Coffee', 'Anniversary'],
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80'
    ],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString()
  },
  {
    id: 'mem_3',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_eren',
    authorName: 'Eren',
    title: 'Sunset at the Coast 🌅',
    description: 'Golden hour lights reflected in your eyes. We stayed until the twilight turned indigo and the lighthouses started blinking.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString().split('T')[0],
    mood: 'Peaceful',
    moodEmoji: '🌙',
    location: 'Emerald Cove',
    tags: ['Ocean', 'Sunset', 'Getaway'],
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80'
    ],
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 432).toISOString()
  },
  {
    id: 'mem_4',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_mikasa',
    authorName: 'Mikasa',
    title: 'Rainy Sunday Baking Disaster 🍪',
    description: 'Flour in our hair, chocolate on our noses, and half-burnt cookies that tasted delicious solely because we baked them together with love and ridiculous music in the background.',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    mood: 'Happy',
    moodEmoji: '😊',
    location: 'Our Cozy Kitchen',
    tags: ['Home', 'Baking', 'Laughs'],
    images: [
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80'
    ],
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 720).toISOString()
  }
];

// Exact Chronological Canonical Messages (image_9.png layout specification):
// 1. Top voice note (0:14 duration, 10:06 AM)
// 2. Two heart image bubbles (10:07 AM)
// 3. Long text message ("Hey, I sent those photos...") (Yesterday 7:05 PM)
// 4. Second voice note (0:46 duration, Yesterday 8:18 PM / 18:18)
const twoDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 48);
const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);

export const DEMO_MESSAGES = [
  {
    id: 'canon_msg_1_voice_014',
    coupleId: 'demo_couple_123',
    couple_id: 'demo_couple_123',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: '[VOICE]:0:14',
    displayTime: '10:06 AM',
    createdAt: new Date(twoDaysAgo.setHours(10, 6, 0, 0)).toISOString(),
    created_at: new Date(twoDaysAgo.setHours(10, 6, 0, 0)).toISOString(),
    reactions: {},
    isSavedAsMemory: false,
    seenAt: new Date(twoDaysAgo.setHours(10, 6, 22, 0)).toISOString()
  },
  {
    id: 'canon_msg_2_hearts',
    coupleId: 'demo_couple_123',
    couple_id: 'demo_couple_123',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: '[DUAL_HEARTS]:/assets/heart_ruby_crystal.jpg|/assets/heart_rose_pair.jpg',
    displayTime: '10:07 AM',
    createdAt: new Date(twoDaysAgo.setHours(10, 7, 0, 0)).toISOString(),
    created_at: new Date(twoDaysAgo.setHours(10, 7, 0, 0)).toISOString(),
    reactions: { '❤️': ['user_mikasa_202'] },
    isSavedAsMemory: false,
    seenAt: new Date(twoDaysAgo.setHours(10, 7, 30, 0)).toISOString()
  },
  {
    id: 'canon_msg_3_walk_photos',
    coupleId: 'demo_couple_123',
    couple_id: 'demo_couple_123',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Hey, I sent those photos from our walk yesterday! Let me know which ones you want to add to our shared album ❤️',
    displayTime: '7:05 PM',
    createdAt: new Date(yesterday.setHours(19, 5, 0, 0)).toISOString(),
    created_at: new Date(yesterday.setHours(19, 5, 0, 0)).toISOString(),
    reactions: {},
    isSavedAsMemory: false,
    seenAt: new Date(yesterday.setHours(19, 8, 0, 0)).toISOString()
  },
  {
    id: 'canon_msg_4_voice_046',
    coupleId: 'demo_couple_123',
    couple_id: 'demo_couple_123',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: '[VOICE]:0:46',
    displayTime: '8:18 PM',
    createdAt: new Date(yesterday.setHours(20, 18, 0, 0)).toISOString(),
    created_at: new Date(yesterday.setHours(20, 18, 0, 0)).toISOString(),
    reactions: { '❤️': ['user_eren_101'] },
    isSavedAsMemory: false,
    seenAt: new Date(yesterday.setHours(20, 19, 0, 0)).toISOString()
  }
];

export const DEMO_LOVE_THOUGHTS = [
  {
    id: 'thought_1',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_eren',
    authorName: 'Eren',
    content: 'I don’t always know how to explain what you mean to me, but somehow every ordinary day becomes special when you’re part of it.',
    visibility: 'shared',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'thought_2',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_mikasa',
    authorName: 'Mikasa',
    content: 'Thinking about how your laugh fills up the entire room whenever you find something genuinely hilarious. It is quietly my favorite melody.',
    visibility: 'shared',
    isFavorite: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'thought_3',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_eren',
    authorName: 'Eren',
    content: 'Secretly planning our anniversary weekend trip to the cabin by the lake. Can’t wait to see the expression on her face!',
    visibility: 'private',
    isFavorite: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

export const DEMO_LOVE_LETTERS = [
  {
    id: 'letter_1',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_eren',
    authorName: 'Eren',
    title: 'To The One Who Holds My Whole Heart',
    content: `My dearest Mikasa,\n\nSometimes I find myself watching you while you are reading or working on your sketches, completely absorbed in your thoughts. In those quiet moments, I am struck by how lucky I am that out of billions of people on this planet, our paths crossed and intertwined.\n\nYou bring a gentle warmth to everything you touch. You make tough days bearable and joyful days unforgettable. Thank you for choosing me every day, for your patience, and for loving me just as I am.\n\nHere’s to every tomorrow we will build hand in hand.\n\nForever yours,\nEren ❤️`,
    visibility: 'shared',
    isFavorite: true,
    openedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: 'letter_2',
    coupleId: 'demo_couple_123',
    createdBy: 'demo_user_mikasa',
    authorName: 'Mikasa',
    title: 'A Little Note For A Rainy Morning',
    content: `Eren,\n\nIf love had a sound, it would be the rain tapping against our window while you brew morning coffee. If love had a feeling, it would be the way you instinctively reach for my hand whenever we cross the street.\n\nYou are my courage on days when I feel unsure, and my home wherever we go. I love you deeper than words can hold.\n\nLove,\nMikasa`,
    visibility: 'shared',
    isFavorite: false,
    openedAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

// Special dates with an anniversary in 12 days
const anniversaryDate = new Date();
anniversaryDate.setDate(anniversaryDate.getDate() + 12);
anniversaryDate.setHours(19, 0, 0, 0);

const mikasaBirthday = new Date();
mikasaBirthday.setDate(mikasaBirthday.getDate() + 38);

export const DEMO_SPECIAL_DATES = [
  {
    id: 'date_1',
    coupleId: 'demo_couple_123',
    title: 'Our Next Anniversary ❤️',
    category: 'anniversary',
    date: anniversaryDate.toISOString(),
    description: 'Celebrating another magical year together with a candlelit dinner and rooftop stargazing.',
    reminderEnabled: true
  },
  {
    id: 'date_2',
    coupleId: 'demo_couple_123',
    title: 'Mikasa’s Birthday 🎂',
    category: 'birthday',
    date: mikasaBirthday.toISOString(),
    description: 'Special breakfast in bed, gifts, and celebration with friends.',
    reminderEnabled: true
  },
  {
    id: 'date_3',
    coupleId: 'demo_couple_123',
    title: 'First Date Anniversary ☕',
    category: 'first_date',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString(),
    description: 'The rainy afternoon at Café de L’Amour.',
    reminderEnabled: true
  }
];

export const DEMO_REMINDERS = {
  morning: {
    enabled: true,
    time: '08:00',
    message: 'Good morning ❤️ It’s time to wake up. Your favorite person is waiting for another beautiful day with you.'
  },
  bedtime: {
    enabled: true,
    time: '23:15',
    message: 'Good night ❤️ Close your eyes and rest. Tomorrow we create another memory together.'
  }
};

export const DEMO_DAILY_QUESTION = {
  question: 'What was your favorite little moment we shared this week?',
  date: new Date().toISOString().split('T')[0],
  answers: {
    demo_user_eren: {
      authorName: 'Eren',
      text: 'When we were listening to that vintage acoustic playlist while cooking dinner, and you spun around using the wooden spatula as a microphone.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
    },
    demo_user_mikasa: {
      authorName: 'Mikasa',
      text: 'Sitting together on the terrace yesterday evening wrapped up in the big knitted blanket, sipping chamomile tea in comfortable silence.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    }
  }
};

export const DEMO_MOODS = {
  demo_user_eren: {
    mood: 'Loved',
    emoji: '❤️',
    note: 'Feeling so grateful today',
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  demo_user_mikasa: {
    mood: 'Happy',
    emoji: '🥰',
    note: 'Ready for our evening together!',
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  }
};

export const DAILY_LOVE_MESSAGES = [
  "Good morning ❤️ Another day, another memory waiting to be created together.",
  "Some days become memories. Some people become home.",
  "Wake up, sleepy heart. Someone loves you more than words can say. ❤️",
  "In a world of noise, your voice will always be my peace.",
  "Every ordinary moment turns extraordinary when shared with you.",
  "You are the best decision my heart has ever made.",
  "Two hearts. One journey. A lifetime of quiet magic."
];
