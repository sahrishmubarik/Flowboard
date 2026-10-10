"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableBoardListProps = {
  id: string;
  children: ReactNode;
};

export default function SortableBoardList({
  id,
  children,
}: SortableBoardListProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(event) => event.stopPropagation()}
      className="flex w-[280px] min-w-[280px] flex-col"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 10 : undefined,
        position: "relative",
        touchAction: "pan-y",
      }}
    >
      {children}
    </div>
  );
}
