import { Router } from "express";
import {
  createFeeAlert,
  generateDueReminders,
  generateOverdueFeeAlerts,
  listFeeAlerts,
  updateFeeAlertStatus,
} from "../controllers/fee-alert.controller.js";
import {
  createFeeCollection,
  getFeeCollection,
  listFeeCollections,
} from "../controllers/fee-collection.controller.js";
import {
  createFeeDue,
  getFeeDue,
  listFeeDues,
  updateFeeDue,
} from "../controllers/fee-due.controller.js";
import {
  createFeeHead,
  listFeeHeads,
  updateFeeHead,
} from "../controllers/fee-head.controller.js";
import { listOutstandingStudents } from "../controllers/fee-outstanding.controller.js";
import {
  getFeeReceipt,
  listFeeReceipts,
} from "../controllers/fee-receipt.controller.js";
import {
  getStudentStatementByPath,
  getStudentStatementByQuery,
} from "../controllers/fee-statement.controller.js";
import { attachSession, requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createFeeAlertSchema,
  createFeeCollectionSchema,
  createFeeHeadSchema,
  createStudentFeeDueSchema,
  feeAlertListQuerySchema,
  feeCollectionListQuerySchema,
  feeDueListQuerySchema,
  feeHeadListQuerySchema,
  feeReceiptListQuerySchema,
  idParamSchema,
  outstandingListQuerySchema,
  studentIdParamSchema,
  studentStatementQuerySchema,
  updateFeeAlertStatusSchema,
  updateFeeHeadSchema,
  updateStudentFeeDueSchema,
} from "../validators/fees.validator.js";

const feesRouter = Router();

feesRouter.use(attachSession, requireAuth);

feesRouter.get(
  "/heads",
  requireAdmin,
  validate({ query: feeHeadListQuerySchema }),
  listFeeHeads,
);
feesRouter.post(
  "/heads",
  requireAdmin,
  validate({ body: createFeeHeadSchema }),
  createFeeHead,
);
feesRouter.patch(
  "/heads/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateFeeHeadSchema }),
  updateFeeHead,
);

feesRouter.get(
  "/dues",
  validate({ query: feeDueListQuerySchema }),
  listFeeDues,
);
feesRouter.get(
  "/dues/:id",
  validate({ params: idParamSchema }),
  getFeeDue,
);
feesRouter.post(
  "/dues",
  requireAdmin,
  validate({ body: createStudentFeeDueSchema }),
  createFeeDue,
);
feesRouter.patch(
  "/dues/:id",
  requireAdmin,
  validate({ params: idParamSchema, body: updateStudentFeeDueSchema }),
  updateFeeDue,
);

feesRouter.get(
  "/collections",
  validate({ query: feeCollectionListQuerySchema }),
  listFeeCollections,
);
feesRouter.get(
  "/collections/:id",
  validate({ params: idParamSchema }),
  getFeeCollection,
);
feesRouter.post(
  "/collections",
  requireAdmin,
  validate({ body: createFeeCollectionSchema }),
  createFeeCollection,
);

feesRouter.get(
  "/receipts",
  validate({ query: feeReceiptListQuerySchema }),
  listFeeReceipts,
);
feesRouter.get(
  "/receipts/:id",
  validate({ params: idParamSchema }),
  getFeeReceipt,
);

feesRouter.get(
  "/statement",
  validate({ query: studentStatementQuerySchema }),
  getStudentStatementByQuery,
);
feesRouter.get(
  "/statement/:studentId",
  validate({
    params: studentIdParamSchema,
    query: studentStatementQuerySchema,
  }),
  getStudentStatementByPath,
);

feesRouter.get(
  "/outstanding",
  requireAdmin,
  validate({ query: outstandingListQuerySchema }),
  listOutstandingStudents,
);

feesRouter.get(
  "/alerts",
  validate({ query: feeAlertListQuerySchema }),
  listFeeAlerts,
);
feesRouter.post(
  "/alerts",
  requireAdmin,
  validate({ body: createFeeAlertSchema }),
  createFeeAlert,
);
feesRouter.patch(
  "/alerts/:id",
  validate({ params: idParamSchema, body: updateFeeAlertStatusSchema }),
  updateFeeAlertStatus,
);
feesRouter.post(
  "/alerts/generate-overdue",
  requireAdmin,
  generateOverdueFeeAlerts,
);
feesRouter.post(
  "/alerts/generate-due-reminders",
  requireAdmin,
  generateDueReminders,
);

export { feesRouter };