import type { ReactNode } from "react";

type AuthMessageProps = {
  children: ReactNode;
  variant: "error" | "success" | "info";
};

const styles = {
  error: "bg-red-50 text-red-800 border-red-100",
  success: "bg-emerald-50 text-emerald-900 border-emerald-100",
  info: "bg-blue-50 text-blue-900 border-blue-100",
};

export function AuthMessage({ children, variant }: AuthMessageProps) {
  return (
    <p
      className={`rounded-xl border px-3 py-2.5 text-sm font-[family-name:var(--font-body)] ${styles[variant]}`}
    >
      {children}
    </p>
  );
}