import { AdminShell } from "@/components/admin/admin-shell";
import { CertificatesPage } from "@/components/admin/certificates/certificates-page";

export default function AdminCertificatesPage() {
  return (
    <AdminShell
      title="TC / LC"
      subtitle="Transfer and leaving certificates"
    >
      <CertificatesPage />
    </AdminShell>
  );
}