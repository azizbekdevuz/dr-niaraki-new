'use client';

import CssSpatialBackground from '@/components/backgrounds/CssSpatialBackground';
import type { Theme } from '@/components/backgrounds/utils/constants';

/**
 * Desktop site background: the original canvas build was a **cyan particle network**
 * on a deep blue-green field (spatial / XR-lab). That implementation is intentionally
 * not restored here (no canvas, no rAF, no O(n²) edges). Visual parity is pursued
 * with **static + cheap CSS layers** in `CssSpatialBackground`—grids, triangulation
 * hints, polar floor, dual-scale “nodes”, blooms, and vignette—same performance class.
 */
export default function AdvancedBackground({ theme = 'dark' }: { theme?: Theme }) {
  return <CssSpatialBackground theme={theme} />;
}
