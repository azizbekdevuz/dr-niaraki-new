/**
 * Types for admin authentication and device management
 */

export interface DeviceRecord {
  readonly id: string;
  readonly label: string;
  readonly userAgent: string;
  readonly ipHash: string;
  readonly registeredAt: string;
  readonly lastUsedAt?: string;
  readonly expiresAt: string;
}

export interface DeviceRegistrationRequest {
  readonly label: string;
}

export interface AdminDevicesData {
  readonly devices: DeviceRecord[];
  readonly lastModified: string;
}

export interface AdminLoginRequest {
  readonly password: string;
}

export interface AdminLoginResponse {
  readonly success: boolean;
  readonly message: string;
  readonly requiresDeviceRegistration?: boolean;
  readonly isDeviceRegistered?: boolean;
}

export interface DeviceTokenPayload {
  readonly deviceId: string;
  readonly ipHash: string;
  readonly iat: number;
  readonly exp: number;
}

export interface UploadPreviewRequest {
  readonly action: 'preview';
}

export interface UploadConfirmRequest {
  readonly action: 'confirm';
  readonly data: unknown; // The edited details.json data
  readonly acknowledgeWarnings: boolean;
}

export interface UploadResponse {
  readonly success: boolean;
  readonly message: string;
  readonly warnings?: string[];
  readonly data?: unknown;
  readonly commitSha?: string;
  readonly commitUrl?: string;
  readonly uploadFilename?: string;
}

export type UploadHistoryRecordSource = 'prisma' | 'legacy_manifest_only';

export interface UploadHistoryItem {
  readonly filename: string;
  readonly originalName: string;
  readonly uploadedAt: string;
  readonly uploader?: string;
  readonly fileSizeBytes: number;
  readonly sha256: string;
  readonly warnings: string[];
  readonly downloadUrl: string;
  /** When the same upload row exists in Prisma (DOCX import pipeline). */
  readonly prismaUploadedFileId?: string;
  readonly contentImportId?: string;
  /** Whether this row came from Prisma or legacy manifest merge. */
  readonly recordSource?: UploadHistoryRecordSource;
  /** Latest import workflow status when `recordSource` is `prisma`. */
  readonly importStatus?: string;
}

export interface UploadMetaFile {
  readonly uploads: UploadHistoryItem[];
  readonly lastModified: string;
}

