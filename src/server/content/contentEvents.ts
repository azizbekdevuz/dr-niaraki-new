import 'server-only';

import type { ContentEventType, Prisma } from '@prisma/client';

import { prisma } from '@/server/db/prisma';

export async function recordContentEvent(input: {
  eventType: ContentEventType;
  payload?: Prisma.InputJsonValue;
  versionId?: string;
}) {
  return prisma.contentEvent.create({
    data: {
      eventType: input.eventType,
      payload: input.payload ?? undefined,
      versionId: input.versionId ?? null,
    },
  });
}
