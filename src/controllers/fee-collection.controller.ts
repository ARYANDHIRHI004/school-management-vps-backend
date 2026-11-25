import { and, count, desc, eq, gte, lte } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  feeCollectionAllocations,
  feeCollections,
  feeReceipts,
  studentFeeDues,
} from "../db/schema/fees.js";
import { students } from "../db/schema/students.js";
import {
  assertStudentAccess,
  resolveScopedStudentId,
} from "../utils/student-access.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { computeDueStatus, outstandingPaise } from "../utils/fees.js";
import { createDocumentNumber } from "../utils/document-number.js";
import { createFeePaymentAlert } from "../utils/fee-alert-create.js";
import { createId } from "../utils/ids.js";
import { paiseToInrLabel } from "../utils/msg91.js";
import { getParamId, getValidatedQuery } from "../utils/request.js";

type AuthUser = { id: string };

export const listFeeCollections = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getValidatedQuery<{
      page: number;
      limit: number;
      studentId?: string;
      fromDate?: string;
      toDate?: string;
      paymentMode?:
        | "cash"
        | "cheque"
        | "bank_transfer"
        | "upi_offline"
        | "other";
    }>(req);

    const scopedStudentId = await resolveScopedStudentId(req, query.studentId);

    const filters = [eq(feeCollections.status, "completed")];
    if (scopedStudentId) {
      filters.push(eq(feeCollections.studentId, scopedStudentId));
    }
    if (query.fromDate) {
      filters.push(gte(feeCollections.collectionDate, query.fromDate));
    }
    if (query.toDate) {
      filters.push(lte(feeCollections.collectionDate, query.toDate));
    }
    if (query.paymentMode) {
      filters.push(eq(feeCollections.paymentMode, query.paymentMode));
    }

    const where = and(...filters);
    const offset = (query.page - 1) * query.limit;

    const [totalRow] = await db
      .select({ total: count() })
      .from(feeCollections)
      .where(where);

    const rows = await db
      .select()
      .from(feeCollections)
      .where(where)
      .orderBy(desc(feeCollections.collectionDate))
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
  },
);

export const getFeeCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const id = getParamId(req);
    const [collection] = await db
      .select()
      .from(feeCollections)
      .where(eq(feeCollections.id, id))
      .limit(1);

    if (!collection) throw new ApiError(404, "Fee collection not found");
    await assertStudentAccess(req, collection.studentId);

    const allocations = await db
      .select({
        allocation: feeCollectionAllocations,
        due: {
          id: studentFeeDues.id,
          dueNumber: studentFeeDues.dueNumber,
          academicYear: studentFeeDues.academicYear,
          term: studentFeeDues.term,
        },
      })
      .from(feeCollectionAllocations)
      .innerJoin(
        studentFeeDues,
        eq(feeCollectionAllocations.dueId, studentFeeDues.id),
      )
      .where(eq(feeCollectionAllocations.collectionId, id));

    const [receipt] = await db
      .select()
      .from(feeReceipts)
      .where(eq(feeReceipts.collectionId, id))
      .limit(1);

    res.json({
      success: true,
      data: {
        collection,
        allocations,
        receipt: receipt ?? null,
      },
    });
  },
);

export const createFeeCollection = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const body = req.body as {
      studentId: string;
      collectionDate: string;
      amountPaise: number;
      paymentMode:
        | "cash"
        | "cheque"
        | "bank_transfer"
        | "upi_offline"
        | "other";
      referenceNumber?: string;
      remarks?: string;
      collectionNumber?: string;
      allocations: { dueId: string; amountPaise: number }[];
    };

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, body.studentId))
      .limit(1);
    if (!student) throw new ApiError(404, "Student not found");

    const allocationSum = body.allocations.reduce(
      (sum, row) => sum + row.amountPaise,
      0,
    );
    if (allocationSum !== body.amountPaise) {
      throw new ApiError(
        400,
        "Sum of allocations must equal collection amountPaise",
      );
    }

    const dues = await db
      .select()
      .from(studentFeeDues)
      .where(eq(studentFeeDues.studentId, body.studentId));

    const dueMap = new Map(dues.map((due) => [due.id, due]));

    for (const allocation of body.allocations) {
      const due = dueMap.get(allocation.dueId);
      if (!due) {
        throw new ApiError(400, "Allocation due does not belong to this student");
      }
      if (due.status === "waived") {
        throw new ApiError(400, "Cannot collect against a waived fee due");
      }
      const outstanding = outstandingPaise(
        due.totalAmountPaise,
        due.paidAmountPaise,
      );
      if (allocation.amountPaise > outstanding) {
        throw new ApiError(
          400,
          `Allocation exceeds outstanding for due ${due.dueNumber}`,
        );
      }
    }

    const collectionId = createId();
    const receiptId = createId();
    const collectionNumber =
      body.collectionNumber ?? createDocumentNumber("COL");
    const receiptNumber = createDocumentNumber("RCP");

    await db.transaction(async (tx) => {
      await tx.insert(feeCollections).values({
        id: collectionId,
        collectionNumber,
        studentId: body.studentId,
        collectionDate: body.collectionDate,
        amountPaise: body.amountPaise,
        paymentMode: body.paymentMode,
        referenceNumber: body.referenceNumber,
        remarks: body.remarks,
        status: "completed",
        collectedByUserId: user.id,
      });

      await tx.insert(feeCollectionAllocations).values(
        body.allocations.map((allocation) => ({
          id: createId(),
          collectionId,
          dueId: allocation.dueId,
          amountPaise: allocation.amountPaise,
        })),
      );

      for (const allocation of body.allocations) {
        const due = dueMap.get(allocation.dueId)!;
        const paidAmountPaise = due.paidAmountPaise + allocation.amountPaise;
        const status = computeDueStatus({
          totalAmountPaise: due.totalAmountPaise,
          paidAmountPaise,
          dueDate: due.dueDate,
        });
        await tx
          .update(studentFeeDues)
          .set({ paidAmountPaise, status })
          .where(eq(studentFeeDues.id, due.id));
      }

      await tx.insert(feeReceipts).values({
        id: receiptId,
        receiptNumber,
        collectionId,
        studentId: body.studentId,
        issueDate: body.collectionDate,
        amountPaise: body.amountPaise,
        paymentMode: body.paymentMode,
        referenceNumber: body.referenceNumber,
        remarks: body.remarks,
        issuedByUserId: user.id,
      });

    });

  await createFeePaymentAlert({
    studentId: body.studentId,
    alertType: "payment_received",
    severity: "info",
    title: "Fee payment recorded",
    message: `A fee payment of ${paiseToInrLabel(body.amountPaise)} was recorded. Receipt ${receiptNumber}.`,
    createdByUserId: user.id,
  });

    const [collection] = await db
      .select()
      .from(feeCollections)
      .where(eq(feeCollections.id, collectionId));

    const [receipt] = await db
      .select()
      .from(feeReceipts)
      .where(eq(feeReceipts.id, receiptId));

    res.status(201).json({
      success: true,
      data: {
        collection,
        receipt,
      },
    });
  },
);