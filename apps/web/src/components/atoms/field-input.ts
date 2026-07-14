import type { ChangeEventHandler, FocusEventHandler } from "react";

/**
 * Shared contract for every field-input atom (TextInput, PasswordInput, ...).
 * Any component implementing this interface is interchangeable wherever a
 * BaseFieldInputProps consumer (e.g. FormField) is expected — substituting
 * one for the other never widens preconditions or narrows postconditions.
 */
export interface BaseFieldInputProps {
  id: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  invalid?: boolean;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  "aria-describedby"?: string;
}

export const fieldInputBaseClassName =
  "w-full rounded-field border bg-base-100 px-3.5 py-2.5 text-body text-base-content outline-none transition-colors placeholder:text-base-content/40 focus:border-primary focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";
