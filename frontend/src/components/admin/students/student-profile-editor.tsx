"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { AuthField, AuthSelect } from "@/components/auth-field";
import {
  useCreateStudentParentMutation,
  useDeleteStudentParentMutation,
  useUpdateStudentParentMutation,
  useUpdateStudentRecordMutation,
} from "@/hooks/mutations/use-student-profile-mutations";
import { useMarkStudentDepartureMutation } from "@/hooks/mutations/use-student-departure-mutation";
import {
  useAcademicOptionsQuery,
  useStudentProfileQuery,
} from "@/hooks/queries/use-student-records-query";
import type {
  AcademicOptions,
  ParentRelationship,
  StudentParent,
  StudentRecord,
} from "@/types/student";

const RECORD_STATUS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "graduated", label: "Graduated" },
  { value: "withdrawn", label: "Withdrawn" },
];

const PARENT_REL = [
  { value: "father", label: "Father" },
  { value: "mother", label: "Mother" },
  { value: "guardian", label: "Guardian" },
  { value: "other", label: "Other" },
];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function fullName(s: StudentRecord) {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}

export function StudentProfileEditor({
  studentId,
  onClose,
}: {
  studentId: string;
  onClose: () => void;
}) {
  const profile = useStudentProfileQuery(studentId);
  const academic = useAcademicOptionsQuery();
  const student = profile.data?.student;
  const parents = profile.data?.parents ?? [];

  return (
    <aside className="relative z-10 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl">
      <motionProfileHeader student={student} onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {profile.isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        ) : profile.isError ? (
          <p className="text-sm text-red-600">{profile.error.message}</p>
        ) : student ? (
          <div className="space-y-8">
            <StatusChips student={student} />
            <StudentDetailsForm student={student} academic={academic.data} />
            <ParentsSection studentId={studentId} parents={parents} />
            {student.lifecycleStatus === "admitted" ? (
              <DepartureSection studentId={studentId} />
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ProfileHeader({
  student,
  onClose,
}: {
  student: StudentRecord | undefined;
  onClose: () => void;
}) {
  return motionProfileHeader({ student, onClose });
}

function motionProfileHeader({
  student,
  onClose,
}: {
  student: StudentRecord | undefined;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
          Student profile
        </h3>
        {student ? (
          <p className="mt-0.5 text-sm text-gray-600">{fullName(student)}</p>
        ) : null}
        {student?.admissionNumber ? (
          <p className="font-mono text-xs text-gray-400">
            {student.admissionNumber}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg px-3 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-100"
      >
        Close
      </button>
    </div>
  );
}

function StatusChips({ student }: { student: StudentRecord }) {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold capitalize text-slate-800">
        Pipeline: {student.lifecycleStatus}
      </span>
      <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold capitalize text-emerald-900">
        Enrollment: {student.enrollmentStatus.replace(/_/g, " ")}
      </span>
      <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold capitalize text-blue-900">
        Record: {student.recordStatus}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-[#0F2544]">
      {children}
    </h4>
  );
}

function StudentDetailsForm({
  student,
  academic,
}: {
  student: StudentRecord;
  academic: AcademicOptions | undefined;
}) {
  const update = useUpdateStudentRecordMutation(student.id);

  const [firstName, setFirstName] = useState(student.firstName);
  const [middleName, setMiddleName] = useState(student.middleName ?? "");
  const [lastName, setLastName] = useState(student.lastName);
  const [dateOfBirth, setDateOfBirth] = useState(student.dateOfBirth ?? "");
  const [gender, setGender] = useState(student.gender ?? "");
  const [bloodGroup, setBloodGroup] = useState(student.bloodGroup ?? "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(
    student.profilePhotoUrl ?? "",
  );
  const [recordStatus, setRecordStatus] = useState(student.recordStatus);
  const [rollNumber, setRollNumber] = useState(student.rollNumber ?? "");
  const [email, setEmail] = useState(student.email ?? "");
  const [phone, setPhone] = useState(student.phone ?? "");
  const [addressLine1, setAddressLine1] = useState(student.addressLine1 ?? "");
  const [addressLine2, setAddressLine2] = useState(student.addressLine2 ?? "");
  const [city, setCity] = useState(student.city ?? "");
  const [state, setState] = useState(student.state ?? "");
  const [postalCode, setPostalCode] = useState(student.postalCode ?? "");
  const [country, setCountry] = useState(student.country ?? "India");
  const [admissionDate, setAdmissionDate] = useState(
    student.admissionDate ?? "",
  );
  const [academicYearId, setAcademicYearId] = useState(
    student.academicYearId ?? "",
  );
  const [classId, setClassId] = useState(student.classId ?? "");
  const [sectionId, setSectionId] = useState(student.sectionId ?? "");
  const [houseId, setHouseId] = useState(student.houseId ?? "");
  const [className, setClassName] = useState(student.className ?? "");
  const [section, setSection] = useState(student.section ?? "");
  const [stream, setStream] = useState(student.stream ?? "");
  const [academicYear, setAcademicYear] = useState(student.academicYear ?? "");
  const [previousSchool, setPreviousSchool] = useState(
    student.previousSchool ?? "",
  );
  const [previousClass, setPreviousClass] = useState(
    student.previousClass ?? "",
  );

  useEffect(() => {
    setFirstName(student.firstName);
    setMiddleName(student.middleName ?? "");
    setLastName(student.lastName);
    setDateOfBirth(student.dateOfBirth ?? "");
    setGender(student.gender ?? "");
    setBloodGroup(student.bloodGroup ?? "");
    setProfilePhotoUrl(student.profilePhotoUrl ?? "");
    setRecordStatus(student.recordStatus);
    setRollNumber(student.rollNumber ?? "");
    setEmail(student.email ?? "");
    setPhone(student.phone ?? "");
    setAddressLine1(student.addressLine1 ?? student.address ?? "");
    setAddressLine2(student.addressLine2 ?? "");
    setCity(student.city ?? "");
    setState(student.state ?? "");
    setPostalCode(student.postalCode ?? "");
    setCountry(student.country ?? "India");
    setAdmissionDate(student.admissionDate ?? "");
    setAcademicYearId(student.academicYearId ?? "");
    setClassId(student.classId ?? "");
    setSectionId(student.sectionId ?? "");
    setHouseId(student.houseId ?? "");
    setClassName(student.className ?? "");
    setSection(student.section ?? "");
    setStream(student.stream ?? "");
    setAcademicYear(student.academicYear ?? "");
    setPreviousSchool(student.previousSchool ?? "");
    setPreviousClass(student.previousClass ?? "");
  }, [student]);

  const sectionOptions = useMemo(() => {
    const list = academic?.sections ?? [];
    const filtered = classId
      ? list.filter((s) => s.classId === classId)
      : list;
    return [
      { value: "", label: "— Section (reference) —" },
      ...filtered.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [academic?.sections, classId]);

  const yearOptions = [
    { value: "", label: "— Academic year —" },
    ...(academic?.years ?? []).map((y) => ({
      value: y.id,
      label: y.label || y.code,
    })),
  ];
  const classOptions = [
    { value: "", label: "— Class (reference) —" },
    ...(academic?.classes ?? []).map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];
  const houseOptions = [
    { value: "", label: "— House —" },
    ...(academic?.houses ?? []).map((h) => ({
      value: h.id,
      label: h.name,
    })),
  ];

  const hasReferenceData =
    (academic?.years.length ?? 0) > 0 ||
    (academic?.classes.length ?? 0) > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth || undefined,
      gender: gender.trim() || undefined,
      bloodGroup: bloodGroup.trim() || undefined,
      profilePhotoUrl: profilePhotoUrl.trim() || undefined,
      recordStatus,
      rollNumber: rollNumber.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      addressLine1: addressLine1.trim() || undefined,
      addressLine2: addressLine2.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      country: country.trim() || undefined,
      admissionDate: admissionDate || undefined,
      academicYearId: academicYearId || undefined,
      classId: classId || undefined,
      sectionId: sectionId || undefined,
      houseId: houseId || undefined,
      className: className.trim() || undefined,
      section: section.trim() || undefined,
      stream: stream.trim() || undefined,
      academicYear: academicYear.trim() || undefined,
      previousSchool: previousSchool.trim() || undefined,
      previousClass: previousClass.trim() || undefined,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <motionDetails student={student} />

      <div>
        <SectionTitle>Identification</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <AuthField
            label="First name"
            name="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <AuthField
            label="Middle name"
            name="middleName"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <AuthField
            label="Last name"
            name="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <AuthField
            label="Date of birth"
            name="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <AuthField
            label="Gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
          <AuthField
            label="Blood group"
            name="bloodGroup"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <AuthField
            label="Roll number"
            name="rollNumber"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
          />
          <AuthField
            label="Profile photo URL"
            name="photo"
            value={profilePhotoUrl}
            onChange={(e) => setProfilePhotoUrl(e.target.value)}
          />
          <AuthSelect
            label="Record status"
            name="recordStatus"
            value={recordStatus}
            onChange={(e) =>
              setRecordStatus(e.target.value as StudentRecord["recordStatus"])
            }
            options={RECORD_STATUS}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Contact</SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <AuthField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            label="Phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <AuthField
            label="Address line 1"
            name="address1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
          />
          <AuthField
            label="Address line 2"
            name="address2"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />
          <AuthField
            label="City"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <AuthField
            label="State"
            name="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
          <AuthField
            label="PIN / postal code"
            name="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
          <AuthField
            label="Country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </div>
      </div>

      <div>
        <SectionTitle>Academic</SectionTitle>
        {!hasReferenceData ? (
          <p className="mt-2 text-xs text-amber-800">
            Reference tables (academic years, classes, houses) are empty — use
            text fields below or seed them in the database.
          </p>
        ) : null}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <AuthField
            label="Admission date"
            name="admissionDate"
            type="date"
            value={admissionDate}
            onChange={(e) => setAdmissionDate(e.target.value)}
          />
          <AuthSelect
            label="Academic year (reference)"
            name="academicYearId"
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            options={yearOptions}
          />
          <AuthSelect
            label="Class (reference)"
            name="classId"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              setSectionId("");
            }}
            options={classOptions}
          />
          <AuthSelect
            label="Section (reference)"
            name="sectionId"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={sectionOptions}
          />
          <AuthSelect
            label="House"
            name="houseId"
            value={houseId}
            onChange={(e) => setHouseId(e.target.value)}
            options={houseOptions}
          />
          <AuthField
            label="Class (label)"
            name="className"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <AuthField
            label="Section (label)"
            name="section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
          <AuthField
            label="Stream"
            name="stream"
            value={stream}
            onChange={(e) => setStream(e.target.value)}
          />
          <AuthField
            label="Academic year (label)"
            name="academicYear"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
          <AuthField
            label="Previous school"
            name="previousSchool"
            value={previousSchool}
            onChange={(e) => setPreviousSchool(e.target.value)}
          />
          <AuthField
            label="Previous class"
            name="previousClass"
            value={previousClass}
            onChange={(e) => setPreviousClass(e.target.value)}
          />
        </div>
      </div>

      {update.isError ? (
        <p className="text-sm text-red-600">{update.error.message}</p>
      ) : null}
      {update.isSuccess ? (
        <p className="text-sm text-emerald-700">Profile saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={update.isPending}
        className="w-full rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {update.isPending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function motionDetails({ student }: { student: StudentRecord }) {
  return student.admissionNumber ? (
    <p className="text-sm text-gray-500">
      Admission #{" "}
      <span className="font-mono font-semibold text-[#0F2544]">
        {student.admissionNumber}
      </span>
    </p>
  ) : null;
}

function ParentsSection({
  studentId,
  parents,
}: {
  studentId: string;
  parents: StudentParent[];
}) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <motionParents studentId={studentId} parents={parents} addOpen={addOpen} setAddOpen={setAddOpen} />
  );
}

function parentsSectionInner({
  studentId,
  parents,
  addOpen,
  setAddOpen,
}: {
  studentId: string;
  parents: StudentParent[];
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <SectionTitle>Parents / guardians</SectionTitle>
        <button
          type="button"
          onClick={() => setAddOpen(!addOpen)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0F2544] hover:border-amber-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {addOpen ? (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <AddParentForm
            studentId={studentId}
            onDone={() => setAddOpen(false)}
          />
        </div>
      ) : null}

      <ul className="mt-3 space-y-3">
        {parents.length === 0 ? (
          <li className="text-sm text-gray-500">No parent records yet.</li>
        ) : (
          parents.map((p) => (
            <ParentCard key={p.id} parent={p} studentId={studentId} />
          ))
        )}
      </ul>
    </div>
  );
}

function motionParents({
  studentId,
  parents,
  addOpen,
  setAddOpen,
}: {
  studentId: string;
  parents: StudentParent[];
  addOpen: boolean;
  setAddOpen: (v: boolean) => void;
}) {
  return parentsSectionInner({ studentId, parents, addOpen, setAddOpen });
}

function ParentCard({
  parent,
  studentId,
}: {
  parent: StudentParent;
  studentId: string;
}) {
  const remove = useDeleteStudentParentMutation(studentId);
  const [editing, setEditing] = useState(false);

  const label = [
    parent.firstName,
    parent.middleName,
    parent.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  if (!editing) {
    return (
      <li className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold capitalize text-[#0F2544]">
              {parent.relationship} · {label}
            </p>
            {parent.phone ? (
              <p className="text-gray-600">{parent.phone}</p>
            ) : null}
            {parent.email ? (
              <p className="text-gray-600">{parent.email}</p>
            ) : null}
            {parent.isPrimaryContact ? (
              <span className="mt-1 inline-block text-xs font-semibold text-emerald-700">
                Primary contact
              </span>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-amber-800"
            >
              Edit
            </button>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(parent.id)}
              className="text-red-600"
              aria-label="Delete parent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-gray-200 p-4">
      <EditParentForm
        parent={parent}
        studentId={studentId}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    </li>
  );
}

function AddParentForm({
  studentId,
  onDone,
}: {
  studentId: string;
  onDone: () => void;
}) {
  const create = useCreateStudentParentMutation(studentId);
  const [relationship, setRelationship] =
    useState<ParentRelationship>("father");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isPrimaryContact, setIsPrimaryContact] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      relationship,
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      isPrimaryContact,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <AuthSelect
        label="Relationship"
        name="rel"
        value={relationship}
        onChange={(e) =>
          setRelationship(e.target.value as ParentRelationship)
        }
        options={PARENT_REL}
      />
      <AuthField
        label="First name"
        name="pFirst"
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <AuthField
        label="Last name"
        name="pLast"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <AuthField
        label="Phone"
        name="pPhone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <AuthField
        label="Email"
        name="pEmail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm font-semibold text-[#0F2544] sm:col-span-2">
        <input
          type="checkbox"
          checked={isPrimaryContact}
          onChange={(e) => setIsPrimaryContact(e.target.checked)}
          className="h-4 w-4 rounded"
        />
        Primary contact
      </label>
      {create.isError ? (
        <p className="text-sm text-red-600 sm:col-span-2">
          {create.error.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={create.isPending}
        className="rounded-xl bg-[#0F2544] py-2 text-sm font-semibold text-white sm:col-span-2"
      >
        {create.isPending ? "Saving…" : "Add parent"}
      </button>
    </form>
  );
}

function EditParentForm({
  parent,
  studentId,
  onCancel,
  onSaved,
}: {
  parent: StudentParent;
  studentId: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = useUpdateStudentParentMutation(studentId);
  const [firstName, setFirstName] = useState(parent.firstName);
  const [lastName, setLastName] = useState(parent.lastName ?? "");
  const [phone, setPhone] = useState(parent.phone ?? "");
  const [email, setEmail] = useState(parent.email ?? "");
  const [occupation, setOccupation] = useState(parent.occupation ?? "");
  const [isPrimaryContact, setIsPrimaryContact] = useState(
    parent.isPrimaryContact,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({
      parentId: parent.id,
      body: {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        occupation: occupation.trim() || undefined,
        isPrimaryContact,
      },
    });
    onSaved();
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <AuthField
        label="First name"
        name="epFirst"
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <AuthField
        label="Last name"
        name="epLast"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <AuthField
        label="Phone"
        name="epPhone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <AuthField
        label="Email"
        name="epEmail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <AuthField
        label="Occupation"
        name="epOcc"
        value={occupation}
        onChange={(e) => setOccupation(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm font-semibold text-[#0F2544] sm:col-span-2">
        <input
          type="checkbox"
          checked={isPrimaryContact}
          onChange={(e) => setIsPrimaryContact(e.target.checked)}
          className="h-4 w-4 rounded"
        />
        Primary contact
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border py-2 text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={update.isPending}
          className="flex-1 rounded-xl bg-[#0F2544] py-2 text-sm font-semibold text-white"
        >
          Save
        </button>
      </div>
    </form>
  );
}

function DepartureSection({ studentId }: { studentId: string }) {
  const mark = useMarkStudentDepartureMutation();
  const [departureType, setDepartureType] = useState<"left" | "transferred">(
    "left",
  );
  const [departedAt, setDepartedAt] = useState(todayYmd());
  const [reason, setReason] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await mark.mutateAsync({
      studentId,
      departureType,
      departedAt,
      reason: reason.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
    >
      <SectionTitle>Leaving school</SectionTitle>
      <p className="mt-1 text-xs text-gray-600">
        Marks enrollment and keeps the full record.
      </p>
      <motionDepartureFields
        departureType={departureType}
        setDepartureType={setDepartureType}
        departedAt={departedAt}
        setDepartedAt={setDepartedAt}
        reason={reason}
        setReason={setReason}
        mark={mark}
      />
    </form>
  );
}

function motionDepartureFields({
  departureType,
  setDepartureType,
  departedAt,
  setDepartedAt,
  reason,
  setReason,
  mark,
}: {
  departureType: "left" | "transferred";
  setDepartureType: (v: "left" | "transferred") => void;
  departedAt: string;
  setDepartedAt: (v: string) => void;
  reason: string;
  setReason: (v: string) => void;
  mark: ReturnType<typeof useMarkStudentDepartureMutation>;
}) {
  return (
    <div className="mt-3 space-y-3">
      <AuthSelect
        label="Type"
        name="depType"
        value={departureType}
        onChange={(e) =>
          setDepartureType(e.target.value as "left" | "transferred")
        }
        options={[
          { value: "left", label: "Left school" },
          { value: "transferred", label: "Transferred" },
        ]}
      />
      <AuthField
        label="Date"
        name="depDate"
        type="date"
        required
        value={departedAt}
        onChange={(e) => setDepartedAt(e.target.value)}
      />
      <AuthField
        label="Reason"
        name="depReason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
      {mark.isError ? (
        <p className="text-sm text-red-600">{mark.error.message}</p>
      ) : null}
      {mark.isSuccess ? (
        <p className="text-sm text-emerald-700">Marked as departed.</p>
      ) : null}
      <button
        type="submit"
        disabled={mark.isPending}
        className="w-full rounded-xl border border-amber-400 bg-white py-2 text-sm font-semibold text-amber-900"
      >
        {mark.isPending ? "Saving…" : "Mark departed"}
      </button>
    </div>
  );
}
