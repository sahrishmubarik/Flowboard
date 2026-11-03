CREATE TYPE "public"."card_type" AS ENUM('bug', 'feature', 'task', 'tbd');--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN "type" "card_type" DEFAULT 'task' NOT NULL;