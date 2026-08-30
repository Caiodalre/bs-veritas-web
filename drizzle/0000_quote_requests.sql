CREATE TYPE "public"."quote_request_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(32) NOT NULL,
	"email" varchar(254) NOT NULL,
	"insurance_type" varchar(64) NOT NULL,
	"city" varchar(120),
	"message" text,
	"privacy_policy_version" varchar(32) NOT NULL,
	"retention_expires_at" timestamp with time zone NOT NULL,
	"status" "quote_request_status" DEFAULT 'new' NOT NULL
);
--> statement-breakpoint
CREATE INDEX "quote_requests_created_at_idx" ON "quote_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "quote_requests_status_idx" ON "quote_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "quote_requests_retention_expires_at_idx" ON "quote_requests" USING btree ("retention_expires_at");