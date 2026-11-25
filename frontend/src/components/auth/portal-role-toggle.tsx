"use client";

import { GraduationCap, Shield } from "lucide-react";
import { motion } from "framer-motion";

import type { PortalIntent } from "@/lib/roles";

type PortalRoleToggleProps = {
  value: PortalIntent;
  onChange: (value: PortalIntent) => void;
  disabled?: boolean;
};

const options: {
  value: PortalIntent;
  label: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Fees, notices, your records",
    icon: GraduationCap,
  },
  {
    value: "admin",
    label: "Admin",
    description: "School management console",
    icon: Shield,
  },
];

export function PortalRoleToggle({
  value,
  onChange,
  disabled,
}: PortalRoleToggleProps) {
  return (
    <motion.div
      layout
      className="grid grid-cols-2 gap-2 rounded-xl bg-[#0F2544]/5 p-1"
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`relative flex flex-col items-start rounded-lg px-3 py-3 text-left transition ${
              selected
                ? "bg-white text-[#0F2544] shadow-md ring-1 ring-amber-400/40"
                : "text-gray-600 hover:bg-white/60"
            } disabled:opacity-60`}
          >
            <span className="flex items-center gap-1.5 text-sm font-bold font-[family-name:var(--font-heading)]">
              <Icon
                className={`h-4 w-4 ${selected ? "text-amber-500" : "text-gray-400"}`}
              />
              {opt.label}
            </span>
            <span className="mt-0.5 text-xs text-gray-500 font-[family-name:var(--font-body)]">
              {opt.description}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}