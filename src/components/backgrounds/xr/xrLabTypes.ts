export type ParticleKind = 'dot' | 'ring' | 'cross';

export type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
  pulseOffset: number;
  type: ParticleKind;
};

export type GridNode = {
  col: number;
  row: number;
  active: boolean;
  pulsePhase: number;
  intensity: number;
};

export type ScanLine = {
  y: number;
  speed: number;
  opacity: number;
  width: number;
};

export type RGB = { r: number; g: number; b: number };

export type PointerAmbient = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  active: boolean;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function parseHexColor(hex: string, fallback = '#22d3ee'): RGB {
  const normalized = hex.trim();
  const fullHex = /^#([0-9a-fA-F]{6})$/;
  const shortHex = /^#([0-9a-fA-F]{3})$/;

  let source = fallback;
  if (fullHex.test(normalized)) {
    source = normalized;
  } else if (shortHex.test(normalized)) {
    source = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }

  return {
    r: Number.parseInt(source.slice(1, 3), 16),
    g: Number.parseInt(source.slice(3, 5), 16),
    b: Number.parseInt(source.slice(5, 7), 16),
  };
}
