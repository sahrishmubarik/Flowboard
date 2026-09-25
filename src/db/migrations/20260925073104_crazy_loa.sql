ALTER TABLE "board_members" DROP CONSTRAINT "board_members_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "board_members" ADD COLUMN "assigned_by" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_assigned_by_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_members" ADD CONSTRAINT "board_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;