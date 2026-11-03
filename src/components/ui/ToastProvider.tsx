"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION_MS = 3000;

const toastStyles: Record<
  ToastType,
  { icon: typeof Info; accent: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "var(--color-status-done)",
    iconColor: "var(--color-status-done)",
  },
  error: {
    icon: XCircle,
    accent: "var(--color-priority-high)",
    iconColor: "var(--color-priority-high)",
  },
  info: {
    icon: Info,
    accent: "var(--color-primary)",
    iconColor: "var(--color-primary)",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Counter instead of Date.now(): two toasts in the same millisecond
  // would otherwise share an id and one would never be dismissed.
  const nextIdRef = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      nextIdRef.current += 1;
      const id = nextIdRef.current;

      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[360px]"
      >
        {toasts.map((toast) => {
          const style = toastStyles[toast.type];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-[var(--radius-md)] border border-l-4 bg-[var(--color-card-bg)] px-3.5 py-3 text-sm shadow-[var(--shadow-md)]"
              style={{
                borderColor: "var(--color-border)",
                borderLeftColor: style.accent,
              }}
            >
              <Icon
                size={18}
                aria-hidden="true"
                className="mt-px shrink-0"
                style={{ color: style.iconColor }}
              />

              <p className="min-w-0 flex-1 break-words font-medium leading-5 text-[var(--color-text-primary)]">
                {toast.message}
              </p>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-0.5 shrink-0 rounded p-1 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
