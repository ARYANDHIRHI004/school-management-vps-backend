import { AdminShell } from "@/components/admin/admin-shell";
import { InquiriesPage } from "@/components/admin/inquiries/inquiries-page";

export default function AdminInquiriesPage() {
  return (
    <AdminShell
      title="Inquiries"
      subtitle="Admission inquiries and lead tracking"
    >
      <InquiriesPage />
    </AdminShell>
  );
}