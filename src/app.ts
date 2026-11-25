import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./routes/index.js";
import { env } from "./utils/env.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    }),
  );

  app.all("/api/auth/*splat", toNodeHandler(auth));

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "School Management API",
      docs: {
        auth: "/api/auth",
        health: "/api/health",
        students: "/api/students",
        staff: "/api/staff",
        fees: "/api/fees",
      },
    });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}