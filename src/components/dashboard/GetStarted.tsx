const steps = [
  {
    id: 1,
    title: "Create your organization",
    completed: true,
  },
  {
    id: 2,
    title: "Invite your first member",
    completed: true,
  },
  {
    id: 3,
    title: "Create your first board",
    completed: false,
  },
  {
    id: 4,
    title: "Add your first task",
    completed: false,
  },
];

export default function DashboardGettingStarted() {
  const completedSteps = steps.filter(
    (step) => step.completed
  ).length;

  const progress = Math.round(
    (completedSteps / steps.length) * 100
  );

  return (
    <section className="mt-10">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-[var(--ink)]">
          Getting Started
        </h2>

        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Complete these steps to get the most out of Flowboard.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--mist)] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              Your progress
            </p>

            <p className="mt-1 text-xs text-[var(--ink-soft)]">
              {completedSteps} of {steps.length} completed
            </p>
          </div>

          <span className="text-sm font-medium text-[var(--ink)]">
            {progress}%
          </span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--mist)]">
          <div
            className="h-full rounded-full bg-[var(--board-line)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-6 space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${
                  step.completed
                    ? "border-[var(--board-line)] bg-[var(--board-line)] text-white"
                    : "border-[var(--mist)] text-[var(--ink-soft)]"
                }`}
              >
                {step.completed ? "✓" : step.id}
              </div>

              <p
                className={`text-sm ${
                  step.completed
                    ? "text-[var(--ink-soft)] line-through"
                    : "font-medium text-[var(--ink)]"
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}