import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  DataTable,
  type DataTableColumn,
  type DataTablePaginationLabels,
} from "./DataTable";

interface Row {
  id: string;
  name: string;
}

const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", render: (row) => row.name },
];

const labels: DataTablePaginationLabels = {
  previous: "Previous",
  next: "Next",
  pageOf: (page, totalPages) => `Page ${page} of ${totalPages}`,
};

describe("DataTable", () => {
  it("shows the empty label when there are no rows", () => {
    render(
      <DataTable
        columns={columns}
        rows={[]}
        rowKey={(row) => row.id}
        page={1}
        limit={10}
        total={0}
        onPageChange={vi.fn()}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders column headers and row cells", () => {
    const rows: Row[] = [
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ];
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        page={1}
        limit={10}
        total={2}
        onPageChange={vi.fn()}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows the page summary and disables 'previous' on the first page", () => {
    const rows: Row[] = [{ id: "1", name: "Alice" }];
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        page={1}
        limit={1}
        total={3}
        onPageChange={vi.fn()}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("disables 'next' on the last page", () => {
    const rows: Row[] = [{ id: "3", name: "Cara" }];
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        page={3}
        limit={1}
        total={3}
        onPageChange={vi.fn()}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("calls onPageChange with the previous and next page numbers", () => {
    const onPageChange = vi.fn();
    const rows: Row[] = [{ id: "2", name: "Bob" }];
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        page={2}
        limit={1}
        total={3}
        onPageChange={onPageChange}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("treats zero total as a single page", () => {
    const rows: Row[] = [{ id: "1", name: "Alice" }];
    render(
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        page={1}
        limit={10}
        total={0}
        onPageChange={vi.fn()}
        emptyLabel="No results"
        labels={labels}
      />,
    );
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });
});
