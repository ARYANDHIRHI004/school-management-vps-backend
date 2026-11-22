CREATE TYPE "public"."fee_alert_severity" AS ENUM('info', 'warning', 'critical');--> statement-breakpoint
CREATE TYPE "public"."fee_alert_status" AS ENUM('unread', 'read', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."fee_alert_type" AS ENUM('due_reminder', 'overdue', 'payment_received', 'custom');--> statement-breakpoint
CREATE TYPE "public"."fee_collection_status" AS ENUM('completed', 'voided');--> statement-breakpoint
CREATE TYPE "public"."fee_due_status" AS ENUM('pending', 'partial', 'paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."fee_payment_mode" AS ENUM('cash', 'cheque', 'bank_transfer', 'upi_offline', 'other');--> statement-breakpoint
CREATE TABLE "fee_collection_allocations" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_id" text NOT NULL,
	"due_id" text NOT NULL,
	"amount_paise" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_collections" (
	"id" text PRIMARY KEY NOT NULL,
	"collection_number" text NOT NULL,
	"student_id" text NOT NULL,
	"collection_date" date NOT NULL,
	"amount_paise" bigint NOT NULL,
	"payment_mode" "fee_payment_mode" NOT NULL,
	"reference_number" text,
	"remarks" text,
	"status" "fee_collection_status" DEFAULT 'completed' NOT NULL,
	"collected_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fee_collections_collection_number_unique" UNIQUE("collection_number")
);
--> statement-breakpoint
CREATE TABLE "fee_heads" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fee_heads_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "fee_payment_alerts" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"due_id" text,
	"alert_type" "fee_alert_type" NOT NULL,
	"severity" "fee_alert_severity" DEFAULT 'info' NOT NULL,
	"status" "fee_alert_status" DEFAULT 'unread' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"scheduled_for" date,
	"created_by_user_id" text,
	"read_at" timestamp,
	"dismissed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"receipt_number" text NOT NULL,
	"collection_id" text NOT NULL,
	"student_id" text NOT NULL,
	"issue_date" date NOT NULL,
	"amount_paise" bigint NOT NULL,
	"payment_mode" "fee_payment_mode" NOT NULL,
	"reference_number" text,
	"remarks" text,
	"issued_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fee_receipts_receipt_number_unique" UNIQUE("receipt_number"),
	CONSTRAINT "fee_receipts_collection_id_unique" UNIQUE("collection_id")
);
--> statement-breakpoint
CREATE TABLE "student_fee_due_items" (
	"id" text PRIMARY KEY NOT NULL,
	"due_id" text NOT NULL,
	"fee_head_id" text,
	"label" text NOT NULL,
	"amount_paise" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_fee_dues" (
	"id" text PRIMARY KEY NOT NULL,
	"due_number" text NOT NULL,
	"student_id" text NOT NULL,
	"academic_year" text,
	"term" text,
	"due_date" date NOT NULL,
	"status" "fee_due_status" DEFAULT 'pending' NOT NULL,
	"total_amount_paise" bigint NOT NULL,
	"paid_amount_paise" bigint DEFAULT 0 NOT NULL,
	"notes" text,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_fee_dues_due_number_unique" UNIQUE("due_number")
);
--> statement-breakpoint
ALTER TABLE "fee_collection_allocations" ADD CONSTRAINT "fee_collection_allocations_collection_id_fee_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."fee_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_collection_allocations" ADD CONSTRAINT "fee_collection_allocations_due_id_student_fee_dues_id_fk" FOREIGN KEY ("due_id") REFERENCES "public"."student_fee_dues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_collections" ADD CONSTRAINT "fee_collections_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_collections" ADD CONSTRAINT "fee_collections_collected_by_user_id_user_id_fk" FOREIGN KEY ("collected_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD CONSTRAINT "fee_payment_alerts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD CONSTRAINT "fee_payment_alerts_due_id_student_fee_dues_id_fk" FOREIGN KEY ("due_id") REFERENCES "public"."student_fee_dues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_payment_alerts" ADD CONSTRAINT "fee_payment_alerts_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_receipts" ADD CONSTRAINT "fee_receipts_collection_id_fee_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."fee_collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_receipts" ADD CONSTRAINT "fee_receipts_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_receipts" ADD CONSTRAINT "fee_receipts_issued_by_user_id_user_id_fk" FOREIGN KEY ("issued_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_due_items" ADD CONSTRAINT "student_fee_due_items_due_id_student_fee_dues_id_fk" FOREIGN KEY ("due_id") REFERENCES "public"."student_fee_dues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_due_items" ADD CONSTRAINT "student_fee_due_items_fee_head_id_fee_heads_id_fk" FOREIGN KEY ("fee_head_id") REFERENCES "public"."fee_heads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_dues" ADD CONSTRAINT "student_fee_dues_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_fee_dues" ADD CONSTRAINT "student_fee_dues_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fee_collection_allocations_collection_id_idx" ON "fee_collection_allocations" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "fee_collection_allocations_due_id_idx" ON "fee_collection_allocations" USING btree ("due_id");--> statement-breakpoint
CREATE INDEX "fee_collections_student_id_idx" ON "fee_collections" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "fee_collections_collection_date_idx" ON "fee_collections" USING btree ("collection_date");--> statement-breakpoint
CREATE INDEX "fee_heads_is_active_idx" ON "fee_heads" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "fee_payment_alerts_student_id_idx" ON "fee_payment_alerts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "fee_payment_alerts_status_idx" ON "fee_payment_alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fee_payment_alerts_alert_type_idx" ON "fee_payment_alerts" USING btree ("alert_type");--> statement-breakpoint
CREATE INDEX "fee_receipts_student_id_idx" ON "fee_receipts" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "fee_receipts_issue_date_idx" ON "fee_receipts" USING btree ("issue_date");--> statement-breakpoint
CREATE INDEX "student_fee_due_items_due_id_idx" ON "student_fee_due_items" USING btree ("due_id");--> statement-breakpoint
CREATE INDEX "student_fee_dues_student_id_idx" ON "student_fee_dues" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_fee_dues_status_idx" ON "student_fee_dues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "student_fee_dues_due_date_idx" ON "student_fee_dues" USING btree ("due_date");