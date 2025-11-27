'use client';

import React, { Suspense, useEffect, useState, useRef } from 'react';

import { useResourceLoader } from '@/contexts/LoadingContext';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  resourceId: string;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  onLoad?: () => void;
  className?: string;
}

const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  resourceId,
  fallback = null,
  priority = 'medium',
  onLoad,
  className = '',
}) => {
  const { markLoaded, isLoaded } = useResourceLoader(resourceId);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(priority === 'high'); // High priority loads immediately

  // Intersection Observer for lazy loading non-critical components
  useEffect(() => {
    if (priority === 'high' || isLoaded) {
      setIsVisible(true);
      return;
    }

    if (!elementRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: priority === 'medium' ? '100px' : '50px', // Load earlier for medium priority
        threshold: 0.1,
      }
    );

    observerRef.current.observe(elementRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isLoaded]);

  // Mark component as loaded when it's rendered
  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Small delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        markLoaded();
        onLoad?.();
      }, 100);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, isLoaded, markLoaded, onLoad]);

  // If already loaded and cached, show immediately
  if (isLoaded) {
    return <div className={className}>{children}</div>;
  }

  // If not visible yet (for lazy loading), show placeholder
  if (!isVisible) {
    return (
      <div 
        ref={elementRef} 
        className={`${className} min-h-[200px] flex items-center justify-center`}
        style={{ minHeight: priority === 'high' ? '0' : '200px' }}
      >
        {fallback}
      </div>
    );
  }

  // Render with Suspense for proper loading handling
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

export default React.memo(LazyComponentWrapper); 