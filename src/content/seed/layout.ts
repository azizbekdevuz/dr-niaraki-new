import { EXTERNAL_URLS } from './urls';

export const layoutSeed = {
  footer: {
    aboutHeading: 'Dr. Sadeghi-Niaraki',
    aboutBlurb:
      'Associate Professor at Sejong University, specializing in Extended Reality, Artificial Intelligence, and Geospatial Information Systems.',
    quickLinks: [
      { href: '/research', label: 'Research Areas' },
      { href: '/publications', label: 'Recent Publications' },
      { href: '/patents', label: 'Patents' },
      { href: '/contact', label: 'Contact' },
    ],
    socialLinks: [
      {
        href: EXTERNAL_URLS.googleScholar,
        label: 'Google Scholar',
        icon: '🎓',
      },
      {
        href: EXTERNAL_URLS.linkedinProfile,
        label: 'LinkedIn',
        icon: '💼',
      },
      {
        href: EXTERNAL_URLS.mailtoWork,
        label: 'Email',
        icon: '📧',
      },
    ],
    copyrightName: 'Dr. Abolghasem Sadeghi-Niaraki',
  },
} as const;
