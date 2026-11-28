import { eq } from "drizzle-orm";
import { studentParents } from "../db/schema/students.js";
import type { db } from "../db/index.js";
import { createId } from "./ids.js";

type Tx = Pick<typeof db, "insert" | "delete">;

/** Create father/mother parent rows when legacy name fields are supplied at inquiry. */
export async function seedParentsFromLegacyNames(
  tx: Tx,
  studentId: string,
  fatherName?: string | null,
  motherName?: string | null,
) {
  const rows: Array<{
    relationship: "father" | "mother";
    name: string;
  }> = [];

  if (fatherName?.trim()) {
    rows.push({ relationship: "father", name: fatherName.trim() });
  }
  if (motherName?.trim()) {
    rows.push({ relationship: "mother", name: motherName.trim() });
  }

  for (const row of rows) {
    const parts = row.name.split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? row.name;
    const lastName =
      parts.length > 1 ? parts.slice(1).join(" ") : row.name;

    await tx.insert(studentParents).values({
      id: createId(),
      studentId,
      relationship: row.relationship,
      firstName,
      lastName,
      isPrimaryContact: row.relationship === "father",
    });
  }
}

export async function clearParentsForStudent(tx: Tx, studentId: string) {
  await tx.delete(studentParents).where(eq(studentParents.studentId, studentId));
}