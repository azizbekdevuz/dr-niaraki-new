/**
 * Admin uploads history API route
 * GET: List uploaded files (Prisma-primary, legacy manifest for orphans)
 * DELETE: Remove manifest/local file and Prisma row when safe
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { unauthorizedUnlessAdminSession } from '@/server/admin/adminGuards';
import { deleteUploadAdminByFilename, listMergedUploadHistoryForAdmin } from '@/server/admin/uploadHistoryAdmin';

/**
 * GET: List all uploaded files
 */
export async function GET() {
  try {
    const denied = await unauthorizedUnlessAdminSession();
    if (denied) {
      return denied;
    }

    const merged = await listMergedUploadHistoryForAdmin();

    return NextResponse.json({
      success: true,
      uploads: merged.uploads,
      listingSource: merged.listingSource,
      authorityNote: merged.authorityNote,
      prismaBackedCount: merged.prismaBackedCount,
      legacyManifestOnlyCount: merged.legacyManifestOnlyCount,
      historyPrismaTakeLimit: merged.historyPrismaTakeLimit,
      historyPrismaTakeMax: merged.historyPrismaTakeMax,
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete an uploaded file
 */
export async function DELETE(request: NextRequest) {
  try {
    const denied = await unauthorizedUnlessAdminSession();
    if (denied) {
      return denied;
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'Filename is required' },
        { status: 400 }
      );
    }

    const outcome = await deleteUploadAdminByFilename(filename);

    if (outcome.prismaDeletion === 'absent' && !outcome.legacyManifestRemoved) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: outcome.message,
      prismaDeletion: outcome.prismaDeletion,
      legacyManifestRemoved: outcome.legacyManifestRemoved,
    });
  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
