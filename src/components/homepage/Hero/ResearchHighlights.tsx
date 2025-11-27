import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Handshake,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

import { RESEARCH_CARDS } from "@/config/constants";
import type { MotionVariant, CardAnimationProps, TransitionFunction } from "@/types/animations";

import InteractiveCard from "./InteractiveCard";

// Icon mapping for dynamic loading
const ICON_MAP = {
  Github,
  Linkedin,
  Handshake,
} as const;

interface ResearchHighlightsProps {
  headingAnimation: MotionVariant;
  cardAnimationProps: CardAnimationProps;
  getCardTransition: TransitionFunction;
  className?: string;
}

const ResearchHighlights: React.FC<ResearchHighlightsProps> = ({ 
  headingAnimation, 
  cardAnimationProps,
  getCardTransition,
  className 
}) => {
  const router = useRouter();

  return (
    <section className={`py-12 md:py-16 lg:py-20 ${className || ''}`}>
      <motion.h2 
        className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-8 md:mb-12 text-center text-foreground"
        {...headingAnimation}
      >
        Research Highlights
      </motion.h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {RESEARCH_CARDS.map((card, index) => {
          const Icon = ICON_MAP[card.iconName as keyof typeof ICON_MAP];
          
          return (
            <motion.div
              key={card.title}
              onClick={() => router.push(card.link)}
              className="cursor-pointer gpu-accelerated"
              {...cardAnimationProps}
              transition={getCardTransition(index)}
            >
              <InteractiveCard
                icon={Icon}
                title={card.title}
                description={card.description}
                delay={0} // Handle animation in parent
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default ResearchHighlights;
