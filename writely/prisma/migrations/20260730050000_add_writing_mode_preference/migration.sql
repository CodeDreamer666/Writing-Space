ALTER TABLE "user"
ADD COLUMN "writingModePreference" TEXT NOT NULL DEFAULT 'Clear';

UPDATE "user" AS "user"
SET "writingModePreference" = COALESCE(
  (
    SELECT "Document"."writingMode"
    FROM "Document"
    WHERE "Document"."userId" = "user"."id"
      AND "Document"."deletedAt" IS NULL
    ORDER BY "Document"."updatedAt" DESC
    LIMIT 1
  ),
  'Clear'
);

UPDATE "Document"
SET "writingMode" = "user"."writingModePreference"
FROM "user"
WHERE "Document"."userId" = "user"."id";
