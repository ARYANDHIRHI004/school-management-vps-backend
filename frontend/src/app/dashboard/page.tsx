import { AuthPortalShell } from "@/components/auth/auth-portal-shell";
import { DashboardPanel } from "@/components/dashboard-panel";

export default function DashboardPage() {
  return (
    <AuthPortalShell
      variant="login"
      title="Your school portal"
      subtitle="Manage academics, fees, and updates in one place. More modules will appear here as we connect the admin and student APIs."
      illustration="/images/illustrations/undraw_reading-a-book_4cap.svg"
      badge="Dashboard"
    >
      <DashboardPanel />
    </AuthPortalShell>
  );
}