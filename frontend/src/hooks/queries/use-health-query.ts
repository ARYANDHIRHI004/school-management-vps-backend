"use client";

import { useQuery } from "@tanstack/react-query";

import { apiBaseUrl } from "@/lib/config";
import { queryKeys } from "@/lib/query-keys";

export type HealthCheck = {
  success: boolean;
  message?: string;
  timestamp?: string;
};

async function fetchHealth(): Promise<HealthCheck> {
  const response = await fetch(`${apiBaseUrl}/api/health`, {
    credentials: "include",
  });
  const body = (await response.json()) as HealthCheck;
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? "Health check failed");
  }
  return body;
}

export function useHealthQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: fetchHealth,
    enabled,
  });
}