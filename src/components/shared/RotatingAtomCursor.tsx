import React, { useEffect, useState, useCallback, useRef } from "react";

const RotatingAtomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointing, setIsPointing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const rafRef = useRef<number | undefined>(undefined);

  // Use RAF for smooth 60fps updates
  const updatePosition = useCallback((e: MouseEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setPosition({ x: e.clientX, y: e.clientY });
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Performance: Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      // Debug logging removed to comply with linting rules
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, [contenteditable="true"], .interactive-card')) {
        setIsPointing(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select, [contenteditable="true"], .interactive-card')) {
        setIsPointing(false);
      }
    };

    const handleDocumentMouseLeave = () => {
      setIsVisible(false);
    };

    const handleDocumentMouseEnter = () => {
      setIsVisible(true);
    };

    // Use passive event listeners for better scroll performance
    document.addEventListener("mousemove", updatePosition, { passive: true });
    document.addEventListener("mouseover", handleMouseEnter, { passive: true });
    document.addEventListener("mouseout", handleMouseLeave, { passive: true });
    document.addEventListener("mouseleave", handleDocumentMouseLeave);
    document.addEventListener("mouseenter", handleDocumentMouseEnter);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      document.removeEventListener("mousemove", updatePosition);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
      document.removeEventListener("mouseleave", handleDocumentMouseLeave);
      document.removeEventListener("mouseenter", handleDocumentMouseEnter);
    };
  }, [updatePosition]);

  return (
    <div
      className="atom-cursor-container"
      style={{
        position: "fixed",
        pointerEvents: "none",
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        visibility: isVisible ? "visible" : "hidden",
        willChange: "transform", // Optimize for animations
      }}
    >
      <div className={`atom-cursor ${isPointing ? "pointing" : ""}`}>
        <div className="nucleus"></div>
        <div className="orbit orbit-1"></div>
        <div className="orbit orbit-2"></div>
        <div className="orbit orbit-3"></div>
        <div className="glow"></div>
      </div>
    </div>
  );
};

export default RotatingAtomCursor;