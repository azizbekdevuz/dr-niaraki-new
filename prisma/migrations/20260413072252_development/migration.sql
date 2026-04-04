-- CreateEnum
CREATE TYPE "ContentVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('UPLOADED', 'PARSED', 'NEEDS_REVIEW', 'MERGED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "UploadSourceFormat" AS ENUM ('DOCX', 'PDF');

-- CreateEnum
CREATE TYPE "ContentEventType" AS ENUM ('IMPORT_CREATED', 'PARSE_COMPLETED', 'VERSION_CREATED', 'VERSION_PUBLISHED', 'VERSION_ARCHIVED', 'UPLOAD_STORED', 'SYSTEM_NOTE', 'WORKING_DRAFT_CREATED', 'WORKING_DRAFT_UPDATED', 'CONTENT_PUBLISHED', 'CONTENT_RESTORED_TO_DRAFT');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "sourceFormat" "UploadSourceFormat" NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentImport" (
    "id" TEXT NOT NULL,
    "uploadedFileId" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'UPLOADED',
    "parserVersion" TEXT,
    "warnings" JSONB,
    "rawPreviewPath" TEXT,
    "rawExtract" JSONB,
    "candidatePayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "importId" TEXT,
    "status" "ContentVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "label" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "changeSummary" TEXT,
    "createdBy" TEXT,
    "draftSlot" TEXT,
    "publishSequence" INTEGER,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentEvent" (
    "id" TEXT NOT NULL,
    "versionId" TEXT,
    "eventType" "ContentEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_adminUserId_idx" ON "Session"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_draftSlot_key" ON "ContentVersion"("draftSlot");

-- CreateIndex
CREATE INDEX "ContentVersion_status_idx" ON "ContentVersion"("status");

-- CreateIndex
CREATE INDEX "ContentVersion_importId_idx" ON "ContentVersion"("importId");

-- CreateIndex
CREATE INDEX "ContentVersion_publishSequence_idx" ON "ContentVersion"("publishSequence");

-- CreateIndex
CREATE INDEX "ContentEvent_versionId_idx" ON "ContentEvent"("versionId");

-- CreateIndex
CREATE INDEX "ContentEvent_eventType_idx" ON "ContentEvent"("eventType");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentImport" ADD CONSTRAINT "ContentImport_uploadedFileId_fkey" FOREIGN KEY ("uploadedFileId") REFERENCES "UploadedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_importId_fkey" FOREIGN KEY ("importId") REFERENCES "ContentImport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentEvent" ADD CONSTRAINT "ContentEvent_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "ContentVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
