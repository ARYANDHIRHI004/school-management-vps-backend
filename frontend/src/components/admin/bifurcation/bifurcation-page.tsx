"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import { useCreateBifurcationMutation } from "@/hooks/mutations/use-bifurcation-mutations";
import { useAdmissionsQuery } from "@/hooks/queries/use-admissions-query";
import { useBifurcationsSearchQuery } from "@/hooks/queries/use-bifurcations-query";
import type {
  BifurcationSearchRow,
  CreateBifurcationInput,
} from "@/types/bifurcation";

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(ymd: string) {
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return ymd;
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function studentName(student: BifurcationSearchRow["student"]) {
  return `${student.firstName} ${student.lastName}`.trim();
}

function placementLabel(
  cls: string | null | undefined,
  section: string | null | undefined,
  stream: string | null | undefined,
) {
  const parts = [cls, section ? `Sec ${section}` : null, stream].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

export function BifurcationPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [stream, setStream] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      page,
      limit: 15,
      search: search || undefined,
      className: className.trim() || undefined,
      section: section.trim() || undefined,
      stream: stream.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, search, className, section, stream, fromDate, toDate],
  );

  const listQuery = useBifurcationsSearchQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setClassName("");
    setSection("");
    setStream("");
    setFromDate("");
    setToDate("");
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Search class/section/stream changes (bifurcations). Record a new move
          when a student shifts wing, class, or stream.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3660]"
        >
          <Plus className="h-4 w-4" />
          Record bifurcation
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h3 className="text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]">
          Search filters
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="relative sm:col-span-2 lg:col-span-3">
            <AuthField
              label="Keyword"
              name="search"
              placeholder="Class, section, stream, reason…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
          </label>
          <AuthField
            label="To class"
            name="className"
            placeholder="e.g. Class 11"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setPage(1);
            }}
          />
          <AuthField
            label="Section"
            name="section"
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setPage(1);
            }}
          />
          <AuthField
            label="Stream"
            name="stream"
            value={stream}
            onChange={(e) => {
              setStream(e.target.value);
              setPage(1);
            }}
          />
          <AuthField
            label="Effective from"
            name="fromDate"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
          />
          <AuthField
            label="Effective to"
            name="toDate"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-4 text-sm font-semibold text-amber-700 hover:text-amber-800"
        >
          Clear filters
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Searching…
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {listQuery.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No bifurcation records match these filters.
          </p>
        ) : (
          <BifurcationTable rows={rows} />
        )}

        {meta && meta.total > 0 ? (
          <PaginationBar
            meta={meta}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
          />
        ) : null}
      </div>

      {createOpen ? (
        <RecordBifurcationModal onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}

function BifurcationTable({ rows }: { rows: BifurcationSearchRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">From</th>
            <th className="px-4 py-3" />
            <th className="px-4 py-3">To</th>
            <th className="px-4 py-3">Effective</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Recorded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(({ bifurcation, student }) => (
            <tr key={bifurcation.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3">
                <p className="font-medium text-[#0F2544]">
                  {studentName(student)}
                </p>
                <p className="text-xs text-gray-500">
                  {student.rollNumber ??
                    student.admissionNumber ??
                    student.registrationNumber ??
                    student.id.slice(0, 10)}
                </p>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {placementLabel(
                  bifurcation.fromClass,
                  bifurcation.fromSection,
                  bifurcation.fromStream,
                )}
              </td>
              <td className="px-2 py-3 text-gray-300">
                <ArrowRight className="h-4 w-4" aria-hidden />
              </td>
              <td className="px-4 py-3 font-medium text-[#0F2544]">
                {placementLabel(
                  bifurcation.toClass,
                  bifurcation.toSection,
                  bifurcation.toStream,
                )}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(bifurcation.effectiveDate)}
              </td>
              <td className="max-w-[12rem] truncate px-4 py-3 text-gray-500">
                {bifurcation.reason ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatWhen(bifurcation.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaginationBar({
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

function ModalOverlay({
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
        {children}
      </div>
    </div>
  );
}

function RecordBifurcationModal({ onClose }: { onClose: () => void }) {
  const create = useCreateBifurcationMutation();
  const admissionsQuery = useAdmissionsQuery({
    page: 1,
    limit: 100,
    status: "active",
  });
  const admitted = admissionsQuery.data?.data ?? [];

  const [studentId, setStudentId] = useState("");
  const selected = admitted.find((a) => a.studentId === studentId);

  const [fromClass, setFromClass] = useState("");
  const [fromSection, setFromSection] = useState("");
  const [fromStream, setFromStream] = useState("");
  const [toClass, setToClass] = useState("");
  const [toSection, setToSection] = useState("");
  const [toStream, setToStream] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(todayYmd());
  const [reason, setReason] = useState("");

  const studentOptions = useMemo(
    () => [
      { value: "", label: "Select student…" },
      ...admitted.map((a) => ({
        value: a.studentId,
        label: a.student
          ? `${a.student.firstName} ${a.student.lastName} — ${a.className}`
          : `${a.admissionNumber} (${a.studentId.slice(0, 8)}…)`,
      })),
    ],
    [admitted],
  );

  useEffect(() => {
    if (!selected) return;
    setFromClass(selected.className);
    setFromSection(selected.section ?? "");
    setFromStream(selected.stream ?? "");
    if (!toClass) setToClass(selected.className);
  }, [selected, toClass]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: CreateBifurcationInput = {
      studentId: studentId.trim(),
      toClass: toClass.trim(),
      effectiveDate,
      fromClass: fromClass.trim() || undefined,
      fromSection: fromSection.trim() || undefined,
      fromStream: fromStream.trim() || undefined,
      toSection: toSection.trim() || undefined,
      toStream: toStream.trim() || undefined,
      reason: reason.trim() || undefined,
    };
    try {
      await create.mutateAsync(payload);
      onClose();
    } catch {
      /* shown below */
    }
  }

  return (
    <ModalOverlay onClose={onClose} wide>
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        Record bifurcation
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Updates the student&apos;s current class/section/stream on save. Leave
        &quot;from&quot; blank to use their profile.
      </p>

      {admissionsQuery.isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading students…
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <AuthSelect
              label="Student"
              name="studentId"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={studentOptions}
            />
            {admitted.length === 0 ? (
              <p className="mt-1 text-xs text-amber-800">
                No active admissions in the list.
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <AuthField
              label="Student ID"
              name="studentIdManual"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              hint="Choose from dropdown or paste ID"
            />
          </div>

          <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            From (optional)
          </p>
          <AuthField
            label="Class"
            name="fromClass"
            value={fromClass}
            onChange={(e) => setFromClass(e.target.value)}
          />
          <AuthField
            label="Section"
            name="fromSection"
            value={fromSection}
            onChange={(e) => setFromSection(e.target.value)}
          />
          <AuthField
            label="Stream"
            name="fromStream"
            value={fromStream}
            onChange={(e) => setFromStream(e.target.value)}
          />

          <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            To
          </p>
          <AuthField
            label="Class"
            name="toClass"
            required
            value={toClass}
            onChange={(e) => setToClass(e.target.value)}
          />
          <AuthField
            label="Section"
            name="toSection"
            value={toSection}
            onChange={(e) => setToSection(e.target.value)}
          />
          <AuthField
            label="Stream"
            name="toStream"
            value={toStream}
            onChange={(e) => setToStream(e.target.value)}
          />

          <div className="sm:col-span-2">
            <AuthField
              label="Effective date"
              name="effectiveDate"
              type="date"
              required
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] sm:col-span-2 font-[family-name:var(--font-heading)]">
            Reason
            <textarea
              name="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border border-gray-200 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 font-[family-name:var(--font-body)]"
            />
          </label>

          {create.isError ? (
            <p className="text-sm text-red-600 sm:col-span-2">
              {create.error.message}
            </p>
          ) : null}

          <div className="flex gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={create.isPending || !studentId || !toClass.trim()}
              className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? "Saving…" : "Save bifurcation"}
            </button>
          </div>
        </form>
      )}
    </ModalOverlay>
  );
}