'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

import { useShapeDrawing } from './hooks/useShapeDrawing';
import type { Theme} from './utils/constants';
import { themeColors, maxDistance, shapeNodesCount, targetFPS } from './utils/constants';
import { Node } from './utils/Node';
import { throttle } from './utils/throttle';

export default function AdvancedBackground({ theme = 'dark' }: { theme?: Theme }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const nodesRef = useRef<Node[]>([]);
  const lastFrameRef = useRef(0);
  const hueRef = useRef(0);
  const [nodeCount, setNodeCount] = useState(90);
  const restrictedAreaRef = useRef({ left: 0, right: 0, top: 0, bottom: 0 });
  const drawShape = useShapeDrawing(nodesRef, canvasRef, restrictedAreaRef);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    // Use window dimensions to ensure canvas always fills entire viewport
    const displayWidth = window.innerWidth;
    const displayHeight = window.innerHeight;

    // Get device pixel ratio but clamp it to prevent extreme scaling during zoom
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    // Set canvas internal size (accounting for device pixel ratio)
    const width = Math.floor(displayWidth * dpr);
    const height = Math.floor(displayHeight * dpr);

    // Only update if dimensions actually changed to prevent unnecessary redraws
    if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    }

    // Set display size (CSS pixels) - ensure it fills the entire viewport
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Scale the drawing context to match device pixel ratio
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Create gradient background that covers the entire viewport
    const gradient = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
    gradient.addColorStop(0, themeColors[theme].gradientStart);
    gradient.addColorStop(1, themeColors[theme].gradientEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, displayWidth, displayHeight);

    // Calculate ideal node count based on viewport size
    const area = displayWidth * displayHeight;
    const idealCount = Math.min(150, Math.max(40, Math.floor(area / 6000)));
    setNodeCount(idealCount);
  }, [theme]);

  const adjustNodes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    while (nodesRef.current.length < nodeCount) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      const vx = (Math.random() - 0.5) * 0.5;
      const vy = (Math.random() - 0.5) * 0.5;
      const radius = 2;
      nodesRef.current.push(new Node(x, y, vx, vy, radius));
    }
    while (nodesRef.current.length > nodeCount) {
      nodesRef.current.pop();
    }
  }, [nodeCount]);

  const resetShapeNodes = () => {
    nodesRef.current.forEach((node, i) => {
      if (i < shapeNodesCount) {node.fixed = false;}
    });
  };

  const animate = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {return;}

    const interval = 1000 / targetFPS;
    if (now - lastFrameRef.current < interval) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    lastFrameRef.current = now;
    hueRef.current += 0.5;

    // Clear the entire viewport area
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Update and draw nodes
    nodesRef.current.forEach((node) => {
      node.update();
      node.draw(ctx, hueRef.current, themeColors[theme].nodeColor);
    });

    // Draw connections between nodes
    for (let i = 0; i < nodesRef.current.length; i++) {
      for (let j = i + 1; j < nodesRef.current.length; j++) {
        const a = nodesRef.current[i];
        const b = nodesRef.current[j];
        
        // Add null checks for safety
        if (!a || !b) {continue;}
        
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = themeColors[theme].lineColor(1 - dist / maxDistance);
          ctx.stroke();
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [theme]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}
    
    // Use page coordinates for accurate mouse position regardless of zoom
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    nodesRef.current.forEach((node, index) => {
      if (index >= shapeNodesCount && !node.fixed) {
        const dx = mouseX - node.x;
        const dy = mouseY - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          node.vx += (dx / distance) * 0.05;
          node.vy += (dy / distance) * 0.05;
        }
      }
    });
  }, []);

  // Track viewport dimensions to detect actual size changes (not just scroll)
  const lastDimensionsRef = useRef({ width: 0, height: 0 });

  // Handle actual viewport size changes (not scroll)
  const handleViewportChange = useCallback(() => {
    const currentWidth = window.innerWidth;
    const currentHeight = window.innerHeight;
    
    // Only update if dimensions actually changed
    if (currentWidth !== lastDimensionsRef.current.width || 
        currentHeight !== lastDimensionsRef.current.height) {
      
      lastDimensionsRef.current = { width: currentWidth, height: currentHeight };
      
    setupCanvas();
    adjustNodes();
      // Force a re-render of shapes to adjust to new dimensions
      setTimeout(() => {
        if (nodesRef.current.length > 0) {
          resetShapeNodes();
          drawShape(0); // Reset to first shape
        }
      }, 50);
    }
  }, [setupCanvas, adjustNodes, drawShape]);

  const debouncedViewportChange = throttle(handleViewportChange, 150);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {return;}

    setupCanvas();
    adjustNodes();

    let shapeIndex = 0;
    const changeShape = () => {
      resetShapeNodes();
      drawShape(shapeIndex);
      shapeIndex = (shapeIndex + 1) % 10;
    };

    changeShape();
    animationRef.current = requestAnimationFrame(animate);

    const interval = setInterval(changeShape, 5000);
    
    // Listen for actual viewport size changes only
    window.addEventListener('resize', debouncedViewportChange);
    window.addEventListener('orientationchange', debouncedViewportChange);
    
    // Visual viewport for mobile and zoom (but NOT scroll!)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', debouncedViewportChange);
    }
    
    // Listen for zoom changes via specific keyboard shortcuts only
    window.addEventListener('keydown', (e) => {
      // Detect Ctrl/Cmd + Plus/Minus/0 for zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        setTimeout(debouncedViewportChange, 100);
      }
    });
    
    // Throttled mouse move
    const throttledMouseMove = throttle(handleMouseMove, 16);
    window.addEventListener('mousemove', throttledMouseMove);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(interval);
      window.removeEventListener('resize', debouncedViewportChange);
      window.removeEventListener('orientationchange', debouncedViewportChange);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', debouncedViewportChange);
      }
      window.removeEventListener('mousemove', throttledMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupCanvas, adjustNodes, animate, drawShape, handleMouseMove, debouncedViewportChange]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-10]"
        style={{
          /* Ensure canvas fills viewport properly during zoom */
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0
        }}
      >
      </canvas>

      {/* For no-JS fallback: animated background via CSS */}
      <noscript>
        <div className="fixed top-0 left-0 w-full h-full z-[-1] animated-gradient pointer-events-none" />
      </noscript>
    </>
  );
}