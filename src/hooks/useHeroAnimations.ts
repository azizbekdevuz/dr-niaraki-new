import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { ANIMATION_DURATION, ANIMATION_EASE, ANIMATION_DELAYS } from '@/config/constants';
import { MOTION_PRESETS } from '@/lib/motion';

export const useHeroAnimations = () => {
  const router = useRouter();

  // Optimized animation variants using constants
  const heroAnimations = useMemo(() => ({
    container: {
      ...MOTION_PRESETS.fadeIn,
      transition: { duration: ANIMATION_DURATION.NORMAL, ease: ANIMATION_EASE.EASE_OUT },
    },
    image: {
      ...MOTION_PRESETS.scaleIn,
      transition: { 
        delay: ANIMATION_DELAYS.MEDIUM, 
        duration: ANIMATION_DURATION.SLOW, 
        ease: ANIMATION_EASE.BACK_OUT 
      },
    },
    content: {
      ...MOTION_PRESETS.slideUp,
      transition: { 
        delay: ANIMATION_DELAYS.LONG, 
        duration: ANIMATION_DURATION.SLOW, 
        ease: ANIMATION_EASE.EASE_OUT 
      },
    },
    social: {
      ...MOTION_PRESETS.stagger,
      transition: { 
        delay: ANIMATION_DELAYS.VERY_LONG, 
        duration: ANIMATION_DURATION.NORMAL, 
        ease: ANIMATION_EASE.EASE_OUT 
      },
    },
  }), []);

  // Button animation variants
  const buttonAnimations = useMemo(() => ({
    hover: {
      boxShadow: "0 0 30px rgba(99, 179, 237, 0.6)",
      y: -2,
    },
    tap: { 
      scale: 0.98 
    },
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 17 
    },
  }), []);

  // Social link animations
  const socialAnimations = useMemo(() => ({
    hover: (isMobile: boolean) => ({ 
      y: -3,
      rotate: isMobile ? 0 : 5,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }),
    tap: { scale: 0.95 },
  }), []);

  // Card animations for research section - FIXED: Separated props from helper function
  const cardAnimationProps = useMemo(() => ({
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
  }), []);

  // Separate helper function for getting card transition
  const getCardTransition = useCallback((index: number) => ({ 
    duration: ANIMATION_DURATION.NORMAL,
    delay: index * ANIMATION_DELAYS.SHORT,
    ease: ANIMATION_EASE.EASE_OUT
  }), []);

  // Research section heading animation
  const headingAnimation = useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: ANIMATION_DURATION.SLOW, ease: ANIMATION_EASE.EASE_OUT },
  }), []);

  // Navigation handlers
  const handleExploreClick = useCallback(() => {
    router.push("/research");
  }, [router]);

  return {
    heroAnimations,
    buttonAnimations,
    socialAnimations,
    cardAnimationProps,
    getCardTransition,
    headingAnimation,
    handleExploreClick,
  };
}; 