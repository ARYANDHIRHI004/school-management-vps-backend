import { AdminOverview } from "@/components/admin/admin-overview";
import { AdminPlaceholder } from "@/components/admin/admin-placeholder";
import { AdminShell } from "@/components/admin/admin-shell";
import { flattenAdminNav } from "@/config/admin-nav";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function AdminModulePage({ params }: PageProps) {
  const { slug } = await params;
  const path =
    slug && slug.length > 0
      ? `/dashboard/admin/${slug.join("/")}`
      : "/dashboard/admin";

  if (path === "/dashboard/admin") {
    return (
      <AdminShell title="Overview" subtitle="School management console">
        <AdminOverview />
      </AdminShell>
    );
  }

  const navItem = flattenAdminNav().find((item) => item.href === path);
  const title = navItem?.label ?? "Module";
  const description =
    navItem?.description ??
    `This screen will connect to the backend for ${title.toLowerCase()}.`;
  const Icon = navItem?.icon;

  return (
    <AdminShell title={title} subtitle="Admin module (UI preview)">
      <AdminPlaceholder
        title={title}
        description={description}
        icon={Icon}
        apiHint={`Future: ${path.replace("/dashboard/admin", "/api")} …`}
      />
    </AdminShell>
  );
}