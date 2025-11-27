'use client';

import React from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';

import RotatingAtomCursor from './RotatingAtomCursor';

export default function AtomCursorClientWrapper() {
  const { isDesktop } = useDevice();

  if (!isDesktop) {
    return null;
  }

  return <RotatingAtomCursor />;
}