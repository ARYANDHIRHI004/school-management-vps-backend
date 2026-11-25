import { AdminShell } from "@/components/admin/admin-shell";
import { StaffRegistrationPage } from "@/components/admin/staff/staff-registration-page";

export default function AdminStaffPage() {
  return (
    <AdminShell
      title="Staff registration"
      subtitle="Register and manage school staff"
    >
      <StaffRegistrationPage />
    </AdminShell>
  );
}