import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormField } from "./FormField";

interface ProbeProps {
  id?: string;
  name?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
}

function Probe({ invalid, ...rest }: ProbeProps) {
  return <input data-testid="probe" data-invalid={invalid ? "true" : "false"} {...rest} />;
}

describe("FormField", () => {
  it("injects id, name, and htmlFor so the label targets the child input", () => {
    render(
      <FormField name="email" label="Email">
        <Probe />
      </FormField>,
    );

    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email");

    const probe = screen.getByTestId("probe");
    expect(probe).toHaveAttribute("id", "email");
    expect(probe).toHaveAttribute("name", "email");
  });

  it("does not wire aria-describedby or invalid when there is no error", () => {
    render(
      <FormField name="email" label="Email">
        <Probe />
      </FormField>,
    );

    const probe = screen.getByTestId("probe");
    expect(probe).not.toHaveAttribute("aria-describedby");
    expect(probe).toHaveAttribute("data-invalid", "false");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("wires aria-describedby and marks the child invalid when there is an error", () => {
    render(
      <FormField name="email" label="Email" error="Required">
        <Probe />
      </FormField>,
    );

    const probe = screen.getByTestId("probe");
    expect(probe).toHaveAttribute("aria-describedby", "email-error");
    expect(probe).toHaveAttribute("data-invalid", "true");

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "email-error");
    expect(alert).toHaveTextContent("Required");
  });

  it("renders a required marker when required is true", () => {
    render(
      <FormField name="email" label="Email" required>
        <Probe />
      </FormField>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("clicking the label activates the child input (native for/id delegation)", () => {
    render(
      <FormField name="agree" label="Agree">
        <input type="checkbox" />
      </FormField>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(screen.getByText("Agree"));

    expect(checkbox).toBeChecked();
  });
});
