CREATE TABLE "invite_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_by" uuid NOT NULL,
	"expires_at" timestamp NOT NULL,
	"role" "organization_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invite_members_email_unique" UNIQUE("email"),
	CONSTRAINT "invite_members_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "invite_members" ADD CONSTRAINT "invite_members_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;