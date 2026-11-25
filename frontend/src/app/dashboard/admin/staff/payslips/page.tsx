import { AdminShell } from "@/components/admin/admin-shell";
import { StaffPaySlipsPage } from "@/components/admin/staff/staff-payslips-page";

export default function AdminStaffPaySlipsPage() {
  return (
    <AdminShell title="Pay slips" subtitle="Upload and download staff pay slips">
      <StaffPaySlipsPage />
    </AdminShell>
  );
}