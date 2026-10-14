/**
 * PulsePath Performance Utilities
 * High-frequency event throttling, debouncing, and RAF synchronization
 * for locked 120Hz/144Hz refresh rate fluidity and zero layout thrashing.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Throttle a function to run at most once per `wait` milliseconds.
 * Always guarantees the final invocation runs (trailing edge).
 */
export function throttle(func, wait = 100) {
  let inThrottle = false;
  let lastFn;
  let lastTime;

  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      lastTime = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFn);
      lastFn = setTimeout(() => {
        if (Date.now() - lastTime >= wait) {
          func.apply(context, args);
          lastTime = Date.now();
        }
      }, Math.max(wait - (Date.now() - lastTime), 0));
    }
  };
}

/**
 * Debounce a function to execute only after `delay` milliseconds of silence.
 */
export function debounce(func, delay = 200) {
  let timeoutId;
  return function debounced(...args) {
    const context = this;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

/**
 * RAF-Throttle: Locks callback strictly to the browser's display refresh rate (60Hz / 120Hz / 144Hz).
 * Perfect for resize, scroll, and pointermove listeners without layout thrashing.
 */
export function rafThrottle(callback) {
  let requestId = null;
  let lastArgs = null;

  const throttled = (...args) => {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        requestId = null;
        callback(...lastArgs);
      });
    }
  };

  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId);
      requestId = null;
    }
  };

  return throttled;
}

/**
 * React hook to debounce any rapidly changing value (e.g. search inputs).
 */
export function useDebounce(value, delay = 200) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
