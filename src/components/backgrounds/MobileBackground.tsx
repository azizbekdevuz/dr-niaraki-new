'use client';

import SpatialFieldStack from '@/components/backgrounds/SpatialFieldStack';
import type { Theme } from '@/components/backgrounds/utils/constants';

/** Mobile: same stack as desktop with lower particle budget and stronger parallax gain. */
export default function MobileBackground({ theme = 'dark' }: { theme?: Theme }) {
  return <SpatialFieldStack theme={theme} profile="mobile" />;
}
