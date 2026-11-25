import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { DashboardRoleGuard } from "@/components/dashboard-role-guard";
import { DashboardPanel } from "@/components/dashboard-panel";

export default function StudentDashboardPage() {
  return (
    <AuthPortalShell
      variant="login"
      title="Student portal"
      subtitle="View fees, notices, and your academic profile. Access is tied to your admitted student record on the server."
      illustration="/images/illustrations/undraw_reading-a-book_4cap.svg"
      badge="Student"
    >
      <DashboardRoleGuard required="student">
        <DashboardPanel portal="student" />
      </DashboardRoleGuard>
    </AuthPortalShell>
  );
}