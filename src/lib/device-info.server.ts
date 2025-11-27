import { headers } from 'next/headers';

export type DeviceType = 'mobile' | 'desktop';

export interface DeviceInfo {
  type: DeviceType;
  isMobile: boolean;
  isDesktop: boolean;
  isTablet: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  viewport: {
    width: number;
    height: number;
  };
}

// Server-side device detection
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Enhanced mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android.*Tablet|Tablet.*Android/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  
  // Get device type from middleware header
  const deviceType = headersList.get('x-device-type') as DeviceType || (isMobile ? 'mobile' : 'desktop');
  
  return {
    type: deviceType,
    isMobile,
    isDesktop: !isMobile,
    isTablet,
    isIOS,
    isAndroid,
    viewport: {
      width: 0, // Will be set client-side
      height: 0
    }
  };
}