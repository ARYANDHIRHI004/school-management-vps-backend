import "dotenv/config";
import { spawnSync } from "node:child_process";
import pg from "pg";

const CONNECT_TIMEOUT_MS = 8_000;

async function assertDatabaseReachable(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL is missing. Copy .env.example to .env and set your Postgres URL.",
    );
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: CONNECT_TIMEOUT_MS,
  });

  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Could not connect to PostgreSQL:", message);
    console.error("");
    console.error("This project expects Postgres at:");
    console.error("  postgresql://postgres:postgres@localhost:5432/school_management");
    console.error("");
    console.error("Start it with Docker (from repo root):");
    console.error("  docker compose up -d");
    console.error("");
    console.error("Then run:");
    console.error("  npm run db:push");
    process.exit(1);
  }
}

await assertDatabaseReachable();

const result = spawnSync("npx", ["drizzle-kit", "push"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);