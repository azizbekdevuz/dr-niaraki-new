/**
 * File storage helpers for upload management
 * Handles saving files to /public/uploads and computing hashes
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

import type { UploadMetaFile, UploadHistoryItem } from '@/types/admin';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const UPLOADS_META_FILE = path.join(UPLOADS_DIR, 'uploads_meta.json');

/**
 * Ensures the uploads directory exists
 */
export async function ensureUploadsDir(): Promise<void> {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch {
    // Directory may already exist
  }
}

/**
 * Generates filename with timestamp format: resume_YYYY-MM-DD_HH-MM.docx
 */
export function generateUploadFilename(originalName: string): string {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .slice(0, 16);
  
  const ext = path.extname(originalName) || '.docx';
  return `resume_${timestamp}${ext}`;
}

/**
 * Computes SHA-256 hash of a buffer
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Saves an uploaded file to the uploads directory
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string,
  uploader?: string
): Promise<{
  filename: string;
  filepath: string;
  sha256: string;
  fileSizeBytes: number;
}> {
  await ensureUploadsDir();
  
  const filename = generateUploadFilename(originalName);
  const filepath = path.join(UPLOADS_DIR, filename);
  
  await fs.writeFile(filepath, buffer);
  
  const sha256 = computeSha256(buffer);
  const fileSizeBytes = buffer.length;
  
  // Update metadata
  await addUploadMetadata({
    filename,
    originalName,
    uploadedAt: new Date().toISOString(),
    uploader: uploader ?? undefined,
    fileSizeBytes,
    sha256,
    warnings: [],
    downloadUrl: `/uploads/${filename}`,
  });
  
  return {
    filename,
    filepath,
    sha256,
    fileSizeBytes,
  };
}

/**
 * Gets upload metadata
 */
export async function getUploadsMeta(): Promise<UploadMetaFile> {
  try {
    const content = await fs.readFile(UPLOADS_META_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {
      uploads: [],
      lastModified: new Date().toISOString(),
    };
  }
}

/**
 * Saves upload metadata
 */
async function saveUploadsMeta(meta: UploadMetaFile): Promise<void> {
  await ensureUploadsDir();
  await fs.writeFile(UPLOADS_META_FILE, JSON.stringify(meta, null, 2));
}

/**
 * Adds a new upload to metadata
 */
export async function addUploadMetadata(upload: UploadHistoryItem): Promise<void> {
  const meta = await getUploadsMeta();
  meta.uploads.unshift(upload);
  (meta as unknown as { lastModified: string }).lastModified = new Date().toISOString();
  await saveUploadsMeta(meta);
}

/**
 * Removes an upload from metadata and deletes the file
 */
export async function deleteUpload(filename: string): Promise<boolean> {
  const meta = await getUploadsMeta();
  const uploadIndex = meta.uploads.findIndex(u => u.filename === filename);
  
  if (uploadIndex === -1) {
    return false;
  }
  
  // Remove from metadata
  meta.uploads.splice(uploadIndex, 1);
  (meta as unknown as { lastModified: string }).lastModified = new Date().toISOString();
  await saveUploadsMeta(meta);
  
  // Delete file
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename));
  } catch {
    // File may not exist
  }
  
  return true;
}

/**
 * Gets list of uploaded files
 */
export async function getUploadHistory(): Promise<UploadHistoryItem[]> {
  const meta = await getUploadsMeta();
  return meta.uploads;
}

/**
 * Saves details.json preview for fallback scenario
 */
export async function saveDetailsPreview(data: object): Promise<string> {
  await ensureUploadsDir();
  
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .slice(0, 16);
  
  const filename = `details_preview_${timestamp}.json`;
  const filepath = path.join(UPLOADS_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  
  return `/uploads/${filename}`;
}

/**
 * Reads an uploaded file as buffer
 */
export async function readUploadedFile(filename: string): Promise<Buffer | null> {
  try {
    const filepath = path.join(UPLOADS_DIR, filename);
    return await fs.readFile(filepath);
  } catch {
    return null;
  }
}

/**
 * Checks if a file exists in uploads
 */
export async function uploadExists(filename: string): Promise<boolean> {
  try {
    await fs.access(path.join(UPLOADS_DIR, filename));
    return true;
  } catch {
    return false;
  }
}
