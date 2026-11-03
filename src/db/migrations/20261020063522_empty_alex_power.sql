CREATE TABLE "commit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card_attachment" ADD COLUMN "commit_id" uuid;--> statement-breakpoint
ALTER TABLE "commit" ADD CONSTRAINT "commit_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commit" ADD CONSTRAINT "commit_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commit_card_id_idx" ON "commit" USING btree ("card_id");--> statement-breakpoint
ALTER TABLE "card_attachment" ADD CONSTRAINT "card_attachment_commit_id_commit_id_fk" FOREIGN KEY ("commit_id") REFERENCES "public"."commit"("id") ON DELETE cascade ON UPDATE no action;