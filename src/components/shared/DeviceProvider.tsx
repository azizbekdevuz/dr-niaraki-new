'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { getViewportSize, canHandleAdvancedAnimations } from '@/lib/device-info.client';
import type { DeviceInfo } from '@/lib/device-info.server';

interface DeviceContextValue extends DeviceInfo {
  canUseAdvancedAnimations: boolean;
}

const DeviceContext = createContext<DeviceContextValue | undefined>(undefined);

interface DeviceProviderProps {
  children: React.ReactNode;
  initialDeviceInfo: DeviceInfo;
}

export function DeviceProvider({ children, initialDeviceInfo }: DeviceProviderProps) {
  // Performance: Initialize with server-side data to prevent layout shift
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // If we're on the client, immediately get viewport info
    if (typeof window !== 'undefined') {
      const viewport = getViewportSize();
      const isMobile = viewport.width < 768;
      return {
        ...initialDeviceInfo,
        viewport,
        isMobile,
        isDesktop: !isMobile,
        type: isMobile ? 'mobile' : 'desktop'
      };
    }
    return initialDeviceInfo;
  });
  
  // Performance: Initialize animations capability based on initial device info
  const [canUseAdvancedAnimations, setCanUseAdvancedAnimations] = useState(() => {
    if (typeof window !== 'undefined') {
      return canHandleAdvancedAnimations(deviceInfo);
    }
    return false;
  });
  
  useEffect(() => {
    // Update viewport size
    const updateViewport = () => {
      const viewport = getViewportSize();
      const isMobile = viewport.width < 768;
      const updatedDeviceInfo = {
        ...deviceInfo,
        viewport,
        isMobile,
        isDesktop: !isMobile,
        type: isMobile ? 'mobile' as const : 'desktop' as const
      };
      
      setDeviceInfo(updatedDeviceInfo);
      setCanUseAdvancedAnimations(canHandleAdvancedAnimations(updatedDeviceInfo));
    };
    
    // Initial check (already done in state initialization, but check for any changes)
    updateViewport();
    
    // Debounced resize handler for performance
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateViewport, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const contextValue: DeviceContextValue = {
    ...deviceInfo,
    canUseAdvancedAnimations,
  };
  
  return (
    <DeviceContext.Provider value={contextValue}>
      {children}
    </DeviceContext.Provider>
  );
}

// Custom hook to use device info
export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}