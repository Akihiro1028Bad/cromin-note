-- CreateTable
CREATE TABLE "cromin_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nickname" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cromin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "note_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cromin_notes" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "opponent" TEXT,
    "content" TEXT,
    "memo" TEXT,
    "condition" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "result_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "match_duration" INTEGER,
    "total_sets" INTEGER,
    "won_sets" INTEGER,

    CONSTRAINT "cromin_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "score_sets" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "my_score" INTEGER NOT NULL,
    "opponent_score" INTEGER NOT NULL,

    CONSTRAINT "score_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_templates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "title" TEXT,
    "opponent" TEXT,
    "content" TEXT,
    "result_id" INTEGER,
    "memo" TEXT,
    "condition" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "match_duration" INTEGER,
    "total_sets" INTEGER,
    "won_sets" INTEGER,

    CONSTRAINT "note_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_score_sets" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "my_score" INTEGER NOT NULL,
    "opponent_score" INTEGER NOT NULL,

    CONSTRAINT "template_score_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cromin_users_email_key" ON "cromin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "note_types_name_key" ON "note_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "results_name_key" ON "results"("name");

-- CreateIndex
CREATE INDEX "cromin_notes_user_id_created_at_idx" ON "cromin_notes"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "cromin_notes_is_public_created_at_idx" ON "cromin_notes"("is_public", "created_at");

-- CreateIndex
CREATE INDEX "cromin_notes_type_id_result_id_idx" ON "cromin_notes"("type_id", "result_id");

-- AddForeignKey
ALTER TABLE "cromin_notes" ADD CONSTRAINT "cromin_notes_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cromin_notes" ADD CONSTRAINT "cromin_notes_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "note_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cromin_notes" ADD CONSTRAINT "cromin_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cromin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "score_sets" ADD CONSTRAINT "score_sets_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "cromin_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_templates" ADD CONSTRAINT "note_templates_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_templates" ADD CONSTRAINT "note_templates_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "note_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note_templates" ADD CONSTRAINT "note_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "cromin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_score_sets" ADD CONSTRAINT "template_score_sets_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "note_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
