/**
 * Admin upload DOCX API route
 * POST: Upload and parse DOCX file, or confirm commit
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseDocxToDetails } from '@/parser/docxParser';
import { validateDetails } from '@/validators/detailsSchema';
import { saveUploadedFile, saveDetailsPreview } from '@/lib/storage';
import { commitDetailsJson, isGitHubConfigured } from '@/lib/github';
import { hasValidAdminAccess } from '@/lib/admin-auth';
import type { Details } from '@/types/details';

/**
 * POST: Handle DOCX upload
 */
export async function POST(request: NextRequest) {
  try {
    const accessStatus = await hasValidAdminAccess();
    
    if (!accessStatus.isLoggedIn) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - please login' },
        { status: 401 }
      );
    }
    
    const contentType = request.headers.get('content-type') || '';
    
    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      return handleFileUpload(request, accessStatus);
    }
    
    // Handle JSON (confirm commit)
    if (contentType.includes('application/json')) {
      return handleConfirmCommit(request, accessStatus);
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid content type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handles DOCX file upload and parsing
 */
async function handleFileUpload(
  request: NextRequest,
  accessStatus: { isLoggedIn: boolean; hasValidDevice: boolean }
) {
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: 'No file uploaded' },
      { status: 400 }
    );
  }
  
  // Validate file type
  if (!file.name.endsWith('.docx')) {
    return NextResponse.json(
      { success: false, message: 'Only .docx files are supported' },
      { status: 400 }
    );
  }
  
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, message: 'File too large (max 10MB)' },
      { status: 400 }
    );
  }
  
  // Convert to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Parse DOCX
  const uploader = 'admin'; // Could be enhanced with actual username
  const { data, warnings } = await parseDocxToDetails(buffer, file.name, uploader);
  
  // Validate parsed data
  const validation = validateDetails(data);
  
  return NextResponse.json({
    success: true,
    message: 'File parsed successfully',
    data,
    warnings: warnings.map(w => `${w.field}: ${w.message}`),
    validation: {
      valid: validation.success,
      errors: validation.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || [],
    },
    canCommit: accessStatus.hasValidDevice,
    deviceRequired: !accessStatus.hasValidDevice,
  });
}

/**
 * Handles confirm commit request
 */
async function handleConfirmCommit(
  request: NextRequest,
  accessStatus: { isLoggedIn: boolean; hasValidDevice: boolean }
) {
  // Require valid device for commit
  if (!accessStatus.hasValidDevice) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Device not registered. Please register this device before committing.' 
      },
      { status: 403 }
    );
  }
  
  const body = await request.json();
  const { data, acknowledgeWarnings, originalFilename } = body;
  
  if (!data) {
    return NextResponse.json(
      { success: false, message: 'No data provided' },
      { status: 400 }
    );
  }
  
  // Validate final data
  const validation = validateDetails(data);
  if (!validation.success && !acknowledgeWarnings) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Validation failed. Check warnings and acknowledge to proceed.',
        errors: validation.errors?.map(e => `${e.path.join('.')}: ${e.message}`) || [],
      },
      { status: 400 }
    );
  }
  
  const detailsData = data as Details;
  
  // Save original file if provided
  if (originalFilename && body.fileBuffer) {
    try {
      const fileBuffer = Buffer.from(body.fileBuffer, 'base64');
      await saveUploadedFile(fileBuffer, originalFilename, 'admin');
    } catch (error) {
      console.error('Failed to save uploaded file:', error);
      // Continue with commit even if file save fails
    }
  }
  
  // Try to commit to GitHub
  if (isGitHubConfigured()) {
    try {
      const result = await commitDetailsJson(detailsData, 'admin');
      
      if (result) {
        return NextResponse.json({
          success: true,
          message: 'Data committed successfully',
          commitSha: result.sha,
          commitUrl: result.url,
        });
      }
    } catch (error) {
      console.error('GitHub commit failed:', error);
      // Fall through to fallback
    }
  }
  
  // Fallback: save preview file
  const previewUrl = await saveDetailsPreview(detailsData);
  
  return NextResponse.json({
    success: true,
    message: 'GitHub commit not available. Preview saved locally.',
    previewUrl,
    instructions: 'Please manually copy the preview file to src/datasets/details.json and deploy.',
  });
}

