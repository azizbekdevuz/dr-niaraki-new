/**
 * File storage helpers for upload management
 * Handles saving files to /public/uploads and computing hashes
 * Uses GitHub API on Vercel, filesystem for local dev
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

import { commitFile, getFileContent, isGitHubConfigured } from '@/lib/github';
import type { UploadMetaFile, UploadHistoryItem } from '@/types/admin';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const UPLOADS_META_FILE = path.join(UPLOADS_DIR, 'uploads_meta.json');
const UPLOADS_META_GITHUB_PATH = 'public/uploads/uploads_meta.json';

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
 * On Vercel, skips file storage (read-only filesystem) but saves metadata
 * On local dev, saves both file and metadata
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
  const filename = generateUploadFilename(originalName);
  const filepath = path.join(UPLOADS_DIR, filename);
  const sha256 = computeSha256(buffer);
  const fileSizeBytes = buffer.length;
  
  // On Vercel, we can't write to /public/uploads (read-only filesystem)
  // So we skip file storage but still save metadata
  // On local dev, save the file
  if (!isGitHubConfigured()) {
    // Local development - save file to filesystem
    try {
      await ensureUploadsDir();
      await fs.writeFile(filepath, buffer);
    } catch (error) {
      console.warn('Failed to save uploaded file to filesystem (may be expected on Vercel):', error);
    }
  }
  // On Vercel (GitHub configured), skip file storage - files are read-only anyway
  
  // Update metadata (this will use GitHub API on Vercel)
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
 * Tries GitHub first (for Vercel), falls back to filesystem (for local dev)
 */
export async function getUploadsMeta(): Promise<UploadMetaFile> {
  // Try GitHub first (works on Vercel)
  if (isGitHubConfigured()) {
    try {
      const content = await getFileContent(UPLOADS_META_GITHUB_PATH);
      if (content) {
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn('Failed to read upload metadata from GitHub, trying filesystem:', error);
    }
  }
  
  // Fallback to filesystem (for local development)
  try {
    const content = await fs.readFile(UPLOADS_META_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    // File doesn't exist - return empty data
    return {
      uploads: [],
      lastModified: new Date().toISOString(),
    };
  }
}

/**
 * Saves upload metadata
 * Uses GitHub API on Vercel, filesystem for local dev
 */
async function saveUploadsMeta(meta: UploadMetaFile): Promise<void> {
  // Try GitHub first (works on Vercel)
  if (isGitHubConfigured()) {
    try {
      const content = JSON.stringify(meta, null, 2);
      const message = `admin: update upload metadata — ${new Date().toISOString()}`;
      await commitFile(UPLOADS_META_GITHUB_PATH, content, message);
      return; // Success - exit early
    } catch (error) {
      console.error('Failed to save upload metadata to GitHub:', error);
      // Fall through to filesystem fallback for local dev
    }
  }
  
  // Fallback to filesystem (for local development)
  try {
    await ensureUploadsDir();
    await fs.writeFile(UPLOADS_META_FILE, JSON.stringify(meta, null, 2));
  } catch (error) {
    console.error('Failed to save upload metadata to filesystem:', error);
    throw new Error('Failed to save upload metadata - both GitHub and filesystem failed');
  }
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
 * On Vercel, only removes from metadata (can't delete files from read-only filesystem)
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
  
  // Delete file (only works on local dev, Vercel filesystem is read-only)
  if (!isGitHubConfigured()) {
    try {
      await fs.unlink(path.join(UPLOADS_DIR, filename));
    } catch {
      // File may not exist or we're on Vercel
    }
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
 * On Vercel, uses GitHub API; on local dev, uses filesystem
 */
export async function saveDetailsPreview(data: object): Promise<string> {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .slice(0, 16);
  
  const filename = `details_preview_${timestamp}.json`;
  const content = JSON.stringify(data, null, 2);
  
  // Try GitHub first (works on Vercel)
  if (isGitHubConfigured()) {
    try {
      const githubPath = `public/uploads/${filename}`;
      const message = `admin: save details preview — ${timestamp}`;
      await commitFile(githubPath, content, message);
      return `/uploads/${filename}`;
    } catch (error) {
      console.warn('Failed to save preview to GitHub, trying filesystem:', error);
    }
  }
  
  // Fallback to filesystem (for local development)
  try {
    await ensureUploadsDir();
    const filepath = path.join(UPLOADS_DIR, filename);
    await fs.writeFile(filepath, content);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Failed to save preview to filesystem:', error);
    throw new Error('Failed to save preview - both GitHub and filesystem failed');
  }
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
