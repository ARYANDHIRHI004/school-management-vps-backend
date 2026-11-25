import { DashboardRoleGuard } from "@/components/dashboard-role-guard";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardRoleGuard required="admin">{children}</DashboardRoleGuard>;
}