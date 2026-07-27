-- Documents previously deleted through the product have no restore path.
-- Remove those legacy rows so deletion no longer means indefinite hidden retention.
DELETE FROM "Document"
WHERE "deletedAt" IS NOT NULL;
