"use client";

import Link from "next/link";
import { Loader2, LogOut } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { useSignOutMutation } from "@/hooks/mutations/use-auth-mutations";
import { useHealthQuery } from "@/hooks/queries/use-health-query";
import { useSessionQuery } from "@/hooks/queries/use-session-query";
import { useAuthStore } from "@/stores/auth-store";

export function DashboardPanel() {
  const { data: session, isPending } = useSessionQuery();
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOutMutation();
  const health = useHealthQuery(Boolean(session?.user));

  if (isPending) {
    return (
      <AuthCard className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <p className="text-sm text-gray-600">Loading session…</p>
      </AuthCard>
    );
  }

  if (!session?.user) {
    return (
      <AuthCard>
        <p className="font-[family-name:var(--font-heading)] font-semibold text-[#0F2544]">
          You are not signed in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
        >
          Go to portal sign in
        </Link>
      </AuthCard>
    );
  }

  const displayEmail = user?.email ?? session.user.email;
  const displayRole =
    user?.role ?? (session.user as { role?: string }).role ?? "user";

  return (
    <AuthCard className="max-w-lg">
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold text-[#0F2544]">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-gray-600 font-[family-name:var(--font-body)]">
        Signed in as {displayEmail}{" "}
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
          {displayRole}
        </span>
      </p>

      <div className="mt-6 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 text-sm">
        <p className="font-semibold text-[#0F2544]">API health (TanStack Query)</p>
        {health.isLoading ? (
          <p className="mt-2 text-gray-500">Checking backend…</p>
        ) : health.isError ? (
          <AuthMessage variant="error">
            {health.error instanceof Error ? health.error.message : "Health check failed"}
          </AuthMessage>
        ) : (
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-700">
            <li>{health.data?.message}</li>
            {health.data?.timestamp ? <li>{health.data.timestamp}</li> : null}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => signOut.mutate()}
        disabled={signOut.isPending}
        className="mt-6 flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-[#0F2544] transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-60"
      >
        {signOut.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        Sign out
      </button>
    </AuthCard>
  );
}