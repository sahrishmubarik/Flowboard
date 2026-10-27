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
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-[var(--shadow-sm)]">
      <div className="flex flex-col items-center gap-8 px-5 py-8">
        {/* Icon */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-active-bg)] text-[var(--color-primary)]">
          <Activity size={22} />
        </div>

        {/* Heading and paragraph */}
        <div className="min-w-0 flex-1">
          <h2
            className="text-[17px] font-semibold tracking-tight text-[var(--color-text-primary)] text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Workspace activity
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)] text-center">
            Stay informed about changes across your workspace. See updates to
            boards, cards, sprints and team members in one place.
          </p>
        </div>

        {/* Button */}
        <Link
          href={`/dashboard/workspace/${workspaceId}/activity`}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-active-bg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          <span>View activity</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
