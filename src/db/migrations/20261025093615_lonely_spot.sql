UPDATE "commit"
SET "description" = COALESCE(NULLIF("description", ''), "title", '');
--> statement-breakpoint
ALTER TABLE "commit" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "commit" DROP COLUMN "title";