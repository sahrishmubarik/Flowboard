import { Suspense } from "react";

import LoginCard from "@/components/auth/loginCard";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-page flex min-h-screen items-center justify-center">
          <p className="text-sm text-[var(--ink-soft)]">Loading...</p>
        </main>
      }
    >
      <LoginCard />
    </Suspense>
  );
}
