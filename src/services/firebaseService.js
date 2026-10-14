import { api } from './api';
import { wsService } from './websocket';
import { db, isFirebaseConfigured } from '../config/firebase';
import { parseDate, formatMessageTime, getMessageTimestamp } from '../utils/dateUtils';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  where,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Generate romantic couple code
export function generateCoupleCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PULSE-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/* ==========================================================================
   COUPLES MANAGEMENT
   ========================================================================== */

export async function createCoupleSpace(userId, userName, relationshipStartDate, nickname = '') {
  if (isFirebaseConfigured && db) {
    const coupleCode = generateCoupleCode();
    const coupleRef = await addDoc(collection(db, 'couples'), {
      coupleCode,
      userOneId: userId,
      userOneName: userName,
      userTwoId: null,
      userTwoName: null,
      relationshipStartDate: new Date(relationshipStartDate).toISOString(),
      nickname: nickname || `${userName}'s Space`,
      description: 'Two hearts beating as one.',
      createdAt: serverTimestamp()
    });

    // Update user profile with coupleId
    if (userId) {
      await setDoc(doc(db, 'users', userId), {
        couple_id: coupleRef.id
      }, { merge: true });
    }

    return {
      id: coupleRef.id,
      coupleCode,
      userOneId: userId,
      userOneName: userName,
      relationshipStartDate
    };
  }

  return await api.createCouple({
    relationship_start_date: new Date(relationshipStartDate).toISOString(),
    nickname: nickname || `${userName}'s Space`,
    description: 'Two hearts beating as one.'
  });
}

export async function joinCoupleSpace(userId, userName, coupleCode) {
  const cleanCode = (coupleCode || '').trim().toUpperCase();
  if (isFirebaseConfigured && db && cleanCode) {
    try {
      const q = query(collection(db, 'couples'), where('coupleCode', '==', cleanCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const coupleDoc = snap.docs[0];
        const coupleData = coupleDoc.data();
        await updateDoc(doc(db, 'couples', coupleDoc.id), {
          userTwoId: userId,
          userTwoName: userName
        });
        if (userId) {
          await setDoc(doc(db, 'users', userId), {
            couple_id: coupleDoc.id
          }, { merge: true });
        }
        return {
          id: coupleDoc.id,
          ...coupleData,
          userTwoId: userId,
          userTwoName: userName
        };
      }
    } catch (err) {
      console.warn('joinCoupleSpace Firestore search warning:', err.message);
    }
  }
  return await api.joinCouple({ couple_code: cleanCode });
}


export function subscribeToCouple(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    return onSnapshot(doc(db, 'couples', coupleId), (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });
  }

  let active = true;
  const fetchCouple = async () => {
    try {
      const data = await api.getCurrentCouple();
      if (active && data) callback(data);
    } catch (err) {
      console.warn('subscribeToCouple fetch error:', err);
    }
  };

  fetchCouple();

  const unsubWS = wsService.on('couple_update', (data) => {
    if (active && data) callback(data);
  });

  return () => {
    active = false;
    unsubWS && unsubWS();
  };
}

/* ==========================================================================
   MEMORIES
   ========================================================================== */

export function subscribeToMemories(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    try {
      const q = query(collection(db, 'couples', coupleId, 'memories'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        // Sort descending by date or createdAt
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
          const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        callback(list);
      }, (err) => {
        console.warn('Firestore subscribeToMemories snapshot error:', err);
      });
    } catch (e) {
      console.warn('Firestore subscribeToMemories query error:', e);
    }
  }

  let active = true;
  const fetchMemories = async () => {
    try {
      const list = await api.getMemories();
      if (active && list) callback(list);
    } catch (err) {
      console.warn('subscribeToMemories error:', err);
    }
  };

  fetchMemories();

  const unsubWS = wsService.on('message_saved_memory', () => {
    fetchMemories();
  });

  const handleCustomUpdate = () => fetchMemories();
  window.addEventListener('pulsepath_memories_updated', handleCustomUpdate);

  return () => {
    active = false;
    unsubWS && unsubWS();
    window.removeEventListener('pulsepath_memories_updated', handleCustomUpdate);
  };
}

export async function addMemory(coupleId, memoryData) {
  return addSharedMoment(coupleId, memoryData);
}

export async function addSharedMoment(coupleId, momentData) {
  const effectiveCoupleId = coupleId || 'demo_couple_123';
  const cleanData = { ...momentData };
  delete cleanData.id;
  const docPayload = {
    ...cleanData,
    createdAt: serverTimestamp()
  };

  let createdId = `moment_${Date.now()}`;

  if (isFirebaseConfigured && db && effectiveCoupleId) {
    try {
      // 1. Primary feed collection
      const memRef = await addDoc(collection(db, 'couples', effectiveCoupleId, 'memories'), docPayload);
      createdId = memRef.id;

      // 2. Parallel sync to shared_moments and posts subcollections
      try {
        await setDoc(doc(db, 'couples', effectiveCoupleId, 'shared_moments', createdId), docPayload, { merge: true });
      } catch {}
      try {
        await setDoc(doc(db, 'couples', effectiveCoupleId, 'posts', createdId), docPayload, { merge: true });
      } catch {}

      window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
      window.dispatchEvent(new CustomEvent('pulsepath_feed_updated'));
      return { id: createdId, ...cleanData, date: cleanData.date || new Date().toISOString().split('T')[0] };
    } catch (err) {
      console.warn('Firestore addSharedMoment error, falling back:', err);
    }
  }

  try {
    const result = await api.createMemory(momentData);
    window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
    window.dispatchEvent(new CustomEvent('pulsepath_feed_updated'));
    return result;
  } catch (backendErr) {
    window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
    window.dispatchEvent(new CustomEvent('pulsepath_feed_updated'));
    return { id: createdId, ...momentData };
  }
}

export async function updateMemory(coupleId, memoryId, updates) {
  const effectiveCoupleId = coupleId || 'demo_couple_123';
  if (isFirebaseConfigured && db && effectiveCoupleId) {
    try {
      await updateDoc(doc(db, 'couples', effectiveCoupleId, 'memories', memoryId), updates);
      window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
      return { id: memoryId, ...updates };
    } catch (err) {
      console.warn('Firestore updateDoc error:', err);
    }
  }

  const result = await api.updateMemory(memoryId, updates);
  window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
  return result;
}

/* ==========================================================================
   STORIES & MOMENTS (Firestore Sync)
   ========================================================================== */

export function subscribeToStories(coupleId, callback) {
  const effectiveCoupleId = coupleId || 'demo_couple_123';
  if (isFirebaseConfigured && db && effectiveCoupleId) {
    try {
      const colRef = collection(db, 'couples', effectiveCoupleId, 'stories');
      return onSnapshot(colRef, (snapshot) => {
        const storiesMap = {};
        snapshot.docs.forEach((d) => {
          storiesMap[d.id] = { id: d.id, ...d.data() };
        });
        if (Object.keys(storiesMap).length > 0) {
          callback(storiesMap);
        }
      }, (err) => {
        console.warn('subscribeToStories snapshot error:', err);
      });
    } catch (e) {
      console.warn('subscribeToStories init error:', e);
    }
  }
  return () => {};
}

export async function updateStory(coupleId, storyId, storyData) {
  const effectiveCoupleId = coupleId || 'demo_couple_123';
  if (isFirebaseConfigured && db && effectiveCoupleId && storyId) {
    try {
      const docRef = doc(db, 'couples', effectiveCoupleId, 'stories', storyId);
      await setDoc(docRef, {
        ...storyData,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      return { id: storyId, ...storyData };
    } catch (err) {
      console.warn('updateStory error:', err);
    }
  }
  return null;
}

export async function deleteMemory(coupleId, memoryId) {
  if (isFirebaseConfigured && db && coupleId) {
    await deleteDoc(doc(db, 'couples', coupleId, 'memories', memoryId));
    return { success: true };
  }

  const result = await api.deleteMemory(memoryId);
  window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
  return result;
}

/* ==========================================================================
   REAL-TIME PRIVATE COUPLE CHAT
   ========================================================================== */

export function subscribeToMessages(coupleId, callback) {
  const normalizeMsg = (m) => {
    const rawDate = m.createdAt || m.created_at || m.timestamp;
    const parsedDate = parseDate(rawDate);
    const createdAtIso = parsedDate ? parsedDate.toISOString() : new Date().toISOString();

    const rawDisplay = m.displayTime;
    const displayTime = (rawDisplay && rawDisplay !== 'Invalid Date' && !rawDisplay.includes('NaN'))
      ? rawDisplay
      : formatMessageTime(parsedDate || createdAtIso, '10:06 AM');

    return {
      ...m,
      senderId: m.senderId || m.sender_id,
      sender_id: m.sender_id || m.senderId,
      senderName: m.senderName || m.sender_name,
      sender_name: m.sender_name || m.senderName,
      coupleId: m.coupleId || m.couple_id,
      couple_id: m.couple_id || m.coupleId,
      replyToId: m.replyToId || m.reply_to_id,
      reply_to_id: m.reply_to_id || m.replyToId,
      createdAt: createdAtIso,
      created_at: createdAtIso,
      displayTime,
      seenAt: m.seenAt || m.seen_at,
      seen_at: m.seen_at || m.seenAt,
      isSavedAsMemory: Boolean(m.isSavedAsMemory || m.is_saved_as_memory),
      is_saved_as_memory: Boolean(m.is_saved_as_memory || m.isSavedAsMemory)
    };
  };

  let active = true;
  let cachedMessages = [];
  let unsubFirestore = null;

  if (isFirebaseConfigured && db && coupleId) {
    try {
      const messagesCol = collection(db, 'couples', coupleId, 'messages');
      unsubFirestore = onSnapshot(
        messagesCol,
        (snapshot) => {
          if (!active) return;
          const list = snapshot.docs.map(d => normalizeMsg({ id: d.id, ...d.data() })).filter(Boolean);
          list.sort((a, b) => {
            const tA = getMessageTimestamp(a);
            const tB = getMessageTimestamp(b);
            if (tA !== tB) return tA - tB;
            return String(a.id || '').localeCompare(String(b.id || ''));
          });
          if (list.length > 0) {
            cachedMessages = list;
            callback(list);
          }
        },
        (err) => {
          console.warn('Firestore subscribeToMessages listener notice (using REST/WebSocket):', err.message);
        }
      );
    } catch (e) {
      console.warn('Firestore onSnapshot init error:', e);
    }
  }

  const fetchMessages = async () => {
    try {
      const list = await api.getMessages();
      if (active && Array.isArray(list) && list.length > 0) {
        cachedMessages = list.map(normalizeMsg).filter(Boolean);
        cachedMessages.sort((a, b) => {
          const tA = getMessageTimestamp(a);
          const tB = getMessageTimestamp(b);
          if (tA !== tB) return tA - tB;
          return String(a.id || '').localeCompare(String(b.id || ''));
        });
        callback(cachedMessages);
      }
    } catch (err) {
      // Backend may be offline or in demo mode
    }
  };

  fetchMessages();

  const unsubNewMsg = wsService.on('new_message', (data) => {
    if (!active || !data?.message) return;
    const msg = normalizeMsg(data.message);
    if (!msg) return;
    const exists = cachedMessages.some(m => m.id === msg.id);
    if (!exists) {
      cachedMessages = [...cachedMessages, msg];
      cachedMessages.sort((a, b) => {
        const tA = getMessageTimestamp(a);
        const tB = getMessageTimestamp(b);
        if (tA !== tB) return tA - tB;
        return String(a.id || '').localeCompare(String(b.id || ''));
      });
      callback(cachedMessages);
    }
  });

  const unsubReaction = wsService.on('reaction_update', (data) => {
    if (!active) return;
    cachedMessages = cachedMessages.map(m => {
      if (m.id === data.message_id) {
        return { ...m, reactions: data.reactions };
      }
      return m;
    });
    callback(cachedMessages);
  });

  const unsubSeen = wsService.on('messages_seen', (data) => {
    if (!active) return;
    cachedMessages = cachedMessages.map(m => {
      if (!m.seenAt && !m.seen_at) {
        return { ...m, seenAt: data.seen_at, seen_at: data.seen_at };
      }
      return m;
    });
    callback(cachedMessages);
  });

  const unsubSavedMem = wsService.on('message_saved_memory', (data) => {
    if (!active) return;
    cachedMessages = cachedMessages.map(m => {
      if (m.id === data.message_id) {
        return { ...m, isSavedAsMemory: true, is_saved_as_memory: true };
      }
      return m;
    });
    callback(cachedMessages);
  });

  return () => {
    active = false;
    unsubFirestore && unsubFirestore();
    unsubNewMsg && unsubNewMsg();
    unsubReaction && unsubReaction();
    unsubSeen && unsubSeen();
    unsubSavedMem && unsubSavedMem();
  };
}

export async function sendMessage(coupleId, { senderId, senderName, content, replyToId = null }) {
  const nowIso = new Date().toISOString();
  let createdMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
    content,
    senderId,
    sender_id: senderId,
    senderName,
    sender_name: senderName,
    replyToId,
    reply_to_id: replyToId,
    reactions: {},
    isSavedAsMemory: false,
    seenAt: null,
    createdAt: nowIso,
    created_at: nowIso
  };

  // 1. Try Firestore if configured
  if (isFirebaseConfigured && db && coupleId) {
    try {
      const docRef = await addDoc(collection(db, 'couples', coupleId, 'messages'), {
        senderId,
        sender_id: senderId,
        senderName,
        sender_name: senderName,
        content,
        replyToId,
        reply_to_id: replyToId,
        reactions: {},
        isSavedAsMemory: false,
        seenAt: null,
        createdAt: serverTimestamp()
      });
      createdMsg.id = docRef.id;
      return createdMsg;
    } catch (fbErr) {
      console.warn('Firestore addDoc note (falling back to REST API/local):', fbErr.message);
    }
  }

  // 2. Fallback to backend REST API
  try {
    const res = await api.sendMessage({
      content,
      reply_to_id: replyToId
    });
    if (res && res.id) {
      return { ...createdMsg, ...res };
    }
  } catch (apiErr) {
    console.warn('Backend api.sendMessage note (retaining local state):', apiErr.message);
  }

  // Broadcast locally to other browser tabs (Eren <-> Mikasa cross-tab live sync)
  wsService.broadcastLocal({
    type: 'new_message',
    message: createdMsg
  });

  return createdMsg;
}

export async function toggleMessageReaction(coupleId, messageId, emoji, userId) {
  if (isFirebaseConfigured && db && coupleId && messageId) {
    try {
      const msgRef = doc(db, 'couples', coupleId, 'messages', messageId);
      const snap = await getDoc(msgRef);
      if (snap.exists()) {
        const currentReactions = snap.data().reactions || {};
        const userList = Array.isArray(currentReactions[emoji]) ? [...currentReactions[emoji]] : [];
        const index = userList.indexOf(userId);
        if (index >= 0) {
          userList.splice(index, 1);
        } else {
          userList.push(userId);
        }
        await updateDoc(msgRef, {
          [`reactions.${emoji}`]: userList
        });
        return { success: true };
      }
    } catch (err) {
      console.warn('toggleMessageReaction Firestore error:', err);
    }
  }

  return await api.toggleReaction(messageId, emoji);
}

export async function markMessagesAsSeen(coupleId, currentUserId) {
  if (isFirebaseConfigured && db && coupleId && currentUserId) {
    try {
      const q = query(
        collection(db, 'couples', coupleId, 'messages'),
        where('seenAt', '==', null)
      );
      const snap = await getDocs(q);
      const nowIso = new Date().toISOString();
      const updates = snap.docs
        .filter((d) => {
          const data = d.data();
          const sId = data.senderId || data.sender_id;
          return sId && String(sId) !== String(currentUserId);
        })
        .map((d) => updateDoc(d.ref, { seenAt: nowIso }));
      await Promise.all(updates);
    } catch (err) {
      // Non-critical background update
    }
    return;
  }

  return await api.markSeen();
}

export async function saveMessageAsMemory(coupleId, message, customTitle = '') {
  if (isFirebaseConfigured && db && coupleId && message) {
    const memRef = await addDoc(collection(db, 'couples', coupleId, 'memories'), {
      title: customTitle || `Message from ${message.senderName || message.sender_name || 'Partner'}`,
      description: message.content,
      date: message.createdAt || new Date().toISOString(),
      location: 'Private Chat',
      mood: 'Love',
      photos: [],
      isFavorite: true,
      fromMessageId: message.id,
      createdAt: serverTimestamp()
    });

    if (message.id && !String(message.id).startsWith('local_')) {
      try {
        await updateDoc(doc(db, 'couples', coupleId, 'messages', message.id), {
          isSavedAsMemory: true
        });
      } catch (err) {
        console.warn('saveMessageAsMemory message flag update error:', err);
      }
    }

    window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
    return { id: memRef.id, title: customTitle, message_id: message.id };
  }

  const result = await api.saveAsMemory(message.id, customTitle);
  window.dispatchEvent(new CustomEvent('pulsepath_memories_updated'));
  return result;
}


/* ==========================================================================
   LOVE THOUGHTS & LOVE LETTERS
   ========================================================================== */

export function subscribeToLoveThoughts(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    const q = query(collection(db, 'couples', coupleId, 'love_thoughts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    });
  }

  let active = true;
  const fetchThoughts = async () => {
    try {
      const list = await api.getThoughts();
      if (active && list) callback(list);
    } catch (err) {
      console.warn('subscribeToLoveThoughts error:', err);
    }
  };

  fetchThoughts();

  const handleUpdate = () => fetchThoughts();
  window.addEventListener('pulsepath_thoughts_updated', handleUpdate);

  return () => {
    active = false;
    window.removeEventListener('pulsepath_thoughts_updated', handleUpdate);
  };
}

export async function addLoveThought(coupleId, thoughtData) {
  if (isFirebaseConfigured && db && coupleId) {
    const docRef = await addDoc(collection(db, 'couples', coupleId, 'love_thoughts'), {
      ...thoughtData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...thoughtData };
  }

  const result = await api.createThought({
    content: thoughtData.content,
    visibility: thoughtData.visibility || 'shared'
  });
  window.dispatchEvent(new CustomEvent('pulsepath_thoughts_updated'));
  return result;
}

export async function deleteLoveThought(coupleId, thoughtId) {
  if (isFirebaseConfigured && db && coupleId) {
    await deleteDoc(doc(db, 'couples', coupleId, 'love_thoughts', thoughtId));
    return { success: true };
  }

  const result = await api.deleteThought(thoughtId);
  window.dispatchEvent(new CustomEvent('pulsepath_thoughts_updated'));
  return result;
}

export function subscribeToLoveLetters(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    const q = query(collection(db, 'couples', coupleId, 'love_letters'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    });
  }

  let active = true;
  const fetchLetters = async () => {
    try {
      const list = await api.getLetters();
      if (active && list) callback(list);
    } catch (err) {
      console.warn('subscribeToLoveLetters error:', err);
    }
  };

  fetchLetters();

  const handleUpdate = () => fetchLetters();
  window.addEventListener('pulsepath_letters_updated', handleUpdate);

  return () => {
    active = false;
    window.removeEventListener('pulsepath_letters_updated', handleUpdate);
  };
}

export async function addLoveLetter(coupleId, letterData) {
  if (isFirebaseConfigured && db && coupleId) {
    const docRef = await addDoc(collection(db, 'couples', coupleId, 'love_letters'), {
      ...letterData,
      openedAt: null,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...letterData };
  }

  const result = await api.createLetter({
    title: letterData.title,
    content: letterData.content,
    visibility: letterData.visibility || 'shared'
  });
  window.dispatchEvent(new CustomEvent('pulsepath_letters_updated'));
  return result;
}

export async function markLetterOpened(coupleId, letterId) {
  if (isFirebaseConfigured && db && coupleId) {
    await updateDoc(doc(db, 'couples', coupleId, 'love_letters', letterId), {
      openedAt: new Date().toISOString()
    });
    return { id: letterId, openedAt: new Date().toISOString() };
  }

  const result = await api.openLetter(letterId);
  window.dispatchEvent(new CustomEvent('pulsepath_letters_updated'));
  return result;
}

/* ==========================================================================
   SPECIAL DATES & COUNTDOWNS
   ========================================================================== */

export function subscribeToSpecialDates(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    return onSnapshot(collection(db, 'couples', coupleId, 'special_dates'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(list);
    });
  }

  let active = true;
  const fetchDates = async () => {
    try {
      const list = await api.getDates();
      if (active && list) callback(list);
    } catch (err) {
      console.warn('subscribeToSpecialDates error:', err);
    }
  };

  fetchDates();

  const handleUpdate = () => fetchDates();
  window.addEventListener('pulsepath_dates_updated', handleUpdate);

  return () => {
    active = false;
    window.removeEventListener('pulsepath_dates_updated', handleUpdate);
  };
}

export async function addSpecialDate(coupleId, dateData) {
  if (isFirebaseConfigured && db && coupleId) {
    const docRef = await addDoc(collection(db, 'couples', coupleId, 'special_dates'), {
      ...dateData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...dateData };
  }

  const result = await api.createDate({
    title: dateData.title,
    date: dateData.date,
    category: dateData.category || 'anniversary',
    description: dateData.description || '',
    reminder_enabled: dateData.reminderEnabled ?? true
  });
  window.dispatchEvent(new CustomEvent('pulsepath_dates_updated'));
  return result;
}

export async function deleteSpecialDate(coupleId, dateId) {
  if (isFirebaseConfigured && db && coupleId) {
    await deleteDoc(doc(db, 'couples', coupleId, 'special_dates', dateId));
    return { success: true };
  }

  const result = await api.deleteDate(dateId);
  window.dispatchEvent(new CustomEvent('pulsepath_dates_updated'));
  return result;
}

/* ==========================================================================
   MOODS & DAILY QUESTIONS & REMINDERS
   ========================================================================== */

export function subscribeToMoods(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    return onSnapshot(collection(db, 'couples', coupleId, 'moods'), (snapshot) => {
      const moodMap = {};
      snapshot.docs.forEach(d => {
        moodMap[d.id] = d.data();
      });
      callback(moodMap);
    });
  }

  let active = true;
  const fetchMoods = async () => {
    try {
      const moodMap = await api.getMoods();
      if (active && moodMap) callback(moodMap);
    } catch (err) {
      console.warn('subscribeToMoods error:', err);
    }
  };

  fetchMoods();

  const unsubWS = wsService.on('mood_update', () => {
    fetchMoods();
  });

  return () => {
    active = false;
    unsubWS && unsubWS();
  };
}

export async function setPartnerMood(coupleId, userId, mood, emoji, note = '') {
  if (isFirebaseConfigured && db && coupleId) {
    await setDoc(doc(db, 'couples', coupleId, 'moods', userId), {
      mood,
      emoji,
      note,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { [userId]: { mood, emoji, note } };
  }

  return await api.setMood({ mood, emoji, note });
}

export function subscribeToDailyQuestion(coupleId, callback) {
  if (isFirebaseConfigured && db && coupleId) {
    const todayStr = new Date().toISOString().split('T')[0];
    return onSnapshot(
      doc(db, 'couples', coupleId, 'daily_answers', todayStr),
      (snapshot) => {
        const defaultQ = "What is a small moment today that reminded you of us?";
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            question: data.question || defaultQ,
            answers: data.answers || {},
            date: todayStr
          });
        } else {
          callback({
            question: defaultQ,
            answers: {},
            date: todayStr
          });
        }
      },
      (err) => {
        console.warn('subscribeToDailyQuestion notice:', err.message);
      }
    );
  }

  let active = true;

  const fetchQuestion = async () => {
    try {
      const data = await api.getDailyQuestion();
      if (active && data) callback(data);
    } catch (err) {
      console.warn('subscribeToDailyQuestion error:', err);
    }
  };

  fetchQuestion();

  const handleUpdate = () => fetchQuestion();
  window.addEventListener('pulsepath_daily_updated', handleUpdate);

  return () => {
    active = false;
    window.removeEventListener('pulsepath_daily_updated', handleUpdate);
  };
}

export async function submitDailyAnswer(coupleId, userId, authorName, answerText) {
  if (isFirebaseConfigured && db && coupleId && userId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const docRef = doc(db, 'couples', coupleId, 'daily_answers', todayStr);
    await setDoc(docRef, {
      question: "What is a small moment today that reminded you of us?",
      [`answers.${userId}`]: {
        authorName: authorName || 'Partner',
        text: answerText,
        answeredAt: new Date().toISOString()
      }
    }, { merge: true });
    window.dispatchEvent(new CustomEvent('pulsepath_daily_updated'));
    return { success: true };
  }

  const result = await api.submitDailyAnswer(answerText);
  window.dispatchEvent(new CustomEvent('pulsepath_daily_updated'));
  return result;
}


export async function getReminders(userId) {
  try {
    return await api.getReminders();
  } catch {
    return null;
  }
}

export async function saveReminders(userId, reminders) {
  try {
    return await api.updateReminders(reminders);
  } catch (err) {
    console.warn('saveReminders error:', err);
  }
}

/* ==========================================================================
   USER CHAT THEME SETTINGS (Firestore + LocalStorage persistence)
   ========================================================================== */

export async function saveUserChatTheme(userId, themeId) {
  try {
    localStorage.setItem('pulsepath_chat_theme', themeId);
    if (userId) {
      localStorage.setItem(`pulsepath_chat_theme_${userId}`, themeId);
    }
    if (isFirebaseConfigured && db && userId) {
      await setDoc(doc(db, 'users', userId, 'settings', 'chatTheme'), {
        themeId,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('saveUserChatTheme error:', err);
  }
}

export async function getUserChatTheme(userId) {
  try {
    if (userId) {
      const userSpecificLocal = localStorage.getItem(`pulsepath_chat_theme_${userId}`);
      if (userSpecificLocal) return userSpecificLocal;
    }
    if (isFirebaseConfigured && db && userId) {
      const snap = await getDoc(doc(db, 'users', userId, 'settings', 'chatTheme'));
      if (snap.exists() && snap.data()?.themeId) {
        const themeId = snap.data().themeId;
        localStorage.setItem('pulsepath_chat_theme', themeId);
        if (userId) localStorage.setItem(`pulsepath_chat_theme_${userId}`, themeId);
        return themeId;
      }
    }
  } catch (err) {
    console.warn('getUserChatTheme error:', err);
  }
  return localStorage.getItem('pulsepath_chat_theme') || 'classic';
}

