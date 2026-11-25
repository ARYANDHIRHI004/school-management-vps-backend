"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { adminNavGroups } from "@/config/admin-nav";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <SidebarOverlay open={open} onClose={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#0F2544] text-white transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-white/10 px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-amber-400/40">
              <Image
                src="/images/logo.jpeg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-[family-name:var(--font-heading)] text-sm font-bold leading-tight">
                Vikas Valley
              </p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-amber-300">
                Admin
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-hide">
          {adminNavGroups.map((group) => (
            <div key={group.id}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/dashboard/admin" &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : "text-white/50"}`}
                        />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4 text-xs text-white/45">
          UI preview — API wiring coming next
        </div>
      </aside>
    </>
  );
}

function SidebarOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <button
      type="button"
      aria-label="Close sidebar"
      className="fixed inset-0 z-40 bg-black/50 lg:hidden"
      onClick={onClose}
    />
  );
}