ALTER TABLE "invite_members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'member'::text;--> statement-breakpoint
DROP TYPE "public"."organization_role";--> statement-breakpoint
CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'manager', 'member');--> statement-breakpoint
ALTER TABLE "invite_members" ALTER COLUMN "role" SET DATA TYPE "public"."organization_role" USING "role"::"public"."organization_role";--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DEFAULT 'member'::"public"."organization_role";--> statement-breakpoint
ALTER TABLE "organization_members" ALTER COLUMN "role" SET DATA TYPE "public"."organization_role" USING "role"::"public"."organization_role";