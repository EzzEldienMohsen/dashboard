"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/molecules/FormField";
import { RoleToggle } from "@/components/molecules/RoleToggle";
import { TextInput } from "@/components/atoms/TextInput";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { Button } from "@/components/atoms/Button";
import { ErrorText } from "@/components/atoms/ErrorText";
import { fieldInputBaseClassName } from "@/components/atoms/field-input";
import type { AuthActionState } from "@/app/[locale]/(auth)/action-state";
import type { CountryOption } from "@/lib/countries";

/**
 * A named component (not an inline arrow) so it can call useTranslations()
 * itself — next/dynamic's `loading` option renders it as a real component,
 * and hooks only require being inside a component's render, not being
 * declared inside RegisterForm specifically.
 */
function CountrySelectLoading() {
  const t = useTranslations("auth.register");
  return (
    <div className={fieldInputBaseClassName} aria-hidden="true">
      {t("loadingCountries")}
    </div>
  );
}

/**
 * Code-split: neither component is needed for the initial critical fields
 * (name/email/phone/password), so their client JS loads as separate chunks
 * instead of inflating RegisterForm's main bundle. Both keep ssr:true (the
 * default) so the no-JS/slow-JS HTML output — and progressive enhancement
 * via the Server Action — stays intact; only the hydration JS is deferred.
 */
const CountrySelect = dynamic(
  () => import("@/components/molecules/CountrySelect").then((m) => m.CountrySelect),
  { loading: CountrySelectLoading },
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
  const t = useTranslations("auth.register");

  return (
    <form action={formAction} className="flex flex-col gap-field-gap" noValidate>
      <FormField name="role" label={t("roleLabel")} error={state.fieldErrors?.role} required>
        <RoleToggle />
      </FormField>

      <FormField name="name" label={t("nameLabel")} error={state.fieldErrors?.name} required>
        <TextInput
          id="name"
          name="name"
          autoComplete="name"
          placeholder={t("namePlaceholder")}
        />
      </FormField>

      <FormField name="email" label={t("emailLabel")} error={state.fieldErrors?.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
      </FormField>

      <FormField name="phone" label={t("phoneLabel")} error={state.fieldErrors?.phone} required>
        <TextInput
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
        />
      </FormField>

      <FormField
        name="country"
        label={t("countryLabel")}
        error={state.fieldErrors?.country}
        required
      >
        <CountrySelect options={countryOptions} placeholder={t("countryPlaceholder")} />
      </FormField>

      <FormField
        name="password"
        label={t("passwordLabel")}
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
        label={t("confirmPasswordLabel")}
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
        {t("submit")}
      </Button>
    </form>
  );
}
