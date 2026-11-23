DO $$ BEGIN
 CREATE TYPE "public"."fee_alert_sms_status" AS ENUM('pending', 'sent', 'failed', 'skipped');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD COLUMN IF NOT EXISTS "sms_status" "fee_alert_sms_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD COLUMN IF NOT EXISTS "sms_message_id" text;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD COLUMN IF NOT EXISTS "sms_error" text;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD COLUMN IF NOT EXISTS "sms_sent_at" timestamp;