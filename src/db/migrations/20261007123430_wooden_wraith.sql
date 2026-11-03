CREATE TYPE "public"."card_priority" AS ENUM('normal', 'show stopper', 'critical', 'major', 'minor');--> statement-breakpoint
CREATE TABLE "card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"board_list_id" uuid NOT NULL,
	"sprint_id" uuid,
	"card_number" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"priority" "card_priority" DEFAULT 'normal' NOT NULL,
	"position" integer NOT NULL,
	"reporter_id" uuid NOT NULL,
	"start_date" timestamp with time zone,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_board_list_id_board_list_id_fk" FOREIGN KEY ("board_list_id") REFERENCES "public"."board_list"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_sprint_id_sprint_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprint"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_board_id_idx" ON "card" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "card_board_list_id_idx" ON "card" USING btree ("board_list_id");--> statement-breakpoint
CREATE INDEX "card_list_position_idx" ON "card" USING btree ("board_list_id","position");--> statement-breakpoint
CREATE INDEX "card_sprint_id_idx" ON "card" USING btree ("sprint_id");--> statement-breakpoint
CREATE UNIQUE INDEX "card_board_card_number_unique" ON "card" USING btree ("board_id","card_number");