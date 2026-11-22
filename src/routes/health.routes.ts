import { Router } from "express";
import { getHealth, getMe } from "../controllers/health.controller.js";
import { attachSession, requireAuth } from "../middlewares/auth.middleware.js";

const healthRouter = Router();

healthRouter.get("/", getHealth);
healthRouter.get("/me", attachSession, requireAuth, getMe);

export { healthRouter };