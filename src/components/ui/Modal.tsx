"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  // Rendered in a rounded tile beside the title.
  icon?: ReactNode;
  iconTone?: "primary" | "danger";
  children?: ReactNode;
  // Action row pinned under the body (Cancel / Confirm buttons).
  footer?: ReactNode;
  size?: ModalSize;
  // False while a request is pending: Esc, backdrop and × do nothing.
  dismissible?: boolean;
  role?: "dialog" | "alertdialog";
  // Element to focus on open; defaults to the first [data-autofocus]
  // element, then the first focusable element, then the panel itself.
  // (Use data-autofocus, not autoFocus, so focus returns to the trigger.)
  initialFocusRef?: RefObject<HTMLElement | null>;
};

const sizeClass: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-xl",
  lg: "sm:max-w-4xl",
  xl: "sm:max-w-5xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

// Open modals, innermost last. Only the top one reacts to Esc and Tab, so a
// confirmation opened over another dialog closes on its own.
const modalStack: string[] = [];

type ModalBehaviorOptions = {
  isOpen: boolean;
  onClose: () => void;
  // False while a request is pending: Esc does nothing.
  dismissible?: boolean;
  panelRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

// Dialog behaviour without the layout: Esc to close, focus moved into the
// dialog and restored on close, Tab kept inside, page scroll locked, and
// correct nesting. Used by Modal and by dialogs with their own layout.
export function useModalBehavior({
  isOpen,
  onClose,
  dismissible = true,
  panelRef,
  initialFocusRef,
}: ModalBehaviorOptions) {
  const id = useId();

  // Keep the latest callbacks without re-running the open/close effect.
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible);
  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible;
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    modalStack.push(id);

    // Lock page scroll; the last modal to close restores it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    // A child that focused itself (React autoFocus) keeps its focus.
    const alreadyInside =
      panel !== null &&
      panel.contains(document.activeElement) &&
      document.activeElement !== panel;
    if (!alreadyInside) {
      const target =
        initialFocusRef?.current ??
        panel?.querySelector<HTMLElement>("[data-autofocus]") ??
        panel?.querySelector<HTMLElement>(FOCUSABLE) ??
        panel;
      target?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (modalStack.at(-1) !== id) return;

      if (event.key === "Escape") {
        // Already handled inside the dialog (e.g. a dropdown or calendar
        // closing itself), so only that inner layer closes.
        if (event.defaultPrevented) return;
        if (dismissibleRef.current) {
          event.stopPropagation();
          onCloseRef.current();
        }
        return;
      }

      // Keep Tab focus inside the dialog.
      if (event.key === "Tab" && panel) {
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(FOCUSABLE),
        ).filter((element) => element.offsetParent !== null);

        if (focusable.length === 0) {
          event.preventDefault();
          panel.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const index = modalStack.lastIndexOf(id);
      if (index !== -1) modalStack.splice(index, 1);
      if (modalStack.length === 0) {
        document.body.style.overflow = previousOverflow;
      }
      previouslyFocused?.focus?.();
    };
    // initialFocusRef is read once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, id]);
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  iconTone = "primary",
  children,
  footer,
  size = "md",
  dismissible = true,
  role = "dialog",
  initialFocusRef,
}: ModalProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const panelRef = useRef<HTMLDivElement>(null);

  useModalBehavior({
    isOpen,
    onClose,
    dismissible,
    panelRef,
    initialFocusRef,
  });

  if (!isOpen) return null;

  const close = () => {
    if (dismissible) onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      {/* Backdrop */}

      <div
        aria-hidden="true"
        onClick={close}
        className="absolute inset-0 bg-[rgb(9_30_66_/_0.45)]"
      />

      {/* Panel: a bottom sheet on phones, a centered dialog from sm up. */}

      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-md)] outline-none sm:rounded-[var(--radius-xl)] ${sizeClass[size]}`}
      >
        {/* Header */}

        <div className="flex shrink-0 items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
              style={
                iconTone === "danger"
                  ? {
                      backgroundColor: "var(--color-tag-red-bg)",
                      color: "var(--color-tag-red-text)",
                    }
                  : {
                      backgroundColor: "var(--color-primary-active-bg)",
                      color: "var(--color-primary)",
                    }
              }
            >
              {icon}
            </div>
          )}

          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={titleId}
              className="text-lg font-semibold leading-6 text-[var(--color-text-primary)]"
            >
              {title}
            </h2>

            {description && (
              <div
                id={descriptionId}
                className="mt-1.5 text-sm leading-6 text-[var(--color-text-secondary)]"
              >
                {description}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={close}
            disabled={!dismissible}
            aria-label="Close"
            className="-mr-1.5 -mt-1 shrink-0 rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}

        {children !== undefined && children !== null && (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {children}
          </div>
        )}

        {/* Footer */}

        {footer && (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

// Shared button styles for modal footers.
export const modalButtonClass = {
  secondary:
    "inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card-bg)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
  primary:
    "inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-[var(--color-on-danger)] transition-colors hover:bg-[var(--color-danger-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-50",
};
