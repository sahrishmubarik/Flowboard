// "use client";

// import { useState } from "react";
// import { useRouter, useParams } from "next/navigation";

// export default function DeleteWorkspaceCard() {
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [confirmed, setConfirmed] = useState(false);
//   const [error, setError] = useState("");

//   const params = useParams();
//   const router = useRouter();

//   const workspaceId = params.workspaceId as string;

//   const handleDelete = async () => {
//     if (!confirmed) {
//       setError(
//         "Please confirm that you want to permanently delete this workspace.",
//       );
//       return;
//     }

//     try {
//       setIsDeleting(true);
//       setError("");

//       const response = await fetch(`/api/workspace/${workspaceId}`, {
//         method: "DELETE",
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to delete workspace.");
//       }

//       router.push("/dashboard");
//     } catch (error) {
//       console.error("DELETE_WORKSPACE_ERROR:", error);

//       setError(
//         error instanceof Error ? error.message : "Failed to delete workspace.",
//       );
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <section
//       className="w-full max-w-2xl overflow-hidden rounded-2xl shadow-sm"
//       style={{
//         border: "1px solid var(--color-border)",
//         backgroundColor: "var(--color-card-bg)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className="px-6 py-5"
//         style={{
//           borderBottom: "1px solid var(--color-border)",
//         }}
//       >
//         <div className="flex items-start gap-4">
//           <div
//             className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
//             style={{
//               backgroundColor: "var(--color-tag-red-bg)",
//               color: "var(--color-priority-high)",
//             }}
//           >
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="1.8"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <polyline points="3 6 5 6 21 6" />
//               <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
//               <path d="M10 11v6" />
//               <path d="M14 11v6" />
//               <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
//             </svg>
//           </div>

//           <div>
//             <h2
//               className="text-xl font-medium tracking-tight"
//               style={{
//                 fontFamily: "var(--font-display)",
//                 color: "var(--color-text-primary)",
//               }}
//             >
//               Delete workspace
//             </h2>

//             <p
//               className="mt-1 text-sm leading-6"
//               style={{
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               Permanently remove this workspace and its associated organization
//               data.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="space-y-6 p-6">
//         {/* Warning */}
//         <div
//           className="flex items-start gap-3 rounded-xl px-4 py-4"
//           style={{
//             border: "1px solid var(--color-tag-red-text)",
//             backgroundColor: "var(--color-tag-red-bg)",
//           }}
//         >
//           <div
//             className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
//             style={{
//               backgroundColor: "var(--color-priority-high)",
//             }}
//           >
//             !
//           </div>

//           <div>
//             <p
//               className="text-sm font-medium"
//               style={{
//                 color: "var(--color-text-primary)",
//               }}
//             >
//               This action cannot be undone.
//             </p>

//             <p
//               className="mt-1 text-xs leading-5"
//               style={{
//                 color: "var(--color-text-secondary)",
//               }}
//             >
//               Deleting this workspace may permanently remove its members,
//               invitations, boards, and other associated data.
//             </p>
//           </div>
//         </div>

//         {/* Confirmation */}
//         <label
//           className="flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors"
//           style={{
//             border: "1px solid var(--color-border)",
//             backgroundColor: "var(--color-app-bg)",
//           }}
//         >
//           <input
//             type="checkbox"
//             checked={confirmed}
//             onChange={(event) => {
//               setConfirmed(event.target.checked);
//               setError("");
//             }}
//             className="mt-0.5 h-4 w-4 rounded"
//             style={{
//               accentColor: "var(--color-primary)",
//             }}
//           />

//           <span>
//             <span
//               className="block text-sm font-medium"
//               style={{
//                 color: "var(--color-text-primary)",
//               }}
//             >
//               I understand that this action is permanent.
//             </span>

//             <span
//               className="mt-1 block text-xs leading-5"
//               style={{
//                 color: "var(--color-text-muted)",
//               }}
//             >
//               Please confirm before deleting the workspace.
//             </span>
//           </span>
//         </label>

//         {/* Error */}
//         {error && (
//           <div
//             className="flex items-start gap-3 rounded-xl px-4 py-3"
//             style={{
//               border: "1px solid var(--color-tag-red-text)",
//               backgroundColor: "var(--color-tag-red-bg)",
//             }}
//           >
//             <span
//               className="mt-0.5"
//               style={{
//                 color: "var(--color-priority-high)",
//               }}
//             >
//               !
//             </span>

//             <p
//               className="text-sm"
//               style={{
//                 color: "var(--color-tag-red-text)",
//               }}
//             >
//               {error}
//             </p>
//           </div>
//         )}

//         {/* Action */}
//         <div
//           className="flex items-center justify-between gap-4 pt-5"
//           style={{
//             borderTop: "1px solid var(--color-border)",
//           }}
//         >
//           <p
//             className="hidden text-xs leading-5 sm:block"
//             style={{
//               color: "var(--color-text-muted)",
//             }}
//           >
//             Make sure you no longer need this workspace before continuing.
//           </p>

//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={isDeleting || !confirmed}
//             className="ml-auto inline-flex min-w-[160px] items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
//             style={{
//               backgroundColor: "var(--color-priority-high)",
//             }}
//           >
//             {isDeleting ? (
//               <>
//                 <span
//                   className="mr-2 h-4 w-4 animate-spin rounded-full border-2"
//                   style={{
//                     borderColor: "rgba(255,255,255,0.3)",
//                     borderTopColor: "#ffffff",
//                   }}
//                 />
//                 Deleting...
//               </>
//             ) : (
//               "Delete workspace"
//             )}
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import Modal, { modalButtonClass } from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/ToastProvider";
import { invitationsQueryKey } from "@/components/invitationStatusCard";

type WorkspacesResponse = {
  workspace?: { workspaceId: string; role: string }[];
};

type WorkspaceResponse = {
  workspace?: { workspaceName: string };
};

type BoardsResponse = { boards?: { id: string }[] };

type TotalResponse = { pagination?: { total?: number } };

type DeleteResponse = { message?: string };

// Shared with the sidebar and PageHeader, so these are usually cached.
function useWorkspaceName(workspaceId: string) {
  const { data } = useQuery<WorkspaceResponse>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`);
      if (!response.ok) throw new Error("Failed to fetch workspace");
      return response.json();
    },
    enabled: Boolean(workspaceId),
  });
  return data?.workspace?.workspaceName ?? "";
}

function useIsOwner(workspaceId: string) {
  const { data } = useQuery<WorkspacesResponse>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const response = await fetch("/api/workspace");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to fetch workspaces");
      return data;
    },
  });
  return (
    data?.workspace?.find((item) => item.workspaceId === workspaceId)?.role ===
    "owner"
  );
}

async function fetchTotal(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Request failed.");
  const data: TotalResponse = await response.json();
  return data.pagination?.total ?? 0;
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

type DeleteWorkspaceDialogProps = {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
};

// Asks the owner to type the workspace name before deleting it. Lists what
// goes with it; the database removes boards, members and invitations too.
export function DeleteWorkspaceDialog({
  workspaceId,
  isOpen,
  onClose,
}: DeleteWorkspaceDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const workspaceName = useWorkspaceName(workspaceId);
  const [typedName, setTypedName] = useState("");
  const [error, setError] = useState("");

  // Same keys as WorkspaceStats and the overview page.
  const boardsQuery = useQuery<BoardsResponse>({
    queryKey: ["workspace-boards", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}/board`);
      if (!response.ok) throw new Error("Failed to fetch workspace boards");
      return response.json();
    },
    enabled: isOpen,
  });

  const membersQuery = useQuery({
    queryKey: ["workspace-members", workspaceId, "count"],
    queryFn: () =>
      fetchTotal(`/api/workspace/${workspaceId}/members?page=1&limit=1`),
    enabled: isOpen,
  });

  const pendingQuery = useQuery({
    queryKey: [...invitationsQueryKey(workspaceId), "pending-count"],
    queryFn: () =>
      fetchTotal(
        `/api/workspace/${workspaceId}/invitation?status=PENDING&page=1&limit=1`,
      ),
    enabled: isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`, {
        method: "DELETE",
      });
      const data: DeleteResponse = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete workspace.");
      return data;
    },
    onSuccess: async () => {
      showToast(`"${workspaceName}" was deleted.`, "success");
      // Replace, so Back doesn't return to the deleted workspace.
      router.replace("/dashboard");
      await queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
    // Keep the dialog open so the owner can retry.
    onError: (err) => setError(err.message || "Failed to delete workspace."),
  });

  const nameMatches =
    workspaceName !== "" && typedName.trim() === workspaceName.trim();

  function close() {
    if (deleteMutation.isPending) return;
    setTypedName("");
    setError("");
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nameMatches || deleteMutation.isPending) return;
    setError("");
    deleteMutation.mutate();
  }

  const boardCount = boardsQuery.data?.boards?.length;
  const removed = [
    boardCount === undefined
      ? "All boards, lists and cards"
      : `${plural(boardCount, "board", "boards")} with all their lists and cards`,
    membersQuery.data === undefined
      ? "Access for every member"
      : `Access for ${plural(membersQuery.data, "member", "members")}`,
    pendingQuery.data === undefined
      ? "All invitations"
      : `All invitations, including ${plural(pendingQuery.data, "pending one", "pending ones")}`,
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      dismissible={!deleteMutation.isPending}
      role="alertdialog"
      size="sm"
      icon={<Trash2 size={20} aria-hidden="true" />}
      iconTone="danger"
      title={workspaceName ? `Delete "${workspaceName}"?` : "Delete workspace?"}
      description="This can't be undone."
      footer={
        <>
          <button
            type="button"
            onClick={close}
            disabled={deleteMutation.isPending}
            className={modalButtonClass.secondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="delete-workspace-form"
            disabled={!nameMatches || deleteMutation.isPending}
            className={`${modalButtonClass.danger} gap-2`}
          >
            {deleteMutation.isPending && <LoadingSpinner size="sm" />}
            {deleteMutation.isPending ? "Deleting..." : "Delete workspace"}
          </button>
        </>
      }
    >
      <form
        id="delete-workspace-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            This permanently deletes:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {removed.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <label
            htmlFor="delete-workspace-name"
            className="mb-1.5 block text-sm text-[var(--color-text-primary)]"
          >
            Type{" "}
            <span className="font-semibold">
              {workspaceName || "the workspace name"}
            </span>{" "}
            to confirm
          </label>
          <input
            id="delete-workspace-name"
            type="text"
            data-autofocus
            autoComplete="off"
            spellCheck={false}
            value={typedName}
            disabled={deleteMutation.isPending || !workspaceName}
            onChange={(event) => {
              setTypedName(event.target.value);
              setError("");
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "delete-workspace-error" : undefined}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-tag-red-bg)] disabled:opacity-60"
          />
        </div>

        {error && (
          <p
            id="delete-workspace-error"
            role="alert"
            className="rounded-[var(--radius-md)] bg-[var(--color-tag-red-bg)] px-3 py-2.5 text-sm text-[var(--color-tag-red-text)]"
          >
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

type DeleteWorkspaceCardProps = {
  workspaceId: string;
};

// Danger zone row at the bottom of the members page. Only the owner can
// delete a workspace (enforced by the server), so nobody else sees it.
export default function DeleteWorkspaceCard({
  workspaceId,
}: DeleteWorkspaceCardProps) {
  const isOwner = useIsOwner(workspaceId);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <section
      aria-labelledby="danger-zone-title"
      className="rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-card-bg)]"
    >
      <h2
        id="danger-zone-title"
        className="border-b border-[var(--color-danger)]/20 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-tag-red-text)]"
      >
        Danger zone
      </h2>
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            Delete this workspace
          </p>
          <p className="mt-0.5 text-sm leading-6 text-[var(--color-text-secondary)]">
            Removes all boards, members and invitations for good.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-[var(--radius-md)] border border-[var(--color-danger)]/50 bg-[var(--color-card-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-tag-red-text)] transition-colors hover:bg-[var(--color-tag-red-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger)] sm:self-auto"
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete workspace
        </button>
      </div>

      <DeleteWorkspaceDialog
        workspaceId={workspaceId}
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </section>
  );
}
