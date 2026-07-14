import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  beforeBreadcrumb(breadcrumb, hint) {
    const isSensitiveUiEvent =
      breadcrumb.category === "ui.input" || breadcrumb.category === "ui.click";
    if (!isSensitiveUiEvent) return breadcrumb;

    const target = hint?.event?.target as HTMLElement | undefined;
    const isPasswordField =
      target?.getAttribute?.("type") === "password" ||
      ["password", "confirmPassword"].includes(target?.getAttribute?.("name") ?? "");

    return isPasswordField ? null : breadcrumb;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
