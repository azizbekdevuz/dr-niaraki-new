import { motion } from "framer-motion";
import React from "react";

import { textVariants } from "@/styles/textSystem";
import type { MotionVariant, ButtonAnimations } from "@/types/animations";

interface HeroContentProps {
  animation: MotionVariant;
  onExploreClick: () => void;
  buttonAnimation: ButtonAnimations;
  className?: string;
}

const HeroContent: React.FC<HeroContentProps> = ({ 
  animation, 
  onExploreClick, 
  buttonAnimation,
  className 
}) => {
  return (
    <motion.div
      {...animation}
      className={`w-full lg:w-7/12 space-y-6 md:space-y-8 text-center lg:text-left ${className || ''}`}
    >
      {/* Hero Title */}
      <h1 className={textVariants.hero.dark}>
        Pioneering the Future of XR & AI
      </h1>

      {/* Subtitle */}
      <p className={textVariants.subtitle.dark}>
        Shaping the Next Frontier in Human-Computer Interaction
      </p>

      {/* Description & CTA */}
      <div className="space-y-4 md:space-y-6">
        <p className={textVariants.body.dark}>
          Dr. Niaraki-Sadeghi is a leading researcher in Extended Reality
          and Artificial Intelligence, dedicated to transforming education
          and human-computer interaction through innovative technologies.
        </p>
        
        {/* Performance: Optimized button with hardware acceleration */}
        <motion.button
          onClick={onExploreClick}
          className="btn-primary text-base md:text-lg font-bold py-3 md:py-4 px-6 md:px-8 rounded-full gpu-accelerated"
          whileHover={buttonAnimation.hover}
          whileTap={buttonAnimation.tap}
          transition={buttonAnimation.transition}
          style={{ backfaceVisibility: 'hidden', perspective: 1000 }}
          aria-label="Explore Dr. Niaraki-Sadeghi's research projects"
        >
          <span>Explore Research</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default HeroContent;
