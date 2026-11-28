import { asc, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  academicYears,
  schoolClasses,
  schoolHouses,
  schoolSections,
} from "../db/schema/academic.js";
import { asyncHandler } from "../utils/async-handler.js";
import { getValidatedQuery } from "../utils/request.js";
export const listAcademicYears = asyncHandler(
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(academicYears)
      .orderBy(desc(academicYears.code));
    res.json({ success: true, data: rows });
  },
);

export const listSchoolClasses = asyncHandler(
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(schoolClasses)
      .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.name));
    res.json({ success: true, data: rows });
  },
);

export const listSchoolSections = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{ classId?: string }>(req);
    const filters = query.classId
      ? eq(schoolSections.classId, query.classId)
      : undefined;

    const rows = await db
      .select()
      .from(schoolSections)
      .where(filters)
      .orderBy(asc(schoolSections.name));

    res.json({ success: true, data: rows });
  },
);

export const listSchoolHouses = asyncHandler(
  async (_req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(schoolHouses)
      .orderBy(asc(schoolHouses.name));
    res.json({ success: true, data: rows });
  },
);

export const getAcademicOptions = asyncHandler(
  async (_req: Request, res: Response) => {
    const [years, classes, houses, sections] = await Promise.all([
      db.select().from(academicYears).orderBy(asc(academicYears.code)),
      db
        .select()
        .from(schoolClasses)
        .orderBy(asc(schoolClasses.sortOrder), asc(schoolClasses.name)),
      db.select().from(schoolHouses).orderBy(asc(schoolHouses.name)),
      db.select().from(schoolSections).orderBy(asc(schoolSections.name)),
    ]);

    res.json({
      success: true,
      data: { years, classes, sections, houses },
    });
  },
);