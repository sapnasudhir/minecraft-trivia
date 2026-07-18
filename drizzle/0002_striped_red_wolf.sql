ALTER TABLE "trivia_hooks" ADD COLUMN "answer_type" text NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hooks_answer_type" ON "trivia_hooks" USING btree ("answer_type");