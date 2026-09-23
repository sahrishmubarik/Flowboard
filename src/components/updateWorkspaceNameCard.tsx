
// "use client";

// import { useState } from "react";
// import {  useParams } from "next/navigation";


// export default function UpdateWorkspaceCard() {
//   const [workspaceName, setWorkspaceName] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const params = useParams();

//   const workspaceId = params.workspaceId as string;
//   const handleUpdate = async () => {
//     try {
//       setIsLoading(true);

//       const response = await fetch(
//         `/api/workspace/${workspaceId}`,
//         {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             workspaceName,
//           }),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to update workspace");
//       }

//       console.log("Workspace updated:", data);
//     } catch (error) {
//       console.error("UPDATE_WORKSPACE_ERROR:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="rounded-lg border p-6">
//       <h2 className="mb-4 text-xl font-semibold">
//         Update Workspace
//       </h2>

//       <input
//         type="text"
//         value={workspaceName}
//         onChange={(event) => setWorkspaceName(event.target.value)}
//         placeholder="Workspace name"
//         className="mb-4 w-full rounded-md border px-3 py-2"
//       />

//       <button
//         type="button"
//         onClick={handleUpdate}
//         disabled={isLoading}
//         className="rounded-md px-4 py-2"
//       >
//         {isLoading ? "Updating..." : "Update Workspace"}
//       </button>
//     </div>
//   );
// }



"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function UpdateWorkspaceCard() {
const [workspaceName, setWorkspaceName] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

const params = useParams();
const workspaceId = params.workspaceId as string;

const handleUpdate = async () => {
setMessage("");
setError("");


if (!workspaceName.trim()) {
  setError("Please enter a workspace name.");
  return;
}

try {
  setIsLoading(true);

  const response = await fetch(`/api/workspace/${workspaceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspaceName: workspaceName.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update workspace.",
    );
  }

  setMessage("Workspace name updated successfully.");
  setWorkspaceName("");
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
          Update workspace
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
          Change the name of your workspace to keep your organization
          information up to date.
        </p>
      </div>
    </div>
  </div>

  {/* Form */}
  <div className="space-y-6 p-6">
    {/* Workspace Name */}
    <div>
      <label
        htmlFor="workspaceName"
        className="mb-2 block text-sm font-medium text-[var(--ink)]"
      >
        Workspace name
      </label>

      <input
        id="workspaceName"
        type="text"
        value={workspaceName}
        onChange={(event) => {
          setWorkspaceName(event.target.value);
          setError("");
          setMessage("");
        }}
        placeholder="Enter workspace name"
        className="w-full rounded-xl border border-[var(--mist)] bg-[var(--paper)] px-4 py-3 text-sm text-[var(--ink)] outline-none transition-all placeholder:text-[var(--ink-soft)]/70 focus:border-[var(--indigo)] focus:bg-white focus:ring-4 focus:ring-[var(--indigo)]/[0.08]"
      />

      <p className="mt-2 text-xs leading-5 text-[var(--ink-soft)]">
        Choose a clear name that your workspace members will recognize.
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
      <p className="hidden text-xs text-[var(--ink-soft)] sm:block">
        This will update the name for all workspace members.
      </p>

      <button
        type="button"
        onClick={handleUpdate}
        disabled={isLoading}
        className="ml-auto inline-flex min-w-[150px] items-center justify-center rounded-xl bg-[var(--board-panel)] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-[var(--board-ink)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Updating...
          </>
        ) : (
          "Update workspace"
        )}
      </button>
    </div>
  </div>
</section>


);
}
