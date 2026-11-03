"use client";

import { useEffect, useId, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  RefObject,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronLeft, ChevronRight } from "lucide-react";

// Field controls shared by the card details page and the create ticket form:
// a one-click single-choice dropdown and a button-free date calendar.

const primary = { color: "var(--color-text-primary)" };
const secondary = { color: "var(--color-text-secondary)" };
const muted = { color: "var(--color-text-muted)" };

// Trigger shared by FieldSelect and DateField: looks like plain text until
// hovered, opens its popover on a single click.
const fieldTriggerClass =
  "group -mx-2 flex w-[calc(100%+1rem)] min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent dark:hover:bg-white/5";

// Popovers render in a portal with fixed positioning, so a scrolling panel
// (the create form's Details) or a sticky one (card details) can't clip them.
const popoverClass =
  "z-[110] overflow-y-auto rounded-lg border shadow-lg outline-none";

export type Placement = "below" | "above";

export const placementClass: Record<Placement, string> = {
  below: "top-full mt-1",
  above: "bottom-full mb-1",
};

// Open a popover above its field when there isn't room below (and there is
// more room above): card details is sticky, so a popover past the bottom of
// the window can't be scrolled into view.
export function choosePlacement(
  trigger: HTMLElement | null,
  height: number,
): Placement {
  if (!trigger) return "below";
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;

  return spaceBelow < height && rect.top > spaceBelow ? "above" : "below";
}

const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 4;

// Fixed position next to the trigger: right-aligned with it, at least
// `width` wide, below it unless only above has room for `height`, kept
// inside the window and capped to the space available.
function floatingStyle(
  trigger: HTMLElement,
  width: number,
  height: number,
): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
  const spaceAbove = rect.top - VIEWPORT_MARGIN;
  const above = spaceBelow < height && spaceAbove > spaceBelow;
  const panelWidth = Math.min(
    Math.max(rect.width, width),
    window.innerWidth - VIEWPORT_MARGIN * 2,
  );
  const left = Math.min(
    Math.max(VIEWPORT_MARGIN, rect.right - panelWidth),
    window.innerWidth - panelWidth - VIEWPORT_MARGIN,
  );

  return {
    position: "fixed",
    left,
    width: panelWidth,
    maxHeight: (above ? spaceAbove : spaceBelow) - POPOVER_GAP,
    ...(above
      ? { bottom: window.innerHeight - rect.top + POPOVER_GAP }
      : { top: rect.bottom + POPOVER_GAP }),
  };
}

// Keeps an open popover attached to its trigger while anything scrolls or
// the window resizes. Returns the style and a function to set it on open.
function useFloatingStyle(
  isOpen: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  width: number,
  height: number,
) {
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    if (!isOpen) return;

    const update = () => {
      if (triggerRef.current) {
        setStyle(floatingStyle(triggerRef.current, width, height));
      }
    };

    // Capture, so scrolling inside any panel is seen too.
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, triggerRef, width, height]);

  const place = () => {
    if (triggerRef.current) {
      setStyle(floatingStyle(triggerRef.current, width, height));
    }
  };

  return [style, place] as const;
}

// Keeps Tab inside an open popover (it is portalled outside the page's own
// focus order).
function trapTab(event: ReactKeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;

  const focusable = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      "button:not([disabled]), [tabindex]:not([tabindex='-1'])",
    ),
  );
  if (focusable.length === 0) return;

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

const popoverStyle = {
  backgroundColor: "var(--color-card-bg)",
  borderColor: "var(--color-border)",
};

// Closes a popover on a click outside both the field and its (portalled)
// popover.
function useOutsideClick(
  isOpen: boolean,
  rootRef: RefObject<HTMLElement | null>,
  popoverRef: RefObject<HTMLElement | null>,
  onOutside: () => void,
) {
  const onOutsideRef = useRef(onOutside);
  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        onOutsideRef.current();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, rootRef, popoverRef]);
}

export type FieldOption<T extends string> = {
  value: T;
  label: string;
  // Muted second line, e.g. an email or a sprint's status.
  description?: string;
  marker?: ReactNode;
};

// Single-choice field: one click opens the list, choosing saves. Arrow keys,
// Enter and Esc work while the list is open.
export function FieldSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  children,
}: {
  id?: string;
  label: string;
  value: T;
  options: FieldOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // Rows are about 36px (48px with a description); capped at max-h-72.
  const rowHeight = options.some((option) => option.description) ? 48 : 36;
  const [listStyle, placeList] = useFloatingStyle(
    isOpen,
    triggerRef,
    240,
    Math.min(options.length * rowHeight + 16, 296),
  );

  useOutsideClick(isOpen, rootRef, listRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  const open = () => {
    placeList();
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (next: T) => {
    close();
    if (next !== value) onChange(next);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={`Change ${label}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={(event) => {
          if (
            !isOpen &&
            (event.key === "ArrowDown" || event.key === "ArrowUp")
          ) {
            event.preventDefault();
            open();
          }
        }}
        className={fieldTriggerClass}
        style={primary}
      >
        <span className="min-w-0 break-words">{children}</span>
      </button>

      {isOpen &&
        createPortal(
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) =>
                  Math.min(options.length - 1, index + 1),
                );
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(0, index - 1));
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                const option = options[activeIndex];
                if (option) choose(option.value);
              } else if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close();
              } else if (event.key === "Tab") {
                // Back to the field rather than out of the portal.
                event.preventDefault();
                close();
              }
            }}
            className={`${popoverClass} max-h-72 p-1`}
            style={{ ...popoverStyle, ...listStyle }}
          >
            {options.map((option, index) => {
              const selected = option.value === value;

              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option.value)}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                    index === activeIndex ? "bg-black/5 dark:bg-white/10" : ""
                  }`}
                  style={primary}
                >
                  {option.marker && (
                    <span
                      className="flex shrink-0 items-center"
                      style={secondary}
                    >
                      {option.marker}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs" style={muted}>
                        {option.description}
                      </span>
                    )}
                  </span>
                  {selected && (
                    <Check
                      size={15}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--color-primary)]"
                    />
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}

// "YYYY-MM-DD" in local time, the format the date fields send.
function toDateKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

function monthOf(key: string) {
  const [year, month] = key.split("-").map(Number);

  return year && month
    ? new Date(year, month - 1, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}

// Date field: one click opens a calendar; picking a day saves and closes,
// picking the selected day again clears it. No Save/Cancel/Clear buttons.
export function DateField({
  id,
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  children,
}: {
  id?: string;
  label: string;
  value: string;
  min?: string;
  max?: string;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState(() => monthOf(value));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // 17rem wide; about 290px tall with six week rows.
  const [calendarStyle, placeCalendar] = useFloatingStyle(
    isOpen,
    triggerRef,
    272,
    290,
  );

  useOutsideClick(isOpen, rootRef, calendarRef, () => setIsOpen(false));

  // Start on the selected day (or today) so the keyboard lands somewhere useful.
  useEffect(() => {
    if (!isOpen) return;
    calendarRef.current
      ?.querySelector<HTMLButtonElement>(
        '[data-selected="true"], [data-today="true"]',
      )
      ?.focus();
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const pick = (key: string) => {
    close();
    onChange(key === value ? null : key);
  };

  const todayKey = toDateKey(new Date());
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={`Change ${label}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }
          setMonth(monthOf(value));
          placeCalendar();
          setIsOpen(true);
        }}
        className={fieldTriggerClass}
        style={primary}
      >
        <span className="min-w-0 break-words">{children}</span>
        <CalendarDays
          size={15}
          aria-hidden="true"
          className={`shrink-0 transition-opacity ${
            isOpen ? "opacity-70" : "opacity-0 group-hover:opacity-60"
          }`}
          style={muted}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={calendarRef}
            role="dialog"
            aria-label={`Choose ${label}`}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                close();
                return;
              }
              trapTab(event);
            }}
            className={`${popoverClass} p-2.5`}
            style={{ ...popoverStyle, ...calendarStyle }}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() - 1, 1),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--color-border)", ...secondary }}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-semibold" style={primary}>
                {month.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + 1, 1),
                  )
                }
                className="flex h-7 w-7 items-center justify-center rounded-lg border transition hover:bg-black/5 dark:hover:bg-white/5"
                style={{ borderColor: "var(--color-border)", ...secondary }}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="py-0.5 text-center text-[11px] font-medium"
                  style={muted}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: month.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const date = new Date(
                  month.getFullYear(),
                  month.getMonth(),
                  index + 1,
                );
                const key = toDateKey(date);
                const isSelected = key === value;
                const isToday = key === todayKey;
                // Start can't be after the due date, due can't be before start.
                const isDisabled =
                  (min !== undefined && key < min) ||
                  (max !== undefined && key > max);

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    data-selected={isSelected || undefined}
                    data-today={isToday || undefined}
                    onClick={() => pick(key)}
                    aria-label={`${date.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}${isSelected ? ", selected, click to clear" : ""}`}
                    aria-pressed={isSelected}
                    className={`flex h-7 items-center justify-center rounded-lg text-xs transition disabled:cursor-not-allowed disabled:opacity-35 ${
                      isSelected
                        ? "bg-[var(--color-primary)] font-bold text-white"
                        : "hover:bg-black/5 dark:hover:bg-white/10"
                    } ${
                      isToday && !isSelected
                        ? "outline outline-1 outline-[var(--color-primary)]"
                        : ""
                    }`}
                    style={isSelected ? undefined : primary}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <p
              className="mt-2 border-t pt-1.5 text-xs"
              style={{ borderColor: "var(--color-border)", ...muted }}
            >
              {value
                ? "Pick a day to change it, or the selected day to clear it."
                : "Pick a day to set it."}
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}
