/**
 * Admin uploads history API route
 * GET: List uploaded files
 * DELETE: Delete an uploaded file
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getAdminSessionFromCookie } from '@/lib/admin-auth';
import { getUploadHistory, deleteUpload } from '@/lib/storage';

/**
 * GET: List all uploaded files
 */
export async function GET() {
  try {
    const isLoggedIn = await getAdminSessionFromCookie();
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const uploads = await getUploadHistory();
    
    return NextResponse.json({
      success: true,
      uploads,
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
    const isLoggedIn = await getAdminSessionFromCookie();
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    
    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'Filename is required' },
        { status: 400 }
      );
    }
    
    const deleted = await deleteUpload(filename);
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
