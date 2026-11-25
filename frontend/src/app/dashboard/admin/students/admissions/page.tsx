import { AdminShell } from "@/components/admin/admin-shell";
import { AdmissionsPage } from "@/components/admin/admissions/admissions-page";

export default function AdminAdmissionsPage() {
  return (
    <AdminShell title="Admissions" subtitle="Enroll students into the school">
      <AdmissionsPage />
    </AdminShell>
  );
}