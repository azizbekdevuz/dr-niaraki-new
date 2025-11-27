'use client';

/**
 * Publications page - Academic publications and citations
 */

import { motion } from 'framer-motion';
import {
  FileText,
  Book,
  BookOpen,
  ExternalLink,
  Search,
  Calendar,
  Award,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Publication types
type PublicationType = 'all' | 'journal' | 'conference' | 'book';

// Sample publications data (would come from details.json in production)
const publications = [
  {
    id: '1',
    title: 'Cutting-Edge Strategies for Absence Data Identification in Natural Hazards: Leveraging Voronoi-Entropy in Flood Susceptibility Mapping with Advanced AI Techniques',
    authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
    journal: 'Journal of Hydrology',
    year: 2024,
    type: 'journal',
    impactFactor: '5.9',
    quartile: 'Q1',
    doi: '10.1016/j.jhydrol.2024.xxx',
  },
  {
    id: '2',
    title: 'Spatio-Temporal Modeling of Asthma-Prone Areas: Exploring the Influence of Urban Climate Factors with Explainable Artificial Intelligence (XAI)',
    authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
    journal: 'Sustainable Cities and Society',
    year: 2024,
    type: 'journal',
    impactFactor: '10.5',
    quartile: 'Q1',
    doi: '10.1016/j.scs.2024.xxx',
  },
  {
    id: '3',
    title: 'Assessment of Noise Pollution-Prone Areas using an Explainable Geospatial Artificial Intelligence Approach',
    authors: 'Razavi-Termeh, S. V., Sadeghi-Niaraki, A., et al.',
    journal: 'Journal of Environmental Management',
    year: 2024,
    type: 'journal',
    impactFactor: '8.0',
    quartile: 'Q1',
    doi: '10.1016/j.jenvman.2024.xxx',
  },
  {
    id: '4',
    title: 'Internet of Thing (IoT) review of review: Bibliometric overview since its foundation',
    authors: 'Sadeghi-Niaraki, A.',
    journal: 'Future Generation Computer Systems',
    year: 2023,
    type: 'journal',
    impactFactor: '7.3',
    quartile: 'Q1',
    doi: '10.1016/j.future.2023.xxx',
  },
  {
    id: '5',
    title: 'AR Search Engine: Semantic Information Retrieval for Augmented Reality Domain',
    authors: 'Shakeri, M., Sadeghi-Niaraki, A., et al.',
    journal: 'Sustainability',
    year: 2022,
    type: 'journal',
    impactFactor: '3.9',
    quartile: 'Q2',
    doi: '10.3390/su142315681',
  },
  {
    id: '6',
    title: 'Ontology-based and User-centric Spatial Modeling in GIS: Basics, Concepts, Methods, Applications',
    authors: 'Sadeghi-Niaraki, A.',
    journal: 'VDM Publishing',
    year: 2009,
    type: 'book',
  },
  {
    id: '7',
    title: 'Python Programming for Engineering especially for GIS Engineering',
    authors: 'Sadeghi-Niaraki, A., Shakeri, M.',
    journal: 'K.N.Toosi University Publication',
    year: 2015,
    type: 'book',
  },
  {
    id: '8',
    title: 'Spatial Analysis Programming using Python',
    authors: 'Sadeghi-Niaraki, A., Shakeri, M.',
    journal: 'K.N.Toosi University Publication',
    year: 2016,
    type: 'book',
  },
];

// Stats
const publicationStats = {
  total: 200,
  journals: 120,
  conferences: 60,
  books: 5,
  citations: 2500,
};

export default function PublicationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PublicationType>('all');
  const [yearSort, setYearSort] = useState<'desc' | 'asc'>('desc');

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    return publications
      .filter((pub) => {
        const matchesSearch =
          searchQuery === '' ||
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.journal.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || pub.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        return yearSort === 'desc' ? b.year - a.year : a.year - b.year;
      });
  }, [searchQuery, typeFilter, yearSort]);

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
              <FileText className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Publications
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto mb-8">
              Over 200 peer-reviewed publications in top-tier international journals and conferences,
              contributing to the advancement of Geo-AI, XR, and spatial computing.
            </motion.p>
            
            {/* Google Scholar Link */}
            <motion.a
              variants={itemVariants}
              href="https://scholar.google.com/citations?user=-V8_A5YAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
              <Award className="w-5 h-5" />
              View on Google Scholar
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-surface-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Publications', value: `${publicationStats.total}+`, icon: FileText },
              { label: 'Journal Papers', value: `${publicationStats.journals}+`, icon: BookOpen },
              { label: 'Conferences', value: `${publicationStats.conferences}+`, icon: FileText },
              { label: 'Books', value: `${publicationStats.books}`, icon: Book },
              { label: 'Citations', value: `${publicationStats.citations}+`, icon: Award },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-accent-primary" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-muted text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="section">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                placeholder="Search publications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {(['all', 'journal', 'conference', 'book'] as PublicationType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    typeFilter === type
                      ? 'bg-accent-primary text-white'
                      : 'bg-surface-secondary text-muted hover:text-foreground'
                  }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                </button>
              ))}
            </div>

            {/* Sort */}
            <button
              onClick={() => setYearSort(yearSort === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-surface-secondary text-muted hover:text-foreground transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>{yearSort === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>

          {/* Publications List */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-4"
          >
            {filteredPublications.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No publications found matching your criteria.</p>
              </div>
            ) : (
              filteredPublications.map((pub) => (
                <motion.article
                  key={pub.id}
                  variants={itemVariants}
                  layout
                  className="card p-6 hover:border-accent transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          pub.type === 'journal'
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : pub.type === 'book'
                            ? 'bg-accent-secondary/10 text-accent-secondary'
                            : 'bg-accent-tertiary/10 text-accent-tertiary'
                        }`}>
                          {pub.type === 'journal' ? 'Journal' : pub.type === 'book' ? 'Book' : 'Conference'}
                        </span>
                        <span className="text-muted text-sm">{pub.year}</span>
                        {pub.quartile && (
                          <span className="px-2 py-0.5 rounded bg-success/10 text-success text-xs">
                            {pub.quartile}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent-primary transition-colors">
                        {pub.title}
                      </h3>
                      
                      <p className="text-muted text-sm mb-2">{pub.authors}</p>
                      
                      <p className="text-secondary text-sm">
                        {pub.journal}
                        {pub.impactFactor && <span className="text-muted"> • IF: {pub.impactFactor}</span>}
                      </p>
                    </div>

                    {pub.doi && (
                      <a
                        href={`https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-accent-primary text-sm hover:underline flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                        DOI
                      </a>
                    )}
                  </div>
                </motion.article>
              ))
            )}
          </motion.div>

          {/* Load More / See All */}
          <div className="mt-8 text-center">
            <a
              href="https://scholar.google.com/citations?user=-V8_A5YAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary px-8 py-3 inline-flex items-center gap-2"
            >
              View All on Google Scholar
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

