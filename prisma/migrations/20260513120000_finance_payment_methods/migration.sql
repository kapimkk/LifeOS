-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'DEBIT', 'PIX');

-- AlterTable
ALTER TABLE "FinancialTransaction" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "FinancialTransaction" ADD COLUMN "installments" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "FinancialTransaction" ADD COLUMN "isCreditCard" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "FinancialTransaction" ADD COLUMN "installmentGroupId" TEXT;
ALTER TABLE "FinancialTransaction" ADD COLUMN "installmentNumber" INTEGER;

-- CreateIndex
CREATE INDEX "FinancialTransaction_userId_installmentGroupId_idx" ON "FinancialTransaction"("userId", "installmentGroupId");
