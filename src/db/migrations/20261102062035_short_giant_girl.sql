CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'PAST_DUE', 'CANCELED');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"plan" "billing_plan" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"grace_ends_at" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_workspace_id_unique" UNIQUE("workspace_id"),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "stripe_checkout_session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "stripe_invoice_id" varchar(255);--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_workspace_id_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspace"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id");