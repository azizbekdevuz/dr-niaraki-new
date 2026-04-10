import 'server-only';

import type { ContentVersionStatus } from '@prisma/client';

import { prisma } from '@/server/db/prisma';

/**
 * Low-level listing by status (e.g. admin diagnostics). Prefer `listContentVersions` from `./versions`
 * for the public version history UX.
 */
export async function listContentVersionsByStatus(status: ContentVersionStatus, take = 50) {
  return prisma.contentVersion.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
    take,
  });
}
