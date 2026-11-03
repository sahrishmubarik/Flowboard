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
      <div className="h-fit min-w-[280px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-bg)] p-3 shadow-[var(--shadow-sm)]">
        <form onSubmit={handleCreateList}>
          <input
            autoFocus
            value={listName}
            onChange={(event) => setListName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isSubmitting) {
                setIsCreating(false);
                setListName("");
              }
            }}
            placeholder="Enter list name..."
            aria-label="List name"
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)]"
          />

          <div className="mt-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !listName.trim()}
              className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
              aria-label="Cancel adding list"
              className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
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
      className="flex h-fit min-w-[280px] cursor-pointer items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--color-card-bg)] px-4 py-4 text-left text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-card-hover)] hover:text-[var(--color-primary)]"
    >
      <Plus size={18} />
      Add another list
    </button>
  );
}
