import "dotenv/config";
import pg from "pg";

async function main() {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10_000,
  });
  await client.connect();
  const users = await client.query(
    `SELECT id, email, role, email_verified FROM "user" ORDER BY created_at`,
  );
  const accounts = await client.query(
    `SELECT id, user_id, provider_id, account_id,
            CASE WHEN password IS NULL THEN 'null' ELSE 'set' END AS password
     FROM account ORDER BY created_at`,
  );
  console.log("users:", users.rows);
  console.log("accounts:", accounts.rows);
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});