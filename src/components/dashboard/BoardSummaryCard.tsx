type BoardSummaryCardProps = {
  boardName: string;
  members: number;
  tasks: number;
  completed: number;
  dueDate: string;
};

export default function BoardSummaryCard({
  boardName,
  members,
  tasks,
  completed,
  dueDate,
}: BoardSummaryCardProps) {
  const completionPercentage =
    tasks > 0 ? Math.round((completed / tasks) * 100) : 0;

  return (
    <div className="group rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--indigo)]/40 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
            Board
          </p>

          <h3 className="mt-1 truncate text-lg font-semibold text-[var(--ink)]">
            {boardName}
          </h3>
        </div>

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)]/10 text-sm font-semibold text-[var(--indigo)]">
          {boardName.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--paper)] p-3">
          <p className="text-xs text-[var(--ink-soft)]">
            Members
          </p>

          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {members}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--paper)] p-3">
          <p className="text-xs text-[var(--ink-soft)]">
            Tasks
          </p>

          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {tasks}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--paper)] p-3">
          <p className="text-xs text-[var(--ink-soft)]">
            Completed
          </p>

          <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
            {completed}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--paper)] p-3">
          <p className="text-xs text-[var(--ink-soft)]">
            Due date
          </p>

          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
            {dueDate}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-[var(--ink-soft)]">
            Progress
          </span>

          <span className="text-xs font-medium text-[var(--ink)]">
            {completionPercentage}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
          <div
            className="h-full rounded-full bg-[var(--indigo)] transition-all"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}