import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

type AdminPlaceholderProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  apiHint?: string;
};

export function AdminPlaceholder({
  title,
  description,
  icon: Icon = Construction,
  apiHint,
}: AdminPlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="mt-5 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#0F2544]">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
      {apiHint ? (
        <p className="mt-4 rounded-xl bg-[#F8FAFC] px-4 py-3 font-mono text-xs text-gray-600">
          {apiHint}
        </p>
      ) : null}
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-amber-600">
        Screen UI ready — connect API next
      </p>
    </div>
  );
}