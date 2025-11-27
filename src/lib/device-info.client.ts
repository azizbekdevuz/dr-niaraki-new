import type { DeviceInfo } from './device-info.server';

// Performance-optimized breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1920
} as const;

// Client-side viewport detection
export function getViewportSize() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// Check if device can handle advanced animations
export function canHandleAdvancedAnimations(deviceInfo?: DeviceInfo): boolean {
  // If on mobile, disable advanced animations
  if (deviceInfo?.isMobile) {return false;}
  
  // Check for reduced motion preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {return false;}
  }
  
  // Check device capabilities
  if (typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator) {
    // Disable advanced animations on low-end devices
    return (navigator.hardwareConcurrency || 0) >= 4;
  }
  
  return true;
}