"use client";

import { ReactNode } from "react";

import Modal from "@/components/ui/Modal";

type WorkspaceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

// Container for the workspace action panels (members, invite, settings…).
// Built on the shared Modal for Esc, focus handling and the mobile sheet.
export default function WorkspaceModal({
  isOpen,
  onClose,
  title,
  children,
}: WorkspaceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {children}
    </Modal>
  );
}
