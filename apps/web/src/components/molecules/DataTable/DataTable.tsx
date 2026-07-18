import { memo, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export interface DataTablePaginationLabels {
  previous: string;
  next: string;
  pageOf: (page: number, totalPages: number) => string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  emptyLabel: string;
  labels: DataTablePaginationLabels;
}

/**
 * Generic, reusable across classes/students — no domain knowledge, no
 * i18n import (labels are passed in). Not its own client boundary: only
 * ever rendered inside an already-"use client" section component.
 */
function DataTableInner<T>({
  columns,
  rows,
  rowKey,
  page,
  limit,
  total,
  onPageChange,
  emptyLabel,
  labels,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (rows.length === 0) {
    return <p className="py-12 text-center text-base-content/50">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-2xl border border-base-300">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-small text-base-content/60">
          {labels.pageOf(page, totalPages)}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="w-auto"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {labels.previous}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-auto"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {labels.next}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * `memo` erases the generic signature, so it's cast back via `typeof` —
 * the standard pattern for memoizing a generic component in TS.
 */
export const DataTable = memo(DataTableInner) as typeof DataTableInner;
