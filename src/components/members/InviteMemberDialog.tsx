"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Mail, UserPlus } from "lucide-react";
import Modal, { modalButtonClass } from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/ToastProvider";
import { inviteRoles } from "@/components/inviteMemberCard";
import { invitationsQueryKey } from "@/components/invitationStatusCard";

type InviteMemberDialogProps = {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
};

type InviteResponse = { message?: string };

// Invite form shown as a dialog over the members page. Same request as
// InviteMemberCard; on success the people table re-fetches its invitations.
export default function InviteMemberDialog({
  workspaceId,
  isOpen,
  onClose,
}: InviteMemberDialogProps) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [error, setError] = useState("");

  const inviteMutation = useMutation({
    mutationFn: async (invite: { email: string; role: string }) => {
      const response = await fetch(`/api/workspace/${workspaceId}/invitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "invite-member", ...invite }),
      });
      const data: InviteResponse = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to send invitation.");
      return data;
    },
    onSuccess: async (_data, invite) => {
      showToast(`Invitation sent to ${invite.email}.`, "success");
      close(true);
      await queryClient.invalidateQueries({
        queryKey: invitationsQueryKey(workspaceId),
      });
    },
    // Keep the dialog open with the typed email so the user can retry.
    onError: (err) => setError(err.message || "Failed to send invitation."),
  });

  function close(force = false) {
    if (inviteMutation.isPending && !force) return;
    setEmail("");
    setRole("member");
    setError("");
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inviteMutation.isPending) return;

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter an email address.");
      return;
    }

    setError("");
    inviteMutation.mutate({ email: trimmed, role });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => close()}
      dismissible={!inviteMutation.isPending}
      size="sm"
      icon={<UserPlus size={20} aria-hidden="true" />}
      title="Invite a member"
      description="They'll get an email with a link to join this workspace."
      footer={
        <>
          <button
            type="button"
            onClick={() => close()}
            disabled={inviteMutation.isPending}
            className={modalButtonClass.secondary}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="invite-member-form"
            disabled={inviteMutation.isPending}
            className={`${modalButtonClass.primary} gap-2`}
          >
            {inviteMutation.isPending && <LoadingSpinner size="sm" />}
            {inviteMutation.isPending ? "Sending..." : "Send invitation"}
          </button>
        </>
      }
    >
      <form
        id="invite-member-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="invite-dialog-email"
            className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]"
          >
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              id="invite-dialog-email"
              type="email"
              data-autofocus
              autoComplete="off"
              value={email}
              disabled={inviteMutation.isPending}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="name@company.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "invite-dialog-error" : undefined}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-active-bg)] disabled:opacity-60"
            />
          </div>
        </div>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-[var(--color-text-primary)]">
            Workspace role
          </legend>
          <div className="space-y-2">
            {inviteRoles.map((item) => {
              const selected = role === item.value;
              return (
                <label
                  key={item.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border px-3.5 py-3 transition-colors ${
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-active-bg)]"
                      : "border-[var(--color-border)] hover:bg-[var(--color-card-hover)]"
                  } has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-primary)]`}
                >
                  <input
                    type="radio"
                    name="invite-role"
                    value={item.value}
                    checked={selected}
                    disabled={inviteMutation.isPending}
                    onChange={() => setRole(item.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-text-muted)]"
                    }`}
                  >
                    {selected && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--color-text-primary)]">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--color-text-secondary)]">
                      {item.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p
            id="invite-dialog-error"
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
