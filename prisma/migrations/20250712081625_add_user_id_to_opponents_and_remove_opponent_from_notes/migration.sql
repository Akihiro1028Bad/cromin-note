/*
  Warnings:

  - You are about to drop the column `opponent` on the `cromin_notes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,user_id]` on the table `opponents` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `opponents` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "cromin_notes_opponent_idx";

-- DropIndex
DROP INDEX "opponents_name_key";

-- AlterTable
ALTER TABLE "cromin_notes" DROP COLUMN "opponent";

-- AlterTable
ALTER TABLE "opponents" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "opponents_user_id_idx" ON "opponents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "opponents_name_user_id_key" ON "opponents"("name", "user_id");
