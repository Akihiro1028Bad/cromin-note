/*
  Warnings:

  - You are about to drop the `note_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `template_score_sets` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "cromin_notes" ADD COLUMN     "category_id" INTEGER;

-- DropTable
DROP TABLE "note_templates";

-- DropTable
DROP TABLE "template_score_sets";

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opponents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_opponents" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_opponents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "opponents_name_key" ON "opponents"("name");

-- CreateIndex
CREATE INDEX "note_opponents_note_id_idx" ON "note_opponents"("note_id");

-- CreateIndex
CREATE INDEX "note_opponents_opponent_id_idx" ON "note_opponents"("opponent_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_opponents_note_id_opponent_id_key" ON "note_opponents"("note_id", "opponent_id");

-- CreateIndex
CREATE INDEX "cromin_notes_category_id_idx" ON "cromin_notes"("category_id");
