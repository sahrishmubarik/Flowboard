"use client";

import { useRouter } from "next/navigation";
import CreateWorkspaceForm from "@/components/dashboard/CreateOrganizationForm";

export default function CreateWorkspaceModal() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute right-4 top-4 z-10 text-xl text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
          aria-label="Close"
        >
          ×
        </button>

        <CreateWorkspaceForm isModal />
      </div>
    </div>
  );
}