-- CreateEnum
CREATE TYPE "FixedExpenseGroup" AS ENUM ('PLANOS', 'INVESTIMENTOS', 'GERAL');

-- AlterTable
ALTER TABLE "FixedExpense" ADD COLUMN "group" "FixedExpenseGroup" NOT NULL DEFAULT 'GERAL';

-- CreateIndex
CREATE INDEX "FixedExpense_userId_group_idx" ON "FixedExpense"("userId", "group");
