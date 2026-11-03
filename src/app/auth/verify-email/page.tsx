import { Suspense } from "react";
import VerifyEmailContent from "@/components/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <main>
      {/* The Suspense boundary fixes the Next.js build error */}
      <Suspense
        fallback={
          <div className="auth-page flex min-h-screen items-center justify-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Loading...
            </p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
