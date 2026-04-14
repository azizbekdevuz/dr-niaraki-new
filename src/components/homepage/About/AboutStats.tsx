import { motion } from 'framer-motion';
import { TrendingUp, Users, BookOpen } from 'lucide-react';
import React, { useMemo } from 'react';

import { useDevice } from '@/components/shared/DeviceProvider';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';
import { getTextVariant } from '@/styles/textSystem';
import type { MotionVariant } from '@/types/animations';

const STAT_ICON_MAP = {
  TrendingUp,
  Users,
  BookOpen,
} as const;

interface AboutStatsProps {
  animation: MotionVariant;
  className?: string;
}

const AboutStats: React.FC<AboutStatsProps> = ({ animation, className }) => {
  const { isMobile } = useDevice();
  const siteContent = usePublicSiteContent();
  const statsDisplay = useMemo(() => {
    const { publications, yearsExperience, studentsSupervised } = siteContent.about.stats;
    return [
      { icon: 'BookOpen' as const, value: publications, label: 'Publications' },
      { icon: 'TrendingUp' as const, value: yearsExperience, label: 'Years Experience' },
      { icon: 'Users' as const, value: studentsSupervised, label: 'Students Supervised' },
    ] as const;
  }, [siteContent.about.stats]);

  return (
    <motion.div
      className={`grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 ${className || ''}`}
      {...animation}
    >
      {statsDisplay.map((stat, index) => {
        const Icon = STAT_ICON_MAP[stat.icon];

        return (
          <motion.div
            key={stat.label}
            className="card text-center gpu-accelerated"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <Icon
              className={`mx-auto mb-2 md:mb-3 ${getTextVariant('accent')}`}
              size={isMobile ? 24 : 32}
              aria-hidden="true"
            />
            <div className={`text-2xl md:text-3xl font-bold ${getTextVariant('primary')} mb-1`}>{stat.value}</div>
            <div className={`${getTextVariant('muted')} text-xs md:text-sm`}>{stat.label}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AboutStats;
