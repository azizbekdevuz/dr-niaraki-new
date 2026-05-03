'use client';

/**
 * Contact page - Contact information and form
 */

import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  GraduationCap,
  Building,
  ExternalLink,
} from 'lucide-react';
import React from 'react';

import { ContactMessageForm } from '@/components/contact/ContactMessageForm';
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

const CONTACT_SOCIAL_ICON_MAP = {
  GraduationCap,
  Linkedin,
  Building,
} as const;

export default function ContactPage() {
  const siteContent = usePublicSiteContent();
  const { heroHeading, heroSubtext, mapPlaceLabel, mapQueryUrl, info: contactInfo, socialLinks } =
    siteContent.contact;

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
            <motion.div
              variants={itemVariants}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${TW_ACCENT_SOFT_GRADIENT}`}
            >
              <Mail className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {heroHeading}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto">
              {heroSubtext}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground mb-6">
                Contact Information
              </motion.h2>

              <div className="space-y-6">
                {/* Email */}
                <motion.div variants={itemVariants} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Email</h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-accent-primary hover:underline block"
                      >
                        {contactInfo.email}
                      </a>
                      <a
                        href={`mailto:${contactInfo.personalEmail}`}
                        className="text-muted text-sm hover:text-foreground"
                      >
                        {contactInfo.personalEmail}
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div variants={itemVariants} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Phone</h3>
                      <p className="text-secondary">Tel: {contactInfo.phone}</p>
                      <p className="text-muted text-sm">Fax: {contactInfo.fax}</p>
                      <p className="text-muted text-sm">Cell: {contactInfo.cellPhone}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Address */}
                <motion.div variants={itemVariants} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Office</h3>
                      <p className="text-secondary">{contactInfo.department}</p>
                      <p className="text-secondary">{contactInfo.university}</p>
                      <p className="text-muted text-sm mt-1">{contactInfo.address}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Website */}
                <motion.div variants={itemVariants} className="card p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground mb-1">Website</h3>
                      <a
                        href={`https://${contactInfo.websiteDisplay}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:underline flex items-center gap-1"
                      >
                        {contactInfo.websiteDisplay}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Social Links */}
              <motion.div variants={itemVariants} className="mt-8">
                <h3 className="font-medium text-foreground mb-4">Connect</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((social) => {
                    const SocIcon = CONTACT_SOCIAL_ICON_MAP[social.iconName];
                    return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-hover transition-colors"
                    >
                      <SocIcon className={`w-5 h-5 ${social.colorClass}`} />
                      <span className="text-foreground text-sm">{social.name}</span>
                    </a>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <ContactMessageForm
                directEmail={contactInfo.email}
                siteBrand={siteContent.meta.openGraphSiteName}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="section bg-surface-secondary/30">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card overflow-hidden"
          >
            <div className="aspect-video bg-surface-tertiary flex items-center justify-center">
              <div className="text-center text-muted">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{mapPlaceLabel}</p>
                <a
                  href={mapQueryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:underline flex items-center justify-center gap-1 mt-2"
                >
                  Open in Google Maps
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

