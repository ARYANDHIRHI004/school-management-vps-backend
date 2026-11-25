"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  ModalOverlay,
  PaginationBar,
  formatDate,
  formatWhen,
  todayYmd,
} from "@/components/admin/staff/staff-shared";
import {
  useCreateStaffMutation,
  useUpdateStaffMutation,
} from "@/hooks/mutations/use-staff-mutations";
import {
  useStaffListQuery,
  useStaffMemberQuery,
} from "@/hooks/queries/use-staff-query";
import { formatInrFromPaise, paiseToRupeesInput, rupeesToPaise } from "@/lib/format-money";
import type {
  EmploymentType,
  StaffMember,
  StaffStatus,
} from "@/types/staff";

const STATUS_FILTER = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "resigned", label: "Resigned" },
];

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "part_time", label: "Part time" },
];

function StatusBadge({ status }: { status: StaffStatus }) {
  const styles =
    status === "active"
      ? "bg-emerald-100 text-emerald-800"
      : status === "resigned"
        ? "bg-gray-100 text-gray-700"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {status}
    </span>
  );
}

export function StaffRegistrationPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StaffStatus | "">("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      status: status || undefined,
    }),
    [page, search, status],
  );

  const listQuery = useStaffListQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Register teaching and non-teaching staff. Codes are assigned automatically
          unless you provide one.
        </p>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Register staff
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="relative flex-1">
          <AuthField
            label="Search"
            name="search"
            placeholder="Name, code, email, phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
        </label>
        <div className="w-full sm:max-w-[200px]">
          <AuthSelect
            label="Status"
            name="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StaffStatus | "");
              setPage(1);
            }}
            options={STATUS_FILTER}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {listQuery.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No staff registered yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs">{row.staffCode}</td>
                    <td className="px-4 py-3 font-medium text-[#0F2544]">
                      {row.firstName} {row.lastName}
                      {row.isTeachingStaff ? (
                        <span className="ml-1 text-xs text-gray-400">Teaching</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{row.designation}</div>
                      <div className="text-xs text-gray-400">{row.department ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.phone ?? row.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id)}
                        className="text-sm font-semibold text-amber-700"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <StaffFormModal onClose={() => setCreateOpen(false)} />
      ) : null}
      {selectedId ? (
        <StaffDetailPanel staffId={selectedId} onClose={() => setSelectedId(null)} />
      ) : null}
    </div>
  );
}

function StaffDetailPanel({
  staffId,
  onClose,
}: {
  staffId: string;
  onClose: () => void;
}) {
  const detail = useStaffMemberQuery(staffId);
  const row = detail.data?.data;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-xl sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <h3 className="text-lg font-bold text-[#0F2544]">Staff profile</h3>
          {row ? (
            <p className="font-mono text-xs text-gray-500">{row.staffCode}</p>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {detail.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : detail.isError ? (
            <p className="text-sm text-red-600">{detail.error.message}</p>
          ) : row ? (
            <StaffEditForm row={row} />
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function StaffEditForm({ row }: { row: StaffMember }) {
  const update = useUpdateStaffMutation(row.id);
  const [firstName, setFirstName] = useState(row.firstName);
  const [lastName, setLastName] = useState(row.lastName);
  const [designation, setDesignation] = useState(row.designation);
  const [department, setDepartment] = useState(row.department ?? "");
  const [status, setStatus] = useState<StaffStatus>(row.status);
  const [employmentType, setEmploymentType] = useState(row.employmentType);
  const [phone, setPhone] = useState(row.phone ?? "");
  const [email, setEmail] = useState(row.email ?? "");
  const [baseSalary, setBaseSalary] = useState(paiseToRupeesInput(row.baseSalaryPaise));

  useEffect(() => {
    setFirstName(row.firstName);
    setLastName(row.lastName);
    setDesignation(row.designation);
    setDepartment(row.department ?? "");
    setStatus(row.status);
    setEmploymentType(row.employmentType);
    setPhone(row.phone ?? "");
    setEmail(row.email ?? "");
    setBaseSalary(paiseToRupeesInput(row.baseSalaryPaise));
  }, [row]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      designation: designation.trim(),
      department: department.trim() || undefined,
      status,
      employmentType,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      baseSalaryPaise: rupeesToPaise(baseSalary),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <StatusBadge status={row.status} />
      <p className="text-xs text-gray-400">Joined {row.dateOfJoining ? formatDate(row.dateOfJoining) : "—"}</p>
      <AuthField label="First name" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <AuthField label="Last name" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <AuthField label="Designation" name="designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} />
      <AuthField label="Department" name="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
      <AuthSelect label="Status" name="status" value={status} onChange={(e) => setStatus(e.target.value as StaffStatus)} options={STATUS_FILTER.filter((o) => o.value)} />
      <AuthSelect label="Employment" name="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} options={EMPLOYMENT_OPTIONS} />
      <AuthField label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <AuthField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <AuthField label="Base salary (₹)" name="baseSalary" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
      <p className="text-sm text-gray-500">
        Current: {formatInrFromPaise(row.baseSalaryPaise)}
      </p>
      {update.isError ? <p className="text-sm text-red-600">{update.error.message}</p> : null}
      {update.isSuccess ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <button type="submit" disabled={update.isPending} className="w-full rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
        {update.isPending ? "Saving…" : "Save changes"}
      </button>
      <p className="text-xs text-gray-400">Updated {formatWhen(row.updatedAt)}</p>
    </form>
  );
}

function StaffFormModal({ onClose }: { onClose: () => void }) {
  const create = useCreateStaffMutation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("permanent");
  const [isTeaching, setIsTeaching] = useState(false);
  const [dateOfJoining, setDateOfJoining] = useState(todayYmd());
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        designation: designation.trim(),
        department: department.trim() || undefined,
        employmentType,
        isTeachingStaff: isTeaching,
        dateOfJoining,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        baseSalaryPaise: rupeesToPaise(baseSalary),
      });
      onClose();
    } catch {
      /* below */
    }
  }

  return (
    <ModalOverlay onClose={onClose} wide>
      <h3 className="pr-8 text-lg font-bold text-[#0F2544]">Register staff</h3>
      <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <AuthField label="First name" name="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <AuthField label="Last name" name="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <AuthField label="Designation" name="designation" required value={designation} onChange={(e) => setDesignation(e.target.value)} />
        <AuthField label="Department" name="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <AuthSelect label="Employment" name="employmentType" value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} options={EMPLOYMENT_OPTIONS} />
        <AuthField label="Date of joining" name="dateOfJoining" type="date" value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} />
        <AuthField label="Phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <AuthField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <AuthField label="Base salary (₹)" name="baseSalary" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
        <label className="flex items-center gap-2 text-sm font-semibold text-[#0F2544] sm:col-span-2">
          <input type="checkbox" checked={isTeaching} onChange={(e) => setIsTeaching(e.target.checked)} />
          Teaching staff
        </label>
        {create.isError ? <p className="text-sm text-red-600 sm:col-span-2">{create.error.message}</p> : null}
        <div className="flex gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold">Cancel</button>
          <button type="submit" disabled={create.isPending} className="flex-1 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {create.isPending ? "Saving…" : "Register"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}