'use client';

import { motion, type Variants } from 'framer-motion';
import { Award, Briefcase, ChevronRight, GraduationCap } from 'lucide-react';
import React, { useMemo } from 'react';

import { ListPagination } from '@/components/shared/ListPagination';
import { SectionHeading } from '@/components/shared/SectionHeading';
import type { AboutAwardItem, AboutExperienceItem, AboutJourneyItem } from '@/content/types';
import { usePaginatedSlice } from '@/hooks/usePaginatedSlice';

const JOURNEY_PAGE_SIZE = 3;
const EXPERIENCE_PAGE_SIZE = 3;
const AWARDS_PAGE_SIZE = 3;

type SectionProps = {
  itemVariants: Variants;
};

/**
 * Paginated journey must not wrap rows in `whileInView` + child `variants`:
 * after `once`, new rows mount without a fresh parent animation and can stay at variant `hidden` (invisible).
 */
export function AboutJourneySection({
  journey,
  itemVariants,
}: SectionProps & { journey: readonly AboutJourneyItem[] }) {
  const resetToken = useMemo(() => journey.map((j) => j.id).join('|'), [journey]);
  const { slice, page, setPage, itemCount, pageSize } = usePaginatedSlice(
    journey,
    JOURNEY_PAGE_SIZE,
    resetToken,
  );

  return (
    <div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
        <SectionHeading eyebrow="Education & research path" title="Academic Journey" icon={GraduationCap} />
      </motion.div>

      <div key={page} className="space-y-6">
        {slice.map((item) => (
          <div key={item.id} className="card card-rich p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex-shrink-0">
                <span className="inline-block rounded-full bg-accent-primary/15 px-3 py-1 text-sm font-medium text-accent-primary ring-1 ring-accent-primary/20">
                  {item.year}
                </span>
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mb-2 text-accent-primary">{item.institution}</p>
                <p className="text-sm leading-relaxed text-muted">{item.details}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ListPagination
        page={page}
        itemCount={itemCount}
        pageSize={pageSize}
        onPageChange={setPage}
        ariaLabel="Academic journey pages"
      />
    </div>
  );
}

export function AboutExperienceSection({
  experiences,
  itemVariants,
}: SectionProps & { experiences: readonly AboutExperienceItem[] }) {
  const resetToken = useMemo(() => experiences.map((e) => e.id).join('|'), [experiences]);
  const { slice, page, setPage, itemCount, pageSize } = usePaginatedSlice(
    experiences,
    EXPERIENCE_PAGE_SIZE,
    resetToken,
  );

  return (
    <div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
        <SectionHeading eyebrow="Career" title="Professional Experience" icon={Briefcase} className="!mb-8" />
      </motion.div>

      <div key={page} className="space-y-6">
        {slice.map((exp) => (
          <div key={exp.id} className="card card-rich p-6">
            <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{exp.position}</h3>
                <p className="text-accent-primary">{exp.institution}</p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-surface-secondary px-3 py-1 text-sm text-muted">
                {exp.duration}
              </span>
            </div>
            <p className="mb-4 text-secondary">{exp.details}</p>

            {exp.achievements.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-foreground">Key Achievements:</h4>
                <ul className="grid gap-2 md:grid-cols-2">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-primary" aria-hidden />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <ListPagination
        page={page}
        itemCount={itemCount}
        pageSize={pageSize}
        onPageChange={setPage}
        ariaLabel="Professional experience pages"
      />
    </div>
  );
}

export function AboutAwardsSection({
  awards,
  itemVariants,
}: SectionProps & { awards: readonly AboutAwardItem[] }) {
  const resetToken = useMemo(() => awards.map((a) => a.id).join('|'), [awards]);
  const { slice, page, setPage, itemCount, pageSize } = usePaginatedSlice(
    awards,
    AWARDS_PAGE_SIZE,
    resetToken,
  );

  return (
    <div>
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={itemVariants}>
        <SectionHeading eyebrow="Recognition" title="Awards & Recognition" icon={Award} />
      </motion.div>

      <div key={page} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {slice.map((award) => (
          <div key={award.id} className="card card-rich p-6">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" aria-hidden />
              <span className="text-sm font-medium text-warning">{award.year}</span>
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{award.title}</h3>
            <p className="mb-2 text-sm text-accent-primary">{award.organization}</p>
            <p className="text-sm leading-relaxed text-muted">{award.details}</p>
          </div>
        ))}
      </div>

      <ListPagination
        page={page}
        itemCount={itemCount}
        pageSize={pageSize}
        onPageChange={setPage}
        ariaLabel="Awards pages"
      />
    </div>
  );
}
