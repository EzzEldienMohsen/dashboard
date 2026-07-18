"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { DataTable, type DataTableColumn } from "@/components/molecules/DataTable";
import type { ClassDto, PaginatedResult } from "@/lib/data";

export interface ClassesSectionProps {
  initialData: PaginatedResult<ClassDto>;
  /** Server Action — layer 2 (React Query) calls the same cached fetcher as the initial SSR pass. */
  fetchClasses: (page: number) => Promise<PaginatedResult<ClassDto> | null>;
}

const EMPTY_PAGE: PaginatedResult<ClassDto> = { items: [], total: 0, page: 1, limit: 20 };

/**
 * The one client boundary for the classes list — owns pagination state and
 * useQuery. DataTable itself stays presentational/domain-agnostic.
 */
export function ClassesSection({ initialData, fetchClasses }: ClassesSectionProps) {
  const t = useTranslations("classes");
  const tCommon = useTranslations("dashboard.common");
  const [page, setPage] = useState(initialData.page);

  const { data } = useQuery({
    queryKey: ["classes", page],
    queryFn: () => fetchClasses(page),
    initialData: page === initialData.page ? initialData : undefined,
    staleTime: 30_000,
  });

  const result = data ?? EMPTY_PAGE;

  const columns: DataTableColumn<ClassDto>[] = useMemo(
    () => [{ key: "name", header: t("columnName"), render: (row) => row.name }],
    [t],
  );

  return (
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
  );
}
