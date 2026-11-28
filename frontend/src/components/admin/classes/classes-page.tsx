"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import {
  actionError,
  ClassFormModal,
  SectionFormModal,
} from "@/components/admin/classes/class-crud-modals";
import { StudentProfileEditor } from "@/components/admin/students/student-profile-editor";
import { AuthField } from "@/components/auth-field";
import {
  useAssignClassTeacherMutation,
  useRemoveClassTeacherMutation,
} from "@/hooks/mutations/use-class-teachers-mutation";
import {
  useCreateSchoolClassMutation,
  useCreateSchoolSectionMutation,
  useDeleteSchoolClassMutation,
  useDeleteSchoolSectionMutation,
  useUpdateSchoolClassMutation,
  useUpdateSchoolSectionMutation,
} from "@/hooks/mutations/use-school-class-mutations";
import {
  useClassOverviewQuery,
  useClassSectionDetailQuery,
} from "@/hooks/queries/use-classes-query";
import { useStaffListQuery } from "@/hooks/queries/use-staff-query";
import type { ClassOverviewItem, ClassSectionSummary } from "@/types/classes";

type View = "classes" | "sections" | "roster";

function studentName(row: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ");
}

export function ClassesPage({
  initialOpenStudentId,
}: {
  initialOpenStudentId?: string | null;
}) {
  const overview = useClassOverviewQuery();
  const [view, setView] = useState<View>("classes");
  const [selectedClass, setSelectedClass] = useState<ClassOverviewItem | null>(
    null,
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [profileStudentId, setProfileStudentId] = useState<string | null>(
    initialOpenStudentId ?? null,
  );
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [newClassOpen, setNewClassOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassOverviewItem | null>(null);
  const [defineClass, setDefineClass] = useState<ClassOverviewItem | null>(null);
  const [newSectionOpen, setNewSectionOpen] = useState(false);
  const [editSection, setEditSection] = useState<{
    classItem: ClassOverviewItem;
    section: ClassSectionSummary;
  } | null>(null);

  const createClass = useCreateSchoolClassMutation();
  const updateClass = useUpdateSchoolClassMutation();
  const deleteClass = useDeleteSchoolClassMutation();
  const createSection = useCreateSchoolSectionMutation();
  const updateSection = useUpdateSchoolSectionMutation();
  const deleteSection = useDeleteSchoolSectionMutation();

  useEffect(() => {
    if (initialOpenStudentId) setProfileStudentId(initialOpenStudentId);
  }, [initialOpenStudentId]);

  useEffect(() => {
    if (!selectedClass || !overview.data) return;
    const match =
      overview.data.classes.find((c) => c.id && c.id === selectedClass.id) ??
      overview.data.classes.find((c) => c.name === selectedClass.name);
    if (match) setSelectedClass(match);
  }, [overview.data, selectedClass?.id, selectedClass?.name]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const detailFilters =
    view === "roster" && selectedClass && selectedSection
      ? {
          className: selectedClass.name,
          section: selectedSection,
          page,
          limit: 25,
          search: search || undefined,
        }
      : null;

  const detail = useClassSectionDetailQuery(detailFilters);

  function openClass(c: ClassOverviewItem) {
    setSelectedClass(c);
    setSelectedSection(null);
    setView("sections");
    setPage(1);
    setSearchInput("");
  }

  function openSection(sectionName: string) {
    setSelectedSection(sectionName);
    setView("roster");
    setPage(1);
  }

  function goBack() {
    if (view === "roster") {
      setView("sections");
      setSelectedSection(null);
    } else if (view === "sections") {
      setView("classes");
      setSelectedClass(null);
    }
  }

  async function handleDeleteClass(c: ClassOverviewItem) {
    if (!c.id) {
      window.alert(
        "This class only exists on student records. Define it first, or remove students from this class.",
      );
      return;
    }
    if (
      !window.confirm(
        `Delete class "${c.name}" and all its sections? Students must be moved first.`,
      )
    ) {
      return;
    }
    try {
      await deleteClass.mutateAsync(c.id);
      if (selectedClass?.id === c.id) {
        setView("classes");
        setSelectedClass(null);
      }
    } catch (e) {
      window.alert(actionError(e));
    }
  }

  async function handleDeleteSection(
    classItem: ClassOverviewItem,
    section: ClassSectionSummary,
  ) {
    if (!section.id) {
      window.alert("Define this class and add the section officially before deleting.");
      return;
    }
    if (
      !window.confirm(
        `Delete section "${section.name}" from ${classItem.name}?`,
      )
    ) {
      return;
    }
    try {
      await deleteSection.mutateAsync(section.id);
      if (selectedSection === section.name) {
        setSelectedSection(null);
        setView("sections");
      }
    } catch (e) {
      window.alert(actionError(e));
    }
  }

  const breadcrumb =
    view === "classes"
      ? "All classes"
      : view === "sections" && selectedClass
        ? selectedClass.name
        : selectedClass && selectedSection
          ? `${selectedClass.name} · ${selectedSection}`
          : "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {view !== "classes" ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-semibold text-[#0F2544] hover:border-amber-300"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : null}
        <p className="text-sm font-semibold text-[#0F2544]">{breadcrumb}</p>
      </div>

      <p className="text-sm text-gray-500">
        Browse by class and section. Add or edit classes and sections here. Open a
        student only when you need the full profile.
      </p>

      {view === "classes" ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setNewClassOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F2544] px-4 py-2 text-sm font-semibold text-white hover:bg-[#162f5c]"
          >
            <Plus className="h-4 w-4" />
            New class
          </button>
        </div>
      ) : view === "sections" && selectedClass ? (
        <div className="flex flex-wrap justify-end gap-2">
          {selectedClass.id ? (
            <>
              <button
                type="button"
                onClick={() => setEditClass(selectedClass)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-[#0F2544] hover:border-amber-300"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit class
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteClass(selectedClass)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete class
              </button>
              <button
                type="button"
                onClick={() => setNewSectionOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F2544] px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                New section
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setDefineClass(selectedClass)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F2544] px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Define class for sections
            </button>
          )}
        </div>
      ) : null}

      {overview.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : overview.isError ? (
        <p className="text-sm text-red-600">{overview.error.message}</p>
      ) : view === "classes" ? (
        <ClassGrid
          classes={overview.data?.classes ?? []}
          onSelect={openClass}
          onEdit={(c) => (c.id ? setEditClass(c) : setDefineClass(c))}
          onDelete={(c) => void handleDeleteClass(c)}
        />
      ) : view === "sections" && selectedClass ? (
        <SectionGrid
          classItem={selectedClass}
          onSelect={openSection}
          onEdit={(section) =>
            setEditSection({ classItem: selectedClass, section })
          }
          onDelete={(section) =>
            void handleDeleteSection(selectedClass, section)
          }
        />
      ) : view === "roster" && selectedClass && selectedSection ? (
        <SectionRoster
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          detail={detail}
          page={page}
          setPage={setPage}
          onOpenStudent={setProfileStudentId}
          className={selectedClass.name}
          section={selectedSection}
          addTeacherOpen={addTeacherOpen}
          setAddTeacherOpen={setAddTeacherOpen}
        />
      ) : null}

      {newClassOpen ? (
        <ClassFormModal
          title="New class"
          onClose={() => setNewClassOpen(false)}
          busy={createClass.isPending}
          onSubmit={async (values) => {
            try {
              await createClass.mutateAsync(values);
              setNewClassOpen(false);
            } catch (e) {
              window.alert(actionError(e));
            }
          }}
        />
      ) : null}

      {defineClass ? (
        <ClassFormModal
          title={`Define class · ${defineClass.name}`}
          initial={{ name: defineClass.name, sortOrder: 0 }}
          onClose={() => setDefineClass(null)}
          busy={createClass.isPending}
          onSubmit={async (values) => {
            try {
              await createClass.mutateAsync(values);
              setDefineClass(null);
              const { data: freshOverview } = await overview.refetch();
              const refreshed = freshOverview?.classes.find(
                (x) => x.name === values.name,
              );
              if (refreshed) setSelectedClass(refreshed);
            } catch (e) {
              window.alert(actionError(e));
            }
          }}
        />
      ) : null}

      {editClass?.id ? (
        <ClassFormModal
          title="Edit class"
          initial={{ name: editClass.name, sortOrder: 0 }}
          showSortOrder={false}
          onClose={() => setEditClass(null)}
          busy={updateClass.isPending}
          onSubmit={async (values) => {
            try {
              await updateClass.mutateAsync({
                id: editClass.id!,
                name: values.name,
              });
              setEditClass(null);
              if (selectedClass?.id === editClass.id) {
                setSelectedClass({
                  ...selectedClass,
                  name: values.name,
                });
              }
            } catch (e) {
              window.alert(actionError(e));
            }
          }}
        />
      ) : null}

      {newSectionOpen && selectedClass?.id ? (
        <SectionFormModal
          title={`New section · ${selectedClass.name}`}
          onClose={() => setNewSectionOpen(false)}
          busy={createSection.isPending}
          onSubmit={async (name) => {
            try {
              await createSection.mutateAsync({
                classId: selectedClass.id!,
                name,
              });
              setNewSectionOpen(false);
            } catch (e) {
              window.alert(actionError(e));
            }
          }}
        />
      ) : null}

      {editSection?.section.id ? (
        <SectionFormModal
          title={`Rename section · ${editSection.classItem.name}`}
          initial={editSection.section.name}
          onClose={() => setEditSection(null)}
          busy={updateSection.isPending}
          onSubmit={async (name) => {
            try {
              await updateSection.mutateAsync({
                id: editSection.section.id!,
                name,
              });
              if (selectedSection === editSection.section.name) {
                setSelectedSection(name);
              }
              setEditSection(null);
            } catch (e) {
              window.alert(actionError(e));
            }
          }}
        />
      ) : null}

      {profileStudentId ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close"
            onClick={() => setProfileStudentId(null)}
          />
          <StudentProfileEditor
            studentId={profileStudentId}
            onClose={() => setProfileStudentId(null)}
          />
        </div>
      ) : null}
    </div>
  );
}

function ClassGrid({
  classes,
  onSelect,
  onEdit,
  onDelete,
}: {
  classes: ClassOverviewItem[];
  onSelect: (c: ClassOverviewItem) => void;
  onEdit: (c: ClassOverviewItem) => void;
  onDelete: (c: ClassOverviewItem) => void;
}) {
  if (classes.length === 0) {
    return (
      <p className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">
        No classes yet. Use <strong>New class</strong> above or admit students
        with a class name.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((c) => (
        <ClassCard
          key={c.name}
          classItem={c}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ClassCard({
  classItem,
  onSelect,
  onEdit,
  onDelete,
}: {
  classItem: ClassOverviewItem;
  onSelect: (c: ClassOverviewItem) => void;
  onEdit: (c: ClassOverviewItem) => void;
  onDelete: (c: ClassOverviewItem) => void;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-amber-200 hover:shadow-md">
      <div className="absolute right-3 top-3 flex gap-1">
        <button
          type="button"
          aria-label={`Edit ${classItem.name}`}
          onClick={() => onEdit(classItem)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-[#0F2544]"
        >
          <Pencil className="h-4 w-4" />
        </button>
        {classItem.id ? (
          <button
            type="button"
            aria-label={`Delete ${classItem.name}`}
            onClick={() => onDelete(classItem)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onSelect(classItem)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2 pr-16">
          <GraduationCap className="h-8 w-8 text-amber-600" />
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {classItem.sections.length} section
            {classItem.sections.length === 1 ? "" : "s"}
          </span>
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg font-bold text-[#0F2544]">
          {classItem.name}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {classItem.totalStudents} student
          {classItem.totalStudents === 1 ? "" : "s"}
        </p>
        {!classItem.id ? (
          <p className="mt-2 text-xs text-amber-800">From student records only</p>
        ) : null}
      </button>
    </div>
  );
}

function SectionGrid({
  classItem,
  onSelect,
  onEdit,
  onDelete,
}: {
  classItem: ClassOverviewItem;
  onSelect: (section: string) => void;
  onEdit: (section: ClassSectionSummary) => void;
  onDelete: (section: ClassSectionSummary) => void;
}) {
  const sections =
    classItem.sections.length > 0
      ? classItem.sections
      : [
          {
            id: null,
            name: "Unassigned",
            studentCount: classItem.totalStudents,
          },
        ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sections.map((s) => (
        <div
          key={s.name}
          className="relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-amber-200"
        >
          {s.id && s.name !== "Unassigned" ? (
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                aria-label={`Rename section ${s.name}`}
                onClick={() => onEdit(s)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete section ${s.name}`}
                onClick={() => onDelete(s)}
                className="rounded-lg p-1 text-gray-500 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => onSelect(s.name)}
            className="w-full text-left"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Section
            </p>
            <p className="mt-1 font-[family-name:var(--font-heading)] text-xl font-bold text-[#0F2544]">
              {s.name}
            </p>
            <p className="mt-2 flex items-center gap-1 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              {s.studentCount} students
            </p>
          </button>
        </div>
      ))}
    </div>
  );
}

function SectionRoster({
  searchInput,
  setSearchInput,
  detail,
  page,
  setPage,
  onOpenStudent,
  className,
  section,
  addTeacherOpen,
  setAddTeacherOpen,
}: {
  searchInput: string;
  setSearchInput: (v: string) => void;
  detail: ReturnType<typeof useClassSectionDetailQuery>;
  page: number;
  setPage: (fn: (p: number) => number) => void;
  onOpenStudent: (id: string) => void;
  className: string;
  section: string;
  addTeacherOpen: boolean;
  setAddTeacherOpen: (v: boolean) => void;
}) {
  const removeTeacher = useRemoveClassTeacherMutation();
  const teachers = detail.data?.detail.teachers ?? [];
  const students = detail.data?.detail.students ?? [];
  const meta = detail.data?.meta;
  const totalPages = meta
    ? Math.max(1, Math.ceil(meta.total / meta.limit))
    : 1;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold uppercase tracking-wide text-[#0F2544]">
            Teachers
          </h3>
          <button
            type="button"
            onClick={() => setAddTeacherOpen(!addTeacherOpen)}
            className="text-sm font-semibold text-amber-800 hover:underline"
          >
            {addTeacherOpen ? "Cancel" : "Assign teacher"}
          </button>
        </div>
        {addTeacherOpen ? (
          <AssignTeacherForm
            className={className}
            section={section}
            onDone={() => setAddTeacherOpen(false)}
          />
        ) : null}
        {teachers.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No teachers assigned to this section yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {teachers.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-xl bg-[#F8FAFC] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#0F2544]">
                    {t.firstName} {t.lastName}
                  </p>
                  <p className="text-gray-600">
                    {t.designation} ·{" "}
                    <span className="capitalize">
                      {t.role.replace(/_/g, " ")}
                    </span>
                    {t.subject ? ` · ${t.subject}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={removeTeacher.isPending}
                  onClick={() => removeTeacher.mutate(t.id)}
                  className="text-xs font-semibold text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <label className="relative block max-w-md">
            <AuthField
              label="Search students"
              name="rosterSearch"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name, admission #, roll…"
            />
            <Search className="pointer-events-none absolute right-4 top-11 h-4 w-4 text-gray-400" />
          </label>
        </div>

        {detail.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Roll</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Adm #</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.rollNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0F2544]">
                      {studentName(row)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {row.admissionNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.phone ?? row.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenStudent(row.id)}
                        className="text-sm font-semibold text-amber-700"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm text-gray-600">
            <span>
              Page {meta.page} of {totalPages} · {meta.total} students
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function AssignTeacherForm({
  className,
  section,
  onDone,
}: {
  className: string;
  section: string;
  onDone: () => void;
}) {
  const assign = useAssignClassTeacherMutation();
  const staffQuery = useStaffListQuery({
    page: 1,
    limit: 100,
    status: "active",
    isTeachingStaff: true,
  });
  const staff = staffQuery.data?.data ?? [];
  const [staffId, setStaffId] = useState("");
  const [role, setRole] = useState<
    "class_teacher" | "subject_teacher" | "assistant"
  >("class_teacher");
  const [subject, setSubject] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!staffId) return;
    await assign.mutateAsync({
      className,
      section,
      staffId,
      role,
      subject: subject.trim() || undefined,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-semibold text-[#0F2544] sm:col-span-2">
        Teacher
        <select
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          required
          className="rounded-xl border border-gray-200 px-4 py-3 text-base font-normal"
        >
          <option value="">Select staff…</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName} — {s.designation}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-[#0F2544]">
        Role
        <select
          value={role}
          onChange={(e) =>
            setRole(
              e.target.value as
                | "class_teacher"
                | "subject_teacher"
                | "assistant",
            )
          }
          className="rounded-xl border border-gray-200 px-4 py-3 font-normal"
        >
          <option value="class_teacher">Class teacher</option>
          <option value="subject_teacher">Subject teacher</option>
          <option value="assistant">Assistant</option>
        </select>
      </label>
      <AuthField
        label="Subject (optional)"
        name="subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <button
        type="submit"
        disabled={assign.isPending}
        className="rounded-xl bg-[#0F2544] py-2.5 text-sm font-semibold text-white sm:col-span-2"
      >
        {assign.isPending ? "Saving…" : "Assign"}
      </button>
    </form>
  );
}