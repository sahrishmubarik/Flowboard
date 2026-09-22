// app/auth/verify-email/page.tsx
import { Suspense } from 'react';

import LoginCard from '@/components/loginCard';
export default function login() {
  return (
    <main >
      {/* The Suspense boundary fixes the Next.js build error */}
      <Suspense fallback={<div>Loading login card...</div>}>
        <LoginCard/>
      </Suspense>
    </main>
  );
}

