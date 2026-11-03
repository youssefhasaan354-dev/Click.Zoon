import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

/**
 * Robust scroll reveal hook using a callback ref.
 * - Handles elements rendered asynchronously (e.g. after DB data loads).
 * - Safe for SSR and users requesting reduced motion.
 * - Supports threshold, rootMargin, once, and delay options.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options: UseRevealOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    once = true,
    delay = 0,
  } = options;

  const [revealed, setRevealed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    if (!('IntersectionObserver' in window)) return true;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  });

  const nodeRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  const ref = useCallback(
    (node: T | null) => {
      nodeRef.current = node;

      if (!node) {
        cleanup();
        return;
      }

      if (revealed && once) return;

      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        setRevealed(true);
        return;
      }

      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setRevealed(true);
          return;
        }
      } catch {
        // ignore
      }

      cleanup();

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (delay > 0) {
                delayTimerRef.current = setTimeout(() => {
                  setRevealed(true);
                }, delay);
              } else {
                setRevealed(true);
              }

              if (once) {
                observer.unobserve(entry.target);
                cleanup();
              }
            } else if (!once) {
              setRevealed(false);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold, rootMargin, once, delay, revealed, cleanup]
  );

  // Maintain .current on the ref function for backwards compatibility with any ref.current checks
  Object.defineProperty(ref, 'current', {
    get: () => nodeRef.current,
    set: (val: T | null) => {
      nodeRef.current = val;
    },
    configurable: true,
  });

  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return {
    ref: ref as unknown as React.RefCallback<T> & { current: T | null },
    revealed,
  };
}
