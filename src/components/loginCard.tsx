"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { loginSchema, LoginInput } from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import { useRouter, useSearchParams } from "next/navigation";

export default function LoginCard() {
  const { showToast } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),

    mode: "onBlur",

    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: LoginInput) => {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(data.message || "Login successful.", "success");

      // Return to invitation page if login
      // started from an invitation.
      if (redirect) {
        router.replace(redirect);
      } else {
        router.replace("/dashboard");
      }
    },

    onError: (error) => {
      showToast(error.message || "Login failed", "error");
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  const registerUrl = redirect
    ? `/auth/register?redirect=${encodeURIComponent(redirect)}`
    : "/auth/register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Get started with Flowboard
          </h2>
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

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
                  errors.password
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                }`}
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="h-4 w-4"
                />
              </button>
            </div>

            {errors.password && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <a
            href="/auth/forget-password"
            className="flex justify-end font-semibold text-[var(--board-ink)]"
          >
            Forget?
          </a>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--board-ink)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--board-panel)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Login account...</span>
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* Register */}
          <p className="text-center text-zinc-500">
            Do not have an account?{" "}
            <a
              href={registerUrl}
              className="font-semibold text-[var(--board-ink)]"
            >
              Signup
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
