"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Suspense } from "react";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";
import AuthMobileLogo from "@/components/auth/AuthMobileLogo";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",

    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: ForgotPasswordInput) => {
      console.log(formData.email);
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "forgot-password",
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to send password reset email.");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(
        data.message ||
          "If this email exists, a password reset link has been sent.",
        "success",
      );
    },

    onError: (error) => {
      showToast(
        error.message || "Unable to send password reset email.",
        "error",
      );
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    mutation.mutate(data);
  };

  return (
    <main className="auth-page">
      <div className="auth-layout ">
        <AuthBrandPanel
          eyebrow="Account recovery"
          title="Get back to your sprint."
          description="Enter your email and we'll send you a secure link to choose a new password."
        />

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <AuthMobileLogo />

            {/* Heading */}
            <div>
              <h2 className="auth-title">Forgot your password?</h2>

              <p className="auth-subtitle">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            <Suspense>
              <form
                className="mt-6 space-y-5"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {/* Email */}
                <div>
                  <label htmlFor="forgot-email" className="fb-label">
                    Email address
                  </label>

                  <input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={`fb-input ${errors.email ? "fb-input-error" : ""}`}
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                  />

                  {errors.email && (
                    <p className="fb-error">{errors.email.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="btn-brand gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>

                {/* Back to Login */}
                <p className="text-center text-sm text-[var(--color-text-secondary)]">
                  Remember your password?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
