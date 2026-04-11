import 'server-only';

import type { ImportStatus, Prisma } from '@prisma/client';

import { addUploadMetadata, saveUploadedFile } from '@/lib/storage';
import { PARSER_VERSION, parseDocxToDetails } from '@/parser/docxParser';
import { createUploadedFileAndImport } from '@/server/imports/createImport';
import {
  buildDocxRawExtractEnvelope,
  detailsCandidateForImportStorage,
  heuristicImportWarnings,
  mergeImportWarningLists,
  parseWarningsToImportItems,
  resolveImportStatusAfterParse,
  zodIssuesToImportItems,
} from '@/server/imports/docxImportArtifacts';
import {
  persistImportParseFailure,
  persistImportParseOutcome,
} from '@/server/imports/repository';
import type { Details } from '@/types/details';
import type { ParseWarning } from '@/types/parser';
import { validateDetails } from '@/validators/detailsSchema';

export type DocxUploadImportSummary = {
  persisted: boolean;
  persistenceError?: string;
  uploadedFileId?: string;
  importId?: string;
  status?: ImportStatus;
  parserVersion?: string | null;
  warningCount?: number;
};

export type DocxUploadWithImportResult = {
  data: Details;
  parseWarnings: ParseWarning[];
  validation: { valid: boolean; errors: string[] };
  import: DocxUploadImportSummary;
};

/** Thrown when DOCX parsing throws after an import row was created — import is marked `FAILED` first. */
export class DocxImportParseError extends Error {
  constructor(
    message: string,
    readonly importSummary: DocxUploadImportSummary,
  ) {
    super(message);
    this.name = 'DocxImportParseError';
  }
}

function validationErrorsToStrings(errors: NonNullable<ReturnType<typeof validateDetails>['errors']>): string[] {
  return errors.map((e) => `${e.path.join('.')}: ${e.message}`);
}

/**
 * Saves DOCX to existing upload history, creates `UploadedFile` + `ContentImport`, runs the parser,
 * and persists raw extract / candidate / warnings on the import row. Does not touch draft/site content.
 */
export async function processDocxUploadWithImportPersistence(input: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  uploaderLabel: string | null;
}): Promise<DocxUploadWithImportResult> {
  const saved = await saveUploadedFile(input.buffer, input.originalName, input.uploaderLabel ?? undefined, {
    persistToLegacyUploadsMeta: false,
  });
  const storedPath = saved.storedPath;

  let importId: string | undefined;
  let uploadedFileId: string | undefined;

  try {
    const bundle = await createUploadedFileAndImport({
      originalName: input.originalName,
      storedPath,
      mimeType: input.mimeType,
      sizeBytes: saved.fileSizeBytes,
      sha256: saved.sha256,
      sourceFormat: 'DOCX',
    });
    uploadedFileId = bundle.uploadedFile.id;
    importId = bundle.import.id;
  } catch (e) {
    console.error('DOCX import DB persistence failed:', e);
    await addUploadMetadata({
      filename: saved.filename,
      originalName: input.originalName,
      uploadedAt: new Date().toISOString(),
      uploader: input.uploaderLabel ?? undefined,
      fileSizeBytes: saved.fileSizeBytes,
      sha256: saved.sha256,
      warnings: [],
      downloadUrl: `/uploads/${saved.filename}`,
    }).catch((err) => {
      console.warn('Failed to append legacy uploads manifest after DB failure:', err);
    });
    const { data, warnings } = await parseDocxToDetails(
      input.buffer,
      input.originalName,
      input.uploaderLabel ?? undefined,
    );
    const validation = validateDetails(data);
    return {
      data,
      parseWarnings: warnings,
      validation: {
        valid: validation.success,
        errors: validation.errors ? validationErrorsToStrings(validation.errors) : [],
      },
      import: {
        persisted: false,
        persistenceError: e instanceof Error ? e.message : 'Database error',
      },
    };
  }

  try {
    const { data, warnings } = await parseDocxToDetails(
      input.buffer,
      input.originalName,
      input.uploaderLabel ?? undefined,
    );
    const validation = validateDetails(data);
    const validationErrors = validation.errors ? validationErrorsToStrings(validation.errors) : [];
    const importWarnings = mergeImportWarningLists(
      parseWarningsToImportItems(warnings),
      zodIssuesToImportItems(validation.errors),
      heuristicImportWarnings(data),
    );
    const rawExtract = buildDocxRawExtractEnvelope({
      parserVersion: PARSER_VERSION,
      sourceFileName: input.originalName,
      parsedAt: data.meta.parsedAt,
      uploaderLabel: input.uploaderLabel,
      details: data,
      validationSuccess: validation.success,
      validationErrors,
      parseWarnings: warnings,
    });
    const status = resolveImportStatusAfterParse({
      validationSuccess: validation.success,
      parseWarnings: warnings,
    });
    const candidateJson = detailsCandidateForImportStorage(data);

    await persistImportParseOutcome(importId!, {
      rawExtract,
      candidatePayload: candidateJson as Prisma.InputJsonValue,
      warnings: importWarnings as Prisma.InputJsonValue,
      status,
      parserVersion: PARSER_VERSION,
    });

    return {
      data,
      parseWarnings: warnings,
      validation: { valid: validation.success, errors: validationErrors },
      import: {
        persisted: true,
        uploadedFileId,
        importId,
        status,
        parserVersion: PARSER_VERSION,
        warningCount: importWarnings.length,
      },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Parse failed';
    await persistImportParseFailure(importId!, {
      parserVersion: PARSER_VERSION,
      warnings: [
        {
          code: 'PARSE_EXCEPTION',
          message,
        },
      ] as Prisma.InputJsonValue,
    });
    throw new DocxImportParseError(message, {
      persisted: true,
      uploadedFileId,
      importId,
      status: 'FAILED',
      parserVersion: PARSER_VERSION,
      warningCount: 1,
    });
  }
}
