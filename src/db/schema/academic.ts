import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { staffMembers } from "./staff.js";

/** Reference data for student academic placement (IDs are text, same as rest of app). */
export const academicYears = pgTable(
  "academic_years",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    label: text("label").notNull(),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
    isCurrent: boolean("is_current").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("academic_years_is_current_idx").on(table.isCurrent)],
);

export const schoolClasses = pgTable(
  "school_classes",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

export const schoolSections = pgTable(
  "school_sections",
  {
    id: text("id").primaryKey(),
    classId: text("class_id")
      .notNull()
      .references(() => schoolClasses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("school_sections_class_id_idx").on(table.classId),
    unique("school_sections_class_name_unique").on(table.classId, table.name),
  ],
);

export const schoolHouses = pgTable(
  "school_houses",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().unique(),
    color: text("color"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
);

export const schoolClassesRelations = relations(schoolClasses, ({ many }) => ({
  sections: many(schoolSections),
}));

export const schoolSectionsRelations = relations(schoolSections, ({ one }) => ({
  schoolClass: one(schoolClasses, {
    fields: [schoolSections.classId],
    references: [schoolClasses.id],
  }),
}));

export const sectionStaffRoleEnum = pgEnum("section_staff_role", [
  "class_teacher",
  "subject_teacher",
  "assistant",
]);

/** Teaching staff assigned to a class + section (uses same labels as students.className / section). */
export const sectionStaffAssignments = pgTable(
  "section_staff_assignments",
  {
    id: text("id").primaryKey(),
    className: text("class_name").notNull(),
    section: text("section").notNull(),
    staffId: text("staff_id")
      .notNull()
      .references(() => staffMembers.id, { onDelete: "cascade" }),
    role: sectionStaffRoleEnum("role").default("class_teacher").notNull(),
    subject: text("subject"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("section_staff_class_section_idx").on(table.className, table.section),
    unique("section_staff_class_section_staff_role_unique").on(
      table.className,
      table.section,
      table.staffId,
      table.role,
    ),
  ],
);

export const sectionStaffAssignmentsRelations = relations(
  sectionStaffAssignments,
  ({ one }) => ({
    staff: one(staffMembers, {
      fields: [sectionStaffAssignments.staffId],
      references: [staffMembers.id],
    }),
  }),
);