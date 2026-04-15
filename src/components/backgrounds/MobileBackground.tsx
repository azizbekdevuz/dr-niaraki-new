'use client';

import CssSpatialBackground from '@/components/backgrounds/CssSpatialBackground';
import type { Theme } from '@/components/backgrounds/utils/constants';

/** Mobile: same layered CSS spatial field as desktop (no canvas). */
export default function MobileBackground({ theme = 'dark' }: { theme?: Theme }) {
  return <CssSpatialBackground theme={theme} />;
}
