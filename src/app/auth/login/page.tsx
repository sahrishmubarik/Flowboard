// app/auth/verify-email/page.tsx
import { Suspense } from 'react';

import LoginCard from '@/components/loginCard';
export default function login() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {/* The Suspense boundary fixes the Next.js build error */}
      <Suspense fallback={<div>Loading verification screen...</div>}>
        <LoginCard/>
      </Suspense>
    </main>
  );
}
