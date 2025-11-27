import { motion } from "framer-motion";
import Image from "next/image";
import { Suspense, useMemo } from 'react';
import React from "react";

import { useAppState } from "@/contexts/AppStateContext";
import { getOptimizedImageProps } from "@/lib/image-utils";
import type { MotionVariant } from "@/types/animations";

interface HeroImageProps {
  animation: MotionVariant;
  className?: string;
}

const HeroImage: React.FC<HeroImageProps> = ({ animation, className }) => {
  const { imageHovered, setImageHovered } = useAppState();

  // Performance: Memoize image classes to prevent re-computation
  const imageClasses = useMemo(() => 
    `rounded-full transition-all duration-slow object-cover gpu-accelerated ${
      imageHovered 
        ? "scale-105 grayscale-0 shadow-glow-lg" 
        : "scale-100 grayscale"
    }`,
    [imageHovered]
  );

  // Performance: Memoize optimized image props
  const imageProps = useMemo(() => 
    getOptimizedImageProps(
      "/images/profpic.jpg",
      "Dr. Abolghasem Sadeghi-Niaraki",
      true // priority loading for hero image
    ),
    []
  );

  // Performance: Memoize event handlers
  const handleImageEnter = useMemo(() => 
    () => setImageHovered(true),
    [setImageHovered]
  );
  
  const handleImageLeave = useMemo(() => 
    () => setImageHovered(false),
    [setImageHovered]
  );

  return (
    <motion.div
      {...animation}
      className={`w-full lg:w-5/12 flex justify-center ${className || ''}`}
    >
      <div
        className="relative aspect-square w-full max-w-[280px] sm:max-w-sm lg:max-w-md xl:max-w-lg group gpu-accelerated"
        onMouseEnter={handleImageEnter}
        onMouseLeave={handleImageLeave}
        role="img"
        aria-label="Dr. Abolghasem Sadeghi-Niaraki profile photo"
      >
        <Suspense 
          fallback={
            <div className="w-full h-full rounded-full bg-surface-primary animate-pulse" />
          }
        >
          <Image
            {...imageProps}
            alt="Dr. Abolghasem Sadeghi-Niaraki"
            className={imageClasses}
          />
        </Suspense>
        
        {/* Performance: Use CSS-based overlay instead of motion.div */}
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary-400/40 to-secondary-400/40 transition-opacity duration-slow gpu-accelerated ${
            imageHovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
      </div>
    </motion.div>
  );
};

export default HeroImage;
