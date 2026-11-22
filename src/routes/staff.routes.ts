import { Router } from "express";
import {
  createLedgerEntry,
  getLedgerEntry,
  getStaffLedger,
  listLedgerEntries,
} from "../controllers/staff-ledger.controller.js";
import {
  downloadPaySlip,
  getPaySlip,
  listPaySlips,
  uploadPaySlip,
} from "../controllers/staff-payslip.controller.js";
import {
  createStaff,
  getStaff,
  listStaff,
  updateStaff,
} from "../controllers/staff-registration.controller.js";
import { attachSession, requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/rbac.middleware.js";
import { paySlipUpload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createLedgerEntrySchema,
  createStaffRegistrationSchema,
  idParamSchema,
  ledgerListQuerySchema,
  paySlipListQuerySchema,
  staffListQuerySchema,
  updateStaffRegistrationSchema,
  uploadPaySlipMetaSchema,
} from "../validators/staff.validator.js";
import { z } from "zod";

const staffIdParamSchema = z.object({
  staffId: z.string().min(1),
});

const staffRouter = Router();

staffRouter.use(attachSession, requireAuth, requireAdmin);

staffRouter.get("/", validate({ query: staffListQuerySchema }), listStaff);
staffRouter.post(
  "/",
  validate({ body: createStaffRegistrationSchema }),
  createStaff,
);

staffRouter.get(
  "/ledger/entries",
  validate({ query: ledgerListQuerySchema }),
  listLedgerEntries,
);
staffRouter.post(
  "/ledger/entries",
  validate({ body: createLedgerEntrySchema }),
  createLedgerEntry,
);
staffRouter.get(
  "/ledger/entries/:id",
  validate({ params: idParamSchema }),
  getLedgerEntry,
);
staffRouter.get(
  "/ledger/:staffId",
  validate({ params: staffIdParamSchema }),
  getStaffLedger,
);

staffRouter.get(
  "/pay-slips",
  validate({ query: paySlipListQuerySchema }),
  listPaySlips,
);
staffRouter.post(
  "/pay-slips",
  paySlipUpload.single("file"),
  validate({ body: uploadPaySlipMetaSchema }),
  uploadPaySlip,
);
staffRouter.get(
  "/pay-slips/:id/download",
  validate({ params: idParamSchema }),
  downloadPaySlip,
);
staffRouter.get(
  "/pay-slips/:id",
  validate({ params: idParamSchema }),
  getPaySlip,
);

staffRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  getStaff,
);
staffRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateStaffRegistrationSchema }),
  updateStaff,
);

export { staffRouter };