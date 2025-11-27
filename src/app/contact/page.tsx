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
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
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

// Contact info
const contactInfo = {
  email: 'a.sadeghi@sejong.ac.kr',
  personalEmail: 'a.sadeqi313@gmail.com',
  phone: '+82 2-3408-2981',
  fax: '+82 2-3408-4321',
  cellPhone: '+82 10 4253-5-313',
  address: '209- Gwangjin-gu, Gunja-dong, Neungdong-ro, Seoul, Republic of Korea',
  department: 'Dept. of Computer Science & Engineering',
  university: 'Sejong University',
  website: 'www.abolghasemsadeghi-n.com',
};

const socialLinks = [
  {
    name: 'Google Scholar',
    url: 'https://scholar.google.com/citations?user=-V8_A5YAAAAJ&hl=en',
    icon: GraduationCap,
    color: 'text-blue-400',
  },
  {
    name: 'LinkedIn',
    url: 'https://kr.linkedin.com/in/abolghasem-sadeghi-niaraki-62669b14',
    icon: Linkedin,
    color: 'text-blue-500',
  },
  {
    name: 'Sejong University',
    url: 'https://sejong.elsevierpure.com/en/persons/sadeghi-niaraki-abolghasem',
    icon: Building,
    color: 'text-accent-primary',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    // Simulate form submission (in production, this would send an email)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, just show success
    setSent(true);
    setSending(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
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
              <Mail className="w-10 h-10 text-accent-primary" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </motion.h1>
            <motion.p variants={itemVariants} className="text-secondary max-w-2xl mx-auto">
              Interested in research collaboration, academic partnerships, or have questions?
              I&apos;d love to hear from you.
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
                        href={`https://${contactInfo.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent-primary hover:underline flex items-center gap-1"
                      >
                        {contactInfo.website}
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
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-secondary hover:bg-surface-hover transition-colors"
                    >
                      <social.icon className={`w-5 h-5 ${social.color}`} />
                      <span className="text-foreground text-sm">{social.name}</span>
                    </a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-2xl font-bold text-foreground mb-6">
                Send a Message
              </motion.h2>

              <motion.div variants={itemVariants} className="card p-6">
                {sent ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-success" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted mb-6">
                      Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                    </p>
                    <button
                      onClick={() => setSent(false)}
                      className="btn-secondary px-6 py-2"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-secondary mb-2">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-secondary mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-surface-secondary border border-primary focus:border-accent focus:ring-1 focus:ring-accent-primary outline-none transition-all text-foreground resize-none"
                        required
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-error text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Note */}
              <motion.p variants={itemVariants} className="mt-4 text-muted text-sm text-center">
                For urgent matters, please contact via email directly.
              </motion.p>
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
                <p>Sejong University, Seoul, South Korea</p>
                <a
                  href="https://maps.google.com/?q=Sejong+University+Seoul"
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

