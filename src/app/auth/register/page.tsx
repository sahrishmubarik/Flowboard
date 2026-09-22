// app/auth/verify-email/page.tsx
import { Suspense } from 'react';

import RegisterCard from '@/components/RegisterCard';
export default function register() {
  return (
    <main>
      {/* The Suspense boundary fixes the Next.js build error */}
      <Suspense fallback={<div>Loading verification screen...</div>}>
        <RegisterCard/>
      </Suspense>
    </main>
  );
}
