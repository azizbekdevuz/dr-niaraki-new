import { useEffect, useState } from 'react';

import { useLoading } from '@/contexts/LoadingContext';

interface UseAppLoadingOptions {
  onComponentLoad?: (componentId: string) => void;
}

export function useAppLoading({ onComponentLoad }: UseAppLoadingOptions = {}) {
  const { 
    isInitialLoading, 
    progress, 
    message, 
    setProgress, 
    setMessage,
    isResourceLoaded,
    markResourceLoaded,
    setInitialLoading
  } = useLoading();

  const [componentsLoaded, setComponentsLoaded] = useState(false);

  // Lightweight progress hints (avoid long artificial waits or animation-focused copy)
  useEffect(() => {
    if (isInitialLoading) {
      const loadingSteps = [
        { progress: 35, message: 'Loading layout…', delay: 120 },
        { progress: 70, message: 'Preparing experience…', delay: 140 },
        { progress: 92, message: 'Almost ready…', delay: 120 },
      ];

      let currentStep = 0;
      const loadNext = () => {
        if (currentStep < loadingSteps.length) {
          const step = loadingSteps[currentStep];
          if (step) {
            setTimeout(() => {
              if (progress < step.progress) {
                setProgress(step.progress);
                setMessage(step.message);
              }
              currentStep++;
              loadNext();
            }, step.delay);
          }
        } else {
          setTimeout(() => {
            if (progress < 100) {
              setProgress(100);
              setMessage('Ready');
              setTimeout(() => {
                setInitialLoading(false);
              }, 280);
            }
          }, 160);
        }
      };

      loadNext();
    }
  }, [isInitialLoading, setProgress, setMessage, setInitialLoading, progress]);

  // Handle component loading completion
  const handleComponentLoad = (componentId: string) => {
    markResourceLoaded(componentId);
    onComponentLoad?.(componentId);
    
    // Check if all critical components are loaded
    const criticalComponents = ['header-component', 'background-selector'];
    const allCriticalLoaded = criticalComponents.every(id => isResourceLoaded(id));
    
    if (allCriticalLoaded && !componentsLoaded) {
      setComponentsLoaded(true);
      setProgress(100);
      setTimeout(() => {
        setMessage('Ready!');
      }, 200);
    }
  };

  return {
    isInitialLoading,
    progress,
    message,
    handleComponentLoad,
  };
}

