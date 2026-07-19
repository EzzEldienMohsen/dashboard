import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CountrySelect } from "./CountrySelect";

const options = [
  { code: "EG", value: "Egypt", label: "Egypt" },
  { code: "US", value: "United States", label: "United States" },
];

describe("CountrySelect", () => {
  it("renders the placeholder and every country option", () => {
    render(<CountrySelect options={options} placeholder="Select a country" />);
    expect(screen.getByRole("option", { name: "Select a country" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Egypt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "United States" })).toBeInTheDocument();
  });

  it("defaults id and name to 'country'", () => {
    render(<CountrySelect options={options} placeholder="Select a country" />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "country");
    expect(select).toHaveAttribute("name", "country");
  });

  it("uses custom id and name when provided", () => {
    render(
      <CountrySelect
        options={options}
        placeholder="Select a country"
        id="birth-country"
        name="birthCountry"
      />,
    );
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("id", "birth-country");
    expect(select).toHaveAttribute("name", "birthCountry");
  });

  it("updates its value when a country is selected", () => {
    render(<CountrySelect options={options} placeholder="Select a country" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "United States" } });
    expect(select.value).toBe("United States");
  });

  it("applies a defaultValue", () => {
    render(
      <CountrySelect
        options={options}
        placeholder="Select a country"
        defaultValue="Egypt"
      />,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("Egypt");
  });

  it("submits the stable option.value even when the display label is localized", () => {
    const localizedOptions = [{ code: "EG", value: "Egypt", label: "مصر" }];
    render(<CountrySelect options={localizedOptions} placeholder="Select a country" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "Egypt" } });
    expect(select.value).toBe("Egypt");
    expect(screen.getByRole("option", { name: "مصر" })).toBeInTheDocument();
  });

  it("applies invalid styling and aria-invalid when invalid", () => {
    render(<CountrySelect options={options} placeholder="Select a country" invalid />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });
});
