import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Modal } from '../components/common/Modal';
import { RomanticButton } from '../components/common/RomanticButton';
import { VoiceNoteBubble } from '../components/chat/VoiceNoteBubble';
import { ChatCallingModal } from '../components/chat/ChatCallingModal';
import { ChatThemeModal } from '../components/chat/ChatThemeModal';
import { ContactInfoModal } from '../components/chat/ContactInfoModal';
import { getChatTheme, DEFAULT_CHAT_THEME } from '../config/chatThemes';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import { useStreak } from '../context/StreakContext';
import { StreakBadge } from '../components/snaps/StreakBadge';
import { SnapMessageBubble } from '../components/snaps/SnapMessageBubble';
import { PulseSnapViewerModal } from '../components/snaps/PulseSnapViewerModal';
import {
  subscribeToMessages,
  sendMessage,
  toggleMessageReaction,
  markMessagesAsSeen,
  saveMessageAsMemory,
  saveUserChatTheme,
  getUserChatTheme
} from '../services/firebaseService';
import { wsService } from '../services/websocket';
import { api, getAssetUrl } from '../services/api';
import { formatMessageTime, formatMessageDateDivider, getMessageTimestamp } from '../utils/dateUtils';
import { PulsePathLogo } from '../components/common/PulsePathLogo';
import {
  Send,
  Heart,
  Sparkles,
  Reply,
  CheckCheck,
  Search,
  Smile,
  X,
  Star,
  Camera,
  Paperclip,
  Mic,
  Phone,
  Video,
  Monitor,
  Languages,
  ShieldCheck,
  MoreVertical,
  Palette,
  Maximize2,
  ChevronLeft,
  Copy,
  Plus,
  Image as ImageIcon,
  User,
  Info,
  Bell,
  BellOff,
  Trash2,
  Ban,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';

const QUICK_REACTIONS = ['❤️', '🥰', '😂', '😮', '😢', '🔥', '💋'];

const EMOJI_CATEGORIES = {
  'Romantic': ['❤️', '💖', '🥰', '😘', '💋', '🌹', '✨', '💍', '💌', '🥺'],
  'Joy & Fun': ['😂', '😍', '🥳', '🤗', '🔥', '🎉', '🥂', '💃', '🕺', '💫'],
  'Sweet Notes': ['🍫', '🍓', '🍰', '☕', '🧸', '🌙', '⭐', '🕊️', '🎶', '🌈']
};

// Canonical Messages matching the exact mobile application specification across 4 dates:
// "Oct 1", "Oct 2", "Oct 4", and "Yesterday"
const CANONICAL_MESSAGES = [
  // --- OCT 1 ---
  {
    id: 'canon_oct1_1',
    dateBadge: 'Oct 1',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Hey! Just finished training. 🗡️ The sunset on my way back was breathtaking today.',
    displayTime: '12:10 PM',
    createdAt: '2024-10-01T12:10:00.000Z',
    created_at: '2024-10-01T12:10:00.000Z',
    reactions: {},
    seenAt: '2024-10-01T12:11:00.000Z'
  },
  {
    id: 'canon_oct1_2',
    dateBadge: 'Oct 1',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'You must be exhausted! Did you grab something warm to drink yet?',
    displayTime: '12:12 PM',
    createdAt: '2024-10-01T12:12:00.000Z',
    created_at: '2024-10-01T12:12:00.000Z',
    reactions: {},
    seenAt: '2024-10-01T12:13:00.000Z'
  },
  {
    id: 'canon_oct1_3',
    dateBadge: 'Oct 1',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Getting warm matcha now. Thinking about our coffee date this weekend... can’t wait. ☕🌸',
    displayTime: '12:15 PM',
    createdAt: '2024-10-01T12:15:00.000Z',
    created_at: '2024-10-01T12:15:00.000Z',
    reactions: {},
    seenAt: '2024-10-01T12:16:00.000Z'
  },
  {
    id: 'canon_oct1_4',
    dateBadge: 'Oct 1',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Counting down the hours. I reserved our favorite corner table by the window ❤️',
    displayTime: '12:18 PM',
    createdAt: '2024-10-01T12:18:00.000Z',
    created_at: '2024-10-01T12:18:00.000Z',
    reactions: { '❤️': ['user_mikasa_202'] },
    seenAt: '2024-10-01T12:19:00.000Z'
  },

  // --- OCT 2 ---
  {
    id: 'canon_oct2_1',
    dateBadge: 'Oct 2',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Good morning! ☀️ Listen to this playlist I put together for you last night 🎶',
    displayTime: '9:05 AM',
    createdAt: '2024-10-02T09:05:00.000Z',
    created_at: '2024-10-02T09:05:00.000Z',
    reactions: {},
    seenAt: '2024-10-02T09:06:00.000Z'
  },
  {
    id: 'canon_oct2_2',
    dateBadge: 'Oct 2',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Listening right now on my commute. Track 3 is so peaceful... feels just like being with you.',
    displayTime: '9:14 AM',
    createdAt: '2024-10-02T09:14:00.000Z',
    created_at: '2024-10-02T09:14:00.000Z',
    reactions: {},
    seenAt: '2024-10-02T09:15:00.000Z'
  },
  {
    id: 'canon_oct2_3',
    dateBadge: 'Oct 2',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'I knew you’d love that one. Don’t forget to take lunch on time today, okay? Promise me.',
    displayTime: '9:20 AM',
    createdAt: '2024-10-02T09:20:00.000Z',
    created_at: '2024-10-02T09:20:00.000Z',
    reactions: {},
    seenAt: '2024-10-02T09:21:00.000Z'
  },
  {
    id: 'canon_oct2_4',
    dateBadge: 'Oct 2',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'I promise! Sending you an extra big hug to keep you warm today ✨',
    displayTime: '9:22 AM',
    createdAt: '2024-10-02T09:22:00.000Z',
    created_at: '2024-10-02T09:22:00.000Z',
    reactions: { '🥰': ['user_mikasa_202'] },
    seenAt: '2024-10-02T09:23:00.000Z'
  },

  // --- OCT 4 ---
  {
    id: 'canon_oct4_1',
    dateBadge: 'Oct 4',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Look what I found tucked into my book! The little polaroid note you wrote me 📸🥺',
    displayTime: '2:30 PM',
    createdAt: '2024-10-04T14:30:00.000Z',
    created_at: '2024-10-04T14:30:00.000Z',
    reactions: {},
    seenAt: '2024-10-04T14:31:00.000Z'
  },
  {
    id: 'canon_oct4_2',
    dateBadge: 'Oct 4',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Haha you finally discovered it! I hid it between chapter four days ago 😊',
    displayTime: '2:34 PM',
    createdAt: '2024-10-04T14:34:00.000Z',
    created_at: '2024-10-04T14:34:00.000Z',
    reactions: {},
    seenAt: '2024-10-04T14:35:00.000Z'
  },
  {
    id: 'canon_oct4_3',
    dateBadge: 'Oct 4',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'It made my whole day. I keep it in my pocket close to my heart everywhere I go.',
    displayTime: '2:38 PM',
    createdAt: '2024-10-04T14:38:00.000Z',
    created_at: '2024-10-04T14:38:00.000Z',
    reactions: {},
    seenAt: '2024-10-04T14:39:00.000Z'
  },
  {
    id: 'canon_oct4_4',
    dateBadge: 'Oct 4',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Always with you, no matter the distance 🌌💜',
    displayTime: '2:41 PM',
    createdAt: '2024-10-04T14:41:00.000Z',
    created_at: '2024-10-04T14:41:00.000Z',
    reactions: { '❤️': ['user_mikasa_202'] },
    seenAt: '2024-10-04T14:42:00.000Z'
  },

  // --- YESTERDAY ---
  {
    id: 'canon_yesterday_1',
    dateBadge: 'Yesterday',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Are you free for dinner tonight? I made that special soup you love 🍲',
    displayTime: '6:45 PM',
    createdAt: '2024-10-07T18:45:00.000Z',
    created_at: '2024-10-07T18:45:00.000Z',
    reactions: {},
    seenAt: '2024-10-07T18:46:00.000Z'
  },
  {
    id: 'canon_yesterday_2',
    dateBadge: 'Yesterday',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Just wrapping up! Heading over right now, bringing warm desserts for us 🍰',
    displayTime: '6:52 PM',
    createdAt: '2024-10-07T18:52:00.000Z',
    created_at: '2024-10-07T18:52:00.000Z',
    reactions: {},
    seenAt: '2024-10-07T18:53:00.000Z'
  },
  {
    id: 'canon_yesterday_3',
    dateBadge: 'Yesterday',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    content: 'Hurry home safely, I’ll have candles lit and warm tea ready for you 🕯️❤️',
    displayTime: '6:58 PM',
    createdAt: '2024-10-07T18:58:00.000Z',
    created_at: '2024-10-07T18:58:00.000Z',
    reactions: {},
    seenAt: '2024-10-07T18:59:00.000Z'
  },
  {
    id: 'canon_yesterday_4',
    dateBadge: 'Yesterday',
    senderId: 'user_eren_101',
    sender_id: 'user_eren_101',
    senderName: 'Eren',
    sender_name: 'Eren',
    content: 'Walking up the stairs now! Can see the cozy light from your window ✨',
    displayTime: '7:05 PM',
    createdAt: '2024-10-07T19:05:00.000Z',
    created_at: '2024-10-07T19:05:00.000Z',
    reactions: { '❤️': ['user_mikasa_202'] },
    seenAt: '2024-10-07T19:06:00.000Z'
  },
  {
    id: 'canon_snap_mikasa_today',
    dateBadge: 'Today',
    senderId: 'user_mikasa_202',
    sender_id: 'user_mikasa_202',
    senderName: 'Mikasa',
    sender_name: 'Mikasa',
    type: 'pulse_snap',
    content: '[SNAP]: Evening warm tea for us 🕯️',
    snapData: {
      id: 'snap_demo_1',
      senderName: 'Mikasa',
      mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
      caption: 'Evening warmth waiting for you ☕🕯️',
      filterCss: 'sepia(0.25) saturate(1.4) contrast(1.05)',
      showStreakStamp: true,
      streakDay: 12,
      streakEmoji: '🔥',
      timerMode: '10s',
      timerDuration: 10,
      unopened: true,
      createdAt: '2024-10-08T18:00:00.000Z'
    },
    displayTime: '10:06 AM',
    createdAt: '2024-10-08T10:06:00.000Z',
    reactions: {}
  }
];

export function ChatPage() {
  const navigate = useNavigate();
  const { currentUser, isDemo } = useAuth();
  const {
    couple,
    partnerId,
    partnerName,
    partnerAvatar,
    partnerPhone,
    partnerBio,
    updateContactInfo,
    partnerMood
  } = useCouple();

  const { openCamera, openSnap } = useStreak();
  const [activeViewingSnap, setActiveViewingSnap] = useState(null);

  // Scoped Chat Theme (persisted in Firestore & localStorage)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pulsepath_chat_theme') || DEFAULT_CHAT_THEME;
  });
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Chat Wallpaper Customization State & Persistence
  const [customWallpaper, setCustomWallpaper] = useState(() => {
    return localStorage.getItem('pulsepath_chat_custom_wallpaper') || '';
  });
  const [wallpaperOpacity, setWallpaperOpacity] = useState(() => {
    const saved = localStorage.getItem('pulsepath_chat_wallpaper_opacity');
    return saved !== null ? parseFloat(saved) : 0.4;
  });
  const [wallpaperBlur, setWallpaperBlur] = useState(() => {
    const saved = localStorage.getItem('pulsepath_chat_wallpaper_blur');
    return saved !== null ? parseInt(saved, 10) : 0;
  });

  const handleApplyWallpaper = ({ url, opacity, blur }) => {
    setCustomWallpaper(url || '');
    if (url) {
      localStorage.setItem('pulsepath_chat_custom_wallpaper', url);
    } else {
      localStorage.removeItem('pulsepath_chat_custom_wallpaper');
    }
    if (opacity !== undefined) {
      setWallpaperOpacity(opacity);
      localStorage.setItem('pulsepath_chat_wallpaper_opacity', String(opacity));
    }
    if (blur !== undefined) {
      setWallpaperBlur(blur);
      localStorage.setItem('pulsepath_chat_wallpaper_blur', String(blur));
    }
  };

  // Contact Info / Profile View Modal State
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Messages state (initialized with saved local history or canonical messages)
  const [messages, setMessages] = useState(() => {
    try {
      const activeId = couple?.id || currentUser?.couple_id || 'demo_couple_123';
      const saved = localStorage.getItem(`pulsepath_chat_messages_v3_${activeId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some(m => m.id?.startsWith('canon_oct'))) return parsed;
      }
    } catch {}
    return CANONICAL_MESSAGES;
  });
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  // Panels hidden by default
  const [showEmojiDrawer, setShowEmojiDrawer] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [onlySavedMemories, setOnlySavedMemories] = useState(false);

  // Mute notifications state
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('pulsepath_chat_muted') === 'true';
  });
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('pulsepath_chat_muted', String(next));
      return next;
    });
    setShowOptionsMenu(false);
  };

  // Clear chat modal state
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const handleConfirmClearChat = () => {
    setMessages([]);
    setShowClearChatModal(false);
  };

  // Block contact modal state
  const [showBlockModal, setShowBlockModal] = useState(false);

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const handleConfirmReport = () => {
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportText('');
      setShowReportModal(false);
    }, 1200);
  };

  // Active Call Modal ('voice' | 'video' | null)
  const [activeCall, setActiveCall] = useState(null);

  // Image Lightbox
  const [lightboxImage, setLightboxImage] = useState(null);

  // Double-tap heart burst animation tracker
  const [heartBurstId, setHeartBurstId] = useState(null);

  // Uploading state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Save as Memory Modal
  const [messageToSave, setMessageToSave] = useState(null);
  const [customMemoryTitle, setCustomMemoryTitle] = useState('');
  const [savingMemory, setSavingMemory] = useState(false);

  // Long text message 'Read more / Show less' expand state
  const [expandedMessages, setExpandedMessages] = useState({});
  const toggleExpand = (id) => {
    setExpandedMessages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const chatInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = currentUser?.id || currentUser?.uid;
  const activeCoupleId = couple?.id || currentUser?.couple_id || 'demo_couple_123';

  // Single source of truth for message ownership:
  const isMessageOutgoing = (msg) => {
    if (!msg) return false;
    const effectiveUserId = currentUserId || 'user_eren_101';
    const msgSenderId = msg.senderId || msg.sender_id;
    if (!msgSenderId) return false;

    // Primary rule: message.senderId === effectiveUserId
    if (String(msgSenderId) === String(effectiveUserId)) {
      return true;
    }

    // Support demo account ID aliases
    if (
      (effectiveUserId === 'user_eren_101' || effectiveUserId === 'demo_user_eren') &&
      (msgSenderId === 'user_eren_101' || msgSenderId === 'demo_user_eren')
    ) {
      return true;
    }

    if (
      (effectiveUserId === 'user_mikasa_202' || effectiveUserId === 'demo_user_mikasa') &&
      (msgSenderId === 'user_mikasa_202' || msgSenderId === 'demo_user_mikasa')
    ) {
      return true;
    }

    return false;
  };

  // Sync saved chat theme from Firestore/localStorage on load
  useEffect(() => {
    if (!currentUserId) return;
    let active = true;
    getUserChatTheme(currentUserId).then((savedTheme) => {
      if (active && savedTheme) {
        setTheme(savedTheme);
      }
    });
    return () => { active = false; };
  }, [currentUserId]);

  const handleThemeApply = (newTheme) => {
    setTheme(newTheme);
    saveUserChatTheme(currentUserId, newTheme);
  };

  // Subscribe to real-time messages from database/WebSocket
  useEffect(() => {
    if (!activeCoupleId) return;

    const storageKey = `pulsepath_chat_messages_v3_${activeCoupleId}`;

    const unsub = subscribeToMessages(activeCoupleId, (incomingList) => {
      setMessages((prev) => {
        // Base starting set: if demo couple, start with CANONICAL_MESSAGES, else []
        const base = activeCoupleId === 'demo_couple_123' ? [...CANONICAL_MESSAGES] : [];
        const incoming = Array.isArray(incomingList) ? incomingList : [];

        // Build a Map keyed by id to eliminate duplicates
        const map = new Map();

        // 1. Add canonical base messages
        base.forEach((m) => {
          if (m && m.id) map.set(m.id, m);
        });

        // 2. Add incoming server messages
        incoming.forEach((m) => {
          if (m && m.id) map.set(m.id, m);
        });

        // 3. Keep any existing messages from prev (optimistic local or locally persisted)
        prev.forEach((m) => {
          if (!m || !m.id) return;
          if (String(m.id).startsWith('local_')) {
            const alreadyInServer = incoming.some(
              (sm) =>
                sm.content === m.content &&
                (String(sm.senderId) === String(m.senderId) || String(sm.sender_id) === String(m.sender_id))
            );
            if (!alreadyInServer) {
              map.set(m.id, m);
            }
          } else if (!map.has(m.id)) {
            map.set(m.id, m);
          }
        });

        const merged = Array.from(map.values());
        merged.sort((a, b) => {
          const tA = getMessageTimestamp(a);
          const tB = getMessageTimestamp(b);
          if (tA !== tB) return tA - tB;
          return String(a.id || '').localeCompare(String(b.id || ''));
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(merged));
        } catch (e) {}

        return merged;
      });

      markMessagesAsSeen(activeCoupleId, currentUserId);
    });

    const unsubTyping = wsService.on('typing', (data) => {
      if (data.user_id !== currentUserId) {
        setPartnerTyping(Boolean(data.is_typing));
      }
    });

    return () => {
      unsub && unsub();
      unsubTyping && unsubTyping();
    };
  }, [activeCoupleId, currentUserId]);

  // Robust smooth scroll to bottom strictly within the chat container
  const scrollToBottom = useCallback((instant = false) => {
    if (chatScrollContainerRef.current) {
      const container = chatScrollContainerRef.current;
      if (instant) {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  // Sync with sidebar navigation element selection
  useEffect(() => {
    const handleSyncChat = (e) => {
      scrollToBottom(false);
      if (e.detail?.focus !== false) {
        setTimeout(() => {
          chatInputRef.current?.focus();
        }, 80);
      }
    };
    window.addEventListener('pulsepath_sync_chat', handleSyncChat);
    return () => window.removeEventListener('pulsepath_sync_chat', handleSyncChat);
  }, [scrollToBottom]);

  // Handle Opening / Viewing Snapchat-Style Pulse Snaps
  const handleOpenSnap = useCallback((snapItem) => {
    setActiveViewingSnap(snapItem);
    if (openSnap) {
      openSnap(snapItem);
    }
    // Mark snap as opened in messages array & localStorage
    setMessages((prev) =>
      prev.map((m) => {
        const matches =
          m.id === snapItem.id ||
          (m.snapData && (m.snapData.id === snapItem.id || m.snapData.createdAt === snapItem.createdAt));
        if (matches) {
          return {
            ...m,
            unopened: false,
            snapData: {
              ...(m.snapData || m),
              unopened: false,
              openedAt: Date.now()
            }
          };
        }
        return m;
      })
    );
  }, [openSnap]);

  // Listen for sent snaps from PulseSnapCameraModal
  useEffect(() => {
    const handleSnapSent = (e) => {
      const snapData = e.detail;
      if (!snapData) return;
      const now = new Date();
      const effectiveSenderId = currentUserId || currentUser?.id || 'user_eren_101';
      const effectiveSenderName = currentUser?.name || 'Eren';
      const msgId = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

      const newMsg = {
        id: msgId,
        coupleId: activeCoupleId || 'demo_couple_123',
        senderId: effectiveSenderId,
        senderName: effectiveSenderName,
        type: 'pulse_snap',
        content: `[SNAP]: ${snapData.caption || 'Pulse Snap'}`,
        snapData: { ...snapData, unopened: false },
        unopened: false,
        createdAt: now.toISOString(),
        displayTime: formatMessageTime(now, '10:06 AM'),
        reactions: {}
      };

      setMessages((prev) => {
        const next = [...prev, newMsg];
        try {
          localStorage.setItem(`pulsepath_chat_messages_v3_${activeCoupleId || 'demo_couple_123'}`, JSON.stringify(next));
        } catch {}
        return next;
      });

      scrollToBottom(true);
    };

    window.addEventListener('pulsepath_snap_sent', handleSnapSent);
    return () => window.removeEventListener('pulsepath_snap_sent', handleSnapSent);
  }, [activeCoupleId, currentUserId, currentUser, scrollToBottom]);

  // Clean up typing indicator when navigating away
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      wsService.sendTyping(false);
    };
  }, []);

  // Automatically scroll conversation to the latest message on load and updates
  useEffect(() => {
    scrollToBottom(true);
    const t1 = setTimeout(() => scrollToBottom(false), 60);
    const t2 = setTimeout(() => scrollToBottom(false), 200);
    let t3 = null;
    if (window.innerWidth >= 768) {
      t3 = setTimeout(() => chatInputRef.current?.focus(), 250);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (t3) clearTimeout(t3);
    };
  }, [messages.length, partnerTyping, scrollToBottom]);

  // Mobile virtual keyboard & visualViewport height tracking (WhatsApp-style responsiveness)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleViewport = () => {
      if (window.visualViewport) {
        const isKb = window.visualViewport.height < window.innerHeight - 80;
        setIsKeyboardOpen(isKb);
        // Lock window scroll so header remains pinned at the top
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        scrollToBottom(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewport);
      window.visualViewport.addEventListener('scroll', handleViewport);
      return () => {
        window.visualViewport.removeEventListener('resize', handleViewport);
        window.visualViewport.removeEventListener('scroll', handleViewport);
      };
    }
  }, [scrollToBottom]);

  // Handle input focus/blur for iOS & Android keyboard events
  useEffect(() => {
    const input = chatInputRef.current;
    if (!input) return;

    const onFocus = () => {
      setIsKeyboardOpen(true);
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        scrollToBottom(false);
      }, 50);
      setTimeout(() => {
        window.scrollTo(0, 0);
        scrollToBottom(false);
      }, 250);
    };

    const onBlur = () => {
      setIsKeyboardOpen(false);
      setTimeout(() => {
        window.scrollTo(0, 0);
        scrollToBottom(false);
      }, 50);
    };

    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, [scrollToBottom]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    wsService.sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      wsService.sendTyping(false);
    }, 1500);
  };

  const handleSend = async (customContent = null) => {
    const textToSend = customContent !== null ? customContent : inputText.trim();
    if (!textToSend) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    wsService.sendTyping(false);

    if (customContent === null) {
      setInputText('');
    }
    const replyId = replyingTo?.id || null;
    setReplyingTo(null);
    setShowEmojiDrawer(false);
    setShowAttachMenu(false);

    // Optimistically append message to local feed immediately with currentUser identity
    const now = new Date();
    const effectiveSenderId = currentUserId || currentUser?.id || currentUser?.uid || 'user_eren_101';
    const effectiveSenderName = currentUser?.name || currentUser?.displayName || 'Eren';
    const msgId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;

    const optimisticMsg = {
      id: msgId,
      coupleId: activeCoupleId || 'demo_couple_123',
      couple_id: activeCoupleId || 'demo_couple_123',
      senderId: effectiveSenderId,
      sender_id: effectiveSenderId,
      senderName: effectiveSenderName,
      sender_name: effectiveSenderName,
      content: textToSend,
      replyToId: replyId,
      reply_to_id: replyId,
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
      displayTime: formatMessageTime(now, '10:06 AM'),
      reactions: {},
      isSavedAsMemory: false,
      is_saved_as_memory: false,
      seenAt: null,
      seen_at: null
    };

    // 1. Immediately push to message array/state and save locally
    setMessages((prev) => {
      const next = [...prev, optimisticMsg];
      try {
        localStorage.setItem(`pulsepath_chat_messages_v3_${activeCoupleId || 'demo_couple_123'}`, JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    // 2. Immediately scroll chat container to bottom
    scrollToBottom(true);
    requestAnimationFrame(() => scrollToBottom(false));
    setTimeout(() => scrollToBottom(false), 50);
    setTimeout(() => scrollToBottom(false), 200);

    // 3. Asynchronously persist to server/Firebase
    if (activeCoupleId) {
      try {
        const sent = await sendMessage(activeCoupleId, {
          senderId: effectiveSenderId,
          senderName: effectiveSenderName,
          content: textToSend,
          replyToId: replyId
        });
        if (sent && sent.id && sent.id !== msgId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, id: sent.id, ...sent } : m))
          );
        }
      } catch (err) {
        console.warn('Real-time message send sync notice (optimistic message retained):', err);
      }
    }
  };

  // Instant Big Heart button
  const handleSendInstantHeart = () => {
    handleSend('❤️');
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#FF4D6D', '#FF758F', '#FFE5EC']
    });
  };

  // Simulated Voice Note recording
  const handleSendVoiceMemo = () => {
    setShowAttachMenu(false);
    handleSend('[VOICE]:0:18');
  };

  // Photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowAttachMenu(false);
    setIsUploading(true);
    try {
      const res = await api.uploadFile(file);
      if (res?.url) {
        await handleSend(`[IMAGE]:${res.url}`);
      }
    } catch (err) {
      console.error('Photo upload failed:', err);
      // Fallback preview
      const localUrl = URL.createObjectURL(file);
      await handleSend(`[IMAGE]:${localUrl}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Instagram Double-Tap to Like with Heart Burst
  const handleDoubleTap = async (msg) => {
    setHeartBurstId(msg.id);
    setTimeout(() => setHeartBurstId(null), 900);
    if (activeCoupleId) {
      await toggleMessageReaction(activeCoupleId, msg.id, '❤️', currentUserId);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    if (!activeCoupleId) return;
    await toggleMessageReaction(activeCoupleId, messageId, emoji, currentUserId);
  };

  const handleOpenSaveMemory = (msg) => {
    setMessageToSave(msg);
    const cleanSnippet = msg.content.startsWith('[IMAGE]')
      ? 'A special picture in our chat 📷'
      : msg.content.startsWith('[DUAL_HEARTS]')
      ? 'Our sculpted ruby hearts ❤️'
      : msg.content.slice(0, 35);
    setCustomMemoryTitle(`“${cleanSnippet}...” ❤️`);
  };

  const handleConfirmSaveMemory = async (e) => {
    e.preventDefault();
    if (!messageToSave || !activeCoupleId) return;
    setSavingMemory(true);
    try {
      await saveMessageAsMemory(activeCoupleId, messageToSave, customMemoryTitle);
      confetti({
        particleCount: 60,
        spread: 70,
        colors: ['#FF4D6D', '#FFB703', '#FFE5EC']
      });
      setMessageToSave(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMemory(false);
    }
  };


  // Filtered messages guaranteed in chronological order with safe content handling
  const filteredMessages = useMemo(() => {
    const list = (messages || []).filter((m) => {
      if (!m) return false;
      const contentStr = typeof m.content === 'string' ? m.content : (m.content != null ? String(m.content) : '');
      const matchesSearch = searchQuery
        ? contentStr.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesFav = !onlySavedMemories || m.isSavedAsMemory || m.is_saved_as_memory;
      return matchesSearch && matchesFav;
    });

    return list.slice().sort((a, b) => {
      const timeA = getMessageTimestamp(a);
      const timeB = getMessageTimestamp(b);
      if (timeA !== timeB) return timeA - timeB;
      return String(a.id || '').localeCompare(String(b.id || ''));
    });
  }, [messages, searchQuery, onlySavedMemories]);

  // Scoped theme styling
  const activeTheme = getChatTheme(theme);
  const themeStyles = activeTheme.styles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -12 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-full h-full flex flex-col overflow-hidden relative isolate select-none box-border chat-container ${themeStyles.container} bg-gradient-to-b from-[#13071f] via-[#10061a] to-[#0c0414] text-white font-sans`}
      style={{
        height: '100%',
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Dynamic Custom Chat Wallpaper Layer */}
      {customWallpaper && (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${customWallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: wallpaperOpacity,
            filter: wallpaperBlur > 0 ? `blur(${wallpaperBlur}px)` : 'none',
            transform: wallpaperBlur > 0 ? 'scale(1.05)' : 'none'
          }}
        />
      )}

      {/* Subtle Vector Doodle Wallpaper Pattern (integrated into dark gradient for 100% text readability) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
        style={{ opacity: customWallpaper ? 0.03 : 0.075 }}
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <pattern id="wa-doodle" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Subtle Romantic Heart */}
          <path d="M20,15 C15,8 5,12 5,20 C5,27 20,38 20,38 C20,38 35,27 35,20 C35,12 25,8 20,15 Z" fill="white" />
          {/* Coffee Cup */}
          <path d="M70,20 L88,20 L86,34 L72,34 Z M88,24 L94,24 L94,30 L87,30" fill="none" stroke="white" strokeWidth="1.2" />
          {/* Sparkle Star */}
          <polygon points="40,75 42,80 47,82 42,84 40,89 38,84 33,82 38,80" fill="white" />
          {/* Sealed Letter */}
          <rect x="75" y="75" width="22" height="15" rx="2" fill="none" stroke="white" strokeWidth="1.2" />
          <path d="M75,75 L86,84 L97,75" fill="none" stroke="white" strokeWidth="1.2" />
          {/* Musical Note */}
          <circle cx="15" cy="85" r="2.5" fill="white" />
          <path d="M17.5,85 L17.5,72 L25,76 L25,85" fill="none" stroke="white" strokeWidth="1.2" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#wa-doodle)" />
      </svg>

      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* =========================================================================
          TOP FIXED CHAT HEADER (Native WhatsApp & Instagram Direct UX, ~54px)
          ========================================================================= */}
      <header
        className="top-header shrink-0 sticky top-0 z-[1000] w-full max-w-full box-border px-2.5 sm:px-4 pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))] flex items-center justify-between border-b border-white/[0.08] shadow-md relative bg-[#14071f]"
        style={{
          paddingTop: 'max(10px, calc(env(safe-area-inset-top, 0px) + 6px))',
          paddingBottom: '10px',
          background: '#14071f'
        }}
      >
        {/* Left: Back Arrow + Interactive Circular Profile Picture + Name & Subtitle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative z-[2]">
          <button
            type="button"
            onClick={() => navigate('/home')}
            aria-label="Back to Our Space"
            className="p-1 -ml-1 rounded-full text-purple-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0 cursor-pointer focus:outline-none"
            title="Back to Our Space"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Interactive Profile Header Area: Tapping navigates/opens Contact Info / Profile View page */}
          <button
            type="button"
            onClick={() => setShowContactInfo(true)}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 text-left rounded-2xl px-1 py-1 -my-1 hover:bg-white/[0.08] active:scale-[0.98] transition-all cursor-pointer focus:outline-none group/contact"
            title={`View & edit ${partnerName}'s profile & info`}
            aria-label={`View & edit ${partnerName}'s profile & info`}
          >
            {/* Clean Circular Profile Picture with Pulsing Online Status Dot */}
            <div className="relative shrink-0">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-purple-400/40 shadow-sm group-hover/contact:border-purple-300 group-hover/contact:scale-105 transition-all"
              />
              {/* Live Green Online Dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#140822] shadow-[0_0_6px_#34d399]" />
            </div>

            {/* Contact Name & Subtitle */}
            <div className="shrink-0 flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <h2
                  className="text-[14.5px] sm:text-[15.5px] font-bold tracking-tight text-white leading-tight font-sans whitespace-nowrap shrink-0 group-hover/contact:text-purple-200 transition-colors"
                >
                  {partnerName}
                </h2>
                <StreakBadge size="sm" className="shrink-0" />
              </div>
              <div
                className="text-[11px] font-medium text-emerald-400/90 leading-none flex items-center gap-1 mt-0.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active now</span>
                {isMuted && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-300 font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-400/30 ml-1">
                    <BellOff className="w-2.5 h-2.5" />
                    <span>Muted</span>
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Right: Integrated Control Buttons (Voice call, Video call, Search, More 3-dot menu) */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 text-white/90 relative z-[2]">
          {/* Voice Call Button */}
          <button
            type="button"
            onClick={() => setActiveCall('voice')}
            className="p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus:outline-none"
            title="Voice Call"
            aria-label="Voice Call"
          >
            <Phone className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Video Call Button */}
          <button
            type="button"
            onClick={() => setActiveCall('video')}
            className="p-1.5 sm:p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus:outline-none"
            title="Video Call"
            aria-label="Video Call"
          >
            <Video className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 sm:p-2 rounded-full transition-all cursor-pointer focus:outline-none ${
              showSearch ? 'bg-white/20 text-white' : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
            title="Search in chat"
            aria-label="Search in chat"
          >
            <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          {/* More / 3-Dot Menu Button Container */}
          <div className="relative">
            <button
              type="button"
              id="chat-more-options-trigger"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowOptionsMenu((prev) => !prev);
              }}
              className={`p-2 rounded-full transition-all cursor-pointer focus:outline-none relative z-50 ${
                showOptionsMenu ? 'bg-white/25 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              title="More options"
              aria-label="More options"
              aria-expanded={showOptionsMenu}
            >
              <MoreVertical className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* More Options Dropdown Menu */}
            {showOptionsMenu && (
              <>
                {/* Full-screen backdrop to capture outside taps and close menu */}
                <div
                  className="fixed sm:absolute inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowOptionsMenu(false);
                  }}
                />

                {/* Dropdown Menu - Styled with rich liquid glass & high z-index */}
                <div
                  className="absolute right-0 top-full mt-2 w-64 max-h-[min(75dvh,400px)] overflow-y-auto rounded-2xl bg-[#1c0a2e]/98 border border-white/20 backdrop-blur-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] p-1.5 z-50 animate-fadeIn select-none scrollbar-none"
                  style={{ scrollbarWidth: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Option 1: View Contact */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowContactInfo(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <User className="w-4 h-4 text-pink-300" />
                    <span>View Contact</span>
                  </button>

                  {/* Option 2: Search */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowSearch(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <Search className="w-4 h-4 text-sky-300" />
                    <span>Search in Chat</span>
                  </button>

                  {/* Option 3: Mute Notifications */}
                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {isMuted ? (
                        <BellOff className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-amber-300" />
                      )}
                      <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isMuted ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/60'
                    }`}>
                      {isMuted ? 'MUTED' : 'ON'}
                    </span>
                  </button>

                  {/* Option 4: Chat Wallpaper & Theme */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowThemeModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <Palette className="w-4 h-4 text-rose-300" />
                    <span>Chat Wallpaper & Theme</span>
                  </button>

                  {/* Option 5: Starred Memories Only */}
                  <button
                    type="button"
                    onClick={() => {
                      setOnlySavedMemories(!onlySavedMemories);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>Starred Memories Only</span>
                    </div>
                    {onlySavedMemories && <span className="text-[10px] text-amber-300 font-bold">ON</span>}
                  </button>

                  {/* Option 6: Media Gallery */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      navigate('/gallery');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>Media Gallery</span>
                  </button>

                  {/* Option 7: Screen Sharing */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      alert('Screen Sharing: Share your screen, photos, and stream videos together in real time ✨');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <Monitor className="w-4 h-4 text-sky-400" />
                    <span>Screen Sharing</span>
                  </button>

                  {/* Option 8: Real-time Translation */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      alert('Real-time Translation: Active! Translating couple messages seamlessly into each other’s language ❤️');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/90 hover:bg-white/10 text-left cursor-pointer transition-colors"
                  >
                    <Languages className="w-4 h-4 text-violet-400" />
                    <span>Real-time Translation</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  {/* Option 9: Clear Chat */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowClearChatModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 text-left cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Clear Chat</span>
                  </button>

                  {/* Option 10: Block Contact */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowBlockModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300/90 hover:bg-rose-500/20 text-left cursor-pointer transition-colors"
                  >
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>Block</span>
                  </button>

                  {/* Option 11: Report */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowReportModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-amber-300/90 hover:bg-amber-500/20 text-left cursor-pointer transition-colors"
                  >
                    <Flag className="w-4 h-4 text-amber-400" />
                    <span>Report</span>
                  </button>

                  <div className="my-1 border-t border-white/10" />

                  {/* Option 12: End-to-End Encryption */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      alert('End-to-End Encryption: Military-grade 256-bit AES protection active. Only you two hold the encryption keys 🔒');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-emerald-300 hover:bg-emerald-950/40 text-left cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Shield Encryption</span>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      SECURE
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Search Input Bar (Dropdown below header when search icon is clicked) */}
      {showSearch && (
        <div className="shrink-0 w-full max-w-full box-border overflow-x-hidden px-4 py-2 bg-[#170928]/95 border-b border-white/10 flex items-center gap-2 z-20 animate-fadeIn">
          <Search className="w-4 h-4 text-white/50 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages, voice notes, media..."
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-white/60 hover:text-white p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setShowSearch(false)}
            className="text-xs text-rose-300 hover:text-white px-1.5 py-0.5 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {/* =========================================================================
          CHAT MESSAGE AREA (Smooth vertical scrolling, zero scrollbars, zero horizontal movement)
          ========================================================================= */}
      <main
        ref={chatScrollContainerRef}
        className="flex-1 w-full max-w-full min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-4 pt-2 pb-2 z-10 box-border chat-scroll-area [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col"
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          paddingBottom: '8px'
        }}
      >
        <div className="min-h-full flex flex-col justify-end gap-2.5 pb-1">
          {filteredMessages.length === 0 ? (
            <div className="h-full my-auto flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-3">
                <Heart className="w-7 h-7 text-rose-400 animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white font-sans">
                {onlySavedMemories ? 'No starred memories found' : 'Your private conversation begins ❤️'}
              </h3>
              <p className="text-xs text-white/60 max-w-xs mt-1">
                Send a quick message, share a photo, or record a voice note.
              </p>
            </div>
          ) : (
          filteredMessages.map((msg, idx) => {
            // Dynamically determine outgoing (sent by current user) vs incoming (sent by partner)
            const isOutgoing = isMessageOutgoing(msg);
            const replyTarget = msg.replyToId
              ? messages.find((m) => m.id === msg.replyToId)
              : null;

            // Date divider check: Centered rounded date separator badges
            const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
            const currentDateBadge = msg.dateBadge || (msg.createdAt ? formatMessageDateDivider(msg.createdAt, 'Yesterday') : 'Today');
            const prevDateBadge = prevMsg ? (prevMsg.dateBadge || (prevMsg.createdAt ? formatMessageDateDivider(prevMsg.createdAt, '') : '')) : null;
            const showDateDivider = idx === 0 || (Boolean(currentDateBadge) && currentDateBadge !== prevDateBadge);
            const dateDividerLabel = currentDateBadge;

            // Message content types (safely coerced to string)
            const content = typeof msg?.content === 'string' ? msg.content : (msg?.content != null ? String(msg.content) : '');

            const isDualHearts =
              content.startsWith('[DUAL_HEARTS]') ||
              msg.id === 'canon_msg_2_hearts';

            const isVoice =
              content.startsWith('[VOICE]:') ||
              msg.id === 'canon_msg_1_voice_014' ||
              msg.id === 'canon_msg_4_voice_046';

            const voiceDuration = isVoice
              ? msg.duration || content.replace('[VOICE]:', '').trim() || '0:14'
              : '0:14';

            const isImage = content.startsWith('[IMAGE]:') && !isDualHearts;
            const imageUrl = isImage ? content.replace('[IMAGE]:', '').trim() : null;

            const isBigHeart = content === '❤️' || content === '💖' || content === '💕';

            const isSnap =
              msg.type === 'pulse_snap' ||
              Boolean(msg.snapData) ||
              content.startsWith('[SNAP]:');

            // Clean embedded time display (strictly never 'Invalid Date')
            const rawDisplay = msg.displayTime;
            const validDisplay = (rawDisplay && rawDisplay !== 'Invalid Date' && !rawDisplay.includes('NaN')) ? rawDisplay : null;
            const timeDisplay =
              validDisplay ||
              formatMessageTime(msg.createdAt || msg.created_at || msg.timestamp || msg.time, '10:06 AM') ||
              '10:06 AM';

            const isPrevSameSender = prevMsg && !showDateDivider && (isMessageOutgoing(prevMsg) === isOutgoing);

            return (
              <React.Fragment key={msg.id || idx}>
                {/* Centered rounded date separator badges: "Oct 1", "Oct 2", "Oct 4", and "Yesterday" */}
                {showDateDivider && (
                  <div className="flex justify-center my-3 select-none shrink-0" style={{ flexShrink: 0 }}>
                    <span className="px-4 py-1 rounded-full text-[11px] font-semibold tracking-wide text-purple-200/90 bg-[#1e1030]/90 backdrop-blur-md border border-purple-500/25 shadow-[0_2px_8px_rgba(0,0,0,0.5)] flex items-center gap-1.5">
                      <span>{dateDividerLabel}</span>
                    </span>
                  </div>
                )}

                {/* Message Row: Left for Incoming, Right for Outgoing */}
                <div
                  className={`w-full max-w-full box-border overflow-x-hidden flex flex-col shrink-0 ${isOutgoing ? 'items-end' : 'items-start'} ${isPrevSameSender ? 'mt-1' : 'mt-2.5 sm:mt-3'} group relative`}
                  style={{ flexShrink: 0, minHeight: 'min-content', alignSelf: isOutgoing ? 'flex-end' : 'flex-start', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
                >
                  {/* Quoted Reply Card preview */}
                  {replyTarget && (
                    <div
                      className={`text-[11px] mb-0.5 px-3 py-1 rounded-t-xl max-w-xs sm:max-w-md truncate border-l-3 shrink-0 ${
                        isOutgoing
                          ? 'bg-black/30 border-rose-400 text-white/80'
                          : 'bg-white/10 border-emerald-400 text-white/80'
                      }`}
                      style={{ flexShrink: 0 }}
                    >
                      <strong className="text-white text-[10px] block">
                        {replyTarget.senderName || replyTarget.sender_name}
                      </strong>
                      <span className="truncate block">
                        {typeof replyTarget?.content === 'string' && replyTarget.content.startsWith('[IMAGE]')
                          ? '📷 Photo'
                          : typeof replyTarget?.content === 'string' && replyTarget.content.startsWith('[DUAL_HEARTS]')
                          ? '❤️ Sculpted Ruby Hearts'
                          : String(replyTarget?.content || '')}
                      </span>
                    </div>
                  )}

                  {/* Main Bubble Row with fluid spacing and inline sender avatar */}
                  <div
                    className={`flex items-end gap-1.5 sm:gap-2 max-w-[88%] sm:max-w-md box-border overflow-visible shrink-0 ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                    style={{ flexShrink: 0 }}
                  >
                    {/* Inline Sender Profile Picture (DP) next to incoming chat bubbles - Instagram Direct style */}
                    {!isOutgoing && (
                      <div className="shrink-0 mb-0.5 select-none" style={{ flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => setShowContactInfo(true)}
                          className="block rounded-full focus:outline-none cursor-pointer group/dp transition-transform active:scale-95 shrink-0"
                          title={`View ${partnerName || 'Mikasa'}'s Profile`}
                          aria-label={`View ${partnerName || 'Mikasa'}'s Profile`}
                        >
                          {partnerAvatar ? (
                            <img
                              src={partnerAvatar}
                              alt={partnerName || 'Mikasa'}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-rose-400/40 shadow-sm group-hover/dp:border-rose-400 group-hover/dp:scale-105 transition-all"
                            />
                          ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 flex items-center justify-center font-bold text-white text-[11px] shadow-sm group-hover/dp:scale-105 transition-all">
                              {partnerName ? partnerName[0] : 'M'}
                            </div>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Action buttons for OUTGOING (Hidden by default, visible on hover) */}
                    {isOutgoing && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-1 shrink-0" style={{ flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={() => handleOpenSaveMemory(msg)}
                          className={`p-1 rounded hover:bg-white/10 ${
                            msg.isSavedAsMemory || msg.is_saved_as_memory ? 'text-amber-400' : 'text-white/60'
                          }`}
                          title="Save as Memory"
                        >
                          <Star className={`w-3.5 h-3.5 ${msg.isSavedAsMemory || msg.is_saved_as_memory ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 rounded hover:bg-white/10 text-white/60"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Modern Dynamic Island & Curve Style Chat Bubble */}
                    <div
                      onDoubleClick={() => handleDoubleTap(msg)}
                      style={{ flexShrink: 0 }}
                      className={`
                        relative px-3.5 py-2.5 sm:px-4 sm:py-3 transition-all select-text cursor-pointer shrink-0
                        ${
                          isOutgoing
                            ? 'bg-gradient-to-r from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] text-white rounded-[20px] sm:rounded-[22px] rounded-br-[4px] shadow-[0_4px_16px_rgba(124,58,237,0.38),inset_0_1px_1px_rgba(255,255,255,0.25)] border border-purple-400/30'
                            : 'bg-[#221e28] sm:bg-[#25212c] text-white rounded-[20px] sm:rounded-[22px] rounded-bl-[4px] border border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.12)] backdrop-blur-xl'
                        }
                        ${(msg.isSavedAsMemory || msg.is_saved_as_memory) ? 'ring-2 ring-amber-400/60' : ''}
                      `}
                    >
                      {/* Double-Tap Heart Burst Animation */}
                      {heartBurstId === msg.id && (
                        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-ping">
                          <Heart className="w-12 h-12 text-rose-500 fill-rose-500 drop-shadow-lg" />
                        </div>
                      )}

                      {/* Saved As Memory Star Badge */}
                      {(msg.isSavedAsMemory || msg.is_saved_as_memory) && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-300 font-semibold mb-1 select-none">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>Saved to Memory Timeline</span>
                        </div>
                      )}

                      {/* CONTENT 0: Snapchat-Style Pulse Snap */}
                      {isSnap && (
                        <div className="my-0.5">
                          <SnapMessageBubble
                            snap={msg.snapData || msg}
                            isOutgoing={isOutgoing}
                            onOpenSnap={handleOpenSnap}
                          />
                        </div>
                      )}

                      {/* CONTENT 1: The Two Heart Image Bubbles (10:07 AM canon element) */}
                      {isDualHearts && (
                        <div className="rounded-[18px] overflow-hidden my-0.5">
                          <div className="grid grid-cols-2 gap-1.5 max-w-[260px] sm:max-w-[280px]">
                            <div
                              className="aspect-square rounded-[16px] overflow-hidden relative group/img cursor-pointer border border-rose-400/30 shadow-md hover:scale-[1.02] transition-transform bg-black/40"
                              onClick={() => setLightboxImage('/assets/heart_ruby_crystal.jpg')}
                              title="Sculpted 3D Ruby Heart Crystal - Click to zoom"
                            >
                              <img
                                src="/assets/heart_ruby_crystal.jpg"
                                alt="Sculpted 3D Ruby Heart Crystal"
                                className="w-full h-full object-cover rounded-[16px]"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            </div>
                            <div
                              className="aspect-square rounded-[16px] overflow-hidden relative group/img cursor-pointer border border-rose-400/30 shadow-md hover:scale-[1.02] transition-transform bg-black/40"
                              onClick={() => setLightboxImage('/assets/heart_rose_pair.jpg')}
                              title="Sculpted Rose Quartz Heart Pair - Click to zoom"
                            >
                              <img
                                src="/assets/heart_rose_pair.jpg"
                                alt="Sculpted Rose Quartz Heart Pair"
                                className="w-full h-full object-cover rounded-[16px]"
                              />
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-5 h-5 text-white drop-shadow" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CONTENT 2: Single Photo Message */}
                      {isImage && imageUrl && !isDualHearts && (
                        <div
                          className="rounded-[18px] overflow-hidden my-1 relative group/img cursor-pointer max-w-[260px] sm:max-w-[300px]"
                          onClick={() => setLightboxImage(imageUrl)}
                        >
                          <img
                            src={getAssetUrl(imageUrl)}
                            alt="Shared photo"
                            className="max-h-64 sm:max-h-80 w-full object-cover rounded-[18px] transition-transform duration-300 group-hover/img:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      )}

                      {/* CONTENT 3: Voice Note with Real Waveform & Accurate Duration */}
                      {isVoice && (
                        <VoiceNoteBubble isMe={isOutgoing} duration={voiceDuration} />
                      )}

                      {/* CONTENT 4: Big Heart Message */}
                      {isBigHeart && (
                        <div className="py-1 flex items-center justify-center">
                          <span className="text-4xl sm:text-5xl animate-bounce leading-none drop-shadow-md">
                            {content}
                          </span>
                        </div>
                      )}

                      {/* CONTENT 5: Text Message (Wrapping naturally inside bubble) */}
                      {!isImage && !isDualHearts && !isVoice && !isBigHeart && !isSnap && (
                        <div className="relative">
                          <p className="text-[13.5px] sm:text-[14px] leading-relaxed whitespace-pre-wrap break-words font-sans text-white select-text">
                            {content.length > 150 && !expandedMessages[msg.id]
                              ? `${content.slice(0, 140)}...`
                              : content}
                          </p>
                          {content.length > 150 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(msg.id);
                              }}
                              className="text-[11px] font-semibold text-rose-300 hover:text-white underline mt-1 cursor-pointer select-none inline-block focus:outline-none"
                            >
                              {expandedMessages[msg.id] ? '(Show less)' : '(Read more)'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bottom Embedded Details: Clean Timestamp & WhatsApp Blue Ticks */}
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] tabular-nums font-normal select-none ${
                          isOutgoing ? 'text-purple-200/80' : 'text-neutral-400'
                        }`}
                      >
                        <span>{timeDisplay}</span>
                        {isOutgoing && (
                          <CheckCheck
                            className={`w-3.5 h-3.5 ${
                              msg.seenAt || msg.seen_at
                                ? 'text-[#60a5fa]'
                                : 'text-white/60'
                            }`}
                            title={msg.seenAt || msg.seen_at ? 'Read by partner' : 'Delivered'}
                          />
                        )}
                      </div>

                      {/* Interactive Reaction Pill on bottom edge */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 bg-[#150722] border border-white/20 px-2 py-0.5 rounded-full shadow-md text-[11px] z-20 select-none">
                          {Object.entries(msg.reactions).map(([emoji, users]) => (
                            <span
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReaction(msg.id, emoji);
                              }}
                              className="cursor-pointer hover:scale-125 transition-transform"
                            >
                              {emoji} {users.length > 1 ? users.length : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action buttons for INCOMING (Hidden by default, visible on hover) */}
                    {!isOutgoing && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-1 shrink-0">
                        {QUICK_REACTIONS.slice(0, 2).map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(msg.id, emoji)}
                            className="text-xs hover:scale-130 transition-transform p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleOpenSaveMemory(msg)}
                          className={`p-1 rounded hover:bg-white/10 ${
                            msg.isSavedAsMemory || msg.is_saved_as_memory ? 'text-amber-400' : 'text-white/60'
                          }`}
                          title="Save as Memory"
                        >
                          <Star className={`w-3.5 h-3.5 ${msg.isSavedAsMemory || msg.is_saved_as_memory ? 'fill-amber-400' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(msg)}
                          className="p-1 rounded hover:bg-white/10 text-white/60"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* Live Partner Typing Pill */}
        {partnerTyping && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 w-fit text-xs text-white">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce [animation-delay:0.4s]" />
            </div>
            <span className="font-medium">{partnerName} is typing...</span>
          </div>
        )}

          <div ref={messagesEndRef} className="h-0 w-full shrink-0" />
        </div>
      </main>

      {/* Backdrops for Miniature Liquid Popups (Strictly bounded inside Chat container) */}
      {(showAttachMenu || showEmojiDrawer) && (
        <div
          className="absolute inset-0 z-35 bg-black/40 backdrop-blur-[1px]"
          onClick={() => {
            setShowAttachMenu(false);
            setShowEmojiDrawer(false);
          }}
        />
      )}

      {/* =========================================================================
          FIXED BOTTOM MESSAGE COMPOSER (Liquid Capsule UX)
          ========================================================================= */}
      <footer
        className="ios-chat-footer shrink-0 w-full max-w-full box-border overflow-x-hidden z-40 bg-[#160b1a]/98 border-t border-white/[0.08] px-2.5 pt-2 pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))]"
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          bottom: 0,
          marginBottom: 0,
          paddingBottom: isKeyboardOpen ? '4px' : 'max(6px, calc(env(safe-area-inset-bottom, 0px) + 2px))',
          background: 'rgba(22, 11, 26, 0.98)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        {/* Replying Banner */}
        {replyingTo && (
          <div className="px-3 py-1.5 mb-1.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between text-xs text-white/80 animate-fadeIn">
            <div className="truncate flex items-center gap-1.5">
              <Reply className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>
                Replying to <strong className="text-white">{replyingTo.senderName || replyingTo.sender_name}</strong>: “{replyingTo.content}”
              </span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Uploading progress indicator */}
        {isUploading && (
          <div className="px-3 py-1 mb-1.5 bg-rose-500/20 text-xs text-rose-200 flex items-center gap-2 rounded-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            <span>Uploading photo to your private vault...</span>
          </div>
        )}

        {/* MINIATURE LIQUID BOX ATTACHMENT POPUP MENU */}
        {showAttachMenu && (
          <div className="absolute bottom-[calc(100%+8px)] left-2.5 z-50 w-56 rounded-2xl bg-[#180a2b]/95 backdrop-blur-2xl border border-rose-500/35 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(244,63,94,0.35)] p-2 animate-fadeIn select-none">
            {/* Downward pointing caret diamond */}
            <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 bg-[#180a2b] border-r border-b border-rose-500/35" />

            <div className="space-y-1 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block leading-tight">Send Photo</span>
                  <span className="text-[10px] text-rose-300/70 block leading-tight mt-0.5">Camera & Gallery</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  handleSendVoiceMemo();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block leading-tight">Voice Memo</span>
                  <span className="text-[10px] text-rose-300/70 block leading-tight mt-0.5">Quick audio note</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  handleSend('💌 [Sealed Love Letter Note]');
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block leading-tight">Love Letter</span>
                  <span className="text-[10px] text-rose-300/70 block leading-tight mt-0.5">Romantic sealed note</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAttachMenu(false);
                  handleSendInstantHeart();
                }}
                className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-left hover:bg-white/10 active:bg-white/15 transition-all group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-pink-500/25 border border-pink-400/40 text-pink-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                  <Heart className="w-4 h-4 fill-pink-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block leading-tight">Send Heart Pulse</span>
                  <span className="text-[10px] text-rose-300/70 block leading-tight mt-0.5">Instant love buzz</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* MINIATURE LIQUID BOX EMOJI POPUP MENU */}
        {showEmojiDrawer && (
          <div className="absolute bottom-[calc(100%+8px)] left-2.5 sm:left-4 z-50 w-64 max-h-56 overflow-y-auto overflow-x-hidden rounded-2xl bg-[#180a2b]/95 backdrop-blur-2xl border border-rose-500/35 shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(244,63,94,0.35)] p-2.5 animate-fadeIn select-none chat-scroll-area [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="absolute -bottom-1.5 left-8 w-3 h-3 rotate-45 bg-[#180a2b] border-r border-b border-rose-500/35" />

            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 relative z-10">
              <span className="text-xs font-semibold text-rose-200 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-rose-400" />
                <span>Stickers & Emojis</span>
              </span>
              <button
                type="button"
                onClick={() => setShowEmojiDrawer(false)}
                className="p-1 text-white/60 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 relative z-10">
              {Object.entries(EMOJI_CATEGORIES).map(([cat, emojis]) => (
                <div key={cat}>
                  <div className="text-[10px] uppercase font-semibold text-white/50 mb-1 px-1">
                    {cat}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {emojis.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setInputText((prev) => prev + em)}
                        className="text-lg p-1 hover:scale-125 transition-transform active:scale-95"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redesigned Seamless Liquid Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 w-full relative z-10"
        >
          {/* Action Trigger Button (Left) */}
          <button
            type="button"
            onClick={() => {
              setShowAttachMenu(!showAttachMenu);
              setShowEmojiDrawer(false);
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 border transition-all cursor-pointer shadow-sm active:scale-95 focus:outline-none ${
              showAttachMenu
                ? 'bg-purple-600/35 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(124,58,237,0.4)]'
                : 'bg-white/[0.08] hover:bg-white/[0.14] border-white/15 text-white/70 hover:text-white'
            }`}
            title="Attach media or note"
            aria-label="Attach media or note"
          >
            <Plus className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 stroke-[2.2] ${showAttachMenu ? 'rotate-45 text-purple-300' : ''}`} />
          </button>

          {/* Liquid Input Capsule */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e0f33]/90 hover:bg-[#23123d] focus-within:bg-[#271444] border border-purple-500/25 focus-within:border-purple-400/60 shadow-inner backdrop-blur-xl transition-all">
            {/* Emoji Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setShowEmojiDrawer(!showEmojiDrawer);
                setShowAttachMenu(false);
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer shrink-0 focus:outline-none ${
                showEmojiDrawer ? 'text-purple-400' : 'text-white/60 hover:text-purple-300'
              }`}
              title="Stickers and emojis"
              aria-label="Stickers and emojis"
            >
              <Smile className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Text Input (Center - never squeezed, properly padded) */}
            <input
              ref={chatInputRef}
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type a message..."
              className="flex-1 min-w-0 bg-transparent text-[13.5px] sm:text-[14px] text-white placeholder-white/45 outline-none px-1.5 py-0.5 font-sans caret-purple-400"
            />

            {/* Right Action Buttons inside the capsule (Voice & Instant Heart) */}
            {!inputText.trim() ? (
              <div className="flex items-center gap-1 shrink-0 pl-1 pr-0.5">
                {/* Dedicated Pulse Snap Camera Button */}
                <button
                  type="button"
                  onClick={openCamera}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-rose-300 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0 focus:outline-none"
                  title="Send Pulse Snap 📷"
                  aria-label="Send Pulse Snap"
                >
                  <Camera className="w-4 h-4 text-rose-300" />
                </button>

                {/* Voice Microphone Button */}
                <button
                  type="button"
                  onClick={handleSendVoiceMemo}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white/75 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer shrink-0 focus:outline-none"
                  title="Send Voice Memo"
                  aria-label="Send Voice Memo"
                >
                  <Mic className="w-4 h-4 text-purple-200" />
                </button>

                {/* Instant Heart Button */}
                <button
                  type="button"
                  onClick={handleSendInstantHeart}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-400 hover:bg-white/10 active:scale-125 transition-transform cursor-pointer shrink-0 focus:outline-none"
                  title="Send Instant Love Heart"
                  aria-label="Send Instant Love Heart"
                >
                  <Heart className="w-4 h-4 fill-current animate-pulse-subtle" />
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-violet-500 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(124,58,237,0.6)] active:scale-90 transition-all cursor-pointer focus:outline-none"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}
          </div>
        </form>
      </footer>

      {/* =========================================================================
          FULLSCREEN PHOTO LIGHTBOX MODAL (Bounded inside container)
          ========================================================================= */}
      {lightboxImage && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] p-2 rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={getAssetUrl(lightboxImage)}
            alt="Zoomed memory"
            className="max-h-[90dvh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

      {/* =========================================================================
          CALL SIMULATION MODAL (Voice and Video Call)
          ========================================================================= */}
      <ChatCallingModal
        isOpen={Boolean(activeCall)}
        onClose={() => setActiveCall(null)}
        partnerName={partnerName || 'Eren'}
        partnerAvatar={partnerAvatar}
        userName={currentUser?.name || 'Me'}
        userAvatar={currentUser?.avatar || ''}
        isVideo={true}
      />

      {/* =========================================================================
          SAVE AS MEMORY MODAL
          ========================================================================= */}
      <Modal
        isOpen={Boolean(messageToSave)}
        onClose={() => setMessageToSave(null)}
        title="Save Message as Memory ❤️"
        subtitle="This message will be permanently etched in your shared timeline"
      >
        {messageToSave && (
          <form onSubmit={handleConfirmSaveMemory} className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm font-normal text-rose-100">
              “{messageToSave.content}”
              <div className="text-[11px] text-rose-300/70 mt-2">
                — {messageToSave.senderName || messageToSave.sender_name}, {formatMessageTime(messageToSave.createdAt || messageToSave.created_at)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-rose-200/90 mb-1">
                Memory Title
              </label>
              <input
                type="text"
                required
                value={customMemoryTitle}
                onChange={(e) => setCustomMemoryTitle(e.target.value)}
                placeholder="Title for this special note..."
                className="w-full glass-input px-3 py-2 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <RomanticButton variant="secondary" onClick={() => setMessageToSave(null)}>
                Cancel
              </RomanticButton>
              <RomanticButton type="submit" loading={savingMemory}>
                Save to Timeline ❤️
              </RomanticButton>
            </div>
          </form>
        )}
      </Modal>

      {/* =========================================================================
          DYNAMIC CHAT WALLPAPER & THEME STUDIO MODAL
          ========================================================================= */}
      <ChatThemeModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={theme}
        onApplyTheme={handleThemeApply}
        currentWallpaper={customWallpaper}
        currentWallpaperOpacity={wallpaperOpacity}
        currentWallpaperBlur={wallpaperBlur}
        onApplyWallpaper={handleApplyWallpaper}
        partnerName={partnerName || 'Mikasa'}
      />

      {/* =========================================================================
          INTERACTIVE CONTACT INFO / PROFILE VIEW MODAL
          ========================================================================= */}
      <ContactInfoModal
        isOpen={showContactInfo}
        onClose={() => setShowContactInfo(false)}
        partnerName={partnerName || 'Mikasa'}
        partnerAvatar={partnerAvatar}
        partnerPhone={partnerPhone}
        partnerBio={partnerBio}
        onSaveContactInfo={(updatedInfo) => {
          updateContactInfo(updatedInfo);
        }}
        onOpenWallpaper={() => {
          setShowContactInfo(false);
          setShowThemeModal(true);
        }}
        onStartVideoCall={() => {
          setShowContactInfo(false);
          setActiveCall('video');
        }}
      />

      {/* =========================================================================
          CLEAR CHAT CONFIRMATION MODAL
          ========================================================================= */}
      <Modal
        isOpen={showClearChatModal}
        onClose={() => setShowClearChatModal(false)}
        title="Clear Chat Messages?"
        subtitle="This will clear messages from your active conversation window"
      >
        <div className="space-y-4 py-1 text-sm text-white/80">
          <p>
            Are you sure you want to clear your conversation with <strong className="text-white">{partnerName || 'Mikasa'}</strong>?
          </p>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-xs text-amber-200/90 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400" />
            <span>Don't worry! Your starred Timeline Memories and photos will remain permanently preserved ❤️</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <RomanticButton variant="secondary" onClick={() => setShowClearChatModal(false)}>
              Cancel
            </RomanticButton>
            <button
              type="button"
              onClick={handleConfirmClearChat}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-md transition-all cursor-pointer"
            >
              Clear Messages
            </button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          BLOCK CONTACT SOULMATE PROTECTION MODAL
          ========================================================================= */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Soulmate Protection ❤️"
        subtitle="Eren & Mikasa are bound together for eternity"
      >
        <div className="space-y-4 py-2 text-center text-sm text-white/80">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-rose-500/20 to-pink-500/20 border border-rose-400/30 flex items-center justify-center">
            <Heart className="w-7 h-7 text-rose-400 animate-pulse" />
          </div>
          <p className="text-sm font-semibold text-white">
            You cannot block your soulmate in PulsePath! 🥰
          </p>
          <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
            This private sanctuary was created for your bond. If you need some space, take a deep breath or send a gentle Love Letter instead.
          </p>
          <div className="flex justify-center pt-2">
            <RomanticButton onClick={() => setShowBlockModal(false)}>
              Back to Our Space ❤️
            </RomanticButton>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          REPORT / FEEDBACK MODAL
          ========================================================================= */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report & Feedback"
        subtitle="Help us keep your private sanctuary safe and harmonious"
      >
        <div className="space-y-4 py-1 text-sm text-white/80">
          {reportSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-center space-y-1">
              <div className="text-sm font-bold text-emerald-300">Thank you! ✨</div>
              <p className="text-xs">Your feedback has been received with love.</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-white/70">
                PulsePath is your encrypted space. If you noticed an issue, a glitch, or have feedback about your conversation with <strong className="text-white">{partnerName || 'Mikasa'}</strong>, let us know:
              </p>
              <textarea
                rows={3}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe what happened or how we can improve..."
                className="w-full glass-input p-3 text-xs resize-none focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <RomanticButton variant="secondary" onClick={() => setShowReportModal(false)}>
                  Cancel
                </RomanticButton>
                <button
                  type="button"
                  onClick={handleConfirmReport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 text-white shadow-md transition-all cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Snapchat-Style Full-Screen Snap Viewer Modal */}
      {activeViewingSnap && (
        <PulseSnapViewerModal
          snap={activeViewingSnap}
          onClose={() => setActiveViewingSnap(null)}
          onReactHeart={(snapId) => {
            handleDoubleTap({ id: snapId });
          }}
        />
      )}
    </motion.div>
  );
}
