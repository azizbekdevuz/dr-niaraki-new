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

  // Simulate progressive loading for better UX
  useEffect(() => {
    if (isInitialLoading) {
      const loadingSteps = [
        { progress: 20, message: 'Loading interface...', delay: 200 },
        { progress: 40, message: 'Preparing components...', delay: 400 },
        { progress: 60, message: 'Initializing animations...', delay: 300 },
        { progress: 80, message: 'Almost ready...', delay: 300 },
        { progress: 95, message: 'Finalizing...', delay: 400 },
      ];

      let currentStep = 0;
      const loadNext = () => {
        if (currentStep < loadingSteps.length) {
          const step = loadingSteps[currentStep];
          if (step) {
            setTimeout(() => {
              // Check if loading is still active before updating
              if (progress < step.progress) {
                setProgress(step.progress);
                setMessage(step.message);
              }
              currentStep++;
              loadNext();
            }, step.delay);
          }
        } else {
          // Auto-complete loading after all steps
          setTimeout(() => {
            if (progress < 100) {
              setProgress(100);
              setMessage('Ready!');
              setTimeout(() => {
                setInitialLoading(false);
              }, 800);
            }
          }, 300);
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

