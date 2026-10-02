-- CreateTable
CREATE TABLE "FixedReceivable" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "dueDay" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FixedReceivable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FixedReceivablePayment" (
    "id" TEXT NOT NULL,
    "fixedReceivableId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FixedReceivablePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FixedReceivable_userId_idx" ON "FixedReceivable"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FixedReceivablePayment_fixedReceivableId_year_month_key" ON "FixedReceivablePayment"("fixedReceivableId", "year", "month");

-- CreateIndex
CREATE INDEX "FixedReceivablePayment_fixedReceivableId_year_idx" ON "FixedReceivablePayment"("fixedReceivableId", "year");

-- AddForeignKey
ALTER TABLE "FixedReceivable" ADD CONSTRAINT "FixedReceivable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FixedReceivablePayment" ADD CONSTRAINT "FixedReceivablePayment_fixedReceivableId_fkey" FOREIGN KEY ("fixedReceivableId") REFERENCES "FixedReceivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
