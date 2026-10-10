"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/ToastProvider";

type CreateListCardProps = {
  workspaceId: string;
  boardId: string;
};

export default function CreateListCard({
  workspaceId,
  boardId,
}: CreateListCardProps) {
  const { showToast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [listName, setListName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  async function handleCreateList(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = listName.trim();

    // Validation
    if (!trimmedName) {
      showToast("Please enter a list name.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/boardList`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listName: trimmedName,
          }),
        },
      );

      // Try to read backend response
      const data = await response.json();

      // API error
      if (!response.ok) {
        throw new Error(data.message || "Failed to create list.");
      }

      // Success
      showToast(data.message || "List created successfully.", "success");

      // Reset form
      setListName("");
      setIsCreating(false);

      // Refresh board lists
      await queryClient.invalidateQueries({
        queryKey: ["board-lists", workspaceId, boardId],
      });
    } catch (error) {
      console.error("Create list error:", error);

      showToast(
        error instanceof Error ? error.message : "Failed to create list.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCreating) {
    return (
      <div className="h-fit min-w-[280px] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <form onSubmit={handleCreateList}>
          <input
            autoFocus
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            placeholder="Enter list name..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--indigo)] focus:ring-2 focus:ring-[var(--color-card-bg)]/10"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !listName.trim()}
              className="rounded-xl bg-[var(--indigo)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--indigo-deep)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add list"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsCreating(false);
                setListName("");
              }}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsCreating(true)}
      className="flex h-fit min-w-[280px] items-center gap-2 rounded-2xl  bg-[var(--color-card)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-card-bg)] hover:text-[var(--color-card)]"
    >
      <Plus size={18} />
      Add another list
    </button>
  );
}
