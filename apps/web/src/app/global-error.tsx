"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "route",
      message: "global-error-boundary-triggered",
      level: "error",
      data: { digest: error.digest },
    });
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "4%",
            fontFamily: "Arial, Helvetica, sans-serif",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
              Something went wrong
            </h1>
            <p style={{ marginTop: "0.5rem", color: "#52525b" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{
                marginTop: "1.5rem",
                padding: "0.625rem 1.5rem",
                borderRadius: "0.625rem",
                background: "#4f46e5",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
