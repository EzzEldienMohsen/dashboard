import * as Sentry from "@sentry/nextjs";

const AUTH_ACTION_PATHS = ["/login", "/register"];

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
      beforeSend(event) {
        const isAuthRoute = AUTH_ACTION_PATHS.some((path) =>
          event.request?.url?.includes(path),
        );
        if (isAuthRoute && event.request) {
          delete event.request.data;
        }
        return event;
      },
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      sendDefaultPii: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
