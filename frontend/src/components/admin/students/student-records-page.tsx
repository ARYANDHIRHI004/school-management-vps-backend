"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { StudentProfileEditor } from "@/components/admin/students/student-profile-editor";
import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  useStudentClassSectionOptionsQuery,
  useStudentRecordsQuery,
} from "@/hooks/queries/use-student-records-query";
import type { StudentRecord } from "@/types/student";

const LIFECYCLE = [
  { value: "", label: "All pipeline stages" },
  { value: "inquiry", label: "Inquiry" },
  { value: "registered", label: "Registered" },
  { value: "admitted", label: "Admitted" },
  { value: "left", label: "Left" },
  { value: "transferred", label: "Transferred" },
];

const ENROLLMENT = [
  { value: "", label: "All enrollment" },
  { value: "not_enrolled", label: "Not enrolled" },
  { value: "enrolled", label: "Enrolled" },
  { value: "left", label: "Left" },
  { value: "transferred", label: "Transferred" },
  { value: "graduated", label: "Graduated" },
];

const RECORD = [
  { value: "", label: "All record status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "withdrawn", label: "Withdrawn" },
];

function studentName(row: StudentRecord) {
  return [row.firstName, row.middleName, row.lastName]
    .filter(Boolean)
    .join(" ");
}

export function StudentRecordsPage({
  initialOpenId,
}: {
  initialOpenId?: string | null;
}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState("");
  const [recordStatus, setRecordStatus] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const optionsQuery = useStudentClassSectionOptionsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialOpenId ?? null,
  );

  useEffect(() => {
    if (initialOpenId) setSelectedId(initialOpenId);
  }, [initialOpenId]);

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
      limit: 20,
      search: search || undefined,
      className: className || undefined,
      section: section || undefined,
      lifecycle: (lifecycle || undefined) as
        | "inquiry"
        | "registered"
        | "admitted"
        | "transferred"
        | "left"
        | undefined,
      enrollmentStatus: (enrollmentStatus || undefined) as
        | "not_enrolled"
        | "enrolled"
        | "transferred"
        | "graduated"
        | "left"
        | undefined,
      recordStatus: (recordStatus || undefined) as
        | "active"
        | "inactive"
        | "graduated"
        | "withdrawn"
        | undefined,
    }),
    [page, search, className, section, lifecycle, enrollmentStatus, recordStatus],
  );

  const classOptions = useMemo(
    () => [
      { value: "", label: "All classes" },
      ...(optionsQuery.data?.classes ?? []).map((c) => ({ value: c, label: c })),
    ],
    [optionsQuery.data?.classes],
  );

  const sectionOptions = useMemo(
    () => [
      { value: "", label: "All sections" },
      ...(optionsQuery.data?.sections ?? []).map((s) => ({
        value: s,
        label: s,
      })),
    ],
    [optionsQuery.data?.sections],
  );

  const list = useStudentRecordsQuery(filters);
  const rows = list.data?.data ?? [];
  const meta = list.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <p className="text-sm text-gray-500">
        Search and edit full student profiles — identification, contact,
        academic details, and parents. Filter by class and section to list
        students in a cohort.
      </p>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="relative min-w-[200px] flex-1">
          <AuthField
            label="Search"
            name="search"
            placeholder="Name, admission #, roll, phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
        </label>
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <AuthSelect
            label="Class"
            name="className"
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setPage(1);
            }}
            options={classOptions}
          />
          <AuthSelect
            label="Section"
            name="section"
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setPage(1);
            }}
            options={sectionOptions}
          />
          <AuthSelect
            label="Pipeline"
            name="lifecycle"
            value={lifecycle}
            onChange={(e) => {
              setLifecycle(e.target.value);
              setPage(1);
            }}
            options={LIFECYCLE}
          />
          <AuthSelect
            label="Enrollment"
            name="enrollment"
            value={enrollmentStatus}
            onChange={(e) => {
              setEnrollmentStatus(e.target.value);
              setPage(1);
            }}
            options={ENROLLMENT}
          />
          <AuthSelect
            label="Record"
            name="record"
            value={recordStatus}
            onChange={(e) => {
              setRecordStatus(e.target.value);
              setPage(1);
            }}
            options={RECORD}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {list.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading students…
          </div>
        ) : list.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {list.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No students match your filters.
          </p>
        ) : (
          <StudentRecordsTable rows={rows} onOpen={setSelectedId} />
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

      {selectedId ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => setSelectedId(null)}
          />
          <StudentProfileEditor
            studentId={selectedId}
            onClose={() => setSelectedId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

function StudentRecordsTable({
  rows,
  onOpen,
}: {
  rows: StudentRecord[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Adm #</th>
            <th className="px-4 py-3">Class</th>
            <th className="px-4 py-3">Enrollment</th>
            <th className="px-4 py-3">Record</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3">
                <p className="font-medium text-[#0F2544]">{studentName(row)}</p>
                <p className="text-xs capitalize text-gray-500">
                  {row.lifecycleStatus}
                </p>
              </td>
              <td className="px-4 py-3 font-mono text-xs">
                {row.admissionNumber ?? "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {row.className ?? "—"}
                {row.section ? ` · ${row.section}` : ""}
              </td>
              <td className="px-4 py-3 capitalize text-gray-600">
                {row.enrollmentStatus.replace(/_/g, " ")}
              </td>
              <td className="px-4 py-3 capitalize text-gray-600">
                {row.recordStatus}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onOpen(row.id)}
                  className="text-sm font-semibold text-amber-700 hover:text-amber-800"
                >
                  Open profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}