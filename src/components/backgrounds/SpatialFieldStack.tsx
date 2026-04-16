'use client';

import CssSpatialBackground from '@/components/backgrounds/CssSpatialBackground';
import type { Theme } from '@/components/backgrounds/utils/constants';
import { themeColors } from '@/components/backgrounds/utils/constants';
import XrLabCanvas from '@/components/backgrounds/xr/XrLabCanvas';

type Profile = 'desktop' | 'mobile';

const profileConfig: Record<
  Profile,
  { particleCount: number; gridOpacity: number; parallaxGain: number }
> = {
  desktop: { particleCount: 68, gridOpacity: 0.13, parallaxGain: 1.14 },
  mobile: { particleCount: 40, gridOpacity: 0.11, parallaxGain: 1.42 },
};

/**
 * Hybrid spatial field: CSS layers for instant paint + theme continuity,
 * lightweight XR canvas for depth grid, parallax haze, and pointer/touch reactivity.
 */
export default function SpatialFieldStack({ theme = 'dark', profile = 'desktop' }: { theme?: Theme; profile?: Profile }) {
  const cfg = profileConfig[profile];
  const accentHex = themeColors[theme].accentHex;

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none" aria-hidden>
      <CssSpatialBackground theme={theme} variant="layer" />
      <div className="absolute inset-0">
        <XrLabCanvas
          accentHex={accentHex}
          particleCount={cfg.particleCount}
          gridOpacity={cfg.gridOpacity}
          interactive
          parallaxGain={cfg.parallaxGain}
        />
      </div>
    </div>
  );
}
