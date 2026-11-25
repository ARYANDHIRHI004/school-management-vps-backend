"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { redirectAfterAuth } from "@/lib/auth-routes";
import { useSessionQuery } from "@/hooks/queries/use-session-query";

export function AuthRedirectIfSession() {
  const router = useRouter();
  const { data: session, isPending } = useSessionQuery();

  useEffect(() => {
    if (isPending || !session?.user) return;
    const role = (session.user as { role?: string }).role;
    void redirectAfterAuth(router, role);
  }, [isPending, router, session]);

  return null;
}