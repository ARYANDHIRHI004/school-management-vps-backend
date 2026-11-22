import { and, asc, count, desc, eq, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { staffLedgerEntries, staffMembers } from "../db/schema/staff.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";
import { summarizeLedger } from "../utils/ledger.js";
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

export const listLedgerEntries = asyncHandler(
  async (req: Request, res: Response) => {
    const query = req.query as unknown as {
      page: number;
      limit: number;
      staffId?: string;
      category?:
        | "opening_balance"
        | "salary_payment"
        | "advance"
        | "deduction"
        | "bonus"
        | "reimbursement"
        | "adjustment";
      entryType?: "credit" | "debit";
      fromDate?: string;
      toDate?: string;
    };

    const filters = [];
    if (query.staffId) {
      filters.push(eq(staffLedgerEntries.staffId, query.staffId));
    }
    if (query.category) {
      filters.push(eq(staffLedgerEntries.category, query.category));
    }
    if (query.entryType) {
      filters.push(eq(staffLedgerEntries.entryType, query.entryType));
    }
    if (query.fromDate) {
      filters.push(gte(staffLedgerEntries.entryDate, query.fromDate));
    }
    if (query.toDate) {
      filters.push(lte(staffLedgerEntries.entryDate, query.toDate));
    }

    const where = filters.length ? and(...filters) : undefined;
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(staffLedgerEntries)
      .where(where);

    const rows = await db
      .select()
      .from(staffLedgerEntries)
      .where(where)
      .orderBy(desc(staffLedgerEntries.entryDate), desc(staffLedgerEntries.createdAt))
      .limit(query.limit)
      .offset(offset);

    let summary;
    if (query.staffId) {
      const allForStaff = await db
        .select({
          entryType: staffLedgerEntries.entryType,
          amountPaise: staffLedgerEntries.amountPaise,
        })
        .from(staffLedgerEntries)
        .where(eq(staffLedgerEntries.staffId, query.staffId));
      summary = summarizeLedger(allForStaff);
    }

    res.json({
      success: true,
      data: rows,
      summary: summary ?? null,
      meta: {
        page: query.page,
        limit: query.limit,
        total: Number(totalRow?.total ?? 0),
      },
    });
  },
);

export const getStaffLedger = asyncHandler(async (req: Request, res: Response) => {
  const staffId = getParamId(req, "staffId");

  await assertStaffExists(staffId);

  const [staff] = await db
    .select({
      id: staffMembers.id,
      staffCode: staffMembers.staffCode,
      firstName: staffMembers.firstName,
      lastName: staffMembers.lastName,
      designation: staffMembers.designation,
      department: staffMembers.department,
    })
    .from(staffMembers)
    .where(eq(staffMembers.id, staffId));

  const entries = await db
    .select()
    .from(staffLedgerEntries)
    .where(eq(staffLedgerEntries.staffId, staffId))
    .orderBy(asc(staffLedgerEntries.entryDate), asc(staffLedgerEntries.createdAt));

  res.json({
    success: true,
    data: {
      staff,
      entries,
      summary: summarizeLedger(entries),
    },
  });
});

export const createLedgerEntry = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const body = req.body as {
      staffId: string;
      entryDate: string;
      entryType: "credit" | "debit";
      category:
        | "opening_balance"
        | "salary_payment"
        | "advance"
        | "deduction"
        | "bonus"
        | "reimbursement"
        | "adjustment";
      amountPaise: number;
      referenceNumber?: string;
      description?: string;
    };

    await assertStaffExists(body.staffId);

    const id = createId();

    const [row] = await db
      .insert(staffLedgerEntries)
      .values({
        id,
        staffId: body.staffId,
        entryDate: body.entryDate,
        entryType: body.entryType,
        category: body.category,
        amountPaise: body.amountPaise,
        referenceNumber: body.referenceNumber,
        description: body.description,
        recordedByUserId: user.id,
      })
      .returning();

    res.status(201).json({ success: true, data: row });
  },
);

export const getLedgerEntry = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const [row] = await db
    .select()
    .from(staffLedgerEntries)
    .where(eq(staffLedgerEntries.id, id))
    .limit(1);

  if (!row) throw new ApiError(404, "Ledger entry not found");

  res.json({ success: true, data: row });
});