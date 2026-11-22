import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { feeHeads } from "../db/schema/fees.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { createId } from "../utils/ids.js";
import { getParamId } from "../utils/request.js";

export const listFeeHeads = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as {
    page: number;
    limit: number;
    isActive?: "true" | "false";
    search?: string;
  };

  const filters = [];
  if (query.isActive === "true") filters.push(eq(feeHeads.isActive, 1));
  if (query.isActive === "false") filters.push(eq(feeHeads.isActive, 0));
  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(
      or(
        ilike(feeHeads.name, pattern),
        ilike(feeHeads.code, pattern),
      )!,
    );
  }

  const where = filters.length ? and(...filters) : undefined;
  const offset = (query.page - 1) * query.limit;

  const [totalRow] = await db
    .select({ total: count() })
    .from(feeHeads)
    .where(where);

  const rows = await db
    .select()
    .from(feeHeads)
    .where(where)
    .orderBy(desc(feeHeads.createdAt))
    .limit(query.limit)
    .offset(offset);

  res.json({
    success: true,
    data: rows.map((row) => ({ ...row, isActive: row.isActive === 1 })),
    meta: {
      page: query.page,
      limit: query.limit,
      total: Number(totalRow?.total ?? 0),
    },
  });
});

export const createFeeHead = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    code: string;
    name: string;
    description?: string;
  };

  const id = createId();

  try {
    await db.insert(feeHeads).values({
      id,
      code: body.code,
      name: body.name,
      description: body.description,
      isActive: 1,
    });
  } catch {
    throw new ApiError(409, "Fee head code already exists");
  }

  const [row] = await db.select().from(feeHeads).where(eq(feeHeads.id, id));
  res.status(201).json({
    success: true,
    data: { ...row!, isActive: true },
  });
});

export const updateFeeHead = asyncHandler(async (req: Request, res: Response) => {
  const id = getParamId(req);
  const body = req.body as {
    code?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
  };

  const [existing] = await db
    .select()
    .from(feeHeads)
    .where(eq(feeHeads.id, id))
    .limit(1);

  if (!existing) throw new ApiError(404, "Fee head not found");

  const [updated] = await db
    .update(feeHeads)
    .set({
      code: body.code ?? existing.code,
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      isActive:
        body.isActive === undefined
          ? existing.isActive
          : body.isActive
            ? 1
            : 0,
    })
    .where(eq(feeHeads.id, id))
    .returning();

  res.json({
    success: true,
    data: { ...updated!, isActive: updated!.isActive === 1 },
  });
});