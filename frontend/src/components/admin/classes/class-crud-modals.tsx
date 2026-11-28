"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { AuthField } from "@/components/auth-field";

export function CrudModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-[#0F2544]">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export function ClassFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  busy,
  showSortOrder = true,
}: {
  title: string;
  initial?: { name: string; sortOrder: number };
  onClose: () => void;
  onSubmit: (values: { name: string; sortOrder?: number }) => Promise<void>;
  busy: boolean;
  showSortOrder?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));

  return (
    <CrudModal title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          const order = Number(sortOrder);
          void onSubmit({
            name: trimmed,
            sortOrder: Number.isFinite(order) ? order : 0,
          });
        }}
      >
        <AuthField
          label="Class name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 10"
          required
        />
        {showSortOrder ? (
          <AuthField
            label="Sort order"
            name="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min={0}
          />
        ) : null}
        <ModalActions onClose={onClose} busy={busy} disabled={!name.trim()} />
      </form>
    </CrudModal>
  );
}

export function SectionFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  busy,
}: {
  title: string;
  initial?: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  busy: boolean;
}) {
  const [name, setName] = useState(initial ?? "");

  return (
    <CrudModal title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = name.trim();
          if (!trimmed) return;
          void onSubmit(trimmed);
        }}
      >
        <AuthField
          label="Section name"
          name="sectionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. A"
          required
        />
        <ModalActions onClose={onClose} busy={busy} disabled={!name.trim()} />
      </form>
    </CrudModal>
  );
}

function ModalActions({
  onClose,
  busy,
  disabled,
}: {
  onClose: () => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={busy || disabled}
        className="rounded-lg bg-[#0F2544] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

export function actionError(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong";
}