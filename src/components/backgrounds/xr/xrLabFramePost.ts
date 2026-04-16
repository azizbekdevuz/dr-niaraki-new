import type { Particle, RGB, ScanLine } from '@/components/backgrounds/xr/xrLabTypes';

type XrLabPostDrawInput = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  t: number;
  motionReduced: boolean;
  accent: RGB;
  mx: number;
  my: number;
  pg: number;
  impulse: number;
  particles: Particle[];
  scanLines: ScanLine[];
};

export function drawXrLabFramePost(f: XrLabPostDrawInput): void {
  const { ctx, width, height, t, motionReduced, accent, mx, my, pg, impulse, particles, scanLines } = f;

  particles.forEach((particle) => {
    if (!motionReduced) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
    }

    if (particle.x < -30) {
      particle.x = width + 30;
    }
    if (particle.x > width + 30) {
      particle.x = -30;
    }
    if (particle.y < -30) {
      particle.y = height + 30;
    }
    if (particle.y > height + 30) {
      particle.y = -30;
    }
    if (particle.z < 50) {
      particle.z = 700;
    }
    if (particle.z > 700) {
      particle.z = 50;
    }

    const scale = 600 / particle.z;
    const parallaxShift = (mx - 0.5) * 36 * pg * scale * 0.01;
    const parallaxShiftY = (my - 0.5) * 28 * pg * scale * 0.01;
    const px = (particle.x - width / 2) * scale + width / 2 + parallaxShift;
    const py = (particle.y - height / 2) * scale + height / 2 + parallaxShiftY;
    const size = particle.size * scale;
    const pulse = motionReduced ? 0.7 : Math.sin(t * 1.7 + particle.pulseOffset) * 0.5 + 0.5;
    const alpha = particle.opacity * (0.42 + pulse * 0.5) * Math.min(scale, 1) * (1 + impulse * 0.15);

    if (px < -20 || px > width + 20 || py < -20 || py > height + 20) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    if (particle.type === 'ring') {
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.9)`;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(px, py, size * 2.4, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.38)`;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (particle.type === 'cross') {
      const cross = size * 2.8;
      ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.68)`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(px - cross, py);
      ctx.lineTo(px + cross, py);
      ctx.moveTo(px, py - cross);
      ctx.lineTo(px, py + cross);
      ctx.stroke();
    } else {
      const glow = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
      glow.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.95)`);
      glow.addColorStop(0.45, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.22)`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(px, py, size * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.45, size * 0.42), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  if (!motionReduced) {
    const streamCount = 4;
    for (let index = 0; index < streamCount; index += 1) {
      const phase = (t * 0.12 + index / streamCount) % 1;
      const x = width * (0.14 + (index / (streamCount - 1)) * 0.72);
      const segmentHeight = 90 + index * 14;
      const headY = -60 + (height + 120) * phase;

      const grad = ctx.createLinearGradient(x, headY - segmentHeight, x, headY);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.65, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.05 + impulse * 0.04})`);
      grad.addColorStop(1, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${0.14 + impulse * 0.05})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(x, headY - segmentHeight);
      ctx.lineTo(x, headY);
      ctx.stroke();
    }
  }

  scanLines.forEach((scan) => {
    if (!motionReduced) {
      scan.y = (scan.y + scan.speed) % (height + 20);
    }

    const grad = ctx.createLinearGradient(0, scan.y - scan.width, 0, scan.y + scan.width);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.5, `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${scan.opacity + impulse * 0.02})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scan.y - scan.width, width, scan.width * 2);
  });

  const bracketPulse = motionReduced ? 0.7 : Math.sin(t * 0.9) * 0.2 + 0.7;
  const corners = [
    { x: 24, y: 24, sx: 1, sy: 1 },
    { x: width - 24, y: 24, sx: -1, sy: 1 },
    { x: 24, y: height - 24, sx: 1, sy: -1 },
    { x: width - 24, y: height - 24, sx: -1, sy: -1 },
  ];

  ctx.save();
  ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${(0.24 + impulse * 0.12) * bracketPulse})`;
  ctx.lineWidth = 1;

  corners.forEach(({ x, y, sx, sy }) => {
    ctx.beginPath();
    ctx.moveTo(x + sx * 16, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + sy * 16);
    ctx.stroke();
  });

  ctx.restore();

  const rings = [
    { rx: width * 0.28, ry: height * 0.065, phase: 0 },
    { rx: width * 0.18, ry: height * 0.045, phase: 1.3 },
  ];

  rings.forEach((ring) => {
    const alpha = motionReduced
      ? 0.03
      : (Math.sin(t * 0.5 + ring.phase) * 0.5 + 0.5) * 0.04 + 0.015 + impulse * 0.02;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 1)`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(
      width * 0.5 + (mx - 0.5) * 18 * pg,
      height * 0.5 + (my - 0.5) * 12 * pg,
      ring.rx,
      ring.ry,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();
  });

  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.2,
    width / 2,
    height / 2,
    width * 0.82
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.58)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
