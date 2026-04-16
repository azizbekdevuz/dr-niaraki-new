import type { GridNode, Particle, ParticleKind, ScanLine } from '@/components/backgrounds/xr/xrLabTypes';

export function buildXrLabScene(
  width: number,
  height: number,
  particleCount: number,
  motionReduced: boolean
): { particles: Particle[]; gridNodes: GridNode[]; scanLines: ScanLine[] } {
  const densityScale = motionReduced ? 0.5 : 1;
  const resolvedParticles = Math.max(20, Math.round(particleCount * densityScale));
  const types: ParticleKind[] = ['dot', 'dot', 'dot', 'ring', 'cross'];

  const particles: Particle[] = Array.from({ length: resolvedParticles }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 600 + 100,
    vx: (Math.random() - 0.5) * 0.24,
    vy: (Math.random() - 0.5) * 0.18,
    vz: (Math.random() - 0.5) * 0.45,
    size: Math.random() * 2.2 + 0.6,
    opacity: Math.random() * 0.55 + 0.2,
    pulseOffset: Math.random() * Math.PI * 2,
    type: types[Math.floor(Math.random() * types.length)]!,
  }));

  const cols = 18;
  const rows = 12;
  const gridNodes: GridNode[] = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let col = 0; col <= cols; col += 1) {
      if (Math.random() > 0.3) {
        gridNodes.push({
          col,
          row,
          active: Math.random() > 0.62,
          pulsePhase: Math.random() * Math.PI * 2,
          intensity: Math.random() * 0.75 + 0.25,
        });
      }
    }
  }

  const scanCount = motionReduced ? 1 : 3;
  const scanLines: ScanLine[] = Array.from({ length: scanCount }, (_, index) => ({
    y: (height / scanCount) * index + Math.random() * (height / scanCount),
    speed: motionReduced ? 0.2 : 0.35 + Math.random() * 0.4,
    opacity: 0.025 + Math.random() * 0.035,
    width: 70 + Math.random() * 110,
  }));

  return { particles, gridNodes, scanLines };
}
