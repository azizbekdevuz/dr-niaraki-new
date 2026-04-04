-- CreateTable
CREATE TABLE "AdminRegisteredDevice" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRegisteredDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminRegisteredDevice_expiresAt_idx" ON "AdminRegisteredDevice"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminRegisteredDevice_ipHash_idx" ON "AdminRegisteredDevice"("ipHash");
