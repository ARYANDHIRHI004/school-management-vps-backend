CREATE TYPE "public"."admission_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."inquiry_status" AS ENUM('open', 'converted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."student_lifecycle_status" AS ENUM('inquiry', 'registered', 'admitted', 'transferred', 'left');--> statement-breakpoint
CREATE TABLE "leaving_certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"certificate_number" text NOT NULL,
	"student_id" text NOT NULL,
	"issue_date" date NOT NULL,
	"reason" text,
	"last_class_attended" text,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "leaving_certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "student_admissions" (
	"id" text PRIMARY KEY NOT NULL,
	"admission_number" text NOT NULL,
	"student_id" text NOT NULL,
	"registration_id" text,
	"admission_date" date NOT NULL,
	"class_name" text NOT NULL,
	"section" text,
	"stream" text,
	"academic_year" text,
	"status" "admission_status" DEFAULT 'active' NOT NULL,
	"admitted_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_admissions_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
CREATE TABLE "student_bifurcations" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"from_class" text,
	"from_section" text,
	"from_stream" text,
	"to_class" text NOT NULL,
	"to_section" text,
	"to_stream" text,
	"effective_date" date NOT NULL,
	"reason" text,
	"recorded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"inquiry_number" text NOT NULL,
	"student_id" text,
	"inquirer_name" text NOT NULL,
	"email" text,
	"phone" text,
	"intended_class" text,
	"intended_stream" text,
	"academic_year" text,
	"notes" text,
	"status" "inquiry_status" DEFAULT 'open' NOT NULL,
	"created_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_inquiries_inquiry_number_unique" UNIQUE("inquiry_number")
);
--> statement-breakpoint
CREATE TABLE "student_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"registration_number" text NOT NULL,
	"student_id" text NOT NULL,
	"inquiry_id" text,
	"registration_date" date NOT NULL,
	"status" "registration_status" DEFAULT 'pending' NOT NULL,
	"remarks" text,
	"registered_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_registrations_registration_number_unique" UNIQUE("registration_number")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"father_name" text,
	"mother_name" text,
	"email" text,
	"phone" text,
	"gender" text,
	"date_of_birth" date,
	"address" text,
	"class_name" text,
	"section" text,
	"stream" text,
	"academic_year" text,
	"roll_number" text,
	"registration_number" text,
	"admission_number" text,
	"lifecycle_status" "student_lifecycle_status" DEFAULT 'inquiry' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_registration_number_unique" UNIQUE("registration_number"),
	CONSTRAINT "students_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
CREATE TABLE "transfer_certificates" (
	"id" text PRIMARY KEY NOT NULL,
	"certificate_number" text NOT NULL,
	"student_id" text NOT NULL,
	"issue_date" date NOT NULL,
	"reason" text,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"uploaded_by_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transfer_certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
ALTER TABLE "leaving_certificates" ADD CONSTRAINT "leaving_certificates_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaving_certificates" ADD CONSTRAINT "leaving_certificates_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_admissions" ADD CONSTRAINT "student_admissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_admissions" ADD CONSTRAINT "student_admissions_registration_id_student_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."student_registrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_admissions" ADD CONSTRAINT "student_admissions_admitted_by_user_id_user_id_fk" FOREIGN KEY ("admitted_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_bifurcations" ADD CONSTRAINT "student_bifurcations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_bifurcations" ADD CONSTRAINT "student_bifurcations_recorded_by_user_id_user_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_inquiries" ADD CONSTRAINT "student_inquiries_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_inquiries" ADD CONSTRAINT "student_inquiries_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_registrations" ADD CONSTRAINT "student_registrations_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_registrations" ADD CONSTRAINT "student_registrations_inquiry_id_student_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."student_inquiries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_registrations" ADD CONSTRAINT "student_registrations_registered_by_user_id_user_id_fk" FOREIGN KEY ("registered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_certificates" ADD CONSTRAINT "transfer_certificates_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_certificates" ADD CONSTRAINT "transfer_certificates_uploaded_by_user_id_user_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "leaving_certificates_student_id_idx" ON "leaving_certificates" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_admissions_student_id_idx" ON "student_admissions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_admissions_status_idx" ON "student_admissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "student_bifurcations_student_id_idx" ON "student_bifurcations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_bifurcations_to_stream_idx" ON "student_bifurcations" USING btree ("to_stream");--> statement-breakpoint
CREATE INDEX "student_bifurcations_effective_date_idx" ON "student_bifurcations" USING btree ("effective_date");--> statement-breakpoint
CREATE INDEX "student_inquiries_status_idx" ON "student_inquiries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "student_registrations_student_id_idx" ON "student_registrations" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_registrations_status_idx" ON "student_registrations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "students_user_id_idx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "students_lifecycle_status_idx" ON "students" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "students_class_section_stream_idx" ON "students" USING btree ("class_name","section","stream");--> statement-breakpoint
CREATE INDEX "transfer_certificates_student_id_idx" ON "transfer_certificates" USING btree ("student_id");