import { motion } from "framer-motion";
import {
  GraduationCap,
  Linkedin,
  BriefcaseBusiness,
} from "lucide-react";
import React from "react";

import { useDevice } from "@/components/shared/DeviceProvider";
import { SOCIAL_LINKS } from "@/config/constants";
import type { MotionVariant, SocialAnimations } from "@/types/animations";

// Icon mapping for dynamic loading
const ICON_MAP = {
  GraduationCap,
  Linkedin,
  BriefcaseBusiness,
} as const;

interface HeroSocialLinksProps {
  animation: MotionVariant;
  socialAnimations: SocialAnimations;
  className?: string;
}

const HeroSocialLinks: React.FC<HeroSocialLinksProps> = ({ 
  animation, 
  socialAnimations, 
  className 
}) => {
  const { isMobile } = useDevice();

  return (
    <motion.div
      {...animation}
      className={`flex justify-center lg:justify-start gap-4 md:gap-6 ${className || ''}`}
    >
      {SOCIAL_LINKS.map(({ url, ariaLabel, name, iconName }) => {
        const Icon = ICON_MAP[iconName as keyof typeof ICON_MAP];
        
        return (
          <motion.a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
            className="text-foreground hover:text-accent-primary transition-colors duration-fast p-2 md:p-3 rounded-full hover:bg-surface-hover gpu-accelerated"
            whileHover={socialAnimations.hover(isMobile)}
            whileTap={socialAnimations.tap}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <Icon className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
            <span className="sr-only">{name}</span>
          </motion.a>
        );
      })}
    </motion.div>
  );
};

export default HeroSocialLinks;
