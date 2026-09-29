"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  forgotPasswordSchema,
  ForgotPasswordInput,
} from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

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
        <section className="auth-brand-panel flex justify-center items-center">
          {/* Logo */}
          <div className="px-8 py-3 ml-[-460px]">
            <a href="/" className="brand-logo ">
              <span className="brand-logo-mark">F</span>

              <span className="brand-logo-name">Flowboard</span>
            </a>
          </div>

          {/* Brand Content */}

          <div className="flex flex-1 items-center px-8 pb-12">
            <div className="w-full max-w-[610px]">
              <span className="auth-eyebrow">Welcome back</span>

              <h1 className="auth-brand-title">Your sprint is waiting.</h1>

              <p className="auth-brand-description">
                Pick up exactly where you left off — every issue, comment and
                task stays organized in one place.
              </p>

              {/* Board preview */}

              <div className="auth-board">
                <div className="auth-board-grid">
                  {/* Open */}

                  <div>
                    <p className="auth-board-column-title">Open&nbsp; 6</p>

                    <div className="auth-task">
                      <p className="auth-task-id">WEB-151</p>

                      <p className="auth-task-title">Breadcrumb navigation</p>
                    </div>

                    <div className="auth-task">
                      <p className="auth-task-id">WEB-155</p>

                      <p className="auth-task-title">
                        Footer misaligned on Safari
                      </p>
                    </div>
                  </div>

                  {/* In progress */}

                  <div>
                    <p className="auth-board-column-title">
                      In Progress&nbsp; 5
                    </p>

                    <div className="auth-task">
                      <p className="auth-task-id">WEB-142</p>

                      <p className="auth-task-title">Responsive navbar</p>
                    </div>

                    <div className="auth-task">
                      <p className="auth-task-id">WEB-147</p>

                      <p className="auth-task-title">SVG icon sprite</p>
                    </div>
                  </div>

                  {/* Testing */}

                  <div>
                    <p className="auth-board-column-title">Testing&nbsp; 2</p>

                    <div className="auth-task">
                      <p className="auth-task-id">WEB-133</p>

                      <p className="auth-task-title">
                        Checkout fails on empty coupon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}

        <section className="auth-form-panel">
          <div className="auth-form-container">
            {/* Heading */}
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-5">
                Forgot Password?
              </h2>

              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            <Suspense>
              <form
                className="space-y-5"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                {/* Email */}
                <div>
                  <label className="mb-1 block text-xs font-medium tracking-wider text-[var(--color-text-secondary)]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    {...register("email")}
                    className={`w-full rounded-lg border bg-[var(--color-card-bg)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition ${
                      errors.email
                        ? "border-[var(--color-priority-high)] focus:border-[var(--color-priority-high)] focus:ring-1 focus:ring-[var(--color-priority-high)]"
                        : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    }`}
                    placeholder="alex@example.com"
                  />

                  {errors.email && (
                    <p className="mt-1 text-xs font-medium text-[var(--color-priority-high)]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {mutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Back to Login */}
                <p className=" text-sm text-[var(--color-text-secondary)]">
                  Remember your password?{" "}
                  <a
                    href="/auth/login"
                    className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                  >
                    Login
                  </a>
                </p>
              </form>
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
