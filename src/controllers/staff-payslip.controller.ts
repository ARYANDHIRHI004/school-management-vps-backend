import fs from "node:fs";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { staffMembers, staffPaySlips } from "../db/schema/staff.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createId } from "../utils/ids.js";
import { getParamId } from "../utils/request.js";

type AuthUser = { id: string };

async function assertStaffExists(staffId: string) {
  const [staff] = await db
    .select({ id: staffMembers.id })
    .from(staffMembers)
    .where(eq(staffMembers.id, staffId))
    .limit(1);
  if (!staff) throw new ApiError(404, "Staff member not found");
}

export const listPaySlips = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    staffId?: string;
    fromDate?: string;
    toDate?: string;
  };

  const filters = [];
  if (query.staffId) {
    filters.push(eq(staffPaySlips.staffId, query.staffId));
  }
  if (query.fromDate) {
    filters.push(gte(staffPaySlips.issueDate, query.fromDate));
  }
  if (query.toDate) {
    filters.push(lte(staffPaySlips.issueDate, query.toDate));
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(staffPaySlips)
    .where(where);

  const rows = await db
    .select({
      id: staffPaySlips.id,
      slipNumber: staffPaySlips.slipNumber,
      staffId: staffPaySlips.staffId,
      payPeriodStart: staffPaySlips.payPeriodStart,
      payPeriodEnd: staffPaySlips.payPeriodEnd,
      issueDate: staffPaySlips.issueDate,
      grossAmountPaise: staffPaySlips.grossAmountPaise,
      netAmountPaise: staffPaySlips.netAmountPaise,
      deductionsPaise: staffPaySlips.deductionsPaise,
      fileName: staffPaySlips.fileName,
      mimeType: staffPaySlips.mimeType,
      fileSize: staffPaySlips.fileSize,
      notes: staffPaySlips.notes,
      createdAt: staffPaySlips.createdAt,
      staffCode: staffMembers.staffCode,
      firstName: staffMembers.firstName,
      lastName: staffMembers.lastName,
    })
    .from(staffPaySlips)
    .innerJoin(staffMembers, eq(staffPaySlips.staffId, staffMembers.id))
    .where(where)
    .orderBy(desc(staffPaySlips.issueDate))
    .limit(query.limit)
    .offset(offset);

  res.json({
    success: true,
    data: rows,
    meta: {
      page: query.page,
      limit: query.limit,
      total: Number(totalRow?.total ?? 0),
    },
  });
});

export const getPaySlip = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [row] = await db
    .select()
    .from(staffPaySlips)
    .where(eq(staffPaySlips.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Pay slip not found");

  res.json({ success: true, data: row });
});

export const uploadPaySlip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const file = req.file;
  if (!file) throw new ApiError(400, "Pay slip file is required");

  const body = req.body as {
    staffId: string;
    payPeriodStart: string;
    payPeriodEnd: string;
    issueDate: string;
    slipNumber?: string;
    grossAmountPaise?: number;
    netAmountPaise?: number;
    deductionsPaise?: number;
    notes?: string;
  };

  await assertStaffExists(body.staffId);

  const id = createId();
  const slipNumber = body.slipNumber ?? createDocumentNumber("PAY");

  await db.insert(staffPaySlips).values({
    id,
    slipNumber,
    staffId: body.staffId,
    payPeriodStart: body.payPeriodStart,
    payPeriodEnd: body.payPeriodEnd,
    issueDate: body.issueDate,
    grossAmountPaise: body.grossAmountPaise,
    netAmountPaise: body.netAmountPaise,
    deductionsPaise: body.deductionsPaise,
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    notes: body.notes,
    uploadedByUserId: user.id,
  });

  const [row] = await db
    .select()
    .from(staffPaySlips)
    .where(eq(staffPaySlips.id, id));

  res.status(201).json({ success: true, data: row });
});

export const downloadPaySlip = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [row] = await db
    .select()
    .from(staffPaySlips)
    .where(eq(staffPaySlips.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Pay slip not found");

  if (!fs.existsSync(row.filePath)) {
    throw new ApiError(404, "Pay slip file not found on server");
  }

  res.download(row.filePath, row.fileName);
});