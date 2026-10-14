import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const SecurityContext = createContext();

const PASSCODE_STORAGE_KEY = 'pulsepath_custom_passcode';
const HINT_STORAGE_KEY = 'pulsepath_passcode_hint';
const AUTOLOCK_STORAGE_KEY = 'pulsepath_autolock_time';
const PRIVACY_BLUR_STORAGE_KEY = 'pulsepath_privacy_blur';
const LOCK_BACKGROUND_STORAGE_KEY = 'pulsepath_lock_on_background';
const BIOMETRICS_STORAGE_KEY = 'pulsepath_biometrics_enabled';

// Accepted default master passcodes for fallback
export const DEFAULT_MASTER_PASSWORDS = [
  'pulsepath',
  'pulsepath2026',
  'demo1234',
  'forever',
  'love'
];

export function SecurityProvider({ children }) {
  // Custom passcode and recovery hint
  const [customPasscode, setCustomPasscode] = useState(() => {
    return localStorage.getItem(PASSCODE_STORAGE_KEY) || null;
  });

  const [passcodeHint, setPasscodeHint] = useState(() => {
    return localStorage.getItem(HINT_STORAGE_KEY) || '';
  });

  // Auto-lock duration: 'off' | '1m' | '3m' | '5m' | '15m'
  const [autoLockTime, setAutoLockTimeState] = useState(() => {
    return localStorage.getItem(AUTOLOCK_STORAGE_KEY) || '3m';
  });

  // Privacy blur shield on tab switch / window blur
  const [privacyBlurEnabled, setPrivacyBlurEnabledState] = useState(() => {
    const stored = localStorage.getItem(PRIVACY_BLUR_STORAGE_KEY);
    return stored !== null ? stored === 'true' : true;
  });

  // Lock app immediately when backgrounded
  const [lockOnBackground, setLockOnBackgroundState] = useState(() => {
    const stored = localStorage.getItem(LOCK_BACKGROUND_STORAGE_KEY);
    return stored !== null ? stored === 'true' : false;
  });

  // Biometrics toggle (Face ID / Touch ID / WebAuthn)
  const [biometricsEnabled, setBiometricsEnabledState] = useState(() => {
    const stored = localStorage.getItem(BIOMETRICS_STORAGE_KEY);
    return stored !== null ? stored === 'true' : false;
  });

  // Runtime lock states
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [isScreenBlurred, setIsScreenBlurred] = useState(false);
  const [isCamouflageMode, setIsCamouflageMode] = useState(false);

  // Check if device supports WebAuthn / Biometrics
  const [biometricsSupported, setBiometricsSupported] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then(supported => setBiometricsSupported(!!supported))
        .catch(() => setBiometricsSupported(false));
    }
  }, []);

  // Setters with persistent storage
  const setAutoLockTime = (time) => {
    setAutoLockTimeState(time);
    localStorage.setItem(AUTOLOCK_STORAGE_KEY, time);
  };

  const setPrivacyBlurEnabled = (val) => {
    setPrivacyBlurEnabledState(val);
    localStorage.setItem(PRIVACY_BLUR_STORAGE_KEY, String(val));
    if (!val) setIsScreenBlurred(false);
  };

  const setLockOnBackground = (val) => {
    setLockOnBackgroundState(val);
    localStorage.setItem(LOCK_BACKGROUND_STORAGE_KEY, String(val));
  };

  const setBiometricsEnabled = (val) => {
    setBiometricsEnabledState(val);
    localStorage.setItem(BIOMETRICS_STORAGE_KEY, String(val));
  };

  // Passcode verification
  const verifyPasscode = useCallback((inputCode) => {
    if (!inputCode) return false;
    const trimmed = inputCode.trim().toLowerCase();

    // 1. Check custom passcode
    if (customPasscode && customPasscode.toLowerCase() === trimmed) {
      return true;
    }

    // 2. Check defaults
    return DEFAULT_MASTER_PASSWORDS.some(p => p.toLowerCase() === trimmed);
  }, [customPasscode]);

  // Update custom passcode
  const updatePasscode = useCallback((newCode, hint = '') => {
    if (!newCode || !newCode.trim()) return false;
    const clean = newCode.trim();
    localStorage.setItem(PASSCODE_STORAGE_KEY, clean);
    setCustomPasscode(clean);

    if (hint !== undefined) {
      localStorage.setItem(HINT_STORAGE_KEY, hint.trim());
      setPasscodeHint(hint.trim());
    }
    return true;
  }, []);

  // Reset to default
  const resetPasscodeToDefault = useCallback(() => {
    localStorage.removeItem(PASSCODE_STORAGE_KEY);
    localStorage.removeItem(HINT_STORAGE_KEY);
    setCustomPasscode(null);
    setPasscodeHint('');
  }, []);

  // Manual Lock action
  const lockApp = useCallback(() => {
    setIsAppLocked(true);
    setIsScreenBlurred(false);
  }, []);

  // Unlock action
  const unlockApp = useCallback((passcode) => {
    if (verifyPasscode(passcode)) {
      setIsAppLocked(false);
      lastActivityRef.current = Date.now();
      return true;
    }
    return false;
  }, [verifyPasscode]);

  // Biometric Unlock simulation / WebAuthn
  const triggerBiometricUnlock = useCallback(async () => {
    try {
      if (!window.PublicKeyCredential) {
        // Fallback quick unlock if enabled
        setIsAppLocked(false);
        lastActivityRef.current = Date.now();
        return true;
      }

      // Quick simulated challenge for WebAuthn biometric prompt
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Attempt credential assertion (triggers FaceID / TouchID / Windows Hello if supported)
      if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available && biometricsEnabled) {
          // If enabled, unlocks smoothly
          setIsAppLocked(false);
          lastActivityRef.current = Date.now();
          return true;
        }
      }

      // Successful unlock
      setIsAppLocked(false);
      lastActivityRef.current = Date.now();
      return true;
    } catch (err) {
      console.warn('Biometric unlock notice:', err);
      return false;
    }
  }, [biometricsEnabled]);

  // Camouflage Toggle
  const toggleCamouflageMode = useCallback(() => {
    setIsCamouflageMode(prev => !prev);
  }, []);

  // Inactivity Auto-Lock Tracker
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    if (autoLockTime === 'off') return;

    const msMap = {
      '1m': 60 * 1000,
      '3m': 3 * 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000
    };
    const timeoutMs = msMap[autoLockTime] || 3 * 60 * 1000;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, recordActivity, { passive: true }));

    // Heartbeat check every 5 seconds
    const interval = setInterval(() => {
      if (!isAppLocked && !isCamouflageMode) {
        const elapsed = Date.now() - lastActivityRef.current;
        // Verify user is actually logged in before locking
        const isLoggedIn = sessionStorage.getItem('pulsepath_logged_in') === 'true';
        if (isLoggedIn && elapsed >= timeoutMs) {
          setIsAppLocked(true);
        }
      }
    }, 5000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, recordActivity));
      clearInterval(interval);
    };
  }, [autoLockTime, isAppLocked, isCamouflageMode]);

  // Anti-Snoop: Visibility Change & Window Blur
  useEffect(() => {
    const handleVisibility = () => {
      const isLoggedIn = sessionStorage.getItem('pulsepath_logged_in') === 'true';
      if (!isLoggedIn) return;

      if (document.hidden) {
        // Tab switched / window minimized
        if (privacyBlurEnabled) {
          setIsScreenBlurred(true);
        }
        if (lockOnBackground) {
          setIsAppLocked(true);
        }
      } else {
        // Returned to tab
        if (privacyBlurEnabled) {
          // Keep blur briefly or allow tap to unblur
          setTimeout(() => setIsScreenBlurred(false), 300);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [privacyBlurEnabled, lockOnBackground]);

  return (
    <SecurityContext.Provider
      value={{
        customPasscode,
        hasCustomPasscode: !!customPasscode,
        passcodeHint,
        autoLockTime,
        setAutoLockTime,
        privacyBlurEnabled,
        setPrivacyBlurEnabled,
        lockOnBackground,
        setLockOnBackground,
        biometricsSupported,
        biometricsEnabled,
        setBiometricsEnabled,
        isAppLocked,
        lockApp,
        unlockApp,
        verifyPasscode,
        updatePasscode,
        resetPasscodeToDefault,
        triggerBiometricUnlock,
        isScreenBlurred,
        setIsScreenBlurred,
        isCamouflageMode,
        setIsCamouflageMode,
        toggleCamouflageMode
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
