-- Add optimistic-concurrency and soft-deletion fields for writing safety.
ALTER TABLE "Document"
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- A deleted account must not leave private writing behind.
ALTER TABLE "Document"
DROP CONSTRAINT "Document_userId_fkey",
ADD CONSTRAINT "Document_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "Document_userId_deletedAt_updatedAt_idx"
ON "Document"("userId", "deletedAt", "updatedAt");
