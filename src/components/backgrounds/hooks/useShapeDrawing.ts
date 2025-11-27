import { useCallback } from "react";

import type { Node } from "../utils/Node";

export const useShapeDrawing = (
  nodesRef: React.MutableRefObject<Node[]>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  restrictedAreaRef: React.MutableRefObject<{ left: number; right: number; top: number; bottom: number }>
) => {
  return useCallback((shapeIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    let count = 25; // default
    const radius = 100;
    // Use viewport dimensions for shape positioning
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    switch (shapeIndex) {
      case 0: count = 16; break; // Circuit
      case 1: count = 25; break; // Grid
      case 2: count = 19; break; // Hex
      case 3: count = 24; break; // Circles
      case 4: count = 10; break; // Star
      case 5: count = 16; break; // Neural net
      case 6: count = 25; break; // Random data
    }

    const nodes = nodesRef.current.slice(0, count);

    nodes.forEach((node, index) => {
      switch (shapeIndex) {
        case 0: { // Circuit Shape
          node.targetX = centerX + (index % 2 === 0 ? radius : -radius);
          node.targetY = centerY + (index % 2 === 0 ? -radius : radius);
          break;
        }
        case 1: { // Grid
          const grid = 5;
          node.targetX = centerX + (index % grid) * 40 - (grid - 1) * 20;
          node.targetY = centerY + Math.floor(index / grid) * 40 - (grid - 1) * 20;
          break;
        }
        case 2: { // Hexagon Grid
          if (index === 0) {
            node.targetX = centerX;
            node.targetY = centerY;
          } else {
            const ring = index <= 6 ? 1 : 2;
            const offset = index <= 6 ? 0 : Math.PI / 6;
            const angle = ((index - 1) % 6) * (Math.PI / 3) + offset;
            node.targetX = centerX + Math.cos(angle) * ((radius * ring) / 2);
            node.targetY = centerY + Math.sin(angle) * ((radius * ring) / 2);
          }
          break;
        }
        case 3: { // Concentric Circles
          const rings = 3;
          const perRing = count / rings;
          const ring = Math.floor(index / perRing);
          const angle = ((index % perRing) * 2 * Math.PI) / perRing;
          node.targetX = centerX + Math.cos(angle) * (50 + ring * 40);
          node.targetY = centerY + Math.sin(angle) * (50 + ring * 40);
          break;
        }
        case 4: { // Star
          const angle = ((2 * Math.PI) / 5) * Math.floor(index / 2);
          const r = index % 2 === 0 ? radius : radius * 0.6;
          node.targetX = centerX + Math.cos(angle) * r;
          node.targetY = centerY + Math.sin(angle) * r;
          break;
        }
        case 5: { // Neural Net
          const layers = 4;
          const perLayer = count / layers;
          const layer = Math.floor(index / perLayer);
          const idx = index % perLayer;
          node.targetX = centerX + (layer - 1.5) * 100;
          node.targetY = centerY + (idx - 1.5) * 60;
          break;
        }
        case 6: { // Random scatter
          node.targetX = centerX + Math.random() * radius * 2 - radius;
          node.targetY = centerY + Math.random() * radius * 2 - radius;
          break;
        }
      }

      node.fixed = true;
    });

    const pad = 50;
    restrictedAreaRef.current = {
      left: Math.min(...nodes.map(n => n.targetX)) - pad,
      right: Math.max(...nodes.map(n => n.targetX)) + pad,
      top: Math.min(...nodes.map(n => n.targetY)) - pad,
      bottom: Math.max(...nodes.map(n => n.targetY)) + pad,
    };
  }, [canvasRef, nodesRef, restrictedAreaRef]);
};