import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { feesRouter } from "./fees.routes.js";
import { staffRouter } from "./staff.routes.js";
import { studentRouter } from "./student.routes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/students", studentRouter);
apiRouter.use("/staff", staffRouter);
apiRouter.use("/fees", feesRouter);

export { apiRouter };