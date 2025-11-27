'use client';

import dynamic from 'next/dynamic';

import { useDevice } from '@/components/shared/DeviceProvider';

const AdvancedBackground = dynamic(() => import('@/components/backgrounds/AdvancedBackground'), {
  ssr: false,
  loading: () => null,
});

const MobileBackground = dynamic(() => import('@/components/backgrounds/MobileBackground'), {
  ssr: false,
  loading: () => null,
});

export default function BackgroundSelector() {
  const { isDesktop } = useDevice();

  if (!isDesktop) {
    return <MobileBackground />;
  }

  return <AdvancedBackground />;
}