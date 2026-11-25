"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  ModalOverlay,
  PaginationBar,
  formatDate,
  todayYmd,
  useStaffOptions,
} from "@/components/admin/staff/staff-shared";
import { useCreateLedgerEntryMutation } from "@/hooks/mutations/use-staff-mutations";
import { useLedgerEntriesQuery } from "@/hooks/queries/use-staff-query";
import { formatInrFromPaise, rupeesToPaise } from "@/lib/format-money";
import type { LedgerCategory, LedgerEntryType } from "@/types/staff";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All categories" },
  { value: "opening_balance", label: "Opening balance" },
  { value: "salary_payment", label: "Salary payment" },
  { value: "advance", label: "Advance" },
  { value: "deduction", label: "Deduction" },
  { value: "bonus", label: "Bonus" },
  { value: "reimbursement", label: "Reimbursement" },
  { value: "adjustment", label: "Adjustment" },
];

const CATEGORY_CREATE: { value: LedgerCategory; label: string }[] = CATEGORY_OPTIONS.filter(
  (o) => o.value,
) as { value: LedgerCategory; label: string }[];

const ENTRY_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

const ENTRY_TYPE_CREATE: { value: LedgerEntryType; label: string }[] = [
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
];

export function StaffLedgerPage() {
  const [page, setPage] = useState(1);
  const [staffId, setStaffId] = useState("");
  const [category, setCategory] = useState<LedgerCategory | "">("");
  const [entryType, setEntryType] = useState<LedgerEntryType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      limit: 15,
      staffId: staffId || undefined,
      category: category || undefined,
      entryType: entryType || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }),
    [page, staffId, category, entryType, fromDate, toDate],
  );

  const listQuery = useLedgerEntriesQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const summary = listQuery.data?.summary;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Staff ledger entries. Filter by staff to see credit/debit balance summary.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Add entry
        </button>
      </div>

      {summary ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="Total credit" value={formatInrFromPaise(summary.totalCreditPaise)} />
          <StatTile label="Total debit" value={formatInrFromPaise(summary.totalDebitPaise)} />
          <StatTile label="Balance" value={formatInrFromPaise(summary.balancePaise)} highlight />
        </div>
      ) : null}

      <div className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
        <AuthField label="Staff ID" name="staffId" value={staffId} onChange={(e) => { setStaffId(e.target.value); setPage(1); }} placeholder="Filter by staff record id" />
        <AuthSelect label="Category" name="category" value={category} onChange={(e) => { setCategory(e.target.value as LedgerCategory | ""); setPage(1); }} options={CATEGORY_OPTIONS} />
        <AuthSelect label="Entry type" name="entryType" value={entryType} onChange={(e) => { setEntryType(e.target.value as LedgerEntryType | ""); setPage(1); }} options={ENTRY_TYPE_OPTIONS} />
        <AuthField label="From date" name="fromDate" type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
        <AuthField label="To date" name="toDate" type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">{listQuery.error.message}</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No ledger entries found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Staff</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 text-gray-600">{formatDate(row.entryDate)}</td>
                    <td className="px-4 py-3">
                      {row.staff ? (
                        <>
                          <p className="font-medium text-[#0F2544]">
                            {row.staff.firstName} {row.staff.lastName}
                          </p>
                          <p className="font-mono text-xs text-gray-400">{row.staff.staffCode}</p>
                        </>
                      ) : (
                        <span className="font-mono text-xs">{row.staffId.slice(0, 10)}…</span>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize">{row.entryType}</td>
                    <td className="px-4 py-3 text-gray-600">{row.category.replace(/_/g, " ")}</td>
                    <td className={`px-4 py-3 font-medium ${row.entryType === "credit" ? "text-emerald-700" : "text-red-700"}`}>
                      {formatInrFromPaise(row.amountPaise)}
                    </td>
                    <td className="max-w-[12rem] truncate px-4 py-3 text-gray-500">
                      {row.description ?? row.referenceNumber ?? "—"}
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

      {createOpen ? (
        <LedgerEntryModal onClose={() => setCreateOpen(false)} />
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-emerald-100 bg-emerald-50/40" : "border-gray-100 bg-white"}`}>
      <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0F2544]">{value}</p>
    </div>
  );
}

function LedgerEntryModal({ onClose }: { onClose: () => void }) {
  const create = useCreateLedgerEntryMutation();
  const { options } = useStaffOptions();
  const [staffId, setStaffId] = useState("");
  const [entryDate, setEntryDate] = useState(todayYmd());
  const [entryType, setEntryType] = useState<LedgerEntryType>("debit");
  const [category, setCategory] = useState<LedgerCategory>("salary_payment");
  const [amountRupees, setAmountRupees] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [description, setDescription] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountPaise = rupeesToPaise(amountRupees);
    if (!amountPaise) return;
    try {
      await create.mutateAsync({
        staffId: staffId.trim(),
        entryDate,
        entryType,
        category,
        amountPaise,
        referenceNumber: referenceNumber.trim() || undefined,
        description: description.trim() || undefined,
      });
      onClose();
    } catch {
      /* below */
    }
  }

  return (
    <ModalOverlay onClose={onClose}>
      <h3 className="pr-8 text-lg font-bold text-[#0F2544]">New ledger entry</h3>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <AuthSelect label="Staff" name="staffIdSelect" value={staffId} onChange={(e) => setStaffId(e.target.value)} options={options} />
        <AuthField label="Staff ID" name="staffId" required value={staffId} onChange={(e) => setStaffId(e.target.value)} />
        <AuthField label="Entry date" name="entryDate" type="date" required value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        <AuthSelect label="Entry type" name="entryType" value={entryType} onChange={(e) => setEntryType(e.target.value as LedgerEntryType)} options={ENTRY_TYPE_CREATE} />
        <AuthSelect label="Category" name="category" value={category} onChange={(e) => setCategory(e.target.value as LedgerCategory)} options={CATEGORY_CREATE} />
        <AuthField label="Amount (₹)" name="amount" required value={amountRupees} onChange={(e) => setAmountRupees(e.target.value)} />
        <AuthField label="Reference" name="referenceNumber" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        <AuthField label="Description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        {create.isError ? <p className="text-sm text-red-600">{create.error.message}</p> : null}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={create.isPending} className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {create.isPending ? "Saving…" : "Save entry"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}