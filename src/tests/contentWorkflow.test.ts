import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

type MockVersion = {
  id: string;
  status: string;
  draftSlot: string | null;
  payload: unknown;
  label: string | null;
  changeSummary: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  publishSequence: number | null;
  importId: string | null;
};

const store = vi.hoisted(() => ({
  versions: [] as MockVersion[],
  events: [] as unknown[],
  idCounter: 0,
  reset() {
    store.versions = [];
    store.events = [];
    store.idCounter = 0;
  },
  nextId() {
    store.idCounter += 1;
    return `v-${store.idCounter}`;
  },
}));

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    contentVersion: {
      findUnique: vi.fn(async (args: { where: { id?: string; draftSlot?: string | null } }) => {
        if (args.where.draftSlot !== undefined && args.where.draftSlot !== null) {
          return store.versions.find((v) => v.draftSlot === args.where.draftSlot) ?? null;
        }
        if (args.where.id) {
          return store.versions.find((v) => v.id === args.where.id) ?? null;
        }
        return null;
      }),
      findFirst: vi.fn(async () => {
        const published = store.versions.filter(
          (v) => v.status === 'PUBLISHED' && v.publishSequence !== null && v.publishSequence !== undefined,
        );
        published.sort((a, b) => (b.publishSequence ?? 0) - (a.publishSequence ?? 0));
        return published[0] ?? null;
      }),
      findMany: vi.fn(async () =>
        [...store.versions]
          .filter((v) => v.status === 'PUBLISHED' || v.status === 'ARCHIVED')
          .sort((a, b) => (b.publishSequence ?? 0) - (a.publishSequence ?? 0)),
      ),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const id = store.nextId();
        const now = new Date();
        const row: MockVersion = {
          id,
          status: String(data.status),
          draftSlot: (data.draftSlot as string | null) ?? null,
          payload: data.payload,
          label: (data.label as string | null) ?? null,
          changeSummary: (data.changeSummary as string | null) ?? null,
          createdBy: (data.createdBy as string | null) ?? null,
          createdAt: now,
          updatedAt: now,
          publishedAt: (data.publishedAt as Date | null) ?? null,
          publishSequence: (data.publishSequence as number | null) ?? null,
          importId: (data.importId as string | null) ?? null,
        };
        store.versions.push(row);
        return { ...row };
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const idx = store.versions.findIndex((v) => v.id === where.id);
        if (idx < 0) {
          throw new Error('not found');
        }
        const prev = store.versions[idx];
        const row: MockVersion = {
          ...prev,
          ...data,
          updatedAt: new Date(),
        } as MockVersion;
        store.versions[idx] = row;
        return { ...row };
      }),
      aggregate: vi.fn(async () => {
        const nums = store.versions
          .map((v) => v.publishSequence)
          .filter((n): n is number => typeof n === 'number');
        return { _max: { publishSequence: nums.length ? Math.max(...nums) : null } };
      }),
    },
    contentEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        store.events.push(data);
        return data;
      }),
    },
  },
}));

describe('content workflow (mocked prisma)', () => {
  beforeEach(() => {
    store.reset();
    vi.clearAllMocks();
  });

  it(
    'creates a working draft from canonical content and records an event',
    async () => {
      const {
        createWorkingDraftFromCanonicalSiteContent,
        getWorkingDraft,
      } = await import('@/server/content/contentWorkflowCore');
      const row = await createWorkingDraftFromCanonicalSiteContent({ label: 'Test draft' });
      expect(row.status).toBe('DRAFT');
      expect(row.draftSlot).toBe('main');
      const again = await getWorkingDraft();
      expect(again?.id).toBe(row.id);
      expect(store.events.length).toBeGreaterThanOrEqual(1);
    },
    15_000,
  );

  it('refuses a second working draft while one exists', async () => {
    const { createWorkingDraftFromCanonicalSiteContent, ContentWorkflowError } = await import(
      '@/server/content/contentWorkflowCore'
    );
    await createWorkingDraftFromCanonicalSiteContent();
    await expect(createWorkingDraftFromCanonicalSiteContent()).rejects.toMatchObject({
      code: 'DRAFT_EXISTS',
    });
    try {
      await createWorkingDraftFromCanonicalSiteContent();
    } catch (e) {
      expect(e).toBeInstanceOf(ContentWorkflowError);
    }
  });

  it('refuses to save invalid payload', async () => {
    const { createWorkingDraftFromCanonicalSiteContent, saveWorkingDraft, ContentWorkflowError } =
      await import('@/server/content/contentWorkflowCore');
    await createWorkingDraftFromCanonicalSiteContent();
    await expect(saveWorkingDraft({ payload: { not: 'site content' } })).rejects.toMatchObject({
      code: 'INVALID_PAYLOAD',
    });
    try {
      await saveWorkingDraft({ payload: {} });
    } catch (e) {
      expect(e).toBeInstanceOf(ContentWorkflowError);
    }
  });

  it('publishes draft into an immutable published row and clears draft slot', async () => {
    const {
      createWorkingDraftFromCanonicalSiteContent,
      publishWorkingDraft,
      getWorkingDraft,
      getLatestPublishedVersion,
    } = await import('@/server/content/contentWorkflowCore');
    await createWorkingDraftFromCanonicalSiteContent();
    const published = await publishWorkingDraft({ label: 'Release 1' });
    expect(published.status).toBe('PUBLISHED');
    expect(published.draftSlot).toBeNull();
    expect(published.publishSequence).toBe(1);
    expect(await getWorkingDraft()).toBeNull();
    const latest = await getLatestPublishedVersion();
    expect(latest?.id).toBe(published.id);
    const pubEv = store.events.find(
      (e) => (e as { eventType?: string }).eventType === 'CONTENT_PUBLISHED',
    ) as { payload?: Record<string, unknown> } | undefined;
    expect(pubEv?.payload?.publishedVersionId).toBe(published.id);
    expect(pubEv?.payload?.supersededPublishedVersionId ?? null).toBeNull();
  });

  it('records importId and superseded version on publish when draft was import-linked', async () => {
    const { createWorkingDraftFromCanonicalSiteContent, publishWorkingDraft } = await import(
      '@/server/content/contentWorkflowCore'
    );
    await createWorkingDraftFromCanonicalSiteContent();
    const draftRow = store.versions[0];
    expect(draftRow).toBeDefined();
    draftRow!.importId = 'imp-from-test';
    store.events.length = 0;
    const first = await publishWorkingDraft({ label: 'R1' });
    expect(first.importId).toBe('imp-from-test');
    const ev1 = store.events.find((e) => (e as { eventType?: string }).eventType === 'CONTENT_PUBLISHED') as
      | { payload?: { importId?: string } }
      | undefined;
    expect(ev1?.payload?.importId).toBe('imp-from-test');

    const { createWorkingDraftFromCanonicalSiteContent: boot2, publishWorkingDraft: pub2 } = await import(
      '@/server/content/contentWorkflowCore'
    );
    await boot2();
    store.events.length = 0;
    const second = await pub2({ label: 'R2' });
    const ev2 = store.events.find((e) => (e as { eventType?: string }).eventType === 'CONTENT_PUBLISHED') as
      | { payload?: { supersededPublishedVersionId?: string } }
      | undefined;
    expect(ev2?.payload?.supersededPublishedVersionId).toBe(first.id);
    expect(second.publishSequence).toBe(2);
  });

  it('restoreVersionToDraft clones a published snapshot into a new working draft', async () => {
    const {
      createWorkingDraftFromCanonicalSiteContent,
      publishWorkingDraft,
      restoreVersionToDraft,
      getWorkingDraft,
    } = await import('@/server/content/contentWorkflowCore');
    await createWorkingDraftFromCanonicalSiteContent();
    const p = await publishWorkingDraft();
    const restored = await restoreVersionToDraft(p.id, { changeSummary: 'rollback test' });
    expect(restored.status).toBe('DRAFT');
    expect(restored.draftSlot).toBe('main');
    expect(restored.id).not.toBe(p.id);
    const working = await getWorkingDraft();
    expect(working?.id).toBe(restored.id);
    const restoreEv = store.events.find(
      (e) => (e as { eventType?: string }).eventType === 'CONTENT_RESTORED_TO_DRAFT',
    ) as { payload?: { sourcePublishedImportId?: string | null } } | undefined;
    expect(restoreEv?.payload?.sourcePublishedImportId ?? null).toBeNull();
  });

  it('restore event carries source published import id when present', async () => {
    const { createWorkingDraftFromCanonicalSiteContent, publishWorkingDraft, restoreVersionToDraft } = await import(
      '@/server/content/contentWorkflowCore'
    );
    await createWorkingDraftFromCanonicalSiteContent();
    const d = store.versions[0]!;
    d.importId = 'imp-restore-src';
    const p = await publishWorkingDraft();
    store.events.length = 0;
    await restoreVersionToDraft(p.id);
    const restoreEv = store.events.find(
      (e) => (e as { eventType?: string }).eventType === 'CONTENT_RESTORED_TO_DRAFT',
    ) as { payload?: { sourcePublishedImportId?: string | null } } | undefined;
    expect(restoreEv?.payload?.sourcePublishedImportId).toBe('imp-restore-src');
  });

  it('refuses restore while a draft exists', async () => {
    const {
      createWorkingDraftFromCanonicalSiteContent,
      publishWorkingDraft,
      restoreVersionToDraft,
    } = await import('@/server/content/contentWorkflowCore');
    await createWorkingDraftFromCanonicalSiteContent();
    const p = await publishWorkingDraft();
    await createWorkingDraftFromCanonicalSiteContent();
    await expect(restoreVersionToDraft(p.id)).rejects.toMatchObject({ code: 'DRAFT_EXISTS' });
  });
});
