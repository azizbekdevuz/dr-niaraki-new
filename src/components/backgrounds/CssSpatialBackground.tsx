'use client';

import type { Theme } from '@/components/backgrounds/utils/constants';
import { themeColors } from '@/components/backgrounds/utils/constants';

import styles from './CssSpatialBackground.module.css';
import net from './CssSpatialBackground.network.module.css';

type CssSpatialVariant = 'viewport' | 'layer';

/**
 * CSS-only spatial field (no canvas, no rAF): recreates the **original canvas look**
 * as closely as practical—particle-like dual dot fields, implied **network edges**
 * via triangulation lines, polar “floor” rays, specular node hotspots, grids, blooms—
 * without the old runtime cost.
 *
 * `layer`: absolute inset inside a parent `fixed` stack (paired with XR canvas).
 * `viewport`: legacy single fixed layer behind the app.
 */
export default function CssSpatialBackground({
  theme = 'dark',
  variant = 'viewport',
}: {
  theme?: Theme;
  variant?: CssSpatialVariant;
}) {
  const t = themeColors[theme];

  const rootClass =
    variant === 'layer'
      ? `absolute inset-0 pointer-events-none overflow-hidden ${styles.host}`
      : `fixed inset-0 pointer-events-none z-[-10] overflow-hidden ${styles.host}`;

  return (
    <div className={rootClass} data-theme={theme} aria-hidden>
      <div
        className={styles.base}
        style={{
          background: `linear-gradient(168deg, ${t.gradientStart} 0%, ${t.gradientMid} 38%, ${t.gradientEnd} 68%, ${t.gradientDeep} 100%)`,
        }}
      />
      <div className={net.baseAurora} />
      <div className={styles.gridPrimary} />
      <div className={styles.gridSecondary} />
      <div className={net.wireTriangulation} />
      <div className={net.dotField} />
      <div className={net.specNodes} />
      <div className={styles.depthArc} />
      <div className={net.polarFloor} />
      <div className={styles.topBloom} />
      <div className={styles.bottomBloom} />
      <div className={styles.scanLines} />
      <div className={styles.sheen} />
      <div className={styles.horizon} />
      <div className={styles.vignette} />
    </div>
  );
}
