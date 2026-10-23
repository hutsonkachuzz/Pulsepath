import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { wsService } from '../services/websocket';
import { calculateJourneyStats } from '../utils/dateUtils';
import {
  createCoupleSpace,
  joinCoupleSpace,
  subscribeToCouple,
  subscribeToMoods,
  setPartnerMood as setFirebaseMood
} from '../services/firebaseService';
import { isFirebaseConfigured, db } from '../config/firebase';

const CoupleContext = createContext();

export function CoupleProvider({ children }) {
  const { currentUser, updateProfile } = useAuth();
  const [couple, setCouple] = useState(null);
  const [moods, setMoods] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsepath_local_moods');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);

  const currentUserId = currentUser?.id || currentUser?.uid;
  const isDemoUser = Boolean(
    currentUser?.email?.includes('pulsepath.love') ||
    currentUserId === 'user_eren_101' ||
    currentUserId === 'user_mikasa_202' ||
    currentUserId === 'demo_user_eren' ||
    currentUserId === 'demo_user_mikasa'
  );

  const effectiveCoupleId = currentUser?.couple_id || (isDemoUser ? 'demo_couple_123' : null);

  // Load & subscribe to couple space data in real-time
  useEffect(() => {
    let mounted = true;

    if (!effectiveCoupleId) {
      setCouple(null);
      setLoading(false);
      return;
    }

    // 1. Try real-time Firestore subscription first
    let unsubFirestore = null;
    let unsubMoodsFirestore = null;

    if (isFirebaseConfigured && db) {
      unsubFirestore = subscribeToCouple(effectiveCoupleId, (coupleData) => {
        if (mounted && coupleData) {
          setCouple(coupleData);
          setLoading(false);
        }
      });

      unsubMoodsFirestore = subscribeToMoods(effectiveCoupleId, (moodData) => {
        if (mounted && moodData) {
          setMoods(moodData);
        }
      });
    }

    // 2. Fallback / parallel check to REST backend if available
    async function loadBackendCoupleData() {
      try {
        const coupleData = await api.getCurrentCouple();
        if (mounted && coupleData) {
          setCouple((prev) => prev || coupleData);
        }
        wsService.connect(effectiveCoupleId);
        const currentMoods = await api.getMoods();
        if (mounted && currentMoods) {
          setMoods((prev) => ({ ...prev, ...currentMoods }));
        }
      } catch (err) {
        // Fallback demo state if offline
        if (isDemoUser && mounted) {
          setCouple((prev) => prev || {
            id: 'demo_couple_123',
            coupleCode: 'PULSE-LOVE',
            userOneId: 'user_eren_101',
            userOneName: 'Eren',
            userTwoId: 'user_mikasa_202',
            userTwoName: 'Mikasa',
            nickname: 'Eren & Mikasa',
            relationshipStartDate: '2024-02-14T00:00:00.000Z'
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBackendCoupleData();

    return () => {
      mounted = false;
      unsubFirestore && unsubFirestore();
      unsubMoodsFirestore && unsubMoodsFirestore();
    };
  }, [effectiveCoupleId, isDemoUser]);

  // Subscribe to real-time mood updates via WebSocket
  useEffect(() => {
    if (!couple?.id) return;

    const unsubMood = wsService.on('mood_update', (data) => {
      setMoods((prev) => ({
        ...prev,
        [data.user_id]: {
          mood: data.mood,
          emoji: data.emoji,
          note: data.note,
          updatedAt: data.updatedAt
        }
      }));
    });

    return () => {
      unsubMood && unsubMood();
    };
  }, [couple?.id]);

  // Stable base journey stats (updated only when relationship date changes or daily)
  const startDate = couple?.relationship_start_date || couple?.relationshipStartDate || '2024-02-14T00:00:00.000Z';
  const baseJourneyStats = useMemo(() => {
    return calculateJourneyStats(startDate);
  }, [startDate]);

  // WhatsApp-Style Opposite Partner identification & resolution:
  // If active user is Eren -> Partner is strictly Mikasa (with Mikasa's DP)
  // If active user is Mikasa -> Partner is strictly Eren (with Eren's DP)
  const currentUserName = currentUser?.name || '';
  const isCurrentEren = currentUserName.toLowerCase().includes('eren') ||
                        currentUserId === 'user_eren_101' ||
                        currentUserId === 'demo_user_eren';

  const partnerId = isCurrentEren ? 'user_mikasa_202' : 'user_eren_101';

  // Editable Partner Contact Info (Name, Phone, Bio, Avatar) isolated per partner ID
  const [customContact, setCustomContact] = useState(() => {
    try {
      const saved = localStorage.getItem('pulsepath_contact_profile_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateContactInfo = useCallback((updates) => {
    setCustomContact((prev) => {
      const targetPartnerId = isCurrentEren ? 'user_mikasa_202' : 'user_eren_101';
      const next = {
        ...prev,
        [targetPartnerId]: { ...(prev[targetPartnerId] || {}), ...updates }
      };
      localStorage.setItem('pulsepath_contact_profile_v2', JSON.stringify(next));
      return next;
    });
  }, [isCurrentEren]);

  const defaultPartnerName = isCurrentEren ? 'Mikasa' : 'Eren';
  const partnerProfile = customContact[partnerId] || {};

  // Strictly enforce opposite partner name (never active user's own name)
  const partnerName = (partnerProfile.name && partnerProfile.name.toLowerCase() !== currentUserName.toLowerCase())
    ? partnerProfile.name
    : defaultPartnerName;

  const defaultPartnerAvatar = isCurrentEren
    ? '/assets/mikasa_avatar.jpg'
    : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80';

  const partnerAvatar = partnerProfile.avatar || defaultPartnerAvatar;
  const partnerPhone = partnerProfile.phone || (isCurrentEren ? '+1 (555) 782-9012' : '+1 (555) 234-5678');
  const partnerBio = partnerProfile.bio || (isCurrentEren ? 'Forever by your side. Loving you more every single day ❤️' : 'I will wrap that scarf around you again and again, forever.');

  const myMood = useMemo(() => {
    if (currentUserId && moods[currentUserId]) return moods[currentUserId];
    if (currentUser?.id && moods[currentUser.id]) return moods[currentUser.id];
    if (currentUser?.uid && moods[currentUser.uid]) return moods[currentUser.uid];

    // Check localStorage fallback
    try {
      const savedMyMood = localStorage.getItem('pulsepath_my_mood');
      if (savedMyMood) return JSON.parse(savedMyMood);
    } catch {}

    return { mood: 'Loved', emoji: '❤️', note: '' };
  }, [currentUserId, currentUser, moods]);

  const partnerMood = useMemo(() => {
    if (partnerId && moods[partnerId]) return moods[partnerId];

    // Check localStorage fallback
    try {
      const savedPartnerMood = localStorage.getItem('pulsepath_partner_mood');
      if (savedPartnerMood) return JSON.parse(savedPartnerMood);
    } catch {}

    return { mood: 'Loved', emoji: '❤️', note: '' };
  }, [partnerId, moods]);

  const createSpace = useCallback(async (relationshipStartDate, nickname, description = '') => {
    if (!currentUser) throw new Error('Must be signed in');
    let newCouple = null;

    if (isFirebaseConfigured && db) {
      newCouple = await createCoupleSpace(
        currentUserId,
        currentUser.name || 'Partner',
        relationshipStartDate,
        nickname
      );
    } else {
      newCouple = await api.createCouple({
        relationship_start_date: new Date(relationshipStartDate).toISOString(),
        nickname: nickname || `${currentUser.name}'s Space`,
        description: description || 'Two hearts beating as one.'
      });
    }

    setCouple(newCouple);
    await updateProfile({ couple_id: newCouple.id });
    wsService.connect(newCouple.id);
    return newCouple;
  }, [currentUser, currentUserId, updateProfile]);

  const joinSpace = useCallback(async (coupleCode) => {
    if (!currentUser) throw new Error('Must be signed in');
    const cleanCode = coupleCode.trim().toUpperCase();
    let joinedCouple = null;

    if (isFirebaseConfigured && db) {
      joinedCouple = await joinCoupleSpace(
        currentUserId,
        currentUser.name || 'Partner',
        cleanCode
      );
    } else {
      joinedCouple = await api.joinCouple({ couple_code: cleanCode });
    }

    setCouple(joinedCouple);
    await updateProfile({ couple_id: joinedCouple.id });
    wsService.connect(joinedCouple.id);
    return joinedCouple;
  }, [currentUser, currentUserId, updateProfile]);

  const setMyMood = useCallback(async (mood, emoji, note = '') => {
    const activeUserId = currentUserId || currentUser?.id || currentUser?.uid || 'user_eren_101';
    const nowIso = new Date().toISOString();
    const newMoodObj = {
      mood: mood || 'Loved',
      emoji: emoji || '❤️',
      note: note || '',
      updatedAt: nowIso
    };

    // 1. OPTIMISTIC UPDATE: Update state immediately and persist to localStorage
    setMoods((prev) => {
      const updated = {
        ...prev,
        [activeUserId]: newMoodObj,
        ...(currentUser?.id ? { [currentUser.id]: newMoodObj } : {}),
        ...(currentUser?.uid ? { [currentUser.uid]: newMoodObj } : {})
      };
      try {
        localStorage.setItem('pulsepath_local_moods', JSON.stringify(updated));
        localStorage.setItem('pulsepath_my_mood', JSON.stringify(newMoodObj));
      } catch {}
      return updated;
    });

    // 2. Broadcast via WebSocket if connected
    try {
      wsService.send({
        type: 'mood_update',
        user_id: activeUserId,
        ...newMoodObj
      });
    } catch {}

    // 3. Sync to Firebase Firestore if configured
    const targetCoupleId = couple?.id || effectiveCoupleId;
    if (isFirebaseConfigured && db && targetCoupleId) {
      try {
        await setFirebaseMood(targetCoupleId, activeUserId, mood, emoji, note);
      } catch (fbErr) {
        console.warn('Firestore setMood warning:', fbErr);
      }
    }

    // 4. Sync to REST backend API
    try {
      const apiResult = await api.setMood({ mood, emoji, note });
      if (apiResult && typeof apiResult === 'object') {
        setMoods((prev) => {
          const merged = { ...prev, ...apiResult };
          try {
            localStorage.setItem('pulsepath_local_moods', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch (apiErr) {
      console.warn('REST setMood notice (offline/demo):', apiErr.message);
    }
  }, [currentUserId, currentUser, couple?.id, effectiveCoupleId]);


  const coupleMemo = useMemo(() => {
    if (!couple) return null;
    return {
      ...couple,
      coupleCode: couple.couple_code || couple.coupleCode,
      relationshipStartDate: couple.relationship_start_date || couple.relationshipStartDate,
      userOneId: couple.user_one_id || couple.userOneId,
      userTwoId: couple.user_two_id || couple.userTwoId,
      userOneName: couple.user_one_name || couple.userOneName,
      userTwoName: couple.user_two_name || couple.userTwoName
    };
  }, [couple]);

  const contextValue = useMemo(() => ({
    couple: coupleMemo,
    loading,
    partnerId,
    partnerName,
    partnerAvatar,
    partnerPhone,
    partnerBio,
    updateContactInfo,
    partnerMood,
    myMood,
    journeyStats: baseJourneyStats,
    createSpace,
    joinSpace,
    setMyMood,
    hasPartner: Boolean(couple?.user_two_id || couple?.userTwoId)
  }), [
    coupleMemo,
    loading,
    partnerId,
    partnerName,
    partnerAvatar,
    partnerPhone,
    partnerBio,
    updateContactInfo,
    partnerMood,
    myMood,
    baseJourneyStats,
    createSpace,
    joinSpace,
    setMyMood,
    couple?.user_two_id,
    couple?.userTwoId
  ]);

  return (
    <CoupleContext.Provider value={contextValue}>
      {children}
    </CoupleContext.Provider>
  );
}

/**
 * Hook to consume stable couple context without 1-second interval re-render penalty.
 */
export function useCouple() {
  const context = useContext(CoupleContext);
  if (!context) throw new Error('useCouple must be used within a CoupleProvider');
  return context;
}

/**
 * High-performance hook for real-time ticking seconds counter.
 * Ticks locally only inside the subscribing component (e.g. LivingJourneyHero).
 */
export function useJourneyStats() {
  const { couple, journeyStats: baseStats } = useCouple();
  const startDate = couple?.relationship_start_date || couple?.relationshipStartDate;
  const [stats, setStats] = useState(() => (startDate ? calculateJourneyStats(startDate) : baseStats));

  useEffect(() => {
    if (!startDate) return;
    setStats(calculateJourneyStats(startDate));
    const interval = setInterval(() => {
      setStats(calculateJourneyStats(startDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return stats;
}
