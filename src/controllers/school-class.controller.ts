import { and, asc, count, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  schoolClasses,
  schoolSections,
  sectionStaffAssignments,
} from "../db/schema/academic.js";
import { students } from "../db/schema/students.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";
import { getParamId, getValidatedBody } from "../utils/request.js";

export const listSchoolClassesWithSections = asyncHandler(
  async (_req: Request, res: Response) => {
    const classes = await db
      .select()
      .from(schoolClasses)
      .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.name));

    const sections = await db
      .select()
      .from(schoolSections)
      .orderBy(asc(schoolSections.name));

    const byClass = new Map<string, typeof sections>();
    for (const s of sections) {
      const list = byClass.get(s.classId) ?? [];
      list.push(s);
      byClass.set(s.classId, list);
    }

    const data = classes.map((c) => ({
      ...c,
      sections: byClass.get(c.id) ?? [],
    }));

    res.json({ success: true, data });
  },
);

export const createSchoolClass = asyncHandler(
  async (req: Request, res: Response) => {
    const body = getValidatedBody<{
      name: string;
      sortOrder?: number;
    }>(req);

    const [existing] = await db
      .select({ id: schoolClasses.id })
      .from(schoolClasses)
      .where(eq(schoolClasses.name, body.name))
      .limit(1);

    if (existing) {
      throw new ApiError(409, "A class with this name already exists");
    }

    const id = createId();
    const [row] = await db
      .insert(schoolClasses)
      .values({
        id,
        name: body.name,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();

    res.status(201).json({ success: true, data: { ...row, sections: [] } });
  },
);

export const updateSchoolClass = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = getValidatedBody<{
      name?: string;
      sortOrder?: number;
    }>(req);

    const [current] = await db
      .select()
      .from(schoolClasses)
      .where(eq(schoolClasses.id, id))
      .limit(1);

    if (!current) throw new ApiError(404, "Class not found");

    if (body.name && body.name !== current.name) {
      const [duplicate] = await db
        .select({ id: schoolClasses.id })
        .from(schoolClasses)
        .where(eq(schoolClasses.name, body.name))
        .limit(1);
      if (duplicate) throw new ApiError(409, "A class with this name already exists");
    }

    const [row] = await db
      .update(schoolClasses)
      .set({
        name: body.name ?? current.name,
        sortOrder: body.sortOrder ?? current.sortOrder,
      })
      .where(eq(schoolClasses.id, id))
      .returning();

    if (body.name && body.name !== current.name) {
      await db
        .update(students)
        .set({ className: body.name })
        .where(eq(students.className, current.name));
      await db
        .update(sectionStaffAssignments)
        .set({ className: body.name })
        .where(eq(sectionStaffAssignments.className, current.name));
    }

    res.json({ success: true, data: row });
  },
);

export const deleteSchoolClass = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);

    const [current] = await db
      .select()
      .from(schoolClasses)
      .where(eq(schoolClasses.id, id))
      .limit(1);

    if (!current) throw new ApiError(404, "Class not found");

    const [linkedById] = await db
      .select({ total: count() })
      .from(students)
      .where(eq(students.classId, id));

    const [linkedByName] = await db
      .select({ total: count() })
      .from(students)
      .where(eq(students.className, current.name));

    if (
      Number(linkedById?.total ?? 0) > 0 ||
      Number(linkedByName?.total ?? 0) > 0
    ) {
      throw new ApiError(
        400,
        "Cannot delete class while students use this class name. Reassign or rename them first.",
      );
    }

    await db.delete(schoolClasses).where(eq(schoolClasses.id, id));

    res.json({ success: true, data: { id } });
  },
);

export const createSchoolSection = asyncHandler(
  async (req: Request, res: Response) => {
    const classId = getParamId(req, "classId");
    const body = getValidatedBody<{ name: string }>(req);

    const [schoolClass] = await db
      .select()
      .from(schoolClasses)
      .where(eq(schoolClasses.id, classId))
      .limit(1);

    if (!schoolClass) throw new ApiError(404, "Class not found");

    const id = createId();
    try {
      const [row] = await db
        .insert(schoolSections)
        .values({
          id,
          classId,
          name: body.name,
        })
        .returning();

      res.status(201).json({ success: true, data: row });
    } catch {
      throw new ApiError(409, "A section with this name already exists in this class");
    }
  },
);

export const updateSchoolSection = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const body = getValidatedBody<{ name?: string }>(req);

    const [current] = await db
      .select()
      .from(schoolSections)
      .where(eq(schoolSections.id, id))
      .limit(1);

    if (!current) throw new ApiError(404, "Section not found");

    const [schoolClass] = await db
      .select()
      .from(schoolClasses)
      .where(eq(schoolClasses.id, current.classId))
      .limit(1);

    const [row] = await db
      .update(schoolSections)
      .set({ name: body.name ?? current.name })
      .where(eq(schoolSections.id, id))
      .returning();

    if (body.name && body.name !== current.name && schoolClass) {
      await db
        .update(students)
        .set({ section: body.name })
        .where(
          and(
            eq(students.className, schoolClass.name),
            eq(students.section, current.name),
          ),
        );
      await db
        .update(sectionStaffAssignments)
        .set({ section: body.name })
        .where(
          and(
            eq(sectionStaffAssignments.className, schoolClass.name),
            eq(sectionStaffAssignments.section, current.name),
          ),
        );
    }

    res.json({ success: true, data: row });
  },
);

export const deleteSchoolSection = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);

    const [current] = await db
      .select()
      .from(schoolSections)
      .where(eq(schoolSections.id, id))
      .limit(1);

    if (!current) throw new ApiError(404, "Section not found");

    const [schoolClass] = await db
      .select()
      .from(schoolClasses)
      .where(eq(schoolClasses.id, current.classId))
      .limit(1);

    if (schoolClass) {
      const [linkedByName] = await db
        .select({ total: count() })
        .from(students)
        .where(
          and(
            eq(students.className, schoolClass.name),
            eq(students.section, current.name),
          ),
        );

      if (Number(linkedByName?.total ?? 0) > 0) {
        throw new ApiError(
          400,
          "Cannot delete section while students use this class and section. Reassign them first.",
        );
      }
    }

    const [linkedById] = await db
      .select({ total: count() })
      .from(students)
      .where(eq(students.sectionId, id));

    if (Number(linkedById?.total ?? 0) > 0) {
      throw new ApiError(
        400,
        "Cannot delete section while students are linked by section reference.",
      );
    }

    await db.delete(schoolSections).where(eq(schoolSections.id, id));

    res.json({ success: true, data: { id } });
  },
);