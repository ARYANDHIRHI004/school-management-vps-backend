"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRightLeft,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  useConvertInquiryMutation,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
} from "@/hooks/mutations/use-inquiry-mutations";
import {
  useInquiriesQuery,
  useInquiryQuery,
} from "@/hooks/queries/use-inquiries-query";
import type { InquiryStatus, StudentInquiry } from "@/types/inquiry";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "converted", label: "Converted" },
  { value: "closed", label: "Closed" },
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

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const styles =
    status === "open"
      ? "bg-amber-100 text-amber-800"
      : status === "converted"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}
    >
      {status}
    </span>
  );
}

export function InquiriesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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
      status: status || undefined,
      search: search || undefined,
    }),
    [page, status, search],
  );

  const listQuery = useInquiriesQuery(filters);
  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Track admission leads from first contact through registration.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2544] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a3660]"
        >
          <Plus className="h-4 w-4" />
          New inquiry
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="relative flex-1">
          <AuthField
            label="Search"
            name="search"
            placeholder="Name, email, or inquiry number"
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
              setStatus(e.target.value as InquiryStatus | "");
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {listQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading inquiries…
          </div>
        ) : listQuery.isError ? (
          <p className="py-12 text-center text-sm text-red-600">
            {listQuery.error.message}
          </p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">
            No inquiries yet. Create one to start tracking admission leads.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-[#F8FAFC] text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Inquiry #</th>
                  <th className="px-4 py-3">Inquirer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs text-[#0F2544]">
                      {row.inquiryNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0F2544]">
                      {row.inquirerName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{row.phone ?? "—"}</div>
                      <div className="text-xs text-gray-400">
                        {row.email ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.intendedClass ?? "—"}
                      {row.intendedStream ? ` · ${row.intendedStream}` : ""}
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
                        View
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
        <CreateInquiryModal onClose={() => setCreateOpen(false)} />
      ) : null}

      {selectedId ? (
        <InquiryDetailPanel
          inquiryId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
  <ModalOverlay onClose={onClose}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl ${
          wide ? "max-w-2xl" : "max-w-lg"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3
            id="modal-title"
            className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </ModalOverlay>
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
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}

function CreateInquiryModal({ onClose }: { onClose: () => void }) {
  const create = useCreateInquiryMutation();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [inquirerName, setInquirerName] = useState("");
  const [inquirerTouched, setInquirerTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [intendedClass, setIntendedClass] = useState("");
  const [intendedStream, setIntendedStream] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!inquirerTouched && (firstName || lastName)) {
      setInquirerName(`${firstName} ${lastName}`.trim());
    }
  }, [firstName, lastName, inquirerTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        inquirerName: inquirerName.trim(),
        fatherName: fatherName.trim() || undefined,
        motherName: motherName.trim() || undefined,
        address:
          [addressLine1.trim(), city.trim(), postalCode.trim()]
            .filter(Boolean)
            .join(", ") || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        intendedClass: intendedClass.trim() || undefined,
        intendedStream: intendedStream.trim() || undefined,
        academicYear: academicYear.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch {
      /* surfaced in create.error */
    }
  }

  return (
    <ModalShell title="New admission inquiry" onClose={onClose} wide>
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <AuthField
          label="First name"
          name="firstName"
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <AuthField
          label="Middle name"
          name="middleName"
          value={middleName}
          onChange={(e) => setMiddleName(e.target.value)}
        />
        <AuthField
          label="Last name"
          name="lastName"
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <AuthField
          label="Father's name"
          name="fatherName"
          value={fatherName}
          onChange={(e) => setFatherName(e.target.value)}
        />
        <AuthField
          label="Mother's name"
          name="motherName"
          value={motherName}
          onChange={(e) => setMotherName(e.target.value)}
        />
        <AuthField
          label="Address"
          name="addressLine1"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
        <AuthField
          label="City"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <AuthField
          label="PIN code"
          name="postalCode"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
        <AuthField
          label="Inquirer name"
          name="inquirerName"
          required
          hint="Usually the student or guardian name"
          value={inquirerName}
          onChange={(e) => {
            setInquirerTouched(true);
            setInquirerName(e.target.value);
          }}
          className="sm:col-span-2"
        />
        <AuthField
          label="Phone"
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <AuthField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Intended class"
          name="intendedClass"
          placeholder="e.g. Class 9"
          value={intendedClass}
          onChange={(e) => setIntendedClass(e.target.value)}
        />
        <AuthField
          label="Stream"
          name="intendedStream"
          placeholder="Science / Commerce"
          value={intendedStream}
          onChange={(e) => setIntendedStream(e.target.value)}
        />
        <AuthField
          label="Academic year"
          name="academicYear"
          placeholder="2025-26"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="sm:col-span-2"
        />
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] sm:col-span-2 font-[family-name:var(--font-heading)]">
          Notes
          <textarea
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 font-[family-name:var(--font-body)]"
          />
        </label>

        {create.isError ? (
          <p className="text-sm text-red-600 sm:col-span-2">{create.error.message}</p>
        ) : null}

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {create.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Save inquiry
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function InquiryDetailPanel({
  inquiryId,
  onClose,
}: {
  inquiryId: string;
  onClose: () => void;
}) {
  const detail = useInquiryQuery(inquiryId);
  const update = useUpdateInquiryMutation(inquiryId);
  const convert = useConvertInquiryMutation(inquiryId);
  const [convertOpen, setConvertOpen] = useState(false);

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
              Inquiry details
            </h3>
            {row ? (
              <p className="font-mono text-xs text-gray-500">
                {row.inquiryNumber}
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
            <InquiryEditForm
              row={row}
              update={update}
              onConvert={() => setConvertOpen(true)}
            />
          ) : null}
        </div>
      </aside>

      {convertOpen && row ? (
        <ConvertModal
          inquiry={row}
          convert={convert}
          onClose={() => setConvertOpen(false)}
          onSuccess={onClose}
        />
      ) : null}
    </div>
  );
}

function InquiryEditForm({
  row,
  update,
  onConvert,
}: {
  row: StudentInquiry;
  update: ReturnType<typeof useUpdateInquiryMutation>;
  onConvert: () => void;
}) {
  const [inquirerName, setInquirerName] = useState(row.inquirerName);
  const [phone, setPhone] = useState(row.phone ?? "");
  const [email, setEmail] = useState(row.email ?? "");
  const [intendedClass, setIntendedClass] = useState(row.intendedClass ?? "");
  const [intendedStream, setIntendedStream] = useState(
    row.intendedStream ?? "",
  );
  const [academicYear, setAcademicYear] = useState(row.academicYear ?? "");
  const [notes, setNotes] = useState(row.notes ?? "");
  const [status, setStatus] = useState<InquiryStatus>(row.status);

  useEffect(() => {
    setInquirerName(row.inquirerName);
    setPhone(row.phone ?? "");
    setEmail(row.email ?? "");
    setIntendedClass(row.intendedClass ?? "");
    setIntendedStream(row.intendedStream ?? "");
    setAcademicYear(row.academicYear ?? "");
    setNotes(row.notes ?? "");
    setStatus(row.status);
  }, [row]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      inquirerName: inquirerName.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      intendedClass: intendedClass.trim() || undefined,
      intendedStream: intendedStream.trim() || undefined,
      academicYear: academicYear.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });
  }

  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={row.status} />
        {row.status !== "converted" ? (
          <AuthSelect
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InquiryStatus)}
            options={[
              { value: "open", label: "Open" },
              { value: "closed", label: "Closed" },
            ]}
          />
        ) : (
          <p className="text-sm text-gray-500">
            This inquiry was converted to registration.
          </p>
        )}
      </div>

      <AuthField
        label="Inquirer name"
        name="inquirerName"
        required
        value={inquirerName}
        onChange={(e) => setInquirerName(e.target.value)}
      />
      <AuthField
        label="Phone"
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <AuthField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthField
        label="Intended class"
        name="intendedClass"
        value={intendedClass}
        onChange={(e) => setIntendedClass(e.target.value)}
      />
      <AuthField
        label="Stream"
        name="intendedStream"
        value={intendedStream}
        onChange={(e) => setIntendedStream(e.target.value)}
      />
      <AuthField
        label="Academic year"
        name="academicYear"
        value={academicYear}
        onChange={(e) => setAcademicYear(e.target.value)}
      />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]">
        Notes
        <textarea
          name="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 font-[family-name:var(--font-body)]"
        />
      </label>

      <p className="text-xs text-gray-400">
        Created {formatWhen(row.createdAt)}
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
        {row.status === "open" ? (
          <button
            type="button"
            onClick={onConvert}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Convert to registration
          </button>
        ) : null}
      </div>
    </form>
  );
}

function ConvertModal({
  inquiry,
  convert,
  onClose,
  onSuccess,
}: {
  inquiry: StudentInquiry;
  convert: ReturnType<typeof useConvertInquiryMutation>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [registrationDate, setRegistrationDate] = useState(todayYmd());
  const [remarks, setRemarks] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await convert.mutateAsync({
        registrationDate,
        remarks: remarks.trim() || undefined,
      });
      onSuccess();
    } catch {
      /* error below */
    }
  }

  return (
    <ModalShell title="Convert to registration" onClose={onClose}>
      <p className="mb-4 text-sm text-gray-600">
        This will create a registration record for{" "}
        <strong>{inquiry.inquirerName}</strong> and mark the inquiry as
        converted.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
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
        {convert.isError ? (
          <p className="text-sm text-red-600">{convert.error.message}</p>
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
            disabled={convert.isPending}
            className="flex-1 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {convert.isPending ? "Converting…" : "Confirm"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}