import type { LucideIcon } from "lucide-react";
import {
  Award,
  Bell,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  School,
  Search,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/dashboard/admin",
        icon: LayoutDashboard,
        description: "Summary and quick actions",
      },
    ],
  },
  {
    id: "students",
    label: "Students",
    items: [
      {
        id: "inquiries",
        label: "Inquiries",
        href: "/dashboard/admin/students/inquiries",
        icon: ClipboardList,
        description: "Admission leads, follow-up, and convert to registration",
      },
      {
        id: "registrations",
        label: "Registrations",
        href: "/dashboard/admin/students/registrations",
        icon: UserPlus,
        description: "Review and approve registrations after inquiry",
      },
      {
        id: "admissions",
        label: "Admissions",
        href: "/dashboard/admin/students/admissions",
        icon: GraduationCap,
        description: "Create admissions from approved registrations",
      },
      {
        id: "classes",
        label: "Classes",
        href: "/dashboard/admin/students/classes",
        icon: School,
        description:
          "Classes, sections, student rosters, and section teachers",
      },
      {
        id: "bifurcation",
        label: "Bifurcation search",
        href: "/dashboard/admin/students/bifurcation",
        icon: Search,
        description: "Search and record class, section, or stream changes",
      },
      {
        id: "certificates",
        label: "TC / LC",
        href: "/dashboard/admin/students/certificates",
        icon: Award,
        description: "Upload and download transfer or leaving certificates",
      },
      {
        id: "portal-access",
        label: "Portal access",
        href: "/dashboard/admin/students/portal-access",
        icon: UserCog,
      },
    ],
  },
  {
    id: "staff",
    label: "Staff",
    items: [
      {
        id: "staff-register",
        label: "Staff registration",
        href: "/dashboard/admin/staff",
        icon: Users,
        description: "Register staff and update profiles",
      },
      {
        id: "ledger",
        label: "Ledger",
        href: "/dashboard/admin/staff/ledger",
        icon: BookOpen,
        description: "Record salary, advance, and other ledger lines",
      },
      {
        id: "payslips",
        label: "Pay slips",
        href: "/dashboard/admin/staff/payslips",
        icon: Receipt,
        description: "Upload pay slip documents per period",
      },
    ],
  },
  {
    id: "fees",
    label: "Fees",
    items: [
      {
        id: "fee-heads",
        label: "Fee heads",
        href: "/dashboard/admin/fees/heads",
        icon: School,
      },
      {
        id: "fee-dues",
        label: "Student dues",
        href: "/dashboard/admin/fees/dues",
        icon: Wallet,
      },
      {
        id: "collections",
        label: "Collections",
        href: "/dashboard/admin/fees/collections",
        icon: Receipt,
      },
      {
        id: "receipts",
        label: "Receipts",
        href: "/dashboard/admin/fees/receipts",
        icon: Receipt,
      },
      {
        id: "outstanding",
        label: "Outstanding",
        href: "/dashboard/admin/fees/outstanding",
        icon: Wallet,
      },
      {
        id: "statements",
        label: "Statements",
        href: "/dashboard/admin/fees/statements",
        icon: BookOpen,
      },
      {
        id: "alerts",
        label: "Payment alerts",
        href: "/dashboard/admin/fees/alerts",
        icon: Bell,
      },
    ],
  },
];

export function flattenAdminNav(): AdminNavItem[] {
  return adminNavGroups.flatMap((g) => g.items);
}