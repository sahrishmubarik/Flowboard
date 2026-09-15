ALTER TABLE "workspace" DROP CONSTRAINT "workspace_workspace_name_unique";--> statement-breakpoint
ALTER TABLE "workspace" DROP CONSTRAINT "workspace_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "workspace" DROP COLUMN "user_id";