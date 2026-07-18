CREATE TYPE "public"."entity_type" AS ENUM('block', 'mob', 'structure');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "entities" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "entity_type" NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"properties" jsonb NOT NULL,
	"source_version" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_bank" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"question_text" text NOT NULL,
	"correct_answer" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "trivia_hooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_id" text NOT NULL,
	"category" text NOT NULL,
	"difficulty" text NOT NULL,
	"question_seed" text NOT NULL,
	"answer" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "trivia_hooks" ADD CONSTRAINT "trivia_hooks_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entities_type_category" ON "entities" USING btree ("type","category");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_entities_properties_gin" ON "entities" USING gin ("properties");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_qbank_type_category_diff" ON "question_bank" USING btree ("entity_type","category","difficulty");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hooks_entity" ON "trivia_hooks" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_hooks_category_difficulty" ON "trivia_hooks" USING btree ("category","difficulty");