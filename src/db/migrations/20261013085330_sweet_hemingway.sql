ALTER TABLE "card" ADD COLUMN "assigned_to" uuid;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_assigned_to_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
