'use client';

/**
 * Research page - Research interests, projects, and grants
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Microscope,
  Lightbulb,
  FolderGit2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { ResearchInterestCard } from '@/components/research/ResearchInterestCard';
import { ResearchProjectCard } from '@/components/research/ResearchProjectCard';
import { FilterChipButton } from '@/components/shared/FilterChipButton';
import { ListPagination } from '@/components/shared/ListPagination';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';
import { usePaginatedSlice } from '@/hooks/usePaginatedSlice';
import { TW_ACCENT_SOFT_GRADIENT } from '@/lib/ui/chromeClassStrings';

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

const RESEARCH_INTEREST_ICONS = {
  Lightbulb,
  Microscope,
  FolderGit2,
} as const;

type StatusFilter = 'all' | 'ongoing' | 'completed';

const RESEARCH_PROJECT_PAGE_SIZE = 3;

export default function ResearchPage() {
  const siteContent = usePublicSiteContent();
  const {
    heroIntro,
    collaborationHeading,
    collaborationBody,
    interests: researchInterests,
    projects: researchProjects,
  } = siteContent.research;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredProjects = researchProjects.filter(
    (project) => statusFilter === 'all' || project.status === statusFilter,
  );

  const projectsResetKey = useMemo(
    () => `${statusFilter}::${filteredProjects.map((p) => p.id).join('|')}`,
    [statusFilter, filteredProjects],
  );

  const {
    slice: pagedProjects,
    page: projectsPage,
    setPage: setProjectsPage,
    itemCount: projectsFilteredCount,
    pageSize: projectsPageSize,
  } = usePaginatedSlice(filteredProjects, RESEARCH_PROJECT_PAGE_SIZE, projectsResetKey);

  return (
    <main className="min-h-screen pt-20">
      <section className="section bg-gradient-to-b from-surface-tertiary to-transparent">
        <div className="container-custom text-center">
          <motion.div initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div
              variants={itemVariants}
              className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full ${TW_ACCENT_SOFT_GRADIENT}`}
            >
              <Microscope className="h-10 w-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              Research
            </motion.h1>
            <motion.p variants={itemVariants} className="mx-auto max-w-2xl text-secondary">
              {heroIntro}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <SectionHeading eyebrow="Focus areas" title="Research Interests" icon={Lightbulb} />
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2">
              {researchInterests.map((interest) => {
                const InterestIcon = RESEARCH_INTEREST_ICONS[interest.iconName];
                return (
                  <motion.div key={interest.id} variants={itemVariants}>
                    <ResearchInterestCard interest={interest} icon={InterestIcon} />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <motion.div variants={itemVariants} className="min-w-0 flex-1">
                <SectionHeading eyebrow="Programmes" title="Research Projects" icon={FolderGit2} className="!mb-0" />
              </motion.div>
              <motion.div variants={itemVariants} className="list-page-panel flex flex-shrink-0 flex-wrap gap-2">
                {(['all', 'ongoing', 'completed'] as StatusFilter[]).map((f) => (
                  <FilterChipButton key={f} selected={statusFilter === f} onClick={() => setStatusFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </FilterChipButton>
                ))}
              </motion.div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={statusFilter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <motion.div
                  key={projectsPage}
                  initial={{ opacity: 0.88, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {pagedProjects.map((project) => (
                    <ResearchProjectCard key={project.id} project={project} />
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            <ListPagination
              page={projectsPage}
              itemCount={projectsFilteredCount}
              pageSize={projectsPageSize}
              onPageChange={setProjectsPage}
              ariaLabel="Research projects pages"
            />
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card card-rich bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 p-8 text-center md:p-12"
          >
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">{collaborationHeading}</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted">{collaborationBody}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                Get in Touch
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link href="/publications" className="btn-secondary inline-flex items-center gap-2 px-8 py-3">
                View Publications
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
