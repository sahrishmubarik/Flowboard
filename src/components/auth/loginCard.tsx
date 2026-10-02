"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { loginSchema, LoginInput } from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faEnvelope,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

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

            <div>
              <h2 className="auth-title">Log in to Flowboard</h2>

              <p className="auth-subtitle">
                Use your work email or single sign-on.
              </p>
            </div>

            {/* Form */}

            <form className="mt-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}

              <div>
                <label className="fb-label">Work email</label>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    {...register("email")}
                    placeholder="you@company.com"
                    className={`fb-input pl-11 ${
                      errors.email ? "fb-input-error" : ""
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="fb-error">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}

              <div className="mt-6">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="mb-0 fb-label">Password</label>

                  <a href="/auth/forget-password" className="auth-forgot">
                    Forgot password?
                  </a>
                </div>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className={`fb-input pl-11 pr-11 ${
                      errors.password ? "fb-input-error" : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <FontAwesomeIcon
                      icon={showPassword ? faEyeSlash : faEye}
                      className="h-4 w-4"
                    />
                  </button>
                </div>

                {errors.password && (
                  <p className="fb-error">{errors.password.message}</p>
                )}
              </div>

              {/* Keep signed in */}

              <label className="mt-5 flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                <input type="checkbox" className="fb-checkbox" />

                <span>Keep me signed in</span>
              </label>

              {/* Submit */}

              <button
                type="submit"
                disabled={mutation.isPending}
                className="btn-brand mt-6"
              >
                {mutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <span>Log in</span>

                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="h-3.5 w-3.5"
                    />
                  </>
                )}
              </button>

              {/* Divider */}

              <div className="auth-divider">or</div>

              {/* Signup */}

              <p className="mt-6 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <a
                  href={registerUrl}
                  className="font-semibold text-[var(--indigo)] hover:text-[var(--indigo-deep)]"
                >
                  Sign up
                </a>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
