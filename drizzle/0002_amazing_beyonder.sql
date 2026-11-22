CREATE TYPE "public"."staff_employment_type" AS ENUM('permanent', 'contract', 'part_time');--> statement-breakpoint
CREATE TYPE "public"."staff_ledger_category" AS ENUM('opening_balance', 'salary_payment', 'advance', 'deduction', 'bonus', 'reimbursement', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."staff_ledger_entry_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('active', 'inactive', 'resigned');--> statement-breakpoint
CREATE TABLE "staff_ledger_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"staff_id" text NOT NULL,
	"entry_date" date NOT NULL,
	"entry_type" "staff_ledger_entry_type" NOT NULL,
	"category" "staff_ledger_category" NOT NULL,
	"amount_paise" bigint NOT NULL,
	"reference_number" text,
	"description" text,
	"recorded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff_members" (
	"id" text PRIMARY KEY NOT NULL,
	"staff_code" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"designation" text NOT NULL,
	"department" text,
	"employment_type" "staff_employment_type" DEFAULT 'permanent' NOT NULL,
	"is_teaching_staff" integer DEFAULT 0 NOT NULL,
	"date_of_joining" date,
	"email" text,
	"phone" text,
	"gender" text,
	"date_of_birth" date,
	"address" text,
	"qualifications" text,
	"subjects_taught" text,
	"base_salary_paise" bigint,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"registered_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_members_staff_code_unique" UNIQUE("staff_code")
);
--> statement-breakpoint
CREATE TABLE "staff_pay_slips" (
	"id" text PRIMARY KEY NOT NULL,
	"slip_number" text NOT NULL,
	"staff_id" text NOT NULL,
	"pay_period_start" date NOT NULL,
	"pay_period_end" date NOT NULL,
	"issue_date" date NOT NULL,
	"gross_amount_paise" bigint,
	"net_amount_paise" bigint,
	"deductions_paise" bigint,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"notes" text,
	"uploaded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "staff_pay_slips_slip_number_unique" UNIQUE("slip_number")
);
--> statement-breakpoint
ALTER TABLE "staff_ledger_entries" ADD CONSTRAINT "staff_ledger_entries_staff_id_staff_members_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_ledger_entries" ADD CONSTRAINT "staff_ledger_entries_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_registered_by_user_id_user_id_fk" FOREIGN KEY ("registered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_pay_slips" ADD CONSTRAINT "staff_pay_slips_staff_id_staff_members_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_pay_slips" ADD CONSTRAINT "staff_pay_slips_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "staff_ledger_entries_staff_id_idx" ON "staff_ledger_entries" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "staff_ledger_entries_entry_date_idx" ON "staff_ledger_entries" USING btree ("entry_date");--> statement-breakpoint
CREATE INDEX "staff_ledger_entries_category_idx" ON "staff_ledger_entries" USING btree ("category");--> statement-breakpoint
CREATE INDEX "staff_members_status_idx" ON "staff_members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "staff_members_department_idx" ON "staff_members" USING btree ("department");--> statement-breakpoint
CREATE INDEX "staff_members_designation_idx" ON "staff_members" USING btree ("designation");--> statement-breakpoint
CREATE INDEX "staff_pay_slips_staff_id_idx" ON "staff_pay_slips" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "staff_pay_slips_issue_date_idx" ON "staff_pay_slips" USING btree ("issue_date");