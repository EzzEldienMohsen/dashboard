"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { FormField } from "@/components/molecules/FormField";
import { RoleToggle } from "@/components/molecules/RoleToggle";
import { TextInput } from "@/components/atoms/TextInput";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { Button } from "@/components/atoms/Button";
import { ErrorText } from "@/components/atoms/ErrorText";
import { fieldInputBaseClassName } from "@/components/atoms/field-input";
import type { AuthActionState } from "@/app/(auth)/action-state";
import type { CountryOption } from "@/lib/countries";

/**
 * Code-split: neither component is needed for the initial critical fields
 * (name/email/phone/password), so their client JS loads as separate chunks
 * instead of inflating RegisterForm's main bundle. Both keep ssr:true (the
 * default) so the no-JS/slow-JS HTML output — and progressive enhancement
 * via the Server Action — stays intact; only the hydration JS is deferred.
 */
const CountrySelect = dynamic(
  () => import("@/components/molecules/CountrySelect").then((m) => m.CountrySelect),
  {
    loading: () => (
      <div className={fieldInputBaseClassName} aria-hidden="true">
        Loading countries…
      </div>
    ),
  },
);

const PasswordStrengthHint = dynamic(
  () =>
    import("@/components/molecules/PasswordStrengthHint").then(
      (m) => m.PasswordStrengthHint,
    ),
  { loading: () => <div className="h-24" aria-hidden="true" /> },
);

export interface RegisterFormProps {
  action: (
    prevState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  initialState: AuthActionState;
  countryOptions: CountryOption[];
}

export function RegisterForm({
  action,
  initialState,
  countryOptions,
}: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-field-gap" noValidate>
      <FormField name="role" label="I am a" error={state.fieldErrors?.role} required>
        <RoleToggle />
      </FormField>

      <FormField name="name" label="Full name" error={state.fieldErrors?.name} required>
        <TextInput id="name" name="name" autoComplete="name" placeholder="Jane Doe" />
      </FormField>

      <FormField name="email" label="Email" error={state.fieldErrors?.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
      </FormField>

      <FormField name="phone" label="Phone" error={state.fieldErrors?.phone} required>
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 000 1234"
        />
      </FormField>

      <FormField
        name="country"
        label="Country"
        error={state.fieldErrors?.country}
        required
      >
        <CountrySelect options={countryOptions} />
      </FormField>

      <FormField
        name="password"
        label="Password"
        error={state.fieldErrors?.password}
        required
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>
      <PasswordStrengthHint password={password} />

      <FormField
        name="confirmPassword"
        label="Confirm password"
        error={state.fieldErrors?.confirmPassword}
        required
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
        />
      </FormField>

      <ErrorText message={state.formError} />

      <Button type="submit" isLoading={pending}>
        Create account
      </Button>
    </form>
  );
}
