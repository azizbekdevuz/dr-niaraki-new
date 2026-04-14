'use client';

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { useDevice } from "@/components/shared/DeviceProvider";
import VideoPlayer from "@/components/shared/VideoS";
import { usePublicSiteContent } from "@/contexts/PublicSiteContentContext";
import { useAboutAnalytics } from "@/hooks/useAboutAnalytics";
import { useAboutAnimations } from "@/hooks/useAboutAnimations";
import { useAboutExpansion } from "@/hooks/useAboutExpansion";
import { textVariants } from "@/styles/textSystem";

import AboutStats from "./AboutStats";
import { ExpandableCard } from "./components/ExpandableCard";

interface AboutProps {
  readonly className?: string;
}

// Memoized CTA button animation
const ctaButtonAnimation = {
  hover: { y: -2, scale: 1.02 },
  tap: { scale: 0.98 }
} as const;

const About: React.FC<AboutProps> = ({ className = "" }) => {
  const siteContent = usePublicSiteContent();
  const { journey, experiences, awards } = siteContent.about;
  const { aboutSectionHeading, aboutSectionIntro, researchInActionCaption } = siteContent.home;
  const { isMobile } = useDevice();
  const { aboutAnimations, sectionReveal, statAnimations } = useAboutAnimations();
  const {
    isJourneyExpanded,
    isExperienceExpanded,
    isAwardExpanded,
    toggleJourneyExpansion,
    toggleExperienceExpansion,
    toggleAwardExpansion,
  } = useAboutExpansion();
  const { handleCTAClick } = useAboutAnalytics();

  return (
    <motion.section
      {...aboutAnimations.container}
      className={`section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent ${className}`}
      id="about"
    >
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          {...sectionReveal}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6">
            {aboutSectionHeading}
          </h2>
          <p className={`${textVariants.body.dark} max-w-3xl mx-auto mt-4 md:mt-6`}>
            {aboutSectionIntro}
          </p>
        </motion.div>

        {/* Career Statistics */}
        <AboutStats animation={statAnimations} />

        {/* Main Content Grid */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16'}`}>
          
          {/* Left Column: Academic Journey & Professional Experience */}
          <div className="space-y-8 md:space-y-12">
            
            {/* Academic Journey */}
            <motion.div {...sectionReveal}>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 md:mb-8">Academic Journey</h3>
              <div className="space-y-3 md:space-y-4">
                {journey.map((item, index) => (
                  <ExpandableCard
                    key={item.id}
                    item={item}
                    index={index}
                    isExpanded={isJourneyExpanded(index)}
                    onToggle={toggleJourneyExpansion}
                    type="journey"
                  />
                ))}
              </div>
            </motion.div>

            {/* Professional Experience */}
            <motion.div {...sectionReveal}>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 md:mb-8">Professional Experience</h3>
              <div className="space-y-3 md:space-y-4">
                {experiences.map((item, index) => (
                  <ExpandableCard
                    key={item.id}
                    item={item}
                    index={index}
                    isExpanded={isExperienceExpanded(index)}
                    onToggle={toggleExperienceExpansion}
                    type="experience"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Awards & Visual Content */}
          <div className="space-y-8 md:space-y-12">
            
            {/* Notable Awards */}
            <motion.div {...sectionReveal}>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-6 md:mb-8">Notable Awards</h3>
              <div className="space-y-3 md:space-y-4">
                {awards.map((item, index) => (
                  <ExpandableCard
                    key={item.id}
                    item={item}
                    index={index}
                    isExpanded={isAwardExpanded(index)}
                    onToggle={toggleAwardExpansion}
                    type="award"
                  />
                ))}
              </div>
            </motion.div>

            {/* Visual Content */}
            <motion.div
              {...sectionReveal}
              className="card gpu-accelerated"
            >
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-4 md:mb-6">Research in Action</h3>
              <div className="rounded-lg overflow-hidden bg-surface-primary">
                <VideoPlayer className="" />
              </div>
              <p className={`${textVariants.body.dark} mt-4 text-sm`}>
                {researchInActionCaption}
              </p>
            </motion.div>
          </div>
        </div>
        <div className="text-center mt-12 md:mt-16">
          <Link href="/about" onClick={handleCTAClick} className="inline-block">
            <motion.div
              className="btn-primary inline-flex items-center gpu-accelerated"
              {...ctaButtonAnimation}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 400 }}
            >
              <span className="mr-2">Learn More</span>
              <ChevronRight size={20} className="flex-shrink-0" aria-hidden="true" />
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.section>
  );
};

export default About;
