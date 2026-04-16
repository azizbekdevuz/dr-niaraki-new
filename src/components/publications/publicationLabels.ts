export type PublicationTypeFilter = 'all' | 'journal' | 'conference' | 'book';

export function getPublicationTypeStyle(type: string): string {
  if (type === 'journal') {
    return 'bg-accent-primary/10 text-accent-primary';
  }
  if (type === 'book') {
    return 'bg-accent-secondary/10 text-accent-secondary';
  }
  return 'bg-accent-tertiary/10 text-accent-tertiary';
}

export function getPublicationTypeLabel(type: string): string {
  if (type === 'journal') {
    return 'Journal';
  }
  if (type === 'book') {
    return 'Book';
  }
  return 'Conference';
}
