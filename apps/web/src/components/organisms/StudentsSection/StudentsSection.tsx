"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/molecules/DataTable";
import { Select } from "@/components/atoms/Select";
import { Label } from "@/components/atoms/Label";
import type { ClassDto, PaginatedResult, StudentDto } from "@/lib/data";

export interface StudentsSectionProps {
  initialData: PaginatedResult<StudentDto>;
  classOptions: ClassDto[];
  /** Server Action — layer 2 (React Query) calls the same cached fetcher as the initial SSR pass. */
  fetchStudents: (
    page: number,
    classId?: string,
  ) => Promise<PaginatedResult<StudentDto> | null>;
}

const EMPTY_PAGE: PaginatedResult<StudentDto> = { items: [], total: 0, page: 1, limit: 20 };
const ALL_CLASSES = "";

export function StudentsSection({
  initialData,
  classOptions,
  fetchStudents,
}: StudentsSectionProps) {
  const t = useTranslations("students");
  const tCommon = useTranslations("dashboard.common");
  const [page, setPage] = useState(initialData.page);
  const [classId, setClassId] = useState(ALL_CLASSES);

  const { data } = useQuery({
    queryKey: ["students", page, classId],
    queryFn: () => fetchStudents(page, classId || undefined),
    initialData: page === initialData.page && classId === ALL_CLASSES ? initialData : undefined,
    staleTime: 30_000,
  });

  const result = data ?? EMPTY_PAGE;

  const classNameById = useMemo(
    () => new Map(classOptions.map((c) => [c.id, c.name])),
    [classOptions],
  );

  const columns: DataTableColumn<StudentDto>[] = useMemo(
    () => [
      { key: "firstName", header: t("columnFirstName"), render: (row) => row.firstName },
      { key: "lastName", header: t("columnLastName"), render: (row) => row.lastName },
      {
        key: "class",
        header: t("columnClass"),
        render: (row) => classNameById.get(row.classId) ?? row.classId,
      },
    ],
    [t, classNameById],
  );

  const classFilterOptions = useMemo(
    () => [
      { value: ALL_CLASSES, label: tCommon("allClasses") },
      ...classOptions.map((c) => ({ value: c.id, label: c.name })),
    ],
    [tCommon, classOptions],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 max-w-xs">
        <Label htmlFor="class-filter">{tCommon("filterByClass")}</Label>
        <Select
          id="class-filter"
          name="class-filter"
          value={classId}
          options={classFilterOptions}
          onChange={(event) => {
            setClassId(event.target.value);
            setPage(1);
          }}
        />
      </div>
      <DataTable
        columns={columns}
        rows={result.items}
        rowKey={(row) => row.id}
        page={result.page}
        limit={result.limit}
        total={result.total}
        onPageChange={setPage}
        emptyLabel={t("empty")}
        labels={{
          previous: tCommon("previous"),
          next: tCommon("next"),
          pageOf: (page, totalPages) => tCommon("pageOf", { page, totalPages }),
        }}
      />
    </div>
  );
}
