'use client';

import SpatialFieldStack from '@/components/backgrounds/SpatialFieldStack';
import type { Theme } from '@/components/backgrounds/utils/constants';

/**
 * Desktop spatial field: **CSS base** (grids, blooms, triangulation) plus a **bounded XR canvas**
 * (parallax grid, particles, scanlines) — restores the cyan XR-lab identity without the legacy
 * O(n²) canvas edge graph. Pointer/touch drive the field via window-level listeners (no click capture).
 */
export default function AdvancedBackground({ theme = 'dark' }: { theme?: Theme }) {
  return <SpatialFieldStack theme={theme} profile="desktop" />;
}
