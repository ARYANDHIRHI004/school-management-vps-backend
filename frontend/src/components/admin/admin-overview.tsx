"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { adminNavGroups } from "@/config/admin-nav";
import { useHealthQuery } from "@/hooks/queries/use-health-query";

export function AdminOverview() {
  const health = useHealthQuery(true);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="API status"
          value={
            health.isLoading
              ? "Checking…"
              : health.isError
                ? "Offline"
                : "Online"
          }
          tone={health.isError ? "danger" : "success"}
        />
        <StatCard label="Students module" value="UI ready" tone="neutral" />
        <StatCard label="Fees module" value="UI ready" tone="neutral" />
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
          Modules
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminNavGroups
            .filter((g) => g.id !== "main")
            .map((group) => (
              <ModuleCard key={group.id} group={group} />
            ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger" | "neutral";
}) {
  const ring =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50/50"
      : tone === "danger"
        ? "border-red-100 bg-red-50/50"
        : "border-gray-100 bg-white";
  const valueColor =
    tone === "success"
      ? "text-emerald-700"
      : tone === "danger"
        ? "text-red-700"
        : "text-[#0F2544]";

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${ring}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-2 font-[family-name:var(--font-heading)] text-2xl font-bold ${valueColor}`}
      >
        {value}
      </p>
    </div>
  );
}

function ModuleCard({
  group,
}: {
  group: (typeof adminNavGroups)[number];
}) {
  const first = group.items[0];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <h3 className="font-[family-name:var(--font-heading)] font-bold text-[#0F2544]">
        {group.label}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {group.items.length} screens in sidebar
      </p>
      <ul className="mt-3 space-y-1 text-sm text-gray-600">
        {group.items.slice(0, 3).map((item) => (
          <li key={item.id}>{item.label}</li>
        ))}
        {group.items.length > 3 ? (
          <li className="text-gray-400">+{group.items.length - 3} more</li>
        ) : null}
      </ul>
      {first ? (
        <Link
          href={first.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
        >
          Open module
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}