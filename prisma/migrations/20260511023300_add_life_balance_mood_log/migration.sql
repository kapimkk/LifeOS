-- CreateTable
CREATE TABLE "LifeBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saude" INTEGER NOT NULL DEFAULT 5,
    "carreira" INTEGER NOT NULL DEFAULT 5,
    "financas" INTEGER NOT NULL DEFAULT 5,
    "relacionamentos" INTEGER NOT NULL DEFAULT 5,
    "lazer" INTEGER NOT NULL DEFAULT 5,
    "pessoal" INTEGER NOT NULL DEFAULT 5,
    "espiritualidade" INTEGER NOT NULL DEFAULT 5,
    "contribuicao" INTEGER NOT NULL DEFAULT 5,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LifeBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "note" TEXT,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LifeBalance_userId_key" ON "LifeBalance"("userId");

-- CreateIndex
CREATE INDEX "LifeBalance_userId_idx" ON "LifeBalance"("userId");

-- CreateIndex
CREATE INDEX "MoodLog_userId_date_idx" ON "MoodLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MoodLog_userId_date_key" ON "MoodLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "LifeBalance" ADD CONSTRAINT "LifeBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodLog" ADD CONSTRAINT "MoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
