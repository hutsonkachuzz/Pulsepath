/**
 * iOS-Grade Motion & Physics Processing Engine for PulsePath
 * 
 * Configured to match Apple's iOS UIKit/SwiftUI spring animation curve specifications:
 * - Ultra-responsive gesture tracking
 * - Realistic mass, stiffness, and damping ratios
 * - GPU compositing layer optimization
 */

// Apple iOS standard spring curve presets
export const iosSpring = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
  mass: 0.8,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// Snappy iOS toggle / haptic switch physics
export const iosSnappy = {
  type: 'spring',
  stiffness: 500,
  damping: 36,
  mass: 0.5,
  restDelta: 0.001,
};

// Bouncy romantic reaction / heart pulse physics
export const iosBouncy = {
  type: 'spring',
  stiffness: 380,
  damping: 20,
  mass: 0.9,
};

// Smooth iOS page & sheet slide-over transitions
export const iosSheet = {
  type: 'spring',
  damping: 34,
  stiffness: 320,
  mass: 0.85,
};

// Subtle iOS tap press deformation (scale down slightly on active press)
export const iosTapActive = {
  scale: 0.96,
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
};

export const iosTapCard = {
  scale: 0.985,
  transition: {
    type: 'spring',
    stiffness: 450,
    damping: 28,
  },
};

// Hardware Acceleration GPU layer helper
export const gpuLayer = {
  transform: 'translate3d(0, 0, 0)',
  WebkitBackfaceVisibility: 'hidden',
  backfaceVisibility: 'hidden',
  perspective: 1000,
};

// Simulates tactile iOS haptic feedback when Web Haptics API is available
export function triggerHaptic(type = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(10);
      } else if (type === 'medium') {
        navigator.vibrate(18);
      } else if (type === 'success') {
        navigator.vibrate([12, 40, 15]);
      } else if (type === 'error') {
        navigator.vibrate([20, 50, 20]);
      }
    } catch {
      // Ignore vibration errors if blocked by browser policy
    }
  }
}
