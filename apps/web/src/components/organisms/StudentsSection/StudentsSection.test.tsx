import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StudentsSection } from "./StudentsSection";
import type { ClassDto, PaginatedResult, StudentDto } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@sentry/nextjs", () => ({ addBreadcrumb: vi.fn() }));

const classOptions: ClassDto[] = [
  { id: "class-1", name: "Grade 5-A", schoolId: "school-1" },
  { id: "class-2", name: "Grade 6-B", schoolId: "school-1" },
];

const initialData: PaginatedResult<StudentDto> = {
  items: [{ id: "s1", firstName: "Amy", lastName: "Lee", classId: "class-1" }],
  total: 1,
  page: 1,
  limit: 20,
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("StudentsSection", () => {
  it("renders initialData rows with the class name resolved from classOptions, without waiting on the fetch", () => {
    const fetchStudents = vi.fn(() => new Promise<never>(() => {})); // never resolves

    renderWithQueryClient(
      <StudentsSection
        initialData={initialData}
        classOptions={classOptions}
        fetchStudents={fetchStudents}
      />,
    );

    expect(screen.getByText("Amy")).toBeInTheDocument();
    expect(screen.getByText("Lee")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Grade 5-A" })).toBeInTheDocument();
  });

  it("links the student's first name to their detail page", () => {
    const fetchStudents = vi.fn(() => new Promise<never>(() => {}));

    renderWithQueryClient(
      <StudentsSection
        initialData={initialData}
        classOptions={classOptions}
        fetchStudents={fetchStudents}
      />,
    );

    expect(screen.getByRole("link", { name: "Amy" })).toHaveAttribute(
      "href",
      "/dashboard/students/s1",
    );
  });

  it("passes the current page to fetchStudents on page change", async () => {
    const fetchStudents = vi.fn().mockResolvedValue(initialData);
    const twoPageData: PaginatedResult<StudentDto> = { ...initialData, total: 40 };

    renderWithQueryClient(
      <StudentsSection
        initialData={twoPageData}
        classOptions={classOptions}
        fetchStudents={fetchStudents}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "next" }));

    await waitFor(() => expect(fetchStudents).toHaveBeenCalledWith(2, undefined));
  });

  it("filters by class, resets to page 1, and calls fetchStudents with the selected classId", async () => {
    const fetchStudents = vi.fn().mockResolvedValue(initialData);

    renderWithQueryClient(
      <StudentsSection
        initialData={initialData}
        classOptions={classOptions}
        fetchStudents={fetchStudents}
      />,
    );

    fireEvent.change(screen.getByLabelText("filterByClass"), {
      target: { value: "class-2" },
    });

    await waitFor(() => expect(fetchStudents).toHaveBeenCalledWith(1, "class-2"));
  });

  it("falls back to the raw classId when it has no match in classOptions", () => {
    const fetchStudents = vi.fn(() => new Promise<never>(() => {}));
    const dataWithUnknownClass: PaginatedResult<StudentDto> = {
      items: [{ id: "s2", firstName: "Sam", lastName: "Cole", classId: "unknown-class" }],
      total: 1,
      page: 1,
      limit: 20,
    };

    renderWithQueryClient(
      <StudentsSection
        initialData={dataWithUnknownClass}
        classOptions={classOptions}
        fetchStudents={fetchStudents}
      />,
    );

    expect(screen.getByText("unknown-class")).toBeInTheDocument();
  });
});
