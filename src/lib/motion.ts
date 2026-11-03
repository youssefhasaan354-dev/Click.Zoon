import { useEffect, useState, useRef, useCallback } from 'react';
import type { Variants, Transition } from 'framer-motion';

/**
 * Click Zoon Premium Motion System
 * Language of motion: smooth, subtle, dark-navy + gold luxury feel
 * strictly animates only transform & opacity.
 */

export const EASE_PREMIUM: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

export const DURATIONS = {
  instant: 0.15,
  fast: 0.25,
  base: 0.45,
  slow: 0.75,
  ambient: 4.0,
} as const;

export const premiumTransition: Transition = {
  duration: DURATIONS.base,
  ease: EASE_PREMIUM,
};

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.fast,
      ease: EASE_PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATIONS.instant,
      ease: 'easeOut',
    },
  },
};

export const reducedMotionVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const fadeUpItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATIONS.base,
      ease: EASE_PREMIUM,
    },
  },
};

export const scaleInItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATIONS.base,
      ease: EASE_PREMIUM,
    },
  },
};

/**
 * Hook for 3D tilt on desktop (max 6deg, disabled on touch and reduced-motion)
 */
export function use3DTilt<T extends HTMLElement = HTMLDivElement>(maxTilt = 6) {
  const ref = useRef<T | null>(null);
  const [style, setStyle] = useState<{ transform: string; transition: string }>({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 0.4s ease-out',
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.matchMedia('(pointer: coarse)').matches) return; // Touch screens

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;

      const rotateY = xPct * maxTilt;
      const rotateX = -yPct * maxTilt;

      setStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(4px)`,
        transition: 'transform 0.1s ease-out',
      });
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)',
      transition: 'transform 0.4s ease-out',
    });
  }, []);

  return { ref, style, onMouseMove, onMouseLeave };
}

/**
 * Hook for spotlight cursor glow on cards
 */
export function useSpotlightGlow<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  }, []);

  const onMouseLeave = useCallback(() => {
    setCoords((prev) => ({ ...prev, opacity: 0 }));
  }, []);

  const spotlightStyle = {
    background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(212, 175, 55, 0.12), transparent 70%)`,
    opacity: coords.opacity,
    transition: 'opacity 0.3s ease',
  };

  return { ref, spotlightStyle, onMouseMove, onMouseLeave };
}
