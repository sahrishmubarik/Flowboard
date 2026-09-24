


"use client";

import { useState } from "react";
import { useParams } from "next/navigation";


type CreateBoardCardProps = {
  onClose: () => void;
};

export default function CreateBoard({
  onClose,
}: CreateBoardCardProps)
{
const [boardName, setBoardName] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

const params = useParams();
const workspaceId = params.workspaceId as string;

const handleCreate = async () => {
setMessage("");
setError("");


if (!boardName.trim()) {
  setError("Please enter board name.");
  return;
}

try {
  setIsLoading(true);

  const response = await fetch(`/api/workspace/${workspaceId}/board`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      boardName: boardName.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create board.",
    );
  }

  setMessage("Created board successfully.");
  setBoardName("");
} catch (error) {
  setError(
    error instanceof Error
      ? error.message
      : "Something went wrong.",
  );
} finally {
  setIsLoading(false);
}


};

return ( <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] shadow-sm">
{/* Header */} <div className="border-b border-[var(--mist)] px-6 py-5"> <div className="flex items-start gap-4"> <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--indigo)]/[0.08] text-[var(--indigo)]"> <svg
           width="20"
           height="20"
           viewBox="0 0 24 24"
           fill="none"
           stroke="currentColor"
           strokeWidth="1.8"
           strokeLinecap="round"
           strokeLinejoin="round"
         > <path d="M12 20h9" /> <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" /> </svg> </div>

      <div>
        <h2
          className="text-xl font-medium tracking-tight text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
         Create New Board
        </h2>

        
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
          Create your board, then start capturing ideas and tracking
          tasks.
        </p>
        
      </div>
    </div>
  </div>

  {/* Form */}
  <div className="space-y-6 p-6">
    {/* Workspace Name */}
    <div>
      <label
        htmlFor="CreateBoard"
        className="mb-2 block text-sm font-medium text-[var(--ink)]"
      >
    Board name
      </label>

      <input
        id="boardName"
        type="text"
        value={boardName}
        onChange={(event) => {
          setBoardName(event.target.value);
          setError("");
          setMessage("");
        }}
        placeholder="Enter workspace name"
        className="w-full rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
      />

      <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
        Choose a clear name that your board members will recognize.
      </p>
    </div>

    {/* Feedback */}
    {message && (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--sage)]/30 bg-[var(--sage)]/[0.08] px-4 py-3">
        <span className="mt-0.5 text-[var(--sage)]">✓</span>

        <p className="text-sm text-[var(--ink)]">
          {message}
        </p>
      </div>
    )}

    {error && (
      <div className="flex items-start gap-3 rounded-xl border border-[var(--coral)]/30 bg-[var(--coral)]/[0.08] px-4 py-3">
        <span className="mt-0.5 text-[var(--coral)]">!</span>

        <p className="text-sm text-[var(--ink)]">
          {error}
        </p>
      </div>
    )}

    {/* Action */}
    <div className="flex items-center justify-between gap-4 border-t border-[var(--mist)] pt-5">

      <button
        type="button"
        onClick={handleCreate}
        disabled={isLoading}
    
        className="ml-auto inline-flex min-w-[150px] items-center justify-center rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--board-ink)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Creating...
          </>
        ) : (
          "Create Board"
        )}
      </button>
    </div>
  </div>
</section>


);
}
