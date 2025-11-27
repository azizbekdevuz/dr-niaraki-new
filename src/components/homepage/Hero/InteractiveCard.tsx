import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import React from "react";

// Performance: Define strict types
interface InteractiveCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number; // Optional for backward compatibility
  children?: React.ReactNode;
}

// Performance: Optimized animation variants with hardware acceleration
const cardAnimations = {
  hover: {
    y: -4,
    boxShadow: "0 10px 40px var(--shadow-primary)",
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  tap: { 
    y: -1,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  arrow: {
    x: 5,
    transition: { type: "spring", stiffness: 400, damping: 17 }
  }
} as const;

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  icon: Icon,
  title,
  description,
  children,
}) => (
  <motion.article
    className="group relative p-4 md:p-6 rounded-xl card-glass gpu-accelerated overflow-hidden"
    whileHover={cardAnimations.hover}
    whileTap={cardAnimations.tap}
    role="button"
    tabIndex={0}
    style={{ backfaceVisibility: 'hidden', perspective: 1000 }}
  >
    {/* Background glow effect on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-400/5 to-secondary-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-fast" />
    
    {/* Icon */}
    <Icon 
      className="relative w-6 h-6 md:w-8 md:h-8 mb-3 md:mb-4 text-accent-primary group-hover:text-accent-primary/80 transition-colors duration-fast"
      aria-hidden="true"
    />
    
    {/* Content */}
    <div className="relative space-y-2 md:space-y-3">
      <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-accent-primary transition-colors duration-fast">
        {title}
      </h3>
      
      <p className="text-foreground/70 group-hover:text-foreground/90 transition-colors duration-fast leading-relaxed text-sm md:text-base">
        {description}
      </p>
      
      {children && (
        <div className="mt-3 md:mt-4">
          {children}
        </div>
      )}
      
      {/* Action indicator */}
      <motion.div
        className="flex items-center text-accent-primary group-hover:text-accent-primary/80 transition-colors duration-fast mt-3 md:mt-4"
        whileHover={cardAnimations.arrow}
      >
        <span className="text-xs md:text-sm font-medium">Learn more</span>
        <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4" aria-hidden="true" />
      </motion.div>
    </div>
  </motion.article>
);

export default InteractiveCard;
