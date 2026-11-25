import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../utils/env.js";
import * as schema from "./schema/index.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
  allowExitOnIdle: false,
});

pool.on("error", (err) => {
  console.error("[postgres] idle client error:", err.message);
});

export const db = drizzle(pool, { schema });

export async function verifyDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}