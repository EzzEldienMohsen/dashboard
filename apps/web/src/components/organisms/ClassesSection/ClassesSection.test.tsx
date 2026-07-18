import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClassesSection } from "./ClassesSection";
import type { ClassDto, PaginatedResult } from "@/lib/data";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const initialData: PaginatedResult<ClassDto> = {
  items: [{ id: "class-1", name: "Grade 5-A", schoolId: "school-1" }],
  total: 1,
  page: 1,
  limit: 20,
};

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("ClassesSection", () => {
  it("renders initialData immediately, without waiting on the fetch action", () => {
    const fetchClasses = vi.fn(() => new Promise<never>(() => {})); // never resolves

    renderWithQueryClient(
      <ClassesSection initialData={initialData} fetchClasses={fetchClasses} />,
    );

    expect(screen.getByText("Grade 5-A")).toBeInTheDocument();
  });

  it("passes the current page to the fetch action on page change", async () => {
    const fetchClasses = vi.fn().mockResolvedValue(initialData);
    const twoPageData: PaginatedResult<ClassDto> = { ...initialData, total: 40 };

    renderWithQueryClient(
      <ClassesSection initialData={twoPageData} fetchClasses={fetchClasses} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "next" }));

    await waitFor(() => expect(fetchClasses).toHaveBeenCalledWith(2));
  });
});
