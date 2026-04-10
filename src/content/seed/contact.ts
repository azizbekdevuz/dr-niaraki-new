import { EXTERNAL_URLS } from './urls';

export const contactSeed = {
  heroHeading: 'Get in Touch',
  heroSubtext:
    "Interested in research collaboration, academic partnerships, or have questions? I'd love to hear from you.",
  mapPlaceLabel: 'Sejong University, Seoul, South Korea',
  mapQueryUrl: 'https://maps.google.com/?q=Sejong+University+Seoul',
  info: {
    email: 'a.sadeghi@sejong.ac.kr',
    personalEmail: 'a.sadeqi313@gmail.com',
    phone: '+82 2-3408-2981',
    fax: '+82 2-3408-4321',
    cellPhone: '+82 10 4253-5-313',
    address: '209- Gwangjin-gu, Gunja-dong, Neungdong-ro, Seoul, Republic of Korea',
    department: 'Dept. of Computer Science & Engineering',
    university: 'Sejong University',
    websiteDisplay: 'www.abolghasemsadeghi-n.com',
  },
  socialLinks: [
    {
      name: 'Google Scholar',
      url: EXTERNAL_URLS.googleScholar,
      iconName: 'GraduationCap' as const,
      colorClass: 'text-blue-400',
    },
    {
      name: 'LinkedIn',
      url: EXTERNAL_URLS.linkedinProfile,
      iconName: 'Linkedin' as const,
      colorClass: 'text-blue-500',
    },
    {
      name: 'Sejong University',
      url: EXTERNAL_URLS.sejongPure,
      iconName: 'Building' as const,
      colorClass: 'text-accent-primary',
    },
  ],
} as const;
