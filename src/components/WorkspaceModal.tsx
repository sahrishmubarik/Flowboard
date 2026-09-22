"use client";

import { ReactNode } from "react";

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function WorkspaceModal({
  isOpen,
  onClose,
  title,
  children,
}: WorkspaceModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-6 shadow-xl">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-lg text-[var(--ink-soft)] transition hover:bg-[var(--mist)] hover:text-[var(--ink)]"
        >
          ×
        </button>

        {/* Title */}
        <div className="mb-6 pr-8">
          <h2
            className="text-xl font-medium text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
        </div>

        {/* Selected card */}
        {children}
      </div>
    </div>
  );
}