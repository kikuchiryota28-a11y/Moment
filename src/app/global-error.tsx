"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[MOMENT Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-[100dvh] items-center justify-center px-6 bg-[var(--color-canvas)]">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Something went wrong</h1>
          <p className="mt-3 text-[var(--color-muted-ink)]">
            We couldn&apos;t load the application. Please try again or come back later.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={reset} variant="primary">
              Try again
            </Button>
            <Button onClick={() => window.location.href = "/"} variant="ghost">
              Go home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}