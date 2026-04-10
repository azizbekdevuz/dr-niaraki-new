import { EXTERNAL_URLS } from './urls';

export const homeSeed = {
  hero: {
    title: 'Pioneering the Future of XR & AI',
    subtitle: 'Shaping the Next Frontier in Human-Computer Interaction',
    body: 'Dr. Niaraki-Sadeghi is a leading researcher in Extended Reality and Artificial Intelligence, dedicated to transforming education and human-computer interaction through innovative technologies.',
  },
  aboutSectionHeading: 'About Dr. Niaraki-Sadeghi',
  aboutSectionIntro:
    'A distinguished researcher and educator dedicated to advancing the frontiers of Extended Reality and Artificial Intelligence in academic and industrial settings.',
  researchInActionCaption:
    'Demonstration of cutting-edge XR applications in educational environments.',
  researchCards: [
    {
      title: 'Research Projects',
      description: 'Explore ongoing and completed research initiatives.',
      link: '/research',
      iconName: 'Github' as const,
    },
    {
      title: 'Publications',
      description: 'Access scholarly articles and academic publications.',
      link: '/publications',
      iconName: 'Linkedin' as const,
    },
    {
      title: 'Collaborations',
      description: 'Discover opportunities for academic partnerships.',
      link: '/contact',
      iconName: 'Handshake' as const,
    },
  ],
  socialLinks: [
    {
      name: 'Scholar',
      url: EXTERNAL_URLS.googleScholar,
      ariaLabel: 'Google Scholar Profile',
      iconName: 'GraduationCap' as const,
    },
    {
      name: 'LinkedIn',
      url: EXTERNAL_URLS.linkedinProfile,
      ariaLabel: 'LinkedIn Profile',
      iconName: 'Linkedin' as const,
    },
    {
      name: 'Sejong University',
      url: EXTERNAL_URLS.sejongPure,
      ariaLabel: 'Current School Profile',
      iconName: 'BriefcaseBusiness' as const,
    },
  ],
} as const;
