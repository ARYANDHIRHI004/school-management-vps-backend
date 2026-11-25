import { AdminShell } from "@/components/admin/admin-shell";
import { BifurcationPage } from "@/components/admin/bifurcation/bifurcation-page";

export default function AdminBifurcationPage() {
  return (
    <AdminShell
      title="Bifurcation search"
      subtitle="Find and record class, section, or stream moves"
    >
      <BifurcationPage />
    </AdminShell>
  );
}