import { drawXrLabFramePost } from '@/components/backgrounds/xr/xrLabFramePost';
import type { GridNode, Particle, PointerAmbient, RGB, ScanLine } from '@/components/backgrounds/xr/xrLabTypes';
import { clamp, lerp } from '@/components/backgrounds/xr/xrLabTypes';

function drawHaze(
  ctx2d: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: RGB,
  alpha: number
) {
  const radius = Math.max(rx, ry);
  const gradient = ctx2d.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx2d.save();
  ctx2d.translate(cx, cy);
  ctx2d.scale(rx / radius, ry / radius);
  ctx2d.fillStyle = gradient;
  ctx2d.beginPath();
  ctx2d.arc(0, 0, radius, 0, Math.PI * 2);
  ctx2d.fill();
  ctx2d.restore();
}

type XrLabFrameContext = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  t: number;
  motionReduced: boolean;
  gridOpacity: number;
  accent: RGB;
  parallaxGain: number;
  impulse: number;
  particles: Particle[];
  scanLines: ScanLine[];
  pointer: PointerAmbient;
  gridNodes: GridNode[];
};

export function easePointerTowardsTarget(pointer: PointerAmbient, motionReduced: boolean): void {
  const easing = motionReduced ? 0.055 : 0.11;
  pointer.x = lerp(pointer.x, pointer.tx, easing);
  pointer.y = lerp(pointer.y, pointer.ty, easing);
}

export function renderXrLabFrame(f: XrLabFrameContext): void {
  const { ctx, width, height, t, motionReduced, gridOpacity, accent, parallaxGain, impulse, particles, scanLines, pointer, gridNodes } = f;

  const mx = pointer.x;
  const my = pointer.y;
  const pg = parallaxGain * (1 + impulse * 0.85);

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createRadialGradient(
    width * (0.34 + (mx - 0.5) * 0.32 * pg),
    height * (0.24 + (my - 0.5) * 0.24 * pg),
    0,
    width / 2,
    height / 2,
    width * 0.95
  );
  bg.addColorStop(0, 'rgba(6, 10, 24, 0.92)');
  bg.addColorStop(0.48, 'rgba(2, 6, 18, 0.88)');
  bg.addColorStop(1, 'rgba(0, 1, 7, 0.82)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  const hazeA = 0.06 + Math.sin(t * 0.35) * 0.012 + impulse * 0.04;
  drawHaze(
    ctx,
    width * (0.2 + (mx - 0.5) * 0.22 * pg),
    height * (0.18 + (my - 0.5) * 0.16 * pg),
    width * 0.52,
    height * 0.42,
    accent,
    hazeA
  );
  drawHaze(
    ctx,
    width * (0.78 - (mx - 0.5) * 0.14 * pg),
    height * (0.78 - (my - 0.5) * 0.12 * pg),
    width * 0.46,
    height * 0.38,
    { r: 120, g: 60, b: 255 },
    0.04 + Math.sin(t * 0.28 + 1.1) * 0.01 + impulse * 0.025
  );
  drawHaze(ctx, width * 0.5, height * 0.5, width * 0.34, height * 0.3, { r: 20, g: 40, b: 100 }, 0.065 + impulse * 0.02);

  const vp = {
    x: width * (0.5 + (mx - 0.5) * 0.12 * pg),
    y: height * (0.4 + (my - 0.5) * 0.08 * pg),
  };

  const cols = 18;
  const rows = 12;
  const farWidth = width * 1.9;
  const nearWidth = width * 1.08;
  const farY = vp.y;
  const nearY = height * 1.03;

  const gridX = (col: number, rowT: number) => {
    const rowWidth = lerp(farWidth, nearWidth, rowT);
    return vp.x + ((col / cols) - 0.5) * rowWidth;
  };

  const gridY = (rowT: number) => lerp(farY, nearY, rowT);

  ctx.save();
  ctx.globalAlpha = gridOpacity;

  for (let row = 0; row <= rows; row += 1) {
    const rowT = row / rows;
    const y = gridY(rowT);
    const pulse = motionReduced ? 0.6 : Math.sin(t * 0.6 - rowT * 3) * 0.5 + 0.5;
    const opacity = (0.26 + rowT * 0.55) * (0.6 + pulse * 0.4);

    ctx.beginPath();
    ctx.moveTo(gridX(0, rowT), y);
    ctx.lineTo(gridX(cols, rowT), y);
    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${opacity})`;
    ctx.lineWidth = rowT < 0.15 ? 0.45 : 0.55 + rowT * 0.5;
    ctx.stroke();
  }

  for (let col = 0; col <= cols; col += 1) {
    const isMajor = col % 3 === 0;
    const colFraction = col / cols;
    const dist = Math.abs(colFraction - 0.5) * 2;

    ctx.beginPath();
    for (let row = 0; row <= rows; row += 1) {
      const rowT = row / rows;
      const x = gridX(col, rowT);
      const y = gridY(rowT);
      if (row === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, ${
      isMajor ? 0.46 : Math.max(0.14, 0.28 - dist * 0.14)
    })`;
    ctx.lineWidth = isMajor ? 0.75 : 0.35;
    ctx.stroke();
  }

  ctx.restore();

  gridNodes.forEach((node) => {
    const rowT = node.row / rows;
    const x = gridX(node.col, rowT);
    const y = gridY(rowT);
    const pulse = motionReduced ? 0.65 : Math.sin(t * 1.1 + node.pulsePhase) * 0.5 + 0.5;
    const alpha =
      (node.active ? 0.22 + pulse * 0.35 : 0.03 + pulse * 0.03) * node.intensity * (1 + impulse * 0.25);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (node.active) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 7 + pulse * 5);
      glow.addColorStop(0, `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.9)`);
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 7 + pulse * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.beginPath();
      ctx.arc(x, y, 1.15, 0, Math.PI * 2);
      ctx.fill();
    }

    const cross = 2.8 + rowT * 1.8;
    ctx.strokeStyle = `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.44)`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x - cross, y);
    ctx.lineTo(x + cross, y);
    ctx.moveTo(x, y - cross);
    ctx.lineTo(x, y + cross);
    ctx.stroke();
    ctx.restore();
  });

  drawXrLabFramePost({
    ctx,
    width,
    height,
    t,
    motionReduced,
    accent,
    mx,
    my,
    pg,
    impulse,
    particles,
    scanLines,
  });
}

export function updatePointerFromClient(
  pointer: PointerAmbient,
  clientX: number,
  clientY: number,
  interactive: boolean
): void {
  if (!interactive) {
    return;
  }
  pointer.tx = clamp(clientX / window.innerWidth, 0, 1);
  pointer.ty = clamp(clientY / window.innerHeight, 0, 1);
  pointer.active = true;
}

export function resetPointerTarget(pointer: PointerAmbient): void {
  pointer.tx = 0.5;
  pointer.ty = 0.5;
  pointer.active = false;
}
