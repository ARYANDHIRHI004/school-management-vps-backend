import { Suspense } from "react";

import { ClassesPageClient } from "@/components/admin/classes/classes-page-client";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminClassesPage() {
  return (
    <AdminShell
      title="Classes"
      subtitle="Browse classes, sections, students, and assigned teachers"
    >
      <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
        <ClassesPageClient />
      </Suspense>
    </AdminShell>
  );
}