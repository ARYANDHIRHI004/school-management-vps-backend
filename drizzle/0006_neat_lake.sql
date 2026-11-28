CREATE TYPE "public"."parent_relationship" AS ENUM('father', 'mother', 'guardian', 'other');--> statement-breakpoint
CREATE TYPE "public"."student_enrollment_status" AS ENUM('not_enrolled', 'enrolled', 'transferred', 'graduated', 'left');--> statement-breakpoint
CREATE TYPE "public"."student_record_status" AS ENUM('active', 'inactive', 'graduated', 'withdrawn');--> statement-breakpoint
CREATE TABLE "academic_years" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"label" text NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "academic_years_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "school_classes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_classes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "school_houses" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_houses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "school_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"class_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "school_sections_class_name_unique" UNIQUE("class_id","name")
);
--> statement-breakpoint
CREATE TABLE "student_parents" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"relationship" "parent_relationship" NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text,
	"email" text,
	"phone" text,
	"occupation" text,
	"address_line_1" text,
	"address_line_2" text,
	"city" text,
	"state" text,
	"postal_code" text,
	"country" text,
	"is_primary_contact" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "middle_name" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "blood_group" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "profile_photo" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "status" "student_record_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "enrollment_status" "student_enrollment_status" DEFAULT 'not_enrolled' NOT NULL;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "admission_date" date;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "academic_year_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "class_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "section_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "house_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "previous_school" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "previous_class" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "created_by_user_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "updated_by_user_id" text;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "school_sections" ADD CONSTRAINT "school_sections_class_id_school_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."school_classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_years_is_current_idx" ON "academic_years" USING btree ("is_current");--> statement-breakpoint
CREATE INDEX "school_sections_class_id_idx" ON "school_sections" USING btree ("class_id");--> statement-breakpoint
CREATE INDEX "student_parents_student_id_idx" ON "student_parents" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "student_parents_relationship_idx" ON "student_parents" USING btree ("relationship");--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_academic_year_id_academic_years_id_fk" FOREIGN KEY ("academic_year_id") REFERENCES "public"."academic_years"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_school_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."school_classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_section_id_school_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."school_sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_house_id_school_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."school_houses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_updated_by_user_id_user_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "students_record_status_idx" ON "students" USING btree ("status");--> statement-breakpoint
CREATE INDEX "students_enrollment_status_idx" ON "students" USING btree ("enrollment_status");--> statement-breakpoint
CREATE INDEX "students_deleted_at_idx" ON "students" USING btree ("deleted_at");