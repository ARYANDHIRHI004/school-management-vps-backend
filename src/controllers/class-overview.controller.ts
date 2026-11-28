import { and, asc, count, eq, ilike, isNotNull, isNull, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  schoolClasses,
  schoolSections,
  sectionStaffAssignments,
} from "../db/schema/academic.js";
import { staffMembers } from "../db/schema/staff.js";
import { students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";
import { getParamId, getValidatedBody, getValidatedQuery } from "../utils/request.js";

const activeStudentFilter = and(
  isNull(students.deletedAt),
  isNotNull(students.className),
);

export const listClassOverview = asyncHandler(
  async (_req: Request, res: Response) => {
    const grouped = await db
      .select({
        className: students.className,
        section: students.section,
        total: count(),
      })
      .from(students)
      .where(activeStudentFilter)
      .groupBy(students.className, students.section);

    const classRows = await db
      .select({
        id: schoolClasses.id,
        name: schoolClasses.name,
        sortOrder: schoolClasses.sortOrder,
      })
      .from(schoolClasses)
      .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.name));

    const classIdByName = new Map(classRows.map((c) => [c.name, c.id]));

    const sectionRows = await db
      .select({
        id: schoolSections.id,
        classId: schoolSections.classId,
        name: schoolSections.name,
        className: schoolClasses.name,
      })
      .from(schoolSections)
      .innerJoin(schoolClasses, eq(schoolSections.classId, schoolClasses.id));

    const sectionIdByKey = new Map(
      sectionRows.map((s) => [`${s.className}\0${s.name}`, s.id]),
    );

    const classMap = new Map<
      string,
      {
        id: string | null;
        name: string;
        totalStudents: number;
        sections: { id: string | null; name: string; studentCount: number }[];
      }
    >();

    for (const row of grouped) {
      if (!row.className) continue;
      const className = row.className;
      let entry = classMap.get(className);
      if (!entry) {
        entry = {
          id: classIdByName.get(className) ?? null,
          name: className,
          totalStudents: 0,
          sections: [],
        };
        classMap.set(className, entry);
      }
      const sectionName = row.section?.trim() || "Unassigned";
      entry.totalStudents += Number(row.total);
      const sectionId =
        sectionName === "Unassigned"
          ? null
          : (sectionIdByKey.get(`${className}\0${sectionName}`) ?? null);
      entry.sections.push({
        id: sectionId,
        name: sectionName,
        studentCount: Number(row.total),
      });
    }

    for (const ref of classRows) {
      if (!classMap.has(ref.name)) {
        classMap.set(ref.name, {
          id: ref.id,
          name: ref.name,
          totalStudents: 0,
          sections: [],
        });
      } else {
        const entry = classMap.get(ref.name)!;
        entry.id = ref.id;
      }
    }

    for (const row of sectionRows) {
      const entry = classMap.get(row.className);
      if (!entry) continue;
      if (!entry.sections.some((s) => s.name === row.name)) {
        entry.sections.push({
          id: row.id,
          name: row.name,
          studentCount: 0,
        });
      }
    }

    const classes = [...classMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );

    for (const c of classes) {
      c.sections.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true }),
      );
    }

    res.json({ success: true, data: { classes } });
  },
);

export const getClassSectionDetail = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      className: string;
      section: string;
      page: number;
      limit: number;
      search?: string;
    }>(req);

    const sectionLabel =
      query.section === "Unassigned" ? "" : query.section;

    const studentFilters = [
      isNull(students.deletedAt),
      ilike(students.className, query.className),
    ];

    if (sectionLabel) {
      studentFilters.push(ilike(students.section, sectionLabel));
    } else {
      studentFilters.push(
        or(isNull(students.section), eq(students.section, ""))!,
      );
    }

    if (query.search?.trim()) {
      const pattern = `%${query.search.trim()}%`;
      studentFilters.push(
        or(
          ilike(students.firstName, pattern),
          ilike(students.lastName, pattern),
          ilike(students.admissionNumber, pattern),
          ilike(students.rollNumber, pattern),
        )!,
      );
    }

    const studentWhere = and(...studentFilters);
    const offset = (query.page - 1) * query.limit;

    const teacherRows = await db
      .select({
        id: sectionStaffAssignments.id,
        role: sectionStaffAssignments.role,
        subject: sectionStaffAssignments.subject,
        staffId: staffMembers.id,
        staffCode: staffMembers.staffCode,
        firstName: staffMembers.firstName,
        lastName: staffMembers.lastName,
        designation: staffMembers.designation,
        phone: staffMembers.phone,
        email: staffMembers.email,
      })
      .from(sectionStaffAssignments)
      .innerJoin(staffMembers, eq(sectionStaffAssignments.staffId, staffMembers.id))
      .where(
        and(
          eq(sectionStaffAssignments.className, query.className),
          eq(sectionStaffAssignments.section, query.section),
        ),
      );

    const [totalRow] = await db
      .select({ total: count() })
      .from(students)
      .where(studentWhere);

    const studentRows = await db
      .select({
        id: students.id,
        admissionNumber: students.admissionNumber,
        rollNumber: students.rollNumber,
        firstName: students.firstName,
        middleName: students.middleName,
        lastName: students.lastName,
        gender: students.gender,
        phone: students.phone,
        email: students.email,
        enrollmentStatus: students.enrollmentStatus,
        lifecycleStatus: students.lifecycleStatus,
      })
      .from(students)
      .where(studentWhere)
      .orderBy(asc(students.rollNumber), asc(students.firstName))
      .limit(query.limit)
      .offset(offset);

    res.json({
      success: true,
      data: {
        className: query.className,
        section: query.section,
        teachers: teacherRows,
        students: studentRows,
      },
      meta: {
        page: query.page,
        limit: query.limit,
        total: Number(totalRow?.total ?? 0),
      },
    });
  },
);

export const assignSectionStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const body = getValidatedBody<{
      className: string;
      section: string;
      staffId: string;
      role?: "class_teacher" | "subject_teacher" | "assistant";
      subject?: string;
    }>(req);

    const [staff] = await db
      .select({ id: staffMembers.id })
      .from(staffMembers)
      .where(eq(staffMembers.id, body.staffId))
      .limit(1);

    if (!staff) throw new ApiError(404, "Staff member not found");

    const id = createId();

    await db.insert(sectionStaffAssignments).values({
      id,
      className: body.className,
      section: body.section,
      staffId: body.staffId,
      role: body.role ?? "class_teacher",
      subject: body.subject,
    });

    const [row] = await db
      .select()
      .from(sectionStaffAssignments)
      .where(eq(sectionStaffAssignments.id, id));

    res.status(201).json({ success: true, data: row });
  },
);

export const removeSectionStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    await db
      .delete(sectionStaffAssignments)
      .where(eq(sectionStaffAssignments.id, id));
    res.json({ success: true, data: { id } });
  },
);