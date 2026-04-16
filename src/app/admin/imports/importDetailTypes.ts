export type ImportDetailModel = {
  id: string;
  status: string;
  originalFileName: string;
  parserVersion: string | null;
  warnings: { message: string; code?: string }[];
  candidateSummary: {
    profileName: string | null;
    publicationCount: number;
    patentCount: number;
    rawHtmlTruncated: boolean;
  } | null;
};

export type ImportReviewProvenanceModel = {
  importId: string;
  originalFileName: string;
  storedPath: string;
  uploadedFileId: string;
};

export type ImportReviewBlockModel = {
  id: string;
  title: string;
  unchangedSummary: string | null;
  added: string[];
  removed: string[];
  changed: { label: string; lines: string[] }[];
};

export type ReviewPayloadModel = {
  baselineSource: string;
  blocks: ImportReviewBlockModel[];
  warnings: { message: string; code?: string }[];
  provenance: ImportReviewProvenanceModel | null;
  legacyUploadsMetaNote: string;
};
