CREATE TYPE "public"."board_Member_Repo" AS ENUM('ACTIVE', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."organization_Repo" AS ENUM('ACTIVE', 'DEACTIVATED');--> statement-breakpoint
ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "board_status" "board_Member_Repo" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD COLUMN "status" "organization_Repo" DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;