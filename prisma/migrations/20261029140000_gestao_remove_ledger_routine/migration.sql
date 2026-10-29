-- Drop ledger and routine
DROP TABLE IF EXISTS "FinancialTransaction";
DROP TABLE IF EXISTS "Category";
DROP TABLE IF EXISTS "RoutineItem";

DROP TYPE IF EXISTS "TransactionType";
DROP TYPE IF EXISTS "Recurrence";
DROP TYPE IF EXISTS "PaymentMethod";
DROP TYPE IF EXISTS "WeekDay";

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('LEAD', 'ACTIVE', 'PAUSED', 'FORMER');
CREATE TYPE "ProjectStatus" AS ENUM ('IDEA', 'ACTIVE', 'PAUSED', 'DELIVERED', 'ARCHIVED');
CREATE TYPE "ServerStatus" AS ENUM ('ONLINE', 'MAINTENANCE', 'OFFLINE');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsServer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "hostname" TEXT,
    "ipAddress" TEXT,
    "operatingSystem" TEXT,
    "region" TEXT,
    "cpu" TEXT,
    "ramGb" INTEGER,
    "diskGb" INTEGER,
    "status" "ServerStatus" NOT NULL DEFAULT 'ONLINE',
    "monthlyCost" DECIMAL(14,2),
    "panelUrl" TEXT,
    "color" TEXT NOT NULL DEFAULT '#0ea5e9',
    "backupNotes" TEXT,
    "folderStructure" TEXT,
    "hostedNotes" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VpsServer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "specification" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT NOT NULL DEFAULT '#22c55e',
    "customerId" TEXT,
    "serverId" TEXT,
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "repoUrl" TEXT,
    "liveUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_userId_status_idx" ON "Customer"("userId", "status");
CREATE INDEX "VpsServer_userId_status_idx" ON "VpsServer"("userId", "status");
CREATE INDEX "Project_userId_status_idx" ON "Project"("userId", "status");
CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");
CREATE INDEX "Project_serverId_idx" ON "Project"("serverId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VpsServer" ADD CONSTRAINT "VpsServer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "VpsServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
