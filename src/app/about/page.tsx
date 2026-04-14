'use client';

/**
 * About page - Full biography and academic information
 */

import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Briefcase, 
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

import { usePublicSiteContent } from '@/contexts/PublicSiteContentContext';

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
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 blur-2xl" />
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
      <section className="py-12 bg-surface-secondary/30">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {statsRow.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="card text-center p-6"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-accent-primary" />
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-muted text-sm">{stat.label}</p>
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
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Professional Summary
            </motion.h2>
            <motion.div variants={itemVariants} className="card p-6 md:p-8">
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
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-accent-primary" />
              Academic Journey
            </motion.h2>
            
            <div className="space-y-6">
              {journey.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="card p-6 hover:border-accent transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-shrink-0">
                      <span className="inline-block px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-sm font-medium">
                        {item.year}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-accent-primary mb-2">{item.institution}</p>
                      <p className="text-muted text-sm">{item.details}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Experience */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-accent-primary" />
              Professional Experience
            </motion.h2>
            
            <div className="space-y-6">
              {experiences.map((exp) => (
                <motion.div
                  key={exp.id}
                  variants={itemVariants}
                  className="card p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{exp.position}</h3>
                      <p className="text-accent-primary">{exp.institution}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-surface-secondary text-muted text-sm whitespace-nowrap">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-secondary mb-4">{exp.details}</p>
                  
                  {exp.achievements.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Key Achievements:</h4>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {exp.achievements.map((achievement, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted text-sm">
                            <ChevronRight className="w-4 h-4 text-accent-primary flex-shrink-0 mt-0.5" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Awards */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
              <Award className="w-8 h-8 text-accent-primary" />
              Awards & Recognition
            </motion.h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {awards.map((award) => (
                <motion.div
                  key={award.id}
                  variants={itemVariants}
                  className="card p-6 hover:border-accent transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-warning" />
                    <span className="text-warning text-sm">{award.year}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{award.title}</h3>
                  <p className="text-accent-primary text-sm mb-2">{award.organization}</p>
                  <p className="text-muted text-sm">{award.details}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
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

