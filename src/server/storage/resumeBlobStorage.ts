import 'server-only';

import { del, get, put } from '@vercel/blob';

import { VERCEL_BLOB_STORED_PREFIX } from '@/lib/storagePathMarkers';

const MULTIPART_THRESHOLD_BYTES = 4.5 * 1024 * 1024;

/**
 * Production-style Vercel deploys: persist CV bytes in private Blob when token is present.
 * Local/dev without `VERCEL=1` keeps filesystem storage.
 */
export function shouldStoreResumeInVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim() && process.env.VERCEL === '1');
}

export function pathnameFromResumeStoredPath(storedPath: string): string | null {
  if (!storedPath.startsWith(VERCEL_BLOB_STORED_PREFIX)) {
    return null;
  }
  return storedPath.slice(VERCEL_BLOB_STORED_PREFIX.length);
}

export function resumeBlobPathnameForFilename(filename: string): string {
  return `admin-cv/${filename}`;
}

export async function uploadResumeBufferToBlob(input: {
  pathname: string;
  buffer: Buffer;
  contentType: string;
}): Promise<{ storedPath: string }> {
  const result = await put(input.pathname, input.buffer, {
    access: 'private',
    contentType: input.contentType,
    multipart: input.buffer.length >= MULTIPART_THRESHOLD_BYTES,
  });
  return { storedPath: `${VERCEL_BLOB_STORED_PREFIX}${result.pathname}` };
}

async function readableStreamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const parts: Buffer[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (value) {
      parts.push(Buffer.from(value));
    }
  }
  return Buffer.concat(parts);
}

export async function readResumeBlobToBuffer(storedPath: string): Promise<Buffer | null> {
  const pathname = pathnameFromResumeStoredPath(storedPath);
  if (!pathname) {
    return null;
  }
  const res = await get(pathname, { access: 'private', useCache: false });
  if (!res || res.statusCode !== 200 || res.stream === null) {
    return null;
  }
  return readableStreamToBuffer(res.stream);
}

export async function deleteResumeBlobIfStored(storedPath: string): Promise<void> {
  const pathname = pathnameFromResumeStoredPath(storedPath);
  if (!pathname) {
    return;
  }
  try {
    await del(pathname);
  } catch (e) {
    console.warn('[resume-blob] Failed to delete blob (non-fatal):', e);
  }
}
