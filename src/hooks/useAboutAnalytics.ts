import { useCallback } from 'react';

export function useAboutAnalytics() {
  const handleCTAClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_click', { 
        value: 1,
        metric_id: 'cta_click',
        metric_value: 1,
        metric_delta: 1,
        event_category: "engagement" 
      } as Parameters<typeof window.gtag>[2] & { event_category: string });
    }
  }, []);

  return { handleCTAClick };
}

