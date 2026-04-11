import type {
  AboutAwardItem,
  AboutExperienceItem,
  AboutJourneyItem,
  PatentItem,
  PublicationItem,
  SiteContent,
} from '@/content/schema';
import { extractEditorSliceFromSiteContent } from '@/lib/draftEditorSlice';
import { diffIdLists, shallowFieldChanges, type StructuredListDiff } from '@/server/imports/importListDiff';

const LEGACY_UPLOADS_META_NOTE =
  '`uploads_meta.json` / mirrored upload files are legacy listing + download metadata only. Prisma `UploadedFile` + `ContentImport` are authoritative for imports, review, and merge-to-draft.';

export type ReviewChangedItem = { label: string; lines: string[] };

export type ImportReviewBlock = {
  id: string;
  title: string;
  unchangedSummary: string | null;
  added: string[];
  removed: string[];
  changed: ReviewChangedItem[];
};

export type ImportReviewProvenance = {
  importId: string;
  originalFileName: string;
  storedPath: string;
  uploadedFileId: string;
};

function truncate(s: string, max: number): string {
  if (s.length <= max) {
    return s;
  }
  return `${s.slice(0, max)}…`;
}

function formatScalarBlock(
  id: string,
  title: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  keys: readonly string[],
): ImportReviewBlock {
  const changes = shallowFieldChanges(before, after, keys);
  const changed: ReviewChangedItem[] =
    changes.length > 0
      ? [
          {
            label: 'Field updates',
            lines: changes.map((c) => `${c.field}: "${truncate(c.before, 160)}" → "${truncate(c.after, 160)}"`),
          },
        ]
      : [];
  return {
    id,
    title,
    unchangedSummary: changes.length === 0 ? 'No changes in this block after mapping.' : null,
    added: [],
    removed: [],
    changed,
  };
}

function formatListDiff(title: string, id: string, diff: StructuredListDiff): ImportReviewBlock {
  const changed: ReviewChangedItem[] = diff.changed.map((c) => ({
    label: `${c.label} (${c.id})`,
    lines: c.changes.map((ch) => `${ch.field}: "${truncate(ch.before, 120)}" → "${truncate(ch.after, 120)}"`),
  }));
  let unchangedSummary: string | null = null;
  if (diff.unchangedCount > 0) {
    unchangedSummary = `${diff.unchangedCount} item(s) unchanged (same id + compared fields).`;
  } else if (diff.added.length + diff.removed.length + diff.changed.length === 0) {
    unchangedSummary = 'No changes in this list.';
  }
  return {
    id,
    title,
    unchangedSummary,
    added: diff.added.map((e) => `[added] ${e.label} (id: ${e.id})`),
    removed: diff.removed.map((e) => `[removed] ${e.label} (id: ${e.id})`),
    changed,
  };
}

/**
 * Builds structured added / removed / changed review blocks from baseline vs merged SiteContent.
 */
export function buildStructuredReviewBlocks(
  baseline: SiteContent,
  merged: SiteContent,
  provenance: ImportReviewProvenance,
): ImportReviewBlock[] {
  const bSlice = extractEditorSliceFromSiteContent(baseline);
  const mSlice = extractEditorSliceFromSiteContent(merged);

  const profileBlock = formatScalarBlock(
    'profile',
    'Profile',
    bSlice.profile as unknown as Record<string, unknown>,
    mSlice.profile as unknown as Record<string, unknown>,
    ['displayName', 'roleLine', 'homeAboutIntro', 'aboutIntroTagline'],
  );

  const contactBlock = formatScalarBlock(
    'contact',
    'Contact',
    bSlice.contact as unknown as Record<string, unknown>,
    mSlice.contact as unknown as Record<string, unknown>,
    ['email', 'personalEmail', 'websiteDisplay'],
  );

  const summaryBefore = bSlice.aboutProfessionalSummaryText;
  const summaryAfter = mSlice.aboutProfessionalSummaryText;
  const summaryBlock: ImportReviewBlock =
    summaryBefore === summaryAfter
      ? {
          id: 'summary',
          title: 'Professional summary',
          unchangedSummary: 'Summary text identical after merge mapping.',
          added: [],
          removed: [],
          changed: [],
        }
      : {
          id: 'summary',
          title: 'Professional summary',
          unchangedSummary: null,
          added: [],
          removed: [],
          changed: [
            {
              label: 'Paragraph text',
              lines: [`Before (${summaryBefore.length} chars) / After (${summaryAfter.length} chars) differ.`],
            },
            {
              label: 'Before (preview)',
              lines: [truncate(summaryBefore, 600)],
            },
            {
              label: 'After (preview)',
              lines: [truncate(summaryAfter, 600)],
            },
          ],
        };

  const journeyDiff = diffIdLists<AboutJourneyItem>(
    baseline.about.journey,
    merged.about.journey,
    (j) => j.title,
    ['title', 'institution', 'year', 'details'],
  );

  const expDiff = diffIdLists<AboutExperienceItem>(
    baseline.about.experiences,
    merged.about.experiences,
    (e) => e.position,
    ['position', 'institution', 'duration', 'details', 'achievements', 'projects', 'type'],
  );

  const awardDiff = diffIdLists<AboutAwardItem>(
    baseline.about.awards,
    merged.about.awards,
    (a) => a.title,
    ['title', 'organization', 'year', 'details', 'impact', 'category'],
  );

  const pubDiff = diffIdLists<PublicationItem>(
    baseline.publications.items,
    merged.publications.items,
    (p) => p.title,
    ['title', 'authors', 'journal', 'year', 'type', 'doi'],
  );

  const patDiff = diffIdLists<PatentItem>(
    baseline.patents.items,
    merged.patents.items,
    (p) => p.title,
    ['title', 'number', 'country', 'date', 'inventors', 'status', 'type'],
  );

  const researchDiff = diffIdLists(
    baseline.research.interests,
    merged.research.interests,
    (r) => r.name,
    ['name', 'description', 'keywords'],
  );

  const provenanceBlock: ImportReviewBlock = {
    id: 'provenance',
    title: 'Import provenance',
    unchangedSummary: null,
    added: [],
    removed: [],
    changed: [
      {
        label: 'Source file',
        lines: [
          `Import id: ${provenance.importId}`,
          `Original name: ${provenance.originalFileName}`,
          `Stored path: ${provenance.storedPath}`,
          `UploadedFile id: ${provenance.uploadedFileId}`,
        ],
      },
    ],
  };

  return [
    provenanceBlock,
    profileBlock,
    contactBlock,
    summaryBlock,
    formatListDiff('Academic journey', 'journey', journeyDiff),
    formatListDiff('Professional experience', 'experiences', expDiff),
    formatListDiff('Awards', 'awards', awardDiff),
    formatListDiff('Publications (site list)', 'publications', pubDiff),
    formatListDiff('Patents (site list)', 'patents', patDiff),
    formatListDiff('Research interests', 'research_interests', researchDiff),
    {
      id: 'legacy_note',
      title: 'Upload history note',
      unchangedSummary: null,
      added: [],
      removed: [],
      changed: [{ label: 'Dual persistence', lines: [LEGACY_UPLOADS_META_NOTE] }],
    },
  ];
}

export { LEGACY_UPLOADS_META_NOTE };
