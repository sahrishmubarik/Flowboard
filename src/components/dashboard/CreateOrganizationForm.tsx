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
  showToast(
    data.message || "Workspace created successfully!",
    "success",
  );

  router.push("/dashboard");
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
          ? "w-full max-w-md rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-8 shadow-xl"
          : "w-full max-w-md rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-8 shadow-sm"
      }
    >
      <div className="mb-8 text-center">
        <h2
          className="text-2xl font-medium tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Get started with Flowboard
        </h2>

        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Create your workspace, then start capturing ideas and tracking
          tasks.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div>
          <label className="mb-1 block text-xs font-medium tracking-wide text-[var(--ink-soft)]">
            Workspace name
          </label>

          <input
            type="text"
            {...register("workspaceName")}
            className={`w-full rounded-lg border px-4 py-2.5 text-sm text-[var(--ink)] outline-none transition ${
              errors.workspaceName
                ? "border-red-400 focus:border-red-500"
                : "border-[var(--mist)] focus:border-[var(--indigo)]"
            }`}
            placeholder="Amrood Labs"
          />

          {errors.workspaceName && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.workspaceName.message}
            </p>
          )}

          <p className="mt-1.5 text-xs text-[var(--ink-soft)]">
            This is usually your team or project name. You can change it
            later.
          </p>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--board-ink)] py-3 text-sm font-semibold text-white transition duration-150 hover:bg-[var(--board-panel)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="mt-6 text-center text-sm text-[var(--ink-soft)]">
          Just exploring?{" "}
          <Link
            href="/dashboard"
            className="font-medium text-[var(--ink)] underline underline-offset-2"
          >
            Skip for now
          </Link>
        </p>
      )}
    </div>
  );
}