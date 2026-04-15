'use client';

import React, { useEffect } from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';

import RotatingAtomCursor from './RotatingAtomCursor';

const CUSTOM_CURSOR_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR === 'true';

/**
 * Custom atom cursor is opt-in (`NEXT_PUBLIC_ENABLE_CUSTOM_CURSOR=true`) so the default
 * experience keeps the native cursor and avoids global `cursor: none` styling.
 */
export default function AtomCursorClientWrapper() {
  const { isDesktop } = useDevice();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    if (!CUSTOM_CURSOR_ENABLED || !isDesktop) {
      document.documentElement.removeAttribute('data-custom-cursor');
      return undefined;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.removeAttribute('data-custom-cursor');
      return undefined;
    }
    document.documentElement.setAttribute('data-custom-cursor', 'enabled');
    return () => {
      document.documentElement.removeAttribute('data-custom-cursor');
    };
  }, [isDesktop]);

  if (!CUSTOM_CURSOR_ENABLED || !isDesktop) {
    return null;
  }

  return <RotatingAtomCursor />;
}
