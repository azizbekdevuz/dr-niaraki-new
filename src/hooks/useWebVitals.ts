'use client';

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals';

// Performance thresholds based on Google's recommendations
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },    // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 },   // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 },  // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 },  // Time to First Byte
  INP: { good: 200, needsImprovement: 500 },    // Interaction to Next Paint
};

// Categorize metric value
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) {
    return 'good';
  }
  
  if (value <= threshold.good) {
    return 'good';
  }
  if (value <= threshold.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

// Log metric to console in development
function logMetric(metric: Metric) {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const rating = getMetricRating(metric.name, metric.value);
  let emoji: string;
  if (rating === 'good') {
    emoji = '✅';
  } else if (rating === 'needs-improvement') {
    emoji = '⚠️';
  } else {
    emoji = '❌';
  }
  
  // Using console.warn for development logging (allowed by linting rules)
  console.warn(
    `${emoji} ${metric.name}: ${metric.value.toFixed(2)}${
      metric.name === 'CLS' ? '' : 'ms'
    } (${rating})`,
    metric
  );
}

// Send metrics to analytics service
function sendToAnalytics(metric: Metric) {
  // In production, send to your analytics service
  // Example: Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
  
  // You can also send to custom analytics endpoint
  // fetch('/api/analytics/metrics', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     metric: metric.name,
  //     value: metric.value,
  //     rating: getMetricRating(metric.name, metric.value),
  //     id: metric.id,
  //     navigationType: metric.navigationType,
  //   }),
  // });
}

// Hook to monitor web vitals
export function useWebVitals(options?: {
  onMetric?: (metric: Metric) => void;
  enableLogging?: boolean;
  enableAnalytics?: boolean;
}) {
  const {
    onMetric,
    enableLogging = process.env.NODE_ENV === 'development',
    enableAnalytics = process.env.NODE_ENV === 'production',
  } = options || {};

  useEffect(() => {
    const handleMetric = (metric: Metric) => {
      // Custom handler
      if (onMetric) {
        onMetric(metric);
      }
      
      // Log in development
      if (enableLogging) {
        logMetric(metric);
      }
      
      // Send to analytics in production
      if (enableAnalytics) {
        sendToAnalytics(metric);
      }
    };

    // Register all metrics
    onCLS(handleMetric);
    onFCP(handleMetric);
    onFID(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }, [onMetric, enableLogging, enableAnalytics]);
}

// Hook to get performance marks
export function usePerformanceMarks() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }
    
    // Mark when React hydration completes
    if (!window.performance.getEntriesByName('react-hydration-complete').length) {
      window.performance.mark('react-hydration-complete');
    }
    
    // Log navigation timing in development
    if (process.env.NODE_ENV === 'development') {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationTiming) {
        // Using console.warn for development logging (allowed by linting rules)
        console.warn('Navigation Timing:', {
          domContentLoaded: navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart,
          domComplete: navigationTiming.domComplete - navigationTiming.domInteractive,
          loadComplete: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
        });
      }
    }
  }, []);
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      parameters: {
        value: number;
        metric_id: string;
        metric_value: number;
        metric_delta: number;
      }
    ) => void;
  }
} 