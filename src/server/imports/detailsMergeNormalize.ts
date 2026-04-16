/** Pure normalization helpers for `mergeCvDetailsIntoSiteContent` — no I/O. */

export function nonEmptyLines(text: string | null | undefined): string[] {
  if (!text?.trim()) {
    return [];
  }
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export function publicationType(t: string | null | undefined): 'journal' | 'conference' | 'book' {
  if (t === 'chapter') {
    return 'book';
  }
  if (t === 'conference' || t === 'book') {
    return t;
  }
  return 'journal';
}

export function normalizedPublicationYear(year: number | null | undefined, ceilingYear: number): number {
  if (typeof year === 'number' && !Number.isNaN(year) && year >= 1900 && year <= ceilingYear) {
    return year;
  }
  return Math.min(ceilingYear, new Date().getFullYear());
}

export function awardImpactFrom(
  detailsText: string | null | undefined,
  raw: string | null | undefined,
  title: string,
  org: string,
  y: string,
): string {
  const body = (raw?.trim() || detailsText?.trim() || '').trim();
  if (body.length > 0) {
    return body.slice(0, 500);
  }
  if (org.trim() && y.trim()) {
    return `${title.trim()} (${org.trim()}, ${y.trim()})`.slice(0, 500);
  }
  return detailsText?.trim().slice(0, 500) || '—';
}

export function patentStatus(s: string | null | undefined): 'registered' | 'pending' {
  return s === 'registered' ? 'registered' : 'pending';
}

export function patentType(t: string | null | undefined): 'international' | 'korean' {
  return t === 'korean' ? 'korean' : 'international';
}
