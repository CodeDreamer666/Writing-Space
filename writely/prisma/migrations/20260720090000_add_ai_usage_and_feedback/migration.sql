-- CreateTable
CREATE TABLE "AiDailyUsage" (
    "userId" TEXT NOT NULL,
    "usageDate" DATE NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiDailyUsage_pkey" PRIMARY KEY ("userId", "usageDate")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_userId_createdAt_idx" ON "Feedback"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AiDailyUsage"
ADD CONSTRAINT "AiDailyUsage_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback"
ADD CONSTRAINT "Feedback_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
