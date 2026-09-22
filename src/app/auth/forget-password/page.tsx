"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

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
    <div className="flex min-h-screen w-full items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Forgot Password?
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
              Email Address
            </label>

            <input
              type="email"
              {...register("email")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-zinc-900 outline-none transition ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              }`}
              placeholder="alex@example.com"
            />

            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--board-ink)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--board-panel)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
          <p className="text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <a
              href="/auth/login"
              className="font-semibold text-[var(--board-ink)]"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
