"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bug,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileText,
  Image as ImageIcon,
  Layers3,
  Paperclip,
  Sparkles,
  Target,
  ExternalLink,
} from "lucide-react";
import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";
type TaskType = "bug" | "feature" | "task" | "tbd";

type CardDetails = {
  id: string;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;
  type: TaskType;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sprintName: string | null;
  assignedTo?: string | null;
  assigneeName?: string | null;
  assignee?: string | null;
  assignedToName?: string | null;
};
type CardAttachment = {
  id: string;
  cardId: string;
  fileName: string;
  fileUrl: string;
  contentType: string | null;
  size: number;
  createdAt: string;
};
type CardDetailsResponse = { message: string; card: CardDetails };
type AttachmentsResponse = { message: string; attachments: CardAttachment[] };
type CardDetailsPageProps = {
  workspaceId: string;
  boardId: string;
  cardId: string;
};

const primary = { color: "var(--color-text-primary)" };
const secondary = { color: "var(--color-text-secondary)" };
const muted = { color: "var(--color-text-muted)" };
const surface = {
  backgroundColor: "var(--color-card-bg)",
  borderColor: "var(--color-border)",
};

export default function CardDetailsPage({
  workspaceId,
  boardId,
  cardId,
}: CardDetailsPageProps) {
  const baseUrl = `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`;
  const boardUrl = `/dashboard/workspace/${workspaceId}/board/${boardId}`;

  const { data, isLoading, error } = useQuery<CardDetailsResponse>({
    queryKey: ["board-card", workspaceId, boardId, cardId],
    queryFn: async () => {
      const response = await fetch(baseUrl);
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message ?? "Failed to load card.");
      if (!result?.card) throw new Error("Card details were not returned.");
      return result;
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });
  const {
    data: attachmentData,
    isLoading: attachmentsLoading,
    isError: attachmentsError,
  } = useQuery<AttachmentsResponse>({
    queryKey: ["card-attachments", workspaceId, boardId, cardId],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/attachment`);
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message ?? "Failed to load attachments.");
      return {
        ...result,
        attachments: Array.isArray(result?.attachments)
          ? result.attachments
          : [],
      };
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });

  const card = data?.card;
  const attachments = attachmentData?.attachments ?? [];

  return (
    <main
      className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: "var(--color-column-bg)" }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <Link
          href={boardUrl}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium hover:opacity-70"
          style={secondary}
        >
          <ArrowLeft size={16} /> Back to board
        </Link>

        {isLoading ? (
          <div className="rounded-xl border p-8" style={surface}>
            <div className="flex items-center gap-3 text-sm" style={secondary}>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
              Loading card details...
            </div>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border p-6"
            style={{
              backgroundColor: "var(--color-tag-red-bg)",
              borderColor: "var(--color-tag-red-text)",
              color: "var(--color-tag-red-text)",
            }}
          >
            <h2 className="font-semibold">Could not load this card</h2>
            <p className="mt-2 text-sm">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
          </div>
        ) : card ? (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_285px] xl:gap-6">
            {/* One uninterrupted content panel, like the YouTrack reference. */}
            <article
              className="min-w-0 overflow-hidden rounded-xl border"
              style={surface}
            >
              <div className="p-5 sm:p-7 lg:p-8">
                <div
                  className="mb-4 flex flex-wrap items-center gap-2 text-xs"
                  style={muted}
                >
                  <span
                    className="inline-flex items-center gap-1.5 font-semibold"
                    style={secondary}
                  >
                    <Target size={14} /> CARD-{card.cardNumber}
                  </span>
                  {card.completedAt && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium"
                      style={{
                        backgroundColor: "var(--color-tag-green-bg)",
                        color: "var(--color-tag-green-text)",
                      }}
                    >
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  )}
                </div>

                <h1
                  className="break-words text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
                  style={primary}
                >
                  {card.title}
                </h1>

                <section aria-labelledby="description-heading" className="mt-8">
                  <h2
                    id="description-heading"
                    className="mb-3 flex items-center gap-2 text-sm font-semibold"
                    style={primary}
                  >
                    <FileText size={16} style={secondary} /> Description
                  </h2>
                  {card.description?.trim() ? (
                    <div className="min-w-0 break-words" style={primary}>
                      <CardDescriptionViewer
                        content={card.description}
                        className="text-sm leading-7"
                      />
                    </div>
                  ) : (
                    <p
                      className="rounded-lg border border-dashed px-4 py-6 text-sm"
                      style={{ borderColor: "var(--color-border)", ...muted }}
                    >
                      No description has been added yet.
                    </p>
                  )}
                </section>

                <section
                  aria-labelledby="attachments-heading"
                  className="mt-8 border-t pt-6"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h2
                      id="attachments-heading"
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={primary}
                    >
                      <Paperclip size={16} style={secondary} /> Attachments
                      {!attachmentsLoading && !attachmentsError && (
                        <span className="text-xs font-normal" style={muted}>
                          ({attachments.length})
                        </span>
                      )}
                    </h2>
                  </div>
                  {attachmentsLoading ? (
                    <p className="text-sm" style={secondary}>
                      Loading attachments...
                    </p>
                  ) : attachmentsError ? (
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-tag-red-text)" }}
                    >
                      Attachments could not be loaded. Please try again.
                    </p>
                  ) : attachments.length === 0 ? (
                    <div
                      className="rounded-lg border border-dashed p-5 text-sm"
                      style={{ borderColor: "var(--color-border)", ...muted }}
                    >
                      No attachments yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {attachments.map((attachment) => {
                        const isImage =
                          attachment.contentType?.startsWith("image/") ||
                          /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(
                            attachment.fileName,
                          );
                        return (
                          <a
                            key={attachment.id}
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open attachment ${attachment.fileName}`}
                            className="group min-w-0 overflow-hidden rounded-lg border transition hover:shadow-sm"
                            style={{
                              borderColor: "var(--color-border)",
                              backgroundColor: "var(--color-column-bg)",
                            }}
                          >
                            <div
                              className="flex h-32 items-center justify-center overflow-hidden border-b"
                              style={{ borderColor: "var(--color-border)" }}
                            >
                              {isImage ? (
                                // Remote attachment URLs already come from your existing API.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={attachment.fileUrl}
                                  alt={attachment.fileName}
                                  loading="lazy"
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <FileText size={30} style={secondary} />
                              )}
                            </div>
                            <div className="flex min-w-0 items-center gap-2 p-3">
                              {isImage ? (
                                <ImageIcon
                                  size={16}
                                  className="shrink-0"
                                  style={secondary}
                                />
                              ) : (
                                <FileText
                                  size={16}
                                  className="shrink-0"
                                  style={secondary}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p
                                  className="truncate text-sm font-medium"
                                  title={attachment.fileName}
                                  style={primary}
                                >
                                  {attachment.fileName}
                                </p>
                                <p className="mt-0.5 text-xs" style={muted}>
                                  {formatFileSize(attachment.size)}
                                </p>
                              </div>
                              <ExternalLink
                                size={14}
                                className="shrink-0 opacity-60 group-hover:opacity-100"
                                style={secondary}
                              />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>
            </article>

            {/* All issue properties in one compact right-hand panel. */}
            <aside
              className="min-w-0 rounded-xl border p-5 lg:sticky lg:top-4"
              style={surface}
              aria-label="Card properties"
            >
              <dl className="space-y-5">
                <Property label="Sprint" icon={<Layers3 size={15} />}>
                  <span className="break-words">
                    {card.sprintName || "Not assigned"}
                  </span>
                </Property>
                <Property label="Assignee" icon={<Target size={15} />}>
                  <span className="break-words">
                    {card.assigneeName ||
                      card.assignee ||
                      card.assignedToName ||
                      card.assignedTo ||
                      "Not assigned"}
                  </span>
                </Property>
                <Property label="Type" icon={<TaskTypeIcon type={card.type} />}>
                  <span className="inline-flex rounded-md px-2 py-1 text-xs font-semibold">
                    {formatLabel(card.type)}
                  </span>
                </Property>
                <Property label="Priority" icon={<CircleDot size={15} />}>
                  <span className="inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize">
                    {card.priority}
                  </span>
                </Property>
                <Property label="Start date" icon={<CalendarDays size={15} />}>
                  {card.startDate ? formatCardDate(card.startDate) : "—"}
                </Property>
                <Property label="Due date" icon={<Clock3 size={15} />}>
                  {card.dueDate ? formatCardDate(card.dueDate) : "—"}
                </Property>
                {card.completedAt && (
                  <Property label="Completed" icon={<CheckCircle2 size={15} />}>
                    {formatCardDate(card.completedAt)}
                  </Property>
                )}
              </dl>
            </aside>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function Property({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-3 text-sm">
      <dt className="flex min-w-0 items-center gap-2 text-xs" style={muted}>
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </dt>
      <dd className="min-w-0 font-medium" style={primary}>
        {children}
      </dd>
    </div>
  );
}

function TaskTypeIcon({ type }: { type?: TaskType | null }) {
  switch (type) {
    case "bug":
      return <Bug size={14} />;
    case "feature":
      return <Sparkles size={14} />;
    case "tbd":
      return <Clock3 size={14} />;
    default:
      return <CheckCircle2 size={14} />;
  }
}
function formatLabel(value?: string | null) {
  if (!value) return "Task";
  return value === "tbd"
    ? "TBD"
    : value.charAt(0).toUpperCase() + value.slice(1);
}
function formatCardDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}
function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return "File";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
