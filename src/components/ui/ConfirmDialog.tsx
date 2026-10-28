"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
};

// Destructive confirmation modal, styled like the board's delete-list dialog.
// While a request is pending it cannot be dismissed or confirmed again.
export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onCancel,
  icon,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}

      <button
        type="button"
        aria-label="Close confirmation"
        onClick={onCancel}
        disabled={isPending}
        className="absolute inset-0 cursor-default bg-black/40"
      />

      {/* Modal */}

      <div
        className="relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--color-card-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-lg p-1 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ color: "var(--color-text-secondary)" }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "var(--color-tag-red-bg)",
            color: "var(--color-tag-red-text)",
          }}
        >
          {icon ?? <AlertTriangle size={20} />}
        </div>

        <div className="pr-8">
          <h2
            id="confirm-dialog-title"
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </h2>

          <div
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-6"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)",
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
            className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--color-tag-red-text)" }}
          >
            {isPending && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
