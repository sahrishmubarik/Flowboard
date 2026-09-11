ALTER TABLE "user" ADD COLUMN "UserId" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "id";