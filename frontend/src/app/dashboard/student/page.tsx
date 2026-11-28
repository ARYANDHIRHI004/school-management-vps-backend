import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { DashboardRoleGuard } from "@/components/dashboard-role-guard";
import { StudentPortalDashboard } from "@/components/student/student-portal-dashboard";

export default function StudentDashboardPage() {
  return (
    <AuthPortalShell
      variant="login"
      wide
      title="Student portal"
      subtitle="Your profile, class details, parents, and admission summary from the school records."
      illustration="/images/illustrations/undraw_reading-a-book_4cap.svg"
      badge="Student"
    >
      <DashboardRoleGuard required="student">
        <StudentPortalDashboard />
      </DashboardRoleGuard>
    </AuthPortalShell>
  );
}