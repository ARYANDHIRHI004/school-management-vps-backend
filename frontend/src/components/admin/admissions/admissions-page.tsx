"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { GraduationCap, Loader2, Plus, Search, X } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  useCreateAdmissionMutation,
  useUpdateAdmissionMutation,
} from "@/hooks/mutations/use-admission-mutations";
import { useMarkStudentDepartureMutation } from "@/hooks/mutations/use-student-departure-mutation";
import {
  useAdmissionQuery,
  useAdmissionsQuery,
} from "@/hooks/queries/use-admissions-query";
import {
  ClassSectionPicker,
  matchClassSectionIds,
} from "@/components/admin/classes/class-section-picker";
import { useRegistrationsQuery } from "@/hooks/queries/use-registrations-query";
import { useAcademicOptionsQuery } from "@/hooks/queries/use-student-records-query";
import type {
  AdmissionStatus,
  StudentAdmission,
} from "@/types/admission";
import type { StudentRegistration } from "@/types/registration";

const STATUS_FILTER: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_EDIT: { value: AdmissionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const LIFECYCLE_FILTER: { value: string; label: string }[] = [
  { value: "", label: "All students" },
  { value: "admitted", label: "Currently enrolled" },
  { value: "left", label: "Left school" },
  { value: "transferred", label: "Transferred out" },
];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
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

function formatDate(ymd: string) {
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return ymd;
  }
}

function studentLabel(row: StudentAdmission) {
  if (row.student) {
    return `${row.student.firstName} ${row.student.lastName}`.trim();
  }
  return row.studentId.slice(0, 10) + "…";
}

function LifecycleBadge({ lifecycle }: { lifecycle: string | null | undefined }) {
  if (!lifecycle || lifecycle === "admitted") {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
        {lifecycle === "admitted" ? "Enrolled" : lifecycle ?? "—"}
      </span>
    );
  }
  const styles =
    lifecycle === "left"
      ? "bg-amber-100 text-amber-900"
      : lifecycle === "transferred"
        ? "bg-sky-100 text-sky-900"
        : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {lifecycle}
    </span>
  );
}

function StatusBadge({ status }: { status: AdmissionStatus }) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-800"
      : status === "completed"
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export function AdmissionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AdmissionStatus | "">("");
  const [lifecycle, setLifecycle] = useState("");
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
      lifecycle:
        (lifecycle as
          | "admitted"
          | "left"
          | "transferred"
          | undefined) || undefined,
    }),
    [page, status, search, lifecycle],
  );

  const listQuery = useAdmissionsQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Official admissions for students with approved registration. Optional
          portal login can be issued at create time.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3660]"
          >
            <Plus className="h-4 w-4" />
            New admission
          </button>
          <Link
            href="/dashboard/admin/students/registrations"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F2544] shadow-sm hover:border-amber-300"
          >
            <GraduationCap className="h-4 w-4" />
            Registrations
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="relative flex-1">
          <AuthField
            label="Search"
            name="search"
            placeholder="Adm #, student name, class…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
        </label>
        <div className="w-full sm:max-w-[220px]">
          <AuthSelect
            label="Admission status"
            name="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AdmissionStatus | "");
              setPage(1);
            }}
            options={STATUS_FILTER}
          />
        </div>
        <div className="w-full sm:max-w-[220px]">
          <AuthSelect
            label="Student"
            name="lifecycle"
            value={lifecycle}
            onChange={(e) => {
              setLifecycle(e.target.value);
              setPage(1);
            }}
            options={LIFECYCLE_FILTER}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading admissions…
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {listQuery.error.message}
          </p>
        ) : rows.length === 0 ? (
          <div className="space-y-2 py-12 text-center text-sm text-gray-500">
            <p>No admissions yet.</p>
            <p>
              Approve a{" "}
              <Link
                href="/dashboard/admin/students/registrations"
                className="font-semibold text-amber-700 hover:underline"
              >
                registration
              </Link>{" "}
              then admit the student here.
            </p>
          </div>
        ) : (
          <AdmissionsTable
            rows={rows}
            onSelect={setSelectedId}
            formatDate={formatDate}
            formatWhen={formatWhen}
          />
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
        <CreateAdmissionModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {selectedId ? (
        <AdmissionDetailPanel
          admissionId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function AdmissionsTable({
  rows,
  onSelect,
  formatDate,
  formatWhen,
}: {
  rows: StudentAdmission[];
  onSelect: (id: string) => void;
  formatDate: (d: string) => string;
  formatWhen: (d: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Adm #</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Adm. status</th>
            <th className="px-4 py-3">Enrollment</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3 font-mono text-xs text-[#0F2544]">
                {row.admissionNumber}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-[#0F2544]">{studentLabel(row)}</p>
                {row.registration ? (
                  <p className="font-mono text-xs text-gray-400">
                    {row.registration.registrationNumber}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {row.className}
                {row.section ? `-${row.section}` : ""}
                {row.stream ? ` · ${row.stream}` : ""}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(row.admissionDate)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3">
                <LifecycleBadge lifecycle={row.student?.lifecycleStatus} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatWhen(row.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onSelect(row.id)}
                  className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                >
                  Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

function CreateAdmissionModal({ onClose }: { onClose: () => void }) {
  const create = useCreateAdmissionMutation();
  const eligibleQuery = useRegistrationsQuery({
    page: 1,
    limit: 100,
    status: "approved",
  });

  const eligible = useMemo(() => {
    const list = eligibleQuery.data?.data ?? [];
    return list.filter(
      (r) => r.student?.lifecycleStatus === "registered",
    ) as StudentRegistration[];
  }, [eligibleQuery.data?.data]);

  const [registrationId, setRegistrationId] = useState("");
  const selected = eligible.find((r) => r.id === registrationId);

  const [admissionDate, setAdmissionDate] = useState(todayYmd());
  const [admissionNumber, setAdmissionNumber] = useState("");
  const academic = useAcademicOptionsQuery();
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [stream, setStream] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [portalEnabled, setPortalEnabled] = useState(false);
  const [portalEmail, setPortalEmail] = useState("");
  const [portalPassword, setPortalPassword] = useState("");
  const [createdNumber, setCreatedNumber] = useState<string | null>(null);
  const [portalEmailCreated, setPortalEmailCreated] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!selected) return;
    const matched = matchClassSectionIds(
      academic.data,
      selected.student?.className,
      selected.student?.section,
    );
    setClassId(matched?.classId ?? "");
    setSectionId(matched?.sectionId ?? "");
    setStream(selected.student?.stream ?? "");
    setAcademicYear(selected.student?.academicYear ?? "");
    setPortalEmail(selected.student?.email ?? "");
  }, [selected, academic.data]);

  const regOptions = [
    { value: "", label: "Select approved registration…" },
    ...eligible.map((r) => ({
      value: r.id,
      label: `${r.registrationNumber} — ${r.student ? `${r.student.firstName} ${r.student.lastName}` : r.studentId}`,
    })),
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      const result = await create.mutateAsync({
        studentId: selected.studentId,
        registrationId: selected.id,
        admissionDate,
        admissionNumber: admissionNumber.trim(),
        classId,
        sectionId,
        stream: stream.trim() || undefined,
        academicYear: academicYear.trim() || undefined,
        portalAccess:
          portalEnabled && portalEmail && portalPassword
            ? { email: portalEmail.trim(), password: portalPassword }
            : undefined,
      });
      setCreatedNumber(result.admission.admissionNumber);
      setPortalEmailCreated(result.portal?.email ?? null);
    } catch {
      /* error below */
    }
  }

  if (createdNumber) {
    return (
      <ModalOverlay onClose={onClose}>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-emerald-800">
          Admission created
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Number{" "}
          <span className="font-mono font-semibold">{createdNumber}</span>
        </p>
        {portalEmailCreated ? (
          <p className="mt-1 text-sm text-gray-600">
            Portal login: <strong>{portalEmailCreated}</strong>
          </p>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white"
        >
          Done
        </button>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClose={onClose} wide>
      <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        New admission
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Student must have an <strong>approved</strong> registration and not yet
        be admitted. Choose a class and section you created under{" "}
        <Link
          href="/dashboard/admin/students/classes"
          className="font-semibold text-amber-800 hover:underline"
          onClick={onClose}
        >
          Classes
        </Link>
        .
      </p>

      {eligibleQuery.isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading eligible registrations…
        </p>
      ) : eligible.length === 0 ? (
        <p className="mt-4 text-sm text-amber-800">
          No eligible registrations.{" "}
          <Link
            href="/dashboard/admin/students/registrations"
            className="font-semibold underline"
            onClick={onClose}
          >
            Approve one first
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <RegistrationSelectField
            registrationId={registrationId}
            setRegistrationId={setRegistrationId}
            options={regOptions}
          />
          <AuthField
            label="Admission date"
            name="admissionDate"
            type="date"
            required
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
          />
          <AuthField
            label="Admission number"
            name="admissionNumber"
            required
            value={admissionNumber}
            onChange={(e) => setAdmissionNumber(e.target.value)}
            placeholder="e.g. 2025/1042"
            className="sm:col-span-2"
          />
          <ClassSectionPicker
            classId={classId}
            sectionId={sectionId}
            onClassChange={setClassId}
            onSectionChange={setSectionId}
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

          <label className="flex items-center gap-2 text-sm font-semibold text-[#0F2544] sm:col-span-2">
            <input
              type="checkbox"
              checked={portalEnabled}
              onChange={(e) => setPortalEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            Create student portal login
          </label>

          {portalEnabled ? (
            <>
              <AuthField
                label="Portal email"
                name="portalEmail"
                type="email"
                required
                value={portalEmail}
                onChange={(e) => setPortalEmail(e.target.value)}
              />
              <AuthField
                label="Portal password"
                name="portalPassword"
                type="password"
                required
                minLength={8}
                value={portalPassword}
                onChange={(e) => setPortalPassword(e.target.value)}
              />
            </>
          ) : null}

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
              disabled={
                create.isPending || !selected || !classId || !sectionId
              }
              className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? "Creating…" : "Create admission"}
            </button>
          </div>
        </form>
      )}
    </ModalOverlay>
  );
}

function RegistrationSelectField({
  registrationId,
  setRegistrationId,
  options,
}: {
  registrationId: string;
  setRegistrationId: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="sm:col-span-2">
      <AuthSelect
        label="Registration"
        name="registrationId"
        required
        value={registrationId}
        onChange={(e) => setRegistrationId(e.target.value)}
        options={options}
      />
    </div>
  );
}

function AdmissionDetailPanel({
  admissionId,
  onClose,
}: {
  admissionId: string;
  onClose: () => void;
}) {
  const detail = useAdmissionQuery(admissionId);
  const row = detail.data?.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl sm:max-w-lg">
        <AdmissionPanelHeader row={row} onClose={onClose} />
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detail.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : detail.isError ? (
            <p className="text-sm text-red-600">{detail.error.message}</p>
          ) : row ? (
            <AdmissionEditForm row={row} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function AdmissionPanelHeader({
  row,
  onClose,
}: {
  row: StudentAdmission | undefined;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
          Admission
        </h3>
        {row ? (
          <p className="font-mono text-xs text-gray-500">
            {row.admissionNumber}
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
  );
}

function MarkStudentDepartureBlock({ row }: { row: StudentAdmission }) {
  const mark = useMarkStudentDepartureMutation();
  const lifecycle = row.student?.lifecycleStatus;
  const canDepart = lifecycle === "admitted" && row.status === "active";
  const [departureType, setDepartureType] = useState<"left" | "transferred">(
    "left",
  );
  const [departedAt, setDepartedAt] = useState(todayYmd());
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  if (lifecycle === "left" || lifecycle === "transferred") {
    return (
      <DepartureInfoBlock row={row} lifecycle={lifecycle} />
    );
  }

  if (!canDepart) return null;

  async function onDepart(e: React.FormEvent) {
    e.preventDefault();
    try {
      await mark.mutateAsync({
        studentId: row.studentId,
        departureType,
        departedAt,
        reason: reason.trim() || undefined,
      });
      setDone(true);
    } catch {
      /* below */
    }
  }

  if (done) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Student marked as <strong>{departureType}</strong>. Records are kept;
        they no longer appear as enrolled.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <h4 className="text-sm font-bold text-[#0F2544] font-[family-name:var(--font-heading)]">
        Leaving school
      </h4>
      <p className="mt-1 text-xs text-gray-600">
        Keeps the full student record and marks them as no longer enrolled. You
        can still upload TC/LC under Certificates later.
      </p>
      <form onSubmit={onDepart} className="mt-3 space-y-3">
        <AuthSelect
          label="Departure type"
          name="departureType"
          value={departureType}
          onChange={(e) =>
            setDepartureType(e.target.value as "left" | "transferred")
          }
          options={[
            { value: "left", label: "Left school" },
            { value: "transferred", label: "Transferred to another school" },
          ]}
        />
        <AuthField
          label="Departure date"
          name="departedAt"
          type="date"
          required
          value={departedAt}
          onChange={(e) => setDepartedAt(e.target.value)}
        />
        <AuthField
          label="Reason (optional)"
          name="departureReason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {mark.isError ? (
          <p className="text-sm text-red-600">{mark.error.message}</p>
        ) : null}
        <button
          type="submit"
          disabled={mark.isPending}
          className="w-full rounded-xl border border-amber-400 bg-white py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
        >
          {mark.isPending ? "Saving…" : "Mark student as departed"}
        </button>
      </form>
    </div>
  );
}

function DepartureInfoBlock({
  row,
  lifecycle,
}: {
  row: StudentAdmission;
  lifecycle: string;
}) {
  const departedAt = row.student?.departedAt;
  const departureReason = row.student?.departureReason;
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
      <p className="font-semibold capitalize text-[#0F2544]">
        Student: {lifecycle.replace("_", " ")}
      </p>
      {departedAt ? (
        <p className="mt-1 text-gray-600">
          Departure date: {formatDate(departedAt)}
        </p>
      ) : null}
      {departureReason ? (
        <p className="mt-1 text-gray-600">Reason: {departureReason}</p>
      ) : null}
      <p className="mt-2 text-xs text-gray-500">
        All inquiry, registration, and admission data is retained.
      </p>
    </div>
  );
}

function AdmissionEditForm({ row }: { row: StudentAdmission }) {
  const update = useUpdateAdmissionMutation(row.id);
  const academic = useAcademicOptionsQuery();
  const [status, setStatus] = useState<AdmissionStatus>(row.status);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [stream, setStream] = useState(row.stream ?? "");
  const [academicYear, setAcademicYear] = useState(row.academicYear ?? "");

  useEffect(() => {
    setStatus(row.status);
    const matched = matchClassSectionIds(
      academic.data,
      row.className,
      row.section,
    );
    setClassId(matched?.classId ?? "");
    setSectionId(matched?.sectionId ?? "");
    setStream(row.stream ?? "");
    setAcademicYear(row.academicYear ?? "");
  }, [row, academic.data]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      status,
      ...(classId && sectionId ? { classId, sectionId } : {}),
      stream: stream.trim() || undefined,
      academicYear: academicYear.trim() || undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <StatusBadge status={row.status} />
        <span className="text-xs text-gray-400">
          Admitted {formatDate(row.admissionDate)}
        </span>
      </div>

      <dl className="grid gap-2 rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Student</dt>
          <dd className="text-right font-medium text-[#0F2544]">
            {studentLabel(row)}
          </dd>
        </div>
        <div className="pt-1">
          <Link
            href={`/dashboard/admin/students/classes?studentId=${row.studentId}`}
            className="text-xs font-semibold text-amber-800 hover:underline"
          >
            Open student profile →
          </Link>
        </div>
        {row.registration ? (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Registration</dt>
            <dd className="font-mono text-xs">{row.registration.registrationNumber}</dd>
          </div>
        ) : null}
      </dl>

      <MarkStudentDepartureBlock row={row} />

      <AuthSelect
        label="Status"
        name="status"
        value={status}
        onChange={(e) => setStatus(e.target.value as AdmissionStatus)}
        options={STATUS_EDIT}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <ClassSectionPicker
          classId={classId}
          sectionId={sectionId}
          onClassChange={setClassId}
          onSectionChange={setSectionId}
        />
      </div>
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

      {update.isError ? (
        <p className="text-sm text-red-600">{update.error.message}</p>
      ) : null}
      {update.isSuccess ? (
        <p className="text-sm text-emerald-700">Saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={update.isPending}
        className="w-full rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {update.isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}