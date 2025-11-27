'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

interface LoadingState {
  isInitialLoading: boolean;
  isComponentLoading: boolean;
  progress: number;
  loadedResources: Set<string>;
  cacheExpiryTime: number;
  message: string;
}

interface LoadingContextType extends LoadingState {
  setInitialLoading: (loading: boolean) => void;
  setComponentLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
  markResourceLoaded: (resourceId: string) => void;
  isResourceLoaded: (resourceId: string) => boolean;
  invalidateCache: () => void;
  preloadComponent: (componentLoader: () => Promise<unknown>) => Promise<void>;
  getResourceCacheStatus: () => { cached: number; total: number };
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const CACHE_KEY = 'dr-niaraki-loaded-resources';
const CACHE_EXPIRY_KEY = 'dr-niaraki-cache-expiry';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes cache duration

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitialLoading: true, // Always start with loading to avoid hydration mismatch
    isComponentLoading: false,
    progress: 0,
    loadedResources: new Set<string>(),
    cacheExpiryTime: Date.now() + CACHE_DURATION,
    message: 'Initializing...',
  });

  const resourcesRef = useRef<Set<string>>(loadingState.loadedResources);

  // Apply cache after hydration to prevent mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cachedResources = localStorage.getItem(CACHE_KEY);
      const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
      const now = Date.now();
      
      if (cachedResources && cacheExpiry && now < parseInt(cacheExpiry)) {
        try {
          const parsedResources = JSON.parse(cachedResources);
          
          // Small delay to show loading briefly for better UX
          setTimeout(() => {
            setLoadingState(prev => ({
              ...prev,
              isInitialLoading: false, // Skip loading if cache is valid
              progress: 100,
              loadedResources: new Set(parsedResources),
              cacheExpiryTime: parseInt(cacheExpiry),
              message: 'Loaded from cache',
            }));
          }, 500); // Brief loading for smooth transition
        } catch (error) {
          console.warn('Failed to parse cached resources:', error);
        }
      }
    }
  }, []); // Run once after hydration

  // Update ref when state changes
  useEffect(() => {
    resourcesRef.current = loadingState.loadedResources;
  }, [loadingState.loadedResources]);

  // Save to localStorage when resources change
  useEffect(() => {
    if (typeof window !== 'undefined' && loadingState.loadedResources.size > 0) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify([...loadingState.loadedResources]));
        localStorage.setItem(CACHE_EXPIRY_KEY, loadingState.cacheExpiryTime.toString());
      } catch (error) {
        console.warn('Failed to save resources to cache:', error);
      }
    }
  }, [loadingState.loadedResources, loadingState.cacheExpiryTime]);

  const setInitialLoading = useCallback((loading: boolean) => {
    setLoadingState(prev => ({ ...prev, isInitialLoading: loading }));
  }, []);

  const setComponentLoading = useCallback((loading: boolean) => {
    setLoadingState(prev => ({ ...prev, isComponentLoading: loading }));
  }, []);

  const setProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setLoadingState(prev => ({ ...prev, message }));
  }, []);

  const markResourceLoaded = useCallback((resourceId: string) => {
    setLoadingState(prev => {
      if (prev.loadedResources.has(resourceId)) {
        return prev; // No change if already loaded
      }
      
      const newResources = new Set(prev.loadedResources);
      newResources.add(resourceId);
      
      return {
        ...prev,
        loadedResources: newResources,
      };
    });
  }, []);

  const isResourceLoaded = useCallback((resourceId: string): boolean => {
    return resourcesRef.current.has(resourceId);
  }, []);

  const invalidateCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_EXPIRY_KEY);
    }
    setLoadingState(prev => ({
      ...prev,
      loadedResources: new Set(),
      cacheExpiryTime: Date.now() + CACHE_DURATION,
    }));
  }, []);

  const preloadComponent = useCallback(async (componentLoader: () => Promise<unknown>): Promise<void> => {
    try {
      await componentLoader();
    } catch (error) {
      console.warn('Failed to preload component:', error);
    }
  }, []);

  const getResourceCacheStatus = useCallback(() => {
    const totalKnownResources = ['header-component', 'hero-component', 'about-component', 'footer-component', 'chatbot-component', 'background-selector', 'atom-cursor'];
    
    return {
      cached: loadingState.loadedResources.size,
      total: totalKnownResources.length,
    };
  }, [loadingState.loadedResources.size]);

  // Auto-complete initial loading when all critical resources are loaded
  useEffect(() => {
    const criticalResources = ['header-component']; // Only layout components, not page content
    const allCriticalLoaded = criticalResources.every(resource => 
      loadingState.loadedResources.has(resource)
    );
    
    // Allow completion either when critical resources are loaded OR after a reasonable timeout
    const hasMinimumLoadTime = Date.now() - (loadingState.cacheExpiryTime - CACHE_DURATION) > 2000; // 2 second minimum
    
    if ((allCriticalLoaded || hasMinimumLoadTime) && loadingState.isInitialLoading && loadingState.progress >= 95) {
      setTimeout(() => {
        setInitialLoading(false);
        setProgress(100);
      }, 300); // Small delay for smooth UX
    }
  }, [loadingState.loadedResources, loadingState.isInitialLoading, loadingState.progress, loadingState.cacheExpiryTime, setInitialLoading, setProgress]);

  // Failsafe: Force loading completion after maximum time
  useEffect(() => {
    if (!loadingState.isInitialLoading) {
      return;
    }
    
    const maxLoadingTime = 8000; // 8 seconds maximum
    const timer = setTimeout(() => {
      console.warn('Loading forced to complete after maximum time');
      setInitialLoading(false);
      setProgress(100);
    }, maxLoadingTime);

    return () => clearTimeout(timer);
  }, [loadingState.isInitialLoading, setInitialLoading, setProgress]);

  const value: LoadingContextType = {
    ...loadingState,
    setInitialLoading,
    setComponentLoading,
    setProgress,
    setMessage,
    markResourceLoaded,
    isResourceLoaded,
    invalidateCache,
    preloadComponent,
    getResourceCacheStatus,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for component-level loading management
export function useResourceLoader(resourceId: string) {
  const { markResourceLoaded, isResourceLoaded } = useLoading();
  
  const markLoaded = useCallback(() => {
    markResourceLoaded(resourceId);
  }, [markResourceLoaded, resourceId]);
  
  const isLoaded = isResourceLoaded(resourceId);
  
  return { markLoaded, isLoaded };
} 