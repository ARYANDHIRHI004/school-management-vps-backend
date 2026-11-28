"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AuthSelect } from "@/components/auth-field";
import { useAcademicOptionsQuery } from "@/hooks/queries/use-student-records-query";
import type { AcademicOptions } from "@/types/student";

export function matchClassSectionIds(
  academic: AcademicOptions | undefined,
  className: string | null | undefined,
  sectionName: string | null | undefined,
): { classId: string; sectionId: string } | null {
  if (!academic || !className?.trim()) return null;
  const schoolClass = academic.classes.find((c) => c.name === className.trim());
  if (!schoolClass) return null;
  if (!sectionName?.trim()) return null;
  const section = academic.sections.find(
    (s) => s.classId === schoolClass.id && s.name === sectionName.trim(),
  );
  if (!section) return null;
  return { classId: schoolClass.id, sectionId: section.id };
}

type ClassSectionPickerProps = {
  classId: string;
  sectionId: string;
  onClassChange: (classId: string) => void;
  onSectionChange: (sectionId: string) => void;
  required?: boolean;
};

export function ClassSectionPicker({
  classId,
  sectionId,
  onClassChange,
  onSectionChange,
  required = true,
}: ClassSectionPickerProps) {
  const academic = useAcademicOptionsQuery();

  const classes = academic.data?.classes ?? [];
  const sectionsForClass = useMemo(() => {
    if (!classId || !academic.data) return [];
    return academic.data.sections.filter((s) => s.classId === classId);
  }, [academic.data, classId]);

  const classOptions = [
    { value: "", label: "Select class…" },
    ...classes.map((c) => ({ value: c.id, label: c.name })),
  ];

  const sectionOptions = [
    { value: "", label: "Select section…" },
    ...sectionsForClass.map((s) => ({ value: s.id, label: s.name })),
  ];

  if (academic.isLoading) {
    return <p className="text-sm text-gray-500">Loading classes…</p>;
  }

  if (classes.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:col-span-2">
        No classes defined yet.{" "}
        <Link
          href="/dashboard/admin/students/classes"
          className="font-semibold underline"
        >
          Create classes and sections
        </Link>{" "}
        before admitting students.
      </p>
    );
  }

  return (
    <>
      <AuthSelect
        label="Class"
        name="classId"
        required={required}
        value={classId}
        onChange={(e) => {
          onClassChange(e.target.value);
          onSectionChange("");
        }}
        options={classOptions}
      />
      <AuthSelect
        label="Section"
        name="sectionId"
        required={required}
        value={sectionId}
        disabled={!classId}
        onChange={(e) => onSectionChange(e.target.value)}
        options={sectionOptions}
      />
      {classId && sectionsForClass.length === 0 ? (
        <p className="text-xs text-amber-800 sm:col-span-2">
          This class has no sections. Add a section under{" "}
          <Link
            href="/dashboard/admin/students/classes"
            className="font-semibold underline"
          >
            Classes
          </Link>{" "}
          first.
        </p>
      ) : null}
    </>
  );
}