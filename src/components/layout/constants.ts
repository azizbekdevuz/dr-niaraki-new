/** Lucide icon keys resolved in `Header.tsx` (keeps nav data serializable for CMS). */
export const NAV_ITEMS = [
  { href: '/', label: 'Home', iconKey: 'home' },
  { href: '/about', label: 'About', iconKey: 'about' },
  { href: '/research', label: 'Research', iconKey: 'research' },
  { href: '/publications', label: 'Publications', iconKey: 'publications' },
  { href: '/patents', label: 'Patents', iconKey: 'patents' },
  { href: '/contact', label: 'Contact', iconKey: 'contact' },
] as const;
  