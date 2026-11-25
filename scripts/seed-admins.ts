import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import pg from "pg";

import { db } from "../src/db/index.js";
import { account, user } from "../src/db/schema/auth.js";
import { createId } from "../src/utils/ids.js";
import { ROLES } from "../src/utils/roles.js";

type SeedAdmin = {
  email: string;
  password: string;
  name: string;
};

const DEFAULT_ADMINS: SeedAdmin[] = [
  {
    email: "admin@school.local",
    name: "School Admin",
    password: "Admin@123456",
  },
  {
    email: "admin2@school.local",
    name: "Deputy Admin",
    password: "Admin2@123456",
  },
];

function loadAdminsFromEnv(): SeedAdmin[] {
  const overrides: SeedAdmin[] = [
    {
      email: process.env.SEED_ADMIN1_EMAIL ?? DEFAULT_ADMINS[0].email,
      name: process.env.SEED_ADMIN1_NAME ?? DEFAULT_ADMINS[0].name,
      password: process.env.SEED_ADMIN1_PASSWORD ?? DEFAULT_ADMINS[0].password,
    },
    {
      email: process.env.SEED_ADMIN2_EMAIL ?? DEFAULT_ADMINS[1].email,
      name: process.env.SEED_ADMIN2_NAME ?? DEFAULT_ADMINS[1].name,
      password: process.env.SEED_ADMIN2_PASSWORD ?? DEFAULT_ADMINS[1].password,
    },
  ];
  return overrides;
}

async function assertDatabaseReachable(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Copy .env.example to .env first.");
  }
  const client = new pg.Client({
    connectionString: url,
    connectionTimeoutMillis: 8_000,
  });
  try {
    await client.connect();
    await client.query("select 1");
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function repairCredentialAccountId(userId: string, email: string) {
  const rows = await db.select().from(account).where(eq(account.userId, userId));
  const credential = rows.find((r) => r.providerId === "credential");
  if (!credential) return false;

  if (credential.accountId === userId) return false;

  await db
    .update(account)
    .set({ accountId: userId, updatedAt: new Date() })
    .where(eq(account.id, credential.id));
  console.log(`repaired account_id → user.id for ${email}`);
  return true;
}

async function upsertAdmin(entry: SeedAdmin): Promise<void> {
  const [existing] = await db
    .select()
    .from(user)
    .where(eq(user.email, entry.email))
    .limit(1);

  if (existing) {
    let changed = false;
    if (!existing.role?.includes(ROLES.ADMIN)) {
      await db
        .update(user)
        .set({ role: ROLES.ADMIN, updatedAt: new Date() })
        .where(eq(user.id, existing.id));
      console.log(`updated role → admin: ${entry.email}`);
      changed = true;
    }
    const repaired = await repairCredentialAccountId(existing.id, entry.email);
    if (!changed && !repaired) {
      console.log(`skip (exists): ${entry.email}`);
    }
    return;
  }

  const userId = createId();
  const accountId = createId();
  const hashedPassword = await hashPassword(entry.password);
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: entry.name,
      email: entry.email,
      emailVerified: true,
      role: ROLES.ADMIN,
      banned: false,
      createdAt: now,
      updatedAt: now,
    });

    await tx.insert(account).values({
      id: accountId,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });
  });

  console.log(`created admin: ${entry.email}`);
}

async function main(): Promise<void> {
  await assertDatabaseReachable();
  const admins = loadAdminsFromEnv();

  console.log("Seeding admin users…\n");
  for (const admin of admins) {
    await upsertAdmin(admin);
  }

  console.log("\nDone. Sign in at the frontend /login → Admin portal.");
  console.log("Students are not seeded — use admin APIs:");
  console.log("  inquiry → registration → admission → portal-access (or link-user)");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Seed failed:", message);
  process.exit(1);
});