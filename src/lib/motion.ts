import type { ReactNode } from 'react';
import { lazy } from 'react';
import React from 'react';

// Lazy load framer-motion components to reduce initial bundle size
export const LazyMotion = lazy(() => import('framer-motion').then(mod => ({ default: mod.LazyMotion })));
export const MotionDiv = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.div })));
export const MotionButton = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.button })));
export const MotionA = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.a })));
export const MotionH2 = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.h2 })));
export const MotionArticle = lazy(() => import('framer-motion').then(mod => ({ default: mod.motion.article })));

interface MotionFallbackProps {
  children?: ReactNode;
  [key: string]: unknown;
}

// Fallback component for motion elements
export const MotionFallback = ({ children, ...props }: MotionFallbackProps) => {
  return React.createElement('div', props, children);
};

// Reduced feature set for better performance
export const loadFeatures = () => import('framer-motion').then(mod => mod.domMax);

// Animation presets to reduce redundancy
export const MOTION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, ease: "easeOut" }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "backOut" }
  },
  stagger: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  }
} as const; 