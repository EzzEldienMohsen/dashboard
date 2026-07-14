"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/molecules/FormField";
import { TextInput } from "@/components/atoms/TextInput";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import { Button } from "@/components/atoms/Button";
import { ErrorText } from "@/components/atoms/ErrorText";
import type { AuthActionState } from "@/app/(auth)/action-state";

export interface LoginFormProps {
  action: (
    prevState: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  initialState: AuthActionState;
}

/**
 * Depends on `action` as an injected abstraction, not an imported concrete
 * Server Action — keeps the organism swappable/testable in isolation.
 */
export function LoginForm({ action, initialState }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const t = useTranslations("auth.login");

  return (
    <form action={formAction} className="flex flex-col gap-field-gap" noValidate>
      <FormField name="email" label={t("emailLabel")} error={state.fieldErrors?.email} required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
      </FormField>

      <FormField
        name="password"
        label={t("passwordLabel")}
        error={state.fieldErrors?.password}
        required
      >
        <PasswordInput id="password" name="password" autoComplete="current-password" />
      </FormField>

      <ErrorText message={state.formError} />

      <Button type="submit" isLoading={pending}>
        {t("submit")}
      </Button>
    </form>
  );
}
