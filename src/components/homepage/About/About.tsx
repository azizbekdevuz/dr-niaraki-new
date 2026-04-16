'use client';

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo } from "react";

import { DenseSubheading } from '@/components/shared/DenseSubheading';
import { useDevice } from "@/components/shared/DeviceProvider";
import { ListPagination } from '@/components/shared/ListPagination';
import { SectionHeading } from '@/components/shared/SectionHeading';
import VideoPlayer from "@/components/shared/VideoS";
import { usePublicSiteContent } from "@/contexts/PublicSiteContentContext";
import { useAboutAnalytics } from "@/hooks/useAboutAnalytics";
import { useAboutAnimations } from "@/hooks/useAboutAnimations";
import { useAboutExpansion } from "@/hooks/useAboutExpansion";
import { usePaginatedSlice } from "@/hooks/usePaginatedSlice";
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

/** Match journey/awards density; expandable cards need a modest page size. */
const HOME_JOURNEY_PAGE_SIZE = 3;
const HOME_EXPERIENCE_PAGE_SIZE = 3;
const HOME_AWARDS_PAGE_SIZE = 3;

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
    clearJourneyExpansion,
    clearAwardExpansion,
    clearExperienceExpansion,
  } = useAboutExpansion();
  const { handleCTAClick } = useAboutAnalytics();

  const journeyResetToken = useMemo(() => journey.map((j) => j.id).join('|'), [journey]);
  const experiencesResetToken = useMemo(() => experiences.map((e) => e.id).join('|'), [experiences]);
  const awardsResetToken = useMemo(() => awards.map((a) => a.id).join('|'), [awards]);

  const journeyPageState = usePaginatedSlice(journey, HOME_JOURNEY_PAGE_SIZE, journeyResetToken);
  const experiencesPageState = usePaginatedSlice(
    experiences,
    HOME_EXPERIENCE_PAGE_SIZE,
    experiencesResetToken,
  );
  const awardsPageState = usePaginatedSlice(awards, HOME_AWARDS_PAGE_SIZE, awardsResetToken);

  useEffect(() => {
    clearJourneyExpansion();
  }, [journeyPageState.page, clearJourneyExpansion]);

  useEffect(() => {
    clearExperienceExpansion();
  }, [experiencesPageState.page, clearExperienceExpansion]);

  useEffect(() => {
    clearAwardExpansion();
  }, [awardsPageState.page, clearAwardExpansion]);

  return (
    <motion.section
      {...aboutAnimations.container}
      className={`section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent ${className}`}
      id="about"
    >
      <div className="container-custom">
        {/* Section Header */}
        <motion.div {...sectionReveal} className="mb-12 text-center md:mb-16">
          <SectionHeading
            align="center"
            eyebrow="At a glance"
            title={aboutSectionHeading}
            titleClassName="max-w-4xl text-3xl md:text-4xl lg:text-5xl"
            className="!mb-4 md:!mb-6"
          />
          <p className={`${textVariants.body.dark} mx-auto mt-2 max-w-3xl md:mt-4`}>
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
              <DenseSubheading>Academic Journey</DenseSubheading>
              <div key={journeyPageState.page} className="space-y-3 md:space-y-4">
                {journeyPageState.slice.map((item, idx) => {
                  const globalIndex =
                    (journeyPageState.page - 1) * journeyPageState.pageSize + idx;
                  return (
                    <ExpandableCard
                      key={item.id}
                      item={item}
                      index={globalIndex}
                      isExpanded={isJourneyExpanded(globalIndex)}
                      onToggle={toggleJourneyExpansion}
                      type="journey"
                    />
                  );
                })}
              </div>
              <ListPagination
                page={journeyPageState.page}
                itemCount={journeyPageState.itemCount}
                pageSize={journeyPageState.pageSize}
                onPageChange={journeyPageState.setPage}
                ariaLabel="Homepage academic journey pages"
                className="!mt-6 max-w-xl border-primary/25 bg-surface-primary/40 px-2 py-3 md:mx-auto"
              />
            </motion.div>

            {/* Professional Experience */}
            <motion.div {...sectionReveal}>
              <DenseSubheading>Professional Experience</DenseSubheading>
              <div key={experiencesPageState.page} className="space-y-3 md:space-y-4">
                {experiencesPageState.slice.map((item, idx) => {
                  const globalIndex =
                    (experiencesPageState.page - 1) * experiencesPageState.pageSize + idx;
                  return (
                    <ExpandableCard
                      key={item.id}
                      item={item}
                      index={globalIndex}
                      isExpanded={isExperienceExpanded(globalIndex)}
                      onToggle={toggleExperienceExpansion}
                      type="experience"
                    />
                  );
                })}
              </div>
              <ListPagination
                page={experiencesPageState.page}
                itemCount={experiencesPageState.itemCount}
                pageSize={experiencesPageState.pageSize}
                onPageChange={experiencesPageState.setPage}
                ariaLabel="Homepage professional experience pages"
                className="!mt-6 max-w-xl border-primary/25 bg-surface-primary/40 px-2 py-3 md:mx-auto"
              />
            </motion.div>
          </div>

          {/* Right Column: Awards & Visual Content */}
          <div className="space-y-8 md:space-y-12">
            
            {/* Notable Awards */}
            <motion.div {...sectionReveal}>
              <DenseSubheading>Notable Awards</DenseSubheading>
              <div key={awardsPageState.page} className="space-y-3 md:space-y-4">
                {awardsPageState.slice.map((item, idx) => {
                  const globalIndex =
                    (awardsPageState.page - 1) * awardsPageState.pageSize + idx;
                  return (
                    <ExpandableCard
                      key={item.id}
                      item={item}
                      index={globalIndex}
                      isExpanded={isAwardExpanded(globalIndex)}
                      onToggle={toggleAwardExpansion}
                      type="award"
                    />
                  );
                })}
              </div>
              <ListPagination
                page={awardsPageState.page}
                itemCount={awardsPageState.itemCount}
                pageSize={awardsPageState.pageSize}
                onPageChange={awardsPageState.setPage}
                ariaLabel="Homepage notable awards pages"
                className="!mt-6 max-w-xl border-primary/25 bg-surface-primary/40 px-2 py-3 md:mx-auto"
              />
            </motion.div>

            {/* Visual Content */}
            <motion.div {...sectionReveal} className="card card-rich gpu-accelerated">
              <DenseSubheading className="mb-4 md:mb-6">Research in Action</DenseSubheading>
              <div className="overflow-hidden rounded-xl border border-primary/20 bg-surface-primary">
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
