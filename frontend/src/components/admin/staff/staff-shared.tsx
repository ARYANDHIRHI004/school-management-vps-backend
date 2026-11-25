"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { useStaffListQuery } from "@/hooks/queries/use-staff-query";
import type { StaffMember } from "@/types/staff";

export function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(ymd: string) {
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return ymd;
  }
}

export function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function staffDisplayName(
  row: Pick<StaffMember, "firstName" | "lastName" | "staffCode">,
) {
  return `${row.firstName} ${row.lastName}`.trim() + ` (${row.staffCode})`;
}

export function ModalOverlay({
  onClose,
  children,
  wide,
}: {
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function PaginationBar({
  meta,
  totalPages,
  page,
  setPage,
}: {
  meta: { page: number; limit: number; total: number };
  totalPages: number;
  page: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Page {meta.page} of {totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function useStaffOptions(activeOnly = true) {
  const query = useStaffListQuery({
    page: 1,
    limit: 200,
    status: activeOnly ? "active" : undefined,
  });
  const list = query.data?.data ?? [];
  const options = [
    { value: "", label: "Select staff…" },
    ...list.map((s) => ({
      value: s.id,
      label: staffDisplayName(s),
    })),
  ];
  return { query, options, list };
}