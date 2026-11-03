"use client";

import { useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  X,
} from "lucide-react";

import {
  changePasswordSchema,
  changePasswordInput,
} from "@/lib/validations/auth";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { modalButtonClass, useModalBehavior } from "@/components/ui/Modal";

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  return (
    parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts.at(-1)![0]
  ).toUpperCase();
}

const sectionLabelClass =
  "mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]";

type MaterialFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
  // Rendered inside the field on the right, e.g. a show-password toggle.
  trailing?: ReactNode;
};

// Material-style outlined field: the label sits inside the box and floats
// onto the border when the field is focused or has a value.
function MaterialField({
  id,
  label,
  error,
  trailing,
  readOnly,
  className = "",
  ...inputProps
}: MaterialFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <div className="relative">
        <input
          id={id}
          // A blank placeholder lets :placeholder-shown tell empty from filled.
          placeholder=" "
          readOnly={readOnly}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`peer h-12 w-full rounded-lg border bg-transparent px-3.5 text-sm text-[var(--color-text-primary)] outline-none transition-[border-color,box-shadow] autofill:shadow-[inset_0_0_0_1000px_var(--color-card-bg)] autofill:[-webkit-text-fill-color:var(--color-text-primary)] ${
            trailing ? "pr-11" : ""
          } ${
            readOnly
              ? "cursor-default border-[var(--color-border)] text-[var(--color-text-secondary)]"
              : error
                ? "border-[var(--color-danger)] focus:ring-1 focus:ring-[var(--color-danger)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
          } ${className}`}
          {...inputProps}
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 bg-[var(--color-card-bg)] px-1 text-sm transition-all duration-150 peer-focus:top-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-autofill:top-0 peer-autofill:text-xs ${
            error
              ? "text-[var(--color-danger)]"
              : readOnly
                ? "text-[var(--color-text-muted)]"
                : "text-[var(--color-text-muted)] peer-focus:text-[var(--color-primary)]"
          }`}
        >
          {label}
        </label>

        {trailing && (
          <div className="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
            {trailing}
          </div>
        )}
      </div>

      {error && (
        <p
          id={describedBy}
          className="mt-1.5 px-3.5 text-xs font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordToggle({
  shown,
  label,
  onToggle,
}: {
  shown: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)]"
      aria-label={`${shown ? "Hide" : "Show"} ${label}`}
    >
      {shown ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );
}

export default function UserProfileCard({
  isOpen,
  onClose,
  user,
  onLogout,
}: UserProfileCardProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const closeProfile = () => {
    setChangePasswordOpen(false);
    setMessage("");
    setError("");
    reset();
    onClose();
  };

  // Esc, focus handling and scroll lock for this dialog's own layout.
  const panelRef = useRef<HTMLElement>(null);
  useModalBehavior({
    isOpen: isOpen && Boolean(user),
    onClose: closeProfile,
    dismissible: !loading,
    panelRef,
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
          currentPassword: formData.currentPassword,
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

  const backToAccount = () => {
    setChangePasswordOpen(false);
    setError("");
    setMessage("");
    reset();
  };

  const handleClose = closeProfile;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-[rgb(9_30_66_/_0.4)] backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Card */}
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-profile-title"
        tabIndex={-1}
        className="fixed left-1/2 top-1/2 z-[101] max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-2xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        {!changePasswordOpen ? (
          <>
            {/* Identity header */}
            <div className="relative px-6 pb-5 pt-6">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)]"
                aria-label="Close account"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 pr-8">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white ring-4 ring-[var(--color-primary-active-bg)]"
                  aria-hidden="true"
                >
                  {initials(user.name)}
                </div>

                <div className="min-w-0">
                  <h2
                    id="user-profile-title"
                    className="truncate text-lg font-semibold tracking-tight text-[var(--color-text-primary)]"
                  >
                    {user.name}
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-[var(--color-text-secondary)]">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 border-t border-[var(--color-border)] px-6 py-5">
              {/* Profile */}
              <div>
                <p className={sectionLabelClass}>Profile</p>

                <div className="space-y-4">
                  <MaterialField
                    id="profile-name"
                    label="Name"
                    value={user.name}
                    readOnly
                  />
                  <MaterialField
                    id="profile-email"
                    label="Email address"
                    type="email"
                    value={user.email}
                    readOnly
                  />
                </div>
              </div>

              {/* Security */}
              <div>
                <p className={sectionLabelClass}>Security</p>

                <button
                  type="button"
                  onClick={() => {
                    setChangePasswordOpen(true);
                    setMessage("");
                    setError("");
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg border border-[var(--color-border)] px-3.5 py-3 text-left transition-colors hover:border-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
                    <KeyRound size={17} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                      Change password
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                      Update the password you sign in with
                    </span>
                  </span>

                  <ChevronRight
                    size={18}
                    className="shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-[var(--color-border)] px-6 py-4">
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-tag-red-text)] transition-colors hover:bg-[var(--color-tag-red-bg)]"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Change password header */}
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-4">
              <button
                type="button"
                onClick={backToAccount}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                aria-label="Back to account"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="min-w-0 flex-1">
                <h2
                  id="user-profile-title"
                  className="text-base font-semibold text-[var(--color-text-primary)]"
                >
                  Change password
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Enter your current password, then choose a new one.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                aria-label="Close account"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleChangePassword)} noValidate>
              <div className="space-y-4 px-6 py-5">
                <MaterialField
                  id="change-current-password"
                  label="Current password"
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  error={errors.currentPassword?.message}
                  trailing={
                    <PasswordToggle
                      shown={showCurrentPassword}
                      label="current password"
                      onToggle={() =>
                        setShowCurrentPassword((previous) => !previous)
                      }
                    />
                  }
                  {...register("currentPassword")}
                />

                <MaterialField
                  id="change-password"
                  label="New password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  error={errors.password?.message}
                  trailing={
                    <PasswordToggle
                      shown={showPassword}
                      label="new password"
                      onToggle={() => setShowPassword((previous) => !previous)}
                    />
                  }
                  {...register("password")}
                />

                <MaterialField
                  id="change-confirm-password"
                  label="Confirm new password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  trailing={
                    <PasswordToggle
                      shown={showConfirmPassword}
                      label="confirm password"
                      onToggle={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                    />
                  }
                  {...register("confirmPassword")}
                />

                {/* Feedback */}
                {message && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-lg bg-[var(--color-tag-green-bg)] px-3.5 py-3 text-sm text-[var(--color-tag-green-text)]"
                  >
                    <CheckCircle2 size={17} className="mt-px shrink-0" />
                    <p>{message}</p>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-lg bg-[var(--color-tag-red-bg)] px-3.5 py-3 text-sm text-[var(--color-tag-red-text)]"
                  >
                    <AlertCircle size={17} className="mt-px shrink-0" />
                    <p>{error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] px-6 py-4">
                <button
                  type="button"
                  onClick={backToAccount}
                  disabled={loading}
                  className={modalButtonClass.secondary}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className={`${modalButtonClass.primary} min-w-[148px] gap-2`}
                >
                  {loading && <LoadingSpinner size="sm" />}
                  {loading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </>
        )}
      </section>
    </>
  );
}
