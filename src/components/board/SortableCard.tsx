"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableCardProps = {
  card: { id: string; [key: string]: unknown };
  children: ReactNode;
};

export default function SortableCard({ card, children }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onPointerDown={(event) => {
        event.stopPropagation();
        listeners?.onPointerDown?.(event);
      }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.25 : 1,
        position: "relative",
        touchAction: "none",
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {children}
    </div>
  );
}
