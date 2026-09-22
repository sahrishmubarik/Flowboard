// app/auth/verify-email/page.tsx
import { Suspense } from 'react';
import VerifyEmailContent from '@/components/VerifyEmailContent';

export default function VerifyEmailPage() {
  return (
    <main>
      {/* The Suspense boundary fixes the Next.js build error */}
      <Suspense fallback={<div>Loading verification screen...</div>}>
        <VerifyEmailContent/>
      </Suspense>
    </main>
  );
}
