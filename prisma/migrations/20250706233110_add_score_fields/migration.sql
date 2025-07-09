-- AlterTable
ALTER TABLE "cromin_notes" ADD COLUMN     "match_duration" INTEGER,
ADD COLUMN     "score_data" TEXT,
ADD COLUMN     "total_sets" INTEGER,
ADD COLUMN     "won_sets" INTEGER;

-- AlterTable
ALTER TABLE "note_templates" ADD COLUMN     "match_duration" INTEGER,
ADD COLUMN     "score_data" TEXT,
ADD COLUMN     "total_sets" INTEGER,
ADD COLUMN     "won_sets" INTEGER;
