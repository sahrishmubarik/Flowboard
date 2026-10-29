"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";

type Crumb = {
  label: ReactNode;
  href?: string;
};

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  // When set, the first crumb is this workspace's name, linking to its
  // overview (read from the shared ["workspace", id] query).
  workspaceId?: string;
  breadcrumbs?: Crumb[];
  // Small facts shown after the breadcrumbs, e.g. "4 boards".
  meta?: ReactNode;
  actions?: ReactNode;
};

type WorkspaceResponse = {
  workspace?: { workspaceName?: string };
};

// Width and padding shared by the workspace-level pages.
export const pageContainerClass =
  "mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10";

export default function PageHeader({
  title,
  description,
  workspaceId,
  breadcrumbs = [],
  meta,
  actions,
}: PageHeaderProps) {
  const { data: workspaceData } = useQuery<WorkspaceResponse>({
    queryKey: ["workspace", workspaceId],
    queryFn: async () => {
      const response = await fetch(`/api/workspace/${workspaceId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch workspace");
      }

      return response.json();
    },
    enabled: Boolean(workspaceId),
  });

  const workspaceName = workspaceData?.workspace?.workspaceName;

  const crumbs: Crumb[] = [
    ...(workspaceId
      ? [
          {
            label: workspaceName ?? (
              <span className="inline-block h-3 w-20 animate-pulse rounded bg-[var(--color-border)] align-middle" />
            ),
            href: `/dashboard/workspace/${workspaceId}`,
          },
        ]
      : []),
    ...breadcrumbs,
  ];

  return (
    <header className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {(crumbs.length > 0 || meta) && (
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]"
          >
            {crumbs.map((crumb, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <ChevronRight
                    size={12}
                    aria-hidden="true"
                    className="shrink-0 text-[var(--color-text-muted)]"
                  />
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="max-w-[220px] truncate rounded-sm transition-colors hover:text-[var(--color-primary)] hover:underline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="max-w-[220px] truncate">{crumb.label}</span>
                )}
              </Fragment>
            ))}

            {meta && (
              <>
                {crumbs.length > 0 && (
                  <span aria-hidden="true" className="mx-1">
                    ·
                  </span>
                )}
                <span>{meta}</span>
              </>
            )}
          </nav>
        )}

        <h1
          className="mt-2 truncate text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="relative flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}
