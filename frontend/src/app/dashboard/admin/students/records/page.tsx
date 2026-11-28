import { redirect } from "next/navigation";

export default async function StudentRecordsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const params = await searchParams;
  const q = params.studentId
    ? `?studentId=${encodeURIComponent(params.studentId)}`
    : "";
  redirect(`/dashboard/admin/students/classes${q}`);
}