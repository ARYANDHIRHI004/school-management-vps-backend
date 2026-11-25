"use client";

import { Loader2, LogOut, Menu } from "lucide-react";

import { useSignOutMutation } from "@/hooks/mutations/use-auth-mutations";
import { useAuthStore } from "@/stores/auth-store";

type AdminTopbarProps = {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
};

export function AdminTopbar({
  title,
  subtitle,
  onMenuClick,
}: AdminTopbarProps) {
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOutMutation();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg border border-gray-200 p-2 text-[#0F2544] hover:bg-gray-50 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544] sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="hidden truncate text-sm text-gray-500 sm:block">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {user?.email ? (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-[#0F2544]">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-[#0F2544] transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-60"
        >
          {signOut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}