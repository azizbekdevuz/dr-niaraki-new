/**
 * Heuristic extraction for unrecognized CV sections.
 */

import type { Publication, Patent, ResearchProject } from '@/types/details';
import type { DetectedSection, ParseWarning } from '@/types/parser';

import { parseResearchSection } from './docxParserResearch';
import { createWarning } from './parserUtils';
import { parsePatents } from './patentsParser';
import { parsePublications } from './publicationsParser';

export function handleUnknownSection(section: DetectedSection): {
  publications: Publication[];
  patents: Patent[];
  projects: ResearchProject[];
  warnings: ParseWarning[];
} {
  const sectionLower = section.title.toLowerCase();
  const commonHeaders = ['header', 'footer', 'page', 'table of contents', 'references', 'appendix'];
  const isCommonHeader = commonHeaders.some((h) => sectionLower.includes(h));
  const result = {
    publications: [] as Publication[],
    patents: [] as Patent[],
    projects: [] as ResearchProject[],
    warnings: [] as ParseWarning[],
  };

  const hasPublicationKeywords =
    sectionLower.includes('journal') ||
    sectionLower.includes('paper') ||
    sectionLower.includes('publication') ||
    sectionLower.includes('book') ||
    sectionLower.includes('conference');

  if (hasPublicationKeywords && section.content.length > 200) {
    const pubResult = parsePublications(section.content);
    result.publications = pubResult.data;
    result.warnings.push(...pubResult.warnings);
    return result;
  }

  if (sectionLower.includes('patent') && section.content.length > 100) {
    const patResult = parsePatents(section.content);
    result.patents = patResult.data;
    result.warnings.push(...patResult.warnings);
    return result;
  }

  const hasResearchKeywords =
    sectionLower.includes('research project') ||
    sectionLower.includes('grant') ||
    sectionLower.includes('funding');

  if (hasResearchKeywords && section.content.length > 100) {
    result.projects = parseResearchSection(section.content);
    return result;
  }

  if (section.content.length > 100 && !isCommonHeader) {
    result.warnings.push(
      createWarning(
        'unknown_section',
        `Unrecognized section: "${section.title.slice(0, 50)}" - please review`,
        'info',
      ),
    );
  }

  return result;
}
