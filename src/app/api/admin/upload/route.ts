/**
 * Admin upload DOCX API route
 * POST: Upload and parse DOCX file, or confirm commit
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { hasValidAdminAccess } from '@/lib/admin-auth';
import { commitDetailsJson, isGitHubConfigured } from '@/lib/github';
import { saveUploadedFile, saveDetailsPreview } from '@/lib/storage';
import { DocxImportParseError, processDocxUploadWithImportPersistence } from '@/server/imports/processDocxUploadImport';
import type { Details } from '@/types/details';
import { validateDetails } from '@/validators/detailsSchema';

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
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploader = 'admin';
  const mimeType =
    file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  try {
    const outcome = await processDocxUploadWithImportPersistence({
      buffer,
      originalName: file.name,
      mimeType,
      uploaderLabel: uploader,
    });

    return NextResponse.json({
      success: true,
      message: outcome.import.persisted
        ? 'File parsed successfully; import record saved.'
        : 'File parsed successfully; import could not be saved (database unavailable).',
      data: outcome.data,
      warnings: outcome.parseWarnings.map((w) => `${w.field}: ${w.message}`),
      validation: {
        valid: outcome.validation.valid,
        errors: outcome.validation.errors,
      },
      canCommit: accessStatus.hasValidDevice,
      deviceRequired: !accessStatus.hasValidDevice,
      import: outcome.import,
      legacyUploadMetaNote:
        'Filesystem `public/uploads/uploads_meta.json` (and optional GitHub mirror) is for filenames and download history only. Prisma `UploadedFile` / `ContentImport` are authoritative for imports and review.',
    });
  } catch (e) {
    if (e instanceof DocxImportParseError) {
      return NextResponse.json(
        {
          success: false,
          message: e.message,
          import: e.importSummary,
        },
        { status: 500 },
      );
    }
    throw e;
  }
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
          editorialPath: 'legacy_github_details_json',
          legacyDetailsJsonCommit: true,
          notPrismaWorkflow: true,
          importDomainNote:
            'Legacy path: writes details.json via GitHub only. It does not create or update Prisma ContentImport rows.',
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
    editorialPath: 'legacy_github_details_json_preview',
    legacyDetailsJsonCommit: true,
    notPrismaWorkflow: true,
    importDomainNote:
      'Legacy path: preview JSON only. It does not create or update Prisma ContentImport rows.',
  });
}
