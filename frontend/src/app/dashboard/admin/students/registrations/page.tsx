import { AdminShell } from "@/components/admin/admin-shell";
import { RegistrationsPage } from "@/components/admin/registrations/registrations-page";

export default function AdminRegistrationsPage() {
  return (
    <AdminShell
      title="Registrations"
      subtitle="Student registration records and approval"
    >
      <RegistrationsPage />
    </AdminShell>
  );
}