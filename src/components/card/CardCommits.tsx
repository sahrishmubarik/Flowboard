"use client";
import { ExternalLink } from "lucide-react";
import { useState, type ChangeEvent } from "react";
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

type CardCommit = {
  id: string;
  cardId: string;
  title: string;
  description: string | null;
  createdBy: string;
  createdByName: string;
  createdAt: string;
};

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
  title?: string;
  description?: string | null;
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

export default function CardCommits({
  workspaceId,
  boardId,
  cardId,
}: CardCommitsProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
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
        setTitle("");
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
    mutationFn: async (payload: {
      title: string;
      description: string | null;
      files: File[];
    }) => {
      const response = await fetch(commitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
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
      setTitle("");
      setDescription("");
      setSelectedFiles([]);
      setFileError("");
      setUploadError("");
      setPendingUploads(null);
      setCreatedWithoutId(false);
      setShowForm(false);
    },
  });

  const commits = [...(data ?? [])].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  function closeForm() {
    if (createMutation.isPending || isRetrying) return;
    if (pendingUploads || createdWithoutId) return;
    setShowForm(false);
    setTitle("");
    setDescription("");
    setSelectedFiles([]);
    setFileError("");
    setUploadError("");
    createMutation.reset();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !title.trim() ||
      createMutation.isPending ||
      pendingUploads ||
      createdWithoutId
    )
      return;
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
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
      className="mt-8 min-w-0 border-t pt-6"
      style={{ borderColor: "var(--color-border)" }}
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
            <label
              htmlFor={`comment-title-${cardId}`}
              className="block text-xs font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Summary
            </label>
            <input
              id={`comment-title-${cardId}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a short summary..."
              maxLength={255}
              autoFocus
              required
              disabled={createMutation.isPending}
              className="w-full rounded-md border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={{
                backgroundColor: "var(--color-input-bg)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            />
            <div className="space-y-2">
              <label
                className="block text-xs font-semibold"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Details <span className="font-normal">(optional)</span>
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
                !title.trim() ||
                createMutation.isPending ||
                isRetrying ||
                Boolean(pendingUploads) ||
                createdWithoutId
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
        <div className="space-y-2">
          {commits.map((item) => {
            const isExpanded = expandedCommits.has(item.id);
            const hasDescription = Boolean(item.description?.trim());
            const author = item.createdByName?.trim() || "Unknown user";
            const commitAttachments = attachments.filter(
              (attachment) => attachment.commitId === item.id,
            );

            const hasDetails = hasDescription || commitAttachments.length > 0;
            const detailsId = `commit-details-${item.id}`;

            return (
              <article
                key={item.id}
                className="min-w-0 rounded-lg border"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-card-bg)",
                }}
              >
                {/* Compact Jira-style single-line summary */}
                <div className="flex min-w-0 items-center gap-2.5 px-3 py-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: "var(--color-column-bg)",
                      color: "var(--color-text-primary)",
                    }}
                    aria-hidden="true"
                  >
                    {initials(author)}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span
                      className="max-w-[28%] shrink-0 truncate text-xs font-semibold sm:max-w-[22%]"
                      title={author}
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {author}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate text-sm"
                      title={item.title}
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {item.title}
                    </span>
                  </div>

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
                  <time
                    dateTime={item.createdAt}
                    className="hidden shrink-0 text-[11px] sm:block"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {formatCommitDate(item.createdAt)}
                  </time>
                  {hasDetails && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => toggleDescription(item.id)}
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-medium hover:underline"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {isExpanded ? "Show less" : "Show more"}
                      {isExpanded ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Both description and attachments stay hidden until expanded. */}
                {/* {hasDetails && isExpanded && (
                  <div
                    className="border-t px-4 py-3"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {item.description && (
                      <CardDescriptionViewer content={item.description} />
                    )}

                    {commitAttachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold">
                          Attachments ({commitAttachments.length})
                        </p>

                        {commitAttachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center gap-2 rounded-md border p-2"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <Paperclip size={14} />

                            <span className="truncate text-xs">
                              {attachment.originalName ??
                                attachment.fileName ??
                                attachment.name ??
                                "Attachment"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )} */}
                {isExpanded && (
                  <div className="space-y-3 border-t px-4 py-3">
                    {item.description && (
                      <CardDescriptionViewer content={item.description} />
                    )}

                    {commitAttachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold">
                          Attachments ({commitAttachments.length})
                        </p>

                        {commitAttachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-md border p-2 text-xs hover:opacity-80"
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
                      </div>
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
