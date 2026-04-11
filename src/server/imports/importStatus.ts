import 'server-only';

import type { ImportStatus } from '@prisma/client';

const TERMINAL: ReadonlySet<ImportStatus> = new Set(['MERGED', 'REJECTED', 'FAILED']);

export function isTerminalImportStatus(status: ImportStatus): boolean {
  return TERMINAL.has(status);
}
