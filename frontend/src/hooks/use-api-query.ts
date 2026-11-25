"use client";

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { apiFetch, type ApiSuccess } from "@/lib/api";

/**
 * Typed GET helper for JSON routes that return `{ success, data }`.
 */
export function useApiQuery<TData>(
  queryKey: readonly unknown[],
  path: string,
  options?: Omit<
    UseQueryOptions<ApiSuccess<TData>, Error, ApiSuccess<TData>>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey,
    queryFn: () => apiFetch<TData>(path),
    ...options,
  });
}