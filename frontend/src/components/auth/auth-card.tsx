import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "admin";
};

export function AuthCard({
  children,
  className = "",
  tone = "default",
}: AuthCardProps) {
  const toneClass =
    tone === "admin"
      ? "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white"
      : "border-gray-100 bg-white";

  return (
    <div
      className={`rounded-2xl border p-8 shadow-xl shadow-slate-200/60 ${toneClass} ${className}`}
    >
      {children}
    </div>
  );
}