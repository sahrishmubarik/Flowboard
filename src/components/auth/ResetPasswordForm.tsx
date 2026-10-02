"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import {
  resetPasswordFormSchema,
  ResetPasswordFormInput,
} from "@/lib/validations/auth";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function ResetPasswordPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onBlur",

    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: ResetPasswordFormInput) => {
      if (!token) {
        throw new Error("Invalid or missing reset token.");
      }

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "reset-password",
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed.");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(
        data.message || "Password reset successfully. You can now login.",
        "success",
      );

      setTimeout(() => {
        router.push("/auth/login");
      }, 1000);
    },

    onError: (error) => {
      showToast(error.message || "Password reset failed.", "error");
    },
  });

  const onSubmit = (data: ResetPasswordFormInput) => {
    mutation.mutate(data);
  };

  return (
    <>
      <main>
        <section>
          {/* Heading */}
          <div className="reset-heading">
            <h1 style={{ color: "var(--color-text-primary)" }}>
              Reset your password
            </h1>

            <p className=" text-[var(--color-text-secondary)]">
              Choose a new password for your Flowboard account.
            </p>
          </div>

          {/* Invalid Token */}
          {!token && (
            <div
              className="reset-alert"
              style={{
                backgroundColor: "var(--color-tag-red-bg)",
                borderColor: "var(--color-priority-high)",
                color: "var(--color-tag-red-text)",
              }}
            >
              <p style={{ color: "var(--color-tag-red-text)" }}>
                This password reset link is invalid or has expired.
              </p>
            </div>
          )}

          {/* Form */}
          <form
            className="reset-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/* New Password */}
            <div className="form-field">
              <label
                htmlFor="password"
                className="form-label"
                style={{ color: "var(--color-text-primary)" }}
              >
                New password
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  className={`form-input ${
                    errors.password ? "input-error" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--color-card-bg)",
                    color: "var(--color-text-primary)",
                    borderColor: errors.password
                      ? "var(--color-priority-high)"
                      : "var(--color-border)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="password-toggle"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                  aria-label={
                    showPassword ? "Hide new password" : "Show new password"
                  }
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>

              {errors.password && (
                <p
                  className="form-error"
                  style={{ color: "var(--color-priority-high)" }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-field">
              <label
                htmlFor="confirmPassword"
                className="form-label"
                style={{ color: "var(--color-text-primary)" }}
              >
                Confirm password
              </label>

              <div className="password-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword")}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  className={`form-input ${
                    errors.confirmPassword ? "input-error" : ""
                  }`}
                  style={{
                    backgroundColor: "var(--color-card-bg)",
                    color: "var(--color-text-primary)",
                    borderColor: errors.confirmPassword
                      ? "var(--color-priority-high)"
                      : "var(--color-border)",
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="password-toggle"
                  style={{
                    color: "var(--color-text-muted)",
                  }}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>

              {errors.confirmPassword && (
                <p
                  className="form-error"
                  style={{ color: "var(--color-priority-high)" }}
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={mutation.isPending || !token}
              className="reset-submit"
              style={{
                backgroundColor: "var(--color-primary)",
                color: "#ffffff",
              }}
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Resetting password...</span>
                </>
              ) : (
                "Reset password"
              )}
            </button>

            {/* Login */}
            <p
              className="reset-footer"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Remember your password?{" "}
              <a
                href="/auth/login"
                style={{
                  color: "var(--color-primary)",
                }}
              >
                Sign in
              </a>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
