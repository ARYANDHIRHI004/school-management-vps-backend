"use client";

import Link from "next/link";
import { Loader2, LogOut, UserCircle } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthMessage } from "@/components/auth/auth-message";
import { useSignOutMutation } from "@/hooks/mutations/use-auth-mutations";
import { useMyStudentProfileQuery } from "@/hooks/queries/use-my-student-profile-query";
import { useSessionQuery } from "@/hooks/queries/use-session-query";
import { useAuthStore } from "@/stores/auth-store";
import type {
  MyStudentPortalData,
  StudentParent,
  StudentRecord,
} from "@/types/student";

function formatDate(ymd: string | null | undefined) {
  if (!ymd) return "—";
  try {
    return new Date(`${ymd}T12:00:00`).toLocaleDateString(undefined, {
      dateStyle: "medium",
    });
  } catch {
    return ymd;
  }
}

function fullName(s: StudentRecord) {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}

function formatAddress(s: StudentRecord) {
  const parts = [
    s.addressLine1 ?? s.address,
    s.addressLine2,
    [s.city, s.state].filter(Boolean).join(", "),
    s.postalCode,
    s.country,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "—";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-[#0F2544] sm:text-right">{value}</dd>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-[#0F2544]">
        {title}
      </h2>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </section>
  );
}

function ProfileHeroHeader({
  student,
  displayEmail,
}: {
  student: StudentRecord | undefined;
  displayEmail: string;
}) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-2xl font-extrabold">
        {student ? fullName(student) : "My profile"}
      </h1>
      <p className="mt-1 text-sm text-white/80">{displayEmail}</p>
      {student ? (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {student.admissionNumber ? (
            <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono">
              Adm {student.admissionNumber}
            </span>
          ) : null}
          {student.rollNumber ? (
            <span className="rounded-full bg-white/15 px-2.5 py-1">
              Roll {student.rollNumber}
            </span>
          ) : null}
          <span className="rounded-full bg-amber-400/90 px-2.5 py-1 font-semibold capitalize text-[#0F2544]">
            {student.enrollmentStatus.replace(/_/g, " ")}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function ParentRow({ parent }: { parent: StudentParent }) {
  const name = [parent.firstName, parent.middleName, parent.lastName]
    .filter(Boolean)
    .join(" ");
  return (
    <li className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 text-sm">
      <p className="font-semibold capitalize text-[#0F2544]">
        {parent.relationship} · {name}
      </p>
      {parent.phone ? (
        <p className="text-gray-600">Phone: {parent.phone}</p>
      ) : null}
      {parent.email ? (
        <p className="text-gray-600">Email: {parent.email}</p>
      ) : null}
      {parent.occupation ? (
        <p className="text-gray-600">Occupation: {parent.occupation}</p>
      ) : null}
      {parent.isPrimaryContact ? (
        <span className="mt-1 inline-block text-xs font-semibold text-emerald-700">
          Primary contact
        </span>
      ) : null}
    </li>
  );
}

function StudentProfileSections({ data }: { data: MyStudentPortalData }) {
  const { student, parents, inquiry, registration, admission } = data;

  return (
    <div className="space-y-4">
      <SectionCard title="Identification">
        <DetailRow label="Date of birth" value={formatDate(student.dateOfBirth)} />
        <DetailRow label="Gender" value={student.gender ?? "—"} />
        <DetailRow label="Blood group" value={student.bloodGroup ?? "—"} />
        <DetailRow label="Record status" value={student.recordStatus} />
      </SectionCard>

      <SectionCard title="Contact">
        <DetailRow label="Email" value={student.email ?? "—"} />
        <DetailRow label="Phone" value={student.phone ?? "—"} />
        <DetailRow label="Address" value={formatAddress(student)} />
      </SectionCard>

      <SectionCard title="Academic">
        <DetailRow label="Class" value={student.className ?? "—"} />
        <DetailRow
          label="Section / stream"
          value={
            [student.section, student.stream].filter(Boolean).join(" · ") || "—"
          }
        />
        <DetailRow label="Academic year" value={student.academicYear ?? "—"} />
        <DetailRow
          label="Admission date"
          value={formatDate(student.admissionDate ?? admission?.admissionDate)}
        />
        <DetailRow
          label="Previous school"
          value={student.previousSchool ?? "—"}
        />
        <DetailRow
          label="Previous class"
          value={student.previousClass ?? "—"}
        />
      </SectionCard>

      {parents.length > 0 ? (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-[#0F2544]">
            Parents / guardians
          </h2>
          <ul className="mt-3 space-y-3">
            {parents.map((p) => (
              <ParentRow key={p.id} parent={p} />
            ))}
          </ul>
        </section>
      ) : null}

      <SectionCard title="School journey (summary)">
        <DetailRow
          label="Inquiry"
          value={
            inquiry
              ? `${inquiry.inquiryNumber} · ${inquiry.status}`
              : "—"
          }
        />
        <DetailRow
          label="Registration"
          value={
            registration
              ? `${registration.registrationNumber} · ${registration.status}`
              : "—"
          }
        />
        <DetailRow
          label="Admission"
          value={
            admission
              ? `${admission.admissionNumber} · ${admission.status}`
              : "—"
          }
        />
      </SectionCard>
    </div>
  );
}

export function StudentPortalDashboard() {
  const { data: session, isPending: sessionPending } = useSessionQuery();
  const user = useAuthStore((s) => s.user);
  const signOut = useSignOutMutation();
  const profile = useMyStudentProfileQuery(Boolean(session?.user));

  if (sessionPending) {
    return (
      <AuthCard className="flex items-center justify-center gap-2 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        <p className="text-sm text-gray-600">Loading session…</p>
      </AuthCard>
    );
  }

  if (!session?.user) {
    return (
      <AuthCard>
        <p className="font-[family-name:var(--font-heading)] font-semibold text-[#0F2544]">
          You are not signed in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-sm font-semibold text-amber-600 hover:underline"
        >
          Go to portal sign in
        </Link>
      </AuthCard>
    );
  }

  const displayEmail = user?.email ?? session.user.email;
  const student = profile.data?.student;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <AuthCard className="overflow-hidden p-0">
        <div className="bg-[#0F2544] px-6 py-8 text-white">
          <div className="flex items-start gap-4">
            {student?.profilePhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.profilePhotoUrl}
                alt=""
                className="h-16 w-16 rounded-full border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10">
                <UserCircle className="h-10 w-10 text-white/80" />
              </div>
            )}
            <ProfileHeroHeader student={student} displayEmail={displayEmail} />
          </div>
        </div>
      </AuthCard>

      {profile.isLoading ? (
        <AuthCard className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </AuthCard>
      ) : profile.isError ? (
        <AuthCard>
          <AuthMessage variant="error">{profile.error.message}</AuthMessage>
          <p className="mt-2 text-sm text-gray-600">
            If you were just admitted, ask the school office to link your portal
            login to your student record.
          </p>
        </AuthCard>
      ) : profile.data ? (
        <StudentProfileSections data={profile.data} />
      ) : null}

      <div className="flex justify-center pb-4">
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0F2544] shadow-sm hover:border-amber-300 disabled:opacity-60"
        >
          {signOut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Sign out
        </button>
      </div>
    </div>
  );
}