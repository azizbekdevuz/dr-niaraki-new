import { motion } from "framer-motion";
import {
  Calendar,
  Briefcase,
  Award as AwardIcon,
  ChevronRight,
  Dot,
} from "lucide-react";
import React, { memo, useCallback, useMemo } from "react";

import { useDevice } from "@/components/shared/DeviceProvider";
import type { AboutAwardItem, AboutExperienceItem, AboutJourneyItem } from "@/content/types";
import { useAboutAnimations } from "@/hooks/useAboutAnimations";
import { getTextVariant } from "@/styles/textSystem";

interface ExpandableCardProps {
  readonly item: AboutJourneyItem | AboutExperienceItem | AboutAwardItem;
  readonly index: number;
  readonly isExpanded: boolean;
  readonly onToggle: (index: number) => void;
  readonly type: 'journey' | 'experience' | 'award';
}

interface CardContent {
  title: string;
  subtitle: string;
  meta: string;
  details: string;
  extra?: {
    achievements?: readonly string[];
    projects?: readonly string[];
    impact?: string;
  };
  icon: React.ComponentType<{ className?: string; size?: number; 'aria-hidden'?: boolean }>;
}

const getCardContent = (
  item: AboutJourneyItem | AboutExperienceItem | AboutAwardItem,
  type: 'journey' | 'experience' | 'award'
): CardContent | null => {
  switch (type) {
    case 'journey': {
      const journeyItem = item as AboutJourneyItem;
      return {
        title: journeyItem.title,
        subtitle: journeyItem.institution,
        meta: journeyItem.year,
        details: journeyItem.details,
        icon: Calendar,
      };
    }
    case 'experience': {
      const expItem = item as AboutExperienceItem;
      return {
        title: expItem.position,
        subtitle: expItem.institution,
        meta: expItem.duration,
        details: expItem.details,
        extra: { 
          achievements: expItem.achievements, 
          projects: expItem.projects 
        },
        icon: Briefcase,
      };
    }
    case 'award': {
      const awardItem = item as AboutAwardItem;
      return {
        title: awardItem.title,
        subtitle: awardItem.organization,
        meta: awardItem.year,
        details: awardItem.details,
        extra: { impact: awardItem.impact },
        icon: AwardIcon,
      };
    }
    default:
      return null;
  }
};

export const ExpandableCard: React.FC<ExpandableCardProps> = memo(({ 
  item, 
  index, 
  isExpanded, 
  onToggle, 
  type 
}) => {
  const { isMobile } = useDevice();
  const { cardAnimationProps, getCardTransition, expansionAnimations, cardHoverAnimations } = useAboutAnimations();
  
  const handleClick = useCallback(() => {
    onToggle(index);
  }, [index, onToggle]);

  const cardContent = useMemo(() => getCardContent(item, type), [item, type]);

  if (!cardContent) {
    return null;
  }

  const Icon = cardContent.icon;

  return (
    <motion.div
      {...cardAnimationProps}
      transition={getCardTransition(index)}
      className={`card card-rich gpu-accelerated ${isMobile ? 'p-4' : 'p-6'} cursor-pointer ${
        isExpanded
          ? 'ring-2 ring-accent-primary/50 shadow-glow'
          : 'ring-1 ring-inset ring-white/[0.04]'
      }`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for ${cardContent.title}`}
      whileHover={cardHoverAnimations.hover}
      whileTap={cardHoverAnimations.tap}
    >
      <div className="flex items-center justify-between">
        <div className={`flex items-center ${isMobile ? 'space-x-3' : 'space-x-4'} flex-1 min-w-0`}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary/10">
            <Icon
              className={getTextVariant('accent')}
              size={isMobile ? 16 : 20}
              aria-hidden={true}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className={`font-semibold ${getTextVariant('primary')} ${isMobile ? 'text-sm leading-tight' : 'text-lg'} line-clamp-2`}>
              {cardContent.title}
            </h3>
            <p className={`${getTextVariant('accent')} ${isMobile ? 'text-xs leading-tight' : 'text-sm'} line-clamp-1 mt-1`}>
              {cardContent.subtitle}
            </p>
            <p className={`${getTextVariant('muted')} ${isMobile ? 'text-xs' : 'text-sm'} line-clamp-1 mt-0.5`}>
              {cardContent.meta}
            </p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronRight 
            className={getTextVariant('muted')} 
            size={isMobile ? 16 : 20}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <motion.div
          {...expansionAnimations}
          className="mt-4 border-t border-primary/20 pt-4"
        >
          <p className={`${getTextVariant('primary')} ${isMobile ? 'text-sm' : 'text-base'} leading-relaxed`}>
            {cardContent.details}
          </p>
          
          {cardContent.extra && (
            <div className="mt-4 space-y-3">
              {cardContent.extra.achievements && (
                <div>
                  <h4 className={`font-medium ${getTextVariant('accent')} mb-2 text-sm`}>
                    Key Achievements:
                  </h4>
                  <ul className="space-y-1">
                    {cardContent.extra.achievements.map((achievement, i) => (
                      <li key={i} className={`${getTextVariant('primary')} ${isMobile ? 'text-xs' : 'text-sm'} flex items-start gap-2`}>
                        <Dot className="mt-1.5 h-4 w-4 flex-shrink-0 text-accent-primary" aria-hidden />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {cardContent.extra.projects && (
                <div>
                  <h4 className={`font-medium ${getTextVariant('accent')} mb-2 text-sm`}>
                    Notable Projects:
                  </h4>
                  <ul className="space-y-1">
                    {cardContent.extra.projects.map((project, i) => (
                      <li key={i} className={`${getTextVariant('primary')} ${isMobile ? 'text-xs' : 'text-sm'} flex items-start gap-2`}>
                        <Dot className="mt-1.5 h-4 w-4 flex-shrink-0 text-accent-primary" aria-hidden />
                        <span>{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {cardContent.extra.impact && (
                <div>
                  <h4 className={`font-medium ${getTextVariant('accent')} mb-2 text-sm`}>
                    Impact:
                  </h4>
                  <p className={`${getTextVariant('primary')} ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    {cardContent.extra.impact}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
});

ExpandableCard.displayName = 'ExpandableCard';
