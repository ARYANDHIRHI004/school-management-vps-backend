import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { schoolClasses, schoolSections } from "../db/schema/academic.js";
import { ApiError } from "../utils/api-error.js";

export type ResolvedClassSection = {
  classId: string;
  sectionId: string;
  className: string;
  section: string;
};

export async function resolveClassSectionPlacement(
  classId: string,
  sectionId: string,
): Promise<ResolvedClassSection> {
  const [schoolClass] = await db
    .select()
    .from(schoolClasses)
    .where(eq(schoolClasses.id, classId))
    .limit(1);

  if (!schoolClass) {
    throw new ApiError(404, "Class not found");
  }

  const [section] = await db
    .select()
    .from(schoolSections)
    .where(
      and(eq(schoolSections.id, sectionId), eq(schoolSections.classId, classId)),
    )
    .limit(1);

  if (!section) {
    throw new ApiError(
      400,
      "Section not found or does not belong to the selected class",
    );
  }

  return {
    classId: schoolClass.id,
    sectionId: section.id,
    className: schoolClass.name,
    section: section.name,
  };
}