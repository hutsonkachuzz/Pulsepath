import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../services/api';
import { wsService } from '../services/websocket';
import { auth, db, isFirebaseConfigured } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();
const LOCAL_USER_KEY = 'pulsepath_local_user';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from Firebase Auth or persistent token / localStorage
  useEffect(() => {
    let mounted = true;
    let unsubUserDoc = null;

    // Helper to attach real-time Firestore listener to user doc
    const listenToUserDoc = (userId) => {
      if (!isFirebaseConfigured || !db || !userId) return;
      if (unsubUserDoc) unsubUserDoc();
      try {
        unsubUserDoc = onSnapshot(doc(db, 'users', userId), (snap) => {
          if (!mounted) return;
          if (snap.exists()) {
            const data = snap.data();
            setCurrentUser((prev) => {
              const updated = { ...(prev || {}), id: userId, uid: userId, ...data };
              localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
              return updated;
            });
            setLoading(false);
          }
        }, (err) => {
          console.warn('User doc snapshot notice:', err.message);
        });
      } catch (err) {
        console.warn('User doc listener notice:', err.message);
      }
    };

    // 1. Check local cached user first for instant rendering
    const cachedUserJson = localStorage.getItem(LOCAL_USER_KEY);
    if (cachedUserJson) {
      try {
        const parsed = JSON.parse(cachedUserJson);
        if (parsed && mounted) {
          sessionStorage.setItem('pulsepath_logged_in', 'true');
          setCurrentUser(parsed);
          setLoading(false);
          const currentId = parsed.id || parsed.uid || 'user_eren_101';
          listenToUserDoc(currentId);
        }
      } catch {}
    }

    // 2. Listen to Firebase Auth state
    let unsubAuth = null;
    if (isFirebaseConfigured && auth) {
      unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (!mounted) return;
        if (fbUser) {
          listenToUserDoc(fbUser.uid);
        }
      });
    }

    // 3. Fallback verification against REST API if token exists
    async function initRestAuth() {
      const token = getStoredToken();
      if (!token) {
        if (mounted && !cachedUserJson) setLoading(false);
        return;
      }

      try {
        const user = await api.getMe();
        if (mounted) {
          setCurrentUser((prev) => {
            const merged = { ...(prev || {}), ...user };
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
            return merged;
          });
          listenToUserDoc(user.id);
        }
      } catch (err) {
        if (!cachedUserJson && mounted) {
          setStoredToken(null);
          setCurrentUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initRestAuth();

    // 4. Listen for immediate local avatar update events
    const handleAvatarEvent = (e) => {
      const newAvatar = e.detail?.avatar;
      if (newAvatar && mounted) {
        setCurrentUser((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, avatar: newAvatar };
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    };
    window.addEventListener('pulsepath_avatar_updated', handleAvatarEvent);

    const handleUnauthorized = () => {
      wsService.disconnect();
      localStorage.removeItem(LOCAL_USER_KEY);
      setCurrentUser(null);
    };

    window.addEventListener('pulsepath_unauthorized', handleUnauthorized);
    return () => {
      mounted = false;
      unsubAuth && unsubAuth();
      unsubUserDoc && unsubUserDoc();
      window.removeEventListener('pulsepath_avatar_updated', handleAvatarEvent);
      window.removeEventListener('pulsepath_unauthorized', handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    // 1. Try Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        let userData = {
          id: cred.user.uid,
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || email.split('@')[0]
        };

        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', cred.user.uid));
            if (userSnap.exists()) {
              userData = { ...userData, ...userSnap.data() };
            }
          } catch {}
        }

        sessionStorage.setItem('pulsepath_logged_in', 'true');
        setStoredToken(`fb_${cred.user.uid}`);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } catch (fbErr) {
        console.warn('Firebase signIn notice:', fbErr.message);
        // If Firebase Auth provider is not enabled, try REST API fallback
      }
    }

    // 2. REST API fallback
    const data = await api.login({ email, password });
    sessionStorage.setItem('pulsepath_logged_in', 'true');
    setStoredToken(data.access_token);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async (email, password, name, dob) => {
    // 1. Try Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
          id: cred.user.uid,
          uid: cred.user.uid,
          email,
          name,
          dob: dob || '',
          couple_id: null,
          createdAt: new Date().toISOString()
        };

        if (db) {
          try {
            await setDoc(doc(db, 'users', cred.user.uid), {
              ...userData,
              createdAt: serverTimestamp()
            }, { merge: true });
          } catch {}
        }

        sessionStorage.setItem('pulsepath_logged_in', 'true');
        setStoredToken(`fb_${cred.user.uid}`);
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userData));
        setCurrentUser(userData);
        return userData;
      } catch (fbErr) {
        console.warn('Firebase signup notice:', fbErr.message);
      }
    }

    // 2. REST API fallback
    const data = await api.register({ email, password, name, dob });
    sessionStorage.setItem('pulsepath_logged_in', 'true');
    setStoredToken(data.access_token);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
    setCurrentUser(data.user);
    return data.user;
  }, []);

  const loginAsDemo = useCallback(async (role = 'eren') => {
    const isEren = role === 'eren' || role === 'leo';
    const demoId = isEren ? 'user_eren_101' : 'user_mikasa_202';

    // 1. Check if user already exists in Firestore to PRESERVE custom avatar
    let existingAvatar = null;
    let existingData = {};
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'users', demoId));
        if (snap.exists()) {
          existingData = snap.data();
          if (existingData.avatar) {
            existingAvatar = existingData.avatar;
          }
        }
      } catch (err) {
        console.warn('Check existing avatar notice:', err.message);
      }
    }

    const defaultAvatar = isEren
      ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
      : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

    const demoUser = {
      id: demoId,
      uid: demoId,
      name: isEren ? 'Eren' : 'Mikasa',
      email: isEren ? 'eren@pulsepath.love' : 'mikasa@pulsepath.love',
      nickname: isEren ? 'Eren ❤️' : 'Mikasa ❤️',
      couple_id: 'demo_couple_123',
      ...existingData,
      avatar: existingAvatar || existingData.avatar || defaultAvatar
    };

    // Ensure user profile in Firestore without wiping custom avatar
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'users', demoUser.id), {
          ...demoUser,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Demo user Firestore registration notice:', err.message);
      }
    }

    // Try signing in anonymously to Firebase Auth if enabled
    if (isFirebaseConfigured && auth) {
      try {
        await signInAnonymously(auth);
      } catch {}
    }

    let activeUser = demoUser;
    try {
      const data = await api.demoLogin(isEren ? 'eren' : 'mikasa');
      if (data?.access_token) {
        setStoredToken(data.access_token);
        if (data.user) {
          const backendAvatar = data.user.avatar;
          activeUser = {
            ...demoUser,
            ...data.user,
            avatar: (backendAvatar && backendAvatar.startsWith('data:')) ? backendAvatar : (existingAvatar || data.user.avatar || demoUser.avatar)
          };
        }
      } else {
        setStoredToken(`demo_token_${role}_${Date.now()}`);
      }
    } catch (err) {
      console.warn('Backend demo login API note:', err.message);
      setStoredToken(`demo_token_${role}_${Date.now()}`);
    }

    sessionStorage.setItem('pulsepath_logged_in', 'true');
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(activeUser));
    setCurrentUser(activeUser);
    return activeUser;
  }, []);

  const logout = useCallback(async () => {
    wsService.disconnect();
    sessionStorage.removeItem('pulsepath_logged_in');
    localStorage.removeItem(LOCAL_USER_KEY);
    setStoredToken(null);
    setCurrentUser(null);
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch {}
    }
  }, []);

  const updateProfileData = useCallback(async (updates) => {
    const currentId = currentUser?.id || currentUser?.uid || 'user_eren_101';
    const isEren = (currentUser?.name || '').toLowerCase().includes('eren') || currentId === 'user_eren_101';
    const coupleId = currentUser?.couple_id || 'demo_couple_123';

    // 1. Sync directly to Firestore users collection
    if (isFirebaseConfigured && db && currentId) {
      try {
        await setDoc(doc(db, 'users', currentId), updates, { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc user profile error:', err);
      }

      // If updating avatar and user is Eren, also immediately sync couples/demo_couple_123/stories/eren_updates!
      if (updates.avatar && isEren) {
        try {
          await setDoc(doc(db, 'couples', coupleId, 'stories', 'eren_updates'), {
            avatar: updates.avatar,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Firestore setDoc story avatar error:', err);
        }
      }
    }

    // 2. Broadcast local avatar update event for immediate zero-delay reactive update across all UI
    if (updates.avatar) {
      window.dispatchEvent(new CustomEvent('pulsepath_avatar_updated', {
        detail: { avatar: updates.avatar }
      }));
    }

    // 3. Update REST API backend
    try {
      const updatedUser = await api.updateProfile(updates);
      const merged = { ...currentUser, ...updatedUser, ...updates };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
      setCurrentUser(merged);
      return merged;
    } catch {
      const merged = { ...currentUser, ...updates };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(merged));
      setCurrentUser(merged);
      return merged;
    }
  }, [currentUser]);

  const isDemo = useMemo(
    () => Boolean(
      currentUser?.email?.includes('pulsepath.love') ||
      currentUser?.email?.includes('pulsepath.com') ||
      currentUser?.id?.startsWith('user_') ||
      currentUser?.couple_id === 'demo_couple_123'
    ),
    [currentUser?.email, currentUser?.id, currentUser?.couple_id]
  );


  const contextValue = useMemo(() => ({
    currentUser,
    loading,
    login,
    signup,
    loginAsDemo,
    logout,
    updateProfile: updateProfileData,
    isDemo
  }), [
    currentUser,
    loading,
    login,
    signup,
    loginAsDemo,
    logout,
    updateProfileData,
    isDemo
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
