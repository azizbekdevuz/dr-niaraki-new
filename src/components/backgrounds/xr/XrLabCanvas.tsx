'use client';

import { useEffect, useMemo, useRef } from 'react';

import { usePrefersReducedMotion } from '@/components/backgrounds/xr/usePrefersReducedMotion';
import {
  easePointerTowardsTarget,
  renderXrLabFrame,
  resetPointerTarget,
  updatePointerFromClient,
} from '@/components/backgrounds/xr/xrLabFrame';
import { buildXrLabScene } from '@/components/backgrounds/xr/xrLabScene';
import type { GridNode, Particle, PointerAmbient, RGB, ScanLine } from '@/components/backgrounds/xr/xrLabTypes';
import { parseHexColor } from '@/components/backgrounds/xr/xrLabTypes';

type XrLabCanvasProps = {
  accentHex: string;
  particleCount: number;
  gridOpacity: number;
  interactive: boolean;
  /** Stronger parallax / field response (mobile usually higher so touch reads clearly). */
  parallaxGain: number;
  /** When true, skip canvas entirely (CSS base only). */
  forceStatic?: boolean;
};

export default function XrLabCanvas({
  accentHex,
  particleCount,
  gridOpacity,
  interactive,
  parallaxGain,
  forceStatic = false,
}: XrLabCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const pointerRef = useRef<PointerAmbient>({
    x: 0.5,
    y: 0.5,
    tx: 0.5,
    ty: 0.5,
    active: false,
  });

  const impulseRef = useRef(0);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });
  const particlesRef = useRef<Particle[]>([]);
  const gridNodesRef = useRef<GridNode[]>([]);
  const scanLinesRef = useRef<ScanLine[]>([]);
  const hiddenRef = useRef(false);

  const prefersReducedMotion = usePrefersReducedMotion();
  const motionReduced = prefersReducedMotion;
  const accent: RGB = useMemo(() => parseHexColor(accentHex), [accentHex]);

  useEffect(() => {
    if (forceStatic || motionReduced) {
      return undefined;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return undefined;
    }

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      sizeRef.current = { width, height, dpr };

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const built = buildXrLabScene(width, height, particleCount, motionReduced);
      particlesRef.current = built.particles;
      gridNodesRef.current = built.gridNodes;
      scanLinesRef.current = built.scanLines;
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(container);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      updatePointerFromClient(pointerRef.current, event.clientX, event.clientY, interactive);
    };

    const onPointerLeaveDoc = (event: PointerEvent) => {
      if (event.relatedTarget === null) {
        resetPointerTarget(pointerRef.current);
      }
    };

    const onPointerDown = () => {
      impulseRef.current = Math.min(1, impulseRef.current + 0.42);
    };

    const onVisibility = () => {
      hiddenRef.current = document.visibilityState === 'hidden';
    };

    const onBlur = () => {
      resetPointerTarget(pointerRef.current);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeaveDoc);
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    const drawFrame = (timestamp: number) => {
      if (hiddenRef.current) {
        frameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      impulseRef.current *= 0.9;

      const { width, height } = sizeRef.current;
      if (!width || !height) {
        frameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      const t = timestamp * 0.001;
      easePointerTowardsTarget(pointerRef.current, motionReduced);

      renderXrLabFrame({
        ctx,
        width,
        height,
        t,
        motionReduced,
        gridOpacity,
        accent,
        parallaxGain,
        impulse: impulseRef.current,
        particles: particlesRef.current,
        scanLines: scanLinesRef.current,
        pointer: pointerRef.current,
        gridNodes: gridNodesRef.current,
      });

      frameRef.current = requestAnimationFrame(drawFrame);
    };

    frameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeaveDoc);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [accent, forceStatic, gridOpacity, interactive, motionReduced, parallaxGain, particleCount]);

  if (forceStatic || motionReduced) {
    return null;
  }

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="pointer-events-none block h-full w-full opacity-[0.92]" />
    </div>
  );
}
