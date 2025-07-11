-- CreateIndex
CREATE INDEX "cromin_notes_user_id_type_id_idx" ON "cromin_notes"("user_id", "type_id");

-- CreateIndex
CREATE INDEX "cromin_notes_user_id_result_id_idx" ON "cromin_notes"("user_id", "result_id");

-- CreateIndex
CREATE INDEX "cromin_notes_opponent_idx" ON "cromin_notes"("opponent");

-- CreateIndex
CREATE INDEX "cromin_notes_created_at_idx" ON "cromin_notes"("created_at");

-- CreateIndex
CREATE INDEX "score_sets_note_id_idx" ON "score_sets"("note_id");
