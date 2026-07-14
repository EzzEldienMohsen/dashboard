"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Title } from "@/components/atoms/Title";
import { Subtitle } from "@/components/atoms/Subtitle";
import { Button } from "@/components/atoms/Button";

export default function AuthError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-neutral-100 px-[4%] py-12">
      <div
        className="flex w-full flex-col items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-[6%] text-center shadow-sm"
        style={{ maxWidth: "min(92%, 28rem)" }}
      >
        <Title as="h1">Something went wrong</Title>
        <Subtitle as="p">
          We couldn&apos;t load this form. Please try again.
        </Subtitle>
        <Button onClick={() => unstable_retry()} className="w-auto px-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
