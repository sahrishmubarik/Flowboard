"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  workspaceValidation,
  workspaceInput,
} from "@/lib/validations/workspace";

import { useToast } from "@/components/ui/ToastProvider";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

type CreateWorkspaceFormProps = {
  isModal?: boolean;
};

export default function CreateWorkspaceForm({
  isModal = false,
}: CreateWorkspaceFormProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<workspaceInput>({
    resolver: zodResolver(workspaceValidation),
    mode: "onBlur",
    defaultValues: {
      workspaceName: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: workspaceInput) => {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create-workspace",
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create workspace.");
      }

      return data;
    },

    onSuccess: (data) => {
      showToast(data.message || "Workspace created successfully!", "success");
      const workspaceId = data.workspace.id;
      router.replace(`/dashboard/workspace/${workspaceId}`);
    },

    onError: (error) => {
      showToast(error.message || "Failed to create workspace.", "error");
    },
  });

  const onSubmit = (data: workspaceInput) => {
    mutation.mutate(data);
  };

  return (
    <div
      className={
        isModal
          ? "w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 shadow-xl"
          : "w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-8 shadow-sm"
      }
    >
      <div className="mb-8 text-center">
        <h2
          className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get started with Flowboard
        </h2>

        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Create your workspace, then start capturing ideas and tracking tasks.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="mb-1 block text-xs font-medium tracking-wide text-[var(--color-text-secondary)]">
            Workspace name
          </label>

          <input
            type="text"
            {...register("workspaceName")}
            className={`w-full rounded-lg border bg-[var(--color-card-bg)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition ${
              errors.workspaceName
                ? "border-[var(--color-priority-high)] focus:border-[var(--color-priority-high)]"
                : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
            }`}
            placeholder="Amrood Labs"
          />

          {errors.workspaceName && (
            <p className="mt-1 text-xs font-medium text-[var(--color-priority-high)]">
              {errors.workspaceName.message}
            </p>
          )}

          <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
            This is usually your team or project name. You can change it later.
          </p>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Creating workspace...</span>
            </>
          ) : (
            "Create workspace"
          )}
        </button>
      </form>

      {!isModal && (
        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Just exploring?{" "}
          <Link
            href="/dashboard"
            className="font-medium text-[var(--color-text-primary)] underline underline-offset-2"
          >
            Skip for now
          </Link>
        </p>
      )}
    </div>
  );
}
