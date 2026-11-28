CREATE TYPE "public"."section_staff_role" AS ENUM('class_teacher', 'subject_teacher', 'assistant');--> statement-breakpoint
CREATE TABLE "section_staff_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"class_name" text NOT NULL,
	"section" text NOT NULL,
	"staff_id" text NOT NULL,
	"role" "section_staff_role" DEFAULT 'class_teacher' NOT NULL,
	"subject" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "section_staff_class_section_staff_role_unique" UNIQUE("class_name","section","staff_id","role")
);
--> statement-breakpoint
ALTER TABLE "section_staff_assignments" ADD CONSTRAINT "section_staff_assignments_staff_id_staff_members_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "section_staff_class_section_idx" ON "section_staff_assignments" USING btree ("class_name","section");