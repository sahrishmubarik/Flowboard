"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError(true);
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
       const response = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "verify-email",
        token,
      }),
    });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Email verification failed."
          );
        }

        setMessage(data.message);

        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (error) {
        setError(true);

        setMessage(
          error instanceof Error
            ? error.message
            : "Email verification failed."
        );
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-md">

        {!error && (
          <div className="mb-4 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-zinc-900">
          {error
            ? "Verification Failed"
            : "Verify Your Email"}
        </h1>

        <p
          className={`mt-3 text-sm ${
            error
              ? "text-red-600"
              : "text-zinc-500"
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}