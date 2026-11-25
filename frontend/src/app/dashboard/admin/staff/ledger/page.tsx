import { AdminShell } from "@/components/admin/admin-shell";
import { StaffLedgerPage } from "@/components/admin/staff/staff-ledger-page";

export default function AdminStaffLedgerPage() {
  return (
    <AdminShell title="Staff ledger" subtitle="Credits, debits, and balances">
      <StaffLedgerPage />
    </AdminShell>
  );
}