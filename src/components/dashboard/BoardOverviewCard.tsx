"use client";

const boards = [
  {
    id: "1",
    name: "Website Redesign",
    members: 8,
    tasks: 24,
    completed: 16,
    dueDate: "Sep 24, 2026",
  },
  {
    id: "2",
    name: "Mobile App",
    members: 6,
    tasks: 18,
    completed: 11,
    dueDate: "Sep 28, 2026",
  },
  {
    id: "3",
    name: "Marketing Campaign",
    members: 5,
    tasks: 15,
    completed: 9,
    dueDate: "Oct 02, 2026",
  },
  {
    id: "4",
    name: "Product Roadmap",
    members: 7,
    tasks: 21,
    completed: 14,
    dueDate: "Oct 08, 2026",
  },
];

export default function BoardSummaryCard() {
  return (
    <section className="rounded-2xl border border-[var(--mist)] bg-[var(--paper-raised)] p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--indigo)]">
            Organization overview
          </p>

          <h2 className="mt-1 text-xl font-semibold text-[var(--ink)]">
            Board Summary
          </h2>

          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Overview of your organization&apos;s active boards.
          </p>
        </div>

        <div className="rounded-xl bg-[var(--indigo)]/10 px-3 py-2">
          <span className="text-sm font-semibold text-[var(--indigo)]">
            {boards.length} Boards
          </span>
        </div>
      </div>

      {/* Boards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {boards.map((board) => {
          const progress = Math.round(
            (board.completed / board.tasks) * 100,
          );

          return (
            <div
              key={board.id}
              className="rounded-xl border border-[var(--mist)] bg-[var(--paper)] p-5 transition hover:border-[var(--indigo)] hover:shadow-sm"
            >
              {/* Board name */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--indigo)]/10 text-sm font-semibold text-[var(--indigo)]">
                  {board.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">
                    {board.name}
                  </h3>

                  <p className="text-xs text-[var(--ink-soft)]">
                    Board overview
                  </p>
                </div>
              </div>

              {/* Board stats */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                
                <div className="rounded-lg bg-[var(--paper-raised)] p-3">
                  <p className="text-xs text-[var(--ink-soft)]">
                    Members
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {board.members}
                  </p>
                </div>

                <div className="rounded-lg bg-[var(--paper-raised)] p-3">
                  <p className="text-xs text-[var(--ink-soft)]">
                    Tasks
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[var(--ink)]">
                    {board.tasks}
                  </p>
                </div>

                <div className="rounded-lg bg-[var(--paper-raised)] p-3">
                  <p className="text-xs text-[var(--ink-soft)]">
                    Due
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                    {board.dueDate}
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[var(--ink-soft)]">
                    Task progress
                  </p>

                  <p className="text-xs font-semibold text-[var(--ink)]">
                    {board.completed}/{board.tasks}
                  </p>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
                  <div
                    className="h-full rounded-full bg-[var(--indigo)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-[var(--ink-soft)]">
                  {progress}% completed
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}