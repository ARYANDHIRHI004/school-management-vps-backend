import { createApp } from "./app.js";
import { verifyDatabaseConnection } from "./db/index.js";
import { env } from "./utils/env.js";

const app = createApp();

async function start() {
  try {
    await verifyDatabaseConnection();
    console.log("PostgreSQL connected");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `PostgreSQL connection failed: ${message}\n` +
        "  → Start Docker: npm run db:up\n" +
        "  → Apply schema: npm run db:push\n" +
        "  → Seed admins: npm run db:seed",
    );
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(
      `Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
    );
    console.log(`CORS origins: ${env.CORS_ORIGINS.join(", ")}`);
  });
}

void start();