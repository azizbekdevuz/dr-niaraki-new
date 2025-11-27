'use client';

/**
 * Patents page - Registered and pending patents
 */

import { motion } from 'framer-motion';
import {
  Shield,
  Globe,
  Flag,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
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

// Patent types
type PatentFilter = 'all' | 'international' | 'korean' | 'pending';

// Sample patents data (would come from details.json in production)
const patents = [
  {
    id: '1',
    title: 'Tourist Accommodation Recommendation Method and System Using Multi-Criteria Decision-Making and Augmented Reality',
    number: 'US11,816,804B2',
    country: 'US',
    date: 'Nov 14, 2023',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi, Somaieh Rokhsaritalemi',
    status: 'registered',
    type: 'international',
  },
  {
    id: '2',
    title: 'IoT-Based Approach Method for Learning Geometric Shapes in Early Childhood and Device Thereof',
    number: '18/821,509',
    country: 'US',
    date: 'Aug 30, 2024',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi, et al.',
    status: 'pending',
    type: 'international',
  },
  {
    id: '3',
    title: 'Semantic Information Retrieval Method for Augmented Reality Domain and Device Thereof',
    number: '18/818,158',
    country: 'US',
    date: 'Aug 28, 2024',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi, Tamer Abuhmed',
    status: 'pending',
    type: 'international',
  },
  {
    id: '4',
    title: 'Geospatial Information System-Based Modeling Approach for Leakage Management in Urban Water Distribution Networks',
    number: '10-2356500',
    country: 'Korea',
    date: 'Jan 24, 2022',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi',
    status: 'registered',
    type: 'korean',
  },
  {
    id: '5',
    title: 'Groundwater Potential Mapping Using Integrated Ensemble of Three Bivariate Statistical Models',
    number: '10-2307898',
    country: 'Korea',
    date: 'Sept 27, 2021',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi',
    status: 'registered',
    type: 'korean',
  },
  {
    id: '6',
    title: 'Method and Apparatus for Enhancing Response Coordination through Assessment of Response Network Structural Dynamics',
    number: '10-22089060',
    country: 'Korea',
    date: 'Jan 22, 2021',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi',
    status: 'registered',
    type: 'korean',
  },
  {
    id: '7',
    title: 'Context-Aware Route Finding Algorithm for Self-Driving Tourists Using Ontology',
    number: '10-2148349',
    country: 'Korea',
    date: 'Aug 20, 2020',
    inventors: 'Abolghasem Sadeghi-Niaraki, Soo-Mi Choi',
    status: 'registered',
    type: 'korean',
  },
  {
    id: '8',
    title: 'Method and Device for Generating a Wildfire Vulnerability Map Using Artificial Intelligence',
    number: '10-2706021',
    country: 'Korea',
    date: 'Sept 09, 2024',
    inventors: 'Soo-Mi Choi, Abolghasem Sadeghi-Niaraki',
    status: 'registered',
    type: 'korean',
  },
];

// Stats
const patentStats = {
  total: 42,
  international: 3,
  korean: 20,
  pending: 19,
};

export default function PatentsPage() {
  const [filter, setFilter] = useState<PatentFilter>('all');

  // Filter patents
  const filteredPatents = useMemo(() => {
    return patents.filter((patent) => {
      if (filter === 'all') return true;
      if (filter === 'pending') return patent.status === 'pending';
      return patent.type === filter;
    });
  }, [filter]);

  const getStatusIcon = (status: string) => {
    return status === 'registered' ? CheckCircle : Clock;
  };

  const getStatusColor = (status: string) => {
    return status === 'registered' ? 'text-success' : 'text-warning';
  };

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
              <Shield className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Patents
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto">
              42+ patents registered and completed in spatial analysis, XR technologies, 
              and AI-driven systems across US and Korea.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-surface-secondary/30">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Patents', value: `${patentStats.total}+`, icon: Shield },
              { label: 'International (US)', value: `${patentStats.international}`, icon: Globe },
              { label: 'Korean', value: `${patentStats.korean}+`, icon: Flag },
              { label: 'Pending', value: `${patentStats.pending}+`, icon: Clock },
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

      {/* Patents List */}
      <section className="section">
        <div className="container-custom">
          {/* Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { value: 'all', label: 'All Patents' },
              { value: 'international', label: 'International' },
              { value: 'korean', label: 'Korean' },
              { value: 'pending', label: 'Pending' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as PatentFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-accent-primary text-white'
                    : 'bg-surface-secondary text-muted hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Patents Grid */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-6"
          >
            {filteredPatents.map((patent) => {
              const StatusIcon = getStatusIcon(patent.status);
              const statusColor = getStatusColor(patent.status);
              
              return (
                <motion.article
                  key={patent.id}
                  variants={itemVariants}
                  layout
                  className="card p-6 hover:border-accent transition-all"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {patent.country === 'US' ? (
                        <Globe className="w-5 h-5 text-accent-primary" />
                      ) : (
                        <Flag className="w-5 h-5 text-accent-secondary" />
                      )}
                      <span className="text-muted text-sm">{patent.country}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${statusColor}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="text-xs capitalize">{patent.status}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2">
                    {patent.title}
                  </h3>

                  <div className="space-y-2 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="font-mono">{patent.number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{patent.date}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-muted text-sm line-clamp-2">
                    Inventors: {patent.inventors}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>

          {filteredPatents.length === 0 && (
            <div className="text-center py-12 text-muted">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No patents found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-b from-transparent via-surface-tertiary to-transparent">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Interested in Technology Licensing?
            </h2>
            <p className="text-muted mb-8 max-w-2xl mx-auto">
              Our patented technologies are available for licensing and collaboration. 
              Contact us to explore partnership opportunities.
            </p>
            <Link href="/contact" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
              Get in Touch
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

