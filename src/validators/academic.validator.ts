import { z } from "zod";
import { idParamSchema } from "./student.validator.js";

export const createSchoolClassSchema = z.object({
  name: z.string().trim().min(1).max(50),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const updateSchoolClassSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
});

export const createSchoolSectionSchema = z.object({
  name: z.string().trim().min(1).max(50),
});

export const updateSchoolSectionSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
});

export const schoolClassIdParamSchema = idParamSchema;

export const schoolClassNestedParamSchema = z.object({
  classId: z.string().min(1),
});

export const schoolSectionIdParamSchema = z.object({
  id: z.string().min(1),
});