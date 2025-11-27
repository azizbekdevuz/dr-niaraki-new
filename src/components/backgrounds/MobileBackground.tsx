'use client';

import React, { useEffect, useRef } from 'react';

type Theme = 'dark' | 'light';

const NODE_COUNT = 24;
const MAX_DISTANCE = 150;

const THEME_COLORS: Record<Theme, string> = {
  dark: '#000428',
  light: '#f0f8ff',
};

class Node {
  x: number;
  y: number;
  vx: number;
  vy: number;

  constructor(w: number, h: number, dpr: number) {
    this.x = (Math.random() * w) / dpr;
    this.y = (Math.random() * h) / dpr;
    this.vx = (Math.random() - 0.5) * 0.6;
    this.vy = (Math.random() - 0.5) * 0.6;
  }

  draw(ctx: CanvasRenderingContext2D, hue: number) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fill();
  }

  update(w: number, h: number, dpr: number) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x > w / dpr || this.x < 0) {this.vx *= -1;}
    if (this.y > h / dpr || this.y < 0) {this.vy *= -1;}
  }
}

export default function MobileBackground({ theme = 'dark' }: { theme?: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {return;}

    const canvas = canvasRef.current;
    if (!canvas) {return;}
    const context = canvas.getContext('2d');
    if (!context) {return;}

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let hueShift = 0;
    let animationId: number;

    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = document.documentElement.scrollHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.backgroundColor = THEME_COLORS[theme];

      context.resetTransform?.();
      context.scale(dpr, dpr);
    };

    updateCanvasSize();

    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => new Node(canvas.width, canvas.height, dpr));

    const animate = () => {
      if (isPausedRef.current) {return;}

      hueShift += 0.3;
      context.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((node, i) => {
        node.update(canvas.width, canvas.height, dpr);
        node.draw(context, hueShift);

        for (let j = i + 1; j < NODE_COUNT; j++) {
          const otherNode = nodes[j];
          if (!otherNode) {continue;}
          
          const dx = node.x - otherNode.x;
          const dy = node.y - otherNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DISTANCE) {
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(otherNode.x, otherNode.y);
            context.strokeStyle = `rgba(0, 165, 224, ${1 - dist / MAX_DISTANCE})`;
            context.stroke();
          }
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    const handleVisibilityChange = () => {
      isPausedRef.current = document.visibilityState !== 'visible';
      if (!isPausedRef.current) {animate();}
    };

    animate();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full pointer-events-none z-[-1]"
    />
  );
}