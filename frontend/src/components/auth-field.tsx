import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

type AuthFieldProps = {
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function AuthField({ label, hint, id, ...inputProps }: AuthFieldProps) {
  const fieldId = id ?? inputProps.name;

  return (
    <label
      htmlFor={fieldId}
      className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]"
    >
      {label}
      <input
        id={fieldId}
        {...inputProps}
        className="rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none transition placeholder:text-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 disabled:bg-gray-100 font-[family-name:var(--font-body)]"
      />
      {hint ? (
        <span className="text-xs font-normal text-gray-500">{hint}</span>
      ) : null}
    </label>
  );
}

type AuthSelectProps = {
  label: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function AuthSelect({
  label,
  options,
  id,
  ...selectProps
}: AuthSelectProps) {
  const fieldId = id ?? selectProps.name;

  return (
    <label
      htmlFor={fieldId}
      className="flex flex-col gap-1.5 text-sm font-semibold text-[#0F2544] font-[family-name:var(--font-heading)]"
    >
      {label}
      <select
        id={fieldId}
        {...selectProps}
        className="rounded-xl border border-gray-200 bg-white/90 px-4 py-3 text-base font-normal text-[#0F2544] shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 appearance-none font-[family-name:var(--font-body)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}