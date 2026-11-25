import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { staffMembers } from "../db/schema/staff.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import {
  getParamId,
  getValidatedBody,
  getValidatedQuery,
} from "../utils/request.js";

type AuthUser = { id: string };

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const query = getValidatedQuery<{
    page: number;
    limit: number;
    status?: "active" | "inactive" | "resigned";
    department?: string;
    designation?: string;
    isTeachingStaff?: boolean;
    search?: string;
  }>(req);

  const filters = [];
  if (query.status) {
    filters.push(eq(staffMembers.status, query.status));
  }
  if (query.department) {
    filters.push(eq(staffMembers.department, query.department));
  }
  if (query.designation) {
    filters.push(eq(staffMembers.designation, query.designation));
  }
  if (query.isTeachingStaff !== undefined) {
    filters.push(eq(staffMembers.isTeachingStaff, query.isTeachingStaff ? 1 : 0));
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(
      or(
        ilike(staffMembers.firstName, pattern),
        ilike(staffMembers.lastName, pattern),
        ilike(staffMembers.staffCode, pattern),
        ilike(staffMembers.email, pattern),
        ilike(staffMembers.phone, pattern),
      )!,
    );
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(staffMembers)
    .where(where);

  const rows = await db
    .select()
    .from(staffMembers)
    .where(where)
    .orderBy(desc(staffMembers.createdAt))
    .limit(query.limit)
    .offset(offset);

  res.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      isTeachingStaff: row.isTeachingStaff === 1,
    })),
    meta: {
      page: query.page,
      limit: query.limit,
      total: Number(totalRow?.total ?? 0),
    },
  });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [row] = await db
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Staff member not found");

  res.json({
    success: true,
    data: { ...row, isTeachingStaff: row.isTeachingStaff === 1 },
  });
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const body = getValidatedBody<{
    firstName: string;
    lastName: string;
    designation: string;
    department?: string;
    employmentType?: "permanent" | "contract" | "part_time";
    isTeachingStaff?: boolean;
    dateOfJoining?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    qualifications?: string;
    subjectsTaught?: string;
    baseSalaryPaise?: number;
    staffCode?: string;
  }>(req);

  const id = createId();
  const staffCode = body.staffCode ?? createDocumentNumber("STF");

  await db.insert(staffMembers).values({
    id,
    staffCode,
    firstName: body.firstName,
    lastName: body.lastName,
    designation: body.designation,
    department: body.department,
    employmentType: body.employmentType ?? "permanent",
    isTeachingStaff: body.isTeachingStaff ? 1 : 0,
    dateOfJoining: body.dateOfJoining,
    email: body.email,
    phone: body.phone,
    gender: body.gender,
    dateOfBirth: body.dateOfBirth,
    address: body.address,
    qualifications: body.qualifications,
    subjectsTaught: body.subjectsTaught,
    baseSalaryPaise: body.baseSalaryPaise,
    registeredByUserId: user.id,
    status: "active",
  });

  const [row] = await db
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.id, id));

  res.status(201).json({
    success: true,
    data: { ...row!, isTeachingStaff: row!.isTeachingStaff === 1 },
  });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const body = getValidatedBody<{
    firstName?: string;
    lastName?: string;
    designation?: string;
    department?: string;
    employmentType?: "permanent" | "contract" | "part_time";
    isTeachingStaff?: boolean;
    dateOfJoining?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dateOfBirth?: string;
    address?: string;
    qualifications?: string;
    subjectsTaught?: string;
    baseSalaryPaise?: number;
    status?: "active" | "inactive" | "resigned";
    staffCode?: string;
  }>(req);

  const [existing] = await db
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Staff member not found");

  const [updated] = await db
    .update(staffMembers)
    .set({
      firstName: body.firstName ?? existing.firstName,
      lastName: body.lastName ?? existing.lastName,
      designation: body.designation ?? existing.designation,
      department: body.department ?? existing.department,
      employmentType: body.employmentType ?? existing.employmentType,
      isTeachingStaff:
        body.isTeachingStaff === undefined
          ? existing.isTeachingStaff
          : body.isTeachingStaff
            ? 1
            : 0,
      dateOfJoining: body.dateOfJoining ?? existing.dateOfJoining,
      email: body.email ?? existing.email,
      phone: body.phone ?? existing.phone,
      gender: body.gender ?? existing.gender,
      dateOfBirth: body.dateOfBirth ?? existing.dateOfBirth,
      address: body.address ?? existing.address,
      qualifications: body.qualifications ?? existing.qualifications,
      subjectsTaught: body.subjectsTaught ?? existing.subjectsTaught,
      baseSalaryPaise: body.baseSalaryPaise ?? existing.baseSalaryPaise,
      status: body.status ?? existing.status,
      staffCode: body.staffCode ?? existing.staffCode,
    })
    .where(eq(staffMembers.id, id))
    .returning();

  res.json({
    success: true,
    data: { ...updated!, isTeachingStaff: updated!.isTeachingStaff === 1 },
  });
});