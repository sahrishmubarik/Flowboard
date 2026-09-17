CREATE TYPE "public"."invitation_status" AS ENUM('ACCEPTED', 'REVOKED', 'PENDING');--> statement-breakpoint
ALTER TABLE "invite_members" DROP CONSTRAINT "invite_members_email_unique";--> statement-breakpoint
ALTER TABLE "invite_members" ADD COLUMN "status" "invitation_status" DEFAULT 'PENDING' NOT NULL;