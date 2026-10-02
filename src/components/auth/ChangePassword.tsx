"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";

import {
  changePasswordSchema,
  changePasswordInput,
} from "@/lib/validations/auth";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type ChangePasswordCardProps = {
  onClose: () => void;
};

export default function ChangePasswordCard({
  onClose,
}: ChangePasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<changePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: changePasswordInput) => {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "change-password",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password.");
      }

      return data;
    },

    onSuccess: () => {
      reset();

      // Small delay so user can see success state.
      setTimeout(() => {
        onClose();
      }, 1000);
    },
  });

  const onSubmit = (data: changePasswordInput) => {
    mutation.mutate(data);
  };

  return (
    <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--mist)] px-6 py-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
            <FontAwesomeIcon icon={faLock} className="h-5 w-5" />
          </div>

          {/* Heading */}
          <div>
            <h2
              className="text-xl font-medium tracking-tight text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Change your password
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              Choose a new password to keep your Flowboard account secure.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 p-6"
      >
        {/* New Password */}
        <div>
          <label
            htmlFor="change-password"
            className="mb-2 block text-sm font-medium text-[var(--ink)]"
          >
            New password
          </label>

          <div className="relative">
            <input
              id="change-password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your new password"
              autoComplete="new-password"
              disabled={mutation.isPending}
              className={`w-full rounded-xl border bg-[var(--paper)] px-4 py-3 pr-12 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:bg-white focus:ring-4 ${
                errors.password
                  ? "border-[var(--coral)] focus:border-[var(--coral)] focus:ring-[var(--coral)]/[0.08]"
                  : "border-[var(--mist)] focus:border-[var(--indigo)] focus:ring-[var(--indigo)]/[0.08]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              disabled={mutation.isPending}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] disabled:cursor-not-allowed"
              aria-label={
                showPassword ? "Hide new password" : "Show new password"
              }
            >
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="h-4 w-4"
              />
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-[var(--coral)]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="change-confirm-password"
            className="mb-2 block text-sm font-medium text-[var(--ink)]"
          >
            Confirm password
          </label>

          <div className="relative">
            <input
              id="change-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Enter your password again"
              autoComplete="new-password"
              disabled={mutation.isPending}
              className={`w-full rounded-xl border bg-[var(--paper)] px-4 py-3 pr-12 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:bg-white focus:ring-4 ${
                errors.confirmPassword
                  ? "border-[var(--coral)] focus:border-[var(--coral)] focus:ring-[var(--coral)]/[0.08]"
                  : "border-[var(--mist)] focus:border-[var(--indigo)] focus:ring-[var(--indigo)]/[0.08]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              disabled={mutation.isPending}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)] disabled:cursor-not-allowed"
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEyeSlash : faEye}
                className="h-4 w-4"
              />
            </button>
          </div>

          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-[var(--coral)]">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Success */}
        {mutation.isSuccess && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--sage)]/30 bg-[var(--sage)]/[0.08] px-4 py-3">
            <span className="mt-0.5 text-[var(--sage)]">✓</span>

            <div>
              <p className="text-sm font-medium text-[var(--ink)]">
                Password changed successfully.
              </p>

              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                Your new password is now active.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {mutation.isError && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
            <span className="mt-0.5 text-[var(--coral)]">!</span>

            <p className="text-sm text-[var(--ink)]">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Something went wrong."}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--mist)] pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-5 py-3 text-sm font-medium text-[var(--ink-soft)] transition-all hover:border-[var(--board-line)] hover:bg-white hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex min-w-[155px] items-center justify-center rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--board-ink)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <LoadingSpinner size="sm" />

                <span className="ml-2">Updating...</span>
              </>
            ) : (
              "Change password"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
