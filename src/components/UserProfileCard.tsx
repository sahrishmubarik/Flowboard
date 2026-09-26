"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faLock,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import {
  changePasswordSchema,
  changePasswordInput,
} from "@/lib/validations/auth";

import LoadingSpinner from "@/components/ui/LoadingSpinner";

type User = {
  id: string;
  name: string;
  email: string;
};

type UserProfileCardProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
};

export default function UserProfileCard({
  isOpen,
  onClose,
  user,
  onLogout,
}: UserProfileCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  if (!isOpen || !user) {
    return null;
  }

  const handleChangePassword = async (formData: changePasswordInput) => {
    setMessage("");
    setError("");

    try {
      setLoading(true);

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

      setMessage(data.message || "Password changed successfully.");

      reset();

      setTimeout(() => {
        setChangePasswordOpen(false);
        setMessage("");
      }, 1200);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChangePasswordOpen(false);
    setMessage("");
    setError("");
    reset();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Card */}
      <section
        className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-32px)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[var(--mist)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
              </div>

              <div>
                <h2
                  className="text-xl font-medium tracking-tight text-[var(--ink)]"
                  style={{
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {changePasswordOpen ? "Change password" : "Your account"}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                  {changePasswordOpen
                    ? "Update your password securely."
                    : "Manage your Flowboard account."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
              aria-label="Close account"
            >
              ×
            </button>
          </div>
        </div>

        {!changePasswordOpen ? (
          <>
            {/* Account information */}
            <div className="space-y-5 p-6">
              {/* Profile */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  Account
                </p>

                <div className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--board-panel)] text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {user.name}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-[var(--ink-soft)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-medium text-[var(--ink)]"
                >
                  Name
                </label>

                <input
                  id="profile-name"
                  value={user.name}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink-soft)] outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-medium text-[var(--ink)]"
                >
                  Email address
                </label>

                <input
                  id="profile-email"
                  value={user.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink-soft)] outline-none"
                />
              </div>

              {/* Security */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  Security
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(true);
                    setMessage("");
                    setError("");
                  }}
                  className="flex w-full items-center gap-4 rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3.5 text-left transition-all hover:border-[var(--indigo)]/30 hover:bg-white"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)]/[0.08] text-[var(--indigo)]">
                    <FontAwesomeIcon icon={faLock} className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--ink)]">
                      Change password
                    </p>

                    <p className="mt-0.5 text-xs text-[var(--ink-soft)]">
                      Update your account password
                    </p>
                  </div>

                  <span className="text-lg text-[var(--ink-soft)]">→</span>
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-[var(--mist)] pt-5">
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.06] px-5 py-3 text-sm font-medium text-[var(--coral)] transition-all hover:bg-[var(--coral)]/[0.1]"
                >
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    className="h-4 w-4"
                  />
                  Sign out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Change password */}
            <form
              onSubmit={handleSubmit(handleChangePassword)}
              noValidate
              className="space-y-5 p-6"
            >
              {/* New password */}
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
                    className={`w-full rounded-xl border bg-[var(--paper)] px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:bg-white focus:ring-4 ${
                      errors.password
                        ? "border-[var(--coral)] focus:border-[var(--coral)] focus:ring-[var(--coral)]/[0.08]"
                        : "border-[var(--mist)] focus:border-[var(--indigo)] focus:ring-[var(--indigo)]/[0.08]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
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
                  <p className="mt-1.5 text-xs font-medium text-[var(--coral)]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
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
                    className={`w-full rounded-xl border bg-[var(--paper)] px-4 py-3 pr-11 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:bg-white focus:ring-4 ${
                      errors.confirmPassword
                        ? "border-[var(--coral)] focus:border-[var(--coral)] focus:ring-[var(--coral)]/[0.08]"
                        : "border-[var(--mist)] focus:border-[var(--indigo)] focus:ring-[var(--indigo)]/[0.08]"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
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

              {/* Feedback */}
              {message && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--sage)]/30 bg-[var(--sage)]/[0.08] px-4 py-3">
                  <span className="mt-0.5 text-[var(--sage)]">✓</span>

                  <p className="text-sm text-[var(--ink)]">{message}</p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
                  <span className="mt-0.5 text-[var(--coral)]">!</span>

                  <p className="text-sm text-[var(--ink)]">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 border-t border-[var(--mist)] pt-5">
                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(false);
                    setError("");
                    setMessage("");
                    reset();
                  }}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)]"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-w-[160px] items-center justify-center rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--board-ink)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    "Update password"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </>
  );
}
