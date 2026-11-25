"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useSessionQuery } from "@/hooks/queries/use-session-query";
import { dashboardPathForRole } from "@/lib/roles";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSessionQuery();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/login");
      return;
    }
    const role = (session.user as { role?: string }).role;
    router.replace(dashboardPathForRole(role));
  }, [isPending, router, session]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] text-gray-600">
      <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      <p className="mt-3 text-sm">Redirecting to your portal…</p>
    </div>
  );
}