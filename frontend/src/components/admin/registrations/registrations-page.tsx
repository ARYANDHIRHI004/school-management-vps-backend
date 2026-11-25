"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Loader2,
  Plus,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import { useCreateAdmissionMutation } from "@/hooks/mutations/use-admission-mutations";
import {
  useCreateRegistrationMutation,
  useUpdateRegistrationMutation,
} from "@/hooks/mutations/use-registration-mutations";
import {
  useRegistrationQuery,
  useRegistrationsQuery,
} from "@/hooks/queries/use-registrations-query";
import type {
  RegistrationStatus,
  StudentRegistration,
} from "@/types/registration";

const STATUS_FILTER: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_EDIT: { value: RegistrationStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

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

function formatDate(ymd: string) {
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return ymd;
  }
}

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function studentLabel(row: StudentRegistration) {
  if (row.student) {
    return `${row.student.firstName} ${row.student.lastName}`.trim();
  }
  return shortId(row.studentId);
}

function StatusBadge({ status }: { status: RegistrationStatus }) {
  const styles =
    status === "pending"
      ? "bg-amber-100 text-amber-800"
      : status === "approved"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-red-100 text-red-800";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RegistrationStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
      status: status || undefined,
      search: search || undefined,
    }),
    [page, status, search],
  );

  const listQuery = useRegistrationsQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  const pendingOnPage = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="On this page" value={String(rows.length)} />
        <StatTile
          label="Pending (page)"
          value={String(pendingOnPage)}
          tone="amber"
        />
        <StatTile
          label="Total records"
          value={meta ? String(meta.total) : "—"}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Review registrations after inquiry conversion. Approve to move toward
          admission.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a3660]"
          >
            <Plus className="h-4 w-4" />
            Manual registration
          </button>
          <Link
            href="/dashboard/admin/students/inquiries"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2544] shadow-sm transition hover:border-amber-300 hover:bg-amber-50/50"
          >
            <UserPlus className="h-4 w-4" />
            From inquiries
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="relative flex-1">
          <AuthField
            label="Search"
            name="search"
            placeholder="Reg #, student name, inquiry…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
        </label>
        <div className="w-full sm:max-w-[220px]">
          <AuthSelect
            label="Status"
            name="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RegistrationStatus | "");
              setPage(1);
            }}
            options={STATUS_FILTER}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading registrations…
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {listQuery.error.message}
          </p>
        ) : rows.length === 0 ? (
          <div className="space-y-2 py-12 text-center text-sm text-gray-500">
            <p>No registrations yet.</p>
            <p>
              Convert an{" "}
              <Link
                href="/dashboard/admin/students/inquiries"
                className="font-semibold text-amber-700 hover:underline"
              >
                open inquiry
              </Link>{" "}
              to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Reg #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Inquiry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-[#0F2544]">
                      {row.registrationNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(row.registrationDate)}
                    </td>
                    <td className="px-4 py-3 text-[#0F2544]">
                      <p className="font-medium">{studentLabel(row)}</p>
                      {row.student?.className ? (
                        <p className="text-xs text-gray-500">
                          {row.student.className}
                          {row.student.stream
                            ? ` · ${row.student.stream}`
                            : ""}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.inquiry ? (
                        <span className="font-mono text-xs">
                          {row.inquiry.inquiryNumber}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatWhen(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 ? (
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
        ) : null}
      </div>

      {createOpen ? (
        <CreateRegistrationModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {selectedId ? (
        <RegistrationDetailPanel
          registrationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…`;
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber";
}) {
  const ring =
    tone === "amber"
      ? "border-amber-100 bg-amber-50/40"
      : "border-gray-100 bg-white";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${ring}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0F2544]">
        {value}
      </p>
    </div>
  );
}

function RegistrationDetailPanel({
  registrationId,
  onClose,
}: {
  registrationId: string;
  onClose: () => void;
}) {
  const detail = useRegistrationQuery(registrationId);
  const row = detail.data?.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl sm:max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
              Registration review
            </h3>
            {row ? (
              <p className="font-mono text-xs text-gray-500">
                {row.registrationNumber}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detail.isLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : detail.isError ? (
            <p className="text-sm text-red-600">{detail.error.message}</p>
          ) : row ? (
            <RegistrationReviewForm row={row} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function RegistrationReviewForm({ row }: { row: StudentRegistration }) {
  const update = useUpdateRegistrationMutation(row.id);
  const [status, setStatus] = useState<RegistrationStatus>(row.status);
  const [remarks, setRemarks] = useState(row.remarks ?? "");
  const [registrationDate, setRegistrationDate] = useState(
    row.registrationDate,
  );
  const [admissionOpen, setAdmissionOpen] = useState(false);

  const canAdmit =
    status === "approved" &&
    row.student?.lifecycleStatus === "registered";

  useEffect(() => {
    setStatus(row.status);
    setRemarks(row.remarks ?? "");
    setRegistrationDate(row.registrationDate);
  }, [row]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      status,
      remarks: remarks.trim() || undefined,
      registrationDate,
    });
  }

  async function quickApprove() {
    setStatus("approved");
    await update.mutateAsync({
      status: "approved",
      remarks: remarks.trim() || undefined,
      registrationDate,
    });
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <StatusBadge status={row.status} />
        <span className="text-xs text-gray-400">
          Updated {formatWhen(row.updatedAt)}
        </span>
      </div>

      <dl className="grid gap-2 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Student</dt>
          <dd className="text-right text-[#0F2544]">
            {row.student ? (
              <>
                <p className="font-medium">{studentLabel(row)}</p>
                <p className="text-xs text-gray-500">
                  {row.student.phone ?? row.student.email ?? row.studentId}
                </p>
              </>
            ) : (
              <span className="font-mono text-xs">{row.studentId}</span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Inquiry</dt>
          <dd className="text-right text-[#0F2544]">
            {row.inquiry ? (
              <>
                <p className="font-mono text-xs">{row.inquiry.inquiryNumber}</p>
                <p className="text-xs text-gray-500">
                  {row.inquiry.inquirerName}
                </p>
              </>
            ) : (
              "—"
            )}
          </dd>
        </div>
        {row.student?.lifecycleStatus ? (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Lifecycle</dt>
            <dd className="capitalize text-[#0F2544]">
              {row.student.lifecycleStatus}
            </dd>
          </div>
        ) : null}
      </dl>

      <AuthField
        label="Registration date"
        name="registrationDate"
        type="date"
        required
        value={registrationDate}
        onChange={(e) => setRegistrationDate(e.target.value)}
      />

      <AuthSelect
        label="Status"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as RegistrationStatus)}
        options={STATUS_EDIT}
      />

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]">
        Remarks
        <textarea
          name="remarks"
          rows={4}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Office notes, documents pending, etc."
          className="rounded-xl border border-gray-200 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 font-[family-name:var(--font-body)]"
        />
      </label>

      <p className="text-xs text-gray-400">
        Recorded {formatWhen(row.createdAt)}
      </p>

      {update.isError ? (
        <p className="text-sm text-red-600">{update.error.message}</p>
      ) : null}
      {update.isSuccess ? (
        <p className="text-sm text-emerald-700">Saved.</p>
      ) : null}

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={update.isPending}
          className="w-full rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {update.isPending ? "Saving…" : "Save changes"}
        </button>
        {row.status === "pending" ? (
          <button
            type="button"
            onClick={() => void quickApprove()}
            disabled={update.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
          >
            <CheckCircle className="h-4 w-4" />
            Approve registration
          </button>
        ) : null}
        {canAdmit ? (
          <button
            type="button"
            onClick={() => setAdmissionOpen(true)}
            className="w-full rounded-xl border border-[#0F2544]/20 bg-[#0F2544]/5 py-2.5 text-sm font-semibold text-[#0F2544] hover:bg-[#0F2544]/10"
          >
            Admit student
          </button>
        ) : row.student?.lifecycleStatus === "admitted" ? (
          <Link
            href="/dashboard/admin/students/admissions"
            className="block w-full rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            View admissions
          </Link>
        ) : null}
      </div>

      {admissionOpen ? (
        <AdmissionModal row={row} onClose={() => setAdmissionOpen(false)} />
      ) : null}
    </form>
  );
}

function ModalOverlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function CreateRegistrationModal({ onClose }: { onClose: () => void }) {
  const create = useCreateRegistrationMutation();
  const [studentId, setStudentId] = useState("");
  const [inquiryId, setInquiryId] = useState("");
  const [registrationDate, setRegistrationDate] = useState(todayYmd());
  const [remarks, setRemarks] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        studentId: studentId.trim(),
        inquiryId: inquiryId.trim() || undefined,
        registrationDate,
        remarks: remarks.trim() || undefined,
      });
      onClose();
    } catch {
      /* shown below */
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        Manual registration
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Link an existing student record. Usually registrations come from inquiry
        conversion.
      </p>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <AuthField
          label="Student ID"
          name="studentId"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          hint="From the students table / inquiry record"
        />
        <AuthField
          label="Inquiry ID (optional)"
          name="inquiryId"
          value={inquiryId}
          onChange={(e) => setInquiryId(e.target.value)}
        />
        <AuthField
          label="Registration date"
          name="registrationDate"
          type="date"
          required
          value={registrationDate}
          onChange={(e) => setRegistrationDate(e.target.value)}
        />
        <AuthField
          label="Remarks"
          name="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        {create.isError ? (
          <p className="text-sm text-red-600">{create.error.message}</p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

function AdmissionModal({
  row,
  onClose,
}: {
  row: StudentRegistration;
  onClose: () => void;
}) {
  const admit = useCreateAdmissionMutation();
  const [admissionDate, setAdmissionDate] = useState(todayYmd());
  const [className, setClassName] = useState(row.student?.className ?? "");
  const [section, setSection] = useState("");
  const [stream, setStream] = useState(row.student?.stream ?? "");
  const [academicYear, setAcademicYear] = useState(
    row.student?.academicYear ?? "",
  );
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await admit.mutateAsync({
        studentId: row.studentId,
        registrationId: row.id,
        admissionDate,
        className: className.trim(),
        section: section.trim() || undefined,
        stream: stream.trim() || undefined,
        academicYear: academicYear.trim() || undefined,
      });
      setSuccess(result.admission.admissionNumber);
    } catch {
      /* below */
    }
  }

  if (success) {
    return (
      <ModalOverlay onClose={onClose}>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-emerald-800">
          Student admitted
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Admission number{" "}
          <span className="font-mono font-semibold">{success}</span>
        </p>
        <Link
          href="/dashboard/admin/students/admissions"
          className="mt-4 block w-full rounded-xl bg-[#0F2544] py-2.5 text-center text-sm font-semibold text-white"
          onClick={onClose}
        >
          Go to admissions
        </Link>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        Admit student
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Creates an admission for{" "}
        <strong>{studentLabel(row)}</strong> via{" "}
        <span className="font-mono text-xs">{row.registrationNumber}</span>.
      </p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <AuthField
          label="Admission date"
          name="admissionDate"
          type="date"
          required
          value={admissionDate}
          onChange={(e) => setAdmissionDate(e.target.value)}
          className="sm:col-span-2"
        />
        <AuthField
          label="Class"
          name="className"
          required
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />
        <AuthField
          label="Section"
          name="section"
          value={section}
          onChange={(e) => setSection(e.target.value)}
        />
        <AuthField
          label="Stream"
          name="stream"
          value={stream}
          onChange={(e) => setStream(e.target.value)}
        />
        <AuthField
          label="Academic year"
          name="academicYear"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
        {admit.isError ? (
          <p className="text-sm text-red-600 sm:col-span-2">
            {admit.error.message}
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
            disabled={admit.isPending}
            className="flex-1 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {admit.isPending ? "Submitting…" : "Confirm admission"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}