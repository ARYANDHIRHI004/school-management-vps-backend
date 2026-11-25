"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";
import { queryKeys } from "@/lib/query-keys";
import {
  useAuthStore,
  type AuthUserSnapshot,
} from "@/stores/auth-store";

function mapSessionUser(
  user: Record<string, unknown> | undefined,
): AuthUserSnapshot | null {
  if (!user || typeof user.email !== "string" || typeof user.id !== "string") {
    return null;
  }
  return {
    id: user.id,
    email: user.email,
    name: typeof user.name === "string" ? user.name : user.email,
    role: typeof user.role === "string" ? user.role : null,
    image: typeof user.image === "string" ? user.image : null,
  };
}

export function useSessionQuery() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const { data, error } = await authClient.getSession();
      if (error) throw new Error(error.message ?? "Failed to load session");
      return data;
    },
  });

  useEffect(() => {
    if (query.isPending) return;
    const mapped = mapSessionUser(
      query.data?.user as Record<string, unknown> | undefined,
    );
    setUser(mapped);
    setHydrated(true);
  }, [query.data, query.isPending, setHydrated, setUser]);

  return query;
}