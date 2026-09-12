
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  registerSchema,
  RegisterInput,
} from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),

    // Validate when user leaves an input
    mode: "onBlur",

    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: RegisterInput) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Registration failed"
        );
      }

      return data;
    },

  onSuccess: (data) => {
  showToast(
    data.message ||
      "Please check your email to verify your account.",
    "success"
  );

  router.push("/auth/verify-email");
},
   
onError: (error) => {
      showToast(
        error.message || "Registration failed",
        "error"
      );
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-md">

        {/* Heading */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Create an Account
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Get started with Flowboard
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
              Full Name
            </label>

            <input
              type="text"
              {...register("name")}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-zinc-900 outline-none transition ${
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              }`}
              placeholder="Alex Mercer"
            />

            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

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
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <FontAwesomeIcon
                  icon={
                    showPassword
                      ? faEyeSlash
                      : faEye
                  }
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

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-xs font-medium tracking-wider text-zinc-600">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                {...register("confirmPassword")}
                className={`w-full rounded-lg border py-2.5 pl-4 pr-10 text-sm text-zinc-900 outline-none transition ${
                  errors.confirmPassword
                    ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    : "border-zinc-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                }`}
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) => !prev
                  )
                }
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-zinc-400 hover:text-zinc-600"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <FontAwesomeIcon
                  icon={
                    showConfirmPassword
                      ? faEyeSlash
                      : faEye
                  }
                  className="h-4 w-4"
                />
              </button>
            </div>

            {errors.confirmPassword && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.confirmPassword.message}
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
                <span>Registering account...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Login */}
          <p className="text-center text-zinc-500">
            Already have an account?{" "}

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

