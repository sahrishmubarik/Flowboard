"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import CardDescriptionViewer from "@/components/card/CardDescriptionViewer";

type CardPriority = "normal" | "show stopper" | "critical" | "major" | "minor";

type CardDetails = {
  id: string;
  cardNumber: number;
  title: string;
  description: string | null;
  priority: CardPriority;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  sprintName: string | null;
};

type CardDetailsResponse = {
  message: string;
  card: CardDetails;
};

type CardDetailsPageProps = {
  workspaceId: string;
  boardId: string;
  cardId: string;
};

export default function CardDetailsPage({
  workspaceId,
  boardId,
  cardId,
}: CardDetailsPageProps) {
  const { data, isLoading, error } = useQuery<CardDetailsResponse>({
    queryKey: ["board-card", workspaceId, boardId, cardId],
    queryFn: async () => {
      const response = await fetch(
        `/api/workspace/${workspaceId}/board/${boardId}/card/${cardId}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message ?? "Failed to load card");
      }

      if (!result?.card) {
        throw new Error("Card details were not returned");
      }

      return result;
    },
    enabled: Boolean(workspaceId && boardId && cardId),
  });

  const card = data?.card;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--color-column-bg)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href={`/dashboard/workspace/${workspaceId}/board/${boardId}`}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
        >
          <ArrowLeft size={16} />
          Back to board
        </Link>

        {isLoading ? (
          <div
            className="rounded-xl border p-6 text-sm"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Loading card...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border p-6 text-sm"
            style={{
              backgroundColor: "var(--color-tag-red-bg)",
              borderColor: "var(--color-tag-red-text)",
              color: "var(--color-tag-red-text)",
            }}
          >
            {error instanceof Error ? error.message : "Failed to load card."}
          </div>
        ) : card ? (
          <article
            className="rounded-xl border p-5 shadow-sm sm:p-8"
            style={{
              backgroundColor: "var(--color-card-bg)",
              borderColor: "var(--color-border)",
            }}
          >
            <header className="border-b pb-5" style={{ borderColor: "var(--color-border)" }}>
              <p
                className="text-xs font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                {card.sprintName
                  ? `${card.sprintName}_${card.cardNumber}`
                  : `CARD-${card.cardNumber}`}
              </p>
              <h1
                className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                {card.title}
              </h1>
              <span
                className="mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                style={getPriorityStyle(card.priority)}
              >
                {card.priority}
              </span>
            </header>

            <section className="mt-6">
              <h2
                className="mb-2 text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Description
              </h2>
              <CardDescriptionViewer
                content={card.description}
                className="text-sm leading-6"
              />
            </section>

            {(card.startDate || card.dueDate) && (
              <section className="mt-6">
                <h2
                  className="mb-2 text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Dates
                </h2>
                <div
                  className="flex flex-wrap items-center gap-2 text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {card.startDate && <span>{formatCardDate(card.startDate)}</span>}
                  {card.startDate && card.dueDate && <span aria-hidden="true">→</span>}
                  {card.dueDate && <span>{formatCardDate(card.dueDate)}</span>}
                </div>
              </section>
            )}
          </article>
        ) : null}
      </div>
    </main>
  );
}

function formatCardDate(date: string) {
  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPriorityStyle(priority: CardPriority) {
  switch (priority) {
    case "critical":
      return {
        backgroundColor: "var(--color-tag-red-bg)",
        color: "var(--color-tag-red-text)",
      };
    case "show stopper":
      return {
        backgroundColor: "var(--color-tag-orange-bg)",
        color: "var(--color-tag-orange-text)",
      };
    case "major":
      return {
        backgroundColor: "var(--color-tag-yellow-bg)",
        color: "var(--color-tag-yellow-text)",
      };
    case "minor":
      return {
        backgroundColor: "var(--color-tag-blue-bg)",
        color: "var(--color-tag-blue-text)",
      };
    default:
      return {
        backgroundColor: "var(--color-tag-green-bg)",
        color: "var(--color-tag-green-text)",
      };
  }
}
