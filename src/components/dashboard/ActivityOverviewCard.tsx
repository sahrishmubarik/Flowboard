import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

type ActivityOverviewCardProps = {
  workspaceId: string;
};

// Introduces the Activity page instead of listing activity records here.
export default function ActivityOverviewCard({
  workspaceId,
}: ActivityOverviewCardProps) {
  return (
    <section className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-sm)]">
      {/* Header: matches the Active sprints card */}
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]"
        >
          <Activity size={17} />
        </span>
        <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)]">
          Workspace activity
        </h2>
      </div>

      <div className="flex flex-1 flex-col items-start gap-5 px-5 py-5">
        <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
          Stay informed about changes across your workspace. See updates to
          boards, cards, sprints and team members in one place.
        </p>

        <Link
          href={`/dashboard/workspace/${workspaceId}/activity`}
          className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-active-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          View activity
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
