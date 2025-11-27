'use client';

/**
 * Research page - Research interests, projects, and grants
 */

import { motion } from 'framer-motion';
import {
  Microscope,
  Lightbulb,
  FolderGit2,
  DollarSign,
  Calendar,
  Users,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

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

// Research interests data
const researchInterests = [
  {
    id: 'geo-ai',
    name: 'Geo-AI & Spatial Computing',
    description: 'Integration of artificial intelligence with geographic information systems for smart city applications, spatial analysis, and decision support systems.',
    keywords: ['Machine Learning', 'Deep Learning', 'Spatial Analysis', 'GIS', 'Smart Cities'],
    icon: Lightbulb,
  },
  {
    id: 'xr',
    name: 'Extended Reality (XR)',
    description: 'Research in Virtual Reality (VR), Augmented Reality (AR), and Mixed Reality (MR) applications for education, navigation, and human-computer interaction.',
    keywords: ['VR', 'AR', 'MR', 'Metaverse', 'HCI'],
    icon: Microscope,
  },
  {
    id: 'iot',
    name: 'IoT & Ubiquitous Computing',
    description: 'Development of sensor networks, ubiquitous systems, and context-aware computing solutions for environmental monitoring and smart environments.',
    keywords: ['Sensors', 'Ubiquitous GIS', 'Context-Aware', 'Smart Environment'],
    icon: FolderGit2,
  },
  {
    id: 'nlp',
    name: 'NLP & Language Models',
    description: 'Natural Language Processing applications including semantic analysis, information retrieval, and integration with geospatial systems.',
    keywords: ['NLP', 'LLM', 'Semantic Web', 'Information Retrieval'],
    icon: Lightbulb,
  },
];

// Research projects data
const researchProjects = [
  {
    id: 'xr-metaverse',
    title: 'Super-Realistic XR Technology Research Center',
    description: 'Research in Real-Virtual Interconnected Metaverse, developing cutting-edge XR technologies for immersive experiences.',
    period: '2022 - 2030',
    funding: 'IITP, Ministry of Science and ICT',
    amount: '~$750,000/year',
    status: 'ongoing',
    role: 'Key Research Member',
  },
  {
    id: 'mvr-rc',
    title: 'Mobile Virtual Reality Research Center (MVR-RC)',
    description: 'International mega research project collaborating with 14 universities across 8 countries and 11 industrial companies.',
    period: '2017 - 2021',
    funding: 'Korean Ministry of Science and ICT',
    amount: '~$660,000/year',
    status: 'completed',
    role: 'Key Research Member',
  },
  {
    id: 'ksp',
    title: 'Knowledge Sharing Project (KSP)',
    description: 'Industry/Trade Policy Consulting with ETRI and Iranian Vice Presidency for Science and Technology.',
    period: '2016 - 2017',
    funding: 'Ministry of Strategy and Finance',
    amount: '$300,000',
    status: 'completed',
    role: 'Strategic Consultant',
  },
  {
    id: 'malaria',
    title: 'Malaria Susceptibility Mapping',
    description: 'Development of GIS-based decision-making application for healthcare mapping and disease susceptibility analysis.',
    period: '2013 - 2015',
    funding: 'Korean National Research Foundation',
    amount: '$30,000',
    status: 'completed',
    role: 'Principal Investigator',
  },
];

// Filter options
type StatusFilter = 'all' | 'ongoing' | 'completed';

export default function ResearchPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredProjects = researchProjects.filter(
    project => statusFilter === 'all' || project.status === statusFilter
  );

  return (
    <main className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="section bg-gradient-to-b from-surface-tertiary to-transparent">
        <div className="container-custom text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 mb-6">
              <Microscope className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Research
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto">
              Advancing the frontiers of Geo-AI, Extended Reality, and Human-Computer Interaction 
              through innovative research and international collaboration.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Research Interests */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-accent-primary" />
              Research Interests
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-6">
              {researchInterests.map((interest) => (
                <motion.div
                  key={interest.id}
                  variants={itemVariants}
                  className="card p-6 hover:border-accent transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-primary/20 transition-colors">
                      <interest.icon className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{interest.name}</h3>
                      <p className="text-muted text-sm mb-3">{interest.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {interest.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="px-2 py-1 rounded bg-surface-secondary text-muted text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research Projects */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <FolderGit2 className="w-8 h-8 text-accent-primary" />
                Research Projects
              </motion.h2>

              {/* Filter */}
              <motion.div variants={itemVariants} className="flex gap-2">
                {(['all', 'ongoing', 'completed'] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      statusFilter === filter
                        ? 'bg-accent-primary text-white'
                        : 'bg-surface-secondary text-muted hover:text-foreground'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </motion.div>
            </div>

            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  layout
                  className="card p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          project.status === 'ongoing'
                            ? 'bg-success/10 text-success'
                            : 'bg-muted/10 text-muted'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-secondary text-sm mb-4">{project.description}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{project.period}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <Users className="w-4 h-4" />
                      <span>{project.role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span>{project.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted text-sm">
                      <FolderGit2 className="w-4 h-4" />
                      <span>{project.funding}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Collaboration CTA */}
      <section className="section">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-8 md:p-12 text-center bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Interested in Research Collaboration?
            </h2>
            <p className="text-muted mb-8 max-w-2xl mx-auto">
              I&apos;m always looking for talented researchers and students to collaborate on 
              cutting-edge projects in Geo-AI, XR, and spatial computing.
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

