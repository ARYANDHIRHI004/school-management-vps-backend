"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Plus, Upload } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  ModalOverlay,
  PaginationBar,
  formatDate,
  formatWhen,
  todayYmd,
  useStaffOptions,
} from "@/components/admin/staff/staff-shared";
import { useUploadPaySlipMutation } from "@/hooks/mutations/use-staff-mutations";
import { usePaySlipsQuery } from "@/hooks/queries/use-staff-query";
import { apiDownload } from "@/lib/api";
import { formatInrFromPaise, rupeesToPaise } from "@/lib/format-money";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StaffPaySlipsPage() {
  const [page, setPage] = useState(1);
  const [staffId, setStaffId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      page,
      limit: 15,
      staffId: staffId || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, staffId, fromDate, toDate],
  );

  const listQuery = usePaySlipsQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Upload and download staff pay slips (PDF or image, max 10 MB).
        </p>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Upload pay slip
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AuthField label="Staff ID filter" name="staffId" value={staffId} onChange={(e) => { setStaffId(e.target.value); setPage(1); }} />
        <AuthField label="Issue from" name="fromDate" type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
        <AuthField label="Issue to" name="toDate" type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">{listQuery.error.message}</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No pay slips uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Slip #</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Net pay</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs">{row.slipNumber}</td>
                    <td className="px-4 py-3">
                      {row.staff ? (
                        <>
                          <p className="font-medium text-[#0F2544]">
                            {row.staff.firstName} {row.staff.lastName}
                          </p>
                          <p className="font-mono text-xs text-gray-400">{row.staff.staffCode}</p>
                        </>
                      ) : (
                        row.staffId.slice(0, 10) + "…"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(row.payPeriodStart)} – {formatDate(row.payPeriodEnd)}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0F2544]">
                      {formatInrFromPaise(row.netAmountPaise)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="block truncate max-w-[8rem]">{row.fileName}</span>
                      <span className="text-xs text-gray-400">{formatBytes(row.fileSize)}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={downloadingId === row.id}
                        onClick={() => {
                          setDownloadingId(row.id);
                          void apiDownload(
                            `/api/staff/pay-slips/${row.id}/download`,
                            row.fileName,
                          ).finally(() => setDownloadingId(null));
                        }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 disabled:opacity-50"
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
        )}
        {meta && meta.total > 0 ? (
          <PaginationBar meta={meta} totalPages={totalPages} page={page} setPage={setPage} />
        ) : null}
      </div>

      {uploadOpen ? (
        <UploadPaySlipModal onClose={() => setUploadOpen(false)} />
      ) : null}
    </div>
  );
}

function UploadPaySlipModal({ onClose }: { onClose: () => void }) {
  const upload = useUploadPaySlipMutation();
  const { options } = useStaffOptions();
  const [staffId, setStaffId] = useState("");
  const [payPeriodStart, setPayPeriodStart] = useState(todayYmd());
  const [payPeriodEnd, setPayPeriodEnd] = useState(todayYmd());
  const [issueDate, setIssueDate] = useState(todayYmd());
  const [gross, setGross] = useState("");
  const [net, setNet] = useState("");
  const [deductions, setDeductions] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !staffId.trim()) return;
    const form = new FormData();
    form.append("file", file);
    form.append("staffId", staffId.trim());
    form.append("payPeriodStart", payPeriodStart);
    form.append("payPeriodEnd", payPeriodEnd);
    form.append("issueDate", issueDate);
    const grossPaise = rupeesToPaise(gross);
    const netPaise = rupeesToPaise(net);
    const dedPaise = rupeesToPaise(deductions);
    if (grossPaise != null) form.append("grossAmountPaise", String(grossPaise));
    if (netPaise != null) form.append("netAmountPaise", String(netPaise));
    if (dedPaise != null) form.append("deductionsPaise", String(dedPaise));
    if (notes.trim()) form.append("notes", notes.trim());
    try {
      await upload.mutateAsync(form);
      onClose();
    } catch {
      /* below */
    }
  }

  return (
    <ModalOverlay onClose={onClose} wide>
      <h3 className="pr-8 text-lg font-bold text-[#0F2544]">Upload pay slip</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <AuthSelect label="Staff" name="staffSelect" value={staffId} onChange={(e) => setStaffId(e.target.value)} options={options} />
        </div>
        <div className="sm:col-span-2">
          <AuthField label="Staff ID" name="staffId" required value={staffId} onChange={(e) => setStaffId(e.target.value)} />
        </div>
        <AuthField label="Period start" name="payPeriodStart" type="date" required value={payPeriodStart} onChange={(e) => setPayPeriodStart(e.target.value)} />
        <AuthField label="Period end" name="payPeriodEnd" type="date" required value={payPeriodEnd} onChange={(e) => setPayPeriodEnd(e.target.value)} />
        <div className="sm:col-span-2">
          <AuthField label="Issue date" name="issueDate" type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
        </div>
        <AuthField label="Gross (₹)" name="gross" value={gross} onChange={(e) => setGross(e.target.value)} />
        <AuthField label="Net (₹)" name="net" value={net} onChange={(e) => setNet(e.target.value)} />
        <div className="sm:col-span-2">
          <AuthField label="Deductions (₹)" name="deductions" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <AuthField label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#0F2544] sm:col-span-2">
          File
          <span className="relative flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm font-normal">
            <Upload className="h-5 w-5 text-gray-400" />
            {file ? file.name : "PDF or image…"}
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="absolute inset-0 opacity-0"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </span>
        </label>
        {upload.isError ? (
          <p className="text-sm text-red-600 sm:col-span-2">{upload.error.message}</p>
        ) : null}
        <div className="flex gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={upload.isPending || !file} className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {upload.isPending ? "Uploading…" : "Upload"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}