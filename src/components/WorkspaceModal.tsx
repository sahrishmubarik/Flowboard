"use client";

import { ReactNode } from "react";

import Modal, { type ModalSize } from "@/components/ui/Modal";

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // For panels that are a complete card with their own heading and close
  // button (e.g. Create board): no second header around them.
  bare?: boolean;
  // Panel width; the action panels use "md".
  size?: ModalSize;
};

// Container for the workspace action panels (members, invite, settings…).
// Built on the shared Modal for Esc, focus handling and the mobile sheet.
export default function WorkspaceModal({
  isOpen,
  onClose,
  title,
  children,
  bare = false,
  size = "md",
}: WorkspaceModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      bare={bare}
    >
      {children}
    </Modal>
  );
}
