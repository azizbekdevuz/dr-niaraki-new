import { useCallback } from 'react';

type GtagCommand = 'event' | 'config' | 'js' | 'set';
type GtagFn = (command: GtagCommand, action: string, params?: Record<string, unknown>) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const candidate = (window as Window & { gtag?: unknown }).gtag;
  return typeof candidate === 'function' ? (candidate as GtagFn) : undefined;
}

export function useAboutAnalytics() {
  const handleCTAClick = useCallback(() => {
    const gtag = getGtag();
    if (!gtag) {
      return;
    }
    gtag('event', 'cta_click', {
      value: 1,
      metric_id: 'cta_click',
      metric_value: 1,
      metric_delta: 1,
      event_category: 'engagement',
    });
  }, []);

  return { handleCTAClick };
}
