/**
 * APA-style block splitting for publication-heavy CV text.
 */

export function isPublicationProseNoiseLine(line: string): boolean {
  const t = line.trim();
  if (t.length < 30) {
    return false;
  }
  const l = t.toLowerCase();
  return (
    /^(over \d+|multiple books|regular contributor|publications have contributed|\d+\+ years)/i.test(l) ||
    /peer-reviewed publications in top-tier/i.test(l)
  );
}

/**
 * Splits APA-style citation blocks (Author, A. (YYYY). Title...) common in this CV.
 */
export function splitPublicationApaBlocks(text: string): string[] {
  const lines = text.split('\n');
  const out: string[] = [];
  let cur = '';

  const flush = () => {
    const t = cur.trim();
    if (t.length >= 55) {
      const head = t.split('\n')[0]?.trim() ?? '';
      if (!isPublicationProseNoiseLine(head)) {
        out.push(t);
      }
    }
    cur = '';
  };

  const isSubHeader = (s: string) => {
    const x = s.trim();
    return (
      /^(books?|book chapters|journal papers|conference papers|publications)\b/i.test(x) &&
      x.length < 100
    );
  };

  const isNewApaEntry = (line: string) => /^[A-Z].{12,240}\(\d{4}\)\.\s/.test(line.trim());

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      continue;
    }
    if (isSubHeader(t)) {
      flush();
      continue;
    }
    if (isPublicationProseNoiseLine(t)) {
      flush();
      continue;
    }
    if (isNewApaEntry(line) && cur.length > 80) {
      flush();
      cur = line;
    } else {
      cur = cur ? `${cur}\n${line}` : line;
    }
  }
  flush();
  return out.filter((e) => e.length >= 55);
}
