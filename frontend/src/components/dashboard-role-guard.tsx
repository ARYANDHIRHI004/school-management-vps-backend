"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { useSessionQuery } from "@/hooks/queries/use-session-query";
import { dashboardPathForRole, isAdminRole, type PortalIntent } from "@/lib/roles";

type DashboardRoleGuardProps = {
  required: PortalIntent;
  children: ReactNode;
};

export function DashboardRoleGuard({
  required,
  children,
}: DashboardRoleGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSessionQuery();
  const role = (session?.user as { role?: string } | undefined)?.role;

  useEffect(() => {
    if (isPending || !session?.user) return;
    const expectedAdmin = required === "admin";
    const actualAdmin = isAdminRole(role);
    if (expectedAdmin !== actualAdmin) {
      router.replace(dashboardPathForRole(role));
    }
  }, [isPending, required, role, router, session?.user]);

  if (isPending) {
    return (
      <AuthCard className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <span className="text-sm text-gray-600">Loading session…</span>
      </AuthCard>
    );
  }

  if (!session?.user) {
    return (
      <AuthCard>
        <p className="font-semibold text-[#0F2544]">Sign in required</p>
        <Link
          href="/login"
          className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:underline"
        >
          Go to login
        </Link>
      </AuthCard>
    );
  }

  const expectedAdmin = required === "admin";
  const actualAdmin = isAdminRole(role);
  if (expectedAdmin !== actualAdmin) {
    return (
      <AuthCard className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
      </AuthCard>
    );
  }

  return <>{children}</>;
}