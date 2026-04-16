import { EXTERNAL_URLS } from './urls';

export const layoutSeed = {
  footer: {
    aboutHeading: 'Associate Professor',
    aboutBlurb:
      'Department of Computer Science & Engineering, Sejong University. Research in Extended Reality, Artificial Intelligence, and Geospatial Information Systems.',
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
        icon: 'GraduationCap',
      },
      {
        href: EXTERNAL_URLS.linkedinProfile,
        label: 'LinkedIn',
        icon: 'Linkedin',
      },
      {
        href: EXTERNAL_URLS.mailtoWork,
        label: 'Email',
        icon: 'Mail',
      },
    ],
    copyrightName: 'Dr. Abolghasem Sadeghi-Niaraki',
    researchFocusTitle: 'Research focus',
    researchFocusItems: [
      { id: 'geo-ai', title: 'Geo-AI & Spatial Computing' },
      { id: 'xr', title: 'Extended Reality (XR) Technologies' },
      { id: 'ml', title: 'AI & Machine Learning' },
    ],
    developerSection: {
      sectionTitle: 'Website',
      introLine: 'Designed & developed by',
      name: 'Azizbek Arzikulov',
      role: 'Full-Stack Developer',
      links: [
        {
          icon: 'portfolio',
          href: EXTERNAL_URLS.developerPortfolio,
          label: 'Portfolio website',
        },
        {
          icon: 'github',
          href: EXTERNAL_URLS.developerGitHub,
          label: 'GitHub profile',
        },
        {
          icon: 'linkedin',
          href: EXTERNAL_URLS.developerLinkedIn,
          label: 'LinkedIn profile',
        },
        {
          icon: 'mail',
          href: EXTERNAL_URLS.developerMailto,
          label: 'Email developer',
        },
      ],
    },
  },
} as const;
