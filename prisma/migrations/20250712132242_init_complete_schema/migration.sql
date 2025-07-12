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
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opponents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cromin_notes" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "memo" TEXT,
    "condition" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "type_id" INTEGER NOT NULL,
    "result_id" INTEGER,
    "category_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "match_duration" INTEGER,
    "total_sets" INTEGER,
    "won_sets" INTEGER,

    CONSTRAINT "cromin_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note_opponents" (
    "id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "opponent_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_opponents_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "cromin_users_email_key" ON "cromin_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "note_types_name_key" ON "note_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "results_name_key" ON "results"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "opponents_user_id_idx" ON "opponents"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "opponents_name_user_id_key" ON "opponents"("name", "user_id");

-- CreateIndex
CREATE INDEX "cromin_notes_user_id_created_at_idx" ON "cromin_notes"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "cromin_notes_is_public_created_at_idx" ON "cromin_notes"("is_public", "created_at");

-- CreateIndex
CREATE INDEX "cromin_notes_type_id_result_id_idx" ON "cromin_notes"("type_id", "result_id");

-- CreateIndex
CREATE INDEX "cromin_notes_user_id_type_id_idx" ON "cromin_notes"("user_id", "type_id");

-- CreateIndex
CREATE INDEX "cromin_notes_user_id_result_id_idx" ON "cromin_notes"("user_id", "result_id");

-- CreateIndex
CREATE INDEX "cromin_notes_created_at_idx" ON "cromin_notes"("created_at");

-- CreateIndex
CREATE INDEX "cromin_notes_category_id_idx" ON "cromin_notes"("category_id");

-- CreateIndex
CREATE INDEX "note_opponents_note_id_idx" ON "note_opponents"("note_id");

-- CreateIndex
CREATE INDEX "note_opponents_opponent_id_idx" ON "note_opponents"("opponent_id");

-- CreateIndex
CREATE UNIQUE INDEX "note_opponents_note_id_opponent_id_key" ON "note_opponents"("note_id", "opponent_id");

-- CreateIndex
CREATE INDEX "score_sets_note_id_idx" ON "score_sets"("note_id");
