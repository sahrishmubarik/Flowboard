"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import CreateWorkspaceForm from "@/components/dashboard/CreateOrganizationForm";

export default function CreateWorkspaceModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.back();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => router.back()}
        className="absolute inset-0 bg-[rgb(9_30_66_/_0.45)] backdrop-blur-[2px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create workspace"
        className="relative w-full max-w-md"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <CreateWorkspaceForm
          isModal
          onCreated={(workspaceId) => {
            setIsOpen(false);
            router.replace(`/dashboard/workspace/${workspaceId}`);
          }}
        />
      </div>
    </div>
  );
}