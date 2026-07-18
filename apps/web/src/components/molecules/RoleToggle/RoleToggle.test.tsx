import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormField } from "@/components/molecules/FormField";
import { RoleToggle } from "./RoleToggle";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("RoleToggle", () => {
  it("gives the first radio the id FormField injects, so the label can focus it", () => {
    render(
      <FormField name="role" label="Role">
        <RoleToggle />
      </FormField>,
    );

    const label = screen.getByText("Role");
    expect(label).toHaveAttribute("for", "role");

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("id", "role");
  });

  it("clicking the FormField label activates the first radio (LSP regression)", () => {
    render(
      <FormField name="role" label="Role">
        <RoleToggle />
      </FormField>,
    );

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked();

    // Native <label for="role"> delegates activation to the element with
    // id="role" — before the fix that element was the non-focusable
    // radiogroup div, so this click was a no-op.
    fireEvent.click(screen.getByText("Role"));

    expect(radios[0]).toBeChecked();
  });
});
