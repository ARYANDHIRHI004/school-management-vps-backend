"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, Loader2, Plus, Upload, X } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import { apiDownload } from "@/lib/api";
import {
  useUploadLeavingCertificateMutation,
  useUploadTransferCertificateMutation,
} from "@/hooks/mutations/use-certificate-mutations";
import { useAdmissionsQuery } from "@/hooks/queries/use-admissions-query";
import {
  useLeavingCertificatesQuery,
  useTransferCertificatesQuery,
} from "@/hooks/queries/use-certificates-query";
import type {
  CertificateStudentSummary,
  LeavingCertificateRow,
  TransferCertificateRow,
} from "@/types/certificate";

type CertTab = "tc" | "lc";

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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function studentLabel(student?: CertificateStudentSummary, studentId?: string) {
  if (student) {
    return `${student.firstName} ${student.lastName}`.trim();
  }
  return studentId ? `${studentId.slice(0, 10)}…` : "—";
}

export function CertificatesPage() {
  const [tab, setTab] = useState<CertTab>("tc");
  const [page, setPage] = useState(1);
  const [studentIdFilter, setStudentIdFilter] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      limit: 15,
      studentId: studentIdFilter.trim() || undefined,
    }),
    [page, studentIdFilter],
  );

  const tcQuery = useTransferCertificatesQuery(filters);
  const lcQuery = useLeavingCertificatesQuery(filters);
  const activeQuery = tab === "tc" ? tcQuery : lcQuery;
  const rows = activeQuery.data?.data ?? [];
  const meta = activeQuery.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <CertificatePageIntro tab={tab} onUpload={() => setUploadOpen(true)} />

      <div className="flex gap-2 border-b border-gray-200 pb-1">
        <TabButton active={tab === "tc"} onClick={() => { setTab("tc"); setPage(1); }}>
          Transfer (TC)
        </TabButton>
        <TabButton active={tab === "lc"} onClick={() => { setTab("lc"); setPage(1); }}>
          Leaving (LC)
        </TabButton>
      </div>

      <AuthField
        label="Filter by student ID"
        name="studentIdFilter"
        value={studentIdFilter}
        onChange={(e) => {
          setStudentIdFilter(e.target.value);
          setPage(1);
        }}
        placeholder="Optional — full student record id"
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CertificateListSection
          tab={tab}
          query={activeQuery}
          rows={rows}
          onDownload={async (row) => {
            const path =
              tab === "tc"
                ? `/api/students/transfer-certificates/${row.id}/download`
                : `/api/students/leaving-certificates/${row.id}/download`;
            await apiDownload(path, row.fileName);
          }}
        />
      </div>

      {meta && meta.total > 0 ? (
        <Pagination meta={meta} totalPages={totalPages} page={page} setPage={setPage} />
      ) : null}

      {uploadOpen ? (
        <UploadCertificateModal
          kind={tab}
          onClose={() => setUploadOpen(false)}
        />
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-b-2 border-[#0F2544] text-[#0F2544]"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function CertificatePageIntro({
  tab,
  onUpload,
}: {
  tab: CertTab;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500">
        Upload and download {tab === "tc" ? "transfer" : "leaving"} certificates
        (PDF or image, max 10 MB). Student lifecycle updates on upload.
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1a3660]"
      >
        <Plus className="h-4 w-4" />
        Upload {tab === "tc" ? "TC" : "LC"}
      </button>
    </div>
  );
}

function CertificateListSection({
  tab,
  query,
  rows,
  onDownload,
}: {
  tab: CertTab;
  query: { isLoading: boolean; isError: boolean; error: Error | null };
  rows: TransferCertificateRow[] | LeavingCertificateRow[];
  onDownload: (row: TransferCertificateRow | LeavingCertificateRow) => Promise<void>;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    );
  }
  if (query.isError) {
    return (
      <p className="py-12 text-center text-sm text-red-600">
        {query.error?.message}
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-500">
        No {tab === "tc" ? "transfer" : "leaving"} certificates yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Cert #</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Issue date</th>
            {tab === "lc" ? <th className="px-4 py-3">Last class</th> : null}
            <th className="px-4 py-3">File</th>
            <th className="px-4 py-3">Recorded</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50/80">
              <td className="px-4 py-3 font-mono text-xs text-[#0F2544]">
                {row.certificateNumber}
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-[#0F2544]">
                  {studentLabel(row.student, row.studentId)}
                </p>
                {row.student?.admissionNumber ? (
                  <p className="text-xs text-gray-500">
                    {row.student.admissionNumber}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(row.issueDate)}
              </td>
              {tab === "lc" ? (
                <td className="px-4 py-3 text-gray-600">
                  {(row as LeavingCertificateRow).lastClassAttended ?? "—"}
                </td>
              ) : null}
              <td className="px-4 py-3 text-gray-600">
                <span className="block truncate max-w-[10rem]">{row.fileName}</span>
                <span className="text-xs text-gray-400">
                  {formatBytes(row.fileSize)}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {formatWhen(row.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={downloadingId === row.id}
                  onClick={() => {
                    setDownloadingId(row.id);
                    void onDownload(row).finally(() => setDownloadingId(null));
                  }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50"
                >
                  {downloadingId === row.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
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
    <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
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
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <ModalCloseButton onClose={onClose} />
        {children}
      </div>
    </div>
  );
}

function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute right-4 top-4 rounded-lg p-1 text-gray-500 hover:bg-gray-100"
      aria-label="Close"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

function UploadCertificateModal({
  kind,
  onClose,
}: {
  kind: CertTab;
  onClose: () => void;
}) {
  const uploadTc = useUploadTransferCertificateMutation();
  const uploadLc = useUploadLeavingCertificateMutation();
  const pending = uploadTc.isPending || uploadLc.isPending;
  const error = uploadTc.error ?? uploadLc.error;

  const admissionsQuery = useAdmissionsQuery({ page: 1, limit: 100 });
  const students = admissionsQuery.data?.data ?? [];

  const [studentId, setStudentId] = useState("");
  const [issueDate, setIssueDate] = useState(todayYmd());
  const [reason, setReason] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [lastClassAttended, setLastClassAttended] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const studentOptions = useMemo(
    () => [
      { value: "", label: "Select student…" },
      ...students.map((a) => ({
        value: a.studentId,
        label: a.student
          ? `${a.student.firstName} ${a.student.lastName} — ${a.className}`
          : a.admissionNumber,
      })),
    ],
    [students],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("studentId", studentId.trim());
    form.append("issueDate", issueDate);
    if (reason.trim()) form.append("reason", reason.trim());
    if (certificateNumber.trim()) {
      form.append("certificateNumber", certificateNumber.trim());
    }
    if (kind === "lc" && lastClassAttended.trim()) {
      form.append("lastClassAttended", lastClassAttended.trim());
    }
    try {
      if (kind === "tc") {
        await uploadTc.mutateAsync(form);
      } else {
        await uploadLc.mutateAsync(form);
      }
      onClose();
    } catch {
      /* below */
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="pr-8 font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
        Upload {kind === "tc" ? "transfer certificate (TC)" : "leaving certificate (LC)"}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        PDF, JPEG, PNG, or WebP up to 10 MB.
      </p>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <AuthSelect
          label="Student"
          name="studentIdSelect"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          options={studentOptions}
        />
        <AuthField
          label="Student ID"
          name="studentId"
          required
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <AuthField
          label="Issue date"
          name="issueDate"
          type="date"
          required
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
        />
        {kind === "lc" ? (
          <AuthField
            label="Last class attended"
            name="lastClassAttended"
            value={lastClassAttended}
            onChange={(e) => setLastClassAttended(e.target.value)}
          />
        ) : null}
        <AuthField
          label="Certificate number (optional)"
          name="certificateNumber"
          value={certificateNumber}
          onChange={(e) => setCertificateNumber(e.target.value)}
        />
        <AuthField
          label="Reason (optional)"
          name="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <label className="flex flex-col gap-2 text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]">
          Certificate file
          <span className="relative flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-normal text-gray-600 hover:border-amber-400">
            <Upload className="h-5 w-5 text-gray-400" />
            {file ? file.name : "Choose PDF or image…"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </span>
        </label>

        {error ? (
          <p className="text-sm text-red-600">{error.message}</p>
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
            disabled={pending || !file || !studentId.trim()}
            className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}