-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'New Draft',
ALTER COLUMN "content" DROP NOT NULL;
