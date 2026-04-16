import { motion } from 'framer-motion';
import { TrendingUp, Users, BookOpen } from 'lucide-react';
import React, { useMemo } from 'react';

import { ContentStatTile } from '@/components/shared/ContentStatTile';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';
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
      className={`mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mb-12 md:gap-4 ${className || ''}`}
      {...animation}
    >
      {statsDisplay.map((stat, index) => {
        const Icon = STAT_ICON_MAP[stat.icon];

        return (
          <motion.div
            key={stat.label}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: index * 0.08,
              type: 'spring',
              stiffness: 320,
              damping: 22,
            }}
          >
            <ContentStatTile icon={Icon} value={stat.value} label={stat.label} />
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default AboutStats;
