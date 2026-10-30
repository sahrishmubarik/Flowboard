"use client";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquareText,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Paperclip,
  FileText,
  FileImage,
} from "lucide-react";
import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";
import CardDescriptionEditor from "@/components/card/CardDescriptionEditor";
import { useToast } from "@/components/ui/ToastProvider";

type CardCommit = {
  id: string;
  cardId: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
};

type CurrentUserResponse = {
  user?: { id: string; name: string | null };
};

// Comments shown before the server confirms them.
const TEMP_ID_PREFIX = "temp-";

type CommitsResponse = {
  message?: string;
  commits?: CardCommit[];
  cards?: CardCommit[]; // Backwards compatibility with existing GET service
  data?: CardCommit[];
};

type CardAttachment = {
  id: string;
  cardId: string;
  commitId: string | null;
  fileName: string;
  fileUrl: string;
  contentType: string;
  size: number;
};
type CreatedCommit = {
  id: string;
  cardId?: string;
  description?: string;
};

type CreateCommentResponse = {
  message?: string;
  // New response: { commit: newCardCommit }
  commit?: CreatedCommit;
  comment?: CreatedCommit;
  // Existing backend response: { card: newCardCommit }
  card?: CreatedCommit;
  commitId?: string;
  id?: string;
  data?: {
    commit?: CreatedCommit;
    comment?: CreatedCommit;
    card?: CreatedCommit;
    commitId?: string;
    id?: string;
  };
};

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MAX_TOTAL_FILES = 10;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

function getCreatedCommitId(result: CreateCommentResponse): string | undefined {
  return (
    result.commit?.id ??
    result.comment?.id ??
    result.card?.id ??
    result.data?.commit?.id ??
    result.data?.comment?.id ??
    result.data?.card?.id ??
    result.data?.commitId ??
    result.commitId ??
    result.data?.id ??
    result.id
  );
}

type CardCommitsProps = {
  workspaceId: string;
  boardId: string;
  cardId: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (
    parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts.at(-1)![0]
  ).toUpperCase();
}

function formatCommitDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// First line of a comment with "Show more" at its end. It shows when the
// comment has more lines or attachments, or when this line is cut off.
function CommitFirstLine({
  text,
  hasDetails,
  isExpanded,
  detailsId,
  onToggle,
  onEdit,
}: {
  text: string;
  hasDetails: boolean;
  isExpanded: boolean;
  detailsId: string;
  onToggle: () => void;
  onEdit?: () => void;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isCutOff, setIsCutOff] = useState(false);

  // Measured only while collapsed, so "Show less" stays after expanding.
  useEffect(() => {
    const element = textRef.current;
    if (!element || isExpanded) return;

    const measure = () =>
      setIsCutOff(element.scrollWidth > element.clientWidth + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [text, isExpanded]);

  const canExpand = hasDetails || isCutOff;
  const textClass = isExpanded
    ? "block whitespace-pre-wrap break-words"
    : "block truncate";

  return (
    <div className="flex min-w-0 items-start gap-3">
      {text &&
        (onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            title="Click to edit"
            className="-mx-1 min-w-0 flex-1 cursor-text rounded px-1 text-left text-sm leading-5 transition-colors hover:bg-[var(--color-card-hover)]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span ref={textRef} className={textClass}>
              {text}
            </span>
          </button>
        ) : (
          <span
            className="min-w-0 flex-1 text-sm leading-5"
            title={isExpanded ? undefined : text}
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span ref={textRef} className={textClass}>
              {text}
            </span>
          </span>
        ))}

      {canExpand && (
        <button
          type="button"
          aria-expanded={isExpanded}
          aria-controls={detailsId}
          onClick={onToggle}
          className={`inline-flex shrink-0 items-center gap-1 text-xs font-medium leading-5 hover:underline ${
            text ? "" : "-ml-0.5"
          }`}
          style={{ color: "var(--color-primary)" }}
        >
          {isExpanded ? "Show less" : "Show more"}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}

export default function CardCommits({
  workspaceId,
  boardId,
  cardId,
}: CardCommitsProps) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [pendingUploads, setPendingUploads] = useState<{
    commitId: string;
    files: File[];
  } | null>(null);
  const [createdWithoutId, setCreatedWithoutId] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [expandedCommits, setExpandedCommits] = useState<Set<string>>(
    () => new Set(),
  );

  const commitUrl = `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}/comments`;
  const queryKey = ["card-commits", workspaceId, boardId, cardId] as const;
  const { showToast } = useToast();

  // Inline editing of the signed-in user's own comments.
  const [editingCommitId, setEditingCommitId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const skipEditBlurRef = useRef(false);
  const editEditorRef = useRef<HTMLDivElement>(null);

  // Per comment: newest request, requests in flight, last confirmed text.
  const commentRequestsRef = useRef<
    Record<string, { latest: number; pending: number; confirmed: string }>
  >({});

  // Same query as the sidebar, so it is shared from the cache.
  const { data: currentUserData } = useQuery<CurrentUserResponse>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch("/api/auth");
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch current user");
      }
      return result;
    },
  });
  const currentUser = currentUserData?.user;

  const attachmentUrl = `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}/attachment?scope=all`;
  const attachmentQueryKey = [
    "card-attachments",
    workspaceId,
    boardId,
    cardId,
    "all",
  ] as const;

  const { data: attachmentsData } = useQuery({
    queryKey: attachmentQueryKey,
    enabled: Boolean(workspaceId && boardId && cardId),

    queryFn: async (): Promise<CardAttachment[]> => {
      const response = await fetch(attachmentUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch attachments.");
      }

      const result: unknown = await response.json();

      console.log("ATTACHMENTS_API_RESPONSE:", result);

      if (Array.isArray(result)) {
        return result;
      }

      if (result && typeof result === "object") {
        const data = result as Record<string, unknown>;

        if (Array.isArray(data.attachments)) {
          return data.attachments;
        }

        if (data.attachments && typeof data.attachments === "object") {
          const nested = data.attachments as Record<string, unknown>;

          if (Array.isArray(nested.attachments)) {
            return nested.attachments;
          }
        }

        if (Array.isArray(data.data)) {
          return data.data;
        }
      }

      return [];
    },
  });

  const attachments = Array.isArray(attachmentsData) ? attachmentsData : [];
  async function uploadFiles(commitId: string, files: File[]) {
    const failures: File[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("commitId", commitId);
      try {
        const response = await fetch(attachmentUrl, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) failures.push(file);
      } catch {
        failures.push(file);
      }
    }
    await queryClient.invalidateQueries({ queryKey: attachmentQueryKey });
    return failures;
  }

  function handleFileSelection(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.target.files ?? []);
    event.target.value = "";
    setFileError("");
    setSelectedFiles((current) => {
      const next = [...current];
      for (const file of incoming) {
        if (!ALLOWED_TYPES.has(file.type)) {
          setFileError(`${file.name}: Unsupported file type.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          setFileError(`${file.name}: Maximum file size is 4 MB.`);
          continue;
        }
        if (
          next.some(
            (other) =>
              other.name === file.name &&
              other.size === file.size &&
              other.lastModified === file.lastModified,
          )
        )
          continue;
        if (next.length >= MAX_TOTAL_FILES) {
          setFileError("Maximum 10 attachments per comment.");
          break;
        }
        next.push(file);
      }
      return next;
    });
  }

  async function retryUploads() {
    if (!pendingUploads || isRetrying) return;
    setIsRetrying(true);
    try {
      const failed = await uploadFiles(
        pendingUploads.commitId,
        pendingUploads.files,
      );
      setPendingUploads(
        failed.length
          ? { commitId: pendingUploads.commitId, files: failed }
          : null,
      );
      setUploadError(
        failed.length
          ? `${failed.length} file(s) could not be uploaded. You can retry.`
          : "",
      );
      if (!failed.length) {
        setShowForm(false);

        setDescription("");
        setSelectedFiles([]);
      }
    } finally {
      setIsRetrying(false);
    }
  }

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    CardCommit[]
  >({
    queryKey,
    queryFn: async () => {
      const response = await fetch(commitUrl);
      const result: CommitsResponse = await response.json();
      if (!response.ok) {
        throw new Error(result.message ?? "Failed to load comments.");
      }
      return result.commits ?? result.cards ?? result.data ?? [];
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { description: string; files: File[] }) => {
      const response = await fetch(commitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: payload.description,
        }),
      });
      const result: CreateCommentResponse = await response
        .json()
        .catch(() => ({}));
      if (!response.ok)
        throw new Error(result?.message ?? "Failed to add comment.");
      const commitId = getCreatedCommitId(result ?? {});
      if (!commitId) return { commitId: null, failedFiles: payload.files };
      const failedFiles = await uploadFiles(commitId, payload.files);
      return { commitId, failedFiles };
    },
    // Show the comment right away; it is replaced by the saved one on refetch.
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const tempId = `${TEMP_ID_PREFIX}${Date.now()}`;

      queryClient.setQueryData<CardCommit[]>(queryKey, (old) => [
        {
          id: tempId,
          cardId,
          description: payload.description,
          createdBy: currentUser?.id ?? "",
          createdByName: currentUser?.name ?? "You",
          createdAt: new Date().toISOString(),
        },
        ...(old ?? []),
      ]);

      return { tempId };
    },
    // Remove the comment again; the form keeps the text and shows the error.
    onError: (_error, _payload, context) => {
      if (!context) return;
      queryClient.setQueryData<CardCommit[]>(queryKey, (old) =>
        (old ?? []).filter((comment) => comment.id !== context.tempId),
      );
    },
    onSuccess: async ({ commitId, failedFiles }) => {
      await queryClient.invalidateQueries({ queryKey });
      if (!commitId) {
        setCreatedWithoutId(true);
        setUploadError(
          "Comment was created, but the API did not return its ID. Attachments were not uploaded. Refresh and check the comment before trying again.",
        );
        return;
      }
      if (failedFiles.length) {
        setPendingUploads({ commitId, files: failedFiles });
        setUploadError(
          `${failedFiles.length} file(s) could not be uploaded. Retry without creating another comment.`,
        );
        return;
      }

      setDescription("");
      setSelectedFiles([]);
      setFileError("");
      setUploadError("");
      setPendingUploads(null);
      setCreatedWithoutId(false);
      setShowForm(false);
    },
  });

  const setCommentInCache = (commitId: string, text: string) => {
    queryClient.setQueryData<CardCommit[]>(queryKey, (old) =>
      (old ?? []).map((comment) =>
        comment.id === commitId ? { ...comment, description: text } : comment,
      ),
    );
  };

  const updateCommentMutationKey = ["comment-update", cardId];

  const updateCommentMutation = useMutation({
    mutationKey: updateCommentMutationKey,
    mutationFn: async (payload: { commitId: string; description: string }) => {
      const response = await fetch(`${commitUrl}/${payload.commitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: payload.description }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to update comment.");
      }
      return result;
    },
    onMutate: async ({ commitId, description: text }) => {
      await queryClient.cancelQueries({ queryKey });

      const entry = (commentRequestsRef.current[commitId] ??= {
        latest: 0,
        pending: 0,
        confirmed: "",
      });
      const current = queryClient
        .getQueryData<CardCommit[]>(queryKey)
        ?.find((comment) => comment.id === commitId);
      // With nothing in flight, the cache holds the saved text.
      if (entry.pending === 0 && current) entry.confirmed = current.description;

      entry.latest += 1;
      entry.pending += 1;
      setCommentInCache(commitId, text);

      return { commitId, requestId: entry.latest, text };
    },
    onSuccess: (_result, _payload, context) => {
      const entry = commentRequestsRef.current[context.commitId];
      if (entry) entry.confirmed = context.text;
    },
    // Restore the saved text, unless a newer edit was made since.
    onError: (mutationError, _payload, context) => {
      const entry = context && commentRequestsRef.current[context.commitId];
      if (entry && entry.latest === context.requestId) {
        setCommentInCache(context.commitId, entry.confirmed);
      }
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not update comment.",
        "error",
      );
    },
    onSettled: async (_result, _error, _payload, context) => {
      const entry = context && commentRequestsRef.current[context.commitId];
      if (entry) entry.pending -= 1;

      if (
        queryClient.isMutating({ mutationKey: updateCommentMutationKey }) === 1
      ) {
        await queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  function startEditing(comment: CardCommit) {
    skipEditBlurRef.current = false;
    setEditDraft(comment.description);
    setEditingCommitId(comment.id);
  }

  function closeEditor() {
    skipEditBlurRef.current = true;
    setEditingCommitId(null);
  }

  // Unchanged text sends no request; empty text is not allowed.
  function saveEdit(comment: CardCommit) {
    const text = editDraft.trim();

    if (!text) {
      showToast("Comment cannot be empty.", "error");
      return;
    }

    closeEditor();

    if (text !== comment.description.trim()) {
      updateCommentMutation.mutate({ commitId: comment.id, description: text });
    }
  }

  // Save when focus really leaves the editor (not for its own toolbar,
  // its link prompt, or switching browser tabs).
  function handleEditBlur(comment: CardCommit) {
    setTimeout(() => {
      if (skipEditBlurRef.current || !document.hasFocus()) return;
      if (editEditorRef.current?.contains(document.activeElement)) return;
      saveEdit(comment);
    }, 0);
  }

  const commits = [...(data ?? [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  function closeForm() {
    if (createMutation.isPending || isRetrying) return;
    if (pendingUploads || createdWithoutId) return;
    setShowForm(false);

    setDescription("");
    setSelectedFiles([]);
    setFileError("");
    setUploadError("");
    createMutation.reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (
      createMutation.isPending ||
      pendingUploads ||
      createdWithoutId ||
      !trimmedDescription
    ) {
      return;
    }

    createMutation.mutate({
      description: trimmedDescription,
      files: [...selectedFiles],
    });
  }

  function toggleDescription(commitId: string) {
    setExpandedCommits((current) => {
      const next = new Set(current);
      if (next.has(commitId)) next.delete(commitId);
      else next.add(commitId);
      return next;
    });
  }

  return (
    <section
      aria-labelledby="card-comments-heading"
      className="min-w-0"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <MessageSquareText
            size={19}
            style={{ color: "var(--color-text-secondary)" }}
          />
          <h2
            id="card-comments-heading"
            className="text-base font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Comments
          </h2>
          {!isLoading && !isError && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--color-column-bg)",
                color: "var(--color-text-secondary)",
              }}
            >
              {commits.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          aria-label="Refresh comments"
          title="Refresh comments"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md transition hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Composer: Jira-like compact entry, expanded when clicked. */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mb-6 flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm transition hover:brightness-95 dark:hover:brightness-110"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-card-bg)",
            color: "var(--color-text-muted)",
          }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              backgroundColor: "var(--color-column-bg)",
              color: "var(--color-text-secondary)",
            }}
          >
            +
          </span>
          Add a comment...
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mb-6 overflow-hidden rounded-lg border"
          style={{
            backgroundColor: "var(--color-card-bg)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="space-y-3 p-4">
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Description
              </label>
              <div
                className={
                  createMutation.isPending
                    ? "pointer-events-none opacity-60"
                    : ""
                }
                aria-busy={createMutation.isPending}
              >
                <CardDescriptionEditor
                  value={description}
                  onChange={setDescription}
                  toolbarAction={
                    <label
                      title="Attach files"
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${createMutation.isPending ? "pointer-events-none opacity-50" : ""}`}
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <Paperclip size={15} />
                      <input
                        type="file"
                        multiple
                        className="sr-only"
                        aria-label="Attach files to comment"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.zip,.docx,.xlsx"
                        disabled={
                          createMutation.isPending ||
                          Boolean(pendingUploads) ||
                          createdWithoutId
                        }
                        onChange={handleFileSelection}
                      />
                    </label>
                  }
                  footer={
                    selectedFiles.length > 0 ? (
                      <div className="space-y-2">
                        <p
                          className="text-xs font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Attachments ({selectedFiles.length}/{MAX_TOTAL_FILES})
                        </p>
                        {selectedFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className="flex items-center gap-2 rounded-md border p-2"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            {file.type.startsWith("image/") ? (
                              <FileImage size={16} />
                            ) : (
                              <FileText size={16} />
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs">
                              {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                            {!pendingUploads && !createdWithoutId && (
                              <button
                                type="button"
                                disabled={createMutation.isPending}
                                aria-label={`Remove ${file.name}`}
                                onClick={() =>
                                  setSelectedFiles((previous) =>
                                    previous.filter((_, i) => i !== index),
                                  )
                                }
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : undefined
                  }
                />
              </div>
            </div>
            {fileError && (
              <p
                role="alert"
                className="text-xs"
                style={{ color: "var(--color-tag-red-text)" }}
              >
                {fileError}
              </p>
            )}
            {uploadError && (
              <div
                role="alert"
                className="space-y-2 text-xs"
                style={{ color: "var(--color-tag-red-text)" }}
              >
                <p>{uploadError}</p>
                {pendingUploads && (
                  <button
                    type="button"
                    onClick={() => void retryUploads()}
                    disabled={isRetrying}
                    className="rounded-md border px-3 py-2 font-medium"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {isRetrying
                      ? "Retrying..."
                      : `Retry ${pendingUploads.files.length} failed attachment(s)`}
                  </button>
                )}
              </div>
            )}
            {createMutation.isError && (
              <p
                role="alert"
                className="text-xs"
                style={{ color: "var(--color-tag-red-text)" }}
              >
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Could not add comment."}
              </p>
            )}
          </div>
          <div
            className="flex justify-end gap-2 border-t px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              type="button"
              onClick={closeForm}
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <X size={14} /> Cancel
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                isRetrying ||
                Boolean(pendingUploads) ||
                createdWithoutId ||
                !description.trim()
              }
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <Send size={14} />
              {createMutation.isPending ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-4 py-2" aria-label="Loading comments">
          {[0, 1].map((index) => (
            <div key={index} className="flex animate-pulse gap-3">
              <div
                className="h-9 w-9 shrink-0 rounded-full"
                style={{ backgroundColor: "var(--color-column-bg)" }}
              />
              <div className="flex-1 space-y-2">
                <div
                  className="h-4 w-1/3 rounded"
                  style={{ backgroundColor: "var(--color-column-bg)" }}
                />
                <div
                  className="h-12 rounded"
                  style={{ backgroundColor: "var(--color-column-bg)" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border p-4 text-sm"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-tag-red-text)",
          }}
        >
          {error instanceof Error ? error.message : "Could not load comments."}
          <button
            type="button"
            onClick={() => void refetch()}
            className="ml-3 font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : commits.length === 0 ? (
        <div
          className="rounded-lg border border-dashed px-5 py-8 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <MessageSquareText
            size={24}
            className="mx-auto mb-2"
            style={{ color: "var(--color-text-muted)" }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-text-primary)" }}
          >
            No comments yet
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Share an update or ask a question to start the conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {commits.map((item) => {
            const isExpanded = expandedCommits.has(item.id);
            const descriptionLines = item.description?.trim().split(/\r?\n/) ?? [];
            const descriptionPreview = descriptionLines[0] ?? "";
            const descriptionDetails = descriptionLines.slice(1).join("\n").trim();
            const author = item.createdByName?.trim() || "Unknown user";
            const commitAttachments = attachments.filter(
              (attachment) => attachment.commitId === item.id,
            );

            const hasDetails =
              Boolean(descriptionDetails) || commitAttachments.length > 0;
            const detailsId = `commit-details-${item.id}`;
            const isSending = item.id.startsWith(TEMP_ID_PREFIX);
            // Only the author can edit (the API enforces this too).
            const canEdit =
              !isSending &&
              Boolean(currentUser?.id) &&
              item.createdBy === currentUser?.id;
            const isEditing = editingCommitId === item.id;

            return (
              <article
                key={item.id}
                className={`min-w-0 rounded-lg ${isSending ? "opacity-60" : ""}`}
                aria-busy={isSending}
              >
                {/* Name, 20px, time; the comment's first line below */}
                <div className="flex min-w-0 gap-3 px-3 py-1">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                    style={{
                      backgroundColor: "var(--color-column-bg)",
                      color: "var(--color-text-primary)",
                    }}
                    aria-hidden="true"
                  >
                    {initials(author)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-5">
                      <span
                        className="min-w-0 truncate text-sm font-semibold leading-5"
                        title={author}
                        style={{ color: "var(--color-primary)" }}
                      >
                        {author}
                      </span>
                      <time
                        dateTime={item.createdAt}
                        className="shrink-0 text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {isSending
                          ? "Sending..."
                          : formatCommitDate(item.createdAt)}
                      </time>
                      {commitAttachments.length > 0 && (
                        <span
                          className="inline-flex shrink-0 items-center gap-1 text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                          title={`${commitAttachments.length} attachment(s)`}
                        >
                          <Paperclip size={13} />
                          {commitAttachments.length}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <CommitFirstLine
                        text={descriptionPreview}
                        hasDetails={hasDetails}
                        isExpanded={isExpanded}
                        detailsId={detailsId}
                        onToggle={() => toggleDescription(item.id)}
                        onEdit={canEdit ? () => startEditing(item) : undefined}
                      />
                    )}
                  </div>
                </div>

                {isEditing && (
                  // Saves when focus leaves the editor or on Ctrl/Cmd+Enter;
                  // Esc cancels.
                  <div
                    ref={editEditorRef}
                    className="space-y-1.5 pb-2 pl-[3.25rem] pr-3"
                    onBlur={() => handleEditBlur(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        event.preventDefault();
                        closeEditor();
                      }
                      if (
                        event.key === "Enter" &&
                        (event.ctrlKey || event.metaKey)
                      ) {
                        event.preventDefault();
                        saveEdit(item);
                      }
                    }}
                  >
                    <CardDescriptionEditor
                      value={editDraft}
                      onChange={setEditDraft}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Saves when you click outside · Ctrl+Enter to save · Esc
                      to cancel
                    </p>
                  </div>
                )}

                {isExpanded && !isEditing && (
                  <div id={detailsId} className="space-y-1.5 pb-2 pl-[3.25rem] pr-3">
                    {descriptionDetails &&
                      (canEdit ? (
                        <div
                          tabIndex={0}
                          title="Click to edit"
                          aria-label="Edit comment"
                          onClick={(event) => {
                            if (
                              (event.target as HTMLElement).closest(
                                "a, input, button, label",
                              )
                            ) {
                              return;
                            }
                            startEditing(item);
                          }}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" &&
                              event.target === event.currentTarget
                            ) {
                              event.preventDefault();
                              startEditing(item);
                            }
                          }}
                          className="-mx-1 cursor-text rounded px-1 transition-colors hover:bg-[var(--color-card-hover)]"
                        >
                          <CardDescriptionViewer content={descriptionDetails} />
                        </div>
                      ) : (
                        <CardDescriptionViewer content={descriptionDetails} />
                      ))}
                    {commitAttachments.length > 0 && (
                      <>
                        <p className="text-xs font-semibold">
                          Attachments ({commitAttachments.length})
                        </p>
                        {commitAttachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs hover:opacity-80"
                            style={{
                              borderColor: "var(--color-border)",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            <Paperclip size={14} />
                            <span className="min-w-0 flex-1 truncate">
                              {attachment.fileName}
                            </span>
                            <ExternalLink size={13} />
                          </a>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
