"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectMenuOption<T extends string | number> = {
  value: T;
  label: string;
  // Small pill after the label, e.g. a role.
  badge?: string;
  // Icon before the label, e.g. the role icon used in a table.
  icon?: ReactNode;
};

type SelectMenuProps<T extends string | number> = {
  // Accessible name of the control, e.g. "Board".
  label: string;
  // Small uppercase title at the top of the open list.
  heading: string;
  value: T | null;
  options: SelectMenuOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  // Second line under the selected label in the trigger.
  description?: string;
  // Coloured initial tile before the label, like the organization switcher.
  showInitial?: boolean;
  // Shown instead of the option label in the trigger, e.g. "10 per page".
  formatSelected?: (option: SelectMenuOption<T>) => string;
  disabled?: boolean;
  // "sm" matches a 36px toolbar control (e.g. a search field next to it).
  size?: "md" | "sm";
  // "above" for controls near the bottom of the page, like a table footer.
  placement?: "below" | "above";
  // Width/alignment of the open list; defaults to the trigger's width.
  panelClassName?: string;
  className?: string;
};

function OptionIcon({ icon, compact }: { icon: ReactNode; compact: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-md bg-[var(--color-column-bg)] text-[var(--color-text-secondary)] ${
        compact ? "h-5 w-5" : "h-6 w-6"
      }`}
    >
      {icon}
    </span>
  );
}

function Initial({ text }: { text: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)] text-[12px] font-semibold text-white"
    >
      {text.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

// Dropdown with the same look as the sidebar's organization switcher.
// Click or Enter/Space/↓ opens it; ↑ ↓ Home End move, Enter picks, Esc or a
// click outside closes.
export default function SelectMenu<T extends string | number>({
  label,
  heading,
  value,
  options,
  onChange,
  placeholder = "Select…",
  description,
  showInitial = false,
  formatSelected,
  disabled = false,
  size = "md",
  placement = "below",
  panelClassName = "left-0 right-0",
  className = "",
}: SelectMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  // The small size also tightens the open list.
  const compact = size === "sm";
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const isDisabled = disabled || options.length === 0;

  // Close on a click outside the control.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  // Move focus into the list when it opens, so the arrow keys work.
  useEffect(() => {
    if (isOpen) listRef.current?.focus();
  }, [isOpen]);

  // Keep the highlighted option visible while moving with the keyboard.
  useEffect(() => {
    if (!isOpen) return;

    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const open = () => {
    if (isDisabled) return;
    setActiveIndex(Math.max(0, selectedIndex));
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (option: SelectMenuOption<T>) => {
    close();
    if (option.value !== value) onChange(option.value);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const last = options.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(last, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (options[activeIndex]) choose(options[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  const selectedText = selected
    ? (formatSelected?.(selected) ?? selected.label)
    : placeholder;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`${label}: ${selectedText}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        disabled={isDisabled}
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60 ${
          size === "sm" ? "h-9" : "py-2"
        } ${
          isOpen
            ? "bg-[var(--color-column-bg)]"
            : "bg-[var(--color-app-bg)] hover:bg-[var(--color-column-bg)]"
        }`}
      >
        {showInitial && <Initial text={selected?.label ?? ""} />}

        {selected?.icon && (
          <span
            aria-hidden="true"
            className="flex shrink-0 text-[var(--color-text-secondary)]"
          >
            {selected.icon}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span
            className={`block truncate text-[13px] font-semibold ${
              selected
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            {selectedText}
          </span>

          {description && (
            <span className="block truncate text-[11px] capitalize text-[var(--color-text-muted)]">
              {description}
            </span>
          )}
        </span>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`shrink-0 text-[var(--color-text-secondary)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-[60] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-md)] ${
            placement === "above"
              ? "bottom-[calc(100%+4px)]"
              : "top-[calc(100%+4px)]"
          } ${panelClassName}`}
        >
          <div
            className={`border-b border-[var(--color-border)] px-3 ${
              compact ? "py-1.5" : "py-2"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-secondary)]">
              {heading}
            </span>
          </div>

          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={`${listId}-${activeIndex}`}
            onKeyDown={handleListKeyDown}
            className={`max-h-64 overflow-y-auto outline-none ${
              compact ? "p-1" : "space-y-0.5 p-1.5"
            }`}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;

              return (
                <li
                  key={String(option.value)}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                  className={`flex cursor-pointer items-center rounded-[var(--radius-md)] transition-colors ${
                    compact ? "gap-2 px-2 py-1.5" : "gap-2.5 px-2.5 py-2"
                  } ${
                    isSelected
                      ? "bg-[var(--color-primary-active-bg)]"
                      : isActive
                        ? "bg-[var(--color-column-bg)]"
                        : ""
                  }`}
                >
                  {showInitial && <Initial text={option.label} />}

                  {option.icon && (
                    <OptionIcon icon={option.icon} compact={compact} />
                  )}

                  <span
                    className={`min-w-0 flex-1 truncate text-xs text-[var(--color-text-primary)] ${
                      isSelected ? "font-semibold" : ""
                    }`}
                  >
                    {option.label}
                  </span>

                  {option.badge && (
                    <span className="shrink-0 rounded-full bg-[var(--color-border)] px-1.5 py-0.5 text-[10px] font-medium uppercase text-[var(--color-text-secondary)]">
                      {option.badge}
                    </span>
                  )}

                  {isSelected && (
                    <Check
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--color-primary)]"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
