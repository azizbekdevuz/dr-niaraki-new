'use client';

/**
 * About page - Full biography and academic information
 */

import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Users,
  Globe,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import {
  AboutAwardsSection,
  AboutExperienceSection,
  AboutJourneySection,
} from '@/components/about/AboutPaginatedSections';
import { ContentStatTile } from '@/components/shared/ContentStatTile';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';
import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutPage() {
  const siteContent = usePublicSiteContent();
  const { journey, experiences, awards, stats, page } = siteContent.about;
  const { displayName, roleLine, photoSrc, photoAlt, aboutIntroTagline, aboutSkillTags } =
    siteContent.profile;

  const statsRow = [
    { icon: BookOpen, value: `${stats.publications}+`, label: 'Publications' },
    { icon: Users, value: `${stats.studentsSupervised}+`, label: 'Graduate students supervised' },
    { icon: Globe, value: `${stats.countriesCollaborated}+`, label: 'Countries' },
    { icon: Award, value: `${stats.thesesExamined}+`, label: 'Theses examined (external)' },
  ];

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-surface-tertiary to-transparent">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Image */}
            <motion.div variants={itemVariants} className="order-2 lg:order-1">
              <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
                <div className={`absolute inset-0 rounded-full blur-2xl ${TW_ACCENT_SOFT_GRADIENT}`} />
                <Image
                  src={photoSrc}
                  alt={photoAlt}
                  fill
                  className="rounded-full object-cover border-4 border-accent-primary/30"
                  priority
                />
              </div>
            </motion.div>

            {/* Content */}
            <motion.div variants={itemVariants} className="order-1 lg:order-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {displayName}
              </h1>
              <p className="text-accent-primary text-lg md:text-xl mb-4">
                {roleLine}
              </p>
              <p className="text-secondary leading-relaxed mb-6">
                {aboutIntroTagline}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {aboutSkillTags.map((tag, i) => {
                  const palette = ['bg-accent-primary/10 text-accent-primary', 'bg-accent-secondary/10 text-accent-secondary', 'bg-accent-tertiary/10 text-accent-tertiary'] as const;
                  const cls = palette[i % palette.length];
                  return (
                    <span key={tag} className={`px-4 py-2 rounded-full text-sm ${cls}`}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-primary/20 bg-surface-secondary/40 py-10 backdrop-blur-sm">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          >
            {statsRow.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <ContentStatTile variant="hero" icon={stat.icon} value={stat.value} label={stat.label} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Professional Summary */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <SectionHeading eyebrow="Overview" title="Professional Summary" className="!mb-6" />
            </motion.div>
            <motion.div variants={itemVariants} className="list-page-panel p-6 md:p-8">
              {page.professionalSummaryParagraphs.map((paragraph, idx) => (
                <p key={idx} className="text-secondary leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Academic Journey */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom mx-auto max-w-5xl">
          <AboutJourneySection journey={journey} itemVariants={itemVariants} />
        </div>
      </section>

      {/* Professional Experience */}
      <section className="section">
        <div className="container-custom">
          <AboutExperienceSection experiences={experiences} itemVariants={itemVariants} />
        </div>
      </section>

      {/* Awards */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom mx-auto max-w-5xl">
          <AboutAwardsSection awards={awards} itemVariants={itemVariants} />
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {page.collaborationHeading}
            </h2>
            <p className="text-muted mb-8 max-w-2xl mx-auto">
              {page.collaborationBody}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary px-8 py-3 flex items-center gap-2">
                Get in Touch
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/publications" className="btn-secondary px-8 py-3 flex items-center gap-2">
                View Publications
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

