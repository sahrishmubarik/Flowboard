"use client";

import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import Modal, { modalButtonClass } from "@/components/ui/Modal";

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
  // "danger" for destructive actions; "primary" for non-destructive ones.
  tone?: "danger" | "primary";
  // Optional inline error, e.g. when the request failed.
  error?: string | null;
};

// Confirmation dialog built on Modal. While a request is pending it cannot be
// dismissed or confirmed again.
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
  tone = "danger",
  error,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      description={description}
      icon={icon ?? <AlertTriangle size={20} />}
      iconTone={tone}
      size="sm"
      role="alertdialog"
      dismissible={!isPending}
      footer={
        <>
          <button
            type="button"
            // Focus the safe choice first.
            data-autofocus
            onClick={onCancel}
            disabled={isPending}
            className={modalButtonClass.secondary}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
            className={modalButtonClass[tone]}
          >
            {isPending && (
              <span
                aria-hidden="true"
                className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </>
      }
    >
      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-[var(--color-tag-red-bg)] px-3 py-2 text-sm text-[var(--color-tag-red-text)]"
        >
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
