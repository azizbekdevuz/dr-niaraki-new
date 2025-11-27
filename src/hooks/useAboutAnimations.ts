import { useCallback, useMemo } from 'react';

import { ANIMATION_DURATION, ANIMATION_EASE, ANIMATION_DELAYS } from '@/config/constants';
import { MOTION_PRESETS } from '@/lib/motion';

export const useAboutAnimations = () => {
  // Main section animations
  const aboutAnimations = useMemo(() => ({
    container: {
      ...MOTION_PRESETS.fadeIn,
      transition: { duration: ANIMATION_DURATION.SLOW, ease: ANIMATION_EASE.EASE_OUT }
    },
    section: {
      ...MOTION_PRESETS.slideUp,
      transition: { duration: ANIMATION_DURATION.SLOW, ease: ANIMATION_EASE.EASE_OUT }
    },
  }), []);

  // Card animations with stagger support - FIXED: Separated props from helper function
  const cardAnimationProps = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }), []);

  // Separate helper function for getting transition
  const getCardTransition = useCallback((index: number) => ({
    delay: index * ANIMATION_DELAYS.SHORT,
    duration: ANIMATION_DURATION.NORMAL,
    ease: ANIMATION_EASE.EASE_OUT,
  }), []);

  // Stats animation with spring effect
  const statAnimations = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      duration: ANIMATION_DURATION.SLOW,
    }
  }), []);

  // Content expansion animations
  const expansionAnimations = useMemo(() => ({
    initial: { height: 0, opacity: 0 },
    animate: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: ANIMATION_DURATION.FAST },
        opacity: { duration: ANIMATION_DURATION.FAST, delay: ANIMATION_DELAYS.SHORT }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: {
        opacity: { duration: ANIMATION_DURATION.FAST },
        height: { duration: ANIMATION_DURATION.FAST, delay: ANIMATION_DELAYS.SHORT }
      }
    }
  }), []);

  // Card hover effects
  const cardHoverAnimations = useMemo(() => ({
    hover: {
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }
    },
    tap: { 
      scale: 0.98 
    }
  }), []);

  // Section reveal animations
  const sectionReveal = useMemo(() => ({
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { 
      duration: ANIMATION_DURATION.SLOW, 
      ease: ANIMATION_EASE.EASE_OUT 
    },
  }), []);

  // Timeline item animations
  const timelineAnimations = useMemo(() => ({
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    getTransition: (index: number) => ({
      delay: index * ANIMATION_DELAYS.SHORT,
      duration: ANIMATION_DURATION.NORMAL,
      ease: ANIMATION_EASE.EASE_OUT,
    }),
  }), []);

  return {
    aboutAnimations,
    cardAnimationProps,
    getCardTransition,
    statAnimations,
    expansionAnimations,
    cardHoverAnimations,
    sectionReveal,
    timelineAnimations,
  };
}; 